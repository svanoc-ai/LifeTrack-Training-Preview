# LifeTrack Training Preview — V24 candidate (22 novembre 2026)

**Statut : source candidate, pas de déploiement vérifié.** Publication réservée au dépôt Preview, production interdite.

## Évolutions regroupées
- Socle V23 consolidé : mesure des repos et interruptions, correction des durées sur iPhone, libellés selon le matériel et chronographe premium.
- Repos entre exercices individuels configurable depuis l'éditeur de séance type, en secondes. Compatibilité 120 s pour les anciennes séances sans réglage explicite.
- Le sélecteur de variantes avant séance est masqué s'il n'y a qu'une seule variante. Les options avancées de classification restent disponibles lorsqu'il y a plusieurs variantes, sans suppression de fonctionnalité.
- Statistiques musculaires : nouvelle lecture des instantanés de séances sur 20 groupes anatomiques, avec inconnues explicites et conservation de la vue historique à 12 groupes. Ces indicateurs sont des estimations de contribution à l'entraînement, jamais des mesures d'activation.
- Version applicative / service worker synchronisés en 2-G.0.0 pour forcer la mise à jour du cache PWA lors de l'activation.

## Vérifications faites
- `npm test` : succès (toutes les suites, dont V24 repos/durée, anatomie 20 groupes et branchement UI).
- Contrôle syntaxique TypeScript des fichiers de vues modifiés : succès.
- `node scripts/check-version.cjs --sync` : succès.
- Contrôle de la sauvegarde JSON 2026-11-22 : 6 séances types, 4 programmes, 48 planifications, 21 exécutions ; aucune donnée intégrée ou effacée par l'archive.

## Limite bloquante avant validation de publication
- `npm run typecheck` et `npm run build` n'ont pas pu être exécutés localement : dépendances React/Vite non disponibles et réseau vers npm bloqué (`EAI_AGAIN`). Ils doivent réussir dans GitHub Actions **avant toute recette**. Aucune réussite de compilation n'est revendiquée.

## Recette conditionnelle
1. Déployer uniquement dans `LifeTrack-Training-Preview`, conserver l'ancien export JSON.
2. Attendre le workflow GitHub Actions vert ; si rouge transmettre **le premier message d'erreur**.
3. Vérifier version `2-G.0.0` dans Plus sur Safari et PWA après fermeture/réouverture. Si besoin, utiliser l'option de recherche de mise à jour.
4. Vérifier repos 15 s et 120 s, 1 h 02 min, 1 variante unique (Bird-dog), historique et statistiques 20 groupes.

## À poursuivre, non déclaré achevé
Réconciliation exhaustive des fiches catalogue et des 66 propositions, classification de toutes les variantes et tests complets des intégrations 3D. Ne pas présenter cette candidate comme une V24 finale à 100 %.
