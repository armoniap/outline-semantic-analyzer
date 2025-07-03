import { generateEmbeddings } from '../api/gemini.js';
import { cosineSimilarity } from '../utils/math.js';

export class OutlineAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async analyzeOutlineCoherence(keyword, outline) {
        try {
            // Parse outline into individual headings
            const headings = this.parseOutline(outline);
            
            if (headings.length === 0) {
                throw new Error('Nessun titolo rilevato nell\'outline');
            }

            // Prepare texts for embedding generation
            const texts = [keyword, ...headings.map(h => h.text)];
            
            // Generate embeddings
            const embeddings = await generateEmbeddings(this.apiKey, texts);
            
            if (embeddings.length !== texts.length) {
                throw new Error('Numero di embeddings non corrispondente ai testi');
            }

            // Calculate semantic coherence
            const keywordEmbedding = embeddings[0];
            const headingEmbeddings = embeddings.slice(1);
            
            const scores = headingEmbeddings.map((embedding, index) => {
                const similarity = cosineSimilarity(keywordEmbedding, embedding);
                return {
                    heading: headings[index],
                    score: similarity,
                    level: this.getScoreLevel(similarity)
                };
            });

            // Calculate overall score
            const overallScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
            
            return {
                overallScore,
                overallLevel: this.getScoreLevel(overallScore),
                headingScores: scores,
                totalHeadings: headings.length,
                analysis: this.generateAnalysis(scores, overallScore)
            };

        } catch (error) {
            console.error('Error analyzing outline coherence:', error);
            throw error;
        }
    }

    parseOutline(outline) {
        const lines = outline.split('\n').filter(line => line.trim());
        const headings = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Detect heading level
            let level = 'H2'; // Default level
            let text = trimmed;
            
            // Check for markdown-style headers
            if (trimmed.startsWith('###')) {
                level = 'H3';
                text = trimmed.replace(/^###\s*/, '').trim();
            } else if (trimmed.startsWith('##')) {
                level = 'H2';
                text = trimmed.replace(/^##\s*/, '').trim();
            } else if (trimmed.startsWith('#')) {
                level = 'H1';
                text = trimmed.replace(/^#\s*/, '').trim();
            }
            // Check for HTML-style headers
            else if (trimmed.match(/^H[1-6]:/i)) {
                level = trimmed.substring(0, 2).toUpperCase();
                text = trimmed.replace(/^H[1-6]:\s*/i, '').trim();
            }
            // Check for numbered lists
            else if (trimmed.match(/^\d+\./)) {
                text = trimmed.replace(/^\d+\.\s*/, '').trim();
            }
            // Check for bullet points
            else if (trimmed.match(/^[-*•]\s/)) {
                text = trimmed.replace(/^[-*•]\s*/, '').trim();
            }
            
            if (text) {
                headings.push({
                    level,
                    text: text,
                    original: trimmed
                });
            }
        }
        
        return headings;
    }

    getScoreLevel(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        return 'poor';
    }

    generateAnalysis(scores, overallScore) {
        const excellent = scores.filter(s => s.level === 'excellent').length;
        const good = scores.filter(s => s.level === 'good').length;
        const fair = scores.filter(s => s.level === 'fair').length;
        const poor = scores.filter(s => s.level === 'poor').length;
        
        let analysis = `Su ${scores.length} titoli analizzati: `;
        
        if (excellent > 0) analysis += `${excellent} eccellenti, `;
        if (good > 0) analysis += `${good} buoni, `;
        if (fair > 0) analysis += `${fair} discreti, `;
        if (poor > 0) analysis += `${poor} scarsi. `;
        
        analysis = analysis.replace(/, $/, '.');
        
        if (overallScore >= 0.7) {
            analysis += ' La coerenza semantica è molto buona.';
        } else if (overallScore >= 0.5) {
            analysis += ' La coerenza semantica è accettabile ma può essere migliorata.';
        } else {
            analysis += ' La coerenza semantica necessita di miglioramenti significativi.';
        }
        
        return analysis;
    }

    async recalculateHeadingScore(keyword, headingText) {
        try {
            const embeddings = await generateEmbeddings(this.apiKey, [keyword, headingText]);
            const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
            
            return {
                score: similarity,
                level: this.getScoreLevel(similarity)
            };
        } catch (error) {
            console.error('Error recalculating heading score:', error);
            throw error;
        }
    }
}