// config.js - Configuration de l'application

const Config = {
    // API endpoints (à configurer selon ton backend)
    API_BASE_URL: 'http://localhost:8000/api',

    // Rôles utilisateurs
    ROLES: {
        ADMIN: 'admin',
        STOCK: 'gestionnaire_stock',
        LOGISTICS: 'gestionnaire_logistique',
        SALES: 'gestionnaire_ventes'
    },

    // Noms affichables des rôles
    ROLE_NAMES: {
        admin: 'Administrateur',
        gestionnaire_stock: 'Gestionnaire Stock',
        gestionnaire_logistique: 'Gestionnaire Logistique',
        gestionnaire_ventes: 'Gestionnaire Ventes'
    },

    // Couleurs par rôle
    ROLE_COLORS: {
        admin: '#6a11cb',
        gestionnaire_stock: '#2ecc71',
        gestionnaire_logistique: '#e67e22',
        gestionnaire_ventes: '#e74c3c'
    },

    // Produits halieutiques
    PRODUCT_TYPES: {
        CRUSTACES: 'Crustacés',
        POISSONS_MER: 'Poissons de mer',
        POISSONS_DOUCE: 'Poissons d\'eau douce'
    },

    // Unités
    UNITS: ['kg', 'g', 'pièce', 'carton', 'caisse'],

    // États des livraisons
    DELIVERY_STATUS: {
        PENDING: 'En attente',
        IN_TRANSIT: 'En transit',
        DELIVERED: 'Livrée',
        CANCELLED: 'Annulée'
    },

    // Version
    VERSION: '1.0.0',

    // Temps d'expiration du token (en heures)
    TOKEN_EXPIRY_HOURS: 24
};

// Exporter
window.Config = Config;
