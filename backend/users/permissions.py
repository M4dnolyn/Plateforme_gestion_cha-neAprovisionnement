from rest_framework import permissions
from .models import Utilisateur

class IsAdminUser(permissions.BasePermission):
    """
    Vérifie si l'utilisateur a le rôle 'admin' dans la base PostgreSQL.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            # Vérifier le rôle dans PostgreSQL
            utilisateur = Utilisateur.objects.using('postgres').get(email=request.user.email)
            return utilisateur.role == 'admin'
        except Utilisateur.DoesNotExist:
            return False

class IsRoleAllowed(permissions.BasePermission):
    """
    Permission générique pour vérifier le rôle d'un utilisateur.
    """
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.using('postgres').get(email=request.user.email)
            return utilisateur.role in self.allowed_roles
        except Utilisateur.DoesNotExist:
            return False
