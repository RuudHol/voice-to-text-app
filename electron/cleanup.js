/**
 * Opschonen van transcript: filler words eruit + zelfcorrectie toepassen.
 * Bijv. "afspraak op het werk oh nee thuis" -> "afspraak thuis"
 */

const FILLER_WORDS = [
  'uh', 'um', 'eh', 'ehm', 'uhm',
  'dus', 'eigenlijk', 'weet je', 'nou',
  'like', 'you know', 'so', 'well', 'actually',
];

// Alleen duidelijke correctiezinnen (geen losse "nee"/"wacht" om geen echte tekst weg te snijden)
// "ah nee" / "oh nee" = Whisper kan beide uitschrijven
const CORRECTION_SIGNALS = [
  'ah nee', 'oh nee', 'nee wacht', 'wacht nee', 'nee sorry', 'sorry nee',
  'oh wacht', 'ah wacht', 'wacht even', 'ik bedoel', 'of nee', 'of wacht',
  'i mean', 'no wait',
];
const MAX_WORDS_TO_REMOVE = 5;
const MAX_REPLACEMENT_WORDS = 2; // Correctie is vaak 1-2 woorden (thuis, dinsdag); rest van zin blijft staan

function removeFillerWords(text) {
  let result = text;
  for (const filler of FILLER_WORDS) {
    const re = new RegExp(`\\b${filler}\\b`, 'gi');
    result = result.replace(re, ' ').replace(/\s+/g, ' ').trim();
  }
  return result.replace(/\s+/g, ' ').trim();
}

function findEarliestSignal(text, signals) {
  let earliest = -1;
  let which = '';
  for (const signal of signals) {
    const i = text.toLowerCase().indexOf(signal.toLowerCase());
    if (i !== -1 && (earliest === -1 || i < earliest)) {
      earliest = i;
      which = signal;
    }
  }
  return earliest === -1 ? null : { index: earliest, signal: which };
}

function applySelfCorrections(text) {
  if (!text || !text.trim()) return text;
  let result = text.trim();
  const signals = [...CORRECTION_SIGNALS].sort((a, b) => b.length - a.length);

  for (let round = 0; round < 10; round++) {
    const found = findEarliestSignal(result, signals);
    if (!found) break;

    const { index, signal } = found;
    const before = result.slice(0, index).trim();
    const after = result.slice(index + signal.length).trim().replace(/^[,.\s]+/, '').trim();

    if (!after) break;

    const beforeWords = before.split(/\s+/).filter(Boolean);
    const afterWords = after.split(/\s+/).filter(Boolean);
    const replacementWords = afterWords.slice(0, MAX_REPLACEMENT_WORDS);
    const restOfAfter = afterWords.slice(MAX_REPLACEMENT_WORDS).join(' ');

    const removeCount = Math.min(
      beforeWords.length - 1,
      MAX_WORDS_TO_REMOVE,
      Math.max(2, replacementWords.length + 2)
    );
    if (removeCount < 1) break;
    const keepBefore = beforeWords.slice(0, -removeCount).join(' ');
    const replacement = replacementWords.join(' ');
    result = keepBefore
      ? (restOfAfter ? `${keepBefore} ${replacement} ${restOfAfter}` : `${keepBefore} ${replacement}`)
      : (restOfAfter ? `${replacement} ${restOfAfter}` : replacement);
    result = result.replace(/\s+/g, ' ').trim();
  }

  return result.replace(/\s+/g, ' ').trim();
}

function cleanup(rawTranscript) {
  if (!rawTranscript || !String(rawTranscript).trim()) return '';
  let text = String(rawTranscript).trim();
  text = applySelfCorrections(text);
  text = removeFillerWords(text);
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = { cleanup, removeFillerWords, applySelfCorrections };
