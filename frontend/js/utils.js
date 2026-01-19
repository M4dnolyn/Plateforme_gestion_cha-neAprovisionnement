// utils.js - Fonctions utilitaires

// Formatage de date
function formatDate(date, format = 'fr-FR') {
    const d = new Date(date);
    if (format === 'fr-FR') {
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return d.toISOString().split('T')[0];
}

// Formatage de nombres
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Validation d'email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Copier dans le clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur de copie:', err);
        return false;
    }
}

// Générer un ID unique
function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formater une taille de fichier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Débounce function pour limiter les appels
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Ajouter des liens admin si nécessaire
function injectAdminLinks() {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            // Vérifier si les liens existent déjà
            if (!sidebarMenu.querySelector('a[href="dashboard-admin.html"]')) {
                const dashboardLink = document.createElement('a');
                dashboardLink.href = 'dashboard-admin.html';
                dashboardLink.className = 'menu-item';
                dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt menu-icon"></i><span class="menu-text">Dashboard Admin</span>';

                // Insérer au début
                sidebarMenu.insertBefore(dashboardLink, sidebarMenu.firstChild);
            }

            if (!sidebarMenu.querySelector('a[href="employes.html"]')) {
                const emplLink = document.createElement('a');
                emplLink.href = 'employes.html';
                emplLink.className = 'menu-item';
                emplLink.innerHTML = '<i class="fas fa-users menu-icon"></i><span class="menu-text">Employés</span>';

                // Insérer après le dashboard
                const dashboard = sidebarMenu.querySelector('a[href="dashboard-admin.html"]');
                if (dashboard) {
                    sidebarMenu.insertBefore(emplLink, dashboard.nextSibling);
                }
            }
        }
    }
}

// Exécuter au chargement
document.addEventListener('DOMContentLoaded', injectAdminLinks);

// Exporter
window.utils = {
    formatDate,
    formatNumber,
    isValidEmail,
    copyToClipboard,
    generateId,
    formatFileSize,
    debounce,
    injectAdminLinks
};
