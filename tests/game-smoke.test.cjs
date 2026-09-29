"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rules = require("../adventure-engine.js");
const strategy = require("../strategy-engine.js");

const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
const core = page.match(/<script>([\s\S]*?)<\/script>/)[1];
const ui = fs.readFileSync(path.join(root, "adventure-ui.js"), "utf8");
const strategyUI = fs.readFileSync(path.join(root, "strategy-ui.js"), "utf8");
const cockpit = fs.readFileSync(path.join(root, "cockpit.js"), "utf8");

function launch() {
  const elements = new Map();
  class Element {
    constructor(tag = "div") {
      this.tag = tag; this.children = []; this.style = {}; this.dataset = {};
      this.attributes = {}; this.listeners = {}; this.disabled = false; this.hidden = false;
      this.classList = { contains: () => false, toggle() {}, remove() {}, add() {} };
      this.offsetWidth = 50; this.parentElement = { setAttribute() {} }; this.htmlWrites = 0;
    }
    setAttribute(k, v) { this.attributes[k] = v; }
    append(...items) { this.children.push(...items); }
    appendChild(item) { this.children.push(item); return item; }
    replaceChildren(...items) { this.children = items; }
    addEventListener(k, fn) { this.listeners[k] = fn; }
    focus() {}
    querySelector(selector) {
      return this.children.flatMap(child => child.tag === "button" ? [child] :
        child.querySelector ? [child.querySelector(selector)] : [])
        .find(child => child && !child.disabled) || null;
    }
    querySelectorAll(selector) {
      if(selector==="[data-operation-mode]")return this.children.filter(child=>child.dataset.operationMode);
      if(selector===".techbtn")return [];
      return [];
    }
    get textContent() { return this._text || ""; }
    set textContent(value) { this._text = String(value); }
    get innerHTML() { return this._html || ""; }
    set innerHTML(value) { this._html = value; this.htmlWrites++; }
  }
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement: tag => new Element(tag),
    querySelectorAll(selector) {
      if(selector==="[data-panel-tab]")return ["production","research","journal"].map(x=>this.getElementById("tab-"+x));
      if(selector==="[data-view-panel]")return ["production","research","journal"].map(x=>this.getElementById("panel-"+x));
      return [];
    },
    addEventListener() {}, activeElement: null, hidden: false
  };
  const modeContainer=document.getElementById("strategyConsole");
  for(const id of ["balanced","surge","precision"]){
    const button=new Element("button");
    button.dataset.operationMode=id;
    modeContainer.appendChild(button);
  }
  for(const id of ["production","research","journal"]){
    document.getElementById("tab-"+id).dataset.panelTab=id;
    document.getElementById("panel-"+id).dataset.viewPanel=id;
  }
  const saves = new Map();
  const storage = {
    getItem: key => saves.get(key) || null,
    setItem: (key, value) => saves.set(key, value),
    removeItem: key => saves.delete(key)
  };
  const timers = new Map();
  let next = 0;
  const setInterval = fn => { timers.set(++next, fn); return next; };
  const clearInterval = id => timers.delete(id);
  const window = { RobotAdventureEngine: rules, RobotStrategy: strategy, setInterval, addEventListener() {} };
  const app = new Function("document", "window", "localStorage", "setInterval", "clearInterval", "confirm",
    core + "\n" + ui + "\n" + strategyUI + "\n" + cockpit + "\nreturn {" +
    "getState: () => state, play: startGame, tick: gameLoop, reset: resetGame, " +
    "rate: () => getCurrentProductionRate(), cost: () => getCurrentProductionCost(), demand: () => getDemandPerSecond(), " +
    "seen: ids => { seenChoices = ids; }, " +
    "queue: item => researchQueue.push(item), " +
    "choices: () => businessChoices, " +
    "pendingLegacy: () => currentChoice, " +
    "};")(document, window, storage, setInterval, clearInterval, () => true);
  return { app, get: id => document.getElementById(id), saves };
}

