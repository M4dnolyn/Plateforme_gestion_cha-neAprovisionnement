-- Nettoyage
DELETE FROM produits_lot;
DELETE FROM produits_produit;
DELETE FROM logistique_commandeachat;
DELETE FROM logistique_entrepot;
DELETE FROM users_utilisateur;

-- 1. Entrepôts
INSERT INTO logistique_entrepot (ID_entrepot, Nom_entrepot, Localisation, Capacite) VALUES
(1, 'Entrepôt Principal - Douala', 'Douala, Zone Portuaire', 10000),
(2, 'Entrepôt Secondaire - Yaoundé', 'Yaoundé, Centre-ville', 5000);

-- 2. Commandes d'achat
INSERT INTO logistique_commandeachat (ID_commande, Date_Commande, Quantite_Commande, Statut_Commande, Fournisseur, ID_entrepot) VALUES
(1, '2024-01-01', 100, 'LIVREE', 'Fournisseur Ocean SA', 1),
(2, '2024-01-05', 50, 'EN_COURS', 'Pêcheries du Cameroun', 2),
(3, '2024-01-03', 75, 'VALIDE', 'Aquaculture Tropicale', 1);

-- 3. Utilisateurs 
INSERT INTO users_utilisateur (ID_utilisateur, Nom, Email, role, mot_de_passe) VALUES
(1, 'admin', 'admin@halieutique.cm', 'ADMIN', 'pbkdf2_sha256$600000$abc123...'),
(2, 'stock_manager', 'stock@halieutique.cm', 'STOCK', 'pbkdf2_sha256$600000$def456...'),
(3, 'logistics_manager', 'logistics@halieutique.cm', 'LOG', 'pbkdf2_sha256$600000$ghi789...'),
(4, 'sales_manager', 'sales@halieutique.cm', 'VENTE', 'pbkdf2_sha256$600000$jkl012...');

-- 4. Produits
INSERT INTO produits_produit (ID_produit, Nom_produit, Type_produit, Unite) VALUES
(1, 'Thon Rouge', 'POISSON', 'kg'),
(2, 'Crevettes Tigrées', 'CREVETTE', 'kg'),
(3, 'Moules de Bouchot', 'MOLLUSQUE', 'kg'),
(4, 'Saumon Atlantique', 'POISSON', 'kg'),
(5, 'Huîtres Creuses', 'MOLLUSQUE', 'pièce');

-- 5. Lots (MAINTENANT les clés étrangères existent)
INSERT INTO produits_lot (ID_lot, Date_Reception, Date_peremption, Quantite, Statut_Lot, ID_commande, ID_entrepot, ID_produit) VALUES
(1001, '2024-01-10', '2024-01-20', 50, 'STOCK', 1, 1, 1),
(1002, '2024-01-09', '2024-01-19', 30, 'STOCK', 1, 1, 2),
(1003, '2024-01-08', '2024-01-18', 40, 'LIVRAISON', 2, 2, 3),
(1004, '2024-01-07', '2024-01-17', 25, 'STOCK', 3, 1, 4),
(1005, '2024-01-06', '2024-01-16', 60, 'VENDU', 1, 1, 5);

-- 6. Livraisons
INSERT INTO logistique_livraison (ID_livraison, date_livraison, statut_Livraison, destination, ID_lot) VALUES
(1, '2024-01-15', 'EN_ROUTE', 'Supermaré HyperMart', 1003),
(2, '2024-01-12', 'LIVREE', 'Restaurant Le Poissonnier', 1005);

-- 7. Ventes
INSERT INTO ventes_vente (ID_vente, Date_vente, montant_total, Statut_vente, ID_utilisateur) VALUES
(1, '2024-01-05', 1500.00, 'PAYEE', 4),
(2, '2024-01-06', 875.50, 'EN_ATTENTE', 4);

-- 8. Lignes de vente
INSERT INTO ventes_lignevente (ID_LigneVente, Quantite_vendue, Prix_unitaire, ID_vente, ID_produit) VALUES
(1, 10, 150.00, 1, 1),
(2, 5, 35.50, 1, 2),
(3, 20, 25.00, 2, 3);

-- 9. Mouvements de stock
INSERT INTO tracabilite_mouvementstock (ID_mouvement, Date_mouvement, Type_mouvement, Quantite, ID_lot, ID_utilisateur) VALUES
(1, '2024-01-10', 'ENTREE', 50, 1001, 2),
(2, '2024-01-09', 'ENTREE', 30, 1002, 2),
(3, '2024-01-11', 'SORTIE', 10, 1001, 2);

-- 10. Alertes
INSERT INTO tracabilite_alerte (ID_alerte, Type_alerte, Date_creation, Niveau, Message, ID_lot) VALUES
(1, 'PEREMPTION', '2024-01-15', 2, 'Lot approchant de la date de péremption', 1001),
(2, 'STOCK_BAS', '2024-01-14', 1, 'Stock critique pour crevettes', 1002);

-- 11. Prévisions
INSERT INTO ventes_prevision (ID_prevision, Periode, Quantite_prevision, Date_prevision, ID_produit) VALUES
(1, 'JANVIER_2024', 200, '2024-01-01', 1),
(2, 'JANVIER_2024', 150, '2024-01-01', 2),
(3, 'FEVRIER_2024', 180, '2024-02-01', 1);
