# LifeTrack Training — V23 Preview, lot consolidé

**Date de préparation :** 22 novembre 2026  
**Socle :** source intégrale LifeTrack Training Preview V22 (jamais la production)  
**Version applicative :** `2-F.3.5` (identifiant technique V23)  
**État :** sources + tests automatisés disponibles. **Compilation complète et validation Safari/PWA sur iPhone NON effectuées.**

## Contenu du lot

### 1. Exécution et chronométrage
- Trois mesures indépendantes : temps actif (`activeMs`), récupération effective (`restMs`), interruption (`pauseMs`). Le temps total de séance affiché = actif + récupération mesurée, sans interruptions.
- Enregistrement événementiel des récupérations déclenchées (`restRecords` : type, durée initialement prévue, durée effectivement mesurée). Repos anticipé, prolongé, entre séries/exercices/tours, pause/reprise et suspension du navigateur.
- Compatibilité des séances anciennes : si `restMs` est absent, aucune récupération rétroactive fictive n'est calculée.
- Les champs correctifs du bilan permettent un ajustement explicite de l'activité et de la récupération.

### 2. Bilan et interface
- Chronographe dark/turquoise à cadran circulaire 1:1, graduations, anneaux, repère lumineux, typographie et signature « Chaque seconde compte. » d'après le visuel accepté le 22/11/2026.
- Temps actif, récupération, durée totale, proportion du temps actif, interruptions séparées ; rappel des repos programmés uniquement s'ils ont été déclenchés.
- Relecture et édition des anciens historiques conservées.

### 3. Séances types, programmes, variantes
- Cibles de répétitions obligatoires : valeur unique valide **ou** plage min/max cohérente ; erreurs sur carte et champs à l'enregistrement.
- Modes maintien et effort chronométré conservés même si leur durée est temporairement vide. Durée obligatoire lors de l'enregistrement ; édition de `59:30` à `1:02:00` sans perte de précision (stockage en secondes ; limite 4 h).
- Résistance nominale / charge / charge additionnelle : intitulé basé sur le matériel, sans conversion arbitraire des résistances élastiques.
- Variantes : choix pré-séance masqué quand une seule variante est disponible ; choix et historique conservés s'il en existe plusieurs.
- Bonifications chronométrées explicitement classées en mode effort chronométré.

### 4. Statistiques
- Répartition active/récupération/interruption des nouvelles séances.
- Somme des récupérations prévues uniquement lorsqu'elles ont été effectivement déclenchées.
- Anciennes séances identifiées comme non séparables sans retraitement spéculatif.

## Contrôles effectués
- `npm test` : 12 scripts historiques réussis et 12 nouveaux sous-tests réussis (horloge, durée, charges, intégration de cohérence).
- Transpilation de syntaxe des fichiers TS/TSX : aucune erreur détectée.
- Vérification TypeScript stricte sur les modules autonomes de calcul : réussie.
- Chronographe : vérification HTML/CSS statique à 320, 375 et 430 px ; **pas un test d'application iPhone**.
- Version du service worker synchronisée avec `src/version.ts`.

**Limites de l'environnement de génération :** pas de résolution réseau vers npm ou GitHub ; `npm install`, `npm run prepare:anatomy`, la compilation complète et le véritable navigateur de l'application n'ont donc pas pu être validés. Les captures statiques ne sont pas une recette fonctionnelle. La V23 n'est pas déclarée installable avant le succès du pipeline et de la recette sur iPhone.

## Déploiement strictement Preview

1. Conserver une copie du dépôt Preview actuel et exporter les données JSON de Preview depuis l'application. **Ne pas importer de fichier JSON dans le dépôt GitHub** : les données vivent sur l'iPhone dans IndexedDB.
2. Décompresser le ZIP source et copier les fichiers du dossier `LifeTrack-Training-Preview-main/` à la racine **du dépôt `LifeTrack-Training-Preview` uniquement**, en préservant le répertoire `.git` local s'il existe. Ne pas utiliser le dépôt de production `LifeTack---Test`.
3. Pousser sur la branche Preview `main` : GitHub Actions doit effectuer `npm install`, `npm run typecheck`, `npm test`, `npm run build` puis le déploiement Pages. **Si une étape échoue, ne pas entreprendre la recette sur le site non mis à jour.**
4. Lien Safari après confirmation du déploiement : https://svanoc-ai.github.io/LifeTrack-Training-Preview/ . Le dépôt **n'a pas été déployé depuis cette livraison**.
5. Conserver le JSON du 22/11/2026 comme sauvegarde indépendante pour vérifier la compatibilité.

## Recette iPhone V23 (à effectuer une seule fois sur la livraison consolidée)

1. Lancer 3 séries avec repos 30 s entre séries, attendre 10 s puis passer un repos, prolonger un second repos de 15 s. Vérifier que **repos mesuré ≠ repos prévu** et que `actif + récupération = total`.
2. Déclencher un repos, mettre en pause au bout de 10 s, attendre 20 s, reprendre : vérifier que l'interruption reste séparée et que le temps restant se poursuit sans saut.
3. Terminer la séance, vérifier le chronographe (cercle parfait et lisible en Safari/PWA), la récupération dans l'historique et les statistiques. Recharger puis rouvrir le même historique.
4. Tester maintien isométrique (RPE par série), répétitions (RIR par série) et effort chronométré, puis les retrouver dans l'historique.
5. Effacer complètement les répétitions, puis la durée d'un effort chronométré : aucun changement automatique de mode, erreur à l'enregistrement, absence de données invalides sauvegardées.
6. Saisir `59:30`, remplacer par `1:02:00`, sauvegarder, rouvrir et vérifier `1:02:00` ; vérifier la même opération en modification d'une séance planifiée.
7. Vérifier « Résistance nominale (kg) » avec SmartWorkout / SmartPress / élastiques, « Charge (kg) » avec poids libres, et « Charge additionnelle (kg) » si pertinente au poids de corps.
8. Bird-dog seul : aucun choix pré-séance superflu. Exercice à plusieurs variantes : sélecteur disponible et dernière variante conservée.
9. Vérifier sauvegarde/export JSON V4, ancienne séance et historique éditable, absence de défilement horizontal ou de chevauchement à 320–430 px.

## Réconciliation après V23
- **V24** : consolider les 20 groupes anatomiques, catalogue, variantes et IDs stables.
- **V25** : intégrer le laboratoire anatomique interactif dans le socle Preview.
- **V26** : statistiques anatomiques / progression, sans décrire la sollicitation estimée comme activation directement mesurée.
- **V27** : complétude Séances / Programmes / Historique / Stats et tests de non-régression.
- **V28** : accueil, ensuite simulations, customisation esthétique puis tests avec de vraies séances.

**Production intouchée.** Le ZIP contient l'intégralité du socle Preview modifié ; aucun JSON de données personnelles ou de tests utilisateur n'est incorporé.
