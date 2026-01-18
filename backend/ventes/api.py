from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Vente, LigneVente, Prevision
from .serializers import VenteSerializer, LigneVenteSerializer, PrevisionSerializer

class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.using('postgres').all()
    serializer_class = VenteSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        import datetime
        today = datetime.date.today()
        
        # Stats du jour
        daily_sales = Vente.objects.using('postgres').filter(date_vente=today).aggregate(
            total=Sum('montant_total'),
            count=Count('id_vente')
        )
        
        # Meilleur produit (simplifié)
        top_product = LigneVente.objects.using('postgres').values('produit__nom_produit').annotate(
            total_qty=Sum('quantite_vendue')
        ).order_by('-total_qty').first()
        
        # Dernières ventes
        recent = Vente.objects.using('postgres').order_by('-date_vente', '-id_vente')[:5]
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
    queryset = LigneVente.objects.using('postgres').all()
    serializer_class = LigneVenteSerializer

class PrevisionViewSet(viewsets.ModelViewSet):
    queryset = Prevision.objects.using('postgres').all()
    serializer_class = PrevisionSerializer
