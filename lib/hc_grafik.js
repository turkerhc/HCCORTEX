/*! HC · ortak grafik (v1.7 · 17.11.2026 törpülenmiş kesişim + günlük bant genişliği · v1.6 · 15.11.2026 — 4 saatlik grafik · — dolgulu trend bandı · kesişim ışıkları · tam ekran) — TradingView Lightweight Charts™ v5 üzerine · CORTEX + ORBIT
 * © 2026 Türker HC · HC — Tüm hakları saklıdır.
 * Kripto: Binance'in herkese açık günlük mumları (önce spot, yoksa vadeli) · alınamazsa sayfanın kendi kapanış serisi (çizgi).
 * Katmanlar: trend bandı (orta + alt/üst) · ▲▼ işaretleri · ◆ dip → ◆ orta çizgi (kesik bağ) · yatay seviyeler.
 * Kütüphane yalnız grafik açılınca yüklenir (lib/lwc.js). Yüklenemezse sayfa eski çizimini kullanır.
 */
(function () {
  'use strict';
  const GUN = 86400, MUM = new Map(), NS = 'http://www.w3.org/2000/svg';
  /* v1.5 · ortak stiller (CORTEX + ORBIT) */
  (function () { if (document.getElementById('hcg-css')) return; const st = document.createElement('style'); st.id = 'hcg-css';
    st.textContent = `.hcg-tb{position:absolute;top:4px;right:4px;z-index:6;width:30px;height:30px;border-radius:50%;border:1px solid rgba(127,140,180,.35);background:rgba(8,11,20,.72);color:#e8eeff;font:15px/1 system-ui,sans-serif;display:grid;place-items:center;cursor:pointer;padding:0}
.hcg-fs{position:fixed;inset:0;z-index:2147483000;background:var(--bg,#05070d);display:flex;flex-direction:column;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 8px) calc(env(safe-area-inset-right,0px) + 8px) calc(env(safe-area-inset-bottom,0px) + 8px) calc(env(safe-area-inset-left,0px) + 8px);box-sizing:border-box}
.hcg-fs .hcg-ust{display:flex;align-items:flex-start;gap:10px;min-height:38px}.hcg-fs .hcg-ad{font:700 15px system-ui,sans-serif;color:var(--ink,#e8eeff);letter-spacing:.04em;padding-top:8px;white-space:nowrap}
.hcg-fs .hcg-ip{flex:1;min-width:0;font:500 11.5px/1.45 "JetBrains Mono",ui-monospace,monospace;color:var(--ink2,#b9c3dd);padding-top:9px}
.hcg-fs .hcg-x{flex:0 0 auto;width:38px;height:38px;border-radius:50%;border:1px solid rgba(127,140,180,.35);background:none;color:inherit;font:17px system-ui;cursor:pointer;color:var(--ink,#e8eeff)}
.hcg-fs .hcg-alan{flex:1;position:relative;min-height:0}.hcg-fs .hcg-alan>*{position:absolute!important;inset:0!important;opacity:1!important}
.hcg-fs .hcg-tb{display:none}`;
    (document.head || document.documentElement).appendChild(st); })();
  let yukleniyor = null;
  const HCG = {
    hazir() { return !!window.LightweightCharts; },
    yukle() {
      if (window.LightweightCharts) return Promise.resolve(true);
      if (yukleniyor) return yukleniyor;
      yukleniyor = new Promise(res => {
        const s = document.createElement('script');
        s.src = (HCG.kok || 'lib/') + 'lwc.js'; s.async = true;
        s.onload = () => res(true); s.onerror = () => { yukleniyor = null; res(false); };
        document.head.appendChild(s);
      });
      return yukleniyor;
    },
    /* Binance günlük mumları (önbellek 10 dk) → [{time,open,high,low,close}] ya da null */
    async mum(sym, adet, ar) {
      ar = ar === '4h' ? '4h' : ar === '1w' ? '1w' : '1d';
      if (!/^[A-Z0-9]{2,20}USDT$/.test(sym || '')) return null;
      const k = sym + '|' + (adet || 365) + '|' + ar, o = MUM.get(k);
      if (o && Date.now() - o.t < 10 * 60e3) return o.v;
      const yollar = [`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${ar}&limit=${adet || 365}`,
                      `https://fapi.binance.com/fapi/v1/klines?symbol=${sym}&interval=${ar}&limit=${adet || 365}`];
      for (const u of yollar) {
        try {
          const ac = new AbortController(), z = setTimeout(() => ac.abort(), 6000);
          const r = await fetch(u, { signal: ac.signal, cache: 'no-store' }); clearTimeout(z);
          if (!r.ok) continue;
          const j = await r.json();
          if (!Array.isArray(j) || j.length < 5) continue;
          const v = j.map(q => ({ time: Math.floor(q[0] / 1000), open: +q[1], high: +q[2], low: +q[3], close: +q[4] }));
          MUM.set(k, { t: Date.now(), v }); return v;
        } catch (_) { /* sıradaki kaynak */ }
      }
      MUM.set(k, { t: Date.now() - 8 * 60e3, v: null });      // 2 dk sonra yeniden dene
      return null;
    },
    /* kapanış serisine zaman: kripto her gün · borsa hafta içi (tatiller yaklaşık) */
    zamanlar(n, son, borsa) {
      const T = new Array(n); let d = Math.floor((son || Date.now() / 1000) / GUN) * GUN;
      if (borsa) { while ([0, 6].includes(new Date(d * 1000).getUTCDay())) d -= GUN; }
      for (let i = n - 1; i >= 0; i--) {
        T[i] = d; d -= GUN;
        if (borsa) while ([0, 6].includes(new Date(d * 1000).getUTCDay())) d -= GUN;
      }
      return T;
    },
    alfa(c, a) { const m = /^#([0-9a-f]{6})$/i.exec(String(c).trim()); if (!m) return c; const n = parseInt(m[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; },
    /* v1.6 · trend bandı (sunucudaki app_web.nefilim ile aynı): orta = Kalman(SMA7; 44, 0,01, 0,1) · yarı genişlik = WMA(yüksek−düşük, 200) × 1,2 */
    bant(k) {
      const c = k.map(q => q.close), n = c.length, s7 = new Array(n).fill(NaN);
      for (let i = 6; i < n; i++) { let t = 0; for (let j = i - 6; j <= i; j++) t += c[j]; s7[i] = t / 7; }
      const b = 44, al = 0.01, be = 0.1, nb = new Array(n).fill(null);
      let v1 = NaN, v2 = 1.0; const v3 = al * b;
      for (let i = 0; i < n; i++) {
        if (isNaN(v1)) v1 = i > 0 ? s7[i - 1] : NaN;
        const v5 = v1, v4 = v2 / (v2 + v3);
        v1 = v5 + v4 * (s7[i] - v5); v2 = (1 - v4) * v2 + be / b;
        nb[i] = isFinite(v1) ? v1 : null;
      }
      const r = k.map(q => q.high - q.low), nwa = new Array(n).fill(null);   /* 1.7 · her mumun kendi bant genişliği (kayan WMA200 × 1,2) */
      for (let i = 0; i < n; i++) { const a = Math.max(0, i - 199); let ts = 0, tw = 0; for (let j = a; j <= i; j++) { const w = j - a + 1; ts += w * r[j]; tw += w; } nwa[i] = tw ? ts / tw * 1.2 : null; }
      return { nb, nw: nwa[n - 1] || 0, nwa };
    },
    renk(ad, yedek) { try { const v = getComputedStyle(document.documentElement).getPropertyValue(ad).trim(); return v || yedek; } catch (_) { return yedek; } },
    /* o: {ek:[{t,position,color,shape,text}] (ek işaretler), v (kapanışlar), son (son mum zamanı, sn), borsa, sym, mumAc, PB, fmt, band:{nb,nw}, mk:[[barsAgo,yon,ts?]], dc:[[...]], dcAc, yonAc,
           cizgi:[{f,renk,ad}], ip (öğe), etiket:{u,d,dip,tepe}, gorunen (son kaç mum görünsün), tooltip(fn)} */
    async ciz(kap, o) {
      if (!kap || !(await HCG.yukle())) return null;
      const L = window.LightweightCharts;
      let v = (o.v || []).map(Number).filter(q => isFinite(q) && q > 0);
      let T, mumlar = null;
      if (o.aralik === '4h' || o.aralik === '1w') {              // v1.6 · 4 saatlik / v1.8 · haftalık: Binance mumları · bant ve kesişimler o aralığın verisinden
        const k = o.sym ? await HCG.mum(o.sym, o.aralik === '1w' ? 400 : 500, o.aralik) : null;
        if (!k || k.length < (o.aralik === '1w' ? 12 : 30)) return null;
        v = k.map(q => q.close); T = k.map(q => q.time);
        if (o.mumAc) mumlar = k;
        if (o.band) o = Object.assign({}, o, { band: HCG.bant(k) });
      } else {
        if (v.length < 2) return null;
        T = HCG.zamanlar(v.length, o.son, o.borsa);
        if (o.mumAc && o.sym && !o.borsa) mumlar = await HCG.mum(o.sym, 365);
      }
      if (!kap.isConnected) return null;
      kap.innerHTML = '';
      const ink3 = HCG.renk('--ink3', '#7a87a8'), up = HCG.renk('--up', '#2cf2a6'), down = HCG.renk('--down', '#ff4d7a'), cy = HCG.renk('--cyan', '#38d8ff');
      const fmt = o.fmt || (x => x.toLocaleString('tr-TR', { maximumFractionDigits: x < 1 ? 6 : 2 }));
      const ch = L.createChart(kap, {
        autoSize: true,
        layout: { background: { type: 'solid', color: 'rgba(0,0,0,0)' }, textColor: ink3, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10.5, attributionLogo: true },
        grid: { vertLines: { color: 'rgba(120,150,220,.07)' }, horzLines: { color: 'rgba(120,150,220,.09)' } },
        rightPriceScale: { borderVisible: false, scaleMargins: { top: .12, bottom: .1 } },
        timeScale: { borderVisible: false, rightOffset: 3, minBarSpacing: 1.5, fixLeftEdge: true },
        crosshair: { mode: 1, vertLine: { color: 'rgba(160,180,230,.35)', labelBackgroundColor: '#2a3350' }, horzLine: { color: 'rgba(160,180,230,.25)', labelBackgroundColor: '#2a3350' } },
        handleScroll: { vertTouchDrag: false }, handleScale: { axisPressedMouseMove: { price: false } },
        localization: { locale: 'tr-TR', priceFormatter: p => (o.PB || '') + fmt(Math.abs(p) < 1e-12 ? 0 : p) }   /* v1.4 · 0'a çok yakın kayan nokta artığı ($-0,0000…6939) ekseni genişletmesin */
      });
      const artis = v[v.length - 1] >= v[0], ana = artis ? up : down;
      let seri, zaman;
      if (mumlar) {
        seri = ch.addSeries(L.CandlestickSeries, { upColor: up, downColor: down, wickUpColor: up, wickDownColor: down, borderVisible: false, priceLineColor: ana });
        seri.setData(mumlar); zaman = mumlar.map(q => q.time);
      } else {
        seri = ch.addSeries(L.AreaSeries, { lineColor: ana, topColor: HCG.alfa(ana, .33), bottomColor: HCG.alfa(ana, 0), lineWidth: 2, priceLineColor: ana });
        seri.setData(v.map((c, i) => ({ time: T[i], value: c }))); zaman = T;
      }
      const tset = new Set(zaman), yakin = t => { const d = Math.floor(t / GUN) * GUN; if (tset.has(d)) return d; for (let k = 1; k <= 3; k++) { if (tset.has(d - k * GUN)) return d - k * GUN; if (tset.has(d + k * GUN)) return d + k * GUN; } return null; };
      const barT = a => (a == null || a < 0 || a >= v.length) ? null : yakin(T[v.length - 1 - a]);
      /* trend bandı */
      /* 1.7 · bant genişliği: nwa varsa her mumun kendi değeri (eski: tek sabit sayı → yeni pompalanmış coinlerde geçmiş bant yanlış genişti) */
      const BW = (() => { if (!(o.band && o.band.nb)) return () => 0; const nb0 = o.band.nb.slice(-v.length), A = Array.isArray(o.band.nwa) ? o.band.nwa.slice(-nb0.length) : null;
        return i => { const x = A ? A[i] : null; return x > 0 ? x : (o.band.nw || 0); }; })();
      if (o.band && o.band.nb && o.band.nw > 0) {
        const nb = o.band.nb.slice(-v.length), off = v.length - nb.length, bc = v[v.length - 1] >= nb[nb.length - 1] ? up : '#9b7bff';
        const nok = k => { const out = [], gor = new Set(); nb.forEach((q, i) => { const t = mumlar ? yakin(T[i + off]) : T[i + off]; if (t == null || gor.has(t) || q == null) return; const val = q + k * BW(i); if (!(val > 0)) return; gor.add(t); out.push({ time: t, value: val }); }); return out.sort((a, b) => a.time - b.time); };
        const op = { lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false };
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .6), lineWidth: 1, lineStyle: 2 }, op)).setData(nok(0));
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .25), lineWidth: 1 }, op)).setData(nok(1));
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .25), lineWidth: 1 }, op)).setData(nok(-1));
      }
      /* 1.7 · kesişimler (törpülenmiş · testler/bant_testi.py, 585 coin 2019-26): kapanış bant ortasını yalnız KESMEKLE kalmaz,
         genişliğin ¼'ü kadar ötesine kapanır VE bant ortası son 5 mumda aynı yöne dönmüş olur. Sonuç: yılda 28,6 → 8,7 sinyal,
         5 günde tersine dönen %56 → %3, ▲ sonrası 20 gün ort. +1,2/−1,9 → +3,0/+1,3 (19-22 / 23-26). Yatay dönemde şerit çıkmaz. Son mum = bugün, sayılmaz. */
      const KS = [];
      if (o.band && o.band.nb && o.kesisim) {
        const nb = o.band.nb.slice(-v.length), off = v.length - nb.length; let dur = 0;
        for (let i = Math.max(off + 1, 1); i < v.length - 1; i++) {
          const m = nb[i - off], w = BW(i - off); if (m == null || !(w > 0)) continue;
          const z = v[i] > m + .25 * w ? 1 : v[i] < m - .25 * w ? -1 : 0;
          if (!z || z === dur) continue;
          if (dur === 0) { dur = z; continue; }                        // ilk durum: sinyal değil (pencerenin başı)
          const m5 = nb[i - off - 5]; if (m5 == null || Math.sign(m - m5) !== z) continue;   // bant ortası henüz o yöne dönmedi
          dur = z; const t = mumlar ? yakin(T[i]) : T[i]; if (t != null) KS.push({ t, yon: z, f: v[i] });
        }
      }
      /* yatay seviyeler (giriş / stop / hedef · CORTEX) */
      (o.cizgi || []).forEach(c => { if (!(c && c.f > 0)) return;
        /* v1.3 · olcek: seviye görünür alanda kalsın (görünmez yardımcı seri ölçeğe katılır) */
        if (c.olcek && zaman.length > 1) { try { ch.addSeries(L.LineSeries, { color: 'rgba(0,0,0,0)', lineWidth: 1, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }).setData([{ time: zaman[0], value: c.f }, { time: zaman[zaman.length - 1], value: c.f }]); } catch (_) { } }
        seri.createPriceLine(c.eksen   /* v1.3 · plan çizgisi: renkli, sağ eksende fiyatı yazar, çizginin üstünde yazı yok */
        ? { price: c.f, color: HCG.alfa(c.renk || cy, .85), lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' }   /* v1.4 · etiketsiz (açıklama grafiğin altında) */
        : o.cizgiSade   /* v1.2 · sade: yazısız, eksen etiketsiz, silik çizgi (karışıklık olmasın) */
        ? { price: c.f, color: HCG.alfa(c.renk || cy, .45), lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: '' }
        : { price: c.f, color: c.renk || cy, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: c.ad || '' }); });
      /* işaretler */
      const M = [], E = o.etiket || {};
      if (o.yonAc && o.mk) o.mk.forEach(q => { const t = q[2] ? yakin(q[2]) : barT(q[0]); if (t == null) return;
        M.push(q[1] > 0 ? { time: t, position: 'belowBar', color: up, shape: 'arrowUp', text: '' } : { time: t, position: 'aboveBar', color: down, shape: 'arrowDown', text: '' }); });
      const bag = [];
      if (o.dcAc && o.dc) o.dc.forEach(q => {
        const t0 = q[0] ? yakin(q[0]) : barT(q[6]), t1 = q[2] ? yakin(q[2]) : (q[7] != null ? barT(q[7]) : null);
        if (t0 != null) M.push({ time: t0, position: 'belowBar', color: '#9b7bff', shape: 'circle', text: '◆' });
        if (t1 != null) M.push({ time: t1, position: 'aboveBar', color: '#ffb03b', shape: 'circle', text: (q[5] >= 0 ? '+' : '−') + '%' + Math.abs(Math.round((q[5] || 0) * 100)) });
        if (t0 != null && q[1] > 0) bag.push([t0, q[1], t1 != null ? t1 : zaman[zaman.length - 1], t1 != null ? q[3] : v[v.length - 1], q[5] > 0 ? up : down]);
      });
      bag.forEach(b => { if (b[2] <= b[0]) return; ch.addSeries(L.LineSeries, { color: HCG.alfa(b[4], .75), lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }).setData([{ time: b[0], value: b[1] }, { time: b[2], value: b[3] }]); });
      /* v1.1 · ek işaretler (CORTEX katmanları): [{t (sn), position, color, shape, text}] */
      (o.ek || []).forEach(q => { const t = q && q.t ? yakin(q.t) : null; if (t != null) M.push({ time: t, position: q.position || 'aboveBar', color: q.color || cy, shape: q.shape || 'circle', text: q.text || '', id: q.id }); });
      M.sort((a, b) => a.time - b.time);
      try { if (M.length) L.createSeriesMarkers(seri, M); } catch (_) { }
      /* görünen aralık */
      const g = Math.min(o.gorunen || v.length, zaman.length);
      try { ch.timeScale().setVisibleLogicalRange({ from: zaman.length - g - .5, to: zaman.length - 1 + 3 }); } catch (_) { }
      /* v1.5 · arka katman (SVG, grafiğin ALTINDA): dolgulu trend bandı + dikey kesişim ışıkları + ▲▼ */
      let ov = null, rafI = 0;
      const katman = () => {
        if (!ov || !kap.isConnected) return;
        const ts = ch.timeScale(), W = kap.clientWidth, H = kap.clientHeight - ts.height(), pw = W - ch.priceScale('right').width();
        let h = '';
        if (o.band && o.band.nb && o.band.nw > 0) {
          const nb = o.band.nb.slice(-v.length), off = v.length - nb.length, bc = v[v.length - 1] >= nb[nb.length - 1] ? up : '#9b7bff';
          const U = [], A = [];
          nb.forEach((q, i) => { if (q == null) return; const t = mumlar ? yakin(T[i + off]) : T[i + off]; if (t == null) return; const x = ts.timeToCoordinate(t); if (x == null) return;
            const nw = BW(i), yu = seri.priceToCoordinate(q + nw), ya = seri.priceToCoordinate(Math.max(q - nw, 1e-12)); if (yu == null || ya == null) return; U.push(x.toFixed(1) + ',' + yu.toFixed(1)); A.unshift(x.toFixed(1) + ',' + ya.toFixed(1)); });
          if (U.length > 1) h += `<polygon points="${U.join(' ')} ${A.join(' ')}" fill="${HCG.alfa(bc, .13)}"/>`;
        }
        const bs = Math.max(4, ts.options().barSpacing || 6);
        KS.forEach(k => { const x = ts.timeToCoordinate(k.t); if (x == null || x < 0 || x > pw) return; const c = k.yon > 0 ? up : down, w = Math.min(26, Math.max(10, bs * 1.6)), wc = Math.max(2, Math.min(4, bs * .35));
          h += `<rect x="${(x - w / 2).toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${H}" fill="${HCG.alfa(c, .10)}"/><rect x="${(x - wc / 2).toFixed(1)}" y="0" width="${wc.toFixed(1)}" height="${H}" fill="${HCG.alfa(c, .30)}"/>`;
          const y = seri.priceToCoordinate(k.f); if (y != null) h += `<text x="${x.toFixed(1)}" y="${(k.yon > 0 ? y + 17 : y - 8).toFixed(1)}" text-anchor="middle" font-size="12" font-family="system-ui,sans-serif" fill="${c}">${k.yon > 0 ? '▲' : '▼'}</text>`; });
        ov.setAttribute('viewBox', `0 0 ${W} ${kap.clientHeight}`); ov.innerHTML = `<svg x="0" y="0" width="${Math.max(0, pw)}" height="${Math.max(0, H)}" overflow="hidden">${h}</svg>`;
      };
      const yenile = () => { cancelAnimationFrame(rafI); rafI = requestAnimationFrame(() => { katman(); rafI = requestAnimationFrame(katman); }); };
      if ((o.band && o.band.nb && o.band.nw > 0) || KS.length) {
        ov = document.createElementNS(NS, 'svg'); ov.setAttribute('aria-hidden', 'true');
        ov.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0';
        if (getComputedStyle(kap).position === 'static') kap.style.position = 'relative';
        const el = kap.firstElementChild; if (el) { el.style.position = 'relative'; el.style.zIndex = '1'; }
        kap.insertBefore(ov, kap.firstChild);
        try { ch.timeScale().subscribeVisibleLogicalRangeChange(yenile); ch.timeScale().subscribeSizeChange(yenile); } catch (_) { }
        try { new ResizeObserver(yenile).observe(kap); } catch (_) { }
        setTimeout(yenile, 60);
      }
      const ksBul = t => KS.find(k => k.t === t);
      const ksYaz = k => k ? `<b style="color:${k.yon > 0 ? up : down}">${k.yon > 0 ? '▲ trend bandı yukarı kesildi' : '▼ trend bandı aşağı kesildi'}</b> · ` : '';
      /* v1.5 · tam ekran (⤢) — grafik sayfanın üstüne taşınır, ✕ / Esc ile yerine döner */
      let fs = null, fsIp = null, yer = null;
      const fsKapa = () => { if (!fs) return; if (yer && yer.p) yer.p.insertBefore(kap, yer.n); fs.remove(); fs = null; fsIp = null; document.documentElement.style.overflow = yer ? yer.of : ''; removeEventListener('keydown', fsTus); yenile(); };
      const fsTus = e => { if (e.key === 'Escape') fsKapa(); };
      const fsAc = () => { if (fs) return; yer = { p: kap.parentNode, n: kap.nextSibling, of: document.documentElement.style.overflow };
        fs = document.createElement('div'); fs.className = 'hcg-fs'; fs.setAttribute('role', 'dialog');
        fs.innerHTML = `<div class="hcg-ust"><div class="hcg-ad"></div><div class="hcg-ip"></div><button type="button" class="hcg-x" aria-label="Kapat">✕</button></div><div class="hcg-alan"></div>`;
        fs.querySelector('.hcg-ad').textContent = o.baslik || ''; fsIp = fs.querySelector('.hcg-ip'); fsIp.innerHTML = (o.ip && o.ip.innerHTML) || '';
        fs.querySelector('.hcg-x').onclick = e => { e.stopPropagation(); fsKapa(); }; fs.addEventListener('click', e => e.stopPropagation());
        document.body.appendChild(fs); fs.querySelector('.hcg-alan').appendChild(kap); document.documentElement.style.overflow = 'hidden'; addEventListener('keydown', fsTus); yenile(); };
      if (o.tamEkran !== false) { const b = document.createElement('button'); b.type = 'button'; b.className = 'hcg-tb'; b.title = 'Tam ekran'; b.setAttribute('aria-label', 'Grafiği tam ekran aç'); b.textContent = '⤢';
        b.onclick = e => { e.stopPropagation(); fsAc(); }; kap.appendChild(b); }
      /* bilgi satırı */
      if (o.ip) {
        const varsay = o.ipVarsayilan || o.ip.innerHTML;
        ch.subscribeCrosshairMove(p => {
          const yaz = x => { o.ip.innerHTML = x; if (fsIp) fsIp.innerHTML = x; };
          if (!p || !p.time || !p.seriesData) { yaz(varsay); return; }
          const d = p.seriesData.get(seri); if (!d) { yaz(varsay); return; }
          const kap_ = d.close != null ? d.close : d.value, isr = M.filter(m => m.time === p.time);
          yaz(ksYaz(ksBul(p.time)) + (o.tooltip ? o.tooltip({ time: p.time, fiyat: kap_, son: v[v.length - 1], isaret: isr, mum: d.open != null ? d : null, gunOnce: Math.round((zaman[zaman.length - 1] - p.time) / GUN) }) : String(kap_)));
        });
      }
      return { ch, seri, mum: !!mumlar, kesisim: KS.length, sil() { fsKapa(); cancelAnimationFrame(rafI); try { ch.remove(); } catch (_) { } } };
    }
  };
  window.HCG = HCG;
})();
