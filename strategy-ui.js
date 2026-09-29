/* Robot Domination — commandes de stratégie reliées au moteur économique historique. */
(function () {
  "use strict";
  const api = window.RobotStrategy;
  const root = document.getElementById("strategyConsole");
  if (!api || !root) return;

  const buttons = [...root.querySelectorAll("[data-operation-mode]")];
  const offerTitle = document.getElementById("contractTitle");
  const offerBody = document.getElementById("contractBody");
  const contractAccept = document.getElementById("btnContractAccept");
  const contractDecline = document.getElementById("btnContractDecline");
  const marketLabel = document.getElementById("marketCondition");
  const modeHint = document.getElementById("modeCooldown");
  const contractProgress = document.getElementById("contractProgress");
  const contractBar = document.getElementById("contractBar");
  const marketTime = document.getElementById("marketCountdown");
  const gridButton = document.getElementById("btnGridUpgrade");
  const gridRate = document.getElementById("gridEnergyRate");

  function render() {
    const s = api.ensure(state),market = api.market(state);
    const remaining = Math.ceil(Math.max(0,25-(s.elapsed-s.modeChangedAt)));
    marketLabel.textContent = market.label;
    marketLabel.title = market.description;
    marketTime.textContent = "Changement dans ~" + Math.ceil(Math.max(0,s.nextMarketAt-s.elapsed)) + " s de jeu";
    modeHint.textContent = remaining > 0 ? "Réglage verrouillé : " + remaining + " s" : "Réglage disponible";
    const grid=api.nextGridUpgrade(state);
    gridRate.textContent="Production : "+api.energyRegen(state)+" énergie/s";
    gridButton.hidden=!grid;
    if(grid){
      gridButton.disabled=state.money<grid.cost || !!state.gameEnded;
      gridButton.textContent="Réseau : "+grid.title+" ("+grid.cost.toLocaleString("fr-CH")+" $)";
    }
    for (const btn of buttons) {
      const selected = btn.dataset.operationMode === s.mode;
      btn.classList.toggle("is-selected",selected);
      btn.setAttribute("aria-pressed",String(selected));
      btn.disabled = !selected && remaining > 0 || !!state.gameEnded;
    }
    const active=s.activeContract;
    if (active) {
      offerTitle.textContent = active.title+" — contrat actif";
      offerBody.textContent = "Livrés : "+Math.floor(active.qte-active.restant)+"/"+active.qte+
        " • "+Math.ceil(active.deadline)+" s restantes • "+active.prix.toLocaleString("fr-CH")+" $/robot";
      contractProgress.hidden = false;
      contractBar.style.width = ((1-active.restant/active.qte)*100).toFixed(1)+"%";
      contractAccept.hidden = true;
      contractDecline.hidden = true;
      return;
    }
    contractProgress.hidden = true;
    const offered = api.offer(state);
    if (offered) {
      offerTitle.textContent = offered.title+" — nouvel appel d'offres";
      offerBody.textContent = offered.qte+" robots • "+
        offered.prix.toLocaleString("fr-CH")+" $/robot • "+
        offered.deadline+" s pour livrer • bonus de recherche si honoré.";
      contractAccept.hidden = false;
      contractDecline.hidden = false;
      contractAccept.disabled = !!state.gameEnded;
      contractDecline.disabled = !!state.gameEnded;
      return;
    }
    offerTitle.textContent = state.phase<1 ? "Contrats verrouillés" : "Prochain appel d'offres";
    offerBody.textContent = state.phase<1 ? "Débloqués à 50 robots vendus." :
      "Nouvelle opportunité dans "+Math.ceil(Math.max(0,s.nextOfferAt-s.elapsed))+" s de jeu.";
    contractAccept.hidden = true;
    contractDecline.hidden = true;
  }

  for (const btn of buttons) {
    btn.addEventListener("click",() => {
      if (state.gameEnded) return;
      const mode = btn.dataset.operationMode;
      if (!api.selectMode(state,mode)) return;
      addMessage("STRATÉGIE : "+api.policy(state).label+". "+api.policy(state).description);
      updateUI();
    });
  }
  gridButton.addEventListener("click",()=>{
    if(state.gameEnded || !api.upgradeGrid(state))return;
    addMessage("ÉNERGIE : réseau renforcé, production portée à "+api.energyRegen(state)+" énergie/s.");
    updateUI();
  });
  contractAccept.addEventListener("click",() => {
    if (state.gameEnded || !api.sign(state)) return;
    addMessage("CONTRAT : mission acceptée. La facturation est effectuée à chaque livraison.");
    updateUI();
  });
  contractDecline.addEventListener("click",() => {
    if (state.gameEnded || !api.reject(state)) return;
    addMessage("CONTRAT : offre refusée. Nouvelle opportunité à venir.");
    updateUI();
  });

  const previousUpdate = updateUI;
  updateUI = function () {
    previousUpdate();
    render();
  };
  const previousLoop = gameLoop;
  gameLoop = function () {
    const previousTime=state.lastUpdate,wasRunning=running;
    previousLoop();
    if (wasRunning && running && !state.gameEnded && Number.isFinite(previousTime)) {
      const dt=Math.min(.5,Math.max(0,(state.lastUpdate-previousTime)/1000));
      for (const notice of api.tick(state,dt)) addMessage(notice);
    }
    render();
  };
  render();
})();
