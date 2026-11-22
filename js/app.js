/* MECADATA — événements, formulaires, import/export, routage, démarrage */
'use strict';
/* ── CSV ── */
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
/* ── import ── */
let IMPORT=null;
function openImport(target='auto'){
 if(!isAdm())return needAdm();
 IMPORT=null;
 openModal(`<div class="mh">${ic('ul')}<h3>Import — fichiers croisés dynamiques</h3><button class="tb" data-act="mclose">${ic('x')}</button></div>
 <div class="mb2"><div class="fr f2"><div><label class="lb">Fichier cible</label><select class="sel" id="impTarget">${[['auto','Détection auto / bundle'],...FILES.map(f=>[f[0],f[1]])].map(o=>`<option value="${o[0]}" ${target===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>
 <div><label class="lb">Mode</label><select class="sel" id="impMode"><option value="merge">Fusionner (upsert par id)</option><option value="replace">Remplacer le fichier</option></select></div></div>
 <div class="dz" id="dz" style="margin-top:13px" data-act="dzPick">${ic('ul')}<div><b>Déposer un fichier .json / .csv</b> ou cliquer pour parcourir</div><div class="dim mono" style="font-size:10px;margin-top:4px">VALIDATION TRANSACTIONNELLE — AUCUNE ÉCRITURE AVANT ANALYSE</div></div>
 <input type="file" id="impFile" accept=".json,.csv,.txt,.js" style="display:none">
 <div style="margin-top:12px"><label class="lb">…ou coller les données (JSON / CSV)</label><textarea class="inp mono" id="impText" rows="6" placeholder='[{"code":"DV5RUCd","fam":"DV5","label":"1.5 BlueHDi 130","fuel":"d","hp":130,"nm":300,"y0":2019,"y1":2026,"models":"peu-208b"}]'></textarea></div>
 <details style="margin-top:10px"><summary class="dim" style="cursor:pointer;font-size:12px">Formats acceptés & modèles CSV</summary><div class="dim" style="font-size:11.5px;margin-top:8px;line-height:1.7">JSON : tableau d'objets ou bundle <span class="mono">{"brands":[…],"engines":[…],…}</span>. CSV : en-têtes exacts, listes séparées par <span class="mono">;</span> dans un champ guillemeté.
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
 if(data&&data.brands&&Array.isArray(data.brands)&&Array.isArray(data.brands[0])){
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
  else{const map=new Map(DB[k].map(x=>[x.id,x]));arr.forEach(n=>{if(map.has(n.id))upd++;else ins++;map.set(n.id,n)});DB[k]=[...map.values()]}
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
 const compact={meta:{name:'MECADATA BASE',version:'5.0',build:new Date().toISOString().slice(0,7),range:[2017,2026]},
  brands:DB.brands.map(b=>[b.id,b.n,b.pays,b.grp]),
  models:DB.models.map(m=>[m.id,m.b,m.n,m.y[0],m.y[1],m.seg]),
  engines:DB.engines.map(e=>[e.m[0],e.code,e.fam,e.label,e.fuel,e.disp,e.hp,e.nm,e.y[0],e.y[1],e.gb,e.norm]),
  faults:DB.faults.map(f=>[f.t,(f.fam||[]).join(';'),f.sev,f.freq,f.y[0],f.y[1],f.km[0],f.km[1],(f.sym||[]).join('|'),f.cause,f.fix,f.cost[0],f.cost[1],f.status,f.fuel||'']),
  tsb:DB.tsb.map(t=>[t.ref,(t.b||[]).join(';'),(t.fam||[]).join(';'),t.t,t.date,t.cat,t.sev,t.sum,t.act]),
  maint:DB.maint.map(p=>[p.id,p.name,(p.fam||[]).join(';'),p.oil,p.dist,p.items,p.note,p.fuel||''])};
 download('base.js','/* MECADATA — base exportée (état courant) */\nwindow.MECADATA_BASE = '+JSON.stringify(compact,null,1)+';\n','text/javascript');
 toast('ok','data/base.js exporté','Remplacez le fichier du même nom pour figer cet état comme base usine.');beep('ok');audit('exp','Export data/base.js');
}
/* ── formulaires CRUD ── */
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
/* ── omnibox ── */
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
/* ── événements ── */
let lockTries=0,lockUntil=0,lockTimer=0,dragData=null;
document.addEventListener('click',ev=>{
 const mb=ev.target.closest('.mb[data-act=stMode]');if(mb){WP.set('mode',mb.dataset.m);beep('tick');return}
 const pb=ev.target.closest('.pb[data-act=stTheme]');if(pb){WP.set('theme',pb.dataset.t);beep('tick');return}
 const el=ev.target.closest('[data-act]');
 if(!el){if(!ev.target.closest('.omni'))omniClose();return}
 const act=el.dataset.act,id=el.dataset.id,stop=()=>{ev.preventDefault();ev.stopPropagation()};
 if(act.startsWith('doDel')){
  const[,kind,did]=act.split(':');closeModal();snapshot('del');
  const k={Eng:'engines',Fault:'faults',Tsb:'tsb'}[kind];
  DB[k]=DB[k].filter(x=>x.id!==did);if(S.drawer&&S.drawer.id===did)closeDrawer();
  mutate('del',`Suppression ${k} : ${did}`);toast('warn','Enregistrement supprimé','Annulation possible.',true);beep('del');return;
 }
 switch(act){
 case 'msearch':{stop();const q=prompt('Recherche globale (marque, modèle, code, panne, TSB) :');if(q){S.f.q=q;S.shown=36;location.hash='#/explorer';render()}break}
 case 'snd':PREF.sound=!PREF.sound;save();updateMeta();if(PREF.sound)beep('ok');toast('info',PREF.sound?'Son activé':'Son coupé','Effets sonores de la console.');break;
 case 'run':WP.set('run',!WP.P.run);if(!WP.P.run)WP.stop();beep('tick');break;
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
 case 'doReset':closeModal();snapshot('reset');DB=clone(SEED);GARAGE=[];mutate('del','Réinitialisation base usine');toast('warn','Base usine restaurée','Imports et modifications effacés.',true);beep('warn');break;
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
 case 'doBulkDel':{closeModal();snapshot('bulk');const k=S.adm.tab,n=S.adm.sel.size;DB[k]=DB[k].filter(x=>!S.adm.sel.has(x.id));S.adm.sel.clear();mutate('del',`Suppression groupée : ${n} × ${k}`);toast('warn',n+' supprimé(s)','Corrélations recalculées.',true);beep('del');break}
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
 case 'stRun':WP.set('run',!WP.P.run);if(!WP.P.run)WP.stop();render();beep('tick');break;
 case 'stApply':WP.P.bg=true;$('#bgc').style.display='';$('#bgfx').style.display='';WP.apply();save();toast('ok','Fond appliqué','La scène courante pilote le fond de la console.');beep('ok');break;
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
 if(ev.key==='/'&&!ev.target.matches('input,textarea,select')){ev.preventDefault();const o=$('#omni');if(o&&o.offsetParent)o.focus();return}
 if(ev.target.id==='omni'){
  const hits=$$('#omnires .hit');
  if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();if(!hits.length)return;
   omniIdx=clamp(omniIdx+(ev.key==='ArrowDown'?1:-1),0,hits.length-1);
   hits.forEach((h,i)=>h.classList.toggle('sel',i===omniIdx));hits[omniIdx].scrollIntoView({block:'nearest'})}
  else if(ev.key==='Enter'){ev.preventDefault();(hits[omniIdx]||hits[0])?.click()}
 }
 if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.eng[data-act]')){ev.preventDefault();ev.target.click()}
});
/* ── routage ── */
function route(){
 const h=(location.hash||'#/bord').replace('#/','');
 S.view=['bord','explorer','tech','entretien','studio','donnees'].includes(h)?h:'bord';
 render();
}
window.addEventListener('hashchange',()=>{route();beep('tick')});
setInterval(()=>{const d=new Date(),c=$('#clk');if(c)c.textContent=d.toLocaleTimeString('fr-FR')},1000);
/* ── boot ── */
function boot(){
 const o=$('#boot'),done=()=>{o.classList.add('off');setTimeout(()=>o.remove(),520);sessionStorage.setItem('mecadata_boot','1')};
 o.addEventListener('click',done,{once:true});
 if(sessionStorage.getItem('mecadata_boot')){$('#bbar').style.width='100%';setTimeout(done,240);return}
 const lines=[['Noyau MECADATA v5.0 — initialisation',8],['Montage des fichiers croisés dynamiques…',22],
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
/* ── init ── */
loadState();recompute();WP.init();route();updateMeta();boot();
if(!localStorage.getItem(KEY)){audit('adm','Base usine 2017+ initialisée ('+DB.engines.length+' motorisations)');save()}
