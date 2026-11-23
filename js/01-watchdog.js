/* ══════════════════════════════════════════════════════════════════════════
   CHIEN DE GARDE ES5 — isolé, survit même si les autres scripts échouent.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  window.__MD_READY = false;
  window.__MD_ERR = [];
  window.__MD_SCRIPTS = { watchdog: true, data: false, core: false, app: false };

  var oldOnError = window.onerror;
  window.onerror = function (m, s, l, c, e) {
    try {
      window.__MD_ERR.push({
        msg: String(m),
        src: String(s || "?"),
        line: l || 0,
        col: c || 0,
        stack: (e && e.stack) ? String(e.stack).slice(0, 500) : ""
      });
    } catch (x) {}
    if (typeof oldOnError === "function") {
      try { return oldOnError(m, s, l, c, e); } catch (y) {}
    }
    return false;
  };

  window.addEventListener("unhandledrejection", function (ev) {
    try {
      var r = ev.reason;
      window.__MD_ERR.push({
        msg: "Promise rejetée : " + (r && r.message ? r.message : String(r)),
        src: "promise",
        line: 0,
        col: 0,
        stack: (r && r.stack) ? String(r.stack).slice(0, 500) : ""
      });
    } catch (x) {}
  });

  function lift() {
    var b = document.getElementById("boot");
    if (b) {
      b.className = "off";
      b.style.display = "none";
    }
  }
  window.__MD_LIFT = lift;

  function showFailPanel() {
    var f = document.getElementById("jsfail");
    if (!f) return;
    f.style.display = "block";

    var details = document.getElementById("jsfail-details");
    if (details) {
      var lines = [];
      lines.push("<b>Scripts chargés :</b>");
      lines.push("<ul>");
      lines.push("<li>watchdog.js : " + (window.__MD_SCRIPTS.watchdog ? "✓" : "✗") + "</li>");
      lines.push("<li>data.js : " + (window.__MD_SCRIPTS.data ? "✓" : "✗") + "</li>");
      lines.push("<li>core.js : " + (window.__MD_SCRIPTS.core ? "✓" : "✗") + "</li>");
      lines.push("<li>app.js : " + (window.__MD_SCRIPTS.app ? "✓" : "✗") + "</li>");
      lines.push("</ul>");

      if (window.__MD_ERR.length > 0) {
        lines.push("<b>Erreurs capturées :</b><ul>");
        var n = Math.min(window.__MD_ERR.length, 5);
        for (var i = 0; i < n; i++) {
          var e = window.__MD_ERR[i];
          lines.push("<li class='rj'>" + String(e.msg).replace(/[<>]/g, "") +
                     " @ " + e.line + ":" + e.col + "</li>");
        }
        lines.push("</ul>");
      } else {
        lines.push("<p class='wn'>Aucune erreur JS capturée. Cause probable : " +
                   "un ou plusieurs fichiers .js absents du dossier <code>js/</code> " +
                   "(chemin relatif cassé dans l'APK).</p>");
        lines.push("<p>Structure attendue à côté de <code>index.html</code> :</p>");
        lines.push("<pre style='background:#0C1424;padding:8px;border-radius:6px;color:#25D4EE;font-size:11px'>");
        lines.push("mecadata/\n  index.html\n  js/\n    01-watchdog.js\n    02-data.js\n    03-core.js\n    04-app.js");
        lines.push("</pre>");
      }
      details.innerHTML = lines.join("");
    }
  }

  // Délai de sécurité : si le moteur n'est pas prêt en 4 s, on affiche le panneau.
  setTimeout(function () {
    if (!window.__MD_READY) {
      lift();
      showFailPanel();
    }
  }, 4000);

  // Clic sur l'écran de boot = levée manuelle.
  document.addEventListener("click", function (e) {
    var b = e.target;
    while (b && b !== document.body) {
      if (b.id === "boot") { lift(); return; }
      b = b.parentNode;
    }
  }, false);

  // Signaler au watchdog que ce script est bien chargé.
  window.__MD_SCRIPTS.watchdog = true;
})();
