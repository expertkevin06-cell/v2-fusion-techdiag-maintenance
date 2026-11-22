/* MECADATA — vues : bord, explorateur, tech, entretien, studio, fichiers croisés */
'use strict';
function render(){
 const v=S.view,main=$('#view');
 if(v!=='studio')WP.detachPreview();
 $$('.nv,#tabs a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));
 if(v==='bord')main.innerHTML=vBord();
 else if(v==='explorer')main.innerHTML=vExplorer();
 else if(v==='tech')main.innerHTML=vTech();
 else if(v==='entretien')main.innerHTML=vEntretien();
 else if(v==='studio')main.innerHTML=vStudio();
 else main.innerHTML=vDonnees();
 mountAnim(main);updateMeta();
 if(v==='explorer')refreshResults();
 if(v==='tech')refreshTech();
 if(v==='entretien')refreshCalc();
 if(v==='studio'){const cv=$('#pv');if(cv){WP.attachPreview(cv);WP.fx();WP.sync();applyFormat()}}
 if(v==='donnees'&&isAdm())refreshAdm();
}
function updateMeta(){
 const c=META.counts;
 $('#nEng').textContent=fmt(c.e);$('#nTech').textContent=fmt(c.f+c.t);$('#nPlan').textContent=fmt(c.p);
 $('#stLinks').textContent=fmt(META.links);$('#stCorr').textContent=fmt(META.corr);$('#stInt').textContent=META.integ.pct+'%';$('#stSize').textContent=META.size+' Ko';
 const chip=$('#ichip');chip.className='chip '+(META.integ.ok?(META.integ.warn.length?'warn':'ok'):'warn');
 $('#itxt').textContent=META.integ.ok?(META.integ.warn.length?'INTÈGRE · '+META.integ.warn.length+' AVERT.':'INTÈGRE':'ERREURS '+META.integ.err.length);
 const a=isAdm();$('#admb').classList.toggle('on',a);$('#admb').innerHTML=ic(a?'unlock':'lock');
 $('#rtxt').textContent=a?'Session ING-3 active — écriture, import, suppression et réinitialisation déverrouillées.':'Session invité — lecture, corrélations et exports. Niveau 3 pour écrire.';
 $('#sndb').innerHTML=ic(PREF.sound?'snd':'mute');$('#sndb').classList.toggle('on',PREF.sound);
 updStor();
}
/* ── POSTE DE BORD ── */
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
/* ── EXPLORATEUR ── */
function computeResults(){
 const f=S.f,q=f.q.trim().toLowerCase();
 const list=DB.engines.filter(e=>{
  if(f.brand&&engBrand(e)?.id!==f.brand)return false;
  if(f.fuels.length&&!f.fuels.includes(e.fuel))return false;
  if(f.seg&&!engModels(e).some(m=>m.seg===f.seg))return false;
  if(!ov(e.y,f.y))return false;
  if(e.hp<f.p[0]||e.hp>f.p[1])return false;
  if(q){const hay=[engBrand(e)?.n,...engModels(e).map(m=>m.n),e.code,e.fam,e.label].join(' ').toLowerCase();if(!hay.includes(q))return false}
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
/* ── PANNES & TSB ── */
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
/* ── ENTRETIEN ── */
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
function planItems(q){
 q=q.toLowerCase();
 return DB.maint.filter(p=>!q||(p.name+' '+(p.fam||[]).join(' ')).toLowerCase().includes(q))
 .map(p=>`<button class="pitem ${p.id===S.plan?'on':''}" data-act="selPlan" data-id="${p.id}"><b>${esc(p.name)}</b><small>${esc((p.fam||[]).join(' · ')||(FU[p.fuel]?.l+' — générique'))}</small></button>`).join('')||'<div class="empty" style="padding:16px">Aucun plan</div>';
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
   const nm=Math.ceil(age/imo)*imo,d=new Date(yr,0);d.setMonth(d.getMonth()+nm);const rem=nm-age,pct=clamp((imo-rem)/imo*100,0,100);
   let badge,cls;if(rem<=1){badge='À FAIRE';cls='now'}else if(rem<=3){badge='BIENTÔT';cls='soon'}else{badge='DANS '+rem+' MOIS';cls='ok'}
   rows.push({op,badge,cls,pct,detail:'Échéance : '+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(),u:rem/imo});
  }else rows.push({op,badge:'SELON CONSTRUCTEUR',cls:'ok',pct:0,detail:'Contrôle conditionnel',u:2});
 };
 pl.items.forEach(it=>add(it[0],it[1],it[2]));
 if(pl.dist&&pl.dist[1])add('Distribution : '+pl.dist[0],pl.dist[1],pl.dist[2]);
 rows.sort((a,b)=>a.u-b.u);
 box.innerHTML=rows.map(r=>`<div class="drow" style="--dc:${r.cls==='now'?'var(--red)':r.cls==='soon'?'var(--amber)':'var(--green)'}"><div class="dr1"><b>${esc(r.op)}</b><span class="dbadge ${r.cls}">${r.badge}</span></div><div class="pb"><i style="width:${Math.round(r.pct)}%"></i></div><div class="dim mono" style="font-size:10px;margin-top:5px">${esc(r.detail)}</div></div>`).join('');
}
/* ── STUDIO ── */
function applyFormat(){
 const sc=$('#screen');if(!sc)return;
 const F={free:['16/9','100%'],mobile:['390/844','300px'],tablet:['834/1112','440px'],desktop:['16/9','100%']}[WP.P.format]||['16/9','100%'];
 sc.style.aspectRatio=F[0];sc.style.maxWidth=F[1];
 const ch=$('#chrome');if(ch)ch.innerHTML=WP.P.format==='mobile'?'<span class="nt"></span>':WP.P.format==='free'?'':'<span class="dt"></span><span class="dt"></span><span class="dt"></span><span style="margin-left:8px">MECADATA · APERÇU BUREAU</span>';
 setTimeout(()=>WP.resize(),60);
}
function vStudio(){
 const P=WP.P;
 const sl=(k,label,min,max,step=1)=>`<div><div class="srow"><span>${label}</span><span class="sval" data-pv="${k}">${WP.label(k,P[k])}</span></div><input type="range" data-p="${k}" min="${min}" max="${max}" step="${step}" value="${P[k]}" aria-label="${label}"></div>`;
 const tg=(k,label)=>`<div class="srow"><span>${label}</span><label class="sw"><input type="checkbox" data-p="${k}" ${P[k]?'checked':''} aria-label="${label}"><i></i></label></div>`;
 const thumb={blueprint:'repeating-linear-gradient(0deg,#0A2233 0 5px,#12405C 5px 6px)',aurora:'linear-gradient(120deg,#25D4EE,#E45CFF,#FFAF2E)',flux:'radial-gradient(2px 2px at 25% 40%,#25D4EE 50%,transparent 51%),radial-gradient(2px 2px at 65% 70%,#E45CFF 50%,transparent 51%),#0A1424',radar:'conic-gradient(from 0deg,rgba(67,224,139,.8),transparent 70%),#0A2218',oscillo:'repeating-linear-gradient(90deg,#0A1424 0 3px,#43E08B 3px 4px)',gears:'radial-gradient(circle at 40% 50%,#FFAF2E 22%,transparent 23%),radial-gradient(circle at 70% 50%,#FF7A3D 16%,transparent 17%),#120A04',carbon:'repeating-conic-gradient(#1A2230 0 25%,#0A1018 0 50%) 0 0/8px 8px',telemetry:'linear-gradient(0deg,#FF4D5E 30%,transparent 31%),linear-gradient(90deg,#0A1424,#12305C)'};
 return `<div class="vh rv"><div><span class="kick">MODULE 05 — STUDIO FOND D'ÉCRAN</span><h1>FONDS <i>ANIMÉS</i> — 8 SCÈNES</h1><div class="sub">Moteur canvas temps réel appliqué au fond de la console et exportable en PNG. Tous les réglages agissent immédiatement.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="stRandom">${ic('dice')}Aléatoire</button><button class="btn sm ghost" data-act="stReset">${ic('reset')}Réinitialiser</button><button class="btn sm pri" data-act="stPng">${ic('cam')}Export PNG</button></div></div>
 <div class="stwrap">
 <div class="card stage rv" style="--d:1">
  <div class="screen" id="screen"><canvas id="pv"></canvas><div class="chrome" id="chrome"></div><div class="fx"><div class="v"></div><div class="g"></div><div class="s"></div></div><div class="hud" id="hud"></div></div>
  <div class="stagebar">
   <button class="btn sm ${P.run?'amb':'ghost'}" data-act="stRun">${ic(P.run?'pause':'play')}${P.run?'Pause':'Lecture'}</button>
   <button class="btn sm ghost" data-act="stApply">${ic('spark')}Appliquer au fond global</button>
   <button class="btn sm ghost" data-act="stJson">${ic('dl')}Preset JSON</button>
   <span class="chip" style="margin-left:auto">${ic('info','width:12px;height:12px')}Rendu canvas · DPR plafonné</span>
  </div>
  <div class="presets" style="margin-top:11px">${Object.keys(WP.PRESETS).map(n=>`<button class="ps" data-act="stPreset" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
 </div>
 <div class="card ctrl rv" style="--d:2">
  <h3>${ic('spark')}RÉGLAGES LIVE</h3>
  <div class="csec"><label class="lb">Scène</label><div class="mgrid">${WP.MODES.map(m=>`<button class="mb ${P.mode===m[0]?'on':''}" data-m="${m[0]}" data-act="stMode"><i style="background:${thumb[m[0]]}"></i>${m[1]}</button>`).join('')}</div></div>
  <div class="csec"><label class="lb">Palette</label><div class="pgrid">${Object.entries(WP.TH).map(([k,v])=>`<button class="pb ${P.theme===k?'on':''}" data-t="${k}" data-act="stTheme" title="${v.n}" aria-label="${v.n}" style="background:linear-gradient(135deg,${v.a},${v.b},${v.c});color:${v.a}"></button>`).join('')}</div></div>
  <div class="csec">${sl('density','Densité',0,100)}${sl('count','Particules',10,400,5)}${sl('speed','Vitesse',0,200,5)}${sl('turb','Turbulence',0,100)}</div>
  <div class="csec">${sl('scale','Échelle / grille',20,160,2)}${sl('glow','Halo lumineux',0,100)}${sl('blur','Flou',0,8,.5)}${sl('stroke','Épaisseur trait',.5,4,.1)}${sl('drift','Dérive caméra',0,100)}</div>
  <div class="csec"><div class="fr f2"><div><label class="lb">Qualité</label><select class="sel" data-p="quality"><option value="eco" ${P.quality==='eco'?'selected':''}>Éco · 1×</option><option value="std" ${P.quality==='std'?'selected':''}>Standard · 1.5×</option><option value="ultra" ${P.quality==='ultra'?'selected':''}>Ultra · 2×</option></select></div>
  <div><label class="lb">Format d'export</label><select class="sel" data-p="format"><option value="free" ${P.format==='free'?'selected':''}>Libre 1600×900</option><option value="mobile" ${P.format==='mobile'?'selected':''}>Mobile 1170×2532</option><option value="tablet" ${P.format==='tablet'?'selected':''}>Tablette 1668×2224</option><option value="desktop" ${P.format==='desktop'?'selected':''}>Bureau 1920×1080</option></select></div></div></div>
  <div class="csec">${tg('grid','Grille & repères')}${tg('grain','Grain technique')}${tg('scan','Balayage lumineux')}${tg('vig','Vignettage')}${tg('run','Animation active')}${tg('bg','Fond global de la console')}</div>
 </div></div>`;
}
/* ── FICHIERS CROISÉS / ADMIN ── */
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
