from rest_framework import serializers
from .models import Utilisateur
from django.contrib.auth.models import User

class UtilisateurSerializer(serializers.ModelSerializer):
    mot_de_passe = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ['id_utilisateur', 'nom', 'email', 'role', 'mot_de_passe', 'departement', 'telephone', 'date_embauche']

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        if 'mot_de_passe' in validated_data:
            validated_data['mot_de_passe'] = make_password(validated_data['mot_de_passe'])
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'objet User de Django (utilisé pour le token)
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
