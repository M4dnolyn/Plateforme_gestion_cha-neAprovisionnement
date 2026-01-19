from rest_framework import viewsets, permissions
from .models import Utilisateur
from .serializers import UtilisateurSerializer
from .permissions import IsAdminUser

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAdminUser]
