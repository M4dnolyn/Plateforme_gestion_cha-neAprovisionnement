# Guide d'Installation sur Windows (avec PostgreSQL)

Ce guide permet d'installer et de lancer le projet sur un autre PC Windows disposant de PostgreSQL.

## 1. Prérequis
- **Python** (version 3.10 ou plus) : [Télécharger Python](https://www.python.org/downloads/) (Cochez "Add Python to PATH" à l'installation).
- **Git** : [Télécharger Git](https://git-scm.com/downloads).
- **PostgreSQL** : Doit être installé et en cours d'exécution.

## 2. Récupération du Projet
Ouvrez un terminal (PowerShell ou CMD) et lancez :
```cmd
git clone https://github.com/VOTRE_NOM_UTILISATEUR/Plateforme_gestion_cha-neAprovisionnement.git
cd Plateforme_gestion_cha-neAprovisionnement
```

## 3. Configuration de la Base de Données
1. Ouvrez **pgAdmin** ou le shell SQL (`psql`).
2. Créez une nouvelle base de données nommée `halieutique_db`.
3. Notez le **mot de passe** de votre utilisateur `postgres`.

## 4. Configuration de l'Environnement
Dans le dossier `backend`, créez un fichier nommé `.env` (sans nom avant le point) et ajoutez-y ceci (adaptez le mot de passe) :

```ini
DB_NAME=halieutique_db
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRES
DB_HOST=localhost
DB_PORT=5432
```

> **Note :** Si vous ne voulez pas créer de fichier `.env`, vous devrez modifier directement le fichier `backend/backend/settings.py` pour y mettre le bon mot de passe à la ligne `DATABASES`.

## 5. Installation et Lancement
Lancez le script d'installation automatique (double-cliquez sur `windows_setup.bat` ou lancez-le depuis le terminal) :

```cmd
windows_setup.bat
```

Ce script va :
1. Créer un environnement virtuel Python.
2. Installer les dépendances.
3. Configurer la base de données (création des tables).
4. Insérer les données de démo.
5. Lancer le serveur.

---

## Lancement manuel (Alternative)
Si le script ne fonctionne pas, faites ceci manuellement dans le terminal :

1. **Installer les dépendances** :
   ```cmd
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

2. **Initialiser la base de données** :
   Il faut d'abord créer les tables Django de base, puis vos tables métier.
   ```cmd
   python backend/manage.py migrate
   ```
   *Si cela ne crée pas toutes les tables (car les migrations sont désactivées), vous pouvez forcer l'exécution du script SQL via votre outil de base de données (pgAdmin) en exécutant le contenu de `backend/creer_mes_tables.sql` puis `backend/insert_all_data.sql`.*

3. **Lancer le serveur** :
   ```cmd
   python backend/manage.py runserver
   ```

Accédez ensuite à la plateforme sur : [http://127.0.0.1:8000/frontend/login.html](http://127.0.0.1:8000/frontend/login.html)
