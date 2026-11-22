/* ══════════════════════════════════════════════════════════════════════════
   MECADATA // INGÉNIEUR v5.1 — noyau complet
   utils · état · corrélations · audio · moteur de fonds animés · vues · CRUD
══════════════════════════════════════════════════════════════════════════ */
'use strict';
/* ── 1. UTILITAIRES ── */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('fr-FR');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=p=>p+Math.random().toString(36).slice(2,7).toUpperCase();
const clone=o=>typeof structuredClone==='function'?structuredClone(o):JSON.parse(JSON.stringify(o));
const ov=(a,b)=>a[0]<=b[1]&&b[0]<=a[1];
const ic=(n,st='')=>`<svg class="ic"${st?` style="${st}"`:''}><use href="#i-${n}"/></svg>`;
const deb=(f,t)=>{let h;return(...a)=>{clearTimeout(h);h=setTimeout(()=>f(...a),t)}};
const split=v=>Array.isArray(v)?v:String(v||'').split(/[;,|]/).map(s=>s.trim()).filter(Boolean);
const hex=a=>clamp(Math.round(a*255),0,255).toString(16).padStart(2,'0');
function download(name,content,mime='application/json'){
 const b=new Blob([content],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');
 a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),600);
}
const PWD='Kevin83600',KEY='mecadata_v51';
const FU={e:{l:'Essence',c:'#FFAF2E'},d:{l:'Diesel',c:'#4D8DFF'},h:{l:'Hybride',c:'#43E08B'},p:{l:'Hybride rechargeable',c:'#19B8A6'},b:{l:'Électrique',c:'#E45CFF'},g:{l:'GPL / ECO-G',c:'#A8E63C'}};
const SV={critique:{w:32,c:'#FF4D5E'},majeure:{w:18,c:'#FF7A3D'},'modérée':{w:9,c:'#FFAF2E'},mineure:{w:4,c:'#4D8DFF'},info:{w:0,c:'#25D4EE'}};
const FQ={'élevée':1.25,moyenne:1,faible:.7};
const GBL={BVM:'BVM',BVM5:'BVM5',BVM6:'BVM6',BVA:'BVA',EAT6:'EAT6 Aisin',EAT8:'EAT8 Aisin',EDC6:'EDC6 Getrag',EDC7:'EDC7 Getrag',DQ200:'DSG7 DQ200 (sec)',DQ250:'DSG6 DQ250',DQ381:'DSG7 DQ381',DQ400:'DSG6 DQ400e',DQ500:'DSG7 DQ500',eCVT:'e-CVT planétaire',RED:'Réducteur',CVT:'CVT',DCT6:'DCT6 e-DCS6',DCT7:'DCT7',DCT8:'DCT8 humide',ZF8:'ZF8',G9:'9G-Tronic',GTR7:'7G-DCT',PDK:'PDK',MMT:'Multimode dogbox',XTR:'Xtronic',AGS:'AGS robotisée',DPS6:'Powershift DPS6'};
const SEGS=['Citadine','Micro-citadine','Compacte','SUV urbain','SUV compact','Berline','Break','Ludospace','Utilitaire','Coupé','Roadster','Sportive','Monospace','Pick-up'];
const IVL=v=>v>=75?['CRITIQUE','#FF4D5E']:v>=50?['ÉLEVÉ','#FF7A3D']:v>=25?['MODÉRÉ','#FFAF2E']:['FAIBLE','#43E08B'];
const FILES=[['brands','brands.json','Marques'],['models','models.json','Modèles'],['engines','engines.json','Motorisations'],['faults','faults.json','Pannes connues'],['tsb','tsb.json','Bulletins / TSB'],['maint','maintenance.json','Plans d’entretien']];
const GBFAULT=t=>/DQ200/.test(t)?['DQ200']:/DSG humide/.test(t)?['DQ250','DQ381','DQ500']:/EDC6/.test(t)?['EDC6']:/EAT8/.test(t)?['EAT8']:/DPS6/.test(t)?['DPS6']:[];

/* ── 2. EXPANSION DE LA BASE ── */
function expandBase(raw){
 const D={brands:[],models:[],engines:[],faults:[],tsb:[],maint:[]};
 (raw.brands||[]).forEach(b=>D.brands.push({id:b[0],n:b[1],pays:b[2],grp:b[3]}));
 (raw.models||[]).forEach(m=>D.models.push({id:m[0],b:m[1],n:m[2],y:[m[3],m[4]],seg:m[5]}));
 (raw.engines||[]).forEach((e,i)=>D.engines.push({id:'E'+String(i+1).padStart(3,'0'),m:[e[0]],code:e[1],fam:e[2],label:e[3],fuel:e[4],disp:e[5],hp:e[6],nm:e[7],kw:Math.round(e[6]*.7355),y:[e[8],e[9]],gb:e[10],norm:e[11],
  cyl:e[4]==='b'?'ÉLEC':(e[5]>2900?'6 cyl.+':'L4'),asp:e[4]==='b'?'—':(/SCe|MPi|Fire |Dualjet|VVT|Skyactiv-G|FireFly BSG/.test(e[3])?'Atmo':'Turbo'),
  inj:e[4]==='b'?'—':(e[4]==='d'?'Common Rail':'Injection directe'),note:''}));
 (raw.faults||[]).forEach((f,i)=>D.faults.push({id:'F'+String(i+1).padStart(3,'0'),t:f[0],fam:split(f[1]),sev:f[2],freq:f[3],y:[f[4],f[5]],km:[f[6],f[7]],sym:split(f[8]),cause:f[9],fix:f[10],cost:[f[11],f[12]],status:f[13],fuel:f[14]||'',m:[],gb:GBFAULT(f[0]),e:[]}));
 (raw.tsb||[]).forEach((t,i)=>D.tsb.push({id:'T'+String(i+1).padStart(3,'0'),ref:t[0],b:split(t[1]),fam:split(t[2]),t:t[3],date:t[4],cat:t[5],sev:t[6],sum:t[7],act:t[8],m:[],gb:GBFAULT(t[3])}));
 (raw.maint||[]).forEach(p=>D.maint.push({id:p[0],name:p[1],fam:split(p[2]),oil:p[3]||null,dist:p[4]||null,items:p[5]||[],note:p[6]||'',fuel:p[7]||'',base:[15000,12]}));
 return D;
}
/* ── 3. ÉTAT ── */
let SEED=null,DB=null,AUDIT=[],GARAGE=[],VIEWS=[],UNDO=null,META={counts:{},links:0,corr:0,integ:{err:[],warn:[],ok:true,pct:100},size:0};
let PREF={sound:true};
const S={view:'bord',f:{q:'',brand:'',fuels:[],seg:'',y:[2017,2026],p:[0,1050],sort:'brand'},shown:36,
 tech:{tab:'faults',q:'',sev:'',brand:'',cat:''},adm:{tab:'engines',q:'',page:0,sel:new Set()},
 plan:null,planCtx:null,calc:{km:60000,year:2021,sev:1},drawer:null};
const isAdm=()=>sessionStorage.getItem('mecadata_adm')==='1';
function loadState(){
 SEED=expandBase(window.MECADATA_BASE||{});DB=clone(SEED);
 try{const raw=localStorage.getItem(KEY);
  if(raw){const d=JSON.parse(raw);
   if(d&&d.db&&Array.isArray(d.db.engines)&&d.db.engines.length){
    DB=d.db;AUDIT=d.audit||[];GARAGE=d.garage||[];VIEWS=d.views||[];
    PREF=Object.assign(PREF,d.prefs||{});if(d.wp)Object.assign(WP.P,d.wp);
   }}}catch(e){}
}
const save=deb(()=>{try{localStorage.setItem(KEY,JSON.stringify({v:51,db:DB,audit:AUDIT.slice(-90),garage:GARAGE,views:VIEWS,prefs:PREF,wp:WP.P}));updStor()}catch(e){toast('warn','Stockage local saturé','Session conservée en mémoire — exportez la base.')}},220);
function audit(type,msg){AUDIT.push({ts:Date.now(),type,msg});if(AUDIT.length>140)AUDIT=AUDIT.slice(-140)}
function snapshot(label){UNDO={label,db:clone(DB),garage:[...GARAGE]}}
function doUndo(){if(!UNDO)return;DB=UNDO.db;GARAGE=UNDO.garage;const l=UNDO.label;UNDO=null;mutate('imp','Annulation — '+l);toast('ok','Action annulée','Base restaurée à son état précédent.')}
function pruneRefs(){const ids=new Set(DB.engines.map(e=>e.id));GARAGE=GARAGE.filter(i=>ids.has(i));if(S.planCtx&&!ids.has(S.planCtx))S.planCtx=null;if(S.drawer&&S.drawer.type==='engine'&&!ids.has(S.drawer.id))closeDrawer()}
function mutate(type,msg){recompute();pruneRefs();audit(type,msg);save();updateMeta();render();if(S.drawer)renderDrawer()}
/* ── 4. CORRÉLATIONS ── */
const modelById=id=>DB.models.find(m=>m.id===id);
const brandById=id=>DB.brands.find(b=>b.id===id);
const engModels=e=>e.m.map(modelById).filter(Boolean);
const engBrand=e=>{const m=engModels(e)[0];return m?brandById(m.b):null};
const engName=e=>{const m=engModels(e)[0],b=engBrand(e);return `${b?b.n:''} ${m?m.n:''} — ${e.label}`.trim()};
const fMatch=(f,e)=>(f.fam||[]).includes(e.fam)||(f.e||[]).includes(e.id)||(f.m||[]).some(i=>e.m.includes(i))||(f.gb||[]).includes(e.gb)||(f.fuel&&f.fuel===e.fuel);
function faultsFor(e){return DB.faults.filter(f=>fMatch(f,e)).map(f=>({...f,active:ov(f.y,e.y)})).sort((a,b)=>(b.active-a.active)||(SV[b.sev]?.w||0)-(SV[a.sev]?.w||0))}
function tsbFor(e){const bs=engModels(e).map(m=>m.b);
 return DB.tsb.filter(t=>(t.fam||[]).includes(e.fam)||(t.b||[]).some(b=>bs.includes(b))||(t.m||[]).some(i=>e.m.includes(i))||(t.gb||[]).includes(e.gb)).sort((a,b)=>b.date.localeCompare(a.date))}
function planFor(e){return DB.maint.find(p=>(p.fam||[]).includes(e.fam))||DB.maint.find(p=>p.fuel===e.fuel)||DB.maint.find(p=>p.fuel===(e.fuel==='g'?'e':e.fuel))||DB.maint[0]}
function ivi(e){let s=0;for(const f of faultsFor(e)){const w=(SV[f.sev]?.w||0)*(FQ[f.freq]||1);s+=f.active?w:w*.25}return clamp(Math.round(s),0,100)}
const enginesForFault=f=>DB.engines.filter(e=>fMatch(f,e));
const enginesForTsb=t=>DB.engines.filter(e=>{const bs=engModels(e).map(m=>m.b);return (t.fam||[]).includes(e.fam)||(t.b||[]).some(b=>bs.includes(b))||(t.m||[]).some(i=>e.m.includes(i))||(t.gb||[]).includes(e.gb)});
function famBrands(fam){const s=new Set();DB.engines.forEach(e=>{if(e.fam===fam){const b=engBrand(e);if(b)s.add(b.id)}});return [...s]}
function integrity(){
 const err=[],warn=[],mids=new Set(DB.models.map(m=>m.id)),bids=new Set(DB.brands.map(b=>b.id)),fams=new Set(DB.engines.map(e=>e.fam));
 FILES.forEach(([k])=>{const s=new Set();DB[k].forEach(x=>{if(s.has(x.id))err.push(`${k}.json : id dupliqué « ${x.id} »`);s.add(x.id)})});
 DB.models.forEach(m=>{if(!bids.has(m.b))err.push(`models.json : marque inconnue « ${m.b} » (${m.n})`)});
 DB.engines.forEach(e=>{e.m.forEach(i=>{if(!mids.has(i))err.push(`engines.json : modèle orphelin « ${i} » (${e.label})`)});if(!(e.hp>0))warn.push(`engines.json : puissance nulle (${e.label})`)});
 DB.faults.forEach(f=>{if(!SV[f.sev])err.push(`faults.json : sévérité invalide « ${f.sev} »`);(f.fam||[]).forEach(x=>{if(!fams.has(x)&&!f.fuel&&!(f.m||[]).length&&!(f.gb||[]).length)warn.push(`faults.json : famille « ${x} » sans motorisation`)})});
 DB.tsb.forEach(t=>{(t.b||[]).forEach(x=>{if(!bids.has(x))err.push(`tsb.json : marque inconnue « ${x} »`)});(t.fam||[]).forEach(x=>{if(!fams.has(x)&&!(t.m||[]).length&&!(t.gb||[]).length)warn.push(`tsb.json : famille « ${x} » sans motorisation`)})});
 DB.maint.forEach(p=>{if(!Array.isArray(p.items)||!p.items.length)err.push(`maintenance.json : plan sans opérations (${p.id})`)});
 return {err,warn,ok:!err.length,pct:err.length?Math.max(0,100-err.length*7):100};
}
function recompute(){
 const fams=new Set(DB.engines.map(e=>e.fam));let links=0,corr=0;
 DB.engines.forEach(e=>{links+=e.m.length;corr+=faultsFor(e).length+tsbFor(e).length});
 DB.faults.forEach(f=>links+=(f.fam||[]).length+(f.m||[]).length+(f.gb||[]).length);
 DB.tsb.forEach(t=>links+=(t.b||[]).length+(t.fam||[]).length);
 DB.maint.forEach(p=>links+=(p.fam||[]).length);
 let inter=0;fams.forEach(f=>{if(famBrands(f).length>1)inter++});
 META={counts:{b:DB.brands.length,m:DB.models.length,e:DB.engines.length,f:DB.faults.length,t:DB.tsb.length,p:DB.maint.length,fam:fams.size,inter},links,corr,integ:integrity(),size:Math.round(JSON.stringify(DB).length/1024)};
}
function updStor(){const kb=META.size||0,b=$('#sbar'),t=$('#stxt');if(b)b.style.width=clamp(kb/5120*100,2,100)+'%';if(t)t.textContent=kb+' Ko / ~5 120 Ko'}
/* ── 5. AUDIO ── */
const AU={ctx:null};
function beep(kind){
 if(!PREF.sound)return;
 try{
  AU.ctx=AU.ctx||new (window.AudioContext||window.webkitAudioContext)();
  if(AU.ctx.state==='suspended')AU.ctx.resume();
  const c=AU.ctx,t=c.currentTime;
  const p=(f0,f1,d,ty,g,dt=0)=>{const o=c.createOscillator(),v=c.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t+dt);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dt+d);v.gain.setValueAtTime(0,t+dt);v.gain.linearRampToValueAtTime(g,t+dt+.008);v.gain.exponentialRampToValueAtTime(.0001,t+dt+d);o.connect(v).connect(c.destination);o.start(t+dt);o.stop(t+dt+d+.03)};
  if(kind==='tick')p(1700,1400,.045,'square',.03);
  else if(kind==='open')p(320,560,.09,'sine',.045);
  else if(kind==='close')p(520,300,.08,'sine',.035);
  else if(kind==='ok'){p(660,0,.09,'sine',.055);p(990,0,.14,'sine',.055,.09)}
  else if(kind==='err')p(150,110,.2,'sawtooth',.06);
  else if(kind==='warn')p(440,0,.12,'triangle',.05);
  else if(kind==='del')p(240,110,.14,'square',.045);
  else if(kind==='imp'){p(520,0,.08,'sine',.045);p(660,0,.08,'sine',.045,.08);p(880,0,.16,'sine',.05,.16)}
 }catch(e){}
}
/* ── 6. MOTEUR DE FONDS ANIMÉS ── */
const WP={
P:{mode:'blueprint',theme:'diag',density:62,count:130,speed:100,turb:34,scale:64,glow:56,blur:0,stroke:1.4,drift:38,quality:'std',format:'free',grid:true,grain:true,scan:true,vig:true,run:true,bg:true},
TH:{diag:{n:'Diagnostic',bg:'#04070D',a:'#25D4EE',b:'#4D8DFF',c:'#E45CFF',d:'#43E08B'},
 torque:{n:'Couple',bg:'#0B0603',a:'#FFAF2E',b:'#FF7A3D',c:'#FF4D5E',d:'#FFD98A'},
 acid:{n:'Acide',bg:'#040A06',a:'#A8E63C',b:'#43E08B',c:'#25D4EE',d:'#E4FF7A'},
 plasma:{n:'Plasma',bg:'#08040F',a:'#E45CFF',b:'#8F7CFF',c:'#25D4EE',d:'#FF6FB1'},
 ocean:{n:'Océan',bg:'#02080C',a:'#19B8A6',b:'#4D8DFF',c:'#25D4EE',d:'#7CE8D0'},
 steel:{n:'Acier',bg:'#070A0E',a:'#9FB2C8',b:'#5F7288',c:'#25D4EE',d:'#E6EEF9'}},
MODES:[['blueprint','GRILLE'],['aurora','AURORA'],['flux','FLUX'],['radar','RADAR'],['oscillo','OSCILLO'],['gears','MÉCA'],['carbon','CARBONE'],['telemetry','TÉLÉM.']],
PRESETS:{
 'Diagnostic':{mode:'blueprint',theme:'diag',density:62,count:130,speed:100,turb:34,scale:64,glow:56,stroke:1.4,drift:38},
 'Banc dyno':{mode:'telemetry',theme:'torque',density:70,count:120,speed:120,turb:45,scale:56,glow:62,stroke:1.8,drift:20},
 'Nuit carbone':{mode:'carbon',theme:'steel',density:55,count:80,speed:60,turb:20,scale:48,glow:34,stroke:1.2,drift:26},
 'Radar atelier':{mode:'radar',theme:'acid',density:60,count:110,speed:85,turb:30,scale:70,glow:70,stroke:1.6,drift:30},
 'Scope 4 cyl':{mode:'oscillo',theme:'acid',density:66,count:100,speed:130,turb:52,scale:60,glow:66,stroke:1.6,drift:18},
 'Plasma':{mode:'aurora',theme:'plasma',density:74,count:150,speed:70,turb:40,scale:80,glow:78,stroke:1.4,drift:44},
 'Train d’engrenages':{mode:'gears',theme:'torque',density:60,count:90,speed:80,turb:24,scale:74,glow:52,stroke:1.6,drift:22},
 'Flux de données':{mode:'flux',theme:'ocean',density:68,count:170,speed:110,turb:48,scale:64,glow:58,stroke:1.2,drift:34}},
targets:[],raf:0,t:0,last:0,running:false,
init(){
 const cv=$('#bgc');if(cv)this.targets.push({cv,ctx:cv.getContext('2d'),scale:.5,W:0,H:0,st:null,key:''});
 this.resize();
 window.addEventListener('resize',deb(()=>this.resize(),140));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();else if(this.P.run)this.start()});
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)this.P.run=false;
 this.apply();
},
attachPreview(cv){this.targets=this.targets.filter(t=>t.cv.id==='bgc');if(cv)this.targets.push({cv,ctx:cv.getContext('2d'),scale:1,W:0,H:0,st:null,key:'',preview:true});this.resize();if(this.P.run)this.start();else this.drawAll()},
detachPreview(){this.targets=this.targets.filter(t=>!t.preview)},
q(){return this.P.quality==='eco'?1:this.P.quality==='ultra'?2:1.5},
resize(){
 const dpr=Math.min(devicePixelRatio||1,this.q());
 this.targets.forEach(t=>{
  const w=t.preview?(t.cv.clientWidth||640):innerWidth,h=t.preview?(t.cv.clientHeight||360):innerHeight;
  t.W=Math.max(1,w);t.H=Math.max(1,h);
  t.cv.width=Math.round(t.W*dpr);t.cv.height=Math.round(t.H*dpr);
  t.ctx.setTransform(dpr,0,0,dpr,0,0);t.key='';
 });
 this.drawAll();
},
set(k,v){
 this.P[k]=v;
 if(k==='quality')this.resize();
 if(['mode','count','scale','density'].includes(k))this.targets.forEach(t=>t.key='');
 this.fx();if(k==='run'){v?this.start():this.stop()}
 this.drawAll();save();this.sync();
},
fx(){
 const P=this.P,b=document.body;
 b.classList.toggle('nograin',!P.grain);b.classList.toggle('noscan',!P.scan);b.classList.toggle('novig',!P.vig);
 const bc=$('#bgc'),bf=$('#bgfx');
 if(bc){bc.style.opacity=P.bg?'1':'0';bc.style.filter=P.blur?`blur(${P.blur}px)`:'none'}
 if(bf)bf.style.opacity=P.bg?'1':'0';
 const sc=$('#screen');
 if(sc){sc.classList.toggle('nograin',!P.grain);sc.classList.toggle('noscan',!P.scan);sc.classList.toggle('novig',!P.vig);
  const c=sc.querySelector('canvas');if(c)c.style.filter=P.blur?`blur(${P.blur}px)`:'none'}
},
apply(){this.fx();this.targets.forEach(t=>t.key='');if(this.P.run&&!document.hidden)this.start();else{this.stop();this.drawAll()}this.sync()},
start(){if(this.running)return;this.running=true;this.last=performance.now();
 const loop=now=>{if(!this.running)return;const dt=Math.min(.05,(now-this.last)/1000);this.last=now;this.t+=dt*(this.P.speed/100);this.drawAll();this.raf=requestAnimationFrame(loop)};
 this.raf=requestAnimationFrame(loop)},
