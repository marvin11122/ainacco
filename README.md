# AI TUI Shell (Monaco + xterm.js + node-pty)

A minimal, production-ready, copy-pasteable Monaco editor plus xterm.js terminal shell that runs locally on Linux with only Node.js installed. It serves static assets via Express, streams a real PTY over WebSocket, and exposes simple file open/save endpoints.

## Directory layout
```
ai-tui-shell/
├─ package.json
├─ server.js
└─ public/
   ├─ index.html
   ├─ main.js
   ├─ style.css
   ├─ monaco/   (populated from node_modules/monaco-editor/min)
   └─ xterm/    (populated from node_modules/xterm/lib + css)
```

## Quick start
```bash
npm install       # installs deps and copies Monaco/xterm assets into public/
npm start         # runs server at http://localhost:3000
```

## Manual asset copy (optional)
If you need to refresh assets without reinstalling:
```bash
npm run copy:assets
```

## Usage
- Open the app at http://localhost:3000.
- The left pane is Monaco; the right pane is an xterm.js terminal backed by node-pty.
- Use the helper functions in DevTools console:
  - `openFile("/path/to/file")`
  - `saveFile("/path/to/file")`

## Notes
- Default shell is `$SHELL` or `/bin/bash`.
- The backend WebSocket server and file routes are defined in `server.js`.
- This project intentionally omits any Electron wrapper; it is a lightweight web app runnable locally.
