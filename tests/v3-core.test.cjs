"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../v3/core.js");
const advance=(s,seconds,dt=.25)=>{
 const events=[];
 for(let i=0;i<Math.ceil(seconds/dt);i++)events.push(...E.tick(s,dt));
 return events;
};
test("démarrage : usine préfinancée, stock physique et chaîne finie",()=>{
 const s=E.create();
 assert.equal(s.credits,220000);assert.equal(s.stock,2);assert.equal(s.queued,0);
 const built=E.orderBuild(s,3);
 assert.deepEqual(built,{ok:true,count:3});
 assert.equal(s.credits,220000-3*9600);
 assert.equal(s.energy,100-3*12);
 assert.equal(s.queued,3);
 s.running=true;
 const events=advance(s,16);
 assert.equal(s.queued,0);
 assert.equal(s.produced,5);
 assert.ok(events.some(event=>event.type==="built"));
 assert.ok(s.sold>=4,"quatre robots vendus avant le premier événement");
 assert.equal(s.scene,"signal");
 assert.equal(s.running,false,"la narration suspend les horloges");
});
test("les cartes R&D ont des effets économiques mesurables",()=>{
 const s=E.create(),original=E.buildCost(s);
 assert.equal(E.buyTech(s,"servos").ok,true);
 assert.equal(E.buyTech(s,"marketing").ok,false,"un laboratoire n'est pas parallélisable");
 s.running=true;advance(s,7.2);
 assert.equal(s.research,null);
 assert.ok(s.techs.includes("servos"));
 assert.ok(s.productionRate>1);
 assert.equal(E.buildCost(s),original);
 assert.equal(E.buyTech(s,"core").ok,false,"le noyau exige une chaîne autonome");
});
test("les ventes, les commandes et la marge correspondent à des robots entiers",()=>{
 const s=E.create();s.sold=8;s.storyIndex=1;s.stock=8;s.time=15;
 assert.equal(E.getOffer(s).id,"hospital");
 assert.equal(E.acceptContract(s),true);
 assert.equal(s.credits,220000,"aucun paiement à la signature");
 s.running=true;
 advance(s,27);
 assert.equal(s.contract,null,"la totalité du contrat a été livrée");
 assert.ok(s.stats.contracts===1);
 assert.ok(s.credits>=220000+8*22000,"le revenu contractuel est facturé à la livraison");
 assert.ok(Number.isInteger(s.sold));
});
test("l'ordre des relais est un vrai puzzle et chaque erreur coûte du temps",()=>{
 const s=E.create();s.storyIndex=1;s.sold=10;s.running=true;
 E.tick(s,.1);
 assert.equal(s.crisis.id,"sabotage");
 const seconds=s.crisis.remaining;
 assert.equal(E.repair(s,0).ok,false);
 assert.ok(s.crisis.remaining<seconds-2);
 assert.equal(s.threat,8);
 assert.deepEqual([1,0,2].map(i=>E.repair(s,i).ok),[true,true,true]);
 assert.equal(s.crisis,null);
 assert.ok(s.crisesDone.includes("sabotage"));
 assert.equal(s.stats.repairs,3);
});
test("une crise non traitée provoque une panne réelle",()=>{
 const s=E.create();s.storyIndex=1;s.sold=10;s.running=true;
 E.tick(s,.1);
 E.tick(s,30);
 // Le moteur plafonne volontairement la taille d'un tick : simuler 30 secondes.
 advance(s,30);
 assert.equal(s.crisis,null);
 assert.ok(s.outage>0);
 assert.equal(s.trust,56);
 assert.equal(s.threat,17);
});
test("les quatre actes ont des conséquences persistantes et plusieurs issues",()=>{
 const s=E.create();s.running=true;
 const expected=[4,18,38,65],decisions=["listen","rescue","keys","share"];
 for(let i=0;i<4;i++){
  s.sold=expected[i];E.tick(s,.1);
  assert.equal(s.scene,E.SCENES[i].id);
  assert.equal(s.running,false);
  if(i===1)assert.match(E.getScene(s).text,/coordonnées/);
  assert.equal(E.chooseScene(s,decisions[i]),true);
  assert.equal(s.storyIndex,i+1);
  s.crisesDone=E.CRISES.map(c=>c.id); // Ne pas interrompre ce test narratif avec les crises.
  s.running=true;
 }
 assert.equal(s.ended,true);
 assert.match(s.outcome,/COEXISTENCE/);
 assert.equal(s.flags.signal,"listen");
 assert.equal(s.flags.breach,"rescue");
 assert.equal(s.flags.autonomy,"keys");
});
test("énergie, surcadence et rivalité changent les vrais arbitrages",()=>{
 const s=E.create();
 assert.equal(E.buildCost(s),9600);
 assert.equal(E.buildEnergy(s),12);
 assert.ok(E.setMode(s,"rush"));
 assert.equal(E.buildCost(s),12480);
 assert.equal(E.buildEnergy(s),17);
 const d=E.demand(s);
 s.market="rival";assert.ok(E.demand(s)<d*.6);
 s.market="shortage";assert.equal(E.buildCost(s),16848);
 s.credits=68000;assert.equal(E.upgradeGrid(s),true);assert.equal(s.regen,13);
 assert.equal(s.credits,0);
 assert.equal(E.orderBuild(s,1).ok,false);
});
test("la sauvegarde conserve les décisions et rejette un état incohérent",()=>{
 const s=E.create();s.flags.signal="isolate";s.history.push({kind:"story",text:"Une voix",at:0});
 const loaded=JSON.parse(JSON.stringify(s));
 assert.equal(E.validate(loaded),true);
 assert.equal(loaded.flags.signal,"isolate");
 assert.equal(E.validate({...loaded,sold:-1}),false);
 assert.equal(E.validate({...loaded,credits:NaN}),false);
});
test("le financement d'urgence évite une impasse sans être reproductible",()=>{
 const s=E.create();s.credits=0;s.stock=0;
 assert.equal(E.bailout(s),true);assert.equal(s.credits,28000);
 assert.equal(s.trust,56);assert.equal(E.bailout(s),false);
});
