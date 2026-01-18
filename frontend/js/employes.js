// employes.js - Gestion des employés

document.addEventListener('DOMContentLoaded', function () {
    console.log('Page Employés initialisée');

    // Initialiser les composants
    initLogoutButton();
    updateUserInfo();
    setupForm();
    loadEmployesData();

    // Configurer la recherche
    setupSearch();

    showNotification('👥 Page de gestion des employés chargée', 'info');
});

function initLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
}

function updateUserInfo() {
    const userElement = document.getElementById('current-user');
    if (userElement) {
        const userName = localStorage.getItem('userName') || 'Administrateur';
        userElement.textContent = userName;
    }
}

function setupForm() {
    const form = document.getElementById('employeForm');
    if (form) {
        // Ajouter un champ mot de passe si manquant
        const emailGroup = document.getElementById('email').closest('.form-group');
        if (emailGroup && !document.getElementById('mot_de_passe')) {
            const pwdGroup = document.createElement('div');
            pwdGroup.className = 'form-group';
            pwdGroup.innerHTML = `
                <label for="mot_de_passe" class="form-label">Mot de passe temporaire *</label>
                <input type="password" id="mot_de_passe" class="form-control" required placeholder="Générer un mot de passe">
            `;
            emailGroup.after(pwdGroup);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            creerEmploye();
        });

        // Réinitialiser les permissions quand le rôle change
        document.getElementById('role').addEventListener('change', function () {
            updatePermissions(this.value);
        });
    }
}

function updatePermissions(role) {
    const rolePermissions = {
        'gestionnaire_stock': ['lecture_stock', 'ecriture_stock', 'gestion_commandes'],
        'gestionnaire_logistique': ['lecture_stock', 'gestion_commandes'],
        'gestionnaire_ventes': ['lecture_stock', 'rapports'],
        'admin': ['lecture_stock', 'ecriture_stock', 'gestion_commandes', 'rapports', 'administration']
    };

    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        checkbox.checked = rolePermissions[role]?.includes(checkbox.value) || false;
    });
}

async function creerEmploye() {
    // Récupérer les données du formulaire
    const formData = {
        nom: document.getElementById('nom').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        mot_de_passe: document.getElementById('mot_de_passe').value,
        departement: document.getElementById('departement').value,
        telephone: document.getElementById('telephone').value,
        date_embauche: document.getElementById('date_embauche').value
    };

    // Validation
    if (!formData.nom || !formData.email || !formData.role || !formData.mot_de_passe) {
        showNotification('⚠️ Veuillez remplir tous les champs obligatoires !', 'warning');
        return;
    }

    // Afficher le chargement
    showNotification('⏳ Création du compte employé sur le serveur...', 'info');

    try {
        const response = await api.request('/api/utilisateurs/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        showNotification(`✅ Employé ${formData.nom} créé avec succès !`, 'success');

        // Réinitialiser le formulaire
        document.getElementById('employeForm').reset();

        // Recharger la liste
        loadEmployesData();

    } catch (error) {
        console.error('Erreur création:', error);
        showNotification('❌ Erreur lors de la création de l\'employé', 'error');
    }
}

async function loadEmployesData() {
    const tbody = document.getElementById('employes-table-body');
    if (!tbody) return;

    // Afficher le chargement
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-row">
                <i class="fas fa-spinner fa-spin"></i> Chargement des données...
            </td>
        </tr>
    `;

    try {
        const employes = await api.request('/api/utilisateurs/');
        displayEmployes(employes);
        updateStats(employes);
    } catch (error) {
        console.error('Erreur chargement employes:', error);
        showNotification('❌ Impossible de charger la liste des employés', 'error');
    }
}

function displayEmployes(employes) {
    const tbody = document.getElementById('employes-table-body');
    if (!tbody) return;

    if (!employes || employes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-users-slash"></i> Aucun employé trouvé
                </td>
            </tr>
        `;
        return;
    }

    let html = '';

    employes.forEach(employe => {
        const id = employe.id_utilisateur;
        const statut = employe.statut || 'actif';
        const statusClass = statut === 'actif' ? 'status-active' : 'status-inactive';

        html += `
            <tr>
                <td><strong>#${id}</strong></td>
                <td>${employe.nom}</td>
                <td>${employe.email}</td>
                <td><span class="role-badge">${employe.role}</span></td>
                <td>${employe.departement || '-'}</td>
                <td>${formatDate(employe.date_embauche)}</td>
                <td><span class="status-badge ${statusClass}">${statut}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="voirEmploye(${id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="supprimerEmploye(${id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function updateStats(employes) {
    // Compter les statistiques
    const total = employes.length;
    const actifs = employes.filter(e => e.statut === 'actif').length;
    const roles = [...new Set(employes.map(e => e.role))].length;

    // Compter les nouveaux employés du mois
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const nouveauxMois = employes.filter(e => {
        if (!e.date_creation) return false;
        const date = new Date(e.date_creation);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // Mettre à jour l'affichage
    document.getElementById('total-employes').textContent = total;
    document.getElementById('employes-actifs').textContent = actifs;
    document.getElementById('roles').textContent = roles;
    document.getElementById('nouveaux-mois').textContent = nouveauxMois;
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            filterEmployes(searchTerm);
        });
    }
}

function filterEmployes(searchTerm) {
    const employes = JSON.parse(localStorage.getItem('employes') || '[]');

    if (!searchTerm) {
        displayEmployes(employes);
        return;
    }

    const filtered = employes.filter(employe =>
        employe.nom.toLowerCase().includes(searchTerm) ||
        employe.email.toLowerCase().includes(searchTerm) ||
        employe.role.toLowerCase().includes(searchTerm) ||
        employe.departement?.toLowerCase().includes(searchTerm)
    );

    displayEmployes(filtered);
}

async function voirEmploye(id) {
    try {
        const employe = await api.request(`/api/utilisateurs/${id}/`);
        if (employe) {
            alert(`Détails de l'utilisateur:\n\n` +
                `ID: #${employe.id_utilisateur}\n` +
                `Nom: ${employe.nom}\n` +
                `Email: ${employe.email}\n` +
                `Rôle: ${employe.role}`);
        }
    } catch (error) {
        console.error('Erreur détails:', error);
        showNotification('❌ Impossible de charger les détails', 'error');
    }
}

function editerEmploye(id) {
    showNotification('✏️ Fonctionnalité d\'édition à venir', 'info');
}

async function supprimerEmploye(id) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;

    try {
        await api.request(`/api/utilisateurs/${id}/`, {
            method: 'DELETE'
        });
        showNotification('🗑️ Utilisateur supprimé avec succès', 'success');
        loadEmployesData();
    } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('❌ Erreur lors de la suppression', 'error');
    }
}

function creerCompteEmploye() {
    // Faire défiler jusqu'au formulaire
    document.querySelector('.form-section').scrollIntoView({
        behavior: 'smooth'
    });

    // Focus sur le premier champ
    document.getElementById('nom').focus();
}

// Fonctions utilitaires
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatDate(dateString) {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
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

    // Ajouter l'animation CSS
    if (!document.querySelector('#employes-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'employes-notification-styles';
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
window.creerCompteEmploye = creerCompteEmploye;
window.voirEmploye = voirEmploye;
window.editerEmploye = editerEmploye;
window.supprimerEmploye = supprimerEmploye;
