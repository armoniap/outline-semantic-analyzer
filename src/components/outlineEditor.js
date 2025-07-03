import { optimizeOutline } from '../api/openrouter.js';
import { showLoading, hideLoading, showError, showSuccess } from '../utils/ui.js';
import { updateScoreDisplay } from './resultsRenderer.js';
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
                <div class="text-lg font-bold score-${item.scoreLevel}">
                    ${Math.round(item.score * 100)}%
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    ${getLevelLabel(item.scoreLevel)}
                </div>
            </div>
            <div class="flex space-x-2">
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
    const editableOutline = document.getElementById('editableOutline');
    
    if (addSubheadingBtn) {
        addSubheadingBtn.addEventListener('click', addNewSubheading);
    }
    
    if (saveOutlineBtn) {
        saveOutlineBtn.addEventListener('click', saveCurrentOutline);
    }
    
    if (editableOutline) {
        editableOutline.addEventListener('click', handleOutlineClick);
        editableOutline.addEventListener('input', handleOutlineInput);
    }
}

function handleOutlineClick(event) {
    const target = event.target;
    
    if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
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

async function handleOutlineInput(event) {
    const target = event.target;
    
    if (target.tagName === 'INPUT') {
        const itemElement = target.closest('.outline-item');
        if (itemElement) {
            await updateOutlineItem(itemElement, target.value);
        }
    }
}

async function updateOutlineItem(itemElement, newText) {
    const itemId = itemElement.dataset.id;
    const item = currentOutlineItems.find(i => i.id === itemId);
    
    if (!item || item.text === newText) return;
    
    const oldScore = item.score;
    item.text = newText;
    item.isModified = true;
    
    try {
        // Recalculate score for the updated heading
        if (currentAnalyzer) {
            showLoading('Ricalcolo punteggio...');
            const newScoreData = await currentAnalyzer.recalculateHeadingScore(currentKeyword, newText);
            
            item.score = newScoreData.score;
            item.scoreLevel = newScoreData.level;
            
            // Update the display
            updateItemDisplay(itemElement, item);
            
            // Show score change notification
            updateScoreDisplay(item.score, oldScore);
            
            hideLoading();
        }
    } catch (error) {
        hideLoading();
        showError(`Errore nel ricalcolo del punteggio: ${error.message}`);
    }
}

function updateItemDisplay(itemElement, item) {
    const scoreDiv = itemElement.querySelector('.score-' + item.scoreLevel.replace(item.scoreLevel, ''));
    const scoreValue = itemElement.querySelector('.text-lg');
    const scoreLabel = itemElement.querySelector('.text-xs');
    
    if (scoreValue) {
        scoreValue.textContent = Math.round(item.score * 100) + '%';
        scoreValue.className = `text-lg font-bold score-${item.scoreLevel}`;
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
    }
}

function deleteOutlineItem(itemElement) {
    const itemId = itemElement.dataset.id;
    
    if (confirm('Sei sicuro di voler eliminare questo titolo?')) {
        // Remove from data
        currentOutlineItems = currentOutlineItems.filter(item => item.id !== itemId);
        
        // Remove from DOM
        itemElement.remove();
        
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
        
        hideLoading();
        showSuccess('Outline salvata con successo!');
        
    } catch (error) {
        hideLoading();
        showError(`Errore nel salvataggio: ${error.message}`);
    }
}

async function optimizeCurrentOutline() {
    try {
        showLoading('Ottimizzazione outline con AI...');
        
        const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
        const currentOutlineText = currentOutlineItems.map(item => `${item.level}: ${item.text}`).join('\n');
        
        const optimization = await optimizeOutline(
            openrouterApiKey,
            currentOutlineText,
            currentKeyword,
            currentSemanticTerms,
            null // competitor insights could be added here
        );
        
        // Apply optimization suggestions
        if (optimization.optimizedOutline) {
            applyOptimizedOutline(optimization.optimizedOutline);
        }
        
        hideLoading();
        showSuccess('Outline ottimizzata con successo!');
        
    } catch (error) {
        hideLoading();
        showError(`Errore nell'ottimizzazione: ${error.message}`);
    }
}

function applyOptimizedOutline(optimizedOutline) {
    // This would update the current outline items with the optimized suggestions
    // Implementation depends on the exact structure returned by the AI
    console.log('Applying optimized outline:', optimizedOutline);
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