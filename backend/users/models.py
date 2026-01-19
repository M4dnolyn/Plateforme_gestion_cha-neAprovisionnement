from django.db import models

class Utilisateur(models.Model):
    id_utilisateur = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=255, blank=True, null=True)
    mot_de_passe = models.CharField(max_length=255, blank=True, null=True)
    departement = models.CharField(max_length=255, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'utilisateur'
        managed = False

    def __str__(self):
        return str(self.nom)

    def verifier_mot_de_passe(self, password):
        from django.contrib.auth.hashers import check_password
        return check_password(password, self.mot_de_passe)

    def est_administrateur(self):
        return self.role and self.role.upper() == 'ADMIN'
    
    def est_gestionnaire_stock(self):
        return self.role and self.role.lower() == 'gestionnaire_stock'
    
    def est_gestionnaire_logistique(self):
        return self.role and self.role.lower() == 'gestionnaire_logistique'
    
    def est_gestionnaire_ventes(self):
        return self.role and self.role.lower() == 'gestionnaire_ventes'

