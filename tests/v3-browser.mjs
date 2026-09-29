/* Parcours V3 dans un vrai navigateur Chromium : desktop, mobile, tactique. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const out=path.join(root,"artifacts");
fs.mkdirSync(out,{recursive:true});
const types={".html":"text/html;charset=utf-8",".css":"text/css;charset=utf-8",".js":"text/javascript;charset=utf-8"};
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
 const location=path.resolve(root,"."+relative.replace(/\/$/,"/index.html"));
 if(!location.startsWith(root+path.sep)||!fs.existsSync(location)||fs.statSync(location).isDirectory()){
   res.writeHead(404);res.end();return;
 }
 res.setHeader("Content-Type",types[path.extname(location)]||"text/plain");
 res.end(fs.readFileSync(location));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
let page;
const errors=[];
try{
 page=await browser.newPage({viewport:{width:1366,height:768}});
 page.on("pageerror",error=>errors.push(error.message));
 await page.goto("http://127.0.0.1:"+server.address().port,{waitUntil:"load"});
 await page.locator("#btnLaunch").click();
 assert.equal(await page.locator("#launchScreen").isVisible(),false);
 assert.equal(await page.locator("[data-tech]").count(),8);
 await page.locator("#buildThree").click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV3.getState().queued),3);
 await page.locator('[data-panel="recherche"]').click();
 await page.locator('[data-tech="servos"]').evaluate(node=>window.__cardIdentity=node);
 await page.locator('[data-tech="servos"]').click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV3.getState().research?.id),"servos");
 await page.waitForTimeout(1600);
 assert.equal(await page.evaluate(()=>document.querySelector('[data-tech="servos"]')===window.__cardIdentity),true,
  "Une carte est reconstruite pendant la recherche.");
 assert.equal(await page.locator("#activeTech").isVisible(),true);
 await page.locator('[data-panel="atelier"]').click();
 await page.screenshot({path:path.join(out,"v3-desktop.png"),animations:"disabled"});
 const desktop=await page.evaluate(()=>({width:document.documentElement.scrollWidth,
   viewport:innerWidth,build:document.querySelector("#buildOne").getBoundingClientRect().bottom}));
 assert.ok(desktop.width<=desktop.viewport+1);
 assert.ok(desktop.build<=768);
 console.log("PASS : cockpit 1366×768, R&D sans remontage.");

 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(250);
 const mobile=await page.evaluate(()=>({width:document.documentElement.scrollWidth,
   height:document.documentElement.scrollHeight,vw:innerWidth,vh:innerHeight,
   build:document.querySelector("#buildOne").getBoundingClientRect().bottom}));
 assert.ok(mobile.width<=mobile.vw+1,"Défilement horizontal mobile");
 assert.ok(mobile.height<=mobile.vh+1,"Défilement vertical de la page mobile");
 assert.ok(mobile.build<=844,"Commande de fabrication hors écran");
 await page.locator('[data-panel="recherche"]').click();
 assert.equal(await page.locator("#page-recherche").isVisible(),true);
 assert.equal(await page.locator("[data-tech]").count(),8);
 await page.locator('[data-tech="battery"]').evaluate(node=>window.__mobileCard=node);
 await page.waitForTimeout(450);
 assert.equal(await page.evaluate(()=>document.querySelector('[data-tech="battery"]')===window.__mobileCard),true);
 await page.locator('[data-panel="atelier"]').click();
 await page.screenshot({path:path.join(out,"v3-mobile.png"),animations:"disabled"});
 console.log("PASS : cockpit 390×844, navigation et cartes tactiles stables.");

 await page.evaluate(()=>{
  const s=window.RobotDominationV3.getState();
  s.storyIndex=1;s.sold=10;s.scene=null;s.crisesDone=[];s.running=true;s.energy=150;
 });
 await page.waitForTimeout(300);
 assert.equal(await page.locator("#crisisHud").isVisible(),true);
 await page.screenshot({path:path.join(out,"v3-crisis-mobile.png"),animations:"disabled"});
 for(const station of [1,0,2])await page.locator('[data-repair="'+station+'"]').click();
 assert.equal(await page.evaluate(()=>window.RobotDominationV3.getState().stats.repairs),3);
 assert.equal(await page.locator("#crisisHud").isVisible(),false);
 assert.deepEqual(errors,[]);
 console.log("PASS : intervention tactile, 3 relais, aucune erreur JavaScript.");
 console.log("CAPTURES : v3-desktop.png, v3-mobile.png, v3-crisis-mobile.png.");
}catch(error){
 if(page)await page.screenshot({path:path.join(out,"v3-error.png")}).catch(()=>{});
 console.error(error.stack);process.exitCode=1;
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
