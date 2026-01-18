// main.js - Fichier principal de l'application

// Styles globaux supplémentaires
const globalStyles = `
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        color: #666;
    }
    
    .loading-spinner {
        margin-bottom: 20px;
    }
    
    .error-container {
        text-align: center;
        padding: 50px 20px;
        color: #666;
    }
    
    .error-container i {
        color: #e74c3c;
        margin-bottom: 20px;
    }
    
    .overview-page {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    
    .welcome-section {
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 10px;
    }
    
    .welcome-section .subtitle {
        opacity: 0.9;
        margin-top: 5px;
    }
    
    .charts-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    @media (max-width: 991px) {
        .charts-row {
            grid-template-columns: 1fr;
        }
    }
    
    .chart-wrapper {
        height: 300px;
        position: relative;
    }
    
    .quick-actions {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .action-btn {
        background: #f8f9fa;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    
    .action-btn:hover {
        background: white;
        border-color: #2575fc;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 117, 252, 0.15);
    }
    
    .action-btn i {
        font-size: 2rem;
        color: #2575fc;
    }
    
    .action-btn span {
        font-weight: 500;
        color: #2c3e50;
    }
    
    .recent-activity {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .activity-list {
        margin-top: 20px;
    }
    
    .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-icon {
        font-size: 1.2rem;
        margin-top: 3px;
        color: #2575fc;
    }
    
    .activity-icon.success {
        color: #2ecc71;
    }
    
    .activity-icon.warning {
        color: #e67e22;
    }
    
    .activity-content {
        flex: 1;
    }
    
    .activity-title {
        font-weight: 600;
        color: #2c3e50;
    }
    
    .activity-details {
        color: #666;
        font-size: 0.9rem;
        margin-top: 3px;
    }
    
    .activity-time {
        color: #999;
        font-size: 0.8rem;
        margin-top: 5px;
    }
    
    .menu-spacer {
        flex: 1;
    }
`;

// Ajouter les styles globaux
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

// Initialisation de l'application
function initApp() {
    console.log('Ferme Mokpokpo Platform v1.0 - Initialisation');
    
    // Vérifier si nous sommes sur le dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        console.log('Dashboard détecté');
        // L'initialisation du dashboard se fera via son propre script
    } else if (window.location.pathname.includes('login.html')) {
        console.log('Page de login détectée');
        // L'initialisation du login se fera via auth.js
    } else {
        console.log('Page non reconnue, redirection vers login');
        // Rediriger vers login si on est sur une page inconnue
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Exporter
window.initApp = initApp;

// Démarrer l'application quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
