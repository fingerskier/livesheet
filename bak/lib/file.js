export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  triggerDownload(blob, filename);
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadText() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = evt => {
        document.body.removeChild(input);
        resolve(evt.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

export function loadJSON() {
  return loadText().then(text => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  });
}
