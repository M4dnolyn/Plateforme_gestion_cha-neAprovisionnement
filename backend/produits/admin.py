from django.contrib import admin
from .models import Produit, Lot

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ('id_produit', 'nom_produit', 'type_produit', 'unite')
    list_filter = ('type_produit',)
    search_fields = ('nom_produit', 'id_produit')
    ordering = ('nom_produit',)

@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ('id_lot', 'date_reception', 'date_peremption', 'quantite', 'statut_lot', 'jours_restants', 'est_perime')
    list_filter = ('statut_lot', 'date_reception')
    search_fields = ('id_lot',)
    readonly_fields = ('jours_restants', 'est_perime')
    
    def jours_restants(self, obj):
        return obj.jours_restants()
    jours_restants.short_description = 'Jours restants'
    
    def est_perime(self, obj):
        return obj.est_perime()
    est_perime.boolean = True
    est_perime.short_description = 'Périmé ?'
