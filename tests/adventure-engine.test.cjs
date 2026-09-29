"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../adventure-engine.js");

test("une nouvelle campagne attend trois robots vendus", () => {
  const campaign = engine.createCampaign();
  const state = { robots: 0, money: 300000, phase: 0, completedTechs: [], gameEnded: false };
  assert.equal(engine.getMission(campaign, state).goal, 3);
  assert.equal(engine.evaluate(campaign, state), null);
  state.robots = 3;
  assert.equal(engine.evaluate(campaign, state).id, "story:signal");
});

test("un investissement impossible n'avance pas la campagne", () => {
  const campaign = engine.createCampaign();
  const state = { robots: 3, money: 5000, completedTechs: [], phase: 0 };
  const event = engine.evaluate(campaign, state);
  campaign.pending = event.id;
  assert.equal(engine.resolveChoice(campaign, event, 0, state), null);
  assert.equal(campaign.step, 0);
  assert.equal(campaign.pending, event.id);
});

test("les décisions modifient le récit sans verser d'argent fictif", () => {
  const campaign = engine.createCampaign();
  const state = { robots: 3, money: 300000, completedTechs: [], phase: 0 };
  const first = engine.evaluate(campaign, state);
  campaign.pending = first.id;
  const result = engine.resolveChoice(campaign, first, 1, state);
  assert.equal(result.effects.money, undefined);
  assert.equal(campaign.flags.signal, "secret");
  assert.equal(campaign.step, 1);
  state.robots = 50;
  state.completedTechs.push("efficiency_increase_1");
  assert.match(engine.evaluate(campaign, state).scene, /signature du signal/);
});

test("les cinq actes respectent les jalons techniques", () => {
  const campaign = engine.createCampaign();
  const state = { robots: 3, money: 1e8, completedTechs: [], phase: 0 };
  const path = [
    { robots: 50, tech: "efficiency_increase_1", expected: "story:hopital" },
    { robots: 200, tech: "auto_production_1", expected: "story:reseau" },
    { robots: 800, tech: "neural_networks_1", expected: "story:fuite" },
    { robots: 4000, tech: "superintelligence_1", expected: "story:choix" }
  ];
  for (const node of path) {
    const event = engine.evaluate(campaign, state);
    assert.ok(event);
    campaign.pending = event.id;
    engine.resolveChoice(campaign, event, 1, state);
    state.robots = node.robots;
    state.completedTechs.push(node.tech);
    assert.equal(engine.evaluate(campaign, state).id, node.expected);
  }
  const final = engine.evaluate(campaign, state);
  campaign.pending = final.id;
  engine.resolveChoice(campaign, final, 1, state);
  assert.equal(engine.getMission(campaign, state).act, "ÉPILOGUE");
});

test("les incidents sont espacés dans le temps de jeu", () => {
  const campaign = engine.createCampaign();
  campaign.step = 1;
  campaign.elapsed = 120;
  const state = { phase: 1, robots: 10, money: 300000, completedTechs: [] };
  const incident = engine.evaluate(campaign, state);
  assert.equal(incident.kind, "incident");
  campaign.pending = incident.id;
  engine.resolveChoice(campaign, incident, 1, state);
  assert.equal(campaign.incidentIndex, 1);
  assert.equal(campaign.nextIncidentAt, 235);
  assert.equal(engine.evaluate(campaign, state), null);
  engine.advanceClock(campaign, 120);
  assert.equal(engine.evaluate(campaign, state), null);
  campaign.elapsed = 236;
  assert.equal(engine.evaluate(campaign, state).kind, "incident");
});

test("les contrats génèrent une commande, pas une rentrée d'argent immédiate", () => {
  const contract = engine.INCIDENTS.find(event => event.id === "incident:contrat");
  const campaign = engine.createCampaign();
  campaign.pending = contract.id;
  const result = engine.resolveChoice(campaign, { ...contract, kind: "incident" }, 0, { money: 300000 });
  assert.equal(result.effects.money, undefined);
  assert.deepEqual(result.specialOrder, { qte: 30, prix: 15000 });
});

test("une sauvegarde valide est sérialisable", () => {
  const campaign = engine.createCampaign();
  campaign.flags.signal = "audit";
  assert.equal(engine.validateSave(JSON.parse(JSON.stringify(campaign))), true);
  assert.equal(engine.validateSave({ ...campaign, step: -1 }), false);
  assert.equal(engine.validateSave({ ...campaign, history: null }), false);
});

test("aucun événement narratif n'attribue d'argent sans vente", () => {
  const choices = [...engine.CHAPTERS, ...engine.INCIDENTS].flatMap(event => event.choices);
  assert.ok(choices.every(choice => (choice.effects.money || 0) <= 0));
  assert.ok(choices.filter(choice => (choice.effects.money || 0) === 0).length >= 3);
});
