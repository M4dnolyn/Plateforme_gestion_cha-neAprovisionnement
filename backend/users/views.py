from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import LoginSerializer, UtilisateurSerializer
from .models import Utilisateur

from rest_framework.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Utilisation de l'authentification Django standard
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                # Récupérer le rôle depuis PostgreSQL
                try:
                    utilisateur = Utilisateur.objects.get(email=user.email)
                    role = utilisateur.role
                    user_data = {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'nom': utilisateur.nom,
                        'role': role,
                        'departement': utilisateur.departement,
                        'telephone': utilisateur.telephone,
                    }
                except Utilisateur.DoesNotExist:
                    # Fallback pour les utilisateurs Django purs (admin)
                    role = 'admin' if user.is_staff else 'employe'
                    user_data = {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'nom': user.first_name or user.username,
                        'role': role,
                    }
                
                # Générer les tokens JWT
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_data
                })
            else:
                return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)