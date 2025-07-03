import './styles.css';
import { initializeApp } from './components/app.js';
import { setupDarkMode } from './utils/darkMode.js';
import { setupEventListeners } from './components/eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initializeApp();
    
    // Setup dark mode
    setupDarkMode();
    
    // Setup event listeners
    setupEventListeners();
    
    // Remove loading class
    document.body.classList.add('loaded');
});