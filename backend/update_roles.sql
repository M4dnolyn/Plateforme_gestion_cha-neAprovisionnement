-- Mise à jour des rôles pour correspondre au frontend
UPDATE users_utilisateur SET role = 'admin' WHERE email = 'admin@halieutique.cm';
UPDATE users_utilisateur SET role = 'gestionnaire_stock' WHERE email = 'stock@halieutique.cm';
UPDATE users_utilisateur SET role = 'gestionnaire_logistique' WHERE email = 'logistics@halieutique.cm';
UPDATE users_utilisateur SET role = 'gestionnaire_ventes' WHERE email = 'sales@halieutique.cm';
