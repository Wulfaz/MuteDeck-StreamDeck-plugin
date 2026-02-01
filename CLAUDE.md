# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MuteDeck StreamDeck Plugin (v11.2.0.0) is an Elgato Stream Deck integration that enables hardware control of video conferencing applications (Zoom, Teams, Webex, Google Meet, Discord, etc.). It communicates with the MuteDeck desktop application via WebSocket.

**This is a distribution-only repository** - the source code is bundled into `bin/plugin.js` (10K+ lines). There are no build scripts, tests, or source files.

## Architecture

```
┌─────────────────────────────────────┐
│  MuteDeck Application               │
│  (WebSocket Server localhost:3492)  │
└──────────────┬──────────────────────┘
               │ WebSocket
┌──────────────▼──────────────────────┐
│  Stream Deck Plugin (plugin.js)     │
│  ├─ MuteDeckConnection (singleton)  │
│  │   └─ ReconnectingWebSocket       │
│  ├─ Action Classes (15 actions)     │
│  │   └─ All extend SingletonAction  │
│  ├─ ActionUpdater (UI state mgmt)   │
│  ├─ StatusUpdateHandler             │
│  ├─ CustomActionsHandler            │
│  └─ CustomImageResolver             │
└─────────────────────────────────────┘
```

### Key Components

- **MuteDeckConnection**: Singleton managing WebSocket connection to MuteDeck app. Auto-reconnects with infinite retries. All actions route through this.
- **Action Classes**: Each Stream Deck action (Togglemute, Togglevideo, etc.) extends `SingletonAction` and implements `onWillAppear()` and `onKeyDown()`. Push-to-Talk also uses `onKeyUp()` for momentary behavior.
- **ActionUpdater**: Manages button visual states (0=enabled, 1=disabled/off, 2=unavailable).
- **CustomImageResolver**: Loads custom disabled-state images from user's filesystem.
- **StatusUpdateHandler**: Processes incoming status messages from MuteDeck and updates all visible actions.
- **CustomActionsHandler**: Manages user-defined custom actions received from MuteDeck.

## WebSocket Protocol

**Connection**: `ws://localhost:3492`

**Outgoing messages** (plugin to MuteDeck):
```json
{
  "source": "streamdeck-plugin",
  "action": "toggle_mute|toggle_video|toggle_record|toggle_share|leave_meeting|bring-to-front|custom-action|...",
  "state": "toggle|on|off",
  "name": "custom_action_name"
}
```

**Incoming messages** (MuteDeck to plugin):
```json
{
  "connected": true,
  "mute": "active|inactive|disabled",
  "video": "active|inactive|disabled",
  "share": "active|inactive|disabled",
  "recording": "active|inactive|disabled",
  "custom_actions": [{"name": "action_name"}]
}
```

## Custom Images

Users can override disabled-state button images by placing files in:
- **Windows**: `%LOCALAPPDATA%\MuteDeck\streamdeck-images\`
- **macOS**: `~/Library/Application Support/MuteDeck/streamdeck-images/`

Expected filenames: `microphone-disabled.png`, `video-disabled.png`, `sharing-disabled.png`, `recording-disabled.png`

## Development Notes

- Stream Deck SDK v2, Node.js 20 runtime
- Requires Stream Deck Software 6.5+, macOS 12+ or Windows 10+
- Plugin registers itself to MuteDeck with: `{source: "streamdeck-plugin", action: "identify"}`
- All 15 actions are defined in `manifest.json` with their UUIDs, icons, and states
- Property inspector UI files are in `ui/` directory (HTML/JS/CSS for Stream Deck settings panels)
- Logging is set to INFO level (`streamDeck.logger.setLevel(LogLevel.INFO)`)
