// dashboard-admin.js - Dashboard administrateur

document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard Admin initialisé');

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

    // Mettre à jour le nom utilisateur
    const userName = localStorage.getItem('userName') || 'Administrateur';
    document.getElementById('admin-name').textContent = userName;
    document.getElementById('welcome-name').textContent = userName;

    // Configurer logout
    document.querySelector('.logout-btn').addEventListener('click', function (e) {
        e.preventDefault();
        logout();
    });

    // Toggle sidebar
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function (e) {
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
        // Charger les données depuis l'API
        const [statsData, activitiesData] = await Promise.all([
            fetchAPI('/api/admin/stats'),
            fetchAPI('/api/activities/recent')
        ]);

        // Mettre à jour les statistiques
        updateStats(statsData);

        // Mettre à jour les activités
        updateActivities(activitiesData);

        // Initialiser les graphiques
        initCharts(statsData);

    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showNotification('Erreur de chargement des données', 'error');

        // Données par défaut pour la démo
        loadDemoData();
    }
}

function updateStats(data) {
    if (!data) return;

    // Mettre à jour les compteurs dynamiquement
    const productCountEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (productCountEl) productCountEl.textContent = data.total_products;

    const alertCountEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (alertCountEl) alertCountEl.textContent = data.critical_stocks_count;

    const userCountEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (userCountEl) userCountEl.textContent = data.total_users;
}

function updateActivities(activities) {
    const container = document.querySelector('.activity-list');
    if (!container || !activities) return;

    let html = '';

    activities.forEach(activity => {
        const iconClass = activity.type === 'success' ? 'success' :
            activity.type === 'warning' ? 'warning' : 'info';

        html += `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas fa-${activity.icon || 'info-circle'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">${activity.details}</div>
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
                    label: 'Stocks (kg)',
                    data: [1200, 1150, 1300, 1250, 1400, 1350, 1248],
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
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }

    // Graphique des employés
    const employeesCtx = document.getElementById('employeesChart');
    if (employeesCtx) {
        new Chart(employeesCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Production', 'Stock', 'Logistique', 'Ventes', 'Admin'],
                datasets: [{
                    data: [4, 3, 2, 3, 2],
                    backgroundColor: ['#2575fc', '#2ecc71', '#e67e22', '#e74c3c', '#9b59b6']
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
    // Données de démonstration
    const demoActivities = [
        {
            title: 'Nouvel employé ajouté',
            details: 'Marie Martin - Gestionnaire Production',
            time: 'Il y a 2 heures',
            type: 'success',
            icon: 'check-circle'
        },
        {
            title: 'Stock bas détecté',
            details: 'Crevettes - Seuil minimum atteint',
            time: 'Il y a 5 heures',
            type: 'warning',
            icon: 'exclamation-triangle'
        },
        {
            title: 'Rapport généré',
            details: 'Rapport mensuel de décembre 2025',
            time: 'Hier à 14:30',
            type: 'info',
            icon: 'info-circle'
        }
    ];

    updateActivities(demoActivities);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

async function fetchAPI(endpoint) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

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
        // Appeler API logout si nécessaire
        // await fetchAPI('/api/auth/logout');

        localStorage.clear();
        window.location.href = 'login.html';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
