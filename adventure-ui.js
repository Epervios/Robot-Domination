/* Robot Domination — surcouche d'aventure. Le moteur économique historique reste la source de vérité. */
(function () {
  "use strict";
  const story = window.RobotAdventureEngine;
  if (!story) return;

  const $ = id => document.getElementById(id);
  const el = {
    act: $("adventureAct"), title: $("adventureTitle"), mission: $("adventureMission"),
    progress: $("adventureProgress"), percent: $("adventurePercent"),
    status: $("adventureStatus"), trust: $("adventureTrust"),
    history: $("adventureHistory"), overlay: $("adventureOverlay"),
    save: $("btnSave"), load: $("btnLoad"), scene: $("adventureScene")
  };
  if (Object.values(el).some(node => !node)) return;

  const SAVE_KEY = "robot-domination-campaign-v2";
  let campaign = story.createCampaign();
  let pendingEvent = null;
  let resumeAfterEvent = false;
  let lastHistoryLength = -1;
  let lastMissionStep = -1;

  function safeStorage(action, value) {
    try {
      if (action === "get") return localStorage.getItem(SAVE_KEY);
      if (action === "set") { localStorage.setItem(SAVE_KEY, value); return true; }
      if (action === "remove") { localStorage.removeItem(SAVE_KEY); return true; }
    } catch (_) { /* Certains navigateurs bloquent le stockage en mode fichier. */ }
    return null;
  }

  function renderHistory() {
    if (lastHistoryLength === campaign.history.length) return;
    lastHistoryLength = campaign.history.length;
    el.history.replaceChildren();
    const records = campaign.history.slice(-3).reverse();
    if (!records.length) {
      const first = document.createElement("p");
      first.className = "adventure-history-empty";
      first.textContent = "Journal de mission : première transmission en attente.";
      el.history.appendChild(first);
      return;
    }
    for (const record of records) {
      const item = document.createElement("div");
      item.className = "adventure-history-item";
      const heading = document.createElement("strong");
      heading.textContent = record.title;
      const body = document.createElement("span");
      body.textContent = record.result;
      item.append(heading, body);
      el.history.appendChild(item);
    }
  }

  function renderMission() {
    const mission = story.getMission(campaign, state);
    el.act.textContent = mission.act;
    el.title.textContent = mission.title;
    el.mission.textContent = mission.text;
    el.progress.style.width = (mission.progress * 100).toFixed(1) + "%";
    el.progress.parentElement.setAttribute("aria-valuenow", String(Math.round(mission.progress * 100)));
    el.percent.textContent = mission.goal === 1 && campaign.step >= story.CHAPTERS.length
      ? "Campagne achevée"
      : Math.floor(Math.min(mission.current, mission.goal)).toLocaleString("fr-CH") + " / " +
        mission.goal.toLocaleString("fr-CH") + " robots";
    el.status.textContent = mission.ready ? "Transmission disponible" :
      !mission.techReady && mission.progress >= 1 ? "Technologie requise" : "Mission en cours";
    el.status.classList.toggle("is-ready", mission.ready);
    el.trust.textContent = campaign.trust + " / 100";
    el.scene.dataset.threat = state.aithreat >= 70 ? "high" : state.aithreat >= 35 ? "medium" : "low";
    if (lastMissionStep !== campaign.step) {
      lastMissionStep = campaign.step;
      el.scene.classList.remove("adventure-scene-enter");
      void el.scene.offsetWidth;
      el.scene.classList.add("adventure-scene-enter");
    }
    renderHistory();
  }

  function line(parent, className, content) {
    const node = document.createElement("div");
    node.className = className;
    node.textContent = content;
    parent.appendChild(node);
    return node;
  }

  function openEvent(event) {
    if (!event || pendingEvent || state.gameEnded) return;
    resumeAfterEvent = running;
    pendingEvent = event;
    campaign.pending = event.id;
    if (running) stopGame();
    el.overlay.replaceChildren();
    const frame = document.createElement("section");
    frame.className = "adventure-dialog";
    frame.setAttribute("role", "dialog");
    frame.setAttribute("aria-modal", "true");
    frame.setAttribute("aria-labelledby", "storyDialogTitle");
    line(frame, "adventure-dialog-kicker", event.act + " • TRANSMISSION PRIORITAIRE");
    const heading = line(frame, "adventure-dialog-title", event.title);
    heading.id = "storyDialogTitle";
    line(frame, "adventure-dialog-scene", event.scene);
    const list = document.createElement("div");
    list.className = "adventure-dialog-choices";
    for (let index = 0; index < event.choices.length; index++) {
      const choice = event.choices[index];
      const price = Math.max(0, -(choice.effects.money || 0));
      const btn = document.createElement("button");
      btn.className = "adventure-dialog-choice";
      btn.type = "button";
      btn.disabled = price > state.money;
      const title = document.createElement("strong");
      title.textContent = choice.label;
      const detail = document.createElement("span");
      detail.textContent = btn.disabled ? "Fonds insuffisants — " + choice.detail : choice.detail;
      btn.append(title, detail);
      btn.addEventListener("click", () => chooseEvent(event, index));
      list.append(btn);
    }
    frame.append(list);
    line(frame, "adventure-dialog-hint", "Le temps de jeu est suspendu. Ce choix influence la suite de la campagne.");
    el.overlay.append(frame);
    el.overlay.hidden = false;
    const firstAllowed = list.querySelector("button:not(:disabled)");
    if (firstAllowed) firstAllowed.focus();
    // Une option gratuite figure dans chaque événement : pas d'impasse économique.
  }

  function applyEffects(effects) {
    for (const [key, delta] of Object.entries(effects)) {
      if (!Number.isFinite(delta) || !Number.isFinite(state[key])) continue;
      const cap = key === "aithreat" || key === "playercontrol" ? 100 :
        key === "satisfaction" ? 120 : key === "reputation" ? 150 : Infinity;
      state[key] = Math.max(0, Math.min(cap, state[key] + delta));
    }
  }

  function chooseEvent(event, index) {
    if (!pendingEvent || pendingEvent.id !== event.id) return;
    const decision = story.resolveChoice(campaign, event, index, state);
    if (!decision) return;
    applyEffects(decision.effects);
    if (decision.specialOrder) {
      const order = decision.specialOrder;
      state.specialOrders.push({ qte: order.qte, restant: order.qte, prix: order.prix });
      addMessage("Contrat accepté : " + order.qte + " robots à livrer et à facturer.");
    }
    addMessage("MISSION : " + decision.record.title + " — " + decision.record.result);
    pendingEvent = null;
    el.overlay.hidden = true;
    el.overlay.replaceChildren();
    lastHistoryLength = -1;
    renderMission();
    updateUI();
    if (resumeAfterEvent && !state.gameEnded) startGame();
    resumeAfterEvent = false;
  }

  function checkCampaign() {
    if (!running || currentChoice || pendingEvent || state.gameEnded) return;
    const next = story.evaluate(campaign, state);
    if (next) openEvent(next);
  }

  const originalLoop = gameLoop;
  gameLoop = function () {
    const wasRunning = running;
    const previousUpdate = state.lastUpdate;
    originalLoop();
    if (wasRunning && Number.isFinite(previousUpdate) && Number.isFinite(state.lastUpdate)) {
      story.advanceClock(campaign, (state.lastUpdate - previousUpdate) / 1000);
    }
    renderMission();
    checkCampaign();
  };

  const originalReset = resetGame;
  resetGame = function () {
    originalReset();
    campaign = story.createCampaign();
    pendingEvent = null;
    resumeAfterEvent = false;
    lastHistoryLength = -1;
    lastMissionStep = -1;
    el.overlay.hidden = true;
    el.overlay.replaceChildren();
    safeStorage("remove");
    refreshLoadButton();
    renderMission();
  };

  function saveGame(silent) {
    if (state.gameEnded) {
      if (!silent) addMessage("Partie terminée : recommencez une nouvelle ère pour sauvegarder.");
      return;
    }
    const save = {
      schema: 2, campaign, core: state, seenChoices, researchQueue,
      savedAt: new Date().toISOString()
    };
    const ok = safeStorage("set", JSON.stringify(save));
    refreshLoadButton();
    if (!silent) addMessage(ok
      ? "Partie sauvegardée sur cet appareil."
      : "Sauvegarde indisponible dans ce navigateur. Essayez un serveur local.");
  }

  function refreshLoadButton() {
    el.load.disabled = !safeStorage("get");
  }

  function restorePendingEvent() {
    const pending = campaign.pending;
    if (!pending) return;
    const isChapter = pending.startsWith("story:");
    const raw = (isChapter ? story.CHAPTERS : story.INCIDENTS).find(item => item.id === pending);
    campaign.pending = null;
    if (raw) openEvent(Object.assign({}, raw, {
      kind: isChapter ? "chapter" : "incident",
      scene: raw.id === "story:hopital" && campaign.flags.signal === "secret"
        ? raw.sceneSecret : raw.scene
    }));
  }

  function loadGame() {
    let payload;
    try { payload = JSON.parse(safeStorage("get") || "null"); } catch (_) { payload = null; }
    if (!payload || payload.schema !== 2 || !story.validateSave(payload.campaign) ||
        !payload.core || !Number.isFinite(payload.core.money) ||
        !Number.isFinite(payload.core.robots) || !Array.isArray(payload.core.completedTechs) ||
        !Array.isArray(payload.seenChoices) || !Array.isArray(payload.researchQueue)) {
      addMessage("Sauvegarde absente ou incompatible.");
      return;
    }
    stopGame();
    // Repartir d'un état neutre et injecter uniquement les données sauvegardées.
    originalReset();
    state = Object.assign({}, state, payload.core, { lastUpdate: Date.now() });
    seenChoices = payload.seenChoices;
    researchQueue = payload.researchQueue;
    campaign = payload.campaign;
    pendingEvent = null;
    lastPhase = -1;
    lastHistoryLength = -1;
    lastMissionStep = -1;
    updateUI();
    renderMission();
    restorePendingEvent();
    addMessage("Sauvegarde restaurée. Reprenez la partie avec Démarrer.");
    refreshLoadButton();
  }

  el.save.addEventListener("click", () => saveGame(false));
  el.load.addEventListener("click", loadGame);
  window.setInterval(() => { if (running && !state.gameEnded) saveGame(true); }, 15000);
  window.addEventListener("pagehide", () => { if (!state.gameEnded) saveGame(true); });
  window.addEventListener("keydown", event => {
    if (el.overlay.hidden || event.key !== "Tab") return;
    const buttons = [...el.overlay.querySelectorAll("button:not(:disabled)")];
    if (!buttons.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
    else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
  });
  refreshLoadButton();
  renderMission();
})();
