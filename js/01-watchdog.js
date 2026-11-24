(function () {
  "use strict";
  window.__MD_READY = false;
  window.__MD_ERR = [];
  window.__MD_SCRIPTS = { watchdog: true, data: false, core: false, app: false };
  window.onerror = function (m, s, l, c, e) {
    try { window.__MD_ERR.push({ msg: String(m), src: String(s || "?"), line: l || 0, col: c || 0 }); } catch (x) {}
    return false;
  };
  window.addEventListener("unhandledrejection", function (ev) {
    try { window.__MD_ERR.push({ msg: "Promise: " + String(ev.reason && ev.reason.message || ev.reason), src: "promise", line: 0, col: 0 }); } catch (x) {}
  });
  window.__MD_LIFT = function () { var b = document.getElementById("boot"); if (b) b.className = "off"; };
  setTimeout(function () {
    if (window.__MD_READY) return;
    window.__MD_LIFT();
    var f = document.getElementById("jsfail"); if (!f) return;
    f.style.display = "block";
    var d = document.getElementById("jsfail-details");
    if (d) {
      var h = "<b>Scripts :</b><ul>";
      ["watchdog", "data", "core", "app"].forEach(function (k) { h += "<li>" + k + ".js : " + (window.__MD_SCRIPTS[k] ? "OK" : "ABSENT") + "</li>"; });
      h += "</ul>";
      if (window.__MD_ERR.length) { h += "<b>Erreurs :</b><ul>"; window.__MD_ERR.slice(0, 6).forEach(function (e) { h += "<li class='rj'>" + String(e.msg).replace(/[<>]/g, "") + " @" + e.line + ":" + e.col + "</li>"; }); h += "</ul>"; }
      d.innerHTML = h;
    }
  }, 4500);
  document.addEventListener("click", function (e) { var b = e.target; while (b && b !== document.body) { if (b.id === "boot") { window.__MD_LIFT(); return; } b = b.parentNode; } }, false);
})();
