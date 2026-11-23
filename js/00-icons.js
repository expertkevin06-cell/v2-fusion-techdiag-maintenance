/* ══════════════════════════════════════════════════════════════════════════
   00-ICONS — MECADATA // éclair jaune
   • injecte manifest, theme-color, favicon, apple-touch-icon
   • génère les PNG 192/512 en canvas si les fichiers sont absents (file://)
   • expose MD_ICONS.download() pour exporter les vrais fichiers PWA
   • enregistre le service worker (http/https uniquement)
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var BOLT = [
    [0.615, 0.055], [0.270, 0.545], [0.470, 0.545],
    [0.385, 0.945], [0.745, 0.415], [0.535, 0.415], [0.690, 0.055]
  ];

  function draw(ctx, size, maskable) {
    var s = size;
    var r = maskable ? 0 : s * 0.22;

    ctx.clearRect(0, 0, s, s);
    ctx.save();
    if (r > 0) {
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(s - r, 0); ctx.quadraticCurveTo(s, 0, s, r);
      ctx.lineTo(s, s - r); ctx.quadraticCurveTo(s, s, s - r, s);
      ctx.lineTo(r, s); ctx.quadraticCurveTo(0, s, 0, s - r);
      ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();
    }

    var bg = ctx.createRadialGradient(s * 0.42, s * 0.34, 0, s * 0.42, s * 0.34, s * 0.95);
    bg.addColorStop(0, "#111C31");
    bg.addColorStop(1, "#04070D");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);

    ctx.strokeStyle = "rgba(37,212,238,0.20)";
    ctx.lineWidth = Math.max(1, s * 0.006);
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.5, s * 0.44, 0, Math.PI * 2);
    ctx.stroke();

    var k = maskable ? 0.68 : 0.86;
    var pts = BOLT.map(function (p) {
      return [(0.5 + (p[0] - 0.5) * k) * s, (0.5 + (p[1] - 0.5) * k) * s];
    });

    function path() {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }

    ctx.save();
    ctx.shadowColor = "rgba(255,168,0,0.85)";
    ctx.shadowBlur = s * 0.09;
    path();
    ctx.fillStyle = "#FFA800";
    ctx.fill();
    ctx.restore();

    var g = ctx.createLinearGradient(0, s * 0.06, 0, s * 0.94);
    g.addColorStop(0, "#FFF5AA");
    g.addColorStop(0.45, "#FFD60A");
    g.addColorStop(1, "#FFA800");
    path();
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,245,170,0.55)";
    ctx.lineWidth = Math.max(1, s * 0.008);
    path();
    ctx.stroke();

    ctx.restore();
  }

  function makeDataURL(size, maskable) {
    try {
      var cv = document.createElement("canvas");
      cv.width = size; cv.height = size;
      var cx = cv.getContext("2d");
      if (!cx) return null;
      draw(cx, size, maskable);
      return cv.toDataURL("image/png");
    } catch (e) { return null; }
  }

  function link(rel, href, extra) {
    var l = document.createElement("link");
    l.rel = rel;
    l.href = href;
    if (extra) Object.keys(extra).forEach(function (k) { l.setAttribute(k, extra[k]); });
    document.head.appendChild(l);
    return l;
  }
  function meta(name, content) {
    var m = document.querySelector("meta[name='" + name + "']");
    if (!m) { m = document.createElement("meta"); m.name = name; document.head.appendChild(m); }
    m.content = content;
  }

  var isWeb = /^https?:$/.test(location.protocol);
  var ICONS = {
    ready: false,
    generated: {},
    base: isWeb ? "icons/" : "icons/",
    files: [
      { name: "icon-192.png", size: 192, maskable: false },
      { name: "icon-512.png", size: 512, maskable: false },
      { name: "icon-maskable-192.png", size: 192, maskable: true },
      { name: "icon-maskable-512.png", size: 512, maskable: true },
      { name: "apple-touch-icon.png", size: 180, maskable: true },
      { name: "favicon-32.png", size: 32, maskable: false },
      { name: "favicon-16.png", size: 16, maskable: false }
    ],
    generate: function () {
      var self = this;
      self.files.forEach(function (f) {
        var u = makeDataURL(f.size, f.maskable);
        if (u) self.generated[f.name] = u;
      });
      self.ready = true;
      return self.generated;
    },
    download: function (name) {
      var self = this;
      if (!self.ready) self.generate();
      var list = name ? self.files.filter(function (f) { return f.name === name; }) : self.files;
      list.forEach(function (f, i) {
        var u = self.generated[f.name];
        if (!u) return;
        setTimeout(function () {
          var a = document.createElement("a");
          a.href = u;
          a.download = f.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, i * 260);
      });
      return list.length;
    },
    downloadSVG: function () {
      var pts = BOLT.map(function (p) { return (p[0] * 512).toFixed(1) + "," + (p[1] * 512).toFixed(1); }).join(" ");
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">' +
        '<defs><radialGradient id="bg" cx="42%" cy="34%" r="78%"><stop offset="0" stop-color="#111C31"/><stop offset="1" stop-color="#04070D"/></radialGradient>' +
        '<linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF5AA"/><stop offset=".45" stop-color="#FFD60A"/><stop offset="1" stop-color="#FFA800"/></linearGradient>' +
        '<clipPath id="round"><rect width="512" height="512" rx="112"/></clipPath></defs>' +
        '<g clip-path="url(#round)"><rect width="512" height="512" fill="url(#bg)"/>' +
        '<circle cx="256" cy="256" r="225" fill="none" stroke="#25D4EE" stroke-opacity=".20" stroke-width="3"/>' +
        '<polygon points="' + pts + '" fill="url(#bolt)"/>' +
        '<polygon points="' + pts + '" fill="none" stroke="#FFF5AA" stroke-opacity=".55" stroke-width="4"/></g></svg>';
      var b = new Blob([svg], { type: "image/svg+xml" });
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = "icon.svg";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 800);
    },
    install: function () {
      var self = this;
      meta("theme-color", "#04070D");
      meta("application-name", "MECADATA");
      meta("apple-mobile-web-app-title", "MECADATA");
      meta("mobile-web-app-capable", "yes");
      meta("apple-mobile-web-app-capable", "yes");
      meta("apple-mobile-web-app-status-bar-style", "black-translucent");
      meta("msapplication-TileColor", "#04070D");

      if (isWeb) {
        link("manifest", "manifest.webmanifest");
        link("icon", "icons/favicon-32.png", { type: "image/png", sizes: "32x32" });
        link("icon", "icons/favicon-16.png", { type: "image/png", sizes: "16x16" });
        link("icon", "icons/icon.svg", { type: "image/svg+xml" });
        link("apple-touch-icon", "icons/apple-touch-icon.png", { sizes: "180x180" });
        self.generate();
      } else {
        self.generate();
        if (self.generated["favicon-32.png"]) link("icon", self.generated["favicon-32.png"], { type: "image/png" });
        if (self.generated["apple-touch-icon.png"]) link("apple-touch-icon", self.generated["apple-touch-icon.png"]);
        var mf = {
          name: "MECADATA // INGÉNIEUR EXPERT",
          short_name: "MECADATA",
          start_url: "./index.html",
          display: "standalone",
          background_color: "#04070D",
          theme_color: "#04070D",
          icons: [
            { src: self.generated["icon-192.png"], sizes: "192x192", type: "image/png", purpose: "any" },
            { src: self.generated["icon-512.png"], sizes: "512x512", type: "image/png", purpose: "any" }
          ]
        };
        try {
          var b = new Blob([JSON.stringify(mf)], { type: "application/manifest+json" });
          link("manifest", URL.createObjectURL(b));
        } catch (e) {}
      }

      // Remplace le logo de l'en-tête par l'éclair jaune
      try {
        var mk = document.querySelectorAll(".logo .mk, #boot .mk");
        var u16 = self.generated["favicon-32.png"];
        if (u16) {
          for (var i = 0; i < mk.length; i++) {
            var img = document.createElement("img");
            img.src = u16;
            img.alt = "MECADATA";
            img.className = mk[i].getAttribute("class") || "mk";
            img.style.borderRadius = "8px";
            img.style.width = (mk[i].classList.contains("mk") && mk[i].parentNode.id === "boot") ? "58px" : "31px";
            img.style.height = img.style.width;
            mk[i].parentNode.replaceChild(img, mk[i]);
          }
        }
      } catch (e) {}
    },
    registerSW: function () {
      if (!isWeb) return;
      if (!("serviceWorker" in navigator)) return;
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(function () {});
      });
    }
  };

  window.MD_ICONS = ICONS;

  function boot() {
    try { ICONS.install(); } catch (e) {}
    try { ICONS.registerSW(); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
