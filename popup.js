// DOM Elements
const modeRadios = document.querySelectorAll('input[name="mode"]');
const tabModeRadios = document.querySelectorAll('input[name="tabMode"]');
const fixedSection = document.getElementById('fixedSection');
const customSection = document.getElementById('customSection');
const randomSection = document.getElementById('randomSection');

const secondsInput = document.getElementById('seconds');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const customSecondsInput = document.getElementById('customSeconds');
const minSecondsInput = document.getElementById('minSeconds');
const maxSecondsInput = document.getElementById('maxSeconds');

const countdownDisplay = document.getElementById('countdown');
const statusText = document.getElementById('statusText');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const refreshBtn = document.getElementById('refreshBtn');

// State Variables
let countdownInterval = null;
let isRunning = false;
let isPaused = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Load saved settings from Chrome storage
function loadSettings() {
  chrome.storage.local.get(
    [
      'refreshMode',
      'tabMode',
      'isRunning',
      'isPaused',
      'fixedInterval',
      'customHours',
      'customMinutes',
      'customSeconds',
      'minInterval',
      'maxInterval',
      'nextRefreshTime',
      'currentInterval',
    ],
    (data) => {
      // Set mode
      if (data.refreshMode) {
        const modeRadio = document.querySelector(`input[value="${data.refreshMode}"]`);
        if (modeRadio) {
          modeRadio.checked = true;
          showSection(data.refreshMode);
        }
      }

      // Set tab mode
      if (data.tabMode) {
        const tabModeRadio = document.querySelector(
          `input[name="tabMode"][value="${data.tabMode}"]`
        );
        if (tabModeRadio) {
          tabModeRadio.checked = true;
        }
      }

      // Set values
      if (data.fixedInterval) secondsInput.value = data.fixedInterval;
      if (data.customHours !== undefined) hoursInput.value = data.customHours;
      if (data.customMinutes !== undefined) minutesInput.value = data.customMinutes;
      if (data.customSeconds !== undefined) customSecondsInput.value = data.customSeconds;
      if (data.minInterval) minSecondsInput.value = data.minInterval;
      if (data.maxInterval) maxSecondsInput.value = data.maxInterval;

      // Set running state
      isRunning = data.isRunning || false;
      isPaused = data.isPaused || false;

      if (isRunning) {
        if (isPaused) {
          showPausedState();
        } else {
          showRunningState();
          startCountdown(data.nextRefreshTime);
        }
      } else {
        showStoppedState();
      }
    }
  );
}

// Tab mode selection
tabModeRadios.forEach((radio) => {
  radio.addEventListener('change', saveSettings);
});
// Setup event listeners
function setupEventListeners() {
  // Mode selection
  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      showSection(e.target.value);
      saveSettings();
    });
  });

  // Input changes
  secondsInput.addEventListener('change', saveSettings);
  hoursInput.addEventListener('change', saveSettings);
  minutesInput.addEventListener('change', saveSettings);
  customSecondsInput.addEventListener('change', saveSettings);
  minSecondsInput.addEventListener('change', saveSettings);
  maxSecondsInput.addEventListener('change', saveSettings);

  // Buttons
  startBtn.addEventListener('click', handleStart);
  pauseBtn.addEventListener('click', handlePause);
  stopBtn.addEventListener('click', handleStop);
  refreshBtn.addEventListener('click', handleRefreshNow);
}

// Show appropriate section based on mode
function showSection(mode) {
  fixedSection.classList.add('hidden');
  customSection.classList.add('hidden');
  randomSection.classList.add('hidden');

  if (mode === 'fixed') {
    fixedSection.classList.remove('hidden');
  } else if (mode === 'custom') {
    customSection.classList.remove('hidden');
  } else if (mode === 'random') {
    randomSection.classList.remove('hidden');
  }
}

// Save settings to Chrome storage
function saveSettings() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const tabMode = document.querySelector('input[name="tabMode"]:checked').value;

  chrome.storage.local.set({
    refreshMode: mode,
    tabMode: tabMode,
    fixedInterval: parseInt(secondsInput.value) || 30,
    customHours: parseInt(hoursInput.value) || 0,
    customMinutes: parseInt(minutesInput.value) || 0,
    customSeconds: parseInt(customSecondsInput.value) || 30,
    minInterval: parseInt(minSecondsInput.value) || 30,
    maxInterval: parseInt(maxSecondsInput.value) || 60,
  });
}

