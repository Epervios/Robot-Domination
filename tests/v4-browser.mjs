/* ROBOT DOMINATION V4 : véritable essai Chromium desktop/mobile, sans serveur externe. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"artifacts-v4");
fs.mkdirSync(out,{recursive:true});
const types={".html":"text/html;charset=utf-8",".css":"text/css;charset=utf-8",".js":"text/javascript;charset=utf-8"};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
 const file=path.resolve(root,"."+pathname.replace(/\/$/,"/index.html"));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){
  res.writeHead(404);res.end("Not found");return;
 }
 res.setHeader("Content-Type",types[path.extname(file)]||"text/plain");
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
let page;
const errors=[];
try{
 page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
 page.on("pageerror",error=>errors.push(error.stack||error.message));
 await page.goto("http://127.0.0.1:"+server.address().port,{waitUntil:"load"});
 assert.equal(await page.locator("#btnLaunch").isVisible(),true);
 await page.locator("#btnLaunch").click();
 assert.equal(await page.locator("#launchScreen").isVisible(),false);
 assert.equal(await page.locator("[data-tech]").count(),17);
 assert.equal(await page.locator("[data-chapter]").count(),12);
 const start=await page.evaluate(()=>window.RobotDominationV4.getState());
 assert.equal(start.materials,24);
 await page.locator("#buildThree").click();
 const built=await page.evaluate(()=>({
  queued:window.RobotDominationV4.getState().queued,
  materials:window.RobotDominationV4.getState().materials
 }));
 assert.equal(built.queued,3);
 assert.equal(built.materials,21);
 await page.locator('[data-panel="recherche"]').click();
 await page.locator('[data-tech="servos"]').evaluate(node=>window.__cardIdentity=node);
 await page.locator('[data-tech="servos"]').click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().research?.id),"servos");
 await page.waitForTimeout(1450);
 assert.equal(await page.evaluate(()=>document.querySelector('[data-tech="servos"]')===window.__cardIdentity),true,
  "La carte de recherche a été recréée pendant sa progression !");
 await page.locator('[data-panel="atelier"]').click();
 await page.screenshot({path:path.join(out,"v4-desktop-factory.png"),animations:"disabled"});
 const desktop=await page.evaluate(()=>({
  vw:innerWidth,sw:document.documentElement.scrollWidth,
  action:document.querySelector("#buildOne").getBoundingClientRect().bottom,
  factory:document.querySelector("#factory").getBoundingClientRect().height
 }));
 assert.ok(desktop.sw<=desktop.vw+1,"Défilement horizontal sur 1366x768.");
 assert.ok(desktop.action<=768,"Fabriquer inaccessible sur 1366x768.");
 assert.ok(desktop.factory>150);
 console.log("PASS DESKTOP : cockpit 1366×768, usine Canvas et 17 cartes R&D stables.");

 await page.locator('[data-panel="strategie"]').click();
 assert.equal(await page.locator("#page-strategie").isVisible(),true);
 assert.equal(await page.locator("#resourceMaterials").textContent(),"21 ◆");
 const beforeCost=await page.evaluate(()=>window.RobotDominationV4.getState().credits);
 await page.locator('[data-supply="standard"]').click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().supply?.type),"standard");
 assert.ok(await page.evaluate(()=>window.RobotDominationV4.getState().credits)<beforeCost);
 assert.equal(await page.locator("#supplyProgress").isVisible(),true);
 const cards=await page.locator(".region-options [data-region]").count();
 assert.equal(cards,3);
 await page.screenshot({path:path.join(out,"v4-desktop-management.png"),animations:"disabled"});
 console.log("PASS GESTION : achat de composants, convoi différé, suivi et trois marchés.");

 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-panel="atelier"]').click();
 await page.waitForTimeout(200);
 const mobile=await page.evaluate(()=>({
  width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
  vw:innerWidth,vh:innerHeight,
  action:document.querySelector("#buildOne").getBoundingClientRect().bottom
 }));
 assert.ok(mobile.width<=mobile.vw+1,"Défilement horizontal sur mobile.");
 assert.ok(mobile.height<=mobile.vh+1,"Page entière hors viewport mobile.");
 assert.ok(mobile.action<=844,"Bouton de production hors écran mobile.");
 await page.screenshot({path:path.join(out,"v4-mobile-factory.png"),animations:"disabled"});
 await page.locator('[data-panel="strategie"]').click();
 await page.screenshot({path:path.join(out,"v4-mobile-management.png"),animations:"disabled"});
 assert.equal(await page.locator("#page-strategie").isVisible(),true);
 console.log("PASS MOBILE : 390×844, navigation 4 onglets, usine et gestion accessibles.");

 // Vérifier une scène longue, un choix dans la troisième colonne et sa vraie conséquence.
 await page.evaluate(()=>{
  const s=window.RobotDominationV4.getState();
  s.storyIndex=0;s.sold=4;s.scene=null;s.crisis=null;s.running=true;
 });
 await page.waitForTimeout(320);
 assert.equal(await page.locator("#storyOverlay").isVisible(),true);
 assert.equal(await page.locator("#storyChoice2").isVisible(),true);
 assert.equal(await page.locator("#storySpeaker").textContent(),"NORA-7");
 await page.screenshot({path:path.join(out,"v4-mobile-story.png"),animations:"disabled"});
 await page.locator("#storyChoice2").click();
 assert.equal(await page.locator("#storyConsequence").isVisible(),true);
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().flags.signal),"trace");
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().running),false);
 await page.screenshot({path:path.join(out,"v4-mobile-consequence.png"),animations:"disabled"});
 await page.locator("#storyContinue").click();
 assert.equal(await page.locator("#storyOverlay").isVisible(),false);
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().running),true);
 console.log("PASS RÉCIT : 3 choix, voix des personnages, conséquences affichées et reprise maîtrisée.");

 // Puzzle avancé à cinq relais ; il doit rester utilisable au doigt et sans clignotement.
 await page.evaluate(()=>{
  const s=window.RobotDominationV4.getState();
  s.storyIndex=8;s.sold=213;s.scene=null;s.crisis=null;
  s.crisesDone=window.RobotDominationV4.engine.CRISES.slice(0,5).map(c=>c.id);
  s.energy=200;s.running=true;
 });
 await page.waitForTimeout(320);
 assert.equal(await page.locator("#crisisHud").isVisible(),true);
 assert.match(await page.locator("#crisisProgress").textContent(),/5 RÉARMÉS/);
 await page.screenshot({path:path.join(out,"v4-mobile-five-relays.png"),animations:"disabled"});
 for(const station of [0,1,2,0,2])await page.locator('[data-repair="'+station+'"]').click();
 assert.equal(await page.locator("#crisisHud").isVisible(),false);
 console.log("PASS TACTIQUE : intervention à cinq relais et retour normal de l'usine.");

 // Scanner + reprise indépendante de la V3.
 await page.evaluate(()=>{
  const s=window.RobotDominationV4.getState(),engine=window.RobotDominationV4.engine;
  s.storyIndex=1;s.sold=16;s.scene=null;s.crisis=null;s.crisesDone=engine.CRISES.map(c=>c.id);
  s.signals=0;s.scanReadyAt=0;s.energy=200;s.running=true;
  for(let i=0;i<150&&engine.signalAlignment(s)<.99;i++)s.time+=.04;
 });
 await page.locator('[data-panel="operations"]').click();
 await page.locator("#btnScan").click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().signals),1);
 await page.locator("#btnSave").click();
 await page.reload({waitUntil:"load"});
 assert.equal(await page.locator("#btnLaunchResume").isVisible(),true);
 await page.locator("#btnLaunchResume").click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV4.getState().signals),1);
 assert.deepEqual(errors,[],"Exceptions JS : "+errors.join("\n"));
 console.log("PASS : scanner ECHO, sauvegarde/restauration distincte de la V3, aucune exception.");
 console.log("CAPTURES : "+fs.readdirSync(out).join(", "));
}catch(error){
 if(page)await page.screenshot({path:path.join(out,"v4-error.png")}).catch(()=>{});
 console.error("ECHEC BROWSER V4:",error.stack);
 if(errors.length)console.error("JAVASCRIPT:",errors.join("\n"));
 process.exitCode=1;
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
