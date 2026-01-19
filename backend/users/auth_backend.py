# users/auth_backend.py
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from .models import Utilisateur

class DualAuthenticationBackend(BaseBackend):
    """
    Backend d'authentification double :
    1. Utilisateurs Django (admin) dans SQLite
    2. Utilisateurs métier dans PostgreSQL
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Essayer d'abord l'authentification Django (SQLite)
        user = None
        try:
            # Recherche par username
            user = User.objects.using('default').get(username=username)
        except User.DoesNotExist:
            try:
                # Fallback : Recherche par email dans SQLite
                user = User.objects.using('default').get(email=username)
            except User.DoesNotExist:
                pass
        
        if user:
            if user.check_password(password):
                return user
        
        # Ensuite, essayer l'authentification métier (PostgreSQL)
        try:
            # Chercher dans PostgreSQL en utilisant le router
            utilisateur_metier = Utilisateur.objects.get(email=username)
            
            # Vérifier le mot de passe
            if utilisateur_metier.verifier_mot_de_passe(password):
                # Créer ou récupérer un User Django pour la session
                user, created = User.objects.using('default').get_or_create(
                    username=utilisateur_metier.email,
                    defaults={
                        'email': utilisateur_metier.email,
                        'first_name': utilisateur_metier.nom,
                        'is_active': True,
                        'is_staff': utilisateur_metier.est_administrateur(),
                    }
                )
                
                # Mettre à jour les infos si l'utilisateur existe déjà
                if not created:
                    user.first_name = utilisateur_metier.nom
                    user.is_staff = utilisateur_metier.est_administrateur()
                    user.save()
                
                # Stocker le rôle métier dans l'objet user pour y accéder plus tard
                user.role_metier = utilisateur_metier.role
                user.utilisateur_id = utilisateur_metier.id_utilisateur
                    
                return user
                
        except Utilisateur.DoesNotExist:
            pass
        except Exception as e:
            # Log l'erreur mais ne pas bloquer
            print(f"Erreur authentification PostgreSQL: {e}")
            pass
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
