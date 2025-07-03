import { animateValue, fadeIn } from '../utils/ui.js';

export function renderResults(analysisResults, semanticTerms) {
    renderScoreCard(analysisResults);
    renderSemanticTerms(semanticTerms);
    renderHeadingBreakdown(analysisResults);
}

function renderScoreCard(analysisResults) {
    const scoreCard = document.getElementById('scoreCard');
    const scoreValue = document.getElementById('scoreValue');
    const scoreLabel = document.getElementById('scoreLabel');
    
    if (!scoreCard || !scoreValue || !scoreLabel) return;
    
    // Calculate percentage score
    const percentageScore = Math.round(analysisResults.overallScore * 100);
    
    // Update score with animation
    animateValue(scoreValue, 0, percentageScore, 1500);
    
    // Update label and styling
    scoreLabel.textContent = analysisResults.analysis;
    
    // Apply color based on score level
    scoreValue.className = `text-4xl font-bold mb-2 score-${analysisResults.overallLevel}`;
    
    // Show card with animation
    scoreCard.classList.remove('hidden');
    fadeIn(scoreCard);
}

function renderSemanticTerms(semanticTerms) {
    const semanticTermsCard = document.getElementById('semanticTermsCard');
    const semanticTermsContent = document.getElementById('semanticTermsContent');
    
    if (!semanticTermsCard || !semanticTermsContent || !semanticTerms) return;
    
    semanticTermsContent.innerHTML = '';
    
    // Add legend
    const legend = createTermsLegend();
    semanticTermsContent.appendChild(legend);
    
    // Group terms by type
    const termsByType = {};
    semanticTerms.forEach(term => {
        if (!termsByType[term.type]) {
            termsByType[term.type] = [];
        }
        termsByType[term.type].push(term);
    });
    
    // Create term groups
    Object.keys(termsByType).forEach(type => {
        const typeDiv = document.createElement('div');
        typeDiv.className = 'mb-4';
        
        const typeLabel = document.createElement('h4');
        typeLabel.className = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';
        typeLabel.textContent = getTypeLabel(type);
        
        const termsContainer = document.createElement('div');
        termsContainer.className = 'flex flex-wrap gap-2';
        
        termsByType[type].forEach(term => {
            const termElement = document.createElement('span');
            termElement.className = `semantic-term unused`;
            termElement.textContent = term.term;
            termElement.dataset.term = term.term;
            termElement.dataset.type = term.type;
            termElement.dataset.relevance = term.relevance;
            
            // Add click handler for term selection
            termElement.addEventListener('click', () => {
                toggleTermSelection(termElement);
            });
            
            termsContainer.appendChild(termElement);
        });
        
        typeDiv.appendChild(typeLabel);
        typeDiv.appendChild(termsContainer);
        semanticTermsContent.appendChild(typeDiv);
    });
    
    // Show card with animation
    semanticTermsCard.classList.remove('hidden');
    fadeIn(semanticTermsCard);
}

function renderHeadingBreakdown(analysisResults) {
    const suggestionsCard = document.getElementById('suggestionsCard');
    const suggestionsContent = document.getElementById('suggestionsContent');
    
    if (!suggestionsCard || !suggestionsContent) return;
    
    suggestionsContent.innerHTML = '';
    
    // Create heading breakdown
    const headingBreakdown = document.createElement('div');
    headingBreakdown.className = 'space-y-3';
    
    const breakdownTitle = document.createElement('h4');
    breakdownTitle.className = 'font-semibold text-gray-900 dark:text-white mb-3';
    breakdownTitle.textContent = 'Analisi dei Titoli';
    
    headingBreakdown.appendChild(breakdownTitle);
    
    analysisResults.headingScores.forEach((headingScore, index) => {
        const headingDiv = document.createElement('div');
        headingDiv.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md';
        
        const headingInfo = document.createElement('div');
        headingInfo.className = 'flex-1';
        
        const headingText = document.createElement('div');
        headingText.className = 'font-medium text-gray-900 dark:text-white';
        headingText.textContent = headingScore.heading.text;
        
        const headingLevel = document.createElement('div');
        headingLevel.className = 'text-sm text-gray-500 dark:text-gray-400';
        headingLevel.textContent = headingScore.heading.level;
        
        headingInfo.appendChild(headingText);
        headingInfo.appendChild(headingLevel);
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'text-right';
        
        const scoreValue = document.createElement('div');
        scoreValue.className = `text-lg font-bold score-${headingScore.level}`;
        scoreValue.textContent = Math.round(headingScore.score * 100) + '%';
        
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'text-xs text-gray-500 dark:text-gray-400';
        scoreLabel.textContent = getLevelLabel(headingScore.level);
        
        scoreDiv.appendChild(scoreValue);
        scoreDiv.appendChild(scoreLabel);
        
        headingDiv.appendChild(headingInfo);
        headingDiv.appendChild(scoreDiv);
        
        headingBreakdown.appendChild(headingDiv);
    });
    
    suggestionsContent.appendChild(headingBreakdown);
    
    // Show card with animation
    suggestionsCard.classList.remove('hidden');
    fadeIn(suggestionsCard);
}

