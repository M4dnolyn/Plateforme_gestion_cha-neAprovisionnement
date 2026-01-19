# backend/db_router.py

class DatabaseRouter:
    """
    Routeur pour séparer :
    - SQLite : Django core + app users (authentification)
    - PostgreSQL : apps métier (produits, logistique, tracabilite, ventes)
    """
    
    # Apps qui vont dans POSTGRESQL (uniquement les apps métier)
    postgres_apps = [
        'produits',      # Produits halieutiques
        'logistique',    # Logistique
        'tracabilite',   # Traçabilité
        'ventes',        # Ventes
        # NOTE: 'users' est DANS SQLITE pour l'authentification Django !
    ]
    
    # Apps Django CORE qui DOIVENT aller dans SQLite
    sqlite_apps = [
        'admin',
        'auth',          # CONTIENT User, Group, Permission
        'contenttypes',
        'sessions',
        'authtoken',     # REST Framework Token
    ]
    
    # App users contient à la fois:
    # - Django User (dans SQLite via auth)
    # - Utilisateur métier (dans PostgreSQL)
    # Le modèle Utilisateur ira dans PostgreSQL
    postgres_apps = postgres_apps + ['users']
    
    def db_for_read(self, model, **hints):
        """Détermine quelle base utiliser pour la lecture."""
        app_label = model._meta.app_label
        
        # 1. Apps métier -> PostgreSQL
        if app_label in self.postgres_apps:
            return 'postgres'
        
        # 2. Apps Django core + users -> SQLite
        elif app_label in self.sqlite_apps:
            return 'default'
        
        # 3. Apps REST Framework et autres -> SQLite par défaut
        else:
            return 'default'
    
    def db_for_write(self, model, **hints):
        """Détermine quelle base utiliser pour l'écriture."""
        app_label = model._meta.app_label
        
        if app_label in self.postgres_apps:
            return 'postgres'
        elif app_label in self.sqlite_apps:
            return 'default'
        else:
            return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Permet les relations seulement si les objets sont dans la même base.
        """
        app1 = obj1._meta.app_label
        app2 = obj2._meta.app_label
        
        # Détermine la base de chaque objet
        db1 = 'postgres' if app1 in self.postgres_apps else 'default'
        db2 = 'postgres' if app2 in self.postgres_apps else 'default'
        
        # Permet la relation seulement si dans la même base
        return db1 == db2
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Où appliquer les migrations.
        
        IMPORTANT : Désactive les migrations pour les apps métier (PostgreSQL)
        car tes tables existent déjà !
        """
        
        # 1. Apps métier (PostgreSQL) - PAS de migrations Django
        if app_label in self.postgres_apps:
            # Tes tables existent déjà dans PostgreSQL
            # Django ne doit PAS créer de migrations
            return False  # ⚠️ IMPORTANT : False pour désactiver les migrations
        
        # 2. Apps Django core + users (SQLite) - migrations activées
        elif app_label in self.sqlite_apps:
            return db == 'default'
        
        # 3. Apps tierces (comme rest_framework) - migrations dans SQLite
        else:
            return db == 'default'