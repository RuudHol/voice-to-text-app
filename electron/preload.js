const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveRecording: (arrayBuffer) => ipcRenderer.invoke('save-recording', arrayBuffer),
});
