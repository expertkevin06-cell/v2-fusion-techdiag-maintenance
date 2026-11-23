/* ══════════════════════════════════════════════════════════════════════════
   APP v7.3 — catalogue, omnibox prédictive, studio, import multi-formats,
   autosave, UI, événements. Balisage "..." + attributs HTML '...'.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var $ = window.MD_$, $$ = window.MD_$$, esc = window.MD_esc, fmt = window.MD_fmt;
  var clamp = window.MD_clamp, uid = window.MD_uid, clone = window.MD_clone;
  var ov = window.MD_ov, ic = window.MD_ic, deb = window.MD_deb;
  var split = window.MD_split, nk = window.MD_nk, slug = window.MD_slug;
  var logErr = window.MD_logErr, safe = window.MD_safe;
  var STORE = window.MD_STORE, download = window.MD_download;
  var beep = window.MD_beep, toast = window.MD_toast;
  var openModal = window.MD_openModal, closeModal = window.MD_closeModal, confirmModal = window.MD_confirmModal;
  var modalOpenFn = window.MD_modalOpen;
  var WP = window.MD_WP, PREF = window.MD_PREF, ERRORS = window.MD_ERRORS;

  var PWD = "Kevin83600", KEY = "mecadata_v73", YMAX = 2027;
  var SEGS = ["Citadine", "Micro-citadine", "Compacte", "SUV urbain", "SUV compact", "Berline", "Break", "Ludospace", "Utilitaire", "Coupé", "Roadster", "Sportive", "Monospace", "Pick-up"];
  var FU = {
    e: { l: "Essence", c: "#FFAF2E" }, d: { l: "Diesel", c: "#4D8DFF" },
    h: { l: "Hybride", c: "#43E08B" }, p: { l: "Hybride rechargeable", c: "#19B8A6" },
    b: { l: "Électrique", c: "#E45CFF" }, g: { l: "GPL / ECO-G", c: "#A8E63C" }
  };
  var SV = {
    critique: { w: 32, c: "#FF4D5E" }, majeure: { w: 18, c: "#FF7A3D" },
    "modérée": { w: 9, c: "#FFAF2E" }, mineure: { w: 4, c: "#4D8DFF" }, info: { w: 0, c: "#25D4EE" }
  };
  var FQ = { "élevée": 1.25, moyenne: 1, faible: 0.7 };
  var GBL = {
    BVM: "BVM", BVM5: "BVM5", BVM6: "BVM6", BVA: "BVA",
    EAT6: "EAT6 Aisin", EAT8: "EAT8 Aisin", EDC6: "EDC6 Getrag", EDC7: "EDC7 Getrag",
    DQ200: "DSG7 DQ200 sec", DQ250: "DSG6 DQ250", DQ381: "DSG7 DQ381", DQ400: "DSG6 DQ400e", DQ500: "DSG7 DQ500",
    eCVT: "e-CVT planétaire", RED: "Réducteur", CVT: "CVT",
    DCT6: "DCT6 e-DCS6", DCT7: "DCT7", DCT8: "DCT8 humide", DCT9: "DCT9 AMG",
    ZF8: "ZF8", G9: "9G-Tronic", GTR7: "7G-DCT", PDK: "PDK",
    MMT: "Multimode", XTR: "Xtronic", AGS: "AGS", DHT: "DHT dédié", DPS6: "Powershift DPS6"
  };
  var FILES = [
    ["brands", "brands.json", "Marques"], ["models", "models.json", "Modèles"],
    ["engines", "engines.json", "Motorisations"], ["faults", "faults.json", "Pannes"],
    ["tsb", "tsb.json", "TSB / Rappels"], ["maint", "maintenance.json", "Plans"]
  ];
  var IVL = function (v) {
    if (v >= 75) return ["CRITIQUE", "#FF4D5E"];
    if (v >= 50) return ["ÉLEVÉ", "#FF7A3D"];
    if (v >= 25) return ["MODÉRÉ", "#FFAF2E"];
    return ["FAIBLE", "#43E08B"];
  };
  var GBF = function (t) {
    if (/DQ200/.test(t)) return ["DQ200"];
    if (/DSG/.test(t)) return ["DQ250", "DQ381", "DQ500"];
    if (/EDC6/.test(t)) return ["EDC6"];
    if (/EAT8/.test(t)) return ["EAT8"];
    if (/DPS6/.test(t)) return ["DPS6"];
    if (/ZF8/.test(t)) return ["ZF8"];
    if (/DCT8/.test(t)) return ["DCT8"];
    return [];
  };
  var ATMO = /V10|V12|W12|W16|Flat-6|Boxer|Skyactiv-G|VVT|Pentastar|Nettuno/;

  var SEED = null, DB = null, AUDIT = [], GARAGE = [], VIEWS = [], UNDO = null, TESTS = [];
  var IVIC = {}, MIDX = {}, BIDX = {}, IMPORT = null, LASTSAVE = 0, DIRTY = false;
  var META = { counts: {}, links: 0, corr: 0, integ: { err: [], warn: [], ok: true, pct: 100 }, size: 0, byBrand: {}, byFuel: {} };
  var S = {
    view: "bord",
    f: { q: "", brand: "", fuels: [], seg: "", y: [2017, YMAX], p: [0, 2100], sort: "brand" },
    shown: 48,
    tech: { tab: "faults", q: "", sev: "" },
    plan: null, planCtx: null,
    calc: { km: 60000, year: 2021, sev: 1 },
    drawer: null,
    omni: { q: "", hits: [], idx: -1 }
  };
  window.MD_STATE = S;
  var isAdm = function () { return STORE.sget("md_adm") === "1"; };

  function saveNow() {
    safe("save", function () {
      var payload = { v: 73, db: DB, audit: AUDIT.slice(-60), garage: GARAGE, views: VIEWS, prefs: PREF, wp: WP.P, ts: Date.now() };
      STORE.set(KEY, JSON.stringify(payload));
      LASTSAVE = Date.now();
      DIRTY = false;
      updStor();
    }, null);
  }
  var save = deb(saveNow, 350);
  window.MD_saveState = save;
  function markDirty() { DIRTY = true; save(); }

  function audit(t, m) { AUDIT.push({ ts: Date.now(), type: t, msg: m }); if (AUDIT.length > 120) AUDIT = AUDIT.slice(-120); }
  function snapshot(l) { UNDO = { label: l, db: clone(DB), garage: GARAGE.slice() }; }
  function doUndo() {
    if (!UNDO) return;
    DB = UNDO.db; GARAGE = UNDO.garage;
    var l = UNDO.label; UNDO = null;
    mutate("imp", "Annulation : " + l);
    toast("ok", "Action annulée", "Base restaurée.");
  }

  function mkEngine(n, mid, code, fam, label, fuel, disp, hp, nm, y0, y1, gb) {
    var cyl = "L4";
    if (fuel === "b") cyl = "ÉLEC";
    else if (disp >= 6000) cyl = "W12+";
    else if (disp > 3400) cyl = "V8+";
    else if (disp > 2400) cyl = "6 cyl.";
    else if (disp < 1100) cyl = "L3";
    var asp = "Turbo";
    if (fuel === "b") asp = "—";
    else if (ATMO.test(label)) asp = "Atmo";
    var inj = "Injection directe";
    if (fuel === "b") inj = "—";
    else if (fuel === "d") inj = "Common Rail";
    var norm = "Euro 6";
    if (fuel === "b") norm = "ZE";
    else if (y0 >= 2024) norm = "Euro 6e";
    else if (y0 >= 2020) norm = "Euro 6d";
    return {
      id: "E" + String(n).padStart(4, "0"), m: [mid], code: code, fam: fam, label: label,
      fuel: fuel, disp: disp, hp: hp, nm: nm, kw: Math.round(hp * 0.7355),
      y: [y0, y1], gb: gb, norm: norm, cyl: cyl, asp: asp, inj: inj, note: ""
    };
  }

  function buildCatalog(R) {
    var D = { brands: [], models: [], engines: [], faults: [], tsb: [], maint: [] };
    var i, j;
    for (i = 0; i < R.br.length; i++) D.brands.push({ id: R.br[i][0], n: R.br[i][1], pays: R.br[i][2], grp: R.br[i][3] });
    var byBrand = {};
    var bids = Object.keys(R.md);
    for (i = 0; i < bids.length; i++) {
      var bid = bids[i];
      byBrand[bid] = [];
      for (j = 0; j < R.md[bid].length; j++) {
        var m = R.md[bid][j];
        var rec = { id: bid + "-" + slug(m[0]), b: bid, n: m[0], y: [m[1], m[2]], seg: SEGS[m[3]] || "Compacte" };
        D.models.push(rec); byBrand[bid].push(rec);
      }
    }
    var seen = {}, n = 0;
    for (i = 0; i < R.fa.length; i++) {
      var f = R.fa[i];
      var code = f[0], fuel = f[1], disp = f[2], name = f[3], vars = f[4], gb = f[5], fy0 = f[6], fy1 = f[7], brs = f[8], segs = f[9];
      for (var b1 = 0; b1 < brs.length; b1++) {
        var list = byBrand[brs[b1]] || [];
        for (var m1 = 0; m1 < list.length; m1++) {
          var mod = list[m1];
          if (segs.indexOf(SEGS.indexOf(mod.seg)) < 0) continue;
          var y0 = Math.max(fy0, mod.y[0]), y1 = Math.min(fy1, mod.y[1]);
          if (y0 > y1) continue;
          for (var v1 = 0; v1 < vars.length; v1++) {
            var hp = vars[v1][0], nm = vars[v1][1];
            var key = mod.id + "|" + code + "|" + hp + "|" + gb;
            if (seen[key]) continue;
            seen[key] = 1; n++;
            D.engines.push(mkEngine(n, mod.id, code, code, name + " " + hp, fuel, disp, hp, nm, y0, y1, gb));
          }
        }
      }
    }
    var covered = {};
    for (i = 0; i < D.engines.length; i++) covered[D.engines[i].m[0]] = 1;
    for (i = 0; i < D.models.length; i++) {
      var mo = D.models[i];
      if (covered[mo.id]) continue;
      var fam = null;
      for (var k1 = 0; k1 < R.fa.length; k1++) if (R.fa[k1][8].indexOf(mo.b) > -1) { fam = R.fa[k1]; break; }
      if (!fam) continue;
      var vv = fam[4][0];
      var a0 = Math.max(fam[6], mo.y[0]), a1 = Math.min(fam[7], mo.y[1]);
      if (a0 > a1) { a0 = mo.y[0]; a1 = mo.y[1]; }
      n++;
      D.engines.push(mkEngine(n, mo.id, fam[0], fam[0], fam[3] + " " + vv[0], fam[1], fam[2], vv[0], vv[1], a0, a1, fam[5]));
    }
    for (i = 0; i < R.ft.length; i++) {
      var ft = R.ft[i];
      D.faults.push({
        id: "F" + String(i + 1).padStart(3, "0"), t: ft[0], fam: split(ft[1]), sev: ft[2], freq: ft[3],
        y: [ft[4], ft[5]], km: [ft[6], ft[7]], sym: split(ft[8]), cause: ft[9], fix: ft[10],
        cost: [ft[11], ft[12]], status: ft[13], fuel: ft[14] || "", m: [], gb: GBF(ft[0]), e: []
      });
    }
    for (i = 0; i < R.ts.length; i++) {
      var ts = R.ts[i];
      D.tsb.push({
        id: "T" + String(i + 1).padStart(3, "0"), ref: ts[0], b: split(ts[1]), fam: split(ts[2]),
        t: ts[3], date: ts[4], cat: ts[5], sev: ts[6], sum: ts[7], act: ts[8], m: [], gb: GBF(ts[3])
      });
    }
    for (i = 0; i < R.mt.length; i++) {
      var mt = R.mt[i];
      D.maint.push({
        id: mt[0], name: mt[1], fam: split(mt[2]), oil: mt[3] || null, dist: mt[4] || null,
        items: mt[5] || [], note: mt[6] || "", fuel: mt[7] || "", extra: mt[8] || null, base: [15000, 12]
      });
    }
    return D;
  }

  function reindex() {
    MIDX = {}; BIDX = {};
    var i;
    for (i = 0; i < DB.models.length; i++) MIDX[DB.models[i].id] = DB.models[i];
    for (i = 0; i < DB.brands.length; i++) BIDX[DB.brands[i].id] = DB.brands[i];
  }
  function modelById(i) { return MIDX[i]; }
  function brandById(i) { return BIDX[i]; }
  function engModels(e) {
    var out = [];
    for (var i = 0; i < e.m.length; i++) { var m = MIDX[e.m[i]]; if (m) out.push(m); }
    return out;
  }
  function engBrand(e) { var ms = engModels(e); return ms.length ? BIDX[ms[0].b] || null : null; }
  function engName(e) {
    var ms = engModels(e), b = engBrand(e);
    return (((b ? b.n : "") + " " + (ms.length ? ms[0].n : "")) + " — " + e.label).trim();
  }
  function fMatch(f, e) {
    if ((f.fam || []).indexOf(e.fam) > -1) return true;
    if ((f.e || []).indexOf(e.id) > -1) return true;
    if ((f.gb || []).indexOf(e.gb) > -1) return true;
    if (f.fuel && f.fuel === e.fuel) return true;
    for (var i = 0; i < (f.m || []).length; i++) if (e.m.indexOf(f.m[i]) > -1) return true;
    return false;
  }
  function faultsFor(e) {
    var out = [];
    for (var i = 0; i < DB.faults.length; i++) {
      var f = DB.faults[i];
      if (!fMatch(f, e)) continue;
      var g = clone(f); g.active = ov(f.y, e.y); out.push(g);
    }
    out.sort(function (a, b) {
      var d = (b.active ? 1 : 0) - (a.active ? 1 : 0);
      if (d !== 0) return d;
      return ((SV[b.sev] || { w: 0 }).w) - ((SV[a.sev] || { w: 0 }).w);
    });
    return out;
  }
  function tsbFor(e) {
    var ms = engModels(e), bs = [];
    for (var i = 0; i < ms.length; i++) bs.push(ms[i].b);
    var out = [];
    for (var j = 0; j < DB.tsb.length; j++) {
      var t = DB.tsb[j];
      var hit = (t.fam || []).indexOf(e.fam) > -1;
      if (!hit) for (var k = 0; k < (t.b || []).length; k++) if (bs.indexOf(t.b[k]) > -1) { hit = true; break; }
      if (!hit) hit = (t.gb || []).indexOf(e.gb) > -1;
      if (hit) out.push(t);
    }
    out.sort(function (a, b) { return b.date.localeCompare(a.date); });
    return out;
  }
  function planFor(e) {
    var i;
    for (i = 0; i < DB.maint.length; i++) if ((DB.maint[i].fam || []).indexOf(e.fam) > -1) return DB.maint[i];
    for (i = 0; i < DB.maint.length; i++) if (DB.maint[i].fuel === e.fuel) return DB.maint[i];
    for (i = 0; i < DB.maint.length; i++) if (!DB.maint[i].fuel) return DB.maint[i];
    return DB.maint[0] || null;
  }
  function ivi(e) {
    if (IVIC[e.id] !== undefined) return IVIC[e.id];
    var s = 0, fs = faultsFor(e);
    for (var i = 0; i < fs.length; i++) {
      var w = (SV[fs[i].sev] || { w: 0 }).w * (FQ[fs[i].freq] || 1);
      s += fs[i].active ? w : w * 0.25;
    }
    s = clamp(Math.round(s), 0, 100);
    IVIC[e.id] = s;
    return s;
  }
  function enginesForFault(f) {
    var out = [];
    for (var i = 0; i < DB.engines.length; i++) if (fMatch(f, DB.engines[i])) out.push(DB.engines[i]);
    return out;
  }
  function enginesForTsb(t) {
    var out = [];
    for (var i = 0; i < DB.engines.length; i++) {
      var e = DB.engines[i], ms = engModels(e), bs = [];
      for (var j = 0; j < ms.length; j++) bs.push(ms[j].b);
      var hit = (t.fam || []).indexOf(e.fam) > -1;
      if (!hit) for (var k = 0; k < (t.b || []).length; k++) if (bs.indexOf(t.b[k]) > -1) { hit = true; break; }
      if (!hit) hit = (t.gb || []).indexOf(e.gb) > -1;
      if (hit) out.push(e);
    }
    return out;
  }
  function isRecall(t) { return t.cat === "Rappel" || /^RPL-/.test(t.ref); }
  function famBrands(f) {
    var s = {};
    for (var i = 0; i < DB.engines.length; i++) {
      var e = DB.engines[i];
      if (e.fam !== f) continue;
      var b = engBrand(e);
      if (b) s[b.id] = 1;
    }
    return Object.keys(s);
  }

  function integrity() {
    var err = [], warn = [], mi = {}, bi = {}, du = 0, i, j;
    for (i = 0; i < DB.models.length; i++) mi[DB.models[i].id] = 1;
    for (i = 0; i < DB.brands.length; i++) bi[DB.brands[i].id] = 1;
    for (i = 0; i < FILES.length; i++) {
      var arr = DB[FILES[i][0]], s = {};
      for (j = 0; j < arr.length; j++) { if (s[arr[j].id]) du++; s[arr[j].id] = 1; }
    }
    if (du) err.push(du + " identifiant(s) dupliqué(s)");
    for (i = 0; i < DB.models.length; i++) if (!bi[DB.models[i].b]) err.push("models : marque inconnue " + DB.models[i].b);
    var orph = 0;
    for (i = 0; i < DB.engines.length; i++) for (j = 0; j < DB.engines[i].m.length; j++) if (!mi[DB.engines[i].m[j]]) orph++;
    if (orph) err.push(orph + " référence(s) moteur orpheline(s)");
    for (i = 0; i < DB.faults.length; i++) if (!SV[DB.faults[i].sev]) err.push("faults : sévérité " + DB.faults[i].sev);
    for (i = 0; i < DB.maint.length; i++) if (!DB.maint[i].items || !DB.maint[i].items.length) err.push("maint : plan vide " + DB.maint[i].id);
    return { err: err, warn: warn, ok: err.length === 0, pct: err.length ? Math.max(0, 100 - err.length * 7) : 100 };
  }

  function recompute() {
    IVIC = {}; reindex();
    var fa = {}, links = 0, corr = 0, byBrand = {}, byFuel = {}, i;
    for (i = 0; i < DB.engines.length; i++) {
      var e = DB.engines[i];
      fa[e.fam] = 1; links += e.m.length;
      var m = MIDX[e.m[0]];
      if (m) byBrand[m.b] = (byBrand[m.b] || 0) + 1;
      byFuel[e.fuel] = (byFuel[e.fuel] || 0) + 1;
      corr += faultsFor(e).length + tsbFor(e).length;
    }
    for (i = 0; i < DB.faults.length; i++) links += (DB.faults[i].fam || []).length + (DB.faults[i].gb || []).length;
    for (i = 0; i < DB.tsb.length; i++) links += (DB.tsb[i].b || []).length + (DB.tsb[i].fam || []).length;
    for (i = 0; i < DB.maint.length; i++) links += (DB.maint[i].fam || []).length;
    var inter = 0, fkeys = Object.keys(fa);
    for (i = 0; i < fkeys.length; i++) if (famBrands(fkeys[i]).length > 1) inter++;
    var doms = {};
    for (i = 0; i < DB.tsb.length; i++) doms[DB.tsb[i].cat] = 1;
    META = {
      counts: {
        b: DB.brands.length, m: DB.models.length, e: DB.engines.length,
        f: DB.faults.length, t: DB.tsb.length, p: DB.maint.length,
        fam: fkeys.length, inter: inter, rc: DB.tsb.filter(isRecall).length, dom: Object.keys(doms).length
      },
      links: links, corr: corr, integ: integrity(),
      size: Math.round(JSON.stringify(DB).length / 1024),
      byBrand: byBrand, byFuel: byFuel
    };
  }

  function updStor() {
    var k = META.size || 0, b = $("#sbar"), t = $("#stxt");
    if (b) b.style.width = clamp(k / 8192 * 100, 2, 100) + "%";
    var stamp = LASTSAVE ? new Date(LASTSAVE).toLocaleTimeString("fr-FR") : "—";
    if (t) t.textContent = k + " Ko · " + (STORE.local ? "local" : "mémoire") + " · auto " + stamp;
  }
  function prune() {
    reindex();
    GARAGE = GARAGE.filter(function (i) { return DB.engines.some(function (e) { return e.id === i; }); });
    if (S.planCtx && !DB.engines.some(function (e) { return e.id === S.planCtx; })) S.planCtx = null;
    if (S.drawer && S.drawer.type === "engine" && !DB.engines.some(function (e) { return e.id === S.drawer.id; })) closeDrawer();
  }
  function mutate(t, m) {
    recompute(); prune(); audit(t, m); markDirty(); updateMeta(); render();
    if (S.drawer) renderDrawer();
  }

  var sevTag = function (s) {
    var cls = (s === "modérée") ? "mode" : esc(s);
    return "<span class='sev " + cls + "'>" + esc(s) + "</span>";
  };
  var fuelTag = function (f) {
    var x = FU[f] || { l: f, c: "#9FB2C8" };
    return "<span class='fuel' style='--fc:" + x.c + "'>" + x.l + "</span>";
  };
  var iviPill = function (v) {
    var l = IVL(v);
    return "<span class='ivp' style='--ic:" + l[1] + "'><i></i>IVI " + v + " · " + l[0] + "</span>";
  };
  function gaugeSVG(v) {
    var C = Math.PI * 52, off = C * (1 - v / 100), rot = -90 + v * 1.8;
    return "<svg class='gg' viewBox='0 0 120 70'>" +
      "<path class='ba' d='M8 62 A52 52 0 0 1 112 62'/>" +
      "<path class='fa' d='M8 62 A52 52 0 0 1 112 62' stroke-dasharray='" + C + "' stroke-dashoffset='" + C + "' data-off='" + off + "'/>" +
      "<line class='nd' x1='59' y1='61' x2='59' y2='19' data-rot='" + rot + "' style='transform:rotate(-90deg)'/>" +
      "<circle cx='59' cy='61' r='4' fill='#E6EEF9'/></svg>";
  }
  function corrRow(x) {
    var F = FU[x.fuel] || { c: "#9FB2C8" }, b = engBrand(x), ms = engModels(x);
    var title = (b ? b.n : "") + " " + (ms.length ? ms[0].n : "");
    return "<button class='corr' style='--fc:" + F.c + "' data-act='openEng' data-id='" + x.id + "'>" +
      "<div style='min-width:0'><b>" + esc(title) + "</b><small>" + esc(x.label) + " · " + esc(x.code) + " · " + x.y[0] + "-" + x.y[1] + "</small></div>" +
      "<span class='hp'>" + x.hp + "<small style='font-size:9px'> ch</small></span></button>";
  }

  function faultCard(f, hist, full) {
    var c = (SV[f.sev] || { c: "#FFAF2E" }).c, h = "", i;
    h += "<div class='fcard' style='--sc:" + c + ";" + (hist ? "opacity:.62" : "") + "'>";
    h += "<div class='fh'><b>" + esc(f.t) + "</b>" + sevTag(f.sev) + "</div>";
    h += "<div class='tags'><span class='tag'>" + f.y[0] + "-" + f.y[1] + "</span>";
    h += "<span class='tag'>" + fmt(f.km[0]) + "-" + fmt(f.km[1]) + " km</span>";
    h += "<span class='tag'>fréq. " + esc(f.freq) + "</span>";
    if (hist) h += "<span class='tag'>HISTORIQUE</span>";
    h += "<span class='tag' style='color:#25D4EE'>" + esc(f.status) + "</span></div>";
    if ((f.sym || []).length) {
      h += "<div class='tags'>";
      for (i = 0; i < f.sym.length; i++) h += "<span class='tag'>" + ic("act", "width:11px;height:11px;color:#FFAF2E") + esc(f.sym[i]) + "</span>";
      h += "</div>";
    }
    if (f.cause) h += "<p><b>Cause :</b> " + esc(f.cause) + "</p>";
    if (f.fix) h += "<p><b>Action :</b> " + esc(f.fix) + "</p>";
    h += "<div class='cost'>" + ic("euro", "width:14px;height:14px");
    h += (f.cost[1] === 0) ? "Prise en charge / campagne" : (fmt(f.cost[0]) + " - " + fmt(f.cost[1]) + " EUR");
    h += "</div>";
    if (!full) h += "<div class='acts'><button class='btn xs ghost' data-act='openFault' data-id='" + f.id + "'>" + ic("chev", "width:12px;height:12px") + "Détail</button></div>";
    h += "</div>";
    return h;
  }
  function tsbCard(t, full) {
    var rc = isRecall(t), h = "";
    h += "<div class='tsb" + (rc ? " rc" : "") + "'>";
    h += "<div style='display:flex;gap:8px;align-items:center;flex-wrap:wrap'>";
    h += "<span class='ref'>" + esc(t.ref) + "</span>" + sevTag(t.sev);
    h += "<span class='tag'>" + (rc ? ic("bell", "width:11px;height:11px;color:#FFAF2E") : "") + esc(t.cat) + "</span>";
    h += "<span class='tag mono'>" + esc(t.date) + "</span></div>";
    h += "<b>" + esc(t.t) + "</b><p>" + esc(t.sum) + "</p>";
    h += "<div class='act'><b style='font-size:11px;color:" + (rc ? "#FFAF2E" : "#4D8DFF") + "'>ACTION :</b> " + esc(t.act) + "</div>";
    if (!full) h += "<div class='acts' style='margin-top:10px'><button class='btn xs ghost' data-act='openTsb' data-id='" + t.id + "'>" + ic("chev", "width:12px;height:12px") + "Détail</button></div>";
    h += "</div>";
    return h;
  }
  function planMini(p) {
    if (!p) return "<div class='empty'>Aucun plan</div>";
    var h = "", i;
    h += "<div class='oil'>";
    h += "<div class='oc'><span>" + ic("oil", "width:12px;height:12px") + "HUILE</span><b>" + esc(p.oil ? p.oil[0] : "Sans objet") + "</b>";
    h += "<p>" + (p.oil && p.oil[1] ? p.oil[1] + " L · " : "") + esc(p.oil && p.oil[2] ? p.oil[2] : "—") + "</p></div>";
    h += "<div class='oc b'><span>" + ic("piston", "width:12px;height:12px") + "DISTRIBUTION</span><b>" + esc(p.dist ? p.dist[0] : "—") + "</b>";
    h += "<p>" + (p.dist && p.dist[1] ? fmt(p.dist[1]) + " km" + (p.dist[2] ? " / " + p.dist[2] + " mois" : "") : "Chaîne / sans objet") + "</p></div></div>";
    if (p.extra) {
      var ex = p.extra;
      var rows = [["Liquide de freins", ex.f], ["Liquide refroidissement", ex.l], ["Couple roues", ex.w ? ex.w + " Nm" : "—"], ["Pression pneus", ex.p ? ex.p[0] + " / " + ex.p[1] + " bar" : "—"], ["Fluide clim", ex.r], ["Batterie 12V", ex.b]];
      h += "<div class='sg' style='margin-bottom:12px'>";
      for (i = 0; i < rows.length; i++) h += "<div class='sp'><span>" + rows[i][0] + "</span><b class='hl'>" + esc(rows[i][1] || "—") + "</b></div>";
      h += "</div>";
    }
    h += "<div class='tw' style='border-radius:11px'><table class='mt'><thead><tr><th>Opération</th><th>Échéance</th></tr></thead><tbody>";
    for (i = 0; i < p.items.length; i++) {
      var it = p.items[i];
      h += "<tr><td>" + esc(it[0]) + "</td><td class='km'>" + (it[1] ? fmt(it[1]) + " km" : "") + (it[2] ? " / " + it[2] + " mois" : "") + "</td></tr>";
    }
    h += "</tbody></table></div>";
    if (p.note) h += "<p style='font-size:11.5px;color:#FFAF2E;margin-top:9px'>" + ic("info", "width:13px;height:13px") + " " + esc(p.note) + "</p>";
    return h;
  }

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

  function openDrawer(type, id, push) {
    if (S.drawer && push) S.drawer.hist.push({ type: S.drawer.type, id: S.drawer.id, tab: S.drawer.tab });
    else if (!S.drawer) S.drawer = { hist: [] };
    S.drawer.type = type; S.drawer.id = id;
    S.drawer.tab = (type === "engine" ? "fiche" : "main");
    renderDrawer();
    document.body.classList.add("lock");
    requestAnimationFrame(function () { $("#dr").classList.add("on"); });
    beep("open");
  }
  function closeDrawer() {
    var r = $("#dr"); if (!r.innerHTML) return;
    r.classList.remove("on"); S.drawer = null;
    if (!modalOpenFn()) document.body.classList.remove("lock");
    setTimeout(function () { if (!S.drawer) r.innerHTML = ""; }, 330);
    beep("close");
  }
  function renderDrawer() {
    if (!S.drawer) return;
    var d = S.drawer, head = "", tabs = "", body = "", i;
    if (d.type === "engine") {
      var e = null;
      for (i = 0; i < DB.engines.length; i++) if (DB.engines[i].id === d.id) e = DB.engines[i];
      if (!e) { closeDrawer(); return; }
      var b = engBrand(e), ms = engModels(e), F = FU[e.fuel] || { c: "#9FB2C8" };
      var fs = faultsFor(e), ts = tsbFor(e), rc = ts.filter(isRecall), pl = planFor(e), v = ivi(e), L = IVL(v);
      head = "<div class='dh' style='--fc:" + F.c + "'><div class='row'>";
      if (d.hist.length) head += "<button class='tb' data-act='drback'>" + ic("back") + "</button>";
      head += "<span class='tag mono'>" + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel);
      var mnames = [];
      for (i = 0; i < ms.length; i++) mnames.push(ms[i].n);
      head += "<span class='tag'>" + esc(mnames.join(" / ")) + "</span>";
      if (rc.length) head += "<span class='tag' style='color:#FFAF2E'>" + ic("bell", "width:11px;height:11px") + rc.length + " rappel(s)</span>";
      head += "<button class='tb x' data-act='drclose'>" + ic("x") + "</button></div>";
      head += "<h2>" + esc(e.label) + "</h2>";
      head += "<div class='sub mono'>" + esc(e.code) + " · " + e.y[0] + "-" + e.y[1] + " · " + e.hp + " ch / " + e.kw + " kW · " + e.nm + " Nm</div></div>";
      var dt = [["fiche", "Fiche", "piston"], ["pannes", "Pannes", "alert", fs.length], ["tsb", "TSB", "file", ts.length], ["entretien", "Entretien", "wrench"], ["corr", "Corrélations", "link"]];
      tabs = "<div class='dtabs'>";
      for (i = 0; i < dt.length; i++) {
        tabs += "<button class='dt " + (d.tab === dt[i][0] ? "on" : "") + "' data-act='drtab' data-t='" + dt[i][0] + "'>" + ic(dt[i][2], "width:14px;height:14px") + dt[i][1];
        if (dt[i][3] !== undefined) tabs += "<span class='n'>" + dt[i][3] + "</span>";
        tabs += "</button>";
      }
      tabs += "</div>";
      if (d.tab === "fiche") {
        body = "<div class='gw' style='--gc:" + L[1] + "'>" + gaugeSVG(v);
        body += "<div class='gt'><b data-count='" + v + "'>0</b><span>INDICE DE VIGILANCE</span><p>Niveau <b style='color:" + L[1] + "'>" + L[0] + "</b></p></div></div>";
        var rows = [["Code moteur", e.code, 1], ["Famille", e.fam, 1], ["Cylindrée", e.disp ? fmt(e.disp) + " cm3" : "—"], ["Architecture", e.cyl], ["Puissance", e.hp + " ch / " + e.kw + " kW", 1], ["Couple", e.nm + " Nm"], ["Suralimentation", e.asp], ["Injection", e.inj], ["Norme", e.norm], ["Boîte", GBL[e.gb] || e.gb], ["Production", e.y[0] + " - " + e.y[1]], ["Énergie", (FU[e.fuel] || {}).l || e.fuel]];
        body += "<div class='sg'>";
        for (i = 0; i < rows.length; i++) body += "<div class='sp'><span>" + rows[i][0] + "</span><b class='" + (rows[i][2] ? "hl" : "") + "'>" + esc(rows[i][1]) + "</b></div>";
        body += "</div>";
        body += "<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:14px'><button class='btn sm ghost' data-act='pin' data-id='" + e.id + "'>" + ic("star") + "Garage</button>";
        body += "<button class='btn sm ghost' data-act='expEng' data-id='" + e.id + "'>" + ic("dl") + "Exporter</button></div>";
      } else if (d.tab === "pannes") {
        body = fs.length ? fs.map(function (f) { return faultCard(f, !f.active, false); }).join("") : "<div class='empty'>" + ic("check") + "<p>Aucune panne référencée.</p></div>";
      } else if (d.tab === "tsb") {
        body = ts.length ? ts.map(function (t) { return tsbCard(t, false); }).join("") : "<div class='empty'>" + ic("file") + "<p>Aucun bulletin corrélé.</p></div>";
      } else if (d.tab === "entretien") {
        body = planMini(pl);
      } else {
        var same = DB.engines.filter(function (x) { return x.fam === e.fam && x.id !== e.id; });
        body = "<div class='card panel'><h3>" + ic("link") + "Famille " + esc(e.fam) + "</h3>";
        body += same.length ? same.slice(0, 20).map(corrRow).join("") : "<p class='dim'>Première motorisation de cette famille.</p>";
        body += "</div>";
      }
    } else if (d.type === "fault") {
      var f2 = null;
      for (i = 0; i < DB.faults.length; i++) if (DB.faults[i].id === d.id) f2 = DB.faults[i];
      if (!f2) { closeDrawer(); return; }
      var af = enginesForFault(f2);
      head = "<div class='dh' style='--fc:" + (SV[f2.sev] || { c: "#FFAF2E" }).c + "'><div class='row'>";
      if (d.hist.length) head += "<button class='tb' data-act='drback'>" + ic("back") + "</button>";
      head += sevTag(f2.sev) + "<span class='tag'>" + esc(f2.status) + "</span>";
      head += "<button class='tb x' data-act='drclose'>" + ic("x") + "</button></div><h2>" + esc(f2.t) + "</h2></div>";
      body = faultCard(f2, false, true);
      body += "<div class='card panel' style='margin-top:14px'><h3>" + ic("car") + "Motorisations corrélées (" + af.length + ")</h3>";
      body += af.length ? af.slice(0, 20).map(corrRow).join("") : "<p class='dim'>Aucune.</p>";
      body += "</div>";
    } else {
      var t2 = null;
      for (i = 0; i < DB.tsb.length; i++) if (DB.tsb[i].id === d.id) t2 = DB.tsb[i];
      if (!t2) { closeDrawer(); return; }
      var at = enginesForTsb(t2);
      head = "<div class='dh' style='--fc:" + (isRecall(t2) ? "#FFAF2E" : "#4D8DFF") + "'><div class='row'>";
      if (d.hist.length) head += "<button class='tb' data-act='drback'>" + ic("back") + "</button>";
      head += "<span class='tag mono'>" + esc(t2.ref) + "</span>" + sevTag(t2.sev);
      head += "<button class='tb x' data-act='drclose'>" + ic("x") + "</button></div><h2>" + esc(t2.t) + "</h2></div>";
      body = tsbCard(t2, true);
      body += "<div class='card panel' style='margin-top:14px'><h3>" + ic("car") + "Périmètre corrélé (" + at.length + ")</h3>";
      body += at.length ? at.slice(0, 20).map(corrRow).join("") : "<p class='dim'>Aucun.</p>";
      body += "</div>";
    }
    $("#dr").innerHTML = "<div class='sc' data-act='drclose'></div><aside class='dw'>" + head + tabs + "<div class='db'>" + body + "</div><div class='dfoot'>" + ic("shield", "width:12px;height:12px") + "SYNTHÈSE INGÉNIEUR — CONFIRMER AU VIN</div></aside>";
    mountAnim($("#dr"));
  }

  /* ══════════ RECHERCHE PRÉDICTIVE (omnibox) ══════════ */
  var SYN = {
    puretech: ["eb2", "eb2adts", "eb2adtx"], hdi: ["dv5", "dv5ruc", "dv5rucd", "dw10"],
    bluehdi: ["dv5", "dv5ruc", "dv5rucd", "dw10"], tsi: ["ea211", "ea211evo", "ea888"],
    tdi: ["ea288"], tce: ["h4dt", "h5ht"], dci: ["k9k", "m9r", "r9m"],
    courroie: ["courroie", "distribution"], chaine: ["chaine", "aac"],
    adblue: ["adblue", "scr", "nox"], scr: ["scr", "adblue", "nox"],
    egr: ["egr"], fap: ["fap", "dpf"], turbo: ["turbo"], injecteur: ["injecteur"],
    rappel: ["rappel"], tsb: ["tsb", "bulletin"], panne: ["panne", "defaut"],
    eat8: ["eat8"], eat6: ["eat6"], dsg: ["dq200", "dq381"], zf8: ["zf8"],
    frein: ["frein", "freinage", "pompe a vide"], clim: ["clim", "condenseur"],
    batterie: ["batterie", "12v"], ecran: ["ecran", "multimedia", "bsi"]
  };
  function tokens(q) {
    var n = nk(q);
    var raw = String(q || "").toLowerCase().split(/[\s,;]+/).filter(Boolean);
    return { n: n, raw: raw };
  }
  function subseq(needle, hay) {
    var i = 0, j = 0;
    while (i < needle.length && j < hay.length) {
      if (needle[i] === hay[j]) i++;
      j++;
    }
    return i === needle.length;
  }
  function textScore(qn, hay) {
    var h = nk(hay);
    if (!qn) return 0;
    if (h === qn) return 120;
    if (h.indexOf(qn) === 0) return 95;
    if (h.indexOf(qn) > -1) return 70;
    if (subseq(qn, h)) return 34;
    return 0;
  }
  function expandSyn(raw) {
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var k = nk(raw[i]);
      if (SYN[k]) out = out.concat(SYN[k]);
    }
    return out;
  }
  function omniSearch(q) {
    var T = tokens(q);
    var syn = expandSyn(T.raw);
    var hits = [];
    var i, j;
    var wantRecall = T.n.indexOf("rappel") > -1 || T.n.indexOf("campagne") > -1;
    var wantTsb = T.n.indexOf("tsb") > -1 || T.n.indexOf("bulletin") > -1;
    var wantFault = T.n.indexOf("panne") > -1 || T.n.indexOf("defaut") > -1 || T.n.indexOf("probleme") > -1;

    var matchedEng = [];
    for (i = 0; i < DB.engines.length; i++) {
      var e = DB.engines[i];
      var b = engBrand(e), ms = engModels(e);
      var hay = [(b ? b.n : "")].concat(ms.map(function (m) { return m.n; })).concat([e.code, e.fam, e.label]).join(" ");
      var sc = textScore(T.n, hay);
      if (!sc && syn.length) {
        for (j = 0; j < syn.length; j++) {
          if (nk(e.fam).indexOf(nk(syn[j])) > -1 || nk(e.code).indexOf(nk(syn[j])) > -1 || nk(e.gb).indexOf(nk(syn[j])) > -1) { sc = 62; break; }
        }
      }
      if (sc > 0) {
        matchedEng.push(e);
        hits.push({ kind: "engine", id: e.id, score: sc + 8, title: engName(e), sub: e.code + " · " + e.hp + " ch · " + e.y[0] + "-" + e.y[1], color: (FU[e.fuel] || {}).c || "#25D4EE", badge: "MOTEUR" });
      }
    }
    var famSet = {}, brandSet = {}, gbSet = {};
    for (i = 0; i < matchedEng.length; i++) {
      famSet[matchedEng[i].fam] = 1;
      gbSet[matchedEng[i].gb] = 1;
      var bb = engBrand(matchedEng[i]);
      if (bb) brandSet[bb.id] = 1;
    }

    for (i = 0; i < DB.faults.length; i++) {
      var f = DB.faults[i];
      var hay2 = f.t + " " + (f.fam || []).join(" ") + " " + f.cause + " " + (f.sym || []).join(" ");
      var sc2 = textScore(T.n, hay2);
      if (!sc2) {
        for (j = 0; j < (f.fam || []).length; j++) if (famSet[f.fam[j]]) { sc2 = 66; break; }
      }
      if (!sc2 && syn.length) {
        for (j = 0; j < syn.length; j++) if (nk(hay2).indexOf(nk(syn[j])) > -1) { sc2 = 58; break; }
      }
      if (!sc2 && (f.gb || []).length) {
        for (j = 0; j < f.gb.length; j++) if (gbSet[f.gb[j]]) { sc2 = 54; break; }
      }
      if (sc2 > 0) {
        var boost = wantFault ? 26 : 0;
        var sevW = (SV[f.sev] || { w: 0 }).w;
        hits.push({ kind: "fault", id: f.id, score: sc2 + boost + sevW * 0.6, title: f.t, sub: f.sev + " · " + f.y[0] + "-" + f.y[1] + " · " + fmt(f.km[0]) + "-" + fmt(f.km[1]) + " km", color: (SV[f.sev] || {}).c || "#FFAF2E", badge: "PANNE" });
      }
    }

    for (i = 0; i < DB.tsb.length; i++) {
      var t = DB.tsb[i];
      var rc = isRecall(t);
      var hay3 = t.t + " " + t.ref + " " + (t.fam || []).join(" ") + " " + t.sum + " " + t.cat;
      var sc3 = textScore(T.n, hay3);
      if (!sc3) {
        for (j = 0; j < (t.fam || []).length; j++) if (famSet[t.fam[j]]) { sc3 = 64; break; }
      }
      if (!sc3) {
        for (j = 0; j < (t.b || []).length; j++) if (brandSet[t.b[j]]) { sc3 = 50; break; }
      }
      if (!sc3 && syn.length) {
        for (j = 0; j < syn.length; j++) if (nk(hay3).indexOf(nk(syn[j])) > -1) { sc3 = 56; break; }
      }
      if (sc3 > 0) {
        var boost3 = (wantRecall && rc) ? 34 : (wantTsb && !rc ? 30 : 0);
        if (rc) boost3 += 12;
        hits.push({ kind: "tsb", id: t.id, score: sc3 + boost3 + (SV[t.sev] || { w: 0 }).w * 0.5, title: t.t, sub: t.ref + " · " + t.date + " · " + t.cat, color: rc ? "#FFAF2E" : "#4D8DFF", badge: rc ? "RAPPEL" : "TSB" });
      }
    }

    for (i = 0; i < DB.models.length; i++) {
      var m = DB.models[i];
      var mb = brandById(m.b);
      var sc4 = textScore(T.n, (mb ? mb.n + " " : "") + m.n);
      if (sc4 > 0) hits.push({ kind: "model", id: m.id, score: sc4 + 4, title: (mb ? mb.n + " " : "") + m.n, sub: m.seg + " · " + m.y[0] + "-" + m.y[1], color: "#4D8DFF", badge: "MODÈLE" });
    }
    for (i = 0; i < DB.brands.length; i++) {
      var br = DB.brands[i];
      var sc5 = textScore(T.n, br.n + " " + br.pays);
      if (sc5 > 0) hits.push({ kind: "brand", id: br.id, score: sc5, title: br.n, sub: br.pays + " · " + br.grp, color: "#25D4EE", badge: "MARQUE" });
    }

    hits.sort(function (a, b) { return b.score - a.score; });
    var seen = {}, out = [];
    for (i = 0; i < hits.length && out.length < 14; i++) {
      var k = hits[i].kind + ":" + hits[i].id;
      if (seen[k]) continue;
      seen[k] = 1;
      out.push(hits[i]);
    }
    return out;
  }
  function hl(text, q) {
    var n = String(q || "").trim();
    if (!n) return esc(text);
    var idx = String(text).toLowerCase().indexOf(n.toLowerCase());
    if (idx < 0) return esc(text);
    return esc(String(text).slice(0, idx)) + "<mark>" + esc(String(text).slice(idx, idx + n.length)) + "</mark>" + esc(String(text).slice(idx + n.length));
  }
  function omniRender() {
    var box = $("#omnires");
    if (!box) return;
    var q = S.omni.q;
    if (!q || q.trim().length < 2) {
      var seeds = ["3008 courroie", "3008 rappel", "1.5 BlueHDi chaine", "AdBlue SCR", "EGR FAP", "EAT8 a-coups", "pompe a vide freinage"];
      var h = "<div class='grp'>RECHERCHE PRÉDICTIVE — PANNES · RAPPELS · TSB</div><div class='hint'>";
      for (var i = 0; i < seeds.length; i++) h += "<button data-act='omniSeed' data-q='" + esc(seeds[i]) + "'>" + esc(seeds[i]) + "</button>";
      h += "</div>";
      box.innerHTML = h;
      box.classList.add("on");
      return;
    }
    var hits = omniSearch(q);
    S.omni.hits = hits;
    S.omni.idx = hits.length ? 0 : -1;
    if (!hits.length) {
      box.innerHTML = "<div class='grp'>AUCUN RÉSULTAT POUR « " + esc(q) + " »</div><div class='hint'><button data-act='omniSeed' data-q='3008'>3008</button><button data-act='omniSeed' data-q='rappel'>rappels</button><button data-act='omniSeed' data-q='courroie'>courroie</button></div>";
      box.classList.add("on");
      return;
    }
    var order = ["fault", "tsb", "engine", "model", "brand"];
    var labels = { fault: "PANNES CONNUES", tsb: "CAMPAGNES DE RAPPEL / TSB", engine: "MOTORISATIONS", model: "MODÈLES", brand: "MARQUES" };
    var html = "";
    for (var g = 0; g < order.length; g++) {
      var kind = order[g];
      var group = hits.filter(function (x) { return x.kind === kind; });
      if (!group.length) continue;
      html += "<div class='grp'>" + labels[kind] + " · " + group.length + "</div>";
      for (var j = 0; j < group.length; j++) {
        var it = group[j];
        var gi = hits.indexOf(it);
        html += "<button class='hit" + (gi === S.omni.idx ? " sel" : "") + "' data-act='omniHit' data-kind='" + it.kind + "' data-id='" + esc(it.id) + "' data-i='" + gi + "'>";
        html += "<span class='k' style='color:" + it.color + "'>" + it.badge + "</span>";
        html += "<span class='txt'><span>" + hl(it.title, q) + "</span><span class='sub2'>" + esc(it.sub) + "</span></span>";
        html += ic("chev", "width:13px;height:13px;color:#61748C");
        html += "</button>";
      }
    }
    box.innerHTML = html;
    box.classList.add("on");
  }
  function omniClose() {
    var box = $("#omnires");
    if (box) box.classList.remove("on");
    S.omni.idx = -1;
  }
  function omniActivate(hit) {
    if (!hit) return;
    omniClose();
    var inp = $("#omni");
    if (inp) inp.blur();
    if (hit.kind === "engine") openDrawer("engine", hit.id, !!S.drawer);
    else if (hit.kind === "fault") openDrawer("fault", hit.id, !!S.drawer);
    else if (hit.kind === "tsb") openDrawer("tsb", hit.id, !!S.drawer);
    else if (hit.kind === "model") {
      var m = modelById(hit.id);
      if (m) { S.f.brand = m.b; S.f.q = m.n; S.shown = 48; location.hash = "#/explorer"; render(); }
      beep("tick");
    } else if (hit.kind === "brand") {
      S.f.brand = hit.id; S.f.q = ""; S.shown = 48; location.hash = "#/explorer"; render();
      beep("tick");
    }
  }
  function omniMove(delta) {
    var box = $("#omnires");
    if (!box || !box.classList.contains("on")) return;
    var els = $$(".hit", box);
    if (!els.length) return;
    S.omni.idx = clamp(S.omni.idx + delta, 0, els.length - 1);
    els.forEach(function (el, i) { el.classList.toggle("sel", i === S.omni.idx); });
    els[S.omni.idx].scrollIntoView({ block: "nearest" });
  }

  /* ══════════ VUES ══════════ */
  function computeResults() {
    var f = S.f, q = f.q.trim().toLowerCase();
    var list = DB.engines.filter(function (e) {
      var b = engBrand(e);
      if (f.brand && (!b || b.id !== f.brand)) return false;
      if (f.fuels.length && f.fuels.indexOf(e.fuel) < 0) return false;
      if (f.seg) {
        var ms = engModels(e), ok = false;
        for (var i = 0; i < ms.length; i++) if (ms[i].seg === f.seg) ok = true;
        if (!ok) return false;
      }
      if (!ov(e.y, f.y)) return false;
      if (e.hp < f.p[0] || e.hp > f.p[1]) return false;
      if (q) {
        var parts = [(b ? b.n : "")];
        var mm = engModels(e);
        for (var j = 0; j < mm.length; j++) parts.push(mm[j].n);
        parts.push(e.code, e.fam, e.label);
        if (parts.join(" ").toLowerCase().indexOf(q) < 0) return false;
      }
      return true;
    });
    var cache = {};
    var gi = function (e) { if (cache[e.id] !== undefined) return cache[e.id]; cache[e.id] = ivi(e); return cache[e.id]; };
    var so = {
      brand: function (a, b) { var an = engBrand(a), bn = engBrand(b); return ((an ? an.n : "")).localeCompare(bn ? bn.n : "") || b.hp - a.hp; },
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
    var mnames = [];
    for (var k = 0; k < ms.length; k++) mnames.push(ms[k].n);
    var h = "";
    h += "<article class='card hov eng rv' style='--d:" + Math.min(i, 14) + ";--fc:" + F.c + "' data-act='openEng' data-id='" + e.id + "' tabindex='0' role='button'>";
    h += "<div class='top'><span class='br'>" + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel);
    h += "<button class='st " + (pin ? "on" : "") + "' data-act='pin' data-id='" + e.id + "'>" + ic("star", "width:15px;height:15px") + "</button></div>";
    h += "<h4>" + esc(mnames.join(" / ")) + "</h4><div class='lbl'>" + esc(e.label) + "</div>";
    h += "<div class='pw'><b>" + e.hp + "</b><span>ch · " + e.kw + " kW</span><span style='margin-left:auto'>" + e.nm + " Nm</span></div>";
    h += "<div class='meta'><span class='tag mono'>" + esc(e.code) + "</span><span class='tag'>" + e.y[0] + "-" + e.y[1] + "</span><span class='tag'>" + esc(GBL[e.gb] || e.gb) + "</span>";
    if (nr) h += "<span class='tag' style='color:#FFAF2E'>" + ic("bell", "width:10px;height:10px") + nr + "</span>";
    h += "</div>";
    h += "<div class='ft'><span>" + ic("alert", "color:" + (nf ? "#FFAF2E" : "#61748C")) + " " + nf + "</span><span>" + ic("file", "color:" + (ts.length ? "#4D8DFF" : "#61748C")) + " " + ts.length + "</span>" + iviPill(v) + "</div>";
    h += "</article>";
    return h;
  }

  function vBord() {
    var c = META.counts, i;
    var fc = Object.keys(FU).map(function (f) { return { f: f, n: DB.engines.filter(function (e) { return e.fuel === f; }).length }; }).filter(function (x) { return x.n > 0; });
    var tot = fc.reduce(function (s, x) { return s + x.n; }, 0) || 1;
    var R = 54, C = 2 * Math.PI * R, acc = 0;
    var segs = fc.map(function (x) { var l = x.n / tot * C, o = -acc; acc += l; return { f: x.f, n: x.n, len: l, off: o }; });
    var sc = Object.keys(SV).map(function (s) { return { s: s, n: DB.faults.filter(function (f) { return f.sev === s; }).length }; });
    var sm = Math.max.apply(null, sc.map(function (x) { return x.n; }).concat([1]));
    var fr = {};
    DB.engines.forEach(function (e) { var o = fr[e.fam] = fr[e.fam] || { n: 0, s: 0 }; o.n++; o.s += ivi(e); });
    var top = Object.keys(fr).filter(function (f) { return fr[f].n >= 2; })
      .map(function (f) { return { f: f, v: Math.round(fr[f].s / fr[f].n), n: fr[f].n }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    var rc = DB.tsb.filter(isRecall).sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
    var al = DB.faults.filter(function (f) { return f.sev === "critique"; }).slice(0, 4);

    var h = "";
    h += "<div class='hero rv'><span class='kick'>MODULE 01 — POSTE DE BORD</span>";
    h += "<h2>BASE EXPERT <i>2017 - 2027</i><br>" + fmt(c.b) + " marques · " + fmt(c.m) + " modèles · " + fmt(c.e) + " motorisations</h2>";
    h += "<p>" + fmt(c.f) + " pannes connues, " + fmt(c.t) + " bulletins dont <b style='color:#FFAF2E'>" + fmt(c.rc) + " campagnes de rappel</b>, " + fmt(c.p) + " plans d entretien. Recherche prédictive en haut : tapez un modèle, un code moteur ou un symptôme.</p>";
    h += "<div class='seedrow'>";
    var seeds = ["3008 courroie", "3008 rappel", "1.5 BlueHDi chaine", "AdBlue SCR", "EGR FAP", "EAT8 a-coups", "pompe a vide freinage"];
    for (i = 0; i < seeds.length; i++) h += "<button data-act='omniSeed' data-q='" + esc(seeds[i]) + "'>" + ic("search", "width:10px;height:10px") + esc(seeds[i]) + "</button>";
    h += "</div>";
    h += "<div class='acts'><a class='btn pri' href='#/explorer'>" + ic("car") + "Explorer</a>";
    h += "<button class='btn grn' data-act='runTests'>" + ic("stetho") + "Autovérification</button>";
    h += "<button class='btn amb' data-act='goImport'>" + ic("ul") + "Importer</button>";
    h += "<a class='btn mag' href='#/studio'>" + ic("spark") + "Studio fond</a></div></div>";

    var kpis = [["db", "MARQUES", c.b, "#25D4EE"], ["car", "MODÈLES", c.m, "#4D8DFF"], ["piston", "MOTORISATIONS", c.e, "#E45CFF"], ["alert", "PANNES", c.f, "#FF4D5E"], ["bell", "RAPPELS", c.rc, "#FFAF2E"], ["wrench", "PLANS", c.p, "#43E08B"]];
    h += "<div class='kpis'>";
    for (i = 0; i < kpis.length; i++) h += "<div class='card kpi rv' style='--d:" + (i + 1) + ";--kc:" + kpis[i][3] + "'>" + ic(kpis[i][0]) + "<b data-count='" + kpis[i][2] + "'>0</b><span>" + kpis[i][1] + "</span></div>";
    h += "</div>";

    h += "<div class='g2'><div class='card panel rv' style='--d:7'><h3>" + ic("bolt") + "Énergies<span class='chip'>" + fmt(tot) + "</span></h3>";
    h += "<div class='dwrap'><svg class='donut' viewBox='0 0 150 150'><g transform='rotate(-90 75 75)'>";
    for (i = 0; i < segs.length; i++) h += "<circle cx='75' cy='75' r='" + R + "' stroke='" + FU[segs[i].f].c + "' stroke-dasharray='0 " + C + "' data-seg='" + segs[i].len + " " + (C - segs[i].len) + "' stroke-dashoffset='" + segs[i].off + "'/>";
    h += "</g><text x='75' y='72' text-anchor='middle' class='c1'>" + fmt(tot) + "</text><text x='75' y='88' text-anchor='middle' class='c2'>MOTEURS</text></svg>";
    h += "<div class='leg'>";
    for (i = 0; i < segs.length; i++) h += "<div class='li'><i style='background:" + FU[segs[i].f].c + "'></i>" + FU[segs[i].f].l + "<b>" + segs[i].n + "</b><small>" + Math.round(segs[i].n / tot * 100) + "%</small></div>";
    h += "</div></div></div>";

    h += "<div class='card panel rv' style='--d:8'><h3>" + ic("alert") + "Sévérité des pannes</h3><div class='bars'>";
    for (i = 0; i < sc.length; i++) h += "<div class='brow'><span class='bl'>" + sc[i].s.toUpperCase() + "</span><div class='bt'><i data-w='" + Math.round(sc[i].n / sm * 100) + "%' style='--bc:" + SV[sc[i].s].c + "'></i></div><b>" + sc[i].n + "</b></div>";
    h += "</div></div></div>";

    h += "<div class='g2'><div class='card panel rv' style='--d:9'><h3>" + ic("alert", "color:#FF4D5E") + "Alertes prioritaires</h3><div class='feed'>";
    for (i = 0; i < al.length; i++) h += "<button class='fi' data-act='openFault' data-id='" + al[i].id + "'><span class='fx'>" + ic("alert", "width:15px;height:15px") + "</span><span style='flex:1;min-width:0'><b>" + esc(al[i].t) + "</b><small>" + esc((al[i].fam || []).slice(0, 3).join(" · ")) + "</small></span>" + ic("chev", "width:14px;height:14px;color:#61748C") + "</button>";
    h += "</div></div>";

    h += "<div class='card panel rv' style='--d:10'><h3>" + ic("bell", "color:#FFAF2E") + "Campagnes de rappel</h3><div class='feed'>";
    for (i = 0; i < rc.length; i++) h += "<button class='fi r' data-act='openTsb' data-id='" + rc[i].id + "'><span class='fx'>" + ic("bell", "width:15px;height:15px") + "</span><span style='flex:1;min-width:0'><b>" + esc(rc[i].t) + "</b><small>" + esc(rc[i].ref) + " · " + esc(rc[i].date) + "</small></span>" + ic("chev", "width:14px;height:14px;color:#61748C") + "</button>";
    h += "</div></div></div>";

    h += "<div class='card panel rv' style='--d:11'><h3>" + ic("gauge") + "Familles sous vigilance<span class='chip'>TOP 8</span></h3><div class='bars'>";
    for (i = 0; i < top.length; i++) {
      var col = IVL(top[i].v)[1];
      h += "<div class='brow'><span class='bl'>" + esc(top[i].f) + " <span class='dim'>x" + top[i].n + "</span></span><div class='bt'><i data-w='" + top[i].v + "%' style='--bc:" + col + "'></i></div><b style='color:" + col + "'>" + top[i].v + "</b></div>";
    }
    h += "</div>";
    h += "<div class='savechip'><i></i>SAUVEGARDE AUTO ACTIVE</div></div>";
    return h;
  }

  function vExplorer() {
    var f = S.f, h = "", i;
    h += "<div class='vh rv'><div><span class='kick'>MODULE 02 — EXPLORATEUR</span><h1>PARC <i>2017 - 2027</i></h1></div></div>";
    h += "<div class='bstrip rv'>";
    for (i = 0; i < DB.brands.length; i++) {
      var b = DB.brands[i], n = META.byBrand[b.id] || 0;
      h += "<button class='btile " + (f.brand === b.id ? "on" : "") + "' data-act='fbrand' data-b='" + b.id + "'><b>" + esc(b.n) + "</b><small>" + n + " mot.</small></button>";
    }
    h += "</div>";
    h += "<div class='exwrap'><details class='card filters rv' open><summary>" + ic("filter") + "FILTRES</summary>";
    h += "<div class='fsec'><label class='lb'>Recherche</label><input class='inp' type='search' data-f='q' value='" + esc(f.q) + "'></div>";
    h += "<div class='fsec'><label class='lb'>Énergie</label><div class='chipset'>";
    var ks = Object.keys(FU);
    for (i = 0; i < ks.length; i++) h += "<button class='fc " + (f.fuels.indexOf(ks[i]) > -1 ? "on" : "") + "' style='--fc:" + FU[ks[i]].c + "' data-act='ffuel' data-k='" + ks[i] + "'>" + FU[ks[i]].l + "</button>";
    h += "</div></div>";
    h += "<div class='fsec'><label class='lb'>Marque</label><select class='sel' data-f='brand'><option value=''>Toutes</option>";
    for (i = 0; i < DB.brands.length; i++) h += "<option value='" + DB.brands[i].id + "' " + (f.brand === DB.brands[i].id ? "selected" : "") + ">" + esc(DB.brands[i].n) + "</option>";
    h += "</select></div></details>";
    h += "<div><div class='bar'><span class='cnt' id='resCount'>—</span><select class='sel' data-f='sort' style='margin-left:auto;width:auto'>";
    var so = [["brand", "Marque A-Z"], ["hpdesc", "Puissance déc."], ["year", "Année déc."], ["ivi", "Vigilance déc."]];
    for (i = 0; i < so.length; i++) h += "<option value='" + so[i][0] + "' " + (f.sort === so[i][0] ? "selected" : "") + ">" + so[i][1] + "</option>";
    h += "</select></div><div class='eg' id='resGrid'></div><div class='more' id='resMore'></div></div></div>";
    return h;
  }
  function refreshResults() {
    var g = $("#resGrid"); if (!g) return;
    var l = computeResults(), s = l.slice(0, S.shown);
    g.innerHTML = s.length ? s.map(engCard).join("") : "<div class='empty' style='grid-column:1/-1'>" + ic("search") + "<p>Aucun résultat.</p></div>";
    $("#resCount").textContent = fmt(l.length) + " motorisation(s)";
    $("#resMore").innerHTML = l.length > S.shown ? "<button class='btn ghost' data-act='more'>" + ic("dn") + "Plus (" + fmt(l.length - S.shown) + ")</button>" : "";
    mountAnim(g);
  }

  function vTech() {
    var L = S.tech, nr = DB.tsb.filter(isRecall).length, h = "";
    h += "<div class='vh rv'><div><span class='kick'>MODULE 03 — BIBLIOTHÈQUE TECHNIQUE</span><h1>PANNES · TSB · <i>RAPPELS</i></h1></div></div>";
    h += "<div class='atabs'>";
    h += "<button class='at " + (L.tab === "faults" ? "on" : "") + "' data-act='techTab' data-t='faults'>" + ic("alert", "width:14px;height:14px") + "PANNES<span class='n'>" + DB.faults.length + "</span></button>";
    h += "<button class='at " + (L.tab === "tsb" ? "on" : "") + "' data-act='techTab' data-t='tsb'>" + ic("file", "width:14px;height:14px") + "TSB<span class='n'>" + (DB.tsb.length - nr) + "</span></button>";
    h += "<button class='at " + (L.tab === "recalls" ? "on" : "") + "' data-act='techTab' data-t='recalls'>" + ic("bell", "width:14px;height:14px") + "RAPPELS<span class='n'>" + nr + "</span></button></div>";
    h += "<div class='bar'><input class='inp' style='max-width:300px' type='search' data-tf='q' value='" + esc(L.q) + "' placeholder='Titre, référence…'><span class='cnt' id='techCount' style='margin-left:auto'></span></div>";
    h += "<div id='techGrid' class='eg' style='grid-template-columns:repeat(auto-fill,minmax(330px,1fr))'></div>";
    return h;
  }
  function refreshTech() {
    var L = S.tech, g = $("#techGrid"); if (!g) return;
    var q = L.q.trim().toLowerCase(), html = "", n = 0, i;
    if (L.tab === "faults") {
      var l = DB.faults.filter(function (f) {
        if (L.sev && f.sev !== L.sev) return false;
        if (q && (f.t + " " + (f.fam || []).join(" ")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      n = l.length;
      for (i = 0; i < l.length; i++) html += "<div class='rv'>" + faultCard(l[i], false, false) + "</div>";
    } else {
      var lt = DB.tsb.filter(function (t) {
        var rc = isRecall(t);
        if (L.tab === "recalls" && !rc) return false;
        if (L.tab === "tsb" && rc) return false;
        if (q && (t.t + " " + t.ref).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      n = lt.length;
      for (i = 0; i < lt.length; i++) html += "<div class='rv'>" + tsbCard(lt[i], false) + "</div>";
    }
    g.innerHTML = html || "<div class='empty' style='grid-column:1/-1'>" + ic("search") + "<p>Aucun résultat.</p></div>";
    $("#techCount").textContent = n + " fiche(s)";
    mountAnim(g);
  }

  function planItems(q) {
    q = (q || "").toLowerCase();
    var h = "";
    for (var i = 0; i < DB.maint.length; i++) {
      var p = DB.maint[i];
      var hay = (p.name + " " + (p.fam || []).join(" ")).toLowerCase();
      if (q && hay.indexOf(q) < 0) continue;
      h += "<button class='pitem " + (p.id === S.plan ? "on" : "") + "' data-act='selPlan' data-id='" + p.id + "'><b>" + esc(p.name) + "</b><small>" + esc((p.fam || []).slice(0, 4).join(" / ") || "—") + "</small></button>";
    }
    return h || "<div class='empty'>Aucun plan</div>";
  }
  function dueRows(p, km, yr, sev) {
    var now = new Date(), age = Math.max(1, (now.getFullYear() - yr) * 12 + now.getMonth()), rows = [];
    var add = function (op, ikm, imo) {
      ikm = Math.round(ikm * sev);
      if (ikm > 0) {
        var nx = Math.max(ikm, Math.ceil((km + 1) / ikm) * ikm), rm = nx - km;
        var pc = clamp((ikm - rm) / ikm * 100, 0, 100), bd, cl;
        if (rm <= 1500) { bd = "ÉCHÉANCE PROCHE"; cl = "now"; }
        else if (rm <= ikm * 0.2) { bd = "BIENTÔT"; cl = "soon"; }
        else { bd = "DANS " + fmt(rm) + " KM"; cl = "ok"; }
        rows.push({ op: op, badge: bd, cls: cl, pct: pc, detail: "Prochaine : " + fmt(nx) + " km", u: rm / ikm });
      } else if (imo > 0) {
        var n2 = Math.ceil(age / imo) * imo, d2 = new Date(yr, 0);
        d2.setMonth(d2.getMonth() + n2);
        var r2 = n2 - age, b2, c2;
        if (r2 <= 1) { b2 = "À FAIRE"; c2 = "now"; }
        else if (r2 <= 3) { b2 = "BIENTÔT"; c2 = "soon"; }
        else { b2 = "DANS " + r2 + " MOIS"; c2 = "ok"; }
        rows.push({ op: op, badge: b2, cls: c2, pct: clamp((imo - r2) / imo * 100, 0, 100), detail: String(d2.getMonth() + 1).padStart(2, "0") + "/" + d2.getFullYear(), u: r2 / imo });
      } else {
        rows.push({ op: op, badge: "SELON CONSTRUCTEUR", cls: "ok", pct: 0, detail: "Contrôle", u: 2 });
      }
    };
    for (var i = 0; i < p.items.length; i++) add(p.items[i][0], p.items[i][1], p.items[i][2]);
    if (p.dist && p.dist[1]) add("Distribution : " + p.dist[0], p.dist[1], p.dist[2]);
    rows.sort(function (a, b) { return a.u - b.u; });
    return rows;
  }
  function refreshCalc() {
    var b = $("#dueList"); if (!b) return;
    var p = null;
    for (var i = 0; i < DB.maint.length; i++) if (DB.maint[i].id === S.plan) p = DB.maint[i];
    if (!p) { b.innerHTML = ""; return; }
    var rows = dueRows(p, clamp(+S.calc.km || 0, 0, 999999), clamp(+S.calc.year || 2021, 2010, YMAX), +S.calc.sev || 1);
    var h = "";
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var dc = r.cls === "now" ? "#FF4D5E" : (r.cls === "soon" ? "#FFAF2E" : "#43E08B");
      h += "<div class='drow' style='--dc:" + dc + "'><div class='dr1'><b>" + esc(r.op) + "</b><span class='dbadge " + r.cls + "'>" + r.badge + "</span></div>";
      h += "<div class='pb'><i style='width:" + Math.round(r.pct) + "%'></i></div>";
      h += "<div class='dim mono' style='font-size:10px;margin-top:5px'>" + esc(r.detail) + "</div></div>";
    }
    b.innerHTML = h;
  }
  function vEntretien() {
    var p = null, i;
    for (i = 0; i < DB.maint.length; i++) if (DB.maint[i].id === S.plan) p = DB.maint[i];
    if (!p) { S.plan = DB.maint.length ? DB.maint[0].id : null; p = DB.maint[0] || null; }
    var h = "";
    h += "<div class='vh rv'><div><span class='kick'>MODULE 04 — ENTRETIEN</span><h1>PLANS <i>& ÉCHÉANCES</i></h1></div></div>";
    h += "<div class='mwrap'><div class='card plist rv'><input class='inp' type='search' id='planSearch' placeholder='Filtrer les plans…'><div id='planItems'>" + planItems("") + "</div></div>";
    h += "<div><div class='card panel rv'><h3>" + ic("wrench") + esc(p ? p.name : "—") + "</h3>" + (p ? planMini(p) : "") + "</div>";
    h += "<div class='calc rv'><h3>" + ic("cal") + "CALCULATEUR</h3><div class='fr f3'>";
    h += "<div><label class='lb'>Kilométrage</label><input class='inp mono' type='number' min='0' max='999999' data-calc='km' value='" + S.calc.km + "'></div>";
    h += "<div><label class='lb'>Année</label><input class='inp mono' type='number' min='2010' max='" + YMAX + "' data-calc='year' value='" + S.calc.year + "'></div>";
    h += "<div><label class='lb'>Profil</label><select class='sel' data-calc='sev'><option value='1'>Normal</option><option value='0.75'>Sévère</option></select></div>";
    h += "</div><div class='due' id='dueList'></div></div></div></div>";
    return h;
  }

  function vStudio() {
    var P = WP.P, i;
    var h = "";
    h += "<div class='vh rv'><div><span class='kick'>MODULE 05 — STUDIO FOND D ÉCRAN</span><h1>FONDS <i>DYNAMIQUES</i></h1><div class='sub'>10 scènes animées, palette pilotable, vitesse et sens de défilement réglables. Aperçu live et export PNG.</div></div>";
    h += "<div style='display:flex;gap:8px;flex-wrap:wrap'><button class='btn sm ghost' data-act='stRandom'>" + ic("dice") + "Aléatoire</button>";
    h += "<button class='btn sm ghost' data-act='stReset'>" + ic("reset") + "Réinitialiser</button>";
    h += "<button class='btn sm pri' data-act='stPng'>" + ic("cam") + "Export PNG</button></div></div>";

    h += "<div class='stwrap'><div class='card stage rv'><div class='screen' id='screen'><canvas id='pv'></canvas><div class='fx'><div class='v'></div><div class='g'></div></div><div class='hud' id='hud'></div></div>";
    h += "<div class='stagebar'><button class='btn sm " + (P.run ? "amb" : "ghost") + "' data-act='stRun'>" + ic(P.run ? "pause" : "play") + (P.run ? "Pause" : "Lecture") + "</button>";
    h += "<button class='btn sm ghost' data-act='stDir'>" + ic("reset") + (P.dir > 0 ? "Sens : avant" : "Sens : arrière") + "</button>";
    h += "<span class='chip' style='margin-left:auto'>" + (window.MD_hasP2D ? "Path2D OK" : "Path2D absent") + "</span></div>";
    h += "<div class='psrow' style='margin-top:11px'>";
    var pk = Object.keys(WP.PRESETS);
    for (i = 0; i < pk.length; i++) h += "<button data-act='stPreset' data-n='" + esc(pk[i]) + "'>" + esc(pk[i]) + "</button>";
    h += "</div></div>";

    h += "<div class='card ctrl rv'><h3>" + ic("spark") + "RÉGLAGES LIVE</h3>";
    h += "<div class='csec'><label class='lb'>Scène animée</label><div class='mgrid'>";
    for (i = 0; i < WP.MODES.length; i++) {
      var m = WP.MODES[i];
      h += "<button class='mb " + (P.mode === m[0] ? "on" : "") + "' data-act='stMode' data-m='" + m[0] + "'><i style='background:linear-gradient(135deg," + WP.pal().a + "," + WP.pal().b + ")'></i>" + m[1] + "</button>";
    }
    h += "</div></div>";

    h += "<div class='csec'><label class='lb'>Palette prédéfinie</label><div class='pgrid'>";
    var tk = Object.keys(WP.TH);
    for (i = 0; i < tk.length; i++) {
      var v = WP.TH[tk[i]];
      h += "<button class='pb " + (!P.useCustom && P.theme === tk[i] ? "on" : "") + "' data-act='stTheme' data-t='" + tk[i] + "' title='" + esc(v.n) + "' style='background:linear-gradient(135deg," + v.a + "," + v.b + "," + v.c + ")'></button>";
    }
    h += "</div>";
    h += "<div class='srow' style='margin-top:8px'><span>Palette personnalisée</span><label class='sw'><input type='checkbox' id='customToggle' data-act='stCustom' " + (P.useCustom ? "checked" : "") + "><i></i></label></div>";
    h += "<div class='crow' style='margin-top:8px'>";
    var cks = [["bg", "Fond"], ["a", "Dominante"], ["b", "Accent 1"], ["c", "Accent 2"], ["d", "Accent 3"]];
    for (i = 0; i < cks.length; i++) h += "<div><label>" + cks[i][1] + "</label><input type='color' data-c='" + cks[i][0] + "' value='" + P.custom[cks[i][0]] + "'></div>";
    h += "</div></div>";

    var sliders = [
      ["speed", "Vitesse de défilement", 0, 200, 5],
      ["density", "Densité", 0, 100, 1],
      ["count", "Particules", 10, 400, 5],
      ["turb", "Turbulence", 0, 100, 1],
      ["scale", "Échelle / grille", 20, 160, 2],
      ["glow", "Halo lumineux", 0, 100, 1],
      ["blur", "Flou", 0, 8, 0.5],
      ["stroke", "Épaisseur trait", 0.5, 4, 0.1],
      ["drift", "Dérive caméra", 0, 100, 1]
    ];
    h += "<div class='csec'>";
    for (i = 0; i < sliders.length; i++) {
      var s = sliders[i];
      h += "<div><div class='srow'><span>" + s[1] + "</span><span class='sval' data-pv='" + s[0] + "'>" + WP.label(s[0], P[s[0]]) + "</span></div>";
      h += "<input type='range' data-p='" + s[0] + "' min='" + s[2] + "' max='" + s[3] + "' step='" + s[4] + "' value='" + P[s[0]] + "'></div>";
    }
    h += "</div>";

    h += "<div class='csec'><div class='fr f2'>";
    h += "<div><label class='lb'>Sens</label><select class='sel' data-p='dir'><option value='1' " + (P.dir > 0 ? "selected" : "") + ">Avant</option><option value='-1' " + (P.dir < 0 ? "selected" : "") + ">Arrière</option></select></div>";
    h += "<div><label class='lb'>Qualité</label><select class='sel' data-p='quality'><option value='eco' " + (P.quality === "eco" ? "selected" : "") + ">Éco 1x</option><option value='std' " + (P.quality === "std" ? "selected" : "") + ">Standard 1.5x</option><option value='ultra' " + (P.quality === "ultra" ? "selected" : "") + ">Ultra 2x</option></select></div>";
    h += "</div><div style='margin-top:9px'><label class='lb'>Format export</label><select class='sel' data-p='format'><option value='free' " + (P.format === "free" ? "selected" : "") + ">1600x900</option><option value='mobile' " + (P.format === "mobile" ? "selected" : "") + ">1170x2532</option><option value='tablet' " + (P.format === "tablet" ? "selected" : "") + ">1668x2224</option><option value='desktop' " + (P.format === "desktop" ? "selected" : "") + ">1920x1080</option></select></div></div>";

    h += "<div class='csec'>";
    var toggles = [["grid", "Grille & repères"], ["grain", "Grain"], ["scan", "Balayage"], ["vig", "Vignettage"], ["run", "Animation"], ["bg", "Fond global"]];
    for (i = 0; i < toggles.length; i++) h += "<div class='srow'><span>" + toggles[i][1] + "</span><label class='sw'><input type='checkbox' data-p='" + toggles[i][0] + "' " + (P[toggles[i][0]] ? "checked" : "") + "><i></i></label></div>";
    h += "</div></div></div>";
    return h;
  }
  function applyFormat() {
    var s = $("#screen"); if (!s) return;
    var F = { free: ["100%", 340], mobile: ["300px", 560], tablet: ["440px", 520], desktop: ["100%", 380] }[WP.P.format] || ["100%", 340];
    s.style.maxWidth = F[0]; s.style.height = F[1] + "px";
    setTimeout(function () { WP.resize(); }, 80);
  }

  function vDonnees() {
    var h = "", i;
    if (!isAdm()) {
      h += "<div class='card lockc rv' id='lockCard'><div class='sh'>" + ic("lock") + "</div>";
      h += "<span class='kick' style='justify-content:center'>ACCÈS RESTREINT</span><h2>FICHIERS CROISÉS</h2>";
      h += "<p>Import et administration réservés à la session <b class='mono' style='color:#FFAF2E'>NIVEAU 3</b>.</p>";
      h += "<form data-form='unlock'><input class='inp' type='password' name='pwd' placeholder='MOT DE PASSE' autocomplete='current-password'>";
      h += "<button class='btn amb' type='submit' id='unlockBtn'>" + ic("unlock") + "DÉVERROUILLER</button></form>";
      h += "<p class='dim mono' style='font-size:9.5px;margin-top:14px' id='lockMsg'>STOCKAGE : " + (STORE.local ? "localStorage actif" : "mode mémoire") + "</p></div>";
      return h;
    }
    h += "<div class='vh rv'><div><span class='kick'>MODULE 06 — ADMINISTRATION ING-3</span><h1>FICHIERS <i>CROISÉS</i></h1><div class='sub'>Import multi-formats (JSON, CSV, TSV, XML, YAML, XLSX, ODS, HTML, JS) — fusion sans doublon, sauvegarde automatique.</div></div>";
    h += "<div style='display:flex;gap:8px'><span class='chip warn'>" + ic("shield", "width:12px;height:12px") + "ING-3</span><button class='btn sm ghost' data-act='logout'>" + ic("lock") + "Verrouiller</button></div></div>";
    h += "<div class='fgrid2'>";
    for (i = 0; i < FILES.length; i++) {
      var a = DB[FILES[i][0]], k = Math.round(JSON.stringify(a).length / 1024);
      h += "<div class='card hov filecard rv' style='--d:" + i + "'><div class='fn'>" + ic("file") + FILES[i][1] + "</div>";
      h += "<div class='ct'>" + fmt(a.length) + " <small>entrées</small></div><div class='fs'>" + k + " Ko · " + FILES[i][2] + "</div>";
      h += "<div class='fa'><button class='btn xs ghost' data-act='fileExp' data-k='" + FILES[i][0] + "'>" + ic("dl", "width:12px;height:12px") + "JSON</button>";
      h += "<button class='btn xs amb' data-act='goImport'>" + ic("ul", "width:12px;height:12px") + "Importer</button></div></div>";
    }
    h += "</div>";
    h += "<div class='tools'><button class='btn pri sm' data-act='goImport'>" + ic("ul") + "Import universel</button>";
    h += "<button class='btn ghost sm' data-act='expAll'>" + ic("dl") + "Exporter tout</button>";
    h += "<button class='btn ghost sm' data-act='saveNow'>" + ic("save") + "Sauvegarder maintenant</button>";
    h += "<button class='btn ghost sm' data-act='integrity'>" + ic("check") + "Intégrité</button>";
    h += "<button class='btn dgr sm' data-act='askReset'>" + ic("reset") + "Base usine</button></div>";
    h += "<div class='card panel'><h3>" + ic("clock") + "Journal</h3><div class='journal'>";
    var rev = AUDIT.slice().reverse().slice(0, 40);
    for (i = 0; i < rev.length; i++) {
      var d = new Date(rev[i].ts);
      h += "<div class='jr " + rev[i].type + "'><time>" + d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR") + "</time><span class='jt'>" + rev[i].type.toUpperCase() + "</span><span>" + esc(rev[i].msg) + "</span></div>";
    }
    h += "</div></div>";
    return h;
  }

  function vDiag() {
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    var wn = TESTS.filter(function (t) { return !t.ok && t.soft; }).length;
    var col = fl ? "#FF4D5E" : (wn ? "#FFAF2E" : "#43E08B");
    var h = "";
    h += "<div class='vh rv'><div><span class='kick'>MODULE 07 — AUTOVÉRIFICATION</span><h1>DIAGNOSTIC <i>SYSTÈME</i></h1></div>";
    h += "<div style='display:flex;gap:8px'><button class='btn sm grn' data-act='runTests'>" + ic("reset") + "Relancer</button>";
    h += "<button class='btn sm amb' data-act='autoFix'>" + ic("tool") + "Auto-réparation</button></div></div>";
    h += "<div class='card panel rv' style='margin-bottom:14px;border-left:3px solid " + col + "'><h3>" + ic("stetho", "color:" + col) + "Résultat<span class='chip' style='color:" + col + ";border-color:" + col + "'>" + (TESTS.length - fl) + "/" + TESTS.length + " OK</span></h3>";
    h += "<p class='muted'>" + (fl ? "<b style='color:#FF4D5E'>" + fl + " test(s) bloquant(s).</b>" : "<b style='color:#43E08B'>Système opérationnel.</b>");
    if (wn) h += " " + wn + " avertissement(s) non bloquant(s).";
    h += "</p></div>";
    h += "<div class='card panel rv'><h3>" + ic("check") + "Détail</h3><div class='tests'>";
    for (var i = 0; i < TESTS.length; i++) {
      var t = TESTS[i];
      var c = t.ok ? "#43E08B" : (t.soft ? "#FFAF2E" : "#FF4D5E");
      h += "<div class='tst' style='--tc:" + c + "'><span class='ti'>" + (t.ok ? "OK" : (t.soft ? "!" : "X")) + "</span><div style='flex:1'><b>" + esc(t.n) + "</b><small>" + esc(t.info) + "</small></div></div>";
    }
    h += "</div></div>";
    return h;
  }

  function render() {
    var v = S.view, m = $("#view");
    if (v !== "studio") WP.detach();
    $$(".nv,#tabs a").forEach(function (a) { a.classList.toggle("on", a.dataset.v === v); });
    var h = "";
    try {
      if (v === "bord") h = vBord();
      else if (v === "explorer") h = vExplorer();
      else if (v === "tech") h = vTech();
      else if (v === "entretien") h = vEntretien();
      else if (v === "studio") h = vStudio();
      else if (v === "diagnostic") h = vDiag();
      else h = vDonnees();
    } catch (e) {
      logErr("render " + v, e);
      h = "<div class='card panel'><h3>" + ic("alert") + "Erreur de rendu</h3><p class='muted'>" + esc(e.message) + "</p></div>";
    }
    m.innerHTML = h;
    mountAnim(m);
    updateMeta();
    if (v === "explorer") refreshResults();
    if (v === "tech") refreshTech();
    if (v === "entretien") refreshCalc();
    if (v === "studio") {
      var cv = $("#pv");
      if (cv) { WP.attach(cv); applyFormat(); WP.fx(); WP.sync(); }
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
    $("#nTest").textContent = TESTS.length ? (fl ? "!" : "OK") : "—";
    $("#diagb").classList.toggle("on", TESTS.length > 0 && fl === 0);
    $("#ichip").className = "chip " + (META.integ.ok ? (META.integ.warn.length ? "warn" : "ok") : "bad");
    $("#itxt").textContent = META.integ.ok ? (META.integ.warn.length ? "INTÈGRE · " + META.integ.warn.length + " AVERT." : "INTÈGRE") : "ERREURS " + META.integ.err.length;
    var a = isAdm();
    $("#admb").classList.toggle("on", a);
    $("#admb").innerHTML = ic(a ? "unlock" : "lock");
    $("#rtxt").textContent = a ? "Session ING-3 active — import déverrouillé." : "Session invité — lecture et recherche.";
    $("#sndb").innerHTML = ic(PREF.sound ? "snd" : "mute");
    $("#sndb").classList.toggle("on", PREF.sound);
    updStor();
  }

  /* ══════════ IMPORT MULTI-FORMATS (admin) ══════════ */
  function pick(rec, names) {
    var i;
    for (i = 0; i < names.length; i++) {
      var v = rec[names[i]];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    var map = {}, ks = Object.keys(rec);
    for (i = 0; i < ks.length; i++) map[nk(ks[i])] = rec[ks[i]];
    for (i = 0; i < names.length; i++) {
      var w = nk(names[i]);
      if (map[w] !== undefined && map[w] !== null && map[w] !== "") return map[w];
    }
    return undefined;
  }
  var FUELMAP = { e: "e", essence: "e", gasoline: "e", petrol: "e", d: "d", diesel: "d", gozole: "d", h: "h", hybride: "h", hybrid: "h", hev: "h", p: "p", phev: "p", rechargeable: "p", b: "b", ev: "b", bev: "b", electrique: "b", electric: "b", g: "g", gpl: "g", lpg: "g" };
  function fuelNorm(v) {
    var k = nk(v);
    if (FUELMAP[k]) return FUELMAP[k];
    if (FU[k]) return k;
    if (k.indexOf("recharge") > -1) return "p";
    if (k.indexOf("electr") > -1 || k === "ev" || k === "bev") return "b";
    if (k.indexOf("hybr") > -1) return "h";
    if (k.indexOf("dies") > -1) return "d";
    if (k.indexOf("gpl") > -1) return "g";
    return "e";
  }
  var SEVMAP = { critique: "critique", critical: "critique", majeure: "majeure", major: "majeure", moderee: "modérée", moderate: "modérée", moyenne: "modérée", mineure: "mineure", minor: "mineure", info: "info", note: "info", faible: "mineure" };
  function sevNorm(v) {
    var k = nk(v);
    if (SEVMAP[k]) return SEVMAP[k];
    if (SV[v]) return v;
    if (SV[k]) return k;
    return "modérée";
  }
  var COLL = {};
  [["brands", ["brands", "marques", "constructeurs", "makers", "manufacturers"]],
   ["models", ["models", "modeles", "vehicles", "vehicules", "cars"]],
   ["engines", ["engines", "motorisations", "moteurs", "powertrains", "motorizations"]],
   ["faults", ["faults", "pannes", "fiches", "defects", "problemes", "defauts"]],
   ["tsb", ["tsb", "bulletins", "campagnes", "rappels", "recalls", "campaigns"]],
   ["maint", ["maint", "maintenance", "plans", "entretien", "revisions", "services"]]]
    .forEach(function (p) { p[1].forEach(function (k) { COLL[nk(k)] = p[0]; }); });
  var IGNOREKEYS = { counts: 1, domains: 1, domaines: 1, categories: 1, meta: 1, metadata: 1, app: 1, exportversion: 1, exportedat: 1, version: 1 };

  function detectKind(r) {
    if (!r || typeof r !== "object") return null;
    if (pick(r, ["hp", "power", "puissance", "ch", "puissance_ch", "kw"]) !== undefined) return "engines";
    if (pick(r, ["code_moteur", "engine_code", "motor_code"]) !== undefined) return "engines";
    if (pick(r, ["items", "operations", "ops", "interventions"]) !== undefined) return "maint";
    if (pick(r, ["huile", "oil"]) !== undefined) return "maint";
    if (pick(r, ["ref", "reference", "numero"]) !== undefined && pick(r, ["date", "date_revision", "published"]) !== undefined) return "tsb";
    if (pick(r, ["sev", "severity", "severite", "gravite", "criticite"]) !== undefined) return "faults";
    if (pick(r, ["segment", "carrosserie"]) !== undefined) return "models";
    if (pick(r, ["marque", "brand", "make"]) !== undefined && pick(r, ["modele", "model", "nom", "name"]) !== undefined) return "models";
    if (pick(r, ["pays", "country"]) !== undefined) return "brands";
    return null;
  }
  function classifyBundle(data) {
    var groups = {}, ignored = [];
    function consider(key, arr) {
      if (IGNOREKEYS[key]) { ignored.push(key); return; }
      var k = COLL[key] || null;
      if (!k && arr.length) k = detectKind(arr[0]);
      if (!k) { ignored.push(key); return; }
      if (!groups[k]) groups[k] = [];
      groups[k] = groups[k].concat(arr);
    }
    function scan(obj) {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
      var ks = Object.keys(obj);
      for (var i = 0; i < ks.length; i++) {
        var v = obj[ks[i]], key = nk(ks[i]);
        if (Array.isArray(v)) { if (v.length) consider(key, v); }
        else if (v && typeof v === "object") scan(v);
      }
    }
    scan(data);
    return { groups: groups, ignored: ignored };
  }

  function mapRecord(rec, kind) {
    if (kind === "brands") {
      var n = pick(rec, ["n", "name", "nom", "label", "marque", "brand", "make"]);
      if (!n) throw "nom manquant";
      return { id: String(pick(rec, ["id", "uid", "key"]) || ("B-" + slug(n))).trim(), n: String(n).trim(), pays: String(pick(rec, ["pays", "country", "origine"]) || "—"), grp: String(pick(rec, ["grp", "group", "alliance"]) || "—") };
    }
    if (kind === "models") {
      var mn = pick(rec, ["n", "name", "nom", "model", "modele", "label", "title"]);
      if (!mn) throw "nom manquant";
      var br = pick(rec, ["b", "brand", "marque", "make"]);
      if (br === undefined || br === null || br === "") throw "marque manquante";
      return { id: String(pick(rec, ["id", "uid", "key"]) || ("M-" + slug(br) + "-" + slug(mn))).trim(), b: String(br).trim(), bRaw: String(br).trim(), n: String(mn).trim(), y: [2017, YMAX], seg: String(pick(rec, ["seg", "segment", "category", "carrosserie"]) || "Compacte") };
    }
    if (kind === "engines") {
      var code = pick(rec, ["code", "code_moteur", "engine_code", "motor_code"]);
      if (!code) throw "code manquant";
      var fam = pick(rec, ["fam", "family", "famille", "platform"]);
      if (!fam) throw "famille manquante";
      var lab = pick(rec, ["label", "name", "nom", "designation", "libelle"]);
      if (!lab) throw "libellé manquant";
      var fu = fuelNorm(pick(rec, ["fuel", "energie", "carburant", "energy"]));
      var hp = Number(pick(rec, ["hp", "power", "puissance", "ch", "puissance_ch"]) || 0);
      var kw = Number(pick(rec, ["kw", "power_kw", "puissance_kw"]) || 0);
      if (!hp && kw) hp = Math.round(kw * 1.3596);
      if (!(hp > 0 && hp <= 3000)) throw "puissance invalide";
      var mr = split(pick(rec, ["m", "models", "modeles", "modele", "model", "vehicle"]));
      if (!mr.length) {
        var mb = pick(rec, ["marque", "brand", "make"]), mo = pick(rec, ["modele", "model", "vehicule"]);
        if (mb && mo) mr = [String(mb) + " " + String(mo)];
        else if (mo) mr = [String(mo)];
      }
      if (!mr.length) throw "aucun modèle lié";
      return { id: "", m: [], mRaw: mr, code: String(code).trim(), fam: String(fam).trim(), label: String(lab).trim(), fuel: fu, disp: Number(pick(rec, ["disp", "cylindree", "cm3"]) || 0), hp: Math.round(hp), nm: Number(pick(rec, ["nm", "torque", "couple"]) || 0), kw: Math.round(hp * 0.7355), y: [2017, YMAX], gb: String(pick(rec, ["gb", "boite", "transmission", "gearbox"]) || "BVM").trim(), norm: "Euro 6", cyl: fu === "b" ? "ÉLEC" : "L4", asp: "Turbo", inj: fu === "b" ? "—" : (fu === "d" ? "Common Rail" : "Injection directe"), note: "" };
    }
    if (kind === "faults") {
      var t = pick(rec, ["t", "title", "titre", "name", "nom", "panne"]);
      if (!t) throw "titre manquant";
      var c0 = Number(pick(rec, ["cost0", "cout_min", "cost_min"]) || 0);
      var c1 = Number(pick(rec, ["cost1", "cout_max", "cost_max"]) || c0);
      return { id: "", t: String(t).trim(), fam: split(pick(rec, ["fam", "families", "familles", "moteurs"])), sev: sevNorm(pick(rec, ["sev", "severity", "severite", "gravite", "criticite"])), freq: (FQ[pick(rec, ["freq", "frequence"])] ? pick(rec, ["freq", "frequence"]) : "moyenne"), y: [2017, YMAX], km: [Number(pick(rec, ["km0", "km_min"]) || 0), Number(pick(rec, ["km1", "km_max"]) || 0)], sym: split(String(pick(rec, ["sym", "symptoms", "symptomes"]) || "").replace(/\n/g, "|")), cause: String(pick(rec, ["cause", "origine"]) || ""), fix: String(pick(rec, ["fix", "solution", "action", "reparation"]) || ""), cost: [c0, Math.max(c0, c1)], m: [], gb: [], e: [], fuel: "", status: String(pick(rec, ["status", "statut"]) || "Surveillance") };
    }
    if (kind === "tsb") {
      var tr = pick(rec, ["ref", "reference", "numero"]);
      if (!tr) throw "référence manquante";
      var tt = pick(rec, ["t", "title", "titre", "nom", "objet"]);
      if (!tt) throw "titre manquant";
      return { id: "", ref: String(tr).trim(), b: split(pick(rec, ["b", "brands", "marques"])), bRaw: split(pick(rec, ["b", "brands", "marques"])), fam: split(pick(rec, ["fam", "families", "familles"])), t: String(tt).trim(), date: String(pick(rec, ["date", "published"]) || "2026-01").slice(0, 7), cat: String(pick(rec, ["cat", "category", "categorie"]) || "Moteur"), sev: sevNorm(pick(rec, ["sev", "severity", "severite"])), sum: String(pick(rec, ["sum", "summary", "resume", "description"]) || ""), act: String(pick(rec, ["act", "action", "procedure"]) || ""), m: [], gb: [] };
    }
    if (kind === "maint") {
      var pn = pick(rec, ["name", "nom", "titre", "plan"]);
      if (!pn) throw "nom manquant";
      var raw = pick(rec, ["items", "operations", "ops", "services"]);
      var it = [];
      if (Array.isArray(raw)) {
        for (var i = 0; i < raw.length; i++) {
          var x = raw[i];
          if (Array.isArray(x)) it.push([String(x[0] || ""), Number(x[1] || 0), Number(x[2] || 0)]);
          else it.push([String(pick(x, ["op", "operation", "label", "nom"]) || ""), Number(pick(x, ["km"]) || 0), Number(pick(x, ["mo", "mois"]) || 0)]);
        }
      }
      it = it.filter(function (z) { return z[0]; });
      if (!it.length) throw "aucune opération";
      return { id: "", name: String(pn).trim(), fam: split(pick(rec, ["fam", "families", "familles"])), fuel: "", oil: null, dist: null, base: [15000, 12], items: it, note: String(pick(rec, ["note"]) || ""), extra: null };
    }
    throw "type inconnu";
  }

  function resolveAll(groups) {
    var warn = [], drop = [], newB = [], newM = [];
    var bIdx = {}, bName = {}, mIdx = {}, mName = {}, seen = {};
    DB.brands.forEach(function (b) { bIdx[b.id] = b.id; bName[nk(b.n)] = b.id; });
    DB.models.forEach(function (m) { mIdx[m.id] = m.id; mName[nk(m.n)] = m.id; });
    function uniqId(kind, base) {
      var id = base, i = 2;
      while (seen[kind + ":" + id] || DB[kind].some(function (x) { return x.id === id; })) { id = base + "-" + i; i++; }
      seen[kind + ":" + id] = 1;
      return id;
    }
    function brandId(raw) {
      if (raw === undefined || raw === null || raw === "") return null;
      var r = String(raw).trim();
      if (bIdx[r]) return bIdx[r];
      var l = nk(r);
      if (bName[l]) return bName[l];
      var id = uniqId("brands", "B-" + slug(r));
      bIdx[id] = id; bName[l] = id;
      newB.push({ id: id, n: r, pays: "—", grp: "—" });
      warn.push("marque auto-créée : " + r);
      return id;
    }
    function modelId(raw) {
      var r = String(raw == null ? "" : raw).trim();
      if (!r) return null;
      if (mIdx[r]) return mIdx[r];
      var l = nk(r);
      if (mName[l]) return mName[l];
      var bid = null, rest = r;
      var ks = Object.keys(bName);
      for (var i = 0; i < ks.length; i++) {
        if (!bid && l.indexOf(ks[i]) === 0 && l.length > ks[i].length + 2) {
          bid = bName[ks[i]];
          rest = r.slice(ks[i].length).replace(/^[\s\-:]+/, "");
        }
      }
      bid = bid || brandId("Import");
      var id = uniqId("models", "M-" + slug(rest || r));
      mIdx[id] = id; mName[nk(rest || r)] = id;
      newM.push({ id: id, b: bid, n: rest || r, y: [2017, YMAX], seg: "Compacte" });
      warn.push("modèle auto-créé : " + (rest || r));
      return id;
    }
    var out = { brands: [], models: [], engines: [], faults: [], tsb: [], maint: [] };
    (groups.brands || []).forEach(function (r) {
      r.id = r.id || uniqId("brands", "B-" + slug(r.n));
      bIdx[r.id] = r.id;
      bName[nk(r.n)] = bName[nk(r.n)] || r.id;
      out.brands.push(r);
    });
    (groups.models || []).forEach(function (r) {
      var b = brandId(r.bRaw !== undefined ? r.bRaw : r.b);
      if (!b) { drop.push("models : " + r.n); return; }
      r.b = b;
      r.id = r.id || uniqId("models", "M-" + slug(b) + "-" + slug(r.n));
      mIdx[r.id] = r.id; mName[nk(r.n)] = mName[nk(r.n)] || r.id;
      out.models.push(r);
    });
    (groups.engines || []).forEach(function (r) {
      var ms = (r.mRaw || []).map(modelId).filter(Boolean);
      if (!ms.length) { drop.push("engines : " + r.label); return; }
      r.m = ms; delete r.mRaw;
      r.id = r.id || uniqId("engines", "E-" + slug(r.code) + "-" + slug(r.label));
      out.engines.push(r);
    });
    (groups.faults || []).forEach(function (r) { r.id = r.id || uniqId("faults", "F-" + slug(r.t)); out.faults.push(r); });
    (groups.tsb || []).forEach(function (r) {
      r.b = (r.bRaw || r.b || []).map(brandId).filter(Boolean);
      delete r.bRaw;
      r.id = r.id || uniqId("tsb", "T-" + slug(r.ref));
      out.tsb.push(r);
    });
    (groups.maint || []).forEach(function (r) { r.id = r.id || uniqId("maint", "P-" + slug(r.name)); out.maint.push(r); });
    out.brands = newB.concat(out.brands);
    out.models = newM.concat(out.models);
    return { out: out, warn: warn, drop: drop };
  }

  var KEYFN = {
    brands: function (x) { return nk(x.n); },
    models: function (x) { return nk(x.b + "|" + x.n); },
    engines: function (x) { return nk(x.code + "|" + x.fam + "|" + x.label + "|" + x.hp); },
    faults: function (x) { return nk(x.t); },
    tsb: function (x) { return nk(x.ref || x.t); },
    maint: function (x) { return nk(x.name); }
  };
  function mergeInto(ex, rec) {
    var ks = Object.keys(rec);
    for (var i = 0; i < ks.length; i++) {
      var v = rec[ks[i]];
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) { if (v.length) ex[ks[i]] = v; }
      else ex[ks[i]] = v;
    }
  }
  function upsert(kind, rec) {
    var arr = DB[kind], ex = null, i;
    if (rec.id) for (i = 0; i < arr.length; i++) if (arr[i].id === rec.id) ex = arr[i];
    if (!ex) {
      var k = KEYFN[kind](rec);
      for (i = 0; i < arr.length; i++) if (KEYFN[kind](arr[i]) === k) ex = arr[i];
    }
    if (ex) { mergeInto(ex, rec); return "upd"; }
    if (!rec.id || arr.some(function (x) { return x.id === rec.id; })) rec.id = uid(kind.charAt(0).toUpperCase());
    arr.push(rec);
    return "add";
  }

  /* ── parseurs de formats ── */
  function parseDelimited(text) {
    var first = text.split(/\r?\n/)[0] || "";
    var counts = [[",", 0], [";", 0], ["\t", 0], ["|", 0]];
    for (var i = 0; i < counts.length; i++) {
      var re = new RegExp("\\" + counts[i][0], "g");
      counts[i][1] = (first.match(re) || []).length;
    }
    counts.sort(function (a, b) { return b[1] - a[1]; });
    var delim = counts[0][1] > 0 ? counts[0][0] : ",";
    var rows = [], row = [], cur = "", inQ = false;
    for (i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === delim) { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = "";
        if (row.some(function (x) { return x.trim() !== ""; })) rows.push(row);
        row = [];
      } else cur += c;
    }
    row.push(cur);
    if (row.some(function (x) { return x.trim() !== ""; })) rows.push(row);
    if (rows.length < 2) return [];
    var head = rows[0].map(function (x) { return x.trim().replace(/^\uFEFF/, ""); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (k, idx) { o[k] = r[idx] === undefined ? "" : r[idx]; });
      return o;
    });
  }
  function parseJSONL(text) {
    var out = [];
    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (!l) continue;
      try { out.push(JSON.parse(l)); } catch (e) {}
    }
    return out;
  }
  function parseXMLRecords(text) {
    var doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) throw "XML invalide";
    var root = doc.documentElement;
    var kids = [].slice.call(root.children);
    if (!kids.length) throw "XML vide";
    var tagCount = {};
    kids.forEach(function (k) { tagCount[k.tagName] = (tagCount[k.tagName] || 0) + 1; });
    var best = null, bestN = 0;
    Object.keys(tagCount).forEach(function (t) { if (tagCount[t] > bestN) { bestN = tagCount[t]; best = t; } });
    var out = [];
    kids.forEach(function (k) {
      if (k.tagName !== best) return;
      var o = {};
      [].slice.call(k.attributes).forEach(function (a) { o[a.name] = a.value; });
      [].slice.call(k.children).forEach(function (c) { o[c.tagName] = c.textContent.trim(); });
      if (!Object.keys(o).length) o[k.tagName] = k.textContent.trim();
      out.push(o);
    });
    return out;
  }
  function parseYAML(text) {
    var lines = text.split(/\r?\n/);
    var out = [], cur = null;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (!l.trim() || /^\s*#/.test(l)) continue;
      var m = l.match(/^\s*-\s*(.*)$/);
      if (m) {
        if (cur) out.push(cur);
        cur = {};
        var rest = m[1];
        var kv = rest.match(/^([^:]+):\s*(.*)$/);
        if (kv) cur[kv[1].trim()] = kv[2].trim();
        continue;
      }
      var kv2 = l.match(/^\s+([^:]+):\s*(.*)$/);
      if (kv2 && cur) { cur[kv2[1].trim()] = kv2[2].trim(); continue; }
      var kv3 = l.match(/^([^:]+):\s*(.*)$/);
      if (kv3 && cur) { cur[kv3[1].trim()] = kv3[2].trim(); }
    }
    if (cur) out.push(cur);
    return out;
  }
  function parseHTMLTables(text) {
    var doc = new DOMParser().parseFromString(text, "text/html");
    var tables = doc.querySelectorAll("table");
    if (!tables.length) throw "aucun tableau HTML";
    var out = [];
    for (var t = 0; t < tables.length; t++) {
      var trs = tables[t].querySelectorAll("tr");
      if (trs.length < 2) continue;
      var head = [].slice.call(trs[0].children).map(function (c) { return c.textContent.trim(); });
      for (var r = 1; r < trs.length; r++) {
        var cells = [].slice.call(trs[r].children);
        var o = {};
        head.forEach(function (k, i) { o[k] = cells[i] ? cells[i].textContent.trim() : ""; });
        out.push(o);
      }
    }
    return out;
  }
  function inflateRaw(src) {
    var out = [];
    var pos = 0, bb = 0, bc = 0;
    function bits(n) {
      while (bc < n) { bb |= src[pos++] << bc; bc += 8; }
      var v = bb & ((1 << n) - 1);
      bb >>>= n; bc -= n;
      return v;
    }
    function build(len) {
      var counts = [], sym = [], i;
      for (i = 0; i < 16; i++) counts[i] = 0;
      for (i = 0; i < len.length; i++) counts[len[i]]++;
      counts[0] = 0;
      var offs = [];
      offs[1] = 0;
      for (i = 1; i < 15; i++) offs[i + 1] = offs[i] + counts[i];
      for (i = 0; i < len.length; i++) if (len[i]) sym[offs[len[i]]++] = i;
      return { c: counts, s: sym };
    }
    function decode(h) {
      var code = 0, first = 0, index = 0, l = 1;
      while (l <= 15) {
        code |= bits(1);
        var count = h.c[l];
        if (code - first < count) return h.s[index + (code - first)];
        index += count; first += count;
        first <<= 1; code <<= 1; l++;
      }
      return -1;
    }
    var LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
    var LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    var DB2 = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
    var DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    var fixedL = null, fixedD = null;
    function fixed() {
      if (fixedL) return;
      var l = [], i;
      for (i = 0; i < 144; i++) l[i] = 8;
      for (i = 144; i < 256; i++) l[i] = 9;
      for (i = 256; i < 280; i++) l[i] = 7;
      for (i = 280; i < 288; i++) l[i] = 8;
      fixedL = build(l);
      var d = [];
      for (i = 0; i < 30; i++) d[i] = 5;
      fixedD = build(d);
    }
    var last = 0;
    while (!last) {
      last = bits(1);
      var type = bits(2);
      var lh, dh;
      if (type === 0) {
        bb = 0; bc = 0;
        var len = src[pos] | (src[pos + 1] << 8);
        pos += 4;
        for (var i2 = 0; i2 < len; i2++) out.push(src[pos++]);
        continue;
      }
      if (type === 1) { fixed(); lh = fixedL; dh = fixedD; }
      else if (type === 2) {
        var hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
        var order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        var cl = [];
        for (var i3 = 0; i3 < 19; i3++) cl[i3] = 0;
        for (i3 = 0; i3 < hclen; i3++) cl[order[i3]] = bits(3);
        var ch = build(cl);
        var lens = [], total = hlit + hdist;
        while (lens.length < total) {
          var sym = decode(ch);
          if (sym < 16) lens.push(sym);
          else if (sym === 16) {
            var prev = lens[lens.length - 1];
            var rep = 3 + bits(2);
            for (var r2 = 0; r2 < rep; r2++) lens.push(prev);
          } else if (sym === 17) {
            var rep3 = 3 + bits(3);
            for (var r3 = 0; r3 < rep3; r3++) lens.push(0);
          } else {
            var rep11 = 11 + bits(7);
            for (var r11 = 0; r11 < rep11; r11++) lens.push(0);
          }
        }
        lh = build(lens.slice(0, hlit));
        dh = build(lens.slice(hlit, total));
      } else throw "bloc deflate invalide";
      for (;;) {
        var s2 = decode(lh);
        if (s2 < 0) throw "symbole invalide";
        if (s2 < 256) out.push(s2);
        else if (s2 === 256) break;
        else {
          s2 -= 257;
          if (s2 >= LB.length) throw "longueur invalide";
          var ln = LB[s2] + bits(LE[s2]);
          var ds = decode(dh);
          if (ds < 0 || ds >= DB2.length) throw "distance invalide";
          var dist = DB2[ds] + bits(DE[ds]);
          if (dist > out.length) throw "distance hors tampon";
          for (var k2 = 0; k2 < ln; k2++) out.push(out[out.length - dist]);
        }
      }
    }
    return new Uint8Array(out);
  }
  function zipEntries(buf) {
    var u8 = new Uint8Array(buf);
    var dv = new DataView(buf);
    var eocd = -1;
    for (var i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw "ZIP : EOCD introuvable";
    var n = dv.getUint16(eocd + 10, true);
    var off = dv.getUint32(eocd + 16, true);
    var entries = {};
    var dec = new TextDecoder("utf-8");
    for (var e = 0; e < n; e++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      var method = dv.getUint16(off + 10, true);
      var csize = dv.getUint32(off + 20, true);
      var nameLen = dv.getUint16(off + 28, true);
      var extraLen = dv.getUint16(off + 30, true);
      var commentLen = dv.getUint16(off + 32, true);
      var lho = dv.getUint32(off + 42, true);
      var name = dec.decode(u8.subarray(off + 46, off + 46 + nameLen));
      var lnl = dv.getUint16(lho + 26, true);
      var lel = dv.getUint16(lho + 28, true);
      var dataStart = lho + 30 + lnl + lel;
      var comp = u8.subarray(dataStart, dataStart + csize);
      var data;
      if (method === 0) data = comp;
      else if (method === 8) data = inflateRaw(comp);
      else throw "ZIP : compression " + method + " non supportée";
      entries[name] = data;
      off += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }
  function colIndex(ref) {
    var m = String(ref || "").match(/^([A-Z]+)/);
    if (!m) return 0;
    var s = m[1], n = 0;
    for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }
  function parseXLSX(buf) {
    var entries = zipEntries(buf);
    var dec = new TextDecoder("utf-8");
    var shared = [];
    var ssKey = Object.keys(entries).filter(function (k) { return /sharedStrings\.xml$/.test(k); })[0];
    if (ssKey) {
      var ssDoc = new DOMParser().parseFromString(dec.decode(entries[ssKey]), "application/xml");
      var sis = ssDoc.getElementsByTagName("si");
      for (var i = 0; i < sis.length; i++) {
        var ts = sis[i].getElementsByTagName("t");
        var s = "";
        for (var j = 0; j < ts.length; j++) s += ts[j].textContent;
        shared.push(s);
      }
    }
    var sheetKey = Object.keys(entries).filter(function (k) { return /xl\/worksheets\/sheet1\.xml$/.test(k); })[0];
    if (!sheetKey) sheetKey = Object.keys(entries).filter(function (k) { return /xl\/worksheets\/.*\.xml$/.test(k); })[0];
    if (!sheetKey) throw "XLSX : feuille introuvable";
    var doc = new DOMParser().parseFromString(dec.decode(entries[sheetKey]), "application/xml");
    var rows = doc.getElementsByTagName("row");
    var grid = [];
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].getElementsByTagName("c");
      var arr = [];
      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c];
        var idx = colIndex(cell.getAttribute("r"));
        var type = cell.getAttribute("t");
        var val = "";
        if (type === "inlineStr") {
          var isT = cell.getElementsByTagName("t");
          for (var k = 0; k < isT.length; k++) val += isT[k].textContent;
        } else {
          var vEl = cell.getElementsByTagName("v")[0];
          var raw = vEl ? vEl.textContent : "";
          val = (type === "s") ? (shared[Number(raw)] || "") : raw;
        }
        arr[idx] = val;
      }
      grid.push(arr);
    }
    if (grid.length < 2) return [];
    var head = grid[0].map(function (x) { return String(x || "").trim(); });
    var out = [];
    for (var r2 = 1; r2 < grid.length; r2++) {
      var o = {}, empty = true;
      for (var c2 = 0; c2 < head.length; c2++) {
        var v2 = grid[r2][c2] === undefined ? "" : grid[r2][c2];
        if (String(v2).trim() !== "") empty = false;
        o[head[c2]] = v2;
      }
      if (!empty) out.push(o);
    }
    return out;
  }
  function parseODS(buf) {
    var entries = zipEntries(buf);
    var dec = new TextDecoder("utf-8");
    var key = Object.keys(entries).filter(function (k) { return k === "content.xml"; })[0];
    if (!key) throw "ODS : content.xml introuvable";
    var doc = new DOMParser().parseFromString(dec.decode(entries[key]), "application/xml");
    var tables = doc.getElementsByTagName("table:table");
    if (!tables.length) throw "ODS : tableau introuvable";
    var rows = tables[0].getElementsByTagName("table:table-row");
    var grid = [];
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].getElementsByTagName("table:table-cell");
      var arr = [];
      for (var c = 0; c < cells.length; c++) {
        var ps = cells[c].getElementsByTagName("text:p");
        var s = "";
        for (var p = 0; p < ps.length; p++) s += ps[p].textContent;
        var rep = Number(cells[c].getAttribute("table:number-columns-repeated") || 1);
        for (var q = 0; q < Math.min(rep, 64); q++) arr.push(s);
      }
      grid.push(arr);
    }
    if (grid.length < 2) return [];
    var head = grid[0].map(function (x) { return String(x || "").trim(); });
    var out = [];
    for (var r2 = 1; r2 < grid.length; r2++) {
      var o = {}, empty = true;
      for (var c2 = 0; c2 < head.length; c2++) {
        var v2 = grid[r2][c2] === undefined ? "" : grid[r2][c2];
        if (String(v2).trim() !== "") empty = false;
        o[head[c2]] = v2;
      }
      if (!empty) out.push(o);
    }
    return out;
  }

  function sniffAndParse(name, text, buf) {
    var lower = String(name || "").toLowerCase();
    var ext = lower.split(".").pop();
    var trimmed = String(text || "").trim();
    var u8 = buf ? new Uint8Array(buf) : null;
    var isZip = u8 && u8.length > 4 && u8[0] === 0x50 && u8[1] === 0x4b;

    if (isZip) {
      if (ext === "ods" || (entriesHas(buf, "content.xml"))) return { fmt: "ODS", records: parseODS(buf) };
      return { fmt: "XLSX", records: parseXLSX(buf) };
    }
    if (ext === "json" || trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") {
      try { return { fmt: "JSON", data: JSON.parse(trimmed) }; } catch (e) {}
    }
    if (ext === "jsonl" || ext === "ndjson") return { fmt: "JSONL", records: parseJSONL(trimmed) };
    if (ext === "xml" || /^<\?xml/.test(trimmed) || /^<[a-zA-Z]/.test(trimmed)) {
      if (/<table[\s>]/i.test(trimmed)) return { fmt: "HTML", records: parseHTMLTables(trimmed) };
      return { fmt: "XML", records: parseXMLRecords(trimmed) };
    }
    if (ext === "html" || ext === "htm") return { fmt: "HTML", records: parseHTMLTables(trimmed) };
    if (ext === "yaml" || ext === "yml" || /^\s*-\s+\w+\s*:/.test(trimmed)) return { fmt: "YAML", records: parseYAML(trimmed) };
    if (ext === "js") {
      var t = trimmed.replace(/^\s*window\.[A-Za-z0-9_]+\s*=\s*/, "").replace(/^\s*(export\s+default|module\.exports\s*=)\s*/, "").replace(/;\s*$/, "");
      try { return { fmt: "JS/JSON", data: JSON.parse(t) }; } catch (e) {}
      try { return { fmt: "JS", data: (new Function("return " + t))() }; } catch (e2) {}
    }
    if (ext === "csv" || ext === "tsv" || ext === "txt" || /[;,\t|]/.test(trimmed.split(/\r?\n/)[0] || "")) {
      return { fmt: (ext === "tsv" ? "TSV" : "CSV"), records: parseDelimited(trimmed) };
    }
    var jl = parseJSONL(trimmed);
    if (jl.length) return { fmt: "JSONL", records: jl };
    throw "format non reconnu";
  }
  function entriesHas(buf, name) {
    try {
      var e = zipEntries(buf);
      return Object.keys(e).indexOf(name) > -1;
    } catch (x) { return false; }
  }

  function openImport() {
    if (!isAdm()) { toast("warn", "Niveau 3 requis", "Déverrouillez la session administrateur."); location.hash = "#/donnees"; return; }
    IMPORT = null;
    var h = "";
    h += "<div class='mh'>" + ic("ul") + "<h3>Import universel — fusion à la base</h3><button class='tb' data-act='mclose'>" + ic("x") + "</button></div>";
    h += "<div class='mb2'>";
    h += "<div class='dz2' id='dz' data-act='dzPick'>" + ic("ul") + "<div><b>Déposer un fichier</b> ou cliquer</div>";
    h += "<div class='dim mono' style='font-size:10px;margin-top:4px'>TOUS FORMATS · FUSION SANS DOUBLON · SAUVEGARDE AUTO APRÈS IMPORT</div></div>";
    h += "<div class='fmtrow'><span>JSON</span><span>JSONL</span><span>CSV</span><span>TSV</span><span>XML</span><span>YAML</span><span>XLSX</span><span>ODS</span><span>HTML</span><span>JS</span><span>TXT</span></div>";
    h += "<input type='file' id='impFile' style='display:none'>";
    h += "<div style='margin-top:12px'><label class='lb'>…ou coller les données</label><textarea class='inp mono' id='impText' rows='6'></textarea></div>";
    h += "<div id='impReport'></div></div>";
    h += "<div class='mf'><button class='btn ghost' data-act='mclose'>Fermer</button>";
    h += "<button class='btn ghost' data-act='impAnalyze'>" + ic("check") + "Analyser</button>";
    h += "<button class='btn pri' id='impApply' data-act='impApply' disabled>" + ic("ul") + "Fusionner + sauvegarder</button></div>";
    openModal(h, "wide");
  }

  function analyzeImportPayload(parsed, label) {
    var rep = $("#impReport");
    var groups = {}, rejected = [], ignored = [];
    if (parsed.data !== undefined) {
      var data = parsed.data;
      if (Array.isArray(data)) {
        var k0 = detectKind(data[0] || {});
        if (k0) groups[k0] = data;
      } else if (data && typeof data === "object") {
        var cl = classifyBundle(data);
        groups = cl.groups; ignored = cl.ignored;
      }
    } else if (parsed.records) {
      var recs = parsed.records;
      var k1 = detectKind(recs[0] || {});
      if (k1) groups[k1] = recs;
    }
    if (!Object.keys(groups).length) {
      rep.innerHTML = "<div class='rep rj'>Aucune collection reconnue. Formats attendus : marques, modeles, motorisations, fiches/pannes, tsb/rappels, revisions/plans.</div>";
      beep("err");
      return;
    }
    var mapped = {};
    Object.keys(groups).forEach(function (k) {
      mapped[k] = [];
      groups[k].forEach(function (rec, idx) {
        try { mapped[k].push(mapRecord(rec, k)); }
        catch (err) { rejected.push(k + "[" + idx + "] : " + err); }
      });
    });
    var R = resolveAll(mapped);
    var ok = 0;
    Object.keys(R.out).forEach(function (k) { ok += R.out[k].length; });
    IMPORT = { R: R };
    var h = "<div class='rep'><b class='ok'>" + ok + " enregistrement(s) prêt(s)</b> · <b class='rj'>" + (rejected.length + R.drop.length) + " rejeté(s)</b> · <b class='wn'>" + R.warn.length + " auto-création(s)</b>";
    h += "<div class='mono' style='font-size:10.5px;margin-top:6px;color:#25D4EE'>Format détecté : " + esc(parsed.fmt) + (label ? " · " + esc(label) : "") + "</div>";
    Object.keys(R.out).forEach(function (k) {
      if (R.out[k].length) h += "<div class='mono' style='font-size:10.5px;margin-top:4px;color:#25D4EE'>" + k + " ← " + R.out[k].length + "</div>";
    });
    if (ignored.length) h += "<p class='wn' style='margin-top:8px'>Métadonnées ignorées : " + esc(ignored.slice(0, 6).join(", ")) + "</p>";
    if (rejected.length) {
      h += "<ul>";
      rejected.slice(0, 8).forEach(function (r) { h += "<li class='rj'>" + esc(r) + "</li>"; });
      h += "</ul>";
    }
    if (R.warn.length) {
      h += "<ul>";
      R.warn.slice(0, 8).forEach(function (r) { h += "<li class='wn'>" + esc(r) + "</li>"; });
      h += "</ul>";
    }
    h += "</div>";
    rep.innerHTML = h;
    $("#impApply").disabled = (ok === 0);
    beep(ok ? "ok" : "err");
  }

  function analyzeImport() {
    var ta = $("#impText");
    var text = ta ? ta.value.trim() : "";
    var rep = $("#impReport");
    if (!text) { rep.innerHTML = "<div class='rep rj'>Aucune donnée. Déposez un fichier ou collez du contenu.</div>"; beep("err"); return; }
    try {
      var parsed = sniffAndParse("paste.txt", text, null);
      analyzeImportPayload(parsed, "collage");
    } catch (e) {
      rep.innerHTML = "<div class='rep rj'>Analyse impossible : " + esc(String(e)) + "</div>";
      beep("err");
    }
  }

  function handleImportFile(file) {
    if (!file) return;
    var rep = $("#impReport");
    var lower = file.name.toLowerCase();
    var isBinary = /\.(xlsx|xls|ods|zip)$/.test(lower);
    var rd = new FileReader();
    rd.onload = function () {
      try {
        if (isBinary) {
          var parsed = sniffAndParse(file.name, null, rd.result);
          analyzeImportPayload(parsed, file.name);
        } else {
          var text = String(rd.result || "");
          var ta = $("#impText");
          if (ta) ta.value = text.length > 200000 ? text.slice(0, 200000) : text;
          var parsed2 = sniffAndParse(file.name, text, null);
          analyzeImportPayload(parsed2, file.name);
        }
      } catch (e) {
        if (rep) rep.innerHTML = "<div class='rep rj'>Fichier non exploitable : " + esc(String(e)) + "<br>Astuce : exportez la feuille en CSV ou JSON.</div>";
        beep("err");
      }
    };
    if (isBinary) rd.readAsArrayBuffer(file);
    else rd.readAsText(file);
  }

  function applyImport() {
    if (!IMPORT || !IMPORT.R) return;
    snapshot("import fusion");
    var ins = 0, upd = 0;
    ["brands", "models", "engines", "faults", "tsb", "maint"].forEach(function (k) {
      var list = IMPORT.R.out[k] || [];
      list.forEach(function (rec) { if (upsert(k, rec) === "add") ins++; else upd++; });
    });
    var n = ins + upd;
    IMPORT = null;
    closeModal();
    mutate("imp", "Fusion : " + ins + " ajouts, " + upd + " maj");
    saveNow();
    toast("ok", "Fusion appliquée et sauvegardée", n + " enregistrement(s) · base : " + fmt(META.counts.e) + " motorisations · " + fmt(META.counts.f) + " pannes · " + fmt(META.counts.rc) + " rappels.", true);
    beep("imp");
  }

  function openIntegrity() {
    var g = META.integ;
    var h = "<div class='mh'>" + ic("check") + "<h3>Intégrité des fichiers croisés</h3><button class='tb' data-act='mclose'>" + ic("x") + "</button></div>";
    h += "<div class='mb2'><div class='rep' style='max-height:none'><b class='" + (g.ok ? "ok" : "rj") + "'>" + (g.ok ? "BASE INTÈGRE" : "ERREURS") + "</b> — score " + g.pct + "% · " + fmt(META.links) + " liaisons";
    if (g.err.length) {
      h += "<ul>";
      g.err.slice(0, 30).forEach(function (e) { h += "<li class='rj'>" + esc(e) + "</li>"; });
      h += "</ul>";
    } else h += "<p class='ok' style='margin-top:8px'>Aucune référence orpheline, aucun id dupliqué.</p>";
    h += "</div></div><div class='mf'><button class='btn ghost' data-act='autoFix'>" + ic("tool") + "Auto-réparation</button><button class='btn pri' data-act='mclose'>Fermer</button></div>";
    openModal(h);
  }

  function runTests() {
    var T = [];
    var add = function (n, ok, i, s) { T.push({ n: n, ok: !!ok, info: i || "", soft: !!s }); };
    add("Base usine", !!DB && DB.engines.length > 0, DB ? DB.engines.length + " moteurs" : "ABSENTE");
    add("Marques", DB.brands.length > 0, DB.brands.length + " marques");
    add("Modèles", DB.models.length > 0, DB.models.length + " modèles");
    add("Pannes", DB.faults.length > 0, DB.faults.length + " fiches");
    add("TSB / Rappels", DB.tsb.length > 0, DB.tsb.length + " bulletins");
    add("Plans entretien", DB.maint.length > 0, DB.maint.length + " plans");
    var orph = 0;
    DB.engines.forEach(function (e) { e.m.forEach(function (i) { if (!modelById(i)) orph++; }); });
    add("Références moteur-modèle", orph === 0, orph + " orphelin(s)");
    var p3008 = DB.models.filter(function (m) { return m.n.indexOf("3008 II Phase 2") > -1; }).length;
    add("Pack 3008 II Phase 2", p3008 > 0, p3008 + " modèle(s)");
    var e3008 = DB.engines.filter(function (e) { return /EB2ADTS|EB2ADTX|DV5RUC/.test(e.code); }).length;
    add("Motorisations 3008 P2", e3008 >= 4, e3008 + " motorisations");
    var omniOk = false;
    try { omniOk = omniSearch("3008 courroie").length > 0; } catch (e) {}
    add("Recherche prédictive", omniOk, "3008 courroie → résultats");
    var omniRec = false;
    try { omniRec = omniSearch("3008 rappel").some(function (h) { return h.badge === "RAPPEL"; }); } catch (e) {}
    add("Recherche rappels", omniRec, "3008 rappel → campagnes");
    var dm = ["#view", "#rail", "#top", "#dr", "#md", "#ts", "#bgc", "#omni", "#omnires"].filter(function (s) { return !$(s); });
    add("Éléments DOM critiques", dm.length === 0, dm.length ? dm.join(", ") : "9/9 présents");
    var cv = document.createElement("canvas");
    var cx = safe("tctx", function () { return cv.getContext("2d"); }, null);
    add("Contexte canvas 2D", !!cx, cx ? "OK" : "indisponible", true);
    add("Scènes studio", WP.MODES.length >= 10, WP.MODES.length + " scènes");
    add("requestAnimationFrame", typeof requestAnimationFrame === "function", "OK");
    add("Stockage", STORE.local, STORE.local ? "localStorage" : "mémoire", true);
    add("Session", STORE.session, STORE.session ? "sessionStorage" : "mémoire", true);
    var vb = [];
    var vw = [["bord", vBord], ["explorer", vExplorer], ["tech", vTech], ["entretien", vEntretien], ["studio", vStudio], ["donnees", vDonnees], ["diagnostic", vDiag]];
    vw.forEach(function (v) {
      try { var hh = v[1](); if (typeof hh !== "string" || hh.length < 1) vb.push(v[0]); }
      catch (e) { vb.push(v[0] + " (" + e.message + ")"); }
    });
    add("Rendu des vues", vb.length === 0, vb.length ? vb.join(", ") : "OK");
    add("Intégrité référentielle", META.integ.ok, META.integ.err.length + " erreurs");
    add("Sauvegarde auto", LASTSAVE > 0, LASTSAVE ? new Date(LASTSAVE).toLocaleTimeString("fr-FR") : "en attente");
    add("Exceptions capturées", ERRORS.length === 0, ERRORS.length ? ERRORS.slice(-3).map(function (e) { return e.m; }).join(" | ") : "aucune", true);
    TESTS = T;
    updateMeta();
    return T;
  }

  function autoFix() {
    var did = [];
    if (!META.integ.ok || !DB.engines.length) { DB = clone(SEED); did.push("base réinjectée"); }
    if (WP.fails > 0) { WP.P.mode = "nebula"; WP.fails = 0; WP.apply(); did.push("graphique réinitialisé"); }
    ERRORS.length = 0; did.push("journal purgé");
    recompute(); saveNow(); runTests(); updateMeta(); render();
    toast(did.length ? "ok" : "info", "Auto-réparation", did.join(" · "));
    beep("ok");
  }

  function bindEvents() {
    document.addEventListener("click", function (ev) {
      var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
      if (!el) {
        if (!(ev.target.closest && ev.target.closest(".omni"))) omniClose();
        return;
      }
      var act = el.dataset.act, id = el.dataset.id;
      if (act === "omniSeed") {
        var inp = $("#omni");
        if (inp) { inp.value = el.dataset.q; S.omni.q = el.dataset.q; inp.focus(); omniRender(); }
        return;
      }
      if (act === "omniHit") {
        var kind = el.dataset.kind;
        var hit = { kind: kind, id: id };
        omniActivate(hit);
        return;
      }
      if (act === "msearch") {
        var q = prompt("Recherche prédictive (modèle, code, symptôme, rappel) :");
        if (q) { var i2 = $("#omni"); if (i2) { i2.value = q; S.omni.q = q; omniRender(); i2.focus(); } }
        return;
      }
      if (act === "snd") { PREF.sound = !PREF.sound; markDirty(); updateMeta(); if (PREF.sound) beep("ok"); return; }
      if (act === "run") { WP.set("run", !WP.P.run); beep("tick"); return; }
      if (act === "goStudio") { location.hash = "#/studio"; return; }
      if (act === "goAdm") { location.hash = "#/donnees"; return; }
      if (act === "goDiag") { location.hash = "#/diagnostic"; return; }
      if (act === "runTests") { runTests(); location.hash = "#/diagnostic"; render(); return; }
      if (act === "autoFix") { autoFix(); return; }
      if (act === "integrity") { openIntegrity(); return; }
      if (act === "undo") { doUndo(); return; }
      if (act === "mclose") { closeModal(); return; }
      if (act === "mscrim") { if (ev.target === el) closeModal(); return; }
      if (act === "drclose") { closeDrawer(); return; }
      if (act === "drback") { var hb = S.drawer.hist.pop(); if (hb) { S.drawer.type = hb.type; S.drawer.id = hb.id; S.drawer.tab = hb.tab; renderDrawer(); } return; }
      if (act === "drtab") { S.drawer.tab = el.dataset.t; renderDrawer(); return; }
      if (act === "openEng") { omniClose(); openDrawer("engine", id, !!S.drawer); return; }
      if (act === "openFault") { omniClose(); openDrawer("fault", id, !!S.drawer); return; }
      if (act === "openTsb") { omniClose(); openDrawer("tsb", id, !!S.drawer); return; }
      if (act === "pin") {
        var gi = GARAGE.indexOf(id);
        if (gi > -1) { GARAGE.splice(gi, 1); toast("info", "Retiré du garage"); }
        else { GARAGE.push(id); toast("ok", "Épinglé au garage"); beep("ok"); }
        markDirty(); render(); return;
      }
      if (act === "expEng") {
        var xe = null;
        for (var i3 = 0; i3 < DB.engines.length; i3++) if (DB.engines[i3].id === id) xe = DB.engines[i3];
        if (xe) {
          download("fiche_" + xe.code.replace(/\W+/g, "_") + ".json", JSON.stringify({ engine: xe, models: engModels(xe), brand: engBrand(xe), ivi: ivi(xe), faults: faultsFor(xe), tsb: tsbFor(xe), plan: planFor(xe) }, null, 2));
          toast("ok", "Fiche exportée"); beep("ok");
        }
        return;
      }
      if (act === "fbrand") { S.f.brand = (S.f.brand === el.dataset.b ? "" : el.dataset.b); S.shown = 48; render(); beep("tick"); return; }
      if (act === "ffuel") {
        var fk = el.dataset.k, fi = S.f.fuels.indexOf(fk);
        if (fi > -1) S.f.fuels.splice(fi, 1); else S.f.fuels.push(fk);
        S.shown = 48; el.classList.toggle("on"); refreshResults(); beep("tick"); return;
      }
      if (act === "resetFilters") { S.f = { q: "", brand: "", fuels: [], seg: "", y: [2017, YMAX], p: [0, 2100], sort: "brand" }; S.shown = 48; render(); return; }
      if (act === "more") { S.shown += 48; refreshResults(); return; }
      if (act === "techTab") { S.tech.tab = el.dataset.t; render(); return; }
      if (act === "selPlan") { S.plan = id; render(); return; }
      if (act === "expAll") { download("mecadata_base.json", JSON.stringify(DB, null, 2)); toast("ok", "Base exportée"); beep("ok"); return; }
      if (act === "fileExp") { download(el.dataset.k + ".json", JSON.stringify(DB[el.dataset.k], null, 2)); beep("ok"); return; }
      if (act === "saveNow") { saveNow(); toast("ok", "Sauvegarde effectuée", "Base et réglages enregistrés."); beep("ok"); return; }
      if (act === "goImport") { openImport(); return; }
      if (act === "dzPick") { var f = $("#impFile"); if (f) f.click(); return; }
      if (act === "impAnalyze") { analyzeImport(); return; }
      if (act === "impApply") { applyImport(); return; }
      if (act === "askReset") { confirmModal("Réinitialiser ?", "Base remplacée par usine. Annulation 8 s.", "doReset", "Réinitialiser"); return; }
      if (act === "doReset") { closeModal(); snapshot("reset"); DB = clone(SEED); GARAGE = []; mutate("del", "Base usine"); saveNow(); toast("warn", "Base restaurée"); return; }
      if (act === "logout") { STORE.sdel("md_adm"); updateMeta(); render(); toast("info", "Session verrouillée"); return; }
      if (act === "stMode") { WP.set("mode", el.dataset.m); beep("tick"); return; }
      if (act === "stTheme") { WP.P.useCustom = false; WP.set("theme", el.dataset.t); beep("tick"); return; }
      if (act === "stPreset") {
        var ps = WP.PRESETS[el.dataset.n];
        if (ps) { Object.keys(ps).forEach(function (k) { WP.P[k] = ps[k]; }); WP.apply(); WP.resize(); render(); toast("ok", "Preset appliqué", el.dataset.n); beep("ok"); }
        return;
      }
      if (act === "stRandom") { WP.randomize(); render(); toast("ok", "Scène aléatoire", WP.P.mode); beep("imp"); return; }
      if (act === "stReset") { WP.reset(); render(); toast("info", "Réglages réinitialisés"); return; }
      if (act === "stPng") { WP.exportPNG(); return; }
      if (act === "stRun") { WP.set("run", !WP.P.run); render(); return; }
      if (act === "stDir") { WP.set("dir", WP.P.dir > 0 ? -1 : 1); render(); return; }
      if (act === "stCustom") { WP.P.useCustom = !!el.checked; WP.drawAll(); markDirty(); WP.sync(); return; }
    });

    document.addEventListener("input", function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.id === "omni") { S.omni.q = t.value; omniRender(); return; }
      if (t.dataset && t.dataset.c) { WP.setCustom(t.dataset.c, t.value); return; }
      if (t.dataset && t.dataset.p) {
        var pk = t.dataset.p;
        var val = t.type === "checkbox" ? t.checked : (t.tagName === "SELECT" ? (pk === "dir" ? +t.value : t.value) : +t.value);
        WP.set(pk, val);
        if (pk === "format") applyFormat();
        return;
      }
      if (t.id === "planSearch") { var pi = $("#planItems"); if (pi) pi.innerHTML = planItems(t.value); return; }
      if (t.dataset && t.dataset.f) {
        var k = t.dataset.f, f = S.f;
        if (k === "q") f.q = t.value;
        else if (k === "brand") f.brand = t.value;
        else if (k === "sort") f.sort = t.value;
        S.shown = 48;
        deb(refreshResults, 100)();
        return;
      }
      if (t.dataset && t.dataset.tf) { S.tech[t.dataset.tf] = t.value; deb(refreshTech, 100)(); return; }
      if (t.dataset && t.dataset.calc) { S.calc[t.dataset.calc] = +t.value || 0; refreshCalc(); return; }
    });

    document.addEventListener("change", function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.dataset && t.dataset.calc === "sev") { S.calc.sev = +t.value; refreshCalc(); }
      if (t.id === "impFile" && t.files && t.files[0]) handleImportFile(t.files[0]);
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
          toast("ok", "Niveau 3 activé", "Import multi-formats déverrouillé.");
          beep("imp");
        } else {
          var c = $("#lockCard");
          if (c) { c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); }
          toast("err", "Mot de passe incorrect");
          beep("err");
        }
      }
    });

    document.addEventListener("dragover", function (ev) {
      var dz = ev.target.closest ? ev.target.closest("#dz") : null;
      if (dz) { ev.preventDefault(); dz.classList.add("over"); }
    });
    document.addEventListener("dragleave", function (ev) {
      var dz = ev.target.closest ? ev.target.closest("#dz") : null;
      if (dz) dz.classList.remove("over");
    });
    document.addEventListener("drop", function (ev) {
      var dz = ev.target.closest ? ev.target.closest("#dz") : null;
      if (!dz) return;
      ev.preventDefault();
      dz.classList.remove("over");
      if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]) handleImportFile(ev.dataTransfer.files[0]);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        if (modalOpenFn()) closeModal();
        else if (S.drawer) closeDrawer();
        else omniClose();
        return;
      }
      if (ev.key === "/" && !/input|textarea|select/i.test(ev.target.tagName)) {
        var o = $("#omni");
        if (o) { ev.preventDefault(); o.focus(); }
        return;
      }
      if (ev.target && ev.target.id === "omni") {
        if (ev.key === "ArrowDown") { ev.preventDefault(); omniMove(1); }
        else if (ev.key === "ArrowUp") { ev.preventDefault(); omniMove(-1); }
        else if (ev.key === "Enter") {
          ev.preventDefault();
          var box = $("#omnires");
          var els = box ? $$(".hit", box) : [];
          var pickEl = els[S.omni.idx] || els[0];
          if (pickEl) omniActivate({ kind: pickEl.dataset.kind, id: pickEl.dataset.id });
        }
      }
    });

    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", function () { if (document.hidden) saveNow(); });
    setInterval(function () { if (DIRTY) saveNow(); }, 20000);
  }

  function route() {
    var h = (location.hash || "#/bord").replace("#/", "");
    var allowed = ["bord", "explorer", "tech", "entretien", "studio", "donnees", "diagnostic"];
    S.view = allowed.indexOf(h) > -1 ? h : "bord";
    render();
  }

  function boot() {
    var o = $("#boot");
    var done = function () {
      if (!o) return;
      o.className = "off";
      o.style.display = "none";
      STORE.sset("md_boot", "1");
    };
    if (STORE.sget("md_boot")) {
      var bb = $("#bbar");
      if (bb) bb.style.width = "100%";
      setTimeout(done, 200);
      return;
    }
    var L = [
      ["Noyau MECADATA v7.3 — initialisation", 10],
      ["Pack 3008 II Phase 2 intégré", 28],
      [DB.brands.length + " marques · " + DB.models.length + " modèles", 50],
      [DB.engines.length + " motorisations construites", 70],
      [DB.faults.length + " pannes · " + DB.tsb.length + " TSB/rappels", 86],
      ["Recherche prédictive + studio 10 scènes prêts", 100]
    ];
    var lg = $("#bl"), i = 0;
    var step = function () {
      if (!o || !o.parentNode) return;
      if (i >= L.length) { setTimeout(done, 300); return; }
      var x = L[i]; i++;
      var d = document.createElement("div");
      d.innerHTML = "<b>OK</b> " + esc(x[0]);
      lg.appendChild(d);
      while (lg.children.length > 5) lg.removeChild(lg.firstChild);
      var bar = $("#bbar");
      if (bar) bar.style.width = x[1] + "%";
      setTimeout(step, 120);
    };
    setTimeout(step, 150);
    setTimeout(done, 3200);
  }

  function init() {
    if (!window.MD_RAW) {
      logErr("init", new Error("MD_RAW absent : 02-data.js non chargé"));
      window.__MD_READY = false;
      return;
    }
    SEED = buildCatalog(window.MD_RAW);
    DB = clone(SEED);
    var raw = STORE.get(KEY);
    if (raw) {
      safe("load", function () {
        var d = JSON.parse(raw);
        if (d && d.db && d.db.engines && d.db.engines.length && d.v === 73) {
          DB = d.db;
          AUDIT = d.audit || [];
          GARAGE = d.garage || [];
          VIEWS = d.views || [];
          if (d.prefs) Object.keys(d.prefs).forEach(function (k) { PREF[k] = d.prefs[k]; });
          if (d.wp) {
            Object.keys(d.wp).forEach(function (k) { WP.P[k] = d.wp[k]; });
            if (!WP.P.custom) WP.P.custom = { bg: "#04070D", a: "#25D4EE", b: "#4D8DFF", c: "#E45CFF", d: "#43E08B" };
            if (typeof WP.P.dir !== "number") WP.P.dir = 1;
          }
          LASTSAVE = d.ts || 0;
        } else STORE.del(KEY);
      }, null);
    }
    recompute();
    WP.init();
    runTests();
    bindEvents();
    window.addEventListener("hashchange", function () { route(); beep("tick"); });
    setInterval(function () { var c = $("#clk"); if (c) c.textContent = new Date().toLocaleTimeString("fr-FR"); }, 1000);
    route();
    updateMeta();
    boot();
    audit("adm", "Lancement — sauvegarde automatique (" + DB.engines.length + " moteurs)");
    saveNow();
    window.__MD_READY = true;
    window.__MD_SCRIPTS.app = true;
    var jf = $("#jsfail");
    if (jf && jf.parentNode) jf.parentNode.removeChild(jf);
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    setTimeout(function () {
      if (fl) toast("err", fl + " test(s) en échec", "Module Diagnostic → Auto-réparation.");
      else toast("ok", "Système vérifié", TESTS.length + " contrôles OK · sauvegarde auto active.");
    }, 3300);
  }

  try { init(); }
  catch (e) {
    logErr("init", e);
    if (window.__MD_LIFT) window.__MD_LIFT();
    var v = $("#view");
    if (v) v.innerHTML = "<div class='card panel'><h3 style='color:#FF4D5E'>Erreur d'initialisation</h3><p class='muted'>" + esc(e.message) + "</p><button class='btn pri' onclick='location.reload()'>Recharger</button></div>";
    window.__MD_READY = false;
  }
})();
