from rest_framework import serializers
from .models import Vente, LigneVente, Prevision

class VenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vente
        fields = '__all__'

class LigneVenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneVente
        fields = '__all__'

class PrevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prevision
        fields = '__all__'
