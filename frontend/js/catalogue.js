// catalogue.js - Gestion du catalogue

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Catalogue initialisé');
    
    // Configurer les filtres
    setupFilters();
    
    // Charger les données
    loadCatalogueData();
    
    // Afficher notification
    showNotification('🐟 Catalogue des produits chargé', 'info');
});

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            filterProducts(category);
        });
    });
}

function filterProducts(category) {
    currentFilter = category;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    // Filtrer les sections
    document.querySelectorAll('.category-section').forEach(section => {
        const sectionCategory = section.dataset.category;
        
        if (category === 'all' || sectionCategory === category) {
            section.style.display = 'block';
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 10);
        } else {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            setTimeout(() => {
                section.style.display = 'none';
            }, 300);
        }
    });
    
    showNotification(`Filtre activé: ${getCategoryName(category)}`);
}

function getCategoryName(category) {
    const names = {
        'all': 'Tous les produits',
        'crustaces': 'Crustacés',
        'poissons_mer': 'Poissons de mer',
        'poissons_douce': 'Poissons d\'eau douce'
    };
    return names[category] || category;
}

function ajouterAuStock(nomProduit) {
    const quantite = prompt(`Quantité de ${nomProduit} à ajouter au stock (en kg):`, "10");
    
    if (quantite && !isNaN(quantite) && quantite > 0) {
        showNotification(`✅ ${quantite}kg de ${nomProduit} ajoutés au stock`, 'success');
        
        // Sauvegarder la commande
        const commande = {
            produit: nomProduit,
            quantite: parseFloat(quantite),
            date: new Date().toISOString()
        };
        
        // Sauvegarder dans localStorage
        const commandes = JSON.parse(localStorage.getItem('catalogueCommandes') || '[]');
        commandes.push(commande);
        localStorage.setItem('catalogueCommandes', JSON.stringify(commandes));
        
        // Redirection vers le formulaire
        setTimeout(() => {
            window.location.href = `formulaire_stock.html?produit=${encodeURIComponent(nomProduit)}&quantite=${quantite}`;
        }, 1000);
    } else if (quantite !== null) {
        showNotification('❌ Veuillez entrer une quantité valide', 'error');
    }
}

function voirDetails(nomProduit) {
    showNotification(`📋 Détails de ${nomProduit}`, 'info');
    
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="color: #2c7be5; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-info-circle"></i> Détails: ${nomProduit}
            </h3>
            <p>Informations détaillées sur ${nomProduit}:</p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>Prix moyen: ₣ 8.500/kg</li>
                <li>Stock actuel: 150 kg</li>
                <li>Qualité: A+</li>
                <li>Dernière mise à jour: Aujourd'hui</li>
                <li>Fournisseur: Ferme Mokpokpo</li>
            </ul>
            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button onclick="fermerModal()" class="btn btn-secondary" style="flex: 1;">
                    Fermer
                </button>
                <button onclick="ajouterAuStock('${nomProduit}')" class="btn btn-primary" style="flex: 1;">
                    Ajouter au stock
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            fermerModal();
        }
    });
}

function fermerModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function loadCatalogueData() {
    // Charger les données depuis localStorage ou API
    console.log('Chargement des données du catalogue...');
    
    // Mettre à jour les statistiques si disponibles
    const stats = JSON.parse(localStorage.getItem('catalogueStats'));
    if (stats) {
        updateStats(stats);
    }
}

function updateStats(stats) {
    // Mettre à jour les éléments de statistiques
    const elements = {
        'produits-disponibles': stats.totalProduits || 24,
        'categories': stats.categories || 3,
        'en-stock': stats.enStock || 15,
        'nouveautes': stats.nouveautes || 9
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.querySelector(`[data-stat="${id}"]`);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : 
                     type === 'error' ? '#dc3545' : '#2c7be5'};
        color: white;
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
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            margin-left: 10px;
            cursor: pointer;
            color: white;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Ajouter l'animation CSS
    if (!document.querySelector('#catalogue-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'catalogue-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Exporter les fonctions
window.ajouterAuStock = ajouterAuStock;
window.voirDetails = voirDetails;
window.fermerModal = fermerModal;
window.filterProducts = filterProducts;
