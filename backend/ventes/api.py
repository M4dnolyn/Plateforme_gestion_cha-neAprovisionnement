from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Vente, LigneVente, Prevision
from .serializers import VenteSerializer, LigneVenteSerializer, PrevisionSerializer
from users.permissions import IsSalesManagerOrAdminReadOnly

class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer
    permission_classes = [IsSalesManagerOrAdminReadOnly]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        import datetime
        today = datetime.date.today()
        
        # Stats du jour
        daily_sales = Vente.objects.filter(date_vente=today).aggregate(
            total=Sum('montant_total'),
            count=Count('id_vente')
        )
        
        # Meilleur produit (simplifié)
        top_product = LigneVente.objects.values('produit__nom_produit').annotate(
            total_qty=Sum('quantite_vendue')
        ).order_by('-total_qty').first()
        
        # Dernières ventes
        recent = Vente.objects.order_by('-date_vente', '-id_vente')[:5]
        recent_data = []
        for v in recent:
            recent_data.append({
                'id': f"FAC-{v.id_vente}",
                'client': "Client Divers", # À améliorer si un champ client est ajouté
                'total': f"{v.montant_total:,.0f}".replace(',', ' '),
                'status': "Payée" if v.statut_vente == 'Complete' else "En attente"
            })

        return Response({
            'daily_total': f"{daily_sales['total'] or 0:,.0f}".replace(',', ' ') + " CFA",
            'order_count': daily_sales['count'] or 0,
            'top_product': top_product['produit__nom_produit'] if top_product else "-",
            'recent_sales': recent_data
        })

class LigneVenteViewSet(viewsets.ModelViewSet):
    queryset = LigneVente.objects.all()
    serializer_class = LigneVenteSerializer
    permission_classes = [IsSalesManagerOrAdminReadOnly]

class PrevisionViewSet(viewsets.ModelViewSet):
    queryset = Prevision.objects.all()
    serializer_class = PrevisionSerializer
    permission_classes = [IsSalesManagerOrAdminReadOnly]
