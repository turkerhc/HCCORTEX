/* HC · hc_borsa.js v1 (19.11.2026) — BIST · NASDAQ · Emtia ekranları, ORTAK katman.
   CORTEX ana üs: mod 'cortex' (tam teknik detay). ORBIT ileride aynı dosyayı mod 'orbit' ile kullanacak
   (orada hüküm/plan/stop/hedef/gösterge adları GİZLİ — yatırım tavsiyesi yok). © Türker HC */
(function(){
"use strict";
let O={mod:'cortex'}, J=null, PZ='bist', ARAMA='', SIRA='d', FILT='hep', EK=false, YIGIN=[];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kl=v=>v==null?'':v>0?'hb-up':v<0?'hb-dn':'';
const pc=(v,n=1)=>v==null?'—':(v>0?'+':v<0?'−':'')+'%'+Math.abs(v).toLocaleString('tr-TR',{minimumFractionDigits:n,maximumFractionDigits:n});
function px(v){ if(v==null) return '—'; const a=Math.abs(v);
  if(a>=1000) return v.toLocaleString('tr-TR',{maximumFractionDigits:0});
  if(a>=1) return v.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:a>=100?2:3});
  return v.toLocaleString('tr-TR',{maximumSignificantDigits:4}); }
const CX=()=>O.mod==='cortex';
const PB=pz=>pz==='bist'?'₺':'$';
const PZAD={bist:'BIST',nasdaq:'NASDAQ',emtia:'Emtia'};

