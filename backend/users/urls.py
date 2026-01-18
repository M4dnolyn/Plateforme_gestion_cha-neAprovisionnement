from django.urls import path
from .views import LoginView, LogoutView
from .admin_views import AdminStatsView, RecentActivitiesView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('activities/recent/', RecentActivitiesView.as_view(), name='recent_activities'),
]
