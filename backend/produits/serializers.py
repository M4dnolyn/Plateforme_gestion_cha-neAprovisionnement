from rest_framework import serializers
from .models import Produit, Lot
from .utils import generate_qr_code

class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = '__all__'

class LotSerializer(serializers.ModelSerializer):
    nom_produit = serializers.CharField(source='produit.nom_produit', read_only=True)
    nom_entrepot = serializers.CharField(source='entrepot.nom_entrepot', read_only=True)
    
    class Meta:
        model = Lot
        fields = '__all__'
    
    def create(self, validated_data):
        # Générer le QR code à la création
        instance = super().create(validated_data)
        
        # Données pour le QR code
        qr_data = f"LOT-{instance.id_lot}-PROD-{instance.id_produit.id_produit}"
        instance.qr_code = generate_qr_code(qr_data)
        instance.save()
        
        return instance
