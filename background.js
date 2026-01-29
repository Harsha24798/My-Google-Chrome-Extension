// Background Service Worker for Smart Auto Refresh Extension

// Badge update interval
let badgeUpdateInterval = null;

// Update badge with countdown
function updateBadge() {
  chrome.storage.local.get(['isRunning', 'isPaused', 'nextRefreshTime'], (data) => {
    if (data.isRunning && !data.isPaused && data.nextRefreshTime) {
      const remaining = Math.max(0, data.nextRefreshTime - Date.now());
      const seconds = Math.ceil(remaining / 1000);

      let badgeText = '';
      let badgeColor = '#10b981'; // Green

      if (seconds >= 3600) {
        // Hours
        const hours = Math.floor(seconds / 3600);
        badgeText = hours + 'h';
        badgeColor = '#3b82f6'; // Blue
      } else if (seconds >= 60) {
        // Minutes
        const minutes = Math.floor(seconds / 60);
        badgeText = minutes + 'm';
        badgeColor = '#10b981'; // Green
      } else if (seconds > 0) {
        // Seconds
        badgeText = seconds + 's';
        if (seconds <= 10) {
          badgeColor = '#ef4444'; // Red for last 10 seconds
        } else {
          badgeColor = '#f59e0b'; // Orange
        }
      } else {
        badgeText = '0s';
      }

      chrome.action.setBadgeText({ text: badgeText });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    } else if (data.isPaused) {
      chrome.action.setBadgeText({ text: '⏸' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Start badge updates
function startBadgeUpdates() {
  if (badgeUpdateInterval) {
    clearInterval(badgeUpdateInterval);
  }
  updateBadge(); // Update immediately
  badgeUpdateInterval = setInterval(updateBadge, 1000); // Update every second
}

// Stop badge updates
function stopBadgeUpdates() {
  if (badgeUpdateInterval) {
    clearInterval(badgeUpdateInterval);
    badgeUpdateInterval = null;
  }
  chrome.action.setBadgeText({ text: '' });
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoRefreshAlarm') {
    // Get tab mode preference
    chrome.storage.local.get(['tabMode'], (data) => {
      const tabMode = data.tabMode || 'current';

      if (tabMode === 'all') {
        // Refresh all tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (
              tab.id &&
              !tab.url.startsWith('chrome://') &&
              !tab.url.startsWith('chrome-extension://')
            ) {
              chrome.tabs.reload(tab.id);
            }
          });
          handlePostRefresh();
        });
      } else {
        // Refresh only current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
            handlePostRefresh();
          }
        });
      }
    });
  }
});

// Handle post-refresh logic (random recalculation, etc.)
function handlePostRefresh() {
  // Check if random mode is enabled and recalculate interval
  chrome.storage.local.get(
    ['refreshMode', 'minInterval', 'maxInterval', 'currentInterval'],
    (data) => {
      if (data.refreshMode === 'random' && data.minInterval && data.maxInterval) {
        // Calculate new random interval
        const min = parseFloat(data.minInterval);
        const max = parseFloat(data.maxInterval);
        const randomSeconds = Math.random() * (max - min) + min;

        // Create new alarm with random interval
        chrome.alarms.create('autoRefreshAlarm', {
          delayInMinutes: randomSeconds / 60,
        });

        // Store the new interval and next refresh time
        const nextRefreshTime = Date.now() + randomSeconds * 1000;
        chrome.storage.local.set({
          currentInterval: randomSeconds,
          nextRefreshTime: nextRefreshTime,
        });
      } else {
        // For fixed/custom mode, recreate alarm with same interval
        if (data.currentInterval) {
          // Recreate the alarm for the next refresh
          chrome.alarms.create('autoRefreshAlarm', {
            delayInMinutes: data.currentInterval / 60,
          });

          // Update next refresh time
          const nextRefreshTime = Date.now() + data.currentInterval * 1000;
          chrome.storage.local.set({ nextRefreshTime: nextRefreshTime });
        }
      }
    }
  );
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAlarmInfo') {
    chrome.alarms.get('autoRefreshAlarm', (alarm) => {
      sendResponse({ alarm: alarm });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'startBadgeUpdates') {
    startBadgeUpdates();
    sendResponse({ success: true });
  } else if (request.action === 'stopBadgeUpdates') {
    stopBadgeUpdates();
    sendResponse({ success: true });
  }
});

// Clear alarm when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll();
  chrome.storage.local.set({ isRunning: false });
  stopBadgeUpdates();
});

// Start badge updates on service worker startup if timer is running
chrome.storage.local.get(['isRunning', 'isPaused'], (data) => {
  if (data.isRunning && !data.isPaused) {
    startBadgeUpdates();
  } else if (data.isPaused) {
    chrome.action.setBadgeText({ text: '⏸' });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  }
});
