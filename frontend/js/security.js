// security.js - Gestion des permissions et accès basés sur les rôles

(function () {
    console.log('🛡️ Security.js chargé');

    const initSecurity = () => {
        applySecurityRules();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

    function applySecurityRules() {
        const userRole = localStorage.getItem('userRole');
        const path = window.location.pathname;
        const currentPage = path.split('/').pop() || 'index.html';

        console.log(`[Security] Rôle=${userRole}, Page=${currentPage}`);

        // Définir les permissions par rôle
        const rolePermissions = {
            'admin': ['dashboard-admin.html', 'employes.html', 'stock.html', 'catalogue.html', 'alertes.html', 'notifications.html'],
            'gestionnaire_stock': ['stock.html', 'catalogue.html', 'alertes.html', 'notifications.html', 'formulaire_stock.html'],
            'gestionnaire_logistique': ['dashboard-logistique.html', 'livraisons.html', 'incidents.html', 'notifications.html', 'catalogue.html'],
            'gestionnaire_ventes': ['dashboard-ventes.html', 'ventes.html', 'catalogue.html', 'notifications.html']
        };

        const restrictedPages = [
            'dashboard-admin.html', 'employes.html', 'stock.html',
            'formulaire_stock.html', 'alertes.html', 'notifications.html',
            'dashboard-logistique.html', 'livraisons.html', 'incidents.html',
            'dashboard-ventes.html', 'ventes.html'
        ];

        // 1. Vérification d'accès à la page
        if (restrictedPages.includes(currentPage)) {
            const allowedPages = rolePermissions[userRole] || [];

            // Sécurité supplémentaire pour la gestion des employés (Admin uniquement)
            if (currentPage === 'employes.html' && userRole !== 'admin') {
                console.error(`[Security] Tentative d'accès non autorisée à la gestion des employés par : ${userRole}`);
                window.location.href = 'index.html'; // Redirection flash
                return;
            }

            if (!allowedPages.includes(currentPage)) {
                console.warn(`[Security] Accès refusé à ${currentPage} pour le rôle ${userRole}`);
                const msg = `Accès refusé : Votre rôle (${userRole}) ne vous permet pas d'accéder à cette page.`;
                showSecurityWarning(msg);

                // Redirection immédiate vers le dashboard par défaut du rôle
                const roleDashboards = {
                    'admin': 'dashboard-admin.html',
                    'gestionnaire_stock': 'stock.html',
                    'gestionnaire_logistique': 'dashboard-logistique.html',
                    'gestionnaire_ventes': 'dashboard-ventes.html'
                };

                setTimeout(() => {
                    window.location.href = roleDashboards[userRole] || 'index.html';
                }, 2000);
                return;
            }
        }

        // 2. Mode Lecture Seule pour l'Admin sur les données métiers
        if (userRole === 'admin') {
            const sensitivePages = ['stock.html', 'catalogue.html'];
            if (sensitivePages.includes(currentPage)) {
                console.log('[Security] Mode Admin : Verrouillage des modifications métier');
                lockModifications();
            }
        }
    }

    function lockModifications() {
        const lock = () => {
            const actionButtons = document.querySelectorAll('.btn-modifier, .btn-ajouter, .btn-supprimer, .action-btn');
            if (actionButtons.length === 0) {
                // Réessayer après un court délai car les données peuvent être chargées dynamiquement
                setTimeout(lock, 500);
                return;
            }

            actionButtons.forEach(btn => {
                btn.style.opacity = '0.5';
                btn.style.filter = 'grayscale(1)';
                btn.style.cursor = 'not-allowed';
                btn.disabled = true;
                btn.title = "Action désactivée pour l'administrateur (Consultation uniquement)";

                // Doubler la sécurité avec un event listener capturant
                const overlay = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert("En tant qu'administrateur, vous avez un accès en LECTURE SEULE sur cette page métier.");
                };
                btn.addEventListener('click', overlay, true);
                btn.addEventListener('mousedown', overlay, true);
            });
        };
        lock();
    }

    function showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: sans-serif;
        `;
        warning.innerHTML = `<i class="fas fa-shield-alt"></i> ${message}`;
        document.body.appendChild(warning);
    }
})();
