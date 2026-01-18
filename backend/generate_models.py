# generate_models.py - CRÉEZ CE FICHIER SÉPARÉ
import psycopg2
import os
from pathlib import Path

# Configuration PostgreSQL - METTEZ VOTRE MOT DE PASSE ICI !
DB_CONFIG = {
    'database': 'halieutique_db',
    'user': 'postgres',
    'password': '',  # ← METTEZ VOTRE MOT DE PASSE
    'host': '',
    'port': ''
}

def connect_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Erreur connexion PostgreSQL: {e}")
        return None

def django_field_type(pg_type, nullable):
    field_map = {
        'integer': 'models.IntegerField',
        'character varying': 'models.CharField',
        'text': 'models.TextField',
        'date': 'models.DateField',
        'timestamp without time zone': 'models.DateTimeField',
        'timestamp with time zone': 'models.DateTimeField',
        'numeric': 'models.DecimalField',
        'boolean': 'models.BooleanField',
        'double precision': 'models.FloatField',
    }
    
    pg_base_type = pg_type.split('(')[0] if '(' in pg_type else pg_type
    field_class = field_map.get(pg_base_type, 'models.CharField')
    
    if 'character varying' in pg_type:
        size = pg_type.split('(')[1].split(')')[0] if '(' in pg_type else '255'
        return f"models.CharField(max_length={size}, blank={nullable}, null={nullable})"
    elif 'numeric' in pg_type:
        precision = pg_type.split('(')[1].split(',')[0] if '(' in pg_type else '10'
        scale = pg_type.split(',')[1].split(')')[0] if ',' in pg_type else '2'
        return f"models.DecimalField(max_digits={precision}, decimal_places={scale}, blank={nullable}, null={nullable})"
    else:
        return f"{field_class}(blank={nullable}, null={nullable})"

def generate_model(table_name, columns, foreign_keys):
    # Extraire le nom du modèle (ex: 'produits_produit' → 'Produit')
    parts = table_name.split('_')
    if len(parts) > 1:
        model_name = ''.join(word.capitalize() for word in parts[1:])
    else:
        model_name = table_name.capitalize()
    
    lines = []
    lines.append(f"class {model_name}(models.Model):")
    
    # Ajouter les champs
    for col in columns:
        col_name = col['column_name']
        col_type = col['data_type']
        nullable = col['is_nullable'] == 'YES'
        
        # Vérifier si c'est une clé primaire
        is_primary = False
        for fk in foreign_keys:
            if fk['column_name'] == col_name and fk['constraint_type'] == 'PRIMARY KEY':
                is_primary = True
                break
        
        if col_name.startswith('id_') and is_primary:
            django_field = 'models.AutoField(primary_key=True)'
            lines.append(f"    {col_name} = {django_field}")
        else:
            django_field = django_field_type(col_type, nullable)
            lines.append(f"    {col_name} = {django_field}")
    
    # Ajouter les clés étrangères comme commentaires
    for fk in foreign_keys:
        if fk['constraint_type'] == 'FOREIGN KEY':
            fk_column = fk['column_name']
            ref_table = fk['foreign_table']
            ref_parts = ref_table.split('_')
            if len(ref_parts) > 1:
                ref_model = ''.join(word.capitalize() for word in ref_parts[1:])
            else:
                ref_model = ref_table.capitalize()
            
            lines.append(f"    # Clé étrangère vers {ref_model}")
            lines.append(f"    # {fk_column} = models.ForeignKey('{ref_model}', on_delete=models.CASCADE, db_column='{fk_column}')")
    
    lines.append("")
    lines.append(f"    class Meta:")
    lines.append(f"        db_table = '{table_name}'")
    lines.append(f"        managed = False")
    lines.append("")
    lines.append(f"    def __str__(self):")
    # Utiliser le premier champ non-ID comme représentation
    for col in columns:
        if not col['column_name'].startswith('id_'):
            lines.append(f"        return str(self.{col['column_name']})")
            break
    else:
        lines.append(f"        return str(self.id)")
    
    return '\n'.join(lines)

def main():
    print("🔧 Génération des modèles Django depuis PostgreSQL...")
    
    conn = connect_db()
    if not conn:
        print("❌ Impossible de se connecter à PostgreSQL")
        print("Vérifiez: 1. PostgreSQL est démarré")
        print("          2. Le mot de passe est correct")
        print("          3. La base 'halieutique_db' existe")
        return
    
    cursor = conn.cursor()
    
    # Liste des 11 tables
    tables = [
        'produits_produit',
        'produits_lot',
        'users_utilisateur',
        'logistique_entrepot',
        'logistique_commandeachat',
        'logistique_livraison',
        'tracabilite_mouvementstock',
        'tracabilite_alerte',
        'ventes_vente',
        'ventes_lignevente',
        'ventes_prevision'
    ]
    
    all_models = {}
    
    for table in tables:
        print(f"\n🔍 Analyse de la table: {table}")
        
        try:
            # Récupérer les colonnes
            cursor.execute(f"""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = '{table.split('.')[-1]}'
                ORDER BY ordinal_position
            """)
            columns = [
                {'column_name': row[0], 'data_type': row[1], 'is_nullable': row[2]}
                for row in cursor.fetchall()
            ]
            
            print(f"   Colonnes trouvées: {len(columns)}")
            
            # Récupérer les contraintes
            cursor.execute(f"""
                SELECT
                    kcu.column_name,
                    tc.constraint_type,
                    ccu.table_name AS foreign_table,
                    ccu.column_name AS foreign_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                LEFT JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_name = '{table.split('.')[-1]}'
                ORDER BY tc.constraint_type, kcu.ordinal_position
            """)
            constraints = [
                {
                    'column_name': row[0],
                    'constraint_type': row[1],
                    'foreign_table': row[2],
                    'foreign_column': row[3]
                }
                for row in cursor.fetchall()
            ]
            
            # Générer le modèle
            model_code = generate_model(table, columns, constraints)
            all_models[table] = model_code
            
            print(f"✅ Modèle généré pour {table}")
            
        except Exception as e:
            print(f"❌ Erreur avec la table {table}: {e}")
    
    cursor.close()
    conn.close()
    
    # Générer les fichiers models.py
    apps = {
        'produits': ['produits_produit', 'produits_lot'],
        'users': ['users_utilisateur'],
        'logistique': ['logistique_entrepot', 'logistique_commandeachat', 'logistique_livraison'],
        'tracabilite': ['tracabilite_mouvementstock', 'tracabilite_alerte'],
        'ventes': ['ventes_vente', 'ventes_lignevente', 'ventes_prevision']
    }
    
    for app_name, app_tables in apps.items():
        file_path = Path(f"{app_name}/models.py")
        
        # Créer le dossier si nécessaire
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("from django.db import models\n\n")
            
            for table in app_tables:
                if table in all_models:
                    f.write(all_models[table])
                    f.write("\n\n")
        
        print(f"📁 Fichier créé: {file_path}")
    
    print("\n" + "="*50)
    print("🎉 Tous les modèles ont été générés !")
    print("="*50)
    
    # Instructions
    print("\n📋 Prochaines étapes :")
    print("1. Vérifiez les fichiers models.py générés")
    print("2. Redémarrez Django: python manage.py runserver")
    print("3. Testez: http://localhost:8000/api/produits/")

if __name__ == "__main__":
    main()
