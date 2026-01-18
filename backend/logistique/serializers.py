from rest_framework import serializers
from .models import Entrepot, CommandeAchat, Livraison

class EntrepotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrepot
        fields = '__all__'

class CommandeAchatSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommandeAchat
        fields = '__all__'

class LivraisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livraison
        fields = '__all__'
