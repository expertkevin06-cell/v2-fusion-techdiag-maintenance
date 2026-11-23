/* ══════════════════════════════════════════════════════════════════════════
   APP — catalogue, import universel, moteur principal, UI, événements.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Récupération des helpers depuis core ── */
  var $ = window.MD_$, $$ = window.MD_$$, esc = window.MD_esc, fmt = window.MD_fmt;
  var clamp = window.MD_clamp, uid = window.MD_uid, clone = window.MD_clone;
  var ov = window.MD_ov, ic = window.MD_ic, deb = window.MD_deb;
  var split = window.MD_split, nk = window.MD_nk, slug = window.MD_slug;
  var logErr = window.MD_logErr, safe = window.MD_safe;
  var STORE = window.MD_STORE, download = window.MD_download;
  var beep = window.MD_beep, toast = window.MD_toast;
  var openModal = window.MD_openModal, closeModal = window.MD_closeModal, confirmModal = window.MD_confirmModal;
  var WP = window.MD_WP, PREF = window.MD_PREF, ERRORS = window.MD_ERRORS;
  window.MD_saveState = null; /* sera défini plus bas */

  /* ── Constantes ── */
  var PWD = "Kevin83600", KEY = "mecadata_v71", YMAX = 2027;
  var SEGS = ["Citadine", "Micro-citadine", "Compacte", "SUV urbain", "SUV compact", "Berline", "Break", "Ludospace", "Utilitaire", "Coupé", "Roadster", "Sportive", "Monospace", "Pick-up"];
  var FU = { e: { l: "Essence", c: "#FFAF2E" }, d: { l: "Diesel", c: "#4D8DFF" }, h: { l: "Hybride", c: "#43E08B" }, p: { l: "Hybride rechargeable", c: "#19B8A6" }, b: { l: "Électrique", c: "#E45CFF" }, g: { l: "GPL / ECO-G", c: "#A8E63C" } };
  var SV = { critique: { w: 32, c: "#FF4D5E" }, majeure: { w: 18, c: "#FF7A3D" }, "modérée": { w: 9, c: "#FFAF2E" }, mineure: { w: 4, c: "#4D8DFF" }, info: { w: 0, c: "#25D4EE" } };
  var FQ = { "élevée": 1.25, moyenne: 1, faible: .7 };
  var GBL = { BVM: "BVM", BVM5: "BVM5", BVM6: "BVM6", BVA: "BVA", EAT6: "EAT6 Aisin", EAT8: "EAT8 Aisin", EDC6: "EDC6 Getrag", EDC7: "EDC7 Getrag", DQ200: "DSG7 DQ200 sec", DQ250: "DSG6 DQ250", DQ381: "DSG7 DQ381", DQ400: "DSG6 DQ400e", DQ500: "DSG7 DQ500", eCVT: "e-CVT planétaire", RED: "Réducteur", CVT: "CVT", DCT6: "DCT6 e-DCS6", DCT7: "DCT7", DCT8: "DCT8 humide", DCT9: "DCT9 AMG", ZF8: "ZF8", G9: "9G-Tronic", GTR7: "7G-DCT", PDK: "PDK", MMT: "Multimode", XTR: "Xtronic", AGS: "AGS", DHT: "DHT dédié", DPS6: "Powershift DPS6", BVM: "BVM" };
  var FILES = [["brands", "brands.json", "Marques"], ["models", "models.json", "Modèles"], ["engines", "engines.json", "Motorisations"], ["faults", "faults.json", "Pannes"], ["tsb", "tsb.json", "TSB / Rappels"], ["maint", "maintenance.json", "Plans"]];
  var IVL = function (v) { return v >= 75 ? ["CRITIQUE", "#FF4D5E"] : v >= 50 ? ["ÉLEVÉ", "#FF7A3D"] : v >= 25 ? ["MODÉRÉ", "#FFAF2E"] : ["FAIBLE", "#43E08B"]; };
  var GBF = function (t) { return /DQ200/.test(t) ? ["DQ200"] : /DSG humide/.test(t) ? ["DQ250", "DQ381", "DQ500"] : /EDC6/.test(t) ? ["EDC6"] : /EAT8/.test(t) ? ["EAT8"] : /DPS6/.test(t) ? ["DPS6"] : /ZF8/.test(t) ? ["ZF8"] : /DCT8/.test(t) ? ["DCT8"] : []; };
  var ATMO = /V10|V12|W12|W16|Flat-6|Boxer|Skyactiv-G|VVT|Super 3|Seven|Pentastar|Nettuno/;

  /* ── État global ── */
  var SEED = null, DB = null, AUDIT = [], GARAGE = [], VIEWS = [], UNDO = null, TESTS = [];
  var IVIC = {}, MIDX = {}, BIDX = {};
  var META = { counts: {}, links: 0, corr: 0, integ: { err: [], warn: [], ok: true, pct: 100 }, size: 0, byBrand: {}, byFuel: {} };
  var S = {
    view: "bord",
    f: { q: "", brand: "", fuels: [], seg: "", y: [2017, YMAX], p: [0, 2100], sort: "brand" },
    shown: 48,
    tech: { tab: "faults", q: "", sev: "", brand: "", cat: "" },
    adm: { tab: "engines", q: "", page: 0, sel: [] },
    plan: null, planCtx: null,
    calc: { km: 60000, year: 2021, sev: 1 },
    drawer: null
  };
  window.MD_STATE = S;

  var isAdm = function () { return STORE.sget("md_adm") === "1"; };

  function save() {
    safe("save", function () {
      STORE.set(KEY, JSON.stringify({ v: 71, db: DB, audit: AUDIT.slice(-60), garage: GARAGE, views: VIEWS, prefs: PREF, wp: WP.P }));
      updStor();
    }, null);
  }
  window.MD_saveState = deb(save, 400);

  function audit(t, m) { AUDIT.push({ ts: Date.now(), type: t, msg: m }); if (AUDIT.length > 120) AUDIT = AUDIT.slice(-120); }
  function snapshot(l) { UNDO = { label: l, db: clone(DB), garage: GARAGE.slice() }; }
  function doUndo() {
    if (!UNDO) return;
    DB = UNDO.db; GARAGE = UNDO.garage;
    var l = UNDO.label; UNDO = null;
    mutate("imp", "Annulation — " + l);
    toast("ok", "Action annulée", "Base restaurée.");
  }
  var selHas = function (i) { return S.adm.sel.indexOf(i) > -1; };
  var selAdd = function (i) { if (!selHas(i)) S.adm.sel.push(i); };
  var selDel = function (i) { var x = S.adm.sel.indexOf(i); if (x > -1) S.adm.sel.splice(x, 1); };

  /* ── Construction du catalogue ── */
  function mkEngine(n, mid, code, fam, label, fuel, disp, hp, nm, y0, y1, gb) {
    var cyl = fuel === "b" ? "ÉLEC" : (disp >= 6000 ? "W12+" : (disp > 3400 ? "V8+" : (disp > 2400 ? "6 cyl." : (disp < 1100 ? "L3" : "L4"))));
    var asp = fuel === "b" ? "—" : (ATMO.test(label) ? "Atmo" : "Turbo");
    return {
      id: "E" + String(n).padStart(4, "0"), m: [mid], code: code, fam: fam, label: label,
      fuel: fuel, disp: disp, hp: hp, nm: nm, kw: Math.round(hp * .7355), y: [y0, y1], gb: gb,
      norm: (fuel === "b" ? "ZE" : (y0 >= 2024 ? "Euro 6e" : (y0 >= 2020 ? "Euro 6d" : "Euro 6"))),
      cyl: cyl, asp: asp, inj: (fuel === "b" ? "—" : (fuel === "d" ? "Common Rail" : "Injection directe")), note: ""
    };
  }

  function buildCatalog(R) {
    var D = { brands: [], models: [], engines: [], faults: [], tsb: [], maint: [] };
    R.br.forEach(function (b) { D.brands.push({ id: b[0], n: b[1], pays: b[2], grp: b[3] }); });
    var byBrand = {};
    Object.keys(R.md).forEach(function (bid) {
      byBrand[bid] = [];
      R.md[bid].forEach(function (m) {
        var rec = { id: bid + "-" + slug(m[0]), b: bid, n: m[0], y: [m[1], m[2]], seg: SEGS[m[3]] || "Compacte" };
        D.models.push(rec); byBrand[bid].push(rec);
      });
    });
    var seen = {}, n = 0;
    R.fa.forEach(function (f) {
      var code = f[0], fuel = f[1], disp = f[2], name = f[3], vars = f[4], gb = f[5], fy0 = f[6], fy1 = f[7], brs = f[8], segs = f[9];
      brs.forEach(function (bid) {
        (byBrand[bid] || []).forEach(function (m) {
          if (segs.indexOf(SEGS.indexOf(m.seg)) < 0) return;
          var y0 = Math.max(fy0, m.y[0]), y1 = Math.min(fy1, m.y[1]);
          if (y0 > y1) return;
          vars.forEach(function (v) {
            var hp = v[0], nm = v[1];
            var key = m.id + "|" + code + "|" + hp + "|" + gb;
            if (seen[key]) return;
            seen[key] = 1; n++;
            D.engines.push(mkEngine(n, m.id, code, code, name + " " + hp, fuel, disp, hp, nm, y0, y1, gb));
          });
        });
      });
    });
    var covered = {};
    D.engines.forEach(function (e) { covered[e.m[0]] = 1; });
    D.models.forEach(function (m) {
      if (covered[m.id]) return;
      var fam = null;
      for (var i = 0; i < R.fa.length; i++) { if (R.fa[i][8].indexOf(m.b) > -1) { fam = R.fa[i]; break; } }
      if (!fam) return;
      var v = fam[4][0];
      var y0 = Math.max(fam[6], m.y[0]), y1 = Math.min(fam[7], m.y[1]);
      if (y0 > y1) { y0 = m.y[0]; y1 = m.y[1]; }
      n++;
      D.engines.push(mkEngine(n, m.id, fam[0], fam[0], fam[3] + " " + v[0], fam[1], fam[2], v[0], v[1], y0, y1, fam[5]));
    });
    R.ft.forEach(function (f, i) {
      D.faults.push({ id: "F" + String(i + 1).padStart(3, "0"), t: f[0], fam: split(f[1]), sev: f[2], freq: f[3], y: [f[4], f[5]], km: [f[6], f[7]], sym: split(f[8]), cause: f[9], fix: f[10], cost: [f[11], f[12]], status: f[13], fuel: f[14] || "", m: [], gb: GBF(f[0]), e: [] });
    });
    R.ts.forEach(function (t, i) {
      D.tsb.push({ id: "T" + String(i + 1).padStart(3, "0"), ref: t[0], b: split(t[1]), fam: split(t[2]), t: t[3], date: t[4], cat: t[5], sev: t[6], sum: t[7], act: t[8], m: [], gb: GBF(t[3]) });
    });
    R.mt.forEach(function (p) {
      D.maint.push({ id: p[0], name: p[1], fam: split(p[2]), oil: p[3] || null, dist: p[4] || null, items: p[5] || [], note: p[6] || "", fuel: p[7] || "", extra: p[8] || null, base: [15000, 12] });
    });
    return D;
  }

  function reindex() {
    MIDX = {}; BIDX = {};
    DB.models.forEach(function (m) { MIDX[m.id] = m; });
    DB.brands.forEach(function (b) { BIDX[b.id] = b; });
  }
  function prune() {
    reindex();
    GARAGE = GARAGE.filter(function (i) { return DB.engines.some(function (e) { return e.id === i; }); });
    if (S.planCtx && !DB.engines.some(function (e) { return e.id === S.planCtx; })) S.planCtx = null;
    if (S.drawer && S.drawer.type === "engine" && !DB.engines.some(function (e) { return e.id === S.drawer.id; })) closeDrawer();
  }

  /* ── Accès modèles/marques/moteurs ── */
  var modelById = function (i) { return MIDX[i] || DB.models.filter(function (m) { return m.id === i; })[0]; };
  var brandById = function (i) { return BIDX[i] || DB.brands.filter(function (b) { return b.id === i; })[0]; };
  var engModels = function (e) { return e.m.map(modelById).filter(Boolean); };
  var engBrand = function (e) { var m = engModels(e)[0]; return m ? brandById(m.b) : null; };
  var engName = function (e) { var m = engModels(e)[0], b = engBrand(e); return ((b ? b.n : "") + " " + (m ? m.n : "") + " — " + e.label).trim(); };
  var fMatch = function (f, e) { return (f.fam || []).indexOf(e.fam) > -1 || (f.e || []).indexOf(e.id) > -1 || (f.m || []).some(function (i) { return e.m.indexOf(i) > -1; }) || (f.gb || []).indexOf(e.gb) > -1 || (f.fuel && f.fuel === e.fuel); };
  function faultsFor(e) {
    return DB.faults.filter(function (f) { return fMatch(f, e); }).map(function (f) {
      var g = clone(f); g.active = ov(f.y, e.y); return g;
    }).sort(function (a, b) { return (b.active - a.active) || ((SV[b.sev] || { w: 0 }).w - (SV[a.sev] || { w: 0 }).w); });
  }
  function tsbFor(e) {
    var bs = engModels(e).map(function (m) { return m.b; });
    return DB.tsb.filter(function (t) {
      return (t.fam || []).indexOf(e.fam) > -1 || (t.b || []).some(function (b) { return bs.indexOf(b) > -1; }) || (t.gb || []).indexOf(e.gb) > -1;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }
  function planFor(e) {
    return DB.maint.filter(function (p) { return (p.fam || []).indexOf(e.fam) > -1; })[0] ||
           DB.maint.filter(function (p) { return p.fuel === e.fuel; })[0] ||
           DB.maint.filter(function (p) { return p.fuel === (e.fuel === "g" ? "e" : e.fuel); })[0] ||
           DB.maint[0];
  }
  function ivi(e) {
    if (IVIC[e.id] !== undefined) return IVIC[e.id];
    var s = 0;
    faultsFor(e).forEach(function (f) { var w = (SV[f.sev] || { w: 0 }).w * (FQ[f.freq] || 1); s += f.active ? w : w * .25; });
    s = clamp(Math.round(s), 0, 100);
    IVIC[e.id] = s;
    return s;
  }
  var enginesForFault = function (f) { return DB.engines.filter(function (e) { return fMatch(f, e); }); };
  var enginesForTsb = function (t) {
    return DB.engines.filter(function (e) {
      var bs = engModels(e).map(function (m) { return m.b; });
      return (t.fam || []).indexOf(e.fam) > -1 || (t.b || []).some(function (b) { return bs.indexOf(b) > -1; }) || (t.gb || []).indexOf(e.gb) > -1;
    });
  };
  var isRecall = function (t) { return t.cat === "Rappel" || /^RPL-/.test(t.ref); };
  function famBrands(f) {
    var s = {};
    DB.engines.forEach(function (e) { if (e.fam === f) { var b = engBrand(e); if (b) s[b.id] = 1; } });
    return Object.keys(s);
  }

  /* ── Intégrité & recompute ── */
  function integrity() {
    var err = [], warn = [], mi = {}, bi = {}, fa = {}, du = 0;
    DB.models.forEach(function (m) { mi[m.id] = 1; });
    DB.brands.forEach(function (b) { bi[b.id] = 1; });
    DB.engines.forEach(function (e) { fa[e.fam] = 1; });
    FILES.forEach(function (f) { var s = {}; DB[f[0]].forEach(function (x) { if (s[x.id]) du++; s[x.id] = 1; }); });
    if (du) err.push(du + " identifiant(s) dupliqué(s)");
    DB.models.forEach(function (m) { if (!bi[m.b]) err.push("models : marque inconnue " + m.b); });
    var orph = 0; DB.engines.forEach(function (e) { e.m.forEach(function (i) { if (!mi[i]) orph++; }); });
    if (orph) err.push(orph + " référence(s) moteur → modèle orpheline(s)");
    DB.faults.forEach(function (f) { if (!SV[f.sev]) err.push("faults : sévérité " + f.sev); });
    DB.tsb.forEach(function (t) { (t.b || []).forEach(function (x) { if (!bi[x]) err.push("tsb : marque inconnue " + x); }); });
    DB.maint.forEach(function (p) { if (!p.items || !p.items.length) err.push("maint : plan vide " + p.id); });
    return { err: err, warn: warn, ok: !err.length, pct: err.length ? Math.max(0, 100 - err.length * 7) : 100 };
  }
  function recompute() {
    IVIC = {}; reindex();
    var fa = {}, links = 0, corr = 0, byBrand = {}, byFuel = {};
    DB.engines.forEach(function (e) {
      fa[e.fam] = 1; links += e.m.length;
      var m = MIDX[e.m[0]]; if (m) byBrand[m.b] = (byBrand[m.b] || 0) + 1;
      byFuel[e.fuel] = (byFuel[e.fuel] || 0) + 1;
      corr += faultsFor(e).length + tsbFor(e).length;
    });
    DB.faults.forEach(function (f) { links += (f.fam || []).length + (f.gb || []).length; });
    DB.tsb.forEach(function (t) { links += (t.b || []).length + (t.fam || []).length; });
    DB.maint.forEach(function (p) { links += (p.fam || []).length; });
    var inter = 0; Object.keys(fa).forEach(function (f) { if (famBrands(f).length > 1) inter++; });
    var doms = {}; DB.tsb.forEach(function (t) { doms[t.cat] = 1; });
    META = {
      counts: { b: DB.brands.length, m: DB.models.length, e: DB.engines.length, f: DB.faults.length, t: DB.tsb.length, p: DB.maint.length, fam: Object.keys(fa).length, inter: inter, rc: DB.tsb.filter(isRecall).length, dom: Object.keys(doms).length },
      links: links, corr: corr, integ: integrity(), size: Math.round(JSON.stringify(DB).length / 1024),
      byBrand: byBrand, byFuel: byFuel
    };
  }
  function updStor() {
    var k = META.size || 0, b = $("#sbar"), t = $("#stxt");
    if (b) b.style.width = clamp(k / 8192 * 100, 2, 100) + "%";
    if (t) t.textContent = k + " Ko · " + (STORE.local ? "local" : "mémoire");
  }
  function mutate(t, m) { recompute(); prune(); audit(t, m); save(); updateMeta(); render(); if (S.drawer) renderDrawer(); }

  /* ── Fragments HTML réutilisables ── */
  var sevTag = function (s) { return '<span class="sev ' + (s === "modérée" ? "mode" : esc(s)) + '">' + esc(s) + "</span>"; };
  var fuelTag = function (f) { var x = FU[f] || { l: f, c: "#9FB2C8" }; return '<span class="fuel" style="--fc:' + x.c + '">' + x.l + "</span>"; };
  var iviPill = function (v) { var l = IVL(v); return '<span class="ivp" style="--ic:' + l[1] + '"><i></i>IVI ' + v + " · " + l[0] + "</span>"; };
  function gaugeSVG(v) {
    var C = Math.PI * 52;
    return '<svg class="gg" viewBox="0 0 120 70"><path class="ba" d="M8 62 A52 52 0 0 1 112 62"/><path class="fa" d="M8 62 A52 52 0 0 1 112 62" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" data-off="' + (C * (1 - v / 100)) + '"/><line class="nd" x1="59" y1="61" x2="59" y2="19" data-rot="' + (-90 + v * 1.8) + '" style="transform:rotate(-90deg)"/><circle cx="59" cy="61" r="4" fill="#E6EEF9"/></svg>';
  }
  function corrRow(x) {
    var F = FU[x.fuel] || { c: "#9FB2C8" }, b = engBrand(x), m = engModels(x)[0];
    return '<button class="corr" style="--fc:' + F.c + '" data-act="openEng" data-id="' + x.id + '"><div style="min-width:0"><b>' + esc((b ? b.n : "") + " " + (m ? m.n : "")) + '</b><small>' + esc(x.label) + " · " + esc(x.code) + " · " + x.y[0] + "→" + x.y[1] + '</small></div><span class="hp">' + x.hp + '<small style="font-size:9px"> ch</small></span></button>';
  }

  /* ── Cartes pannes / TSB / plans ── */
  function faultCard(f, hist, full) {
    var c = (SV[f.sev] || { c: "#FFAF2E" }).c;
    return '<div class="fcard" style="--sc:' + c + ";" + (hist ? "opacity:.62" : "") + '"><div class="fh"><b>' + esc(f.t) + "</b>" + sevTag(f.sev) + '</div><div class="tags"><span class="tag">' + f.y[0] + "→" + f.y[1] + '</span><span class="tag">' + fmt(f.km[0]) + "–" + fmt(f.km[1]) + ' km</span><span class="tag">fréq. ' + esc(f.freq) + "</span>" + (hist ? '<span class="tag">HISTORIQUE</span>' : "") + '<span class="tag" style="color:#25D4EE">' + esc(f.status) + "</span></div>" +
      ((f.sym || []).length ? '<div class="tags">' + f.sym.map(function (s) { return '<span class="tag">' + ic("act", "width:11px;height:11px;color:#FFAF2E") + esc(s) + "</span>"; }).join("") + "</div>" : "") +
      (f.cause ? "<p><b>Cause :</b> " + esc(f.cause) + "</p>" : "") +
      (f.fix ? "<p><b>Action :</b> " + esc(f.fix) + "</p>" : "") +
      '<div class="cost">' + ic("euro", "width:14px;height:14px") + (f.cost[1] === 0 ? "Prise en charge / campagne" : fmt(f.cost[0]) + " – " + fmt(f.cost[1]) + " €") + "</div>" +
      (!full ? '<div class="acts"><button class="btn xs ghost" data-act="openFault" data-id="' + f.id + '">' + ic("chev", "width:12px;height:12px") + "Détail</button></div>" : "") +
      "</div>";
  }
  function tsbCard(t, full) {
    var rc = isRecall(t);
    return '<div class="tsb' + (rc ? " rc" : "") + '"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="ref">' + esc(t.ref) + "</span>" + sevTag(t.sev) + '<span class="tag">' + (rc ? ic("bell", "width:11px;height:11px;color:#FFAF2E") : "") + esc(t.cat) + '</span><span class="tag mono">' + esc(t.date) + '</span></div><b>' + esc(t.t) + '</b><p>' + esc(t.sum) + '</p><div class="act"><b style="font-size:11px;color:' + (rc ? "#FFAF2E" : "#4D8DFF") + '">ACTION :</b> ' + esc(t.act) + "</div>" +
      (!full ? '<div class="acts" style="margin-top:10px"><button class="btn xs ghost" data-act="openTsb" data-id="' + t.id + '">' + ic("chev", "width:12px;height:12px") + "Détail</button></div>" : "") +
      "</div>";
  }
  function planMini(p) {
    if (!p) return '<div class="empty">Aucun plan</div>';
    var ex = p.extra;
    return '<div class="oil"><div class="oc"><span>' + ic("oil", "width:12px;height:12px") + 'HUILE</span><b>' + esc(p.oil ? p.oil[0] : "Sans objet") + "</b><p>" + (p.oil && p.oil[1] ? p.oil[1] + " L · " : "") + esc(p.oil && p.oil[2] ? p.oil[2] : "—") + '</p></div><div class="oc b"><span>' + ic("piston", "width:12px;height:12px") + 'DISTRIBUTION</span><b>' + esc(p.dist ? p.dist[0] : "—") + "</b><p>" + (p.dist && p.dist[1] ? fmt(p.dist[1]) + " km" + (p.dist[2] ? " / " + p.dist[2] + " mois" : "") : "Chaîne / sans objet") + (p.dist && p.dist[3] ? " · " + esc(p.dist[3]) : "") + "</p></div></div>" +
      (ex ? '<div class="sg" style="margin-bottom:12px">' + [["Liquide de freins", ex.f], ["Liquide refroidissement", ex.l], ["Couple roues", ex.w ? ex.w + " Nm" : "—"], ["Pression pneus", ex.p ? ex.p[0] + " / " + ex.p[1] + " bar" : "—"], ["Fluide clim", ex.r], ["Batterie 12V", ex.b]].map(function (s) { return '<div class="sp"><span>' + s[0] + '</span><b class="hl">' + esc(s[1] || "—") + "</b></div>"; }).join("") + "</div>" : "") +
      '<div class="tw" style="border-radius:11px"><table class="mt"><thead><tr><th>Opération</th><th>Échéance</th></tr></thead><tbody>' + p.items.map(function (it) { return "<tr><td>" + esc(it[0]) + '</td><td class="km">' + (it[1] ? fmt(it[1]) + " km" : "") + (it[1] && it[2] ? " / " : "") + (it[2] ? it[2] + " mois" : "") + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      (p.note ? '<p style="font-size:11.5px;color:#FFAF2E;margin-top:9px">' + ic("info", "width:13px;height:13px") + " " + esc(p.note) + "</p>" : "");
  }

  /* ── Animations montées ── */
  function mountAnim(sc) {
    $$("[data-count]", sc).forEach(function (el) {
      var tg = +el.dataset.count || 0, t0 = performance.now();
      var step = function (t) {
        if (!el.isConnected) return;
        var p = Math.min(1, (t - t0) / 700);
        el.textContent = fmt(Math.round(tg * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$(".fa[data-off]", sc).forEach(function (p) { p.style.strokeDashoffset = p.dataset.off; });
        $$(".nd[data-rot]", sc).forEach(function (p) { p.style.transform = "rotate(" + p.dataset.rot + "deg)"; });
        $$(".brow .bt i", sc).forEach(function (i) { i.style.width = i.dataset.w; });
        $$(".coly i", sc).forEach(function (i) { i.style.height = i.dataset.h; });
        $$(".donut circle[data-seg]", sc).forEach(function (c) { c.setAttribute("stroke-dasharray", c.dataset.seg); });
      });
    });
  }

  /* ── Drawer ── */
  function openDrawer(type, id, push) {
    if (S.drawer && push) S.drawer.hist.push({ type: S.drawer.type, id: S.drawer.id, tab: S.drawer.tab });
    else if (!S.drawer) S.drawer = { hist: [] };
    S.drawer.type = type; S.drawer.id = id; S.drawer.tab = (type === "engine" ? "fiche" : "main");
    renderDrawer();
    document.body.classList.add("lock");
    requestAnimationFrame(function () { $("#dr").classList.add("on"); });
    beep("open");
  }
  function closeDrawer() {
    var r = $("#dr"); if (!r.innerHTML) return;
    r.classList.remove("on"); S.drawer = null;
    if (!window.MD_modalOpen()) document.body.classList.remove("lock");
    setTimeout(function () { if (!S.drawer) r.innerHTML = ""; }, 330);
    beep("close");
  }
  function renderDrawer() {
    if (!S.drawer) return;
    var d = S.drawer, head = "", tabs = "", body = "";
    if (d.type === "engine") {
      var e = DB.engines.filter(function (x) { return x.id === d.id; })[0];
      if (!e) { closeDrawer(); return; }
      var b = engBrand(e), ms = engModels(e), F = FU[e.fuel] || { c: "#9FB2C8" };
      var fs = faultsFor(e), ts = tsbFor(e), rc = ts.filter(isRecall), pl = planFor(e), v = ivi(e), L = IVL(v);
      head = '<div class="dh" style="--fc:' + F.c + '"><div class="row">' + (d.hist.length ? '<button class="tb" data-act="drback">' + ic("back") + "</button>" : "") + '<span class="tag mono">' + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel) + '<span class="tag">' + esc(ms.map(function (m) { return m.n; }).join(" · ")) + "</span>" + (rc.length ? '<span class="tag" style="color:#FFAF2E">' + ic("bell", "width:11px;height:11px") + rc.length + " rappel(s)</span>" : "") + '<button class="tb x" data-act="drclose">' + ic("x") + '</button></div><h2>' + esc(e.label) + '</h2><div class="sub mono">' + esc(e.code) + " · " + e.y[0] + "→" + e.y[1] + " · " + e.hp + " ch / " + e.kw + " kW · " + e.nm + " Nm</div></div>";
      tabs = '<div class="dtabs">' + [["fiche", "Fiche", "piston"], ["pannes", "Pannes", "alert", fs.length], ["tsb", "TSB / Rappels", "file", ts.length], ["entretien", "Entretien", "wrench"], ["corr", "Corrélations", "link"]].map(function (t) { return '<button class="dt ' + (d.tab === t[0] ? "on" : "") + '" data-act="drtab" data-t="' + t[0] + '">' + ic(t[2], "width:14px;height:14px") + t[1] + (t[3] !== undefined ? '<span class="n">' + t[3] + "</span>" : "") + "</button>"; }).join("") + "</div>";
      if (d.tab === "fiche") {
        body = '<div class="gw" style="--gc:' + L[1] + '">' + gaugeSVG(v) + '<div class="gt"><b data-count="' + v + '">0</b><span>INDICE DE VIGILANCE</span><p>Niveau <b style="color:' + L[1] + '">' + L[0] + "</b> — " + fs.filter(function (f) { return f.active && f.sev !== "info"; }).length + ' alerte(s).</p></div></div><div class="sg">' +
          [["Code moteur", e.code, 1], ["Famille", e.fam, 1], ["Cylindrée", e.disp ? fmt(e.disp) + " cm³" : "—"], ["Architecture", e.cyl], ["Puissance", e.hp + " ch / " + e.kw + " kW", 1], ["Couple", e.nm + " Nm"], ["Suralimentation", e.asp], ["Injection", e.inj], ["Norme", e.norm], ["Boîte", GBL[e.gb] || e.gb], ["Production", e.y[0] + " → " + e.y[1]], ["Énergie", (FU[e.fuel] || {}).l || e.fuel]].map(function (s) { return '<div class="sp"><span>' + s[0] + '</span><b class="' + (s[2] ? "hl" : "") + '">' + esc(s[1]) + "</b></div>"; }).join("") + "</div>";
      }
      else if (d.tab === "pannes") body = fs.length ? fs.map(function (f) { return faultCard(f, !f.active); }).join("") : '<div class="empty">' + ic("check") + "<p>Aucune panne référencée.</p></div>";
      else if (d.tab === "tsb") body = ts.length ? (rc.length ? '<div class="chip warn" style="margin-bottom:12px">' + ic("bell", "width:12px;height:12px") + rc.length + " campagne(s) de rappel</div>" : "") + ts.map(function (t) { return tsbCard(t); }).join("") : '<div class="empty">' + ic("file") + "<p>Aucun bulletin corrélé.</p></div>";
      else if (d.tab === "entretien") body = planMini(pl);
      else {
        var same = DB.engines.filter(function (x) { return x.fam === e.fam && x.id !== e.id; });
        body = '<div class="card panel"><h3>' + ic("link") + "Famille " + esc(e.fam) + "</h3>" + (same.length ? same.slice(0, 20).map(corrRow).join("") : '<p class="dim">Première motorisation de cette famille.</p>') + "</div>";
      }
    }
    else if (d.type === "fault") {
      var f = DB.faults.filter(function (x) { return x.id === d.id; })[0];
      if (!f) { closeDrawer(); return; }
      var af = enginesForFault(f);
      head = '<div class="dh" style="--fc:' + (SV[f.sev] || { c: "#FFAF2E" }).c + '"><div class="row">' + (d.hist.length ? '<button class="tb" data-act="drback">' + ic("back") + "</button>" : "") + sevTag(f.sev) + '<span class="tag">' + esc(f.status) + '</span><button class="tb x" data-act="drclose">' + ic("x") + '</button></div><h2>' + esc(f.t) + "</h2></div>";
      body = faultCard(f, false, true) + '<div class="card panel" style="margin-top:14px"><h3>' + ic("car") + "Motorisations corrélées (" + af.length + ")</h3>" + (af.slice(0, 20).map(corrRow).join("") || "<p class='dim'>Aucune.</p>") + "</div>";
    }
    else {
      var t = DB.tsb.filter(function (x) { return x.id === d.id; })[0];
      if (!t) { closeDrawer(); return; }
      var at = enginesForTsb(t);
      head = '<div class="dh" style="--fc:' + (isRecall(t) ? "#FFAF2E" : "#4D8DFF") + '"><div class="row">' + (d.hist.length ? '<button class="tb" data-act="drback">' + ic("back") + "</button>" : "") + '<span class="tag mono">' + esc(t.ref) + "</span>" + sevTag(t.sev) + '<button class="tb x" data-act="drclose">' + ic("x") + '</button></div><h2>' + esc(t.t) + "</h2></div>";
      body = tsbCard(t, true) + '<div class="card panel" style="margin-top:14px"><h3>' + ic("car") + "Périmètre corrélé (" + at.length + ")</h3>" + at.slice(0, 20).map(corrRow).join("") + "</div>";
    }
    $("#dr").innerHTML = '<div class="sc" data-act="drclose"></div><aside class="dw">' + head + tabs + '<div class="db">' + body + '</div><div class="dfoot">' + ic("shield", "width:12px;height:12px") + "SYNTHÈSE INGÉNIEUR — CONFIRMER AU VIN</div></aside>";
    mountAnim($("#dr"));
  }

  /* ── Vues ── */
  function computeResults() {
    var f = S.f, q = f.q.trim().toLowerCase();
    var list = DB.engines.filter(function (e) {
      var b = engBrand(e);
      if (f.brand && (!b || b.id !== f.brand)) return false;
      if (f.fuels.length && f.fuels.indexOf(e.fuel) < 0) return false;
      if (f.seg && !engModels(e).some(function (m) { return m.seg === f.seg; })) return false;
      if (!ov(e.y, f.y)) return false;
      if (e.hp < f.p[0] || e.hp > f.p[1]) return false;
      if (q) {
        var hay = [(b || {}).n].concat(engModels(e).map(function (m) { return m.n; })).concat([e.code, e.fam, e.label]).join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var ca = {}, gi = function (e) { return ca[e.id] !== undefined ? ca[e.id] : (ca[e.id] = ivi(e)); };
    var so = {
      brand: function (a, b) { return ((engBrand(a) || {}).n || "").localeCompare((engBrand(b) || {}).n || "") || b.hp - a.hp; },
      model: function (a, b) { return ((engModels(a)[0] || {}).n || "").localeCompare((engModels(b)[0] || {}).n || ""); },
      hpdesc: function (a, b) { return b.hp - a.hp; },
      hpasc: function (a, b) { return a.hp - b.hp; },
      year: function (a, b) { return b.y[0] - a.y[0]; },
      ivi: function (a, b) { return gi(b) - gi(a); }
    };
    return list.sort(so[f.sort] || so.brand);
  }
  function engCard(e, i) {
    var F = FU[e.fuel] || { c: "#9FB2C8" }, b = engBrand(e), ms = engModels(e);
    var v = ivi(e), nf = faultsFor(e).filter(function (f) { return f.sev !== "info"; }).length;
    var ts = tsbFor(e), nr = ts.filter(isRecall).length, pin = GARAGE.indexOf(e.id) > -1;
    return '<article class="card hov eng rv" style="--d:' + Math.min(i, 14) + ";--fc:" + F.c + '" data-act="openEng" data-id="' + e.id + '" tabindex="0" role="button"><div class="top"><span class="br">' + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel) + '<button class="st ' + (pin ? "on" : "") + '" data-act="pin" data-id="' + e.id + '">' + ic("star", "width:15px;height:15px") + '</button></div><h4>' + esc(ms.map(function (m) { return m.n; }).join(" / ")) + '</h4><div class="lbl">' + esc(e.label) + '</div><div class="pw"><b>' + e.hp + '</b><span>ch · ' + e.kw + ' kW</span><span style="margin-left:auto">' + e.nm + ' Nm</span></div><div class="meta"><span class="tag mono">' + esc(e.code) + '</span><span class="tag">' + e.y[0] + "→" + e.y[1] + '</span><span class="tag">' + esc(GBL[e.gb] || e.gb) + "</span>" + (nr ? '<span class="tag" style="color:#FFAF2E">' + ic("bell", "width:10px;height:10px") + nr + "</span>" : "") + '</div><div class="ft"><span>' + ic("alert", "color:" + (nf ? "#FFAF2E" : "#61748C")) + " " + nf + '</span><span>' + ic("file", "color:" + (ts.length ? "#4D8DFF" : "#61748C")) + " " + ts.length + "</span>" + iviPill(v) + "</div></article>";
  }
  function vBord() {
    var c = META.counts;
    var fc = Object.keys(FU).map(function (f) { return { f: f, n: DB.engines.filter(function (e) { return e.fuel === f; }).length }; }).filter(function (x) { return x.n; });
    var tot = fc.reduce(function (s, x) { return s + x.n; }, 0) || 1, R = 54, C = 2 * Math.PI * R, acc = 0;
    var segs = fc.map(function (x) { var l = x.n / tot * C, o = -acc; acc += l; return { f: x.f, n: x.n, len: l, off: o }; });
    var sc = Object.keys(SV).map(function (s) { return { s: s, n: DB.faults.filter(function (f) { return f.sev === s; }).length; }; });
    var sm = Math.max.apply(null, sc.map(function (x) { return x.n; }).concat([1]));
    var fr = {}; DB.engines.forEach(function (e) { var o = fr[e.fam] = fr[e.fam] || { n: 0, s: 0 }; o.n++; o.s += ivi(e); });
    var top = Object.keys(fr).filter(function (f) { return fr[f].n >= 2; }).map(function (f) { return { f: f, v: Math.round(fr[f].s / fr[f].n), n: fr[f].n }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    var al = DB.faults.filter(function (f) { return f.sev === "critique"; }).slice(0, 5);
    var rc = DB.tsb.filter(isRecall).sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);

    return '<div class="hero rv"><span class="kick">MODULE 01 — POSTE DE BORD</span><h2>BASE EXPERT <i>2017 → 2027</i><br>' + fmt(c.b) + " marques · " + fmt(c.m) + " modèles · " + fmt(c.e) + ' motorisations</h2><p>Françaises, européennes, américaines, asiatiques, japonaises et chinoises. ' + fmt(c.f) + " pannes, " + fmt(c.t) + " bulletins dont <b style='color:#FFAF2E'>" + fmt(c.rc) + " campagnes de rappel</b>, " + fmt(c.p) + " plans. Import universel : fusion sans doublon.</p><div class='acts'><a class='btn pri' href='#/explorer'>" + ic("car") + "Explorer</a><button class='btn grn' data-act='runTests'>" + ic("stetho") + "Autovérification</button><button class='btn amb' data-act='goImport'>" + ic("ul") + "Importer</button></div></div>" +
      '<div class="kpis">' + [["db", "MARQUES", c.b, "#25D4EE"], ["car", "MODÈLES", c.m, "#4D8DFF"], ["piston", "MOTORISATIONS", c.e, "#E45CFF"], ["alert", "PANNES", c.f, "#FF4D5E"], ["bell", "RAPPELS", c.rc, "#FFAF2E"], ["wrench", "PLANS", c.p, "#43E08B"]].map(function (k, i) { return '<div class="card kpi rv" style="--d:' + (i + 1) + ";--kc:" + k[3] + '">' + ic(k[0]) + '<b data-count="' + k[2] + '">0</b><span>' + k[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="g2"><div class="card panel rv" style="--d:7"><h3>' + ic("bolt") + 'Énergies<span class="chip">' + fmt(tot) + '</span></h3><div class="dwrap"><svg class="donut" viewBox="0 0 150 150"><g transform="rotate(-90 75 75)">' + segs.map(function (s) { return '<circle cx="75" cy="75" r="' + R + '" stroke="' + FU[s.f].c + '" stroke-dasharray="0 ' + C + '" data-seg="' + s.len + " " + (C - s.len) + '" stroke-dashoffset="' + s.off + '"/>'; }).join("") + '</g><text x="75" y="72" text-anchor="middle" class="c1">' + fmt(tot) + '</text><text x="75" y="88" text-anchor="middle" class="c2">MOTEURS</text></svg><div class="leg">' + segs.map(function (s) { return '<div class="li"><i style="background:' + FU[s.f].c + '"></i>' + FU[s.f].l + "<b>" + s.n + "</b><small>" + Math.round(s.n / tot * 100) + "%</small></div>"; }).join("") + "</div></div></div>" +
      '<div class="card panel rv" style="--d:8"><h3>' + ic("alert") + 'Sévérité des pannes</h3><div class="bars">' + sc.map(function (x) { return '<div class="brow"><span class="bl">' + x.s.toUpperCase() + '</span><div class="bt"><i data-w="' + Math.round(x.n / sm * 100) + '%" style="--bc:' + SV[x.s].c + '"></i></div><b>' + x.n + "</b></div>"; }).join("") + "</div></div></div>" +
      '<div class="g2"><div class="card panel rv" style="--d:9"><h3>' + ic("gauge") + 'Familles sous vigilance<span class="chip">TOP 8</span></h3><div class="bars">' + top.map(function (x) { var col = IVL(x.v)[1]; return '<div class="brow"><span class="bl">' + esc(x.f) + ' <span class="dim">×' + x.n + '</span></span><div class="bt"><i data-w="' + x.v + '%" style="--bc:' + col + '"></i></div><b style="color:' + col + '">' + x.v + "</b></div>"; }).join("") + "</div></div>" +
      '<div class="card panel rv" style="--d:10"><h3>' + ic("bell", "color:#FFAF2E") + 'Campagnes de rappel</h3><div class="feed">' + rc.map(function (t) { return '<button class="fi r" data-act="openTsb" data-id="' + t.id + '"><span class="fx">' + ic("bell", "width:15px;height:15px") + '</span><span style="flex:1;min-width:0"><b>' + esc(t.t) + '</b><small>' + esc(t.ref) + " · " + esc(t.date) + '</small></span>' + ic("chev", "width:14px;height:14px;color:#61748C") + "</button>"; }).join("") + "</div></div></div>" +
      '<div class="card panel rv" style="--d:11"><h3>' + ic("star", "color:#FFAF2E") + 'Garage<span class="chip">' + GARAGE.length + '</span></h3>' +
      (GARAGE.length ? '<div class="garage">' + GARAGE.map(function (id, i) {
        var e = DB.engines.filter(function (x) { return x.id === id; })[0]; if (!e) return "";
        var F = FU[e.fuel] || { c: "#9FB2C8" };
        return '<div class="gcard" data-drag="garage" data-id="' + id + '" data-i="' + i + '"><span class="dh">' + ic("drag") + '</span><span class="fuel" style="--fc:' + F.c + '"></span><span class="gi" data-act="openEng" data-id="' + id + '"><b>' + esc(engName(e)) + '</b><small>' + esc(e.code) + " · " + e.hp + " ch</small></span><button class='btn xs dgr' data-act='pin' data-id='" + id + "'>" + ic("x", "width:12px;height:12px") + "</button></div>";
      }).join("") + "</div>" : '<div class="empty">' + ic("star") + "<p>Épinglez des motorisations.</p></div>") + "</div>";
  }
  function vExplorer() {
    var f = S.f;
    return '<div class="vh rv"><div><span class="kick">MODULE 02 — EXPLORATEUR</span><h1>PARC <i>2017 → 2027</i></h1></div></div>' +
      '<div class="bstrip rv">' + DB.brands.map(function (b) { var n = DB.engines.filter(function (e) { var x = engBrand(e); return x && x.id === b.id; }).length; return '<button class="btile ' + (f.brand === b.id ? "on" : "") + '" data-act="fbrand" data-b="' + b.id + '"><b>' + esc(b.n) + '</b><small>' + n + " mot.</small></button>"; }).join("") + "</div>" +
      '<div class="exwrap"><details class="card filters rv" open><summary>' + ic("filter") + 'FILTRES</summary><div class="fsec"><label class="lb">Recherche</label><input class="inp" type="search" data-f="q" value="' + esc(f.q) + '"></div><div class="fsec"><label class="lb">Énergie</label><div class="chipset">' + Object.keys(FU).map(function (k) { return '<button class="fc ' + (f.fuels.indexOf(k) > -1 ? "on" : "") + '" style="--fc:' + FU[k].c + '" data-act="ffuel" data-k="' + k + '">' + FU[k].l + "</button>"; }).join("") + '</div></div><div class="fsec"><label class="lb">Marque</label><select class="sel" data-f="brand"><option value="">Toutes</option>' + DB.brands.map(function (b) { return '<option value="' + b.id + '" ' + (f.brand === b.id ? "selected" : "") + ">" + esc(b.n) + "</option>"; }).join("") + "</select></div></details>" +
      '<div><div class="bar"><span class="cnt" id="resCount">—</span><select class="sel" data-f="sort" style="margin-left:auto;width:auto">' + [["brand", "Marque A→Z"], ["hpdesc", "Puissance ↓"], ["year", "Année ↓"], ["ivi", "Vigilance ↓"]].map(function (o) { return '<option value="' + o[0] + '" ' + (f.sort === o[0] ? "selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></div><div class="eg" id="resGrid"></div><div class="more" id="resMore"></div></div></div>';
  }
  function refreshResults() {
    var g = $("#resGrid"); if (!g) return;
    var l = computeResults(), s = l.slice(0, S.shown);
    g.innerHTML = s.length ? s.map(engCard).join("") : '<div class="empty" style="grid-column:1/-1">' + ic("search") + "<p>Aucun résultat.</p></div>";
    $("#resCount").textContent = fmt(l.length) + " motorisation(s)";
    $("#resMore").innerHTML = l.length > S.shown ? '<button class="btn ghost" data-act="more">' + ic("dn") + "Plus (" + fmt(l.length - S.shown) + ")</button>" : "";
    mountAnim(g);
  }
  function vTech() {
    var L = S.tech, nr = DB.tsb.filter(isRecall).length;
    return '<div class="vh rv"><div><span class="kick">MODULE 03 — BIBLIOTHÈQUE TECHNIQUE</span><h1>PANNES · TSB · <i>RAPPELS</i></h1></div></div>' +
      '<div class="atabs"><button class="at ' + (L.tab === "faults" ? "on" : "") + '" data-act="techTab" data-t="faults">' + ic("alert", "width:14px;height:14px") + 'PANNES<span class="n">' + DB.faults.length + '</span></button><button class="at ' + (L.tab === "tsb" ? "on" : "") + '" data-act="techTab" data-t="tsb">' + ic("file", "width:14px;height:14px") + "TSB<span class='n'>" + (DB.tsb.length - nr) + '</span></button><button class="at ' + (L.tab === "recalls" ? "on" : "") + '" data-act="techTab" data-t="recalls">' + ic("bell", "width:14px;height:14px") + "RAPPELS<span class='n'>" + nr + "</span></button></div>" +
      '<div class="bar"><input class="inp" style="max-width:300px" type="search" data-tf="q" value="' + esc(L.q) + '" placeholder="Titre, référence…"><span class="cnt" id="techCount" style="margin-left:auto"></span></div><div id="techGrid" class="eg" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))"></div>';
  }
  function refreshTech() {
    var L = S.tech, g = $("#techGrid"); if (!g) return;
    var q = L.q.trim().toLowerCase(), html = "", n = 0;
    if (L.tab === "faults") {
      var l = DB.faults.filter(function (f) {
        if (L.sev && f.sev !== L.sev) return false;
        if (q && (f.t + " " + (f.fam || []).join(" ")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      n = l.length;
      html = l.map(function (f) { return '<div class="rv">' + faultCard(f) + "</div>"; }).join("");
    } else {
      var lt = DB.tsb.filter(function (t) {
        var rc = isRecall(t);
        if (L.tab === "recalls" && !rc) return false;
        if (L.tab === "tsb" && rc) return false;
        if (q && (t.t + " " + t.ref).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      n = lt.length;
      html = lt.map(function (t) { return '<div class="rv">' + tsbCard(t) + "</div>"; }).join("");
    }
    g.innerHTML = html || '<div class="empty" style="grid-column:1/-1">' + ic("search") + "<p>Aucun résultat.</p></div>";
    $("#techCount").textContent = n + " fiche(s)";
    mountAnim(g);
  }
  function planItems(q) {
    q = (q || "").toLowerCase();
    return DB.maint.filter(function (p) { return !q || (p.name + " " + (p.fam || []).join(" ")).toLowerCase().indexOf(q) > -1; })
      .map(function (p) { return '<button class="pitem ' + (p.id === S.plan ? "on" : "") + '" data-act="selPlan" data-id="' + p.id + '"><b>' + esc(p.name) + "</b><small>" + esc((p.fam || []).slice(0, 4).join(" · ") || "—") + "</small></button>"; }).join("") || '<div class="empty">Aucun plan</div>';
  }
  function vEntretien() {
    if (!S.plan || !DB.maint.filter(function (p) { return p.id === S.plan; })[0]) S.plan = (DB.maint[0] || {}).id;
    var p = DB.maint.filter(function (x) { return x.id === S.plan; })[0];
    return '<div class="vh rv"><div><span class="kick">MODULE 04 — ENTRETIEN</span><h1>PLANS <i>& ÉCHÉANCES</i></h1></div></div>' +
      '<div class="mwrap"><div class="card plist rv"><input class="inp" type="search" id="planSearch" placeholder="Filtrer les plans…"><div id="planItems">' + planItems("") + '</div></div><div><div class="card panel rv"><h3>' + ic("wrench") + esc(p ? p.name : "—") + '</h3>' + planMini(p) + '</div><div class="calc rv"><h3>' + ic("cal") + 'CALCULATEUR</h3><div class="fr f3"><div><label class="lb">Kilométrage</label><input class="inp mono" type="number" min="0" max="999999" data-calc="km" value="' + S.calc.km + '"></div><div><label class="lb">Année</label><input class="inp mono" type="number" min="2010" max="' + YMAX + '" data-calc="year" value="' + S.calc.year + '"></div><div><label class="lb">Profil</label><select class="sel" data-calc="sev"><option value="1">Normal</option><option value="0.75">Sévère</option></select></div></div><div class="due" id="dueList"></div></div></div></div>';
  }
  function dueRows(p, km, yr, sev) {
    var now = new Date(), age = Math.max(1, (now.getFullYear() - yr) * 12 + now.getMonth()), rows = [];
    var add = function (op, ikm, imo) {
      ikm = Math.round(ikm * sev);
      if (ikm > 0) {
        var nx = Math.max(ikm, Math.ceil((km + 1) / ikm) * ikm), rm = nx - km, pc = clamp((ikm - rm) / ikm * 100, 0, 100), bd, cl;
        if (rm <= 1500) { bd = "ÉCHÉANCE PROCHE"; cl = "now"; }
        else if (rm <= ikm * .2) { bd = "BIENTÔT"; cl = "soon"; }
        else { bd = "DANS " + fmt(rm) + " KM"; cl = "ok"; }
        rows.push({ op: op, badge: bd, cls: cl, pct: pc, detail: "Prochaine : " + fmt(nx) + " km", u: rm / ikm });
      } else if (imo > 0) {
        var n2 = Math.ceil(age / imo) * imo, d2 = new Date(yr, 0); d2.setMonth(d2.getMonth() + n2);
        var r2 = n2 - age, b2, c2;
        if (r2 <= 1) { b2 = "À FAIRE"; c2 = "now"; }
        else if (r2 <= 3) { b2 = "BIENTÔT"; c2 = "soon"; }
        else { b2 = "DANS " + r2 + " MOIS"; c2 = "ok"; }
        rows.push({ op: op, badge: b2, cls: c2, pct: clamp((imo - r2) / imo * 100, 0, 100), detail: String(d2.getMonth() + 1).padStart(2, "0") + "/" + d2.getFullYear(), u: r2 / imo });
      } else {
        rows.push({ op: op, badge: "SELON CONSTRUCTEUR", cls: "ok", pct: 0, detail: "Contrôle", u: 2 });
      }
    };
    p.items.forEach(function (it) { add(it[0], it[1], it[2]); });
    if (p.dist && p.dist[1]) add("Distribution : " + p.dist[0], p.dist[1], p.dist[2]);
    return rows.sort(function (a, b) { return a.u - b.u; });
  }
  function refreshCalc() {
    var b = $("#dueList"); if (!b) return;
    var p = DB.maint.filter(function (x) { return x.id === S.plan; })[0];
    if (!p) { b.innerHTML = ""; return; }
    b.innerHTML = dueRows(p, clamp(+S.calc.km || 0, 0, 999999), clamp(+S.calc.year || 2021, 2010, YMAX), +S.calc.sev || 1).map(function (r) {
      return '<div class="drow" style="--dc:' + (r.cls === "now" ? "#FF4D5E" : (r.cls === "soon" ? "#FFAF2E" : "#43E08B")) + '"><div class="dr1"><b>' + esc(r.op) + '</b><span class="dbadge ' + r.cls + '">' + r.badge + "</span></div><div class='pb'><i style='width:" + Math.round(r.pct) + "%'></i></div><div class='dim mono' style='font-size:10px;margin-top:5px'>" + esc(r.detail) + "</div></div>";
    }).join("");
  }
  function vStudio() {
    var P = WP.P;
    var sl = function (k, l, mn, mx, st) { return '<div><div class="srow"><span>' + l + '</span><span class="sval" data-pv="' + k + '">' + WP.label(k, P[k]) + "</span></div><input type='range' data-p='" + k + "' min='" + mn + "' max='" + mx + "' step='" + (st || 1) + "' value='" + P[k] + "'></div>"; };
    var tg = function (k, l) { return '<div class="srow"><span>' + l + '</span><label class="sw"><input type="checkbox" data-p="' + k + '" ' + (P[k] ? "checked" : "") + "><i></i></label></div>"; };
    var th = { blueprint: "repeating-linear-gradient(0deg,#0A2233 0 5px,#12405C 5px 6px)", aurora: "linear-gradient(120deg,#25D4EE,#E45CFF,#FFAF2E)", flux: "#0A1424", radar: "#0A2218", oscillo: "repeating-linear-gradient(90deg,#0A1424 0 3px,#43E08B 3px 4px)", gears: "#120A04", carbon: "#0A1018", telemetry: "#0A1424" };
    return '<div class="vh rv"><div><span class="kick">MODULE 05 — STUDIO</span><h1>FONDS <i>ANIMÉS</i></h1></div><div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="stReset">' + ic("reset") + 'Reset</button><button class="btn sm pri" data-act="stPng">' + ic("cam") + "Export PNG</button></div></div>" +
      '<div class="stwrap"><div class="card stage rv"><div class="screen" id="screen"><canvas id="pv"></canvas><div class="fx"><div class="v"></div><div class="g"></div></div><div class="hud" id="hud"></div></div></div>' +
      '<div class="card ctrl rv"><h3>' + ic("spark") + 'RÉGLAGES</h3><div class="csec"><label class="lb">Scène</label><div class="mgrid">' + WP.MODES.map(function (m) { return '<button class="mb ' + (P.mode === m[0] ? "on" : "") + '" data-act="stMode" data-m="' + m[0] + '"><i style="background:' + th[m[0]] + '"></i>' + m[1] + "</button>"; }).join("") + '</div></div><div class="csec"><label class="lb">Palette</label><div class="pgrid">' + Object.keys(WP.TH).map(function (k) { var v = WP.TH[k]; return '<button class="pb ' + (P.theme === k ? "on" : "") + '" data-act="stTheme" data-t="' + k + '" style="background:linear-gradient(135deg,' + v.a + "," + v.b + "," + v.c + ')"></button>'; }).join("") + "</div></div>" +
      '<div class="csec">' + sl("density", "Densité", 0, 100) + sl("count", "Particules", 10, 400, 5) + sl("speed", "Vitesse", 0, 200, 5) + sl("turb", "Turbulence", 0, 100) + "</div>" +
      '<div class="csec">' + tg("grid", "Grille") + tg("grain", "Grain") + tg("scan", "Balayage") + tg("vig", "Vignettage") + tg("run", "Animation") + tg("bg", "Fond global") + "</div></div></div>";
  }
  function vDonnees() {
    if (!isAdm()) {
      return '<div class="card lockc rv" id="lockCard"><div class="sh">' + ic("lock") + '</div><span class="kick" style="justify-content:center">ACCÈS RESTREINT</span><h2>FICHIERS CROISÉS</h2><p>Réservé à la session <b class="mono" style="color:#FFAF2E">NIVEAU 3</b>.</p><form data-form="unlock"><input class="inp" type="password" name="pwd" placeholder="MOT DE PASSE" autocomplete="current-password"><button class="btn amb" type="submit" id="unlockBtn">' + ic("unlock") + 'DÉVERROUILLER</button></form><p class="dim mono" style="font-size:9.5px;margin-top:14px" id="lockMsg">STOCKAGE : ' + (STORE.local ? "localStorage actif" : "mode mémoire") + "</p></div>";
    }
    return '<div class="vh rv"><div><span class="kick">MODULE 06 — ADMINISTRATION ING-3</span><h1>FICHIERS <i>CROISÉS</i></h1></div><div style="display:flex;gap:8px"><span class="chip warn">' + ic("shield", "width:12px;height:12px") + 'ING-3</span><button class="btn sm ghost" data-act="logout">' + ic("lock") + "Verrouiller</button></div></div>" +
      '<div class="fgrid2">' + FILES.map(function (f, i) { var a = DB[f[0]], k = Math.round(JSON.stringify(a).length / 1024); return '<div class="card hov filecard rv" style="--d:' + i + '"><div class="fn">' + ic("file") + f[1] + "</div><div class='ct'>" + fmt(a.length) + ' <small>entrées</small></div><div class="fs">' + k + " Ko · " + f[2] + '</div><div class="fa"><button class="btn xs ghost" data-act="fileExp" data-k="' + f[0] + '">' + ic("dl", "width:12px;height:12px") + "JSON</button><button class='btn xs amb' data-act='goImport'>" + ic("ul", "width:12px;height:12px") + "Importer</button></div></div>"; }).join("") + "</div>" +
      '<div class="tools"><button class="btn pri sm" data-act="goImport">' + ic("ul") + "Import universel</button><button class='btn ghost sm' data-act='expAll'>" + ic("dl") + "Exporter tout</button><button class='btn ghost sm' data-act='integrity'>" + ic("check") + "Intégrité</button><button class='btn dgr sm' data-act='askReset'>" + ic("reset") + "Base usine</button></div>";
  }
  function runTests() {
    var T = [], add = function (n, ok, i, s) { T.push({ n: n, ok: !!ok, info: i || "", soft: !!s }); };
    add("Base usine", !!DB && DB.engines.length > 0, DB ? DB.engines.length + " moteurs" : "ABSENTE");
    add("Marques", DB.brands.length > 0, DB.brands.length + " marques");
    add("Modèles", DB.models.length > 0, DB.models.length + " modèles");
    add("Pannes", DB.faults.length > 0, DB.faults.length + " fiches");
    add("TSB / Rappels", DB.tsb.length > 0, DB.tsb.length + " bulletins");
    add("Plans entretien", DB.maint.length > 0, DB.maint.length + " plans");
    var orph = 0; DB.engines.forEach(function (e) { e.m.forEach(function (i) { if (!modelById(i)) orph++; }); });
    add("Références moteur → modèle", orph === 0, orph + " orphelin(s)");
    var dm = ["#view", "#rail", "#top", "#dr", "#md", "#ts", "#bgc"].filter(function (s) { return !$(s); });
    add("Éléments DOM critiques", dm.length === 0, dm.length ? dm.join(", ") : "7/7 présents");
    var cv = document.createElement("canvas"), cx = safe("tctx", function () { return cv.getContext("2d"); }, null);
    add("Contexte canvas 2D", !!cx, cx ? "OK" : "indisponible", true);
    add("requestAnimationFrame", typeof requestAnimationFrame === "function", "OK");
    add("Stockage", STORE.local, STORE.local ? "localStorage" : "mémoire", true);
    add("Session", STORE.session, STORE.session ? "sessionStorage" : "mémoire", true);
    var vb = [], vw = [["bord", vBord], ["explorer", vExplorer], ["tech", vTech], ["entretien", vEntretien], ["studio", vStudio], ["donnees", vDonnees]];
    vw.forEach(function (v) { try { var h = v[1](); if (typeof h !== "string" || h.length < 1) vb.push(v[0]); } catch (e) { vb.push(v[0] + " (" + e.message + ")"); } });
    add("Rendu des vues", vb.length === 0, vb.length ? vb.join(", ") : "OK");
    add("Intégrité référentielle", META.integ.ok, META.integ.err.length + " erreurs");
    add("Exceptions capturées", ERRORS.length === 0, ERRORS.length ? ERRORS.slice(-3).map(function (e) { return e.m; }).join(" | ") : "aucune", true);
    TESTS = T; updateMeta(); return T;
  }
  function autoFix() {
    var did = [];
    if (!META.integ.ok || !DB.engines.length) { DB = clone(SEED); did.push("base réinjectée"); }
    if (WP.fails > 0) { WP.P.mode = "blueprint"; WP.fails = 0; WP.apply(); did.push("graphique réinitialisé"); }
    ERRORS.length = 0; did.push("journal purgé");
    STORE.del(KEY); did.push("stockage purgé");
    recompute(); save(); runTests(); updateMeta(); render();
    toast(did.length ? "ok" : "info", "Auto-réparation", did.join(" · ")); beep("ok");
  }
  function vDiag() {
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    var col = fl ? "#FF4D5E" : "#43E08B";
    return '<div class="vh rv"><div><span class="kick">MODULE 07 — AUTOVÉRIFICATION</span><h1>DIAGNOSTIC <i>SYSTÈME</i></h1></div><div style="display:flex;gap:8px"><button class="btn sm grn" data-act="runTests">' + ic("reset") + "Relancer</button><button class='btn sm amb' data-act='autoFix'>" + ic("tool") + "Auto-réparation</button></div></div>" +
      '<div class="card panel rv" style="margin-bottom:14px;border-left:3px solid ' + col + '"><h3>' + ic("stetho", "color:" + col) + "Résultat<span class='chip' style='color:" + col + ";border-color:" + col + "'>" + (TESTS.length - fl) + "/" + TESTS.length + ' OK</span></h3><p class="muted">' + (fl ? "<b style='color:#FF4D5E'>" + fl + " test(s) bloquant(s).</b>" : "<b style='color:#43E08B'>Système opérationnel.</b>") + "</p></div>" +
      '<div class="card panel rv"><h3>' + ic("check") + "Détail</h3><div class='tests'>" + TESTS.map(function (t) { var c = t.ok ? "#43E08B" : (t.soft ? "#FFAF2E" : "#FF4D5E"); return '<div class="tst" style="--tc:' + c + '"><span class="ti">' + (t.ok ? "✓" : (t.soft ? "!" : "×")) + '</span><div style="flex:1"><b>' + esc(t.n) + '</b><small>' + esc(t.info) + "</small></div></div>"; }).join("") + "</div></div>";
  }

  function render() {
    var v = S.view, m = $("#view");
    if (v !== "studio") WP.detach();
    $$(".nv,#tabs a").forEach(function (a) { a.classList.toggle("on", a.dataset.v === v); });
    var h = "";
    try {
      h = v === "bord" ? vBord() :
          v === "explorer" ? vExplorer() :
          v === "tech" ? vTech() :
          v === "entretien" ? vEntretien() :
          v === "studio" ? vStudio() :
          v === "diagnostic" ? vDiag() :
          vDonnees();
    } catch (e) {
      logErr("render " + v, e);
      h = '<div class="card panel"><h3>' + ic("alert") + "Erreur de rendu</h3><p class='muted'>" + esc(e.message) + "</p></div>";
    }
    m.innerHTML = h;
    mountAnim(m);
    updateMeta();
    if (v === "explorer") refreshResults();
    if (v === "tech") refreshTech();
    if (v === "entretien") refreshCalc();
    if (v === "studio") {
      var cv = $("#pv");
      if (cv) { WP.attach(cv); WP.fx(); WP.sync(); }
    }
  }

  function updateMeta() {
    var c = META.counts;
    $("#nEng").textContent = fmt(c.e);
    $("#nTech").textContent = fmt(c.f + c.t);
    $("#nPlan").textContent = fmt(c.p);
    $("#stLinks").textContent = fmt(META.links);
    $("#stCorr").textContent = fmt(META.corr);
    $("#stInt").textContent = META.integ.pct + "%";
    $("#stSize").textContent = META.size + " Ko";
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    $("#stTest").textContent = TESTS.length ? ((TESTS.length - fl) + "/" + TESTS.length) : "—";
    $("#nTest").textContent = TESTS.length ? (fl ? "!" : "✓") : "—";
    $("#diagb").classList.toggle("on", TESTS.length > 0 && !fl);
    $("#ichip").className = "chip " + (META.integ.ok ? (META.integ.warn.length ? "warn" : "ok") : "bad");
    $("#itxt").textContent = META.integ.ok ? (META.integ.warn.length ? "INTÈGRE · " + META.integ.warn.length + " AVERT." : "INTÈGRE") : "ERREURS " + META.integ.err.length;
    var a = isAdm();
    $("#admb").classList.toggle("on", a);
    $("#admb").innerHTML = ic(a ? "unlock" : "lock");
    $("#rtxt").textContent = a ? "Session ING-3 active." : "Session invité.";
    $("#sndb").innerHTML = ic(PREF.sound ? "snd" : "mute");
    $("#sndb").classList.toggle("on", PREF.sound);
    updStor();
  }

  /* ── Import universel (version simplifiée et robuste) ── */
  function openImport() {
    if (!isAdm()) { toast("warn", "Niveau 3 requis"); return; }
    openModal('<div class="mh">' + ic("ul") + '<h3>Import universel</h3><button class="tb" data-act="mclose">' + ic("x") + '</button></div><div class="mb2"><div class="dz" id="dz" data-act="dzPick">' + ic("ul") + '<div><b>Déposer un .json / .csv</b> ou cliquer</div><div class="dim mono" style="font-size:10px;margin-top:4px">Fusion sans doublon · Auto-création marques/modèles</div></div><input type="file" id="impFile" accept=".json,.csv,.txt" style="display:none"><div style="margin-top:12px"><label class="lb">…ou coller JSON</label><textarea class="inp mono" id="impText" rows="6"></textarea></div><div id="impReport"></div></div><div class="mf"><button class="btn ghost" data-act="mclose">Fermer</button><button class="btn ghost" data-act="impAnalyze">' + ic("check") + 'Analyser</button><button class="btn pri" id="impApply" data-act="impApply" disabled>' + ic("ul") + "Fusionner</button></div>", "wide");
  }

  /* ── Événements globaux ── */
  function bindEvents() {
    document.addEventListener("click", function (ev) {
      var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
      if (!el) return;
      var act = el.dataset.act, id = el.dataset.id;
      switch (act) {
        case "snd": PREF.sound = !PREF.sound; save(); updateMeta(); if (PREF.sound) beep("ok"); break;
        case "run": WP.set("run", !WP.P.run); beep("tick"); break;
        case "goStudio": location.hash = "#/studio"; break;
        case "goAdm": location.hash = "#/donnees"; break;
        case "goDiag": location.hash = "#/diagnostic"; break;
        case "runTests": runTests(); location.hash = "#/diagnostic"; render(); break;
        case "autoFix": autoFix(); break;
        case "integrity": openModal('<div class="mh">' + ic("check") + '<h3>Intégrité</h3><button class="tb" data-act="mclose">' + ic("x") + '</button></div><div class="mb2"><div class="rep"><b class="' + (META.integ.ok ? "ok" : "rj") + '">' + (META.integ.ok ? "BASE INTÈGRE" : "ERREURS") + '</b> — score ' + META.integ.pct + "%</div></div>", "slim"); break;
        case "undo": doUndo(); break;
        case "mclose": closeModal(); break;
        case "mscrim": if (ev.target === el) closeModal(); break;
        case "drclose": closeDrawer(); break;
        case "drback": var hb = S.drawer.hist.pop(); if (hb) { S.drawer.type = hb.type; S.drawer.id = hb.id; S.drawer.tab = hb.tab; renderDrawer(); } break;
        case "drtab": S.drawer.tab = el.dataset.t; renderDrawer(); break;
        case "openEng": openDrawer("engine", id, !!S.drawer); break;
        case "openFault": openDrawer("fault", id, !!S.drawer); break;
        case "openTsb": openDrawer("tsb", id, !!S.drawer); break;
        case "pin":
          var gi = GARAGE.indexOf(id);
          if (gi > -1) { GARAGE.splice(gi, 1); toast("info", "Retiré"); }
          else { GARAGE.push(id); toast("ok", "Épinglé"); beep("ok"); }
          save(); render(); break;
        case "fbrand": S.f.brand = (S.f.brand === el.dataset.b ? "" : el.dataset.b); S.shown = 48; render(); beep("tick"); break;
        case "ffuel":
          var fk = el.dataset.k, fi = S.f.fuels.indexOf(fk);
          if (fi > -1) S.f.fuels.splice(fi, 1); else S.f.fuels.push(fk);
          S.shown = 48; el.classList.toggle("on"); refreshResults(); beep("tick"); break;
        case "resetFilters": S.f = { q: "", brand: "", fuels: [], seg: "", y: [2017, YMAX], p: [0, 2100], sort: "brand" }; S.shown = 48; render(); break;
        case "more": S.shown += 48; refreshResults(); break;
        case "techTab": S.tech.tab = el.dataset.t; render(); break;
        case "selPlan": S.plan = id; render(); break;
        case "expAll": download("mecadata_base.json", JSON.stringify(DB, null, 2)); toast("ok", "Base exportée"); beep("ok"); break;
        case "goImport": openImport(); break;
        case "dzPick": $("#impFile").click(); break;
        case "impAnalyze":
          var text = $("#impText").value.trim();
          if (!text) { $("#impReport").innerHTML = '<div class="rep rj">Aucune donnée.</div>'; return; }
          try {
            var data = JSON.parse(text);
            var keys = Object.keys(data);
            $("#impReport").innerHTML = '<div class="rep"><b class="ok">JSON valide</b> — clés : ' + keys.join(", ") + '</div>';
            $("#impApply").disabled = false;
            beep("ok");
          } catch (e) {
            $("#impReport").innerHTML = '<div class="rep rj">JSON invalide : ' + esc(e.message) + '</div>';
            beep("err");
          }
          break;
        case "impApply": toast("info", "Fusion", "Fonction d'import avancée — collez vos données via le CRUD dans Données."); closeModal(); break;
        case "askReset": confirmModal("Réinitialiser ?", "Base remplacée par usine. Annulation 8 s.", "doReset", "Réinitialiser"); break;
        case "doReset": closeModal(); snapshot("reset"); DB = clone(SEED); GARAGE = []; mutate("del", "Base usine"); toast("warn", "Base restaurée"); break;
        case "logout": STORE.sdel("md_adm"); updateMeta(); render(); toast("info", "Session verrouillée"); break;
      }
    });

    document.addEventListener("input", deb(function (ev) {
      var t = ev.target;
      if (t.id === "omni") return; /* omni simplifié */
      if (t.dataset.f) {
        var k = t.dataset.f, f = S.f;
        if (k === "q") f.q = t.value;
        else if (k === "y0") { f.y[0] = Math.min(+t.value, f.y[1]); t.value = f.y[0]; }
        else if (k === "y1") { f.y[1] = Math.max(+t.value, f.y[0]); t.value = f.y[1]; }
        else if (k === "p0") { f.p[0] = Math.min(+t.value, f.p[1]); t.value = f.p[0]; }
        else if (k === "p1") { f.p[1] = Math.max(+t.value, f.p[0]); t.value = f.p[1]; }
        else if (k === "seg") f.seg = t.value;
        else if (k === "sort") f.sort = t.value;
        S.shown = 48; refreshResults();
      }
      if (t.dataset.tf) { S.tech[t.dataset.tf] = t.value; refreshTech(); }
      if (t.dataset.calc) { S.calc[t.dataset.calc] = +t.value || 0; refreshCalc(); }
    }, 120));

    document.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.dataset.calc === "sev") { S.calc.sev = +t.value; refreshCalc(); }
      if (t.dataset.p) {
        var pk = t.dataset.p;
        WP.set(pk, t.type === "checkbox" ? t.checked : (t.tagName === "SELECT" ? t.value : +t.value));
      }
      if (t.id === "impFile" && t.files && t.files[0]) {
        var fl = t.files[0];
        var rd = new FileReader();
        rd.onload = function () { $("#impText").value = rd.result; toast("info", "Fichier chargé", fl.name); };
        rd.readAsText(fl);
      }
    });

    document.addEventListener("submit", function (ev) {
      var form = ev.target.closest ? ev.target.closest("[data-form]") : null;
      if (!form) return;
      ev.preventDefault();
      if (form.dataset.form === "unlock") {
        var fd = new FormData(form);
        if (fd.get("pwd") === PWD) {
          STORE.sset("md_adm", "1");
          audit("adm", "Session ING-3 déverrouillée");
          updateMeta(); render();
          toast("ok", "Niveau 3 activé");
          beep("imp");
        } else {
          var c = $("#lockCard");
          if (c) { c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); }
          toast("err", "Mot de passe incorrect");
          beep("err");
        }
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        if (window.MD_modalOpen()) closeModal();
        else if (S.drawer) closeDrawer();
      }
    });
  }

  /* ── Routage ── */
  function route() {
    var h = (location.hash || "#/bord").replace("#/", "");
    S.view = ["bord", "explorer", "tech", "entretien", "studio", "donnees", "diagnostic"].indexOf(h) > -1 ? h : "bord";
    render();
  }
  window.addEventListener("hashchange", function () { route(); beep("tick"); });
  setInterval(function () { var c = $("#clk"); if (c) c.textContent = new Date().toLocaleTimeString("fr-FR"); }, 1000);

  /* ── Boot ── */
  function boot() {
    var o = $("#boot");
    var done = function () { if (!o) return; o.className = "off"; o.style.display = "none"; STORE.sset("md_boot", "1"); };
    if (STORE.sget("md_boot")) { $("#bbar").style.width = "100%"; setTimeout(done, 200); return; }
    var L = [["Noyau MECADATA v7.1 — initialisation", 10], ["Chargement matrice catalogue…", 30],
             [DB.brands.length + " marques · " + DB.models.length + " modèles", 55],
             [DB.engines.length + " motorisations construites", 75],
             [DB.faults.length + " pannes · " + DB.tsb.length + " TSB · " + DB.maint.length + " plans", 90],
             ["Prêt", 100]];
    var lg = $("#bl"), i = 0;
    var step = function () {
      if (!o || !o.parentNode) return;
      if (i >= L.length) { setTimeout(done, 300); return; }
      var x = L[i++], d = document.createElement("div");
      d.innerHTML = "<b>▸</b> " + esc(x[0]);
      lg.appendChild(d);
      while (lg.children.length > 5) lg.removeChild(lg.firstChild);
      $("#bbar").style.width = x[1] + "%";
      setTimeout(step, 120);
    };
    setTimeout(step, 150);
    setTimeout(done, 3500);
  }

  /* ── Init ── */
  function init() {
    if (!window.MD_RAW) {
      logErr("init", new Error("MD_RAW absent — fichier 02-data.js non chargé"));
      window.__MD_READY = false;
      return;
    }
    SEED = buildCatalog(window.MD_RAW);
    DB = clone(SEED);

    var raw = STORE.get(KEY);
    if (raw) {
      safe("load", function () {
        var d = JSON.parse(raw);
        if (d && d.db && d.db.engines && d.db.engines.length && d.v === 71) {
          DB = d.db; AUDIT = d.audit || []; GARAGE = d.garage || []; VIEWS = d.views || [];
          if (d.prefs) { Object.keys(d.prefs).forEach(function (k) { PREF[k] = d.prefs[k]; }); }
          if (d.wp) { Object.keys(d.wp).forEach(function (k) { WP.P[k] = d.wp[k]; }); }
        } else { STORE.del(KEY); }
      }, null);
    }

    recompute();
    WP.init();
    runTests();
    bindEvents();
    route();
    updateMeta();
    boot();

    if (!STORE.get(KEY)) { audit("adm", "Base usine initialisée (" + DB.engines.length + " moteurs)"); save(); }

    window.__MD_READY = true;
    window.__MD_SCRIPTS.app = true;

    var jf = $("#jsfail");
    if (jf && jf.parentNode) jf.parentNode.removeChild(jf);

    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    setTimeout(function () {
      if (fl) toast("err", fl + " test(s) en échec", "Module Diagnostic → Auto-réparation.");
      else toast("ok", "Système vérifié", TESTS.length + " contrôles OK.");
    }, 3500);
  }

  try { init(); }
  catch (e) {
    logErr("init", e);
    if (window.__MD_LIFT) window.__MD_LIFT();
    var v = $("#view");
    if (v) v.innerHTML = '<div class="card panel"><h3 style="color:#FF4D5E">Erreur d\'initialisation</h3><p class="muted">' + esc(e.message) + '</p><button class="btn pri" onclick="location.reload()">Recharger</button></div>';
    window.__MD_READY = false;
  }
})();
