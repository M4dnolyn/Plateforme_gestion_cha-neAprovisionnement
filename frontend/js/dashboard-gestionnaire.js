// dashboard-gestionnaire.js - Dashboard gestionnaire

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard Gestionnaire initialisé');
    
    // Initialiser
    initDashboard();
    setupEventListeners();
    loadDashboardData();
});

function initDashboard() {
    // Mettre à jour la date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('fr-FR', options);
    
    // Mettre à jour le nom et rôle
    const userName = localStorage.getItem('userName') || 'Gestionnaire';
    const userRole = localStorage.getItem('userRole') || 'Gestionnaire de Stock';
    
    document.getElementById('manager-name').textContent = userName;
    document.getElementById('manager-role').textContent = userRole;
    document.getElementById('welcome-name').textContent = userName;
    
    // Configurer logout
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Toggle sidebar
    document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('logout-btn')) {
                e.preventDefault();
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const page = this.getAttribute('href');
                if (page && page !== '#') {
                    window.location.href = page;
                }
            }
        });
    });
}

async function loadDashboardData() {
    try {
        // Simuler le chargement
        showLoading(true);
        
        // Charger les données (API ou démo)
        const dashboardData = await fetchDashboardData();
        
        // Mettre à jour l'interface
        updateDashboard(dashboardData);
        
        // Initialiser les graphiques
        initCharts(dashboardData);
        
        showNotification('📊 Dashboard mis à jour', 'success');
        
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showNotification('Erreur de chargement des données', 'error');
        
        // Charger les données de démo
        loadDemoData();
        
    } finally {
        showLoading(false);
    }
}

async function fetchDashboardData() {
    // Pour l'instant, on simule les données
    // Plus tard, tu remplaceras par des appels API réels
    
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                totalStock: 1248,
                totalAlerts: 3,
                todayDeliveries: 7,
                totalProducts: 24,
                criticalStocks: [
                    { id: 1, name: 'Crevettes', quantity: 15, threshold: 20 },
                    { id: 2, name: 'Thon', quantity: 25, threshold: 30 },
                    { id: 3, name: 'Langouste', quantity: 5, threshold: 10 }
                ],
                recentActivities: [
                    { id: 1, type: 'stock', action: 'Entrée', product: 'Crevettes', quantity: 150, time: 'Il y a 2 heures' },
                    { id: 2, type: 'alert', action: 'Alerte', product: 'Tilapia', details: 'Stock bas', time: 'Il y a 5 heures' },
                    { id: 3, type: 'delivery', action: 'Livraison', client: 'Restaurant "La Mer"', status: 'Complétée', time: 'Il y a 1 jour' }
                ],
                stockTrend: '+12%',
                alertsTrend: '-1',
                deliveriesTrend: '+2',
                productsTrend: '+3'
            });
        }, 1000);
    });
}

function updateDashboard(data) {
    // Mettre à jour les statistiques
    document.getElementById('total-stock').textContent = data.totalStock.toLocaleString();
    document.getElementById('total-alerts').textContent = data.totalAlerts;
    document.getElementById('today-deliveries').textContent = data.todayDeliveries;
    document.getElementById('total-products').textContent = data.totalProducts;
    
    // Mettre à jour les tendances
    document.getElementById('stock-trend').textContent = data.stockTrend;
    document.getElementById('alerts-trend').textContent = data.alertsTrend;
    document.getElementById('deliveries-trend').textContent = data.deliveriesTrend;
    document.getElementById('products-trend').textContent = data.productsTrend;
    
    // Mettre à jour les stocks critiques
    updateCriticalStocks(data.criticalStocks);
    
    // Mettre à jour les activités récentes
    updateRecentActivities(data.recentActivities);
    
    // Mettre à jour le compteur de stocks critiques
    document.getElementById('critical-count').textContent = data.criticalStocks.length;
}

function updateCriticalStocks(stocks) {
    const container = document.getElementById('critical-stocks-list');
    if (!container) return;
    
    if (stocks.length === 0) {
        container.innerHTML = `
            <div class="no-critical">
                <i class="fas fa-check-circle"></i>
                <span>Aucun stock critique</span>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    stocks.forEach(stock => {
        const percentage = Math.round((stock.quantity / stock.threshold) * 100);
        const progressClass = percentage < 50 ? 'danger' : percentage < 75 ? 'warning' : 'info';
        
        html += `
            <div class="stock-item">
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-quantity">${stock.quantity} / ${stock.threshold} kg</div>
                </div>
                <div class="stock-progress">
                    <div class="progress-bar ${progressClass}" style="width: ${percentage}%"></div>
                </div>
                <button class="btn btn-sm btn-outline" onclick="reapprovisionner('${stock.name}')">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateRecentActivities(activities) {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    let html = '';
    
    activities.forEach(activity => {
        const icon = activity.type === 'stock' ? 'box' :
                    activity.type === 'alert' ? 'exclamation-triangle' :
                    activity.type === 'delivery' ? 'truck' : 'info-circle';
        
        const iconClass = activity.type === 'alert' ? 'warning' : 'info';
        
        html += `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.action}: ${activity.product || activity.client}</div>
                    <div class="activity-details">${activity.details || `${activity.quantity} kg`}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function initCharts(data) {
    // Graphique des stocks
    const stockCtx = document.getElementById('stockChart');
    if (stockCtx) {
        new Chart(stockCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Stocks totaux (kg)',
                    data: [1100, 1150, 1200, 1180, 1250, 1300, 1248],
                    borderColor: '#2575fc',
                    backgroundColor: 'rgba(37, 117, 252, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Graphique par catégorie
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Crustacés', 'Poissons mer', 'Poissons douce'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: ['#2575fc', '#2ecc71', '#e67e22']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function loadDemoData() {
    const demoData = {
        totalStock: 1248,
        totalAlerts: 3,
        todayDeliveries: 7,
        totalProducts: 24,
        criticalStocks: [
            { id: 1, name: 'Crevettes', quantity: 15, threshold: 20 },
            { id: 2, name: 'Thon', quantity: 25, threshold: 30 }
        ],
        recentActivities: [
            { id: 1, type: 'stock', action: 'Entrée', product: 'Crevettes', quantity: 150, time: 'Il y a 2 heures' },
            { id: 2, type: 'alert', action: 'Alerte', product: 'Tilapia', details: 'Stock bas', time: 'Il y a 5 heures' }
        ],
        stockTrend: '+12%',
        alertsTrend: '-1',
        deliveriesTrend: '+2',
        productsTrend: '+3'
    };
    
    updateDashboard(demoData);
    initCharts(demoData);
}

function reapprovisionner(productName) {
    showNotification(`📦 Réapprovisionnement de ${productName} demandé`, 'info');
    
    // Ici, tu ferais un appel API pour déclencher le réapprovisionnement
    // fetchAPI('/api/stocks/reorder', { method: 'POST', body: JSON.stringify({ product: productName }) });
    
    // Simuler un délai
    setTimeout(() => {
        showNotification(`✅ Commande de ${productName} passée avec succès`, 'success');
    }, 1500);
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (show) {
        if (!loadingOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin fa-3x" style="color: #2575fc;"></i>
                    <p style="margin-top: 20px;">Chargement des données...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    } else {
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

async function fetchAPI(endpoint, options = {}) {
    // Cette fonction sera utilisée pour les appels API réels
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(`http://localhost:8000/api${endpoint}`, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Error ${endpoint}:`, error);
        throw error;
    }
}

function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.dashboard-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
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

// Exporter
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.reapprovisionner = reapprovisionner;
