require.config({ paths: { vs: "monaco/min/vs" } });

require(["vs/editor/editor.main"], () => {
  const editor = monaco.editor.create(document.getElementById("editor"), {
    value: "// AI-TUI shell ready\n",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true
  });

  const term = new Terminal({ convertEol: true });
  term.open(document.getElementById("terminal"));

  const ws = new WebSocket(`ws://${location.host}`);
  term.onData((d) => ws.send(d));
  ws.onmessage = (e) => term.write(e.data);

  window.openFile = async function (path) {
    const res = await fetch("/open-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path })
    });
    const data = await res.json();
    if (data.ok) {
      editor.setValue(data.contents);
    } else {
      alert("OPEN ERROR: " + data.error);
    }
  };

  window.saveFile = async function (path) {
    const res = await fetch("/save-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, contents: editor.getValue() })
    });
    const data = await res.json();
    if (!data.ok) {
      alert("SAVE ERROR: " + data.error);
    }
  };
});
