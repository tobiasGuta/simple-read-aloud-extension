# Simple Read Aloud Extension

A premium, highly-polished Chrome extension that transforms any webpage into an immersive audiobook experience using your browser's high-quality native text-to-speech engine.

## Features

- **Immersive Focus Mode**: When reading starts, the page background dims with a sleek blur effect, keeping the active paragraph clearly visible so you can focus entirely on the content.
- **Word-Level Highlighting**: The exact word currently being spoken is highlighted in vibrant orange in real-time, making it incredibly easy to follow along.
- **Auto-Read on Select**: Simply highlight any text on the page, and the extension will automatically begin reading it to you.
- **Premium Settings Popup**: A beautifully designed, glassmorphic dark-mode settings menu to configure your reading experience.
- **Auto-Pause on Tab Switch**: By default, the extension intelligently pauses reading if you switch to another tab or minimize the window, and automatically resumes when you return to the article. You can toggle this off in the settings if you prefer background listening.
- **Test Voice**: Instantly preview your voice, speed, and volume settings directly from the popup menu without needing to read a full page.
- **Keyboard Navigation**: Skip around the article or control playback using built-in keyboard shortcuts.

## Keyboard Shortcuts

- **Start Reading**: `Ctrl+Shift+L` (Mac: `Command+Shift+L`) - Reads the entire page or your current text selection.
- **Stop Reading**: `Ctrl+Shift+S` (Mac: `Command+Shift+S`)
- **Skip Forward**: `Ctrl+Shift+Right` (Mac: `Command+Shift+Right`) - Skip to the next paragraph.
- **Skip Backward**: `Ctrl+Shift+Left` (Mac: `Command+Shift+Left`) - Skip to the previous paragraph.

*Note: You can customize these shortcuts at any time by navigating to `chrome://extensions/shortcuts` in your browser.*

## Installation

Since this extension is loaded locally for development:

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select the `simple-read-aloud-extension` folder.
5. The extension is now installed! Pin it to your toolbar for easy access to the settings menu.

## Usage

1. **Read a whole page**: Click the extension icon to open the popup and click "Read Page", or press `Ctrl+Shift+L`.
2. **Read specific text**: Highlight any text on the page. If "Auto-read on select" is enabled in your settings, it will start immediately. Otherwise, right-click the text and choose "Read Aloud Selection".
3. **Change Settings**: Click the extension icon to open the premium popup. Here you can change the voice, adjust reading speed, change the volume, and test your configuration.

## Architecture & Permissions

- **`manifest.json`**: Manifest V3 compliant.
- **`tts`**: Required to access the high-quality Chrome Web Speech API voices.
- **`activeTab` & `scripting`**: Required to inject the highlighting and text-extraction scripts into the page you want to read.
- **`storage`**: Used to save your voice and speed preferences locally.
