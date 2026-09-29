"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rules = require("../adventure-engine.js");

const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "index.html"), "utf8");
const core = page.match(/<script>([\s\S]*?)<\/script>/)[1];
const ui = fs.readFileSync(path.join(root, "adventure-ui.js"), "utf8");

function launch() {
  const elements = new Map();
  class Element {
    constructor(tag = "div") {
      this.tag = tag; this.children = []; this.style = {}; this.dataset = {};
      this.attributes = {}; this.listeners = {}; this.disabled = false; this.hidden = false;
      this.classList = { contains: () => false, toggle() {}, remove() {}, add() {} };
      this.offsetWidth = 50; this.parentElement = { setAttribute() {} };
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
    get textContent() { return this._text || ""; }
    set textContent(value) { this._text = String(value); }
    get innerHTML() { return this._html || ""; }
    set innerHTML(value) { this._html = value; }
  }
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement: tag => new Element(tag),
    addEventListener() {}, activeElement: null, hidden: false
  };
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
  const window = { RobotAdventureEngine: rules, setInterval, addEventListener() {} };
  const app = new Function("document", "window", "localStorage", "setInterval", "clearInterval", "confirm",
    core + "\n" + ui + "\nreturn {" +
    "getState: () => state, play: startGame, tick: gameLoop, reset: resetGame, " +
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