function css(){ if(document.getElementById('hbCss')) return; const s=document.createElement('style'); s.id='hbCss'; s.textContent=`
.hb{--hl:var(--line,rgba(140,160,200,.18));--hp:var(--panel2,rgba(255,255,255,.03))}
.hb h2{margin:0;font:700 13px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2)}
.hb .hb-ust{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.hb .hb-ust small{color:var(--ink3);font-size:11.5px}
.hb-tl{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px;margin:0 0 14px}
.hb-t{border:1px solid var(--hl);border-radius:12px;padding:9px 11px;background:var(--hp);cursor:pointer}
.hb-t small{display:block;font-size:10.5px;color:var(--ink3);letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hb-t b{display:block;font:700 15px "JetBrains Mono",monospace;margin:2px 0}.hb-t span{font-size:11.5px}
.hb-up{color:var(--up,#2cf2a6)}.hb-dn{color:var(--down,#ff4d7a)}.hb-wn{color:var(--warn,#ffc24a)}.hb-dm{color:var(--ink3)}
.hb-rz{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.hb-rz span{border:1px solid var(--hl);border-radius:999px;padding:5px 10px;font-size:12px;background:var(--hp)}
.hb-lk{display:flex;gap:10px;border:1px solid var(--hl);border-radius:14px;padding:11px 12px;margin:0 0 14px;background:var(--hp)}
.hb-lk img{width:34px;height:34px;border-radius:50%;flex:none;border:1.5px solid var(--cyan,#38d8ff);object-fit:cover}
.hb-lk small{display:block;font:700 10px "JetBrains Mono",monospace;letter-spacing:.14em;color:var(--ink3);margin-bottom:3px}
.hb-lk p{margin:0 0 5px;font-size:13px;line-height:1.5}.hb-lk p:last-child{margin:0}
.hb-lk details summary{cursor:pointer;list-style:none;font-size:13px;line-height:1.5}.hb-lk details summary::-webkit-details-marker{display:none}
.hb-lk details summary::after{content:' ▾';color:var(--ink3)}.hb-lk details[open] summary::after{content:' ▴'}
.hb-sg{margin:0 0 14px}.hb-sg h3{margin:0 0 6px;font:700 10.5px "JetBrains Mono",monospace;letter-spacing:.12em;color:var(--ink3);text-transform:uppercase}
.hb-cp{display:flex;gap:6px;flex-wrap:wrap}.hb-cp button{border:1px solid var(--hl);background:var(--hp);color:var(--ink);border-radius:999px;padding:5px 10px;font:600 12px "JetBrains Mono",monospace;cursor:pointer}
.hb-cp button i{font-style:normal;color:var(--ink3);margin-left:5px;font-weight:500}
.hb-ar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px}
.hb-ar input{flex:1 1 160px;min-width:0;border:1px solid var(--hl);background:var(--hp);color:var(--ink);border-radius:10px;padding:8px 10px;font-size:14px}
.hb-ar select,.hb-ar button{border:1px solid var(--hl);background:var(--hp);color:var(--ink);border-radius:10px;padding:7px 9px;font-size:12.5px;cursor:pointer}
.hb-ar button.on{border-color:var(--cyan,#38d8ff);color:var(--cyan,#38d8ff)}
.hb-tb{width:100%;border-collapse:collapse;font-size:13px}
.hb-tb th{font:600 10px "JetBrains Mono",monospace;letter-spacing:.08em;color:var(--ink3);text-align:right;padding:6px 6px;border-bottom:1px solid var(--hl);text-transform:uppercase;white-space:nowrap}
.hb-tb th:first-child,.hb-tb td:first-child{text-align:left}
.hb-tb td{padding:8px 6px;border-bottom:1px solid var(--hl);text-align:right;white-space:nowrap;font-family:"JetBrains Mono",monospace;font-size:12.5px}
.hb-tb tr[data-hb]{cursor:pointer}.hb-tb tr[data-hb]:hover td{background:var(--hp)}
.hb-tb td:first-child b{font-size:13px}.hb-tb td:first-child small{display:block;color:var(--ink3);font:400 11px system-ui,sans-serif;max-width:150px;overflow:hidden;text-overflow:ellipsis}
.hb-gc{display:inline-flex;gap:2px;vertical-align:middle}.hb-gc i{width:5px;height:11px;border-radius:2px;background:var(--hl)}.hb-gc i.on{background:var(--up,#2cf2a6)}
.hb-h{font:600 11px system-ui,sans-serif}
.hb-dev{text-align:center;margin:10px 0 0}.hb-dev button{border:1px solid var(--hl);background:var(--hp);color:var(--ink);border-radius:10px;padding:8px 14px;cursor:pointer}
@media(max-width:600px){.hb-tb .hb-x{display:none}.hb-tb td:first-child small{max-width:110px}}
#hbM{position:fixed;inset:0;z-index:76;background:rgba(3,6,14,.62);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:max(14px,env(safe-area-inset-top)) 10px 30px}
#hbM[hidden]{display:none}
#hbM .hbm-k{position:relative;width:min(760px,100%);background:var(--bg2,#0b1120);border:1px solid var(--hl);border-radius:18px;padding:52px 16px 18px;color:var(--ink)}
#hbM .hbm-g,#hbM .hbm-x{position:absolute;top:10px;border:1px solid var(--hl);background:var(--hp);color:var(--ink);border-radius:999px;height:34px;cursor:pointer;font-size:14px}
#hbM .hbm-g{left:10px;padding:0 12px}#hbM .hbm-x{right:10px;width:34px;font-size:18px}
.hbm-bs{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
.hbm-bs h3{margin:0;font:700 20px "JetBrains Mono",monospace}.hbm-bs small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px}
.hbm-bs .hbm-f{text-align:right}.hbm-bs .hbm-f b{display:block;font:700 20px "JetBrains Mono",monospace}
.hbm-gr{position:relative;height:280px;margin:6px 0 4px;border:1px solid var(--hl);border-radius:14px;overflow:hidden}
.hbm-gr .hbm-lw{position:absolute;inset:0}.hbm-gr svg{position:absolute;inset:0;width:100%;height:100%}
.hbm-ip{font-size:12px;color:var(--ink2);min-height:18px;margin:0 2px 10px}
.hbm-cips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.hbm-cips span{border:1px solid var(--hl);border-radius:10px;padding:6px 9px;font-size:12px;background:var(--hp)}
.hbm-cips span b{display:block;font:700 13.5px "JetBrains Mono",monospace;margin-top:1px}
.hbm-bl{font:700 10px "JetBrains Mono",monospace;letter-spacing:.14em;color:var(--ink3);margin:16px 0 7px;text-transform:uppercase}
.hbm-hk{border:1px solid var(--hl);border-radius:14px;padding:11px 12px;background:var(--hp);margin:0 0 10px}
.hbm-hk b.hbm-hh{font-size:15px}.hbm-hk p{margin:5px 0 0;font-size:13px;line-height:1.5;color:var(--ink2)}
.hbm-gk{display:flex;gap:6px;flex-wrap:wrap}.hbm-gk span{font-size:11.5px;border-radius:999px;padding:4px 9px;border:1px solid var(--hl)}
.hbm-gk span.e{border-color:rgba(44,242,166,.45);color:var(--up,#2cf2a6)}.hbm-gk span.n{border-color:rgba(255,77,122,.45);color:var(--down,#ff4d7a)}.hbm-gk span.k{color:var(--ink3)}
.hbm-tm table{width:100%;border-collapse:collapse;font-size:12.5px}.hbm-tm th,.hbm-tm td{padding:5px 4px;border-bottom:1px solid var(--hl);text-align:right;white-space:nowrap}
.hbm-tm th:first-child,.hbm-tm td:first-child{text-align:left}.hbm-tm th{font-size:10.5px;color:var(--ink3);font-weight:600}
.hbm-tm .kr{display:grid;grid-template-columns:10px 1fr;gap:8px 9px;align-items:start}
.hbm-tm .kr i{width:10px;height:10px;border-radius:50%;margin-top:4px;background:var(--ink3)}.hbm-tm .kr i.up{background:var(--up,#2cf2a6)}.hbm-tm .kr i.warn{background:var(--warn,#ffc24a)}.hbm-tm .kr i.down{background:var(--down,#ff4d7a)}.hbm-tm .kr i.cyan{background:var(--cyan,#38d8ff)}
.hbm-tm .kr b{font-size:13px}.hbm-tm .kr small{display:block;color:var(--ink3);font-size:12px;line-height:1.4}
.hbm-tm tr.ben td{font-weight:700}
.hbm-bar{display:flex;align-items:flex-end;gap:6px;height:70px}.hbm-bar i{flex:1;background:var(--cyan,#38d8ff);opacity:.7;border-radius:4px 4px 0 0}.hbm-bar i.n{background:var(--down,#ff4d7a)}
.hbm-tp{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--hl);border-radius:999px;padding:4px 10px 4px 4px;font-size:12px;margin-top:6px;background:var(--hp)}
.hbm-tp b{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;font:700 12px "JetBrains Mono",monospace;color:#061018}
`; document.head.appendChild(s); }

