# Smart Auto Refresh – Chrome Extension

A professional Google Chrome extension that automatically refreshes browser tabs using fixed, custom, or random time intervals with a live countdown timer.

## Features

- **Fixed Interval Mode**: Set refresh interval in seconds (1-3600s)
- **Custom Time Mode**: Set precise refresh time (HH:MM:SS format)
- **Random Interval Mode**: Refresh at random intervals within a min-max range
- **Live Countdown Timer**: Visual countdown showing time until next refresh
- **Start/Pause/Stop Controls**: Full control over the refresh cycle
- **Refresh Now**: Manual refresh button for immediate page reload
- **Persistent Settings**: Automatically saves your preferences
- **Background Execution**: Works even when popup is closed (Chrome Alarms API)

## Installation

### Developer Mode (for testing)

1. Download or clone this repository
2. Open Google Chrome and navigate to `chrome://extensions`
3. Enable **Developer Mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `Chrome Extension` folder
6. The extension icon will appear in your toolbar

### Chrome Web Store (coming soon)

The extension will be published to the Chrome Web Store after further testing.

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select your preferred refresh mode:
   - **Fixed Interval**: Enter seconds (e.g., 30 for 30 seconds)
   - **Custom Time**: Enter hours, minutes, and seconds
   - **Random**: Set minimum and maximum interval range
3. Click **▶ Start** to begin auto-refresh
4. Click **⏸ Pause** to temporarily stop (resume with Start)
5. Click **⏹ Stop** to completely stop and reset
6. Click **🔄 Refresh Now** to manually refresh the current tab

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `tabs`, `alarms`, `storage`
- **Background Worker**: Service worker for reliable background execution
- **Storage**: Chrome Storage API for persistent settings

## File Structure

```
Chrome Extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── popup.html            # Popup UI structure
├── popup.css             # Popup styling
├── popup.js              # UI logic and countdown
├── README.md             # This file
└── icons/                # Extension icons (to be added)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Adding Icons

To complete the extension, add icon files to the `icons/` folder:

- `icon16.png` - 16x16px (toolbar)
- `icon48.png` - 48x48px (extensions page)
- `icon128.png` - 128x128px (Chrome Web Store)

You can create simple icons using online tools like:

- [Favicon.io](https://favicon.io)
- [Canva](https://canva.com)
- Or design custom icons in Photoshop/Figma

## Browser Compatibility

- Google Chrome (version 88+)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Other Chromium-based browsers supporting Manifest V3

## Future Improvements

- [ ] Multiple tab profile support
- [ ] Per-website refresh rules
- [ ] Dark mode UI theme
- [ ] Pause on inactive tab option
- [ ] Sound notification on refresh
- [ ] Export/import settings
- [ ] Chrome Web Store publication

## License

This project is open source and available for personal and educational use.

## Author

Created for learning Chrome extension development with Manifest V3.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
