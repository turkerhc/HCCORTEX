/*! HC · ortak grafik (v1 · 15.11.2026) — TradingView Lightweight Charts™ v5 üzerine · CORTEX + ORBIT
 * © 2026 Türker Hacıoğulları · HC — Tüm hakları saklıdır.
 * Kripto: Binance'in herkese açık günlük mumları (önce spot, yoksa vadeli) · alınamazsa sayfanın kendi kapanış serisi (çizgi).
 * Katmanlar: trend bandı (orta + alt/üst) · ▲▼ işaretleri · ◆ dip → ◆ orta çizgi (kesik bağ) · yatay seviyeler.
 * Kütüphane yalnız grafik açılınca yüklenir (lib/lwc.js). Yüklenemezse sayfa eski çizimini kullanır.
 */
(function () {
  'use strict';
  const GUN = 86400, MUM = new Map();
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
    async mum(sym, adet) {
      if (!/^[A-Z0-9]{2,20}USDT$/.test(sym || '')) return null;
      const k = sym + '|' + (adet || 365), o = MUM.get(k);
      if (o && Date.now() - o.t < 10 * 60e3) return o.v;
      const yollar = [`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1d&limit=${adet || 365}`,
                      `https://fapi.binance.com/fapi/v1/klines?symbol=${sym}&interval=1d&limit=${adet || 365}`];
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
    renk(ad, yedek) { try { const v = getComputedStyle(document.documentElement).getPropertyValue(ad).trim(); return v || yedek; } catch (_) { return yedek; } },
    /* o: {v (kapanışlar), son (son mum zamanı, sn), borsa, sym, mumAc, PB, fmt, band:{nb,nw}, mk:[[barsAgo,yon,ts?]], dc:[[...]], dcAc, yonAc,
           cizgi:[{f,renk,ad}], ip (öğe), etiket:{u,d,dip,tepe}, gorunen (son kaç mum görünsün), tooltip(fn)} */
    async ciz(kap, o) {
      if (!kap || !(await HCG.yukle())) return null;
      const L = window.LightweightCharts;
      const v = (o.v || []).map(Number).filter(q => isFinite(q) && q > 0);
      if (v.length < 2) return null;
      const T = HCG.zamanlar(v.length, o.son, o.borsa);
      let mumlar = null;
      if (o.mumAc && o.sym && !o.borsa) mumlar = await HCG.mum(o.sym, 365);
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
        localization: { locale: 'tr-TR', priceFormatter: p => (o.PB || '') + fmt(p) }
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
      if (o.band && o.band.nb && o.band.nw > 0) {
        const nb = o.band.nb.slice(-v.length), off = v.length - nb.length, nw = o.band.nw, bc = v[v.length - 1] >= nb[nb.length - 1] ? up : '#9b7bff';
        const nok = (k, d) => { const out = [], gor = new Set(); nb.forEach((q, i) => { const t = mumlar ? yakin(T[i + off]) : T[i + off]; if (t == null || gor.has(t) || !(q + d > 0)) return; gor.add(t); out.push({ time: t, value: q + d }); }); return out.sort((a, b) => a.time - b.time); };
        const op = { lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false };
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .6), lineWidth: 1, lineStyle: 2 }, op)).setData(nok(0, 0));
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .25), lineWidth: 1 }, op)).setData(nok(1, nw));
        ch.addSeries(L.LineSeries, Object.assign({ color: HCG.alfa(bc, .25), lineWidth: 1 }, op)).setData(nok(-1, -nw));
      }
      /* yatay seviyeler (giriş / stop / hedef · CORTEX) */
      (o.cizgi || []).forEach(c => { if (c && c.f > 0) seri.createPriceLine({ price: c.f, color: c.renk || cy, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: c.ad || '' }); });
      /* işaretler */
      const M = [], E = o.etiket || {};
      if (o.yonAc && o.mk) o.mk.forEach(q => { const t = q[2] ? yakin(q[2]) : barT(q[0]); if (t == null) return;
        M.push(q[1] > 0 ? { time: t, position: 'belowBar', color: cy, shape: 'arrowUp', text: '' } : { time: t, position: 'aboveBar', color: down, shape: 'arrowDown', text: '' }); });
      const bag = [];
      if (o.dcAc && o.dc) o.dc.forEach(q => {
        const t0 = q[0] ? yakin(q[0]) : barT(q[6]), t1 = q[2] ? yakin(q[2]) : (q[7] != null ? barT(q[7]) : null);
        if (t0 != null) M.push({ time: t0, position: 'belowBar', color: '#9b7bff', shape: 'circle', text: '◆' });
        if (t1 != null) M.push({ time: t1, position: 'aboveBar', color: '#ffb03b', shape: 'circle', text: (q[5] >= 0 ? '+' : '−') + '%' + Math.abs(Math.round((q[5] || 0) * 100)) });
        if (t0 != null && q[1] > 0) bag.push([t0, q[1], t1 != null ? t1 : zaman[zaman.length - 1], t1 != null ? q[3] : v[v.length - 1], q[5] > 0 ? up : down]);
      });
      bag.forEach(b => { if (b[2] <= b[0]) return; ch.addSeries(L.LineSeries, { color: HCG.alfa(b[4], .75), lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false }).setData([{ time: b[0], value: b[1] }, { time: b[2], value: b[3] }]); });
      M.sort((a, b) => a.time - b.time);
      try { if (M.length) L.createSeriesMarkers(seri, M); } catch (_) { }
      /* görünen aralık */
      const g = Math.min(o.gorunen || v.length, zaman.length);
      try { ch.timeScale().setVisibleLogicalRange({ from: zaman.length - g - .5, to: zaman.length - 1 + 3 }); } catch (_) { }
      /* bilgi satırı */
      if (o.ip) {
        const varsay = o.ipVarsayilan || o.ip.innerHTML;
        ch.subscribeCrosshairMove(p => {
          if (!p || !p.time || !p.seriesData) { o.ip.innerHTML = varsay; return; }
          const d = p.seriesData.get(seri); if (!d) { o.ip.innerHTML = varsay; return; }
          const kap_ = d.close != null ? d.close : d.value, isr = M.filter(m => m.time === p.time);
          o.ip.innerHTML = o.tooltip ? o.tooltip({ time: p.time, fiyat: kap_, son: v[v.length - 1], isaret: isr, mum: d.open != null ? d : null, gunOnce: Math.round((zaman[zaman.length - 1] - p.time) / GUN) }) : String(kap_);
        });
      }
      return { ch, seri, mum: !!mumlar, sil() { try { ch.remove(); } catch (_) { } } };
    }
  };
  window.HCG = HCG;
})();
