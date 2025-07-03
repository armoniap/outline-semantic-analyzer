export function showLoading(message = 'Caricamento in corso...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageElement = document.getElementById('loadingMessage');
    
    if (overlay && messageElement) {
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

export function showError(message) {
    showNotification(message, 'error');
}

export function showSuccess(message) {
    showNotification(message, 'success');
}

export function showWarning(message) {
    showNotification(message, 'warning');
}

export function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 animate-slide-up ${getNotificationClasses(type)}`;
    
    // Add icon and message
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button class="inline-flex rounded-md hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <span class="sr-only">Chiudi</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationClasses(type) {
    const classes = {
        success: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
        error: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
        info: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800'
    };
    
    return classes[type] || classes.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: `<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>`,
        error: `<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>`,
        warning: `<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>`,
        info: `<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>`
    };
    
    return icons[type] || icons.info;
}

export function createProgressBar(container, progress = 0) {
    const progressBar = document.createElement('div');
    progressBar.className = 'w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700';
    progressBar.innerHTML = `
        <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
    `;
    
    container.appendChild(progressBar);
    return progressBar;
}

export function updateProgressBar(progressBar, progress) {
    const fill = progressBar.querySelector('div');
    if (fill) {
        fill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
}

export function animateValue(element, start, end, duration = 1000) {
    const startTimestamp = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * progress;
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
}

export function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

export function fadeOut(element, duration = 300) {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    
    setTimeout(() => {
        element.style.opacity = '0';
    }, 10);
}

export function slideDown(element, duration = 300) {
    element.style.maxHeight = '0';
    element.style.overflow = 'hidden';
    element.style.transition = `max-height ${duration}ms ease-out`;
    
    setTimeout(() => {
        element.style.maxHeight = element.scrollHeight + 'px';
    }, 10);
}

export function slideUp(element, duration = 300) {
    element.style.maxHeight = element.scrollHeight + 'px';
    element.style.overflow = 'hidden';
    element.style.transition = `max-height ${duration}ms ease-out`;
    
    setTimeout(() => {
        element.style.maxHeight = '0';
    }, 10);
}