/*! HC · ortak animasyon (v1 · 15.11.2026) — GSAP üzerine · CORTEX + ORBIT + PULSE
 * © 2026 Türker HC · HC — Tüm hakları saklıdır.
 * GSAP yalnız ilk kullanımda yüklenir (lib/gsap.js). "Hareketi azalt" açıksa hiçbir şey oynatılmaz.
 * Kütüphane yüklenemezse sayfalar animasyonsuz ama eksiksiz çalışır.
 */
(function () {
  'use strict';
  const AZ = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };
  let yuk = null;
  const HCA = {
    kok: 'lib/',
    yukle() {
      if (window.gsap) return Promise.resolve(true);
      if (yuk) return yuk;
      yuk = new Promise(res => { const s = document.createElement('script'); s.src = HCA.kok + 'gsap.js'; s.async = true; s.onload = () => res(true); s.onerror = () => { yuk = null; res(false); }; document.head.appendChild(s); });
      return yuk;
    },
    /* kartlar / bloklar sırayla gelir */
    async akis(els, o) {
      if (AZ()) return; const L = [...(els || [])].filter(e => e && e.getBoundingClientRect && e.offsetParent !== null); if (!L.length) return;
      if (!(await HCA.yukle())) return;
      o = o || {};
      gsap.killTweensOf(L);
      gsap.fromTo(L, { y: o.y == null ? 14 : o.y, opacity: 0, scale: o.olcek || 1 },
        { y: 0, opacity: 1, scale: 1, duration: o.sure || .45, ease: 'power3.out', stagger: o.ara == null ? .05 : o.ara, overwrite: true, clearProps: 'transform,opacity' });
    },
    /* pencere / sayfa açılışı */
    async ac(el, o) {
      if (AZ() || !el) return; if (!(await HCA.yukle())) return; o = o || {};
      gsap.fromTo(el, { y: o.y == null ? 26 : o.y, opacity: .0, scale: o.olcek || .985 }, { y: 0, opacity: 1, scale: 1, duration: o.sure || .42, ease: 'expo.out', overwrite: true, clearProps: 'transform,opacity' });
    },
    /* başlık kelimeleri aşağıdan yukarı (PULSE sahne başlıkları) */
    async baslik(el, o) {
      if (AZ() || !el || el.dataset.hca) return; if (!(await HCA.yukle())) return; o = o || {};
      const parca = []; const yuru = n => { [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
          const d = document.createElement('span'); d.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top'; const i = document.createElement('span'); i.style.display = 'inline-block'; i.textContent = w; d.appendChild(i); f.appendChild(d); parca.push(i); }); c.replaceWith(f); }
        else if (c.nodeType === 1 && !/^(BR|CANVAS|SVG)$/i.test(c.tagName)) {
          const cs = getComputedStyle(c);
          if (/text/.test(cs.webkitBackgroundClip || '') || /text/.test(cs.backgroundClip || '')) {   /* degrade yazı: bölünmez, tek parça kayar */
            const d = document.createElement('span'); d.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top'; c.replaceWith(d); d.appendChild(c); c.style.display = 'inline-block'; parca.push(c);
          } else yuru(c); } }); };
      yuru(el); el.dataset.hca = '1';
      gsap.fromTo(parca, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: o.sure || .7, ease: 'power4.out', stagger: o.ara || .06, delay: o.gecikme || 0 });
    },
    /* sayı akışı: metindeki sayıyı 0'dan (ya da önceki değerden) hedefe saydırır, biçimi korur */
    async say(el, o) {
      if (AZ() || !el) return; const m = /(-?[\d.]+(?:,\d+)?)/.exec(el.textContent || ''); if (!m) return;
      if (!(await HCA.yukle())) return; o = o || {};
      const ham = m[1], ond = ham.includes(',') ? ham.split(',')[1].length : 0, hedef = parseFloat(ham.replace(/\./g, '').replace(',', '.'));
      if (!isFinite(hedef)) return; const on = el.textContent.slice(0, m.index), son = el.textContent.slice(m.index + ham.length), st = { v: o.bas || 0 };
      gsap.to(st, { v: hedef, duration: o.sure || 1.1, ease: 'power2.out', onUpdate() { el.textContent = on + st.v.toLocaleString('tr-TR', { minimumFractionDigits: ond, maximumFractionDigits: ond }) + son; } });
    }
  };
  window.HCA = HCA;
})();