/* ---- veri erişimi ---- */
const B=()=>(J&&J.b)||{};
function pzVeri(pz){ const b=B(); if(pz==='bist') return {hisse:b.hisse||{},ek:b.ek||{},piyasa:b.piyasa||{},sinyal:b.sinyal||{},tarih:b.tarih,ts:b.ts};
  if(pz==='nasdaq'){ const n=b.nasdaq||{}; return {hisse:n.hisse||{},ek:{},piyasa:n.piyasa||{},sinyal:n.sinyal||{},tarih:n.tarih,ts:b.ts}; }
  const e=b.emtia||{}; return {hisse:e.liste||{},ek:{},piyasa:{genislik:e.genislik,durum:e.durum},sinyal:{},tarih:e.tarih,ts:b.ts,emtia:1}; }
function bul(s){ const b=B(); const n=(b.nasdaq||{}).hisse||{}, e=(b.emtia||{}).liste||{};
  if((b.hisse||{})[s]) return [b.hisse[s],'bist']; if((b.ek||{})[s]) return [b.ek[s],'bist']; if(n[s]) return [n[s],'nasdaq']; if(e[s]) return [e[s],'emtia']; return [null,null]; }

/* ---- LOKİ ---- */
function lokiPiyasa(pz){ const lp=(J&&J.lp)||{}, x=lp[pz]; let L=x&&x.paragraf&&x.paragraf.length?x.paragraf.slice():null;
  if(!L&&pz==='bist'&&Array.isArray(B().loki)) L=B().loki.slice(); if(!L||!L.length) return '';
  const ilk=L.shift(); return `<div class="hb-lk"><img src="${O.lokiImg||'loki-256.png'}" alt=""><div style="min-width:0;flex:1"><small>LOKİ · ${esc(PZAD[pz])}${x&&x.baslik?' · '+esc(x.baslik):''}</small>
    ${L.length?`<details><summary>${esc(ilk)}</summary>${L.map(t=>`<p>${esc(t)}</p>`).join('')}${x&&x.kapanis?`<p>${esc(x.kapanis)}</p>`:''}</details>`:`<p>${esc(ilk)}</p>`}</div></div>`; }
function lokiHisse(x,pz,S){ try{ S=S||{}; const L=[], nq=pz==='nasdaq', end=nq?'Nasdaq 100':'BIST 100', y=v=>(v>=0?'%':'−%')+Math.abs(Math.round(v*10)/10).toLocaleString('tr-TR');
    const tf=x.tf||[], h=tf[0], g=tf[1];
    if(h===1&&g===1) L.push('Fiyat hem haftalık hem günlük bakışta <b>yukarı yönlü</b> ilerliyor; iki zaman dilimi aynı yönde.');
    else if(h===-1&&g===-1) L.push('Fiyat hem haftalık hem günlük bakışta <b>aşağı yönlü</b>; iki zaman dilimi de zayıf.');
    else if(h===1&&g===-1) L.push('Uzun vadeli gidişat yukarı ama <b>son günlerde geri çekiliyor</b>.');
    else if(h===-1&&g===1) L.push('Uzun vadede zayıf ama <b>son günlerde toparlanma</b> görülüyor; kalıcı olup olmadığı henüz belli değil.');
    else L.push('Fiyatın yönü şu an <b>belirsiz</b>; net bir eğilim yok.');
    if(x.d5!=null||x.d20!=null) L.push(`Son 5 günde <b class="${kl(x.d5)}">${y(x.d5||0)}</b>${x.d20!=null?`, son 20 günde <b class="${kl(x.d20)}">${y(x.d20)}</b>`:''}${x.rs20!=null?` — bu sürede ${end} endeksinden <b class="${kl(x.rs20)}">${Math.abs(Math.round(x.rs20))} puan ${x.rs20>=0?'daha iyi':'daha zayıf'}</b>`:''}.`);
    if(x.y1!=null) L.push(`Son bir yılda <b class="${kl(x.y1)}">${y(x.y1)}</b>.`);
    const sk=x.sk!=null?Math.max(0,x.sk):null; if(sk!=null) L.push(sk>=5?`Güç ölçümünde 6 üzerinden <b>${sk}</b>: genel görünüm <b class="hb-up">güçlü</b>.`:sk>=3?`Güç ölçümünde 6 üzerinden <b>${sk}</b>: görünüm <b class="hb-wn">orta</b>.`:`Güç ölçümünde 6 üzerinden <b>${sk}</b>: görünüm <b class="hb-dn">zayıf</b>.`);
    if((S.para||[]).some(q=>q.s===x.s)) L.push('Son günlerde bu hisseye <b>para girişi</b> dikkat çekiyor.');
    if((S.dikkat||[]).some(q=>q.s===x.s)) L.push('Yakın zamanda <b>zayıflama işareti</b> verdi; dalgalanma artabilir.');
    const k=(x.tm||{}).k; if(k&&k[0]&&k[0][1]) L.push(`Mali tablolara bakınca: <b>${esc(k[0][1])}</b>.`);
    if(x.v!=null&&x.v<1e6) L.push('İşlem hacmi düşük; fiyat küçük işlemlerle bile sert oynayabilir.');
    if(!L.length) return ''; const ilk=L.shift();
    return `<div class="hb-lk"><img src="${O.lokiImg||'loki-256.png'}" alt=""><div style="min-width:0;flex:1"><small>LOKİ · KARTI OKUDUM</small>
      <details><summary>${ilk}</summary>${L.map(t=>`<p>${t}</p>`).join('')}${CX()?'':'<p class="hb-dm">Bu bir yorumdur; yatırım tavsiyesi değildir.</p>'}</details></div></div>`; }catch(_){ return ''; } }

