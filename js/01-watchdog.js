/* 01-watchdog.js — SOCLE UNIQUE : aides, stockage multi-couches, moteur graphique,
   piège à erreurs, retrait forcé du boot. Source de vérité de tous les globaux
   consommés par 04-app.js. Aucune dépendance vers 02/03/04. */
(function(){
"use strict";
var ERRORS=[];window.MD_ERRORS=ERRORS;
var SCRIPTS={icons:false,watchdog:false,data:false,app:false};window.MD_SCRIPTS=SCRIPTS;
var PREF={sound:true};window.MD_PREF=PREF;

/* ── aides pures ── */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function fmt(n){n=+n||0;return String(n).replace(/\B(?=(\d{3})+(?!\d))/g," ");}
function clamp(v,a,b){v=+v;return v<a?a:(v>b?b:v);}
function uid(p){return (p||"")+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function clone(o){try{return JSON.parse(JSON.stringify(o));}catch(e){return o;}}
function ov(a,b){return (a[0]<=(b[1]||0))&&(b[0]<=(a[1]||0));}
function ic(name,extra){return "<svg class=\"ic\""+(extra?" style=\""+extra+"\"":"")+"><use href=\"#i-"+name+"\"/></svg>";}
function deb(fn,ms){var t;return function(){var a=arguments,c=this;clearTimeout(t);t=setTimeout(function(){fn.apply(c,a);},ms||120);};}
function split(v){if(Array.isArray(v))return v.filter(function(x){return x!==""&&x!=null;});
  if(v==null)return [];return String(v).split(/[|;\n]+/).map(function(s){return s.trim();}).filter(Boolean);}
function nk(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function slug(s){return nk(s).replace(/ /g,"-").replace(/^-|-$/g,"")||"x";}
function safe(fn,fb){try{return fn();}catch(e){logErr("safe",e);return typeof fb==="function"?fb():fb;}}
function logErr(tag,err){var m=(err&&err.message)?err.message:String(err);ERRORS.push({t:Date.now(),tag:tag,m:m});if(ERRORS.length>200)ERRORS.shift();
  try{console.error("["+tag+"]",m,err);}catch(e){}
  var w=$("#verwarn");/* pas de bandeau dédié : on garde trace pour le diagnostic */}

/* ── téléchargement ── */
function download(name,text){try{
  var blob=new Blob([text],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},300);
}catch(e){logErr("download",e);}}

/* ── bips WebAudio (jamais bloquants) ── */
var AC=null;
function beep(kind){if(!PREF.sound)return;try{
  AC=AC||(window.AudioContext||window.webkitAudioContext)?new (window.AudioContext||window.webkitAudioContext)():null;
  if(!AC)return;var o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);
  var f={ok:660,err:220,warn:440,info:520,imp:880,tick:330,open:540,close:400,del:260}[kind]||500;
  o.frequency.value=f;o.type=kind==="err"?"sawtooth":"sine";g.gain.value=.04;
  o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.12);o.stop(AC.currentTime+.13);
}catch(e){}}

/* ── toasts ── */
function toast(kind,title,msg,sticky){var box=$("#ts");if(!box)return;
  var el=document.createElement("div");el.className="to "+kind;
  el.innerHTML=ic(kind==="ok"?"check":(kind==="err"?"alert":(kind==="warn"?"bell":"info")),"width:16px;height:16px")+
    "<div style='flex:1;min-width:0'><b>"+esc(title)+"</b>"+(msg?"<p>"+esc(msg)+"</p>":"")+"</div><button class='tb' style='width:24px;height:24px;border:0;background:none' data-x='1'>"+ic("x","width:12px;height:12px")+"</button>"+
    (sticky?"":"<span class='pg' style='animation-duration:5s'></span>");
  box.appendChild(el);
  var kill=function(){el.classList.add("out");setTimeout(function(){el.remove();},260);};
  el.querySelector("[data-x]").addEventListener("click",kill);
  if(!sticky)setTimeout(kill,5000);
  while(box.children.length>4)box.firstChild.remove();
}

/* ── modales ── */
var MODAL=null;
function openModal(html,size){var m=$("#md");if(!m)return;MODAL=true;
  m.innerHTML="<div class='ms' data-act='mscrim'><div class='mo "+(size||"")+"'>"+html+"</div></div>";
  document.body.classList.add("lock");requestAnimationFrame(function(){m.classList.add("on");});}
function closeModal(){var m=$("#md");if(!m)return;m.classList.remove("on");MODAL=null;
  if(!$("#dr").classList.contains("on"))document.body.classList.remove("lock");
  setTimeout(function(){if(!MODAL)m.innerHTML="";},260);}
function modalOpen(){return !!MODAL;}
function confirmModal(title,msg,act,label){
  openModal("<div class='mh'>"+ic("alert","color:#FF4D5E")+"<h3>"+esc(title)+"</h3></div><div class='mb2'><p class='muted'>"+esc(msg)+"</p></div><div class='mf'><button class='btn ghost' data-act='mclose'>Annuler</button><button class='btn dgr' data-act='"+act+"'>"+esc(label||"Confirmer")+"</button></div>","slim");
}

/* ── stockage multi-couches : mémoire + localStorage + IndexedDB (miroir) ── */
var MEM={},LS_OK=false,IDB=null,IDB_NAME="mecadata",IDB_STORE="kv";
try{localStorage.setItem("__t","1");localStorage.removeItem("__t");LS_OK=true;}catch(e){LS_OK=false;}
var SS_OK=false;try{sessionStorage.setItem("__t","1");sessionStorage.removeItem("__t");SS_OK=true;}catch(e){}
var STORE={
  session:SS_OK,
  any:function(){return LS_OK||IDB||Object.keys(MEM).length>0;},
  backend:function(){return IDB?"IndexedDB":(LS_OK?"localStorage":"mémoire");},
  get:function(k){if(MEM[k]!==undefined)return MEM[k];
    if(LS_OK){var v=safe("ls.get",function(){return localStorage.getItem(k);},null);if(v!=null){MEM[k]=v;return v;}}return null;},
  set:function(k,v){MEM[k]=v;
    if(LS_OK)safe("ls.set",function(){localStorage.setItem(k,v);},null);
    if(IDB)safe("idb.set",function(){var tx=IDB.transaction(IDB_STORE,"readwrite");tx.objectStore(IDB_STORE).put(v,k);},null);
    return true;},
  del:function(k){delete MEM[k];if(LS_OK)safe("ls.del",function(){localStorage.removeItem(k);},null);
    if(IDB)safe("idb.del",function(){var tx=IDB.transaction(IDB_STORE,"readwrite");tx.objectStore(IDB_STORE).delete(k);},null);},
  idbInit:function(){return new Promise(function(res){
    if(!window.indexedDB){res(false);return;}
    var req;try{req=indexedDB.open(IDB_NAME,1);}catch(e){res(false);return;}
    req.onupgradeneeded=function(){var db=req.result;if(!db.objectStoreNames.contains(IDB_STORE))db.createObjectStore(IDB_STORE);};
    req.onsuccess=function(){IDB=req.result;
      safe("idb.hydrate",function(){var tx=IDB.transaction(IDB_STORE,"readonly"),os=tx.objectStore(IDB_STORE),r=os.openCursor();
        r.onsuccess=function(){var c=r.result;if(c){if(MEM[c.key]===undefined)MEM[c.key]=c.value;c.continue();}};},null);
      res(true);};
    req.onerror=function(){res(false);};
    setTimeout(function(){if(!IDB)res(false);},2500);
  });},
  idbGet:function(k){return new Promise(function(res){
    var m=STORE.get(k);if(m!=null){res(m);return;}
    if(!IDB){res(null);return;}
    try{var tx=IDB.transaction(IDB_STORE,"readonly"),r=tx.objectStore(IDB_STORE).get(k);
      r.onsuccess=function(){res(r.result||null);};r.onerror=function(){res(null);};
    }catch(e){res(null);}
  });}
};

/* ── moteur graphique fond d'écran (API exacte consommée par 04-app) ── */
var TH={
  arctic:{n:"Arctique",a:"#25D4EE",b:"#4D8DFF",c:"#E45CFF",bg:"#04070D"},
  solar:{n:"Solaire",a:"#FFD60A",b:"#FFAF2E",c:"#FF7A3D",bg:"#0A0703"},
  bio:{n:"Biome",a:"#43E08B",b:"#19B8A6",c:"#A8E63C",bg:"#03120C"},
  violet:{n:"Nébuleuse",a:"#E45CFF",b:"#7A5CFF",c:"#25D4EE",bg:"#0A0614"},
  steel:{n:"Acier",a:"#9FB2C8",b:"#4D8DFF",c:"#25D4EE",bg:"#070B12"},
  ember:{n:"Braise",a:"#FF4D5E",b:"#FFAF2E",c:"#FFD60A",bg:"#120606"},
  mono:{n:"Mono",a:"#E6EEF9",b:"#9FB2C8",c:"#61748C",bg:"#05070B"},
  deep:{n:"Profond",a:"#19B8A6",b:"#4D8DFF",c:"#E45CFF",bg:"#02060E"}
};
var MODES=[["grid","Grille"],["waves","Vagues"],["parts","Particules"],["circuit","Circuit"],["radar","Radar"],["nebula","Nébuleuse"],["scan","Balayage"],["topo","Topographie"]];
var PRESETS={
  "Atelier":[{mode:"grid",theme:"steel",speed:40,density:50,count:120,glow:40,blur:0,stroke:1,drift:20,grid:true,grain:true,scan:false,vig:true}],
  "Nuit EV":[{mode:"nebula",theme:"violet",speed:25,density:70,count:220,glow:70,blur:2,stroke:1,drift:35,grid:false,grain:true,scan:false,vig:true}],
  "Diagnostic":[{mode:"radar",theme:"arctic",speed:60,density:40,count:90,glow:55,blur:0,stroke:1.4,drift:10,grid:true,grain:false,scan:true,vig:true}],
  "Carbone":[{mode:"topo",theme:"mono",speed:30,density:60,count:140,glow:25,blur:1,stroke:1,drift:25,grid:false,grain:true,scan:false,vig:true}]
};
var WP={
  P:{mode:"grid",theme:"arctic",useCustom:false,custom:{bg:"#04070D",a:"#25D4EE",b:"#4D8DFF",c:"#E45CFF",d:"#FFD60A"},
     speed:50,density:55,count:140,turb:30,scale:60,glow:45,blur:0,stroke:1.2,drift:25,dir:1,quality:"std",format:"free",
     grid:true,grain:true,scan:false,vig:true,run:true,bg:true},
  fails:0,TH:TH,MODES:MODES,PRESETS:PRESETS,_cv:null,_ctx:null,_pv:null,_pvctx:null,_raf:0,_t:0,_pts:null,_bgc:null,
  pal:function(){var p=this.P;if(p.useCustom)return {a:p.custom.a,b:p.custom.b,c:p.custom.c,d:p.custom.d,bg:p.custom.bg};
    var t=TH[p.theme]||TH.arctic;return {a:t.a,b:t.b,c:t.c,d:t.a,bg:t.bg};},
  label:function(k,v){if(k==="speed"||k==="drift"||k==="turb"||k==="glow"||k==="density")return Math.round(v)+"%";
    if(k==="count")return Math.round(v);if(k==="scale")return Math.round(v)+"px";if(k==="blur")return (+v).toFixed(1);
    if(k==="stroke")return (+v).toFixed(1)+"px";return String(v);},
  _seedPts:function(){var p=this.P,n=Math.max(8,Math.round(p.count*(p.density/100)));var a=[];
    for(var i=0;i<n;i++)a.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5),vy:(Math.random()-.5),r:Math.random(),s:Math.random()});this._pts=a;},
  sync:function(){var h=$("#hud");if(!h)return;var p=this.P,pa=this.pal();
    h.innerHTML="<span>"+p.mode+"</span><span>"+(p.useCustom?"perso":p.theme)+"</span><span>vit "+Math.round(p.speed)+"</span><span>n "+(this._pts?this._pts.length:0)+"</span><span style='color:"+pa.a+"'>●</span>";},
  apply:function(){if(!this._pts)this._seedPts();this.sync();},
  set:function(k,v){var p=this.P;if(k==="count"||k==="density"||k==="speed"||k==="turb"||k==="scale"||k==="glow"||k==="blur"||k==="stroke"||k==="drift"||k==="dir")v=+v;
    p[k]=v;if(k==="count"||k==="density")this._seedPts();this.drawAll();markDirtyWP();},
  setCustom:function(k,v){this.P.custom[k]=v;this.P.useCustom=true;this.drawAll();markDirtyWP();},
  drawAll:function(){this._frame(this._ctx,this._cv?this._cv.width:0,this._cv?this._cv.height:0,this._t,true);
    if(this._pvctx)this._frame(this._pvctx,this._pv.width,this._pv.height,this._t,true);},
  attach:function(cv){this._pv=cv;this._pvctx=safe("pvctx",function(){return cv.getContext("2d");},null);this.resize();this.sync();},
  detach:function(){this._pv=null;this._pvctx=null;},
  fx:function(){if(this._pvctx)this._frame(this._pvctx,this._pv.width,this._pv.height,this._t,false);},
  resize:function(){var cv=this._cv||$("#bgc");if(!cv)return;this._cv=cv;
    var q=this.P.quality==="ultra"?2:(this.P.quality==="std"?1.5:1);
    var w=cv.clientWidth||window.innerWidth,h=cv.clientHeight||window.innerHeight;
    cv.width=Math.max(2,Math.round(w*q));cv.height=Math.max(2,Math.round(h*q));
    this._ctx=safe("ctx",function(){return cv.getContext("2d");},null);
    if(this._pv){var pw=this._pv.clientWidth||300,ph=this._pv.clientHeight||200;this._pv.width=Math.round(pw*1.5);this._pv.height=Math.round(ph*1.5);}
    this.drawAll();},
  _frame:function(ctx,w,h,t,force){
    if(!ctx||!w||!h){if(force)this.fails++;return;}
    var p=this.P,pa=this.pal(),i;
    var g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,pa.bg);g.addColorStop(.5,shade(pa.bg,-6));g.addColorStop(1,pa.bg);
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    if(p.blur>0){ctx.save();ctx.filter="blur("+p.blur+"px)";}
    var sc=p.scale/60,spd=p.speed/100,dr=p.drift/100,tb=p.turb/100;
    ctx.globalCompositeOperation="lighter";
    if(p.mode==="grid"||p.mode==="circuit"){
      ctx.strokeStyle=alpha(pa.a,.18+.2*(p.glow/100));ctx.lineWidth=p.stroke;
      var step=Math.max(14,p.scale*2);
      for(i=0;i<w+step;i+=step){var ox=((t*spd*30*dr)%step);ctx.beginPath();ctx.moveTo(i-ox,0);ctx.lineTo(i-ox,h);ctx.stroke();}
      for(i=0;i<h+step;i+=step){var oy=((t*spd*20*dr)%step);ctx.beginPath();ctx.moveTo(0,i-oy);ctx.lineTo(w,i-oy);ctx.stroke();}
      if(this._pts){ctx.fillStyle=alpha(pa.b,.5);for(i=0;i<this._pts.length;i++){var q=this._pts[i];
        var px=(q.x*w+Math.sin(t*.001*spd+q.r*6)*tb*40)%w,py=(q.y*h+Math.cos(t*.0012*spd+q.s*6)*tb*40)%h;
        ctx.beginPath();ctx.arc(px<0?px+w:px,py<0?py+h:py,p.stroke*1.6,0,7);ctx.fill();}}
    } else if(p.mode==="waves"||p.mode==="topo"){
      for(var L=0;L<5;L++){ctx.strokeStyle=alpha([pa.a,pa.b,pa.c][L%3],.25);ctx.lineWidth=p.stroke;ctx.beginPath();
        for(i=0;i<=w;i+=6){var yy=h*(.25+L*.13)+Math.sin(i*.01/sc+t*.001*spd+L)*h*.05*(1+tb)+Math.cos(i*.004+t*.0007*spd)*h*.03;
          if(i===0)ctx.moveTo(i,yy);else ctx.lineTo(i,yy);}ctx.stroke();}
    } else if(p.mode==="parts"||p.mode==="nebula"){
      if(!this._pts)this._seedPts();
      for(i=0;i<this._pts.length;i++){var pt=this._pts[i];
        pt.x+=(pt.vx*spd*.0006*p.dir)+(Math.sin(t*.001+i)*tb*.0004);pt.y+=pt.vy*spd*.0006;
        if(pt.x<0)pt.x+=1;if(pt.x>1)pt.x-=1;if(pt.y<0)pt.y+=1;if(pt.y>1)pt.y-=1;
        var rr=(2+pt.r*p.scale*.06)*(1+p.glow/200);
        var rg=ctx.createRadialGradient(pt.x*w,pt.y*h,0,pt.x*w,pt.y*h,rr*3);
        rg.addColorStop(0,alpha([pa.a,pa.b,pa.c][i%3],.5));rg.addColorStop(1,alpha(pa.a,0));
        ctx.fillStyle=rg;ctx.beginPath();ctx.arc(pt.x*w,pt.y*h,rr*3,0,7);ctx.fill();}
    } else if(p.mode==="radar"){
      var cx=w/2,cy=h/2,R=Math.min(w,h)*.42;
      ctx.strokeStyle=alpha(pa.a,.25);ctx.lineWidth=p.stroke;
      for(i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,R*i/4,0,7);ctx.stroke();}
      var ang=(t*.001*spd*p.dir)%(Math.PI*2);
      var rg2=ctx.createConicGradient?ctx.createConicGradient(ang,cx,cy):null;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
      var lg=ctx.createLinearGradient(0,0,R,0);lg.addColorStop(0,alpha(pa.b,.5));lg.addColorStop(1,alpha(pa.b,0));
      ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,-.3,0);ctx.closePath();ctx.fill();ctx.restore();
      if(rg2){ctx.fillStyle=rg2;}
    } else { /* scan */
      var sy=((t*.0008*spd*p.dir)%1)*h;
      var sg=ctx.createLinearGradient(0,sy-40,0,sy+40);sg.addColorStop(0,alpha(pa.a,0));sg.addColorStop(.5,alpha(pa.a,.4));sg.addColorStop(1,alpha(pa.a,0));
      ctx.fillStyle=sg;ctx.fillRect(0,sy-40,w,80);
      ctx.strokeStyle=alpha(pa.c,.15);ctx.lineWidth=1;for(i=0;i<h;i+=6){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke();}
    }
    ctx.globalCompositeOperation="source-over";
    if(p.grid&&(p.mode!=="grid"&&p.mode!=="circuit")){ctx.strokeStyle=alpha(pa.a,.06);ctx.lineWidth=1;
      var st2=Math.max(20,p.scale*2);for(i=0;i<w;i+=st2){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke();}for(i=0;i<h;i+=st2){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke();}}
    if(p.scan&&p.mode!=="scan"){var sy2=((t*.0006)%1)*h;ctx.fillStyle=alpha(pa.b,.05);ctx.fillRect(0,sy2,w,2);}
    if(p.grain){ctx.fillStyle=alpha("#ffffff",.02);for(i=0;i<60;i++){ctx.fillRect(Math.random()*w,Math.random()*h,1,1);}}
    if(p.vig){var vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.55)");ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);}
    if(p.blur>0)ctx.restore();
  },
  _loop:function(ts){WP._t=ts||0;if(WP.P.run&&WP._ctx){WP._frame(WP._ctx,WP._cv.width,WP._cv.height,WP._t,false);
    if(WP._pvctx)WP._frame(WP._pvctx,WP._pv.width,WP._pv.height,WP._t,false);}
    WP._raf=requestAnimationFrame(WP._loop);},
  init:function(){this._cv=$("#bgc");this._seedPts();
    var self=this;window.addEventListener("resize",deb(function(){self.resize();},200));
    this.resize();this._raf=requestAnimationFrame(this._loop);},
  randomize:function(){var p=this.P;p.mode=MODES[Math.floor(Math.random()*MODES.length)][0];
    var tk=Object.keys(TH);p.theme=tk[Math.floor(Math.random()*tk.length)];p.useCustom=false;
    p.speed=20+Math.random()*80;p.density=30+Math.random()*60;p.count=80+Math.random()*250;p.turb=Math.random()*80;p.glow=Math.random()*100;
    this._seedPts();this.drawAll();markDirtyWP();},
  reset:function(){this.P={mode:"grid",theme:"arctic",useCustom:false,custom:{bg:"#04070D",a:"#25D4EE",b:"#4D8DFF",c:"#E45CFF",d:"#FFD60A"},
    speed:50,density:55,count:140,turb:30,scale:60,glow:45,blur:0,stroke:1.2,drift:25,dir:1,quality:"std",format:"free",grid:true,grain:true,scan:false,vig:true,run:true,bg:true};
    this._seedPts();this.drawAll();markDirtyWP();},
  exportPNG:function(){var c=document.createElement("canvas"),FMT={free:[1600,900],mobile:[1170,2532],tablet:[1668,2224],desktop:[1920,1080]};
    var sz=FMT[this.P.format]||FMT.free;c.width=sz[0];c.height=sz[1];var x=c.getContext("2d");
    if(!x){toast("err","Export impossible","Canvas indisponible.");return;}
    safe("png",function(){WP._frame(x,c.width,c.height,WP._t,true);
      var url=c.toDataURL("image/png"),a=document.createElement("a");a.href=url;a.download="mecadata_fond_"+WP.P.mode+".png";document.body.appendChild(a);a.click();a.remove();
      toast("ok","Fond exporté",sz[0]+"×"+sz[1]);},null);
  }
};
function shade(hex,amt){var c=hex.replace("#","");if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  var r=clamp(parseInt(c.slice(0,2),16)+amt,0,255),g=clamp(parseInt(c.slice(2,4),16)+amt,0,255),b=clamp(parseInt(c.slice(4,6),16)+amt,0,255);
  return "#"+[r,g,b].map(function(v){return ("0"+v.toString(16)).slice(-2);}).join("");}
