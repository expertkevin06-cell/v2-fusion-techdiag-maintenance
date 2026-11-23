/* ══════════════════════════════════════════════════════════════════════════
   CORE v7.3 — utilitaires, stockage, studio graphique 10 scènes, pack 3008.
   RÈGLE SYNTAXE : balisage en "..." avec attributs HTML en '...'.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (!Object.keys) {
    Object.keys = function (o) { var a = [], k; for (k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) a.push(k); } return a; };
  }
  if (!Object.entries) {
    Object.entries = function (o) { return Object.keys(o).map(function (k) { return [k, o[k]]; }); };
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

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ESCMAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESCMAP[c]; }); };
  var fmt = function (n) { n = Number(n || 0); try { return n.toLocaleString("fr-FR"); } catch (e) { return String(n); } };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var uid = function (p) { return p + Math.random().toString(36).slice(2, 7).toUpperCase(); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var ov = function (a, b) { return a[0] <= b[1] && b[0] <= a[1]; };
  var nz = function (v, d) { return (v === undefined || v === null) ? d : v; };
  var ic = function (n, st) { return "<svg class='ic'" + (st ? " style='" + st + "'" : "") + "><use href='#i-" + n + "'/></svg>"; };
  var deb = function (f, t) { var h; return function () { var a = arguments, s = this; clearTimeout(h); h = setTimeout(function () { f.apply(s, a); }, t); }; };
  var split = function (v) { return Array.isArray(v) ? v : String(v || "").split(/[;,|]/).map(function (s) { return s.trim(); }).filter(Boolean); };
  var hex = function (a) { return clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0"); };
  var nk = function (s) { return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); };
  var slug = function (s) { var t = nk(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); return t || uid("x"); };
  var hasP2D = (typeof Path2D !== "undefined");
  var ERRORS = [];

  function logErr(w, e) {
    var m = w + " : " + ((e && e.message) ? e.message : String(e));
    ERRORS.push({ ts: Date.now(), m: m });
    if (ERRORS.length > 60) ERRORS.shift();
    try { window.__MD_ERR.push({ msg: m, src: "core", line: 0, col: 0, stack: "" }); } catch (x) {}
  }
  window.addEventListener("error", function (e) { logErr("window", e.error || e.message); });
  window.addEventListener("unhandledrejection", function (e) { logErr("promise", e.reason); });
  function safe(w, f, fb) { try { return f(); } catch (e) { logErr(w, e); return fb; } }

  var MEM = {};
  var STORE = {
    local: false, session: false,
    probe: function () {
      try { localStorage.setItem("__m", "1"); localStorage.removeItem("__m"); this.local = true; } catch (e) {}
      try { sessionStorage.setItem("__m", "1"); sessionStorage.removeItem("__m"); this.session = true; } catch (e) {}
    },
    get: function (k) { if (this.local) { try { return localStorage.getItem(k); } catch (e) {} } return MEM[k] || null; },
    set: function (k, v) { if (this.local) { try { localStorage.setItem(k, v); return true; } catch (e) { this.local = false; } } MEM[k] = v; return true; },
    del: function (k) { if (this.local) { try { localStorage.removeItem(k); } catch (e) {} } delete MEM[k]; },
    sget: function (k) { if (this.session) { try { return sessionStorage.getItem(k); } catch (e) { this.session = false; } } return MEM["s:" + k] || null; },
    sset: function (k, v) { if (this.session) { try { sessionStorage.setItem(k, v); return; } catch (e) { this.session = false; } } MEM["s:" + k] = v; },
    sdel: function (k) { if (this.session) { try { sessionStorage.removeItem(k); } catch (e) {} } delete MEM["s:" + k]; }
  };
  STORE.probe();

  function download(n, c, m) {
    safe("download", function () {
      var b = new Blob([c], { type: m || "application/json" });
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = n;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 800);
    }, null);
  }

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
        v.gain.linearRampToValueAtTime(g, t + dt + 0.008);
        v.gain.exponentialRampToValueAtTime(0.0001, t + dt + d);
        o.connect(v); v.connect(c.destination);
        o.start(t + dt); o.stop(t + dt + d + 0.03);
      };
      if (k === "tick") p(1700, 1400, 0.045, "square", 0.03);
      else if (k === "open") p(320, 560, 0.09, "sine", 0.045);
      else if (k === "close") p(520, 300, 0.08, "sine", 0.035);
      else if (k === "ok") { p(660, 0, 0.09, "sine", 0.055); p(990, 0, 0.14, "sine", 0.055, 0.09); }
      else if (k === "err") p(150, 110, 0.2, "sawtooth", 0.06);
      else if (k === "del") p(240, 110, 0.14, "square", 0.045);
      else if (k === "imp") { p(520, 0, 0.08, "sine", 0.045); p(660, 0, 0.08, "sine", 0.045, 0.08); p(880, 0, 0.16, "sine", 0.05, 0.16); }
    }, null);
  }

  function toast(type, title, msg, undo) {
    var box = $("#ts"); if (!box) return;
    while (box.children.length >= 3) box.removeChild(box.firstChild);
    var el = document.createElement("div");
    el.className = "to " + type;
    var icon = { ok: "check", err: "alert", warn: "alert", info: "info" }[type] || "info";
    var h = ic(icon) + "<div style='flex:1;min-width:0'><b>" + esc(title) + "</b>";
    if (msg) h += "<p>" + esc(msg) + "</p>";
    h += "</div>";
    if (undo) h += "<button class='btn xs amb' data-act='undo'>" + ic("undo") + "Annuler</button>";
    h += "<span class='pg' style='animation-duration:" + (undo ? 8 : 4.6) + "s'></span>";
    el.innerHTML = h;
    box.appendChild(el);
    var kill = function () { el.classList.add("out"); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260); };
    el._t = setTimeout(kill, undo ? 8000 : 4600);
    el.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("[data-act=undo]")) { clearTimeout(el._t); kill(); }
    });
  }

  var modalOpen = false;
  function openModal(html, cls) {
    var r = $("#md");
    r.innerHTML = "<div class='ms' data-act='mscrim'><div class='mo " + (cls || "") + "' role='dialog'>" + html + "</div></div>";
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
    var h = "<div class='mh'>" + ic("alert", "color:#FFAF2E") + "<h3>" + esc(t) + "</h3><button class='tb' data-act='mclose'>" + ic("x") + "</button></div>";
    h += "<div class='mb2'><p style='color:#9FB2C8'>" + esc(m) + "</p></div>";
    h += "<div class='mf'><button class='btn ghost' data-act='mclose'>Annuler</button><button class='btn dgr' data-act='" + a + "'>" + esc(l || "Confirmer") + "</button></div>";
    openModal(h, "slim");
  }

  /* ── CSS additionnel (contrôles couleur, omnibox, autosave) ── */
  safe("css", function () {
    var st = document.createElement("style");
    st.textContent =
      "input[type=color]{-webkit-appearance:none;appearance:none;width:100%;height:30px;border:1px solid var(--line);border-radius:8px;background:var(--sur);padding:2px;cursor:pointer}" +
      "input[type=color]::-webkit-color-swatch-wrapper{padding:0}" +
      "input[type=color]::-webkit-color-swatch{border:none;border-radius:6px}" +
      ".crow{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}" +
      ".crow label{display:block;font:400 8px var(--mono);letter-spacing:.1em;color:var(--tx3);text-transform:uppercase;margin-bottom:3px;text-align:center}" +
      ".omnires mark{background:rgba(37,212,238,.22);color:#B9F1FB;border-radius:3px;padding:0 2px}" +
      ".omnires .hit .k{font:600 8px var(--mono);letter-spacing:.1em;padding:2px 6px;border-radius:5px;border:1px solid currentColor;flex:none}" +
      ".omnires .hit .sub2{display:block;font:400 10px var(--mono);color:var(--tx3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".omnires .hit .txt{flex:1;min-width:0}" +
      ".omnires .hint{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px}" +
      ".omnires .hint button{font:400 10px var(--mono);color:var(--cyan);border:1px solid var(--line2);background:rgba(37,212,238,.07);padding:4px 9px;border-radius:14px}" +
      ".omnires .hint button:hover{background:rgba(37,212,238,.16)}" +
      ".seedrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}" +
      ".seedrow button{font:400 10px var(--mono);color:var(--amber);border:1px solid rgba(255,175,46,.35);background:rgba(255,175,46,.07);padding:4px 9px;border-radius:14px}" +
      ".seedrow button:hover{background:rgba(255,175,46,.16)}" +
      ".savechip{display:inline-flex;align-items:center;gap:5px;font:400 9px var(--mono);color:var(--green);border:1px solid rgba(67,224,139,.35);border-radius:12px;padding:2px 7px;margin-top:7px}" +
      ".savechip i{width:5px;height:5px;border-radius:50%;background:currentColor;animation:bl 1.6s steps(2) infinite}" +
      ".psrow{display:flex;flex-wrap:wrap;gap:5px}" +
      ".psrow button{font:400 9px var(--mono);padding:4px 8px;border-radius:12px;border:1px solid rgba(228,92,255,.35);color:var(--mag);background:rgba(228,92,255,.07)}" +
      ".psrow button:hover{background:rgba(228,92,255,.16)}" +
      ".dz2{border:2px dashed var(--line2);border-radius:12px;padding:18px;text-align:center;color:var(--tx2);cursor:pointer;background:rgba(37,212,238,.03)}" +
      ".dz2.over{border-color:var(--cyan);background:rgba(37,212,238,.09);color:var(--cyan)}" +
      ".fmtrow{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}" +
      ".fmtrow span{font:400 9px var(--mono);color:var(--tx3);border:1px solid var(--line);border-radius:10px;padding:2px 7px}" +
      ".omnires::-webkit-scrollbar{width:9px}" +
      ".omnires::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#1E7E96,#2A4F9E);border:2px solid #0A101C;border-radius:8px}";
    document.head.appendChild(st);
  }, null);

  /* ══════════ STUDIO GRAPHIQUE — 10 scènes, palette pilotable ══════════ */
  var WP = {
    P: {
      mode: "nebula", theme: "diag", useCustom: false,
      custom: { bg: "#04070D", a: "#25D4EE", b: "#4D8DFF", c: "#E45CFF", d: "#43E08B" },
      density: 64, count: 150, speed: 100, turb: 38, scale: 66, glow: 60,
      blur: 0, stroke: 1.4, drift: 40, dir: 1, quality: "std", format: "free",
      grid: true, grain: true, scan: true, vig: true, run: true, bg: true
    },
    TH: {
      diag: { n: "Diagnostic", bg: "#04070D", a: "#25D4EE", b: "#4D8DFF", c: "#E45CFF", d: "#43E08B" },
      torque: { n: "Couple", bg: "#0B0603", a: "#FFAF2E", b: "#FF7A3D", c: "#FF4D5E", d: "#FFD98A" },
      acid: { n: "Acide", bg: "#040A06", a: "#A8E63C", b: "#43E08B", c: "#25D4EE", d: "#E4FF7A" },
      plasma: { n: "Plasma", bg: "#08040F", a: "#E45CFF", b: "#8F7CFF", c: "#25D4EE", d: "#FF6FB1" },
      ocean: { n: "Ocean", bg: "#02080C", a: "#19B8A6", b: "#4D8DFF", c: "#25D4EE", d: "#7CE8D0" },
      steel: { n: "Acier", bg: "#070A0E", a: "#9FB2C8", b: "#5F7288", c: "#25D4EE", d: "#E6EEF9" },
      ember: { n: "Braise", bg: "#0A0405", a: "#FF4D5E", b: "#FF7A3D", c: "#FFAF2E", d: "#FFC9A8" },
      violet: { n: "Violet", bg: "#06040F", a: "#8F7CFF", b: "#E45CFF", c: "#4D8DFF", d: "#C9BFFF" }
    },
    MODES: [
      ["nebula", "NEBULA"], ["aurora", "AURORA"], ["flux", "FLUX"], ["blueprint", "GRILLE"],
      ["radar", "RADAR"], ["oscillo", "SCOPE"], ["gears", "MECA"], ["carbon", "CARBONE"],
      ["telemetry", "TELEM."], ["tunnel", "TUNNEL"]
    ],
    PRESETS: {
      "Nebula cyan": { mode: "nebula", theme: "diag", useCustom: false, density: 66, count: 160, speed: 80, turb: 40, scale: 70, glow: 66, blur: 0, stroke: 1.4, drift: 42, dir: 1 },
      "Braise lente": { mode: "aurora", theme: "ember", useCustom: false, density: 72, count: 120, speed: 45, turb: 26, scale: 88, glow: 74, blur: 1, stroke: 1.2, drift: 24, dir: 1 },
      "Tunnel acid": { mode: "tunnel", theme: "acid", useCustom: false, density: 60, count: 140, speed: 140, turb: 30, scale: 60, glow: 62, blur: 0, stroke: 1.6, drift: 30, dir: 1 },
      "Radar atelier": { mode: "radar", theme: "acid", useCustom: false, density: 60, count: 110, speed: 85, turb: 30, scale: 70, glow: 70, blur: 0, stroke: 1.6, drift: 30, dir: 1 },
      "Scope 4 cyl": { mode: "oscillo", theme: "acid", useCustom: false, density: 66, count: 100, speed: 130, turb: 52, scale: 60, glow: 66, blur: 0, stroke: 1.6, drift: 18, dir: 1 },
      "Meca couple": { mode: "gears", theme: "torque", useCustom: false, density: 60, count: 90, speed: 80, turb: 24, scale: 74, glow: 52, blur: 0, stroke: 1.6, drift: 22, dir: 1 },
      "Carbone nuit": { mode: "carbon", theme: "steel", useCustom: false, density: 55, count: 80, speed: 60, turb: 20, scale: 48, glow: 34, blur: 0, stroke: 1.2, drift: 26, dir: 1 },
      "Telem. dyno": { mode: "telemetry", theme: "torque", useCustom: false, density: 70, count: 120, speed: 120, turb: 45, scale: 56, glow: 62, blur: 0, stroke: 1.8, drift: 20, dir: 1 },
      "Flux ocean": { mode: "flux", theme: "ocean", useCustom: false, density: 68, count: 170, speed: 110, turb: 48, scale: 64, glow: 58, blur: 0, stroke: 1.2, drift: 34, dir: 1 },
      "Grille tech": { mode: "blueprint", theme: "diag", useCustom: false, density: 62, count: 130, speed: 100, turb: 34, scale: 64, glow: 56, blur: 0, stroke: 1.4, drift: 38, dir: 1 }
    },
    targets: [], raf: 0, t: 0, last: 0, running: false, fails: 0,
    pal: function () {
      if (this.P.useCustom) {
        var c = this.P.custom;
        return { n: "Personnalisee", bg: c.bg, a: c.a, b: c.b, c: c.c, d: c.d };
      }
      return this.TH[this.P.theme] || this.TH.diag;
    },
    init: function () {
      var cv = $("#bgc");
      if (cv) {
        var cx = safe("ctx", function () { return cv.getContext("2d"); }, null);
        if (cx) this.targets.push({ cv: cv, ctx: cx, scale: 0.5, W: 0, H: 0, st: null, key: "" });
      }
      this.resize();
      var s = this;
      window.addEventListener("resize", deb(function () { s.resize(); }, 150));
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) s.stop(); else if (s.P.run) s.start();
      });
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) this.P.run = false;
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
    setCustom: function (k, v) {
      this.P.custom[k] = v;
      this.P.useCustom = true;
      this.drawAll();
      if (window.MD_saveState) window.MD_saveState();
      this.sync();
    },
    randomize: function () {
      var ms = this.MODES.map(function (m) { return m[0]; });
      var ts = Object.keys(this.TH);
      this.P.mode = ms[Math.floor(Math.random() * ms.length)];
      this.P.theme = ts[Math.floor(Math.random() * ts.length)];
      this.P.useCustom = Math.random() < 0.4;
      if (this.P.useCustom) {
        var rnd = function () {
          var h = Math.floor(Math.random() * 360);
          var s = 70 + Math.floor(Math.random() * 30);
          var l = 55 + Math.floor(Math.random() * 15);
          return hslHex(h, s, l);
        };
        this.P.custom = { bg: hslHex(Math.floor(Math.random() * 360), 40, 4), a: rnd(), b: rnd(), c: rnd(), d: rnd() };
      }
      this.P.density = 30 + Math.round(Math.random() * 65);
      this.P.count = 60 + Math.round(Math.random() * 240);
      this.P.speed = 40 + Math.round(Math.random() * 140);
      this.P.turb = Math.round(Math.random() * 90);
      this.P.scale = 28 + Math.round(Math.random() * 110);
      this.P.glow = 20 + Math.round(Math.random() * 75);
      this.P.stroke = +(0.7 + Math.random() * 2.3).toFixed(1);
      this.P.drift = 10 + Math.round(Math.random() * 80);
      this.P.dir = Math.random() < 0.5 ? 1 : -1;
      this.apply(); this.resize();
      if (window.MD_saveState) window.MD_saveState();
    },
    reset: function () {
      this.P = {
        mode: "nebula", theme: "diag", useCustom: false,
        custom: { bg: "#04070D", a: "#25D4EE", b: "#4D8DFF", c: "#E45CFF", d: "#43E08B" },
        density: 64, count: 150, speed: 100, turb: 38, scale: 66, glow: 60,
        blur: 0, stroke: 1.4, drift: 40, dir: 1, quality: "std", format: "free",
        grid: true, grain: true, scan: true, vig: true, run: true, bg: true
      };
      this.apply(); this.resize();
      if (window.MD_saveState) window.MD_saveState();
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
      if (this.P.run && !document.hidden) this.start(); else { this.stop(); this.drawAll(); }
      this.sync();
    },
    start: function () {
      if (this.running || !this.targets.length) return;
      this.running = true; this.last = performance.now();
      var s = this;
      var loop = function (n) {
        if (!s.running) return;
        var dt = Math.min(0.05, (n - s.last) / 1000);
        s.last = n;
        s.t += dt * (s.P.speed / 100) * s.P.dir;
        s.drawAll();
        s.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },
    stop: function () { this.running = false; cancelAnimationFrame(this.raf); },
    mk: function (t) {
      var P = this.P, W = t.W, H = t.H, I = P.density / 100;
      var n = Math.round(clamp(P.count * (W * H) / (1280 * 720), 12, 340) * t.scale);
      var i, pts = [], bl = [], ln = [], tr = [[], [], []];
      for (i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (0.2 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1),
          vy: (Math.random() - 0.5) * 0.4,
          r: 0.8 + Math.random() * 1.9, p: Math.random() * 6.28,
          k: Math.floor(Math.random() * 4)
        });
      }
      for (i = 0; i < Math.round(16 * I) + 5; i++) bl.push({ a: Math.random() * 6.28, d: 0.14 + Math.random() * 0.82, h: 0 });
      for (i = 0; i < Math.round(9 * I) + 3; i++) ln.push({ h: Math.random() < 0.5, pos: Math.random(), sp: 0.0007 + Math.random() * 0.0022, o: Math.random() });
      for (i = 0; i < 150; i++) { tr[0].push(0.5); tr[1].push(0.4); tr[2].push(0.6); }
      return { pts: pts, blips: bl, lanes: ln, tr: tr, ph: 0, gears: null, goff: 0, tile: null, tk: "" };
    },
    drawAll: function () {
      var s = this;
      this.targets.forEach(function (t) {
        if (!t.W || !t.H) return;
        if (!t.preview && !s.P.bg) return;
        var k = [s.P.mode, s.P.count, s.P.scale, s.P.density, t.W, t.H, t.scale].join("|");
        if (t.key !== k) { t.st = s.mk(t); t.key = k; }
        try { s.draw(t.ctx, t.W, t.H, s.t, s.P, t.st, s.pal(), t.scale); }
        catch (e) {
          s.fails++;
          logErr("scene " + s.P.mode, e);
          if (s.fails > 3) { s.P.mode = "blueprint"; s.fails = 0; t.key = ""; toast("warn", "Scene desactivee", "Retour grille technique."); }
        }
      });
    },
    draw: function (c, W, H, t, P, st, TH, sc) {
      var I = P.density / 100, TB = P.turb / 100, G = P.glow / 100, LW = P.stroke;
      var DR = 0.2 + P.drift / 100, SP = P.speed / 100;
      var cols = [TH.a, TH.b, TH.c, TH.d];
      var i, j;
      var glow = function (v) { c.shadowColor = v; c.shadowBlur = G * 16; };
      var ng = function () { c.shadowBlur = 0; };

      c.globalCompositeOperation = "source-over";
      c.globalAlpha = 1;
      c.fillStyle = (P.mode === "oscillo") ? (TH.bg + "2E") : TH.bg;
      c.fillRect(0, 0, W, H);
      c.lineWidth = LW; c.lineCap = "round";

      if (P.grid && P.mode !== "carbon" && P.mode !== "aurora" && P.mode !== "nebula") {
        var s0 = Math.max(18, P.scale), o0 = (t * 9 * DR) % s0;
        c.strokeStyle = TH.a + "12"; c.beginPath();
        for (i = -o0; i < W + s0; i += s0) { c.moveTo(i, 0); c.lineTo(i, H); }
        for (j = -o0 * 0.6; j < H + s0; j += s0) { c.moveTo(0, j); c.lineTo(W, j); }
        c.stroke();
      }

      if (P.mode === "nebula") {
        c.globalCompositeOperation = "lighter";
        var blobs = [[0.28, 0.32, 0], [0.72, 0.6, 1], [0.5, 0.2, 2], [0.34, 0.8, 3], [0.82, 0.24, 0]];
        for (i = 0; i < blobs.length; i++) {
          var bb = blobs[i];
          var bx = W * (bb[0] + Math.sin(t * 0.19 * DR + i * 1.7) * 0.14);
          var by = H * (bb[1] + Math.cos(t * 0.16 * DR + i * 1.1) * 0.14);
          var br = Math.min(W, H) * (0.3 + 0.12 * Math.sin(t * 0.27 + i));
          var gg = c.createRadialGradient(bx, by, 0, bx, by, br);
          gg.addColorStop(0, cols[bb[2]] + hex(0.20 * I + 0.05));
          gg.addColorStop(0.55, cols[bb[2]] + hex(0.07 * I));
          gg.addColorStop(1, cols[bb[2]] + "00");
          c.fillStyle = gg; c.fillRect(0, 0, W, H);
        }
        c.globalCompositeOperation = "source-over";
        var dust = st.pts.slice(0, Math.round(90 * sc));
        for (i = 0; i < dust.length; i++) {
          var dp = dust[i];
          dp.p += 0.02 * SP;
          dp.x += Math.sin(t * 0.2 + dp.p) * 0.25 * DR;
          dp.y -= 0.12 * SP * DR;
          if (dp.y < -4) dp.y = H + 4;
          if (dp.y > H + 4) dp.y = -4;
          c.fillStyle = TH.d + hex((0.12 + Math.sin(dp.p) * 0.12) * I + 0.04);
          c.fillRect(dp.x, dp.y, dp.r * 0.9, dp.r * 0.9);
        }
      }
      else if (P.mode === "aurora") {
        c.globalCompositeOperation = "lighter";
        var ab = [[0.26, 0.3, 0], [0.74, 0.62, 2], [0.54, 0.2, 1], [0.3, 0.82, 3]];
        for (i = 0; i < ab.length; i++) {
          var a2 = ab[i];
          var ax = W * (a2[0] + Math.sin(t * 0.22 * DR + i * 2) * 0.12);
          var ay = H * (a2[1] + Math.cos(t * 0.18 * DR + i) * 0.12);
          var ar = Math.min(W, H) * (0.34 + 0.09 * Math.sin(t * 0.3 + i));
          var ag = c.createRadialGradient(ax, ay, 0, ax, ay, ar);
          ag.addColorStop(0, cols[a2[2]] + hex(0.18 * I + 0.04));
          ag.addColorStop(1, cols[a2[2]] + "00");
          c.fillStyle = ag; c.fillRect(0, 0, W, H);
        }
        c.globalCompositeOperation = "source-over";
        var ap = st.pts.slice(0, Math.round(70 * sc));
        for (i = 0; i < ap.length; i++) {
          ap[i].p += 0.03;
          c.fillStyle = TH.d + hex((0.14 + Math.sin(ap[i].p) * 0.12) * I);
          c.fillRect(ap[i].x, ap[i].y, 1.6, 1.6);
        }
      }
      else if (P.mode === "flux") {
        var pts = st.pts;
        for (i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.x += p.vx * SP * 1.7 + Math.sin(t * 0.6 + p.p) * TB * 0.7;
          p.y += p.vy * SP * 1.7 + Math.cos(t * 0.5 + p.p) * TB * 0.7;
          if (p.x < -12) p.x = W + 12; if (p.x > W + 12) p.x = -12;
          if (p.y < -12) p.y = H + 12; if (p.y > H + 12) p.y = -12;
        }
        var R = Math.max(48, P.scale * 1.4), R2 = R * R;
        for (i = 0; i < pts.length; i++) {
          for (j = i + 1; j < pts.length; j++) {
            var a3 = pts[i], b3 = pts[j];
            var dx = a3.x - b3.x, dy = a3.y - b3.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              c.strokeStyle = TH.a + hex((1 - d2 / R2) * 0.14 * I);
              c.beginPath(); c.moveTo(a3.x, a3.y); c.lineTo(b3.x, b3.y); c.stroke();
            }
          }
        }
        for (i = 0; i < pts.length; i++) {
          var pp = pts[i], col = cols[pp.k];
          glow(col); c.fillStyle = col; c.globalAlpha = 0.72 * I + 0.15;
          c.beginPath(); c.arc(pp.x, pp.y, pp.r, 0, 6.283); c.fill();
          c.globalAlpha = 1; ng();
        }
      }
      else if (P.mode === "blueprint") {
        var s1 = Math.max(18, P.scale), o1 = (t * 9 * DR) % s1;
        c.strokeStyle = TH.b + "14"; c.beginPath();
        for (i = -o1 * 2; i < W + H; i += s1 * 4) { c.moveTo(i, 0); c.lineTo(i - H, H); }
        c.stroke();
        for (i = 0; i < st.lanes.length; i++) {
          var l = st.lanes[i];
          l.o = (l.o + l.sp * SP * 2 + 1) % 1;
          var px = l.h ? W * l.o : H * l.o;
          glow(TH.a); c.fillStyle = TH.a + "CC";
          if (l.h) c.fillRect(px, Math.floor(l.pos * H / s1) * s1 - o1 * 0.6, 26, LW + 1);
          else c.fillRect(Math.floor(l.pos * W / s1) * s1 - o1, px, LW + 1, 26);
          ng();
        }
        for (i = 0; i < st.pts.length; i++) {
          if (i % 2) continue;
          var q = st.pts[i];
          q.p += 0.02 * SP;
          c.strokeStyle = TH.a + hex((0.22 + Math.sin(q.p) * 0.18) * I);
          c.beginPath(); c.moveTo(q.x - 5, q.y); c.lineTo(q.x + 5, q.y);
          c.moveTo(q.x, q.y - 5); c.lineTo(q.x, q.y + 5); c.stroke();
        }
      }
      else if (P.mode === "radar") {
        var cx = W * 0.66, cy = H * 0.46, RR = Math.min(W, H) * 0.42;
        var ang = (t * 0.8 * SP) % 6.283;
        c.strokeStyle = TH.a + "22";
        for (i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, RR * i / 4, 0, 6.283); c.stroke(); }
        c.beginPath(); c.moveTo(cx - RR, cy); c.lineTo(cx + RR, cy);
        c.moveTo(cx, cy - RR); c.lineTo(cx, cy + RR); c.stroke();
        for (i = 0; i < 6.283; i += Math.PI / 12) {
          c.beginPath();
          c.moveTo(cx + Math.cos(i) * RR * 0.94, cy + Math.sin(i) * RR * 0.94);
          c.lineTo(cx + Math.cos(i) * RR, cy + Math.sin(i) * RR); c.stroke();
        }
        if (c.createConicGradient) {
          var cg = c.createConicGradient(ang, cx, cy);
          cg.addColorStop(0, TH.a + "55"); cg.addColorStop(0.14, TH.a + "00"); cg.addColorStop(1, TH.a + "00");
          c.fillStyle = cg; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, RR, 0, 6.283); c.fill();
        }
        glow(TH.a); c.strokeStyle = TH.a; c.lineWidth = LW + 0.6;
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * RR, cy + Math.sin(ang) * RR); c.stroke();
        ng(); c.lineWidth = LW;
        for (i = 0; i < st.blips.length; i++) {
          var bl2 = st.blips[i];
          var da = ((ang - bl2.a) % 6.283 + 6.283) % 6.283;
          if (da < 0.07) bl2.h = 1;
          bl2.h *= 0.986;
          if (bl2.h > 0.02) {
            glow(TH.d); c.fillStyle = TH.d + hex(bl2.h * 0.9);
            c.beginPath(); c.arc(cx + Math.cos(bl2.a) * RR * bl2.d, cy + Math.sin(bl2.a) * RR * bl2.d, 3, 0, 6.283); c.fill(); ng();
          }
        }
        c.fillStyle = TH.a + "88"; c.font = "9px monospace";
        c.fillText("PORTEE " + Math.round(RR) + " u", cx - RR, cy + RR + 16);
      }
      else if (P.mode === "oscillo") {
        var ch = Math.max(2, Math.round(2 + I * 4));
        st.ph += 0.05 * SP;
        for (var k2 = 0; k2 < ch; k2++) {
          var base = H * (k2 + 0.6) / (ch + 0.2), amp = H / (ch * 3.1), col2 = cols[k2 % 4];
          glow(col2); c.strokeStyle = col2; c.lineWidth = LW + 0.4; c.beginPath();
          for (i = 0; i <= W; i += 3) {
            var u = i / W * 12 + st.ph + k2 * 1.3;
            var y = base + Math.sin(u) * amp * 0.6 + Math.sin(u * 3.1 + k2) * amp * 0.28 * TB + Math.sin(u * 7.7) * amp * 0.14 * TB;
            if (i) c.lineTo(i, y); else c.moveTo(i, y);
          }
          c.stroke(); ng();
          c.fillStyle = col2 + "99"; c.font = "9px monospace";
          c.fillText("CYL" + (k2 + 1), 8, base - amp - 4);
        }
        c.strokeStyle = TH.d + "55"; c.setLineDash([4, 5]);
        c.beginPath(); c.moveTo(W * 0.5, 0); c.lineTo(W * 0.5, H); c.stroke();
        c.setLineDash([]); c.lineWidth = LW;
      }
      else if (P.mode === "gears") {
        var sg = Math.max(30, P.scale), ag2 = t * 0.7 * SP * DR * 2;
        if (!st.gears) {
          var defs = [[sg * 1.15, 18], [sg * 0.78, 12], [sg * 0.55, 9], [sg * 0.9, 14]], arr = [];
          for (i = 0; i < defs.length; i++) {
            var r2 = defs[i][0], pr = arr[i - 1];
            var ccx = i ? pr.cx + pr.r + r2 + sg * 0.16 : 0;
            arr.push({ cx: ccx, r: r2, teeth: defs[i][1], col: cols[i % 4], dir: i % 2 ? -1 : 1, ratio: 18 / defs[i][1] });
          }
          st.gears = arr; st.goff = -arr[arr.length - 1].cx / 2;
        }
        c.save(); c.translate(W * 0.5 + st.goff, H * 0.44);
        for (i = 0; i < st.gears.length; i++) {
          var g2 = st.gears[i];
          c.save(); c.translate(g2.cx, 0); c.rotate(ag2 * g2.dir * g2.ratio);
          glow(g2.col); c.strokeStyle = g2.col; c.lineWidth = LW + 0.5;
          c.beginPath(); c.arc(0, 0, g2.r, 0, 6.283); c.stroke();
          for (j = 0; j < g2.teeth; j++) {
            var aa = j * 6.283 / g2.teeth;
            c.beginPath();
            c.moveTo(Math.cos(aa) * g2.r, Math.sin(aa) * g2.r);
            c.lineTo(Math.cos(aa) * (g2.r + sg * 0.16), Math.sin(aa) * (g2.r + sg * 0.16));
            c.stroke();
          }
          ng(); c.strokeStyle = g2.col + "66";
          c.beginPath(); c.arc(0, 0, g2.r * 0.32, 0, 6.283); c.stroke();
          c.restore();
        }
        c.restore();
        var cr = Math.min(W, H) * 0.1, rl = cr * 3.1;
        var px2 = W * 0.5, py2 = H * 0.87, a4 = ag2 * 1.6;
        var pinx = px2 + Math.cos(a4) * cr, piny = py2 + Math.sin(a4) * cr;
        var pist = py2 - Math.sqrt(Math.max(1, rl * rl - Math.pow(pinx - px2, 2)));
        glow(TH.b); c.strokeStyle = TH.b; c.lineWidth = LW + 0.8;
        c.beginPath(); c.arc(px2, py2, cr, 0, 6.283); c.stroke();
        c.beginPath(); c.moveTo(px2, py2); c.lineTo(pinx, piny); c.lineTo(px2, pist); c.stroke();
        c.strokeRect(px2 - cr * 0.62, pist - cr * 0.5, cr * 1.24, cr * 0.72);
        ng(); c.lineWidth = LW;
      }
      else if (P.mode === "carbon") {
        var sc2 = Math.max(14, Math.round(P.scale / 2));
        if (!st.tile || st.tk !== sc2 + TH.bg) {
          var o2 = document.createElement("canvas");
          o2.width = o2.height = sc2 * 2;
          var oc = o2.getContext("2d");
          oc.fillStyle = TH.bg; oc.fillRect(0, 0, sc2 * 2, sc2 * 2);
          for (var yy = 0; yy < 2; yy++) {
            for (var xx = 0; xx < 2; xx++) {
              var lg = oc.createLinearGradient(xx * sc2, yy * sc2, (xx + 1) * sc2, (yy + 1) * sc2);
              lg.addColorStop(0, (xx + yy) % 2 === 0 ? "#FFFFFF10" : "#FFFFFF04");
              lg.addColorStop(1, "#00000030");
              oc.fillStyle = lg; oc.fillRect(xx * sc2, yy * sc2, sc2, sc2);
            }
          }
          st.tile = c.createPattern(o2, "repeat"); st.tk = sc2 + TH.bg;
        }
        c.fillStyle = st.tile || TH.bg; c.fillRect(0, 0, W, H);
        var sw = ((t * 0.16 * SP * DR * 2) % 1.6 - 0.3) * W;
        var g3 = c.createLinearGradient(sw - W * 0.2, 0, sw + W * 0.2, H);
        g3.addColorStop(0, TH.a + "00");
        g3.addColorStop(0.5, TH.a + hex((0.12 * I + 0.05)));
        g3.addColorStop(1, TH.a + "00");
        c.fillStyle = g3; c.fillRect(0, 0, W, H);
        var hp2 = st.pts.slice(0, Math.round(26 * sc));
        for (i = 0; i < hp2.length; i++) {
          var hq = hp2[i];
          hq.p += 0.012;
          var hr = 8 + Math.sin(hq.p) * 4;
          c.strokeStyle = cols[i % 4] + hex((0.18 + Math.sin(hq.p) * 0.12) * I);
          c.beginPath();
          for (j = 0; j < 6; j++) {
            var ha = j * 1.0472 + hq.p * 0.2;
            var hx = hq.x + Math.cos(ha) * hr, hy = hq.y + Math.sin(ha) * hr;
            if (j) c.lineTo(hx, hy); else c.moveTo(hx, hy);
          }
          c.closePath(); c.stroke();
        }
      }
      else if (P.mode === "tunnel") {
        var cx2 = W * 0.5, cy2 = H * 0.5;
        var maxR = Math.max(W, H) * 0.75;
        var rings = Math.round(10 + I * 16);
        for (i = 0; i < rings; i++) {
          var z = ((i / rings) + (t * 0.06 * SP * DR)) % 1;
          if (z < 0) z += 1;
          var rr = maxR * (0.04 + z * z);
          var al = clamp(z * 0.9, 0, 1) * (0.25 + I * 0.5);
          var col3 = cols[i % 4];
          glow(col3);
          c.strokeStyle = col3 + hex(al * 0.55);
          c.lineWidth = LW + z * 1.6;
          c.beginPath();
          for (j = 0; j <= 6; j++) {
            var ta = j * 1.0472 + t * 0.05 * DR + z * 0.6;
            var tx = cx2 + Math.cos(ta) * rr, ty = cy2 + Math.sin(ta) * rr * 0.72;
            if (j) c.lineTo(tx, ty); else c.moveTo(tx, ty);
          }
          c.stroke(); ng();
        }
        c.strokeStyle = TH.a + "22"; c.lineWidth = LW;
        for (j = 0; j < 12; j++) {
          var la = j * 0.5236 + t * 0.05 * DR;
          c.beginPath(); c.moveTo(cx2, cy2);
          c.lineTo(cx2 + Math.cos(la) * maxR, cy2 + Math.sin(la) * maxR * 0.72);
          c.stroke();
        }
        var tp = st.pts.slice(0, Math.round(50 * sc));
        for (i = 0; i < tp.length; i++) {
          var tq = tp[i];
          var dx2 = tq.x - cx2, dy2 = tq.y - cy2;
          var dd = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
          var spd = 0.6 + SP * 1.4;
          tq.x += (dx2 / dd) * spd; tq.y += (dy2 / dd) * spd;
          if (tq.x < -20 || tq.x > W + 20 || tq.y < -20 || tq.y > H + 20) {
            tq.x = cx2 + (Math.random() - 0.5) * 40;
            tq.y = cy2 + (Math.random() - 0.5) * 40;
          }
          c.fillStyle = cols[tq.k] + "AA";
          c.fillRect(tq.x, tq.y, tq.r, tq.r);
        }
        c.lineWidth = LW;
      }
      else {
        for (i = 0; i < st.tr.length; i++) {
          var arr2 = st.tr[i];
          var last = arr2[arr2.length - 1];
          var tg = 0.5 + Math.sin(t * (0.6 + i * 0.35)) * 0.3 + Math.sin(t * (2.1 + i)) * 0.12 * TB;
          arr2.push(clamp(last + (tg - last) * 0.16 * SP, 0.05, 0.95));
          if (arr2.length > 150) arr2.shift();
        }
        var gw = W * 0.68, gh = H * 0.6, ox = W * 0.06, oy = H * 0.12;
        c.strokeStyle = TH.a + "18";
        for (i = 0; i <= 4; i++) { var yv = oy + gh * i / 4; c.beginPath(); c.moveTo(ox, yv); c.lineTo(ox + gw, yv); c.stroke(); }
        for (i = 0; i < st.tr.length; i++) {
          var tr2 = st.tr[i], col4 = cols[i % 4];
          glow(col4); c.strokeStyle = col4; c.lineWidth = LW + 0.5; c.beginPath();
          for (j = 0; j < tr2.length; j++) {
            var tx2 = ox + gw * j / (tr2.length - 1), ty2 = oy + gh * (1 - tr2[j]);
            if (j) c.lineTo(tx2, ty2); else c.moveTo(tx2, ty2);
          }
          c.stroke(); ng();
          var lv = tr2[tr2.length - 1];
          c.fillStyle = col4; c.font = "600 11px monospace";
          var lbl = ["REGIME", "COUPLE", "PRESSION"][i];
          var val = [Math.round(lv * 7000), Math.round(lv * 600), (lv * 2.4).toFixed(2)][i];
          c.fillText(lbl + "  " + val, ox + gw + 12, oy + 18 + i * 22);
          c.fillStyle = col4 + "33";
          c.fillRect(ox + gw + 12, oy + 24 + i * 22, Math.max(2, lv * 70), 3);
        }
        var bars = 8, bw = (W * 0.86) / bars;
        for (i = 0; i < bars; i++) {
          var vv = 0.25 + Math.abs(Math.sin(t * 1.4 + i * 0.7)) * 0.7 * (0.5 + TB * 0.5);
          var h2 = H * 0.13 * vv;
          glow(cols[i % 4]); c.fillStyle = cols[i % 4] + "AA";
          c.fillRect(ox + i * bw, H * 0.92 - h2, bw * 0.62, h2); ng();
        }
        c.lineWidth = LW;
      }

      if (P.vig) {
        var gv = c.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
        gv.addColorStop(0, "#00000000");
        gv.addColorStop(1, "#000000" + ((P.mode === "aurora" || P.mode === "nebula") ? "55" : "88"));
        c.fillStyle = gv; c.fillRect(0, 0, W, H);
      }
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = 1;
    },
    exportPNG: function () {
      var F = { free: [1600, 900], mobile: [1170, 2532], tablet: [1668, 2224], desktop: [1920, 1080] }[this.P.format] || [1600, 900];
      var s = this;
      safe("png", function () {
        var cv = document.createElement("canvas");
        cv.width = F[0]; cv.height = F[1];
        var cx = cv.getContext("2d");
        var tg = { W: F[0], H: F[1], scale: 1 };
        tg.st = s.mk(tg);
        s.draw(cx, F[0], F[1], s.t, s.P, tg.st, s.pal(), 1);
        var u = cv.toDataURL("image/png");
        var a = document.createElement("a");
        a.href = u;
        a.download = "mecadata_fond_" + s.P.mode + "_" + F[0] + "x" + F[1] + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        toast("ok", "Fond exporte", F[0] + "x" + F[1] + " px");
        beep("ok");
      }, toast("err", "Export PNG indisponible"));
    },
    label: function (k, v) {
      var u = { density: "%", speed: "%", turb: "%", glow: "%", scale: " px", stroke: " px", blur: " px", drift: "%", count: "" };
      return (k === "stroke" || k === "blur" ? Number(v).toFixed(1) : Math.round(v)) + (u[k] || "");
    },
    sync: function () {
      var P = this.P, pal = this.pal();
      var rb = $("#runb");
      if (rb) { rb.innerHTML = ic(P.run ? "pause" : "play"); rb.classList.toggle("on", P.run); }
      $$(".mb").forEach(function (b) { b.classList.toggle("on", b.dataset.m === P.mode); });
      $$(".pb").forEach(function (b) { b.classList.toggle("on", !P.useCustom && b.dataset.t === P.theme); });
      $$("[data-p]").forEach(function (el) {
        var k = el.dataset.p, v = P[k];
        if (el.type === "checkbox") el.checked = !!v;
        else el.value = v;
        var o = $("[data-pv='" + k + "']");
        if (o) o.textContent = WP.label(k, v);
      });
      $$("[data-c]").forEach(function (el) { el.value = P.custom[el.dataset.c]; });
      var ct = $("#customToggle");
      if (ct) ct.checked = !!P.useCustom;
      var h = $("#hud");
      if (h) {
        h.innerHTML = "<span>" + P.mode.toUpperCase() + "</span><span>" + esc(pal.n).toUpperCase() + "</span><span>" + P.count + " pts</span><span>" + (P.dir > 0 ? "AVANT" : "ARRIERE") + "</span><span>" + (P.run ? "LIVE" : "PAUSE") + "</span>";
      }
    }
  };

  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) {
      var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * v).toString(16).padStart(2, "0");
    };
    return "#" + f(0) + f(8) + f(4);
  }

  /* ══════════ PACK PEUGEOT 3008 II PHASE 2 (2017-2021) ══════════ */
  safe("pack3008", function () {
    var R = window.MD_RAW;
    if (!R) return;
    var FAMS_E = "EB2;EB2ADTS;EB2ADTX";
    var FAMS_D = "DV5;DV5RUC;DV5RUCd";
    var FAMS_ALL = FAMS_E + ";" + FAMS_D;

    if (!R.md.peugeot) R.md.peugeot = [];
    var has = false;
    for (var i = 0; i < R.md.peugeot.length; i++) {
      if (R.md.peugeot[i][0] === "3008 II Phase 2") has = true;
    }
    if (!has) R.md.peugeot.push(["3008 II Phase 2", 2017, 2021, 4]);

    var newFa = [
      ["EB2ADTS", "e", 1199, "1.2 PureTech 130", [[130, 230]], "BVM6", 2017, 2021, ["peugeot"], [4]],
      ["EB2ADTX", "e", 1199, "1.2 PureTech 130 EAT8", [[130, 230]], "EAT8", 2017, 2021, ["peugeot"], [4]],
      ["DV5RUCd", "d", 1499, "1.5 BlueHDi 130", [[130, 300]], "BVM6", 2017, 2021, ["peugeot"], [4]],
      ["DV5RUC", "d", 1499, "1.5 BlueHDi 130 EAT8", [[130, 300]], "EAT8", 2017, 2021, ["peugeot"], [4]]
    ];
    for (i = 0; i < newFa.length; i++) {
      var found = false;
      for (var j = 0; j < R.fa.length; j++) if (R.fa[j][0] === newFa[i][0]) found = true;
      if (!found) R.fa.push(newFa[i]);
    }

    var newFt = [
      ["3008 P2 - courroie de distribution humide desagregee", FAMS_E, "critique", "elevee", 2017, 2021, 40000, 120000, "Voyant pression huile|Crépine colmatée|Casse moteur", "Courroie bain d huile degradee par huile non conforme ou vidanges espacees.", "Courroie derniere reference + depose carter + nettoyage crepine + huile 0W-20 B71 2010 ; controle a chaque vidange.", 450, 1100, "Rappel + extension 10 ans / 175 000 km"],
      ["3008 P2 - consommation d huile 1.2 PureTech", FAMS_E, "majeure", "moyenne", 2017, 2021, 30000, 110000, "Appoint > 0,5 L/1000 km|Bougies encrassees|Fumee bleue", "Segmentation et decanteur sensibles sur EB2.", "Test de consommation norme ; segmentation si hors tolerance.", 150, 1500, "Procedure constructeur"],
      ["3008 P2 - chaine AAC 7 mm rupture", FAMS_D, "critique", "moyenne", 2017, 2021, 60000, 150000, "Cliquetis haut moteur|Casse chaine AAC|Calage distribution", "Chaine d arbres a cames 7 mm sous-dimensionnee, guides uses.", "Kit complet 8 mm + pignons + carter modifie (TSB) ; jeux AAC controles.", 1200, 2300, "Rappel + extension garantie"],
      ["3008 P2 - SCR AdBlue pompe et cristallisation", FAMS_D, "majeure", "elevee", 2017, 2021, 40000, 140000, "Defaut antipollution|Countdown demarrage interdit|P20E8", "Cristallisation d uree, pompe integree HS, injecteur bouche.", "Reservoir-pompe + injecteur uree + reset apprentissages ; AdBlue frais.", 900, 1900, "Rappel reservoir AdBlue"],
      ["3008 P2 - sondes NOx SCR", FAMS_D, "moderee", "moyenne", 2017, 2021, 40000, 130000, "Voyant moteur|Countdown antipollution|Defaut NOx", "Sondes NOx amont/aval et qualite AdBlue.", "Diagnostic valise sondes + injecteur uree + reset SCR.", 300, 1300, "Surveillance"],
      ["3008 P2 - vanne EGR encrassee", FAMS_D, "moderee", "elevee", 2017, 2021, 40000, 150000, "A-coups|Fumee noire|Perte de puissance|Mode degrade", "Calamine sur clapet et radiateur EGR (trajets courts).", "Nettoyage ou remplacement EGR + adaptation valise.", 150, 800, "Surveillance"],
      ["3008 P2 - FAP colmatage usage urbain", FAMS_D, "majeure", "elevee", 2017, 2021, 30000, 140000, "Voyant FAP|Regenerations frequentes|Mode degrade", "Regenerations incompletes en usage urbain.", "Regeneration forcee, nettoyage FAP, trajet autoroutier regulier.", 120, 1500, "Surveillance"],
      ["3008 P2 - turbo geometrie variable grippee", FAMS_D, "majeure", "moyenne", 2017, 2021, 70000, 180000, "Sifflement|Perte de puissance|Mode tortue", "Calamine sur ailettes de geometrie variable, actionneur fatigue.", "Nettoyage / remplacement turbo + actionneur + apprentissage.", 600, 2000, "Surveillance"],
      ["3008 P2 - injecteurs debit retour", FAMS_D, "majeure", "moyenne", 2017, 2021, 80000, 200000, "Claquements|Demarrage difficile|Fumee|Ralenti instable", "Usure injecteurs, qualite gazole.", "Test debit retour + codage IMA + remplacement si hors cote.", 400, 1800, "Surveillance"],
      ["3008 P2 - pompe a vide de freinage", FAMS_ALL, "critique", "faible", 2017, 2021, 0, 90000, "Pedale dure|Assistance freinage reduite|Allongement distance", "Defaut de pompe a vide / clapet (campagne rappel 3008).", "Rappel : remplacement pompe a vide + controle circuit assistance.", 0, 0, "Rappel constructeur"],
      ["3008 P2 - boitier eau / thermostat fuite", FAMS_E, "majeure", "moyenne", 2017, 2021, 40000, 130000, "Fuite LDR|Surchauffe|Odeur sucree|Niveau qui baisse", "Module thermostat plastique fissure.", "Module complet + purge sous vide + controle durites.", 350, 850, "Surveillance"],
      ["3008 P2 - EAT8 a-coups et logiciel", "EAT8", "moderee", "moyenne", 2018, 2021, 20000, 120000, "A-coups 1-2|Hesitations|Passage brutal", "Cartographie boite premiere serie, apprentissages derives.", "Mise a jour calculateur EAT8 + recalibration + vidange AW-1 si > 100 000 km.", 0, 520, "TSB logiciel"],
      ["3008 P2 - train avant biellettes et silentblocs", FAMS_ALL, "mineure", "elevee", 2017, 2021, 40000, 140000, "Claquement train avant|Bruit sur dos d ane|Usure pneus irreguliere", "Biellettes de barre stabilisatrice et silentblocs de triangles fatigues.", "Remplacement biellettes / bras + geometrie complete.", 200, 750, "Surveillance"],
      ["3008 P2 - corrosion berceau et trains", FAMS_ALL, "moderee", "faible", 2017, 2021, 60000, 200000, "Corrosion perforante|Points de rouille sous caisse", "Protection anticorrosion insuffisante en zone salee.", "Traitement antirouille + controle structure + reprise berceau.", 400, 2200, "Surveillance"],
      ["3008 P2 - ecran tactile et camera ADAS", FAMS_ALL, "mineure", "moyenne", 2017, 2021, 10000, 150000, "Ecran fige|Camera de recul noire|ADAS indisponible", "Logiciel multimedia / faisceau hayon / calibration camera.", "Mise a jour BSI + reprise faisceau + calibration statique et dynamique.", 150, 700, "Campagne logicielle"],
      ["3008 P2 - batterie 12V Stop and Start", FAMS_ALL, "moderee", "elevee", 2017, 2021, 20000, 90000, "Non pret|Voyants aleatoires|Stop and Start inactif", "Batterie AGM/EFB sollicitee par cycles courts et veille.", "Batterie AGM/EFB + test alternateur + reset BSI.", 150, 380, "Surveillance"],
      ["3008 P2 - condenseur climatisation fuite", FAMS_ALL, "mineure", "moyenne", 2017, 2021, 40000, 160000, "Froid insuffisant|Perte de froid progressive", "Condenseur perce / joints R1234yf.", "Detection fuite + condenseur + recharge gaz spec.", 150, 1100, "Surveillance"]
    ];
    for (i = 0; i < newFt.length; i++) {
      var dup = false;
      for (j = 0; j < R.ft.length; j++) if (R.ft[j][0] === newFt[i][0]) dup = true;
      if (!dup) R.ft.push(newFt[i]);
    }

    var newTs = [
      ["RPL-PSA-2024-EB2-3008", "peugeot;citroen;ds;opel", FAMS_E, "RAPPEL - courroie distribution PureTech 3008 II", "2024-04", "Rappel", "critique", "Risque de casse moteur par colmatage de crepine sur 1.2 PureTech 2017-2021.", "Campagne rappel : controle / remplacement courroie + nettoyage circuit d huile ; prise en charge constructeur ; eligibilite VIN."],
      ["RPL-PSA-2023-DV5-3008", "peugeot;citroen;ds;opel", FAMS_D, "RAPPEL - chaine AAC 1.5 BlueHDi 3008 II", "2023-11", "Rappel", "critique", "Rupture de chaine d arbres a cames pouvant entrainer la casse moteur.", "Remplacement kit chaine 8 mm renforce + pignons + carter modifie ; controle distribution complete."],
      ["RPL-PSA-2021-VAC-3008", "peugeot", FAMS_ALL, "RAPPEL - pompe a vide de freinage 3008 II", "2021-06", "Rappel", "critique", "Defaut d assistance de freinage lie a la pompe a vide.", "Remplacement pompe a vide + controle circuit assistance + essai de freinage."],
      ["RPL-PSA-2019-ADB-3008", "peugeot;citroen;ds", FAMS_D, "RAPPEL - reservoir AdBlue 3008 II BlueHDi", "2019-10", "Rappel", "majeure", "Defaut du reservoir / pompe AdBlue entrainant countdown antipollution.", "Remplacement reservoir-pompe + injecteur uree + reset apprentissages SCR."],
      ["RPL-PSA-2018-SUS-3008", "peugeot", FAMS_ALL, "RAPPEL - trains roulants avant 3008 II", "2018-05", "Rappel", "majeure", "Defaut de fixation / usure prematuree d elements de train avant.", "Controle et remplacement biellettes / fixations + geometrie."],
      ["PSA-2020-EAT8-3008", "peugeot;citroen;ds;opel", "EAT8", "TSB - logiciel boite EAT8 3008 II", "2020-09", "Transmission", "moderee", "A-coups et hesitations a basse vitesse sur EAT8.", "Mise a jour calculateur boite + recalibration des apprentissages + essai routier."],
      ["PSA-2019-SCR-3008", "peugeot;citroen;ds", FAMS_D, "TSB - sondes NOx et SCR 3008 II", "2019-07", "Antipollution", "moderee", "Defauts NOx recurrents et countdown.", "Diagnostic guide sondes + injecteur uree + reset SCR + AdBlue frais."],
      ["PSA-2021-EGR-3008", "peugeot;citroen;ds", FAMS_D, "TSB - EGR / FAP 3008 II BlueHDi", "2021-03", "Antipollution", "moderee", "Encrassement EGR et colmatage FAP en usage urbain.", "Nettoyage EGR + regeneration forcee FAP + adaptation valise."],
      ["PSA-2020-BSI-3008", "peugeot", FAMS_ALL, "TSB - BSI / multimedia 3008 II", "2020-11", "Electronique", "mineure", "Ecran fige, camera de recul noire, ADAS indisponible.", "Mise a jour BSI / multimedia + reprise faisceau hayon + calibration camera."],
      ["PSA-2022-CLI-3008", "peugeot", FAMS_ALL, "TSB - condenseur climatisation 3008 II", "2022-04", "Climatisation", "mineure", "Perte de froid progressive par fuite condenseur.", "Detection fuite + remplacement condenseur + recharge R1234yf."]
    ];
    for (i = 0; i < newTs.length; i++) {
      var dup2 = false;
      for (j = 0; j < R.ts.length; j++) if (R.ts[j][0] === newTs[i][0]) dup2 = true;
      if (!dup2) R.ts.push(newTs[i]);
    }

    /* extension des familles existantes pour couvrir les nouveaux codes */
    for (i = 0; i < R.ft.length; i++) {
      var fam = String(R.ft[i][1] || "");
      if (/(^|;)EB2(;|$)/.test(fam)) R.ft[i][1] = fam + ";EB2ADTS;EB2ADTX";
      else if (/(^|;)DV5(;|$)/.test(fam)) R.ft[i][1] = fam + ";DV5RUC;DV5RUCd";
    }
    for (i = 0; i < R.ts.length; i++) {
      var tf = String(R.ts[i][2] || "");
      if (/(^|;)EB2(;|$)/.test(tf)) R.ts[i][2] = tf + ";EB2ADTS;EB2ADTX";
      else if (/(^|;)DV5(;|$)/.test(tf)) R.ts[i][2] = tf + ";DV5RUC;DV5RUCd";
    }
    for (i = 0; i < R.mt.length; i++) {
      var mf = String(R.mt[i][2] || "");
      if (/(^|;)EB2(;|$)/.test(mf)) R.mt[i][2] = mf + ";EB2ADTS;EB2ADTX";
      else if (/(^|;)DV5(;|$)/.test(mf)) R.mt[i][2] = mf + ";DV5RUC;DV5RUCd";
    }

    var hasPlan = false;
    for (i = 0; i < R.mt.length; i++) if (R.mt[i][0] === "PL-3008P2") hasPlan = true;
    if (!hasPlan) {
      R.mt.push([
        "PL-3008P2", "Peugeot 3008 II Phase 2 (2017-2021)", FAMS_ALL,
        ["0W-20 B71 2010 (PureTech) / 0W-30 B71 2312 (BlueHDi)", 3.9, "Specification imperative selon motorisation"],
        ["Courroie humide (EB2) / chaine AAC (DV5)", 100000, 72, "Controle courroie a CHAQUE vidange ; kit chaine 8 mm si concerne"],
        [
          ["Vidange + filtre huile", 20000, 12],
          ["Controle courroie / crepine (PureTech)", 20000, 12],
          ["Controle chaine AAC (BlueHDi)", 60000, 0],
          ["Filtre gazole", 40000, 48],
          ["Appoint AdBlue", 10000, 6],
          ["Filtre habitacle", 20000, 12],
          ["Bougies (PureTech)", 60000, 48],
          ["Vidange EAT8 (conseil)", 100000, 0],
          ["Liquide de freins", 0, 24],
          ["Controle trains / biellettes", 40000, 24]
        ],
        "Campagnes rappel : courroie EB2, chaine AAC DV5, pompe a vide, AdBlue. Verifier eligibilite VIN.",
        "",
        { f: "DOT4", l: "G30 PSA", w: 120, p: [2.5, 2.5], r: "R1234yf", b: "AGM 70Ah" }
      ]);
    }
  }, null);

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
  window.MD_hslHex = hslHex;
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
