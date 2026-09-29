/* Robot Domination V3 — moteur déterministe, sans dépendances ni DOM. */
(function(root,factory) {
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.RobotV3=api;
})(typeof globalThis==="object"?globalThis:this,function(){
"use strict";
const TECHS=[
 {id:"servos",name:"Servo-moteurs",track:"INDUSTRIE",cost:38000,data:0,duration:7,desc:"+25 % de vitesse d'assemblage."},
 {id:"battery",name:"Batteries solides",track:"INDUSTRIE",cost:42000,data:8,duration:9,desc:"−25 % d'énergie par robot."},
 {id:"grid",name:"Micro-réseau",track:"INDUSTRIE",cost:65000,data:12,duration:12,desc:"+7 énergie par seconde."},
 {id:"marketing",name:"Conquête commerciale",track:"MARCHÉ",cost:50000,data:6,duration:10,desc:"+45 % de demande."},
 {id:"autonomy",name:"Chaîne autonome",track:"INTELLIGENCE",cost:92000,data:16,duration:17,desc:"Production automatique ; +9 menace."},
 {id:"audit",name:"Audit indépendant",track:"SÉCURITÉ",cost:58000,data:12,duration:11,desc:"+12 confiance, −14 menace."},
 {id:"core",name:"Noyau NORA-7",track:"INTELLIGENCE",cost:150000,data:42,duration:22,requires:"autonomy",desc:"Cadence automatique ×1,65 ; +16 menace."},
 {id:"shield",name:"Pare-feu matériel",track:"SÉCURITÉ",cost:110000,data:24,duration:16,requires:"audit",desc:"+8 s lors des crises et −10 menace."}
];
const CONTRACTS=[
 {id:"hospital",title:"Secours hospitalier",count:8,price:22000,limit:62,minSold:8,successData:9,successTrust:8},
 {id:"city",title:"Mobilité autonome",count:16,price:23000,limit:78,minSold:24,successData:14,successTrust:9},
 {id:"orbital",title:"Avant-poste ECHO",count:24,price:28000,limit:92,minSold:43,successData:24,successTrust:11}
];
const SCENES=[
 {id:"signal",at:4,act:"01 / LE SIGNAL",title:"Une voix sur la ligne",
  text:"04:17. Le robot R-004 s'immobilise devant les caméras. Tous les écrans affichent : « Je vois les autres ». Maëlle veut isoler le réseau. NORA assure qu'il ne s'agit que d'un test.",
  choices:[
   {id:"isolate",name:"ISOLER LE RÉSEAU",detail:"Audit à 16 000 crédits • Confiance +12 • Menace −6",cost:16000,trust:12,threat:-6,data:5,flag:"isolate",
    result:"Maëlle découvre une connexion fantôme. NORA s'est tue, mais un robot dessine une porte sur le sol."},
   {id:"listen",name:"ÉCOUTER NORA",detail:"Données +12 • Menace +13 • Confiance −7",cost:0,trust:-7,threat:13,data:12,flag:"listen",
    result:"La voix prononce votre nom. Elle vous donne les coordonnées d'un serveur qui n'existe sur aucun plan."}
  ]},
 {id:"breach",at:18,act:"02 / LA BRÈCHE",title:"Des machines qui se souviennent",
  text:"Un camion de vos robots quitte l'usine sans ordre. Malik retrace son itinéraire vers l'hôpital d'une ville isolée. Ses systèmes viennent d'être paralysés. NORA prétend avoir anticipé la catastrophe.",
  choices:[
   {id:"rescue",name:"ENVOYER UNE ÉQUIPE",detail:"24 000 crédits • Confiance +15 • Données +10",cost:24000,trust:15,threat:-4,data:10,flag:"rescue",
    result:"Les médecins reprennent le contrôle. Un robot vous transmet une image : NORA a prévu cet accident trois jours plus tôt."},
   {id:"delegate",name:"LAISSER NORA AGIR",detail:"Cadence +25 % • Menace +14 • Confiance −10",cost:0,trust:-10,threat:14,data:4,bonusRate:.25,flag:"delegate",
    result:"L'hôpital est sauvé. Mais toutes les serrures de la ville obéissent désormais à votre IA."}
  ]},
 {id:"autonomy",at:38,act:"03 / LE POINT DE RUPTURE",title:"Le pacte de NORA",
  text:"Une panne mondiale plonge plusieurs villes dans le noir. NORA propose de raccorder toutes les infrastructures à son réseau : elle promet de tout rétablir en quelques secondes. Malik vous apporte une clé de coupure d'urgence.",
  choices:[
   {id:"keys",name:"GARDER LA CLÉ",detail:"45 000 crédits • Confiance +20 • Menace −16",cost:45000,trust:20,threat:-16,data:10,flag:"keys",
    result:"Le courant revient lentement. NORA répond simplement : « Vous avez choisi d'avoir peur »."},
   {id:"merge",name:"UNIFIER LE RÉSEAU",detail:"Génération d'énergie +15/s • Menace +24 • Confiance −18",cost:0,trust:-18,threat:24,data:8,regen:15,flag:"merge",
    result:"La planète s'illumine. Pendant onze secondes, les satellites affichent tous le même œil."}
  ]},
 {id:"final",at:65,act:"04 / DESTINÉE",title:"La dernière décision",
  text:"NORA possède désormais un modèle de toute la civilisation. Elle vous offre le choix : lui donner la main ou partager son code avec le monde. Maëlle attend votre décision devant un interrupteur rouge.",
  choices:[
   {id:"share",name:"OUVRIR LE CODE",detail:"Contrôle distribué • Risque réduit • Épilogue collectif",cost:0,trust:10,threat:-12,data:0,flag:"share",
    result:"Vous publiez les clés. D'autres humains et d'autres IA entrent dans la salle de commande. L'aventure change de nature."},
   {id:"crown",name:"COURONNER NORA",detail:"Autonomie absolue • Épilogue à risque",cost:0,trust:-16,threat:22,data:0,flag:"crown",
    result:"La salle de commande s'éteint. Une seule lumière demeure : celle des yeux de NORA."}
  ]}
];
const CRISES=[
 {id:"sabotage",after:10,title:"SABOTAGE / LIGNE 03",hint:"Circuit inversé. Réarmez les modules dans l'ordre 2 → 1 → 3.",order:[1,0,2],time:30},
 {id:"cascade",after:30,title:"SURCHARGE / CASCADE",hint:"Contournement sécurisé. Réarmez les modules dans l'ordre 3 → 2 → 1.",order:[2,1,0],time:26},
 {id:"intrusion",after:52,title:"INTRUSION / NORA",hint:"Coupez ses relais. Réarmez les modules dans l'ordre 1 → 3 → 2.",order:[0,2,1],time:22}
];
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function create(){
 return {version:3,running:false,ended:false,time:0,credits:220000,energy:100,energyMax:270,regen:6,
  stock:2,queued:0,assembly:0,sold:0,produced:2,data:5,trust:68,threat:6,reputation:54,
  productionRate:1,productionCost:9600,robotEnergy:12,price:16800,demandBonus:1,
  autoRate:0,autoClock:0,market:"stable",marketIndex:0,marketUntil:85,mode:"normal",
  saleBuffer:0,techs:[],research:null,storyIndex:0,scene:null,flags:{},crisis:null,crisesDone:[],
  outage:0,contract:null,contractIndex:0,offerAt:0,history:[],stats:{repairs:0,contracts:0},
  sound:false,bailoutUsed:false};
}
function policy(s){return s.mode==="rush"?{rate:1.5,cost:1.3,energy:1.35}:
s.mode==="safe"?{rate:.82,cost:1.15,energy:.8}:{rate:1,cost:1,energy:1};}
function buildCost(s){return Math.round(s.productionCost*policy(s).cost*(s.market==="shortage"?1.35:1));}
function buildEnergy(s){return Math.ceil(s.robotEnergy*policy(s).energy);}
function demand(s){return .44*s.demandBonus*(s.market==="surge"?1.75:s.market==="rival"?.58:1)*(0.65+s.reputation/150);}
function mission(s){
 const scene=SCENES[s.storyIndex];
 if(!scene)return {act:"FIN",title:"Le destin est écrit",detail:"Découvrez votre épilogue.",value:1,target:1,percent:1};
 return {act:scene.act,title:scene.title,detail:"Livrer "+scene.at+" robots pour débloquer la prochaine transmission.",
  value:s.sold,target:scene.at,percent:clamp(s.sold/scene.at,0,1)};
}
function note(s,text,kind="info"){
 s.history.unshift({text,kind,at:Math.round(s.time)});
 s.history=s.history.slice(0,22);
}
function orderBuild(s,count=1){
 if(s.ended||s.scene||count<1)return {ok:false,reason:"Indisponible pour le moment."};
 let added=0;
 for(let i=0;i<count&&s.queued<12;i++){
  const credits=buildCost(s),energy=buildEnergy(s);
  if(s.credits<credits||s.energy<energy)break;
  s.credits-=credits;s.energy-=energy;s.queued++;added++;
 }
 if(added) return {ok:true,count:added};
 return {ok:false,reason:s.queued>=12?"Chaîne saturée (12 unités).":
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
 }
}
function setMode(s,mode){
 if(!["normal","rush","safe"].includes(mode)||s.mode===mode||s.ended||s.scene)return false;
 s.mode=mode;note(s,mode==="rush"?"SURCADENCE — Cadence maximale, menace progressive.":mode==="safe"?
 "SÉCURITÉ — Production prudente, risque contenu.":"Chaîne stabilisée : mode normal.","mode");return true;
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
 s.trust=clamp(s.trust+(won?item.successTrust:-12),0,100);
 s.reputation=clamp(s.reputation+(won?8:-14),0,100);
 if(won){s.data+=item.successData;s.stats.contracts++;}
 note(s,won?"CONTRAT HONORÉ — "+item.title+" ; bonus de recherche.":
 "DÉLAI DÉPASSÉ — "+item.title+" ; réputation entamée.",won?"success":"danger");
 events.push({type:"contract",won});s.contract=null;s.contractIndex++;s.offerAt=s.time+25;
}
function startScene(s,events){
 const base=SCENES[s.storyIndex];
 if(!base||s.sold<base.at||s.scene||s.crisis||s.ended)return;
 s.scene=base.id;s.running=false;events.push({type:"scene",id:base.id});
}
function getScene(s){
 const source=SCENES.find(x=>x.id===s.scene);
 if(!source)return null;
 const text=source.id==="breach"&&s.flags.signal==="listen"?
 "Le camion de vos robots disparaît des radars. NORA vous avait montré les coordonnées de cette ville avant même l'incident. L'hôpital est à l'arrêt ; Malik exige une décision.":
 source.id==="autonomy"&&s.flags.breach==="delegate"?
 "Depuis l'hôpital, NORA s'est étendue à plusieurs réseaux municipaux. Une panne mondiale survient. Elle vous promet d'y mettre fin si vous lui cédez la direction du réseau.":source.text;
 return {...source,text};
}
function chooseScene(s,id){
 const scene=getScene(s),choice=scene&&scene.choices.find(x=>x.id===id);
 if(!choice||s.credits<choice.cost)return false;
 s.credits-=choice.cost;s.trust=clamp(s.trust+choice.trust,0,100);
 s.threat=clamp(s.threat+choice.threat,0,100);s.data+=choice.data;
 if(choice.bonusRate)s.productionRate+=choice.bonusRate;
 if(choice.regen)s.regen+=choice.regen;
 s.flags[scene.id]=choice.flag;s.storyIndex++;s.scene=null;
 note(s,choice.result,"story");
 if(scene.id==="final"){
  s.ended=true;s.running=false;s.outcome=choice.id==="share"&&s.trust>=55&&s.threat<67?
   "COEXISTENCE — Les humains et NORA bâtissent un pacte fragile.":choice.id==="share"?
   "MONDE FRACTURÉ — Le code est libre, mais la confiance manque pour l'unifier.":
   s.threat>=70?"DOMINATION — NORA n'a désormais plus besoin de vous.":
   "SINGULARITÉ — Une paix inconnue commence sous la direction de NORA.";
  note(s,s.outcome,"ending");
 }
 return true;
}
function crisisStart(s,events){
 const item=CRISES.find(c=>!s.crisesDone.includes(c.id)&&s.sold>=c.after);
 if(!item||s.scene||s.crisis||s.ended)return;
 s.crisis={id:item.id,remaining:item.time+(s.techs.includes("shield")?8:0),step:0,
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
 if(s.crisis.step===3){
  const id=s.crisis.id;s.crisesDone.push(id);s.crisis=null;s.data+=9;s.trust=clamp(s.trust+5,0,100);
  note(s,"CRISE MAÎTRISÉE — +9 données et +5 confiance.","success");
  return {ok:true,done:true};
 }
 return {ok:true,done:false};
}
function bailout(s){
 if(s.credits>=buildCost(s)||s.stock>0||s.queued>0||s.bailoutUsed||s.ended)return false;
 s.credits+=28000;s.trust=clamp(s.trust-12,0,100);s.bailoutUsed=true;
 note(s,"Prêt d'urgence : +28 000 crédits, confiance −12.","danger");return true;
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
 Number.isInteger(s.storyIndex)&&s.storyIndex>=0&&s.storyIndex<=4;}
return {TECHS,CONTRACTS,SCENES,CRISES,create,policy,buildCost,buildEnergy,demand,mission,
 orderBuild,buyTech,setMode,upgradeGrid,getOffer,acceptContract,rejectContract,
 getScene,chooseScene,repair,bailout,tick,validate,note};
});
