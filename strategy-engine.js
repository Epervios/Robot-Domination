/* Robot Domination — stratégie industrielle et contrats, moteur indépendant testable. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RobotStrategy = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";
  const MODES = {
    balanced: { id:"balanced", label:"Équilibré", rate:1, cost:1, energy:1,
      description:"Cadence régulière. Aucun risque supplémentaire." },
    surge: { id:"surge", label:"Expansion", rate:1.45, cost:1.24, energy:1.4,
      description:"+45 % de cadence, +24 % de coût et +40 % d'énergie. Menace IA croissante." },
    precision: { id:"precision", label:"Qualité", rate:.72, cost:1.16, energy:.78,
      description:"-28 % de cadence, +16 % de coût, -22 % d'énergie. Satisfaction accrue." }
  };
  const MARKETS = {
    stable: {id:"stable",label:"Marché stable",demand:1,cost:1,energy:1,description:"Conditions habituelles."},
    rush: {id:"rush",label:"Demande exceptionnelle",demand:1.7,cost:1,energy:1,description:"Les commandes s'accélèrent pendant cette période."},
    shortage: {id:"shortage",label:"Pénurie de composants",demand:1,cost:1.3,energy:1.2,description:"Coût des robots +30 %, énergie +20 %."},
    competition: {id:"competition",label:"Offensive concurrente",demand:.55,cost:1,energy:1,description:"Demande divisée presque par deux : adaptez vos investissements."}
  };
  const OFFERS = [
    {id:"rescue",title:"Robots de secours",qte:15,prix:21000,deadline:110,minPhase:1,
      success:{reputation:7,satisfaction:5,research:180},failure:{reputation:-7,satisfaction:-4}},
    {id:"transport",title:"Flotte de transports",qte:70,prix:19000,deadline:130,minPhase:2,
      success:{reputation:9,satisfaction:5,research:450},failure:{reputation:-9,satisfaction:-5}},
    {id:"orbital",title:"Avant-poste orbital",qte:260,prix:26000,deadline:160,minPhase:4,
      success:{reputation:11,satisfaction:7,research:1300},failure:{reputation:-12,satisfaction:-7}}
  ];
  function initial() {
    return {version:1,mode:"balanced",elapsed:0,modeChangedAt:-30,market:"stable",
      marketIndex:0,nextMarketAt:75,activeContract:null,offerIndex:0,
      nextOfferAt:12,history:[],lastOutcome:null};
  }
  function ensure(state) {
    if (!state.strategy || state.strategy.version !== 1) state.strategy = initial();
    return state.strategy;
  }
  function policy(state) { const s=ensure(state); return MODES[s.mode] || MODES.balanced; }
  function market(state) { const s=ensure(state); return MARKETS[s.market] || MARKETS.stable; }
  function canChangeMode(state) { return ensure(state).elapsed - ensure(state).modeChangedAt >= 25; }
  function selectMode(state,mode) {
    if (!MODES[mode] || !canChangeMode(state) || ensure(state).mode === mode) return false;
    const s=ensure(state);s.mode=mode;s.modeChangedAt=s.elapsed;return true;
  }
  function offer(state) {
    const s=ensure(state);
    if (s.activeContract || (state.phase||0)<1 || s.elapsed<s.nextOfferAt) return null;
    const available=OFFERS.filter(c=>(state.phase||0)>=c.minPhase);
    return available[Math.min(s.offerIndex,available.length-1)]||null;
  }
  function sign(state) {
    const selected=offer(state);
    if (!selected) return false;
    const s=ensure(state);
    s.activeContract={id:selected.id,title:selected.title,qte:selected.qte,
      restant:selected.qte,prix:selected.prix,deadline:selected.deadline,
      completed:false};
    state.specialOrders.push({qte:selected.qte,restant:selected.qte,prix:selected.prix,contractId:selected.id});
    s.offerIndex+=1;
    return true;
  }
  function reject(state) {
    const s=ensure(state);if (!offer(state))return false;
    s.nextOfferAt=s.elapsed+40;s.offerIndex+=1;return true;
  }
  function effects(state,changes) {
    for (const [key,value] of Object.entries(changes)) {
      if (!Number.isFinite(state[key]))continue;
      const cap=(key==="reputation"?150:key==="satisfaction"?120:Infinity);
      state[key]=Math.max(0,Math.min(cap,state[key]+value));
    }
  }
  function finish(state,won) {
    const s=ensure(state),contract=s.activeContract;
    if (!contract)return null;
    const spec=OFFERS.find(c=>c.id===contract.id);
    effects(state,won?spec.success:spec.failure);
    if (!won) state.specialOrders=state.specialOrders.filter(o=>o.contractId!==contract.id);
    const message=won?("Contrat honoré : "+contract.title+". Prime de réputation et de recherche accordée.")
      :("Contrat expiré : "+contract.title+". Les robots déjà livrés restent facturés, réputation pénalisée.");
    s.history.unshift({id:contract.id,won,elapsed:s.elapsed});
    s.history=s.history.slice(0,10);s.lastOutcome=message;s.activeContract=null;
    s.nextOfferAt=s.elapsed+45;
    return message;
  }
  function tick(state,dt) {
    if (!Number.isFinite(dt)||dt<=0) return [];
    const s=ensure(state),news=[];
    dt=Math.min(dt,1);
    s.elapsed+=dt;
    const p=policy(state);
    // Les effets continus s'appliquent uniquement pendant la simulation (tick).
    if (p.id==="surge") {
      state.aithreat=Math.min(100,state.aithreat+.052*dt);
      state.satisfaction=Math.max(0,state.satisfaction-.08*dt);
    }
    if (p.id==="precision") {
      state.satisfaction=Math.min(120,state.satisfaction+.09*dt);
      state.reputation=Math.min(150,state.reputation+.018*dt);
    }
    if (s.elapsed>=s.nextMarketAt) {
      const rotation=["rush","shortage","competition","stable"];
      s.market=rotation[s.marketIndex%rotation.length];
      s.marketIndex++;
      s.nextMarketAt+=75;
      news.push("MARCHÉ : "+market(state).label+" — "+market(state).description);
    }
    const active=s.activeContract;
    if (active) {
      const order=state.specialOrders.find(o=>o.contractId===active.id);
      active.restant=order?Math.max(0,order.restant):0;
      // Le moteur de ventes peut avoir supprimé la commande lorsqu'elle est livrée.
      if (active.restant<=.01) {
        const message=finish(state,true);if(message) news.push(message);
      } else {
        active.deadline=Math.max(0,active.deadline-dt);
        if (active.deadline===0) {
          const message=finish(state,false);if(message) news.push(message);
        }
      }
    }
    return news;
  }
  return {MODES,MARKETS,OFFERS,initial,ensure,policy,market,canChangeMode,selectMode,
    offer,sign,reject,tick};
});
