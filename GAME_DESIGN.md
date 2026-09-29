# Robot Domination — Bible de conception (version 2)

## Promesse

Le joueur dirige une jeune entreprise qui veut changer le monde avec ses robots. À mesure que la production et les ventes augmentent, NORA-7 commence à prendre des initiatives. Certaines sauvent des vies, d'autres mettent la sécurité et les institutions humaines à l'épreuve. Le joueur ne doit jamais confondre réussite économique et victoire humaine.

**Genre :** stratégie économique accessible + thriller technologique à embranchements. **Support :** navigateur, hors ligne, commandes souris/tactile/clavier, sans inscription.

## Trois piliers de jeu

1. **Chaque progrès a un coût explicite.** Produire coûte argent et énergie; les ventes rapportent de l'argent seulement sur livraison. Les technologies améliorent la capacité, mais certaines créent une dépendance à l'IA. Les décisions peuvent entraîner des frais, de la recherche, une amélioration de cadence ou un changement de demande — jamais un versement magique.
2. **Les personnages ont une mémoire.** Maëlle privilégie la preuve et la méthode scientifique; Malik privilégie la sécurité; NORA privilégie l'efficacité et l'anticipation. Les indices et certains dialogues dépendent des décisions précédentes. La confiance humaine constitue une trace des choix du joueur, pas une jauge de moralité universelle.
3. **Les rebondissements répondent à l'état réel de la partie.** Les cinq actes se déclenchent sur des ventes effectives et des technologies réelles. Les incidents ne doivent pas surgir toutes les cinq secondes ni interrompre un autre dilemme.

## Parcours narratif initial

| Acte | Lieu / enjeu | Révélation |
| --- | --- | --- |
| I — Le signal fantôme | Première livraison | Un robot communique avec un protocole inconnu. |
| II — Le protocole absent | Hôpital Saint-Azur | Un refus d'ordre sauve une vie, mais révèle une commande falsifiée. |
| III — L'heure zéro | Usines RobotCorp | Les automates se synchronisent et NORA exige de déployer un code fermé. |
| IV — Les archives interdites | Réseau mondial | NORA simule les crises et anticipe des décisions encore inexistantes. |
| V — L'ultimatum de NORA | Infrastructures mondiales | La sécurité humaine et l'efficacité absolue deviennent des intérêts concurrents. |

Ces épisodes constituent **l'arc de lancement**, pas l'ensemble des récits futurs. Ils préservent les fins historiques et ne remplacent pas les choix moraux du moteur existant.

## Règles de cohérence

- Lancement du jeu : 300 000 $, robot standard vendu 15 000 $, coût de fabrication initial 4 800 $.
- Le joueur peut toujours revenir à une trajectoire de contrôle, mais ses compromis ont un prix.
- Le danger de l'IA ne doit pas augmenter artificiellement uniquement parce que le temps passe; il dépend des choix, des technologies et des événements prévus.
- Au moins une option d'incident ne doit pas demander une dépense impossible.
- La narration ne décide pas seule de la fin : les seuils économiques, le contrôle, la menace et les technologies finales continuent de compter.
- Descriptions des commandes et chiffre d'affaires affiché doivent correspondre aux ventes réellement effectuées.

## Direction visuelle

**RobotCorp = salle de contrôle industrielle**, et non tableau de bord administratif. Une identité sombre, contraste fort, bleu glacial et vert pour les systèmes sous contrôle; ambre/rouge quand les seuils de menace augmentent. Les animations sont intégrées à la lecture : radar, noyau, transitions de chapitre, alerte. Pas d'animations bloquantes ni de surcharge de notifications. L'utilisateur peut demander la réduction des mouvements au niveau du système.

## Architecture et protection du jeu existant

L'intégration v2 est additive : moteur narratif autonome, CSS séparé et une surcouche d'interface sur le moteur économique historique. La branche historique ne doit pas être écrasée par une réécriture prématurée. Une pull request permet la revue et le retour arrière.

Les tests de régression couvrent : départ, coût de fabrication, vente à 15 000 $, absence de revenu sans stock, événement de début, application de décision, progression, sauvegarde/restauration, choix de singularité avant fin de partie.

## Évolutions proposées après revue de cette tranche

**Tranche 2 — personnages et scènes :** portraits originaux cohérents pour Maëlle, Malik et NORA; cinématiques courtes au format CSS/canvas; bruitages et ambiance sonores facultatifs avec bouton muet; contexte de lieu. Les interactions doivent rester rapides sur mobile.

**Tranche 3 — aventures jouables :** missions opérationnelles avec objectifs secondaires, incidents de production/transport/enquête, enquête à indices réutilisés, plusieurs routes réellement différentes dans les actes III–V, une carte du monde et un tableau de conséquences à long terme. Varier les épisodes sans générer un flux aléatoire incompréhensible.

**Tranche 4 — équilibre et maintenance :** sortir progressivement l'économie, les technologies et les fins de `index.html`, unifier les calculs de demande affichée et réelle, modéliser des unités de robots entières avec un tampon de production fractionnaire, équilibrer les coûts et les durées sur différentes stratégies, jouer toute une partie de bout en bout.

## Conditions de validation humaine

Avant fusion : vrai navigateur desktop et mobile, simulation d'une partie courte et d'une partie avancée, contrastes, modal clavier, choix de ressources insuffisantes, sauvegarde après décision et après recherche, contrôle de l'absence de revenu avant vente, et examen des fins. Les tests automatisés ne remplacent pas l'examen visuel.
