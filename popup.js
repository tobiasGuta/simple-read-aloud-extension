document.addEventListener('DOMContentLoaded', () => {
  const voiceSelect = document.getElementById('voice-select');
  const rateRange = document.getElementById('rate-range');
  const volumeRange = document.getElementById('volume-range');
  const rateValue = document.getElementById('rate-value');
  const volumeValue = document.getElementById('volume-value');
  const autoReadCheck = document.getElementById('auto-read-check');
  const btnRead = document.getElementById('btn-read');
  const btnStop = document.getElementById('btn-stop');

  // Update value displays
  rateRange.addEventListener('input', () => rateValue.textContent = rateRange.value);
  volumeRange.addEventListener('input', () => volumeValue.textContent = volumeRange.value);

  // Load Voices
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    // Sort voices to put "Natural" ones at the top
    voices.sort((a, b) => {
      const aNat = a.name.includes('Natural');
      const bNat = b.name.includes('Natural');
      if (aNat && !bNat) return -1;
      if (!aNat && bNat) return 1;
      return a.name.localeCompare(b.name);
    });

    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    // Load saved settings after voices are populated
    chrome.storage.local.get(['voiceName', 'rate', 'volume', 'autoRead'], (result) => {
      if (result.voiceName) {
        // Check if the saved voice actually exists in the current list
        const voiceExists = voices.some(v => v.name === result.voiceName);
        if (voiceExists) {
          voiceSelect.value = result.voiceName;
        }
      }
      
      // If no saved voice or saved voice not found, try to select a default Natural voice
      if (!voiceSelect.value) {
          const defaultVoice = voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) || voices[0];
          if (defaultVoice) {
              voiceSelect.value = defaultVoice.name;
          }
      }

      if (result.rate) {
        rateRange.value = result.rate;
        rateValue.textContent = result.rate;
      }
      if (result.volume) {
        volumeRange.value = result.volume;
        volumeValue.textContent = result.volume;
      }
      if (result.autoRead) {
        autoReadCheck.checked = result.autoRead;
      }
    });
  }

  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Save settings when changed
  function saveSettings() {
    chrome.storage.local.set({
      voiceName: voiceSelect.value,
      rate: rateRange.value,
      volume: volumeRange.value,
      autoRead: autoReadCheck.checked
    });
  }

  voiceSelect.addEventListener('change', saveSettings);
  rateRange.addEventListener('change', saveSettings);
  volumeRange.addEventListener('change', saveSettings);
  autoReadCheck.addEventListener('change', saveSettings);

  // Helper to inject script and send message
  async function sendMessageToContentScript(message) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) return;

    // Skip restricted pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
        console.warn("Cannot run on this page.");
        return;
    }

    try {
      // Try sending a message first
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (error) {
      // If it fails, the script might not be there. Inject it.
      console.log("Script not found, injecting...");
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Retry sending the message
      setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, message);
      }, 100);
    }
  }

  btnRead.addEventListener('click', () => {
    const settings = {
      voiceName: voiceSelect.value,
      rate: parseFloat(rateRange.value),
      volume: parseFloat(volumeRange.value)
    };
    sendMessageToContentScript({ command: 'play', settings });
    window.close(); // Close popup to let user read
  });

  btnStop.addEventListener('click', () => {
    sendMessageToContentScript({ command: 'stop' });
  });
});