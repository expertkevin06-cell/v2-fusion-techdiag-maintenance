/* 00-icons.js — export d'icônes PWA (optionnel, ne bloque jamais le démarrage) */
(function(){
"use strict";
function png(size){
  var c=document.createElement("canvas");c.width=c.height=size;var x=c.getContext("2d");
  if(!x)return null;
  x.fillStyle="#0C1424";x.fillRect(0,0,size,size);
  var g=x.createLinearGradient(0,0,0,size);g.addColorStop(0,"#FFF5AA");g.addColorStop(.45,"#FFD60A");g.addColorStop(1,"#FFA800");
  x.fillStyle=g;var s=size/512;x.beginPath();
  x.moveTo(314.9*s,28.2*s);x.lineTo(138.2*s,279*s);x.lineTo(240.6*s,279*s);x.lineTo(197.1*s,483.8*s);x.lineTo(381.4*s,212.5*s);x.lineTo(273.9*s,212.5*s);x.lineTo(353.3*s,28.2*s);x.closePath();x.fill();
  try{return c.toDataURL("image/png");}catch(e){return null;}
}
window.MD_ICONS={
  download:function(){
    var n=0,sizes=[192,512,180];
    sizes.forEach(function(sz){var d=png(sz);if(d){var a=document.createElement("a");a.href=d;a.download="icon-"+sz+".png";document.body.appendChild(a);a.click();a.remove();n++;}});
    return n;
  },
  png:png
};
window.MD_ICONS_OK=true;
})();
