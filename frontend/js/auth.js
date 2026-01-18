// auth.js - Authentification avec API Django (version corrigée)

// On utilise l'instance globale 'api' créée dans api.js
// Si elle n'existe pas, on en crée une (cas où api.js n'est pas chargé)
const apiInstance = window.api || new API();

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;

      // Validation
      if (!email || !password || !role) {
        showAlert("Veuillez remplir tous les champs", "error");
        return;
      }

      // Validation email basique
      if (!email.includes("@")) {
        showAlert("Veuillez entrer une adresse email valide", "error");
        return;
      }

      await authenticateUser(email, password, role);
    });
  }
});

async function authenticateUser(email, password, role) {
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Afficher le chargement
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  submitBtn.disabled = true;

  try {
    // Appel API RÉEL vers Django
    const credentials = {
      email: email, // Utilisateur entre un email
      password: password,
      role: role,
    };

    const result = await apiInstance.login(credentials);

    if (result.success) {
      // Stocker les informations utilisateur
      const userData = result.user;

      // Stocker les tokens
      if (result.tokens.access) {
        localStorage.setItem("access_token", result.tokens.access);
      }
      if (result.tokens.refresh) {
        localStorage.setItem("refresh_token", result.tokens.refresh);
      }
      if (result.tokens.token) {
        localStorage.setItem("token", result.tokens.token);
      }

      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", email.split("@")[0]);
      localStorage.setItem("userData", JSON.stringify(userData));

      showAlert("✅ Connexion réussie ! Redirection...", "success");

      // Rediriger vers le dashboard approprié
      setTimeout(() => {
        redirectToDashboard(role);
      }, 1500);
    } else {
      throw new Error(result.error || "Échec de l'authentification");
    }
  } catch (error) {
    console.error("Erreur d'authentification:", error);

    // Afficher l'erreur
    let errorMessage = "Erreur de connexion";

    if (
      error.message.includes("401") ||
      error.message.includes("Invalid credentials") ||
      error.message.includes("invalides") ||
      error.message.includes("No active account")
    ) {
      errorMessage = "Identifiants incorrects";
    } else if (
      error.message.includes("404") ||
      error.message.includes("Not Found")
    ) {
      errorMessage =
        "Serveur API non disponible. Vérifiez que Django tourne sur le port 8000.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("unreachable")
    ) {
      errorMessage =
        "Serveur inaccessible. Vérifiez votre connexion et que Django tourne.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Délai d'attente dépassé";
    } else if (error.message.includes("username")) {
      errorMessage =
        "Format d'identifiant incorrect. Utilisez votre nom d'utilisateur ou email complet.";
    }

    showAlert(`❌ ${errorMessage}`, "error");

    // Proposer la démo UNIQUEMENT si le serveur est injoignable (status 0)
    if (error.status === 0 || error.message.includes("Network error")) {
      setTimeout(() => {
        if (
          confirm(
            "L'API Django n'est pas disponible. Voulez-vous utiliser la version de démo ?"
          )
        ) {
          useDemoAuth(email, password, role);
        }
      }, 1000);
    }

    // Réactiver le bouton
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function useDemoAuth(email, password, role) {
  // Simulation d'authentification pour la démo
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userRole", role);
  localStorage.setItem("userName", email.split("@")[0]);
  localStorage.setItem("token", "demo-token-" + Date.now());
  localStorage.setItem("demo_mode", "true");

  showAlert("🔧 Mode démo activé - Connexion simulée", "warning");

  setTimeout(() => {
    redirectToDashboard(role);
  }, 1000);
}

function redirectToDashboard(role) {
  console.log("Redirection pour le rôle:", role);

  const roleRoutes = {
    admin: "dashboard-admin.html",
    gestionnaire_stock: "stock.html",
    gestionnaire_logistique: "dashboard-logistique.html",
    gestionnaire_ventes: "dashboard-ventes.html",
  };

  const target = roleRoutes[role] || "index.html";
  window.location.href = target;
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  alert.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

  alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s;
        padding: 15px 25px;
        border-radius: 8px;
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

  // Styles de couleur selon le type
  const alertStyles = {
    success:
      "background: #d4edda; color: #155724; border-left: 4px solid #28a745;",
    error:
      "background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545;",
    warning:
      "background: #fff3cd; color: #856404; border-left: 4px solid #ffc107;",
    info: "background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8;",
  };

  alert.style.cssText += alertStyles[type] || alertStyles.info;

  document.body.appendChild(alert);

  // Supprimer après 5 secondes
  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 300);
  }, 5000);
}

// Fonction de déconnexion
function logout() {
  if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
    // Appeler l'API logout si disponible
    api.logout().catch(() => {
      console.log("Logout API failed, clearing local storage");
    });

    // Nettoyer le localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userData");
    localStorage.removeItem("demo_mode");

    // Rediriger vers login
    window.location.href = "login.html";
  }
}

// Tester la connexion API au démarrage
window.addEventListener("load", () => {
  // Optionnel: Tester si l'API est disponible
  fetch("http://localhost:8000/api/token/", { method: "OPTIONS" })
    .then(() => {
      console.log("✅ API Django disponible");
    })
    .catch(() => {
      console.warn("⚠️ API Django non disponible");
    });
});

// Exporter pour une utilisation globale
window.auth = {
  authenticateUser,
  logout,
  showAlert,
};

// Ajouter les styles pour les animations
if (!document.querySelector("#auth-styles")) {
  const style = document.createElement("style");
  style.id = "auth-styles";
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
        
        .fa-spinner {
            animation: fa-spin 1s infinite linear;
        }
        
        @keyframes fa-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
  document.head.appendChild(style);
}
