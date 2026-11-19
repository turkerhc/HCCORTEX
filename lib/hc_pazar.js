/* HCCORTEX · lib/hc_pazar.js — BIST · NASDAQ · Emtia ANA SAYFALARI (CORTEX ve ORBIT ortak · v1 · 19.11.2026)
   Türker: Kripto sekmesi CORTEX'teki gibi; BIST · NASDAQ · Emtia eski ORBIT'teki ana sayfalar gibi — iki uygulamada da.
   app_pazar.html (web/pazar_uret.py · eski ORBIT'ten üretilir) üst çubuğun altında çerçevede açılır; veri postMessage ile gider.
   Reaktör: CORTEX içinde CORTEX reaktörü, ORBIT içinde ORBIT reaktörü (Türker 19.11).
   Gizlilik: hüküm metni → yalnız up/warn/down · plan / gerekçe / stop / hedef / RR / 'fırsat' listesi / SMA200 bayrakları ÇERÇEVEYE GİTMEZ
   (app_web.uret ve orbit_d._borsa ile aynı beyaz liste). */
(function(){
  const NI=location.origin;
  let F=null, hazir=false, bek=null, son=null;
  const hy=h=>{ const t=String(h||'').toUpperCase(); if(/ALINMAZ|SAT|ÇIK/.test(t)) return 'down'; if(/IZLE|İZLE/.test(t)||!t.trim()) return 'warn'; return 'up'; };
  function suz(B){ B=JSON.parse(JSON.stringify(B||{})); const R={};
    ['v','ts','tarih','n','piyasa','hisse','sinyal','yukselen','dusen','test','ek'].forEach(k=>{ if(B[k]!==undefined) R[k]=B[k]; });
    if(B.emtia) R.emtia=Object.assign({},B.emtia,{ts:B.ts,tarih:B.emtia.tarih||B.tarih});
    const NQ=B.nasdaq; if(NQ&&NQ.hisse){ R.nasdaq={ts:B.ts}; ['v','tarih','n','beklenen','piyasa','hisse','sinyal','yukselen','dusen','test'].forEach(k=>{ if(NQ[k]!==undefined) R.nasdaq[k]=NQ[k]; }); }
    [R,R.nasdaq||{}].forEach(P=>{
      ['hisse','ek'].forEach(g=>Object.values(P[g]||{}).forEach(h=>{ if(!h||typeof h!=='object') return; if('h' in h){ h.hy=hy(h.h); delete h.h; } ['plan','sebep','aks','st','hd','rr'].forEach(a=>delete h[a]); }));
      const S=P.sinyal||{}; delete S.firsat; Object.values(S).forEach(L=>(L||[]).forEach(r=>{ if(r&&typeof r==='object') delete r.sebep; }));
      const pp=P.piyasa||{}; delete pp.xu_s200; delete pp.end_s200; });
    return R; }
  function veri(J,o){ const b=suz((J&&J.b)||J); const em=b.emtia||null, nq=b.nasdaq||null; delete b.emtia; delete b.nasdaq;
    return {bist:b,nasdaq:nq,emtia:em,loki_pz:(J&&J.lp)||(o&&o.loki_pz)||null,haber_pz:(o&&o.haber)||null,ts:b.ts,coin:{},kapi:{},piyasa:{},sinyal:{}}; }
  function konum(){ if(!F) return; const h=document.querySelector('header'); const t=h?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0; F.style.top=t+'px'; F.style.height=Math.max(200,(window.visualViewport?visualViewport.height:innerHeight)-t)+'px'; }
  function cerceve(){ if(F) return F;
    const st=document.createElement('style'); st.id='hcpz-css';
    st.textContent='#pzF{position:fixed;left:0;right:0;width:100%;border:0;z-index:40;background:var(--bg,#04060c)}#pzF[hidden]{display:none}'
      +'html.pz-acik main,html.pz-acik #sekme,html.pz-acik footer,html.pz-acik [data-sek],html.pz-acik #yb{display:none!important}html.pz-acik,html.pz-acik body{overflow:hidden}';
    document.head.appendChild(st);
    F=document.createElement('iframe'); F.id='pzF'; F.title='Piyasa'; F.hidden=true; F.setAttribute('allow','clipboard-write');
    F.src='app_pazar.html?v=1#gomulu'; document.body.appendChild(F);
    addEventListener('message',e=>{ if(e.origin!==NI||e.source!==F.contentWindow) return; if((e.data||{}).orbit==='hazir'){ hazir=true; if(bek){ F.contentWindow.postMessage(bek,NI); bek=null; } } });
    addEventListener('resize',()=>setTimeout(konum,60)); if(window.visualViewport) visualViewport.addEventListener('resize',()=>setTimeout(konum,60)); return F; }
  function gonder(m){ if(!hazir){ bek=m; return; } F.contentWindow.postMessage(m,NI); }
  function ac(pz,J,o){ cerceve(); F.hidden=false; document.documentElement.classList.add('pz-acik'); konum(); requestAnimationFrame(konum);
    const ana=son!==pz; son=pz;
    gonder({orbit:'veri',pz,ana,reaktor:document.documentElement.dataset.mod==='orbit'?'orbit':'cortex',A:veri(J,o||{}),ad:(o&&o.ad)||'',tema:document.documentElement.dataset.theme==='light'?'acik':'koyu'}); }
  function kapat(){ if(F) F.hidden=true; document.documentElement.classList.remove('pz-acik'); son=null; }
  window.HCPZ={ac,kapat,konum,veri};
})();
