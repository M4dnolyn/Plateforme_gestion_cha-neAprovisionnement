from django.contrib import admin
from .models import MouvementStock, Alerte

@admin.register(MouvementStock)
class MouvementStockAdmin(admin.ModelAdmin):
    list_display = ('id_mouvement', 'date_mouvement', 'type_mouvement', 'quantite', 'lot', 'utilisateur')
    list_filter = ('type_mouvement', 'date_mouvement')
    search_fields = ('id_mouvement',)
    ordering = ('-date_mouvement',)
    readonly_fields = [f.name for f in MouvementStock._meta.fields]

@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ('id_alerte', 'type_alerte', 'date_creation', 'niveau', 'lot', 'get_niveau_display_color')
    list_filter = ('type_alerte', 'niveau', 'date_creation')
    search_fields = ('message', 'id_alerte')
    ordering = ('-date_creation',)
    readonly_fields = [f.name for f in Alerte._meta.fields]
    
    def get_niveau_display_color(self, obj):
        return obj.get_niveau_display_color()
    get_niveau_display_color.short_description = 'Couleur Niveau'
