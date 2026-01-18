// formulaire.js - Gestion du formulaire de stock

document.addEventListener('DOMContentLoaded', function() {
    console.log('Formulaire de stock initialisé');
    
    // Initialiser la date à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date_entree').value = today;
    
    // Configurer le formulaire
    const form = document.getElementById('stockForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Configurer les boutons helpers
    document.querySelectorAll('.helper-btn').forEach(btn => {
        const action = btn.textContent.includes('exemple') ? 'remplirExemple' :
                      btn.textContent.includes('effacer') ? 'effacerFormulaire' : null;
        
        if (action) {
            btn.addEventListener('click', window[action]);
        }
    });
});

function handleSubmit(e) {
    e.preventDefault();
    
    // Récupérer les valeurs
    const formData = {
        numero: document.getElementById('numero_stock').value,
        categorie: document.getElementById('categorie').value,
        type: document.getElementById('type_poisson').value,
        quantite: parseFloat(document.getElementById('quantite').value),
        date: document.getElementById('date_entree').value,
        conditionnement: document.getElementById('conditionnement').value,
        qualite: document.getElementById('qualite').value,
        timestamp: new Date().toISOString()
    };
    
    // Validation
    if (!validateForm(formData)) {
        return;
    }
    
    // Afficher le chargement
    showNotification('⏳ Enregistrement en cours...', 'info');
    
    // Simuler l'enregistrement
    setTimeout(() => {
        saveStock(formData);
        showNotification('✅ Stock enregistré avec succès !', 'success');
        
        // Redirection après succès
        setTimeout(() => {
            window.location.href = 'stock.html';
        }, 1500);
        
    }, 1500);
}

function validateForm(data) {
    // Vérifier les champs obligatoires
    if (!data.numero || !data.categorie || !data.type || !data.quantite || !data.date) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires !', 'warning');
        return false;
    }
    
    // Vérifier la quantité
    if (data.quantite <= 0 || isNaN(data.quantite)) {
        showNotification('❌ La quantité doit être un nombre positif !', 'error');
        return false;
    }
    
    return true;
}

function saveStock(stockData) {
    console.log('Stock à enregistrer:', stockData);
    
    // Sauvegarder dans localStorage pour la démo
    const stocks = JSON.parse(localStorage.getItem('stocks') || '[]');
    stocks.push(stockData);
    localStorage.setItem('stocks', JSON.stringify(stocks));
    
    // Ici, tu ferais un vrai appel API :
    // fetch('/api/stocks', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(stockData)
    // });
}

function remplirExemple() {
    document.getElementById('numero_stock').value = 'STK-2026-' + 
        Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    document.getElementById('categorie').value = 'Crustacés';
    document.getElementById('type_poisson').value = 'Crevettes';
    document.getElementById('quantite').value = '150';
    document.getElementById('date_entree').value = new Date().toISOString().split('T')[0];
    document.getElementById('conditionnement').value = 'sous-vide';
    document.getElementById('qualite').value = 'A';
    
    showNotification('📋 Exemple chargé ! Modifiez les valeurs si nécessaire.', 'info');
}

function effacerFormulaire() {
    if (confirm('Voulez-vous vraiment effacer tous les champs ?')) {
        document.getElementById('stockForm').reset();
        
        // Réinitialiser la date à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date_entree').value = today;
        
        showNotification('🗑️ Formulaire réinitialisé', 'info');
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
                     type === 'warning' ? '#ffc107' : '#17a2b8'};
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
    
    // Ajouter l'animation CSS
    if (!document.querySelector('#form-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'form-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Supprimer après 5 secondes
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
    }, 5000);
}

// Exporter les fonctions
window.remplirExemple = remplirExemple;
window.effacerFormulaire = effacerFormulaire;
