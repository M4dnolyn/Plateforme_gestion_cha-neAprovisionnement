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
            
            # Utiliser notre backend personnalisé via authenticate
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                # Générer les tokens JWT
                refresh = RefreshToken.for_user(user)
                
                # Récupérer les infos de l'utilisateur métier
                try:
                    utilisateur_metier = Utilisateur.objects.using('postgres').get(email=email)
                    user_data = UtilisateurSerializer(utilisateur_metier).data
                except Utilisateur.DoesNotExist:
                    return Response({'error': 'Compte métier introuvable'}, status=status.HTTP_404_NOT_FOUND)

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