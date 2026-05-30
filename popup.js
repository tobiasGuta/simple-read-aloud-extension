document.addEventListener('DOMContentLoaded', () => {
  const voiceSelect = document.getElementById('voice-select');
  const rateRange = document.getElementById('rate-range');
  const volumeRange = document.getElementById('volume-range');
  const rateValue = document.getElementById('rate-value');
  const volumeValue = document.getElementById('volume-value');
  const autoReadCheck = document.getElementById('auto-read-check');
  const autoPauseCheck = document.getElementById('auto-pause-check');
  
  const btnTest = document.getElementById('btn-test');
  const btnRead = document.getElementById('btn-read');
  const btnStop = document.getElementById('btn-stop');

  function updateDisplays() {
    rateValue.textContent = Number(rateRange.value).toFixed(1) + 'x';
    volumeValue.textContent = Math.round(Number(volumeRange.value) * 100) + '%';
  }

  rateRange.addEventListener('input', updateDisplays);
  volumeRange.addEventListener('input', updateDisplays);

  // Load Voices
  function loadVoices() {
    chrome.tts.getVoices((voices) => {
      voiceSelect.innerHTML = '';
      
      voices.sort((a, b) => {
        const aNat = a.voiceName && a.voiceName.includes('Natural');
        const bNat = b.voiceName && b.voiceName.includes('Natural');
        if (aNat && !bNat) return -1;
        if (!aNat && bNat) return 1;
        return (a.voiceName || '').localeCompare(b.voiceName || '');
      });

      voices.forEach(voice => {
        if (!voice.voiceName) return;
        const option = document.createElement('option');
        option.value = voice.voiceName;
        option.textContent = `${voice.voiceName} (${voice.lang || 'unknown'})`;
        voiceSelect.appendChild(option);
      });

      chrome.storage.local.get(['voiceName', 'rate', 'volume', 'autoRead', 'autoPause'], (result) => {
        if (result.voiceName) {
          const voiceExists = voices.some(v => v.voiceName === result.voiceName);
          if (voiceExists) {
            voiceSelect.value = result.voiceName;
          }
        }
        
        if (!voiceSelect.value && voices.length > 0) {
            const defaultVoice = voices.find(v => v.voiceName && v.voiceName.includes('Natural') && v.lang && v.lang.startsWith('en')) || voices[0];
            if (defaultVoice) {
                voiceSelect.value = defaultVoice.voiceName;
            }
        }

        if (result.rate) {
          rateRange.value = result.rate;
        }
        if (result.volume) {
          volumeRange.value = result.volume;
        }
        if (result.autoRead) {
          autoReadCheck.checked = result.autoRead;
        }
        if (result.autoPause !== undefined) {
          autoPauseCheck.checked = result.autoPause;
        } else {
          autoPauseCheck.checked = true; // Default to true
        }
        updateDisplays();
      });
    });
  }

  loadVoices();

  function saveSettings() {
    chrome.storage.local.set({
      voiceName: voiceSelect.value,
      rate: rateRange.value,
      volume: volumeRange.value,
      autoRead: autoReadCheck.checked,
      autoPause: autoPauseCheck.checked
    });
  }

  voiceSelect.addEventListener('change', saveSettings);
  rateRange.addEventListener('change', saveSettings);
  volumeRange.addEventListener('change', saveSettings);
  autoReadCheck.addEventListener('change', saveSettings);
  autoPauseCheck.addEventListener('change', saveSettings);

  btnTest.addEventListener('click', () => {
    // Send a message to background.js to test voice
    chrome.runtime.sendMessage({ 
        command: 'test-voice',
        settings: {
            voiceName: voiceSelect.value,
            rate: rateRange.value,
            volume: volumeRange.value
        }
    });
  });

  btnRead.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'request-read-active-tab' });
    window.close();
  });

  btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'stop' });
  });
});
