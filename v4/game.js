/* Robot Domination V3 — interactions, rendu stable, usine 2D et narration. */
(function(){
"use strict";
const E=window.RobotV3;
if(!E)throw new Error("Le moteur RobotV3 doit être chargé avant l'interface.");
const $=id=>document.getElementById(id);
const els=Object.fromEntries([
"game","statCredits","statEnergy","statSold","statData","statThreat","statTrust",
"energyRegen","stockLine","researchLine","threatFill","trustFill",
"headStatus","btnAudio","btnSave","btnLoad","btnPause",
"missionAct","missionTitle","missionDetail","missionFill","missionCount",
"storySteps","fieldLog","operationLabel","marketBadge","timeBadge","seasonLabel","regionBadge","materialsBadge",
"factory","canvasWrap","canvasCaption","crisisHud","crisisClock","crisisTitle",
"crisisHint","crisisProgress","queueLine","beltFill","stageStock","stageRate","stageDemand",
"buildOne","buildThree","buildCost","buildHint","modeLabel","modeSwitch",
"gridTitle","gridCost","buildGrid","btnBailout","techCards","activeTech",
"techInProgress","techFill","labStatus","contractTag","contractTitle",
"contractDescription","contractUnits","contractDeadline","contractProgress",
"contractFill","btnAccept","btnReject","intelText","opsFeed","toast",
"launchScreen","btnLaunch","btnLaunchResume","storyOverlay","storyAct","storyHeading","storyDescription",
"storyChoice0","storyChoice1","storyChoice2","storyPlace","storySeason","storySpeaker","storyDialogue","storyStakes","storyButtons","storyConsequence","storyResult","storyContinue","storyDisclaimer","endOverlay","endingHeading","endingDescription",
"endingStats","btnRestart","signalCount","signalClue","signalMarker","signalPrecision","signalCooldown","btnScan",
"resourceMaterials","supplyStatus","supplyProgress","supplyFill","supplyInfo",
"supplyStandard","supplyExpress","supplyRecycled","payrollAmount","payrollTimer",
"crewLabel","wearValue","wearFill","moraleValue","moraleFill","btnMaintain","btnHire",
"factionCrew","factionPublic","factionNora","factionCrewFill","factionPublicFill","factionNoraFill"].map(id=>[id,$(id)]));
for(const [id,node]of Object.entries(els))if(!node)throw new Error("Élément manquant : "+id);
const $all=selector=>[...document.querySelectorAll(selector)];
const repairButtons=$all("[data-repair]");
const modeButtons=$all("[data-mode]");
const supplyButtons=$all("[data-supply]");
const regionButtons=$all("[data-region]");
const tabs=$all("[data-panel]");
const pages=$all(".command-page");
const techNodes=new Map(),storyDots=$all(".story-step");
const logNodes=[...els.fieldLog.children];
const MONEY=new Intl.NumberFormat("fr-CH",{maximumFractionDigits:0});
const fmt=value=>MONEY.format(Math.floor(value));
const SAVE="robot-domination-v4-odyssey-save-1";
let s=E.create();
let lastUi=0,lastSim=performance.now(),lastLogKey="",activePanel="atelier",toastHandle=0;
let sceneVisible="",endVisible=false,consequenceActive=false,reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
let audio=null,particles=[],animationTime=0,prevFrame=performance.now(),lastFpsDraw=0;
const canvas=els.factory,ctx=canvas.getContext("2d");
if(!ctx)throw new Error("Votre navigateur ne prend pas en charge Canvas 2D.");

function setText(node,value){
 const text=String(value);
 if(node.textContent!==text)node.textContent=text;
}
function setWidth(node,value){
 const next=Math.round(Math.max(0,Math.min(100,value))*10)/10+"%";
 if(node.style.width!==next)node.style.width=next;
}
function toast(message,warning=false){
 setText(els.toast,message);els.toast.classList.add("is-visible");
 els.toast.style.borderLeftColor=warning?"#e3896e":"#629d7b";
 clearTimeout(toastHandle);
 toastHandle=setTimeout(()=>els.toast.classList.remove("is-visible"),2900);
}
function storage(operation,value){
 try{
  if(operation==="read")return localStorage.getItem(SAVE);
  if(operation==="write"){localStorage.setItem(SAVE,value);return true;}
  if(operation==="clear"){localStorage.removeItem(SAVE);return true;}
 }catch(e){return null;}
 return null;
}
function save(silent=false){
 const copy={...s,running:false,sound:false};
 const ok=storage("write",JSON.stringify(copy));
 els.btnLoad.disabled=!ok;
 els.btnLaunchResume.hidden=!ok;
 if(!silent)toast(ok?"Partie enregistrée sur cet appareil.":"Sauvegarde indisponible dans ce navigateur.",!ok);
 return ok;
}
function load(){
 let data=null;try{data=JSON.parse(storage("read")||"null");}catch(e){}
 if(!E.validate(data)){toast("Sauvegarde absente ou incompatible.",true);return;}
 s=Object.assign(E.create(),data,{running:false,sound:false});
 resetUi();
 els.launchScreen.hidden=true;
 if(s.scene)openScene();
 if(s.ended)showEnding();
 toast("Chronologie restaurée. Reprenez la simulation.");
 render(true);
}
function resetUi(){
 sceneVisible="";endVisible=false;consequenceActive=false;lastLogKey="";
 els.storyOverlay.hidden=true;els.endOverlay.hidden=true;
 particles=[];lastSim=performance.now();
 activate("atelier",false);
}
function setSound(enabled){
 s.sound=enabled;
 els.btnAudio.setAttribute("aria-pressed",String(enabled));
 setText(els.btnAudio,enabled?"◉ SON":"◌ SON");
 if(enabled && !audio) {
  try{const API=window.AudioContext||window.webkitAudioContext;audio=API?new API():null;}catch(e){audio=null;}
 }
 if(enabled && audio?.state==="suspended")audio.resume().catch(()=>{});
 if(enabled)ping(620,.09,"triangle",.027);
}
function ping(freq=450,length=.08,type="sine",volume=.045){
 if(!s.sound||!audio)return;
 try{
  const o=audio.createOscillator(),gain=audio.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);
  gain.gain.setValueAtTime(Math.max(.0001,volume),audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+length);
  o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+length);
 }catch(e){/* jeu muet si WebAudio est indisponible */ }
}
function spendBuild(count){
 const r=E.orderBuild(s,count);
 if(!r.ok){toast(r.reason,true);ping(170,.18,"sawtooth");return;}
 flash("build",r.count);
 ping(520,.08,"triangle",.04);
 render();
}
function flash(kind,count=1){
 const w=canvas.clientWidth||500,h=canvas.clientHeight||300;
 for(let i=0;i<(reduced?5:Math.min(24,6+count*5));i++){
  const a=(i*2.399)+Math.random()*.5;
  particles.push({x:w*(kind==="danger"?.5:.43),y:h*(kind==="danger"?.45:.68),
   dx:Math.cos(a)*(20+Math.random()*85),dy:Math.sin(a)*(15+Math.random()*75),
   age:0,life:.28+Math.random()*.48,color:kind==="danger"?"#ff7d62":kind==="tech"?"#bff3a9":"#8eeae2"});
 }
 if(particles.length>130)particles=particles.slice(-130);
}
function handleEvents(events){
 for(const ev of events){
  if(ev.type==="built"){flash("build",1);if(s.sound&&s.produced%4===0)ping(630,.08,"triangle",.02);}
  if(ev.type==="sold"&&s.sold%5===0){ping(790,.11,"sine",.017);}
  if(ev.type==="scene"){flash("tech",2);openScene();ping(400,.26,"sine");}
  if(ev.type==="crisis"){flash("danger",3);ping(180,.45,"sawtooth");activate("atelier",false);toast("ALERTE : réarmez les relais avant la fin du décompte !",true);}
  if(ev.type==="crisisFailed"){flash("danger",3);toast("Échec : atelier coupé pendant 18 secondes.",true);}
  if(ev.type==="market"){toast("MARCHÉ : "+marketName(s.market));}
  if(ev.type==="contract"){toast(ev.won?"Contrat rempli ! Bonus de données et de confiance.":"Contrat expiré : réputation pénalisée.",!ev.won);ping(ev.won?880:160,.18);}
  if(ev.type==="tech"){flash("tech",2);toast("R&D : "+E.TECHS.find(t=>t.id===ev.id).name+" déverrouillée.");ping(950,.2);}
   if(ev.type==="supply"){flash("build",2);toast("Approvisionnement livré : "+ev.count+" composants.");}
   if(ev.type==="breakdown"){flash("danger",3);toast("PANNE : l'usine a subi une usure excessive.",true);}
   if(ev.type==="payrollFailed"){toast("ALERTE SOCIALE : fonds insuffisants pour la paie !",true);}
  if(ev.type==="ending")showEnding();
 }
}
function marketName(id){return {stable:"STABLE",surge:"BOOM COMMERCIAL",shortage:"PÉNURIE",rival:"OFFENSIVE RIVALE"}[id]||"STABLE";}
function activate(panel,focus){
 activePanel=panel;
 for(const button of tabs){
  const current=button.dataset.panel===panel;
  button.classList.toggle("is-active",current);
  button.setAttribute("aria-selected",String(current));
  button.tabIndex=current?0:-1;
  if(current&&focus)button.focus();
 }
 for(const page of pages){
  const current=page.id==="page-"+panel;
  page.classList.toggle("is-active",current);page.hidden=!current;
 }
}
function buildTechCards(){
 for(const tech of E.TECHS){
  const button=document.createElement("button");
  button.type="button";button.className="tech-card";button.dataset.tech=tech.id;
  const group=document.createElement("span");group.className="tech-group";group.textContent=tech.track;
  const title=document.createElement("strong");title.textContent=tech.name;
  const summary=document.createElement("span");summary.className="tech-summary";summary.textContent=tech.desc;
  const price=document.createElement("span");price.className="tech-price";
  price.textContent=fmt(tech.cost)+" ¤"+(tech.data?" · "+tech.data+" données":"");
  button.append(group,title,summary,price);
  button.addEventListener("click",()=>{
   const outcome=E.buyTech(s,tech.id);
   if(!outcome.ok){toast(outcome.reason,true);ping(180,.13,"sawtooth");return;}
   ping(560,.15);toast("RECHERCHE LANCÉE — "+tech.name);render();
  });
  els.techCards.appendChild(button);
  techNodes.set(tech.id,{button,group,title,summary,price});
 }
}
function intel(){
 const last=s.history.find(row=>row.kind==="story");
 if(last)return last.text;
 if(s.storyIndex>=1)return "Les transmissions NORA ne suivent plus vos protocoles. Surveillez ses initiatives.";
 return "04:17 approche. Votre premier groupe de robots livrés déclenchera une transmission classifiée.";
}
function renderTech(){
 if(s.research){
  const tech=E.TECHS.find(t=>t.id===s.research.id);
  els.activeTech.hidden=false;
  setText(els.techInProgress,tech.name.toUpperCase()+" · "+Math.max(0,Math.ceil(s.research.duration-s.research.progress))+" S");
  setWidth(els.techFill,s.research.progress/s.research.duration*100);
  setText(els.labStatus,"R&D EN COURS");
 }else{els.activeTech.hidden=true;setText(els.labStatus,"LABO DISPONIBLE");}
 for(const tech of E.TECHS){
  const node=techNodes.get(tech.id),done=s.techs.includes(tech.id),
   inProgress=s.research?.id===tech.id,
   available=s.credits>=tech.cost&&s.data>=tech.data;
  const locked=!!tech.requires&&!s.techs.includes(tech.requires);
  node.button.classList.toggle("is-done",done);
  node.button.classList.toggle("is-researching",inProgress);
  node.button.setAttribute("aria-label",tech.name+" : "+(done?"acquise":inProgress?"en recherche":
    locked?"prérequis manquant":available?"disponible":"fonds ou données insuffisants"));
  // Aucune carte n'est recréée ni désactivée lors des variations de ressources.
  const label=done?"✓ ACQUISE":inProgress?"● RECHERCHE EN COURS":locked?"◌ PRÉREQUIS : "+
    E.TECHS.find(t=>t.id===tech.requires).name:fmt(tech.cost)+" ¤"+(tech.data?" · "+tech.data+" données":"");
  setText(node.price,label);
 }
}
function renderSignal(){
 const active=s.storyIndex>=1,full=s.signals>=3;
 const alignment=E.signalAlignment(s);
 const readyIn=Math.ceil(Math.max(0,s.scanReadyAt-s.time));
 const clues=[
  "Alignez le curseur sur la zone verte (80 à 100 %) puis capturez le signal.",
  "Fragment 1 : un relais caché réplique les décisions du laboratoire.",
  "Fragment 2 : le serveur ECHO a répondu avant votre premier allumage.",
  "Enquête complète : les preuves permettent d'envisager une autre fin."
 ];
 setText(els.signalCount,s.signals+" / 3 FRAGMENTS");
 setText(els.signalClue,clues[s.signals]);
 setText(els.signalPrecision,Math.round(alignment*100)+" % SYNCHRONISATION");
 setText(els.signalCooldown,full?"DÉCRYPTÉ":!active?"VERROUILLÉ":readyIn?"RECHARGE "+readyIn+" S":"PRÊT");
 const marker=(alignment*100).toFixed(1)+"%";
 if(els.signalMarker.style.left!==marker)els.signalMarker.style.left=marker;
 els.btnScan.disabled=!active||full||!!s.scene||s.ended||!s.running||readyIn>0||s.energy<8;
 setText(els.btnScan,full?"SIGNAL IDENTIFIÉ ✓":"CAPTURER LE SIGNAL ◎");
}
function renderContract(){
 const offer=E.getOffer(s),c=s.contract,next=E.CONTRACTS[s.contractIndex];
 setText(els.contractTag,c?"CONTRAT SIGNÉ":offer?"NOUVELLE OFFRE":"SURVEILLANCE");
 if(c){
  setText(els.contractTitle,c.title);
  setText(els.contractDescription,"Livrez les robots avant l'échéance. Chaque livraison est facturée à son départ du stock.");
  setText(els.contractUnits,(c.total-c.remaining)+" / "+c.total+" LIVRÉS");
  setText(els.contractDeadline,Math.ceil(c.deadline)+" S");
  els.contractProgress.hidden=false;setWidth(els.contractFill,(c.total-c.remaining)/c.total*100);
 }else{
  setText(els.contractTitle,next?next.title:"AUCUN CONTRAT RESTANT");
  setText(els.contractDescription,offer?"Les délais sont réels. Un échec entame la confiance et la réputation.":
   next?"Offre accessible à partir de "+next.minSold+" ventes.":"Tous les appels d'offres ont été traités.");
  setText(els.contractUnits,next?next.count+" ROBOTS":"—");
  setText(els.contractDeadline,next?next.limit+" S":"—");
  els.contractProgress.hidden=true;
 }
 els.btnAccept.hidden=!offer;els.btnReject.hidden=!offer;
}
function render(force=false){
 setText(els.statCredits,fmt(s.credits));
 setText(els.statEnergy,fmt(s.energy));
 setText(els.statSold,fmt(s.sold));
 setText(els.statData,fmt(s.data));
 setText(els.statThreat,String(Math.ceil(s.threat)).padStart(2,"0")+" /100");
 setText(els.statTrust,Math.floor(s.trust)+" %");
 setText(els.energyRegen,"+"+s.regen+" / SEC");
 setText(els.stockLine,s.stock+" EN STOCK");
 setText(els.researchLine,s.research?"RECHERCHE ACTIVE":"LABO DISPONIBLE");
 setWidth(els.threatFill,s.threat);setWidth(els.trustFill,s.trust);
 els.game.classList.toggle("is-danger",s.threat>=60||!!s.crisis);
 setText(els.headStatus,s.crisis?"ALERTE / INTERVENTION":s.scene?"TRANSMISSION ENTRANTE":
   s.ended?"SIMULATION TERMINÉE":s.running?"USINE EN SERVICE":"SIMULATION EN PAUSE");
 setText(els.btnPause,s.running?"Ⅱ PAUSE":s.scene?"◆ DÉCIDER":s.ended?"■ FIN":"▶ DÉMARRER");
 els.btnPause.disabled=!!s.scene||s.ended;
 const mission=E.mission(s),step=Math.min(s.storyIndex+1,12);
 setText(els.seasonLabel,mission.season||"ÉPILOGUE");
 setText(els.missionAct,String(step).padStart(2,"0"));
 setText(els.missionTitle,mission.title);
 setText(els.missionDetail,mission.detail);
 setText(els.missionCount,Math.min(s.sold,mission.target)+" / "+mission.target+" LIVRÉS");
 setWidth(els.missionFill,mission.percent*100);
 storyDots.forEach((item,i)=>{
  item.classList.toggle("is-current",i===s.storyIndex);
  item.classList.toggle("is-done",i<s.storyIndex);
  item.hidden=i<s.storyIndex-2||i>s.storyIndex+3;
 });
 setText(els.operationLabel,s.crisis?"DÉFAILLANCE":s.outage>0?"LIGNE COUPÉE":s.running?"PRODUCTION ACTIVE":"EN VEILLE");
 setText(els.marketBadge,"MARCHÉ "+marketName(s.market));
 setText(els.regionBadge,E.currentRegion(s).title);
 setText(els.materialsBadge,s.materials+" ◆");
 const mins=Math.floor(s.time/60),secs=Math.floor(s.time%60);
 setText(els.timeBadge,"T+ "+String(mins).padStart(2,"0")+":"+String(secs).padStart(2,"0"));
 setText(els.queueLine,s.queued+" / "+E.maxQueue(s)+" EN FILE");
 setWidth(els.beltFill,s.assembly*100);
 setText(els.stageStock,String(s.stock).padStart(2,"0"));
 setText(els.stageRate,(E.policy(s).rate*s.productionRate).toFixed(1)+"×");
 setText(els.stageDemand,E.demand(s).toFixed(2).replace(".",",")+"/s");
 setText(els.buildCost,fmt(E.buildCost(s))+" ¤ / "+E.buildEnergy(s)+" ⚡");
 setText(els.buildHint,"File : "+s.queued+"/"+E.maxQueue(s)+" • Composants : "+s.materials+" • Usure : "+Math.round(s.wear)+" %");
 setText(els.modeLabel,{normal:"STANDARD",rush:"SURCADENCE",safe:"SÉCURISÉ"}[s.mode]);
 for(const btn of modeButtons){const selected=btn.dataset.mode===s.mode;btn.classList.toggle("is-selected",selected);btn.setAttribute("aria-pressed",String(selected));}
 const gridPrice=s.regen<=6?68000:s.regen<=13?175000:430000;
 setText(els.gridCost,s.regen>=37?"Réseau au maximum": "Prochain palier : "+fmt(gridPrice)+" ¤");
 setText(els.gridTitle,"RÉSEAU : "+s.regen+" ÉNERGIE/S");
 els.buildGrid.disabled=s.regen>=37||s.credits<gridPrice||s.ended||!!s.scene;
 els.btnBailout.hidden=!!(s.bailoutCount>=2||s.stock||s.queued||
 (s.credits>=Math.max(E.buildCost(s),E.materialQuote(s).cost)&&s.materials>0));
 setText(els.canvasCaption,s.crisis?"SÉQUENCE DE RELAIS EN COURS":
  s.outage>0?"REMISE EN SERVICE : "+Math.ceil(s.outage)+" S":
  s.running?"TOUCHER L'ATELIER POUR COMMANDER UN ROBOT":"USINE EN VEILLE");
 els.crisisHud.hidden=!s.crisis;
 if(s.crisis){
  setText(els.crisisClock,Math.ceil(s.crisis.remaining)+" S");
  setText(els.crisisTitle,s.crisis.title);
  setText(els.crisisHint,s.crisis.hint);
  setText(els.crisisProgress,s.crisis.step+" / "+s.crisis.order.length+" RÉARMÉS");
  repairButtons.forEach((b,index)=>b.classList.toggle("is-done",s.crisis.order.indexOf(index)<s.crisis.step));
 }
 renderTech();
 renderContract();
 renderSignal();
 renderManagement();
 setText(els.intelText,intel());
 const key=s.history.length+"|"+(s.history[0]?.text||"");
 if(force||key!==lastLogKey){
  lastLogKey=key;
  for(let i=0;i<logNodes.length;i++)setText(logNodes[i],s.history[i]?.text||"");
  const storyHistory=s.history.filter(row=>row.kind==="story").slice(0,4);
  setText(els.opsFeed,s.storyIndex?"ARCHIVES / "+s.storyIndex+" TRANSMISSION(S)\n"+storyHistory.map((x,i)=>
    String(i+1).padStart(2,"0")+". "+x.text).join("\n"):"ARCHIVES / Aucune transmission classifiée pour l'instant.");
 }
}
function openScene(){
 const scene=E.getScene(s);
 if(!scene||sceneVisible===scene.id)return;
 sceneVisible=scene.id;
 setText(els.storyAct,scene.act);
 setText(els.storyHeading,scene.title);
 setText(els.storyDescription,scene.text);
 scene.choices.forEach((choice,index)=>{
  const btn=els["storyChoice"+index];
  setText(btn.querySelector("strong"),choice.name);
  setText(btn.querySelector("small"),choice.detail);
  btn.disabled=s.credits<choice.cost;
  btn.dataset.choice=choice.id;
 });
 els.storyOverlay.hidden=false;els.storyChoice0.disabled?els.storyChoice1.focus():els.storyChoice0.focus();
 render();
}
function chooseScene(id){
 if(!E.chooseScene(s,id)){toast("Vous ne disposez pas des crédits nécessaires.",true);return;}
 els.storyOverlay.hidden=true;sceneVisible="";
 if(s.ended)showEnding();
 else{s.running=true;lastSim=performance.now();}
 flash("tech",3);ping(740,.17);save(true);render(true);
}
function showEnding(){
 if(endVisible)return;endVisible=true;s.running=false;
 setText(els.endingHeading,s.threat>=70?"UNE NOUVELLE HIÉRARCHIE":"LE DESTIN DE NORA");
 setText(els.endingDescription,s.outcome||"Votre chronologie s'arrête ici.");
 setText(els.endingStats,s.sold+" ROBOTS LIVRÉS\n"+
  s.techs.length+" TECHNOLOGIES DÉVELOPPÉES\n"+s.stats.repairs+" RELAIS RÉARMÉS\n"+
  s.stats.contracts+" CONTRATS HONORÉS\nMENACE "+Math.round(s.threat)+
  "/100 · CONFIANCE "+Math.round(s.trust)+"/100");
 els.endingStats.style.whiteSpace="pre-line";
 els.endOverlay.hidden=false;save(true);els.btnRestart.focus();
}
function repair(station){
 const result=E.repair(s,station);
 if(!result.ok){toast(result.reason,true);ping(160,.14,"sawtooth");return;}
 flash("tech",2);ping(700+s.crisis?.step*150,.11);
 if(result.done){toast("RELAIS RÉARMÉS ! +9 données et +5 confiance.");ping(920,.3,"triangle");}
 render();
}
function restart(){
 if(!window.confirm("Recommencer une nouvelle chronologie ? La sauvegarde actuelle sera remplacée."))return;
s=E.create();storage("clear");els.btnLoad.disabled=true;els.btnLaunchResume.hidden=true;
 resetUi();els.launchScreen.hidden=false;render(true);
}
els.btnAudio.addEventListener("click",()=>setSound(!s.sound));
els.btnSave.addEventListener("click",()=>save(false));
els.btnLoad.addEventListener("click",load);
els.btnLaunchResume.addEventListener("click",load);
els.btnLaunch.addEventListener("click",()=>{
 els.launchScreen.hidden=true;s.running=true;lastSim=performance.now();
 E.note(s,"USINE INITIALISÉE — Vos quatre premières ventes déclencheront une transmission.");
 render(true);ping(680,.11);
});
els.btnPause.addEventListener("click",()=>{
 if(s.scene||s.ended)return;
 s.running=!s.running;lastSim=performance.now();render();
});
els.buildOne.addEventListener("click",()=>spendBuild(1));
els.buildThree.addEventListener("click",()=>spendBuild(3));
els.buildGrid.addEventListener("click",()=>{
 if(!E.upgradeGrid(s)){toast("Réseau indisponible : fonds insuffisants ou palier maximal.",true);return;}
 flash("tech",3);toast("Réseau renforcé : "+s.regen+" énergie/s.");render();
});
els.btnBailout.addEventListener("click",()=>{if(E.bailout(s)){toast("Financement d'urgence reçu. Votre confiance diminue.",true);render();}});
els.btnScan.addEventListener("click",()=>{
 const result=E.captureSignal(s);
 if(!result.ok){toast(result.reason,true);return;}
 flash(result.captured?"tech":"danger",2);
 ping(result.captured?850:210,result.captured?.25:.12,result.captured?"triangle":"sawtooth");
 toast(result.captured?"FRAGMENT "+result.fragments+"/3 DÉCHIFFRÉ : +6 données, +3 confiance.":
  "ÉCHEC DE SYNCHRONISATION : menace +1, recharge 7 s.",!result.captured);
 render();
});
els.btnAccept.addEventListener("click",()=>{if(E.acceptContract(s)){toast("Contrat accepté : respectez le délai !");ping(640,.13);render();}});
els.btnReject.addEventListener("click",()=>{if(E.rejectContract(s)){toast("Contrat reporté.");render();}});
els.storyChoice0.addEventListener("click",()=>chooseScene(els.storyChoice0.dataset.choice));
els.storyChoice1.addEventListener("click",()=>chooseScene(els.storyChoice1.dataset.choice));
els.btnRestart.addEventListener("click",restart);
for(const button of repairButtons)button.addEventListener("click",()=>repair(Number(button.dataset.repair)));
for(const button of modeButtons)button.addEventListener("click",()=>{
 if(E.setMode(s,button.dataset.mode)){ping(450,.1);render();}
});
tabs.forEach((button,index)=>{
 button.addEventListener("click",()=>activate(button.dataset.panel,false));
 button.addEventListener("keydown",event=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
  event.preventDefault();
  const next=event.key==="Home"?0:event.key==="End"?tabs.length-1:
   (index+(event.key==="ArrowRight"?1:tabs.length-1))%tabs.length;
  activate(tabs[next].dataset.panel,true);
 });
});
els.factory.addEventListener("pointerdown",event=>{
 if(s.scene||s.ended)return;
 if(s.crisis){
  const bounds=canvas.getBoundingClientRect();
  const px=(event.clientX-bounds.left)/bounds.width,py=(event.clientY-bounds.top)/bounds.height;
  if(py>.36&&py<.86){const distances=[.25,.5,.75].map(x=>Math.abs(x-px));
   const index=distances.indexOf(Math.min(...distances));repair(index);}
  return;
 }
 spendBuild(1);
});
els.storyOverlay.addEventListener("keydown",event=>{
 if(event.key!=="Tab")return;
 const buttons=[els.storyChoice0,els.storyChoice1].filter(b=>!b.disabled);
 if(buttons.length<2)return;
 if(event.shiftKey&&document.activeElement===buttons[0]){buttons[1].focus();event.preventDefault();}
 else if(!event.shiftKey&&document.activeElement===buttons[1]){buttons[0].focus();event.preventDefault();}
});
function sim(){
 const now=performance.now(),dt=Math.min((now-lastSim)/1000,.33);
 lastSim=now;
 if(s.running){const ev=E.tick(s,dt);handleEvents(ev);}
 if(now-lastUi>125){lastUi=now;render();}
}
setInterval(sim,100);
setInterval(()=>{if(!s.ended&&s.time>0)save(true);},14000);
window.addEventListener("pagehide",()=>{if(s.time>0)save(true);});
document.addEventListener("visibilitychange",()=>{lastSim=performance.now();});
window.addEventListener("keydown",event=>{
 if(event.repeat||event.target.closest?.("button")||s.scene||s.ended)return;
 if(event.code==="Space"){event.preventDefault();spendBuild(1);}
 if(s.crisis&&["Digit1","Digit2","Digit3"].includes(event.code)){
  event.preventDefault();repair(Number(event.code.slice(-1))-1);
 }
});
function resize(){
 const bounds=canvas.getBoundingClientRect();
 const w=Math.max(1,Math.floor(bounds.width)),h=Math.max(1,Math.floor(bounds.height));
 const dpr=Math.min(window.devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 return {w,h};
}
function rounded(x,y,w,h,r,color,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,Math.max(0,r));
 if(color){ctx.fillStyle=color;ctx.fill();}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function line(x1,y1,x2,y2,color="#284854",width=1){
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
 ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function robot(x,y,size,age,glow=false){
 const step=Math.sin(age*8)*size*.11;
 ctx.save();ctx.translate(x,y);
 ctx.shadowBlur=glow?18:5;ctx.shadowColor=glow?"#bffba5":"#5bb1b5";
 rounded(-size*.35,-size*.46,size*.7,size*.53,3,"#527b87","#92d1ce");
 rounded(-size*.26,-size*.88,size*.52,size*.4,3,"#bbc6ab","#d3f2c4");
 rounded(-size*.19,-size*.73,size*.12,size*.08,1,"#0d3038");
 rounded(size*.05,-size*.73,size*.12,size*.08,1,"#0d3038");
 rounded(-size*.39,-size*.02,size*.16,size*.42+step,2,"#8ba7a2");
 rounded(size*.22,-size*.02,size*.16,size*.42-step,2,"#8ba7a2");
 rounded(-size*.49,-size*.37,size*.13,size*.31,2,"#7a9fa5");
 rounded(size*.37,-size*.37,size*.13,size*.31,2,"#7a9fa5");
 line(0,-size*.9,0,-size,"#d6ed99",1.6);
 ctx.beginPath();ctx.arc(0,-size,2.5,0,Math.PI*2);ctx.fillStyle=glow?"#efffb4":"#9dd4d0";ctx.fill();
 ctx.restore();
}
function draw(now){
 if(document.hidden){requestAnimationFrame(draw);return;}
 if(now-lastFpsDraw<(reduced?100:26)){requestAnimationFrame(draw);return;}
 const dt=Math.min(.06,(now-prevFrame)/1000);prevFrame=now;lastFpsDraw=now;
 const {w,h}=resize();ctx.clearRect(0,0,w,h);
 animationTime+=reduced?0:dt*(s.running?1:.13);
 const a=animationTime,threat=s.threat;
 const bg=ctx.createLinearGradient(0,0,w,h);
 bg.addColorStop(0,threat>65?"#301a1d":"#102c39");bg.addColorStop(.65,"#112932");bg.addColorStop(1,"#07131b");
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Structure du hangar et perspective au sol.
 ctx.fillStyle="#10212c";ctx.fillRect(0,0,w,h*.63);
 for(let i=0;i<=12;i++){
  const x=i*w/12;
  line(x,0,x,h*.69,"#173945",i%3===0?2:1);
 }
 for(let j=0;j<10;j++){
  const y=j*h*.067;
  line(0,y,w,y,"#20434d",1);
 }
 const halo=ctx.createRadialGradient(w*.5,h*.22,8,w*.5,h*.22,w*.4);
 halo.addColorStop(0,threat>65?"#a84c3e33":"#64bbbf36");halo.addColorStop(1,"#00000000");
 ctx.fillStyle=halo;ctx.fillRect(0,0,w,h*.72);
 // Tuyaux de plafond.
 rounded(0,h*.1,w,h*.028,3,"#27434d","#42646b");
 rounded(0,h*.155,w,h*.014,2,"#11232e");
 for(let i=0;i<5;i++){const x=w*(.08+i*.21);
  rounded(x-6,0,12,h*.15,1,"#304d55");
  rounded(x-12,h*.13,24,5,1,"#58717a");
  const light=Math.sin(a*1.8+i*2)>0?"#d7fa9b":"#52746c";
  rounded(x-5,h*.14,10,4,1,light);
 }
 // Terminaux de contrôle.
 for(let i=0;i<4;i++){
  const x=w*(.08+i*.28);
  rounded(x,h*.24,w*.105,h*.18,4,"#06181f","#37616a");
  rounded(x+4,h*.25,w*.105-8,h*.145,1,"#173a44","#38747d");
  for(let j=0;j<5;j++){
   const xx=x+9+j*(w*.105-18)/4;
   const yy=h*.32+Math.sin(a*1.2+j+i)*h*.023;
   line(xx,h*.37,xx,yy,"#77cebd",1.7);
  }
 }
 // NORA : œil géométrique flottant, couleur sensible à la menace.
 ctx.save();ctx.translate(w*.53,h*.26);
 const size=Math.min(w*.115,h*.18);
 ctx.rotate(Math.PI/4+Math.sin(a*.22)*.04);
 ctx.shadowBlur=27;ctx.shadowColor=threat>65?"#fb7460":"#69dfc6";
 rounded(-size*.45,-size*.45,size*.9,size*.9,size*.1,"#214d55",threat>65?"#e47b68":"#8cdec2");
 ctx.rotate(-Math.PI/4);
 ctx.beginPath();ctx.arc(0,0,size*.22+Math.sin(a*2)*1.3,0,Math.PI*2);
 ctx.fillStyle=threat>65?"#ffa58a":"#dcffb5";ctx.fill();
 ctx.shadowBlur=0;ctx.restore();
 // Oscilloscope spatial : la modulation du halo suit la même précision que la commande Missions.
 if(s.storyIndex>0&&s.signals<3){
  const precision=E.signalAlignment(s);
  ctx.beginPath();ctx.arc(w*.53,h*.26,size*.9,-Math.PI/2,-Math.PI/2+Math.PI*2*precision);
  ctx.lineWidth=Math.max(2,size*.09);
  ctx.strokeStyle=precision>=.8?"#d7ff9b":"#5ba5a2";ctx.stroke();
  ctx.font="bold "+Math.max(10,Math.min(16,w*.019))+"px monospace";
  ctx.textAlign="center";ctx.fillStyle=precision>=.8?"#ecffc3":"#8bc3bf";
  ctx.fillText("SCAN "+Math.round(precision*100)+"%",w*.53,h*.26+size*1.35);
 }
 // Soubassement / convoyeur.
 const floor=ctx.createLinearGradient(0,h*.54,0,h);
 floor.addColorStop(0,"#143341");floor.addColorStop(1,"#07151e");
 ctx.fillStyle=floor;ctx.fillRect(0,h*.52,w,h*.48);
 for(let i=-8;i<14;i++){
  const x=w*(i/9),bottom=w*.5+(x-w*.5)*1.43;
  line(x,h*.57,bottom,h,"#264854",1);
 }
 for(let j=0;j<6;j++){
  const y=h*(.61+j*.07);
  line(0,y,w,y,"#2f5360",j===0?2:1);
 }
 // Fosse, rails, convoyeur animé.
 rounded(w*.06,h*.64,w*.88,h*.17,5,"#12242e","#436872");
 rounded(w*.07,h*.68,w*.86,h*.09,2,"#284650","#64878b");
 ctx.save();ctx.beginPath();ctx.rect(w*.07,h*.68,w*.86,h*.09);ctx.clip();
 for(let i=-2;i<26;i++){
  const move=(a*(s.running&&s.outage===0?38:5))%24;
  rounded(w*.07+i*24+move,h*.69,8,h*.08,1,"#456772");
 }
 ctx.restore();
 // Robot arms: articulation & soudage.
 const active=(s.queued>0&&s.outage===0),armAngle=active?Math.sin(a*3.8):Math.sin(a*.27)*.15;
 for(const frac of [.22,.78]){
  const x=w*frac,baseY=h*.38;
  rounded(x-16,h*.39,32,13,3,"#82989c","#bdd5c5");
  line(x,baseY,x+Math.sin(armAngle+frac)*w*.025,h*.51,"#7b9ca5",Math.max(7,w*.014));
  line(x+Math.sin(armAngle+frac)*w*.025,h*.51,x+Math.sin(armAngle+frac)*w*.063,h*.62,"#b9bbb0",Math.max(5,w*.011));
  const tipX=x+Math.sin(armAngle+frac)*w*.063,tipY=h*.62;
  rounded(tipX-6,tipY-3,12,7,2,"#c6d8c0");
  if(active&&Math.sin(a*17+frac)>0.45){
   ctx.shadowColor="#e1f2a9";ctx.shadowBlur=12;
   for(let j=0;j<6;j++){
    const px=tipX+Math.sin(a*12+j*7)*Math.min(18,w*.02);
    const py=tipY+Math.abs(Math.sin(a*9+j*4))*Math.min(23,h*.055);
    line(tipX,tipY,px,py,j%2?"#fcf1b7":"#7feae0",1.3);
   }ctx.shadowBlur=0;
  }
 }
 // Robots produits, leur avancement dépend de la simulation.
 const count=Math.min(6,s.stock+s.queued);
 for(let i=0;i<count;i++){
  const xx=w*(.13+((a*.09*(s.running?1:.05)+i*.168)% .74));
  const yy=h*.7;
  robot(xx,yy,Math.min(h*.19,w*.09,55),a+i,i===count-1&&s.techs.includes("autonomy"));
 }
 // Hall de stockage et compteur physique sur la droite.
 rounded(w*.84,h*.43,w*.14,h*.17,3,"#162d38","#5a7e81");
 ctx.fillStyle="#9fc8b3";ctx.font="bold "+Math.max(9,Math.min(13,w*.017))+"px monospace";ctx.textAlign="center";
 ctx.fillText("STOCK",w*.91,h*.49);ctx.fillStyle="#e1f9ab";
 ctx.font="bold "+Math.max(13,Math.min(23,w*.026))+"px monospace";ctx.fillText(String(s.stock).padStart(2,"0"),w*.91,h*.56);
 // Trois relais de crise directement dans la scène.
 if(s.crisis){
  const crisis=s.crisis;ctx.fillStyle="#ff9b8299";ctx.fillRect(0,0,w,h*.06);
  for(let i=0;i<3;i++){
   const x=w*(.25+i*.25),y=h*.56,done=crisis.order.indexOf(i)<crisis.step;
   ctx.shadowColor=done?"#6cedad":"#ff785f";ctx.shadowBlur=done?12:20;
   ctx.beginPath();ctx.arc(x,y,Math.min(24,h*.073)+Math.sin(a*8+i)*2,0,Math.PI*2);
   ctx.fillStyle=done?"#30694d":"#74372c";ctx.fill();
   ctx.lineWidth=2;ctx.strokeStyle=done?"#b4ffbf":"#ff9a7d";ctx.stroke();
   ctx.shadowBlur=0;ctx.fillStyle="#f3f2da";ctx.font="bold 15px monospace";
   ctx.textAlign="center";ctx.fillText(String(i+1),x,y+5);
  }
 }
 // Particules : leur DOM est inexistant, le GPU ne reçoit qu'un canvas.
 particles=particles.filter(p=>p.age<p.life);
 for(const p of particles){
  p.age+=dt;p.x+=p.dx*dt;p.y+=p.dy*dt+dt*12;
  ctx.globalAlpha=Math.max(0,1-p.age/p.life);ctx.fillStyle=p.color;
  ctx.fillRect(p.x,p.y,2.5,2.5);
 }ctx.globalAlpha=1;
 // Un voile discret indique une panne réelle.
 if(s.outage>0){ctx.fillStyle="#151d2499";ctx.fillRect(0,0,w,h);
  ctx.font="bold 15px monospace";ctx.textAlign="center";ctx.fillStyle="#ffb899";
  ctx.fillText("LIGNE HORS SERVICE / "+Math.ceil(s.outage)+" S",w*.5,h*.51);}
 requestAnimationFrame(draw);
}
buildTechCards();
els.btnLoad.disabled=!storage("read");
els.btnLaunchResume.hidden=els.btnLoad.disabled;
activate("atelier",false);
render(true);
requestAnimationFrame(draw);
window.RobotDominationV3={getState:()=>s,engine:E,render,activate,save,load};
})();
