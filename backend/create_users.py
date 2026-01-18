#!/usr/bin/env python
"""
Script pour générer des hashs de mots de passe Django
pour insérer dans la base PostgreSQL.
"""

import os
import django
import sys

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    django.setup()
except django.core.exceptions.ImproperlyConfigured:
    # Si Django n'est pas configuré, on fait un setup minimal
    print("⚠️  Django non configuré, création de hashs standalone...")
    from django.contrib.auth.hashers import make_password
    
    users = [
        {'ID_utilisateur': 1, 'Nom': 'admin', 'Email': 'admin@halieutique.cm', 'role': 'ADMIN', 'password': 'admin123'},
        {'ID_utilisateur': 2, 'Nom': 'stock_manager', 'Email': 'stock@halieutique.cm', 'role': 'STOCK', 'password': 'stock123'},
        {'ID_utilisateur': 3, 'Nom': 'logistics_manager', 'Email': 'logistics@halieutique.cm', 'role': 'LOG', 'password': 'logistics123'},
        {'ID_utilisateur': 4, 'Nom': 'sales_manager', 'Email': 'sales@halieutique.cm', 'role': 'VENTE', 'password': 'sales123'},
    ]
    
    print("Mots de passe hashés pour PostgreSQL:")
    print("-- Copie-colle ces lignes dans ton fichier SQL --")
    print()
    
    for user in users:
        hashed_password = make_password(user['password'])
        print(f"({user['ID_utilisateur']}, '{user['Nom']}', '{user['Email']}', '{user['role']}', '{hashed_password}'),")
    
    sys.exit(0)

# Si Django est configuré
from django.contrib.auth.hashers import make_password

# Liste des utilisateurs avec mots de passe en clair
users = [
    {'ID_utilisateur': 1, 'Nom': 'admin', 'Email': 'admin@halieutique.cm', 'role': 'ADMIN', 'password': 'admin123'},
    {'ID_utilisateur': 2, 'Nom': 'stock_manager', 'Email': 'stock@halieutique.cm', 'role': 'STOCK', 'password': 'stock123'},
    {'ID_utilisateur': 3, 'Nom': 'logistics_manager', 'Email': 'logistics@halieutique.cm', 'role': 'LOG', 'password': 'logistics123'},
    {'ID_utilisateur': 4, 'Nom': 'sales_manager', 'Email': 'sales@halieutique.cm', 'role': 'VENTE', 'password': 'sales123'},
]

print("Mots de passe hashés pour PostgreSQL:")
print("-- Copie-colle ces lignes dans ton fichier SQL --")
print()

for user in users:
    hashed_password = make_password(user['password'])
    print(f"({user['ID_utilisateur']}, '{user['Nom']}', '{user['Email']}', '{user['role']}', '{hashed_password}'),")
