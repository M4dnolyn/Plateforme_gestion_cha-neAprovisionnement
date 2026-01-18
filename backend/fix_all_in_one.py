# fix_all_in_one.py
import os
import re

def fix_file(filename):
    """Corrige un fichier models.py"""
    if not os.path.exists(filename):
        return
    
    print(f"\n🔧 Correction de {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Corriger l'indentation (4 espaces pour les champs)
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Si ligne commence par espace-espace-caractère (pas tab)
        if re.match(r'^  [a-zA-Z_]', line):
            # Ajouter 2 espaces pour faire 4
            line = '    ' + line[2:]
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    # 2. Convertir db_column en minuscules
    # Trouver tous les db_column='...'
    def lower_db_column(match):
        col_name = match.group(1)
        return f"db_column='{col_name.lower()}'"
    
    content = re.sub(r"db_column='([^']+)'", lower_db_column, content)
    
    # 3. S'assurer que managed = False existe
    if 'class Meta:' in content and 'managed = False' not in content:
        content = content.replace(
            'class Meta:',
            'class Meta:\n        managed = False'
        )
    
    # Sauvegarder
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fichier corrigé")

# Liste des fichiers
files = [
    'produits/models.py',
    'users/models.py', 
    'logistique/models.py',
    'tracabilite/models.py',
    'ventes/models.py'
]

for file in files:
    fix_file(file)

print("\n" + "="*50)
print("🎉 Tous les fichiers ont été corrigés !")
print("="*50)
print("\n📋 Testez maintenant :")
print("python manage.py runserver")