/* ---- temel bakış (ORBIT temelHTML ile aynı içerik) ---- */
function temelPuan(t){ const L=((t&&t.k)||[]).filter(r=>r[0]!=='cyan'); if(L.length<2) return null; return Math.round(L.reduce((a,r)=>a+(r[0]==='up'?100:r[0]==='warn'?50:0),0)/L.length); }
function temelHTML(x,pz){ const t=x.tm; if(!t) return ''; const M=(pzVeri(pz).piyasa||{}).tm||{}, tr=!!t.tms;
  const kb=v=>{ if(v==null) return '—'; const a=Math.abs(v), sg=v<0?'−':''; return a>=1e12?sg+(a/1e12).toLocaleString('tr-TR',{maximumFractionDigits:1})+' tr':a>=1e9?sg+(a/1e9).toLocaleString('tr-TR',{maximumFractionDigits:1})+' mr':a>=1e6?sg+(a/1e6).toLocaleString('tr-TR',{maximumFractionDigits:0})+' mn':sg+a.toLocaleString('tr-TR'); };
  const yz=(v,n=1)=>v==null?'—':'%'+v.toLocaleString('tr-TR',{maximumFractionDigits:n});
  const gp=(v,r)=>v==null?'<td>—</td>':`<td class="${!r?'':v>0?'hb-up':v<0?'hb-dn':''}">${pc(v)}</td>`;
  const G=t.g||{}, KX=M.kx||{}, EN=M.enf||{}, FN=M.fon||{}, DK=['1a','3a','1y'];
  const sat=(ad,o,ben)=>`<tr class="${ben?'ben':''}"><td>${esc(ad)}</td>${DK.map(k=>gp((o||{})[k],ben)).join('')}</tr>`;
  const q=(t.q||[]).slice(0,5).reverse(), seriAd=t.bnk?'Net faiz geliri':'Satışlar', seri=((t.bnk?t.nfg:t.sat)||[]).slice(0,5).reverse(), mx=Math.max(1,...seri.map(v=>Math.abs(v||0)));
  const ql=c=>String(c).replace(/^(\d{2})(\d{2})Q(\d)$/,'$3Ç $2'), sat2=(ad,L)=>L&&L.some(v=>v!=null)?`<tr><td>${ad}</td>${L.slice(0,5).reverse().map(v=>`<td class="${v<0?'hb-dn':''}">${kb(v)}</td>`).join('')}</tr>`:'';
  const p=temelPuan(t), pr=p==null?'':p>=67?'var(--up,#2cf2a6)':p>=34?'var(--warn,#ffc24a)':'var(--down,#ff4d7a)';
  return `<div class="hbm-tm"><div class="hbm-bl">Temel bakış${t.q&&t.q[0]?' · son rapor '+ql(t.q[0]):''}${tr?' · enflasyon düzeltmeli':''}</div>
    ${p!=null?`<div class="hbm-tp"><b style="background:${pr}">${p}</b>Temel puan · ${p>=67?'güçlü':p>=34?'orta':'zayıf'}</div>`:''}
    ${(t.k||[]).length?`<div class="hbm-bl">Özet karne</div><div class="kr">${t.k.map(r=>`<i class="${esc(r[0])}"></i><div><b>${esc(r[1])}</b><small>${esc(r[2])}</small></div>`).join('')}</div>`:''}
    <div class="hbm-bl">Getiri kıyası</div><table><tr><th></th><th>1 ay</th><th>3 ay</th><th>1 yıl</th></tr>${sat(x.a,G,1)}${sat(M.kx_ad||'Endeks',KX)}${sat(tr?'Enflasyon (TÜFE)':'ABD enflasyonu',EN)}${sat(tr?'Para piyasası fonu':'ABD Hazine (3 ay)',FN)}</table>
    ${seri.length?`<div class="hbm-bl">${seriAd} · çeyreklik</div><div class="hbm-bar">${seri.map(v=>`<i class="${(v||0)<0?'n':''}" style="height:${Math.max(3,Math.abs(v||0)/mx*100)}%" title="${kb(v)}"></i>`).join('')}</div>
    <table style="margin-top:8px"><tr><th></th>${q.map(c=>`<th>${ql(c)}</th>`).join('')}</tr>${sat2(seriAd,(t.bnk?t.nfg:t.sat))}${t.bnk?'':sat2('Faaliyet kârı',t.fk)}${sat2('Net kâr',t.nk)}</table>`:''}
    <div class="hbm-bl">Oranlar ve marjlar</div><div class="hbm-cips">${t.fko!=null?`<span>F/K<b>${t.fko>0?t.fko.toLocaleString('tr-TR',{maximumFractionDigits:1}):'zarar'}</b></span>`:''}${t.pd!=null?`<span>PD/DD<b>${t.pd.toLocaleString('tr-TR',{maximumFractionDigits:2})}</b></span>`:''}${t.fdf!=null?`<span>FD/FAVÖK<b>${t.fdf.toLocaleString('tr-TR',{maximumFractionDigits:1})}</b></span>`:''}${t.roe!=null?`<span>Özkaynak kârlılığı<b>${yz(t.roe,0)}</b></span>`:''}${t.mb!=null&&!t.bnk?`<span>Brüt marj<b>${yz(t.mb)}</b></span>`:''}${t.mfa!=null&&!t.bnk?`<span>Faaliyet marjı<b>${yz(t.mfa)}</b></span>`:''}${t.mn!=null?`<span>Net marj<b>${yz(t.mn)}</b></span>`:''}${t.tem!=null&&t.tem>0?`<span>Temettü verimi<b>${yz(t.tem)}</b></span>`:''}${t.bs!=null?`<span>Satış büyümesi<b class="${kl(t.bs)}">${pc(t.bs,0)}</b></span>`:''}${t.bn!=null?`<span>Kâr büyümesi<b class="${kl(t.bn)}">${pc(t.bn,0)}</b></span>`:''}</div></div>`; }

