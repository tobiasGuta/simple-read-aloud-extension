(function() {
  if (window.hasReadAloudListener) return;
  window.hasReadAloudListener = true;

  function speak(settings, textOverride) {
    // Cancel any speech already playing
    window.speechSynthesis.cancel();

    // Get the text to read: override > selection > full page
    let textToRead = textOverride;
    
    if (!textToRead) {
        textToRead = window.getSelection().toString().trim();
    }

    // If no text is selected, get the entire page's innerText
    if (!textToRead) {
      textToRead = document.body.innerText;
    }

    if (!textToRead) {
      console.log("Read Aloud: No text found to read.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = settings.rate || 1;
    utterance.pitch = 1;
    utterance.volume = settings.volume || 1;

    // Find the voice
    if (settings.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === settings.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => console.log("Read Aloud: Started reading.");
    utterance.onend = () => console.log("Read Aloud: Finished reading.");
    utterance.onerror = (e) => console.error("Read Aloud: Error.", e);

    window.speechSynthesis.speak(utterance);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'play') {
      speak(request.settings, request.text);
    } else if (request.command === 'stop') {
      window.speechSynthesis.cancel();
    }
  });

  // Auto-read functionality
  let autoReadEnabled = false;

  // Initialize auto-read setting
  chrome.storage.local.get(['autoRead'], (result) => {
    autoReadEnabled = result.autoRead || false;
  });

  // Listen for setting changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.autoRead) {
      autoReadEnabled = changes.autoRead.newValue;
    }
  });

  // Detect selection and read
  document.addEventListener('mouseup', () => {
    if (!autoReadEnabled) return;

    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      
      if (selectedText.length > 0) {
        // Fetch current voice settings to use
        chrome.storage.local.get(['voiceName', 'rate', 'volume'], (settings) => {
          speak({
            voiceName: settings.voiceName,
            rate: parseFloat(settings.rate) || 1,
            volume: parseFloat(settings.volume) || 1
          }, selectedText);
        });
      }
    }, 150);
  });
})();