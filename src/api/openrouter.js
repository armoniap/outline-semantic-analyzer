const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Available models for different tasks
export const MODELS = {
    COMPETITOR_ANALYSIS: 'openai/gpt-4o-mini', // GPT-4o Mini for competitor analysis
    SEMANTIC_ENHANCEMENT: 'openai/gpt-4o-mini', // GPT-4o Mini for semantic enhancement
    CONTENT_GENERATION: 'openai/gpt-4o-mini', // GPT-4o Mini for content generation
    OUTLINE_OPTIMIZATION: 'openai/gpt-4o-mini', // GPT-4o Mini for outline optimization
    AI_SUGGESTIONS: 'anthropic/claude-3.5-sonnet-20241022' // Claude Sonnet 4 for AI suggestions
};

export async function makeOpenRouterRequest(apiKey, model, messages, maxTokens = 1000) {
    if (!apiKey || !model || !messages) {
        throw new Error('API key, model, and messages are required');
    }

    const url = `${OPENROUTER_API_BASE}/chat/completions`;
    
    const requestBody = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
    };

    return await makeRequestWithRetry(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Outline Semantic Analyzer'
        },
        body: JSON.stringify(requestBody)
    });
}

export async function generateSemanticTerms(apiKey, keyword, pageType = 'blog') {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist. Il tuo compito è generare termini semanticamente correlati per una parola chiave specifica, considerando il tipo di pagina (blog o service page).`
        },
        {
            role: 'user',
            content: `Genera 15-20 termini semanticamente correlati alla parola chiave "${keyword}" per una ${pageType === 'blog' ? 'pagina blog' : 'service page'}. 
            
            I termini devono essere:
            - Semanticamente correlati alla parola chiave principale
            - Appropriati per il tipo di pagina
            - Utili per l'ottimizzazione SEO
            - Vari in tipologia (sinonimi, termini correlati, long-tail keywords, etc.)
            
            Rispondi in formato JSON con questa struttura:
            {
                "terms": [
                    {
                        "term": "termine semantico",
                        "type": "synonym|related|longtail|technical",
                        "relevance": "high|medium|low"
                    }
                ]
            }`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.SEMANTIC_ENHANCEMENT, messages, 1500);
        const content = response.choices[0].message.content;
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.terms || [];
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error generating semantic terms:', error);
        throw error;
    }
}

export async function analyzeCompetitorOutlines(apiKey, keyword, outlines) {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist. Analizza le outline dei competitor per identificare pattern comuni e opportunità di miglioramento.`
        },
        {
            role: 'user',
            content: `Analizza queste outline dei competitor per la parola chiave "${keyword}":

${outlines.map((outline, index) => `
COMPETITOR ${index + 1}:
${outline}
`).join('\n')}

Fornisci un'analisi che includa:
1. Titoli e sottotitoli più comuni
2. Strutture ricorrenti
3. Argomenti frequentemente trattati
4. Opportunità di differenziazione
5. Suggerimenti per una outline migliore

Rispondi in formato JSON con questa struttura:
{
    "commonTitles": ["titolo1", "titolo2", ...],
    "commonStructures": ["struttura1", "struttura2", ...],
    "frequentTopics": ["argomento1", "argomento2", ...],
    "opportunities": ["opportunità1", "opportunità2", ...],
    "suggestions": ["suggerimento1", "suggerimento2", ...]
}`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.COMPETITOR_ANALYSIS, messages, 2000);
        const content = response.choices[0].message.content;
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error analyzing competitor outlines:', error);
        throw error;
    }
}

export async function optimizeOutline(apiKey, currentOutline, keyword, semanticTerms, competitorInsights) {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist. Ottimizza l'outline fornita basandoti sui termini semantici e insights dei competitor.`
        },
        {
            role: 'user',
            content: `Ottimizza questa outline per la parola chiave "${keyword}":

OUTLINE ATTUALE:
${currentOutline}

TERMINI SEMANTICI DISPONIBILI:
${semanticTerms.map(term => `- ${term.term} (${term.type}, ${term.relevance})`).join('\n')}

INSIGHTS COMPETITOR:
${competitorInsights ? JSON.stringify(competitorInsights, null, 2) : 'Nessun insight disponibile'}

Fornisci suggerimenti per:
1. Migliorare i titoli esistenti (più accattivanti e SEO-friendly)
2. Aggiungere nuovi sottotitoli per coprire aspetti mancanti
3. Integrare i termini semantici nell'outline
4. Strutturare meglio l'outline per massimizzare l'efficacia SEO

Rispondi in formato JSON con questa struttura:
{
    "optimizedOutline": [
        {
            "level": "H1|H2|H3",
            "title": "Titolo ottimizzato",
            "original": "Titolo originale se modificato",
            "isNew": true/false,
            "semanticTerms": ["termine1", "termine2"],
            "reasoning": "Spiegazione del miglioramento"
        }
    ],
    "recommendations": [
        "Raccomandazione 1",
        "Raccomandazione 2"
    ]
}`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.OUTLINE_OPTIMIZATION, messages, 2500);
        const content = response.choices[0].message.content;
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error optimizing outline:', error);
        throw error;
    }
}

