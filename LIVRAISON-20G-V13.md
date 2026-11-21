# LifeTrack Training Preview — V13 (pilote)

## Installation
Copier les 3 fichiers `src/` du ZIP dans le dépôt `LifeTrack-Training-Preview`, en conservant l'arborescence. Ne rien supprimer. Ne pas installer dans le dépôt de production.

## Lot 1 — Catalogue et identifiants
66 propositions suivies. 8 nouvelles fiches standards ajoutées avec identifiants `std:` stables. Aucune modification des 20 standards historiques ni de l'exercice personnalisé Gainage latéral. Les rapprochements V10 sont conservés pour les autres.

## Lot 2 — Revue biomécanique documentaire
Première vague limitée à des exercices sans ancrage haut ni équipement non confirmé. Les consignes et réserves sont affichées dans la revue V13. Il ne s'agit pas d'une validation clinique individuelle.

## Lot 3 — Intégration pilote
Les 8 nouvelles fiches apparaissent dans la bibliothèque, les éditeurs de séances et les programmes via le registre standard partagé. Les autres propositions ne sont pas activées. Aucune migration IndexedDB, suppression ou écriture automatique.

## Lot 4 — Contrôle qualité
Contrôles statiques réalisés : 66 statuts uniques, 8 activations distinctes, absence de collision avec les identifiants existants, et archive différentielle vérifiée. Compilation TypeScript et tests iPhone non réalisés dans cet environnement ; ils restent obligatoires avant validation.

## Recette iPhone
1. Vérifier que la bibliothèque annonce 28 standards (20 existants + 8 nouveaux).
2. Rechercher Pompes inclinées, Curl marteau, Dead bug, Mollets debout bilatéral ; vérifier leur présence.
3. Créer une séance de test avec deux nouveaux exercices, enregistrer, rouvrir et lancer une exécution test.
4. Vérifier que l'historique, les programmes existants et le Gainage latéral personnalisé sont conservés.
5. Ouvrir le catalogue 20G : 66 propositions, 8 statuts Actif Preview ; filtrage et fiches repliables opérationnels.
6. Vérifier que les fiches suspendues ne sont pas proposées comme standards.

## Limites
La taxonomie de la bibliothèque historique reste différente de celle du référentiel 20G. Les nouvelles fiches n'incluent pas encore de consignes détaillées dans l'éditeur de séance ; la revue V13 contient les précautions documentaires. Le format de mesure standard reste `series-repetitions`, y compris pour les exercices qui peuvent aussi se programmer au temps via les modalités de séance.
