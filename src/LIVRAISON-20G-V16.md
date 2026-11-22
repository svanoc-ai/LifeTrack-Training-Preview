# LifeTrack Training Preview V16 — différentiel

Base : V15 déjà déployée. Déposer uniquement les deux fichiers `src/WorkoutEditor.tsx` et `src/isometric-v16.css` dans le dépôt Preview. Ne rien supprimer.

## Modifications
- V15-C01 : couleur turquoise du mode isométrique verrouillé, y compris Safari iPhone.
- V15-C02 : champ de durée effaçable temporairement ; validation au moment de l'enregistrement (1–3600 s).
- Gainage latéral personnalisé : reconnaissance par nom exact (identifiant personnalisé préservé).
- Wall sit : même règle si cet exercice est présent dans la bibliothèque.
- Gainage standard et mollets isométriques : règle V15 conservée.
- Les exercices dynamiques conservent le choix des trois modes.

## Recette
1. Vérifier le texte turquoise dans le sélecteur verrouillé.
2. Effacer entièrement « 30 », puis saisir « 45 » et enregistrer.
3. Essayer d'enregistrer une durée vide : erreur explicite, pas d'enregistrement.
4. Vérifier le gainage latéral personnalisé : maintien imposé, durée éditable.
5. Vérifier que les pompes classiques restent configurables en répétitions, maintien ou effort chronométré.
6. Réouvrir la séance et vérifier la durée conservée.

## Limites
Non compilé ni testé sur iPhone dans cet environnement. Ne modifie pas le moteur d'exécution, le RPE ou l'historique. Production inchangée.
