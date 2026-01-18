# users/admin.py
from django.contrib import admin
from .models import Utilisateur

@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    using = 'postgres'
    list_display = ['id_utilisateur', 'nom', 'email', 'role']
    list_filter = ['role']
    search_fields = ['nom', 'email']
    readonly_fields = [f.name for f in Utilisateur._meta.fields]
    
    def get_queryset(self, request):
        # Lire depuis PostgreSQL
        return super().get_queryset(request).using(self.using)
    
    def save_model(self, request, obj, form, change):
        # Désactiver la sauvegarde depuis l'admin (car managed=False)
        pass
    
    def delete_model(self, request, obj):
        # Désactiver la suppression depuis l'admin
        pass
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
