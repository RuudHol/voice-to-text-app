const path = require('path');
const os = require('os');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { cleanup } = require('./cleanup');
const { polishWithOllama, isOllamaAvailable } = require('./llm-polish');

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

function webmToWav(webmPath) {
  const wavPath = path.join(os.tmpdir(), `voice-to-text-${Date.now()}.wav`);
  return new Promise((resolve, reject) => {
    ffmpeg(webmPath)
      .toFormat('wav')
      .audioFrequency(16000)
      .audioChannels(1)
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

let transcriberPromise = null;

async function runWhisper(wavPath) {
  const { pipeline } = await import('@xenova/transformers');
  const { WaveFile } = require('wavefile');

  const buffer = fs.readFileSync(wavPath);
  const wav = new WaveFile(buffer);
  wav.toBitDepth('32f');
  wav.toSampleRate(16000);
  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) audioData = audioData[0];
  if (!(audioData instanceof Float32Array)) {
    audioData = new Float32Array(audioData);
  }

  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', 'Xenova/whisper-medium');
  }
  const transcriber = await transcriberPromise;
  const output = await transcriber(audioData, { language: 'dutch', task: 'transcribe' });
  const raw = (output && output.text) ? String(output.text).trim() : '';
  const cleaned = cleanup(raw);
  if (await isOllamaAvailable()) {
    const polished = await polishWithOllama(cleaned);
    if (polished) return polished.trim();
  }
  return cleaned;
}

module.exports = { transcribeLocal, webmToWav };
