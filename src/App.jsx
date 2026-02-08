import { useState } from 'react';
import { startRecording, stopRecording } from './lib/recorder';
import './App.css';

function App() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState('');

  const handleStart = async () => {
    setError('');
    setLastSaved('');
    try {
      await startRecording();
      setRecording(true);
    } catch (e) {
      setError(e.message || 'Microfoon niet beschikbaar of toegang geweigerd.');
    }
  };

  const handleStop = async () => {
    if (!recording) return;
    setError('');
    try {
      const blob = await stopRecording();
      setRecording(false);
      if (!blob || blob.size === 0) {
        setLastSaved('Geen audio opgenomen.');
        return;
      }
      const arrayBuffer = await blob.arrayBuffer();
      const path = await window.electronAPI.saveRecording(arrayBuffer);
      setLastSaved(path ? 'Opname opgeslagen.' : 'Opslaan mislukt.');
    } catch (e) {
      setRecording(false);
      setError(e.message || 'Stoppen mislukt.');
    }
  };

  return (
    <div className="app">
      <h1>Voice to Text</h1>
      <p className="sub">Start opname, praat, stop — daarna volgt transcriptie.</p>

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

      {recording && <p className="status recording">Opname bezig…</p>}
      {lastSaved && <p className="status saved">{lastSaved}</p>}
      {error && <p className="status error">{error}</p>}
    </div>
  );
}

export default App;
