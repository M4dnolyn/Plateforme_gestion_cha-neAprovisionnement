-- Insertion des utilisateurs avec mots de passe hashés
DELETE FROM users_utilisateur;
INSERT INTO users_utilisateur (ID_utilisateur, Nom, Email, role, mot_de_passe) VALUES
(1, 'Administrateur', 'admin@halieutique.cm', 'ADMIN', 'pbkdf2_sha256$1200000$CBnvXtM6PAtF6ebhVVw8k0$/V08QBoB6hg6iqrghWakdzcDL1wekwJE8UPlceZa6ms='),
(2, 'Gestionnaire Stock', 'stock@halieutique.cm', 'STOCK', 'pbkdf2_sha256$1200000$GtMTYNjn1ebo8c06DFuKez$T4mHCDClzjdIqxLrK7AAY629tBIQ9ibz7BR5M74AHM8='),
(3, 'Logistique', 'logistics@halieutique.cm', 'LOG', 'pbkdf2_sha256$1200000$EnMX9vx0BCJUnWQWY1YGW7$MllR5onX8dN83J3CiAx9qVWBl+/pCDSC94pI1VcKWBI='),
(4, 'Ventes', 'sales@halieutique.cm', 'VENTE', 'pbkdf2_sha256$1200000$pv1o5uCJuL1wXGGKQsc96N$BR0Aqm0O7jLSrsXXNQEBEy8JkAYEVqwPw+smMtI4G1c=');

-- Insertion des données de base
DELETE FROM logistique_entrepot;
INSERT INTO logistique_entrepot (ID_entrepot, Nom_entrepot, Localisation, Capacite) VALUES
(1, 'Entrepôt Principal - Douala', 'Douala, Zone Portuaire', 10000),
(2, 'Entrepôt Secondaire - Yaoundé', 'Yaoundé, Centre-ville', 5000);

DELETE FROM produits_produit;
INSERT INTO produits_produit (ID_produit, Nom_produit, Type_produit, Unite) VALUES
(1, 'Thon Rouge', 'POISSON', 'kg'),
(2, 'Crevettes Tigrées', 'CREVETTE', 'kg'),
(3, 'Moules de Bouchot', 'MOLLUSQUE', 'kg'),
(4, 'Saumon Atlantique', 'POISSON', 'kg');

DELETE FROM logistique_commandeachat;
INSERT INTO logistique_commandeachat (ID_commande, Date_Commande, Quantite_Commande, Statut_Commande, Fournisseur, ID_entrepot) VALUES
(1, '2024-01-01', 100, 'LIVREE', 'Fournisseur Ocean SA', 1),
(2, '2024-01-05', 50, 'EN_COURS', 'Pêcheries du Cameroun', 2);

DELETE FROM produits_lot;
INSERT INTO produits_lot (ID_lot, Date_Reception, Date_peremption, Quantite, Statut_Lot, ID_commande, ID_entrepot, ID_produit) VALUES
(1001, '2024-01-10', '2024-01-20', 50, 'STOCK', 1, 1, 1),
(1002, '2024-01-09', '2024-01-19', 30, 'STOCK', 1, 1, 2);
