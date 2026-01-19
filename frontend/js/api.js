// api.js - Communication avec l'API Django

const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000',
    TIMEOUT: 30000,
    ENDPOINTS: {
        // Authentification
        LOGIN: '/api/users/login/',
        LOGOUT: '/api/auth/logout/',
        REFRESH_TOKEN: '/api/token/refresh/',

        // Utilisateurs
        USERS: '/api/utilisateurs/',
        USER_PROFILE: '/api/users/profile/',

        // Stocks
        STOCKS: '/api/lots/',
        STOCK_STATS: '/api/lots/stats/',
        STOCK_MOVEMENTS: '/api/mouvements/',
        STOCK_ALERTS: '/api/alertes/',

        // Produits
        PRODUCTS: '/api/produits/',
        PRODUCT_CATEGORIES: '/api/products/categories/',

        // Livraisons
        DELIVERIES: '/api/livraisons/',
        DELIVERY_TRACKING: '/api/livraisons/tracking/',

        // Ventes
        SALES: '/api/ventes/',
        SALES_STATS: '/api/ventes/stats/',

        // Prévisions
        FORECASTS: '/api/previsions/',

        // Rapports
        REPORTS: '/api/reports/'
    }
};

class API {
    constructor() {
        this.token = localStorage.getItem('access_token') || localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        const isAuthEndpoint = endpoint.includes('/users/login/') || endpoint.includes('/token/refresh/');

        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (this.token && !isAuthEndpoint) {
            defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        const finalOptions = {
            ...options,
            headers: { ...defaultHeaders, ...(options.headers || {}) },
            timeout: API_CONFIG.TIMEOUT
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Gérer les réponses non-OK
            if (!response.ok) {
                // Tentative de refresh token si 401 (mais pas pour les endpoints d'auth eux-mêmes)
                if (response.status === 401 && this.refreshToken && !isAuthEndpoint) {
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        // Réessayer la requête avec le nouveau token
                        finalOptions.headers.Authorization = `Bearer ${this.token}`;
                        return this.request(endpoint, finalOptions);
                    }
                }

                const error = await this.parseError(response);
                throw error;
            }

            // Parser la réponse
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            console.error(`API Request failed (${endpoint}):`, error);
            throw this.normalizeError(error);
        }
    }

    async parseError(response) {
        try {
            const errorData = await response.json();
            return {
                status: response.status,
                message: errorData.detail || errorData.message || `HTTP ${response.status}`,
                data: errorData
            };
        } catch {
            return {
                status: response.status,
                message: `HTTP ${response.status}: ${response.statusText}`
            };
        }
    }

    normalizeError(error) {
        if (error.name === 'AbortError') {
            return {
                status: 408,
                message: 'Request timeout'
            };
        }

        if (error.status) {
            return error;
        }

        return {
            status: 0,
            message: 'Network error or server unreachable'
        };
    }

    // Authentification
    async login(credentials) {
        // Nettoyer les anciens tokens pour éviter les conflits
        this.clearTokens();

        try {
            const data = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            // Stocker les tokens
            this.setTokens(data.access, data.refresh);

            return {
                success: true,
                tokens: {
                    access: data.access,
                    refresh: data.refresh
                },
                user: data.user
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async logout() {
        try {
            await this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
                method: 'POST'
            });
        } finally {
            this.clearTokens();
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        try {
            const data = await this.request(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
                method: 'POST',
                body: JSON.stringify({ refresh: this.refreshToken })
            });

            this.setTokens(data.access, this.refreshToken);
            return true;

        } catch (error) {
            this.clearTokens();
            return false;
        }
    }

    // Gestion des tokens
    setTokens(accessToken, refreshToken) {
        this.token = accessToken;
        this.refreshToken = refreshToken;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('token', accessToken);  // Backward compatibility
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('refreshToken', refreshToken);  // Backward compatibility

        // Stocker l'expiration (1 heure par défaut)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        localStorage.setItem('tokenExpiry', expiry.toISOString());
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;

        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userData');
    }

    isTokenValid() {
        const expiry = localStorage.getItem('tokenExpiry');
        if (!expiry || !this.token) return false;

        return new Date(expiry) > new Date();
    }

    // Profil utilisateur
    async getUserProfile() {
        try {
            const profile = await this.request(API_CONFIG.ENDPOINTS.USER_PROFILE);
            localStorage.setItem('userData', JSON.stringify(profile));
            return profile;
        } catch (error) {
            console.warn('Could not fetch user profile:', error);
            return null;
        }
    }

    // Stocks
    async getStocks(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `${API_CONFIG.ENDPOINTS.STOCKS}?${query}` : API_CONFIG.ENDPOINTS.STOCKS;
        return this.request(endpoint);
    }

    async getStock(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.STOCKS}${id}/`);
    }

    async createStock(stockData) {
        return this.request(API_CONFIG.ENDPOINTS.STOCKS, {
            method: 'POST',
            body: JSON.stringify(stockData)
        });
    }

    async updateStock(id, stockData) {
        return this.request(`${API_CONFIG.ENDPOINTS.STOCKS}${id}/`, {
            method: 'PUT',
            body: JSON.stringify(stockData)
        });
    }

    async deleteStock(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.STOCKS}${id}/`, {
            method: 'DELETE'
        });
    }

    async getStockStats() {
        return this.request(API_CONFIG.ENDPOINTS.STOCK_STATS);
    }

    async getStockMovements(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `${API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS}?${query}` : API_CONFIG.ENDPOINTS.STOCK_MOVEMENTS;
        return this.request(endpoint);
    }

    async getStockAlerts() {
        return this.request(API_CONFIG.ENDPOINTS.STOCK_ALERTS);
    }

    // Produits
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${query}` : API_CONFIG.ENDPOINTS.PRODUCTS;
        return this.request(endpoint);
    }

    async getProductCategories() {
        return this.request(API_CONFIG.ENDPOINTS.PRODUCT_CATEGORIES);
    }

    // Livraisons
    async getDeliveries(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `${API_CONFIG.ENDPOINTS.DELIVERIES}?${query}` : API_CONFIG.ENDPOINTS.DELIVERIES;
        return this.request(endpoint);
    }

    // Ventes
    async getSales(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `${API_CONFIG.ENDPOINTS.SALES}?${query}` : API_CONFIG.ENDPOINTS.SALES;
        return this.request(endpoint);
    }

    // Méthodes utilitaires
    async uploadFile(endpoint, file, fieldName = 'file') {
        const formData = new FormData();
        formData.append(fieldName, file);

        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': this.token ? `Bearer ${this.token}` : ''
            },
            body: formData
        });
    }

    // Simulation pour le développement
    async simulateRequest(data, delay = 1000, success = true) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (success) {
                    resolve({
                        success: true,
                        data: data,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject({
                        status: 500,
                        message: 'Simulated error'
                    });
                }
            }, delay);
        });
    }
}

// Singleton instance
const api = new API();

// Exporter pour utilisation globale
window.API = API;
window.api = api;

// Helper pour les appels API courants
window.fetchAPI = async (endpoint, options = {}) => {
    return api.request(endpoint, options);
};

// Initialiser l'API au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier le token au démarrage
    if (api.token && !api.isTokenValid()) {
        api.refreshAccessToken().catch(() => {
            // Si le refresh échoue, déconnecter
            api.clearTokens();
        });
    }

    console.log('API module initialized');
});
