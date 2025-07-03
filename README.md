# Outline Semantic Analyzer

Un tool avanzato per analizzare la coerenza semantica delle outline per blog e service page, con suggerimenti AI per l'ottimizzazione.

## 🚀 Funzionalità

- **Analisi Semantica**: Utilizza Google Gemini per calcolare la coerenza semantica tra keyword e titoli
- **Generazione Termini**: Genera termini semanticamente correlati usando Claude Sonnet 4
- **Analisi Competitor**: Analizza le outline dei competitor per identificare opportunità
- **Editor Interattivo**: Modifica i titoli in tempo reale con ricalcolo automatico del punteggio
- **Ottimizzazione AI**: Suggerimenti per migliorare la struttura dell'outline
- **Supporto Multi-tipo**: Ottimizzato per blog post e service page

## 🛠️ Tecnologie Utilizzate

- **Frontend**: Vanilla JavaScript, Tailwind CSS, Vite
- **AI APIs**: 
  - Google Gemini (embeddings)
  - OpenRouter (Claude Sonnet 4 e modelli gratuiti)
- **Deploy**: GitHub Pages

## 📋 Prerequisiti

- API key di Google Gemini
- API key di OpenRouter
- Nessuna installazione richiesta (tool web-based)

## 🚀 Utilizzo

1. **Configurazione API**:
   - Inserisci le API key di Google Gemini e OpenRouter
   - Le chiavi vengono salvate localmente per sessioni future

2. **Analisi Outline**:
   - Inserisci la parola chiave target
   - Seleziona il tipo di pagina (blog o service page)
   - Incolla l'outline della pagina
   - Clicca "Analizza Outline"

3. **Analisi Competitor**:
   - Usa "Analizza Competitor" per ottenere insight sui competitor
   - Visualizza titoli comuni e opportunità di miglioramento

4. **Ottimizzazione**:
   - Modifica i titoli nell'editor interattivo
   - Visualizza i cambiamenti di punteggio in tempo reale
   - Usa i termini semantici suggeriti per migliorare i titoli

## 🎯 Modelli AI Utilizzati

- **Analisi Competitor**: `meta-llama/llama-3.1-8b-instruct:free` (gratuito)
- **Generazione Termini**: `anthropic/claude-3-sonnet-20240229` (Claude Sonnet 4)
- **Ottimizzazione Outline**: `anthropic/claude-3-sonnet-20240229` (Claude Sonnet 4)

## 📊 Interpretazione dei Punteggi

- **Eccellente (80-100%)**: Titolo altamente correlato alla keyword
- **Buono (60-79%)**: Buona correlazione semantica
- **Discreto (40-59%)**: Correlazione accettabile, può essere migliorata
- **Scarso (0-39%)**: Correlazione bassa, necessita miglioramenti

## 🔧 Sviluppo Locale

```bash
# Clona il repository
git clone https://github.com/tuonome/outline-semantic-analyzer.git

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build
```

## 📱 Deploy

Il progetto è configurato per il deploy automatico su GitHub Pages. Ogni push al branch `main` triggerà il build e deploy automatico.

## 🤝 Contributi

I contributi sono benvenuti! Apri una issue per discutere modifiche importanti.

## 📄 Licenza

Questo progetto è rilasciato sotto licenza ISC.

## 🔮 Roadmap

- [ ] Integrazione con Google Custom Search API per analisi competitor reale
- [ ] Supporto per più lingue
- [ ] Esportazione risultati in formato PDF
- [ ] Analisi batch di multiple outline
- [ ] Suggerimenti automatici per meta description