function alpha(hex,a){var c=hex.replace("#","");if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  return "rgba("+parseInt(c.slice(0,2),16)+","+parseInt(c.slice(2,4),16)+","+parseInt(c.slice(4,6),16)+","+a+")";}
var _dirtyWP=false,_wpSave=null;
function markDirtyWP(){_dirtyWP=true;if(_wpSave)_wpSave();}
window.MD_markDirtyWP=markDirtyWP;window.MD_flushWP=function(fn){_wpSave=fn;};

/* ── retrait forcé du boot (appelé par 04 au succès, et par le chargeur en secours) ── */
window.__MD_LIFT=function(){var b=$("#boot");if(b)b.className="off";};

/* ── exposition des globaux requis ── */
window.MD_$=$;window.MD_$$=$$;window.MD_esc=esc;window.MD_fmt=fmt;window.MD_clamp=clamp;window.MD_uid=uid;window.MD_clone=clone;
window.MD_ov=ov;window.MD_ic=ic;window.MD_deb=deb;window.MD_split=split;window.MD_nk=nk;window.MD_slug=slug;window.MD_safe=safe;window.MD_logErr=logErr;
window.MD_STORE=STORE;window.MD_download=download;window.MD_beep=beep;window.MD_toast=toast;
window.MD_openModal=openModal;window.MD_closeModal=closeModal;window.MD_confirmModal=confirmModal;window.MD_modalOpen=modalOpen;
window.MD_WP=WP;
SCRIPTS.watchdog=true;window.MD_WATCHDOG_OK=true;
})();
