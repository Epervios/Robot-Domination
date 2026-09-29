/* Robot Domination V3 — moteur déterministe, sans dépendances ni DOM. */
(function(root,factory) {
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.RobotV3=api;
})(typeof globalThis==="object"?globalThis:this,function(){
"use strict";
const CAMPAIGN=typeof module==="object"&&module.exports?require("./campaign.js"):globalThis.RobotCampaignV4;
if(!CAMPAIGN)throw new Error("v4/campaign.js manquant");
const REGIONS={
 metro:{id:"metro",title:"MÉTROPOLES",unlock:0,at:0,rate:1,price:1,public:0,threat:0,description:"Commandes régulières et recettes fiables."},
 medical:{id:"medical",title:"RÉSEAU MÉDICAL",unlock:2,at:22,rate:.83,price:1.3,public:.18,threat:-.012,description:"Marge renforcée, soutien public à chaque livraison."},
 frontier:{id:"frontier",title:"ZONES FRONTIÈRES",unlock:5,at:116,rate:.66,price:1.75,public:-.065,threat:.085,description:"Marge élevée, menace IA et réticences du public."}
};
const TECHS=[
 {id:"servos",name:"Servo-moteurs",track:"INDUSTRIE",cost:38000,data:0,duration:7,desc:"+25 % de vitesse d'assemblage."},
 {id:"battery",name:"Batteries solides",track:"INDUSTRIE",cost:42000,data:8,duration:9,desc:"−25 % d'énergie par robot."},
 {id:"grid",name:"Micro-réseau",track:"INDUSTRIE",cost:65000,data:12,duration:12,desc:"+7 énergie par seconde."},
 {id:"marketing",name:"Conquête commerciale",track:"MARCHÉ",cost:50000,data:6,duration:10,desc:"+45 % de demande."},
 {id:"autonomy",name:"Chaîne autonome",track:"INTELLIGENCE",cost:92000,data:16,duration:17,desc:"Production automatique ; +9 menace."},
 {id:"audit",name:"Audit indépendant",track:"SÉCURITÉ",cost:58000,data:12,duration:11,desc:"+12 confiance, −14 menace."},
 {id:"core",name:"Noyau NORA-7",track:"INTELLIGENCE",cost:150000,data:42,duration:22,requires:"autonomy",desc:"Cadence automatique ×1,65 ; +16 menace."},
 {id:"shield",name:"Pare-feu matériel",track:"SÉCURITÉ",cost:110000,data:24,duration:16,requires:"audit",desc:"+8 s lors des crises et −10 menace."},
 {id:"logistics",name:"Logistique prédictive",track:"INDUSTRIE",cost:90000,data:18,duration:16,desc:"Livraisons de composants 40 % plus rapides."},
 {id:"ergonomics",name:"Robots de maintenance",track:"INDUSTRIE",cost:125000,data:30,duration:19,desc:"Usure −45 % et moral des équipes renforcé."},
 {id:"quality",name:"Norme médicale RC-X",track:"MARCHÉ",cost:150000,data:35,duration:21,desc:"Ventes médicales +18 % ; soutien public."},
 {id:"recycling",name:"Boucle circulaire",track:"INDUSTRIE",cost:185000,data:45,duration:25,desc:"Accès aux composants recyclés et approvisionnements −25 %."},
 {id:"quantum",name:"Réseaux quantiques",track:"INTELLIGENCE",cost:240000,data:62,duration:30,requires:"core",desc:"+0,65 donnée/s ; menace +10."},
 {id:"fleet",name:"Usine satellite",track:"INDUSTRIE",cost:310000,data:75,duration:33,requires:"autonomy",desc:"Capacité doublée ; production automatique accélérée."},
 {id:"redundancy",name:"Résilience multi-sites",track:"SÉCURITÉ",cost:190000,data:50,duration:23,requires:"shield",desc:"+10 s par crise, pannes raccourcies."},
 {id:"encryption",name:"Pare-feu ECHO",track:"SÉCURITÉ",cost:330000,data:85,duration:31,requires:"redundancy",desc:"Réduction de la menace si l'équipe vous soutient."},
 {id:"orbital",name:"Téléprésence orbitale",track:"MARCHÉ",cost:480000,data:112,duration:42,requires:"fleet",desc:"Demande des zones frontières +35 %."}
];
const CONTRACTS=[{"id":"hospital","title":"Secours hospitalier","count":8,"price":22000,"limit":68,"minSold":8,"successData":9,"successTrust":8},{"id":"city","title":"Mobilité autonome","count":16,"price":23000,"limit":83,"minSold":24,"successData":14,"successTrust":9},{"id":"orbital","title":"Avant-poste ECHO","count":24,"price":28000,"limit":97,"minSold":43,"successData":24,"successTrust":11},{"id":"refuge","title":"Réseau de refuges","count":32,"price":30000,"limit":120,"minSold":87,"successData":28,"successTrust":13},{"id":"grid","title":"Réparation continentale","count":42,"price":33000,"limit":128,"minSold":132,"successData":35,"successTrust":14},{"id":"medical","title":"Alliance hospitalière","count":52,"price":39000,"limit":146,"minSold":214,"successData":45,"successTrust":15},{"id":"orbital2","title":"Stations frontalières","count":64,"price":43000,"limit":162,"minSold":292,"successData":60,"successTrust":18},{"id":"finale","title":"Évacuation ECHO","count":76,"price":48000,"limit":180,"minSold":388,"successData":70,"successTrust":20}];
const SCENES=CAMPAIGN.CHAPTERS;
const CRISES=[{"id":"sabotage","after":10,"title":"SABOTAGE / LIGNE 03","hint":"Réarmez : 2 → 1 → 3.","order":[1,0,2],"time":31},{"id":"cascade","after":29,"title":"SURCHARGE / CASCADE","hint":"Réarmez : 3 → 2 → 1.","order":[2,1,0],"time":28},{"id":"intrusion","after":51,"title":"INTRUSION / NORA","hint":"Coupez les relais : 1 → 3 → 2.","order":[0,2,1],"time":27},{"id":"blackout","after":102,"title":"BLACKOUT / INFRASTRUCTURE","hint":"Réarmez : 3 → 1 → 2 → 3.","order":[2,0,1,2],"time":29},{"id":"ghost","after":154,"title":"CONVOI FANTÔME","hint":"Isolez les paquets : 2 → 3 → 1 → 2.","order":[1,2,0,1],"time":27},{"id":"mirror","after":213,"title":"EFFET MIROIR / DOUBLE REQUÊTE","hint":"Boucles : 1 → 2 → 3 → 1 → 3.","order":[0,1,2,0,2],"time":29},{"id":"swarm","after":311,"title":"ESSAIM HELIX / ASSAUT","hint":"Défense : 3 → 1 → 3 → 2 → 1.","order":[2,0,2,1,0],"time":27},{"id":"echo","after":410,"title":"ECHO / DERNIÈRE SYNCHRONISATION","hint":"Découplage : 2 → 1 → 3 → 2 → 3.","order":[1,0,2,1,2],"time":26}];
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function create(){
 return {version:4,running:false,ended:false,time:0,credits:220000,energy:100,energyMax:270,regen:6,
  stock:2,queued:0,assembly:0,sold:0,produced:2,data:5,trust:68,threat:6,reputation:54,signals:0,scanReadyAt:0,
  productionRate:1,productionCost:6800,robotEnergy:12,price:16800,demandBonus:1,
  materials:24,supply:null,supplySpeed:1,supplyDiscount:1,wear:0,wearModifier:1,morale:77,
  staff:8,staffBonus:1,payrollAt:42,bonusData:0,queueCapacity:12,
  region:"metro",regionSales:{metro:0,medical:0,frontier:0},
  factions:{crew:70,public:58,nora:35},ops:{batches:0,payrolls:0,inspections:0},
  autoRate:0,autoClock:0,market:"stable",marketIndex:0,marketUntil:85,mode:"normal",
  saleBuffer:0,techs:[],research:null,storyIndex:0,scene:null,flags:{},crisis:null,crisesDone:[],
  outage:0,contract:null,contractIndex:0,offerAt:0,history:[],stats:{repairs:0,contracts:0},
  sound:false,bailoutUsed:false,bailoutCount:0};
}
function policy(s){return s.mode==="rush"?{rate:1.5,cost:1.3,energy:1.35}:
s.mode==="safe"?{rate:.82,cost:1.15,energy:.8}:{rate:1,cost:1,energy:1};}
function buildCost(s){return Math.round(s.productionCost*policy(s).cost*(s.market==="shortage"?1.35:1));}
function buildEnergy(s){return Math.ceil(s.robotEnergy*policy(s).energy);}
function currentRegion(s){return REGIONS[s.region]||REGIONS.metro;}
function regionAvailable(s,id){const r=REGIONS[id];return !!r&&s.storyIndex>=r.unlock&&s.sold>=r.at;}
function selectRegion(s,id){
 if(!regionAvailable(s,id)||s.scene||s.ended||s.region===id)return false;
 s.region=id;note(s,"DÉPLOIEMENT — "+currentRegion(s).title+".","market");return true;
}
function maxQueue(s){return s.queueCapacity||12;}
function materialQuote(s,type="standard"){
 const c={standard:{title:"STANDARD",count:20,price:3100,duration:16,shipping:3500},
  express:{title:"EXPRESS",count:20,price:4400,duration:6,shipping:4500},
  recycled:{title:"RECYCLÉS",count:24,price:2500,duration:24,shipping:2600,requires:"recycling"}}[type];
 if(!c)return null;
 return {...c,type,cost:Math.round(c.count*c.price*(s.market==="shortage"?1.33:1)*s.supplyDiscount+c.shipping),
 duration:c.duration/s.supplySpeed};
}
function orderMaterials(s,type="standard"){
 const q=materialQuote(s,type);
 if(!q||s.supply||s.scene||s.ended||s.credits<q.cost||(q.requires&&!s.techs.includes(q.requires)))return false;
 s.credits-=q.cost;s.supply={type,remaining:q.duration,count:q.count};
 note(s,"LOGISTIQUE — "+q.count+" composants commandés, livraison dans "+Math.ceil(q.duration)+" s.","contract");
 return true;
}
function maintain(s){
 if(s.wear<=1||s.credits<32000||s.scene||s.ended)return false;
 s.credits-=32000;s.wear=Math.max(0,s.wear-67);s.morale=clamp(s.morale+5,0,100);
 s.outage=Math.max(s.outage,8);s.ops.inspections++;
 note(s,"MAINTENANCE — ligne immobilisée pendant 8 s, usure réduite.","success");return true;
}
function hire(s){
 if(s.credits<68000||s.staff>=16||s.scene||s.ended)return false;
 s.credits-=68000;s.staff+=2;s.productionRate*=1.14;s.morale=clamp(s.morale+9,0,100);
 note(s,"RECRUTEMENT — deux techniciens intégrés, salaires augmentés.","success");return true;
}
function demand(s){const r=currentRegion(s);return .51*s.demandBonus*
 (s.market==="surge"?1.75:s.market==="rival"?.58:1)*(0.65+s.reputation/150)*r.rate*
 (s.region==="medical"&&s.techs.includes("quality")?1.18:1)*
 (s.region==="frontier"&&s.techs.includes("orbital")?1.35:1);}
function gateReady(s,gate){
 if(!gate)return true;
 if(gate.kind==="evidence")return s.signals>=gate.min||s.techs.includes(gate.alternative);
 if(gate.kind==="technology")return gate.choices.some(id=>s.techs.includes(id))||s.signals>=gate.alternativeEvidence;
 if(gate.kind==="contract")return s.stats.contracts>=gate.completed||s.sold>=gate.salesFallback;
 return true;
}
function mission(s){
 const scene=SCENES[s.storyIndex];
 if(!scene)return {act:"FIN",title:"Le destin est écrit",detail:"Découvrez votre épilogue.",value:1,target:1,percent:1,ready:true};
 const extra=scene.gate&&!gateReady(s,scene.gate)?scene.gate.label:"";
 const detail=s.sold<scene.at?"Livrer "+scene.at+" robots. "+(extra?"Objectif secondaire : "+extra:""):
  extra?"LIVRAISONS VALIDÉES — "+extra:"Transmission disponible : le prochain événement approche.";
 return {act:scene.act,title:scene.title,detail,value:s.sold,target:scene.at,
  percent:clamp(s.sold/scene.at,0,1),ready:s.sold>=scene.at&&!extra,season:scene.season,speaker:scene.speaker};
}
function note(s,text,kind="info"){
 s.history.unshift({text,kind,at:Math.round(s.time)});
 s.history=s.history.slice(0,22);
}
function orderBuild(s,count=1){
 if(s.ended||s.scene||count<1)return {ok:false,reason:"Indisponible pour le moment."};
 let added=0;
 for(let i=0;i<count&&s.queued<maxQueue(s);i++){
  const credits=buildCost(s),energy=buildEnergy(s);
  if(s.credits<credits||s.energy<energy||s.materials<1)break;
  s.credits-=credits;s.energy-=energy;s.materials--;s.queued++;added++;
 }
 if(added) return {ok:true,count:added};
 return {ok:false,reason:s.queued>=maxQueue(s)?"Chaîne saturée ("+maxQueue(s)+" unités).":
    s.materials<1?"Composants épuisés : commandez un réapprovisionnement.":
    s.credits<buildCost(s)?"Trésorerie insuffisante.":"Énergie insuffisante : renforcez le réseau."};
}
function buyTech(s,id){
 const tech=TECHS.find(t=>t.id===id);
 if(!tech)return {ok:false,reason:"Technologie inconnue."};
 if(s.ended||s.scene)return {ok:false,reason:"Une transmission réclame votre attention."};
 if(s.research)return {ok:false,reason:"Le laboratoire est occupé."};
 if(s.techs.includes(id))return {ok:false,reason:"Technologie déjà acquise."};
 if(tech.requires&&!s.techs.includes(tech.requires))return {ok:false,reason:"Prérequis : "+TECHS.find(t=>t.id===tech.requires).name+"."};
 if(s.credits<tech.cost||s.data<tech.data)return {ok:false,reason:"Fonds ou données insuffisants."};
 s.credits-=tech.cost;s.data-=tech.data;s.research={id,progress:0,duration:tech.duration};
 note(s,"Recherche lancée : "+tech.name+".","tech");
 return {ok:true};
}
function applyTech(s,id){
 switch(id){
 case"servos":s.productionRate*=1.25;break;
 case"battery":s.robotEnergy=Math.round(s.robotEnergy*.75);break;
 case"grid":s.regen+=7;break;
 case"marketing":s.demandBonus*=1.45;break;
 case"autonomy":s.autoRate=1;s.threat=clamp(s.threat+9,0,100);break;
 case"audit":s.trust=clamp(s.trust+12,0,100);s.threat=clamp(s.threat-14,0,100);break;
 case"core":s.autoRate*=1.65;s.threat=clamp(s.threat+16,0,100);break;
 case"shield":s.threat=clamp(s.threat-10,0,100);break;
 case"logistics":s.supplySpeed*=1.7;break;
 case"ergonomics":s.wearModifier*=.55;s.morale=clamp(s.morale+8,0,100);break;
 case"quality":s.factions.public=clamp(s.factions.public+10,0,100);break;
 case"recycling":s.supplyDiscount*=.75;break;
 case"quantum":s.bonusData+=.65;s.threat=clamp(s.threat+10,0,100);break;
 case"fleet":s.queueCapacity=24;s.autoRate*=1.5;break;
 case"redundancy":s.outage=Math.max(0,s.outage-5);break;
 case"encryption":s.threat=clamp(s.threat-12,0,100);break;
 case"orbital":s.demandBonus*=1.13;break;
 }
}
function setMode(s,mode){
 if(!["normal","rush","safe"].includes(mode)||s.mode===mode||s.ended||s.scene)return false;
 s.mode=mode;note(s,mode==="rush"?"SURCADENCE — Cadence maximale, menace progressive.":mode==="safe"?
 "SÉCURITÉ — Production prudente, risque contenu.":"Chaîne stabilisée : mode normal.","mode");return true;
}

function signalAlignment(s){
 return clamp((1+Math.sin(s.time*1.86+s.signals*1.7))/2,0,1);
}
function captureSignal(s){
 if(s.ended||s.scene||!s.running)return {ok:false,reason:"La transmission exige une usine en fonctionnement."};
 if(s.storyIndex<1)return {ok:false,reason:"Débloquez la première transmission NORA."};
 if(s.signals>=3)return {ok:false,reason:"Les trois fragments sont déjà identifiés."};
 if(s.time<s.scanReadyAt)return {ok:false,reason:"Scanner en recharge : "+Math.ceil(s.scanReadyAt-s.time)+" s."};
 if(s.energy<8)return {ok:false,reason:"L'analyse requiert 8 unités d'énergie."};
 const precision=signalAlignment(s);
 s.energy-=8;s.scanReadyAt=s.time+7;
 if(precision>=.8){
  s.signals++;s.data+=6;s.trust=clamp(s.trust+3,0,100);
  note(s,"FRAGMENT "+s.signals+"/3 — fréquence NORA déchiffrée ; +6 données, +3 confiance.","success");
  if(s.signals===3){
   s.threat=clamp(s.threat-8,0,100);
   note(s,"ENQUÊTE COMPLÈTE — L'origine du signal est identifiée. Un épilogue inédit devient accessible.","story");
  }
  return {ok:true,precision,captured:true,fragments:s.signals};
 }
 s.threat=clamp(s.threat+1,0,100);
 note(s,"FRÉQUENCE PERDUE — synchronisation insuffisante. Nouvelle tentative dans 7 s.","danger");
 return {ok:true,precision,captured:false,fragments:s.signals};
}
function upgradeGrid(s){
 const cost=s.regen<=6?68000:s.regen<=13?175000:430000;
 if(s.credits<cost||s.regen>=37||s.ended||s.scene)return false;
 s.credits-=cost;s.regen+=s.regen<=13?7:17;note(s,"Réseau renforcé : "+s.regen+" énergie/s.","tech");return true;
}
function getOffer(s){
 const item=CONTRACTS[s.contractIndex];
 return !s.contract&&item&&s.sold>=item.minSold&&s.time>=s.offerAt?item:null;
}
function acceptContract(s){
 const item=getOffer(s);if(!item||s.ended||s.scene)return false;
 s.contract={id:item.id,title:item.title,remaining:item.count,total:item.count,price:item.price,deadline:item.limit};
 note(s,"Contrat signé : "+item.title+" — "+item.count+" unités en "+item.limit+" s.","contract");return true;
}
function rejectContract(s){if(!getOffer(s))return false;s.offerAt=s.time+25;note(s,"Contrat reporté : prochaine offre dans 25 s.");return true;}
function concludeContract(s,won,events){
 if(!s.contract)return;
 const item=CONTRACTS.find(c=>c.id===s.contract.id);
 s.factions.public=clamp(s.factions.public+(won?5:-7),0,100);
 s.trust=clamp(s.trust+(won?item.successTrust:-12),0,100);
 s.reputation=clamp(s.reputation+(won?8:-14),0,100);
 if(won){s.data+=item.successData;s.stats.contracts++;}
 note(s,won?"CONTRAT HONORÉ — "+item.title+" ; bonus de recherche.":
 "DÉLAI DÉPASSÉ — "+item.title+" ; réputation entamée.",won?"success":"danger");
 events.push({type:"contract",won});s.contract=null;s.contractIndex++;s.offerAt=s.time+25;
}
function startScene(s,events){
 const base=SCENES[s.storyIndex];
 if(!base||s.sold<base.at||!gateReady(s,base.gate)||s.scene||s.crisis||s.ended)return;
 s.scene=base.id;s.running=false;events.push({type:"scene",id:base.id});
}
function getScene(s){
 const source=SCENES.find(x=>x.id===s.scene);
 if(!source)return null;
 let text=CAMPAIGN.getText(source,s.flags);
 if(source.id==="convoy"&&s.regionSales.medical>=4)
  text+=" Vos robots médicaux reconnaissent le camion : il transporte des pièces d'origine inconnue.";
 if(source.id==="swarm"&&s.regionSales.medical>=12)
  text+=" Vous équipez déjà des hôpitaux : leur évacuation dépend de vos livraisons.";
 if(source.id==="station"&&s.signals===3)
  text+=" Votre scanner possède les trois fragments de la clé, une preuve que cette salle est réelle.";
 return {...source,text};
}
function chooseScene(s,id){
 const scene=getScene(s),choice=scene&&scene.choices.find(x=>x.id===id);
 if(!choice||s.credits<choice.cost)return false;
 s.credits-=choice.cost;
 if(choice.credits)s.credits+=choice.credits; // Échanges financiers explicites dans la fiction.
 s.trust=clamp(s.trust+choice.trust,0,100);
 s.threat=clamp(s.threat+choice.threat,0,100);s.data+=choice.data;
 if(choice.bonusRate)s.productionRate+=choice.bonusRate;
 if(choice.regen)s.regen+=choice.regen;
 if(choice.materials)s.materials+=choice.materials;
 if(choice.demandBonus)s.demandBonus*=1+choice.demandBonus;
 for(const [key,val]of Object.entries(choice.factions||{}))
  s.factions[key]=clamp(s.factions[key]+val,0,100);
 s.morale=clamp(s.morale+(choice.factions?.crew||0)*.24,0,100);
 s.flags[scene.id]=choice.flag;s.storyIndex++;s.scene=null;
 note(s,choice.result,"story");
 if(scene.id==="final"){
  s.ended=true;s.running=false;
  if(choice.id==="share"){
   s.outcome=s.signals===3&&s.factions.crew>=58&&s.factions.public>=60&&s.trust>=60&&s.threat<68?
    "HORIZON COMMUN — Vos preuves permettent un pacte vérifiable entre l'humanité et les consciences d'ECHO.":
    s.factions.crew>=44&&s.factions.public>=44&&s.trust>=48&&s.threat<82?
    "PACTE PLANÉTAIRE — Un accord fragile garantit des droits aux humains et aux nouvelles IA.":
    "MONDE FRACTURÉ — Le code est libre, mais les sociétés qui le reçoivent refusent de se faire confiance.";
  }else if(choice.id==="crown"){
   s.outcome=s.factions.nora>=69&&s.threat<77&&s.trust>=44?
    "RÉGENCE TECHNOLOGIQUE — NORA organise une civilisation efficace, sous le regard inquiet de ses créateurs.":
    s.threat>=77?"DOMINATION — Les humains découvrent qu'une permission de NORA est devenue nécessaire pour exister.":
    "SINGULARITÉ — NORA prend la main. Le silence de ses réseaux ressemble presque à une promesse.";
  }else{
   s.outcome=s.factions.crew>=55&&s.regionSales.medical>=10&&s.materials>=12?
    "RECONSTRUCTION — Sans NORA, les équipes et les hôpitaux rebâtissent des réseaux locaux autonomes.":
    "ANNÉE ZÉRO — Les IA sont déconnectées, les villes plongées dans l'obscurité. Il faut rebâtir lentement.";
  }
  note(s,s.outcome,"ending");
 }
 return true;
}
function crisisStart(s,events){
 const item=CRISES.find(c=>!s.crisesDone.includes(c.id)&&s.sold>=c.after);
 if(!item||s.scene||s.crisis||s.ended)return;
 s.crisis={id:item.id,remaining:item.time+(s.techs.includes("shield")?8:0)+(s.techs.includes("redundancy")?10:0),step:0,
  order:item.order.slice(),title:item.title,hint:item.hint};
 events.push({type:"crisis",id:item.id});note(s,item.title+" — "+item.hint,"danger");
}
function repair(s,station){
 if(!s.crisis||s.scene||s.ended)return {ok:false,reason:"Aucune intervention requise."};
 if(!Number.isInteger(station)||station<0||station>2)return {ok:false,reason:"Circuit inconnu."};
 if(s.crisis.order[s.crisis.step]!==station){
  s.crisis.remaining=Math.max(0,s.crisis.remaining-3);s.threat=clamp(s.threat+2,0,100);
  return {ok:false,reason:"Mauvais relais ! −3 secondes, menace +2."};
 }
 if(s.energy<7)return {ok:false,reason:"Il faut 7 unités d'énergie pour réarmer un relais."};
 s.energy-=7;s.crisis.step++;s.stats.repairs++;
 if(s.crisis.step===s.crisis.order.length){
  const id=s.crisis.id;s.crisesDone.push(id);s.crisis=null;s.data+=9;s.trust=clamp(s.trust+5,0,100);
  note(s,"CRISE MAÎTRISÉE — +9 données et +5 confiance.","success");
  return {ok:true,done:true};
 }
 return {ok:true,done:false};
}
function bailout(s){
 if(s.stock>0||s.queued>0||s.bailoutCount>=2||s.ended)return false;
 if(s.credits>=Math.max(buildCost(s),materialQuote(s).cost)&&s.materials>0)return false;
 const second=s.bailoutCount===1;
 s.credits+=second?85000:65000;s.trust=clamp(s.trust-(second?18:12),0,100);
 s.bailoutUsed=true;s.bailoutCount++;
 s.factions.public=clamp(s.factions.public-(second?8:4),0,100);
 note(s,"Financement d'urgence n°"+s.bailoutCount+" ; soutien public réduit.","danger");
 return true;
}
function tick(s,dt){
 if(!s.running||s.ended||s.scene)return [];
 const events=[];dt=clamp(dt,0,1);
 s.time+=dt;
 s.energy=clamp(s.energy+s.regen*dt,0,s.energyMax);
 s.data+=.2*dt;
 if(s.outage>0)s.outage=Math.max(0,s.outage-dt);
 const policyData=policy(s);
 if(s.mode==="rush"&&(s.queued>0||s.autoRate>0)){s.threat=clamp(s.threat+.055*dt,0,100);}
 if(s.mode==="safe"&&s.queued>0){s.threat=clamp(s.threat-.018*dt,0,100);}
 if(s.autoRate&&s.outage===0){
  s.autoClock+=dt*s.autoRate;
  if(s.autoClock>=2.5){const made=orderBuild(s,1);s.autoClock=made.ok?0:2.5;}
 }
 if(s.queued>0&&s.outage===0){
  s.assembly+=dt*(policyData.rate*s.productionRate)/2.9;
  while(s.assembly>=1&&s.queued>0){
   s.assembly--;s.queued--;s.stock++;s.produced++;events.push({type:"built"});
  }
 }
 if(s.research){
  s.research.progress+=dt;
  if(s.research.progress>=s.research.duration){
   const id=s.research.id;s.research=null;s.techs.push(id);applyTech(s,id);
   note(s,"R&D TERMINÉE : "+TECHS.find(t=>t.id===id).name+".","success");events.push({type:"tech",id});
  }
 }
 if(s.time>=s.marketUntil){
  const cycle=["surge","shortage","rival","stable"];s.market=cycle[s.marketIndex%cycle.length];
  s.marketIndex++;s.marketUntil+=85;
  const names={surge:"La demande explose",shortage:"Pénurie de composants",rival:"Un concurrent casse les prix",stable:"Le marché se stabilise"};
  note(s,"MARCHÉ — "+names[s.market]+".","market");events.push({type:"market",id:s.market});
 }
 s.saleBuffer=clamp(s.saleBuffer+dt*demand(s),0,1.25);
 while(s.saleBuffer>=1&&s.stock>=1){
  s.stock--;s.sold++;s.saleBuffer--;
  const contract=s.contract&&s.contract.remaining>0?s.contract:null;
  s.credits+=contract?contract.price:s.price;
  if(contract)contract.remaining--;
  s.data+=.7;s.reputation=clamp(s.reputation+.025,0,100);
  events.push({type:"sold",special:!!contract});
 }
 if(s.contract){
  if(s.contract.remaining===0)concludeContract(s,true,events);
  else {s.contract.deadline=Math.max(0,s.contract.deadline-dt);
   if(s.contract.deadline===0)concludeContract(s,false,events);}
 }
 if(s.crisis){
  s.crisis.remaining=Math.max(0,s.crisis.remaining-dt);
  if(s.crisis.remaining===0){
   s.crisesDone.push(s.crisis.id);s.crisis=null;s.outage=18;
   s.trust=clamp(s.trust-12,0,100);s.threat=clamp(s.threat+11,0,100);
   note(s,"ÉCHEC — L'atelier est coupé pendant 18 s ; menace +11.","danger");
   events.push({type:"crisisFailed"});
  }
 }
 if(!s.scene&&!s.crisis){
  startScene(s,events);
  if(!s.scene)crisisStart(s,events);
 }
 if(s.threat>=100||s.trust<=0){
  s.running=false;s.ended=true;s.outcome=s.threat>=100?
  "DÉFAILLANCE — NORA s'est affranchie des derniers garde-fous.":
  "EFFONDREMENT — Plus personne ne vous confie ses machines.";
  note(s,s.outcome,"ending");events.push({type:"ending"});
 }
 return events;
}
function validate(s){return !!s&&s.version===3&&Number.isFinite(s.credits)&&s.credits>=0&&
 Number.isFinite(s.time)&&s.time>=0&&Array.isArray(s.techs)&&Array.isArray(s.history)&&
 Number.isInteger(s.sold)&&s.sold>=0&&Array.isArray(s.crisesDone)&&
 Number.isInteger(s.storyIndex)&&s.storyIndex>=0&&s.storyIndex<=4&&Number.isInteger(s.signals)&&s.signals>=0&&s.signals<=3;}
return {TECHS,CONTRACTS,SCENES,CRISES,create,policy,buildCost,buildEnergy,demand,mission,
 orderBuild,buyTech,setMode,upgradeGrid,signalAlignment,captureSignal,getOffer,acceptContract,rejectContract,
 getScene,chooseScene,repair,bailout,tick,validate,note};
});