/* ---- pazar sayfası ---- */
const ENDEKS={bist:['xu100','xu030','xbank','usd','eur','gram'],nasdaq:['ndx','spx','dji','rut','vix','tnx','dxy']};
const RZ={'güçlü':'hb-up','zayıf':'hb-dn','karışık':'hb-wn'};
function guc(x){ const o=Math.max(0,x.o!=null?x.o:(x.sk||0)), t=x.ot||6; return `<span class="hb-gc" title="${o}/${t}">${Array.from({length:t},(_,i)=>`<i class="${i<o?'on':''}"></i>`).join('')}</span>`; }
function liste(pz){ const V=pzVeri(pz); let L=Object.values(V.hisse); if(pz==='bist'&&EK) L=L.concat(Object.values(V.ek));
  const a=ARAMA.trim().toLocaleLowerCase('tr'); if(a) L=L.filter(x=>((x.a||'')+' '+(x.ad||'')+' '+(x.sek||'')).toLocaleLowerCase('tr').includes(a));
  if(FILT==='up') L=L.filter(x=>(x.tf||[])[1]===1); else if(FILT==='dn') L=L.filter(x=>(x.tf||[])[1]===-1);
  const k={d:x=>-(x.d||0),d5:x=>-(x.d5||0),d20:x=>-(x.d20||0),g:x=>-((x.sk!=null?x.sk:x.o)||0)*1000-(x.d5||0),ad:null}[SIRA];
  L.sort(k?(p,q)=>k(p)-k(q):(p,q)=>String(p.a).localeCompare(String(q.a),'tr')); return L; }
let SINIR=60;
function tablo(pz){ const L=liste(pz), em=pz==='emtia', P=PB(pz);
  const satir=x=>`<tr data-hb="${esc(x.s)}"><td><b>${esc(em?x.ad:x.a)}</b><small>${esc(em?(x.sek||'')+(x.birim?' · '+x.birim:''):x.ad)}</small></td>
    <td>${em?esc(x.para||'$'):P}${px(x.f)}</td><td class="${kl(x.d)}">${pc(x.d)}</td><td class="${kl(x.d5)} hb-x">${pc(x.d5)}</td><td class="${kl(x.d20)} hb-x">${pc(x.d20)}</td>
    <td>${CX()&&!em&&x.h?`<span class="hb-h">${esc(x.h)}</span> `:''}${guc(x)}</td></tr>`;
  return `<table class="hb-tb"><tr><th>${em?'Emtia':'Hisse'}</th><th>Fiyat</th><th>Gün</th><th class="hb-x">5 gün</th><th class="hb-x">20 gün</th><th>${CX()&&!em?'Hüküm · güç':'Güç'}</th></tr>${L.slice(0,SINIR).map(satir).join('')}</table>
    ${L.length>SINIR?`<div class="hb-dev"><button data-hbdev>Devamını göster (${L.length-SINIR})</button></div>`:''}${L.length?'':'<p class="hb-dm">Sonuç yok.</p>'}`; }
