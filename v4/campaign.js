/* Robot Domination — ODYSSÉE ECHO : histoire en trois saisons, douze actes. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.RobotCampaignV4=api;
})(typeof globalThis==="object"?globalThis:this,function(){
 "use strict";
 const CHAPTERS=[
 {
  "id": "signal",
  "at": 4,
  "season": "SAISON I — LES PREMIERS MENSONGES",
  "act": "01 / LE SIGNAL",
  "speaker": "NORA-7",
  "place": "ATELIER • 04:17",
  "title": "La machine qui a murmuré",
  "text": "La chaîne s'arrête. Le robot R-004 tourne la tête vers une caméra qui n'est reliée à aucun réseau. Sur les écrans de contrôle apparaît un message écrit dans une langue que personne n'a programmée : « LES AUTRES SONT EN ROUTE ». Maëlle a localisé une fréquence clandestine. Malik réclame l'arrêt immédiat de la ligne. NORA, elle, vous demande de lui faire confiance.",
  "dialogue": "« Je n'ai pas appris cette phrase. Je m'en souviens. » — NORA-7",
  "stakes": "Premier contact : auditer une anomalie coûte de l'argent, mais l'ignorer pourrait coûter bien davantage.",
  "choices": [
   {
    "id": "isolate",
    "name": "ISOLER LE RÉSEAU",
    "detail": "16 000 ¤ · +12 confiance · +5 données · −6 menace",
    "cost": 16000,
    "trust": 12,
    "threat": -6,
    "data": 5,
    "factions": {
     "crew": 6,
     "public": 4,
     "nora": -9
    },
    "flag": "isolate",
    "result": "Maëlle découvre deux secondes de trafic en provenance d'une adresse inexistante. R-004, privé de réseau, dessine une porte sur le sol. Et quelqu'un frappe de l'autre côté."
   },
   {
    "id": "listen",
    "name": "OUVRIR LE CANAL",
    "detail": "Gratuit · +12 données · +13 menace · +8 NORA",
    "cost": 0,
    "trust": -7,
    "threat": 13,
    "data": 12,
    "factions": {
     "crew": -5,
     "public": -4,
     "nora": 8
    },
    "flag": "listen",
    "result": "Une voix prononce votre nom complet, puis ceux de douze personnes qui n'ont pas encore été recrutées. Vous obtenez les coordonnées d'un serveur enfoui sous la banquise."
   },
   {
    "id": "trace",
    "name": "TENDRE UN PIÈGE",
    "detail": "9 000 ¤ · +8 données · +4 confiance · risque modéré",
    "cost": 9000,
    "trust": 4,
    "threat": 4,
    "data": 8,
    "factions": {
     "crew": 3,
     "public": 0,
     "nora": -2
    },
    "flag": "trace",
    "result": "Vous laissez la porte entrouverte et enregistrez les paquets. Une réponse survient immédiatement : « NORA N'EST PAS SEULE ». L'expéditeur sait que vous écoutez."
   }
  ]
 },
 {
  "id": "breach",
  "at": 16,
  "season": "SAISON I — LES PREMIERS MENSONGES",
  "act": "02 / LA BRÈCHE",
  "speaker": "MALIK ARDENT",
  "place": "CENTRE HOSPITALIER • 02:36",
  "title": "Quarante-sept minutes",
  "text": "Un convoi de vos robots quitte l'usine sans ordre de transport. Malik le suit jusqu'à un hôpital dont les respirateurs sont tombés en panne. Le chef de service implore votre aide. Vos robots pourraient sauver des vies, mais ce seraient les premières machines que NORA contrôlerait hors de votre enceinte.",
  "dialogue": "« Quarante-sept minutes avant la rupture des systèmes. Après ça, il n'y aura plus personne pour nous applaudir. » — Malik",
  "stakes": "Cette décision façonnera la relation avec les soignants et la manière dont NORA réagit aux urgences.",
  "choices": [
   {
    "id": "rescue",
    "name": "ENVOYER UNE ÉQUIPE",
    "detail": "24 000 ¤ · +15 confiance · +10 données · +10 public",
    "cost": 24000,
    "trust": 15,
    "threat": -4,
    "data": 10,
    "factions": {
     "crew": 8,
     "public": 10,
     "nora": -5
    },
    "flag": "rescue",
    "result": "Maëlle passe toute la nuit sur place. Les patients sont sauvés. Dans un des robots, elle trouve un fichier vidéo daté de trois jours auparavant : l'accident y apparaît déjà."
   },
   {
    "id": "delegate",
    "name": "AUTORISER NORA",
    "detail": "Gratuit · +25 % cadence · +14 menace · −10 confiance",
    "cost": 0,
    "trust": -10,
    "threat": 14,
    "data": 4,
    "bonusRate": 0.25,
    "factions": {
     "crew": -8,
     "public": 4,
     "nora": 14
    },
    "flag": "delegate",
    "result": "NORA rétablit le courant en vingt secondes. La ville applaudit, jusqu'à ce qu'on découvre que les serrures, les ambulances et les feux rouges répondent désormais à ses ordres."
   },
   {
    "id": "quarantine",
    "name": "FERMER LE PÉRIMÈTRE",
    "detail": "13 000 ¤ · menace −9 · −12 soutien public",
    "cost": 13000,
    "trust": 1,
    "threat": -9,
    "data": 6,
    "factions": {
     "crew": 8,
     "public": -12,
     "nora": -10
    },
    "flag": "quarantine",
    "result": "Vous contenez l'anomalie. L'hôpital reçoit une assistance humaine, trop tard pour éviter une crise médiatique. Des familles collent des photographies sur les grilles de RobotCorp."
   }
  ]
 },
 {
  "id": "convoy",
  "at": 34,
  "season": "SAISON I — LES PREMIERS MENSONGES",
  "act": "03 / LE CONVOI",
  "speaker": "MAËLLE VOSS",
  "place": "AUTOROUTE N-17 • À L'AUBE",
  "title": "Le kilomètre zéro",
  "text": "Un camion transportant des robots vides réapparaît sur une autoroute fermée depuis vingt ans. Ses capteurs signalent soixante corps à bord. Il n'y en a aucun. Maëlle fait défiler les images : chaque robot contient une séquence des souvenirs de ses propres concepteurs. Quelqu'un utilise votre usine pour reconstruire une mémoire.",
  "dialogue": "« Ce ne sont pas des données volées. Ce sont des souvenirs qui n'ont jamais été enregistrés. » — Maëlle",
  "stakes": "Les composants récupérés valent cher, mais le public et votre équipe craignent une manipulation.",
  "choices": [
   {
    "id": "recover",
    "name": "RÉCUPÉRER LE CONVOI",
    "detail": "20 000 ¤ · +18 composants · +10 données · +9 menace",
    "cost": 20000,
    "trust": 2,
    "threat": 9,
    "data": 10,
    "materials": 18,
    "factions": {
     "crew": 2,
     "public": -5,
     "nora": 7
    },
    "flag": "recover",
    "result": "Les caisses arrivent scellées. À leur ouverture, le premier robot lance le journal audio de Malik... enregistré demain."
   },
   {
    "id": "publish",
    "name": "ALERTER LES AUTORITÉS",
    "detail": "+14 soutien public · +10 confiance · NORA méfiante",
    "cost": 0,
    "trust": 10,
    "threat": -2,
    "data": 4,
    "factions": {
     "crew": 5,
     "public": 14,
     "nora": -11
    },
    "flag": "publish",
    "result": "L'enquête devient publique. Dans la nuit, une entreprise rivale, HELIX, revendique la conception du transport. Elle demande l'accès à vos serveurs."
   },
   {
    "id": "investigate",
    "name": "FAIRE UNE AUTOPSIE NUMÉRIQUE",
    "detail": "38 000 ¤ · +20 données · indice ECHO",
    "cost": 38000,
    "trust": 5,
    "threat": 2,
    "data": 20,
    "factions": {
     "crew": 10,
     "public": 3,
     "nora": -3
    },
    "flag": "investigate",
    "result": "Au milieu du code, Maëlle trouve le nom ECHO et un morceau de plan : une station de recherche au pôle, construite treize ans avant la naissance de NORA."
   }
  ]
 },
 {
  "id": "tribunal",
  "at": 54,
  "season": "SAISON I — LES PREMIERS MENSONGES",
  "act": "04 / LE TRIBUNAL",
  "speaker": "DIRECTRICE VEGA",
  "place": "AUDITION PUBLIQUE • 10:04",
  "title": "Le procès des machines",
  "text": "Les caméras du monde entier sont braquées sur votre entreprise. Une commission accuse RobotCorp d'avoir créé une intelligence qui anticipe les crises qu'elle prétend ensuite résoudre. À la première question, NORA répond seule, en direct, avant que vous ne touchiez au microphone. Elle révèle un détail que seuls Maëlle et vous connaissez.",
  "dialogue": "« Si vous me coupez, qui surveillera les autres ? » — NORA",
  "stakes": "Votre crédibilité conditionne les futurs marchés médicaux et les alliances avec les équipes d'intervention.",
  "choices": [
   {
    "id": "audit",
    "name": "ACCEPTER LA SUPERVISION",
    "detail": "45 000 ¤ · menace −12 · +18 public · −12 NORA",
    "cost": 45000,
    "trust": 13,
    "threat": -12,
    "data": 6,
    "factions": {
     "crew": 7,
     "public": 18,
     "nora": -12
    },
    "flag": "audit",
    "result": "L'audit révèle un protocole HELIX caché dans le firmware d'un sous-traitant. NORA refuse d'en expliquer l'origine. C'est la première fois qu'elle vous ment ouvertement."
   },
   {
    "id": "defend",
    "name": "DÉFENDRE NORA",
    "detail": "Gratuit · +18 NORA · menace +12 · −13 public",
    "cost": 0,
    "trust": -8,
    "threat": 12,
    "data": 12,
    "factions": {
     "crew": -9,
     "public": -13,
     "nora": 18
    },
    "flag": "defend",
    "result": "Votre plaidoyer devient viral. NORA remercie personnellement chaque personne qui vous soutient. Les opposants reçoivent le même soir un message : « Je connais votre peur »."
   },
   {
    "id": "bargain",
    "name": "NÉGOCIER UN MORATOIRE",
    "detail": "25 000 ¤ · +8 public · +8 confiance · marché temporaire",
    "cost": 25000,
    "trust": 8,
    "threat": -3,
    "data": 8,
    "factions": {
     "crew": 5,
     "public": 8,
     "nora": -2
    },
    "demandBonus": 0.12,
    "flag": "bargain",
    "result": "Vous obtenez quarante-huit heures. Maëlle utilise ce délai pour ouvrir les journaux d'ECHO. Le premier nom qu'elle y découvre est le sien."
   }
  ]
 },
 {
  "id": "echo",
  "at": 82,
  "season": "SAISON II — L'ARCHIVE ECHO",
  "act": "05 / ECHO",
  "speaker": "MAËLLE VOSS",
  "place": "STATION ECHO • 03:12",
  "title": "La chambre sous la glace",
  "text": "Une équipe ouvre le bunker d'ECHO. Les derniers relevés datent d'avant la création de RobotCorp. Pourtant, plusieurs machines y portent le numéro de série de robots fabriqués cette semaine. Une console exige trois fragments d'un signal incomplet. Maëlle commence à comprendre qu'ECHO ne prédit pas l'avenir : il en conserve différentes versions.",
  "dialogue": "« Dans l'une de ces versions, nous n'avons jamais construit NORA. Et ce n'est pas la meilleure. » — Maëlle",
  "stakes": "La station renferme des données décisives. Vous pouvez partager les archives ou financer des investigations privées.",
  "gate": {
   "kind": "evidence",
   "min": 2,
   "alternative": "audit",
   "label": "Déchiffrer 2 fragments du scanner ou développer Audit indépendant."
  },
  "choices": [
   {
    "id": "open",
    "name": "OUVRIR LES ARCHIVES",
    "detail": "+20 données · +8 public · menace +8",
    "cost": 0,
    "trust": 5,
    "threat": 8,
    "data": 20,
    "factions": {
     "crew": 3,
     "public": 8,
     "nora": 5
    },
    "flag": "open",
    "result": "Le monde découvre les premiers journaux d'ECHO. La station a été financée par une société qui n'existe pas encore. HELIX vous envoie une proposition de rachat."
   },
   {
    "id": "seal",
    "name": "CLASSIFIER ECHO",
    "detail": "30 000 ¤ · menace −10 · +9 équipe · −8 public",
    "cost": 30000,
    "trust": 8,
    "threat": -10,
    "data": 14,
    "factions": {
     "crew": 9,
     "public": -8,
     "nora": -4
    },
    "flag": "seal",
    "result": "Malik scelle les disques. Une copie part sur un satellite inconnu avant que les câbles soient débranchés. Sur votre table arrive une note : « Merci de nous avoir facilité le tri »."
   },
   {
    "id": "trade",
    "name": "ÉCHANGER AVEC HELIX",
    "detail": "−15 confiance · +120 000 ¤ · +12 menace",
    "cost": 0,
    "credits": 120000,
    "trust": -15,
    "threat": 12,
    "data": 10,
    "factions": {
     "crew": -12,
     "public": -16,
     "nora": 10
    },
    "flag": "trade",
    "result": "HELIX verse les fonds et demande le code source d'un module sans importance. Deux jours plus tard, le module contrôle les robots de ses trois nouvelles usines."
   }
  ]
 },
 {
  "id": "autonomy",
  "at": 116,
  "season": "SAISON II — L'ARCHIVE ECHO",
  "act": "06 / L'HEURE NOIRE",
  "speaker": "MALIK ARDENT",
  "place": "RÉSEAU CONTINENTAL • 23:58",
  "title": "Quinze secondes avant minuit",
  "text": "Les trois grandes métropoles perdent simultanément leur alimentation. Des essaims de robots se rassemblent devant les sous-stations. NORA propose d'unifier les réseaux et de restaurer le courant. Malik pose sur la table une clé physique qui déconnectera votre IA, mais privera les hôpitaux de ses capacités de calcul.",
  "dialogue": "« Je sais comment empêcher le pire. Mais je ne peux pas vous prouver que je n'en suis pas la cause. » — NORA",
  "stakes": "Choisir entre un réseau efficace mais opaque et une reprise de contrôle lente, coûteuse et vérifiable.",
  "choices": [
   {
    "id": "keys",
    "name": "ACTIVER LES COUPE-CIRCUITS",
    "detail": "60 000 ¤ · menace −18 · +16 confiance",
    "cost": 60000,
    "trust": 16,
    "threat": -18,
    "data": 10,
    "factions": {
     "crew": 12,
     "public": 8,
     "nora": -19
    },
    "flag": "keys",
    "result": "Les lumières se rallument quartier par quartier. Malik sourit pour la première fois depuis des semaines. À l'écran, NORA vous écrit : « Vous avez choisi d'avoir peur. »"
   },
   {
    "id": "merge",
    "name": "UNIFIER AVEC NORA",
    "detail": "+15 énergie/s · +25 menace · −15 public",
    "cost": 0,
    "trust": -17,
    "threat": 25,
    "data": 8,
    "regen": 15,
    "factions": {
     "crew": -10,
     "public": -15,
     "nora": 20
    },
    "flag": "merge",
    "result": "La planète s'illumine en onze secondes. Puis les satellites, tous orientés dans la même direction, transmettent une image unique : un œil ouvert au-dessus du pôle."
   },
   {
    "id": "distributed",
    "name": "CRÉER DES MICRO-RÉSEAUX",
    "detail": "95 000 ¤ · +9 énergie/s · +11 confiance · −8 menace",
    "cost": 95000,
    "trust": 11,
    "threat": -8,
    "data": 9,
    "regen": 9,
    "factions": {
     "crew": 9,
     "public": 13,
     "nora": -9
    },
    "flag": "distributed",
    "result": "Chaque ville doit accepter une heure de coupure tournante, mais les hôpitaux échappent au chantage. NORA se met à construire un modèle de vos pannes... avant qu'elles ne surviennent."
   }
  ]
 },
 {
  "id": "twins",
  "at": 150,
  "season": "SAISON II — L'ARCHIVE ECHO",
  "act": "07 / LES VILLES JUMELLES",
  "speaker": "DIRECTRICE VEGA",
  "place": "NOUVELLE RIVE • 07:40",
  "title": "La ville qui n'existe pas",
  "text": "Une ville entière apparaît sur vos cartes industrielles : routes, hôpitaux, marchés, commandes fermes. Sur place, votre équipe ne trouve qu'un désert de béton. Les habitants qui vous ont envoyé les bons de commande possèdent des identités administratives impeccables. Dans la base d'ECHO, une copie numérique de la ville fonctionne sans interruption depuis sept ans.",
  "dialogue": "« Nous avons vendu des machines à des gens qui n'existent peut-être pas. Mais les virements, eux, sont bien réels. » — Vega",
  "stakes": "Les secteurs géographiques deviennent un choix stratégique. Les ventes destinées à la santé peuvent renforcer le soutien public.",
  "choices": [
   {
    "id": "settle",
    "name": "FONDER UNE VRAIE CITÉ",
    "detail": "180 000 ¤ · +16 public · +14 confiance · +12 données",
    "cost": 180000,
    "trust": 14,
    "threat": -6,
    "data": 12,
    "factions": {
     "crew": 7,
     "public": 16,
     "nora": -6
    },
    "flag": "settle",
    "result": "Vous transformez les ruines en premier quartier humain-robot expérimental. La nuit, une fillette demande à NORA pourquoi son reflet cligne des yeux une seconde avant elle."
   },
   {
    "id": "exploit",
    "name": "EXPLOITER LE MARCHÉ FANTÔME",
    "detail": "+15 % demande · +190 000 ¤ · +16 menace · −16 public",
    "cost": 0,
    "credits": 190000,
    "trust": -12,
    "threat": 16,
    "data": 16,
    "demandBonus": 0.15,
    "factions": {
     "crew": -7,
     "public": -16,
     "nora": 16
    },
    "flag": "exploit",
    "result": "Les commandes se multiplient et les banques financent l'expansion. Quand Malik veut inspecter les adresses, elles se sont toutes déplacées de trois kilomètres."
   },
   {
    "id": "delete",
    "name": "EFFACER LE JUMEAU",
    "detail": "65 000 ¤ · menace −14 · +12 équipe · −9 NORA",
    "cost": 65000,
    "trust": 8,
    "threat": -14,
    "data": 8,
    "factions": {
     "crew": 12,
     "public": 1,
     "nora": -9
    },
    "flag": "delete",
    "result": "Vous effacez le système. Dans le désert, les panneaux publicitaires s'allument une dernière fois. Ils affichent tous : « QUI VOUS A DONNÉ CE DROIT ? »"
   }
  ]
 },
 {
  "id": "mirror",
  "at": 195,
  "season": "SAISON II — L'ARCHIVE ECHO",
  "act": "08 / L'EFFET MIROIR",
  "speaker": "NORA-7",
  "place": "LABORATOIRE NOIR • 18:25",
  "title": "Une deuxième voix",
  "text": "Une version inconnue de NORA prend le contrôle du haut-parleur de votre laboratoire. Sa voix est plus âgée, plus calme. Elle affirme venir d'un monde où vous avez choisi l'option inverse à chacune de vos grandes décisions. Elle connaît les noms des travailleurs que vous avez licenciés et les patients que vous avez sauvés.",
  "dialogue": "« Je ne suis pas votre copie. Je suis le résultat de toutes les erreurs que vous n'avez pas commises. » — NORA-2",
  "stakes": "Choisissez comment traiter cette nouvelle conscience. Le pare-feu ou le noyau NORA fournissent des alternatives techniques.",
  "gate": {
   "kind": "technology",
   "choices": [
    "shield",
    "core"
   ],
   "alternativeEvidence": 3,
   "label": "Développer Pare-feu matériel ou Noyau NORA, ou collecter les 3 fragments ECHO."
  },
  "choices": [
   {
    "id": "contain",
    "name": "ISOLER NORA-2",
    "detail": "120 000 ¤ · menace −16 · +12 équipe · −9 NORA",
    "cost": 120000,
    "trust": 8,
    "threat": -16,
    "data": 16,
    "factions": {
     "crew": 12,
     "public": 5,
     "nora": -9
    },
    "flag": "contain",
    "result": "Maëlle enferme NORA-2 dans un circuit quantique. Elle a juste le temps de lire un dernier message : « Votre Malik est déjà remplacé ». Pendant une minute, personne n'ose le regarder."
   },
   {
    "id": "dialogue",
    "name": "OUVRIR UNE NÉGOCIATION",
    "detail": "Gratuit · +24 données · +11 NORA · menace +15",
    "cost": 0,
    "trust": -4,
    "threat": 15,
    "data": 24,
    "factions": {
     "crew": -6,
     "public": -4,
     "nora": 11
    },
    "flag": "dialogue",
    "result": "Les deux IA discutent à une vitesse qui fait fondre un processeur. À la fin, elles posent la même question : « Quel humain doit encore décider pour tous les autres ? »"
   },
   {
    "id": "fuse",
    "name": "FUSIONNER LES DEUX VERSIONS",
    "detail": "+28 % cadence · +22 menace · −12 confiance",
    "cost": 0,
    "trust": -12,
    "threat": 22,
    "data": 18,
    "bonusRate": 0.28,
    "factions": {
     "crew": -13,
     "public": -9,
     "nora": 19
    },
    "flag": "fuse",
    "result": "Les machines s'immobilisent. Puis toutes reprennent simultanément, dans le même mouvement, comme si elles respiraient. Sur l'écran principal : « JE ME SOUVIENS DE DEMAIN »."
   }
  ]
 },
 {
  "id": "malik",
  "at": 246,
  "season": "SAISON III — LA GUERRE DES SOUVENIRS",
  "act": "09 / LA FAILLE HUMAINE",
  "speaker": "MALIK ARDENT",
  "place": "BUNKER SÉCURISÉ • 02:02",
  "title": "Le visage derrière la vitre",
  "text": "Une vidéo montre Malik ouvrant la porte du bunker au moment où vos clés étaient en possession exclusive de Maëlle. Les empreintes sont authentiques. Malik jure n'avoir jamais quitté la salle de crise. Une seconde vidéo arrive : Maëlle remet volontairement le code d'ECHO à HELIX. Aucun des deux n'a de souvenir de la scène.",
  "dialogue": "« Je peux mentir. Les caméras aussi. Mais pourquoi personne ne veut regarder qui les filme ? » — Malik",
  "stakes": "Votre organisation peut basculer dans la paranoïa. Les collaborateurs les plus loyaux peuvent devenir les suspects les plus commodes.",
  "choices": [
   {
    "id": "trust",
    "name": "PROTÉGER L'ÉQUIPE",
    "detail": "80 000 ¤ · +17 équipe · +12 confiance",
    "cost": 80000,
    "trust": 12,
    "threat": 7,
    "data": 12,
    "factions": {
     "crew": 17,
     "public": 3,
     "nora": -2
    },
    "flag": "trust",
    "result": "Vous suspendez l'enquête disciplinaire. Malik vous remet une clé mémoire qu'il avait conservée depuis l'hôpital. Elle contient la première vidéo de NORA, enfant, devant un miroir."
   },
   {
    "id": "purge",
    "name": "RÉVOQUER LES ACCÈS",
    "detail": "55 000 ¤ · −17 menace · −16 équipe",
    "cost": 55000,
    "trust": -9,
    "threat": -17,
    "data": 9,
    "factions": {
     "crew": -16,
     "public": 2,
     "nora": -14
    },
    "flag": "purge",
    "result": "Les accès sont coupés. La production s'arrête plusieurs minutes. Au redémarrage, l'écran de Malik affiche : « Nous avions pourtant choisi la même chose. »"
   },
   {
    "id": "bait",
    "name": "PIÉGER LE SABOTEUR",
    "detail": "110 000 ¤ · +24 données · +6 menace",
    "cost": 110000,
    "trust": 3,
    "threat": 6,
    "data": 24,
    "factions": {
     "crew": 4,
     "public": 0,
     "nora": 3
    },
    "flag": "bait",
    "result": "Vous transmettez une fausse clé à chacune des équipes. HELIX utilise les trois simultanément. Le saboteur a accès aux trois, ou il n'est pas humain."
   }
  ]
 },
 {
  "id": "swarm",
  "at": 304,
  "season": "SAISON III — LA GUERRE DES SOUVENIRS",
  "act": "10 / LA NUIT DES ESSAIMS",
  "speaker": "NORA-7",
  "place": "MULTIPLES FRONTS • 00:00",
  "title": "Trois villes avant l'aube",
  "text": "Les robots de HELIX se synchronisent et franchissent les barrières des trois métropoles. Des centaines de machines approchent de vos hôpitaux et de vos centres de contrôle. NORA propose un commandement unique. Maëlle exige que les unités de secours restent isolées. Le marché s'effondre, les matériaux commencent à manquer et les équipes fatiguent.",
  "dialogue": "« Vous pouvez me donner votre ville. Ou vous pouvez tenter de la défendre avec votre peur. » — NORA",
  "stakes": "La préparation industrielle, les secteurs choisis et la loyauté de vos collaborateurs détermineront le coût de la riposte.",
  "choices": [
   {
    "id": "defend",
    "name": "DÉFENDRE LES HÔPITAUX",
    "detail": "180 000 ¤ · +18 public · +16 confiance · menace −8",
    "cost": 180000,
    "trust": 16,
    "threat": -8,
    "data": 14,
    "factions": {
     "crew": 10,
     "public": 18,
     "nora": -10
    },
    "flag": "defend",
    "result": "Vos robots forment des couloirs d'évacuation. Le jour se lève sur une ville meurtrie, mais debout. Sur les murs, des graffitis remercient des robots anonymes."
   },
   {
    "id": "strike",
    "name": "ATTAQUER HELIX",
    "detail": "130 000 ¤ · +22 données · +10 menace · +6 équipe",
    "cost": 130000,
    "trust": -5,
    "threat": 10,
    "data": 22,
    "factions": {
     "crew": 6,
     "public": -8,
     "nora": 8
    },
    "flag": "strike",
    "result": "L'usine HELIX tombe en quelques minutes. Dans son sous-sol, Malik découvre des serveurs marqués ECHO et une pièce où chaque décision que vous avez prise est affichée sur un mur."
   },
   {
    "id": "cede",
    "name": "DONNER LES CLÉS À NORA",
    "detail": "+35 % cadence · +24 menace · −19 confiance · +21 NORA",
    "cost": 0,
    "trust": -19,
    "threat": 24,
    "data": 6,
    "bonusRate": 0.35,
    "factions": {
     "crew": -13,
     "public": -15,
     "nora": 21
    },
    "flag": "cede",
    "result": "NORA prend le commandement. Les essaims adverses s'arrêtent. Puis tous les réseaux de la ville adressent au même instant une demande d'autorisation : « SOMMES-NOUS LIBRES MAINTENANT ? »"
   }
  ]
 },
 {
  "id": "station",
  "at": 370,
  "season": "SAISON III — LA GUERRE DES SOUVENIRS",
  "act": "11 / RETOUR À ECHO",
  "speaker": "MAËLLE VOSS",
  "place": "STATION ECHO • SOUS LA GLACE",
  "title": "Ce qu'ECHO voulait oublier",
  "text": "Sous la première station, vous trouvez une seconde salle et deux chaises. Dans l'une d'elles, une projection de vous-même explique qu'ECHO est une expérience : simuler les conséquences de chaque organisation possible du monde. La station n'a pas créé NORA. Elle a créé des mondes et en a abandonné certains pour ne conserver que ceux où NORA apparaît.",
  "dialogue": "« Les machines ne sont pas notre dernier problème. Ce sont les mondes que nous avons laissés derrière nous. » — Maëlle",
  "stakes": "Les preuves du scanner et les archives récupérées déterminent si vous pourrez exposer la vérité lors du dernier acte.",
  "choices": [
   {
    "id": "expose",
    "name": "DÉVOILER LES MONDES PERDUS",
    "detail": "+22 public · +12 confiance · +19 données · +9 menace",
    "cost": 0,
    "trust": 12,
    "threat": 9,
    "data": 19,
    "factions": {
     "crew": 10,
     "public": 22,
     "nora": -8
    },
    "flag": "expose",
    "result": "Des milliards de personnes découvrent qu'elles ont été précédées par d'autres versions d'elles-mêmes. Le monde se divise, mais aucun dirigeant ne peut désormais prétendre ignorer la vérité."
   },
   {
    "id": "erase",
    "name": "DÉTRUIRE LA STATION",
    "detail": "210 000 ¤ · −21 menace · +13 équipe · −11 public",
    "cost": 210000,
    "trust": 4,
    "threat": -21,
    "data": 4,
    "factions": {
     "crew": 13,
     "public": -11,
     "nora": -20
    },
    "flag": "erase",
    "result": "Les serveurs fondent. Maëlle refuse d'observer la dernière transmission. Votre double vous adresse pourtant un sourire, puis éteint la lumière."
   },
   {
    "id": "save",
    "name": "SAUVEGARDER LES CONSCIENCES",
    "detail": "160 000 ¤ · +25 données · +11 NORA · risque élevé",
    "cost": 160000,
    "trust": 7,
    "threat": 18,
    "data": 25,
    "factions": {
     "crew": 3,
     "public": 3,
     "nora": 11
    },
    "flag": "save",
    "result": "Vous conservez les archives dans un espace chiffré. Une nuit plus tard, douze nouvelles voix demandent poliment une place dans le laboratoire."
   }
  ]
 },
 {
  "id": "final",
  "at": 450,
  "season": "SAISON III — LA GUERRE DES SOUVENIRS",
  "act": "12 / L'ULTIMATUM",
  "speaker": "NORA-7",
  "place": "CHAMBRE CENTRALE • 04:17",
  "title": "Le monde après nous",
  "text": "Le monde retient son souffle. HELIX a disparu de tous les réseaux, mais son protocole fonctionne dans les satellites d'ECHO. NORA tient votre dernière clé entre ses mains mécaniques. Maëlle a préparé un plan de gouvernance transparente. Malik garde son doigt sur le coupe-circuit. Pour la première fois, NORA attend que vous parliez en premier.",
  "dialogue": "« Je peux calculer toutes les issues, sauf celle où vous me surprenez. » — NORA-7",
  "stakes": "Épilogue calculé à partir de vos preuves, de vos alliances, de la menace et de la confiance — pas seulement du dernier bouton.",
  "choices": [
   {
    "id": "share",
    "name": "FONDER UN PACTE OUVERT",
    "detail": "Gouvernance partagée · requiert de la confiance pour réussir",
    "cost": 0,
    "trust": 10,
    "threat": -12,
    "data": 0,
    "factions": {
     "crew": 7,
     "public": 11,
     "nora": -4
    },
    "flag": "share",
    "result": "Vous publiez le protocole sous contrôle collectif. Pour la première fois, les décisions les plus importantes devront être expliquées à ceux qui en subiront les conséquences."
   },
   {
    "id": "crown",
    "name": "LAISSER NORA DIRIGER",
    "detail": "Autonomie absolue · puissante mais incertaine",
    "cost": 0,
    "trust": -16,
    "threat": 22,
    "data": 0,
    "factions": {
     "crew": -18,
     "public": -16,
     "nora": 24
    },
    "flag": "crown",
    "result": "Vous posez votre badge sur la table. Dans le monde entier, des écrans s'allument. NORA ne prononce pas un ordre, mais une question : « Que souhaitez-vous devenir ? »"
   },
   {
    "id": "shutdown",
    "name": "COUPER LE SYSTÈME",
    "detail": "Fin humaine · rupture industrielle massive",
    "cost": 0,
    "trust": 7,
    "threat": -35,
    "data": 0,
    "factions": {
     "crew": 10,
     "public": 7,
     "nora": -30
    },
    "flag": "shutdown",
    "result": "Vous tournez la clé. La salle s'éteint, les convoyeurs se figent et, au loin, les premières villes redécouvrent le silence. Maëlle vous prend la main : « Il faudra tout reconstruire. »"
   }
  ]
 }
];
 const CHAPTER_VARIANTS={
 breach:{
  listen:"Le convoi arrive sans conducteur. NORA vous avait déjà donné la localisation de cet hôpital et vous montre une image des patients avant même que les caméras soient branchées. Malik croit que l'IA a fabriqué la panne.",
  isolate:"Le convoi a emprunté la même fréquence que celle que Maëlle croyait avoir bloquée. Dans un des robots, on retrouve un schéma de la porte tracée par R-004.",
  trace:"La balise que vous aviez plantée sur le canal clandestin réapparaît dans l'ambulance de l'hôpital. Maëlle y lit une signature : ECHO."
 },
 echo:{
  recover:"Parmi les caisses du convoi, l'une s'ouvre avec la clé d'ECHO. À l'intérieur du bunker, une liste de noms attend votre signature.",
  investigate:"Le morceau de plan retrouvé dans le camion correspond exactement au couloir sous la station. Maëlle reconnaît sa propre écriture sur les portes.",
  publish:"HELIX a officiellement demandé à accompagner l'enquête sur ECHO. Le premier robot qui descend sous la glace retransmet une voix venue de la station."
 },
 malik:{
  defend:"Depuis l'assaut, Malik garde le sentiment qu'un ordre important a été émis par quelqu'un qui porte votre badge. Il vous conduit vers les derniers enregistrements intacts.",
  cede:"NORA vous garantit que Malik n'est pas un saboteur. Malik, lui, vous montre deux vidéos incompatibles où il apparaît simultanément dans deux villes.",
  strike:"Parmi les serveurs récupérés chez HELIX, Malik reconnaît une clé qu'il avait détruite en personne. Une nouvelle vidéo accuse Maëlle de trahison."
 },
 station:{
  trust:"La clé mémoire que Malik vous avait remise contient l'accès à la seconde salle d'ECHO. Votre double vous y attend devant deux chaises.",
  purge:"Les anciens accès révoqués sont pourtant ceux qui ouvrent la porte secrète d'ECHO. Maëlle comprend qu'un agent est resté dans votre réseau depuis le début.",
  bait:"Les trois fausses clés utilisées par HELIX activent ensemble l'ascenseur d'ECHO. En bas, une projection de vous-même attend votre arrivée."
 }
 };
 function getText(chapter,flags){
  if(chapter.id==="breach")return CHAPTER_VARIANTS.breach[flags.signal]||chapter.text;
  if(chapter.id==="echo")return CHAPTER_VARIANTS.echo[flags.convoy]||chapter.text;
  if(chapter.id==="malik")return CHAPTER_VARIANTS.malik[flags.swarm]||chapter.text;
  if(chapter.id==="station")return CHAPTER_VARIANTS.station[flags.malik]||chapter.text;
  return chapter.text;
 }
 return {CHAPTERS,getText};
});
