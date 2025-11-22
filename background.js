// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selection",
    title: "Read Aloud Selection",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-selection" && tab.id) {
    
    // Skip restricted pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
      return;
    }

    // Get saved settings
    chrome.storage.local.get(['voiceName', 'rate', 'volume'], (settings) => {
      // Inject script if needed, then send message
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }).then(() => {
        chrome.tabs.sendMessage(tab.id, {
          command: 'play',
          settings: {
            voiceName: settings.voiceName,
            rate: parseFloat(settings.rate) || 1.0,
            volume: parseFloat(settings.volume) || 1.0
          },
          text: info.selectionText
        });
      }).catch((err) => {
        // Script might already be there, try sending message directly
        chrome.tabs.sendMessage(tab.id, {
          command: 'play',
          settings: {
            voiceName: settings.voiceName,
            rate: parseFloat(settings.rate) || 1.0,
            volume: parseFloat(settings.volume) || 1.0
          },
          text: info.selectionText
        }).catch(e => console.log(e));
      });
    });
  }
});