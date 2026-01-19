from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Utilisateur
from produits.models import Produit, Lot
from django.db.models import Count, Sum

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Vérifier si l'utilisateur est admin
        try:
            user_email = request.user.email
            utilisateur = Utilisateur.objects.get(email=user_email)
            if utilisateur.role.upper() != 'ADMIN':
                return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        except Utilisateur.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Calculer les stats
        total_users = Utilisateur.objects.count()
        total_products = Produit.objects.count()
        
        # Stocks critiques (quantité < 20 par exemple) - Seuil arbitraire pour la démo
        critical_stocks_count = Lot.objects.filter(quantite__lt=20, statut_lot='STOCK').count()
        
        # Répartition par rôle
        roles_distribution = Utilisateur.objects.values('role').annotate(count=Count('id_utilisateur'))
        
        return Response({
            'total_users': total_users,
            'total_products': total_products,
            'critical_stocks_count': critical_stocks_count,
            'roles_distribution': roles_distribution
        })

class RecentActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Simuler des activités récentes car nous n'avons pas de table d'audit dédiée
        # Dans un vrai système, on lirait une table Log ou Audit
        activities = [
            {
                'id': 1,
                'type': 'success',
                'icon': 'check-circle',
                'title': 'Nouvel utilisateur',
                'details': 'Administrateur ajouté',
                'time': 'Il y a 10 minutes'
            },
            {
                'id': 2,
                'type': 'warning',
                'icon': 'exclamation-triangle',
                'title': 'Stock bas',
                'details': 'Thon Rouge - Lot 1001',
                'time': 'Il y a 1 heure'
            },
            {
                'id': 3,
                'type': 'info',
                'icon': 'info-circle',
                'title': 'Export PDF',
                'details': 'Rapport mensuel généré',
                'time': 'Hier à 16:00'
            }
        ]
        return Response(activities)