async function makeRequestWithRetry(url, options, retryCount = 0) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 429 && retryCount < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.warn(`Rate limited. Retrying in ${delay}ms...`);
                await sleep(delay);
                return makeRequestWithRetry(url, options, retryCount + 1);
            }
            
            if (response.status >= 500 && retryCount < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.warn(`Server error ${response.status}. Retrying in ${delay}ms...`);
                await sleep(delay);
                return makeRequestWithRetry(url, options, retryCount + 1);
            }
            
            throw new Error(`OpenRouter API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenRouter API');
        }
        
        return data;
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Errore di connessione. Verifica la tua connessione internet.');
        }
        
        if (retryCount < MAX_RETRIES && (
            error.message.includes('network') || 
            error.message.includes('timeout') ||
            error.message.includes('fetch')
        )) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
            console.warn(`Network error. Retrying in ${delay}ms...`);
            await sleep(delay);
            return makeRequestWithRetry(url, options, retryCount + 1);
        }
        
        throw error;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateSubheadingSuggestion(apiKey, keyword, currentTitle, level, currentOutline) {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist specializzato nella creazione di titoli semanticamente ottimizzati. Il tuo compito è migliorare un singolo subheading per massimizzare la rilevanza semantica e l'efficacia SEO.`
        },
        {
            role: 'user',
            content: `Migliora questo subheading per la parola chiave "${keyword}":

SUBHEADING DA MIGLIORARE:
Livello: ${level}
Titolo attuale: "${currentTitle}"

CONTESTO OUTLINE COMPLETA:
${currentOutline}

Il nuovo subheading deve:
1. Essere semanticamente più rilevante alla parola chiave principale
2. Essere più accattivante e coinvolgente
3. Mantenere il livello gerarchico ${level}
4. Integrarsi bene con il resto dell'outline
5. Essere specifico e dettagliato nel descrivere il contenuto
6. Evitare argomenti già coperti da altri subheading

Rispondi SOLO con il nuovo titolo ottimizzato, senza spiegazioni aggiuntive.`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.AI_SUGGESTIONS, messages, 100);
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating subheading suggestion:', error);
        throw error;
    }
}

export async function generateOptimizedOutline(apiKey, keyword, currentOutline, semanticTerms) {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist. Il tuo compito è riscrivere completamente un'outline per massimizzare la coerenza semantica e l'efficacia SEO.`
        },
        {
            role: 'user',
            content: `Riscrivi completamente questa outline per la parola chiave "${keyword}":

OUTLINE ATTUALE:
${currentOutline}

TERMINI SEMANTICI DISPONIBILI:
${semanticTerms.map(term => `- ${term.term} (${term.type}, ${term.relevance})`).join('\n')}

La nuova outline deve:
1. Essere completamente riscritta e ottimizzata
2. Integrare i termini semantici più rilevanti
3. Avere una struttura logica e progressiva
4. Coprire tutti gli aspetti importanti del topic
5. Evitare ripetizioni e sovrapposizioni
6. Essere specifici e dettagliati nei subheading
7. Mantenere la gerarchia H1, H2, H3

Rispondi in formato:
H1: Titolo principale
H2: Primo sottotitolo
H3: Primo sotto-sottotitolo
H3: Secondo sotto-sottotitolo
H2: Secondo sottotitolo
... e così via`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.AI_SUGGESTIONS, messages, 1000);
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating optimized outline:', error);
        throw error;
    }
}

export async function generateSmartSubheadingSuggestions(apiKey, keyword, currentOutline, semanticTerms, maxSuggestions = 5) {
    const messages = [
        {
            role: 'system',
            content: `Sei un esperto SEO e content strategist. Il tuo compito è analizzare un'outline esistente e suggerire nuovi subheading che colmino le lacune tematiche.`
        },
        {
            role: 'user',
            content: `Analizza questa outline per la parola chiave "${keyword}" e suggerisci ${maxSuggestions} nuovi subheading:

OUTLINE ATTUALE:
${currentOutline}

TERMINI SEMANTICI DISPONIBILI:
${semanticTerms.map(term => `- ${term.term} (${term.type}, ${term.relevance})`).join('\n')}

Suggerisci nuovi subheading che:
1. NON si sovrappongano con quelli esistenti
2. Coprano aspetti mancanti del topic
3. Siano semanticamente rilevanti
4. Integrino i termini semantici disponibili
5. Aggiungano valore unico all'outline
6. Siano specifici e descrittivi del contenuto

Per ogni suggerimento, includi:
- Il livello appropriato (H2 o H3)
- Il titolo del subheading
- Una breve spiegazione del contenuto che dovrebbe coprire

Rispondi in formato JSON:
{
    "suggestions": [
        {
            "level": "H2",
            "title": "Titolo suggerito",
            "description": "Descrizione del contenuto che dovrebbe coprire questo paragrafo",
            "semanticTerms": ["termine1", "termine2"]
        }
    ]
}`
        }
    ];

    try {
        const response = await makeOpenRouterRequest(apiKey, MODELS.AI_SUGGESTIONS, messages, 1500);
        const content = response.choices[0].message.content;
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error generating smart subheading suggestions:', error);
        throw error;
    }
}

export async function testOpenRouterApiKey(apiKey) {
    try {
        const testMessages = [
            {
                role: 'user',
                content: 'Rispondi con "OK" se ricevi questo messaggio.'
            }
        ];
        
        const response = await makeOpenRouterRequest(apiKey, MODELS.CONTENT_GENERATION, testMessages, 10);
        return response.choices && response.choices[0] && response.choices[0].message;
    } catch (error) {
        console.error('OpenRouter API key test failed:', error.message);
        return false;
    }
}