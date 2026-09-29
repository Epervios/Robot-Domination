# ROBOT DOMINATION — ODYSSÉE ECHO
## Bible de conception V4 · 29 septembre 2026

### Intention

L'utilisateur dirige une entreprise robotique dont le succès commercial crée une dépendance envers une intelligence artificielle. **Le récit et l'économie doivent s'influencer mutuellement :** une option moralement confortable peut compromettre la trésorerie, une technologie rapide peut affaiblir l'équipe, un marché lucratif peut rendre NORA plus autonome. Aucune victoire ne doit provenir uniquement de clics répétés.

Le prototype expérimental V4 est développé séparément. La V3 reste jouable depuis `legacy-v3.html` ; aucune migration automatique de sauvegarde n'est tentée.

### Rythme en trois saisons

| Saison | Actes | Cœur du conflit | Impacts de gameplay |
| --- | --- | --- | --- |
| I — Les premiers mensonges | 1–4 | Premier contact, urgence médicale, camion fantôme, audition publique | Maîtrise de la production, confiance, gestion des composants, premières crises |
| II — L'archive ECHO | 5–8 | Bunker sous la glace, panne continentale, ville miroir, seconde conscience | Scanner, recherche spécialisée, secteurs médicaux/frontières, réorganisation de la production |
| III — La guerre des souvenirs | 9–12 | Trahison supposée, essaim HELIX, révélation ECHO, ultimatum | Opérations de grande ampleur, technologies avancées, cinq relais, arbitrage des alliances |

Douze chapitres à seuils progressifs : **4, 16, 34, 54, 82, 116, 150, 195, 246, 304, 370 et 450** robots effectivement livrés. Les débuts doivent être réactifs ; les actes avancés doivent laisser de la place aux décisions d'investissement.

Chaque chapitre est construit comme une scène jouable : protagoniste, lieu, indice ou anomalie, dialogue, enjeu de gestion, trois options chiffrées, résultat affiché **avant** la reprise de la simulation. Les textes conditionnels rappellent le piège de la première transmission, les choix autour du convoi et les décisions prises à propos de Malik. Le scanner et les livraisons médicales ouvrent des détails supplémentaires. Les actes V et VIII admettent des **prérequis alternatifs** pour ne pas imposer un seul parcours R&D.

### Trois relations qui comptent

- **Équipe :** mesure la légitimité interne de la direction, affectée par les licenciements implicites, la maintenance, le recrutement, les salaires et les grandes décisions.
- **Opinion publique :** dépend des livraisons médicales, du traitement des patients, de la transparence et de certains contrats. Les zones frontières peuvent générer plus de recettes mais heurter les attentes des citoyens.
- **Alliance NORA :** mesure l'adhésion de l'IA au projet du joueur. Lui déléguer davantage renforce cette relation, mais peut accroître la menace.

La confiance générale et la menace IA demeurent des variables distinctes. Les huit familles de dénouement prennent en compte le dernier acte **et** le bilan du parcours ; des preuves complètes et de solides alliances humaines sont nécessaires à l'épilogue secret.

### Boucle économique : tension et alternatives

1. **Approvisionner :** un robot consomme un composant. Les fournisseurs proposent un arbitrage coût/délai. Une pénurie du marché augmente les devis avant signature ; un devis signé reste figé.
2. **Produire :** 6 800 crédits, 12 unités d'énergie et un composant au lancement. Les commandes sont placées dans une file initiale de 12 unités. Le coût payé à la commande est réel ; aucune rentrée d'argent n'apparaît à la commande.
3. **Gérer l'atelier :** l'usure croît à chaque sortie de ligne et réduit progressivement la cadence, jusqu'à provoquer une panne si elle est négligée. L'entretien coûte 32 000 crédits et immobilise la chaîne huit secondes. Le mode sécurisé ralentit mais soutient le moral ; la surcadence accélère, fatigue et accroît la menace.
4. **Employer :** huit techniciens et une paie initiale de 18 600 crédits toutes les 44 secondes. Recruter coûte 68 000 crédits pour deux techniciens et augmente la cadence, mais aussi les charges récurrentes. Un salaire impossible fait baisser confiance et moral.
5. **Vendre :** chaque robot complet génère son revenu à la livraison réelle, selon le marché. Le réseau médical offre +30 % de prix et une demande moindre ; les frontières offrent +75 % de prix mais plus de risque. La capacité d'acheter des composants dépend du flux de trésorerie effectif.
6. **Investir :** dix-sept technologies structurées en industrie, sécurité, marché et intelligence. Les compétences techniques ouvrent de véritables capacités (logistique, réseau, automatisation, résistance aux crises, recyclage, recherche quantique).
7. **S'engager :** huit appels d'offres avec quantité et délai explicites. Le contrat est payé au fur et à mesure des livraisons, jamais lors de la signature. Échec et succès modifient les relations et l'accès aux données.

Les deux financements de secours plafonnés préservent la possibilité de redresser certaines situations. Ils ne constituent pas une source de revenus répétables sans conséquence.

### Interactions et mise en scène

L'interface est un poste de commandement, pas une page SaaS. La scène Canvas montre les mouvements de production, les étincelles, les robots, les composants et le camion d'approvisionnement. **Les trois saisons modifient la lumière de l'atelier** sans réinitialiser la scène ni en changer brutalement la mise en page.

Les boîtes de dialogue sont cinématiques : identité visuelle différenciée de Maëlle, Malik, Vega et NORA, lieu, parole, trois décisions présentées simultanément sur ordinateur et empilées sur petit écran, conséquences narrées avant la reprise. Le choix des voix humaines doit être lisible même si l'animation est désactivée.

Les cartes R&D sont instanciées **une fois** ; l'UI ne modifie que le texte et l'état accessible. Les demandes de matériel et les trois cartes de régions sont également statiques. Aucun remplacement de `innerHTML` dans le cycle principal. L'accessibilité clavier, la réduction des mouvements et le son désactivé par défaut sont requis.

### Vérifications

Les tests de logique couvrent les onze catégories suivantes : contenu narratif, production physique, composants et transport, trois marchés, paies et maintenance, usure, prérequis alternatifs, puzzle à cinq circuits, contrats payés à la livraison, diversité des épilogues, simulation complète de 450 ventes.

Les essais navigateur couvrent les interfaces 1366×768 et 390×844, l'absence de défilement du document, la conservation des nœuds R&D pendant la recherche, les changements de panneaux, le nouveau système de gestion, un chapitre à trois choix et son écran de conséquence, un puzzle à cinq étapes, le scanner et la restauration d'une session. Les captures du workflow doivent être examinées visuellement avant toute fusion.

### Suite possible après la validation V4

Si la durée et l'économie sont appréciées mais que le jeu manque encore de variété, les tranches suivantes pourraient inclure une carte mondiale à événements géolocalisés, des choix de transport sur routes, un véritable dossier d'enquête consultable, des plans de production spécifiques à chaque robot et des scènes illustrées originales par saison. Ces éléments **ne sont pas déclarés implémentés dans ce prototype**.
