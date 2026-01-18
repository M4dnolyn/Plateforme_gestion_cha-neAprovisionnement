from django.contrib import admin
from .models import Entrepot, CommandeAchat, Livraison

@admin.register(Entrepot)
class EntrepotAdmin(admin.ModelAdmin):
    list_display = ('id_entrepot', 'nom_entrepot', 'localisation', 'capacite')
    search_fields = ('nom_entrepot', 'localisation')
    ordering = ('nom_entrepot',)
    readonly_fields = [f.name for f in Entrepot._meta.fields]

@admin.register(CommandeAchat)
class CommandeAchatAdmin(admin.ModelAdmin):
    list_display = ('id_commande', 'date_commande', 'fournisseur', 'quantite_commande', 'statut_commande', 'entrepot')
    list_filter = ('statut_commande', 'date_commande')
    search_fields = ('fournisseur', 'id_commande')
    ordering = ('-date_commande',)
    readonly_fields = [f.name for f in CommandeAchat._meta.fields]

@admin.register(Livraison)
class LivraisonAdmin(admin.ModelAdmin):
    list_display = ('id_livraison', 'date_livraison', 'statut_livraison', 'destination', 'lot')
    list_filter = ('statut_livraison', 'date_livraison')
    search_fields = ('destination', 'id_livraison')
    ordering = ('-date_livraison',)
    readonly_fields = [f.name for f in Livraison._meta.fields]