stop(){this.running=false;cancelAnimationFrame(this.raf)},
mkState(t){
 const P=this.P,W=t.W,H=t.H,I=P.density/100,sc=t.scale;
 const n=Math.round(clamp(P.count*(W*H)/(1280*720),12,420)*sc);
 return {pts:Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(.2+Math.random()*.8)*(Math.random()<.5?-1:1),vy:(Math.random()-.5)*.4,r:.8+Math.random()*1.9,p:Math.random()*6.28,k:Math.floor(Math.random()*4)})),
  blips:Array.from({length:Math.round(16*I)+5},()=>({a:Math.random()*6.28,d:.14+Math.random()*.82,h:0})),
  lanes:Array.from({length:Math.round(9*I)+3},()=>({h:Math.random()<.5,pos:Math.random(),sp:.0007+Math.random()*.0022,o:Math.random()})),
  tr:[Array.from({length:150},()=>.5),Array.from({length:150},()=>.4),Array.from({length:150},()=>.6)],ph:0,gears:null,goff:0,tile:null,tk:''};
},
gearPath(r,teeth,d){
 const p=new Path2D(),s=Math.PI*2/teeth;
 for(let i=0;i<teeth;i++){const a=i*s;
  p.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  p.lineTo(Math.cos(a+s*.17)*(r+d),Math.sin(a+s*.17)*(r+d));
  p.lineTo(Math.cos(a+s*.43)*(r+d),Math.sin(a+s*.43)*(r+d));
  p.lineTo(Math.cos(a+s*.6)*r,Math.sin(a+s*.6)*r)}
 p.closePath();return p;
},
drawAll(){this.targets.forEach(t=>{
 if(!t.W||!t.H)return;if(!t.preview&&!this.P.bg)return;
 const key=[this.P.mode,this.P.count,this.P.scale,this.P.density,t.W,t.H,t.scale].join('|');
 if(t.key!==key){t.st=this.mkState(t);t.key=key}
 this.draw(t.ctx,t.W,t.H,this.t,this.P,t.st,this.TH[this.P.theme]||this.TH.diag,t.scale)})},
draw(c,W,H,t,P,st,TH,sc){
 const I=P.density/100,TB=P.turb/100,G=P.glow/100,LW=P.stroke,DR=.2+P.drift/100,SP=P.speed/100;
 const cols=[TH.a,TH.b,TH.c,TH.d];
 if(P.mode==='oscillo'){c.fillStyle=TH.bg+'2E';c.fillRect(0,0,W,H)}else{c.fillStyle=TH.bg;c.fillRect(0,0,W,H)}
 c.lineWidth=LW;c.lineCap='round';
 if(P.grid&&P.mode!=='carbon'&&P.mode!=='aurora'){
  const s=Math.max(18,P.scale),o=(t*9*DR)%s;
  c.strokeStyle=TH.a+'12';c.beginPath();
  for(let x=-o;x<W+s;x+=s){c.moveTo(x,0);c.lineTo(x,H)}
  for(let y=-o*.6;y<H+s;y+=s){c.moveTo(0,y);c.lineTo(W,y)}
  c.stroke();
 }
 const glow=v=>{c.shadowColor=v;c.shadowBlur=G*16},noglow=()=>{c.shadowBlur=0};
 if(P.mode==='blueprint'){
  const s=Math.max(18,P.scale),o=(t*9*DR)%s;
  c.strokeStyle=TH.b+'14';c.beginPath();for(let x=-o*2;x<W+H;x+=s*4){c.moveTo(x,0);c.lineTo(x-H,H)}c.stroke();
  st.lanes.forEach(l=>{l.o=(l.o+l.sp*SP*2)%1;const px=l.h?W*l.o:H*l.o;glow(TH.a);c.fillStyle=TH.a+'CC';
   if(l.h)c.fillRect(px,Math.floor(l.pos*H/s)*s-o*.6,26,LW+1);else c.fillRect(Math.floor(l.pos*W/s)*s-o,px,LW+1,26);noglow()});
  st.pts.forEach((p,i)=>{if(i%2)return;p.p+=.02*SP;const a=(.22+Math.sin(p.p)*.18)*I;
   c.strokeStyle=TH.a+hex(a);c.beginPath();c.moveTo(p.x-5,p.y);c.lineTo(p.x+5,p.y);c.moveTo(p.x,p.y-5);c.lineTo(p.x,p.y+5);c.stroke();
   if(Math.sin(p.p*.5)>.965){c.strokeStyle=TH.c+'66';c.beginPath();c.arc(p.x,p.y,8+Math.sin(p.p)*3,0,6.283);c.stroke()}});
 }else if(P.mode==='aurora'){
  [[.26,.3,0],[.74,.62,2],[.54,.2,1],[.3,.82,3]].forEach((b,i)=>{
   const x=W*(b[0]+Math.sin(t*.22*DR+i*2)*.12),y=H*(b[1]+Math.cos(t*.18*DR+i)*.12),r=Math.min(W,H)*(.34+.09*Math.sin(t*.3+i));
   const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cols[b[2]]+hex(46*I/255));g.addColorStop(1,cols[b[2]]+'00');
   c.fillStyle=g;c.fillRect(0,0,W,H)});
  st.pts.slice(0,Math.round(70*sc)).forEach(p=>{p.p+=.03;c.fillStyle=TH.d+hex((.14+Math.sin(p.p)*.12)*I);c.fillRect(p.x,p.y,1.6,1.6)});
 }else if(P.mode==='flux'){
  const pts=st.pts;
  pts.forEach(p=>{p.x+=p.vx*SP*1.7+Math.sin(t*.6+p.p)*TB*.7;p.y+=p.vy*SP*1.7+Math.cos(t*.5+p.p)*TB*.7;
   if(p.x<-12)p.x=W+12;if(p.x>W+12)p.x=-12;if(p.y<-12)p.y=H+12;if(p.y>H+12)p.y=-12});
  const R=Math.max(48,P.scale*1.4),R2=R*R;
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
   const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;
   if(d<R2){c.strokeStyle=TH.a+hex((1-d/R2)*.14*I);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}}
  pts.forEach(p=>{const col=cols[p.k];glow(col);c.fillStyle=col;c.globalAlpha=.72*I+.15;c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill();c.globalAlpha=1;noglow()});
 }else if(P.mode==='radar'){
  const cx=W*.66,cy=H*.46,R=Math.min(W,H)*.42,ang=(t*.8*SP)%6.283;
  c.strokeStyle=TH.a+'22';for(let i=1;i<=4;i++){c.beginPath();c.arc(cx,cy,R*i/4,0,6.283);c.stroke()}
  c.beginPath();c.moveTo(cx-R,cy);c.lineTo(cx+R,cy);c.moveTo(cx,cy-R);c.lineTo(cx,cy+R);c.stroke();
  for(let a=0;a<6.283;a+=Math.PI/12){c.beginPath();c.moveTo(cx+Math.cos(a)*R*.94,cy+Math.sin(a)*R*.94);c.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);c.stroke()}
  if(c.createConicGradient){const g=c.createConicGradient(ang,cx,cy);g.addColorStop(0,TH.a+'55');g.addColorStop(.14,TH.a+'00');g.addColorStop(1,TH.a+'00');c.fillStyle=g;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,0,6.283);c.fill()}
  glow(TH.a);c.strokeStyle=TH.a;c.lineWidth=LW+.6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);c.stroke();noglow();c.lineWidth=LW;
  st.blips.forEach(b=>{const da=((ang-b.a)%6.283+6.283)%6.283;if(da<.07)b.h=1;b.h*=.986;
   if(b.h>.02){const x=cx+Math.cos(b.a)*R*b.d,y=cy+Math.sin(b.a)*R*b.d;glow(TH.d);c.fillStyle=TH.d+hex(b.h*.9);c.beginPath();c.arc(x,y,3,0,6.283);c.fill();noglow()}});
  c.fillStyle=TH.a+'88';c.font='9px "IBM Plex Mono",monospace';c.fillText('PORTÉE '+Math.round(R)+' u',cx-R,cy+R+16);c.fillText(Math.round(ang*57.3)+'°',cx+6,cy-R-6);
 }else if(P.mode==='oscillo'){
  const ch=Math.max(2,Math.round(2+I*4));st.ph+=.05*SP;
  for(let k=0;k<ch;k++){
   const base=H*(k+.6)/(ch+.2),amp=H/(ch*3.1),col=cols[k%4];
   glow(col);c.strokeStyle=col;c.lineWidth=LW+.4;c.beginPath();
   for(let x=0;x<=W;x+=3){const u=x/W*12+st.ph+k*1.3;
    const y=base+Math.sin(u)*amp*.6+Math.sin(u*3.1+k)*amp*.28*TB+Math.sin(u*7.7)*amp*.14*TB+(Math.random()-.5)*TB*3;
    x?c.lineTo(x,y):c.moveTo(x,y)}
   c.stroke();noglow();c.fillStyle=col+'99';c.font='9px "IBM Plex Mono",monospace';c.fillText('CYL'+(k+1),8,base-amp-4)}
  c.strokeStyle=TH.d+'55';c.setLineDash([4,5]);c.beginPath();c.moveTo(W*.5,0);c.lineTo(W*.5,H);c.stroke();c.setLineDash([]);
  c.fillStyle=TH.d+'99';c.fillText('TRIG',W*.5+5,14);c.lineWidth=LW;
 }else if(P.mode==='gears'){
  const s=Math.max(30,P.scale),ang=t*.7*SP*DR*2;
  if(!st.gears){
   const defs=[[s*1.15,18],[s*.78,12],[s*.55,9],[s*.9,14]],arr=[];
   defs.forEach((d,i)=>{const r=d[0],prev=arr[i-1],cx=i?prev.cx+prev.r+r+s*.16:0;
    arr.push({cx,r,teeth:d[1],path:this.gearPath(r,d[1],s*.16),col:cols[i%4],dir:i%2?-1:1,ratio:18/d[1]})});
   st.gears=arr;st.goff=-arr[arr.length-1].cx/2;
  }
  c.save();c.translate(W*.5+st.goff,H*.44);
  st.gears.forEach(g=>{c.save();c.translate(g.cx,0);c.rotate(ang*g.dir*g.ratio);
   glow(g.col);c.strokeStyle=g.col;c.lineWidth=LW+.5;c.stroke(g.path);noglow();
   c.strokeStyle=g.col+'66';c.beginPath();c.arc(0,0,g.r*.32,0,6.283);c.stroke();
   for(let k=0;k<5;k++){const a=k*1.2566;c.beginPath();c.moveTo(Math.cos(a)*g.r*.32,Math.sin(a)*g.r*.32);c.lineTo(Math.cos(a)*g.r*.82,Math.sin(a)*g.r*.82);c.stroke()}
   c.restore()});
  c.restore();
  const cr=Math.min(W,H)*.1,rl=cr*3.1,px=W*.5,py=H*.87,a2=ang*1.6;
  const pinx=px+Math.cos(a2)*cr,piny=py+Math.sin(a2)*cr;
  const pist=py-Math.sqrt(Math.max(1,rl*rl-Math.pow(pinx-px,2)));
  glow(TH.b);c.strokeStyle=TH.b;c.lineWidth=LW+.8;
  c.beginPath();c.arc(px,py,cr,0,6.283);c.stroke();
  c.beginPath();c.moveTo(px,py);c.lineTo(pinx,piny);c.lineTo(px,pist);c.stroke();
  c.strokeRect(px-cr*.62,pist-cr*.5,cr*1.24,cr*.72);noglow();
  c.strokeStyle=TH.a+'55';c.lineWidth=LW;
  c.beginPath();c.moveTo(px-cr*.8,pist-cr*1.9);c.lineTo(px-cr*.8,py-cr*.4);c.moveTo(px+cr*.8,pist-cr*1.9);c.lineTo(px+cr*.8,py-cr*.4);c.stroke();
  c.fillStyle=TH.d+'99';c.font='9px "IBM Plex Mono",monospace';c.fillText('VILEBREQUIN '+Math.round((a2*57.3)%360+360)%360+'°',px+cr+10,py);
 }else if(P.mode==='carbon'){
  const s=Math.max(14,Math.round(P.scale/2));
  if(!st.tile||st.tk!==s+TH.bg){
   const o=document.createElement('canvas');o.width=o.height=s*2;const oc=o.getContext('2d');
   oc.fillStyle=TH.bg;oc.fillRect(0,0,s*2,s*2);
   for(let y=0;y<2;y++)for(let x=0;x<2;x++){
    const g=oc.createLinearGradient(x*s,y*s,(x+1)*s,(y+1)*s);
    g.addColorStop(0,(x+y)%2===0?'#FFFFFF10':'#FFFFFF04');g.addColorStop(1,'#00000030');
    oc.fillStyle=g;oc.fillRect(x*s,y*s,s,s);oc.strokeStyle='#FFFFFF08';oc.strokeRect(x*s+.5,y*s+.5,s-1,s-1)}
   st.tile=c.createPattern(o,'repeat');st.tk=s+TH.bg;
  }
  c.fillStyle=st.tile||TH.bg;c.fillRect(0,0,W,H);
  const sweep=((t*.16*SP*DR*2)%1.6-.3)*W;
  const g=c.createLinearGradient(sweep-W*.2,0,sweep+W*.2,H);
  g.addColorStop(0,TH.a+'00');g.addColorStop(.5,TH.a+hex((30*I+12)/255));g.addColorStop(1,TH.a+'00');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  st.pts.slice(0,Math.round(26*sc)).forEach((p,i)=>{p.p+=.012;const r=8+Math.sin(p.p)*4;
   c.strokeStyle=cols[i%4]+hex((.18+Math.sin(p.p)*.12)*I);
   c.beginPath();for(let k=0;k<6;k++){const a=k*1.0472+p.p*.2,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;k?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.stroke()});
 }else{
  st.tr.forEach((arr,i)=>{const last=arr[arr.length-1],target=.5+Math.sin(t*(.6+i*.35))*.3+Math.sin(t*(2.1+i))*.12*TB;
   arr.push(clamp(last+(target-last)*.16*SP+(Math.random()-.5)*TB*.05,.05,.95));if(arr.length>150)arr.shift()});
  const gw=W*.68,gh=H*.6,ox=W*.06,oy=H*.12;
  c.strokeStyle=TH.a+'18';for(let i=0;i<=4;i++){const y=oy+gh*i/4;c.beginPath();c.moveTo(ox,y);c.lineTo(ox+gw,y);c.stroke()}
  st.tr.forEach((arr,i)=>{const col=cols[i%4];glow(col);c.strokeStyle=col;c.lineWidth=LW+.5;c.beginPath();
   arr.forEach((v,j)=>{const x=ox+gw*j/(arr.length-1),y=oy+gh*(1-v);j?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();noglow();
   const lv=arr[arr.length-1],names=['RÉGIME','COUPLE','PRESSION'],vals=[Math.round(lv*7000),Math.round(lv*600),(lv*2.4).toFixed(2)];
   c.fillStyle=col;c.font='600 11px "IBM Plex Mono",monospace';c.fillText(names[i]+'  '+vals[i],ox+gw+12,oy+18+i*22);
   c.fillStyle=col+'33';c.fillRect(ox+gw+12,oy+24+i*22,Math.max(2,lv*70),3)});
  const bars=8,bw=(W*.86)/bars;
  for(let i=0;i<bars;i++){const v=.25+Math.abs(Math.sin(t*1.4+i*.7))*.7*(.5+TB*.5),x=ox+i*bw,h=H*.13*v;
   glow(cols[i%4]);c.fillStyle=cols[i%4]+'AA';c.fillRect(x,H*.92-h,bw*.62,h);noglow()}
  c.fillStyle=TH.a+'77';c.font='9px "IBM Plex Mono",monospace';c.fillText('PRESSION CYLINDRE (bar)',ox,H*.96+10);c.lineWidth=LW;
 }
 if(P.vig){const g=c.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.2,W*.5,H*.5,Math.max(W,H)*.75);
  g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000'+(P.mode==='aurora'?'55':'88'));c.fillStyle=g;c.fillRect(0,0,W,H)}
},
exportPNG(){
 const F={free:[1600,900],mobile:[1170,2532],tablet:[1668,2224],desktop:[1920,1080]}[this.P.format]||[1600,900];
 const cv=document.createElement('canvas');cv.width=F[0];cv.height=F[1];
 const ctx=cv.getContext('2d'),tg={W:F[0],H:F[1],scale:1};tg.st=this.mkState(tg);
 this.draw(ctx,F[0],F[1],this.t,this.P,tg.st,this.TH[this.P.theme],1);
 cv.toBlob(b=>{if(!b){toast('err','Export impossible','Le navigateur a refusé la génération du PNG.');return}
  const u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download=`mecadata_fond_${this.P.mode}_${this.P.theme}_${F[0]}x${F[1]}.png`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),700);
  toast('ok','Fond exporté',`${F[0]}×${F[1]} px — scène « ${this.P.mode} », palette « ${this.TH[this.P.theme].n} ».`);beep('ok')},'image/png');
},
label(k,v){const u={density:'%',speed:'%',turb:'%',glow:'%',scale:' px',stroke:' px',blur:' px',drift:'%',count:''};
 return (k==='stroke'?(+v).toFixed(1):Math.round(v))+(u[k]||'')},
