import { optimizeOutline, generateSubheadingSuggestion, generateOptimizedOutline, generateSmartSubheadingSuggestions } from '../api/openrouter.js';
import { showLoading, hideLoading, showError, showSuccess } from '../utils/ui.js';
import { updateScoreDisplay, updateTermUsageColors } from './resultsRenderer.js';
import { saveOutline } from '../utils/storage.js';

let currentOutlineItems = [];
let currentKeyword = '';
let currentSemanticTerms = [];
let currentAnalyzer = null;

export function setupOutlineEditor(analysisResults, semanticTerms, keyword) {
    currentOutlineItems = analysisResults.headingScores.map(score => ({
        id: generateId(),
        level: score.heading.level,
        text: score.heading.text,
        original: score.heading.original,
        score: score.score,
        scoreLevel: score.level,
        isModified: false
    }));
    
    currentKeyword = keyword;
    currentSemanticTerms = semanticTerms;
    
    renderOutlineEditor();
    setupEditorEventListeners();
    
    // Initial update of term usage colors
    const currentOutlineText = getCurrentOutlineText();
    updateTermUsageColors(currentOutlineText);
}

function renderOutlineEditor() {
    const outlineEditor = document.getElementById('outlineEditor');
    const editableOutline = document.getElementById('editableOutline');
    
    if (!outlineEditor || !editableOutline) return;
    
    editableOutline.innerHTML = '';
    
    currentOutlineItems.forEach(item => {
        const itemElement = createOutlineItemElement(item);
        editableOutline.appendChild(itemElement);
    });
    
    outlineEditor.classList.remove('hidden');
}

function createOutlineItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'outline-item';
    itemDiv.dataset.id = item.id;
    
    itemDiv.innerHTML = `
        <div class="flex-1 flex items-center space-x-3">
            <div class="flex-shrink-0">
                <span class="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    ${item.level}
                </span>
            </div>
            <div class="flex-1">
                <input type="text" 
                       value="${item.text}" 
                       class="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white font-medium"
                       placeholder="Inserisci il titolo">
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${item.isModified ? 'Modificato' : 'Originale'}
                </div>
            </div>
        </div>
        <div class="flex items-center space-x-3">
            <div class="text-right">
                <div class="text-lg font-bold score-${item.scoreLevel}" style="color: ${getScoreColor(item.scoreLevel)}">
                    ${Math.round(item.score * 100)}%
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    ${getLevelLabel(item.scoreLevel)}
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ai-suggest-btn" title="Suggerisci con AI">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                </button>
                <button class="p-1 hover:bg-green-200 dark:hover:bg-green-600 rounded confirm-edit-btn hidden" title="Conferma modifica e ricalcola">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </button>
                <button class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded edit-btn" title="Modifica">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded delete-btn" title="Elimina">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return itemDiv;
}

function setupEditorEventListeners() {
    const addSubheadingBtn = document.getElementById('addSubheadingBtn');
    const saveOutlineBtn = document.getElementById('saveOutlineBtn');
    const optimizeCompleteOutlineBtn = document.getElementById('optimizeCompleteOutlineBtn');
    const smartSuggestionsBtn = document.getElementById('smartSuggestionsBtn');
    const editableOutline = document.getElementById('editableOutline');
    
    if (addSubheadingBtn) {
        addSubheadingBtn.addEventListener('click', addNewSubheading);
    }
    
    if (saveOutlineBtn) {
        saveOutlineBtn.addEventListener('click', saveCurrentOutline);
    }
    
    if (optimizeCompleteOutlineBtn) {
        optimizeCompleteOutlineBtn.addEventListener('click', optimizeCompleteOutline);
    }
    
    if (smartSuggestionsBtn) {
        smartSuggestionsBtn.addEventListener('click', showSmartSuggestions);
    }
    
    if (editableOutline) {
        editableOutline.addEventListener('click', handleOutlineClick);
        editableOutline.addEventListener('input', handleOutlineInput);
        editableOutline.addEventListener('keydown', handleOutlineKeydown);
        editableOutline.addEventListener('blur', handleOutlineBlur, true);
    }
}

function handleOutlineClick(event) {
    const target = event.target;
    
    if (target.classList.contains('ai-suggest-btn') || target.closest('.ai-suggest-btn')) {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            suggestWithAI(itemElement);
        }
    } else if (target.classList.contains('confirm-edit-btn') || target.closest('.confirm-edit-btn')) {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            confirmEdit(itemElement);
        }
    } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            toggleEditMode(itemElement);
        }
    } else if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            deleteOutlineItem(itemElement);
        }
    }
}

// Debounce function for input handling
let inputTimeout = null;

async function handleOutlineInput(event) {
    const target = event.target;
    
    if (target.tagName === 'INPUT') {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            const itemId = itemElement.dataset.id;
            const item = currentOutlineItems.find(i => i.id === itemId);
            
            // Show confirm button if text has changed
            const confirmBtn = itemElement.querySelector('.confirm-edit-btn');
            if (confirmBtn && item && target.value.trim() !== item.text) {
                confirmBtn.classList.remove('hidden');
            } else if (confirmBtn) {
                confirmBtn.classList.add('hidden');
            }
            
            // Clear existing timeout
            if (inputTimeout) {
                clearTimeout(inputTimeout);
            }
            
            // Set new timeout for debounced update (disabled for manual confirmation)
            // inputTimeout = setTimeout(async () => {
            //     await updateOutlineItem(itemElement, target.value);
            // }, 1500);
        }
    }
}

async function handleOutlineKeydown(event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
        const itemElement = event.target.closest('.outline-item');
        if (itemElement) {
            await confirmEdit(itemElement);
        }
    }
}

async function handleOutlineBlur(event) {
    if (event.target.tagName === 'INPUT') {
        const itemElement = event.target.closest('.outline-item');
        if (itemElement) {
            // Hide confirm button on blur if no changes
            const confirmBtn = itemElement.querySelector('.confirm-edit-btn');
            if (confirmBtn) {
                // Optional: auto-confirm on blur
                // await confirmEdit(itemElement);
            }
        }
    }
}

// Track items currently being updated to prevent multiple simultaneous updates
const updatingItems = new Set();

async function confirmEdit(itemElement) {
    const input = itemElement.querySelector('input');
    const confirmBtn = itemElement.querySelector('.confirm-edit-btn');
    
    if (input && confirmBtn) {
        await updateOutlineItem(itemElement, input.value);
        confirmBtn.classList.add('hidden');
    }
}

async function updateOutlineItem(itemElement, newText) {
    const itemId = itemElement.dataset.id;
    const item = currentOutlineItems.find(i => i.id === itemId);
    
    if (!item || item.text === newText || !newText.trim()) return;
    
    // Prevent multiple simultaneous updates of the same item
    if (updatingItems.has(itemId)) return;
    updatingItems.add(itemId);
    
    const oldScore = item.score;
    item.text = newText.trim();
    item.isModified = true;
    
    try {
        // Recalculate score for the updated heading
        if (currentAnalyzer && currentKeyword) {
            showLoading('Ricalcolo punteggio...');
            const newScoreData = await currentAnalyzer.recalculateHeadingScore(currentKeyword, item.text);
            
            item.score = newScoreData.score;
            item.scoreLevel = newScoreData.level;
            
            // Update the display
            updateItemDisplay(itemElement, item);
            
            // Show score change notification with detailed indicator
            showScoreChangeIndicator(itemElement, item.score, oldScore);
            
            // Update term usage colors based on new outline
            const currentOutlineText = getCurrentOutlineText();
            updateTermUsageColors(currentOutlineText);
            
            hideLoading();
        }
    } catch (error) {
        hideLoading();
        showError(`Errore nel ricalcolo del punteggio: ${error.message}`);
    } finally {
        updatingItems.delete(itemId);
    }
}

function updateItemDisplay(itemElement, item) {
    const scoreValue = itemElement.querySelector('.text-lg');
    const scoreLabels = itemElement.querySelectorAll('.text-xs');
    const scoreLabel = scoreLabels[scoreLabels.length - 1]; // Get the last one (score label)
    
    if (scoreValue) {
        scoreValue.textContent = Math.round(item.score * 100) + '%';
        scoreValue.className = `text-lg font-bold score-${item.scoreLevel}`;
        
        // Force color application
        const colorMap = {
            'excellent': '#10b981',
            'good': '#3b82f6', 
            'fair': '#f59e0b',
            'poor': '#ef4444'
        };
        if (colorMap[item.scoreLevel]) {
            scoreValue.style.color = colorMap[item.scoreLevel];
        }
    }
    
    if (scoreLabel) {
        scoreLabel.textContent = getLevelLabel(item.scoreLevel);
    }
    
    // Update modified indicator
    const modifiedIndicator = itemElement.querySelector('.text-xs.text-gray-500');
    if (modifiedIndicator) {
        modifiedIndicator.textContent = item.isModified ? 'Modificato' : 'Originale';
    }
}

function addNewSubheading() {
    const newItem = {
        id: generateId(),
        level: 'H3',
        text: 'Nuovo sottotitolo',
        original: '',
        score: 0,
        scoreLevel: 'poor',
        isModified: true
    };
    
    currentOutlineItems.push(newItem);
    
    const editableOutline = document.getElementById('editableOutline');
    if (editableOutline) {
        const itemElement = createOutlineItemElement(newItem);
        editableOutline.appendChild(itemElement);
        
        // Focus on the new input
        const input = itemElement.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update term usage colors
        const currentOutlineText = getCurrentOutlineText();
        updateTermUsageColors(currentOutlineText);
    }
}

function deleteOutlineItem(itemElement) {
    const itemId = itemElement.dataset.id;
    
    if (confirm('Sei sicuro di voler eliminare questo titolo?')) {
        // Remove from data
        currentOutlineItems = currentOutlineItems.filter(item => item.id !== itemId);
        
        // Remove from DOM
        itemElement.remove();
        
        // Update term usage colors
        const currentOutlineText = getCurrentOutlineText();
        updateTermUsageColors(currentOutlineText);
        
        showSuccess('Titolo eliminato');
    }
}

function toggleEditMode(itemElement) {
    const input = itemElement.querySelector('input');
    if (input) {
        input.focus();
        input.select();
    }
}

async function saveCurrentOutline() {
    try {
        showLoading('Salvataggio outline...');
        
        const outlineData = {
            keyword: currentKeyword,
            items: currentOutlineItems,
            timestamp: new Date().toISOString()
        };
        
        saveOutline(outlineData);
        
        // Copy to clipboard
        const outlineText = currentOutlineItems.map(item => `${item.level}: ${item.text}`).join('\n');
        await copyToClipboard(outlineText);
        
        hideLoading();
        showSuccess('Outline salvata e copiata negli appunti!');
        
    } catch (error) {
        hideLoading();
        showError(`Errore nel salvataggio: ${error.message}`);
    }
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    } catch (error) {
        console.warn('Could not copy to clipboard:', error);
        throw new Error('Impossibile copiare negli appunti');
    }
}

async function optimizeCompleteOutline() {
    try {
        showLoading('Ottimizzazione completa outline con Claude Sonnet 4...');
        
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        if (!openrouterApiKey) {
            throw new Error('Chiave API OpenRouter mancante');
        }
        
        const currentOutlineText = currentOutlineItems.map(item => `${item.level}: ${item.text}`).join('\n');
        
        const optimizedOutline = await generateOptimizedOutline(
            openrouterApiKey,
            currentKeyword,
            currentOutlineText,
            currentSemanticTerms
        );
        
        hideLoading();
        showOptimizedOutlineModal(optimizedOutline);
        
    } catch (error) {
        hideLoading();
        showError(`Errore nell'ottimizzazione: ${error.message}`);
    }
}

