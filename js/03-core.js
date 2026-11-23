/* ══════════════════════════════════════════════════════════════════════════
   CORE — utilitaires, polyfills, stockage, moteur graphique (WP).
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Polyfills ES5 ── */
  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [], k;
      for (k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) a.push(k); }
      return a;
    };
  }
  if (!Object.entries) {
    Object.entries = function (o) {
      return Object.keys(o).map(function (k) { return [k, o[k]]; });
    };
  }
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (v) { return this.indexOf(v) > -1; };
  }
  if (!String.prototype.padStart) {
    String.prototype.padStart = function (n, p) {
      var s = String(this); p = String(p || " ");
      while (s.length < n) s = p + s;
      return s.slice(-Math.max(n, s.length));
    };
  }

  /* ── Helpers ── */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ESCMAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESCMAP[c]; });
  };
  var fmt = function (n) {
    n = Number(n || 0);
    try { return n.toLocaleString("fr-FR"); } catch (e) { return String(n); }
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var uid = function (p) { return p + Math.random().toString(36).slice(2, 7).toUpperCase(); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var ov = function (a, b) { return a[0] <= b[1] && b[0] <= a[1]; };
  var nz = function (v, d) { return (v === undefined || v === null) ? d : v; };
  var ic = function (n, st) { return '<svg class="ic"' + (st ? ' style="' + st + '"' : '') + '><use href="#i-' + n + '"/></svg>'; };
  var deb = function (f, t) {
    var h;
    return function () {
      var a = arguments, s = this;
      clearTimeout(h);
      h = setTimeout(function () { f.apply(s, a); }, t);
    };
  };
  var split = function (v) {
    return Array.isArray(v) ? v : String(v || "").split(/[;,|]/).map(function (s) { return s.trim(); }).filter(Boolean);
  };
  var hex = function (a) { return clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0"); };
  var nk = function (s) {
    return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  };
  var slug = function (s) {
    var t = nk(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return t || uid("x");
  };
  var hasP2D = (typeof Path2D !== "undefined");
  var ERRORS = [];

  function logErr(w, e) {
    var m = w + " : " + ((e && e.message) ? e.message : String(e));
    ERRORS.push({ ts: Date.now(), m: m });
    if (ERRORS.length > 60) ERRORS.shift();
  }

  window.addEventListener("error", function (e) { logErr("window", e.error || e.message); });
  window.addEventListener("unhandledrejection", function (e) { logErr("promise", e.reason); });

  function safe(w, f, fb) {
    try { return f(); } catch (e) { logErr(w, e); return fb; }
  }

  /* ── Stockage blindé ── */
  var MEM = {};
  var STORE = {
    local: false, session: false,
    probe: function () {
      try { localStorage.setItem("__m", "1"); localStorage.removeItem("__m"); this.local = true; } catch (e) {}
      try { sessionStorage.setItem("__m", "1"); sessionStorage.removeItem("__m"); this.session = true; } catch (e) {}
    },
    get: function (k) { if (this.local) { try { return localStorage.getItem(k); } catch (e) {} } return MEM[k] || null; },
    set: function (k, v) { if (this.local) { try { localStorage.setItem(k, v); return; } catch (e) { this.local = false; } } MEM[k] = v; },
    del: function (k) { if (this.local) { try { localStorage.removeItem(k); } catch (e) {} } delete MEM[k]; },
    sget: function (k) { if (this.session) { try { return sessionStorage.getItem(k); } catch (e) { this.session = false; } } return MEM["s:" + k] || null; },
    sset: function (k, v) { if (this.session) { try { sessionStorage.setItem(k, v); return; } catch (e) { this.session = false; } } MEM["s:" + k] = v; },
    sdel: function (k) { if (this.session) { try { sessionStorage.removeItem(k); } catch (e) {} } delete MEM["s:" + k]; }
  };
  STORE.probe();

  /* ── Téléchargement ── */
  function download(n, c, m) {
    safe("download", function () {
      var b = new Blob([c], { type: m || "application/json" });
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = n;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 700);
    }, null);
  }

  /* ── Audio ── */
  var AU = { ctx: null };
  function beep(k) {
    if (!window.MD_PREF || !window.MD_PREF.sound) return;
    safe("audio", function () {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      AU.ctx = AU.ctx || new C();
      if (AU.ctx.state === "suspended") AU.ctx.resume();
      var c = AU.ctx, t = c.currentTime;
      var p = function (f0, f1, d, ty, g, dt) {
        dt = dt || 0;
        var o = c.createOscillator(), v = c.createGain();
        o.type = ty;
        o.frequency.setValueAtTime(f0, t + dt);
        if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dt + d);
        v.gain.setValueAtTime(0, t + dt);
        v.gain.linearRampToValueAtTime(g, t + dt + .008);
        v.gain.exponentialRampToValueAtTime(.0001, t + dt + d);
        o.connect(v); v.connect(c.destination);
        o.start(t + dt); o.stop(t + dt + d + .03);
      };
      if (k === "tick") p(1700, 1400, .045, "square", .03);
      else if (k === "open") p(320, 560, .09, "sine", .045);
      else if (k === "close") p(520, 300, .08, "sine", .035);
      else if (k === "ok") { p(660, 0, .09, "sine", .055); p(990, 0, .14, "sine", .055, .09); }
      else if (k === "err") p(150, 110, .2, "sawtooth", .06);
      else if (k === "del") p(240, 110, .14, "square", .045);
      else if (k === "imp") { p(520, 0, .08, "sine", .045); p(660, 0, .08, "sine", .045, .08); p(880, 0, .16, "sine", .05, .16); }
    }, null);
  }

  /* ── Toasts ── */
  function toast(type, title, msg, undo) {
    var box = $("#ts"); if (!box) return;
    while (box.children.length >= 3) box.removeChild(box.firstChild);
    var el = document.createElement("div");
    el.className = "to " + type;
    el.innerHTML = ic({ ok: "check", err: "alert", warn: "alert", info: "info" }[type] || "info") +
      '<div style="flex:1;min-width:0"><b>' + esc(title) + "</b>" +
      (msg ? "<p>" + esc(msg) + "</p>" : "") + "</div>" +
      (undo ? '<button class="btn xs amb" data-act="undo">' + ic("undo") + "Annuler</button>" : "") +
      '<span class="pg" style="animation-duration:' + (undo ? 8 : 4.6) + 's"></span>';
    box.appendChild(el);
    var kill = function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    };
    el._t = setTimeout(kill, undo ? 8000 : 4600);
    el.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-act=undo]")) {
        clearTimeout(el._t); kill();
      }
    });
  }

  /* ── Modales ── */
  var modalOpen = false;
  function openModal(html, cls) {
    var r = $("#md");
    r.innerHTML = '<div class="ms" data-act="mscrim"><div class="mo ' + (cls || "") + '" role="dialog">' + html + "</div></div>";
    requestAnimationFrame(function () { r.classList.add("on"); });
    document.body.classList.add("lock");
    modalOpen = true;
    beep("open");
    var f = r.querySelector("input,select,textarea,button");
    if (f) setTimeout(function () { f.focus(); }, 90);
  }
  function closeModal() {
    var r = $("#md"); if (!r.innerHTML) return;
    r.classList.remove("on");
    modalOpen = false;
    if (!window.MD_STATE || !window.MD_STATE.drawer) document.body.classList.remove("lock");
    setTimeout(function () { if (!modalOpen) r.innerHTML = ""; }, 230);
    beep("close");
  }
  function confirmModal(t, m, a, l) {
    openModal('<div class="mh">' + ic("alert", "color:#FFAF2E") + "<h3>" + esc(t) +
      '</h3><button class="tb" data-act="mclose">' + ic("x") +
      '</button></div><div class="mb2"><p style="color:#9FB2C8">' + esc(m) +
      '</p></div><div class="mf"><button class="btn ghost" data-act="mclose">Annuler</button>' +
      '<button class="btn dgr" data-act="' + a + '">' + esc(l || "Confirmer") + "</button></div>", "slim");
  }

  /* ── Moteur graphique (WP) ── */
  var WP = {
    P: { mode: "blueprint", theme: "diag", density: 62, count: 130, speed: 100, turb: 34, scale: 64, glow: 56, blur: 0, stroke: 1.4, drift: 38, quality: "std", format: "free", grid: true, grain: true, scan: true, vig: true, run: true, bg: true },
    TH: {
      diag: { n: "Diagnostic", bg: "#04070D", a: "#25D4EE", b: "#4D8DFF", c: "#E45CFF", d: "#43E08B" },
      torque: { n: "Couple", bg: "#0B0603", a: "#FFAF2E", b: "#FF7A3D", c: "#FF4D5E", d: "#FFD98A" },
      acid: { n: "Acide", bg: "#040A06", a: "#A8E63C", b: "#43E08B", c: "#25D4EE", d: "#E4FF7A" },
      plasma: { n: "Plasma", bg: "#08040F", a: "#E45CFF", b: "#8F7CFF", c: "#25D4EE", d: "#FF6FB1" },
      ocean: { n: "Océan", bg: "#02080C", a: "#19B8A6", b: "#4D8DFF", c: "#25D4EE", d: "#7CE8D0" },
      steel: { n: "Acier", bg: "#070A0E", a: "#9FB2C8", b: "#5F7288", c: "#25D4EE", d: "#E6EEF9" }
    },
    MODES: [["blueprint", "GRILLE"], ["aurora", "AURORA"], ["flux", "FLUX"], ["radar", "RADAR"], ["oscillo", "OSCILLO"], ["gears", "MÉCA"], ["carbon", "CARBONE"], ["telemetry", "TÉLÉM."]],
    PRESETS: {
      "Diagnostic": { mode: "blueprint", theme: "diag", density: 62, count: 130, speed: 100, turb: 34, scale: 64, glow: 56, stroke: 1.4, drift: 38 },
      "Banc dyno": { mode: "telemetry", theme: "torque", density: 70, count: 120, speed: 120, turb: 45, scale: 56, glow: 62, stroke: 1.8, drift: 20 },
      "Nuit carbone": { mode: "carbon", theme: "steel", density: 55, count: 80, speed: 60, turb: 20, scale: 48, glow: 34, stroke: 1.2, drift: 26 },
      "Radar atelier": { mode: "radar", theme: "acid", density: 60, count: 110, speed: 85, turb: 30, scale: 70, glow: 70, stroke: 1.6, drift: 30 },
      "Scope 4 cyl": { mode: "oscillo", theme: "acid", density: 66, count: 100, speed: 130, turb: 52, scale: 60, glow: 66, stroke: 1.6, drift: 18 },
      "Plasma": { mode: "aurora", theme: "plasma", density: 74, count: 150, speed: 70, turb: 40, scale: 80, glow: 78, stroke: 1.4, drift: 44 },
      "Engrenages": { mode: "gears", theme: "torque", density: 60, count: 90, speed: 80, turb: 24, scale: 74, glow: 52, stroke: 1.6, drift: 22 },
      "Flux data": { mode: "flux", theme: "ocean", density: 68, count: 170, speed: 110, turb: 48, scale: 64, glow: 58, stroke: 1.2, drift: 34 }
    },
    targets: [], raf: 0, t: 0, last: 0, running: false, fails: 0,
    init: function () {
      var cv = $("#bgc");
      if (cv) {
        var cx = safe("ctx", function () { return cv.getContext("2d"); }, null);
        if (cx) this.targets.push({ cv: cv, ctx: cx, scale: .5, W: 0, H: 0, st: null, key: "" });
      }
      this.resize();
      var s = this;
      window.addEventListener("resize", deb(function () { s.resize(); }, 150));
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) s.stop();
        else if (s.P.run) s.start();
      });
      this.apply();
    },
    attach: function (cv) {
      this.targets = this.targets.filter(function (t) { return t.cv.id === "bgc"; });
      if (cv) {
        var cx = safe("ctx2", function () { return cv.getContext("2d"); }, null);
        if (cx) this.targets.push({ cv: cv, ctx: cx, scale: 1, W: 0, H: 0, st: null, key: "", preview: true });
      }
      this.resize();
      if (this.P.run) this.start(); else this.drawAll();
    },
    detach: function () { this.targets = this.targets.filter(function (t) { return !t.preview; }); },
    q: function () { return this.P.quality === "eco" ? 1 : (this.P.quality === "ultra" ? 2 : 1.5); },
    resize: function () {
      var d = Math.min(window.devicePixelRatio || 1, this.q());
      this.targets.forEach(function (t) {
        var w = t.preview ? (t.cv.clientWidth || 640) : window.innerWidth;
        var h = t.preview ? (t.cv.clientHeight || 340) : window.innerHeight;
        t.W = Math.max(1, w); t.H = Math.max(1, h);
        t.cv.width = Math.round(t.W * d); t.cv.height = Math.round(t.H * d);
        safe("tr", function () { t.ctx.setTransform(d, 0, 0, d, 0, 0); });
        t.key = "";
      });
      this.drawAll();
    },
    set: function (k, v) {
      this.P[k] = v;
      if (k === "quality") this.resize();
      if (["mode", "count", "scale", "density"].indexOf(k) > -1) this.targets.forEach(function (t) { t.key = ""; });
      this.fx();
      if (k === "run") { if (v) this.start(); else this.stop(); }
      this.drawAll();
      if (window.MD_saveState) window.MD_saveState();
      this.sync();
    },
    fx: function () {
      var P = this.P, b = document.body;
      b.classList.toggle("nograin", !P.grain);
      b.classList.toggle("noscan", !P.scan);
      b.classList.toggle("novig", !P.vig);
      var bc = $("#bgc"), bf = $("#bgfx");
      if (bc) { bc.style.opacity = P.bg ? "1" : "0"; bc.style.filter = P.blur ? ("blur(" + P.blur + "px)") : "none"; }
      if (bf) bf.style.opacity = P.bg ? "1" : "0";
      var sc = $("#screen");
      if (sc) {
        sc.classList.toggle("nograin", !P.grain);
        sc.classList.toggle("novig", !P.vig);
        var c = sc.querySelector("canvas");
        if (c) c.style.filter = P.blur ? ("blur(" + P.blur + "px)") : "none";
      }
    },
    apply: function () {
      this.fx();
      this.targets.forEach(function (t) { t.key = ""; });
      if (this.P.run && !document.hidden) this.start();
      else { this.stop(); this.drawAll(); }
      this.sync();
    },
    start: function () {
      if (this.running || !this.targets.length) return;
      this.running = true; this.last = performance.now();
      var s = this;
      var loop = function (n) {
        if (!s.running) return;
        var dt = Math.min(.05, (n - s.last) / 1000);
        s.last = n; s.t += dt * (s.P.speed / 100);
        s.drawAll(); s.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },
    stop: function () { this.running = false; cancelAnimationFrame(this.raf); },
    mk: function (t) {
      var P = this.P, W = t.W, H = t.H, I = P.density / 100;
      var n = Math.round(clamp(P.count * (W * H) / (1280 * 720), 12, 320) * t.scale);
      var i, pts = [], bl = [], ln = [], tr = [[], [], []];
      for (i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (.2 + Math.random() * .8) * (Math.random() < .5 ? -1 : 1), vy: (Math.random() - .5) * .4, r: .8 + Math.random() * 1.9, p: Math.random() * 6.28, k: Math.floor(Math.random() * 4) });
      for (i = 0; i < Math.round(16 * I) + 5; i++) bl.push({ a: Math.random() * 6.28, d: .14 + Math.random() * .82, h: 0 });
      for (i = 0; i < Math.round(9 * I) + 3; i++) ln.push({ h: Math.random() < .5, pos: Math.random(), sp: .0007 + Math.random() * .0022, o: Math.random() });
      for (i = 0; i < 150; i++) { tr[0].push(.5); tr[1].push(.4); tr[2].push(.6); }
      return { pts: pts, blips: bl, lanes: ln, tr: tr, ph: 0, gears: null, goff: 0, tile: null, tk: "" };
    },
    drawAll: function () {
      var s = this;
      this.targets.forEach(function (t) {
        if (!t.W || !t.H) return;
        if (!t.preview && !s.P.bg) return;
        var k = [s.P.mode, s.P.count, s.P.scale, s.P.density, t.W, t.H, t.scale].join("|");
        if (t.key !== k) { t.st = s.mk(t); t.key = k; }
        try { s.draw(t.ctx, t.W, t.H, s.t, s.P, t.st, s.TH[s.P.theme] || s.TH.diag, t.scale); }
        catch (e) {
          s.fails++;
          if (s.fails > 3) { s.P.mode = "blueprint"; s.fails = 0; t.key = ""; toast("warn", "Scène désactivée", "Retour grille."); }
        }
      });
    },
    draw: function (c, W, H, t, P, st, TH, sc) {
      var I = P.density / 100, TB = P.turb / 100, G = P.glow / 100, LW = P.stroke;
      var DR = .2 + P.drift / 100, SP = P.speed / 100, cols = [TH.a, TH.b, TH.c, TH.d];
      c.fillStyle = (P.mode === "oscillo" ? TH.bg + "2E" : TH.bg);
      c.fillRect(0, 0, W, H);
      c.lineWidth = LW; c.lineCap = "round";
      var glow = function (v) { c.shadowColor = v; c.shadowBlur = G * 16; };
      var ng = function () { c.shadowBlur = 0; };

      if (P.mode === "blueprint") {
        var s = Math.max(18, P.scale), o = (t * 9 * DR) % s;
        c.strokeStyle = TH.a + "12"; c.beginPath();
        for (var i = -o; i < W + s; i += s) { c.moveTo(i, 0); c.lineTo(i, H); }
        for (var j = -o * .6; j < H + s; j += s) { c.moveTo(0, j); c.lineTo(W, j); }
        c.stroke();
        st.pts.forEach(function (p, k) {
          if (k % 2) return; p.p += .02 * SP;
          c.strokeStyle = TH.a + hex((.22 + Math.sin(p.p) * .18) * I);
          c.beginPath(); c.moveTo(p.x - 5, p.y); c.lineTo(p.x + 5, p.y);
          c.moveTo(p.x, p.y - 5); c.lineTo(p.x, p.y + 5); c.stroke();
        });
      }
      else if (P.mode === "aurora") {
        [[.26, .3, 0], [.74, .62, 2], [.54, .2, 1], [.3, .82, 3]].forEach(function (b, k) {
          var x = W * (b[0] + Math.sin(t * .22 * DR + k * 2) * .12);
          var y = H * (b[1] + Math.cos(t * .18 * DR + k) * .12);
          var r = Math.min(W, H) * (.34 + .09 * Math.sin(t * .3 + k));
          var g = c.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, cols[b[2]] + hex(46 * I / 255));
          g.addColorStop(1, cols[b[2]] + "00");
          c.fillStyle = g; c.fillRect(0, 0, W, H);
        });
      }
      else if (P.mode === "flux") {
        var pts = st.pts;
        pts.forEach(function (p) {
          p.x += p.vx * SP * 1.7 + Math.sin(t * .6 + p.p) * TB * .7;
          p.y += p.vy * SP * 1.7 + Math.cos(t * .5 + p.p) * TB * .7;
          if (p.x < -12) p.x = W + 12; if (p.x > W + 12) p.x = -12;
          if (p.y < -12) p.y = H + 12; if (p.y > H + 12) p.y = -12;
        });
        var R = Math.max(48, P.scale * 1.4), R2 = R * R;
        for (var i = 0; i < pts.length; i++) {
          for (var j = i + 1; j < pts.length; j++) {
            var a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
            if (d < R2) {
              c.strokeStyle = TH.a + hex((1 - d / R2) * .14 * I);
              c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            }
          }
        }
        pts.forEach(function (p) {
          var col = cols[p.k];
          glow(col); c.fillStyle = col; c.globalAlpha = .72 * I + .15;
          c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
          c.globalAlpha = 1; ng();
        });
      }
      else if (P.mode === "radar") {
        var cx = W * .66, cy = H * .46, RR = Math.min(W, H) * .42, ang = (t * .8 * SP) % 6.283;
        c.strokeStyle = TH.a + "22";
        for (var i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, RR * i / 4, 0, 6.283); c.stroke(); }
        c.beginPath(); c.moveTo(cx - RR, cy); c.lineTo(cx + RR, cy);
        c.moveTo(cx, cy - RR); c.lineTo(cx, cy + RR); c.stroke();
        glow(TH.a); c.strokeStyle = TH.a; c.lineWidth = LW + .6;
        c.beginPath(); c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(ang) * RR, cy + Math.sin(ang) * RR); c.stroke(); ng(); c.lineWidth = LW;
        st.blips.forEach(function (b) {
          var da = ((ang - b.a) % 6.283 + 6.283) % 6.283;
          if (da < .07) b.h = 1; b.h *= .986;
          if (b.h > .02) {
            glow(TH.d); c.fillStyle = TH.d + hex(b.h * .9);
            c.beginPath(); c.arc(cx + Math.cos(b.a) * RR * b.d, cy + Math.sin(b.a) * RR * b.d, 3, 0, 6.283); c.fill(); ng();
          }
        });
      }
      else if (P.mode === "oscillo") {
        var ch = Math.max(2, Math.round(2 + I * 4)); st.ph += .05 * SP;
        for (var k = 0; k < ch; k++) {
          var base = H * (k + .6) / (ch + .2), amp = H / (ch * 3.1), col = cols[k % 4];
          glow(col); c.strokeStyle = col; c.lineWidth = LW + .4; c.beginPath();
          for (var i = 0; i <= W; i += 3) {
            var u = i / W * 12 + st.ph + k * 1.3;
            var y = base + Math.sin(u) * amp * .6 + Math.sin(u * 3.1 + k) * amp * .28 * TB;
            if (i) c.lineTo(i, y); else c.moveTo(i, y);
          }
          c.stroke(); ng();
          c.fillStyle = col + "99"; c.font = "9px monospace";
          c.fillText("CYL" + (k + 1), 8, base - amp - 4);
        }
        c.lineWidth = LW;
      }
      else if (P.mode === "gears") {
        var sg = Math.max(30, P.scale), ag = t * .7 * SP * DR * 2;
        if (!st.gears) {
          var defs = [[sg * 1.15, 18], [sg * .78, 12], [sg * .55, 9], [sg * .9, 14]], arr = [];
          defs.forEach(function (d, q) {
            var r = d[0], pr = arr[q - 1], ccx = q ? pr.cx + pr.r + r + sg * .16 : 0;
            arr.push({ cx: ccx, r: r, teeth: d[1], col: cols[q % 4], dir: q % 2 ? -1 : 1, ratio: 18 / d[1] });
          });
          st.gears = arr; st.goff = -arr[arr.length - 1].cx / 2;
        }
        c.save(); c.translate(W * .5 + st.goff, H * .44);
        st.gears.forEach(function (g) {
          c.save(); c.translate(g.cx, 0); c.rotate(ag * g.dir * g.ratio);
          glow(g.col); c.strokeStyle = g.col; c.lineWidth = LW + .5;
          c.beginPath(); c.arc(0, 0, g.r, 0, 6.283); c.stroke();
          for (var q = 0; q < g.teeth; q++) {
            var aa = q * 6.283 / g.teeth;
            c.beginPath(); c.moveTo(Math.cos(aa) * g.r, Math.sin(aa) * g.r);
            c.lineTo(Math.cos(aa) * (g.r + 8), Math.sin(aa) * (g.r + 8)); c.stroke();
          }
          ng(); c.restore();
        });
        c.restore(); c.lineWidth = LW;
      }
      else if (P.mode === "telemetry") {
        st.tr.forEach(function (arr, q) {
          var last = arr[arr.length - 1];
          var tg = .5 + Math.sin(t * (.6 + q * .35)) * .3 + Math.sin(t * (2.1 + q)) * .12 * TB;
          arr.push(clamp(last + (tg - last) * .16 * SP, .05, .95));
          if (arr.length > 150) arr.shift();
        });
        var gw = W * .68, gh = H * .6, ox = W * .06, oy = H * .12;
        c.strokeStyle = TH.a + "18";
        for (var i = 0; i <= 4; i++) { var yv = oy + gh * i / 4; c.beginPath(); c.moveTo(ox, yv); c.lineTo(ox + gw, yv); c.stroke(); }
        st.tr.forEach(function (arr, q) {
          var col = cols[q % 4];
          glow(col); c.strokeStyle = col; c.lineWidth = LW + .5; c.beginPath();
          arr.forEach(function (v, z) { var x = ox + gw * z / (arr.length - 1), y = oy + gh * (1 - v); if (z) c.lineTo(x, y); else c.moveTo(x, y); });
          c.stroke(); ng();
        });
        c.lineWidth = LW;
      }
      else { /* carbon par défaut */
        c.fillStyle = TH.bg; c.fillRect(0, 0, W, H);
      }
    },
    label: function (k, v) {
      var u = { density: "%", speed: "%", turb: "%", glow: "%", scale: " px", stroke: " px", blur: " px", drift: "%", count: "" };
      return (k === "stroke" ? Number(v).toFixed(1) : Math.round(v)) + (u[k] || "");
    },
    sync: function () {
      var rb = $("#runb");
      if (rb) { rb.innerHTML = ic(this.P.run ? "pause" : "play"); rb.classList.toggle("on", this.P.run); }
      $$(".mb").forEach(function (b) { b.classList.toggle("on", b.dataset.m === WP.P.mode); });
      $$(".pb").forEach(function (b) { b.classList.toggle("on", b.dataset.t === WP.P.theme); });
      $$("[data-p]").forEach(function (el) {
        var k = el.dataset.p, v = WP.P[k];
        if (el.type === "checkbox") el.checked = !!v; else el.value = v;
        var o = $('[data-pv="' + k + '"]');
        if (o) o.textContent = WP.label(k, v);
      });
      var h = $("#hud");
      if (h) h.innerHTML = "<span>" + this.P.mode.toUpperCase() + "</span><span>" + this.TH[this.P.theme].n.toUpperCase() + "</span><span>" + this.P.count + " pts</span><span>" + (this.P.run ? "LIVE" : "PAUSE") + "</span>";
    },
    exportPNG: function () {
      var F = { free: [1600, 900], mobile: [1170, 2532], tablet: [1668, 2224], desktop: [1920, 1080] }[this.P.format] || [1600, 900];
      var s = this;
      safe("png", function () {
        var cv = document.createElement("canvas"); cv.width = F[0]; cv.height = F[1];
        var cx = cv.getContext("2d"), tg = { W: F[0], H: F[1], scale: 1 };
        tg.st = s.mk(tg);
        s.draw(cx, F[0], F[1], s.t, s.P, tg.st, s.TH[s.P.theme], 1);
        var u = cv.toDataURL("image/png"), a = document.createElement("a");
        a.href = u; a.download = "mecadata_fond_" + s.P.mode + "_" + F[0] + "x" + F[1] + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        toast("ok", "Fond exporté", F[0] + "×" + F[1] + " px"); beep("ok");
      }, toast("err", "Export PNG indisponible"));
    }
  };

  /* ── Exposition globale ── */
  window.MD_$ = $;
  window.MD_$$ = $$;
  window.MD_esc = esc;
  window.MD_fmt = fmt;
  window.MD_clamp = clamp;
  window.MD_uid = uid;
  window.MD_clone = clone;
  window.MD_ov = ov;
  window.MD_nz = nz;
  window.MD_ic = ic;
  window.MD_deb = deb;
  window.MD_split = split;
  window.MD_hex = hex;
  window.MD_nk = nk;
  window.MD_slug = slug;
  window.MD_hasP2D = hasP2D;
  window.MD_ERRORS = ERRORS;
  window.MD_logErr = logErr;
  window.MD_safe = safe;
  window.MD_STORE = STORE;
  window.MD_download = download;
  window.MD_beep = beep;
  window.MD_toast = toast;
  window.MD_openModal = openModal;
  window.MD_closeModal = closeModal;
  window.MD_confirmModal = confirmModal;
  window.MD_modalOpen = function () { return modalOpen; };
  window.MD_WP = WP;
  window.MD_PREF = { sound: true };

  window.__MD_SCRIPTS.core = true;
})();
