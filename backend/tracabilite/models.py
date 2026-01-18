from django.db import models

class MouvementStock(models.Model):
    id_mouvement = models.AutoField(primary_key=True)
    date_mouvement = models.DateField(blank=True, null=True)
    type_mouvement = models.CharField(max_length=255, blank=True, null=True)
    quantite = models.IntegerField(blank=True, null=True)
    lot = models.ForeignKey('produits.Lot', on_delete=models.CASCADE, db_column='id_lot')
    utilisateur = models.ForeignKey('users.Utilisateur', on_delete=models.CASCADE, db_column='id_utilisateur', null=True, blank=True)

    class Meta:
        db_table = 'mouvement_stock'
        managed = False

    def __str__(self):
        return str(self.date_mouvement)

class Alerte(models.Model):
    id_alerte = models.AutoField(primary_key=True)
    type_alerte = models.CharField(max_length=255, blank=True, null=True)
    date_creation = models.DateField(blank=True, null=True)
    niveau = models.IntegerField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    lot = models.ForeignKey('produits.Lot', on_delete=models.CASCADE, db_column='id_lot', null=True, blank=True)

    class Meta:
        db_table = 'alerte'
        managed = False

    def __str__(self):
        return str(self.type_alerte)

class Incident(models.Model):
    id_incident = models.AutoField(primary_key=True)
    type_incident = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date_incident = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=50, default='Ouvert')
    livraison = models.ForeignKey('logistique.Livraison', on_delete=models.CASCADE, db_column='id_livraison', null=True, blank=True)

    class Meta:
        db_table = 'incident'
        managed = False

class Notification(models.Model):
    id_notification = models.AutoField(primary_key=True)
    type_notification = models.CharField(max_length=100, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    date_envoi = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey('users.Utilisateur', on_delete=models.CASCADE, db_column='id_utilisateur', null=True, blank=True)

    class Meta:
        db_table = 'notification'
        managed = False

