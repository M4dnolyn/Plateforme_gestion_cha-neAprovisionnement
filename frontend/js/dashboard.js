// dashboard.js - Gestion du dashboard principal

let currentUser = null;
let currentPage = 'overview';

function initDashboard() {
    // Charger les données utilisateur
    loadUserData();
    
    // Charger les composants UI
    loadSidebar();
    loadTopbar();
    
    // Charger la page par défaut
    loadPage('overview');
    
    // Mettre en place les écouteurs d'événements
    setupEventListeners();
    
    // Charger les données initiales
    loadInitialData();
}

function loadUserData() {
    currentUser = {
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole'),
        name: localStorage.getItem('userName'),
        token: localStorage.getItem('token')
    };
    
    // Si pas de données utilisateur, rediriger
    if (!currentUser.email || !currentUser.role) {
        window.location.href = 'login.html';
    }
}

function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;
    
    // Déterminer quel sidebar charger selon le rôle
    const role = currentUser.role;
    
    // Pour l'instant, on crée un sidebar générique
    // Plus tard, on pourra charger différents templates
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <i class="fas fa-fish logo-icon"></i>
                    <h2>Ferme Mokpokpo</h2>
                </div>
            </div>
            
            <nav class="sidebar-menu" id="sidebar-menu">
                <!-- Menu items seront ajoutés dynamiquement -->
            </nav>
            
            <div class="sidebar-footer">
                <button class="btn btn-sm btn-outline toggle-sidebar" id="toggle-sidebar">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>
        </aside>
    `;
    
    sidebarContainer.innerHTML = sidebarHTML;
    loadMenuItems();
}

function loadMenuItems() {
    const menuContainer = document.getElementById('sidebar-menu');
    if (!menuContainer) return;
    
    const role = currentUser.role;
    
    // Menu items communs à tous les rôles
    const commonMenuItems = [
        { id: 'overview', icon: 'fas fa-tachometer-alt', text: 'Vue d\'ensemble', roles: ['all'] },
        { id: 'stocks', icon: 'fas fa-boxes', text: 'Stocks', roles: ['all', 'admin', 'gestionnaire_stock', 'gestionnaire_logistique'] },
        { id: 'catalogue', icon: 'fas fa-fish', text: 'Catalogue', roles: ['all'] },
        { id: 'production', icon: 'fas fa-seedling', text: 'Production', roles: ['all', 'admin', 'gestionnaire_production'] },
        { id: 'ventes', icon: 'fas fa-chart-line', text: 'Ventes', roles: ['all', 'admin', 'gestionnaire_ventes'] },
        { id: 'livraisons', icon: 'fas fa-truck', text: 'Livraisons', roles: ['all', 'admin', 'gestionnaire_logistique'] },
        { id: 'previsions', icon: 'fas fa-brain', text: 'Prévisions IA', roles: ['all', 'admin'] },
        { id: 'rapports', icon: 'fas fa-file-alt', text: 'Rapports', roles: ['all', 'admin'] }
    ];
    
    // Menu items spécifiques admin
    const adminMenuItems = [
        { id: 'employes', icon: 'fas fa-users', text: 'Employés', roles: ['admin'] },
        { id: 'collaboration', icon: 'fas fa-comments', text: 'Collaboration', roles: ['admin'] },
        { id: 'parametres', icon: 'fas fa-cog', text: 'Paramètres', roles: ['admin'] }
    ];
    
    // Filtrer les items selon le rôle
    const allItems = [...commonMenuItems, ...adminMenuItems];
    const userItems = allItems.filter(item => 
        item.roles.includes('all') || item.roles.includes(role)
    );
    
    // Générer le HTML du menu
    let menuHTML = '';
    userItems.forEach(item => {
        const activeClass = currentPage === item.id ? 'active' : '';
        menuHTML += `
            <a href="#" class="menu-item ${activeClass}" data-page="${item.id}">
                <i class="${item.icon} menu-icon"></i>
                <span class="menu-text">${item.text}</span>
            </a>
        `;
    });
    
    // Ajouter le logout
    menuHTML += `
        <div class="menu-spacer"></div>
        <a href="#" class="menu-item logout-btn" id="logout-btn">
            <i class="fas fa-sign-out-alt menu-icon"></i>
            <span class="menu-text">Déconnexion</span>
        </a>
    `;
    
    menuContainer.innerHTML = menuHTML;
}

function loadTopbar() {
    const topbarContainer = document.getElementById('topbar-container');
    if (!topbarContainer) return;
    
    const userName = currentUser.name || 'Utilisateur';
    const userRole = Config.ROLE_NAMES[currentUser.role] || currentUser.role;
    
    const topbarHTML = `
        <div class="topbar">
            <button class="toggle-sidebar" id="mobile-toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            
            <div class="topbar-title">
                <h1 id="page-title">Tableau de bord</h1>
            </div>
            
            <div class="user-info">
                <div class="user-details">
                    <div class="user-name">${userName}</div>
                    <div class="user-role">${userRole}</div>
                </div>
                <div class="user-avatar">
                    ${userName.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    `;
    
    topbarContainer.innerHTML = topbarHTML;
}

async function loadPage(pageId) {
    currentPage = pageId;
    
    // Mettre à jour le titre de la page
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const pageNames = {
            'overview': 'Vue d\'ensemble',
            'stocks': 'Gestion des stocks',
            'catalogue': 'Catalogue des produits',
            'production': 'Gestion de la production',
            'ventes': 'Ventes et analyses',
            'livraisons': 'Livraisons et logistique',
            'previsions': 'Prévisions IA',
            'rapports': 'Rapports et statistiques',
            'employes': 'Gestion des employés',
            'collaboration': 'Collaboration',
            'parametres': 'Paramètres'
        };
        pageTitle.textContent = pageNames[pageId] || 'Tableau de bord';
    }
    
    // Mettre à jour le menu actif
    updateActiveMenu(pageId);
    
    // Charger le contenu de la page
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // Afficher un indicateur de chargement
    contentArea.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
            </div>
            <p>Chargement de la page...</p>
        </div>
    `;
    
    try {
        let pageContent = '';
        
        switch(pageId) {
            case 'overview':
                pageContent = await loadOverviewPage();
                break;
            case 'stocks':
                pageContent = await loadStocksPage();
                break;
            case 'catalogue':
                pageContent = await loadCataloguePage();
                break;
            case 'production':
                pageContent = await loadProductionPage();
                break;
            case 'ventes':
                pageContent = await loadSalesPage();
                break;
            case 'livraisons':
                pageContent = await loadLogisticsPage();
                break;
            case 'previsions':
                pageContent = await loadPredictionsPage();
                break;
            case 'rapports':
                pageContent = await loadReportsPage();
                break;
            case 'employes':
                pageContent = await loadEmployeesPage();
                break;
            default:
                pageContent = await loadDefaultPage();
        }
        
        contentArea.innerHTML = pageContent;
        
        // Initialiser les composants spécifiques à la page
        initPageComponents(pageId);
        
    } catch (error) {
        console.error('Erreur de chargement de la page:', error);
        contentArea.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger la page demandée.</p>
                <button class="btn btn-primary" onclick="loadPage('overview')">
                    Retour à l'accueil
                </button>
            </div>
        `;
    }
}

async function loadOverviewPage() {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return `
        <div class="overview-page">
            <div class="welcome-section">
                <h2>Bienvenue, ${currentUser.name || 'Utilisateur'}!</h2>
                <p class="subtitle">Plateforme de gestion des produits halieutiques - ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Stocks totaux</h3>
                        <div class="stat-icon blue">
                            <i class="fas fa-boxes"></i>
                        </div>
                    </div>
                    <div class="stat-value">1,248</div>
                    <div class="stat-label">Kg de produits</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>12% vs mois dernier</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Ventes du mois</h3>
                        <div class="stat-icon green">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-value">₣ 45,230</div>
                    <div class="stat-label">Chiffre d'affaires</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>8% vs mois dernier</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Livraisons en cours</h3>
                        <div class="stat-icon orange">
                            <i class="fas fa-truck"></i>
                        </div>
                    </div>
                    <div class="stat-value">7</div>
                    <div class="stat-label">Commandes en transit</div>
                    <div class="stat-change negative">
                        <i class="fas fa-arrow-down"></i>
                        <span>2 en retard</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Alertes actives</h3>
                        <div class="stat-icon red">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div class="stat-value">3</div>
                    <div class="stat-label">À traiter</div>
                    <div class="stat-change">
                        <span>Stocks critiques</span>
                    </div>
                </div>
            </div>
            
            <div class="charts-row">
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Évolution des stocks</h3>
                        <div class="chart-actions">
                            <button class="chart-action-btn active">7j</button>
                            <button class="chart-action-btn">30j</button>
                            <button class="chart-action-btn">90j</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="stockChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        <h3>Ventes par catégorie</h3>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Actions rapides</h3>
                <div class="actions-grid">
                    <button class="action-btn" onclick="loadPage('stocks')">
                        <i class="fas fa-plus-circle"></i>
                        <span>Ajouter un stock</span>
                    </button>
                    <button class="action-btn" onclick="loadPage('production')">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Déclarer une récolte</span>
                    </button>
                    <button class="action-btn" onclick="loadPage('ventes')">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>Créer une vente</span>
                    </button>
                    <button class="action-btn" onclick="loadPage('livraisons')">
                        <i class="fas fa-truck-loading"></i>
                        <span>Planifier livraison</span>
                    </button>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3>Activité récente</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class="fas fa-box activity-icon"></i>
                        <div class="activity-content">
                            <div class="activity-title">Nouveau stock ajouté</div>
                            <div class="activity-details">150kg de crevettes</div>
                            <div class="activity-time">Il y a 2 heures</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-check-circle activity-icon success"></i>
                        <div class="activity-content">
                            <div class="activity-title">Livraison complétée</div>
                            <div class="activity-details">Commande #4567 - Restaurant "La Mer"</div>
                            <div class="activity-time">Il y a 5 heures</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-exclamation-triangle activity-icon warning"></i>
                        <div class="activity-content">
                            <div class="activity-title">Alerte stock bas</div>
                            <div class="activity-details">Tilapia - Seuil minimum atteint</div>
                            <div class="activity-time">Il y a 1 jour</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Fonctions de chargement des autres pages (stubs pour l'instant)
async function loadStocksPage() {
    return `<h2>Gestion des Stocks</h2><p>Page des stocks en développement...</p>`;
}

async function loadCataloguePage() {
    return `<h2>Catalogue des Produits</h2><p>Page du catalogue en développement...</p>`;
}

async function loadProductionPage() {
    return `<h2>Gestion de la Production</h2><p>Page de production en développement...</p>`;
}

async function loadSalesPage() {
    return `<h2>Ventes et Analyses</h2><p>Page des ventes en développement...</p>`;
}

async function loadLogisticsPage() {
    return `<h2>Livraisons et Logistique</h2><p>Page logistique en développement...</p>`;
}

async function loadPredictionsPage() {
    return `<h2>Prévisions IA</h2><p>Page des prévisions en développement...</p>`;
}

async function loadReportsPage() {
    return `<h2>Rapports et Statistiques</h2><p>Page des rapports en développement...</p>`;
}

async function loadEmployeesPage() {
    return `<h2>Gestion des Employés</h2><p>Page employés en développement...</p>`;
}

async function loadDefaultPage() {
    return `<h2>Page non trouvée</h2><p>Cette page est en cours de développement.</p>`;
}

function initPageComponents(pageId) {
    switch(pageId) {
        case 'overview':
            initOverviewCharts();
            break;
        // Autres pages...
    }
}

function initOverviewCharts() {
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
                    tension: 0.4
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
    
    // Graphique des ventes
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx.getContext('2d'), {
            type: 'doughnut',
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

function setupEventListeners() {
    // Navigation dans le menu
    document.addEventListener('click', (e) => {
        // Clic sur un élément du menu
        if (e.target.closest('[data-page]')) {
            e.preventDefault();
            const pageId = e.target.closest('[data-page]').dataset.page;
            loadPage(pageId);
        }
        
        // Clic sur logout
        if (e.target.closest('#logout-btn')) {
            e.preventDefault();
            logout();
        }
        
        // Clic sur toggle sidebar
        if (e.target.closest('.toggle-sidebar')) {
            e.preventDefault();
            toggleSidebar();
        }
    });
    
    // Navigation avant/arrière
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            loadPage(e.state.page);
        }
    });
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar i');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-left';
    } else {
        sidebar.classList.add('collapsed');
        if (toggleBtn) toggleBtn.className = 'fas fa-chevron-right';
    }
}

function updateActiveMenu(pageId) {
    // Retirer la classe active de tous les items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Ajouter la classe active à l'item courant
    const activeItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function loadInitialData() {
    // Charger les données initiales (à implémenter)
    console.log('Chargement des données initiales...');
}

// Exporter les fonctions pour une utilisation globale
window.initDashboard = initDashboard;
window.loadPage = loadPage;
