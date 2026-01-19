// ventes.js - Logique pour le gestionnaire des ventes

document.addEventListener('DOMContentLoaded', function () {
    console.log('Page Ventes initialisée');

    // Initialiser les composants
    initDashboard();
    initVentesPage();
    setupLogout();
});

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
}

async function initDashboard() {
    if (!document.getElementById('revenueChart')) return;

    // Mettre à jour les infos utilisateur
    document.getElementById('user-name').textContent = localStorage.getItem('userName') || 'Gestionnaire Ventes';
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        // Charger les stats réelles si l'API est dispo, sinon dummys pour la démo
        const stats = await api.request('/api/ventes/stats/').catch(() => ({
            daily_total: "150,000 CFA",
            order_count: 8,
            top_product: "Capitaine Frais",
            recent_sales: [
                { id: "FAC-9821", client: "Poissonnerie du Port", total: "45,000", status: "Payée" },
                { id: "FAC-9822", client: "Hôtel Rivage", total: "12,500", status: "En attente" },
                { id: "FAC-9823", client: "Marché Central", total: "22,000", status: "Payée" }
            ]
        }));

        document.getElementById('daily-sales').textContent = stats.daily_total;
        document.getElementById('order-count').textContent = stats.order_count;
        document.getElementById('top-product').textContent = stats.top_product;

        updateRecentSales(stats.recent_sales);
        initCharts();
    } catch (error) {
        console.error('Erreur dashboard:', error);
    }
}

function updateRecentSales(sales) {
    const tbody = document.getElementById('recent-sales-list');
    if (!tbody) return;

    tbody.innerHTML = sales.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.client}</td>
            <td>${s.total} CFA</td>
            <td><span class="status-badge ${s.status === 'Payée' ? 'status-active' : 'status-pending'}">${s.status}</span></td>
            <td><button class="btn btn-sm btn-outline"><i class="fas fa-eye"></i></button></td>
        </tr>
    `).join('');
}

function initCharts() {
    // Graphique des revenus
    const revCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Revenus (CFA)',
                data: [120000, 150000, 180000, 140000, 200000, 250000, 190000],
                borderColor: '#e74c3c',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(231, 76, 60, 0.1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Graphique catégories
    const catCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(catCtx, {
        type: 'doughnut',
        data: {
            labels: ['Poissons Mer', 'Crustacés', 'Eaux douces'],
            datasets: [{
                data: [55, 25, 20],
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Logique pour la page de gestion des ventes
async function initVentesPage() {
    const form = document.getElementById('saleForm');
    if (!form) return;

    loadProducts();
    loadSalesHistory();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saleData = {
            produit_id: document.getElementById('produit_select').value,
            lot_id: document.getElementById('lot_select').value,
            quantite: document.getElementById('quantite').value,
            prix_unitaire: document.getElementById('prix_unitaire').value,
            client: document.getElementById('client').value,
            statut: document.getElementById('statut_vente').value
        };

        try {
            await api.request('/api/ventes/', {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
            alert('Vente enregistrée avec succès !');
            form.reset();
            loadSalesHistory();
        } catch (error) {
            console.error('Erreur vente:', error);
            alert('Erreur lors de l\'enregistrement de la vente.');
        }
    });

    // Dépendance Lot -> Produit
    document.getElementById('produit_select').addEventListener('change', function () {
        loadLotsForProduct(this.value);
    });
}

async function loadProducts() {
    const select = document.getElementById('produit_select');
    if (!select) return;

    try {
        const response = await api.request('/api/produits/');
        console.log("API Produits Response:", response); // Debug log

        // Intelligent extraction
        const products = Array.isArray(response) ? response : (response.results || []);

        if (!Array.isArray(products)) {
            throw new Error("Format de réponse invalide (pas un tableau)");
        }

        select.innerHTML = '<option value="">Choisir un produit...</option>' +
            products.map(p => `<option value="${p.id_produit}">${p.nom_produit}</option>`).join('');
    } catch (e) {
        console.error("Erreur chargement produits:", e);
        // Display specific error to user
        select.innerHTML = `<option value="">Erreur: ${e.message || 'Problème technique'}</option>`;
    }
}

async function loadLotsForProduct(productId) {
    const select = document.getElementById('lot_select');
    if (!select || !productId) return;

    select.innerHTML = '<option value="">Chargement des lots...</option>';
    try {
        const response = await api.request(`/api/lots/?produit=${productId}`);
        console.log("API Lots Response:", response); // Debug log

        const lots = Array.isArray(response) ? response : (response.results || []);

        if (!Array.isArray(lots)) {
            throw new Error("Format de réponse invalide (pas un tableau)");
        }

        select.innerHTML = lots.length ?
            lots.map(l => `<option value="${l.id_lot}">Lot #${l.id_lot} (Restant: ${l.quantite}kg)</option>`).join('') :
            '<option value="">Aucun lot disponible</option>';
    } catch (e) {
        console.error("Erreur chargement lots:", e);
        select.innerHTML = `<option value="">Erreur: ${e.message}</option>`;
    }
}

async function loadSalesHistory() {
    const tbody = document.getElementById('sales-history-body');
    if (!tbody) return;

    try {
        const response = await api.request('/api/ventes/');
        // Handle DRF pagination
        const sales = response.results ? response.results : response;

        if (!sales || sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucune vente enregistrée</td></tr>';
            return;
        }

        tbody.innerHTML = sales.map(s => `
            <tr>
                <td><strong>#V-${s.id_vente}</strong></td>
                <td>${new Date(s.date_vente).toLocaleDateString()}</td>
                <td>${s.produit_nom || 'Produit'}</td>
                <td>${s.quantite_vendue} kg</td>
                <td>${parseFloat(s.montant_total).toLocaleString()} CFA</td>
                <td><span class="status-badge ${s.statut_vente === 'Complete' ? 'status-active' : 'status-pending'}">${s.statut_vente}</span></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error("Erreur chargement historique:", e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Erreur lors du chargement de l\'historique</td></tr>';
    }
}
