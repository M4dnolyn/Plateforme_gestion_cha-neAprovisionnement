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
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            pass
        
        # Ensuite, essayer l'authentification métier (PostgreSQL)
        try:
            utilisateur_metier = Utilisateur.objects.using('postgres').get(email=username)
            # Vérifier le mot de passe selon votre méthode de hachage
            if utilisateur_metier.verifier_mot_de_passe(password):
                # Créer un user Django temporaire pour la session
                user, created = User.objects.get_or_create(
                    username=utilisateur_metier.email,
                    defaults={
                        'email': utilisateur_metier.email,
                        'first_name': utilisateur_metier.nom,
                        'is_active': True,
                        'is_staff': utilisateur_metier.est_administrateur(),
                    }
                )
                user.set_unusable_password()  # Pas de mot de passe Django
                user.save()
                return user
        except Utilisateur.DoesNotExist:
            pass
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