async function showSmartSuggestions() {
    try {
        showLoading('Generando suggerimenti intelligenti...');
        
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        if (!openrouterApiKey) {
            throw new Error('Chiave API OpenRouter mancante');
        }
        
        const currentOutlineText = currentOutlineItems.map(item => `${item.level}: ${item.text}`).join('\n');
        
        const suggestions = await generateSmartSubheadingSuggestions(
            openrouterApiKey,
            currentKeyword,
            currentOutlineText,
            currentSemanticTerms,
            5
        );
        
        hideLoading();
        showSmartSuggestionsModal(suggestions);
        
    } catch (error) {
        hideLoading();
        showError(`Errore nei suggerimenti: ${error.message}`);
    }
}

function showOptimizedOutlineModal(optimizedOutline) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto';
    
    modalContent.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">🚀 Outline Ottimizzata</h3>
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nuova outline ottimizzata:</label>
            <textarea class="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white font-mono text-sm" rows="20">${optimizedOutline}</textarea>
        </div>
        <div class="flex space-x-3 justify-end">
            <button id="cancelOptimization" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Annulla</button>
            <button id="applyOptimization" class="btn-primary">Applica Outline Ottimizzata</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#cancelOptimization').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#applyOptimization').addEventListener('click', () => {
        const newOutline = modal.querySelector('textarea').value.trim();
        if (newOutline) {
            applyNewCompleteOutline(newOutline);
        }
        document.body.removeChild(modal);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function showSmartSuggestionsModal(suggestions) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto';
    
    let suggestionsHTML = '';
    if (suggestions.suggestions && suggestions.suggestions.length > 0) {
        suggestionsHTML = suggestions.suggestions.map((suggestion, index) => `
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer suggestion-item" data-index="${index}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">${suggestion.level}</span>
                            <h4 class="font-semibold text-gray-900 dark:text-white">${suggestion.title}</h4>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${suggestion.description}</p>
                        <div class="flex flex-wrap gap-1">
                            ${suggestion.semanticTerms ? suggestion.semanticTerms.map(term => `<span class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">${term}</span>`).join('') : ''}
                        </div>
                    </div>
                    <button class="ml-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm add-suggestion-btn" data-index="${index}">
                        Aggiungi
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        suggestionsHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Nessun suggerimento disponibile</p>';
    }
    
    modalContent.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">💡 Suggerimenti Intelligenti</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Seleziona i subheading che vuoi aggiungere alla tua outline:</p>
        <div class="space-y-3 mb-6">
            ${suggestionsHTML}
        </div>
        <div class="flex justify-end">
            <button id="closeSuggestions" class="btn-secondary">Chiudi</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#closeSuggestions').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add suggestion buttons
    modal.querySelectorAll('.add-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const suggestion = suggestions.suggestions[index];
            addSuggestionToOutline(suggestion);
            btn.textContent = '✓ Aggiunto';
            btn.disabled = true;
            btn.classList.remove('bg-green-600', 'hover:bg-green-700');
            btn.classList.add('bg-gray-400');
        });
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function applyNewCompleteOutline(outlineText) {
    try {
        // Parse the new outline
        const lines = outlineText.split('\n').filter(line => line.trim());
        const newItems = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            let level = 'H2';
            let text = trimmed;
            
            // Parse heading level and text
            if (trimmed.match(/^H[1-6]:/i)) {
                level = trimmed.substring(0, 2).toUpperCase();
                text = trimmed.replace(/^H[1-6]:\s*/i, '').trim();
            } else if (trimmed.startsWith('###')) {
                level = 'H3';
                text = trimmed.replace(/^###\s*/, '').trim();
            } else if (trimmed.startsWith('##')) {
                level = 'H2';
                text = trimmed.replace(/^##\s*/, '').trim();
            } else if (trimmed.startsWith('#')) {
                level = 'H1';
                text = trimmed.replace(/^#\s*/, '').trim();
            }
            
            if (text) {
                newItems.push({
                    id: generateId(),
                    level,
                    text,
                    original: '',
                    score: 0,
                    scoreLevel: 'fair',
                    isModified: true
                });
            }
        }
        
        // Replace current items
        currentOutlineItems = newItems;
        
        // Re-render the editor
        renderOutlineEditor();
        
        // Update term usage colors
        const currentOutlineText = getCurrentOutlineText();
        updateTermUsageColors(currentOutlineText);
        
        showSuccess('Outline ottimizzata applicata con successo!');
        
    } catch (error) {
        showError(`Errore nell'applicazione dell'outline: ${error.message}`);
    }
}

async function addSuggestionToOutline(suggestion) {
    const newItem = {
        id: generateId(),
        level: suggestion.level,
        text: suggestion.title,
        original: '',
        score: 0,
        scoreLevel: 'poor',
        isModified: true
    };
    
    currentOutlineItems.push(newItem);
    
    // Re-render the editor to show the new item
    const editableOutline = document.getElementById('editableOutline');
    if (editableOutline) {
        const itemElement = createOutlineItemElement(newItem);
        editableOutline.appendChild(itemElement);
        
        // Calculate score automatically for the new item
        try {
            if (currentAnalyzer && currentKeyword) {
                showLoading('Calcolo punteggio per nuovo subheading...');
                const scoreData = await currentAnalyzer.recalculateHeadingScore(currentKeyword, newItem.text);
                
                newItem.score = scoreData.score;
                newItem.scoreLevel = scoreData.level;
                
                // Update the display
                updateItemDisplay(itemElement, newItem);
                
                hideLoading();
            }
        } catch (error) {
            hideLoading();
            console.warn('Could not calculate score for new subheading:', error);
        }
        
        // Update term usage colors
        const currentOutlineText = getCurrentOutlineText();
        updateTermUsageColors(currentOutlineText);
    }
    
    showSuccess(`Subheading "${suggestion.title}" aggiunto!`);
}

function getLevelLabel(level) {
    const labels = {
        'excellent': 'Eccellente',
        'good': 'Buono',
        'fair': 'Discreto',
        'poor': 'Scarso'
    };
    
    return labels[level] || level;
}

function getScoreColor(level) {
    const colorMap = {
        'excellent': '#10b981',
        'good': '#3b82f6', 
        'fair': '#f59e0b',
        'poor': '#ef4444'
    };
    
    return colorMap[level] || '#6b7280'; // Default gray
}

async function suggestWithAI(itemElement) {
    const itemId = itemElement.dataset.id;
    const item = currentOutlineItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    try {
        showLoading('Generando suggerimento con AI...');
        
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        if (!openrouterApiKey) {
            throw new Error('Chiave API OpenRouter mancante');
        }
        
        const suggestion = await generateSubheadingSuggestion(
            openrouterApiKey,
            currentKeyword,
            item.text,
            item.level,
            getCurrentOutlineText()
        );
        
        hideLoading();
        showAISuggestionModal(itemElement, suggestion);
        
    } catch (error) {
        hideLoading();
        showError(`Errore nel suggerimento AI: ${error.message}`);
    }
}

function showScoreChangeIndicator(itemElement, newScore, oldScore) {
    const scoreDiv = itemElement.querySelector('.text-right');
    if (!scoreDiv) return;
    
    const difference = Math.round((newScore - oldScore) * 100);
    if (difference === 0) return;
    
    const sign = difference > 0 ? '+' : '';
    const indicator = document.createElement('div');
    indicator.className = `score-change-indicator ${
        difference > 0 ? 'score-change-positive' : 'score-change-negative'
    }`;
    indicator.textContent = `${sign}${difference}%`;
    
    scoreDiv.appendChild(indicator);
    
    // Remove indicator after 4 seconds
    setTimeout(() => {
        if (indicator.parentElement) {
            indicator.remove();
        }
    }, 4000);
}

function getCurrentOutlineText() {
    return currentOutlineItems.map(item => item.text).join(' ');
}

function showAISuggestionModal(itemElement, suggestion) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4';
    
    modalContent.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suggerimento AI</h3>
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titolo suggerito:</label>
            <textarea class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" rows="3">${suggestion}</textarea>
        </div>
        <div class="flex space-x-3 justify-end">
            <button id="cancelSuggestion" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Annulla</button>
            <button id="applySuggestion" class="btn-primary">Applica</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#cancelSuggestion').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#applySuggestion').addEventListener('click', () => {
        const newText = modal.querySelector('textarea').value.trim();
        if (newText) {
            const input = itemElement.querySelector('input');
            if (input) {
                input.value = newText;
                input.dispatchEvent(new Event('input'));
            }
        }
        document.body.removeChild(modal);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export function setCurrentAnalyzer(analyzer) {
    currentAnalyzer = analyzer;
}

export function getCurrentOutline() {
    return currentOutlineItems;
}

export function exportOutline() {
    const outline = currentOutlineItems.map(item => `${item.level}: ${item.text}`).join('\n');
    
    const blob = new Blob([outline], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `outline-${currentKeyword.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showSuccess('Outline esportata!');
}