sync(){
 const rb=$('#runb');if(rb){rb.innerHTML=ic(this.P.run?'pause':'play');rb.classList.toggle('on',this.P.run)}
 $$('.mb').forEach(b=>b.classList.toggle('on',b.dataset.m===this.P.mode));
 $$('.pb').forEach(b=>b.classList.toggle('on',b.dataset.t===this.P.theme));
 $$('[data-p]').forEach(el=>{const k=el.dataset.p,v=this.P[k];
  if(el.type==='checkbox')el.checked=!!v;else el.value=v;
  const out=$(`[data-pv="${k}"]`);if(out)out.textContent=this.label(k,v)});
 const hud=$('#hud');if(hud)hud.innerHTML=`<span>${this.P.mode.toUpperCase()}</span><span>${this.TH[this.P.theme].n.toUpperCase()}</span><span>${this.P.count} pts</span><span>${this.P.speed}%</span><span>${this.P.run?'LIVE':'PAUSE'}</span>`;
}
};
/* ── 7. PRIMITIVES UI ── */
function toast(type,title,msg,undo=false){
 const box=$('#ts');if(!box)return;while(box.children.length>=3)box.firstChild.remove();
 const el=document.createElement('div');el.className='to '+type;
 el.innerHTML=`${ic({ok:'check',err:'alert',warn:'alert',info:'info'}[type]||'info')}<div style="flex:1;min-width:0"><b>${esc(title)}</b>${msg?`<p>${esc(msg)}</p>`:''}</div>${undo?`<button class="btn xs amb" data-act="undo">${ic('undo')}Annuler</button>`:''}<span class="pg" style="animation-duration:${undo?8:4.6}s"></span>`;
 box.appendChild(el);
 const kill=()=>{el.classList.add('out');setTimeout(()=>el.remove(),260)};
 el._t=setTimeout(kill,undo?8000:4600);
 el.addEventListener('click',ev=>{if(ev.target.closest('[data-act=undo]')){clearTimeout(el._t);kill()}});
}
let modalOpen=false;
function openModal(html,cls=''){
 const r=$('#md');r.innerHTML=`<div class="ms" data-act="mscrim"><div class="mo ${cls}" role="dialog" aria-modal="true">${html}</div></div>`;
 requestAnimationFrame(()=>r.classList.add('on'));document.body.classList.add('lock');modalOpen=true;beep('open');
 const f=r.querySelector('input,select,textarea,button');if(f)setTimeout(()=>f.focus(),90);
}
function closeModal(){const r=$('#md');if(!r.innerHTML)return;r.classList.remove('on');modalOpen=false;if(!S.drawer)document.body.classList.remove('lock');setTimeout(()=>{if(!modalOpen)r.innerHTML=''},230);beep('close')}
function confirmModal(title,msg,act,label='Confirmer',danger=true){
 openModal(`<div class="mh">${ic('alert','color:var(--amber)')}<h3>${esc(title)}</h3><button class="tb" data-act="mclose">${ic('x')}</button></div><div class="mb2"><p style="color:var(--tx2)">${esc(msg)}</p></div><div class="mf"><button class="btn ghost" data-act="mclose">Annuler</button><button class="btn ${danger?'dgr':'pri'}" data-act="${act}">${esc(label)}</button></div>`,'slim');
}
function needAdm(){toast('warn','Accès niveau 3 requis','Déverrouillez la session ingénieur pour modifier la base.');location.hash='#/donnees'}
const sevTag=s=>`<span class="sev ${esc(s)}">${esc(s)}</span>`;
const fuelTag=f=>{const x=FU[f]||{l:f,c:'#9FB2C8'};return `<span class="fuel" style="--fc:${x.c}">${x.l}</span>`};
const iviPill=v=>{const[l,c]=IVL(v);return `<span class="ivp" style="--ic:${c}"><i></i>IVI ${v} · ${l}</span>`};
function gaugeSVG(v){const C=Math.PI*52;
 return `<svg class="gg" viewBox="0 0 120 70"><path class="ba" d="M8 62 A52 52 0 0 1 112 62"/><path class="fa" d="M8 62 A52 52 0 0 1 112 62" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${C*(1-v/100)}"/><line class="nd" x1="59" y1="61" x2="59" y2="19" data-rot="${-90+v*1.8}" style="transform:rotate(-90deg)"/><circle cx="59" cy="61" r="4" fill="var(--tx)"/></svg>`}
function corrRow(x){const F=FU[x.fuel]||{c:'#9FB2C8'},b=engBrand(x),m=engModels(x)[0];
 return `<button class="corr" style="--fc:${F.c}" data-act="openEng" data-id="${x.id}"><div style="min-width:0"><b>${esc(b?b.n:'')} ${esc(m?m.n:'')}</b><small>${esc(x.label)} · ${esc(x.code)} · ${x.y[0]}→${x.y[1]}</small></div><span class="hp">${x.hp}<small style="font-size:9px"> ch</small></span></button>`}
