-- Nettoyage
DELETE FROM produits_lot;
DELETE FROM produits_produit;
DELETE FROM logistique_commandeachat;
DELETE FROM logistique_entrepot;
DELETE FROM users_utilisateur;

-- 1. Entrepôts
INSERT INTO logistique_entrepot (ID_entrepot, Nom_entrepot, Localisation, Capacite) VALUES
(1, 'Entrepôt Principal', 'Douala Port', 10000),
(2, 'Entrepôt Yaoundé', 'Yaoundé Centre', 5000);

-- 2. Commandes
INSERT INTO logistique_commandeachat (ID_commande, Date_Commande, Quantite_Commande, Statut_Commande, Fournisseur, ID_entrepot) VALUES
(1, '2024-01-01', 100, 'LIVREE', 'Fournisseur A', 1),
(2, '2024-01-05', 50, 'EN_COURS', 'Fournisseur B', 2);

-- 3. Utilisateurs
-- INSERT pour utilisateurs (mots de passe en clair pour test) --
INSERT INTO users_utilisateur (ID_utilisateur, Nom, Email, role, mot_de_passe) VALUES
(1, 'admin', 'admin@halieutique.cm', 'ADMIN', 'admin123'),
(2, 'stock_manager', 'stock@halieutique.cm', 'STOCK', 'stock123'),
(3, 'logistics_manager', 'logistics@halieutique.cm', 'LOG', 'logistics123'),
(4, 'sales_manager', 'sales@halieutique.cm', 'VENTE', 'sales123');

-- 4. Produits
INSERT INTO produits_produit (ID_produit, Nom_produit, Type_produit, Unite) VALUES
(1, 'Thon Rouge', 'POISSON', 'kg'),
(2, 'Crevettes', 'CREVETTE', 'kg'),
(3, 'Moules', 'MOLLUSQUE', 'kg');

-- 5. Lots
INSERT INTO produits_lot (ID_lot, Date_Reception, Date_peremption, Quantite, Statut_Lot, ID_commande, ID_entrepot, ID_produit) VALUES
(1001, '2024-01-10', '2024-01-20', 50, 'STOCK', 1, 1, 1),
(1002, '2024-01-09', '2024-01-19', 30, 'STOCK', 1, 1, 2),
(1003, '2024-01-08', '2024-01-18', 40, 'LIVRAISON', 2, 2, 3);
