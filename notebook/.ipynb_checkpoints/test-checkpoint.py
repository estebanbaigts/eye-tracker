import json
import pandas as pd

# Lecture du fichier json
with open('data.json', 'r') as file:
    data = json.load(file)

# Création d'un dataframe à partir des données
df = pd.DataFrame(data['events'])

# Filtrage des événements point_position et phase3_ends
point_position = df[df['label'] == 'point_position']
phase3_ends = df[df['label'] == 'phase3_ends']

# Calcul de la distance entre le point de positionnement et le point de référence
point_position['distance'] = (point_position['data']['x'] - 1000) ** 2 + (point_position['data']['y'] - 200) ** 2

# Calcul de la marge d'erreur en pourcentage
point_position['error_margin'] = (point_position['distance'] / 1000) * 100

# Calcul de la réussite sur 100%
point_position['success_rate'] = 100 - point_position['error_margin']

# Affichage des résultats
print("Margin d'erreur en pourcentage:")
print(point_position['error_margin'].mean())

print("\nRéussite sur 100%:")
print(point_position['success_rate'].mean())