function faultCard(f,historic=false,full=false){
 const c=SV[f.sev]?.c||'#FFAF2E';
 return `<div class="fcard" style="--sc:${c};${historic?'opacity:.62':''}"><div class="fh"><b>${esc(f.t)}</b>${sevTag(f.sev)}</div>
 <div class="tags"><span class="tag">${f.y[0]}→${f.y[1]}</span><span class="tag">${fmt(f.km[0])}–${fmt(f.km[1])} km</span><span class="tag">fréq. ${esc(f.freq)}</span>${historic?'<span class="tag">HORS PLAGE — historique</span>':''}<span class="tag" style="color:var(--cyan)">${esc(f.status)}</span></div>
 ${(f.sym||[]).length?`<div class="tags">${f.sym.map(s=>`<span class="tag">${ic('act','width:11px;height:11px;color:var(--amber)')}${esc(s)}</span>`).join('')}</div>`:''}
 ${f.cause?`<p><b>Cause :</b> ${esc(f.cause)}</p>`:''}${f.fix?`<p><b>Action ingénieur :</b> ${esc(f.fix)}</p>`:''}
 <div class="cost">${ic('euro','width:14px;height:14px')}${f.cost[1]===0?'Prise en charge / campagne':fmt(f.cost[0])+' – '+fmt(f.cost[1])+' €'}<span class="dim" style="margin-left:auto;font-size:9.5px">MO + pièces indicatif</span></div>
 ${!full?`<div class="acts"><button class="btn xs ghost" data-act="openFault" data-id="${f.id}">${ic('chev','width:12px;height:12px')}Détail & motorisations</button></div>`:''}</div>`;
}
function tsbCard(t,full=false){
 return `<div class="tsb"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="ref">${esc(t.ref)}</span>${sevTag(t.sev)}<span class="tag">${esc(t.cat)}</span><span class="tag mono">${esc(t.date)}</span></div><b>${esc(t.t)}</b><p>${esc(t.sum)}</p><div class="act"><b style="font-size:11px;color:var(--blue);font-family:var(--mono)">ACTION :</b> ${esc(t.act)}</div>
 ${!full?`<div class="acts" style="margin-top:10px"><button class="btn xs ghost" data-act="openTsb" data-id="${t.id}">${ic('chev','width:12px;height:12px')}Détail & périmètre</button></div>`:''}</div>`;
}
function planMini(pl){
 if(!pl)return '<div class="empty">Aucun plan</div>';
 return `<div class="oil"><div class="oc"><span>${ic('oil','width:12px;height:12px')}HUILE</span><b>${esc(pl.oil?pl.oil[0]:'Sans objet')}</b><p>${pl.oil&&pl.oil[1]?pl.oil[1]+' L · ':''}${esc(pl.oil&&pl.oil[2]?pl.oil[2]:'—')}</p></div>
 <div class="oc b"><span>${ic('piston','width:12px;height:12px')}DISTRIBUTION</span><b>${esc(pl.dist?pl.dist[0]:'—')}</b><p>${pl.dist&&pl.dist[1]?fmt(pl.dist[1])+' km'+(pl.dist[2]?' / '+pl.dist[2]+' mois':''):'Chaîne / sans objet'}${pl.dist&&pl.dist[3]?' · '+esc(pl.dist[3]):''}</p></div></div>
 <div class="tw" style="border-radius:11px"><table class="mt"><thead><tr><th>Opération</th><th>Échéance</th></tr></thead><tbody>${pl.items.map(it=>`<tr><td>${esc(it[0])}</td><td class="km">${it[1]?fmt(it[1])+' km':''}${it[1]&&it[2]?' / ':''}${it[2]?it[2]+' mois':''}</td></tr>`).join('')}</tbody></table></div>
 ${pl.note?`<p style="font-size:11.5px;color:var(--amber);margin-top:9px">${ic('info','width:13px;height:13px;vertical-align:-2px')} ${esc(pl.note)}</p>`:''}`;
}
function mountAnim(scope){
 $$('[data-count]',scope).forEach(el=>{const target=+el.dataset.count||0,t0=performance.now();
  const step=t=>{if(!el.isConnected)return;const p=Math.min(1,(t-t0)/750);el.textContent=fmt(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  $$('.fa[data-off]',scope).forEach(p=>p.style.strokeDashoffset=p.dataset.off);
  $$('.nd[data-rot]',scope).forEach(p=>p.style.transform=`rotate(${p.dataset.rot}deg)`);
  $$('.brow .bt i',scope).forEach(i=>i.style.width=i.dataset.w);
  $$('.coly i',scope).forEach(i=>i.style.height=i.dataset.h);
  $$('.donut circle[data-seg]',scope).forEach(c=>c.setAttribute('stroke-dasharray',c.dataset.seg));
 }));
}
function openDrawer(type,id,push=false){
 if(S.drawer&&push)S.drawer.hist=[...(S.drawer.hist||[]),{type:S.drawer.type,id:S.drawer.id,tab:S.drawer.tab}];
 else if(!S.drawer)S.drawer={hist:[]};
 S.drawer.type=type;S.drawer.id=id;S.drawer.tab=type==='engine'?'fiche':'main';
 renderDrawer();document.body.classList.add('lock');requestAnimationFrame(()=>$('#dr').classList.add('on'));beep('open');
}
function closeDrawer(){const r=$('#dr');if(!r.innerHTML)return;r.classList.remove('on');S.drawer=null;if(!modalOpen)document.body.classList.remove('lock');setTimeout(()=>{if(!S.drawer)r.innerHTML=''},330);beep('close')}
function drawerBack(){const h=S.drawer.hist.pop();if(h){Object.assign(S.drawer,h);renderDrawer();beep('tick')}}
function renderDrawer(){
 if(!S.drawer)return;const d=S.drawer;let head='',tabs='',body='';
 if(d.type==='engine'){
  const e=DB.engines.find(x=>x.id===d.id);if(!e){closeDrawer();return}
  const b=engBrand(e),ms=engModels(e),F=FU[e.fuel]||{c:'#9FB2C8'},fs=faultsFor(e),ts=tsbFor(e),pl=planFor(e),v=ivi(e),[gl,gc]=IVL(v);
  head=`<div class="dh" style="--fc:${F.c}"><div class="row">${d.hist.length?`<button class="tb" data-act="drback" aria-label="Retour">${ic('back')}</button>`:''}<span class="tag mono">${esc(b?b.n:'—')}</span>${fuelTag(e.fuel)}<span class="tag">${esc(ms.map(m=>m.n).join(' · '))}</span><button class="tb x" data-act="drclose" aria-label="Fermer">${ic('x')}</button></div><h2>${esc(e.label)}</h2><div class="sub mono">${esc(e.code)} · ${e.y[0]}→${e.y[1]} · ${e.hp} ch / ${e.kw} kW · ${e.nm} Nm</div></div>`;
  tabs=`<div class="dtabs">${[['fiche','Fiche','piston'],['pannes','Pannes','alert',fs.length],['tsb','TSB','file',ts.length],['entretien','Entretien','wrench'],['corr','Corrélations','link']].map(t=>`<button class="dt ${d.tab===t[0]?'on':''}" data-act="drtab" data-t="${t[0]}">${ic(t[2],'width:14px;height:14px')}${t[1]}${t[3]!==undefined?`<span class="n">${t[3]}</span>`:''}</button>`).join('')}</div>`;
  if(d.tab==='fiche'){
   body=`<div class="gw" style="--gc:${gc}">${gaugeSVG(v)}<div class="gt"><b data-count="${v}">0</b><span>INDICE DE VIGILANCE INGÉNIEUR</span><p>Niveau <b style="color:${gc}">${gl}</b> — ${fs.filter(f=>f.active&&f.sev!=='info').length} alerte(s) active(s) sur la plage de production.</p></div></div>
   <div class="sg">${[['Code moteur',e.code,1],['Famille (croisement)',e.fam,1],['Cylindrée',e.disp?fmt(e.disp)+' cm³':'—'],['Architecture',e.cyl],['Puissance',e.hp+' ch / '+e.kw+' kW',1],['Couple',e.nm+' Nm'],['Suralimentation',e.asp],['Injection',e.inj],['Norme',e.norm],['Boîte',GBL[e.gb]||e.gb],['Production',e.y[0]+' → '+e.y[1]],['Énergie',(FU[e.fuel]||{}).l||e.fuel]].map(s=>`<div class="sp"><span>${s[0]}</span><b class="${s[2]?'hl':''}">${esc(s[1])}</b></div>`).join('')}</div>
   ${e.note?`<p style="margin-top:12px;font-size:12.5px;color:var(--amber)">${ic('info','width:14px;height:14px;vertical-align:-2px')} ${esc(e.note)}</p>`:''}
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
   <button class="btn sm ${GARAGE.includes(e.id)?'amb':'ghost'}" data-act="pin" data-id="${e.id}">${ic('star')}${GARAGE.includes(e.id)?'Retirer du garage':'Épingler au garage'}</button>
   <button class="btn sm ghost" data-act="goPlan" data-id="${e.id}">${ic('wrench')}Plan d'entretien</button>
   <button class="btn sm ghost" data-act="expEng" data-id="${e.id}">${ic('dl')}Exporter la fiche</button>
   ${isAdm()?`<button class="btn sm ghost" data-act="editEng" data-id="${e.id}">${ic('edit')}Modifier</button>`:''}</div>`;
  }else if(d.tab==='pannes')body=fs.length?fs.map(f=>faultCard(f,!f.active)).join(''):`<div class="empty">${ic('check')}<p>Aucune panne référencée pour cette motorisation.</p></div>`;
  else if(d.tab==='tsb')body=ts.length?ts.map(t=>tsbCard(t)).join(''):`<div class="empty">${ic('file')}<p>Aucun bulletin corrélé.</p></div>`;
  else if(d.tab==='entretien')body=planMini(pl)+`<div style="margin-top:14px"><button class="btn pri sm" data-act="goPlan" data-id="${e.id}">${ic('cal')}Ouvrir le calculateur d'échéances</button></div>`;
  else{
   const same=DB.engines.filter(x=>x.fam===e.fam&&x.id!==e.id),bs=famBrands(e.fam);
   body=`<div class="card panel" style="margin-bottom:13px"><h3>${ic('link')}Famille ${esc(e.fam)} — ${bs.length} marque(s)</h3><div class="chipset">${bs.map(i=>`<span class="tag" style="color:var(--cyan)">${esc(brandById(i)?.n||i)}</span>`).join('')}</div>${bs.length>1?`<p style="font-size:12px;color:var(--amber);margin-top:9px">${ic('bolt','width:13px;height:13px;vertical-align:-2px')} Corrélation inter-marques : pannes, TSB et entretien partagés par construction.</p>`:''}</div>
   ${same.length?same.map(corrRow).join(''):`<div class="empty">${ic('link')}<p>Première motorisation référencée sur cette famille.</p></div>`}`;
  }
 }else if(d.type==='fault'){
  const f=DB.faults.find(x=>x.id===d.id);if(!f){closeDrawer();return}
  const aff=enginesForFault(f);
  head=`<div class="dh" style="--fc:${SV[f.sev]?.c||'#FFAF2E'}"><div class="row">${d.hist.length?`<button class="tb" data-act="drback">${ic('back')}</button>`:''}${sevTag(f.sev)}<span class="tag">${esc(f.status)}</span><button class="tb x" data-act="drclose">${ic('x')}</button></div><h2>${esc(f.t)}</h2><div class="sub mono">${f.y[0]}→${f.y[1]} · ${fmt(f.km[0])}–${fmt(f.km[1])} km · fréquence ${esc(f.freq)}</div></div>`;
  body=faultCard(f,false,true)+`<div class="card panel" style="margin-top:14px"><h3>${ic('car')}Motorisations corrélées<span class="chip">${aff.length}</span></h3>${aff.slice(0,30).map(corrRow).join('')||'<p class="dim" style="font-size:12px">Aucune motorisation en base — importez des données pour élargir la corrélation.</p>'}${aff.length>30?`<p class="dim mono" style="font-size:10px;margin-top:8px">+ ${aff.length-30} autres…</p>`:''}</div>
  ${isAdm()?`<div style="display:flex;gap:8px;margin-top:14px"><button class="btn sm ghost" data-act="editFault" data-id="${f.id}">${ic('edit')}Modifier</button><button class="btn sm dgr" data-act="delFault" data-id="${f.id}">${ic('trash')}Supprimer</button></div>`:''}`;
 }else{
  const t=DB.tsb.find(x=>x.id===d.id);if(!t){closeDrawer();return}
  const aff=enginesForTsb(t);
  head=`<div class="dh" style="--fc:#4D8DFF"><div class="row">${d.hist.length?`<button class="tb" data-act="drback">${ic('back')}</button>`:''}<span class="tag mono" style="color:var(--blue)">${esc(t.ref)}</span>${sevTag(t.sev)}<button class="tb x" data-act="drclose">${ic('x')}</button></div><h2>${esc(t.t)}</h2><div class="sub mono">${esc(t.date)} · ${esc(t.cat)} · ${(t.b||[]).map(b=>brandById(b)?.n||b).join(', ')||'—'}</div></div>`;
  body=tsbCard(t,true)+`<div class="card panel" style="margin-top:14px"><h3>${ic('car')}Périmètre corrélé<span class="chip">${aff.length}</span></h3>${aff.slice(0,30).map(corrRow).join('')}</div>
  ${isAdm()?`<div style="display:flex;gap:8px;margin-top:14px"><button class="btn sm ghost" data-act="editTsb" data-id="${t.id}">${ic('edit')}Modifier</button><button class="btn sm dgr" data-act="delTsb" data-id="${t.id}">${ic('trash')}Supprimer</button></div>`:''}`;
 }
 $('#dr').innerHTML=`<div class="sc" data-act="drclose"></div><aside class="dw">${head}${tabs}<div class="db">${body}</div><div class="dfoot">${ic('shield','width:12px;height:12px')}SYNTHÈSE INGÉNIEUR — CONFIRMER AU VIN / RTA AVANT INTERVENTION</div></aside>`;
 mountAnim($('#dr'));
}
/* ── 8. VUES ── */
function render(){
 const v=S.view,main=$('#view');
 if(v!=='studio')WP.detachPreview();
 $$('.nv,#tabs a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));
 main.innerHTML=v==='bord'?vBord():v==='explorer'?vExplorer():v==='tech'?vTech():v==='entretien'?vEntretien():v==='studio'?vStudio():vDonnees();
 mountAnim(main);updateMeta();
 if(v==='explorer')refreshResults();
 if(v==='tech')refreshTech();
 if(v==='entretien')refreshCalc();
 if(v==='studio'){const cv=$('#pv');if(cv){WP.attachPreview(cv);applyFormat();WP.fx();WP.sync()}}
 if(v==='donnees'&&isAdm())refreshAdm();
}
function updateMeta(){
 const c=META.counts;
 $('#nEng').textContent=fmt(c.e);$('#nTech').textContent=fmt(c.f+c.t);$('#nPlan').textContent=fmt(c.p);
 $('#stLinks').textContent=fmt(META.links);$('#stCorr').textContent=fmt(META.corr);$('#stInt').textContent=META.integ.pct+'%';$('#stSize').textContent=META.size+' Ko';
 $('#ichip').className='chip '+(META.integ.ok?(META.integ.warn.length?'warn':'ok'):'warn');
 $('#itxt').textContent=META.integ.ok?(META.integ.warn.length?'INTÈGRE · '+META.integ.warn.length+' AVERT.':'INTÈGRE':'ERREURS '+META.integ.err.length);
 const a=isAdm();$('#admb').classList.toggle('on',a);$('#admb').innerHTML=ic(a?'unlock':'lock');
 $('#rtxt').textContent=a?'Session ING-3 active — écriture, import, suppression et réinitialisation déverrouillées.':'Session invité — lecture, corrélations et exports. Niveau 3 pour écrire.';
 $('#sndb').innerHTML=ic(PREF.sound?'snd':'mute');$('#sndb').classList.toggle('on',PREF.sound);
 updStor();
}
function vBord(){
 const c=META.counts;
 const fc=Object.keys(FU).map(f=>({f,n:DB.engines.filter(e=>e.fuel===f).length})).filter(x=>x.n);
 const total=fc.reduce((s,x)=>s+x.n,0)||1,R=54,C=2*Math.PI*R;let acc=0;
 const segs=fc.map(x=>{const len=x.n/total*C,off=-acc;acc+=len;return {...x,len,off}});
 const sc=Object.keys(SV).map(s=>({s,n:DB.faults.filter(f=>f.sev===s).length})),smax=Math.max(...sc.map(x=>x.n),1);
 const fr={};DB.engines.forEach(e=>{const o=fr[e.fam]=fr[e.fam]||{n:0,s:0};o.n++;o.s+=ivi(e)});
 const top=Object.entries(fr).filter(([,v])=>v.n>=3).map(([f,v])=>({f,v:Math.round(v.s/v.n),n:v.n})).sort((a,b)=>b.v-a.v).slice(0,8);
 const years=[];for(let y=2017;y<=2026;y++)years.push({y,n:DB.engines.filter(e=>e.y[0]<=y&&e.y[1]>=y).length});
 const ymax=Math.max(...years.map(x=>x.n),1);
 const alerts=DB.faults.filter(f=>f.sev==='critique').sort((a,b)=>(FQ[b.freq]||1)-(FQ[a.freq]||1)).slice(0,5);
 const latest=[...DB.tsb].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 return `<div class="hero rv" style="--d:0"><span class="kick">MODULE 01 — POSTE DE BORD</span>
 <h2>BASE TECHNIQUE <i>2017 → 2026</i><br>corrélée en temps réel</h2>
 <p>${fmt(c.e)} motorisations réelles (codes moteur, ch/kW, Nm) croisées avec ${fmt(c.f)} pannes connues, ${fmt(c.t)} bulletins techniques et ${fmt(c.p)} plans d'entretien. ${fmt(META.links)} liaisons actives — import illimité pour étendre la couverture à tout le parc.</p>
 <div class="acts"><a class="btn pri" href="#/explorer">${ic('car')}Explorer les motorisations</a><button class="btn amb" data-act="goImport">${ic('ul')}Importer des données</button><button class="btn ghost" data-act="expAll">${ic('dl')}Exporter la base</button><a class="btn mag" href="#/studio">${ic('spark')}Studio fond d'écran</a></div></div>
 <div class="kpis">${[['db','MARQUES',c.b,'#25D4EE'],['car','MODÈLES',c.m,'#4D8DFF'],['piston','MOTORISATIONS',c.e,'#E45CFF'],['alert','PANNES CONNUES',c.f,'#FF4D5E'],['file','BULLETINS / TSB',c.t,'#FFAF2E'],['link','FAMILLES CROISÉES',c.fam,'#43E08B']].map((k,i)=>`<div class="card kpi rv" style="--d:${i+1};--kc:${k[3]}">${ic(k[0])}<b data-count="${k[2]}">0</b><span>${k[1]}</span></div>`).join('')}</div>
 <div class="g2">
 <div class="card panel rv" style="--d:7"><h3>${ic('bolt')}Répartition des énergies<span class="chip">${fmt(total)} moteurs</span></h3>
  <div class="dwrap"><svg class="donut" viewBox="0 0 150 150"><g transform="rotate(-90 75 75)">${segs.map(s=>`<circle cx="75" cy="75" r="${R}" stroke="${FU[s.f].c}" stroke-dasharray="0 ${C}" data-seg="${s.len} ${C-s.len}" stroke-dashoffset="${s.off}"><title>${FU[s.f].l} : ${s.n}</title></circle>`).join('')}</g><text x="75" y="72" text-anchor="middle" class="c1">${fmt(total)}</text><text x="75" y="88" text-anchor="middle" class="c2">MOTEURS</text></svg>
  <div class="leg">${segs.map(s=>`<div class="li"><i style="background:${FU[s.f].c};color:${FU[s.f].c}"></i>${FU[s.f].l}<b>${s.n}</b><small>${Math.round(s.n/total*100)}%</small></div>`).join('')}</div></div></div>
 <div class="card panel rv" style="--d:8"><h3>${ic('alert')}Sévérité des pannes<span class="chip">${fmt(c.f)} fiches</span></h3>
  <div class="bars">${sc.map(x=>`<div class="brow"><span class="bl">${x.s.toUpperCase()}</span><div class="bt"><i data-w="${Math.round(x.n/smax*100)}%" style="--bc:${SV[x.s].c}"></i></div><b>${x.n}</b></div>`).join('')}</div>
  <p class="dim" style="font-size:11px;margin-top:12px">${ic('link','width:12px;height:12px;vertical-align:-2px')} ${c.inter} familles moteur partagées entre plusieurs marques (H5Ht = Renault/Nissan/Mercedes, EA288 = VW/Audi/MAN…).</p></div></div>
 <div class="g2">
 <div class="card panel rv" style="--d:9"><h3>${ic('gauge')}Familles sous vigilance — IVI moyen<span class="chip">TOP 8</span></h3>
  <div class="bars">${top.map(x=>{const[,col]=IVL(x.v);return `<div class="brow"><span class="bl" title="${x.n} motorisations">${esc(x.f)} <span class="dim">×${x.n}</span></span><div class="bt"><i data-w="${x.v}%" style="--bc:${col}"></i></div><b style="color:${col}">${x.v}</b></div>`}).join('')}</div></div>
 <div class="card panel rv" style="--d:10"><h3>${ic('cal')}Couverture par année de production</h3>
  <div class="cols">${years.map(x=>`<div class="coly"><b>${x.n}</b><i data-h="${Math.round(x.n/ymax*100)}%"></i><span>${String(x.y).slice(2)}</span></div>`).join('')}</div></div></div>
 <div class="g2">
 <div class="card panel rv" style="--d:11"><h3>${ic('alert','color:var(--red)')}Alertes prioritaires<span class="chip warn">CRITIQUE</span></h3>
  <div class="feed">${alerts.map(f=>`<button class="fi" data-act="openFault" data-id="${f.id}"><span class="fx">${ic('alert','width:15px;height:15px')}</span><span style="flex:1;min-width:0"><b>${esc(f.t)}</b><small>${esc((f.fam||[]).slice(0,4).join(' · ')||(f.fuel?FU[f.fuel].l:''))} — ${esc(f.status)}</small></span>${ic('chev','width:14px;height:14px;color:var(--tx3)')}</button>`).join('')}</div></div>
 <div class="card panel rv" style="--d:12"><h3>${ic('file','color:var(--blue)')}Derniers bulletins techniques</h3>
  <div class="feed">${latest.map(t=>`<button class="fi t" data-act="openTsb" data-id="${t.id}"><span class="fx">${ic('file','width:15px;height:15px')}</span><span style="flex:1;min-width:0"><b>${esc(t.t)}</b><small>${esc(t.ref)} · ${esc(t.date)}</small></span>${ic('chev','width:14px;height:14px;color:var(--tx3)')}</button>`).join('')}</div></div></div>
 <div class="card panel rv" style="--d:13"><h3>${ic('star','color:var(--amber)')}Garage — véhicules épinglés<span class="chip">${GARAGE.length}</span></h3>
 ${GARAGE.length?`<div class="garage">${GARAGE.map((id,i)=>{const e=DB.engines.find(x=>x.id===id);if(!e)return '';const F=FU[e.fuel]||{c:'#9FB2C8'};
  return `<div class="gcard" draggable="true" data-drag="garage" data-id="${id}" data-i="${i}"><span class="dh">${ic('drag')}</span><span class="fuel" style="--fc:${F.c}"></span><span class="gi" data-act="openEng" data-id="${id}"><b>${esc(engName(e))}</b><small>${esc(e.code)} · ${e.hp} ch · IVI ${ivi(e)}</small></span><span class="updn"><button class="btn xs ghost" data-act="garUp" data-i="${i}" aria-label="Monter">${ic('up','width:12px;height:12px')}</button><button class="btn xs ghost" data-act="garDn" data-i="${i}" aria-label="Descendre">${ic('dn','width:12px;height:12px')}</button></span><button class="btn xs dgr" data-act="pin" data-id="${id}" aria-label="Retirer">${ic('x','width:12px;height:12px')}</button></div>`}).join('')}</div><p class="dim mono" style="font-size:10px;margin-top:9px">GLISSER-DÉPOSER POUR RÉORDONNER (OU FLÈCHES)</p>`
 :`<div class="empty">${ic('star')}<p>Épinglez des motorisations depuis l'explorateur pour les suivre ici.</p><a class="btn sm pri" href="#/explorer" style="margin-top:10px">${ic('car')}Ouvrir l'explorateur</a></div>`}</div>`;
}
function computeResults(){
 const f=S.f,q=f.q.trim().toLowerCase();
 const list=DB.engines.filter(e=>{
  if(f.brand&&engBrand(e)?.id!==f.brand)return false;
  if(f.fuels.length&&!f.fuels.includes(e.fuel))return false;
  if(f.seg&&!engModels(e).some(m=>m.seg===f.seg))return false;
  if(!ov(e.y,f.y))return false;
  if(e.hp<f.p[0]||e.hp>f.p[1])return false;
  if(q&&!([engBrand(e)?.n,...engModels(e).map(m=>m.n),e.code,e.fam,e.label].join(' ').toLowerCase().includes(q)))return false;
  return true;
 });
 const cache={},gi=e=>cache[e.id]!==undefined?cache[e.id]:(cache[e.id]=ivi(e));
 const sorts={brand:(a,b)=>(engBrand(a)?.n||'').localeCompare(engBrand(b)?.n||'')||b.hp-a.hp,
  model:(a,b)=>(engModels(a)[0]?.n||'').localeCompare(engModels(b)[0]?.n||''),
  hpdesc:(a,b)=>b.hp-a.hp,hpasc:(a,b)=>a.hp-b.hp,year:(a,b)=>b.y[0]-a.y[0],ivi:(a,b)=>gi(b)-gi(a)};
 return list.sort(sorts[f.sort]||sorts.brand);
}
function engCard(e,i){
 const F=FU[e.fuel]||{c:'#9FB2C8'},b=engBrand(e),ms=engModels(e),v=ivi(e),
 nf=faultsFor(e).filter(f=>f.sev!=='info').length,nt=tsbFor(e).length,pin=GARAGE.includes(e.id);
 return `<article class="card hov eng rv" style="--d:${Math.min(i,14)};--fc:${F.c}" data-act="openEng" data-id="${e.id}" tabindex="0" role="button" aria-label="${esc(engName(e))}">
 <div class="top"><span class="br">${esc(b?b.n:'—')}</span>${fuelTag(e.fuel)}<button class="st ${pin?'on':''}" data-act="pin" data-id="${e.id}" aria-label="Épingler">${ic('star','width:15px;height:15px')}</button></div>
 <h4>${esc(ms.map(m=>m.n).join(' / '))}</h4><div class="lbl">${esc(e.label)}</div>
 <div class="pw"><b>${e.hp}</b><span>ch · ${e.kw} kW</span><span style="margin-left:auto">${e.nm} Nm</span></div>
 <div class="meta"><span class="tag mono">${esc(e.code)}</span><span class="tag">${e.y[0]}→${e.y[1]}</span><span class="tag">${esc(GBL[e.gb]||e.gb)}</span></div>
 <div class="ft"><span>${ic('alert','color:'+(nf?'var(--amber)':'var(--tx3)'))} ${nf}</span><span>${ic('file','color:'+(nt?'var(--blue)':'var(--tx3)'))} ${nt}</span>${iviPill(v)}</div></article>`;
}
function vExplorer(){
 const f=S.f;
 return `<div class="vh rv"><div><span class="kick">MODULE 02 — EXPLORATEUR</span><h1>MOTORISATIONS <i>2017+</i></h1><div class="sub">Filtres croisés marque × énergie × année × puissance — corrélation instantanée pannes / TSB / entretien.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="saveView">${ic('save')}Enregistrer la vue</button><button class="btn sm ghost" data-act="resetFilters">${ic('reset')}Réinitialiser</button></div></div>
 ${VIEWS.length?`<div class="sviews">${VIEWS.map((v,i)=>`<span class="sview" data-act="applyView" data-i="${i}">${ic('eye','width:11px;height:11px')}${esc(v.name)}<button data-act="delView" data-i="${i}" aria-label="Supprimer la vue">${ic('x','width:11px;height:11px')}</button></span>`).join('')}</div>`:''}
 <div class="bstrip rv" style="--d:1">${DB.brands.map(b=>{const n=DB.engines.filter(e=>engBrand(e)?.id===b.id).length;return `<button class="btile ${f.brand===b.id?'on':''}" data-act="fbrand" data-b="${b.id}"><b>${esc(b.n)}</b><small>${n} mot.</small></button>`}).join('')}</div>
 <div class="exwrap">
 <details class="card filters rv" style="--d:2" open><summary>${ic('filter')}FILTRES CROISÉS</summary>
  <div class="fsec"><label class="lb">Recherche</label><input class="inp" type="search" data-f="q" value="${esc(f.q)}" placeholder="Modèle, code moteur, famille…"></div>
  <div class="fsec"><label class="lb">Énergie</label><div class="chipset">${Object.entries(FU).map(([k,v])=>`<button class="fc ${f.fuels.includes(k)?'on':''}" style="--fc:${v.c}" data-act="ffuel" data-k="${k}">${v.l}</button>`).join('')}</div></div>
  <div class="fsec"><label class="lb">Années de production</label><div class="rng2"><input type="range" min="2017" max="2026" value="${f.y[0]}" data-f="y0" aria-label="Année début"><input type="range" min="2017" max="2026" value="${f.y[1]}" data-f="y1" aria-label="Année fin"></div><div class="rngval"><span>2017</span><span id="yLbl">${f.y[0]} → ${f.y[1]}</span><span>2026</span></div></div>
  <div class="fsec"><label class="lb">Puissance (ch)</label><div class="rng2"><input type="range" min="0" max="1050" step="5" value="${f.p[0]}" data-f="p0" aria-label="Puissance min"><input type="range" min="0" max="1050" step="5" value="${f.p[1]}" data-f="p1" aria-label="Puissance max"></div><div class="rngval"><span>0</span><span id="pLbl">${f.p[0]} – ${f.p[1]} ch</span><span>1050</span></div></div>
  <div class="fsec"><label class="lb">Segment</label><select class="sel" data-f="seg"><option value="">Tous segments</option>${SEGS.map(s=>`<option ${f.seg===s?'selected':''}>${s}</option>`).join('')}</select></div>
  <div class="fsec"><label class="lb">Marque</label><select class="sel" data-f="brand"><option value="">Toutes marques</option>${DB.brands.map(b=>`<option value="${b.id}" ${f.brand===b.id?'selected':''}>${esc(b.n)}</option>`).join('')}</select></div>
 </details>
 <div><div class="bar"><span class="cnt" id="resCount">—</span><span class="dim mono" style="font-size:10px" id="resCorr"></span>
  <select class="sel" data-f="sort" style="margin-left:auto;width:auto;min-width:168px" aria-label="Tri">${[['brand','Marque A→Z'],['model','Modèle A→Z'],['hpdesc','Puissance ↓'],['hpasc','Puissance ↑'],['year','Année ↓'],['ivi','Vigilance IVI ↓']].map(o=>`<option value="${o[0]}" ${f.sort===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>
 <div class="eg" id="resGrid"></div><div class="more" id="resMore"></div></div></div>`;
}
function refreshResults(){
 const grid=$('#resGrid');if(!grid)return;
 const list=computeResults(),slice=list.slice(0,S.shown);
 grid.innerHTML=slice.length?slice.map(engCard).join(''):`<div class="empty" style="grid-column:1/-1">${ic('search')}<p>Aucune motorisation ne correspond aux filtres croisés.</p><button class="btn sm ghost" data-act="resetFilters" style="margin-top:10px">${ic('reset')}Réinitialiser les filtres</button></div>`;
 $('#resCount').textContent=`${fmt(list.length)} motorisation(s) · ${new Set(list.map(e=>engBrand(e)?.id)).size} marque(s)`;
 $('#resCorr').textContent=`${fmt(list.reduce((s,e)=>s+faultsFor(e).length,0))} corrélations pannes`;
 $('#resMore').innerHTML=list.length>S.shown?`<button class="btn ghost" data-act="more">${ic('dn')}Afficher plus (${fmt(list.length-S.shown)} restantes)</button>`:'';
 const yl=$('#yLbl'),pl=$('#pLbl');if(yl)yl.textContent=`${S.f.y[0]} → ${S.f.y[1]}`;if(pl)pl.textContent=`${S.f.p[0]} – ${S.f.p[1]} ch`;
 mountAnim(grid);
}
function vTech(){
 const L=S.tech;
 return `<div class="vh rv"><div><span class="kick">MODULE 03 — BIBLIOTHÈQUE TECHNIQUE</span><h1>PANNES <i>&</i> BULLETINS</h1><div class="sub">${fmt(DB.faults.length)} pannes connues · ${fmt(DB.tsb.length)} TSB / campagnes — chaque fiche liste ses motorisations corrélées.</div></div>
 ${isAdm()?`<div style="display:flex;gap:8px"><button class="btn sm pri" data-act="newFault">${ic('plus')}Nouvelle panne</button><button class="btn sm ghost" data-act="newTsb">${ic('plus')}Nouveau TSB</button></div>`:''}</div>
 <div class="atabs"><button class="at ${L.tab==='faults'?'on':''}" data-act="techTab" data-t="faults">${ic('alert','width:14px;height:14px')}PANNES CONNUES<span class="n">${DB.faults.length}</span></button><button class="at ${L.tab==='tsb'?'on':''}" data-act="techTab" data-t="tsb">${ic('file','width:14px;height:14px')}BULLETINS / TSB<span class="n">${DB.tsb.length}</span></button></div>
 <div class="bar"><input class="inp" style="max-width:300px" type="search" data-tf="q" value="${esc(L.q)}" placeholder="Titre, famille, référence…">
 ${L.tab==='faults'?`<div class="chipset">${Object.keys(SV).map(s=>`<button class="fc ${L.sev===s?'on':''}" style="--fc:${SV[s].c}" data-act="techSev" data-s="${s}">${s}</button>`).join('')}</div>`
 :`<select class="sel" style="width:auto" data-tf="cat"><option value="">Toutes catégories</option>${[...new Set(DB.tsb.map(t=>t.cat))].map(c=>`<option ${L.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</select>`}
 <select class="sel" style="width:auto" data-tf="brand"><option value="">Toutes marques</option>${DB.brands.map(b=>`<option value="${b.id}" ${L.brand===b.id?'selected':''}>${esc(b.n)}</option>`).join('')}</select>
 <span class="cnt" id="techCount" style="margin-left:auto"></span></div>
 <div id="techGrid" class="eg" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))"></div>`;
}
function refreshTech(){
 const L=S.tech,grid=$('#techGrid');if(!grid)return;const q=L.q.trim().toLowerCase();let html='',n=0;
 if(L.tab==='faults'){
  const list=DB.faults.filter(f=>{
   if(L.sev&&f.sev!==L.sev)return false;
   if(L.brand){const bs=new Set();enginesForFault(f).forEach(e=>{const b=engBrand(e);if(b)bs.add(b.id)});if(!bs.has(L.brand))return false}
   if(q&&!(f.t+' '+(f.fam||[]).join(' ')+' '+f.cause+' '+f.status).toLowerCase().includes(q))return false;
   return true}).sort((a,b)=>(SV[b.sev]?.w||0)-(SV[a.sev]?.w||0));
  n=list.length;
  html=list.map((f,i)=>`<div class="rv" style="--d:${Math.min(i,12)}">${faultCard(f)}<div class="dim mono" style="font-size:10px;margin:-4px 0 10px 4px">${ic('link','width:11px;height:11px;vertical-align:-2px')} ${enginesForFault(f).length} motorisation(s) corrélée(s)</div></div>`).join('');
 }else{
  const list=DB.tsb.filter(t=>{
   if(L.cat&&t.cat!==L.cat)return false;
   if(L.brand&&!(t.b||[]).includes(L.brand))return false;
   if(q&&!(t.t+' '+t.ref+' '+(t.fam||[]).join(' ')).toLowerCase().includes(q))return false;
   return true}).sort((a,b)=>b.date.localeCompare(a.date));
  n=list.length;html=list.map((t,i)=>`<div class="rv" style="--d:${Math.min(i,12)}">${tsbCard(t)}</div>`).join('');
 }
 grid.innerHTML=html||`<div class="empty" style="grid-column:1/-1">${ic('search')}<p>Aucun résultat pour ces filtres.</p></div>`;
 $('#techCount').textContent=`${n} fiche(s)`;mountAnim(grid);
}
function planItems(q){
 q=q.toLowerCase();
 return DB.maint.filter(p=>!q||(p.name+' '+(p.fam||[]).join(' ')).toLowerCase().includes(q))
 .map(p=>`<button class="pitem ${p.id===S.plan?'on':''}" data-act="selPlan" data-id="${p.id}"><b>${esc(p.name)}</b><small>${esc((p.fam||[]).join(' · ')||(FU[p.fuel]?.l+' — générique'))}</small></button>`).join('')||'<div class="empty" style="padding:16px">Aucun plan</div>';
}
function vEntretien(){
 if(!S.plan||!DB.maint.find(p=>p.id===S.plan))S.plan=DB.maint[0]?.id;
 const pl=DB.maint.find(p=>p.id===S.plan),ctx=S.planCtx?DB.engines.find(e=>e.id===S.planCtx):null;
 return `<div class="vh rv"><div><span class="kick">MODULE 04 — PLANS D'ENTRETIEN</span><h1>ENTRETIEN <i>& ÉCHÉANCES</i></h1><div class="sub">Plans par famille moteur (huile, distribution, opérations) + calculateur d'échéances selon kilométrage et mise en circulation.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap">${isAdm()?`<button class="btn sm ghost" data-act="editPlan" data-id="${pl?.id}">${ic('edit')}Modifier le plan</button>`:''}<button class="btn sm ghost" data-act="expPlan" data-id="${pl?.id}">${ic('dl')}Exporter le plan</button></div></div>
 ${ctx?`<div class="chip warn" style="margin-bottom:12px">${ic('car','width:13px;height:13px')}Contexte : ${esc(engName(ctx))}<button data-act="clearCtx" aria-label="Effacer le contexte" style="color:var(--tx3);display:grid;place-items:center">${ic('x','width:12px;height:12px')}</button></div>`:''}
 <div class="mwrap">
 <div class="card plist rv" style="--d:1"><input class="inp" type="search" id="planSearch" placeholder="Filtrer les plans…" style="margin-bottom:4px"><div id="planItems">${planItems('')}</div></div>
 <div><div class="card panel rv" style="--d:2"><h3>${ic('wrench')}${esc(pl?.name||'—')}<span class="chip">${(pl?.fam||[]).length?pl.fam.length+' familles':(FU[pl?.fuel]?.l||'générique')}</span></h3>
  ${(pl?.fam||[]).length?`<div class="chipset" style="margin-bottom:12px">${pl.fam.map(f=>`<span class="tag mono" style="color:var(--cyan)">${esc(f)}</span>`).join('')}</div>`:''}
  ${planMini(pl)}</div>
  <div class="calc rv" style="--d:3"><h3>${ic('cal')}CALCULATEUR D'ÉCHÉANCES</h3>
   <div class="fr f3"><div><label class="lb">Kilométrage actuel</label><input class="inp mono" type="number" min="0" max="999999" step="1000" data-calc="km" value="${S.calc.km}"></div>
   <div><label class="lb">Mise en circulation</label><input class="inp mono" type="number" min="2010" max="2026" data-calc="year" value="${S.calc.year}"></div>
   <div><label class="lb">Profil d'usage</label><select class="sel" data-calc="sev"><option value="1" ${S.calc.sev===1?'selected':''}>Normal</option><option value="0.75" ${S.calc.sev===.75?'selected':''}>Sévère (urbain / charge)</option></select></div></div>
   <div class="due" id="dueList"></div>
   <p class="dim mono" style="font-size:9.5px;margin-top:10px">ESTIMATION INGÉNIEUR — REMPLACER PAR LE CARNET CONSTRUCTEUR / RTA EN CAS DE DIVERGENCE.</p></div></div></div>`;
}
function refreshCalc(){
 const box=$('#dueList');if(!box)return;
 const pl=DB.maint.find(p=>p.id===S.plan);if(!pl){box.innerHTML='';return}
 const km=clamp(+S.calc.km||0,0,999999),yr=clamp(+S.calc.year||2021,2010,2026),now=new Date(),
 age=Math.max(1,(now.getFullYear()-yr)*12+now.getMonth()),sev=+S.calc.sev||1,rows=[];
 const add=(op,ikm,imo)=>{
  ikm=Math.round(ikm*sev);
  if(ikm>0){
   const next=Math.max(ikm,Math.ceil((km+1)/ikm)*ikm),rem=next-km,pct=clamp((ikm-rem)/ikm*100,0,100);
   let badge,cls;if(rem<=1500){badge='ÉCHÉANCE PROCHE';cls='now'}else if(rem<=ikm*.2){badge='BIENTÔT';cls='soon'}else{badge='DANS '+fmt(rem)+' KM';cls='ok'}
   let detail='Prochaine : '+fmt(next)+' km';
   if(imo>0){const nm=Math.ceil(age/imo)*imo,d=new Date(yr,0);d.setMonth(d.getMonth()+nm);detail+=' · ou '+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
   rows.push({op,badge,cls,pct,detail,u:rem/ikm});
  }else if(imo>0){
   const nm=Math.ceil(age/imo)*imo,d=new Date(yr,0);d.setMonth(d.getMonth()+nm);const rem=nm-age;
   let badge,cls;if(rem<=1){badge='À FAIRE';cls='now'}else if(rem<=3){badge='BIENTÔT';cls='soon'}else{badge='DANS '+rem+' MOIS';cls='ok'}
   rows.push({op,badge,cls,pct:clamp((imo-rem)/imo*100,0,100),detail:'Échéance : '+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(),u:rem/imo});
  }else rows.push({op,badge:'SELON CONSTRUCTEUR',cls:'ok',pct:0,detail:'Contrôle conditionnel',u:2});
 };
 pl.items.forEach(it=>add(it[0],it[1],it[2]));
 if(pl.dist&&pl.dist[1])add('Distribution : '+pl.dist[0],pl.dist[1],pl.dist[2]);
 rows.sort((a,b)=>a.u-b.u);
 box.innerHTML=rows.map(r=>`<div class="drow" style="--dc:${r.cls==='now'?'var(--red)':r.cls==='soon'?'var(--amber)':'var(--green)'}"><div class="dr1"><b>${esc(r.op)}</b><span class="dbadge ${r.cls}">${r.badge}</span></div><div class="pb"><i style="width:${Math.round(r.pct)}%"></i></div><div class="dim mono" style="font-size:10px;margin-top:5px">${esc(r.detail)}</div></div>`).join('');
}
function applyFormat(){
 const sc=$('#screen');if(!sc)return;
 const F={free:['16/9','100%'],mobile:['390/844','300px'],tablet:['834/1112','440px'],desktop:['16/9','100%']}[WP.P.format]||['16/9','100%'];
 sc.style.aspectRatio=F[0];sc.style.maxWidth=F[1];
 const ch=$('#chrome');if(ch)ch.innerHTML=WP.P.format==='mobile'?'<span class="nt"></span>':WP.P.format==='free'?'':'<span class="dt"></span><span class="dt"></span><span class="dt"></span><span style="margin-left:8px">MECADATA · APERÇU BUREAU</span>';
 setTimeout(()=>WP.resize(),80);
}
function vStudio(){
 const P=WP.P;
 const sl=(k,label,min,max,step=1)=>`<div><div class="srow"><span>${label}</span><span class="sval" data-pv="${k}">${WP.label(k,P[k])}</span></div><input type="range" data-p="${k}" min="${min}" max="${max}" step="${step}" value="${P[k]}" aria-label="${label}"></div>`;
 const tg=(k,label)=>`<div class="srow"><span>${label}</span><label class="sw"><input type="checkbox" data-p="${k}" ${P[k]?'checked':''} aria-label="${label}"><i></i></label></div>`;
 const thumb={blueprint:'repeating-linear-gradient(0deg,#0A2233 0 5px,#12405C 5px 6px)',aurora:'linear-gradient(120deg,#25D4EE,#E45CFF,#FFAF2E)',flux:'radial-gradient(2px 2px at 25% 40%,#25D4EE 50%,transparent 51%),radial-gradient(2px 2px at 65% 70%,#E45CFF 50%,transparent 51%),#0A1424',radar:'conic-gradient(from 0deg,rgba(67,224,139,.8),transparent 70%),#0A2218',oscillo:'repeating-linear-gradient(90deg,#0A1424 0 3px,#43E08B 3px 4px)',gears:'radial-gradient(circle at 38% 50%,#FFAF2E 22%,transparent 23%),radial-gradient(circle at 70% 50%,#FF7A3D 16%,transparent 17%),#120A04',carbon:'repeating-conic-gradient(#1A2230 0 25%,#0A1018 0 50%) 0 0/8px 8px',telemetry:'linear-gradient(0deg,#FF4D5E 30%,transparent 31%),linear-gradient(90deg,#0A1424,#12305C)'};
 return `<div class="vh rv"><div><span class="kick">MODULE 05 — STUDIO FOND D'ÉCRAN</span><h1>FONDS <i>ANIMÉS</i> — 8 SCÈNES</h1><div class="sub">Moteur canvas temps réel appliqué au fond de la console et exportable en PNG. Tous les réglages agissent immédiatement.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="stRandom">${ic('dice')}Aléatoire</button><button class="btn sm ghost" data-act="stReset">${ic('reset')}Réinitialiser</button><button class="btn sm pri" data-act="stPng">${ic('cam')}Export PNG</button></div></div>
 <div class="stwrap">
 <div class="card stage rv" style="--d:1">
  <div class="screen" id="screen"><canvas id="pv"></canvas><div class="chrome" id="chrome"></div><div class="fx"><div class="v"></div><div class="g"></div><div class="s"></div></div><div class="hud" id="hud"></div></div>
  <div class="stagebar">
   <button class="btn sm ${P.run?'amb':'ghost'}" data-act="stRun">${ic(P.run?'pause':'play')}${P.run?'Pause':'Lecture'}</button>
   <button class="btn sm ghost" data-act="stJson">${ic('dl')}Preset JSON</button>
   <span class="chip" style="margin-left:auto">${ic('info','width:12px;height:12px')}Rendu canvas · DPR plafonné</span>
  </div>
  <div class="presets" style="margin-top:11px">${Object.keys(WP.PRESETS).map(n=>`<button class="ps" data-act="stPreset" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
 </div>
 <div class="card ctrl rv" style="--d:2">
  <h3>${ic('spark')}RÉGLAGES LIVE</h3>
  <div class="csec"><label class="lb">Scène</label><div class="mgrid">${WP.MODES.map(m=>`<button class="mb ${P.mode===m[0]?'on':''}" data-act="stMode" data-m="${m[0]}"><i style="background:${thumb[m[0]]}"></i>${m[1]}</button>`).join('')}</div></div>
  <div class="csec"><label class="lb">Palette</label><div class="pgrid">${Object.entries(WP.TH).map(([k,v])=>`<button class="pb ${P.theme===k?'on':''}" data-act="stTheme" data-t="${k}" title="${v.n}" aria-label="${v.n}" style="background:linear-gradient(135deg,${v.a},${v.b},${v.c});color:${v.a}"></button>`).join('')}</div></div>
  <div class="csec">${sl('density','Densité',0,100)}${sl('count','Particules',10,400,5)}${sl('speed','Vitesse',0,200,5)}${sl('turb','Turbulence',0,100)}</div>
  <div class="csec">${sl('scale','Échelle / grille',20,160,2)}${sl('glow','Halo lumineux',0,100)}${sl('blur','Flou',0,8,.5)}${sl('stroke','Épaisseur trait',.5,4,.1)}${sl('drift','Dérive caméra',0,100)}</div>
  <div class="csec"><div class="fr f2"><div><label class="lb">Qualité</label><select class="sel" data-p="quality"><option value="eco" ${P.quality==='eco'?'selected':''}>Éco · 1×</option><option value="std" ${P.quality==='std'?'selected':''}>Standard · 1.5×</option><option value="ultra" ${P.quality==='ultra'?'selected':''}>Ultra · 2×</option></select></div>
  <div><label class="lb">Format d'export</label><select class="sel" data-p="format"><option value="free" ${P.format==='free'?'selected':''}>Libre 1600×900</option><option value="mobile" ${P.format==='mobile'?'selected':''}>Mobile 1170×2532</option><option value="tablet" ${P.format==='tablet'?'selected':''}>Tablette 1668×2224</option><option value="desktop" ${P.format==='desktop'?'selected':''}>Bureau 1920×1080</option></select></div></div></div>
  <div class="csec">${tg('grid','Grille & repères')}${tg('grain','Grain technique')}${tg('scan','Balayage lumineux')}${tg('vig','Vignettage')}${tg('run','Animation active')}${tg('bg','Fond global de la console')}</div>
 </div></div>`;
}
function vDonnees(){
 if(!isAdm())return `<div class="card lockc rv" id="lockCard"><div class="sh">${ic('lock')}</div><span class="kick" style="justify-content:center">ACCÈS RESTREINT</span><h2 style="margin-top:6px">FICHIERS CROISÉS DYNAMIQUES</h2><p>Import / export, CRUD, intégrité et réinitialisation réservés à la session ingénieur <b class="mono" style="color:var(--amber)">NIVEAU 3</b>. La consultation reste libre.</p>
 <form data-form="unlock"><input class="inp" type="password" name="pwd" placeholder="MOT DE PASSE ADMINISTRATEUR" autocomplete="current-password" aria-label="Mot de passe administrateur"><button class="btn amb" type="submit" id="unlockBtn">${ic('unlock')}DÉVERROUILLER NIVEAU 3</button></form>
 <p class="dim mono" style="font-size:9.5px;margin-top:14px" id="lockMsg">SESSION CONSERVÉE JUSQU'À FERMETURE DE L'ONGLET</p></div>`;
 return `<div class="vh rv"><div><span class="kick">MODULE 06 — ADMINISTRATION ING-3</span><h1>FICHIERS <i>CROISÉS DYNAMIQUES</i></h1><div class="sub">6 fichiers liés par identifiants et familles moteur — import illimité, validation transactionnelle, intégrité en continu.</div></div>
 <div style="display:flex;gap:8px;align-items:center"><span class="chip warn">${ic('shield','width:12px;height:12px')}SESSION ING-3</span><button class="btn sm ghost" data-act="logout">${ic('lock')}Verrouiller</button></div></div>
 <div class="fgrid2">${FILES.map((f,i)=>{const arr=DB[f[0]],kb=Math.round(JSON.stringify(arr).length/1024);
  return `<div class="card hov filecard rv" style="--d:${i}"><div class="fn">${ic('file')}${f[1]}</div><div class="ct">${fmt(arr.length)} <small>enregistrements</small></div><div class="fs">${kb} Ko · ${f[2]}</div>
  <div class="fa"><button class="btn xs ghost" data-act="fileView" data-k="${f[0]}">${ic('eye','width:12px;height:12px')}Voir</button><button class="btn xs ghost" data-act="fileExp" data-k="${f[0]}">${ic('dl','width:12px;height:12px')}JSON</button>${f[0]!=='maint'?`<button class="btn xs ghost" data-act="fileCsv" data-k="${f[0]}">CSV</button>`:''}<button class="btn xs amb" data-act="fileImp" data-k="${f[0]}">${ic('ul','width:12px;height:12px')}Importer</button></div></div>`}).join('')}</div>
 <div class="tools"><button class="btn pri sm" data-act="goImport">${ic('ul')}Import global / bundle</button><button class="btn ghost sm" data-act="expAll">${ic('dl')}Exporter tout (JSON)</button><button class="btn ghost sm" data-act="expBaseJs">${ic('dl')}Exporter data/base.js</button><button class="btn ghost sm" data-act="integrity">${ic('check')}Vérifier l'intégrité</button><button class="btn dgr sm" data-act="askReset">${ic('reset')}Réinitialiser base usine</button></div>
 <div class="atabs">${[['engines','MOTORISATIONS','piston',DB.engines.length],['faults','PANNES','alert',DB.faults.length],['tsb','TSB','file',DB.tsb.length],['journal','JOURNAL','clock',AUDIT.length]].map(t=>`<button class="at ${S.adm.tab===t[0]?'on':''}" data-act="admTab" data-t="${t[0]}">${ic(t[2],'width:14px;height:14px')}${t[1]}<span class="n">${t[3]}</span></button>`).join('')}</div>
 <div id="admZone"></div>`;
}
const PAGE=20;
function refreshAdm(){
 const z=$('#admZone');if(!z||!isAdm())return;const A=S.adm,q=A.q.trim().toLowerCase();
 if(A.tab==='journal'){
  z.innerHTML=`<div class="journal">${[...AUDIT].reverse().map(a=>{const d=new Date(a.ts);return `<div class="jr ${a.type}"><time>${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR')}</time><span class="jt">${a.type.toUpperCase()}</span><span>${esc(a.msg)}</span></div>`}).join('')||'<div class="empty">Journal vide</div>'}</div>`;return;
 }
 const cfg={
  engines:{arr:DB.engines,cols:['Motorisation','Code / Famille','Énergie','ch / kW','Années','IVI'],
   row:e=>[`<b>${esc(engName(e))}</b>`,`<span class="mono" style="color:var(--cyan)">${esc(e.code)}</span> <span class="tag">${esc(e.fam)}</span>`,fuelTag(e.fuel),`<span class="mono">${e.hp} / ${e.kw}</span>`,`<span class="mono">${e.y[0]}→${e.y[1]}</span>`,iviPill(ivi(e))],
   search:e=>(engName(e)+e.code+e.fam).toLowerCase(),edit:'editEng',del:'delEng',add:'newEng'},
  faults:{arr:DB.faults,cols:['Panne','Sévérité','Familles','Années','Coût €','Corrélées'],
   row:f=>[`<b>${esc(f.t)}</b>`,sevTag(f.sev),`<span class="mono" style="font-size:10px">${esc((f.fam||[]).slice(0,4).join(', ')||f.fuel||'—')}</span>`,`<span class="mono">${f.y[0]}→${f.y[1]}</span>`,`<span class="mono">${fmt(f.cost[0])}–${fmt(f.cost[1])}</span>`,`<span class="mono" style="color:var(--cyan)">${enginesForFault(f).length}</span>`],
   search:f=>(f.t+(f.fam||[]).join(' ')).toLowerCase(),edit:'editFault',del:'delFault',add:'newFault'},
  tsb:{arr:DB.tsb,cols:['Réf / Titre','Date','Catégorie','Gravité','Marques','Corrélées'],
   row:t=>[`<span class="mono" style="color:var(--blue);font-size:10.5px">${esc(t.ref)}</span><br><b>${esc(t.t)}</b>`,`<span class="mono">${esc(t.date)}</span>`,`<span class="tag">${esc(t.cat)}</span>`,sevTag(t.sev),`<span style="font-size:11px">${esc((t.b||[]).map(b=>brandById(b)?.n||b).slice(0,3).join(', '))}</span>`,`<span class="mono" style="color:var(--cyan)">${enginesForTsb(t).length}</span>`],
   search:t=>(t.t+t.ref).toLowerCase(),edit:'editTsb',del:'delTsb',add:'newTsb'}
 }[A.tab];
 const list=cfg.arr.filter(x=>!q||cfg.search(x).includes(q)),pages=Math.max(1,Math.ceil(list.length/PAGE));
 A.page=clamp(A.page,0,pages-1);
 const slice=list.slice(A.page*PAGE,(A.page+1)*PAGE);
 z.innerHTML=`<div class="bar"><input class="inp" style="max-width:280px" type="search" data-af="q" value="${esc(A.q)}" placeholder="Filtrer…"><button class="btn sm pri" data-act="${cfg.add}" style="margin-left:auto">${ic('plus')}Ajouter</button></div>
 ${A.sel.size?`<div class="bulk">${ic('check','width:14px;height:14px')} ${A.sel.size} sélectionné(s)<button class="btn xs ghost" data-act="bulkExp">${ic('dl','width:12px;height:12px')}Exporter</button><button class="btn xs dgr" data-act="bulkDel">${ic('trash','width:12px;height:12px')}Supprimer</button><button class="btn xs ghost" data-act="bulkClear" style="margin-left:auto">Effacer</button></div>`:''}
 <div class="tw"><table class="t"><thead><tr><th style="width:34px"><input type="checkbox" data-act="selAll" ${slice.length&&slice.every(x=>A.sel.has(x.id))?'checked':''} aria-label="Tout sélectionner"></th>${cfg.cols.map(c=>`<th>${c}</th>`).join('')}<th style="text-align:right">Actions</th></tr></thead>
 <tbody>${slice.map(x=>`<tr><td><input type="checkbox" data-act="selOne" data-id="${x.id}" ${A.sel.has(x.id)?'checked':''} aria-label="Sélectionner"></td>${cfg.row(x).map(c=>`<td>${c}</td>`).join('')}<td><div class="acts"><button class="btn xs ghost" data-act="${cfg.edit}" data-id="${x.id}" aria-label="Modifier">${ic('edit','width:12px;height:12px')}</button><button class="btn xs dgr" data-act="${cfg.del}" data-id="${x.id}" aria-label="Supprimer">${ic('trash','width:12px;height:12px')}</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty" style="border:0">Aucun enregistrement</div></td></tr>'}</tbody></table></div>
 <div class="pager"><span>${fmt(list.length)} entrées · page ${A.page+1}/${pages}</span><button class="btn xs ghost" data-act="pgPrev" ${A.page===0?'disabled':''}>${ic('back','width:12px;height:12px')}</button><button class="btn xs ghost" data-act="pgNext" ${A.page>=pages-1?'disabled':''}>${ic('chev','width:12px;height:12px')}</button></div>`;
}
/* ── 9. CSV / IMPORT / EXPORT ── */
const CSVH={brands:'id,n,pays,grp',models:'id,b,n,y0,y1,seg',engines:'id,code,fam,label,fuel,disp,hp,nm,y0,y1,models,gb,norm,cyl,asp,inj,note',faults:'id,t,fam,sev,freq,y0,y1,km0,km1,sym,cause,fix,cost0,cost1,fuel,status',tsb:'id,ref,b,fam,t,date,cat,sev,sum,act'};
function toCSV(k){
 const q=v=>{v=String(v??'');return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
 const rows=DB[k].map(x=>{
  if(k==='brands')return [x.id,x.n,x.pays,x.grp];
  if(k==='models')return [x.id,x.b,x.n,x.y[0],x.y[1],x.seg];
  if(k==='engines')return [x.id,x.code,x.fam,x.label,x.fuel,x.disp,x.hp,x.nm,x.y[0],x.y[1],x.m.join(';'),x.gb,x.norm,x.cyl,x.asp,x.inj,x.note];
  if(k==='faults')return [x.id,x.t,(x.fam||[]).join(';'),x.sev,x.freq,x.y[0],x.y[1],x.km[0],x.km[1],(x.sym||[]).join(';'),x.cause,x.fix,x.cost[0],x.cost[1],x.fuel,x.status];
  return [x.id,x.ref,(x.b||[]).join(';'),(x.fam||[]).join(';'),x.t,x.date,x.cat,x.sev,x.sum,x.act];
 });
 return CSVH[k]+'\n'+rows.map(r=>r.map(q).join(',')).join('\n');
}
function parseCSV(text){
 const rows=[];let row=[],cur='',inQ=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(inQ){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else inQ=false}else cur+=ch}
  else if(ch==='"')inQ=true;
  else if(ch===','){row.push(cur);cur=''}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);cur='';if(row.some(c=>c.trim()!==''))rows.push(row);row=[]}
  else cur+=ch}
 row.push(cur);if(row.some(c=>c.trim()!==''))rows.push(row);
 if(rows.length<2)return [];
 const head=rows[0].map(h=>h.trim().replace(/^\uFEFF/,''));
 return rows.slice(1).map(r=>{const o={};head.forEach((h,i)=>o[h]=r[i]??'');return o});
}
const num=(v,d=0)=>{const n=Number(String(v).replace(',','.'));return isFinite(n)?n:d};
function normalize(r0,k){
 const r={...r0},req=(c,m)=>{if(!r[c]||String(r[c]).trim()==='')throw m};
 const yr=(a,b)=>{a=num(a,2017);b=num(b,2026);if(a>b)throw 'années incohérentes';return [clamp(Math.round(a),1990,2035),clamp(Math.round(b),1990,2035)]};
 if(k==='brands'){req('n','nom manquant');return {id:String(r.id||uid('B')).trim(),n:String(r.n).trim(),pays:String(r.pays||'—'),grp:String(r.grp||'—')}}
 if(k==='models'){req('n','nom manquant');req('b','marque (b) manquante');return {id:String(r.id||uid('M')).trim(),b:String(r.b).trim(),n:String(r.n).trim(),y:yr(r.y0??(r.y||[])[0],r.y1??(r.y||[])[1]),seg:String(r.seg||'Compacte')}}
 if(k==='engines'){
  req('code','code manquant');req('fam','famille manquante');req('label','libellé manquant');
  const fuel=String(r.fuel||'e').toLowerCase();if(!FU[fuel])throw 'énergie invalide « '+fuel+' »';
  const hp=num(r.hp);if(!(hp>0&&hp<=2000))throw 'puissance invalide';
  const m=split(r.models||r.m);if(!m.length)throw 'aucun modèle lié';
  return {id:String(r.id||uid('E')).trim(),code:String(r.code).trim(),fam:String(r.fam).trim(),label:String(r.label).trim(),fuel,disp:num(r.disp),hp:Math.round(hp),nm:num(r.nm),kw:Math.round(hp*.7355),y:yr(r.y0??(r.y||[])[0],r.y1??(r.y||[])[1]),m,gb:String(r.gb||'BVM').trim(),norm:String(r.norm||'Euro 6'),cyl:String(r.cyl||'L4'),asp:String(r.asp||'Turbo'),inj:String(r.inj||'ID'),note:String(r.note||'')};
 }
 if(k==='faults'){
  req('t','titre manquant');const sev=String(r.sev||'modérée');if(!SV[sev])throw 'sévérité invalide « '+sev+' »';
  const c0=num(r.cost0??(r.cost||[])[0]),c1=num(r.cost1??(r.cost||[])[1],c0);if(c1<c0)throw 'coûts incohérents';
  const k0=num(r.km0??(r.km||[])[0]),k1=num(r.km1??(r.km||[])[1],k0);
  return {id:String(r.id||uid('F')).trim(),t:String(r.t).trim(),fam:split(r.fam),sev,freq:FQ[r.freq]?r.freq:'moyenne',y:yr(r.y0??(r.y||[])[0],r.y1??(r.y||[])[1]),km:[Math.max(0,k0),Math.max(k0,k1)],sym:split(r.sym),cause:String(r.cause||''),fix:String(r.fix||''),cost:[c0,c1],m:split(r.m),gb:split(r.gb),e:split(r.e),fuel:FU[r.fuel]?r.fuel:'',status:String(r.status||'Surveillance')};
 }
 if(k==='tsb'){req('t','titre manquant');req('ref','référence manquante');
  return {id:String(r.id||uid('T')).trim(),ref:String(r.ref).trim(),b:split(r.b),fam:split(r.fam),t:String(r.t).trim(),date:/^\d{4}-\d{2}$/.test(r.date)?r.date:'2026-01',cat:String(r.cat||'Moteur'),sev:SV[r.sev]?r.sev:'majeure',sum:String(r.sum||''),act:String(r.act||''),m:split(r.m),gb:split(r.gb)}}
 if(k==='maint'){
  req('name','nom manquant');
  const items=(r.items||[]).map(it=>Array.isArray(it)?[String(it[0]),num(it[1]),num(it[2])]:[String(it.op||''),num(it.km),num(it.mo)]).filter(x=>x[0]);
  if(!items.length)throw 'aucune opération';
  return {id:String(r.id||uid('P')).trim(),name:String(r.name).trim(),fam:split(r.fam),fuel:FU[r.fuel]?r.fuel:'',oil:r.oil?[String(r.oil[0]),num(r.oil[1]),String(r.oil[2]||'')]:null,dist:r.dist?[String(r.dist[0]),num(r.dist[1]),num(r.dist[2]),String(r.dist[3]||'')]:null,base:Array.isArray(r.base)?[num(r.base[0],15000),num(r.base[1],12)]:[15000,12],items,note:String(r.note||'')};
 }
 throw 'type inconnu';
}
const detectKey=r=>r.fam!==undefined&&r.hp!==undefined?'engines':r.sev!==undefined&&r.sym!==undefined?'faults':r.ref!==undefined&&r.date!==undefined?'tsb':r.items!==undefined?'maint':r.b!==undefined&&r.seg!==undefined?'models':r.pays!==undefined?'brands':null;
let IMPORT=null;
function openImport(target='auto'){
 if(!isAdm())return needAdm();
 IMPORT=null;
 openModal(`<div class="mh">${ic('ul')}<h3>Import — fichiers croisés dynamiques</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <div class="mb2"><div class="fr f2"><div><label class="lb">Fichier cible</label><select class="sel" id="impTarget">${[['auto','Détection auto / bundle'],...FILES.map(f=>[f[0],f[1]])].map(o=>`<option value="${o[0]}" ${target===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>
 <div><label class="lb">Mode</label><select class="sel" id="impMode"><option value="merge">Fusionner (upsert par id)</option><option value="replace">Remplacer le fichier</option></select></div></div>
 <div class="dz" id="dz" style="margin-top:13px" data-act="dzPick">${ic('ul')}<div><b>Déposer un fichier .json / .csv / .js</b> ou cliquer pour parcourir</div><div class="dim mono" style="font-size:10px;margin-top:4px">VALIDATION TRANSACTIONNELLE — AUCUNE ÉCRITURE AVANT ANALYSE</div></div>
 <input type="file" id="impFile" accept=".json,.csv,.txt,.js" style="display:none">
 <div style="margin-top:12px"><label class="lb">…ou coller les données (JSON / CSV / base.js)</label><textarea class="inp mono" id="impText" rows="6" placeholder='[{"code":"DV5RUCd","fam":"DV5","label":"1.5 BlueHDi 130","fuel":"d","hp":130,"nm":300,"y0":2019,"y1":2026,"models":"peu-208b"}]'></textarea></div>
 <details style="margin-top:10px"><summary class="dim" style="cursor:pointer;font-size:12px">Formats acceptés & modèles CSV</summary><div class="dim" style="font-size:11.5px;margin-top:8px;line-height:1.7">JSON : tableau d'objets, bundle <span class="mono">{"brands":[…],"engines":[…]}</span> ou fichier <span class="mono">data/base.js</span> complet (tuples). CSV : en-têtes exacts, listes séparées par <span class="mono">;</span>.
 ${Object.entries(CSVH).map(([k,h])=>`<div style="margin-top:5px"><span class="mono" style="color:var(--cyan)">${k}</span> <button class="btn xs ghost" data-act="csvTpl" data-k="${k}">Modèle CSV</button><br><span class="mono" style="font-size:9.5px">${esc(h)}</span></div>`).join('')}</div></details>
 <div id="impReport"></div></div>
 <div class="mf"><button class="btn ghost" data-act="mclose">Fermer</button><button class="btn ghost" data-act="impAnalyze">${ic('check')}Analyser</button><button class="btn pri" id="impApply" data-act="impApply" disabled>${ic('ul')}Appliquer l'import</button></div>`,'wide');
}
function analyzeImport(){
 let text=$('#impText').value.trim();const target=$('#impTarget').value,mode=$('#impMode').value,rep=$('#impReport');
 if(!text){rep.innerHTML='<div class="rep rj">Aucune donnée à analyser.</div>';beep('err');return}
 text=text.replace(/^\s*window\.MECADATA_BASE\s*=\s*/,'').replace(/;\s*$/,'');
 let data=null,isCSV=false;
 try{data=JSON.parse(text)}catch(e){isCSV=true;try{data=parseCSV(text)}catch(e2){rep.innerHTML=`<div class="rep rj">JSON invalide : ${esc(e.message)}</div>`;beep('err');return}}
 if(data&&Array.isArray(data.brands)&&Array.isArray(data.brands[0])){
  try{data=expandBase(data)}catch(e){rep.innerHTML='<div class="rep rj">Base compacte illisible.</div>';beep('err');return}
 }
 const groups={};
 try{
  if(!isCSV&&data&&!Array.isArray(data)&&typeof data==='object'&&Object.keys(data).some(k=>FILES.some(f=>f[0]===k))){
   Object.entries(data).forEach(([k,v])=>{if(FILES.some(f=>f[0]===k)&&Array.isArray(v))groups[k]=v});
   if(!Object.keys(groups).length)throw 'bundle sans fichier reconnu';
  }else{
   const arr=Array.isArray(data)?data:[data];let k=target;
   if(k==='auto'){k=detectKey(arr[0]||{});if(!k)throw isCSV?'CSV : précisez le fichier cible.':'format non reconnu — précisez la cible.'}
   groups[k]=arr;
  }
 }catch(e){rep.innerHTML=`<div class="rep rj">${esc(e)}</div>`;beep('err');return}
 const res={mode,groups:{},ok:0,rej:[],warn:[]};
 Object.entries(groups).forEach(([k,arr])=>{
  const ok=[],seen=new Set();
  arr.forEach((rec,i)=>{try{if(!rec||typeof rec!=='object')throw 'enregistrement non objet';const n=normalize(rec,k);if(seen.has(n.id))throw 'id dupliqué « '+n.id+' »';seen.add(n.id);ok.push(n)}catch(err){res.rej.push(`${k}[${i}] : ${err}`)}});
  res.groups[k]=ok;res.ok+=ok.length;
 });
 const mids=new Set([...DB.models.map(m=>m.id),...(res.groups.models||[]).map(m=>m.id)]),
 bids=new Set([...DB.brands.map(b=>b.id),...(res.groups.brands||[]).map(b=>b.id)]),
 fams=new Set([...DB.engines.map(e=>e.fam),...(res.groups.engines||[]).map(e=>e.fam)]);
 (res.groups.engines||[]).forEach(e=>e.m.forEach(i=>{if(!mids.has(i))res.warn.push(`engines « ${e.label} » : modèle « ${i} » absent`)}));
 (res.groups.models||[]).forEach(m=>{if(!bids.has(m.b))res.warn.push(`models « ${m.n} » : marque « ${m.b} » absente`)});
 (res.groups.tsb||[]).forEach(t=>(t.b||[]).forEach(b=>{if(!bids.has(b))res.warn.push(`tsb « ${t.ref} » : marque « ${b} » absente`)}));
 (res.groups.faults||[]).forEach(f=>(f.fam||[]).forEach(x=>{if(!fams.has(x)&&!f.fuel&&!(f.m||[]).length&&!(f.gb||[]).length)res.warn.push(`faults « ${f.t.slice(0,30)}… » : famille « ${x} » inconnue`)}));
 IMPORT=res;
 rep.innerHTML=`<div class="rep"><b class="ok">${res.ok} valide(s)</b> · <b class="rj">${res.rej.length} rejeté(s)</b> · <b class="wn">${res.warn.length} avertissement(s)</b> — mode ${mode==='merge'?'FUSION':'REMPLACEMENT'}
 ${Object.entries(res.groups).map(([k,v])=>`<div class="mono" style="font-size:10.5px;margin-top:5px;color:var(--cyan)">${k}.json ← ${v.length}</div>`).join('')}
 ${res.rej.length?`<ul>${res.rej.slice(0,12).map(r=>`<li class="rj">${esc(r)}</li>`).join('')}${res.rej.length>12?`<li>… +${res.rej.length-12}</li>`:''}</ul>`:''}
 ${res.warn.length?`<ul>${res.warn.slice(0,10).map(r=>`<li class="wn">${esc(r)}</li>`).join('')}${res.warn.length>10?`<li>… +${res.warn.length-10}</li>`:''}</ul>`:''}</div>`;
 $('#impApply').disabled=res.ok===0;beep(res.ok?'ok':'err');
}
function applyImport(){
 if(!IMPORT||!IMPORT.ok)return;
 snapshot('import');let ins=0,upd=0;
 Object.entries(IMPORT.groups).forEach(([k,arr])=>{
  if(IMPORT.mode==='replace'){DB[k]=arr;ins+=arr.length}
  else{const map=new Map(DB[k].map(x=>[x.id,x]));arr.forEach(n=>{map.has(n.id)?upd++:ins++;map.set(n.id,n)});DB[k]=[...map.values()]}
 });
 const n=ins+upd;IMPORT=null;closeModal();mutate('imp',`Import appliqué : ${ins} ajouts, ${upd} mises à jour`);
 toast('ok','Import appliqué',`${n} enregistrement(s) — intégrité recalculée.`,true);beep('imp');
}
function openIntegrity(){
 const g=META.integ;
 openModal(`<div class="mh">${ic('check')}<h3>Contrôle d'intégrité des fichiers croisés</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <div class="mb2"><div class="rep" style="max-height:none"><b class="${g.ok?'ok':'rj'}">${g.ok?'BASE INTÈGRE':'ERREURS DÉTECTÉES'}</b> — score ${g.pct}% · ${fmt(META.links)} liaisons structurelles · ${fmt(META.corr)} corrélations actives
 ${g.err.length?`<ul>${g.err.map(e=>`<li class="rj">${esc(e)}</li>`).join('')}</ul>`:'<p class="ok" style="margin-top:8px">Aucune référence orpheline, aucun id dupliqué.</p>'}
 ${g.warn.length?`<p class="wn" style="margin-top:9px">${g.warn.length} avertissement(s) :</p><ul>${g.warn.slice(0,20).map(w=>`<li class="wn">${esc(w)}</li>`).join('')}</ul>`:''}</div>
 <p class="dim" style="font-size:11.5px;margin-top:12px">Les avertissements signalent des familles sans motorisation en base : importez les motorisations correspondantes pour activer leurs corrélations.</p></div>
 <div class="mf"><button class="btn ghost" data-act="expAll">${ic('dl')}Exporter la base</button><button class="btn pri" data-act="mclose">Fermer</button></div>`);
}
function openFileView(k){
 const arr=DB[k],keys=arr[0]?Object.keys(arr[0]):[];
 openModal(`<div class="mh">${ic('file')}<h3>${k}.json — aperçu (${fmt(arr.length)})</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <div class="mb2"><div class="tw"><table class="t"><thead><tr>${keys.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${arr.slice(0,100).map(x=>`<tr>${keys.map(key=>{let v=x[key];if(Array.isArray(v))v=v.join('; ');if(v&&typeof v==='object')v=JSON.stringify(v);return `<td class="mono" style="font-size:10.5px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(v)}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>${arr.length>100?`<p class="dim mono" style="font-size:10px;margin-top:8px">100 premières lignes — exportez pour la totalité.</p>`:''}</div>
 <div class="mf"><button class="btn ghost" data-act="fileExp" data-k="${k}">${ic('dl')}JSON</button><button class="btn pri" data-act="mclose">Fermer</button></div>`,'wide');
}
function exportBaseJs(){
 const compact={meta:{name:'MECADATA BASE',version:'5.1',build:new Date().toISOString().slice(0,7),range:[2017,2026]},
  brands:DB.brands.map(b=>[b.id,b.n,b.pays,b.grp]),
  models:DB.models.map(m=>[m.id,m.b,m.n,m.y[0],m.y[1],m.seg]),
  engines:DB.engines.map(e=>[e.m[0],e.code,e.fam,e.label,e.fuel,e.disp,e.hp,e.nm,e.y[0],e.y[1],e.gb,e.norm]),
  faults:DB.faults.map(f=>[f.t,(f.fam||[]).join(';'),f.sev,f.freq,f.y[0],f.y[1],f.km[0],f.km[1],(f.sym||[]).join('|'),f.cause,f.fix,f.cost[0],f.cost[1],f.status,f.fuel||'']),
  tsb:DB.tsb.map(t=>[t.ref,(t.b||[]).join(';'),(t.fam||[]).join(';'),t.t,t.date,t.cat,t.sev,t.sum,t.act]),
  maint:DB.maint.map(p=>[p.id,p.name,(p.fam||[]).join(';'),p.oil,p.dist,p.items,p.note,p.fuel||''])};
 download('base.js','/* MECADATA — base exportée (état courant) */\nwindow.MECADATA_BASE = '+JSON.stringify(compact,null,1)+';\n','text/javascript');
 toast('ok','data/base.js exporté','Remplacez le fichier du même nom pour figer cet état comme base usine.');beep('ok');audit('exp','Export data/base.js');
}
/* ── 10. FORMULAIRES ── */
const famList=()=>`<datalist id="famL">${[...new Set(DB.engines.map(e=>e.fam))].map(f=>`<option value="${esc(f)}">`).join('')}</datalist>`;
function openEngForm(id){
 if(!isAdm())return needAdm();
 const e=id?DB.engines.find(x=>x.id===id):null;
 const checks=DB.models.map(m=>{const b=brandById(m.b);return `<label class="mchk" style="display:flex;gap:7px;align-items:center;padding:4px 6px;font-size:12px"><input type="checkbox" name="m" value="${m.id}" ${e&&e.m.includes(m.id)?'checked':''}><span>${esc(b?b.n:'')} <b>${esc(m.n)}</b> <span class="dim mono" style="font-size:9.5px">${m.y[0]}→${m.y[1]}</span></span></label>`}).join('');
 openModal(`<div class="mh">${ic('piston')}<h3>${e?'Modifier':'Nouvelle'} motorisation</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <form data-form="eng" data-id="${e?e.id:''}"><div class="mb2"><div class="fr f2">
 <div><label class="lb">Libellé *</label><input class="inp" name="label" required value="${esc(e?.label||'')}" placeholder="1.5 BlueHDi 130"></div>
 <div><label class="lb">Code moteur *</label><input class="inp mono" name="code" required value="${esc(e?.code||'')}" placeholder="DV5RUCd"></div>
 <div><label class="lb">Famille (clé de corrélation) *</label><input class="inp mono" name="fam" list="famL" required value="${esc(e?.fam||'')}" placeholder="DV5"></div>
 <div><label class="lb">Énergie</label><select class="sel" name="fuel">${Object.entries(FU).map(([k,v])=>`<option value="${k}" ${e?.fuel===k?'selected':''}>${v.l}</option>`).join('')}</select></div>
 <div><label class="lb">Cylindrée cm³</label><input class="inp mono" type="number" name="disp" min="0" max="8000" value="${e?.disp??0}"></div>
 <div><label class="lb">Puissance ch *</label><input class="inp mono" type="number" name="hp" min="1" max="2000" required value="${e?.hp??100}"></div>
 <div><label class="lb">Couple Nm</label><input class="inp mono" type="number" name="nm" min="0" max="2000" value="${e?.nm??200}"></div>
 <div><label class="lb">Boîte</label><input class="inp mono" name="gb" list="gbL" value="${esc(e?.gb||'BVM6')}"><datalist id="gbL">${Object.keys(GBL).map(g=>`<option value="${g}">`).join('')}</datalist></div>
 <div><label class="lb">Année début</label><input class="inp mono" type="number" name="y0" min="1990" max="2035" value="${e?.y[0]??2017}"></div>
 <div><label class="lb">Année fin</label><input class="inp mono" type="number" name="y1" min="1990" max="2035" value="${e?.y[1]??2026}"></div>
 <div><label class="lb">Norme</label><input class="inp" name="norm" value="${esc(e?.norm||'Euro 6d')}"></div>
 <div><label class="lb">Architecture</label><input class="inp" name="cyl" value="${esc(e?.cyl||'L4')}"></div>
 <div><label class="lb">Suralimentation</label><input class="inp" name="asp" value="${esc(e?.asp||'Turbo')}"></div>
 <div><label class="lb">Injection</label><input class="inp" name="inj" value="${esc(e?.inj||'ID')}"></div></div>
 <div style="margin-top:12px"><label class="lb">Note ingénieur</label><input class="inp" name="note" value="${esc(e?.note||'')}"></div>
 <div style="margin-top:12px"><label class="lb">Modèles liés * (croisement models.json)</label><input class="inp" id="mFilter" placeholder="Filtrer les modèles…" style="margin-bottom:6px"><div style="max-height:180px;overflow:auto;border:1px solid var(--line);border-radius:9px;padding:5px">${checks}</div></div>
 ${famList()}</div><div class="mf"><button type="button" class="btn ghost" data-act="mclose">Annuler</button><button class="btn pri" type="submit">${ic('save')}Enregistrer</button></div></form>`,'wide');
}
function openFaultForm(id){
 if(!isAdm())return needAdm();
 const f=id?DB.faults.find(x=>x.id===id):null;
 openModal(`<div class="mh">${ic('alert')}<h3>${f?'Modifier':'Nouvelle'} panne connue</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <form data-form="fault" data-id="${f?f.id:''}"><div class="mb2"><div class="fr">
 <div><label class="lb">Titre *</label><input class="inp" name="t" required value="${esc(f?.t||'')}"></div>
 <div class="fr f3"><div><label class="lb">Sévérité</label><select class="sel" name="sev">${Object.keys(SV).map(s=>`<option ${f?.sev===s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div><label class="lb">Fréquence</label><select class="sel" name="freq">${Object.keys(FQ).map(s=>`<option ${f?.freq===s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div><label class="lb">Statut</label><input class="inp" name="status" value="${esc(f?.status||'Surveillance')}"></div></div>
 <div><label class="lb">Familles moteur (virgules)</label><input class="inp mono" name="fam" list="famL" value="${esc((f?.fam||[]).join(', '))}" placeholder="EB2, DV5"></div>
 <div class="fr f4"><div><label class="lb">Année début</label><input class="inp mono" type="number" name="y0" value="${f?.y[0]??2017}"></div><div><label class="lb">Année fin</label><input class="inp mono" type="number" name="y1" value="${f?.y[1]??2026}"></div><div><label class="lb">Km début</label><input class="inp mono" type="number" name="k0" value="${f?.km[0]??30000}"></div><div><label class="lb">Km fin</label><input class="inp mono" type="number" name="k1" value="${f?.km[1]??150000}"></div></div>
 <div><label class="lb">Symptômes (un par ligne)</label><textarea class="inp" name="sym" rows="3">${esc((f?.sym||[]).join('\n'))}</textarea></div>
 <div><label class="lb">Cause technique</label><textarea class="inp" name="cause" rows="2">${esc(f?.cause||'')}</textarea></div>
 <div><label class="lb">Action / réparation</label><textarea class="inp" name="fix" rows="2">${esc(f?.fix||'')}</textarea></div>
 <div class="fr f3"><div><label class="lb">Coût min €</label><input class="inp mono" type="number" name="c0" value="${f?.cost[0]??0}"></div><div><label class="lb">Coût max €</label><input class="inp mono" type="number" name="c1" value="${f?.cost[1]??0}"></div><div><label class="lb">Cible énergie</label><select class="sel" name="fuel"><option value="">—</option>${Object.entries(FU).map(([k,v])=>`<option value="${k}" ${f?.fuel===k?'selected':''}>${v.l}</option>`).join('')}</select></div></div>
 ${famList()}</div></div><div class="mf"><button type="button" class="btn ghost" data-act="mclose">Annuler</button><button class="btn pri" type="submit">${ic('save')}Enregistrer</button></div></form>`,'wide');
}
function openTsbForm(id){
 if(!isAdm())return needAdm();
 const t=id?DB.tsb.find(x=>x.id===id):null;
 openModal(`<div class="mh">${ic('file')}<h3>${t?'Modifier':'Nouveau'} bulletin / TSB</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <form data-form="tsb" data-id="${t?t.id:''}"><div class="mb2"><div class="fr">
 <div class="fr f2"><div><label class="lb">Référence *</label><input class="inp mono" name="ref" required value="${esc(t?.ref||'')}" placeholder="STL-2026-XXX-001"></div><div><label class="lb">Date (AAAA-MM)</label><input class="inp mono" type="month" name="date" value="${esc(t?.date||'2026-01')}"></div></div>
 <div><label class="lb">Titre *</label><input class="inp" name="t" required value="${esc(t?.t||'')}"></div>
 <div class="fr f2"><div><label class="lb">Catégorie</label><select class="sel" name="cat">${['Distribution','Moteur','Antipollution','Transmission','Rappel','Charge','Hybridation','Logiciel','Entretien','Thermique'].map(c=>`<option ${t?.cat===c?'selected':''}>${c}</option>`).join('')}</select></div><div><label class="lb">Gravité</label><select class="sel" name="sev">${Object.keys(SV).map(s=>`<option ${t?.sev===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
 <div><label class="lb">Familles moteur (virgules)</label><input class="inp mono" name="fam" list="famL" value="${esc((t?.fam||[]).join(', '))}"></div>
 <div><label class="lb">Marques concernées</label><div style="max-height:130px;overflow:auto;border:1px solid var(--line);border-radius:9px;padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:2px">${DB.brands.map(b=>`<label style="display:flex;gap:6px;align-items:center;font-size:12px;padding:3px 5px"><input type="checkbox" name="b" value="${b.id}" ${t&&(t.b||[]).includes(b.id)?'checked':''}>${esc(b.n)}</label>`).join('')}</div></div>
 <div><label class="lb">Synthèse</label><textarea class="inp" name="sum" rows="2">${esc(t?.sum||'')}</textarea></div>
 <div><label class="lb">Action prescrite</label><textarea class="inp" name="act" rows="3">${esc(t?.act||'')}</textarea></div>
 ${famList()}</div></div><div class="mf"><button type="button" class="btn ghost" data-act="mclose">Annuler</button><button class="btn pri" type="submit">${ic('save')}Enregistrer</button></div></form>`,'wide');
}
function planRow(it,i){
 return `<div class="gcard" draggable="true" data-drag="planrow" data-i="${i}" style="margin-bottom:6px;padding:7px 9px"><span class="dh">${ic('drag','width:14px;height:14px')}</span><input class="inp" name="op" value="${esc(it[0])}" placeholder="Opération" style="flex:2;padding:6px 9px"><input class="inp mono" name="okm" type="number" min="0" value="${it[1]}" placeholder="km" style="width:92px;padding:6px 9px"><input class="inp mono" name="omo" type="number" min="0" value="${it[2]}" placeholder="mois" style="width:74px;padding:6px 9px"><button type="button" class="btn xs ghost" data-act="planRowUp" data-i="${i}">${ic('up','width:11px;height:11px')}</button><button type="button" class="btn xs dgr" data-act="planRowDel" data-i="${i}">${ic('x','width:11px;height:11px')}</button></div>`;
}
const readPlanRows=()=>$$('#planRows .gcard').map(r=>[r.querySelector('[name=op]').value.trim(),+r.querySelector('[name=okm]').value||0,+r.querySelector('[name=omo]').value||0]).filter(x=>x[0]);
function openPlanEditor(id){
 if(!isAdm())return needAdm();
 const p=DB.maint.find(x=>x.id===id);if(!p)return;
 openModal(`<div class="mh">${ic('wrench')}<h3>Plan : ${esc(p.name)}</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <form data-form="plan" data-id="${p.id}"><div class="mb2">
 <div class="fr f2"><div><label class="lb">Nom du plan</label><input class="inp" name="name" value="${esc(p.name)}"></div><div><label class="lb">Familles (virgules)</label><input class="inp mono" name="fam" value="${esc((p.fam||[]).join(', '))}"></div></div>
 <div class="fr f3" style="margin-top:12px"><div><label class="lb">Huile — spécification</label><input class="inp" name="ospec" value="${esc(p.oil?p.oil[0]:'')}"></div><div><label class="lb">Capacité L</label><input class="inp mono" type="number" step="0.1" name="ocap" value="${p.oil?p.oil[1]:0}"></div><div><label class="lb">Note huile</label><input class="inp" name="onote" value="${esc(p.oil?p.oil[2]:'')}"></div></div>
 <div class="fr f4" style="margin-top:12px"><div><label class="lb">Distribution — type</label><input class="inp" name="dtype" value="${esc(p.dist?p.dist[0]:'')}"></div><div><label class="lb">Km</label><input class="inp mono" type="number" name="dkm" value="${p.dist?p.dist[1]:0}"></div><div><label class="lb">Mois</label><input class="inp mono" type="number" name="dmo" value="${p.dist?p.dist[2]:0}"></div><div><label class="lb">Note</label><input class="inp" name="dnote" value="${esc(p.dist?p.dist[3]:'')}"></div></div>
 <div style="margin-top:14px"><label class="lb">Opérations (glisser pour réordonner — km 0 = temporel seul)</label><div id="planRows">${p.items.map(planRow).join('')}</div>
 <button type="button" class="btn xs ghost" data-act="planAddRow" style="margin-top:8px">${ic('plus','width:12px;height:12px')}Ajouter une opération</button></div>
 <div style="margin-top:12px"><label class="lb">Note du plan</label><input class="inp" name="note" value="${esc(p.note||'')}"></div>
 </div><div class="mf"><button type="button" class="btn ghost" data-act="mclose">Annuler</button><button class="btn pri" type="submit">${ic('save')}Enregistrer le plan</button></div></form>`,'wide');
}
/* ── 11. OMNIBOX ── */
let omniIdx=-1;
function omniSearch(q){
 q=q.trim().toLowerCase();const box=$('#omnires');omniIdx=-1;
 if(q.length<2){box.classList.remove('on');box.innerHTML='';return}
 const hits=[],push=(grp,label,sub,act,id)=>hits.push({grp,label,sub,act,id});
 DB.brands.filter(b=>b.n.toLowerCase().includes(q)).slice(0,3).forEach(b=>push('MARQUES',b.n,b.pays,'hitBrand',b.id));
 DB.models.filter(m=>m.n.toLowerCase().includes(q)).slice(0,4).forEach(m=>push('MODÈLES',(brandById(m.b)?.n||'')+' '+m.n,m.y[0]+'→'+m.y[1],'hitModel',m.id));
 DB.engines.filter(e=>(e.code+' '+e.fam+' '+e.label).toLowerCase().includes(q)).slice(0,5).forEach(e=>push('MOTORISATIONS',engName(e),e.code+' · '+e.hp+' ch','openEng',e.id));
 DB.faults.filter(f=>f.t.toLowerCase().includes(q)).slice(0,4).forEach(f=>push('PANNES',f.t,f.sev,'openFault',f.id));
 DB.tsb.filter(t=>(t.t+' '+t.ref).toLowerCase().includes(q)).slice(0,3).forEach(t=>push('TSB',t.t,t.ref,'openTsb',t.id));
 if(!hits.length){box.innerHTML='<div class="grp">AUCUN RÉSULTAT</div>';box.classList.add('on');return}
 let html='',last='';
 hits.forEach((h,i)=>{if(h.grp!==last){html+=`<div class="grp">${h.grp}</div>`;last=h.grp}
  html+=`<button class="hit" data-act="${h.act}" data-id="${esc(h.id)}" data-oi="${i}">${ic(h.grp==='PANNES'?'alert':h.grp==='TSB'?'file':h.grp==='MOTORISATIONS'?'piston':'car','width:14px;height:14px;color:var(--cyan)')}<span>${esc(h.label)}</span><small>${esc(h.sub)}</small></button>`});
 box.innerHTML=html;box.classList.add('on');
}
const omniClose=()=>{$('#omnires').classList.remove('on');omniIdx=-1};
/* ── 12. ÉVÉNEMENTS ── */
let lockTries=0,lockUntil=0,lockTimer=0,dragData=null;
document.addEventListener('click',ev=>{
 const el=ev.target.closest('[data-act]');
 if(!el){if(!ev.target.closest('.omni'))omniClose();return}
 const act=el.dataset.act,id=el.dataset.id,stop=()=>{ev.preventDefault();ev.stopPropagation()};
 if(act.startsWith('doDel')){
  const[,kind,did]=act.split(':');closeModal();snapshot('suppression');
  const k={Eng:'engines',Fault:'faults',Tsb:'tsb'}[kind];
  DB[k]=DB[k].filter(x=>x.id!==did);if(S.drawer&&S.drawer.id===did)closeDrawer();
  mutate('del',`Suppression ${k} : ${did}`);toast('warn','Enregistrement supprimé','Annulation possible.',true);beep('del');return;
 }
 switch(act){
 case 'msearch':{stop();const q=prompt('Recherche globale (marque, modèle, code, panne, TSB) :');if(q){S.f.q=q;S.shown=36;location.hash='#/explorer';render()}break}
 case 'snd':PREF.sound=!PREF.sound;save();updateMeta();if(PREF.sound)beep('ok');toast('info',PREF.sound?'Son activé':'Son coupé','Effets sonores de la console.');break;
 case 'run':WP.set('run',!WP.P.run);beep('tick');break;
 case 'goStudio':location.hash='#/studio';break;
 case 'goAdm':location.hash='#/donnees';break;
 case 'integrity':openIntegrity();break;
 case 'undo':doUndo();break;
 case 'mclose':closeModal();break;
 case 'mscrim':if(ev.target===el)closeModal();break;
 case 'drclose':closeDrawer();break;
 case 'drback':drawerBack();break;
 case 'drtab':S.drawer.tab=el.dataset.t;renderDrawer();beep('tick');break;
 case 'openEng':stop();omniClose();openDrawer('engine',id,!!S.drawer);break;
 case 'openFault':stop();omniClose();openDrawer('fault',id,!!S.drawer);break;
 case 'openTsb':stop();omniClose();openDrawer('tsb',id,!!S.drawer);break;
 case 'hitBrand':omniClose();S.f.brand=id;S.f.q='';S.shown=36;location.hash='#/explorer';render();beep('tick');break;
 case 'hitModel':{omniClose();const m=modelById(id);if(m){S.f.brand=m.b;S.f.q=m.n;S.shown=36;location.hash='#/explorer';render()}beep('tick');break}
 case 'pin':{stop();const i=GARAGE.indexOf(id);
  if(i>=0){GARAGE.splice(i,1);toast('info','Retiré du garage')}
  else{GARAGE.push(id);toast('ok','Épinglé au garage',engName(DB.engines.find(e=>e.id===id)||{}));beep('ok')}
  save();if(S.view==='bord')render();else refreshResults();if(S.drawer)renderDrawer();break}
 case 'garUp':case 'garDn':{const i=+el.dataset.i,j=act==='garUp'?i-1:i+1;if(j<0||j>=GARAGE.length)break;[GARAGE[i],GARAGE[j]]=[GARAGE[j],GARAGE[i]];save();render();beep('tick');break}
 case 'goPlan':{stop();const e=DB.engines.find(x=>x.id===id);if(e){S.planCtx=id;S.plan=planFor(e)?.id;closeDrawer();location.hash='#/entretien';render()}break}
 case 'clearCtx':S.planCtx=null;render();break;
 case 'selPlan':S.plan=id;render();beep('tick');break;
 case 'expEng':{const e=DB.engines.find(x=>x.id===id);if(e){download(`fiche_${e.code.replace(/\W+/g,'_')}.json`,JSON.stringify({engine:e,models:engModels(e),brand:engBrand(e),ivi:ivi(e),faults:faultsFor(e),tsb:tsbFor(e),plan:planFor(e)},null,2));toast('ok','Fiche exportée','État courant complet, corrélations incluses.');beep('ok')}break}
 case 'expPlan':{const p=DB.maint.find(x=>x.id===id);if(p){download(`plan_${p.id}.json`,JSON.stringify(p,null,2));beep('ok')}break}
 case 'expAll':download('mecadata_base_complete.json',JSON.stringify(DB,null,2));toast('ok','Base exportée','Bundle JSON des 6 fichiers croisés.');beep('ok');audit('exp','Export base complète');break;
 case 'expBaseJs':exportBaseJs();break;
 case 'fileExp':download(el.dataset.k+'.json',JSON.stringify(DB[el.dataset.k],null,2));beep('ok');break;
 case 'fileCsv':download(el.dataset.k+'.csv',toCSV(el.dataset.k),'text/csv');beep('ok');break;
 case 'csvTpl':download('modele_'+el.dataset.k+'.csv',CSVH[el.dataset.k],'text/csv');break;
 case 'fileView':openFileView(el.dataset.k);break;
 case 'fileImp':openImport(el.dataset.k);break;
 case 'goImport':isAdm()?openImport():needAdm();break;
 case 'dzPick':$('#impFile').click();break;
 case 'impAnalyze':analyzeImport();break;
 case 'impApply':applyImport();break;
 case 'askReset':confirmModal('Réinitialiser la base usine ?','Toutes les modifications et imports seront remplacés par la base usine 2017+. Annulation possible pendant 8 secondes.','doReset','Réinitialiser');break;
 case 'doReset':closeModal();snapshot('réinitialisation');DB=clone(SEED);GARAGE=[];mutate('del','Réinitialisation base usine');toast('warn','Base usine restaurée','Imports et modifications effacés.',true);beep('warn');break;
 case 'logout':sessionStorage.removeItem('mecadata_adm');audit('adm','Session ING-3 verrouillée');updateMeta();render();toast('info','Session verrouillée','Retour en mode invité.');break;
 case 'fbrand':S.f.brand=S.f.brand===el.dataset.b?'':el.dataset.b;S.shown=36;render();beep('tick');break;
 case 'ffuel':{const k=el.dataset.k,i=S.f.fuels.indexOf(k);i>=0?S.f.fuels.splice(i,1):S.f.fuels.push(k);S.shown=36;el.classList.toggle('on');refreshResults();beep('tick');break}
 case 'resetFilters':S.f={q:'',brand:'',fuels:[],seg:'',y:[2017,2026],p:[0,1050],sort:'brand'};S.shown=36;render();beep('tick');break;
 case 'more':S.shown+=36;refreshResults();beep('tick');break;
 case 'saveView':{const n=prompt('Nom de la vue enregistrée :','Vue ingénieur '+(VIEWS.length+1));if(n){VIEWS.push({name:n.slice(0,28),f:clone(S.f)});save();render();toast('ok','Vue enregistrée','Filtres + tri mémorisés.');beep('ok')}break}
 case 'applyView':{const v=VIEWS[+el.dataset.i];if(v){S.f=clone(v.f);S.shown=36;render();beep('tick')}break}
 case 'delView':stop();VIEWS.splice(+el.dataset.i,1);save();render();beep('del');break;
 case 'techTab':S.tech.tab=el.dataset.t;render();beep('tick');break;
 case 'techSev':S.tech.sev=S.tech.sev===el.dataset.s?'':el.dataset.s;render();beep('tick');break;
 case 'admTab':S.adm.tab=el.dataset.t;S.adm.page=0;S.adm.sel.clear();render();beep('tick');break;
 case 'pgPrev':S.adm.page--;refreshAdm();beep('tick');break;
 case 'pgNext':S.adm.page++;refreshAdm();beep('tick');break;
 case 'selOne':{const s=S.adm.sel;el.checked?s.add(id):s.delete(id);refreshAdm();break}
 case 'selAll':{const s=S.adm.sel,arr=DB[S.adm.tab]||[],q=S.adm.q.toLowerCase();
  const list=arr.filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q)).slice(S.adm.page*PAGE,(S.adm.page+1)*PAGE);
  list.forEach(x=>el.checked?s.add(x.id):s.delete(x.id));refreshAdm();break}
 case 'bulkClear':S.adm.sel.clear();refreshAdm();break;
 case 'bulkExp':download('selection_'+S.adm.tab+'.json',JSON.stringify((DB[S.adm.tab]||[]).filter(x=>S.adm.sel.has(x.id)),null,2));beep('ok');break;
 case 'bulkDel':confirmModal('Supprimer la sélection ?',`${S.adm.sel.size} enregistrement(s) seront supprimés de ${S.adm.tab}.json. Annulation possible 8 s.`,'doBulkDel','Supprimer');break;
 case 'doBulkDel':{closeModal();snapshot('suppression groupée');const k=S.adm.tab,n=S.adm.sel.size;DB[k]=DB[k].filter(x=>!S.adm.sel.has(x.id));S.adm.sel.clear();mutate('del',`Suppression groupée : ${n} × ${k}`);toast('warn',n+' supprimé(s)','Corrélations recalculées.',true);beep('del');break}
 case 'newEng':openEngForm();break;
 case 'editEng':stop();openEngForm(id);break;
 case 'delEng':{const e=DB.engines.find(x=>x.id===id);confirmModal('Supprimer la motorisation ?',(e?engName(e):id)+' — les pannes/TSB liés par famille restent en base.','doDel:Eng:'+id,'Supprimer');break}
 case 'newFault':openFaultForm();break;
 case 'editFault':stop();openFaultForm(id);break;
 case 'delFault':confirmModal('Supprimer la panne ?','La fiche et ses corrélations seront retirées. Annulation possible 8 s.','doDel:Fault:'+id,'Supprimer');break;
 case 'newTsb':openTsbForm();break;
 case 'editTsb':stop();openTsbForm(id);break;
 case 'delTsb':confirmModal('Supprimer le bulletin ?','Le TSB sera retiré de la base. Annulation possible 8 s.','doDel:Tsb:'+id,'Supprimer');break;
 case 'editPlan':openPlanEditor(id);break;
 case 'planAddRow':{const b=$('#planRows');b.insertAdjacentHTML('beforeend',planRow(['',15000,12],b.children.length));break}
 case 'planRowDel':{const r=readPlanRows();r.splice(+el.dataset.i,1);$('#planRows').innerHTML=r.map(planRow).join('');break}
 case 'planRowUp':{const i=+el.dataset.i;if(!i)break;const r=readPlanRows();[r[i-1],r[i]]=[r[i],r[i-1]];$('#planRows').innerHTML=r.map(planRow).join('');break}
 case 'stMode':WP.set('mode',el.dataset.m);beep('tick');break;
 case 'stTheme':WP.set('theme',el.dataset.t);beep('tick');break;
 case 'stPreset':{const p=WP.PRESETS[el.dataset.n];if(p){Object.assign(WP.P,p);WP.apply();WP.resize();render();toast('ok','Preset appliqué',el.dataset.n);beep('ok')}break}
 case 'stReset':Object.assign(WP.P,{mode:'blueprint',theme:'diag',density:62,count:130,speed:100,turb:34,scale:64,glow:56,blur:0,stroke:1.4,drift:38,quality:'std',format:'free',grid:true,grain:true,scan:true,vig:true,run:true,bg:true});WP.apply();WP.resize();render();toast('info','Réglages réinitialisés');beep('tick');break;
 case 'stRandom':{const modes=WP.MODES.map(m=>m[0]),ths=Object.keys(WP.TH);
  Object.assign(WP.P,{mode:modes[Math.floor(Math.random()*modes.length)],theme:ths[Math.floor(Math.random()*ths.length)],
   density:30+Math.round(Math.random()*65),count:50+Math.round(Math.random()*260),speed:40+Math.round(Math.random()*140),
   turb:Math.round(Math.random()*90),scale:28+Math.round(Math.random()*110),glow:20+Math.round(Math.random()*75),
   stroke:+(0.7+Math.random()*2.4).toFixed(1),drift:Math.round(Math.random()*90)});
  WP.apply();WP.resize();render();toast('ok','Scène aléatoire',`${WP.P.mode} · ${WP.TH[WP.P.theme].n}`);beep('imp');break}
 case 'stPng':WP.exportPNG();break;
 case 'stJson':download(`mecadata_preset_${WP.P.mode}.json`,JSON.stringify(WP.P,null,2));toast('ok','Preset exporté','Réimportable via le module Fichiers croisés.');beep('ok');break;
 case 'stRun':WP.set('run',!WP.P.run);render();beep('tick');break;
 }
});
const debRes=deb(()=>refreshResults(),120),debTech=deb(()=>refreshTech(),120),debAdm=deb(()=>refreshAdm(),140);
document.addEventListener('input',ev=>{
 const t=ev.target;
 if(t.id==='omni')return omniSearch(t.value);
 if(t.id==='planSearch'){$('#planItems').innerHTML=planItems(t.value);return}
 if(t.id==='mFilter'){const q=t.value.toLowerCase();$$('.mchk').forEach(l=>l.style.display=l.textContent.toLowerCase().includes(q)?'':'none');return}
 if(t.dataset.p){const k=t.dataset.p;WP.set(k,t.type==='checkbox'?t.checked:(t.tagName==='SELECT'?t.value:+t.value));if(k==='format')applyFormat();return}
 if(t.dataset.f){const k=t.dataset.f,f=S.f;
  if(k==='q')f.q=t.value;
  else if(k==='y0'){f.y[0]=Math.min(+t.value,f.y[1]);t.value=f.y[0]}
  else if(k==='y1'){f.y[1]=Math.max(+t.value,f.y[0]);t.value=f.y[1]}
  else if(k==='p0'){f.p[0]=Math.min(+t.value,f.p[1]);t.value=f.p[0]}
  else if(k==='p1'){f.p[1]=Math.max(+t.value,f.p[0]);t.value=f.p[1]}
  else if(k==='seg')f.seg=t.value;
  else if(k==='brand'){f.brand=t.value;$$('.btile').forEach(b=>b.classList.toggle('on',b.dataset.b===f.brand))}
  else if(k==='sort')f.sort=t.value;
  S.shown=36;debRes();return}
 if(t.dataset.tf){S.tech[t.dataset.tf]=t.value;debTech();return}
 if(t.dataset.af){S.adm.q=t.value;S.adm.page=0;debAdm();return}
 if(t.dataset.calc){S.calc[t.dataset.calc]=+t.value||0;refreshCalc();return}
});
document.addEventListener('change',ev=>{
 const t=ev.target;
 if(t.dataset.calc==='sev'){S.calc.sev=+t.value;refreshCalc()}
 if(t.dataset.p&&t.tagName==='SELECT'){WP.set(t.dataset.p,t.value);if(t.dataset.p==='format')applyFormat()}
 if(t.id==='impFile'&&t.files[0]){const f=t.files[0];
  f.text().then(txt=>{$('#impText').value=txt;
   const base=f.name.replace(/\.(json|csv|txt|js)$/i,'').replace('maintenance','maint').replace('base','auto');
   if(FILES.some(x=>x[0]===base))$('#impTarget').value=base;
   toast('info','Fichier chargé',f.name+' — lancez l’analyse.');beep('tick')}).catch(()=>toast('err','Lecture impossible'))}
});
document.addEventListener('submit',ev=>{
 const form=ev.target.closest('[data-form]');if(!form)return;ev.preventDefault();
 const kind=form.dataset.form,fd=new FormData(form);
 if(kind==='unlock'){
  const now=Date.now();
  if(now<lockUntil){toast('err','Verrouillage temporaire','Réessayez dans '+Math.ceil((lockUntil-now)/1000)+' s.');beep('err');return}
  if(fd.get('pwd')===PWD){sessionStorage.setItem('mecadata_adm','1');lockTries=0;audit('adm','Session ING-3 déverrouillée');updateMeta();render();toast('ok','Mode ingénieur niveau 3 activé','Écriture, import et administration déverrouillés.');beep('imp')}
  else{lockTries++;beep('err');const c=$('#lockCard');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');
   if(lockTries>=5){lockUntil=Date.now()+30000;lockTries=0;$('#unlockBtn').disabled=true;let s=30;clearInterval(lockTimer);
    lockTimer=setInterval(()=>{s--;const m=$('#lockMsg');if(m)m.textContent='TROP DE TENTATIVES — RÉESSAI DANS '+s+' S';
     if(s<=0){clearInterval(lockTimer);const b=$('#unlockBtn');if(b)b.disabled=false;const m2=$('#lockMsg');if(m2)m2.textContent="SESSION CONSERVÉE JUSQU'À FERMETURE DE L'ONGLET"}},1000);
    toast('err','5 tentatives échouées','Verrouillage de 30 secondes.')}
   else toast('err','Mot de passe incorrect','Tentative '+lockTries+'/5.')}
  return;
 }
 if(kind==='eng'){
  const ms=fd.getAll('m');if(!ms.length){toast('err','Modèle requis','Cochez au moins un modèle lié.');beep('err');return}
  const y0=+fd.get('y0'),y1=+fd.get('y1');if(y0>y1){toast('err','Années incohérentes');beep('err');return}
  const hp=+fd.get('hp');
  const rec={id:form.dataset.id||uid('E'),m:ms,code:fd.get('code').trim(),fam:fd.get('fam').trim(),label:fd.get('label').trim(),fuel:fd.get('fuel'),disp:+fd.get('disp')||0,hp,nm:+fd.get('nm')||0,kw:Math.round(hp*.7355),y:[y0,y1],gb:fd.get('gb').trim()||'BVM',norm:fd.get('norm'),cyl:fd.get('cyl'),asp:fd.get('asp'),inj:fd.get('inj'),note:fd.get('note')};
  const i=DB.engines.findIndex(x=>x.id===rec.id);i>=0?DB.engines[i]=rec:DB.engines.push(rec);
  closeModal();mutate('edit',`Motorisation ${i>=0?'modifiée':'créée'} : ${rec.label}`);toast('ok','Motorisation enregistrée','Corrélations recalculées.');beep('ok');return;
 }
 if(kind==='fault'){
  const c0=+fd.get('c0'),c1=+fd.get('c1');
  const rec={id:form.dataset.id||uid('F'),t:fd.get('t').trim(),fam:split(fd.get('fam')),sev:fd.get('sev'),freq:fd.get('freq'),y:[+fd.get('y0'),+fd.get('y1')],km:[+fd.get('k0'),+fd.get('k1')],sym:fd.get('sym').split('\n').map(s=>s.trim()).filter(Boolean),cause:fd.get('cause'),fix:fd.get('fix'),cost:[c0,Math.max(c0,c1)],m:[],gb:[],e:[],fuel:fd.get('fuel')||'',status:fd.get('status')};
  const i=DB.faults.findIndex(x=>x.id===rec.id);
  if(i>=0){rec.m=DB.faults[i].m||[];rec.gb=DB.faults[i].gb||[];rec.e=DB.faults[i].e||[];DB.faults[i]=rec}else DB.faults.push(rec);
  closeModal();mutate('edit',`Panne ${i>=0?'modifiée':'créée'} : ${rec.t.slice(0,40)}`);toast('ok','Panne enregistrée',enginesForFault(rec).length+' motorisation(s) corrélée(s).');beep('ok');return;
 }
 if(kind==='tsb'){
  const rec={id:form.dataset.id||uid('T'),ref:fd.get('ref').trim(),b:fd.getAll('b'),fam:split(fd.get('fam')),t:fd.get('t').trim(),date:fd.get('date')||'2026-01',cat:fd.get('cat'),sev:fd.get('sev'),sum:fd.get('sum'),act:fd.get('act'),m:[],gb:[]};
  const i=DB.tsb.findIndex(x=>x.id===rec.id);
  if(i>=0){rec.m=DB.tsb[i].m||[];rec.gb=DB.tsb[i].gb||[];DB.tsb[i]=rec}else DB.tsb.push(rec);
  closeModal();mutate('edit',`TSB ${i>=0?'modifié':'créé'} : ${rec.ref}`);toast('ok','Bulletin enregistré');beep('ok');return;
 }
 if(kind==='plan'){
  const p=DB.maint.find(x=>x.id===form.dataset.id);if(!p)return;
  const items=readPlanRows();if(!items.length){toast('err','Opérations requises','Au moins une opération.');beep('err');return}
  p.name=fd.get('name');p.fam=split(fd.get('fam'));
  p.oil=fd.get('ospec')?[fd.get('ospec'),+fd.get('ocap')||0,fd.get('onote')]:null;
  p.dist=fd.get('dtype')?[fd.get('dtype'),+fd.get('dkm')||0,+fd.get('dmo')||0,fd.get('dnote')]:null;
  p.items=items;p.note=fd.get('note');
  closeModal();mutate('edit',`Plan modifié : ${p.name}`);toast('ok','Plan enregistré','Échéances recalculées.');beep('ok');return;
 }
});
document.addEventListener('dragstart',ev=>{const g=ev.target.closest('[data-drag]');if(!g)return;dragData={type:g.dataset.drag,id:g.dataset.id,i:+g.dataset.i};ev.dataTransfer.effectAllowed='move';try{ev.dataTransfer.setData('text/plain',g.dataset.id||'')}catch(e){}});
document.addEventListener('dragover',ev=>{
 const dz=ev.target.closest('#dz');if(dz){ev.preventDefault();dz.classList.add('over');return}
 if(!dragData)return;const g=ev.target.closest('[data-drag]');
 if(g&&g.dataset.drag===dragData.type){ev.preventDefault();g.classList.add('over')}});
document.addEventListener('dragleave',ev=>{const dz=ev.target.closest('#dz');if(dz)dz.classList.remove('over');const g=ev.target.closest('[data-drag]');if(g)g.classList.remove('over')});
document.addEventListener('drop',ev=>{
 const dz=ev.target.closest('#dz');
 if(dz){ev.preventDefault();dz.classList.remove('over');const f=ev.dataTransfer.files[0];
  if(f)f.text().then(txt=>{$('#impText').value=txt;toast('info','Fichier déposé',f.name+' — lancez l’analyse.');beep('tick')});return}
 if(!dragData)return;const g=ev.target.closest('[data-drag]');if(!g||g.dataset.drag!==dragData.type)return;ev.preventDefault();
 if(dragData.type==='garage'){const from=GARAGE.indexOf(dragData.id),to=+g.dataset.i;
  if(from>=0&&to>=0&&from!==to){GARAGE.splice(from,1);GARAGE.splice(to,0,dragData.id);save();render();beep('tick')}}
 else if(dragData.type==='planrow'){const rows=readPlanRows(),from=dragData.i,to=+g.dataset.i;
  if(from!==to){const[r]=rows.splice(from,1);rows.splice(to,0,r);$('#planRows').innerHTML=rows.map(planRow).join('');beep('tick')}}
 dragData=null;
});
document.addEventListener('dragend',()=>{dragData=null;$$('.over').forEach(x=>x.classList.remove('over'))});
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'){if(modalOpen)closeModal();else if(S.drawer)closeDrawer();else omniClose();return}
 if(ev.key==='/'&&!ev.target.matches('input,textarea,select')){const o=$('#omni');if(o&&o.offsetParent){ev.preventDefault();o.focus()}return}
 if(ev.target.id==='omni'){
  const hits=$$('#omnires .hit');
  if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();if(!hits.length)return;
   omniIdx=clamp(omniIdx+(ev.key==='ArrowDown'?1:-1),0,hits.length-1);
   hits.forEach((h,i)=>h.classList.toggle('sel',i===omniIdx));hits[omniIdx].scrollIntoView({block:'nearest'})}
  else if(ev.key==='Enter'){ev.preventDefault();(hits[omniIdx]||hits[0])?.click()}
 }
 if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.eng[data-act]')){ev.preventDefault();ev.target.click()}
});
/* ── 13. ROUTAGE / BOOT / INIT ── */
function route(){
 const h=(location.hash||'#/bord').replace('#/','');
 S.view=['bord','explorer','tech','entretien','studio','donnees'].includes(h)?h:'bord';
 render();
}
window.addEventListener('hashchange',()=>{route();beep('tick')});
setInterval(()=>{const c=$('#clk');if(c)c.textContent=new Date().toLocaleTimeString('fr-FR')},1000);
function boot(){
 const o=$('#boot'),done=()=>{o.classList.add('off');setTimeout(()=>o.remove(),520);sessionStorage.setItem('mecadata_boot','1')};
 o.addEventListener('click',done,{once:true});
 if(sessionStorage.getItem('mecadata_boot')){$('#bbar').style.width='100%';setTimeout(done,240);return}
 const lines=[['Noyau MECADATA v5.1 — initialisation',8],['Montage des fichiers croisés dynamiques…',22],
  [`brands.json — ${DB.brands.length} entrées`,38],[`models.json — ${DB.models.length} entrées`,52],
  [`engines.json — ${DB.engines.length} motorisations réelles`,68],
  [`faults.json ${DB.faults.length} · tsb.json ${DB.tsb.length} · maintenance.json ${DB.maint.length}`,82],
  [`Corrélations : ${fmt(META.links)} liaisons actives`,94],
  ['Contrôle intégrité : '+(META.integ.ok?'BASE INTÈGRE':'AVERTISSEMENTS'),100]];
 const log=$('#bl');let i=0;
 const step=()=>{if(!o.isConnected)return;if(i>=lines.length){setTimeout(done,340);return}
  const[txt,p]=lines[i++];const d=document.createElement('div');d.innerHTML=`<b>▸</b> ${esc(txt)}`;log.appendChild(d);
  while(log.children.length>6)log.firstChild.remove();$('#bbar').style.width=p+'%';setTimeout(step,145)};
 setTimeout(step,170);
}
loadState();recompute();WP.init();route();updateMeta();boot();
if(!localStorage.getItem(KEY)){audit('adm','Base usine 2017+ initialisée ('+DB.engines.length+' motorisations)');save()}