// Calculate interval in seconds based on current mode
function calculateInterval() {
  const mode = document.querySelector('input[name="mode"]:checked').value;

  if (mode === 'fixed') {
    return parseInt(secondsInput.value) || 30;
  } else if (mode === 'custom') {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(customSecondsInput.value) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (mode === 'random') {
    const min = parseInt(minSecondsInput.value) || 30;
    const max = parseInt(maxSecondsInput.value) || 60;
    return Math.random() * (max - min) + min;
  }

  return 30; // Default fallback
}

// Handle Start button
function handleStart() {
  const interval = calculateInterval();

  // Chrome alarm API requires minimum 30 seconds (0.5 minutes)
  if (interval < 30) {
    alert(
      '⚠ Chrome Extension Limitation\n\nMinimum interval: 30 seconds\n\nPlease increase your interval to at least 30 seconds.'
    );
    return;
  }

  const mode = document.querySelector('input[name="mode"]:checked').value;

  // Validate random mode
  if (mode === 'random') {
    const min = parseInt(minSecondsInput.value) || 30;
    const max = parseInt(maxSecondsInput.value) || 60;
    if (min >= max) {
      alert('Maximum interval must be greater than minimum interval');
      return;
    }
    if (min < 30) {
      alert(
        '⚠ Chrome Extension Limitation\n\nMinimum interval: 30 seconds\n\nPlease set minimum to at least 30 seconds.'
      );
      return;
    }
  }

  // Create alarm
  chrome.alarms.create('autoRefreshAlarm', {
    delayInMinutes: interval / 60,
  });

  // Save state
  const nextRefreshTime = Date.now() + interval * 1000;
  chrome.storage.local.set({
    isRunning: true,
    isPaused: false,
    currentInterval: interval,
    nextRefreshTime: nextRefreshTime,
    refreshMode: mode,
  });

  isRunning = true;
  isPaused = false;
  showRunningState();
  startCountdown(nextRefreshTime);

  // Tell background to start badge updates
  chrome.runtime.sendMessage({ action: 'startBadgeUpdates' });
}

// Handle Pause button
function handlePause() {
  chrome.alarms.clear('autoRefreshAlarm');

  chrome.storage.local.set({
    isPaused: true,
    isRunning: true,
  });

  isPaused = true;
  showPausedState();

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Tell background to stop badge updates and show pause icon
  chrome.runtime.sendMessage({ action: 'stopBadgeUpdates' });
}

// Handle Stop button
function handleStop() {
  chrome.alarms.clear('autoRefreshAlarm');

  chrome.storage.local.set({
    isRunning: false,
    isPaused: false,
    nextRefreshTime: null,
  });

  isRunning = false;
  isPaused = false;
  showStoppedState();

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;

    // Tell background to stop badge updates
    chrome.runtime.sendMessage({ action: 'stopBadgeUpdates' });
  }

  countdownDisplay.textContent = '--:--:--';
}

// Handle Refresh Now button
function handleRefreshNow() {
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
      });
    } else {
      // Refresh current tab only
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    }
  });
}

// Start countdown timer
function startCountdown(targetTime) {
  // Clear any existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Update countdown every second
  countdownInterval = setInterval(() => {
    chrome.storage.local.get(['nextRefreshTime', 'currentInterval'], (data) => {
      const now = Date.now();

      if (data.nextRefreshTime) {
        const remaining = Math.max(0, data.nextRefreshTime - now);
        updateCountdownDisplay(remaining);
      } else if (data.currentInterval) {
        // Fallback
        updateCountdownDisplay(0);
      }
    });
  }, 100); // Update more frequently for smooth countdown
}

// Update countdown display
function updateCountdownDisplay(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  countdownDisplay.textContent = `${hoursStr}:${minutesStr}:${secondsStr}`;
}

// UI State Management
function showRunningState() {
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  stopBtn.disabled = false;
  statusText.textContent = 'Running';
  statusText.style.color = '#10b981';
}

function showPausedState() {
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  stopBtn.disabled = false;
  statusText.textContent = 'Paused';
  statusText.style.color = '#f59e0b';
  countdownDisplay.textContent = '--:--:--';
}

function showStoppedState() {
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  stopBtn.disabled = true;
  statusText.textContent = 'Stopped';
  statusText.style.color = '#ef4444';
}
