/* MECADATA — noyau : utils, état, corrélations, audio, primitives UI */
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('fr-FR');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=p=>p+Math.random().toString(36).slice(2,7).toUpperCase();
const clone=o=>typeof structuredClone==='function'?structuredClone(o):JSON.parse(JSON.stringify(o));
const ov=(a,b)=>a[0]<=b[1]&&b[0]<=a[1];
const ic=(n,st='')=>`<svg class="ic"${st?` style="${st}"`:''}><use href="#i-${n}"/></svg>`;
const deb=(f,t)=>{let h;return(...a)=>{clearTimeout(h);h=setTimeout(()=>f(...a),t)}};
const split=v=>Array.isArray(v)?v:String(v||'').split(/[;,]/).map(s=>s.trim()).filter(Boolean);
function download(name,content,mime='application/json'){
 const b=new Blob([content],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');
 a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),500);
}
const PWD='Kevin83600',KEY='mecadata_v5';
const FU={e:{l:'Essence',c:'#FFAF2E'},d:{l:'Diesel',c:'#4D8DFF'},h:{l:'Hybride',c:'#43E08B'},p:{l:'Hybride rechargeable',c:'#19B8A6'},b:{l:'Électrique',c:'#E45CFF'},g:{l:'GPL / ECO-G',c:'#A8E63C'}};
const SV={critique:{w:32,c:'#FF4D5E'},majeure:{w:18,c:'#FF7A3D'},'modérée':{w:9,c:'#FFAF2E'},mineure:{w:4,c:'#4D8DFF'},info:{w:0,c:'#25D4EE'}};
const FQ={'élevée':1.25,moyenne:1,faible:.7};
const GBL={BVM:'BVM',BVM5:'BVM5',BVM6:'BVM6',BVA:'BVA',EAT6:'EAT6 Aisin',EAT8:'EAT8 Aisin',EDC6:'EDC6 Getrag',EDC7:'EDC7 Getrag',DQ200:'DSG7 DQ200 (sec)',DQ250:'DSG6 DQ250',DQ381:'DSG7 DQ381',DQ400:'DSG6 DQ400e',DQ500:'DSG7 DQ500',eCVT:'e-CVT planétaire',RED:'Réducteur',CVT:'CVT',DCT6:'DCT6 e-DCS6',DCT7:'DCT7',DCT8:'DCT8 humide',ZF8:'ZF8',G9:'9G-Tronic',GTR7:'7G-DCT',PDK:'PDK',MMT:'Multimode dogbox',XTR:'Xtronic',AGS:'AGS robotisée',DPS6:'Powershift DPS6'};
const SEGS=['Citadine','Micro-citadine','Compacte','SUV urbain','SUV compact','Berline','Break','Ludospace','Utilitaire','Coupé','Roadster','Sportive','Monospace','Pick-up'];
const IVL=v=>v>=75?['CRITIQUE','#FF4D5E']:v>=50?['ÉLEVÉ','#FF7A3D']:v>=25?['MODÉRÉ','#FFAF2E']:['FAIBLE','#43E08B'];
const FILES=[['brands','brands.json','Marques'],['models','models.json','Modèles'],['engines','engines.json','Motorisations'],['faults','faults.json','Pannes connues'],['tsb','tsb.json','Bulletins / TSB'],['maint','maintenance.json','Plans d’entretien']];

