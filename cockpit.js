/* Adaptation sans dépendances : desktop = vue simultanée ; mobile/tablette = onglets. */
(function () {
  "use strict";
  const tabs=[...document.querySelectorAll("[data-panel-tab]")];
  const panels=[...document.querySelectorAll("[data-view-panel]")];
  if (tabs.length!==3 || panels.length!==3) return;
  function activate(name,moveFocus) {
    for(const tab of tabs) {
      const active=tab.dataset.panelTab===name;
      tab.classList.toggle("is-active",active);
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active?0:-1;
      if(active && moveFocus)tab.focus();
    }
    for(const panel of panels)panel.classList.toggle("is-active",panel.dataset.viewPanel===name);
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener("click",()=>activate(tab.dataset.panelTab,false));
    tab.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();
      const next=event.key==="Home"?0:event.key==="End"?tabs.length-1:
        (index+(event.key==="ArrowRight"?1:tabs.length-1))%tabs.length;
      activate(tabs[next].dataset.panelTab,true);
    });
  });
  activate("production",false);
})();
