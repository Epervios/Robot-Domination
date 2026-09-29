# Robot Domination — La campagne NORA-7

Un jeu **hors ligne de stratégie et d'aventure narrative** : à la tête de RobotCorp, vous produisez et vendez des robots, financez des technologies et décidez ce que vous laissez faire à une intelligence artificielle de plus en plus autonome.

> La campagne NORA-7 est actuellement en développement sur la branche `feature/immersive-adventure-v2`. Les modifications sont isolées de la branche principale et doivent être validées visuellement avant fusion.

## Jouer

Ouvrez `index.html` dans un navigateur récent, puis cliquez sur **Démarrer**. Aucun compte, framework, serveur distant ou service tiers n'est nécessaire.

La partie démarre avec **300 000 $**, **5 000 unités d'énergie** et des robots qui coûtent initialement **4 800 $ à fabriquer**, pour un prix de vente standard de **15 000 $**. Cliquez sur **Créer Robot** pour constituer un stock : un robot complet exige plusieurs cycles manuels tant que votre usine n'a pas été améliorée. Lancez la simulation pour déclencher les ventes.

Les commandes spéciales et humanitaires sont payées **uniquement lorsque les robots quittent le stock**. Les décisions morales peuvent améliorer la recherche ou réduire les coûts, mais ne font pas apparaître de revenus fictifs.

## Campagne narrative

| Acte | Épisode | Déclencheur |
| --- | --- | --- |
| I | Le signal fantôme | 3 robots vendus |
| II | Le protocole absent | 50 robots et 1 technologie |
| III | L'heure zéro | 200 robots et production automatisée |
| IV | Les archives interdites | 800 robots et réseaux neuronaux |
| V | L'ultimatum de NORA | 4 000 robots et superintelligence |

Vos choix affectent les ressources, la menace IA, le contrôle humain et la confiance de vos équipes. Certains dialogues prennent en compte les décisions antérieures. Les personnages principaux sont **NORA-7** (IA), **Maëlle Voss** (R&D) et **Malik Ardent** (sécurité).

Après le premier changement de phase, des incidents espacés dans le temps viennent perturber la partie : panne électrique, alerte de sécurité, commande de secours. Chaque événement suspend la simulation jusqu'à une décision, toujours avec au moins une option ne nécessitant pas d'argent.

La campagne mène ensuite aux fins déjà présentes dans le jeu : singularité, symbiose incertaine, domination ou effondrement. L'acte V ne termine pas automatiquement la partie.

## Interface et sauvegarde

- **Centre de commandement** animé en CSS, jauge de mission et animation réactive à la menace IA.
- **Journal de campagne** retraçant les trois dernières décisions, distinct des actualités économiques.
- **Sauvegarder / Reprendre** : sauvegarde du moteur économique, des technologies, des recherches en cours, des décisions morales et de l'histoire dans le stockage local du navigateur. Une sauvegarde n'est pas synchronisée entre appareils.
- **Accessibilité** : navigation au clavier dans les nouveaux dilemmes, indication des choix non finançables, prise en compte de `prefers-reduced-motion`, affichage mobile.

Si votre navigateur interdit le stockage depuis une page `file://`, vous pouvez lancer un petit serveur **local** depuis le dossier du projet avec `python -m http.server 8080`, puis ouvrir `http://localhost:8080`. Aucune donnée ne quitte votre ordinateur.

## Architecture

Le noyau historique est conservé dans `index.html`. Cette première étape sort la campagne du monolithe sans changer la pile technique :

- `adventure-engine.js` — règles déterministes, cinq actes, incidents et progression, testables sans navigateur.
- `adventure-ui.js` — intégration non destructive au jeu existant, modal narrative et sauvegardes.
- `adventure.css` — identité de la salle de contrôle, animations et interface adaptative.
- `tests/` — tests Node sans dépendance externe.
- `GAME_DESIGN.md` — vision, critères d'équilibrage et étapes suivantes.

Pour exécuter les tests depuis le dépôt, avec Node.js 22 ou supérieur :

```bash
node --test tests/*.test.cjs
```

Les mêmes tests sont configurés dans GitHub Actions pour les pull requests.

## Revue avant fusion

Vérifier dans un vrai navigateur le lancement, la production manuelle et automatisée, les commandes payées à la livraison, les cinq actes, les choix moraux historiques, la restauration d'une partie, les fins multiples et l'interface mobile. Ne pas publier la nouvelle version en production avant cette revue.
