from rest_framework import viewsets
from .models import MouvementStock, Alerte, Incident, Notification
from .serializers import MouvementStockSerializer, AlerteSerializer, IncidentSerializer, NotificationSerializer

class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.using('postgres').all()
    serializer_class = MouvementStockSerializer

class AlerteViewSet(viewsets.ModelViewSet):
    queryset = Alerte.objects.using('postgres').all()
    serializer_class = AlerteSerializer

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.using('postgres').all()
    serializer_class = IncidentSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.using('postgres').all()
    serializer_class = NotificationSerializer
