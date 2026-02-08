/**
 * Plak tekst in het actieve venster: klembord + Ctrl+V.
 * Zo komt de transcript direct in Cursor, Word, etc.
 */

const { clipboard } = require('electron');

const PASTE_DELAY_MS = 150;

function pasteIntoActiveWindow(text) {
  if (!text || typeof text !== 'string') return { ok: false, reason: 'no-text' };
  clipboard.writeText(text);
  try {
    const robot = require('robotjs');
    setTimeout(() => {
      robot.keyTap('v', process.platform === 'darwin' ? 'command' : 'control');
    }, PASTE_DELAY_MS);
    return { ok: true, pasted: true };
  } catch {
    return { ok: true, pasted: false };
  }
}

module.exports = { pasteIntoActiveWindow };
