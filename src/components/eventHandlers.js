import { validateForm } from '../utils/validation.js';
import { saveApiKey } from '../utils/storage.js';
import { OutlineAnalyzer } from '../services/outlineAnalyzer.js';
import { CompetitorAnalyzer } from '../services/competitorAnalyzer.js';
import { generateSemanticTerms, optimizeOutline } from '../api/openrouter.js';
import { showLoading, hideLoading, showError, showSuccess } from '../utils/ui.js';
import { renderResults } from './resultsRenderer.js';
import { setupOutlineEditor } from './outlineEditor.js';

let currentAnalyzer = null;
let currentCompetitorAnalyzer = null;
let currentSemanticTerms = [];
let currentAnalysisResults = null;

export function setupEventListeners() {
    // API Key visibility toggles
    setupApiKeyToggles();
    
    // Form validation
    setupFormValidation();
    
    // Main action buttons
    setupAnalysisButtons();
    
    // Semantic terms management
    setupSemanticTermsHandlers();
}

function setupApiKeyToggles() {
    const toggleGeminiBtn = document.getElementById('toggleGeminiApiKey');
    const toggleOpenrouterBtn = document.getElementById('toggleOpenrouterApiKey');
    
    if (toggleGeminiBtn) {
        toggleGeminiBtn.addEventListener('click', () => {
            toggleApiKeyVisibility('geminiApiKey', 'geminiEyeIcon');
        });
    }
    
    if (toggleOpenrouterBtn) {
        toggleOpenrouterBtn.addEventListener('click', () => {
            toggleApiKeyVisibility('openrouterApiKey', 'openrouterEyeIcon');
        });
    }
}

function toggleApiKeyVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (!input || !icon) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    icon.innerHTML = isPassword 
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
}

function setupFormValidation() {
    const inputs = [
        'geminiApiKey',
        'openrouterApiKey', 
        'targetKeyword',
        'outlineInput'
    ];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                if (inputId.includes('ApiKey')) {
                    const type = inputId.replace('ApiKey', '');
                    saveApiKey(type, input.value);
                }
                validateForm();
            });
        }
    });
}

function setupAnalysisButtons() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const competitorBtn = document.getElementById('competitorBtn');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyzeOutline);
    }
    
    if (competitorBtn) {
        competitorBtn.addEventListener('click', handleCompetitorAnalysis);
    }
}

async function handleAnalyzeOutline() {
    try {
        showLoading('Analisi dell\'outline in corso...');
        
        const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        const keyword = document.getElementById('targetKeyword').value.trim();
        const outline = document.getElementById('outlineInput').value.trim();
        const pageType = document.getElementById('pageType').value;
        
        // Initialize analyzers
        currentAnalyzer = new OutlineAnalyzer(geminiApiKey);
        
        // Generate semantic terms
        showLoading('Generazione termini semantici...');
        currentSemanticTerms = await generateSemanticTerms(openrouterApiKey, keyword, pageType);
        
        // Analyze outline coherence
        showLoading('Analisi coerenza semantica...');
        currentAnalysisResults = await currentAnalyzer.analyzeOutlineCoherence(keyword, outline);
        
        // Render results
        renderResults(currentAnalysisResults, currentSemanticTerms);
        
        // Setup outline editor
        setupOutlineEditor(currentAnalysisResults, currentSemanticTerms, keyword);
        
        hideLoading();
        showSuccess('Analisi completata con successo!');
        
    } catch (error) {
        hideLoading();
        showError(`Errore durante l'analisi: ${error.message}`);
        console.error('Analysis error:', error);
    }
}

async function handleCompetitorAnalysis() {
    try {
        showLoading('Ricerca competitor in corso...');
        
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        const keyword = document.getElementById('targetKeyword').value.trim();
        
        // Initialize competitor analyzer
        currentCompetitorAnalyzer = new CompetitorAnalyzer(openrouterApiKey);
        
        // Search for competitor outlines
        showLoading('Analisi outline dei competitor...');
        const searchResults = await currentCompetitorAnalyzer.searchCompetitorOutlines(keyword);
        
        // Analyze competitor data
        const competitorAnalysis = await currentCompetitorAnalyzer.analyzeCompetitors(keyword, searchResults.results);
        
        // Display competitor insights
        displayCompetitorInsights(competitorAnalysis);
        
        hideLoading();
        showSuccess('Analisi competitor completata!');
        
    } catch (error) {
        hideLoading();
        showError(`Errore durante l'analisi competitor: ${error.message}`);
        console.error('Competitor analysis error:', error);
    }
}

function displayCompetitorInsights(analysis) {
    const suggestionsCard = document.getElementById('suggestionsCard');
    const suggestionsContent = document.getElementById('suggestionsContent');
    
    if (!suggestionsCard || !suggestionsContent) return;
    
    suggestionsContent.innerHTML = '';
    
    // Common titles
    if (analysis.commonTitles && analysis.commonTitles.length > 0) {
        const commonTitlesDiv = document.createElement('div');
        commonTitlesDiv.className = 'p-3 bg-blue-50 dark:bg-blue-900 rounded-md';
        commonTitlesDiv.innerHTML = `
            <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Titoli più comuni nei competitor:</h4>
            <div class="space-y-1">
                ${analysis.commonTitles.slice(0, 5).map(title => `
                    <div class="text-sm text-blue-800 dark:text-blue-200">• ${title}</div>
                `).join('')}
            </div>
        `;
        suggestionsContent.appendChild(commonTitlesDiv);
    }
    
    // Opportunities
    if (analysis.opportunities && analysis.opportunities.length > 0) {
        const opportunitiesDiv = document.createElement('div');
        opportunitiesDiv.className = 'p-3 bg-green-50 dark:bg-green-900 rounded-md';
        opportunitiesDiv.innerHTML = `
            <h4 class="font-semibold text-green-900 dark:text-green-100 mb-2">Opportunità di miglioramento:</h4>
            <div class="space-y-1">
                ${analysis.opportunities.slice(0, 5).map(opportunity => `
                    <div class="text-sm text-green-800 dark:text-green-200">• ${opportunity}</div>
                `).join('')}
            </div>
        `;
        suggestionsContent.appendChild(opportunitiesDiv);
    }
    
    // Suggestions
    if (analysis.suggestions && analysis.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'p-3 bg-purple-50 dark:bg-purple-900 rounded-md';
        suggestionsDiv.innerHTML = `
            <h4 class="font-semibold text-purple-900 dark:text-purple-100 mb-2">Suggerimenti strategici:</h4>
            <div class="space-y-1">
                ${analysis.suggestions.slice(0, 5).map(suggestion => `
                    <div class="text-sm text-purple-800 dark:text-purple-200">• ${suggestion}</div>
                `).join('')}
            </div>
        `;
        suggestionsContent.appendChild(suggestionsDiv);
    }
    
    suggestionsCard.classList.remove('hidden');
}

function setupSemanticTermsHandlers() {
    // These will be set up dynamically when semantic terms are loaded
    // Implementation will be in the resultsRenderer.js
}

// Export functions that might be needed by other modules
export { currentAnalyzer, currentCompetitorAnalyzer, currentSemanticTerms, currentAnalysisResults };