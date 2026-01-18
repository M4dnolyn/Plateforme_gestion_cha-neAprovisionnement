from rest_framework import viewsets
from .models import Entrepot, CommandeAchat, Livraison
from .serializers import EntrepotSerializer, CommandeAchatSerializer, LivraisonSerializer

class EntrepotViewSet(viewsets.ModelViewSet):
    queryset = Entrepot.objects.using('postgres').all()
    serializer_class = EntrepotSerializer

class CommandeAchatViewSet(viewsets.ModelViewSet):
    queryset = CommandeAchat.objects.using('postgres').all()
    serializer_class = CommandeAchatSerializer

class LivraisonViewSet(viewsets.ModelViewSet):
    queryset = Livraison.objects.using('postgres').all()
    serializer_class = LivraisonSerializer
