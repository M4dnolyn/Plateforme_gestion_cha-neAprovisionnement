@echo off
echo ===================================================
echo   Installation de la Plateforme Halieutique (Win)
echo ===================================================

cd backend

:: 1. Création de l'environnement virtuel
if not exist "venv" (
    echo [1/5] Creation de l'environnement virtuel...
    python -m venv venv
)

:: 2. Activation
echo [2/5] Activation de l'environnement...
call venv\Scripts\activate

:: 3. Installation des dépendances
echo [3/5] Installation des dependances...
pip install -r requirements.txt

:: 4. Migrations et Données
echo [4/5] Initialisation de la Base de Donnees...
echo.
echo ATTENTION : Assurez-vous d'avoir cree la base 'halieutique_db' dans PostgreSQL
echo et d'avoir mis a jour le fichier settings.py ou .env avec votre mot de passe.
echo.
pause

:: On tente les migrations Django standard
python manage.py migrate

:: On essaye d'importer les données SQL (Nécessite psql dans le PATH, sinon afficher un message)
python manage.py dbshell < insert_all_data.sql 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Impossible d'importer automatiquement les donnees via 'dbshell'.
    echo Veuillez executer le fichier 'backend/insert_all_data.sql' manuellement via pgAdmin.
) else (
    echo [SUCCES] Donnees importees.
)

:: 5. Lancement
echo.
echo [5/5] Lancement du serveur...
start http://127.0.0.1:8000/frontend/login.html
python manage.py runserver

pause
