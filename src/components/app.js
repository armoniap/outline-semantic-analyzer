import { loadSavedApiKeys } from '../utils/storage.js';
import { validateForm } from '../utils/validation.js';

export function initializeApp() {
    // Load saved API keys
    loadSavedApiKeys();
    
    // Initial form validation
    validateForm();
    
    console.log('✅ Outline Semantic Analyzer inizializzato');
}