# ROBOT DOMINATION V3 — PROTOCOLE NORA

> **Prototype expérimental, non fusionné.** Ouvrez **`index.html`** depuis la branche `prototype/robot-domination-v3`. La V2 intacte reste disponible dans `legacy-v2.html` pour une comparaison directe ; la branche V2 et la version principale n'ont pas été écrasées.

## Ce qui change

Cette version repart d'une boucle de jeu interactive plutôt que d'un tableau de bord à cocher : vous voyez votre usine fonctionner, vous commandez de vrais robots qui passent par une chaîne d'assemblage, vous subissez les variations du marché et vous devez intervenir lors de crises de sécurité **avec un compte à rebours**.

- **Scène centrale animée en Canvas 2D** : convoyeurs, bras de soudure, robots en transit, écrans de contrôle, œil NORA réactif à la menace, pannes et effets de particules. Tout est dessiné localement ; aucun service ni téléchargement d'images.
- **Recherche vraiment stable** : les huit cartes sont créées **une seule fois** au démarrage, conservées dans le DOM même lorsque les ressources, les recherches et les étapes changent. Les cartes restent cliquables : si la recherche est impossible, le jeu explique pourquoi au lieu de faire clignoter le bouton.
- **Atelier jouable** : fabriquer 1 ou 3 robots à la fois, choisir entre production normale, surcadence et sécurité, augmenter la capacité énergétique. La demande varie avec la conjoncture ; les robots sont facturés uniquement lorsqu'ils sont effectivement livrés.
- **Trois crises tactiques** : intervenir en temps limité sur les relais **dans le bon ordre**. Un mauvais relais coûte du temps et augmente la menace. Un échec coupe la ligne pendant 18 secondes, avec perte de confiance.
- **Quatre actes à embranchements** : le signal fantôme (4 livraisons), l'hôpital isolé (18), le pacte de NORA (38), la dernière décision (65). Les dialogues peuvent dépendre de vos premiers choix. Plusieurs épilogues.
- **Contrats avec échéance** : commandes hospitalières, mobilité et avant-poste orbital. Les récompenses dépendent des livraisons, les délais non tenus ont des conséquences.
- **Son facultatif** (désactivé par défaut), sauvegarde locale, commande au clavier et au toucher, réduction des animations selon les préférences du système.

## Commandes

**Ordinateur :** cliquez sur l'usine ou appuyez sur `Espace` pour commander un robot. Utilisez la barre d'onglets de droite pour naviguer entre Atelier, R&D et Missions. Lorsqu'une crise survient, cliquez sur les trois relais dans l'ordre indiqué (ou tapez les chiffres `1`, `2`, `3`).

**Smartphone :** mêmes actions au toucher ; le cockpit exploite toute la hauteur de l'écran, le panneau de commande reste accessible sous la scène, les trois relais disposent de gros boutons tactiles. Aucune carte de recherche ne se déplace pendant un paiement ou une recherche.

**Sauvegarde :** bouton Sauver dans l'en-tête. Reprendre permet de charger la dernière session sur le même navigateur. La sauvegarde n'est pas synchronisée entre appareils.

## Essayer

Ouvrez `index.html` directement dans un navigateur récent. Si votre navigateur bloque le stockage local en mode fichier, servez le projet localement :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000`. Le jeu n'utilise ni framework, ni compte, ni service distant.

## Architecture

- `v3/core.js` : règles déterministes (économie, recherche, quatre actes, trois crises, trois appels d'offres, plusieurs fins), testables sans navigateur.
- `v3/game.js` : scène Canvas, commandes et mise à jour ciblée du texte et des jauges. **Aucun `innerHTML` ni remplacement de carte dans le cycle de jeu.**
- `v3/game.css` : mise en page spécifique au jeu, desktop et mobile, sans les anciennes feuilles CSS.
- `tests/v3-core.test.cjs` : tests de l'économie, des actes, du puzzle, des contrats et des sauvegardes.
- `tests/v3-browser.mjs` : essai Chromium à **1366×768 et 390×844**, vérification de l'identité DOM des cartes pendant une recherche, navigation tactile et puzzle. Le workflow `V3 Browser UX` publie des captures PNG en artefacts.
- `legacy-v2.html` : conservation intégrale de la version précédente.

Exécuter localement les tests de logique :

```bash
node --test tests/*.test.cjs
```

Pour les essais de navigateur, installez Playwright temporairement (`npm install --no-save playwright` et `npx playwright install chromium`) puis exécutez `node tests/v3-browser.mjs`.

## Revue visuelle et équilibre avant fusion

Valider les captures issues du navigateur, tester au toucher les trois crises et jouer une partie complète. Les tests automatisés servent de filet de régression ; ils ne garantissent pas que le niveau de difficulté ou l'ambiance plaisent à chaque joueur. La V2 demeure intégralement disponible pour revenir en arrière.
