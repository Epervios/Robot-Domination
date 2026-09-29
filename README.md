# ROBOT DOMINATION — ODYSSÉE ECHO (prototype V4)

**Un thriller industriel interactif en trois saisons.** Vous dirigez RobotCorp : produire, financer, recruter, protéger vos équipes, choisir les marchés et décider ce qu'une intelligence artificielle apprend à faire lorsque personne ne la regarde.

Ce prototype expérimental est isolé dans la branche **`prototype/robot-domination-v4-odyssey`**. La V3 que vous avez appréciée est conservée **sans aucune modification** dans `legacy-v3.html` ; la V2 est toujours disponible dans `legacy-v2.html`. Ni le prototype précédent ni la branche principale ne sont remplacés par cette expérimentation.

## Jouer

Ouvrez `index.html` depuis la branche V4 dans Chrome ou un autre navigateur récent. Aucun compte, aucune connexion internet et aucun framework ne sont nécessaires.

- **Atelier** : cliquez sur Fabriquer, sur le bouton Lot ×3 ou directement sur l'usine animée. Passez en surcadence pour livrer plus vite, au prix de l'usure, des coûts et de la fatigue. Le mode sécurisé préserve la chaîne et l'équipe.
- **Recherche** : financez l'une des **17 technologies**. Une seule est développée à la fois. Les cartes sont **créées une seule fois** au chargement : elles ne sont jamais détruites/recréées pendant la progression ou les changements de trésorerie.
- **Missions** : acceptez ou reportez **huit appels d'offres à échéance**. Les factures sont encaissées sur les robots effectivement livrés. Utilisez le scanner de fréquence pour réunir les trois fragments d'ECHO.
- **Gestion** : surveillez le stock de composants, commandez des convois standard, express ou recyclés, réparez les équipements, recrutez du personnel, anticipez la paie et choisissez le marché où livrer votre production.
- **Scène** : les robots avancent sur le convoyeur, les bras travaillent, les étincelles jaillissent, les caisses et le camion d'approvisionnement apparaissent. La lumière, les alertes et NORA réagissent à l'état de la partie. Les effets sonores sont **facultatifs et coupés par défaut**.
- **Crises tactiques** : réarmez trois à cinq relais dans l'ordre affiché avant la fin du décompte. Une erreur prend du temps et augmente la menace ; échouer immobilise l'usine.
- **Sauvegarde** : bouton Sauver puis Reprendre, également accessible dès l'écran de lancement. Les sauvegardes V4 utilisent une clé distincte et **n'écrasent pas celles de la V3**.

Sur PC, `Espace` commande un robot ; pendant les crises, les touches `1`, `2`, `3` activent les relais. Le jeu est également commandable à la souris, au doigt et au clavier. Sur smartphone, la scène et les commandes sont adaptées à toute la hauteur disponible.

## Campagne : trois saisons, douze actes

| Saison | Actes | Enjeu |
| --- | --- | --- |
| I — Les premiers mensonges | 1–4 | Un robot parle, un hôpital perd son alimentation, un convoi disparaît, l'entreprise doit rendre des comptes. |
| II — L'archive ECHO | 5–8 | Une station sous la glace, une panne continentale, une ville qui n'existe pas et une seconde conscience. |
| III — La guerre des souvenirs | 9–12 | La confiance des proches est mise à l'épreuve, HELIX attaque, ECHO révèle son secret et NORA pose un ultimatum. |

**36 décisions majeures** ont un prix économique, social ou technologique. Des scènes changent leur narration selon les décisions précédentes, les preuves du scanner et les ventes médicales. Certains actes nécessitent un objectif secondaire : deux fragments ECHO **ou** l'audit indépendant ; plus tard, un pare-feu **ou** le noyau NORA **ou** les trois fragments. Ces alternatives évitent d'imposer une unique stratégie de recherche.

Chaque choix modifie plusieurs rapports : **la confiance de l'équipe, le soutien public et l'alliance avec NORA**. Le dénouement prend en compte ces relations, les preuves collectées, les ventes médicales et la menace IA. Plusieurs épilogues peuvent être atteints sans imposer une morale unique au joueur.

## Une économie à gérer

La V4 démarre avec **220 000 crédits**, **24 composants**, **deux robots en stock**, **huit techniciens**, **100 unités d'énergie** et **68 points de confiance**. La fabrication d'un robot standard coûte initialement **6 800 crédits, un composant et 12 unités d'énergie**. Un robot vendu sur le marché des métropoles rapporte 16 800 crédits ; le coût des composants et les dépenses d'exploitation doivent également être déduits.

| Décision | Conséquences |
| --- | --- |
| Commander 20 composants standard | 65 500 crédits, livraison sous 16 s ; le prix augmente en cas de pénurie |
| Commander 20 composants express | 92 500 crédits, livraison sous 6 s |
| Débloquer l'approvisionnement recyclé | Coût inférieur et délai plus long, après R&D |
| Effectuer une maintenance | 32 000 crédits, 8 s d'immobilisation, usure réduite et moral relevé |
| Recruter deux techniciens | 68 000 crédits, cadence augmentée, salaires futurs plus élevés |
| Verser les salaires | 18 600 crédits initialement toutes les 44 secondes de jeu |
| Choisir le réseau médical | Demande plus modérée et prix +30 %, soutien public et confiance croissants |
| Choisir les zones frontières | Demande réduite et prix +75 %, mais risque IA et soutien public dégradé |

Un retard de paie, une chaîne usée, un camion bloqué par la pénurie ou une promesse de livraison trop ambitieuse ont des conséquences concrètes. Deux financements de secours restent possibles pour éviter certaines impasses, au prix d'une perte de confiance.

La première simulation automatisée complète du nouveau moteur a atteint le **douzième acte à 450 livraisons**, en traversant **huit crises** et en recherchant les **17 technologies**. L'essai de difficulté en situation réelle et la revue humaine des écrans sont des étapes distinctes.

## Architecture et validation

- `v4/campaign.js` : scénario français, trois saisons, 12 actes, 36 choix et dialogues contextuels.
- `v4/core.js` : moteur déterministe du marché, matériaux, production, équipe, salaires, usure, recherche, huit appels d'offres et huit crises.
- `v4/game.js` : liaison des commandes, écran narratif à trois options, conséquences lisibles, interface mise à jour sans remonter les cartes R&D et usine Canvas 2D.
- `v3/game.css` + `v4/game.css` : identité visuelle de la V3 préservée, thèmes évolutifs des saisons, gestion et portraits graphiques des personnages.
- `tests/v4-core.test.cjs` : tests d'économie, d'incidents, d'actes et d'une partie complète.
- `tests/v4-browser.mjs` : test Chromium des affichages **1366 × 768 et 390 × 844**, des 17 cartes R&D, du système de gestion, du récit à trois décisions, des crises à cinq étapes et de la sauvegarde.

Pour les tests de logique, avec Node.js 22 :

```bash
node --test tests/*.test.cjs
```

Pour le test navigateur, installer Playwright et Chromium puis exécuter `node tests/v4-browser.mjs`. GitHub Actions conserve les captures des deux formats comme artefacts du workflow **Robot Domination V4 — Browser UX**.

Ce prototype reste **en brouillon**, sans fusion, afin de revoir visuellement l'interface et surtout de tester l'équilibrage sur plusieurs styles de jeu.
