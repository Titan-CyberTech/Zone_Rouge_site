(function () {
  "use strict";
  window.__zr = 1;
  var d = document, root = d.documentElement;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  var REPO = "Titan-CyberTech/Zone_Rouge";
  var mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  var fine = window.matchMedia ? matchMedia("(hover: hover) and (pointer: fine)").matches : false;
  var raf = window.requestAnimationFrame ? function (f) { return requestAnimationFrame(f); } : function (f) { return setTimeout(f, 16); };
  var hasIO = "IntersectionObserver" in window;
  function reduit() { return !!(mq && mq.matches) || root.classList.contains("calme"); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n, l) { n = String(n); while (n.length < l) n = "0" + n; return n; }
  function vue(els, fn, opt) {
    if (!hasIO) { els.forEach(function (e) { fn(e, true); }); return null; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { fn(en.target, en.isIntersecting); }); }, opt || {});
    els.forEach(function (e) { io.observe(e); });
    return io;
  }

  /* ---------- menu sur téléphone */
  var h = $("header"), burger = $("#burger");
  function fermer() { if (h && h.classList.contains("open")) { h.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } }
  if (h && burger) {
    burger.addEventListener("click", function () {
      var o = h.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && h.classList.contains("open")) { fermer(); burger.focus(); } });
    d.addEventListener("click", function (e) { if (h.classList.contains("open") && !h.contains(e.target)) fermer(); });
    $$("#menu a").forEach(function (a) { a.addEventListener("click", fermer); });
  }

  /* ---------- animations réduites (en plus du réglage du système) */
  var cb = $("[data-calme]");
  if (cb) {
    if (mq && mq.matches) { cb.hidden = true; }
    else {
      cb.setAttribute("aria-pressed", root.classList.contains("calme") ? "true" : "false");
      cb.addEventListener("click", function () {
        var on = !root.classList.contains("calme");
        root.classList.toggle("calme", on);
        cb.setAttribute("aria-pressed", on ? "true" : "false");
        try { localStorage.setItem("zr-calme", on ? "1" : "0"); } catch (e) {}
        $$("[data-r],[data-io],.m").forEach(function (e) { e.classList.add("in"); });
        $$(".arme,.coll").forEach(function (p) { if (!p.hidden) p.classList.add("on"); });
      });
    }
  }

  /* ---------- apparition au défilement */
  var rv = $$("[data-r],[data-io],.m");
  if (!hasIO || reduit()) {
    rv.forEach(function (e) { e.classList.add("in"); });
  } else {
    var ioR = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ioR.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (e) { ioR.observe(e); });
  }

  /* ---------- chiffres qui comptent */
  $$("[data-count]").forEach(function (el) {
    var to = +el.getAttribute("data-count"), dur = +(el.getAttribute("data-dur") || 1500), wait = +(el.getAttribute("data-wait") || 0), done = false;
    if (reduit()) return;
    el.textContent = "0";
    function lancer() {
      if (done) return; done = true;
      setTimeout(function () {
        var t0 = null;
        function pas(t) {
          if (t0 === null) t0 = t;
          var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(to * e);
          if (p < 1) raf(pas);
        }
        raf(pas);
      }, wait);
    }
    vue([el], function (e, on) { if (on) lancer(); }, { threshold: 0.4 });
  });

  /* ---------- projecteur sous le curseur */
  if (fine) {
    d.addEventListener("pointermove", function (e) {
      var t = e.target && e.target.closest ? e.target.closest(".spot") : null;
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      t.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    }, { passive: true });
    /* léger effet de profondeur dans les vitrines */
    $$(".vitrine").forEach(function (v) {
      var run = false, tx = 0, ty = 0, cx = 0, cy = 0;
      function boucle() {
        cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
        v.style.setProperty("--tx", cx.toFixed(3)); v.style.setProperty("--ty", cy.toFixed(3));
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf(boucle); else run = false;
      }
      v.addEventListener("pointermove", function (e) {
        if (reduit()) return;
        var r = v.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!run) { run = true; raf(boucle); }
      }, { passive: true });
      v.addEventListener("pointerleave", function () { tx = 0; ty = 0; if (!run) { run = true; raf(boucle); } });
    });
  }

  /* ---------- bandeau d'accueil : parallaxe, viseur, zone qui se resserre */
  var hero = $(".hero");
  if (hero) {
    var rx = $("[data-x]", hero), ry = $("[data-y]", hero), lect = $(".lecture", hero);
    if (!fine && lect) lect.hidden = true;
    if (fine) {
      var htx = 0, hty = 0, hcx = 0, hcy = 0, hrun = false;
      var hboucle = function () {
        hcx += (htx - hcx) * 0.07; hcy += (hty - hcy) * 0.07;
        hero.style.setProperty("--mx", hcx.toFixed(4)); hero.style.setProperty("--my", hcy.toFixed(4));
        if (Math.abs(htx - hcx) > 0.001 || Math.abs(hty - hcy) > 0.001) raf(hboucle); else hrun = false;
      };
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        if (rx) { rx.textContent = pad(Math.round(px), 4); ry.textContent = pad(Math.round(py), 4); }
        if (reduit()) return;
        htx = (px / r.width - 0.5) * 2; hty = (py / r.height - 0.5) * 2;
        if (!hrun) { hrun = true; raf(hboucle); }
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { htx = 0; hty = 0; if (!hrun) { hrun = true; raf(hboucle); } });
    }
  }

  /* ---------- frise des versions */
  var tl = $(".versions"), arts = tl ? $$("article", tl) : [];
  function frise() {
    var r = tl.getBoundingClientRect(), ligne = window.innerHeight * 0.62;
    tl.style.setProperty("--tp", clamp((ligne - r.top) / r.height, 0, 1).toFixed(4));
    arts.forEach(function (a) { a.classList.toggle("on", a.getBoundingClientRect().top + 48 <= ligne); });
  }

  /* ---------- défilement : barre de progression, en-tête, zone du bandeau, frise */
  var tick = false;
  function frame() {
    tick = false;
    var y = window.pageYOffset || root.scrollTop;
    if (h) {
      h.classList.toggle("scrolled", y > 8);
      var m = root.scrollHeight - window.innerHeight;
      h.style.setProperty("--p", m > 0 ? clamp(y / m, 0, 1).toFixed(4) : "0");
    }
    if (hero && !reduit()) {
      var hh = hero.offsetHeight || 1;
      if (y < hh * 1.3) hero.style.setProperty("--zs", clamp(y / hh, 0, 1).toFixed(4));
    }
    if (tl) frise();
  }
  function surDefilement() { if (!tick) { tick = true; raf(frame); } }
  window.addEventListener("scroll", surDefilement, { passive: true });
  window.addEventListener("resize", surDefilement);
  window.addEventListener("load", frame);
  frame();

  /* ---------- onglets (armes, collections) */
  function onglets(liste, onSel) {
    var ts = $$('[role="tab"]', liste);
    if (!ts.length) return null;
    var vertical = liste.getAttribute("aria-orientation") === "vertical";
    function select(t, focus, quiet) {
      ts.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        var p = d.getElementById(x.getAttribute("aria-controls"));
        if (p && !on) { p.hidden = true; p.classList.remove("on"); }
      });
      var p2 = d.getElementById(t.getAttribute("aria-controls"));
      if (focus) t.focus();
      if (p2) onSel(t, p2, quiet);
    }
    ts.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = -1;
        var prev = vertical ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft", "ArrowUp"];
        if (k === "Home") n = 0; else if (k === "End") n = ts.length - 1;
        else if (prev.indexOf(k) > -1) n = (i - 1 + ts.length) % ts.length;
        else if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % ts.length;
        if (n > -1) { e.preventDefault(); select(ts[n], true); }
      });
    });
    return { ts: ts, select: select };
  }
  /* affiche un panneau : on attend l'image pour que l'entrée soit visible */
  function montrer(p, scene) {
    p.hidden = false;
    var im = $("img", p);
    var go = function () { raf(function () { raf(function () { if (!p.hidden) p.classList.add("on"); }); }); };
    if (reduit() || !im) { p.classList.add("on"); return; }
    if (im.complete) go();
    else { im.loading = "eager"; if (im.decode) im.decode().then(go, go); else im.addEventListener("load", go); }
  }
  function scene(sel, sels) {
    var s = $(sel);
    if (!s) return;
    var liste = $(sels, d), vu = false, depart = null;
    var o = onglets(liste, function (t, p, quiet) {
      if (!quiet) { try { history.replaceState(null, "", "#" + t.getAttribute("data-id")); } catch (e) {} }
      if (vu || !hasIO) montrer(p); else { p.hidden = false; depart = p; }
    });
    if (!o) return;
    function viseur() { return location.hash ? o.ts.filter(function (t) { return "#" + t.getAttribute("data-id") === location.hash; })[0] : null; }
    /* une adresse comme arsenal.html#longbow n'a pas d'élément du même nom : on amène nous-mêmes la scène à l'écran */
    function amener() {
      var z = s.closest("section") || s;
      try { z.scrollIntoView({ behavior: "instant", block: "start" }); } catch (e) { z.scrollIntoView(); }
    }
    var cible = viseur();
    if (cible) {
      o.select(cible, false, true);
      var nav = (window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
      if (!nav.type || nav.type === "navigate") raf(amener);
    }
    else { var cur = o.ts.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || o.ts[0]; depart = d.getElementById(cur.getAttribute("aria-controls")); }
    window.addEventListener("hashchange", function () { var c = viseur(); if (c) { o.select(c, false, true); amener(); } });
    vue([s], function (e, on) { if (on && !vu) { vu = true; var p = $('[role="tabpanel"]:not([hidden])', s); if (p) montrer(p); } }, { threshold: 0.15 });
    /* précharge les images des autres onglets quand on s'approche */
    vue([s], function (e, on) {
      if (!on) return;
      $$("img", s).forEach(function (im) { im.loading = "eager"; });
    }, { rootMargin: "700px 0px" });
  }
  scene(".expl-scene", ".expl-liste");
  scene(".coll-scene", ".coll-tabs [role=\"tablist\"]");

  /* ---------- variantes de couleur d'une collection */
  function echange(im, src) {
    if (!im || im.getAttribute("src") === src) return;
    var n = new Image();
    n.onload = function () {
      if (reduit()) { im.src = src; return; }
      im.style.opacity = "0";
      setTimeout(function () { im.src = src; im.style.opacity = ""; }, 150);
    };
    n.src = src;
  }
  $$(".coll").forEach(function (c) {
    var bs = $$(".vars button", c), a = $(".arme-i", c), k = $(".couteau-i", c), nom = $(".nom", c), done = false;
    function pre() {
      if (done) return; done = true;
      bs.forEach(function (b) { new Image().src = b.getAttribute("data-src"); new Image().src = b.getAttribute("data-knife"); });
    }
    bs.forEach(function (b) {
      b.addEventListener("pointerenter", pre); b.addEventListener("focus", pre);
      b.addEventListener("click", function () {
        pre();
        bs.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        c.style.setProperty("--acc", b.getAttribute("data-a"));
        echange(a, b.getAttribute("data-src")); echange(k, b.getAttribute("data-knife"));
        if (a) a.alt = b.getAttribute("data-alt");
        if (nom) nom.textContent = b.getAttribute("data-name");
      });
    });
  });

  /* ---------- soldat à faire tourner (16 vues, fondu entre deux vues voisines) */
  var vv = $(".vue3d");
  if (vv) {
    var cadre = $(".frames", vv), N = +vv.getAttribute("data-n") || 16, BLEND = true, look = vv.getAttribute("data-look") || "olive";
    var imgs = [], affiches = [], pos = 0, auto = !reduit(), actif = false, last = 0, drag = null, vit = 0, bOn = false, jeton = 0;
    var libelles = {};
    $$(".tenue").forEach(function (b) { libelles[b.getAttribute("data-look")] = b.getAttribute("data-alt"); });
    var pret = function (im) { return !!im && im.complete && im.naturalWidth > 0; };
    var pxFrame = function () { return Math.max(280, vv.clientWidth) / 1.3 / N; };
    function dessiner() {
      var p = ((pos % N) + N) % N, i = Math.floor(p), f = p - i, j = (i + 1) % N, voulu = [], ops = [];
      if (pret(imgs[i])) { voulu.push(i); ops.push(1); }
      if (BLEND && f > 0.03 && voulu.length && pret(imgs[j])) { voulu.push(j); ops.push(f); }
      if (!voulu.length) return;
      affiches.forEach(function (k) { if (voulu.indexOf(k) < 0) imgs[k].style.opacity = "0"; });
      voulu.forEach(function (k, n) { imgs[k].style.opacity = String(ops[n]); imgs[k].style.zIndex = n ? "2" : "1"; });
      affiches = voulu;
    }
    function construire(l) {
      var mon = ++jeton, neufs = [], frag = d.createDocumentFragment();
      for (var i = 0; i < N; i++) {
        var im = new Image();
        im.decoding = "async"; im.draggable = false; im.alt = i === 0 ? (libelles[l] || "") : "";
        im.src = "img/soldats/" + l + "-" + pad(i, 2) + ".webp";
        frag.appendChild(im); neufs.push(im);
      }
      var go = function () {
        if (mon !== jeton) return;
        look = l; cadre.innerHTML = ""; cadre.appendChild(frag); imgs = neufs; affiches = []; dessiner();
      };
      var c = neufs[((Math.round(pos) % N) + N) % N];
      if (pret(c)) go(); else { c.onload = go; c.onerror = go; }
    }
    function boucle(t) {
      bOn = false;
      if (!actif) { last = 0; return; }
      if (!last) last = t;
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (drag) { /* le doigt mène */ }
      else if (Math.abs(vit) > 0.05) { pos += vit * dt; vit *= Math.pow(0.05, dt); }
      else if (auto && !reduit()) { pos += (N / 6.8) * dt; }
      else { last = 0; dessiner(); return; }
      dessiner(); bOn = true; raf(boucle);
    }
    function relancer() { if (!bOn) { bOn = true; last = 0; raf(boucle); } }
    var construit = false;
    vue([vv], function (e, on) { if (on && !construit) { construit = true; construire(look); } }, { rootMargin: "600px 0px" });
    vue([vv], function (e, on) { actif = on; if (on) relancer(); }, { threshold: 0.2 });
    var x0 = 0, p0 = 0, lx = 0, lt = 0;
    vv.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      drag = true; auto = false; vit = 0; x0 = lx = e.clientX; p0 = pos; lt = performance.now();
      vv.classList.add("drag", "vu");
      try { vv.setPointerCapture(e.pointerId); } catch (er) {}
      relancer();
    });
    vv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var px = pxFrame(), now = performance.now(), dtm = Math.max(1, now - lt);
      pos = p0 + (e.clientX - x0) / px;
      vit = (((e.clientX - lx) / px) / (dtm / 1000)) * 0.4 + vit * 0.6; lx = e.clientX; lt = now;
      dessiner();
    });
    function fin() { if (!drag) return; drag = null; vv.classList.remove("drag"); relancer(); }
    vv.addEventListener("pointerup", fin); vv.addEventListener("pointercancel", fin);
    vv.addEventListener("keydown", function (e) {
      var s = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      if (!s) return;
      e.preventDefault(); auto = false; vit = 0; vv.classList.add("vu"); pos = Math.round(pos) + s; dessiner();
    });
    $$(".tenue").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".tenue").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var l = b.getAttribute("data-look");
        if (l !== look) construire(l);
      });
    });
  }

  /* ---------- visionneuse de captures */
  var lb = $("#lb");
  if (lb && lb.showModal) {
    var vignettes = $$(".vis .cadre"), idx = 0, li = $("img", lb), lt = $(".t", lb), lc = $(".cmp", lb);
    var ouvrir = function (i) {
      idx = (i + vignettes.length) % vignettes.length;
      var im = $("img", vignettes[idx]), fig = vignettes[idx].closest("figure");
      li.src = im.getAttribute("src"); li.alt = im.alt;
      lt.textContent = fig ? $("figcaption span", fig).textContent : "";
      lc.textContent = (idx + 1) + " / " + vignettes.length;
      if (!lb.open) lb.showModal();
    };
    vignettes.forEach(function (b, i) { b.addEventListener("click", function () { ouvrir(i); }); });
    $(".lb-x", lb).addEventListener("click", function () { lb.close(); });
    $(".lb-p", lb).addEventListener("click", function () { ouvrir(idx - 1); });
    $(".lb-n", lb).addEventListener("click", function () { ouvrir(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); ouvrir(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); ouvrir(idx + 1); }
    });
    var sx = null;
    lb.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    lb.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 60 && e.target.closest && !e.target.closest("button")) ouvrir(dx < 0 ? idx + 1 : idx - 1);
    });
  }

  /* ---------- chrono de la bombe */
  var bo = $("[data-bombe]");
  if (bo) {
    var num = $(".num", bo), T = 40, rem = 40, bl = 0, bvis = false, bon = false, flash = 0, bbtn = $(".btn.prim", bo.closest(".cta"));
    var peindre = function () {
      bo.style.setProperty("--o", (326.7 * (1 - rem / T)).toFixed(1));
      var s = Math.ceil(rem - 0.0001);
      num.textContent = "0:" + pad(clamp(s, 0, 99), 2);
    };
    var bpas = function (t) {
      bon = false;
      if (!bvis || reduit()) { bl = 0; return; }
      if (!bl) bl = t;
      var dt = Math.min(0.1, (t - bl) / 1000); bl = t;
      if (flash > 0) {
        flash -= dt;
        if (flash <= 0) { bo.classList.remove("boum"); rem = T; }
      } else {
        rem -= dt;
        if (rem <= 0) {
          rem = 0; flash = 1.5; bo.classList.add("boum");
          if (bbtn) { bbtn.classList.remove("alerte"); void bbtn.offsetWidth; bbtn.classList.add("alerte"); }
        }
      }
      peindre(); bon = true; raf(bpas);
    };
    if (reduit()) { rem = T; peindre(); }
    else rem = 11.6;
    peindre();
    vue([bo], function (e, on) { bvis = on; if (on && !bon) { bon = true; bl = 0; raf(bpas); } }, { threshold: 0.3 });
  }

  /* ---------- ouvre la question visée par l'adresse (#windows, #gratuit…) */
  function ouvrirQuestion() {
    if (!location.hash) return;
    var q = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (q && q.tagName === "DETAILS") q.open = true;
  }
  ouvrirQuestion();
  window.addEventListener("hashchange", ouvrirQuestion);

  /* ---------- système du visiteur */
  var ua = navigator.userAgent || "", plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  var mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  var ipad = /Mac/i.test(plat + ua) && navigator.maxTouchPoints > 1;
  var os = (mobile || ipad) ? "" : (/Win/i.test(plat + ua) ? "win" : (/Mac/i.test(plat + ua) ? "mac" : (/Linux|X11/i.test(plat + ua) ? "lin" : "")));
  var NOM = { win: "Windows", mac: "Mac", lin: "Linux" };
  if (os) {
    var carte = $("#sys-" + os);
    if (carte) {
      carte.classList.add("pour-toi");
      /* le bouton principal (rouge) suit le système du visiteur */
      $$(".sys .btn").forEach(function (b) { b.classList.toggle("prim", b.closest(".sys") === carte); });
    }
    $$("[data-adapt]").forEach(function (a) {
      var t = a.querySelector(".t"), f = a.querySelector(".fl");
      if (t) t.textContent = "Télécharger pour " + NOM[os];
      if (f) f.textContent = "";
    });
  }

  /* ---------- dernière version publiée sur GitHub */
  function mo(n) { return Math.round(n / 1048576) + " Mo"; }
  /* nom de fichier : on garde des points de coupure après chaque _ pour qu'il ne se casse pas au milieu du numéro de version */
  function nomFichier(e, nom) {
    e.textContent = "";
    nom.split("_").forEach(function (part, i, tab) {
      var dernier = i === tab.length - 1;
      e.appendChild(document.createTextNode(dernier ? part : part + "_"));
      if (!dernier) e.appendChild(document.createElement("wbr"));
    });
  }
  try {
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !j.assets) return;
        var v = (j.tag_name || "").replace(/^v/, "");
        if (v) $$("[data-ver]").forEach(function (e) { e.textContent = v; });
        j.assets.forEach(function (a) {
          if (!/\.zip$/i.test(a.name)) return;
          var k = /linux/i.test(a.name) ? "lin" : (/mac/i.test(a.name) ? "mac" : (/windows/i.test(a.name) ? "win" : null)); if (!k) return;
          $$('[data-dl="' + k + '"]').forEach(function (e) { e.setAttribute("href", a.browser_download_url); var f = e.querySelector(".fl"); if (f) f.textContent = mo(a.size); });
          $$('[data-file="' + k + '"]').forEach(function (e) { nomFichier(e, a.name); });
        });
      }).catch(function () {});
  } catch (e) {}
})();
