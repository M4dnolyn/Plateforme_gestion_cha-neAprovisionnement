from rest_framework import serializers
from .models import MouvementStock, Alerte, Incident, Notification

class MouvementStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MouvementStock
        fields = '__all__'

class AlerteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='lot.produit.nom_produit', read_only=True)
    class Meta:
        model = Alerte
        fields = '__all__'

class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
