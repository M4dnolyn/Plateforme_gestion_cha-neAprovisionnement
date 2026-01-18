from django.db import models

class Vente(models.Model):
    id_vente = models.AutoField(primary_key=True)
    date_vente = models.DateField(blank=True, null=True)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    statut_vente = models.CharField(max_length=255, blank=True, null=True)
    utilisateur = models.ForeignKey('users.Utilisateur', on_delete=models.CASCADE, db_column='id_utilisateur', null=True, blank=True)

    class Meta:
        db_table = 'vente'
        managed = False

    def __str__(self):
        return str(self.date_vente)

class LigneVente(models.Model):
    id_lignevente = models.AutoField(primary_key=True)
    quantite_vendue = models.IntegerField(blank=True, null=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vente = models.ForeignKey(Vente, on_delete=models.CASCADE, db_column='id_vente')
    produit = models.ForeignKey('produits.Produit', on_delete=models.CASCADE, db_column='id_produit')

    class Meta:
        db_table = 'lignevente'
        managed = False

    def __str__(self):
        return str(self.quantite_vendue)

class Prevision(models.Model):
    id_prevision = models.AutoField(primary_key=True)
    periode = models.CharField(max_length=255, blank=True, null=True)
    quantite_prevision = models.IntegerField(blank=True, null=True)
    date_prevision = models.DateField(blank=True, null=True)
    produit = models.ForeignKey('produits.Produit', on_delete=models.CASCADE, db_column='id_produit')

    class Meta:
        db_table = 'prevision'
        managed = False

    def __str__(self):
        return str(self.periode)

