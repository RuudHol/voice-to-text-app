let mediaRecorder = null;
let stream = null;
let chunks = [];

export async function startRecording() {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
  mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
  chunks = [];

  mediaRecorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  mediaRecorder.onstop = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstart = () => resolve();
    mediaRecorder.onerror = (e) => reject(e.error || new Error('Opname mislukt'));
    mediaRecorder.start(200);
  });
}

export function stopRecording() {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resolve(null);
      return;
    }
    const onStop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      resolve(blob);
    };
    mediaRecorder.addEventListener('stop', onStop, { once: true });
    mediaRecorder.onerror = (e) => reject(e.error || new Error('Stop opname mislukt'));
    mediaRecorder.stop();
  });
}

export function isRecording() {
  return mediaRecorder != null && mediaRecorder.state === 'recording';
}
