from django.db import models

class Entrepot(models.Model):
    id_entrepot = models.AutoField(primary_key=True)
    nom_entrepot = models.CharField(max_length=255, blank=False, null=False)
    localisation = models.CharField(max_length=255, blank=True, null=True)
    capacite = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'entrepot'
        managed = False

    def __str__(self):
        return str(self.nom_entrepot)

class CommandeAchat(models.Model):
    id_commande = models.AutoField(primary_key=True)
    date_commande = models.DateField(blank=False, null=False)
    quantite_commande = models.IntegerField(blank=False, null=False)
    statut_commande = models.CharField(max_length=255, blank=True, null=True)
    fournisseur = models.CharField(max_length=255, blank=True, null=True)
    entrepot = models.ForeignKey('Entrepot', on_delete=models.CASCADE, db_column='id_entrepot')

    class Meta:
        db_table = 'commande_achat'
        managed = False

    def __str__(self):
        return str(self.date_commande)

class Livraison(models.Model):
    id_livraison = models.AutoField(primary_key=True)
    date_livraison = models.DateField(blank=True, null=True)
    statut_livraison = models.CharField(max_length=255, blank=True, null=True)
    destination = models.CharField(max_length=255, blank=True, null=True)
    lot = models.ForeignKey('produits.Lot', on_delete=models.CASCADE, db_column='id_lot')
    heure_livraison = models.TimeField(blank=True, null=True)
    responsable = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'livraison'
        managed = False

    def __str__(self):
        return str(self.date_livraison)

