let popupWindowId = null;

// Listen for the extension icon click
chrome.action.onClicked.addListener(() => {
  // Check if a popup window is already open
  if (popupWindowId === null) {
    // Open the popup window when the extension icon is clicked the first time
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 600,
      height: 400,
    }, (window) => {
      popupWindowId = window.id; // Save the window ID

      // Listen for when the popup window is closed
      chrome.windows.onRemoved.addListener(function (windowId) {
        if (windowId === popupWindowId) {
          popupWindowId = null; // Reset the window ID when it's closed
          stopRecording(); // Stop recording
        }
      });
    });
  } else {
    // If the popup is already open, focus on it instead of opening a new one
    chrome.windows.update(popupWindowId, { focused: true });
  }
});

function stopRecording() {
  chrome.storage.local.set({ isRecording: false }); // Set the recording state to false
  console.log('Recording stopped');
}

// Listen for messages or actions from content scripts and log them
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getActions') {
    chrome.storage.local.get(['actions'], (data) => {
      sendResponse(data.actions || []); 
    });
    return true;
  }
});

// CONTEXT MENUS

// Listen for changes in the recording state
chrome.storage.local.get(['isRecording'], function(result) {
  const isRecording = result.isRecording || false;

  // Create the context menu only if recording is active
  if (isRecording) {
    chrome.contextMenus.create({
      id: 'testActionMenu',
      title: 'Test Action Recorder',
      contexts: ['all'], 
    });

    chrome.contextMenus.create({
      id: 'Verify Element Exists',
      title: 'Verify Element Exists',
      parentId: 'testActionMenu',
      contexts: ['all'],
    });

    chrome.contextMenus.create({
      id: 'Verify Element Text',
      title: 'Verify Element Text',
      parentId: 'testActionMenu',
      contexts: ['all'],
    });
  }
});

// Update context menus when recording starts/stops
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.isRecording) {
    console.log("recording button clicked");
    const isRecording = changes.isRecording.newValue;

    // If recording state changes, update context menus accordingly
    // Create the context menu if recording starts
    if (isRecording) {
      chrome.contextMenus.create({
        id: 'testActionMenu',
        title: 'Test Action Recorder',
        contexts: ['all'],
      });

      chrome.contextMenus.create({
        id: 'Verify Element Exists',
        title: 'Verify Element Exists',
        parentId: 'testActionMenu',
        contexts: ['all'],
      });

      chrome.contextMenus.create({
        id: 'Verify Element Text',
        title: 'Verify Element Text',
        parentId: 'testActionMenu',
        contexts: ['all'],
      });
    } else {
      // Remove the context menu if recording stops
      chrome.contextMenus.removeAll();
    }
  }
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Send a message to the content script to handle the right-clicked element
  if (info.menuItemId === 'Verify Element Exists') {
    chrome.tabs.sendMessage(tab.id, {
      message: "Verify Element Exists"
    });
  } 
  else if (info.menuItemId === 'Verify Element Text') {
    chrome.tabs.sendMessage(tab.id, {
      message: "Verify Element Text"
    });
  }
});
