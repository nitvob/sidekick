// Background service worker for Sidekick
// This handles extension lifecycle events and background operations

chrome.runtime.onInstalled.addListener((details) => {
  console.log("Sidekick Extension installed");

  // Set up default settings on first install
  if (details.reason === "install") {
    chrome.storage.sync.set({
      openai_api_key: "",
      custom_system_prompts: {},
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("Sidekick Extension started");
});

// Handle popup open/close events
chrome.action.onClicked.addListener((tab) => {
  // This will be handled by the popup itself
  console.log("Extension icon clicked");
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "clearStorage") {
    // Clear temporary storage when popup closes
    chrome.storage.local.clear(() => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }

  if (request.action === "getSettings") {
    // Get settings for popup
    chrome.storage.sync.get(
      ["openai_api_key", "custom_system_prompts"],
      (result) => {
        sendResponse(result);
      }
    );
    return true;
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("Extension update available");
  chrome.runtime.reload();
});

// Clean up on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  console.log("Extension suspending");
  // Clear any temporary data
  chrome.storage.local.clear();
});
