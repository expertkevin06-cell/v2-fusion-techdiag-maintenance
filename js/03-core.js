(function(){
"use strict";
if(!Object.keys)Object.keys=function(o){var a=[],k;for(k in o)if(Object.prototype.hasOwnProperty.call(o,k))a.push(k);return a;};
if(!Array.prototype.includes)Array.prototype.includes=function(v){return this.indexOf(v)>-1;};
if(!String.prototype.padStart)String.prototype.padStart=function(n,p){var s=String(this);p=String(p||" ");while(s.length<n)s=p+s;return s.slice(-Math.max(n,s.length));};
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var EM={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return EM[c];});};
var fmt=function(n){n=Number(n||0);try{return n.toLocaleString("fr-FR");}catch(e){return String(n);}};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var uid=function(p){return p+Math.random().toString(36).slice(2,7).toUpperCase();};
var clone=function(o){return JSON.parse(JSON.stringify(o));};
var ov=function(a,b){return a[0]<=b[1]&&b[0]<=a[1];};
var ic=function(n,st){return "<svg class='ic'"+(st?" style='"+st+"'":"")+"><use href='#i-"+n+"'/></svg>";};
var deb=function(f,t){var h;return function(){var a=arguments,s=this;clearTimeout(h);h=setTimeout(function(){f.apply(s,a);},t);};};
var split=function(v){return Array.isArray(v)?v:String(v||"").split(/[;,|]/).map(function(s){return s.trim();}).filter(Boolean);};
var nk=function(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");};
var slug=function(s){return nk(s).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||uid("x");};
var hex=function(a){return clamp(Math.round(a*255),0,255).toString(16).padStart(2,"0");};
var ERRORS=[];
function logErr(w,e){var m=w+" : "+((e&&e.message)?e.message:String(e));ERRORS.push({ts:Date.now(),m:m});if(ERRORS.length>50)ERRORS.shift();try{window.__MD_ERR.push({msg:m,src:"core",line:0,col:0});}catch(x){}}
window.addEventListener("error",function(e){logErr("window",e.error||e.message);});
window.addEventListener("unhandledrejection",function(e){logErr("promise",e.reason);});
function safe(w,f,fb){try{return f();}catch(e){logErr(w,e);return fb;}}
var MEM={};
var STORE={local:false,session:false,
probe:function(){try{localStorage.setItem("__m","1");localStorage.removeItem("__m");this.local=true;}catch(e){}try{sessionStorage.setItem("__m","1");sessionStorage.removeItem("__m");this.session=true;}catch(e){}},
get:function(k){if(this.local){try{return localStorage.getItem(k);}catch(e){}}return MEM[k]||null;},
set:function(k,v){if(this.local){try{localStorage.setItem(k,v);return true;}catch(e){this.local=false;}}MEM[k]=v;return true;},
del:function(k){if(this.local){try{localStorage.removeItem(k);}catch(e){}}delete MEM[k];},
sget:function(k){if(this.session){try{return sessionStorage.getItem(k);}catch(e){}}return MEM["s:"+k]||null;},
sset:function(k,v){if(this.session){try{sessionStorage.setItem(k,v);return;}catch(e){}}MEM["s:"+k]=v;},
sdel:function(k){if(this.session){try{sessionStorage.removeItem(k);}catch(e){}}delete MEM["s:"+k];}};
STORE.probe();
function download(n,c,m){safe("dl",function(){var b=new Blob([c],{type:m||"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},700);},null);}
var PREF={sound:true};
var AU={ctx:null};
function beep(k){if(!PREF.sound)return;safe("audio",function(){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AU.ctx=AU.ctx||new C();if(AU.ctx.state==="suspended")AU.ctx.resume();
var c=AU.ctx,t=c.currentTime,p=function(f0,f1,d,ty,g,dt){dt=dt||0;var o=c.createOscillator(),v=c.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t+dt);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dt+d);v.gain.setValueAtTime(0,t+dt);v.gain.linearRampToValueAtTime(g,t+dt+0.008);v.gain.exponentialRampToValueAtTime(0.0001,t+dt+d);o.connect(v);v.connect(c.destination);o.start(t+dt);o.stop(t+dt+d+0.03);};
if(k==="tick")p(1700,1400,0.045,"square",0.03);else if(k==="open")p(320,560,0.09,"sine",0.045);else if(k==="close")p(520,300,0.08,"sine",0.035);
else if(k==="ok"){p(660,0,0.09,"sine",0.055);p(990,0,0.14,"sine",0.055,0.09);}else if(k==="err")p(150,110,0.2,"sawtooth",0.06);
else if(k==="del")p(240,110,0.14,"square",0.045);else if(k==="imp"){p(520,0,0.08,"sine",0.045);p(660,0,0.08,"sine",0.045,0.08);p(880,0,0.16,"sine",0.05,0.16);}},null);}
function toast(type,title,msg,undo){var box=$("#ts");if(!box)return;while(box.children.length>=3)box.removeChild(box.firstChild);
var el=document.createElement("div");el.className="to "+type;
var h=ic({ok:"check",err:"alert",warn:"alert",info:"info"}[type]||"info")+"<div style='flex:1;min-width:0'><b>"+esc(title)+"</b>"+(msg?"<p>"+esc(msg)+"</p>":"")+"</div>";
if(undo)h+="<button class='btn xs amb' data-act='undo'>Annuler</button>";
h+="<span class='pg' style='animation-duration:"+(undo?8:4.6)+"s'></span>";el.innerHTML=h;box.appendChild(el);
var kill=function(){el.classList.add("out");setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},260);};
el._t=setTimeout(kill,undo?8000:4600);
el.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("[data-act=undo]")){clearTimeout(el._t);kill();}});}
var modalOpen=false;
function openModal(html,cls){var r=$("#md");r.innerHTML="<div class='ms' data-act='mscrim'><div class='mo "+(cls||"")+"'>"+html+"</div></div>";requestAnimationFrame(function(){r.classList.add("on");});document.body.classList.add("lock");modalOpen=true;beep("open");var f=r.querySelector("input,select,textarea,button");if(f)setTimeout(function(){f.focus();},80);}
function closeModal(){var r=$("#md");if(!r.innerHTML)return;r.classList.remove("on");modalOpen=false;if(!window.MD_STATE||!window.MD_STATE.drawer)document.body.classList.remove("lock");setTimeout(function(){if(!modalOpen)r.innerHTML="";},220);beep("close");}
function confirmModal(t,m,a,l){openModal("<div class='mh'>"+ic("alert","color:#FFAF2E")+"<h3>"+esc(t)+"</h3><button class='tb' data-act='mclose'>"+ic("x")+"</button></div><div class='mb2'><p class='muted'>"+esc(m)+"</p></div><div class='mf'><button class='btn ghost' data-act='mclose'>Annuler</button><button class='btn dgr' data-act='"+a+"'>"+esc(l||"Confirmer")+"</button></div>","slim");}

