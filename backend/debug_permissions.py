import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from rest_framework.test import APIClient
from users.models import Utilisateur
from django.contrib.auth.models import User

# Get the user
try:
    user_model = Utilisateur.objects.get(email='sales@halieutique.cm')
    print(f"Found Utilisateur: {user_model.email} with role {user_model.role}")
except Utilisateur.DoesNotExist:
    print("User sales@halieutique.cm not found!")
    exit(1)

# Ensure a corresponding Django User exists for authentication (since DRF often relies on Request.user)
# In our custom auth, we might map it differently, but let's test the view directly.
# Using force_authenticate if possible, or obtaining token.

client = APIClient()
# We need to simulate the auth header or force auth.
# Sinc we are using custom auth backend, let's try to get a jwt token first.

from rest_framework_simplejwt.tokens import RefreshToken
# We might need to trick it if Utilisateur is not the AUTH_USER_MODEL
# But wait, our AUTH_USER_MODEL is likely 'auth.User' or custom? 
# Let's check permissions content again. It queries Utilisateur based on request.user.email.
# So request.user must be a Django User with the same email.

try:
    django_user = User.objects.get(email='sales@halieutique.cm')
except User.DoesNotExist:
    print("Django User for sales@halieutique.cm does not exist! Creating one.")
    django_user = User.objects.create_user(username='sales_test', email='sales@halieutique.cm', password='password')

client.force_authenticate(user=django_user)

print("--- Testing /api/produits/ ---")
response = client.get('/api/produits/')
print(f"Status: {response.status_code}")
if response.status_code != 200:
    print(f"Error: {response.data}")
else:
    print("Success! Data preview:")
    print(response.data)

print("\n--- Testing /api/lots/ ---")
response = client.get('/api/lots/')
print(f"Status: {response.status_code}")
if response.status_code != 200:
    print(f"Error: {response.data}")
else:
    print("Success! Data preview:")
    # Handle pagination
    data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
    print(data)
