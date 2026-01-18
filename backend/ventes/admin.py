from django.contrib import admin
from .models import Vente, LigneVente, Prevision

@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    list_display = ('id_vente', 'date_vente', 'montant_total', 'statut_vente', 'utilisateur', 'get_statut_color')
    list_filter = ('statut_vente', 'date_vente')
    search_fields = ('id_vente',)
    ordering = ('-date_vente',)
    readonly_fields = [f.name for f in Vente._meta.fields]
    
    def get_statut_color(self, obj):
        return obj.get_statut_color()
    get_statut_color.short_description = 'Couleur statut'

@admin.register(LigneVente)
class LigneVenteAdmin(admin.ModelAdmin):
    list_display = ('id_lignevente', 'vente', 'produit', 'quantite_vendue', 'prix_unitaire')
    list_filter = ('vente', 'produit')
    search_fields = ('id_lignevente',)
    ordering = ('vente', 'id_lignevente')
    readonly_fields = [f.name for f in LigneVente._meta.fields]

@admin.register(Prevision)
class PrevisionAdmin(admin.ModelAdmin):
    list_display = ('id_prevision', 'periode', 'quantite_prevision', 'date_prevision', 'produit')
    list_filter = ('periode', 'date_prevision')
    search_fields = ('periode', 'id_prevision')
    ordering = ('-date_prevision',)
    readonly_fields = [f.name for f in Prevision._meta.fields]
