"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../v4/core.js");
function advance(s,seconds,dt=.25){
 const events=[];
 for(let i=0;i<Math.ceil(seconds/dt);i++)events.push(...E.tick(s,dt));
 return events;
}
test("L'Odyssée contient trois saisons, douze actes, 36 décisions, huit crises et une R&D étendue",()=>{
 assert.equal(E.SCENES.length,12);
 assert.equal(E.SCENES.reduce((n,c)=>n+c.choices.length,0),36);
 assert.deepEqual(E.SCENES.map(s=>s.at),[4,16,34,54,82,116,150,195,246,304,370,450]);
 assert.equal(new Set(E.SCENES.map(x=>x.season)).size,3);
 assert.equal(E.CRISES.length,8);
 assert.equal(E.CONTRACTS.length,8);
 assert.equal(E.TECHS.length,17);
});
test("production physique : achat ferme de composants, débit réel, file limitée et revenus à la livraison",()=>{
 const s=E.create(),price=E.buildCost(s);
 assert.equal(price,6800);
 assert.equal(s.materials,24);
 assert.deepEqual(E.orderBuild(s,3),{ok:true,count:3});
 assert.equal(s.materials,21);
 assert.equal(s.credits,220000-3*price);
 assert.equal(s.queued,3);
 s.running=true;
 const events=advance(s,4);
 assert.ok(events.some(x=>x.type==="sold"));
 assert.ok(events.some(x=>x.type==="built"));
 assert.ok(Number.isInteger(s.sold));
 assert.equal(s.credits,220000-3*price+s.sold*16800);
});
test("approvisionnement : coût, délai promis, pénurie et livraison sans argent fictif",()=>{
 const s=E.create();s.materials=0;s.stock=0;
 const q=E.materialQuote(s);
 assert.equal(q.count,20);assert.equal(q.cost,65500);assert.equal(q.duration,16);
 assert.equal(E.orderBuild(s,1).ok,false);
 assert.equal(E.orderMaterials(s,"standard"),true);
 assert.equal(s.credits,154500);
 assert.equal(s.materials,0);
 s.market="shortage"; // Le prix monte, mais la commande signée reste inchangée.
 assert.equal(E.materialQuote(s).cost>q.cost,true);
 s.running=true;
 advance(s,15.5);
 assert.equal(s.materials,0);
 const notices=advance(s,1);
 assert.equal(s.materials,20);
 assert.ok(notices.some(e=>e.type==="supply"));
 assert.equal(s.ops.batches,1);
 assert.equal(s.credits,154500);
});
test("les trois marchés modifient réellement les prix, les risques et la demande",()=>{
 const s=E.create();
 assert.equal(E.currentRegion(s).id,"metro");
 assert.equal(E.selectRegion(s,"medical"),false);
 s.storyIndex=2;s.sold=22;s.regionSales.metro=22;
 assert.equal(E.selectRegion(s,"medical"),true);
 assert.equal(E.currentRegion(s).price,1.3);
 assert.equal(E.regionAvailable(s,"frontier"),false);
 const cash=s.credits,publicBefore=s.factions.public;
 s.stock=1;s.saleBuffer=.95;s.running=true;
 E.tick(s,.25);
 assert.equal(s.credits,cash+Math.round(s.price*1.3));
 assert.equal(s.regionSales.medical,1);
 assert.ok(s.factions.public>publicBefore);
 s.storyIndex=5;s.sold=116;
 assert.equal(E.selectRegion(s,"frontier"),true);
 assert.equal(E.currentRegion(s).price,1.75);
 assert.ok(E.currentRegion(s).threat>0);
});
test("salaires, entretien et recrutement créent un vrai coût d'exploitation",()=>{
 const s=E.create();s.credits=0;s.stock=0;s.running=true;s.time=41.9;
 const events=E.tick(s,.25);
 assert.ok(events.some(e=>e.type==="payrollFailed"));
 assert.equal(s.ops.payrolls,1);
 assert.equal(s.trust,60);
 assert.equal(s.morale,62);
 s.credits=100000;s.wear=73;
 assert.equal(E.maintain(s),true);
 assert.equal(s.wear,6);
 assert.equal(s.outage,8);
 assert.equal(s.ops.inspections,1);
 assert.equal(E.hire(s),true);
 assert.equal(s.staff,10);
 assert.ok(s.productionRate>1);
 assert.equal(s.credits,0);
});
test("usure excessive : ralentissement, panne physique et conséquences de la surcadence",()=>{
 const s=E.create();s.stock=0;s.queued=1;s.materials=20;s.assembly=.99;s.wear=96.5;s.running=true;
 const events=E.tick(s,.25);
 assert.ok(events.some(e=>e.type==="breakdown"));
 assert.equal(s.outage,15);
 assert.equal(s.wear,63);
 assert.equal(s.morale,70);
 assert.ok(E.validate(s));
});
test("missions alternatives : deux indices ou audit, pare-feu ou noyau ou trois indices",()=>{
 const s=E.create();s.storyIndex=4;s.sold=82;s.running=true;
 s.crisesDone=E.CRISES.map(c=>c.id); // Isoler les conditions de mission des incidents tactiques.
 assert.equal(E.mission(s).ready,false);
 E.tick(s,.1);
 assert.equal(s.scene,null);
 s.signals=2;
 assert.equal(E.mission(s).ready,true);
 E.tick(s,.1);
 assert.equal(s.scene,"echo");
 assert.equal(E.chooseScene(s,"open"),true);
 s.storyIndex=7;s.sold=195;s.signals=0;s.running=true;
 assert.equal(E.mission(s).ready,false);
 s.techs.push("shield");
 assert.equal(E.mission(s).ready,true);
 E.tick(s,.1);
 assert.equal(s.scene,"mirror");
});
test("une crise avancée utilise cinq étapes et sanctionne une fausse manœuvre",()=>{
 const s=E.create();s.storyIndex=8;s.sold=213;s.crisesDone=E.CRISES.slice(0,5).map(x=>x.id);s.running=true;
 E.tick(s,.1);
 assert.equal(s.crisis.id,"mirror");
 assert.equal(s.crisis.order.length,5);
 const t=s.crisis.remaining;
 assert.equal(E.repair(s,2).ok,false);
 assert.ok(s.crisis.remaining<=t-3);
 assert.equal(s.threat,8);
 for(const relay of [0,1,2,0,2])assert.equal(E.repair(s,relay).ok,true);
 assert.equal(s.crisis,null);
 assert.equal(s.stats.repairs,5);
});
test("un contrat est payé sur livraison, et le soutien public reflète son succès",()=>{
 const s=E.create();s.storyIndex=1;s.sold=8;s.stock=8;s.time=15;
 assert.equal(E.getOffer(s).id,"hospital");
 assert.equal(E.acceptContract(s),true);
 assert.equal(s.credits,220000);
 const publicBefore=s.factions.public;
 s.running=true;advance(s,45);
 assert.equal(s.contract,null);
 assert.equal(s.stats.contracts,1);
 assert.equal(s.credits,220000+8*22000-(9000+8*1200));
 assert.equal(s.factions.public,publicBefore+5);
});
test("les choix persistants et preuves ouvrent des fins réellement distinctes",()=>{
 const base=E.create();base.storyIndex=11;base.scene="final";base.sold=450;
 const pact=structuredClone(base);
 Object.assign(pact,{signals:3,trust:80,threat:20,factions:{crew:71,public:81,nora:35}});
 assert.equal(E.chooseScene(pact,"share"),true);
 assert.match(pact.outcome,/HORIZON COMMUN/);
 const grim=structuredClone(base);grim.threat=69;grim.factions.nora=41;
 assert.equal(E.chooseScene(grim,"crown"),true);
 assert.match(grim.outcome,/DOMINATION/);
 const rebuild=structuredClone(base);
 rebuild.factions.crew=90;rebuild.regionSales.medical=20;rebuild.materials=22;
 assert.equal(E.chooseScene(rebuild,"shutdown"),true);
 assert.match(rebuild.outcome,/RECONSTRUCTION/);
 assert.equal(E.validate(JSON.parse(JSON.stringify(rebuild))),true);
 assert.equal(E.validate({...rebuild,materials:-1}),false);
});
test("une partie complète jouable permet d'atteindre les 12 actes sans impasse économique",()=>{
 const s=E.create(),chapters=[],crises=[],research=[];
 const preference=["servos","marketing","audit","grid","battery","autonomy","logistics","shield",
  "ergonomics","quality","core","recycling","redundancy","quantum","fleet","encryption","orbital"];
 s.running=true;
 for(let i=0;i<30000&&!s.ended;i++){
  if(s.scene){
   const scene=E.getScene(s);
   const choice=scene.choices.find(x=>s.credits>=x.cost);
   assert.ok(choice,"Chaque scène doit conserver une option financièrement possible.");
   E.chooseScene(s,choice.id);chapters.push(scene.id);s.running=true;
  }
  if(s.crisis&&s.energy>=7)E.repair(s,s.crisis.order[s.crisis.step]);
  if(s.signals<3&&s.storyIndex>=1&&s.time>=s.scanReadyAt&&s.energy>=8&&E.signalAlignment(s)>=.89)
   E.captureSignal(s);
  if(s.materials<=6&&!s.supply&&s.credits>=E.materialQuote(s).cost)E.orderMaterials(s);
  if(s.queued<5&&s.materials>=3&&s.energy>=E.buildEnergy(s)*2&&s.credits>E.buildCost(s)*5)
   E.orderBuild(s,3);
  if(!s.research)for(const id of preference)if(E.buyTech(s,id).ok){research.push(id);break;}
  if(E.regionAvailable(s,"medical")&&s.region==="metro")E.selectRegion(s,"medical");
  if(E.regionAvailable(s,"frontier")&&s.regionSales.medical>=30&&s.region==="medical")
   E.selectRegion(s,"frontier");
  const events=E.tick(s,.25);
  for(const e of events)if(e.type==="crisis")crises.push(e.id);
 }
 assert.equal(s.ended,true);
 assert.equal(s.sold,450);
 assert.deepEqual(chapters,E.SCENES.map(x=>x.id));
 assert.equal(crises.length,8);
 assert.equal(research.length,17);
 assert.ok(s.credits>0);
 assert.ok(s.time>900);
 assert.ok(E.validate(s));
});
