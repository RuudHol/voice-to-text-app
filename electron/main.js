const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const { transcribeLocal } = require('./transcribe');
const { pasteIntoActiveWindow } = require('./inject');

ipcMain.handle('save-recording', async (_event, arrayBuffer) => {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `voice-to-text-${Date.now()}.webm`);
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  return filePath;
});

ipcMain.handle('transcribe', async (_event, audioPath) => {
  try {
    const text = await transcribeLocal(audioPath);
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
});

ipcMain.handle('paste-into-active-window', async (_event, text) => {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (win) {
    win.hide();
    await new Promise((r) => setTimeout(r, 400));
  }
  const result = pasteIntoActiveWindow(text);
  await new Promise((r) => setTimeout(r, 200));
  if (win) win.show();
  return result;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
