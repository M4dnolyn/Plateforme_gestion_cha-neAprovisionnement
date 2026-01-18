from django.db import models

class Produit(models.Model):
    id_produit = models.AutoField(primary_key=True)
    nom_produit = models.CharField(max_length=255, blank=False, null=False)
    type_produit = models.CharField(max_length=255, blank=True, null=True)
    unite = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'produit'
        managed = False

    def __str__(self):
        return str(self.nom_produit)

class Lot(models.Model):
    id_lot = models.AutoField(primary_key=True)
    date_reception = models.DateField(blank=True, null=True)
    date_peremption = models.DateField(blank=True, null=True)
    quantite = models.IntegerField(blank=True, null=True)
    statut_lot = models.CharField(max_length=255, blank=True, null=True)
    # Nouveaux champs
    temperature_reception = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True)
    scan_code_fournisseur = models.CharField(max_length=100, blank=True, null=True)
    
    commande = models.ForeignKey('logistique.CommandeAchat', on_delete=models.CASCADE, db_column='id_commande')
    entrepot = models.ForeignKey('logistique.Entrepot', on_delete=models.CASCADE, db_column='id_entrepot')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, db_column='id_produit')

    class Meta:
        db_table = 'lot'
        managed = False

    def __str__(self):
        return str(self.date_reception)

