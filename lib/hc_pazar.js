/* HCCORTEX · lib/hc_pazar.js — BIST · NASDAQ · Emtia = KRİPTO ANA SAYFASININ AYNASI (v4 · 20.11.2026)
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
  function kur(pz){ stil(); let F=FR[pz]; if(!F){ F=document.createElement('iframe'); F.className='pzF'; F.title=pz.toUpperCase(); F.setAttribute('allow','clipboard-write');
      F.hidden=true; F.src=location.pathname+'?pz='+encodeURIComponent(pz); document.body.appendChild(F); FR[pz]=F; } return F; }
  function ac(pz){ stil(); Object.keys(FR).forEach(k=>{ FR[k].hidden=k!==pz; });
    const F=kur(pz);
    F.hidden=false; son=pz; document.documentElement.classList.add('pz-acik'); konum(); requestAnimationFrame(konum);
    [80,400].forEach(t=>setTimeout(()=>{ try{ F.contentWindow.dispatchEvent(new Event('resize')); }catch(_){} },t)); }   /* 20.11 · gizli yüklenen çerçevede reaktör/grafikler kendini ölçsün */
  function kapat(){ Object.values(FR).forEach(F=>F.hidden=true); document.documentElement.classList.remove('pz-acik'); son=null;
    [80,400].forEach(t=>setTimeout(()=>dispatchEvent(new Event('resize')),t)); }   /* 20.11 · Kripto'ya dönünce ana sayfa reaktörü kendini ölçsün */
  /* 19.11 · Türker: sekme geçişinde açılış ekranı görünmesin → üç pazar ana sayfa açıldıktan sonra arka planda sırayla hazırlanır */
  function onYukle(){ if(window.top!==window.self||new URLSearchParams(location.search).get('pz')) return;
    const L=['bist','nasdaq','emtia']; let i=0; const sira=()=>{ if(i>=L.length) return; kur(L[i++]); setTimeout(sira,2500); };
    const bas=()=>setTimeout(sira,3000); if(document.readyState==='complete') bas(); else addEventListener('load',bas,{once:true}); }
  onYukle();
  window.HCPZ={ac,kapat,konum,kur};
})();
