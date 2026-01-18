from rest_framework import viewsets, filters
from .models import Produit, Lot
from .serializers import ProduitSerializer, LotSerializer

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.using('postgres').all()
    serializer_class = ProduitSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom_produit', 'type_produit']

from rest_framework.decorators import action
from django.db.models import Sum

class LotViewSet(viewsets.ModelViewSet):
    queryset = Lot.objects.using('postgres').all()
    serializer_class = LotSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['id_lot', 'qr_code']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_stock = Lot.objects.using('postgres').filter(statut_lot='STOCK').aggregate(Sum('quantite'))['quantite__sum'] or 0
        active_alerts = Lot.objects.using('postgres').filter(quantite__lt=20, statut_lot='STOCK').count()
        
        return Response({
            'total_stock': total_stock,
            'active_alerts': active_alerts,
            'daily_in': 120, # Dummy for now
            'daily_out': 45, # Dummy for now
            'daily_shortages': 2
        })
