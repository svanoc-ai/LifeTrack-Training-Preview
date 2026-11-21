# LifeTrack Training Preview — V14 — différentiel

## Installation
Remplacer uniquement `src/main.tsx` et `src/Catalogue20Preview.tsx` et ajouter `src/catalogue20-v14-statut.json` dans le dépôt **LifeTrack-Training-Preview**. Conserver tous les fichiers V11–V13, notamment `catalogue20-v13-statut.json`. Ne pas déployer en production.

## Lot 1 — Sélection (5 nouveaux exercices)
Pompes prise serrée ; Crunch contrôlé ; Adduction couchée sur le côté ; Mollets debout unilatéral ; Mollets isométriques sur pointes. Sélection sur critères de simplicité matérielle ; les exercices ne sont pas une prescription individuelle. Les 8 exercices de V13 restent actifs.

## Lot 2 — Biomécanique
Les consignes spécifiques de ces 5 exercices sont documentées dans `catalogue20-v14-statut.json` et visibles dans la revue. Aucune validation clinique ou vérification de tolérance individuelle n'est revendiquée. Les autres propositions conservent leur statut de revue, fusion ou suspension.

## Lot 3 — Bibliothèque
5 fiches `std:` ajoutées au registre existant ; total attendu **33 standards** (20 historiques + 8 V13 + 5 V14). Pas de migration, pas de suppression, pas de modification des identifiants existants. Le catalogue de revue reste à 66 propositions. Attention : le registre actuel mesure par défaut les séries/répétitions ; pour l'isométrie des mollets, la durée doit être paramétrée dans la séance si cette modalité est prise en charge.

## Lot 4 — Contrôles
Vérifications statiques : 66 numéros uniques, 13 fiches actives, 5 nouveaux identifiants sans doublon et archive ZIP saine. **Compilation et test iPhone non réalisés** (dépendances npm absentes de l'environnement).

## Recette groupée iPhone
1. Bibliothèque : 33 exercices standards et exercice personnalisé conservé.
2. Rechercher les 5 nouveaux exercices et vérifier leur présence.
3. Créer une séance avec Pompes prise serrée et Adduction couchée sur le côté ; sauvegarder, rouvrir, exécuter.
4. Vérifier une séance préexistante et l'historique ; ne pas perdre les 8 exercices V13.
5. Catalogue 20G : 66 propositions ; 13 fiches actives ; filtres et dépliage opérationnels.
6. Vérifier les fiches suspendues non proposées dans la bibliothèque.
7. Pour Mollets isométriques sur pointes, vérifier explicitement la possibilité de saisir une durée ; sinon signaler la limitation sans valider ce point.
