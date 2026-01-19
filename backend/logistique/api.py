from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Entrepot, CommandeAchat, Livraison
from .serializers import EntrepotSerializer, CommandeAchatSerializer, LivraisonSerializer
from users.permissions import IsLogisticsManagerOrAdminReadOnly

class EntrepotViewSet(viewsets.ModelViewSet):
    queryset = Entrepot.objects.all()
    serializer_class = EntrepotSerializer
    permission_classes = [IsLogisticsManagerOrAdminReadOnly]

class CommandeAchatViewSet(viewsets.ModelViewSet):
    queryset = CommandeAchat.objects.all()
    serializer_class = CommandeAchatSerializer
    permission_classes = [IsLogisticsManagerOrAdminReadOnly]

class LivraisonViewSet(viewsets.ModelViewSet):
    queryset = Livraison.objects.all()
    serializer_class = LivraisonSerializer
    permission_classes = [IsLogisticsManagerOrAdminReadOnly]


