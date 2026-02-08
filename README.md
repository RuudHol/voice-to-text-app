# Voice to Text

Desktop app: spraak opnemen en omzetten naar tekst (lokaal met Whisper).

## Eerste keer

1. **Node.js** moet geïnstalleerd zijn.
2. **Whisper-model downloaden** (eenmalig):
   ```bash
   npx whisper-node download
   ```
   Kies bijv. `base.en` (snel) of `small.en`. Op Windows: als het mislukt, installeer [GNU Make](https://gnuwin32.sourceforge.net/packages/make.htm) en probeer opnieuw.

## Starten

```bash
npm install
npm run electron:dev
```

- Eerst start de dev-server (Vite), daarna opent het Electron-venster.
- Klik **Start opname**, praat, klik **Stop opname** — de app zet de opname om naar tekst (lokaal).

## Wat er al werkt

- Opname (microfoon)
- Opslaan als bestand
- Transcriptie met Whisper (lokaal, na model-download)
- Transcript tonen in de app

## Later (plan)

- Filler words eruit, zelfcorrectie, woordenboek dat leert van correcties
- Sneltoetsen (houd ingedrukt / toggle) + drijvend opname-schermpje
- Tekst plakken in het actieve venster (overal)
- Optioneel: OpenAI Whisper API (cloud)
