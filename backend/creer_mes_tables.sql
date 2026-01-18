CREATE TABLE Utilisateur (
    ID_utilisateur INT PRIMARY KEY,
    Nom VARCHAR(100),
    Email VARCHAR(100),
    role VARCHAR(50),
    mot_de_passe VARCHAR(255),
    Departement VARCHAR(100),
    Telephone VARCHAR(20),
    Date_embauche DATE
);

CREATE TABLE Entrepot (
    ID_entrepot INT PRIMARY KEY,
    Nom_entrepot VARCHAR(100) NOT NULL,
    Localisation VARCHAR(200),
    Capacite INT
);

CREATE TABLE Commande_achat (
    ID_commande INT PRIMARY KEY,
    Date_Commande DATE NOT NULL,
    Quantite_Commande INT NOT NULL,
    Statut_Commande VARCHAR(50),
    Fournisseur VARCHAR(100),
    ID_entrepot INT NOT NULL,
    FOREIGN KEY (ID_entrepot) REFERENCES Entrepot(ID_entrepot)
);

CREATE TABLE Produit (
    ID_produit INT PRIMARY KEY,
    Nom_produit VARCHAR(100) NOT NULL,
    Type_produit VARCHAR(50), 
    Unite VARCHAR(20) 
);

CREATE TABLE Prevision (
    ID_prevision INT PRIMARY KEY,
    Periode VARCHAR(50),
    Quantite_prevision INT,
    Date_prevision DATE,
    ID_produit INT NOT NULL,
    FOREIGN KEY (ID_produit) REFERENCES Produit(ID_produit)
);

CREATE TABLE Lot (
    ID_lot INT PRIMARY KEY,
    Date_Reception DATE,
    Date_peremption DATE,
    Quantite INT,
    Statut_Lot VARCHAR(50),
    ID_commande INT NOT NULL,
    ID_entrepot INT NOT NULL,
    ID_produit INT NOT NULL,
    -- Nouveaux champs
    Temperature_reception DECIMAL(5,2),
    Qr_code TEXT,
    Scan_code_fournisseur VARCHAR(100),
    FOREIGN KEY (ID_commande) REFERENCES Commande_achat(ID_commande),
    FOREIGN KEY (ID_entrepot) REFERENCES Entrepot(ID_entrepot),
    FOREIGN KEY (ID_produit) REFERENCES Produit(ID_produit)
);

CREATE TABLE Livraison (
    ID_livraison INT PRIMARY KEY,
    date_livraison DATE,
    statut_Livraison VARCHAR(50),
    destination VARCHAR(200),
    ID_lot INT,
    -- Nouveaux champs
    Preuve_livraison VARCHAR(255), -- Chemin vers l'image
    Signature_client VARCHAR(255), -- Chemin vers signature
    Temperature_transport DECIMAL(5,2),
    Heure_livraison TIME,
    Responsable VARCHAR(100),
    FOREIGN KEY (ID_lot) REFERENCES Lot(ID_lot)
);

CREATE TABLE Incident (
    ID_incident SERIAL PRIMARY KEY,
    Type_incident VARCHAR(100),
    Description TEXT,
    Date_incident TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Statut VARCHAR(50) DEFAULT 'Ouvert',
    ID_livraison INT,
    FOREIGN KEY (ID_livraison) REFERENCES Livraison(ID_livraison)
);

CREATE TABLE Notification (
    ID_notification SERIAL PRIMARY KEY,
    Type_notification VARCHAR(100),
    Message TEXT,
    Date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ID_utilisateur INT,
    FOREIGN KEY (ID_utilisateur) REFERENCES Utilisateur(ID_utilisateur)
);

CREATE TABLE Mouvement_stock (
    ID_mouvement INT PRIMARY KEY,
    Date_mouvement DATE,
    Type_mouvement VARCHAR(50),
    Quantite INT,
    ID_lot INT NOT NULL,
    ID_utilisateur INT,
    FOREIGN KEY (ID_lot) REFERENCES Lot(ID_lot),
    FOREIGN KEY (ID_utilisateur) REFERENCES Utilisateur(ID_utilisateur)
);

CREATE TABLE Alerte (
    ID_alerte INT PRIMARY KEY,
    Type_alerte VARCHAR(50),
    Date_creation DATE,
    Niveau INT,
    Message TEXT,
    ID_lot INT,
    FOREIGN KEY (ID_lot) REFERENCES Lot(ID_lot)
);

CREATE TABLE Vente (
    ID_vente INT PRIMARY KEY,
    Date_vente DATE,
    montant_total DECIMAL(10,2),
    Statut_vente VARCHAR(50),
    ID_utilisateur INT,
    FOREIGN KEY (ID_utilisateur) REFERENCES Utilisateur(ID_utilisateur)
);

CREATE TABLE LigneVente (
    ID_LigneVente INT PRIMARY KEY,
    Quantite_vendue INT,
    Prix_unitaire DECIMAL(10,2),
    ID_vente INT NOT NULL,
    ID_produit INT NOT NULL,
    FOREIGN KEY (ID_vente) REFERENCES Vente(ID_vente),
    FOREIGN KEY (ID_produit) REFERENCES Produit(ID_produit)
);