test("production et ventes : pas de revenu sans robot livré", () => {
  const { app, get } = launch();
  assert.equal(app.getState().money, 300000);
  for (let i = 0; i < 7; i++) get("btnCreate").onclick();
  assert.equal(app.getState().stock, 1);
  assert.equal(app.getState().money, 295200);
  app.play();
  app.getState().lastUpdate = Date.now() - 600;
  app.tick();
  assert.equal(app.getState().money, 310200);
  app.getState().stock = 0;
  app.getState().lastUpdate = Date.now() - 600;
  app.tick();
  assert.equal(app.getState().money, 310200);
});

test("premier événement interactif, conséquence et sauvegarde restaurable", () => {
  const { app, get, saves } = launch();
  assert.equal(get("adventureAct").textContent, "ACTE I");
  app.getState().robots = 3;
  app.play();
  app.getState().lastUpdate = Date.now() - 600;
  app.tick();
  const overlay = get("adventureOverlay");
  assert.equal(overlay.hidden, false);
  const frame = overlay.children[0];
  const buttons = frame.children.find(child => child.children.some(item => item.tag === "button"));
  assert.equal(buttons.children.length, 2);
  const moneyBefore = app.getState().money;
  buttons.children[0].listeners.click();
  assert.equal(app.getState().money, moneyBefore - 30000);
  assert.equal(overlay.hidden, true);
  assert.equal(get("adventureAct").textContent, "ACTE II");
  get("btnSave").listeners.click();
  assert.equal(saves.size, 1);
  app.getState().money = 987;
  get("btnLoad").listeners.click();
  assert.equal(app.getState().money, moneyBefore - 30000);
  assert.equal(get("adventureAct").textContent, "ACTE II");
});

test("la décision de singularité est présentée avant la fin de partie", () => {
  const { app } = launch();
  const final = app.choices().find(choice => choice.id === "final_choice_singularity");
  app.seen(app.choices().filter(choice => choice.id !== final.id).map(choice => choice.id));
  Object.assign(app.getState(), { robots: 15000, phase: 5, money: 1e8, aithreat: 0,
    playercontrol: 100, humans: 7800000000 });
  app.queue({ id: "singularity_event", name: "Singularité imminente",
    threat: 20, effect: "Prépare la fin", duration: 1000, timeElapsed: 999 });
  app.play();
  app.getState().lastUpdate = Date.now() - 600;
  app.tick();
  assert.equal(app.pendingLegacy().id, "final_choice_singularity");
  assert.equal(app.getState().gameEnded, false);
});


test("la recherche garde les mêmes boutons pendant la progression et les variations de trésorerie",()=>{
  const {app,get}=launch();
  const tree=get("techtree");
  app.queue({id:"queued-test",name:"Recherche de test",duration:60000,timeElapsed:0,threat:0,effect:""});
  app.play();
  app.getState().lastUpdate=Date.now()-100;
  app.tick(); // Une unique reconstruction pour la file de recherche.
  const writes=tree.htmlWrites;
  for(let i=0;i<20;i++){
    app.getState().money+=7000;
    app.getState().research+=300;
    app.getState().lastUpdate=Date.now()-400;
    app.tick();
  }
  assert.equal(tree.htmlWrites,writes,"les boutons ne sont pas remontés à chaque tick");
});

test("les modes et le marché agissent réellement sur les coûts, la cadence et la demande",()=>{
  const {app,get}=launch();
  assert.equal(app.rate(),.15);
  assert.equal(app.cost(),4800);
  const modes=get("strategyConsole").children;
  modes.find(x=>x.dataset.operationMode==="surge").listeners.click();
  assert.equal(app.getState().strategy.mode,"surge");
  assert.ok(Math.abs(app.rate()-.2175)<1e-9);
  assert.ok(Math.abs(app.cost()-5952)<1e-9);
  // Le marché évolue : la formule des ventes et la valeur affichée partagent le même facteur.
  const initialDemand=app.demand();
  app.getState().strategy.market="competition";
  assert.ok(app.demand()<initialDemand);
  app.getState().strategy.market="shortage";
  assert.ok(app.cost()>5952);
});

test("les onglets permettent de choisir la recherche sans revenir à la production",()=>{
  const {get}=launch();
  const researchTab=get("tab-research");
  researchTab.listeners.click();
  assert.equal(researchTab.attributes["aria-selected"],"true");
  assert.equal(get("tab-production").attributes["aria-selected"],"false");
});
