// stock.js - Gestion des stocks avec API

document.addEventListener('DOMContentLoaded', function () {
    console.log('Page Stocks initialisée');

    // Configurer
    initLogoutButton();
    updateUserInfo();
    loadStockData();
    setupEventListeners();

    showNotification('📦 Page de gestion des stocks chargée', 'info');
});

function initLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            logout();
        });
    }
}

function setupEventListeners() {
    // Écouter les changements de valeurs
    document.querySelectorAll('.btn-modifier').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            modifierValeur(id);
        });
    });
}

async function loadStockData() {
    try {
        showLoading(true);

        // Récupérer les statistiques et la liste des lots parallèlement
        const [stats, lots] = await Promise.all([
            api.getStockStats(),
            api.getStocks()
        ]);

        // Mettre à jour l'affichage
        updateDailyInventory(stats);
        updateStockHistory(lots);

        showNotification('📊 Données de stock mises à jour', 'success');

    } catch (error) {
        console.error('Erreur chargement stocks:', error);

        // Utiliser les données de démo
        loadDemoData();

        showNotification('⚠️ Mode démo activé - Données simulées', 'warning');
    } finally {
        showLoading(false);
    }
}

function updateStockHistory(lots) {
    const container = document.getElementById('stock-history-body');
    if (!container) return;

    if (!lots || lots.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="no-data">Aucun lot dans l\'historique</td></tr>';
        return;
    }

    let html = '';
    lots.forEach(lot => {
        const dispo = lot.quantite > 0 ?
            '<span class="badge status-ok">OUI</span>' :
            '<span class="badge status-pending">NON</span>';

        html += `
            <tr>
                <td><strong>#${lot.id_lot}</strong></td>
                <td>${lot.type_produit || 'Divers'}</td>
                <td><strong>${lot.quantite} kg</strong></td>
                <td>${new Date(lot.date_reception).toLocaleDateString('fr-FR')}</td>
                <td>${dispo}</td>
                <td>
                    <button class="btn-sm btn-outline btn-modifier" onclick="window.location.href='formulaire_stock.html?id=${lot.id_lot}'" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-outline btn-supprimer" onclick="supprimerLot(${lot.id_lot})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    container.innerHTML = html;
}

function updateDailyInventory(stats) {
    const container = document.getElementById('daily-inventory-body');
    if (!container) return;

    if (!stats) {
        container.innerHTML = '<tr><td colspan="5" class="no-data">Données indisponibles</td></tr>';
        return;
    }

    const today = new Date().toLocaleDateString('fr-FR');
    const ruptureLabel = stats.daily_shortages > 0 ?
        `<span class="badge status-pending">${stats.daily_shortages} Ruptures</span>` :
        '<span class="badge status-ok">AUCUNE</span>';

    html = `
        <tr>
            <td><strong>${today}</strong></td>
            <td>${stats.daily_in} kg</td>
            <td>${stats.daily_out} kg</td>
            <td><strong>${stats.total_stock || 0} kg</strong></td>
            <td>${ruptureLabel}</td>
        </tr>
    `;
    container.innerHTML = html;
}

async function supprimerLot(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce lot ?')) return;

    try {
        await api.deleteStock(id);
        showNotification('✅ Lot supprimé avec succès', 'success');
        loadStockData(); // Recharger la liste
    } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('❌ Erreur lors de la suppression', 'error');
    }
}

async function modifierValeur(id) {
    const element = document.getElementById(id);
    const valeurActuelle = element.textContent;
    const titre = element.parentElement.querySelector('h3').textContent;

    let nouvelleValeur = prompt(`${titre}\nEntrez la nouvelle valeur :`, valeurActuelle);

    if (nouvelleValeur === null || nouvelleValeur === '') {
        return; // Annulation
    }

    nouvelleValeur = parseInt(nouvelleValeur);

    if (isNaN(nouvelleValeur)) {
        showNotification('❌ Veuillez entrer un nombre valide !', 'error');
        return;
    }

    if (nouvelleValeur < 0) {
        showNotification('⚠️ La valeur ne peut pas être négative !', 'warning');
        return;
    }

    // Animation de mise à jour
    element.style.transform = 'scale(1.2)';
    element.style.color = '#28a745';

    try {
        // Envoyer la mise à jour à l'API
        await updateStockValue(id, nouvelleValeur);

        // Mettre à jour l'affichage
        element.textContent = nouvelleValeur;
        element.style.transform = 'scale(1)';
        element.style.color = '#2575fc';

        showNotification(`✅ ${titre} mis à jour: ${valeurActuelle} → ${nouvelleValeur}`, 'success');

    } catch (error) {
        console.error('Erreur mise à jour:', error);
        showNotification('❌ Erreur lors de la mise à jour', 'error');

        // Revenir à l'ancienne valeur
        element.style.transform = 'scale(1)';
        element.style.color = '#2575fc';
    }
}

async function updateStockValue(field, value) {
    // Déterminer quel champ mettre à jour
    const fieldMap = {
        'entrees': 'daily_in',
        'sorties': 'daily_out',
        'rupture': 'daily_shortages',
        'alertes': 'active_alerts'
    };

    const apiField = fieldMap[field];
    if (!apiField) {
        throw new Error('Champ inconnu');
    }

    // Préparer les données
    const updateData = {
        [apiField]: value,
        updated_at: new Date().toISOString()
    };

    // Appel API pour mettre à jour
    return api.request('/api/stats/daily/', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    });
}

function updateStockDisplay(stats) {
    if (!stats) return;

    // Mapper les données API à nos IDs
    const displayMap = {
        'entrees': stats.daily_in,
        'sorties': stats.daily_out,
        'rupture': stats.daily_shortages,
        'alertes': stats.active_alerts
    };

    Object.keys(displayMap).forEach(id => {
        const element = document.getElementById(id);
        if (element && displayMap[id] !== undefined) {
            element.textContent = displayMap[id];
        }
    });
}

function updateUserInfo() {
    const userElement = document.getElementById('current-user');
    if (userElement) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userName = userData.name || localStorage.getItem('userName') || 'Utilisateur';
        const userRole = localStorage.getItem('userRole') || 'Gestionnaire Stock';
        userElement.textContent = `${userName} (${userRole})`;
    }
}

function loadDemoData() {
    // Données de démonstration
    const demoStats = {
        daily_in: 100,
        daily_out: 50,
        daily_shortages: 10,
        active_alerts: 5
    };

    updateStockDisplay(demoStats);
}

function showLoading(show) {
    // Implémenter un indicateur de chargement si nécessaire
    if (show) {
        console.log('Chargement en cours...');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' :
            type === 'error' ? '#dc3545' :
                type === 'warning' ? '#ffc107' : '#2c7be5'};
        color: ${type === 'warning' ? '#212529' : 'white'};
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;

    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };

    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            margin-left: 10px;
            cursor: pointer;
            color: inherit;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Exporter les fonctions
window.modifierValeur = modifierValeur;
window.logout = logout;
