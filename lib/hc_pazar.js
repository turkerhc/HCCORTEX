/* HCCORTEX · lib/hc_pazar.js — BIST · NASDAQ · Emtia = KRİPTO ANA SAYFASININ AYNASI (v3 · 19.11.2026)
   Türker (19.11): "Kripto sekmesinde ne görüyorsan BIST, NASDAQ ve Emtia'da da aynı olacak — hesaplamalar, görünüş, butonlar, kartlar."
   Her pazar, AYNI sayfanın ?pz=<pazar> kopyası olarak üst çubuğun altında çerçevede açılır. Sayfa ?pz ile açılınca
   veri_<pazar>.json'u (pazar_motor.py · aynı CORTEX motoru) okur, kriptoya özgü panelleri gizler. ORBIT'te de aynısı (app.html?pz=…).
   Çerçeveler bir kez kurulur, sekmeler arası geçişte saklanır (yeniden yüklenmez). */
(function(){
  const FR={}; let son=null, css=false;
  function stil(){ if(css) return; css=true; const st=document.createElement('style'); st.id='hcpz-css';
    st.textContent='.pzF{position:fixed;left:0;right:0;width:100%;border:0;z-index:40;background:var(--bg,#04060c)}.pzF[hidden]{display:none}'
      +'html.pz-acik main,html.pz-acik #sekme,html.pz-acik footer,html.pz-acik [data-sek],html.pz-acik #yb{display:none!important}html.pz-acik,html.pz-acik body{overflow:hidden}';
    document.head.appendChild(st);
    addEventListener('resize',()=>setTimeout(konum,60)); if(window.visualViewport) visualViewport.addEventListener('resize',()=>setTimeout(konum,60)); }
  function konum(){ const F=son&&FR[son]; if(!F) return; const h=document.querySelector('header'); const t=h?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0;
    F.style.top=t+'px'; F.style.height=Math.max(200,(window.visualViewport?visualViewport.height:innerHeight)-t)+'px'; }
  function ac(pz){ stil(); Object.keys(FR).forEach(k=>{ FR[k].hidden=k!==pz; });
    let F=FR[pz]; if(!F){ F=document.createElement('iframe'); F.className='pzF'; F.title=pz.toUpperCase(); F.setAttribute('allow','clipboard-write');
      F.src=location.pathname+'?pz='+encodeURIComponent(pz); document.body.appendChild(F); FR[pz]=F; }
    F.hidden=false; son=pz; document.documentElement.classList.add('pz-acik'); konum(); requestAnimationFrame(konum); }
  function kapat(){ Object.values(FR).forEach(F=>F.hidden=true); document.documentElement.classList.remove('pz-acik'); son=null; }
  window.HCPZ={ac,kapat,konum};
})();