/* ── expansion de la base compacte ── */
function expandBase(raw){
 const D={brands:[],models:[],engines:[],faults:[],tsb:[],maint:[]};
 (raw.brands||[]).forEach(b=>D.brands.push({id:b[0],n:b[1],pays:b[2],grp:b[3]}));
 (raw.models||[]).forEach(m=>D.models.push({id:m[0],b:m[1],n:m[2],y:[m[3],m[4]],seg:m[5]}));
 (raw.engines||[]).forEach((e,i)=>D.engines.push({id:'E'+String(i+1).padStart(3,'0'),m:[e[0]],code:e[1],fam:e[2],label:e[3],fuel:e[4],disp:e[5],hp:e[6],nm:e[7],kw:Math.round(e[6]*.7355),y:[e[8],e[9]],gb:e[10],norm:e[11],
  cyl:e[4]==='b'?'ÉLEC':(e[5]>2900?'L6/V':'L4'),asp:e[4]==='b'?'—':(/SCe|MPi|MPI|Fire |Dualjet|VVT|Skyactiv-G|Atmo/.test(e[3])?'Atmo':'Turbo'),inj:e[4]==='b'?'—':(e[4]==='d'?'Common Rail':'Injection directe'),note:''}));
 (raw.faults||[]).forEach((f,i)=>D.faults.push({id:'F'+String(i+1).padStart(3,'0'),t:f[0],fam:split(f[1]),sev:f[2],freq:f[3],y:[f[4],f[5]],km:[f[6],f[7]],sym:split(f[8].replace(/;/g,'|').replace(/\|/g,';')),cause:f[9],fix:f[10],cost:[f[11],f[12]],status:f[13],fuel:f[14]||'',m:[],gb:f[2]==='info'&&/DSG humide/.test(f[0])?['DQ250','DQ381','DQ500']:(/DQ200/.test(f[0])?['DQ200']:(/EDC6/.test(f[0])?['EDC6']:(/EAT8/.test(f[0])?['EAT8']:(/DPS6/.test(f[0])?['DPS6']:[])))),e:[]}));
 (raw.tsb||[]).forEach((t,i)=>D.tsb.push({id:'T'+String(i+1).padStart(3,'0'),ref:t[0],b:split(t[1]),fam:split(t[2]),t:t[3],date:t[4],cat:t[5],sev:t[6],sum:t[7],act:t[8],m:[],gb:/DQ200/.test(t[3])?['DQ200']:(/EDC6/.test(t[3])?['EDC6']:[])}));
 (raw.maint||[]).forEach(p=>D.maint.push({id:p[0],name:p[1],fam:split(p[2]),oil:p[3]||null,dist:p[4]||null,items:p[5]||[],note:p[6]||'',fuel:p[7]||'',base:[15000,12]}));
 return D;
}
let SEED=null,DB=null,AUDIT=[],GARAGE=[],VIEWS=[],UNDO=null,META={counts:{},links:0,corr:0,integ:{err:[],warn:[],ok:true,pct:100},size:0};
let PREF={sound:true};
const S={view:'bord',f:{q:'',brand:'',fuels:[],seg:'',y:[2017,2026],p:[0,1050],sort:'brand'},shown:36,
 tech:{tab:'faults',q:'',sev:'',brand:'',cat:''},adm:{tab:'engines',q:'',page:0,sel:new Set()},
 plan:null,planCtx:null,calc:{km:60000,year:2021,sev:1},drawer:null};
const isAdm=()=>sessionStorage.getItem('mecadata_adm')==='1';

function loadState(){
 SEED=expandBase(window.MECADATA_BASE||{brands:[],models:[],engines:[],faults:[],tsb:[],maint:[]});
 DB=clone(SEED);
 try{const raw=localStorage.getItem(KEY);
  if(raw){const d=JSON.parse(raw);
   if(d&&d.db&&Array.isArray(d.db.engines)&&d.db.engines.length){DB=d.db;AUDIT=d.audit||[];GARAGE=d.garage||[];VIEWS=d.views||[];PREF=Object.assign(PREF,d.prefs||{});if(d.wp)Object.assign(WP.P,d.wp)}
  }
 }catch(e){}
}
const save=deb(()=>{try{localStorage.setItem(KEY,JSON.stringify({v:5,db:DB,audit:AUDIT.slice(-90),garage:GARAGE,views:VIEWS,prefs:PREF,wp:WP.P}));updStor()}catch(e){toast('warn','Stockage local saturé','Session conservée en mémoire — exportez la base.')}},220);
function audit(type,msg){AUDIT.push({ts:Date.now(),type,msg});if(AUDIT.length>140)AUDIT=AUDIT.slice(-140)}
function snapshot(label){UNDO={label,db:clone(DB),garage:[...GARAGE]}}
function doUndo(){if(!UNDO)return;DB=UNDO.db;GARAGE=UNDO.garage;UNDO=null;mutate('imp','Annulation : '+ 'restauration');toast('ok','Action annulée','Base restaurée.')}
function pruneRefs(){const ids=new Set(DB.engines.map(e=>e.id));GARAGE=GARAGE.filter(i=>ids.has(i));if(S.planCtx&&!ids.has(S.planCtx))S.planCtx=null;if(S.drawer&&S.drawer.type==='engine'&&!ids.has(S.drawer.id))closeDrawer()}
function mutate(type,msg){recompute();pruneRefs();audit(type,msg);save();updateMeta();render();if(S.drawer)renderDrawer()}