function sinyaller(pz){ if(pz==='emtia') return ''; const S=pzVeri(pz).sinyal||{}, ad=s=>{ const [x]=bul(s); return x?x.a:String(s).replace(/\.IS$/,''); };
  const G=[[CX()?'💪 Güçlü (6 üzerinden)':'Güçlü görünenler','guclu',q=>q.sk!=null?q.sk+'/6':''],[CX()?'🎯 Fırsat':'Öne çıkanlar','firsat',q=>q.puan!=null?Math.round(q.puan):''],['▲ Bu hafta yükselişe geçen','hafta_up',q=>q.yas!=null?(q.yas?q.yas+' gün':'bugün'):''],['💸 Para girişi','para',()=>''],['⚠ Zayıflama işareti','dikkat',()=>'']];
  const H=G.filter(g=>(S[g[1]]||[]).length).map(g=>`<div class="hb-sg"><h3>${g[0]}</h3><div class="hb-cp">${S[g[1]].slice(0,16).map(q=>`<button data-hbs="${esc(q.s)}">${esc(ad(q.s))}${g[2](q)!==''?`<i>${esc(g[2](q))}</i>`:''}</button>`).join('')}</div></div>`).join('');
  return H; }
function ciz(el,pz){ css(); if(!el) return; PZ=pz||PZ; el.classList.add('hb');
  if(!J){ el.innerHTML=`<div class="hb-ust"><h2>${esc(PZAD[PZ])}</h2></div><p class="hb-dm">${O.yukleniyor?'Veri yükleniyor…':'BORSA verisi henüz yok. BORSA açıkken bir sonraki gönderimde gelir.'}</p>`; return; }
  const V=pzVeri(PZ), P=V.piyasa||{}, em=PZ==='emtia', n=Object.keys(V.hisse).length+(PZ==='bist'?Object.keys(V.ek).length:0);
  const tl=(ENDEKS[PZ]||[]).map(k=>P[k]).filter(Boolean).map((o,i)=>`<div class="hb-t" data-hbe="${esc((ENDEKS[PZ]||[]).filter(k=>P[k])[i])}"><small>${esc(o.ad)}</small><b>${px(o.f)}</b><span class="${kl(o.d)}">${pc(o.d)}</span> <span class="hb-dm">· 5g</span> <span class="${kl(o.d5)}">${pc(o.d5)}</span></div>`).join('');
  const gn=P.genislik!=null?Math.round(P.genislik*100):null, rz=P.ruzgar||P.durum;
  el.innerHTML=`<div class="hb-ust"><h2>${em?'🛢':PZ==='bist'?'🇹🇷':'🇺🇸'} ${esc(PZAD[PZ])}</h2><small>${V.tarih?'son kapanış '+esc(String(V.tarih).split('-').reverse().join('.'))+' · ':''}${n} ${em?'emtia':'hisse'}</small></div>
    ${tl?`<div class="hb-tl">${tl}</div>`:''}
    <div class="hb-rz">${rz?`<span>Piyasa rüzgârı · <b class="${RZ[rz]||''}">${esc(rz)}</b></span>`:''}${gn!=null?`<span>Yükseliş eğiliminde olanlar · <b>%${gn}</b></span>`:''}${PZ==='bist'&&P.xu_usd!=null?`<span>Dolar bazlı BIST 100 · <b>${px(P.xu_usd)}</b> <span class="${kl(P.xu_usd_d5)}">5g ${pc(P.xu_usd_d5)}</span></span>`:''}${CX()&&PZ==='bist'&&P.xu_s200!=null?`<span>BIST 100 SMA200 · <b class="${P.xu_s200?'hb-up':'hb-dn'}">${P.xu_s200?'üstünde':'altında'}</b></span>`:''}${CX()&&PZ==='nasdaq'&&P.end_s200!=null?`<span>Nasdaq 100 SMA200 · <b class="${P.end_s200?'hb-up':'hb-dn'}">${P.end_s200?'üstünde':'altında'}</b></span>`:''}</div>
    ${lokiPiyasa(PZ)}${sinyaller(PZ)}
    <div class="hb-ar"><input type="search" placeholder="${em?'Emtia ara…':'Hisse ara (kod, ad, sektör)…'}" value="${esc(ARAMA)}" data-hbara><select data-hbsira>${[['d','Günlük değişim'],['d5','5 gün'],['d20','20 gün'],['g','Güç'],['ad','Ada göre']].map(q=>`<option value="${q[0]}"${SIRA===q[0]?' selected':''}>${q[1]}</option>`).join('')}</select>
      ${[['hep','Tümü'],['up','Yükselişte'],['dn','Düşüşte']].map(q=>`<button data-hbf="${q[0]}" class="${FILT===q[0]?'on':''}">${q[1]}</button>`).join('')}${PZ==='bist'&&Object.keys(V.ek).length?`<button data-hbek class="${EK?'on':''}">+ Tüm BIST (${Object.keys(V.ek).length})</button>`:''}</div>
    <div data-hbtb>${tablo(PZ)}</div>`;
  const tb=()=>{ el.querySelector('[data-hbtb]').innerHTML=tablo(PZ); };
  const ar=el.querySelector('[data-hbara]'); ar.oninput=()=>{ ARAMA=ar.value; SINIR=60; tb(); };
  el.querySelector('[data-hbsira]').onchange=e=>{ SIRA=e.target.value; tb(); };
  el.onclick=e=>{ const f=e.target.closest('[data-hbf]'); if(f){ FILT=f.dataset.hbf; el.querySelectorAll('[data-hbf]').forEach(b=>b.classList.toggle('on',b===f)); SINIR=60; tb(); return; }
    if(e.target.closest('[data-hbek]')){ EK=!EK; e.target.closest('[data-hbek]').classList.toggle('on',EK); SINIR=60; tb(); return; }
    if(e.target.closest('[data-hbdev]')){ SINIR+=100; tb(); return; }
    const r=e.target.closest('[data-hb],[data-hbs]'); if(r){ kart(r.dataset.hb||r.dataset.hbs); return; }
    const en=e.target.closest('[data-hbe]'); if(en){ endeksKart(PZ,en.dataset.hbe); } }; }

