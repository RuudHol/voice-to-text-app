const path = require('path');
const os = require('os');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

function webmToWav(webmPath) {
  const wavPath = path.join(os.tmpdir(), `voice-to-text-${Date.now()}.wav`);
  return new Promise((resolve, reject) => {
    ffmpeg(webmPath)
      .toFormat('wav')
      .audioFrequency(16000)
      .on('end', () => resolve(wavPath))
      .on('error', (err) => reject(err))
      .save(wavPath);
  });
}

async function transcribeLocal(audioPath) {
  const ext = path.extname(audioPath).toLowerCase();
  let wavPath = audioPath;

  if (ext !== '.wav') {
    wavPath = await webmToWav(audioPath);
    try {
      const result = await runWhisper(wavPath);
      fs.unlink(wavPath, () => {});
      return result;
    } catch (e) {
      fs.unlink(wavPath, () => {});
      throw e;
    }
  }

  return runWhisper(wavPath);
}

async function runWhisper(wavPath) {
  const w = require('whisper-node');
  const whisperFn = w.whisper || w.default || w;
  const segments = await whisperFn(wavPath, {
    modelName: 'base.en',
    whisperOptions: {
      language: 'auto',
      word_timestamps: false,
    },
  });
  const text = (segments || [])
    .map((s) => (s && s.speech) || '')
    .filter(Boolean)
    .join(' ')
    .trim();
  return text || '';
}

module.exports = { transcribeLocal, webmToWav };
