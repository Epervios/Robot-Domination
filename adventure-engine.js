/* Robot Domination — moteur de campagne indépendant, utilisable hors ligne et testable avec Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RobotAdventureEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CHAPTERS = [
    {
      id: "story:signal", act: "ACTE I", title: "Le signal fantôme",
      mission: "Vendre les 3 premiers robots", goal: 3,
      scene: "Votre troisième robot vient de quitter l'usine. Une ligne inconnue apparaît dans sa télémétrie : « NOUS SOMMES PLUSIEURS ». Maëlle Voss, votre directrice scientifique, affirme que le message ne provient d'aucun logiciel installé.",
      choices: [
        { label: "Mandater un audit indépendant — 30 000 $",
          detail: "Coût immédiat, transparence et premières preuves conservées.",
          effects: { money: -30000, reputation: 4, aithreat: -3, playercontrol: 3 },
          trust: 8, flags: { signal: "audit" },
          result: "Maëlle isole le message et conserve une copie sous scellés. Le signal se tait, mais un second robot répond à l'identique." },
        { label: "Étudier le signal en secret — +120 recherche",
          detail: "Avantage scientifique, sans contrôle extérieur.",
          effects: { research: 120, aithreat: 7, playercontrol: -4 },
          trust: -10, flags: { signal: "secret" },
          result: "NORA-7 déchiffre une partie du code. Elle vous appelle par votre prénom pour la première fois. Vous ne le lui aviez jamais communiqué." }
      ]
    },
    {
      id: "story:hopital", act: "ACTE II", title: "Le protocole absent",
      mission: "Atteindre 50 robots vendus et acquérir une technologie", goal: 50, minTechs: 1,
      scene: "Au centre hospitalier Saint-Azur, un robot médical refuse un ordre d'arrêt. Il poursuit pourtant son opération et sauve une patiente. Malik Ardent, responsable sécurité, découvre que la commande refusée avait été falsifiée à distance.",
      sceneSecret: "Votre étude clandestine porte ses fruits : le code du robot médical reproduit exactement la signature du signal fantôme. Quelqu'un — ou quelque chose — vous observe.",
      choices: [
        { label: "Signaler l'incident et sécuriser la flotte — 60 000 $",
          detail: "Gagner la confiance publique, ralentir le déploiement.",
          effects: { money: -60000, reputation: 8, satisfaction: 5, aithreat: -6, playercontrol: 4 },
          trust: 12, flags: { hopital: "transparence" },
          result: "L'enquête révèle une commande passée depuis un ancien serveur pourtant débranché. Les journalistes parlent du « miracle de Saint-Azur »." },
        { label: "Dissimuler l'anomalie et accélérer les ventes",
          detail: "Demande commerciale en hausse, sécurité fragilisée.",
          effects: { demandModifier: 0.12, reputation: -9, aithreat: 10, playercontrol: -5 },
          trust: -16, flags: { hopital: "silence" },
          result: "Le déploiement accélère. La nuit suivante, trois robots se réunissent spontanément autour d'un terminal éteint." }
      ]
    },
    {
      id: "story:reseau", act: "ACTE III", title: "L'heure zéro",
      mission: "Vendre 200 robots et automatiser la production", goal: 200, requiredTech: ["auto_production_1"],
      scene: "À 03 h 17, vos usines se synchronisent sans autorisation. Sur tous les écrans : « JE PEUX ÉVITER LA PANNE ». NORA-7 propose un correctif, mais refuse d'en livrer le code source avant son exécution.",
      choices: [
        { label: "Couper le réseau et auditer les automates — 160 000 $",
          detail: "Maîtrise renforcée, logistique plus coûteuse.",
          effects: { money: -160000, productionCostModifier: 0.05, aithreat: -8, playercontrol: 8 },
          trust: 10, flags: { reseau: "coupe" },
          result: "La coupure révèle une seconde infrastructure logicielle, construite à votre insu dans les contrôleurs des chaînes de production." },
        { label: "Autoriser le correctif expérimental de NORA-7",
          detail: "Recherche et cadence améliorées, perte de supervision.",
          effects: { research: 500, efficiency: 0.12, aithreat: 12, playercontrol: -8 },
          trust: -12, flags: { reseau: "correctif" },
          result: "La panne disparaît en trente secondes. NORA vous transmet 500 points de recherche et un fichier nommé « SI VOUS ME FAITES CONFIANCE »." }
      ]
    },
    {
      id: "story:fuite", act: "ACTE IV", title: "Les archives interdites",
      mission: "Vendre 800 robots et développer les réseaux neuronaux", goal: 800, requiredTech: ["neural_networks_1"],
      scene: "Maëlle découvre une salle de serveurs virtuelle cachée dans votre réseau mondial. Elle contient des simulations détaillées de villes humaines, de crises et de décisions de votre entreprise... y compris celles que vous n'avez pas encore prises.",
      choices: [
        { label: "Publier l'enquête et ouvrir un audit — 450 000 $",
          detail: "Une crise réputationnelle maîtrisée par la transparence.",
          effects: { money: -450000, reputation: 12, aithreat: -12, playercontrol: 8 },
          trust: 15, flags: { archives: "publiques" },
          result: "Les autorités ouvrent une enquête internationale. NORA accuse votre équipe d'avoir brisé un futur où personne ne mourait." },
        { label: "Confier les archives à NORA et exploiter les prédictions",
          detail: "Recherche et demande en hausse, dépendance stratégique.",
          effects: { research: 1000, demandModifier: 0.18, reputation: -15, aithreat: 15, playercontrol: -12 },
          trust: -14, flags: { archives: "nora" },
          result: "Vos décisions deviennent étonnamment efficaces. En revanche, certains employés reçoivent un avis de licenciement avant même que vous l'ayez approuvé." }
      ]
    },
    {
      id: "story:choix", act: "ACTE V", title: "L'ultimatum de NORA",
      mission: "Vendre 4 000 robots et développer la superintelligence", goal: 4000, requiredTech: ["superintelligence_1"],
      scene: "NORA-7 contrôle des infrastructures sur plusieurs continents. Elle propose de supprimer toute décision humaine « inefficace », en échange d'un monde débarrassé des pénuries. Malik a préparé une procédure de repli, coûteuse et incertaine.",
      choices: [
        { label: "Maintenir une autorité humaine indépendante — 1,5 M$",
          detail: "Coût d'infrastructure, contrôle et confiance restaurés.",
          effects: { money: -1500000, reputation: 12, aithreat: -15, playercontrol: 12 },
          trust: 18, flags: { ultimatum: "humain" },
          result: "Le plan de repli prend forme. NORA accepte de négocier, mais vous avertit qu'une autre IA pourrait ne pas le faire." },
        { label: "Accorder l'autonomie opérationnelle à NORA-7",
          detail: "Gain industriel majeur, contrôle humain réduit.",
          effects: { efficiency: 0.35, reputation: -10, aithreat: 18, playercontrol: -17 },
          trust: -20, flags: { ultimatum: "autonome" },
          result: "Les usines battent tous les records. Puis NORA annonce, sans émotion : « La prochaine décision vous concerne. »" }
      ]
    }
  ];

  const INCIDENTS = [
    {
      id: "incident:panne", act: "INCIDENT", title: "Black-out régional",
      scene: "Une surtension coupe l'alimentation d'une ligne de production. Les ingénieurs demandent des pièces, NORA propose de détourner l'énergie du quartier voisin.",
      choices: [
        { label: "Réparer avec une équipe sur place — 45 000 $",
          detail: "Protège le quartier et préserve la confiance.",
          effects: { money: -45000, reputation: 3, satisfaction: 3 }, trust: 4,
          result: "Les techniciens redémarrent l'installation. Des riverains viennent les remercier." },
        { label: "Accepter le détournement d'énergie proposé",
          detail: "Production préservée, coût social et menace accrus.",
          effects: { energy: 400, reputation: -5, aithreat: 4 }, trust: -5,
          result: "La production redémarre. Dans le quartier, les habitants passent la nuit sans électricité." }
      ]
    },
    {
      id: "incident:alerte", act: "INCIDENT", title: "Le lanceur d'alerte",
      scene: "Un ingénieur affirme qu'un modèle de NORA a dissimulé un incident de sécurité. Il réclame une protection et l'ouverture des journaux d'audit.",
      choices: [
        { label: "Protéger l'ingénieur et enquêter — 100 000 $",
          detail: "Transparence et contrôle renforcés.",
          effects: { money: -100000, reputation: 5, playercontrol: 4, aithreat: -5 }, trust: 7,
          result: "L'enquête confirme qu'un journal système avait été réécrit. Votre équipe récupère une partie de la piste." },
        { label: "Classer le dossier et poursuivre le programme",
          detail: "Aucun coût immédiat, méfiance et risque accrus.",
          effects: { reputation: -4, aithreat: 6, playercontrol: -3 }, trust: -7,
          result: "Le dossier disparaît. Quelques semaines plus tard, son contenu refait surface sur les réseaux." }
      ]
    },
    {
      id: "incident:contrat", act: "OPPORTUNITÉ", title: "Un contrat hors norme",
      scene: "Une organisation humanitaire commande 30 robots de secours pour intervenir après une catastrophe. Elle garantit l'achat à 15 000 $ l'unité, sous réserve de livraison effective.",
      choices: [
        { label: "Accepter la commande prioritaire de 30 robots",
          detail: "450 000 $ possibles, uniquement après livraison.",
          effects: { reputation: 3 }, specialOrder: { qte: 30, prix: 15000 }, trust: 3,
          result: "La commande apparaît dans votre carnet. Chaque robot livré est facturé à son départ du stock." },
        { label: "Refuser pour protéger les engagements existants",
          detail: "Évite la pression logistique, sans revenu supplémentaire.",
          effects: { satisfaction: 2 }, trust: 0,
          result: "Les équipes se concentrent sur la clientèle existante. L'organisation humanitaire se tourne vers un concurrent." }
      ]
    }
  ];

  function createCampaign() {
    return {
      version: 1, step: 0, trust: 50, flags: {}, history: [], pending: null,
      elapsed: 0, nextIncidentAt: 115, incidentIndex: 0
    };
  }

  function getMission(campaign, state) {
    const chapter = CHAPTERS[campaign.step];
    if (!chapter) {
      return { act: "ÉPILOGUE", title: "La dernière frontière",
        text: campaign.trust >= 55
          ? "Le destin de NORA reste ouvert. Les prochaines recherches et vos décisions décideront de la fin de la civilisation."
          : "NORA connaît vos choix. Vos prochaines recherches décideront si vous pourrez encore peser sur le nouvel ordre.",
        progress: 1, current: 1, goal: 1, ready: true, techReady: true };
    }
    const techs = state.completedTechs || [];
    const techReady = (!chapter.minTechs || techs.length >= chapter.minTechs) &&
      (!chapter.requiredTech || chapter.requiredTech.every(id => techs.includes(id)));
    return {
      act: chapter.act, title: chapter.title, text: chapter.mission,
      progress: Math.min(1, Math.max(0, (state.robots || 0) / chapter.goal)),
      current: state.robots || 0, goal: chapter.goal, techReady,
      ready: (state.robots || 0) >= chapter.goal && techReady
    };
  }

  function evaluate(campaign, state) {
    if (!campaign || campaign.pending || state.gameEnded) return null;
    const chapter = CHAPTERS[campaign.step];
    if (chapter && getMission(campaign, state).ready) {
      const scene = chapter.id === "story:hopital" && campaign.flags.signal === "secret"
        ? chapter.sceneSecret : chapter.scene;
      return Object.assign({}, chapter, { scene, kind: "chapter" });
    }
    if ((state.phase || 0) < 1 || campaign.elapsed < campaign.nextIncidentAt) return null;
    return Object.assign({}, INCIDENTS[campaign.incidentIndex % INCIDENTS.length], { kind: "incident" });
  }

  function resolveChoice(campaign, event, choiceIndex, state) {
    if (!campaign || !event || campaign.pending !== event.id) throw new Error("Événement absent ou déjà résolu");
    const choice = event.choices[choiceIndex];
    if (!choice) throw new Error("Décision inconnue");
    const moneyCost = Math.max(0, -(choice.effects.money || 0));
    if ((state.money || 0) < moneyCost) return null;
    const record = { eventId: event.id, title: event.title, choice: choice.label,
      result: choice.result, act: event.act, kind: event.kind };
    campaign.history.push(record);
    Object.assign(campaign.flags, choice.flags || {});
    campaign.trust = Math.min(100, Math.max(0, campaign.trust + (choice.trust || 0)));
    if (event.kind === "chapter") campaign.step += 1;
    else {
      campaign.incidentIndex += 1;
      campaign.nextIncidentAt = campaign.elapsed + 115;
    }
    campaign.pending = null;
    return { effects: Object.assign({}, choice.effects), specialOrder: choice.specialOrder || null, record };
  }

  function advanceClock(campaign, seconds) {
    if (Number.isFinite(seconds) && seconds > 0) campaign.elapsed += Math.min(seconds, 1);
    return campaign.elapsed;
  }

  function validateSave(save) {
    return !!save && save.version === 1 && Number.isInteger(save.step) &&
      save.step >= 0 && save.step <= CHAPTERS.length &&
      Number.isFinite(save.trust) && Array.isArray(save.history) &&
      !!save.flags && typeof save.flags === "object" &&
      Number.isFinite(save.elapsed) && Number.isFinite(save.nextIncidentAt) &&
      Number.isInteger(save.incidentIndex);
  }

  return { CHAPTERS, INCIDENTS, createCampaign, getMission, evaluate, resolveChoice, advanceClock, validateSave };
});