/* ── corrélations ── */
const modelById=id=>DB.models.find(m=>m.id===id);
const brandById=id=>DB.brands.find(b=>b.id===id);
const engModels=e=>e.m.map(modelById).filter(Boolean);
const engBrand=e=>{const m=engModels(e)[0];return m?brandById(m.b):null};
const engName=e=>{const m=engModels(e)[0],b=engBrand(e);return `${b?b.n:''} ${m?m.n:''} — ${e.label}`.trim()};
function faultsFor(e){
 return DB.faults.filter(f=>(f.fam||[]).includes(e.fam)||(f.e||[]).includes(e.id)||(f.m||[]).some(i=>e.m.includes(i))||(f.gb||[]).includes(e.gb)||(f.fuel&&f.fuel===e.fuel))
 .map(f=>({...f,active:ov(f.y,e.y)})).sort((a,b)=>(b.active-a.active)||(SV[b.sev]?.w||0)-(SV[a.sev]?.w||0));
}
function tsbFor(e){const bs=engModels(e).map(m=>m.b);
 return DB.tsb.filter(t=>(t.fam||[]).includes(e.fam)||(t.b||[]).some(b=>bs.includes(b))||(t.m||[]).some(i=>e.m.includes(i))||(t.gb||[]).includes(e.gb)).sort((a,b)=>b.date.localeCompare(a.date));}
function planFor(e){return DB.maint.find(p=>(p.fam||[]).includes(e.fam))||DB.maint.find(p=>p.fuel===e.fuel)||DB.maint.find(p=>p.fuel===(e.fuel==='g'?'e':e.fuel))||DB.maint[0]}
function ivi(e){let s=0;for(const f of faultsFor(e)){const w=(SV[f.sev]?.w||0)*(FQ[f.freq]||1);s+=f.active?w:w*.25}return clamp(Math.round(s),0,100)}
const enginesForFault=f=>DB.engines.filter(e=>(f.fam||[]).includes(e.fam)||(f.e||[]).includes(e.id)||(f.m||[]).some(i=>e.m.includes(i))||(f.gb||[]).includes(e.gb)||(f.fuel&&f.fuel===e.fuel));
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
function updStor(){const kb=META.size||0;const b=$('#sbar'),t=$('#stxt');if(b)b.style.width=clamp(kb/5120*100,2,100)+'%';if(t)t.textContent=kb+' Ko / ~5 120 Ko'}

/* ── audio ── */
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

/* ── toasts / modales ── */
function toast(type,title,msg,undo=false){
 const box=$('#ts');if(!box)return;while(box.children.length>=3)box.firstChild.remove();
 const el=document.createElement('div');el.className='to '+type;
 const icons={ok:'check',err:'alert',warn:'alert',info:'info'};
 el.innerHTML=`${ic(icons[type]||'info')}<div style="flex:1;min-width:0"><b>${esc(title)}</b>${msg?`<p>${esc(msg)}</p>`:''}</div>${undo?`<button class="btn xs amb" data-act="undo">${ic('undo')}Annuler</button>`:''}<span class="pg" style="animation-duration:${undo?8:4.6}s"></span>`;
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

/* ── briques de présentation ── */
const sevTag=s=>`<span class="sev ${esc(s)}">${esc(s)}</span>`;
const fuelTag=f=>{const x=FU[f]||{l:f,c:'#9FB2C8'};return `<span class="fuel" style="--fc:${x.c}">${x.l}</span>`};
const iviPill=v=>{const[l,c]=IVL(v);return `<span class="ivp" style="--ic:${c}"><i></i>IVI ${v} · ${l}</span>`};
function gaugeSVG(v){const C=Math.PI*52,off=C*(1-v/100),rot=-90+v*1.8;
 return `<svg class="gg" viewBox="0 0 120 70"><path class="ba" d="M8 62 A52 52 0 0 1 112 62"/><path class="fa" d="M8 62 A52 52 0 0 1 112 62" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${off}"/><line class="nd" x1="59" y1="61" x2="59" y2="19" data-rot="${rot}" style="transform:rotate(-90deg)"/><circle cx="59" cy="61" r="4" fill="var(--tx)"/></svg>`}
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
  const step=t=>{if(!el.isConnected)return;const p=Math.min(1,(t-t0)/750),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(target*e));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  $$('.fa[data-off]',scope).forEach(p=>p.style.strokeDashoffset=p.dataset.off);
  $$('.nd[data-rot]',scope).forEach(p=>p.style.transform=`rotate(${p.dataset.rot}deg)`);
  $$('.brow .bt i',scope).forEach(i=>i.style.width=i.dataset.w);
  $$('.coly i',scope).forEach(i=>i.style.height=i.dataset.h);
  $$('.donut circle[data-seg]',scope).forEach(c=>c.setAttribute('stroke-dasharray',c.dataset.seg));
 }));
}

/* ── drawer ── */
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