function getTypeLabel(type) {
    const labels = {
        'synonym': 'Sinonimi',
        'related': 'Termini Correlati',
        'longtail': 'Long-tail Keywords',
        'technical': 'Termini Tecnici'
    };
    
    return labels[type] || type;
}

function getRelevanceClass(relevance) {
    const classes = {
        'high': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        'medium': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        'low': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };
    
    return classes[relevance] || classes.medium;
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

function createTermsLegend() {
    const legend = document.createElement('div');
    legend.className = 'terms-legend';
    
    const legendTitle = document.createElement('h4');
    legendTitle.className = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3';
    legendTitle.textContent = 'Legenda Colori Termini';
    
    const legendItems = [
        { class: 'unused', label: 'Non utilizzato', color: 'bg-gray-100 dark:bg-gray-700' },
        { class: 'selected', label: 'Selezionato', color: 'bg-blue-100 dark:bg-blue-900' },
        { class: 'used', label: 'Utilizzato nell\'outline', color: 'bg-green-100 dark:bg-green-900' },
        { class: 'excluded', label: 'Escluso', color: 'bg-red-100 dark:bg-red-900' }
    ];
    
    legend.appendChild(legendTitle);
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = `legend-color ${item.color}`;
        
        const label = document.createElement('span');
        label.className = 'text-xs text-gray-600 dark:text-gray-400';
        label.textContent = item.label;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    return legend;
}

function toggleTermSelection(termElement) {
    if (termElement.classList.contains('excluded')) {
        // Remove from excluded
        termElement.classList.remove('excluded');
        termElement.classList.add('unused');
    } else if (termElement.classList.contains('selected')) {
        // Mark as excluded
        termElement.classList.remove('selected');
        termElement.classList.add('excluded');
    } else if (termElement.classList.contains('used')) {
        // Mark as excluded
        termElement.classList.remove('used');
        termElement.classList.add('excluded');
    } else {
        // Mark as selected
        termElement.classList.remove('unused');
        termElement.classList.add('selected');
    }
}

export function getSelectedTerms() {
    const selectedTerms = [];
    document.querySelectorAll('.semantic-term.selected').forEach(element => {
        selectedTerms.push({
            term: element.dataset.term,
            type: element.dataset.type,
            relevance: element.dataset.relevance
        });
    });
    
    return selectedTerms;
}

export function getExcludedTerms() {
    const excludedTerms = [];
    document.querySelectorAll('.semantic-term.excluded').forEach(element => {
        excludedTerms.push({
            term: element.dataset.term,
            type: element.dataset.type,
            relevance: element.dataset.relevance
        });
    });
    
    return excludedTerms;
}

export function updateScoreDisplay(newScore, oldScore) {
    const scoreValue = document.getElementById('scoreValue');
    if (!scoreValue) return;
    
    const percentageScore = Math.round(newScore * 100);
    const difference = Math.round((newScore - oldScore) * 100);
    
    // Update score with animation
    animateValue(scoreValue, Math.round(oldScore * 100), percentageScore, 800);
    
    // Show difference notification
    if (difference !== 0) {
        const sign = difference > 0 ? '+' : '';
        const message = `${sign}${difference}%`;
        
        // Create temporary indicator
        const indicator = document.createElement('div');
        indicator.className = `score-change-indicator ${
            difference > 0 ? 'score-change-positive' : 'score-change-negative'
        }`;
        indicator.textContent = message;
        
        scoreValue.parentElement.appendChild(indicator);
        
        // Remove indicator after 3 seconds
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.remove();
            }
        }, 3000);
    }
}

export function updateTermUsageColors(outlineText) {
    const allTerms = document.querySelectorAll('.semantic-term');
    
    allTerms.forEach(termElement => {
        const termText = termElement.dataset.term.toLowerCase();
        const isUsed = outlineText.toLowerCase().includes(termText);
        
        // Don't change if already selected or excluded
        if (!termElement.classList.contains('selected') && !termElement.classList.contains('excluded')) {
            termElement.classList.remove('unused', 'used');
            termElement.classList.add(isUsed ? 'used' : 'unused');
        }
    });
}