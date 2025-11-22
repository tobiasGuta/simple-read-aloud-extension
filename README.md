# Simple Read Aloud Extension (Dracula Theme)

A lightweight, privacy-focused Microsoft Edge extension that reads text aloud using the Web Speech API. It features a beautiful Dracula-themed UI, customizable voice settings, and productivity features like auto-read on selection.

## Features

*   **Text-to-Speech**: Reads selected text or the entire page if nothing is selected.
*   **Customizable Settings**:
    *   **Voice Selection**: Choose from all available browser voices (prioritizes "Natural" voices).
    *   **Speed Control**: Adjust reading speed from 0.5x to 2.0x.
    *   **Volume Control**: Adjust the reading volume.
*   **Auto-Read on Select**: Optional feature to automatically read text as soon as you highlight it.
*   **Context Menu**: Right-click any selected text and choose "Read Aloud Selection".
*   **Dracula Theme**: A dark, eye-friendly interface using the popular Dracula color palette.
*   **Privacy Focused**: Runs entirely client-side. No text is sent to external servers.

## How to Load the Extension in Microsoft Edge

1.  Open Microsoft Edge.
2.  Navigate to `edge://extensions`.
3.  Turn on the **"Developer mode"** toggle switch in the bottom left of the sidebar (or top right depending on your version).
4.  Click the **"Load unpacked"** button that appears at the top.
5.  Select the `read-aloud-extension` folder.
6.  The extension should now appear in your list of extensions and in the toolbar.

## How to Use

### Using the Popup
1.  Click the **Read Aloud** icon in the browser toolbar.
2.  Adjust your **Voice**, **Speed**, and **Volume** settings. These are saved automatically.
3.  Click **Read Page** to start reading (reads selection or full page).
4.  Click **Stop** to end playback.
5.  Toggle **"Auto-read on select"** to enable/disable automatic reading when highlighting text.

### Using the Context Menu
1.  Highlight text on any webpage.
2.  Right-click the selection.
3.  Choose **"Read Aloud Selection"**.

### Using Auto-Read
1.  Enable "Auto-read on select" in the popup.
2.  Simply highlight text on any page, and it will start reading immediately after you release the mouse.

### Screenshot

<img width="330" height="309" alt="image" src="https://github.com/user-attachments/assets/1843e15a-d065-4457-8ca3-9c9e86dbab99" />


## Debugging

*   Open the Developer Tools (F12) and look at the **Console** tab to see logs like "Read Aloud: Started reading" or "Read Aloud: Finished reading".