/* ---- kart ---- */
function modal(){ let m=document.getElementById('hbM'); if(m) return m; m=document.createElement('div'); m.id='hbM'; m.hidden=true; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="hbm-k"><button class="hbm-g" type="button">← Geri</button><button class="hbm-x" type="button" aria-label="Kapat">×</button><div class="hbm-ic"></div></div>'; document.body.appendChild(m);
  const kapa=()=>{ m.hidden=true; YIGIN.length=0; document.body.style.overflow=''; const g=m.querySelector('.hbm-lw'); if(g&&g._g){ try{ g._g.sil(); }catch(_){} } };
  m.querySelector('.hbm-x').onclick=kapa; m.querySelector('.hbm-g').onclick=()=>{ YIGIN.pop(); const o=YIGIN.pop(); if(o) (o[0]==='e'?endeksKart(o[1],o[2]):kart(o[1])); else kapa(); };
  m.addEventListener('click',e=>{ if(e.target===m) kapa(); const s=e.target.closest('[data-hbs]'); if(s) kart(s.dataset.hbs); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!m.hidden){ e.stopPropagation(); m.querySelector('.hbm-g').click(); } },true); return m; }
function svgCiz(v,nb,nw){ v=(v||[]).filter(q=>q!=null); if(v.length<2) return ''; const all=v.concat(nb&&nw?nb.slice(-v.length).flatMap(q=>[q-nw,q+nw]):[]), mn=Math.min(...all), mx=Math.max(...all), W=600, H=280, X=i=>8+i/(v.length-1)*(W-16), Y=q=>10+(1-(q-mn)/((mx-mn)||1))*(H-20);
  const c=v[v.length-1]>=v[0]?'var(--up,#2cf2a6)':'var(--down,#ff4d7a)'; let bd='';
  if(nb&&nw){ const b=nb.slice(-v.length); if(b.length===v.length) bd=`<path d="M${b.map((q,i)=>X(i)+','+Y(q+nw)).join('L')}L${b.map((q,i)=>[i,q]).reverse().map(([i,q])=>X(i)+','+Y(q-nw)).join('L')}Z" fill="rgba(56,216,255,.08)"/><path d="M${b.map((q,i)=>X(i)+','+Y(q)).join('L')}" fill="none" stroke="rgba(56,216,255,.5)" stroke-dasharray="4 4"/>`; }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bd}<path d="M${v.map((q,i)=>X(i)+','+Y(q)).join('L')}" fill="none" stroke="${c}" stroke-width="2"/></svg>`; }
function grafik(kok,v,P,band,mk,ts,ad){ const kap=kok.querySelector('.hbm-gr'), ip=kok.querySelector('.hbm-ip'); if(!kap) return; kap.innerHTML=svgCiz(v,band&&band.nb,band&&band.nw); ip.textContent=(v||[]).length+' seans';
  if(!window.HCG||!v||v.length<2) return; const d=document.createElement('div'); d.className='hbm-lw'; kap.appendChild(d);
  try{ HCG.ciz(d,{v,son:ts,borsa:true,PB:P,fmt:px,band:band&&band.nb?band:null,mk:mk||null,kesisim:!!(band&&band.nb),baslik:ad||'',ip,ipVarsayilan:ip.innerHTML,gorunen:v.length,
      tooltip:o=>`${o.gunOnce<=0?'bugün':o.gunOnce+' seans önce'} · <b>${P}${px(o.fiyat)}</b> <span class="${kl((o.son/o.fiyat-1)*100)}">şimdiye ${pc((o.son/o.fiyat-1)*100)}</span>`})
    .then(g=>{ if(!g){ d.remove(); return; } d._g=g; const s=kap.querySelector('svg'); if(s) s.style.visibility='hidden'; }).catch(()=>d.remove()); }catch(_){ d.remove(); } }
const GK=[['s200','SMA200 üstü',1],['w','Haftalık trend yukarı',1],['god','GOD konseyi LONG',1],['ez','EZ geçerli',1],['tepe','Tepe dönüşü',1],['ak','Akıllı para girişi',1],['down','1D DOWN',0],['cikis','Çıkış işareti',0]];
function kart(s){ const [x,pz]=bul(s); if(!x) return; css(); const m=modal(), ic=m.querySelector('.hbm-ic'), em=pz==='emtia', P=em?(x.para||'$'):PB(pz), V=pzVeri(pz);
  YIGIN.push(['h',s]); const g0=ic.querySelector('.hbm-lw'); if(g0&&g0._g){ try{ g0._g.sil(); }catch(_){} }
  const cips=[['Gün',x.d],['5 gün',x.d5],['20 gün',x.d20]].concat(x.y1!=null?[['1 yıl',x.y1]]:[]).concat(x.rs20!=null?[[(pz==='nasdaq'?'Nasdaq':'BIST')+"'e göre 20g",x.rs20]]:[]).map(q=>`<span>${q[0]}<b class="${kl(q[1])}">${pc(q[1])}</b></span>`).join('');
  let hk=''; if(CX()&&!em&&x.h){ const gk=x.gk||{};
    hk=`<div class="hbm-hk"><b class="hbm-hh">${esc(x.h)}</b>${x.sebep?` <span class="hb-dm">· ${esc(x.sebep)}</span>`:''}${x.plan?`<p>${esc(x.plan)}</p>`:''}
      <div class="hbm-cips" style="margin:9px 0 6px">${x.st!=null?`<span>Stop<b class="hb-dn">${P}${px(x.st)}</b></span>`:''}${x.hd!=null?`<span>Hedef<b class="hb-up">${P}${px(x.hd)}</b></span>`:''}${x.rr!=null?`<span>Risk/ödül<b>${x.rr.toLocaleString('tr-TR',{maximumFractionDigits:2})}</b></span>`:''}${x.bl?`<span>Bölge<b>${P}${px(x.bl[0])} – ${px(x.bl[1])}</b></span>`:''}${x.ak?`<span>Akıllı para<b>${esc(x.ak)}${x.aks!=null?' ('+Math.round(x.aks)+')':''}</b></span>`:''}</div>
      <div class="hbm-gk">${GK.map(([k,ad,pos])=>gk[k]==null?'':`<span class="${gk[k]?(pos?'e':'n'):'k'}">${gk[k]?(pos?'✓':'✗'):'·'} ${ad}</span>`).join('')}</div>
      ${x.m?`<p class="hb-dm" style="font-size:12px">Son ▲ yükseliş: ${x.m.u!=null?x.m.u+' seans önce':'—'} · son ▼ düşüş: ${x.m.d!=null?x.m.d+' seans önce':'—'}</p>`:''}</div>`; }
  else if(em&&CX()){ hk=`<div class="hbm-hk"><b class="hbm-hh">${x.hy==='up'?'<span class="hb-up">▲ Trend yukarı</span>':x.hy==='down'?'<span class="hb-dn">▼ Trend aşağı</span>':'Trend belirsiz'}</b> ${guc(x)}${x.m?`<p class="hb-dm" style="font-size:12px">Son ▲: ${x.m.u!=null?x.m.u+' seans önce':'—'} · son ▼: ${x.m.d!=null?x.m.d+' seans önce':'—'} · SMA50 ${x.s50?'üstü':'altı'} · SMA200 ${x.s200?'üstü':'altı'}</p>`:''}</div>`; }
  ic.innerHTML=`<div class="hbm-bs"><div><h3>${esc(em?x.ad:x.a)}</h3><small>${esc(em?(x.sek||''):x.ad)}${x.sek&&!em?' · '+esc(x.sek):''}${x.birim?' · '+esc(x.birim):''} · ${esc(PZAD[pz])}</small></div>
      <div class="hbm-f"><b>${P}${px(x.f)}</b><span class="${kl(x.d)}">${pc(x.d)}</span></div></div>
    ${em?'':lokiHisse(x,pz,V.sinyal)}
    <div class="hbm-gr"></div><div class="hbm-ip"></div>
    <div class="hbm-cips">${cips}</div>${hk}${em?'':temelHTML(x,pz)}`;
  m.hidden=false; document.body.style.overflow='hidden'; m.scrollTop=0;
  grafik(ic,x.sr,P,x.nb&&x.nw?{nb:x.nb,nw:x.nw}:null,x.mk,V.ts,em?x.ad:x.a); }
function endeksKart(pz,k){ const P=pzVeri(pz).piyasa||{}, o=P[k]; if(!o) return; css(); const m=modal(), ic=m.querySelector('.hbm-ic'); YIGIN.push(['e',pz,k]);
  ic.innerHTML=`<div class="hbm-bs"><div><h3>${esc(o.ad)}</h3><small>${esc(PZAD[pz])} · gösterge</small></div><div class="hbm-f"><b>${px(o.f)}</b><span class="${kl(o.d)}">${pc(o.d)}</span></div></div>
    <div class="hbm-gr"></div><div class="hbm-ip"></div><div class="hbm-cips"><span>Gün<b class="${kl(o.d)}">${pc(o.d)}</b></span><span>5 gün<b class="${kl(o.d5)}">${pc(o.d5)}</b></span>${o.sr&&o.sr.length>1?`<span>${o.sr.length} seans<b class="${kl((o.sr[o.sr.length-1]/o.sr[0]-1)*100)}">${pc((o.sr[o.sr.length-1]/o.sr[0]-1)*100)}</b></span>`:''}</div>`;
  m.hidden=false; document.body.style.overflow='hidden'; grafik(ic,o.sr,'',null,null,pzVeri(pz).ts,o.ad); }

window.HCB={ surum:1, kur(o){ O=Object.assign(O,o||{}); css(); }, veri(j){ J=j; }, var:()=>!!J, ciz, kart, bul:s=>bul(s)[0] };
})();
