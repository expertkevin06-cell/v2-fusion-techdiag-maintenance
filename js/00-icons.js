(function () {
  "use strict";
  var BOLT = [[0.615,0.055],[0.270,0.545],[0.470,0.545],[0.385,0.945],[0.745,0.415],[0.535,0.415],[0.690,0.055]];
  function draw(ctx, s, mask) {
    ctx.clearRect(0,0,s,s);
    ctx.save();
    if (!mask) {
      var r = s*0.22;
      ctx.beginPath();
      ctx.moveTo(r,0); ctx.lineTo(s-r,0); ctx.quadraticCurveTo(s,0,s,r);
      ctx.lineTo(s,s-r); ctx.quadraticCurveTo(s,s,s-r,s);
      ctx.lineTo(r,s); ctx.quadraticCurveTo(0,s,0,s-r);
      ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0); ctx.closePath(); ctx.clip();
    }
    var bg = ctx.createRadialGradient(s*0.42,s*0.34,0,s*0.42,s*0.34,s*0.95);
    bg.addColorStop(0,"#111C31"); bg.addColorStop(1,"#04070D");
    ctx.fillStyle=bg; ctx.fillRect(0,0,s,s);
    ctx.strokeStyle="rgba(37,212,238,.22)"; ctx.lineWidth=Math.max(1,s*0.006);
    ctx.beginPath(); ctx.arc(s*0.5,s*0.5,s*0.44,0,6.283); ctx.stroke();
    var k = mask?0.68:0.86;
    var pts = BOLT.map(function(p){return [(0.5+(p[0]-0.5)*k)*s,(0.5+(p[1]-0.5)*k)*s];});
    function path(){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();}
    ctx.save(); ctx.shadowColor="rgba(255,168,0,.85)"; ctx.shadowBlur=s*0.09;
    path(); ctx.fillStyle="#FFA800"; ctx.fill(); ctx.restore();
    var g=ctx.createLinearGradient(0,s*0.06,0,s*0.94);
    g.addColorStop(0,"#FFF5AA"); g.addColorStop(.45,"#FFD60A"); g.addColorStop(1,"#FFA800");
    path(); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle="rgba(255,245,170,.55)"; ctx.lineWidth=Math.max(1,s*0.008); path(); ctx.stroke();
    ctx.restore();
  }
  function url(s,mask){try{var c=document.createElement("canvas");c.width=c.height=s;var x=c.getContext("2d");if(!x)return null;draw(x,s,mask);return c.toDataURL("image/png");}catch(e){return null;}}
  var FILES=[["icon-192.png",192,false],["icon-512.png",512,false],["icon-maskable-192.png",192,true],["icon-maskable-512.png",512,true],["apple-touch-icon.png",180,true],["favicon-32.png",32,false],["favicon-16.png",16,false]];
  var I={gen:{},ready:false,
    generate:function(){var s=this;FILES.forEach(function(f){var u=url(f[1],f[2]);if(u)s.gen[f[0]]=u;});s.ready=true;return s.gen;},
    download:function(){var s=this;if(!s.ready)s.generate();FILES.forEach(function(f,i){var u=s.gen[f[0]];if(!u)return;setTimeout(function(){var a=document.createElement("a");a.href=u;a.download=f[0];document.body.appendChild(a);a.click();a.remove();},i*250);});return FILES.length;},
    install:function(){
      var s=this; s.generate();
      function link(rel,href,ex){var l=document.createElement("link");l.rel=rel;l.href=href;if(ex)Object.keys(ex).forEach(function(k){l.setAttribute(k,ex[k]);});document.head.appendChild(l);}
      if(/^https?:$/.test(location.protocol)){link("manifest","manifest.webmanifest");link("icon","icons/favicon-32.png",{type:"image/png",sizes:"32x32"});link("apple-touch-icon","icons/apple-touch-icon.png",{sizes:"180x180"});}
      else if(s.gen["favicon-32.png"]) link("icon",s.gen["favicon-32.png"],{type:"image/png"});
      try{var b=document.querySelector("#boot img");if(b&&s.gen["icon-192.png"])b.src=s.gen["icon-192.png"];}catch(e){}
    }};
  window.MD_ICONS=I;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){I.install();});else I.install();
})();
