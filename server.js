const express = require("express");
const path = require("path");
const fs = require("fs");
const { WebSocketServer } = require("ws");
const pty = require("node-pty");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Basic file open
app.post("/open-file", (req, res) => {
  const { path: filePath } = req.body || {};
  try {
    const contents = fs.readFileSync(filePath, "utf8");
    res.json({ ok: true, contents });
  } catch (error) {
    res.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

// Basic file save
app.post("/save-file", (req, res) => {
  const { path: filePath, contents } = req.body || {};
  try {
    fs.writeFileSync(filePath, contents ?? "", "utf8");
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

const server = app.listen(PORT, () => {
  console.log(`AI-TUI shell running at http://localhost:${PORT}`);
});

// WebSocket shell bridge
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const shell = pty.spawn(process.env.SHELL || "/bin/bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: process.env
  });

  shell.onData((data) => ws.send(data));
  ws.on("message", (msg) => shell.write(msg.toString()));
  ws.on("close", () => shell.kill());
});
