"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const engine=require("../strategy-engine.js");
function game(phase=1) {
  return {phase,robots:50,money:300000,energy:5000,specialOrders:[],
    reputation:50,satisfaction:70,research:0,aithreat:0,playercontrol:100,autoProduction:true,ventes_par_seconde:1};
}
test("modes industriels : arbitrages vérifiables et verrouillage de 25 secondes de jeu",()=>{
  const state=game();
  assert.equal(engine.policy(state).rate,1);
  assert.equal(engine.selectMode(state,"surge"),true);
  assert.equal(engine.policy(state).rate,1.45);
  assert.equal(engine.policy(state).cost,1.24);
  assert.equal(engine.selectMode(state,"precision"),false);
  for(let i=0;i<25;i++)engine.tick(state,1);
  assert.ok(state.aithreat>1);
  assert.ok(state.satisfaction<70);
  assert.equal(engine.selectMode(state,"precision"),true);
  const rep=state.reputation,energy=engine.policy(state).energy;
  engine.tick(state,1);
  assert.equal(energy,.78);
  assert.ok(state.reputation>rep);
});
test("les quatre événements de marché tournent sans hasard",()=>{
  const state=game(),types=[];
  for(let i=0;i<301;i++){
    const news=engine.tick(state,1);
    if(news.length)types.push(engine.market(state).id);
  }
  assert.deepEqual(types,["rush","shortage","competition","stable"]);
  assert.equal(engine.market(state).demand,1);
});
test("les commandes sont payées sur livraison et récompensées après achèvement",()=>{
  const state=game();engine.ensure(state).elapsed=13;
  const offer=engine.offer(state);
  assert.equal(offer.id,"rescue");
  assert.equal(engine.sign(state),true);
  assert.equal(state.money,300000);
  assert.equal(state.specialOrders[0].prix,21000);
  const before=state.reputation;
  state.specialOrders[0].restant=0;
  const notice=engine.tick(state,.1);
  assert.match(notice[0],/honoré/);
  assert.equal(state.reputation,before+7);
  assert.equal(state.research,180);
  assert.equal(engine.ensure(state).activeContract,null);
  assert.equal(engine.offer(state),null);
});
test("contrat raté : pénalité unique et commandes futures annulées",()=>{
  const state=game();engine.ensure(state).elapsed=13;
  engine.sign(state);
  engine.ensure(state).activeContract.deadline=.5;
  const first=engine.tick(state,.6);
  assert.match(first[0],/expiré/);
  assert.equal(state.reputation,43);
  assert.equal(state.specialOrders.length,0);
  assert.equal(engine.tick(state,1).length,0);
  assert.equal(state.reputation,43);
});
test("l'offre indisponible avant le palier et refus non pénalisant",()=>{
  const state=game(0);
  engine.ensure(state).elapsed=20;
  assert.equal(engine.offer(state),null);
  assert.equal(engine.sign(state),false);
  state.phase=1;
  assert.equal(engine.offer(state).id,"rescue");
  assert.equal(engine.reject(state),true);
  assert.equal(engine.offer(state),null);
  assert.equal(state.reputation,50);
});
test("compatibilité des états existants et absence d'enrichissement artificiel",()=>{
  const state=game();
  assert.equal(state.strategy,undefined);
  const strat=engine.ensure(state);
  assert.equal(strat.mode,"balanced");
  const before=state.money;
  for(let i=0;i<12;i++)engine.tick(state,1);
  assert.equal(state.money,before);
  assert.equal(engine.offer(state).id,"rescue");
  const restored=JSON.parse(JSON.stringify(state));
  assert.equal(engine.policy(restored).id,"balanced");
});


test("le réseau électrique est un investissement progressif et plafonné",()=>{
  const state=game();
  assert.equal(engine.energyRegen(state),4);
  const price=engine.nextGridUpgrade(state).cost;
  assert.equal(price,150000);
  assert.equal(engine.upgradeGrid(state),true);
  assert.equal(state.money,150000);
  assert.equal(engine.energyRegen(state),19);
  assert.equal(engine.upgradeGrid(state),false);
  state.money=20000000;
  assert.equal(engine.upgradeGrid(state),true);
  assert.equal(engine.energyRegen(state),74);
  assert.equal(engine.upgradeGrid(state),true);
  assert.equal(engine.energyRegen(state),244);
  assert.equal(engine.upgradeGrid(state),true);
  assert.equal(engine.energyRegen(state),744);
  assert.equal(engine.upgradeGrid(state),false);
});

test("une usine inactive ne gonfle pas gratuitement satisfaction et risque",()=>{
  const state=game();state.autoProduction=false;state.ventes_par_seconde=0;
  assert.equal(engine.selectMode(state,"surge"),true);
  engine.tick(state,10);
  assert.equal(state.aithreat,0);
  engine.ensure(state).elapsed=30;
  assert.equal(engine.selectMode(state,"precision"),true);
  engine.tick(state,1);
  assert.equal(state.reputation,50);
});
