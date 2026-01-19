# users/permissions.py
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
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            return utilisateur.role == 'admin'
        except Utilisateur.DoesNotExist:
            # Fallback pour les superusers Django
            return request.user.is_superuser or request.user.is_staff

class IsStockManager(permissions.BasePermission):
    """
    Permission pour les gestionnaires de stock.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            return utilisateur.est_gestionnaire_stock()
        except Utilisateur.DoesNotExist:
            return False

class IsLogisticsManager(permissions.BasePermission):
    """
    Permission pour les gestionnaires logistique.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            return utilisateur.est_gestionnaire_logistique()
        except Utilisateur.DoesNotExist:
            return False

class IsSalesManager(permissions.BasePermission):
    """
    Permission pour les gestionnaires des ventes.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            return utilisateur.est_gestionnaire_ventes()
        except Utilisateur.DoesNotExist:
            return False

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    L'administrateur peut voir (GET) mais ne peut modifier que ses propres ressources.
    Les autres utilisateurs ont accès complet selon leur rôle.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            
            # Admin peut lire (GET, HEAD, OPTIONS)
            if utilisateur.est_administrateur():
                return request.method in permissions.SAFE_METHODS
            
            # Les autres rôles ont accès complet selon leur domaine
            return True
            
        except Utilisateur.DoesNotExist:
            # Superusers Django ont accès complet
            return request.user.is_superuser

class RoleBasedPermission(permissions.BasePermission):
    """
    Permission basée sur les rôles avec configuration flexible.
    Usage: permission_classes = [RoleBasedPermission]
    Et définir allowed_roles dans la vue.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Récupérer les rôles autorisés depuis la vue
        allowed_roles = getattr(view, 'allowed_roles', [])
        
        if not allowed_roles:
            # Si aucun rôle spécifié, autoriser tous les utilisateurs authentifiés
            return True
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            
            # Vérifier si le rôle de l'utilisateur est dans la liste autorisée
            if utilisateur.role in allowed_roles:
                return True
            
            # Admin a toujours accès en lecture seule
            if utilisateur.est_administrateur() and request.method in permissions.SAFE_METHODS:
                return True
                
            return False
            
        except Utilisateur.DoesNotExist:
            # Superusers Django ont toujours accès
            return request.user.is_superuser

class IsStockManagerOrAdminReadOnly(permissions.BasePermission):
    """
    Gestionnaires de stock ont accès complet.
    Administrateurs ont accès en lecture seule.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            
            # Stock manager a accès complet
            if utilisateur.est_gestionnaire_stock():
                return True
            
            # Admin a accès en lecture seule
            if utilisateur.est_administrateur():
                return request.method in permissions.SAFE_METHODS
                
            return False
            
        except Utilisateur.DoesNotExist:
            # Superusers Django ont accès complet
            return request.user.is_superuser

class IsLogisticsManagerOrAdminReadOnly(permissions.BasePermission):
    """
    Gestionnaires logistique ont accès complet.
    Administrateurs ont accès en lecture seule.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            
            # Logistics manager a accès complet
            if utilisateur.est_gestionnaire_logistique():
                return True
            
            # Admin a accès en lecture seule
            if utilisateur.est_administrateur():
                return request.method in permissions.SAFE_METHODS
                
            return False
            
        except Utilisateur.DoesNotExist:
            return request.user.is_superuser

class IsSalesManagerOrAdminReadOnly(permissions.BasePermission):
    """
    Gestionnaires des ventes ont accès complet.
    Administrateurs ont accès en lecture seule.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            utilisateur = Utilisateur.objects.get(email=request.user.email)
            
            # Sales manager a accès complet
            if utilisateur.est_gestionnaire_ventes():
                return True
            
            # Admin a accès en lecture seule
            if utilisateur.est_administrateur():
                return request.method in permissions.SAFE_METHODS
                
            return False
            
        except Utilisateur.DoesNotExist:
            return request.user.is_superuser