/* ── STUDIO : 8 scènes, palette pilotable ── */
var WP={
P:{mode:"nebula",theme:"diag",useCustom:false,custom:{bg:"#04070D",a:"#FFD60A",b:"#25D4EE",c:"#E45CFF",d:"#43E08B"},
density:64,count:150,speed:100,turb:38,scale:66,glow:60,blur:0,stroke:1.4,drift:40,dir:1,quality:"std",format:"free",
grid:true,grain:true,scan:true,vig:true,run:true,bg:true},
TH:{diag:{n:"Diagnostic",bg:"#04070D",a:"#FFD60A",b:"#25D4EE",c:"#E45CFF",d:"#43E08B"},
torque:{n:"Couple",bg:"#0B0603",a:"#FFAF2E",b:"#FF7A3D",c:"#FF4D5E",d:"#FFD98A"},
acid:{n:"Acide",bg:"#040A06",a:"#A8E63C",b:"#43E08B",c:"#25D4EE",d:"#E4FF7A"},
plasma:{n:"Plasma",bg:"#08040F",a:"#E45CFF",b:"#8F7CFF",c:"#25D4EE",d:"#FF6FB1"},
ocean:{n:"Océan",bg:"#02080C",a:"#19B8A6",b:"#4D8DFF",c:"#25D4EE",d:"#7CE8D0"},
steel:{n:"Acier",bg:"#070A0E",a:"#9FB2C8",b:"#5F7288",c:"#25D4EE",d:"#E6EEF9"},
ember:{n:"Braise",bg:"#0A0405",a:"#FF4D5E",b:"#FF7A3D",c:"#FFAF2E",d:"#FFC9A8"},
violet:{n:"Violet",bg:"#06040F",a:"#8F7CFF",b:"#E45CFF",c:"#4D8DFF",d:"#C9BFFF"}},
MODES:[["nebula","NEBULA"],["aurora","AURORA"],["flux","FLUX"],["grid","GRILLE"],["radar","RADAR"],["scope","SCOPE"],["gears","MÉCA"],["tunnel","TUNNEL"]],
PRESETS:{"Nebula or":{mode:"nebula",theme:"diag",density:66,count:160,speed:80,turb:40,scale:70,glow:66,stroke:1.4,drift:42,dir:1},
"Braise lente":{mode:"aurora",theme:"ember",density:72,count:120,speed:45,turb:26,scale:88,glow:74,stroke:1.2,drift:24,dir:1},
"Tunnel acide":{mode:"tunnel",theme:"acid",density:60,count:140,speed:140,turb:30,scale:60,glow:62,stroke:1.6,drift:30,dir:1},
"Radar atelier":{mode:"radar",theme:"acid",density:60,count:110,speed:85,turb:30,scale:70,glow:70,stroke:1.6,drift:30,dir:1},
"Scope 4 cyl":{mode:"scope",theme:"acid",density:66,count:100,speed:130,turb:52,scale:60,glow:66,stroke:1.6,drift:18,dir:1},
"Méca couple":{mode:"gears",theme:"torque",density:60,count:90,speed:80,turb:24,scale:74,glow:52,stroke:1.6,drift:22,dir:1},
"Grille acier":{mode:"grid",theme:"steel",density:55,count:80,speed:60,turb:20,scale:48,glow:34,stroke:1.2,drift:26,dir:1},
"Flux océan":{mode:"flux",theme:"ocean",density:68,count:170,speed:110,turb:48,scale:64,glow:58,stroke:1.2,drift:34,dir:1}},
targets:[],raf:0,t:0,last:0,running:false,fails:0,
pal:function(){if(this.P.useCustom){var c=this.P.custom;return {n:"Personnalisée",bg:c.bg,a:c.a,b:c.b,c:c.c,d:c.d};}return this.TH[this.P.theme]||this.TH.diag;},
init:function(){var cv=$("#bgc");if(cv){var cx=safe("ctx",function(){return cv.getContext("2d");},null);if(cx)this.targets.push({cv:cv,ctx:cx,scale:0.5,W:0,H:0,st:null,key:""});}
this.resize();var s=this;window.addEventListener("resize",deb(function(){s.resize();},150));
document.addEventListener("visibilitychange",function(){if(document.hidden)s.stop();else if(s.P.run)s.start();});
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)this.P.run=false;this.apply();},
attach:function(cv){this.targets=this.targets.filter(function(t){return t.cv.id==="bgc";});if(cv){var cx=safe("ctx2",function(){return cv.getContext("2d");},null);if(cx)this.targets.push({cv:cv,ctx:cx,scale:1,W:0,H:0,st:null,key:"",preview:true});}this.resize();if(this.P.run)this.start();else this.drawAll();},
detach:function(){this.targets=this.targets.filter(function(t){return !t.preview;});},
q:function(){return this.P.quality==="eco"?1:(this.P.quality==="ultra"?2:1.5);},
resize:function(){var d=Math.min(window.devicePixelRatio||1,this.q());this.targets.forEach(function(t){var w=t.preview?(t.cv.clientWidth||640):window.innerWidth,h=t.preview?(t.cv.clientHeight||330):window.innerHeight;t.W=Math.max(1,w);t.H=Math.max(1,h);t.cv.width=Math.round(t.W*d);t.cv.height=Math.round(t.H*d);safe("tr",function(){t.ctx.setTransform(d,0,0,d,0,0);});t.key="";});this.drawAll();},
set:function(k,v){this.P[k]=v;if(k==="quality")this.resize();if(["mode","count","scale","density"].indexOf(k)>-1)this.targets.forEach(function(t){t.key="";});this.fx();if(k==="run"){if(v)this.start();else this.stop();}this.drawAll();if(window.MD_saveState)window.MD_saveState();this.sync();},
setCustom:function(k,v){this.P.custom[k]=v;this.P.useCustom=true;this.drawAll();if(window.MD_saveState)window.MD_saveState();this.sync();},
randomize:function(){var ms=this.MODES.map(function(m){return m[0];}),ts=Object.keys(this.TH),R=Math.random;
this.P.mode=ms[Math.floor(R()*ms.length)];this.P.theme=ts[Math.floor(R()*ts.length)];this.P.useCustom=R()<0.4;
if(this.P.useCustom){var h=function(){return hsl(Math.floor(R()*360),70+Math.floor(R()*30),55+Math.floor(R()*15));};this.P.custom={bg:hsl(Math.floor(R()*360),40,4),a:h(),b:h(),c:h(),d:h()};}
this.P.density=30+Math.round(R()*65);this.P.count=60+Math.round(R()*240);this.P.speed=40+Math.round(R()*140);this.P.turb=Math.round(R()*90);this.P.scale=28+Math.round(R()*110);this.P.glow=20+Math.round(R()*75);this.P.stroke=+(0.7+R()*2.3).toFixed(1);this.P.drift=10+Math.round(R()*80);this.P.dir=R()<0.5?1:-1;
this.apply();this.resize();if(window.MD_saveState)window.MD_saveState();},
reset:function(){this.P={mode:"nebula",theme:"diag",useCustom:false,custom:{bg:"#04070D",a:"#FFD60A",b:"#25D4EE",c:"#E45CFF",d:"#43E08B"},density:64,count:150,speed:100,turb:38,scale:66,glow:60,blur:0,stroke:1.4,drift:40,dir:1,quality:"std",format:"free",grid:true,grain:true,scan:true,vig:true,run:true,bg:true};this.apply();this.resize();if(window.MD_saveState)window.MD_saveState();},
fx:function(){var P=this.P,b=document.body;b.classList.toggle("nograin",!P.grain);b.classList.toggle("noscan",!P.scan);b.classList.toggle("novig",!P.vig);
var bc=$("#bgc");if(bc){bc.style.opacity=P.bg?"1":"0";bc.style.filter=P.blur?("blur("+P.blur+"px)"):"none";}
var sc=$("#screen");if(sc){var c=sc.querySelector("canvas");if(c)c.style.filter=P.blur?("blur("+P.blur+"px)"):"none";}},
apply:function(){this.fx();this.targets.forEach(function(t){t.key="";});if(this.P.run&&!document.hidden)this.start();else{this.stop();this.drawAll();}this.sync();},
start:function(){if(this.running||!this.targets.length)return;this.running=true;this.last=performance.now();var s=this;
var loop=function(n){if(!s.running)return;var dt=Math.min(0.05,(n-s.last)/1000);s.last=n;s.t+=dt*(s.P.speed/100)*s.P.dir;s.drawAll();s.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
stop:function(){this.running=false;cancelAnimationFrame(this.raf);},
mk:function(t){var P=this.P,W=t.W,H=t.H,I=P.density/100,n=Math.round(clamp(P.count*(W*H)/(1280*720),12,320)*t.scale),i,pts=[],bl=[],ln=[];
for(i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(0.2+Math.random()*0.8)*(Math.random()<0.5?-1:1),vy:(Math.random()-0.5)*0.4,r:0.8+Math.random()*1.9,p:Math.random()*6.28,k:Math.floor(Math.random()*4)});
for(i=0;i<Math.round(16*I)+5;i++)bl.push({a:Math.random()*6.28,d:0.14+Math.random()*0.82,h:0});
for(i=0;i<Math.round(9*I)+3;i++)ln.push({h:Math.random()<0.5,pos:Math.random(),sp:0.0007+Math.random()*0.0022,o:Math.random()});
return {pts:pts,blips:bl,lanes:ln,gears:null,goff:0};},
drawAll:function(){var s=this;this.targets.forEach(function(t){if(!t.W||!t.H)return;if(!t.preview&&!s.P.bg)return;
var k=[s.P.mode,s.P.count,s.P.scale,s.P.density,t.W,t.H,t.scale].join("|");if(t.key!==k){t.st=s.mk(t);t.key=k;}
try{s.draw(t.ctx,t.W,t.H,s.t,s.P,t.st,s.pal(),t.scale);}catch(e){s.fails++;logErr("scene",e);if(s.fails>3){s.P.mode="grid";s.fails=0;t.key="";}}});},
draw:function(c,W,H,t,P,st,TH,sc){
var I=P.density/100,TB=P.turb/100,G=P.glow/100,LW=P.stroke,DR=0.2+P.drift/100,SP=P.speed/100,cols=[TH.a,TH.b,TH.c,TH.d],i,j;
var glow=function(v){c.shadowColor=v;c.shadowBlur=G*16;},ng=function(){c.shadowBlur=0;};
c.globalCompositeOperation="source-over";c.globalAlpha=1;c.fillStyle=(P.mode==="scope")?TH.bg+"2E":TH.bg;c.fillRect(0,0,W,H);c.lineWidth=LW;c.lineCap="round";
if(P.grid&&P.mode!=="aurora"&&P.mode!=="nebula"){var s0=Math.max(18,P.scale),o0=(t*9*DR)%s0;c.strokeStyle=TH.a+"12";c.beginPath();
for(i=-o0;i<W+s0;i+=s0){c.moveTo(i,0);c.lineTo(i,H);}for(j=-o0*0.6;j<H+s0;j+=s0){c.moveTo(0,j);c.lineTo(W,j);}c.stroke();}
if(P.mode==="nebula"||P.mode==="aurora"){c.globalCompositeOperation="lighter";
var bl=[[0.28,0.32,0],[0.72,0.6,1],[0.5,0.2,2],[0.34,0.8,3],[0.82,0.24,0]];
for(i=0;i<bl.length;i++){var b=bl[i],bx=W*(b[0]+Math.sin(t*0.19*DR+i*1.7)*0.14),by=H*(b[1]+Math.cos(t*0.16*DR+i*1.1)*0.14),br=Math.min(W,H)*(0.3+0.12*Math.sin(t*0.27+i));
var gg=c.createRadialGradient(bx,by,0,bx,by,br);gg.addColorStop(0,cols[b[2]]+hex(0.2*I+0.05));gg.addColorStop(0.55,cols[b[2]]+hex(0.07*I));gg.addColorStop(1,cols[b[2]]+"00");c.fillStyle=gg;c.fillRect(0,0,W,H);}
c.globalCompositeOperation="source-over";
var du=st.pts.slice(0,Math.round(90*sc));for(i=0;i<du.length;i++){var d=du[i];d.p+=0.02*SP;d.y-=0.12*SP*DR;if(d.y<-4)d.y=H+4;if(d.y>H+4)d.y=-4;
c.fillStyle=TH.d+hex((0.12+Math.sin(d.p)*0.12)*I+0.04);c.fillRect(d.x,d.y,d.r*0.9,d.r*0.9);}}
else if(P.mode==="flux"){var pts=st.pts;for(i=0;i<pts.length;i++){var p=pts[i];p.x+=p.vx*SP*1.7+Math.sin(t*0.6+p.p)*TB*0.7;p.y+=p.vy*SP*1.7+Math.cos(t*0.5+p.p)*TB*0.7;
if(p.x<-12)p.x=W+12;if(p.x>W+12)p.x=-12;if(p.y<-12)p.y=H+12;if(p.y>H+12)p.y=-12;}
var R=Math.max(48,P.scale*1.4),R2=R*R;
for(i=0;i<pts.length;i++)for(j=i+1;j<pts.length;j++){var a=pts[i],b2=pts[j],dx=a.x-b2.x,dy=a.y-b2.y,d2=dx*dx+dy*dy;
if(d2<R2){c.strokeStyle=TH.a+hex((1-d2/R2)*0.14*I);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b2.x,b2.y);c.stroke();}}
for(i=0;i<pts.length;i++){var q=pts[i],col=cols[q.k];glow(col);c.fillStyle=col;c.globalAlpha=0.72*I+0.15;c.beginPath();c.arc(q.x,q.y,q.r,0,6.283);c.fill();c.globalAlpha=1;ng();}}
else if(P.mode==="grid"){var s1=Math.max(18,P.scale),o1=(t*9*DR)%s1;c.strokeStyle=TH.b+"14";c.beginPath();
for(i=-o1*2;i<W+H;i+=s1*4){c.moveTo(i,0);c.lineTo(i-H,H);}c.stroke();
for(i=0;i<st.lanes.length;i++){var l=st.lanes[i];l.o=(l.o+l.sp*SP*2+1)%1;var px=l.h?W*l.o:H*l.o;glow(TH.a);c.fillStyle=TH.a+"CC";
if(l.h)c.fillRect(px,Math.floor(l.pos*H/s1)*s1-o1*0.6,26,LW+1);else c.fillRect(Math.floor(l.pos*W/s1)*s1-o1,px,LW+1,26);ng();}
for(i=0;i<st.pts.length;i+=2){var z=st.pts[i];z.p+=0.02*SP;c.strokeStyle=TH.a+hex((0.22+Math.sin(z.p)*0.18)*I);c.beginPath();c.moveTo(z.x-5,z.y);c.lineTo(z.x+5,z.y);c.moveTo(z.x,z.y-5);c.lineTo(z.x,z.y+5);c.stroke();}}
else if(P.mode==="radar"){var cx=W*0.66,cy=H*0.46,RR=Math.min(W,H)*0.42,ang=(t*0.8*SP)%6.283;c.strokeStyle=TH.a+"22";
for(i=1;i<=4;i++){c.beginPath();c.arc(cx,cy,RR*i/4,0,6.283);c.stroke();}
c.beginPath();c.moveTo(cx-RR,cy);c.lineTo(cx+RR,cy);c.moveTo(cx,cy-RR);c.lineTo(cx,cy+RR);c.stroke();
if(c.createConicGradient){var cg=c.createConicGradient(ang,cx,cy);cg.addColorStop(0,TH.a+"55");cg.addColorStop(0.14,TH.a+"00");cg.addColorStop(1,TH.a+"00");c.fillStyle=cg;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,RR,0,6.283);c.fill();}
glow(TH.a);c.strokeStyle=TH.a;c.lineWidth=LW+0.6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ang)*RR,cy+Math.sin(ang)*RR);c.stroke();ng();c.lineWidth=LW;
for(i=0;i<st.blips.length;i++){var bp=st.blips[i],da=((ang-bp.a)%6.283+6.283)%6.283;if(da<0.07)bp.h=1;bp.h*=0.986;
if(bp.h>0.02){glow(TH.d);c.fillStyle=TH.d+hex(bp.h*0.9);c.beginPath();c.arc(cx+Math.cos(bp.a)*RR*bp.d,cy+Math.sin(bp.a)*RR*bp.d,3,0,6.283);c.fill();ng();}}
c.fillStyle=TH.a+"88";c.font="9px monospace";c.fillText("PORTÉE "+Math.round(RR)+" u",cx-RR,cy+RR+16);}
else if(P.mode==="scope"){var ch=Math.max(2,Math.round(2+I*4));
for(var k2=0;k2<ch;k2++){var base=H*(k2+0.6)/(ch+0.2),amp=H/(ch*3.1),col2=cols[k2%4];glow(col2);c.strokeStyle=col2;c.lineWidth=LW+0.4;c.beginPath();
for(i=0;i<=W;i+=3){var u=i/W*12+t*1.6*SP+k2*1.3,y=base+Math.sin(u)*amp*0.6+Math.sin(u*3.1+k2)*amp*0.28*TB+Math.sin(u*7.7)*amp*0.14*TB;if(i)c.lineTo(i,y);else c.moveTo(i,y);}
c.stroke();ng();c.fillStyle=col2+"99";c.font="9px monospace";c.fillText("CYL"+(k2+1),8,base-amp-4);}
c.strokeStyle=TH.d+"55";c.setLineDash([4,5]);c.beginPath();c.moveTo(W*0.5,0);c.lineTo(W*0.5,H);c.stroke();c.setLineDash([]);c.lineWidth=LW;}
else if(P.mode==="gears"){var sg=Math.max(30,P.scale),ag=t*0.7*SP*DR*2;
if(!st.gears){var defs=[[sg*1.15,18],[sg*0.78,12],[sg*0.55,9],[sg*0.9,14]],arr=[];
for(i=0;i<defs.length;i++){var r2=defs[i][0],pr=arr[i-1],ccx=i?pr.cx+pr.r+r2+sg*0.16:0;arr.push({cx:ccx,r:r2,teeth:defs[i][1],col:cols[i%4],dir:i%2?-1:1,ratio:18/defs[i][1]});}
st.gears=arr;st.goff=-arr[arr.length-1].cx/2;}
c.save();c.translate(W*0.5+st.goff,H*0.44);
for(i=0;i<st.gears.length;i++){var g2=st.gears[i];c.save();c.translate(g2.cx,0);c.rotate(ag*g2.dir*g2.ratio);glow(g2.col);c.strokeStyle=g2.col;c.lineWidth=LW+0.5;
c.beginPath();c.arc(0,0,g2.r,0,6.283);c.stroke();
for(j=0;j<g2.teeth;j++){var aa=j*6.283/g2.teeth;c.beginPath();c.moveTo(Math.cos(aa)*g2.r,Math.sin(aa)*g2.r);c.lineTo(Math.cos(aa)*(g2.r+sg*0.16),Math.sin(aa)*(g2.r+sg*0.16));c.stroke();}
ng();c.strokeStyle=g2.col+"66";c.beginPath();c.arc(0,0,g2.r*0.32,0,6.283);c.stroke();c.restore();}
c.restore();
var cr=Math.min(W,H)*0.1,rl=cr*3.1,px2=W*0.5,py2=H*0.87,a4=ag*1.6,pinx=px2+Math.cos(a4)*cr,piny=py2+Math.sin(a4)*cr,pist=py2-Math.sqrt(Math.max(1,rl*rl-Math.pow(pinx-px2,2)));
glow(TH.b);c.strokeStyle=TH.b;c.lineWidth=LW+0.8;c.beginPath();c.arc(px2,py2,cr,0,6.283);c.stroke();c.beginPath();c.moveTo(px2,py2);c.lineTo(pinx,piny);c.lineTo(px2,pist);c.stroke();c.strokeRect(px2-cr*0.62,pist-cr*0.5,cr*1.24,cr*0.72);ng();c.lineWidth=LW;}
else{var cx2=W*0.5,cy2=H*0.5,maxR=Math.max(W,H)*0.75,rings=Math.round(10+I*16);
for(i=0;i<rings;i++){var zz=((i/rings)+(t*0.06*SP*DR))%1;if(zz<0)zz+=1;var rr=maxR*(0.04+zz*zz),al=clamp(zz*0.9,0,1)*(0.25+I*0.5),col3=cols[i%4];
glow(col3);c.strokeStyle=col3+hex(al*0.55);c.lineWidth=LW+zz*1.6;c.beginPath();
for(j=0;j<=6;j++){var ta=j*1.0472+t*0.05*DR+zz*0.6,tx=cx2+Math.cos(ta)*rr,ty=cy2+Math.sin(ta)*rr*0.72;if(j)c.lineTo(tx,ty);else c.moveTo(tx,ty);}c.stroke();ng();}
c.strokeStyle=TH.a+"22";c.lineWidth=LW;
for(j=0;j<12;j++){var la=j*0.5236+t*0.05*DR;c.beginPath();c.moveTo(cx2,cy2);c.lineTo(cx2+Math.cos(la)*maxR,cy2+Math.sin(la)*maxR*0.72);c.stroke();}
var tp=st.pts.slice(0,Math.round(50*sc));
for(i=0;i<tp.length;i++){var tq=tp[i],dx2=tq.x-cx2,dy2=tq.y-cy2,dd=Math.sqrt(dx2*dx2+dy2*dy2)||1,spd=0.6+SP*1.4;
tq.x+=(dx2/dd)*spd;tq.y+=(dy2/dd)*spd;
if(tq.x<-20||tq.x>W+20||tq.y<-20||tq.y>H+20){tq.x=cx2+(Math.random()-0.5)*40;tq.y=cy2+(Math.random()-0.5)*40;}
c.fillStyle=cols[tq.k]+"AA";c.fillRect(tq.x,tq.y,tq.r,tq.r);}c.lineWidth=LW;}
if(P.vig){var gv=c.createRadialGradient(W*0.5,H*0.45,Math.min(W,H)*0.2,W*0.5,H*0.5,Math.max(W,H)*0.75);gv.addColorStop(0,"#00000000");gv.addColorStop(1,"#000000"+((P.mode==="aurora"||P.mode==="nebula")?"55":"88"));c.fillStyle=gv;c.fillRect(0,0,W,H);}
c.globalCompositeOperation="source-over";c.globalAlpha=1;},
exportPNG:function(){var F={free:[1600,900],mobile:[1170,2532],tablet:[1668,2224],desktop:[1920,1080]}[this.P.format]||[1600,900],s=this;
safe("png",function(){var cv=document.createElement("canvas");cv.width=F[0];cv.height=F[1];var cx=cv.getContext("2d"),tg={W:F[0],H:F[1],scale:1};tg.st=s.mk(tg);
s.draw(cx,F[0],F[1],s.t,s.P,tg.st,s.pal(),1);var u=cv.toDataURL("image/png"),a=document.createElement("a");a.href=u;a.download="mecadata_fond_"+s.P.mode+"_"+F[0]+"x"+F[1]+".png";document.body.appendChild(a);a.click();a.remove();toast("ok","Fond exporté",F[0]+"×"+F[1]+" px");beep("ok");},toast("err","Export PNG indisponible"));},
label:function(k,v){var u={density:"%",speed:"%",turb:"%",glow:"%",scale:" px",stroke:" px",blur:" px",drift:"%",count:""};return ((k==="stroke"||k==="blur")?Number(v).toFixed(1):Math.round(v))+(u[k]||"");},
sync:function(){var P=this.P,pal=this.pal(),rb=$("#runb");
if(rb){rb.innerHTML=ic(P.run?"pause":"play");rb.classList.toggle("on",P.run);}
$$(".mb").forEach(function(b){b.classList.toggle("on",b.dataset.m===P.mode);});
$$(".pb").forEach(function(b){b.classList.toggle("on",!P.useCustom&&b.dataset.t===P.theme);});
$$("[data-p]").forEach(function(el){var k=el.dataset.p,v=P[k];if(el.type==="checkbox")el.checked=!!v;else el.value=v;var o=$("[data-pv='"+k+"']");if(o)o.textContent=WP.label(k,v);});
$$("[data-c]").forEach(function(el){el.value=P.custom[el.dataset.c];});
var ct=$("#customToggle");if(ct)ct.checked=!!P.useCustom;
var h=$("#hud");if(h)h.innerHTML="<span>"+P.mode.toUpperCase()+"</span><span>"+esc(pal.n).toUpperCase()+"</span><span>"+P.count+" pts</span><span>"+(P.dir>0?"AVANT":"ARRIÈRE")+"</span><span>"+(P.run?"LIVE":"PAUSE")+"</span>";}};
function hsl(h,s,l){s/=100;l/=100;var k=function(n){return (n+h/30)%12;},a=s*Math.min(l,1-l),f=function(n){var v=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return Math.round(255*v).toString(16).padStart(2,"0");};return "#"+f(0)+f(8)+f(4);}
window.MD_$=$;window.MD_$$=$$;window.MD_esc=esc;window.MD_fmt=fmt;window.MD_clamp=clamp;window.MD_uid=uid;window.MD_clone=clone;window.MD_ov=ov;window.MD_ic=ic;window.MD_deb=deb;window.MD_split=split;window.MD_nk=nk;window.MD_slug=slug;window.MD_ERRORS=ERRORS;window.MD_logErr=logErr;window.MD_safe=safe;window.MD_STORE=STORE;window.MD_download=download;window.MD_beep=beep;window.MD_toast=toast;window.MD_openModal=openModal;window.MD_closeModal=closeModal;window.MD_confirmModal=confirmModal;window.MD_modalOpen=function(){return modalOpen;};window.MD_WP=WP;window.MD_PREF=PREF;
window.__MD_SCRIPTS.core=true;
})();
