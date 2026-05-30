let allChunks = [];
let currentIndex = 0;
let currentVoiceOptions = {};
let activeTabId = null;

function loadSettings(callback) {
  chrome.storage.local.get(['voiceName', 'rate', 'volume'], (settings) => {
    currentVoiceOptions = {
      rate: parseFloat(settings.rate) || 1.0,
      volume: parseFloat(settings.volume) || 1.0
    };
    if (settings.voiceName) {
      currentVoiceOptions.voiceName = settings.voiceName;
    }
    callback();
  });
}

function stopReading() {
  chrome.tts.stop();
  allChunks = [];
  if (activeTabId !== null) {
    chrome.tabs.sendMessage(activeTabId, { command: 'stop-highlight' }).catch(() => {});
    activeTabId = null;
  }
}

function playChunk(index) {
  if (index < 0 || index >= allChunks.length) {
    stopReading();
    return;
  }

  currentIndex = index;
  const chunk = allChunks[currentIndex];
  
  if (activeTabId !== null && chunk.index !== undefined) {
    chrome.tabs.sendMessage(activeTabId, { command: 'highlight', index: chunk.index }).catch(() => {});
  }

  chrome.tts.stop(); // Stop anything currently playing

  chrome.tts.speak(chunk.text, {
    ...currentVoiceOptions,
    onEvent: function(event) {
      if (event.type === 'word') {
        if (activeTabId !== null) {
          chrome.tabs.sendMessage(activeTabId, {
            command: 'highlight-word',
            charIndex: event.charIndex,
            length: event.length
          }).catch(() => {});
        }
      } else if (event.type === 'end') {
        playChunk(currentIndex + 1);
      }
      // Note: We ignore 'interrupted' or 'cancelled' because they fire when we skip manually.
    }
  });
}

function startReadingChunks(chunks, tabId) {
  stopReading();
  activeTabId = tabId;
  allChunks = chunks;
  loadSettings(() => {
    playChunk(0);
  });
}

// Handle context menu clicks
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selection",
    title: "Read Aloud Selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-selection" && tab.id) {
    startReadingChunks([{ text: info.selectionText }], tab.id);
  }
});



// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "stop-reading") {
    stopReading();
  } else if (command === "next-paragraph") {
    if (allChunks.length > 0) {
      playChunk(currentIndex + 1);
    }
  } else if (command === "prev-paragraph") {
    if (allChunks.length > 0) {
      playChunk(currentIndex - 1);
    }
  }
});

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'play-chunks') {
    startReadingChunks(request.chunks, sender.tab ? sender.tab.id : request.tabId);
  } else if (request.command === 'stop') {
    stopReading();
  } else if (request.command === 'test-voice') {
    chrome.tts.stop();
    chrome.tts.speak("This is a test of your selected voice.", {
      voiceName: request.settings.voiceName,
      rate: parseFloat(request.settings.rate) || 1.0,
      volume: parseFloat(request.settings.volume) || 1.0
    });
  } else if (request.command === 'request-read-active-tab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { command: 'request-page-read' }).catch(() => {});
      }
    });
  }
});
