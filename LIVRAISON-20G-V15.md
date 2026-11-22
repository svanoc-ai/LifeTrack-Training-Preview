# LifeTrack Training Preview V15 — lot isométriques

Fichier modifié : src/WorkoutEditor.tsx.

Pour les exercices standards `std:mollets-isometriques-sur-pointes` et `std:gainage`, le mode « Maintien isométrique » est imposé dans l’éditeur de séances types. Durée initiale : 30 s, modifiable ; séries, repos et charge restent modifiables. Les répétitions et le RIR sont masqués. Les modèles existants sont normalisés à leur ouverture et à leur sauvegarde, sans migration automatique des données stockées.

Les exercices mixtes gardent les trois modes. Les autres exercices isométriques (dont le gainage latéral personnalisé, dont l’identifiant peut varier) ne sont pas encore classés automatiquement. Le RPE par série n’est pas intégré : il nécessite une modification du flux d’exécution et de l’historique.

Tests recommandés : ajouter Mollets isométriques ; vérifier mode bloqué, 30 s, modification de durée, enregistrement/réouverture ; vérifier que Pompes classiques garde les trois modes ; vérifier Gainage ; vérifier une séance préexistante.

Archive source non compilée dans cet environnement. Ne déployer que dans le dépôt Preview.
