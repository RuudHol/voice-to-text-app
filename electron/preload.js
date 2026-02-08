const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveRecording: (arrayBuffer) => ipcRenderer.invoke('save-recording', arrayBuffer),
  transcribe: (audioPath) => ipcRenderer.invoke('transcribe', audioPath),
  pasteIntoActiveWindow: (text) => ipcRenderer.invoke('paste-into-active-window', text),
});
