import { useState } from 'react';
import { startRecording, stopRecording } from './lib/recorder';
import './App.css';

function App() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');

  const handleStart = async () => {
    setError('');
    setStatus('');
    setTranscript('');
    try {
      await startRecording();
      setRecording(true);
      setStatus('Opname bezig…');
    } catch (e) {
      setError(e.message || 'Microfoon niet beschikbaar of toegang geweigerd.');
    }
  };

  const handleStop = async () => {
    if (!recording) return;
    setError('');
    setStatus('Opname opslaan…');
    try {
      const blob = await stopRecording();
      setRecording(false);
      if (!blob || blob.size === 0) {
        setStatus('');
        setError('Geen audio opgenomen.');
        return;
      }
      const arrayBuffer = await blob.arrayBuffer();
      const audioPath = await window.electronAPI.saveRecording(arrayBuffer);
      if (!audioPath) {
        setStatus('');
        setError('Opslaan mislukt.');
        return;
      }
      setStatus('Bezig met omzetten naar tekst…');
      const result = await window.electronAPI.transcribe(audioPath);
      if (result.ok) {
        const text = result.text || '(geen tekst herkend)';
        setTranscript(text);
        if (text && text !== '(geen tekst herkend)') {
          const pasteResult = await window.electronAPI.pasteIntoActiveWindow(text);
          setStatus(pasteResult.pasted ? 'Klaar. Tekst geplakt in je document.' : 'Klaar. Tekst gekopieerd — plak met Ctrl+V.');
        } else {
          setStatus('Klaar.');
        }
      } else {
        setError(result.error || 'Transcriptie mislukt.');
        setStatus('');
      }
    } catch (e) {
      setRecording(false);
      setStatus('');
      setError(e.message || 'Er is iets misgegaan.');
    }
  };

  return (
    <div className="app">
      <h1>Voice to Text</h1>
      <p className="sub">Start opname, praat, stop — daarna wordt het omgezet naar tekst.</p>

      <div className="actions">
        {!recording ? (
          <button type="button" className="btn btn-start" onClick={handleStart}>
            Start opname
          </button>
        ) : (
          <button type="button" className="btn btn-stop" onClick={handleStop}>
            Stop opname
          </button>
        )}
      </div>

      {status && <p className="status info">{status}</p>}
      {transcript && (
        <div className="transcript-box">
          <label>Transcript:</label>
          <p className="transcript">{transcript}</p>
        </div>
      )}
      {error && <p className="status error">{error}</p>}
    </div>
  );
}

export default App;
