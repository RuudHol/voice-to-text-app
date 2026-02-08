# Voice to Text

Desktop app: spraak opnemen en omzetten naar tekst (lokaal).

## Starten

```bash
npm install
npm run electron:dev
```

Dat is alles. Geen extra installatie of model-download: bij de **eerste transcriptie** wordt het Whisper-model automatisch gedownload (eenmalig, daarna offline). De eerste keer kan dat een minuut duren.

- **Start opname** → praat → **Stop opname** → even wachten → transcript verschijnt.

## Wat er werkt

- Opname (microfoon), opslaan, transcriptie (lokaal met Whisper), cleanup (filler words + zelfcorrectie), transcript in de app.
- **Optioneel: lokale LLM-polish** – als [Ollama](https://ollama.com) draait, wordt de transcript daarna door een lokaal model opgeschoond.
- **Automatisch plakken** – na transcriptie wordt de tekst op het klembord gezet en (als mogelijk) automatisch geplakt in het venster dat dan actief is (bijv. Cursor, Word). Lukt auto-plakken niet, dan staat de tekst op het klembord: plak met Ctrl+V.

## Ollama (voor betere tekst)

1. Installeer [Ollama](https://ollama.com).
2. Haal een model op: `ollama pull llama3.2` (of `mistral`).
3. Laat Ollama draaien; de app gebruikt het automatisch als het beschikbaar is.

## Later (plan)

- Woordenboek dat leert van correcties, sneltoetsen, drijvend schermpje, tekst overal plakken.
