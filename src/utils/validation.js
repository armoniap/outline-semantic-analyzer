export function validateForm() {
    const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
    const openrouterApiKey = document.getElementById('openrouterApiKey').value.trim();
    const targetKeyword = document.getElementById('targetKeyword').value.trim();
    const outlineInput = document.getElementById('outlineInput').value.trim();
    
    const isValidGeminiKey = geminiApiKey.length >= 20 && /^[A-Za-z0-9_-]+$/.test(geminiApiKey);
    const isValidOpenrouterKey = openrouterApiKey.length >= 20;
    const isValidKeyword = targetKeyword.length > 0 && targetKeyword.length <= 100;
    const isValidOutline = outlineInput.length >= 20;
    
    const isValid = isValidGeminiKey && isValidOpenrouterKey && isValidKeyword && isValidOutline;
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const competitorBtn = document.getElementById('competitorBtn');
    const helpElement = document.getElementById('analyzeHelp');
    
    analyzeBtn.disabled = !isValid;
    competitorBtn.disabled = !isValid;
    
    // Update help text
    let helpText = '';
    if (!isValidGeminiKey) {
        helpText = 'API key Gemini deve essere di almeno 20 caratteri alfanumerici.';
    } else if (!isValidOpenrouterKey) {
        helpText = 'API key OpenRouter è richiesta.';
    } else if (!isValidKeyword) {
        helpText = 'Parola chiave richiesta (max 100 caratteri).';
    } else if (!isValidOutline) {
        helpText = 'Outline deve contenere almeno 20 caratteri.';
    }
    
    if (isValid) {
        helpElement.classList.add('hidden');
    } else {
        helpElement.textContent = helpText;
        helpElement.classList.remove('hidden');
    }
    
    // Update input validation styles
    updateInputValidation(document.getElementById('geminiApiKey'), isValidGeminiKey);
    updateInputValidation(document.getElementById('openrouterApiKey'), isValidOpenrouterKey);
    updateInputValidation(document.getElementById('targetKeyword'), isValidKeyword);
    updateInputValidation(document.getElementById('outlineInput'), isValidOutline);
    
    return isValid;
}

function updateInputValidation(input, isValid) {
    if (!input) return;
    
    input.classList.remove('border-red-500', 'border-green-500', 'border-gray-300', 'dark:border-gray-600');
    
    if (input.value.trim() === '') {
        input.classList.add('border-gray-300', 'dark:border-gray-600');
    } else if (isValid) {
        input.classList.add('border-green-500');
    } else {
        input.classList.add('border-red-500');
    }
}

export function validateApiKey(apiKey, type = 'gemini') {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    
    if (type === 'gemini') {
        return apiKey.length >= 20 && /^[A-Za-z0-9_-]+$/.test(apiKey);
    } else if (type === 'openrouter') {
        return apiKey.length >= 20;
    }
    
    return false;
}