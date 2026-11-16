/*! HC · PULSE 3B arka plan "sinir alanı" (v1 · 15.11.2026) — three.js (lib/hc3.js, yalnız gereken parçalar)
 * © 2026 Türker HC · HC — Tüm hakları saklıdır.
 * Ekran kartıyla çizilen, yavaş dönen 3 boyutlu parçacık bulutu + aralarında ince bağlar; rengi sahnenin vurgu rengine yumuşakça geçer.
 * WebGL yoksa, "hareketi azalt" açıksa ya da kütüphane yüklenemezse hiçbir şey yapmaz (sayfa eski 2B arka planla devam eder).
 */
(function () {
  'use strict';
  const HCAlan = {
    kok: 'lib/',
    destek() {
      try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false; const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
    },
    yukle() {
      if (window.HC3) return Promise.resolve(true);
      return new Promise(res => { const s = document.createElement('script'); s.src = HCAlan.kok + 'hc3.js'; s.async = true; s.onload = () => res(!!window.HC3); s.onerror = () => res(false); document.head.appendChild(s); });
    },
    /* kap: arka planın konacağı öğe · renkF(): '#rrggbb' döndürür · koyuF(): koyu tema mı */
    async kur(kap, renkF, koyuF) {
      if (!kap || !HCAlan.destek() || !(await HCAlan.yukle())) return null;
      const T = window.HC3;
      let r;
      try { r = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' }); } catch (_) { return null; }
      const cv = r.domElement; cv.className = 'alan3b'; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 1.2s';
      kap.insertBefore(cv, kap.firstChild ? kap.firstChild.nextSibling : null);
      r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
      const sahne = new T.Scene(), kam = new T.PerspectiveCamera(55, 1, .1, 100); kam.position.set(0, 0, 9);
      sahne.fog = new T.FogExp2(0x000000, .085);
      /* yumuşak yuvarlak nokta dokusu */
      const tc = document.createElement('canvas'); tc.width = tc.height = 64; const g = tc.getContext('2d'), rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.25, 'rgba(255,255,255,.8)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
      const doku = new T.CanvasTexture(tc);
      const N = innerWidth < 700 ? 900 : 1600, P = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {                      /* katmanlı küresel kabuk + dağınık bulut */
        const u = Math.random(), v = Math.random(), th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rr = i % 3 ? 3.2 + Math.random() * 1.6 : 1 + Math.random() * 6;
        P[i * 3] = rr * Math.sin(ph) * Math.cos(th); P[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th) * .7; P[i * 3 + 2] = rr * Math.cos(ph);
      }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3));
      const mat = new T.PointsMaterial({ size: .11, map: doku, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color('#38d8ff'), opacity: .9 });
      const grp = new T.Group(); grp.add(new T.Points(geo, mat));
      /* yakın komşular arasında ince bağlar (bir kez hesaplanır) */
      const B = []; const M = Math.min(N, 420);
      for (let i = 0; i < M && B.length < 2400; i++) for (let j = i + 1; j < M; j++) {
        const dx = P[i * 3] - P[j * 3], dy = P[i * 3 + 1] - P[j * 3 + 1], dz = P[i * 3 + 2] - P[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < .9) B.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], P[j * 3], P[j * 3 + 1], P[j * 3 + 2]);
      }
      const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.BufferAttribute(new Float32Array(B), 3));
      const lm = new T.LineBasicMaterial({ color: new T.Color('#38d8ff'), transparent: true, opacity: .12, blending: T.AdditiveBlending, depthWrite: false });
      grp.add(new T.LineSegments(lg, lm)); sahne.add(grp);
      const hedef = new T.Color('#38d8ff');
      let W = 0, H = 0, fx = 0, fy = 0, mx = 0, my = 0, dur = false, son = 0;
      const boyut = () => { const b = kap.getBoundingClientRect(); if (b.width === W && b.height === H) return; W = b.width; H = b.height; r.setSize(W, H, false); kam.aspect = W / Math.max(1, H); kam.updateProjectionMatrix(); };
      addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
      const t0 = performance.now();
      const dongu = now => {
        if (dur || !cv.isConnected) return; requestAnimationFrame(dongu);
        if (document.hidden || now - son < 30) return; son = now; boyut();
        const t = (now - t0) / 1000, koyu = koyuF ? koyuF() : true;
        try { hedef.set(renkF() || '#38d8ff'); } catch (_) { }
        mat.color.lerp(hedef, .03); lm.color.lerp(hedef, .03);
        mat.blending = lm.blending = koyu ? T.AdditiveBlending : 1;          /* açık temada normal karışım (beyazda kaybolmasın) */
        mat.opacity = koyu ? .9 : .55; lm.opacity = koyu ? .12 : .1;
        fx += (mx - fx) * .04; fy += (my - fy) * .04;
        grp.rotation.y = t * .045 + fx * .5; grp.rotation.x = Math.sin(t * .05) * .18 + fy * .3;
        kam.position.z = 9 + Math.sin(t * .11) * .6;
        r.render(sahne, kam);
        if (cv.style.opacity !== '1') cv.style.opacity = '1';
      };
      requestAnimationFrame(dongu);
      return { cv, durdur() { dur = true; try { r.dispose(); cv.remove(); } catch (_) { } } };
    }
  };
  window.HCAlan = HCAlan;
})();
