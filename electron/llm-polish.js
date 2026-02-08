/**
 * Optionele lokale LLM-polish via Ollama.
 * Maakt de transcript netjes: zinnen, correcties, typo's.
 * Werkt alleen als Ollama draait (localhost:11434) en er een model is (bijv. llama3.2, mistral).
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = 'llama3.2';
const TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = `Je bent een hulp die gesproken Nederlandse tekst opschoont.
Je krijgt ruwe transcriptie (spraak-naar-tekst). Jouw taak:
- Alleen de eindtekst geven: als iemand zichzelf corrigeert ("X oh nee Y"), schrijf alleen de bedoelde versie (Y).
- Filler words weglaten (uh, eh, dus, weet je).
- Voor de rest zo weinig mogelijk veranderen: geen eigen woorden toevoegen, geen inhoud weglaten.
Antwoord ALLEEN met de opgeschoonde tekst, geen uitleg.`;

function getPolishPrompt(transcript) {
  return `Schoon deze Nederlandse gesproken transcript op. Geef alleen de opgeschoonde tekst.\n\n${transcript}`;
}

async function polishWithOllama(text, model = DEFAULT_MODEL) {
  if (!text || !text.trim()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: getPolishPrompt(text),
        system: SYSTEM_PROMPT,
        stream: false,
        options: { temperature: 0.2, num_predict: 1024 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const out = data.response && data.response.trim();
    return out || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function isOllamaAvailable() {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 2000);
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET', signal: c.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    clearTimeout(t);
    return false;
  }
}

module.exports = { polishWithOllama, isOllamaAvailable };
