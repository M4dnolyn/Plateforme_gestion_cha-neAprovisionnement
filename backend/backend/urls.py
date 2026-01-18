from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# Import des viewsets
from produits.api import ProduitViewSet, LotViewSet
from users.api import UtilisateurViewSet
from logistique.api import EntrepotViewSet, CommandeAchatViewSet, LivraisonViewSet
from tracabilite.api import MouvementStockViewSet, AlerteViewSet, IncidentViewSet, NotificationViewSet
from ventes.api import VenteViewSet, LigneVenteViewSet, PrevisionViewSet

# Création du router
router = DefaultRouter()
router.register(r'produits', ProduitViewSet)
router.register(r'lots', LotViewSet)
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'entrepots', EntrepotViewSet)
router.register(r'commandes', CommandeAchatViewSet)
router.register(r'livraisons', LivraisonViewSet)
router.register(r'mouvements', MouvementStockViewSet)
router.register(r'alertes', AlerteViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'ventes', VenteViewSet)
router.register(r'lignes-vente', LigneVenteViewSet)
router.register(r'previsions', PrevisionViewSet)

# Configuration Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="API Halieutique",
        default_version='v1',
        description="Documentation de l'API pour la plateforme de gestion halieutique",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@halieutique.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin Django
    path('api/users/', include('users.urls')),
    path('admin/', admin.site.urls),


    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
 
 # Authentification JWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentification Token classique
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    

    path('api/auth/login/', TokenObtainPairView.as_view(), name='auth_login'),
    
    # API
    path('api/', include(router.urls)),
    
    
    # Interface web DRF
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
 # Documentation Swagger
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', 
            schema_view.without_ui(cache_timeout=0), 
            name='schema-json'),
    path('swagger/', 
         schema_view.with_ui('swagger', cache_timeout=0), 
         name='schema-swagger-ui'),
    path('redoc/', 
         schema_view.with_ui('redoc', cache_timeout=0), 
         name='schema-redoc'),
]
