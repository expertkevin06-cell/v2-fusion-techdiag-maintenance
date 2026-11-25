(function(){
"use strict";
window.__MD_VER="8.6";window.__MD_BUILD="8.6";
var $=window.MD_$,$$=window.MD_$$,esc=window.MD_esc,fmt=window.MD_fmt,clamp=window.MD_clamp,uid=window.MD_uid,clone=window.MD_clone,ov=window.MD_ov,ic=window.MD_ic,deb=window.MD_deb,split=window.MD_split,nk=window.MD_nk,slug=window.MD_slug,safe=window.MD_safe,logErr=window.MD_logErr,STORE=window.MD_STORE,download=window.MD_download,beep=window.MD_beep,toast=window.MD_toast,openModal=window.MD_openModal,closeModal=window.MD_closeModal,confirmModal=window.MD_confirmModal,modalOpenFn=window.MD_modalOpen,WP=window.MD_WP,PREF=window.MD_PREF,ERRORS=window.MD_ERRORS;
if(!$||!WP||!STORE){if(window.__MD_EMERGENCY)window.__MD_EMERGENCY("Socle 01-watchdog.js incomplet.");return;}

var PWD="Kevin83600", TIER_PWD="Expertdu83";
var KEY="mecadata_v86", PKEY="md_pub_v86", TIERDATA="md_tier_data_v86", TIERUI="md_tier_ui_v86";
var YMAX=2027, KMMAX=200000;

/* ── jeu de secours interne : ouvre même si 02-data.js est absent ── */
var MIN_RAW={segs:{"C":"Compacte","S":"SUV","H":"Hatchback","B":"Berline"},
 br:[["peugeot","Peugeot","France","Stellantis"],["renault","Renault","France","Renault"],["volkswagen","Volkswagen","Allemagne","VW"],["hyundai","Hyundai","Corée","Hyundai-Kia"]],
 md:{peugeot:[["3008 II Phase 2",2020,2027,"S",2],["208 III",2019,2027,"H",1]],renault:[["Clio V",2019,2027,"H",1]],volkswagen:[["Golf VIII",2019,2027,"H",1]],hyundai:[["Ioniq 5",2021,2027,"S",1]]},
 me:{"peugeot-3008-ii-phase-2":[["DV5RUCe","DV5","1.5 BlueHDi 130 EAT8","d",1499,130,300,"EAT8",2020,2027],["EP6DTDA","EP6","1.6 THP 180 EAT8","e",1598,180,250,"EAT8",2020,2023]],
     "peugeot-208-iii":[["EB2ADTX","EB2","1.2 PureTech 130 EAT8","e",1199,130,230,"EAT8",2020,2027]],
     "renault-clio-v":[["K9K806","K9K","1.5 Blue dCi 100","d",1461,100,260,"BVM",2019,2027]],
     "volkswagen-golf-viii":[["EA211-DPCA","EA211","1.5 TSI ACT 130 DSG","e",1498,130,250,"DSG",2020,2027]],
     "hyundai-ioniq-5":[["E-GMP63","E-GMP","Ioniq 5 63 kWh RWD","b",0,170,350,"BVM",2021,2027]]},
 ft:[["Courroie EB2 PureTech","EB2","208","*","critique","élevée",2017,2024,20000,120000,"Râle froid|Fuite huile","Courroie immergée dégradée","Remplacement courroie+crépine",600,1400,"Campagne","Distribution"],
     ["AdBlue / SCR encrassé","K9K","Clio","*","majeure","élevée",2018,2027,30000,160000,"Voyant AdBlue|Limitation","Cristallisation urée","Nettoyage injecteur+capteurs NOx",400,1800,"Surveillance","Dépollution"],
     ["ICCU Ioniq 5","E-GMP","Ioniq 5","*","critique","moyenne",2021,2026,10000,120000,"Perte traction|Non-démarrage","Surcharge ICCU","Remplacement ICCU",0,0,"Campagne","Électrification"]],
 ts:[["RPL-PEU-2023-EB2","peugeot","EB2","208,3008","*","Rappel courroie EB2","2023-09","Rappel","critique","Campagne courroie immergée","Remplacement courroie+crépine","Distribution"],
     ["RPL-HYU-2022-ICCU","hyundai","E-GMP","Ioniq 5","*","Rappel ICCU","2022-11","Rappel","critique","Défaillance ICCU","Remplacement ICCU","Électrification"]],
 svc:[{fams:["DV5","K9K","EA288","EB15","D1.6T"],fuel:"d",base:20000,months:12,oil:["0W-30 C2/C3",5],dist:["Courroie/chaîne",0,0],items:[["Filtre à huile + huile",20000,0],["Filtre à air",40000,0],["Filtre habitacle",20000,0],["Filtre à carburant",60000,0],["Liquide de freins",0,24],["Liquide de refroidissement",0,60],["Courroie accessoires",120000,0],["Batterie 12V",0,48]],controls:["Plaquettes et disques","Suspension et rotules","Parallélisme","Diagnostic calculateurs","Éclairage","Niveaux et fuites"],fluids:["24 mois","5 ans / 200 000 km",120,2.5,2.3,"Recyclage 24 mois","Contrôle 12 mois"]},
     {fams:["EB2","EP6","EA211","KR15","EB10"],fuel:"e",base:15000,months:12,oil:["0W-30 / 5W-30 C2",4.5],dist:["Courroie distribution",120000,10],items:[["Filtre à huile + huile",15000,0],["Filtre à air",30000,0],["Filtre habitacle",15000,0],["Bougies d'allumage",60000,0],["Courroie accessoires",120000,0],["Liquide de freins",0,24],["Liquide de refroidissement",0,60],["Huile de boîte",80000,0],["Batterie 12V",0,48]],controls:["Plaquettes et disques","Turbo et durites","Injection et ratés","Diagnostic calculateurs","Échappement FAP/GPF","Niveaux et fuites"],fluids:["24 mois","5 ans / 200 000 km",120,2.5,2.3,"Recyclage 24 mois","Contrôle 12 mois"]},
     {fams:["E-GMP","EM4","ID4","TM3","DREV","FBEV","VP6"],fuel:"b",base:20000,months:24,oil:["Réducteur / pas de vidange",0],dist:["Pas de distribution thermique",0,0],items:[["Filtre habitacle",20000,0],["Liquide de freins",0,24],["Liquide de refroidissement batterie",0,48],["Filtre batterie HV",40000,0],["Batterie 12V",0,48],["Contrôle isolement HV",40000,0]],controls:["Plaquettes et disques","Suspension et silentblocs","Diagnostic batteries HV et isolement","Connecteurs HV et refroidissement","Mise à jour logiciels"],fluids:["24 mois","48 mois",110,2.5,2.3,"—","Contrôle 12 mois"]}],
 cand:[{type:"Modèle",brand:"byd",model:"Seal U DM-i",phase:1,code:"Byd-Super",label:"1.5 Ti DM-i 218",hp:218,nm:300,disp:1498,fuel:"p",gb:"ECVT",y0:2024,y1:2027,seg:"S",note:"Hybride rechargeable BYD"}]};

function rawValid(R){return R&&typeof R==="object"&&Array.isArray(R.br)&&R.br.length&&R.md&&R.me&&Array.isArray(R.ft)&&Array.isArray(R.ts)&&Array.isArray(R.svc)&&R.svc.length&&Array.isArray(R.cand)&&R.segs;}
var RAW=rawValid(window.MD_RAW)?window.MD_RAW:MIN_RAW;
var SEGS=RAW.segs;
var FU={e:{l:"Essence",c:"#FFAF2E"},d:{l:"Diesel",c:"#4D8DFF"},h:{l:"Hybride",c:"#43E08B"},p:{l:"Hybride rechargeable",c:"#19B8A6"},b:{l:"Électrique",c:"#E45CFF"},g:{l:"GPL",c:"#A8E63C"}};
var SV={critique:{w:32,c:"#FF4D5E"},majeure:{w:18,c:"#FF7A3D"},"modérée":{w:9,c:"#FFAF2E"},mineure:{w:4,c:"#4D8DFF"},info:{w:0,c:"#25D4EE"}};
var FQ={"élevée":1.25,moyenne:1,faible:0.7};
var COLS=["brands","models","engines","faults","tsb"];
var FILES=[["brands","brands.json","Marques"],["models","models.json","Modèles"],["engines","engines.json","Motorisations"],["faults","faults.json","Pannes"],["tsb","tsb.json","TSB / Rappels"]];
function nsev(v){var k=nk(v),m={critique:"critique",critical:"critique",majeure:"majeure",major:"majeure",moderee:"modérée",moderate:"modérée",moyenne:"modérée",mineure:"mineure",minor:"mineure",faible:"mineure",info:"info",note:"info"};return m[k]||(SV[v]?v:"modérée");}
function nfreq(v){var k=nk(v),m={elevee:"élevée",high:"élevée",moyenne:"moyenne",medium:"moyenne",faible:"faible",low:"faible"};return m[k]||(FQ[v]?v:"moyenne");}
function nfuel(v){var k=nk(v),m={e:"e",essence:"e",petrol:"e",d:"d",diesel:"d",h:"h",hybride:"h",hybrid:"h",p:"p",phev:"p",rechargeable:"p",b:"b",ev:"b",electrique:"b",electric:"b",g:"g",gpl:"g"};return m[k]||(FU[k]?k:"e");}
var IVL=function(v){return v>=75?["CRITIQUE","#FF4D5E"]:v>=50?["ÉLEVÉ","#FF7A3D"]:v>=25?["MODÉRÉ","#FFAF2E"]:["FAIBLE","#43E08B"];};

var SEED=null,DB=null,AUDIT=[],UNDO=null,TESTS=[],IVIC={},MIDX={},BIDX={},EIDX={},IMPORT=null,FIXES=0,LASTSAVE=0,DIRTY=false,AUTOFILL=0;
var META={counts:{},links:0,corr:0,integ:{err:[],ok:true,pct:100},size:0,byBrand:{},pubRev:0,live:false};
var MODE=null,CH=null;
var GATE_MODE=null,GATE_SIG=null,GATE_PWD="",GATE_RENDERED=false;
var S={view:"bord",sel:{b:"",m:"",e:""},f:{q:"",fuel:[],y:[2017,YMAX],sort:"brand"},shown:48,
tech:{tab:"faults",q:"",sev:"",brand:"",model:"",phase:"",dom:"",km:""},adm:{tab:"files",mega:""},
calc:{km:60000,year:2021,sev:1},drawer:null,omni:{q:"",hits:[],idx:-1}};
window.MD_STATE=S;
var isAdmin=function(){return MODE==="admin";},isTier=function(){return MODE==="tier";};

function gateTyping(){var a=document.activeElement;return !!(a&&a.closest&&a.closest("#gate")&&/^(input|textarea)$/i.test(a.tagName));}
function gateSig(mode){return (mode||"root");}
if(WP&&!WP.__resizeGuarded){WP.__resizeGuarded=true;var _bresize=WP.resize;WP.resize=function(){if(gateTyping())return;return _bresize.call(WP);};}
if(window.MD_flushWP)window.MD_flushWP(deb(function(){if(MODE)safe("wp",function(){STORE.set(MODE==="admin"?KEY:TIERUI,JSON.stringify({wp:WP.P,prefs:PREF,ts:Date.now()}));},null);},400));

/* ══════════ COUVERTURE EXHAUSTIVE ══════════ */
function ensureCoverage(D){
  if(!D||!Array.isArray(D.models)||!Array.isArray(D.engines))return 0;
  if(!D.models.length||!D.engines.length)return 0;
  var mById={},covered={},used={},byBrand={},bySeg={},maxN=0,i,j;
  for(i=0;i<D.models.length;i++)mById[D.models[i].id]=D.models[i];
  for(i=0;i<D.engines.length;i++){var e=D.engines[i];used[e.id]=1;
    var em=/^E(\d+)$/.exec(String(e.id));if(em){var v=+em[1];if(v>maxN)maxN=v;}
    var refs=Array.isArray(e.m)?e.m:[];
    for(j=0;j<refs.length;j++){covered[refs[j]]=1;var dm=mById[refs[j]];
      if(dm){(byBrand[dm.b]=byBrand[dm.b]||[]).push(e);(bySeg[dm.seg]=bySeg[dm.seg]||[]).push(e);}}}
  var added=0;
  for(i=0;i<D.models.length;i++){var mo=D.models[i];if(covered[mo.id])continue;
    var pools=[byBrand[mo.b],bySeg[mo.seg],D.engines],pool=null;
    for(var p=0;p<pools.length;p++){if(pools[p]&&pools[p].length){pool=pools[p];break;}}if(!pool)continue;
    var best=null,bestSc=-1;
    for(j=0;j<pool.length;j++){var de=pool[j],dmm=mById[de.m[0]];
      var sc=(dmm&&dmm.b===mo.b?16:0)+(dmm&&dmm.seg===mo.seg?6:0)+(ov(de.y,mo.y)?4:0)+(dmm&&dmm.phase===mo.phase?2:0);
      if(sc>bestSc){bestSc=sc;best=de;}}
    if(!best)best=pool[0];
    maxN++;var nid="E"+String(maxN).padStart(4,"0");while(used[nid]){maxN++;nid="E"+String(maxN).padStart(4,"0");}used[nid]=1;
    var y0=Math.max(best.y[0],mo.y[0]),y1=Math.min(best.y[1],mo.y[1]);if(y0>y1){y0=mo.y[0];y1=mo.y[1];}
    D.engines.push({id:nid,m:[mo.id],code:best.code,fam:best.fam,label:best.label,fuel:best.fuel,disp:best.disp,hp:best.hp,nm:best.nm,kw:best.kw,y:[y0,y1],gb:best.gb,norm:best.norm,cyl:best.cyl,asp:best.asp,inj:best.inj,auto:1});
    covered[mo.id]=1;added++;AUTOFILL++;
    (byBrand[mo.b]=byBrand[mo.b]||[]).push(D.engines[D.engines.length-1]);(bySeg[mo.seg]=bySeg[mo.seg]||[]).push(D.engines[D.engines.length-1]);}
  return added;
}
function uncoveredModels(){return DB.models.filter(function(m){return !DB.engines.some(function(e){return e.m.indexOf(m.id)>-1;});});}

/* ══════════ NORMALISATION ══════════ */
function hardNormalize(D){
  var fixes=0,i,j;
  COLS.forEach(function(k){if(!Array.isArray(D[k])){D[k]=[];fixes++;}});
  var bUsed={},bMap={},nb=[];
  for(i=0;i<D.brands.length;i++){var b=D.brands[i];if(!b||!b.n){fixes++;continue;}
    var bid=String(b.id||("B-"+slug(b.n))).trim()||("B-"+slug(b.n));
    if(bUsed[bid]){var nbid=bid,q=2;while(bUsed[nbid])nbid=bid+"~"+(q++);bMap[b.id]=nbid;bid=nbid;fixes++;}
    bUsed[bid]=1;nb.push({id:bid,n:String(b.n),pays:String(b.pays||"—"),grp:String(b.grp||"—")});}
  D.brands=nb;var bSet={};for(i=0;i<nb.length;i++)bSet[nb[i].id]=1;
  var mUsed={},nm=[];
  for(i=0;i<D.models.length;i++){var m=D.models[i];if(!m||!m.n){fixes++;continue;}
    var mb=bMap[m.b]||m.b;
    if(!bSet[mb]){var nid="B-"+slug(String(mb||"import")),base=nid,q2=2;while(bSet[nid])nid=base+"~"+(q2++);
      D.brands.push({id:nid,n:String(mb||"Marque importée"),pays:"—",grp:"—"});bSet[nid]=1;bMap[mb]=nid;mb=nid;fixes++;}
    var mid=String(m.id||("M-"+slug(mb)+"-"+slug(m.n))).trim()||("M-"+slug(mb)+"-"+slug(m.n));
    if(mUsed[mid]){var nmid=mid,q3=2;while(mUsed[nmid])nmid=mid+"-"+(q3++);mid=nmid;fixes++;}
    mUsed[mid]=1;var my=Array.isArray(m.y)?m.y:[2017,YMAX];
    nm.push({id:mid,b:mb,n:String(m.n),y:[+my[0]||2017,+my[1]||YMAX],seg:String(m.seg||"Compacte"),phase:+m.phase||1});}
  D.models=nm;var mSet={};for(i=0;i<nm.length;i++)mSet[nm[i].id]=1;
  var eUsed={},ne=[],eMax=0;
  for(i=0;i<D.engines.length;i++){var em=/^E(\d+)$/.exec(String(D.engines[i].id));if(em){var vv=+em[1];if(vv>eMax)eMax=vv;}}
  for(i=0;i<D.engines.length;i++){var e=D.engines[i];if(!e||!e.code){fixes++;continue;}
    var refs=[],seenRef={},raw=Array.isArray(e.m)?e.m:[];
    for(j=0;j<raw.length;j++){var rr=raw[j];if(mSet[rr]&&!seenRef[rr]){seenRef[rr]=1;refs.push(rr);}}
    if(!refs.length){fixes++;continue;}
    var eid=String(e.id||"").trim();
    if(!eid||eUsed[eid]){eMax++;eid="E"+String(eMax).padStart(4,"0");while(eUsed[eid]){eMax++;eid="E"+String(eMax).padStart(4,"0");}fixes++;}
    eUsed[eid]=1;var ey=Array.isArray(e.y)?e.y:[2017,YMAX];
    ne.push({id:eid,m:refs,code:String(e.code),fam:String(e.fam||e.code),label:String(e.label||e.code),fuel:nfuel(e.fuel),
      disp:+e.disp||0,hp:+e.hp||100,nm:+e.nm||0,kw:+e.kw||Math.round((+e.hp||100)*0.7355),y:[+ey[0]||2017,+ey[1]||YMAX],
      gb:String(e.gb||"BVM"),norm:String(e.norm||"Euro 6"),cyl:String(e.cyl||"L4"),asp:String(e.asp||"Turbo"),inj:String(e.inj||"—"),auto:e.auto?1:0});}
  D.engines=ne;
  var fUsed={},nf=[];
  for(i=0;i<D.faults.length;i++){var f=D.faults[i];if(!f||!f.t){fixes++;continue;}
    var fid=String(f.id||"").trim();if(!fid||fUsed[fid]){fid="F"+String(nf.length+1).padStart(3,"0");while(fUsed[fid])fid=fid+"~"+(nf.length+1);fixes++;}
    fUsed[fid]=1;var fs=nsev(f.sev);if(fs!==f.sev)fixes++;var fq=nfreq(f.freq);if(fq!==f.freq)fixes++;
    nf.push({id:fid,t:String(f.t),fam:split(f.fam),mt:split(f.mt),ph:split(f.ph),sev:fs,freq:fq,
      y:Array.isArray(f.y)?f.y:[2017,YMAX],km:Array.isArray(f.km)?f.km:[0,200000],sym:split(f.sym),
      cause:String(f.cause||""),fix:String(f.fix||""),cost:Array.isArray(f.cost)?f.cost:[0,0],
      status:String(f.status||"Surveillance"),dom:String(f.dom||"Moteur"),fuel:""});}
  D.faults=nf;
  var tUsed={},nt=[];
  for(i=0;i<D.tsb.length;i++){var t=D.tsb[i];if(!t||!t.t){fixes++;continue;}
    var tid=String(t.id||"").trim();if(!tid||tUsed[tid]){tid="T"+String(nt.length+1).padStart(3,"0");while(tUsed[tid])tid=tid+"~"+(nt.length+1);fixes++;}
    tUsed[tid]=1;var ts=nsev(t.sev);if(ts!==t.sev)fixes++;
    var tb=split(t.b).map(function(x){return bMap[x]||x;}).filter(function(x){return bSet[x];});
    nt.push({id:tid,ref:String(t.ref||("TSB-"+tid)),b:tb,fam:split(t.fam),mt:split(t.mt),ph:split(t.ph),
      t:String(t.t),date:String(t.date||"2026-01").slice(0,7),cat:String(t.cat||"Moteur"),sev:ts,
      sum:String(t.sum||""),act:String(t.act||""),dom:String(t.dom||t.cat||"Moteur")});}
  D.tsb=nt;
  COLS.forEach(function(k){var used={};for(var a=0;a<D[k].length;a++){var x=D[k][a],id=String(x.id),n=2;
    while(used[id]){id=String(x.id)+"#"+(n++);fixes++;}x.id=id;used[id]=1;}});
  fixes+=ensureCoverage(D);return fixes;
}
function nextEngId(){var mx=0;DB.engines.forEach(function(e){var m=/^E(\d+)$/.exec(String(e.id));if(m){var v=+m[1];if(v>mx)mx=v;}});return "E"+String(mx+1).padStart(4,"0");}
function mkEng(id,mid,code,fam,label,fuel,disp,hp,nm,y0,y1,gb){
var cyl=fuel==="b"?"ÉLEC":(disp>=6000?"W12+":(disp>3400?"V8+":(disp>2400?"6 cyl.":(disp<1100?"L3":"L4"))));
return {id:id,m:[mid],code:code,fam:fam,label:label,fuel:fuel,disp:disp,hp:hp,nm:nm,kw:Math.round(hp*0.7355),y:[y0,y1],gb:gb,
norm:fuel==="b"?"ZE":(y0>=2024?"Euro 6e":(y0>=2020?"Euro 6d":"Euro 6")),cyl:cyl,asp:fuel==="b"?"—":"Turbo",inj:fuel==="b"?"—":(fuel==="d"?"Common Rail":"Injection directe"),auto:0};}
function build(R){
var D={brands:[],models:[],engines:[],faults:[],tsb:[]},usedMid={},n=0;
R.br.forEach(function(b){D.brands.push({id:b[0],n:b[1],pays:b[2],grp:b[3]});});
Object.keys(R.md).forEach(function(bid){R.md[bid].forEach(function(m){
  var srcKey=bid+"-"+slug(m[0]),id=srcKey,q=2;while(usedMid[id])id=srcKey+"-"+(q++);usedMid[id]=1;
  D.models.push({id:id,b:bid,n:m[0],y:[m[1],m[2]],seg:SEGS[m[3]]||"Compacte",phase:m[4]||1});
  (R.me[srcKey]||[]).forEach(function(e){n++;D.engines.push(mkEng("E"+String(n).padStart(4,"0"),id,e[0],e[1],e[2],nfuel(e[3]),e[4],e[5],e[6],e[8],e[9],e[7]));});});});
R.ft.forEach(function(f,i){D.faults.push({id:"F"+String(i+1).padStart(3,"0"),t:f[0],fam:split(f[1]),mt:split(f[2]),ph:split(f[3]),sev:nsev(f[4]),freq:nfreq(f[5]),y:[+f[6],+f[7]],km:[+f[8],+f[9]],sym:split(f[10]),cause:f[11],fix:f[12],cost:[+f[13],+f[14]],status:f[15],dom:f[16]||"Moteur",fuel:""});});
R.ts.forEach(function(t,i){D.tsb.push({id:"T"+String(i+1).padStart(3,"0"),ref:t[0],b:split(t[1]),fam:split(t[2]),mt:split(t[3]),ph:split(t[4]),t:t[5],date:t[6],cat:t[7],sev:nsev(t[8]),sum:t[9],act:t[10],dom:t[11]||t[7]});});
return D;}
function reindex(){MIDX={};BIDX={};EIDX={};DB.models.forEach(function(m){MIDX[m.id]=m;});DB.brands.forEach(function(b){BIDX[b.id]=b;});DB.engines.forEach(function(e){EIDX[e.id]=e;});}
function brandOf(e){var m=MIDX[e.m[0]];return m?BIDX[m.b]:null;}
function modelOf(e){return MIDX[e.m[0]];}
function engName(e){var m=modelOf(e),b=brandOf(e);return ((b?b.n:"")+" "+(m?m.n:"")+" — "+e.label).trim();}
function tokHit(l,n){if(!l||!l.length)return false;var s=nk(n);for(var i=0;i<l.length;i++){var t=nk(l[i]);if(t==="*")return true;if(t&&s.indexOf(t)>-1)return true;}return false;}
function fApply(f,e,m){if(!((f.fam||[]).indexOf(e.fam)>-1||tokHit(f.mt,m.n)))return false;
if(f.ph&&f.ph.length&&f.ph.indexOf("*")<0&&f.ph.indexOf(String(m.phase))<0)return false;return true;}
function tApply(t,e,m){if(!((t.fam||[]).indexOf(e.fam)>-1||tokHit(t.mt,m.n)||(t.b||[]).indexOf(m.b)>-1))return false;
if(t.ph&&t.ph.length&&t.ph.indexOf("*")<0&&t.ph.indexOf(String(m.phase))<0)return false;return true;}
function faultsFor(e){var m=modelOf(e);if(!m)return [];var o=[];DB.faults.forEach(function(f){if(!fApply(f,e,m))return;var g=clone(f);g.active=ov(f.y,e.y)&&ov(f.y,m.y);o.push(g);});
o.sort(function(a,b){var d=(b.active?1:0)-(a.active?1:0);return d!==0?d:SV[b.sev].w-SV[a.sev].w;});return o;}
function tsbFor(e){var m=modelOf(e);if(!m)return [];var o=[];DB.tsb.forEach(function(t){if(tApply(t,e,m))o.push(t);});o.sort(function(a,b){return b.date.localeCompare(a.date);});return o;}
function isRecall(t){return t.cat==="Rappel"||/^RPL-/.test(t.ref);}
function ivi(e){if(IVIC[e.id]!==undefined)return IVIC[e.id];var s=0,fs=faultsFor(e);
for(var i=0;i<fs.length;i++){var w=SV[fs[i].sev].w*(FQ[fs[i].freq]||1);s+=fs[i].active?w:w*0.25;}
s=clamp(Math.round(s),0,100);IVIC[e.id]=s;return s;}
function enginesForFault(f){return DB.engines.filter(function(e){var m=modelOf(e);return m&&fApply(f,e,m);});}
function enginesForTsb(t){return DB.engines.filter(function(e){var m=modelOf(e);return m&&tApply(t,e,m);});}
function integrity(){hardNormalize(DB);ensureCoverage(DB);reindex();
  var err=[],mi={},bi={},du=0;
  DB.models.forEach(function(m){mi[m.id]=1;});DB.brands.forEach(function(b){bi[b.id]=1;});
  COLS.forEach(function(k){var s={};DB[k].forEach(function(x){if(s[x.id])du++;s[x.id]=1;});});
  if(du)err.push(du+" id dupliqué(s)");
  DB.models.forEach(function(m){if(!bi[m.b])err.push("marque inconnue "+m.b);});
  DB.engines.forEach(function(e){e.m.forEach(function(i){if(!mi[i])err.push("moteur orphelin "+e.id);});});
  DB.faults.forEach(function(f){if(!SV[f.sev])err.push("sévérité "+f.sev);});
  var unc=uncoveredModels();if(unc.length)err.push(unc.length+" modèle(s) sans motorisation");
  return {err:err,ok:!err.length,pct:err.length?Math.max(0,100-err.length*7):100};}
function recompute(){FIXES+=hardNormalize(DB);ensureCoverage(DB);IVIC={};reindex();
var links=0,corr=0,bb={},doms={},fams={},i;
for(i=0;i<DB.engines.length;i++){var e=DB.engines[i],m=MIDX[e.m[0]];fams[e.fam]=1;links+=e.m.length;if(m)bb[m.b]=(bb[m.b]||0)+1;corr+=faultsFor(e).length+tsbFor(e).length;}
DB.faults.forEach(function(f){links+=f.fam.length;doms[f.dom]=1;});DB.tsb.forEach(function(t){links+=t.b.length+t.fam.length;doms[t.dom]=1;});
META.counts={b:DB.brands.length,m:DB.models.length,e:DB.engines.length,f:DB.faults.length,t:DB.tsb.length,rc:DB.tsb.filter(isRecall).length,fam:Object.keys(fams).length,dom:Object.keys(doms).length};
META.links=links;META.corr=corr;META.integ=integrity();META.size=Math.round(JSON.stringify(DB).length/1024);META.byBrand=bb;}

/* ══════════ CACHE TIERS (lecture seule + ouverture rapide) ══════════ */
function readTierData(){var raw=STORE.get(TIERDATA);if(!raw)return null;
  return safe("tierdata",function(){var d=JSON.parse(raw);return (d&&d.db&&d.db.engines&&d.db.engines.length)?d:null;},null);}
function writeTierData(rev){if(!DB||!DB.engines)return;safe("tierwrite",function(){STORE.set(TIERDATA,JSON.stringify({ts:Date.now(),rev:+rev||0,db:DB}));},null);}
function tierWriteUI(){safe("tierui",function(){STORE.set(TIERUI,JSON.stringify({ts:Date.now(),prefs:PREF,wp:WP.P,view:S.view}));},null);}
function restoreTierUI(){var raw=STORE.get(TIERUI);if(!raw)return;safe("tieruirestore",function(){var d=JSON.parse(raw);
  if(d.prefs)Object.keys(d.prefs).forEach(function(k){PREF[k]=d.prefs[k];});
  if(d.wp)Object.keys(d.wp).forEach(function(k){WP.P[k]=d.wp[k];});if(d.view)S.view=d.view;},null);}
function pullPublicSnapshot(){var raw=STORE.get(PKEY);if(!raw)return null;
  return safe("pull",function(){var d=JSON.parse(raw);return (d&&d.db&&d.db.engines&&d.db.engines.length)?d:null;},null);}

/* ══════════ SAUVEGARDE — écriture projet = admin seul ══════════ */
function saveNow(){
  if(isAdmin()){safe("save",function(){STORE.set(KEY,JSON.stringify({v:86,db:DB,audit:AUDIT.slice(-60),prefs:PREF,wp:WP.P,ts:Date.now()}));LASTSAVE=Date.now();DIRTY=false;updStor();},null);return;}
  if(isTier()){tierWriteUI();DIRTY=false;return;}
}
var save=deb(saveNow,350);window.MD_saveState=save;
function markDirty(){if(!MODE)return;DIRTY=true;save();}
function audit(t,m){AUDIT.push({ts:Date.now(),type:t,msg:m});if(AUDIT.length>120)AUDIT=AUDIT.slice(-120);}
function snapshot(l){UNDO={label:l,db:clone(DB)};}
function doUndo(){if(!isAdmin()||!UNDO)return;DB=UNDO.db;var l=UNDO.label;UNDO=null;mutate("imp","Annulation : "+l);toast("ok","Action annulée");}
function publish(auto){if(!isAdmin())return;var rev=(META.pubRev||0)+1;META.pubRev=rev;
  STORE.set(PKEY,JSON.stringify({ts:Date.now(),rev:rev,db:DB}));writeTierData(rev);bcast({t:"pub",rev:rev});
  if(!auto)toast("ok","Diffusé aux tiers","Révision "+rev+" — "+fmt(META.counts.e)+" motorisations.");}
function mutate(t,m){if(!isAdmin())return;recompute();audit(t,m);markDirty();if(META.live)publish(true);updateMeta();render();if(S.drawer)renderDrawer();}
function bcast(m){try{if(CH)CH.postMessage(m);}catch(e){}}

/* ══════════ FRAGMENTS ══════════ */
var sevTag=function(s){return "<span class='sev "+(s==="modérée"?"mode":esc(s))+"'>"+esc(s)+"</span>";};
var fuelTag=function(f){var x=FU[f]||{l:f,c:"#9FB2C8"};return "<span class='fuel' style='--fc:"+x.c+"'>"+x.l+"</span>";};
var iviPill=function(v){var l=IVL(v);return "<span class='ivp' style='--ic:"+l[1]+"'><i></i>IVI "+v+"</span>";};
function corrRow(e){var F=FU[e.fuel]||{c:"#FFD60A"},b=brandOf(e),m=modelOf(e);
return "<button class='corr' style='--fc:"+F.c+"' data-act='openEng' data-id='"+e.id+"'><div style='min-width:0'><b>"+esc((b?b.n:"")+" "+(m?m.n:""))+"</b><small>"+esc(e.label)+" · "+esc(e.code)+" · "+e.y[0]+"-"+e.y[1]+"</small></div><span class='hp'>"+e.hp+"<small style='font-size:9px'> ch</small></span></button>";}
function faultCard(f,hist,full){var c=SV[f.sev].c,h="";
h+="<div class='fcard' style='--sc:"+c+";"+(hist?"opacity:.62":"")+"'><div class='fh'><b>"+esc(f.t)+"</b>"+sevTag(f.sev)+"</div>";
h+="<div class='tags'><span class='tag'>"+esc(f.dom)+"</span><span class='tag'>"+f.y[0]+"-"+f.y[1]+"</span><span class='tag'>"+fmt(f.km[0])+"–"+fmt(f.km[1])+" km</span><span class='tag'>fréq. "+esc(f.freq)+"</span>";
if(f.ph&&f.ph.length)h+="<span class='tag'>phase "+esc(f.ph.join("/"))+"</span>";
if(hist)h+="<span class='tag'>HORS PÉRIODE</span>";
h+="<span class='tag' style='color:#25D4EE'>"+esc(f.status)+"</span></div>";
if(f.sym.length){h+="<div class='tags'>";f.sym.forEach(function(s){h+="<span class='tag'>"+ic("act","width:10px;height:10px;color:#FFAF2E")+esc(s)+"</span>";});h+="</div>";}
h+="<p><b>Cause :</b> "+esc(f.cause)+"</p><p><b>Action :</b> "+esc(f.fix)+"</p>";
h+="<div class='cost'>"+ic("euro","width:13px;height:13px")+(f.cost[1]===0?"Prise en charge / campagne":fmt(f.cost[0])+" – "+fmt(f.cost[1])+" €")+"</div>";
if(!full)h+="<div style='margin-top:8px'><button class='btn xs ghost' data-act='openFault' data-id='"+f.id+"'>"+ic("chev","width:11px;height:11px")+"Détail & motorisations</button></div>";
return h+"</div>";}
function tsbCard(t,full){var rc=isRecall(t),h="";
h+="<div class='tsb"+(rc?" rc":"")+"'><div style='display:flex;gap:7px;align-items:center;flex-wrap:wrap'><span class='ref'>"+esc(t.ref)+"</span>"+sevTag(t.sev);
h+="<span class='tag'>"+(rc?ic("bell","width:10px;height:10px;color:#FFD60A"):"")+esc(t.cat)+"</span><span class='tag mono'>"+esc(t.date)+"</span>";
if(t.ph&&t.ph.length)h+="<span class='tag'>phase "+esc(t.ph.join("/"))+"</span>";
h+="</div><b>"+esc(t.t)+"</b><p>"+esc(t.sum)+"</p><div class='act'><b style='font-size:11px;color:"+(rc?"#FFD60A":"#4D8DFF")+"'>ACTION :</b> "+esc(t.act)+"</div>";
if(!full)h+="<div style='margin-top:8px'><button class='btn xs ghost' data-act='openTsb' data-id='"+t.id+"'>"+ic("chev","width:11px;height:11px")+"Périmètre</button></div>";
return h+"</div>";}
function mountAnim(sc){$$(".brow .bt i",sc).forEach(function(i){i.style.width=i.dataset.w;});}

/* ══════════ RECHERCHE ══════════ */
var SYN={puretech:["eb2"],hdi:["dv5","dw10"],bluehdi:["dv5","dw10"],tsi:["ea211","ea888","dpca"],tdi:["ea288","dsua"],tce:["h4dt","h5ht","hr12"],dci:["k9k","m9r","r9m"],courroie:["courroie","distribution"],chaine:["chaine","aac"],adblue:["adblue","scr","nox"],scr:["scr","nox"],egr:["egr"],fap:["fap","dpf"],turbo:["turbo"],rappel:["rappel"],tsb:["tsb","bulletin"],panne:["panne"],eat8:["eat8"],dsg:["dq200","dq381"],zf8:["zf8"],frein:["frein","freinage"],clim:["clim"],batterie:["batterie","12v"],ecran:["ecran","bsi"],iccu:["e-gmp","iccu"]};
function score(qn,hay){var h=nk(hay);if(!qn)return 0;if(h===qn)return 120;if(h.indexOf(qn)===0)return 95;if(h.indexOf(qn)>-1)return 70;
var i=0,j=0;while(i<qn.length&&j<h.length){if(qn[i]===h[j])i++;j++;}return i===qn.length?34:0;}
function omniSearch(q){var qn=nk(q),raw=String(q).toLowerCase().split(/[\s,;]+/).filter(Boolean),syn=[],i,j;
raw.forEach(function(w){var k=nk(w);if(SYN[k])syn=syn.concat(SYN[k]);});
var wR=qn.indexOf("rappel")>-1,wT=qn.indexOf("tsb")>-1,wF=qn.indexOf("panne")>-1,hits=[],famSet={},brandSet={};
DB.engines.forEach(function(e){var b=brandOf(e),m=modelOf(e),hay=[(b?b.n:""),(m?m.n:""),"phase "+(m?m.phase:""),e.code,e.fam,e.label].join(" "),sc=score(qn,hay);
if(!sc&&syn.length)for(j=0;j<syn.length;j++)if(nk(e.fam).indexOf(nk(syn[j]))>-1||nk(e.code).indexOf(nk(syn[j]))>-1){sc=62;break;}
if(sc>0){famSet[e.fam]=1;if(m)brandSet[m.b]=1;hits.push({kind:"engine",id:e.id,score:sc+6,title:engName(e),sub:e.code+" · "+e.hp+" ch · phase "+(m?m.phase:1),color:FU[e.fuel].c,badge:"MOTEUR"});}});
DB.faults.forEach(function(f){var hay=f.t+" "+f.fam.join(" ")+" "+f.mt.join(" ")+" "+f.cause+" "+f.sym.join(" ")+" "+f.dom,sc=score(qn,hay);
if(!sc)for(j=0;j<f.fam.length;j++)if(famSet[f.fam[j]]){sc=66;break;}
if(!sc&&syn.length)for(j=0;j<syn.length;j++)if(nk(hay).indexOf(nk(syn[j]))>-1){sc=58;break;}
if(sc>0)hits.push({kind:"fault",id:f.id,score:sc+(wF?26:0)+SV[f.sev].w*0.6,title:f.t,sub:f.sev+" · "+f.dom+" · "+fmt(f.km[0])+"-"+fmt(f.km[1])+" km",color:SV[f.sev].c,badge:"PANNE"});});
DB.tsb.forEach(function(t){var rc=isRecall(t),hay=t.t+" "+t.ref+" "+t.fam.join(" ")+" "+t.mt.join(" ")+" "+t.sum+" "+t.cat,sc=score(qn,hay);
if(!sc)for(j=0;j<t.fam.length;j++)if(famSet[t.fam[j]]){sc=64;break;}
if(!sc)for(j=0;j<t.b.length;j++)if(brandSet[t.b[j]]){sc=48;break;}
if(!sc&&syn.length)for(j=0;j<syn.length;j++)if(nk(hay).indexOf(nk(syn[j]))>-1){sc=56;break;}
if(sc>0)hits.push({kind:"tsb",id:t.id,score:sc+(wR&&rc?34:(wT&&!rc?30:0))+(rc?12:0)+SV[t.sev].w*0.5,title:t.t,sub:t.ref+" · "+t.date+" · "+t.cat,color:rc?"#FFD60A":"#4D8DFF",badge:rc?"RAPPEL":"TSB"});});
DB.models.forEach(function(m){var b=BIDX[m.b],sc=score(qn,(b?b.n+" ":"")+m.n+" phase "+m.phase);
if(sc>0)hits.push({kind:"model",id:m.id,score:sc+4,title:(b?b.n+" ":"")+m.n,sub:"phase "+m.phase+" · "+m.seg+" · "+m.y[0]+"-"+m.y[1],color:"#4D8DFF",badge:"MODÈLE"});});
DB.brands.forEach(function(b){var sc=score(qn,b.n+" "+b.pays);if(sc>0)hits.push({kind:"brand",id:b.id,score:sc,title:b.n,sub:b.pays+" · "+b.grp,color:"#25D4EE",badge:"MARQUE"});});
hits.sort(function(a,b){return b.score-a.score;});var seen={},out=[];
for(i=0;i<hits.length&&out.length<16;i++){var k=hits[i].kind+":"+hits[i].id;if(seen[k])continue;seen[k]=1;out.push(hits[i]);}return out;}
function hl(text,q){var n=String(q||"").trim();if(!n)return esc(text);var i=String(text).toLowerCase().indexOf(n.toLowerCase());if(i<0)return esc(text);
return esc(String(text).slice(0,i))+"<mark>"+esc(String(text).slice(i,i+n.length))+"</mark>"+esc(String(text).slice(i+n.length));}
function omniRender(){var box=$("#omnires");if(!box)return;var q=S.omni.q;
if(!q||q.trim().length<2){var seeds=["3008 courroie","3008 rappel","1.5 BlueHDi chaine","AdBlue SCR","EGR FAP","EAT8 à-coups","Ioniq 5 ICCU","pompe à vide"];
var h="<div class='grp'>RECHERCHE PRÉDICTIVE — PANNES · RAPPELS · TSB · PHASES</div><div class='hint'>";
seeds.forEach(function(s){h+="<button data-act='omniSeed' data-q='"+esc(s)+"'>"+esc(s)+"</button>";});box.innerHTML=h+"</div>";box.classList.add("on");return;}
var hits=omniSearch(q);S.omni.hits=hits;S.omni.idx=hits.length?0:-1;
if(!hits.length){box.innerHTML="<div class='grp'>AUCUN RÉSULTAT POUR « "+esc(q)+" »</div>";box.classList.add("on");return;}
var order=["fault","tsb","engine","model","brand"],lab={fault:"PANNES CONNUES",tsb:"CAMPAGNES DE RAPPEL / TSB",engine:"MOTORISATIONS",model:"MODÈLES",brand:"MARQUES"},html="";
order.forEach(function(kind){var grp=hits.filter(function(x){return x.kind===kind;});if(!grp.length)return;
html+="<div class='grp'>"+lab[kind]+" · "+grp.length+"</div>";
grp.forEach(function(it){var gi=hits.indexOf(it);
html+="<button class='hit"+(gi===S.omni.idx?" sel":"")+"' data-act='omniHit' data-kind='"+it.kind+"' data-id='"+esc(it.id)+"'><span class='k' style='color:"+it.color+"'>"+it.badge+"</span><span class='tx'><b>"+hl(it.title,q)+"</b><small>"+esc(it.sub)+"</small></span>"+ic("chev","width:12px;height:12px;color:#61748C")+"</button>";});});
box.innerHTML=html;box.classList.add("on");}
function omniClose(){var b=$("#omnires");if(b)b.classList.remove("on");S.omni.idx=-1;}
function omniActivate(kind,id){omniClose();var inp=$("#omni");if(inp)inp.blur();
if(kind==="engine"||kind==="fault"||kind==="tsb")openDrawer(kind,id,!!S.drawer);
else if(kind==="model"){var m=MIDX[id];if(m){S.sel.b=m.b;S.sel.m=m.id;S.sel.e="";location.hash="#/explorer";render();}beep("tick");}
else{S.sel.b=id;S.sel.m="";S.sel.e="";location.hash="#/explorer";render();beep("tick");}}
function omniMove(d){var box=$("#omnires");if(!box||!box.classList.contains("on"))return;var els=$$(".hit",box);if(!els.length)return;
S.omni.idx=clamp(S.omni.idx+d,0,els.length-1);els.forEach(function(el,i){el.classList.toggle("sel",i===S.omni.idx);});els[S.omni.idx].scrollIntoView({block:"nearest"});}

/* ══════════ DRAWER ══════════ */
function openDrawer(type,id,push){if(S.drawer&&push)S.drawer.hist.push({type:S.drawer.type,id:S.drawer.id,tab:S.drawer.tab});else if(!S.drawer)S.drawer={hist:[]};
S.drawer.type=type;S.drawer.id=id;S.drawer.tab=type==="engine"?"fiche":"main";renderDrawer();document.body.classList.add("lock");
requestAnimationFrame(function(){$("#dr").classList.add("on");});beep("open");}
function closeDrawer(){var r=$("#dr");if(!r.innerHTML)return;r.classList.remove("on");S.drawer=null;if(!modalOpenFn())document.body.classList.remove("lock");
setTimeout(function(){if(!S.drawer)r.innerHTML="";},320);beep("close");}
function renderDrawer(){if(!S.drawer)return;var d=S.drawer,head="",tabs="",body="",i;
if(d.type==="engine"){var e=EIDX[d.id];if(!e){closeDrawer();return;}
var b=brandOf(e),m=modelOf(e),F=FU[e.fuel]||{c:"#FFD60A"},fs=faultsFor(e),ts=tsbFor(e),rc=ts.filter(isRecall),v=ivi(e),L=IVL(v),pl=buildPlan(e,m,b);
head="<div class='dh' style='--fc:"+F.c+"'><div class='row'>"+(d.hist.length?"<button class='tb' data-act='drback'>"+ic("back")+"</button>":"")+"<span class='tag mono'>"+esc(b?b.n:"—")+"</span>"+fuelTag(e.fuel)+"<span class='tag'>"+esc(m?m.n:"")+" · phase "+(m?m.phase:1)+"</span>";
if(rc.length)head+="<span class='tag' style='color:#FFD60A'>"+ic("bell","width:10px;height:10px")+rc.length+" rappel(s)</span>";
head+="<button class='tb x' data-act='drclose'>"+ic("x")+"</button></div><h2>"+esc(e.label)+"</h2><div class='sub mono'>"+esc(e.code)+" · "+e.y[0]+"-"+e.y[1]+" · "+e.hp+" ch / "+e.kw+" kW · "+e.nm+" Nm</div></div>";
var dt=[["fiche","Fiche","piston"],["pannes","Pannes","alert",fs.length],["tsb","TSB","file",ts.length],["plan","Entretien","wrench"],["corr","Corrélations","spark"]];
tabs="<div class='dtabs'>";dt.forEach(function(t){tabs+="<button class='dt "+(d.tab===t[0]?"on":"")+"' data-act='drtab' data-t='"+t[0]+"'>"+ic(t[2],"width:13px;height:13px")+t[1]+(t[3]!==undefined?"<span class='n'>"+t[3]+"</span>":"")+"</button>";});tabs+="</div>";
if(d.tab==="fiche"){body="<div class='sg'>";
[["Code moteur",e.code],["Famille",e.fam],["Cylindrée",e.disp?fmt(e.disp)+" cm³":"—"],["Architecture",e.cyl],["Puissance",e.hp+" ch / "+e.kw+" kW"],["Couple",e.nm+" Nm"],["Suralimentation",e.asp],["Injection",e.inj],["Norme",e.norm],["Boîte",e.gb],["Production",e.y[0]+" → "+e.y[1]],["Énergie",FU[e.fuel].l],["Modèle",m?m.n:"—"],["Phase modèle",m?m.phase:"—"],["Segment",m?m.seg:"—"],["IVI",v+" / 100 · "+L[0]]].forEach(function(r){body+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";});
body+="</div><div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:13px'><button class='btn sm pri' data-act='selEng' data-id='"+e.id+"'>"+ic("wrench")+"Plan d'entretien précis</button>";
if(isAdmin())body+="<button class='btn sm ghost' data-act='expEng' data-id='"+e.id+"'>"+ic("dl")+"Exporter</button>";body+="</div>";}
else if(d.tab==="pannes")body=fs.length?fs.map(function(f){return faultCard(f,!f.active,false);}).join(""):"<div class='empty'>"+ic("check")+"<p>Aucune panne référencée.</p></div>";
else if(d.tab==="tsb")body=ts.length?ts.map(function(t){return tsbCard(t,false);}).join(""):"<div class='empty'>"+ic("file")+"<p>Aucun bulletin corrélé.</p></div>";
else if(d.tab==="plan")body=planHTML(pl,true);
else{var same=DB.engines.filter(function(x){return x.fam===e.fam&&x.id!==e.id;});
body="<div class='card panel'><h3>"+ic("spark")+"Famille "+esc(e.fam)+" — "+same.length+" autre(s)</h3>"+(same.length?same.slice(0,24).map(corrRow).join(""):"<p class='dim'>Première motorisation de cette famille.</p>")+"</div>";}}
else if(d.type==="fault"){var f=null;for(i=0;i<DB.faults.length;i++)if(DB.faults[i].id===d.id)f=DB.faults[i];if(!f){closeDrawer();return;}
var af=enginesForFault(f);
head="<div class='dh' style='--fc:"+SV[f.sev].c+"'><div class='row'>"+(d.hist.length?"<button class='tb' data-act='drback'>"+ic("back")+"</button>":"")+sevTag(f.sev)+"<span class='tag'>"+esc(f.dom)+"</span><button class='tb x' data-act='drclose'>"+ic("x")+"</button></div><h2>"+esc(f.t)+"</h2><div class='sub mono'>"+f.y[0]+"-"+f.y[1]+" · "+fmt(f.km[0])+"–"+fmt(f.km[1])+" km</div></div>";
body=faultCard(f,false,true)+"<div class='card panel' style='margin-top:12px'><h3>"+ic("car")+"Motorisations corrélées<span class='chip'>"+af.length+"</span></h3>"+(af.length?af.slice(0,30).map(corrRow).join(""):"<p class='dim'>Aucune.</p>")+(af.length>30?"<p class='dim mono' style='font-size:10px'>+ "+(af.length-30)+" autres…</p>":"")+"</div>";}
else{var t=null;for(i=0;i<DB.tsb.length;i++)if(DB.tsb[i].id===d.id)t=DB.tsb[i];if(!t){closeDrawer();return;}
var at=enginesForTsb(t);
head="<div class='dh' style='--fc:"+(isRecall(t)?"#FFD60A":"#4D8DFF")+"'><div class='row'>"+(d.hist.length?"<button class='tb' data-act='drback'>"+ic("back")+"</button>":"")+"<span class='tag mono'>"+esc(t.ref)+"</span>"+sevTag(t.sev)+"<button class='tb x' data-act='drclose'>"+ic("x")+"</button></div><h2>"+esc(t.t)+"</h2><div class='sub mono'>"+esc(t.date)+" · "+esc(t.cat)+"</div></div>";
body=tsbCard(t,true)+"<div class='card panel' style='margin-top:12px'><h3>"+ic("car")+"Périmètre corrélé<span class='chip'>"+at.length+"</span></h3>"+(at.length?at.slice(0,30).map(corrRow).join(""):"<p class='dim'>Aucun.</p>")+"</div>";}
$("#dr").innerHTML="<div class='sc' data-act='drclose'></div><aside class='dw'>"+head+tabs+"<div class='db'>"+body+"</div><div class='dfoot'>SYNTHÈSE INGÉNIEUR — CONFIRMER AU VIN</div></aside>";mountAnim($("#dr"));}

/* ══════════ PLAN 200 000 km (garantit un point à 200 000) ══════════ */
function svcFor(e){var L=RAW.svc,i,j;
for(i=0;i<L.length;i++){var s=L[i];if(s.fams.indexOf("*")>-1)continue;for(j=0;j<s.fams.length;j++)if(s.fams[j]===e.fam)return s;}
for(i=0;i<L.length;i++)if(L[i].fams.indexOf("*")>-1&&L[i].fuel===e.fuel)return L[i];
for(i=0;i<L.length;i++)if(L[i].fuel===e.fuel)return L[i];return L[0];}
function buildPlan(e,m,b){var s=svcFor(e),base=Math.max(1,s.base||15000),mo=s.months||12,v=[],km,i,j,an=Math.max(8000,Math.round(base*(12/Math.max(1,mo))));
for(km=base;km<=KMMAX;km+=base){var ops=[],ct=[];
for(i=0;i<s.items.length;i++){var it=s.items[i];
if(it[1]>0){if(km%it[1]===0)ops.push(it[0]);}
else if(it[2]>0){var due=Math.round(an*it[2]/12);if(due>0&&km%Math.max(base,Math.round(due/base)*base)===0)ops.push(it[0]+" (échéance "+it[2]+" mois)");}}
if(s.dist&&s.dist[1]>0&&km>=s.dist[1]&&km-s.dist[1]<base)ops.push(s.dist[0]+" — REMPLACEMENT ("+fmt(s.dist[1])+" km / "+s.dist[2]+" mois)");
if(!ops.length)ops.push("Révision intermédiaire constructeur");
for(j=0;j<(s.controls||[]).length;j++)ct.push(s.controls[j]);
v.push({km:km,mo:Math.round(km/an*12),ops:ops,ctrl:ct});}
if(!v.length||v[v.length-1].km<KMMAX)v.push({km:KMMAX,mo:Math.round(KMMAX/an*12),ops:["Révision complète "+fmt(KMMAX)+" km"],ctrl:(s.controls||[]).slice()});
v.sort(function(a,b2){return a.km-b2.km;});
return {svc:s,visits:v,base:base,months:mo,annual:an,brand:b,model:m,engine:e};}
function planHTML(pl,compact){var s=pl.svc,e=pl.engine,m=pl.model,b=pl.brand,h="",i,j,fl=s.fluids||[];
h+="<div class='selcard'><h3>"+ic("car","width:16px;height:16px")+" "+esc((b?b.n:"")+" "+(m?m.n:""))+" · "+esc(e.label)+"</h3><div class='sg'>";
[["Phase",m?m.phase:"—"],["Code moteur",e.code],["Puissance",e.hp+" ch"],["Boîte",e.gb],["Production",e.y[0]+"-"+e.y[1]],["Intervalle",fmt(pl.base)+" km / "+pl.months+" mois"]].forEach(function(r){h+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";});
h+="</div></div><div class='oil'><div class='oc'><span>"+ic("oil","width:11px;height:11px")+"HUILE</span><b>"+esc(s.oil[0])+"</b><p>"+(s.oil[1]?s.oil[1]+" L · ":"")+esc(e.fam)+"</p></div>";
h+="<div class='oc b'><span>"+ic("piston","width:11px;height:11px")+"DISTRIBUTION</span><b>"+esc(s.dist[0])+"</b><p>"+(s.dist[1]?fmt(s.dist[1])+" km"+(s.dist[2]?" / "+s.dist[2]+" mois":""):"Chaîne — sans remplacement programmé")+"</p></div></div>";
h+="<div class='sg' style='margin-bottom:12px'>"+[["Liquide de freins",fl[0]],["Refroidissement",fl[1]],["Couple roues",fl[2]+" Nm"],["Pression pneus",(fl[3]||"")+" / "+(fl[4]||"")+" bar"],["Fluide clim",fl[5]],["Batterie 12V",fl[6]]].map(function(r){return "<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";}).join("")+"</div>";
h+="<div class='tw' style='max-height:"+(compact?"380px":"none")+";overflow:auto'><table class='vtab'><thead><tr><th>Kilométrage</th><th>Échéance</th><th>Interventions</th><th>Contrôles systématiques</th></tr></thead><tbody>";
for(i=0;i<pl.visits.length;i++){var v=pl.visits[i];h+="<tr><td class='km'>"+fmt(v.km)+" km</td><td class='ct'>"+v.mo+" mois</td><td><ul>";
for(j=0;j<v.ops.length;j++)h+="<li>"+esc(v.ops[j])+"</li>";h+="</ul></td><td class='ct'>"+esc((v.ctrl||[]).join(" · "))+"</td></tr>";}
h+="</tbody></table></div><p class='dim mono' style='font-size:9.5px;margin-top:9px'>PLAN COMPLET JUSQU'À 200 000 KM — CARNET CONSTRUCTEUR PRIORITAIRE.</p>";return h;}
function dueHTML(pl){var km=clamp(+S.calc.km||0,0,400000),yr=clamp(+S.calc.year||2021,2005,YMAX),sev=+S.calc.sev||1;
var now=new Date(),age=Math.max(1,(now.getFullYear()-yr)*12+now.getMonth()),rows=[],s=pl.svc,i;
var base=Math.round(pl.base*sev),next=Math.max(base,Math.ceil((km+1)/base)*base),rem=next-km;
rows.push({op:"Révision "+fmt(next)+" km",u:rem/base,badge:rem<=1500?"ÉCHÉANCE PROCHE":(rem<=base*0.2?"BIENTÔT":"DANS "+fmt(rem)+" KM"),cls:rem<=1500?"now":(rem<=base*0.2?"soon":"ok"),pct:clamp((base-rem)/base*100,0,100),detail:"Prochaine révision à "+fmt(next)+" km"});
for(i=0;i<(s.items||[]).length;i++){var it=s.items[i];if(it[1]<=0||it[1]<=base)continue;
var ik=Math.round(it[1]*sev),nx=Math.max(ik,Math.ceil((km+1)/ik)*ik),rm=nx-km;
rows.push({op:it[0],u:rm/ik,badge:rm<=1500?"À FAIRE":(rm<=ik*0.2?"BIENTÔT":"DANS "+fmt(rm)+" KM"),cls:rm<=1500?"now":(rm<=ik*0.2?"soon":"ok"),pct:clamp((ik-rm)/ik*100,0,100),detail:"Échéance "+fmt(nx)+" km"});}
if(s.dist&&s.dist[1]>0){var dk=s.dist[1],dr=dk-km;rows.push({op:"Distribution : "+s.dist[0],u:Math.max(0,dr)/dk,badge:dr<=0?"DÉPASSÉ":(dr<=10000?"À PLANIFIER":"DANS "+fmt(Math.max(0,dr))+" KM"),cls:dr<=0?"now":(dr<=10000?"soon":"ok"),pct:clamp(km/dk*100,0,100),detail:"Remplacement à "+fmt(dk)+" km / "+s.dist[2]+" mois"});}
var bf=Math.ceil(age/24)*24,br=bf-age;
rows.push({op:"Liquide de freins",u:br/24,badge:br<=1?"À FAIRE":(br<=3?"BIENTÔT":"DANS "+br+" MOIS"),cls:br<=1?"now":(br<=3?"soon":"ok"),pct:clamp((24-br)/24*100,0,100),detail:"Échéance temporelle 24 mois"});
rows.sort(function(a,b){return a.u-b.u;});var h="";
rows.forEach(function(r){var dc=r.cls==="now"?"#FF4D5E":(r.cls==="soon"?"#FFAF2E":"#43E08B");
h+="<div class='drow' style='--dc:"+dc+"'><div class='dr1'><b>"+esc(r.op)+"</b><span class='dbadge "+r.cls+"'>"+r.badge+"</span></div><div class='pb'><i style='width:"+Math.round(r.pct)+"%'></i></div><div class='dim mono' style='font-size:9.5px;margin-top:5px'>"+esc(r.detail)+"</div></div>";});
return h;}

/* ══════════ VUES ══════════ */
function selEngine(){return S.sel.e?EIDX[S.sel.e]:null;}
function modelsOfBrand(b){return DB.models.filter(function(m){return m.b===b;}).sort(function(a,b2){return a.n.localeCompare(b2.n);});}
function enginesOfModel(mid){return DB.engines.filter(function(e){return e.m.indexOf(mid)>-1;}).sort(function(a,b){return a.hp-b.hp;});}
function results(){var f=S.f,q=f.q.trim().toLowerCase();
var l=DB.engines.filter(function(e){var m=modelOf(e),b=brandOf(e);
if(S.sel.b&&(!m||m.b!==S.sel.b))return false;if(S.sel.m&&e.m.indexOf(S.sel.m)<0)return false;if(S.sel.e&&e.id!==S.sel.e)return false;
if(f.fuel.length&&f.fuel.indexOf(e.fuel)<0)return false;if(!ov(e.y,f.y))return false;
if(q){var hay=[(b?b.n:""),(m?m.n:""),e.code,e.fam,e.label].join(" ").toLowerCase();if(hay.indexOf(q)<0)return false;}return true;});
var so={brand:function(a,b){var x=brandOf(a),y=brandOf(b);return ((x?x.n:"")).localeCompare(y?y.n:"")||b.hp-a.hp;},hpdesc:function(a,b){return b.hp-a.hp;},year:function(a,b){return b.y[0]-a.y[0];},ivi:function(a,b){return ivi(b)-ivi(a);}};
return l.sort(so[f.sort]||so.brand);}
function engCard(e){var F=FU[e.fuel],b=brandOf(e),m=modelOf(e),v=ivi(e),nf=faultsFor(e).filter(function(f){return f.sev!=="info";}).length,ts=tsbFor(e),nr=ts.filter(isRecall).length;
var h="<article class='card hov eng' style='--fc:"+F.c+"' data-act='openEng' data-id='"+e.id+"' tabindex='0'><div class='top'><span class='br'>"+esc(b?b.n:"—")+"</span>"+fuelTag(e.fuel)+"<span class='tag' style='margin-left:auto'>phase "+(m?m.phase:1)+"</span></div>";
h+="<h4>"+esc(m?m.n:"")+"</h4><div class='lbl'>"+esc(e.label)+"</div><div class='pw'><b>"+e.hp+"</b><span>ch · "+e.kw+" kW</span><span style='margin-left:auto'>"+e.nm+" Nm</span></div>";
h+="<div class='meta'><span class='tag mono'>"+esc(e.code)+"</span><span class='tag'>"+e.y[0]+"-"+e.y[1]+"</span><span class='tag'>"+esc(e.gb)+"</span>";
if(nr)h+="<span class='tag' style='color:#FFD60A'>"+ic("bell","width:9px;height:9px")+nr+"</span>";
h+="</div><div class='ft'><span>"+ic("alert","width:12px;height:12px;color:"+(nf?"#FFAF2E":"#61748C"))+" "+nf+"</span><span>"+ic("file","width:12px;height:12px;color:"+(ts.length?"#4D8DFF":"#61748C"))+" "+ts.length+"</span>"+iviPill(v)+"</div></article>";return h;}
function vBord(){var c=META.counts,h="";
h+="<div class='hero'><span class='kick'>MODULE 01 — POSTE DE BORD</span><h2>BASE EXPERT <i>2017 → 2027</i><br>"+fmt(c.b)+" marques · "+fmt(c.m)+" modèles · "+fmt(c.e)+" motorisations</h2>";
h+="<p>"+fmt(c.f)+" pannes détaillées, "+fmt(c.t)+" bulletins dont <b style='color:#FFD60A'>"+fmt(c.rc)+" campagnes de rappel</b>, "+c.dom+" domaines techniques, plans d'entretien jusqu'à 200 000 km. Couverture motorisations : 100 %. "+(isTier()?"<b style='color:#25D4EE'>Session tiers : consultation seule.</b>":"")+"</p>";
h+="<div class='hint' style='padding:9px 0 0;position:relative'>";["3008 courroie","3008 rappel","1.5 BlueHDi chaine","AdBlue SCR","EGR FAP","EAT8 à-coups","Ioniq 5 ICCU","pompe à vide"].forEach(function(s){h+="<button data-act='omniSeed' data-q='"+esc(s)+"'>"+ic("search","width:9px;height:9px")+esc(s)+"</button>";});h+="</div>";
h+="<div class='acts'><a class='btn pri' href='#/explorer'>"+ic("car")+"Sélection précise du parc</a><button class='btn grn' data-act='goDiag'>"+ic("stetho")+"Autovérification</button>";
if(isAdmin())h+="<button class='btn' data-act='goAdmin'>"+ic("db")+"Administration</button>";
h+="<a class='btn' href='#/studio'>"+ic("spark")+"Studio fond</a></div></div>";
var kp=[["db","MARQUES",c.b,"#25D4EE"],["car","MODÈLES",c.m,"#4D8DFF"],["piston","MOTORISATIONS",c.e,"#E45CFF"],["alert","PANNES",c.f,"#FF4D5E"],["bell","RAPPELS",c.rc,"#FFD60A"],["wrench","DOMAINES",c.dom,"#43E08B"]];
h+="<div class='kpis'>";kp.forEach(function(k){h+="<div class='card kpi' style='--kc:"+k[3]+"'>"+ic(k[0])+"<b>"+fmt(k[2])+"</b><span>"+k[1]+"</span></div>";});h+="</div>";
var fc=Object.keys(FU).map(function(f){return {f:f,n:DB.engines.filter(function(e){return e.fuel===f;}).length};}).filter(function(x){return x.n;});
var mx=Math.max.apply(null,fc.map(function(x){return x.n;}).concat([1]));
h+="<div class='g2'><div class='card panel'><h3>"+ic("piston")+"Énergies du parc<span class='chip'>"+fmt(c.e)+"</span></h3><div class='bars'>";
fc.forEach(function(x){h+="<div class='brow'><span class='bl'>"+FU[x.f].l+"</span><div class='bt'><i data-w='"+Math.round(x.n/mx*100)+"%' style='--bc:"+FU[x.f].c+"'></i></div><b>"+fmt(x.n)+"</b></div>";});h+="</div></div>";
var sc=Object.keys(SV).map(function(s){return {s:s,n:DB.faults.filter(function(f){return f.sev===s;}).length};}),sm=Math.max.apply(null,sc.map(function(x){return x.n;}).concat([1]));
h+="<div class='card panel'><h3>"+ic("alert")+"Sévérité des pannes</h3><div class='bars'>";
sc.forEach(function(x){h+="<div class='brow'><span class='bl'>"+x.s.toUpperCase()+"</span><div class='bt'><i data-w='"+Math.round(x.n/sm*100)+"%' style='--bc:"+SV[x.s].c+"'></i></div><b>"+x.n+"</b></div>";});h+="</div></div></div>";
var al=DB.faults.filter(function(f){return f.sev==="critique";}).slice(0,5),rc=DB.tsb.filter(isRecall).sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,5);
h+="<div class='g2'><div class='card panel'><h3>"+ic("alert","color:#FF4D5E")+"Alertes prioritaires</h3><div class='feed'>";
al.forEach(function(f){h+="<button class='fi' data-act='openFault' data-id='"+f.id+"'><span class='fx'>"+ic("alert","width:14px;height:14px")+"</span><span style='flex:1;min-width:0'><b>"+esc(f.t)+"</b><small>"+esc(f.dom)+" · "+esc(f.fam.slice(0,3).join(" · "))+"</small></span>"+ic("chev","width:13px;height:13px;color:#61748C")+"</button>";});
h+="</div></div><div class='card panel'><h3>"+ic("bell","color:#FFD60A")+"Campagnes de rappel</h3><div class='feed'>";
rc.forEach(function(t){h+="<button class='fi r' data-act='openTsb' data-id='"+t.id+"'><span class='fx'>"+ic("bell","width:14px;height:14px")+"</span><span style='flex:1;min-width:0'><b>"+esc(t.t)+"</b><small>"+esc(t.ref)+" · "+esc(t.date)+"</small></span>"+ic("chev","width:13px;height:13px;color:#61748C")+"</button>";});
h+="</div></div></div>";return h;}
function vExplorer(){var h="";
h+="<div class='vh'><div><span class='kick'>MODULE 02 — PARC 2017 → 2027</span><h1>SÉLECTION <i>PRÉCISE</i></h1><div class='sub'>Marque → Modèle (phase) → Motorisation (puissance). La sélection alimente directement le plan d'entretien du module 4.</div></div></div>";
h+="<div class='exwrap'><div class='card filters'><div class='fsec'><label class='lb'>1 · Marque</label><select class='sel' data-sel='b'><option value=''>Toutes les marques ("+DB.brands.length+")</option>";
DB.brands.forEach(function(b){h+="<option value='"+b.id+"' "+(S.sel.b===b.id?"selected":"")+">"+esc(b.n)+" ("+(META.byBrand[b.id]||0)+")</option>";});h+="</select></div>";
var mods=S.sel.b?modelsOfBrand(S.sel.b):[];
h+="<div class='fsec'><label class='lb'>2 · Modèle & phase</label><select class='sel' data-sel='m' "+(S.sel.b?"":"disabled")+"><option value=''>"+(S.sel.b?mods.length+" modèle(s)":"Choisir une marque")+"</option>";
mods.forEach(function(m){h+="<option value='"+m.id+"' "+(S.sel.m===m.id?"selected":"")+">"+esc(m.n)+" · phase "+m.phase+" · "+m.y[0]+"-"+m.y[1]+"</option>";});h+="</select></div>";
var engs=S.sel.m?enginesOfModel(S.sel.m):[];
h+="<div class='fsec'><label class='lb'>3 · Motorisation & puissance</label><select class='sel' data-sel='e' "+(S.sel.m?"":"disabled")+"><option value=''>"+(S.sel.m?engs.length+" motorisation(s)":"Choisir un modèle")+"</option>";
engs.forEach(function(e){h+="<option value='"+e.id+"' "+(S.sel.e===e.id?"selected":"")+">"+esc(e.label)+" · "+e.hp+" ch · "+esc(e.code)+" · "+esc(e.gb)+"</option>";});h+="</select></div>";
h+="<div class='fsec'><label class='lb'>Recherche libre</label><input class='inp' type='search' data-f='q' value='"+esc(S.f.q)+"' placeholder='Code, famille, libellé…'></div>";
h+="<div class='fsec'><label class='lb'>Énergie</label><div class='chipset'>";Object.keys(FU).forEach(function(k){h+="<button class='fc "+(S.f.fuel.indexOf(k)>-1?"on":"")+"' style='--fc:"+FU[k].c+"' data-act='ffuel' data-k='"+k+"'>"+FU[k].l+"</button>";});h+="</div></div>";
h+="<div class='fsec'><button class='btn sm ghost' data-act='resetSel' style='width:100%'>"+ic("reset")+"Réinitialiser</button></div></div><div>";
var e=selEngine();
if(e){var m=modelOf(e),b=brandOf(e),fs=faultsFor(e),ts=tsbFor(e),nr=ts.filter(isRecall).length,v=ivi(e),L=IVL(v);
h+="<div class='selcard'><h3>"+ic("check","width:16px;height:16px")+" SÉLECTION ACTIVE — "+esc((b?b.n:"")+" "+(m?m.n:""))+" · "+esc(e.label)+"</h3><div class='sg'>";
[["Phase modèle",m?m.phase:"—"],["Code moteur",e.code],["Puissance",e.hp+" ch / "+e.kw+" kW"],["Couple",e.nm+" Nm"],["Boîte",e.gb],["Production",e.y[0]+"-"+e.y[1]],["Pannes corrélées",fs.length],["Rappels",nr],["IVI",v+" · "+L[0]]].forEach(function(r){h+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";});
h+="</div><div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:11px'><button class='btn pri sm' data-act='goPlan'>"+ic("wrench")+"Plan d'entretien 200 000 km</button><button class='btn sm ghost' data-act='openEng' data-id='"+e.id+"'>"+ic("piston")+"Fiche technique</button></div></div>";}
var l=results(),s=l.slice(0,S.shown);
h+="<div class='bar'><span class='cnt'>"+fmt(l.length)+" motorisation(s)</span><select class='sel' data-f='sort' style='margin-left:auto;width:auto'>";
[["brand","Marque A-Z"],["hpdesc","Puissance ↓"],["year","Année ↓"],["ivi","Vigilance ↓"]].forEach(function(o){h+="<option value='"+o[0]+"' "+(S.f.sort===o[0]?"selected":"")+">"+o[1]+"</option>";});
h+="</select></div><div class='eg'>"+(s.length?s.map(engCard).join(""):"<div class='empty' style='grid-column:1/-1'>"+ic("search")+"<p>Aucune motorisation ne correspond.</p></div>")+"</div>";
h+="<div class='more'>"+(l.length>S.shown?"<button class='btn ghost' data-act='more'>Afficher plus ("+fmt(l.length-S.shown)+")</button>":"")+"</div></div></div>";return h;}
function vTech(){var L=S.tech,h="",i,nr=DB.tsb.filter(isRecall).length;
h+="<div class='vh'><div><span class='kick'>MODULE 03 — RECHERCHE TECHNIQUE EXTRÊME</span><h1>PANNES · TSB · <i>RAPPELS</i></h1><div class='sub'>Corrélation réelle marque / modèle / phase / motorisation. Filtres cumulables sur domaine, sévérité, kilométrage et texte intégral.</div></div></div>";
h+="<div class='atabs'><button class='at "+(L.tab==="faults"?"on":"")+"' data-act='techTab' data-t='faults'>"+ic("alert","width:13px;height:13px")+"PANNES<span class='n'>"+DB.faults.length+"</span></button>";
h+="<button class='at "+(L.tab==="tsb"?"on":"")+"' data-act='techTab' data-t='tsb'>"+ic("file","width:13px;height:13px")+"TSB<span class='n'>"+(DB.tsb.length-nr)+"</span></button>";
h+="<button class='at "+(L.tab==="recalls"?"on":"")+"' data-act='techTab' data-t='recalls'>"+ic("bell","width:13px;height:13px")+"RAPPELS<span class='n'>"+nr+"</span></button></div>";
h+="<div class='card panel' style='margin-bottom:12px'><div class='fr f4'><div><label class='lb'>Texte intégral</label><input class='inp' type='search' data-tf='q' value='"+esc(L.q)+"' placeholder='Symptôme, code, cause…'></div>";
h+="<div><label class='lb'>Marque</label><select class='sel' data-tf='brand'><option value=''>Toutes</option>";DB.brands.forEach(function(b){h+="<option value='"+b.id+"' "+(L.brand===b.id?"selected":"")+">"+esc(b.n)+"</option>";});h+="</select></div>";
h+="<div><label class='lb'>Modèle</label><select class='sel' data-tf='model' "+(L.brand?"":"disabled")+"><option value=''>Tous</option>";
if(L.brand)modelsOfBrand(L.brand).forEach(function(m){h+="<option value='"+m.id+"' "+(L.model===m.id?"selected":"")+">"+esc(m.n)+"</option>";});h+="</select></div>";
h+="<div><label class='lb'>Phase</label><select class='sel' data-tf='phase'><option value=''>Toutes</option>";for(i=1;i<=12;i++)h+="<option value='"+i+"' "+(L.phase===String(i)?"selected":"")+">Phase "+i+"</option>";h+="</select></div></div>";
h+="<div class='fr f3' style='margin-top:10px'><div><label class='lb'>Sévérité</label><select class='sel' data-tf='sev'><option value=''>Toutes</option>";Object.keys(SV).forEach(function(s){h+="<option value='"+s+"' "+(L.sev===s?"selected":"")+">"+s+"</option>";});h+="</select></div>";
var doms={};DB.faults.forEach(function(f){doms[f.dom]=1;});DB.tsb.forEach(function(t){doms[t.dom]=1;});
h+="<div><label class='lb'>Domaine technique</label><select class='sel' data-tf='dom'><option value=''>Tous ("+Object.keys(doms).length+")</option>";Object.keys(doms).sort().forEach(function(d){h+="<option value='"+esc(d)+"' "+(L.dom===d?"selected":"")+">"+esc(d)+"</option>";});h+="</select></div>";
h+="<div><label class='lb'>Kilométrage véhicule</label><input class='inp mono' type='number' min='0' max='400000' step='5000' data-tf='km' value='"+esc(L.km)+"' placeholder='ex. 90000'></div></div></div>";
var q=L.q.trim().toLowerCase(),kmv=+L.km||0,out=[],tm=L.model?MIDX[L.model]:null;
function ok(item){
if(L.brand){var hit=false;
if(item.mt&&item.mt.length){var mods=DB.models.filter(function(m){return m.b===L.brand;});for(var a=0;a<mods.length;a++)if(tokHit(item.mt,mods[a].n)){hit=true;break;}}
if(!hit&&item.b&&item.b.indexOf(L.brand)>-1)hit=true;
if(!hit&&item.fam&&item.fam.length){var eg=DB.engines.filter(function(e){var m=modelOf(e);return m&&m.b===L.brand&&item.fam.indexOf(e.fam)>-1;});if(eg.length)hit=true;}
if(!hit)return false;}
if(tm&&!tokHit(item.mt,tm.n)){var fh=false,me=enginesOfModel(tm.id);for(var b2=0;b2<me.length;b2++)if(item.fam&&item.fam.indexOf(me[b2].fam)>-1){fh=true;break;}if(!fh)return false;}
if(L.phase&&item.ph&&item.ph.length&&item.ph.indexOf("*")<0&&item.ph.indexOf(L.phase)<0)return false;
if(L.sev&&item.sev!==L.sev)return false;if(L.dom&&item.dom!==L.dom)return false;
if(kmv&&item.km&&(kmv<item.km[0]||kmv>item.km[1]))return false;
if(q){var hay=[item.t,item.ref||"",item.cause||"",item.fix||"",item.sum||"",item.act||"",(item.sym||[]).join(" "),(item.fam||[]).join(" "),(item.mt||[]).join(" "),item.dom].join(" ").toLowerCase();if(hay.indexOf(q)<0)return false;}
return true;}
if(L.tab==="faults"){out=DB.faults.filter(ok).sort(function(a,b){return SV[b.sev].w-SV[a.sev].w;});
h+="<div class='bar'><span class='cnt'>"+out.length+" fiche(s) corrélée(s)</span></div><div class='eg' style='grid-template-columns:repeat(auto-fill,minmax(340px,1fr))'>";
out.slice(0,120).forEach(function(f){h+="<div>"+faultCard(f,false,false)+"<div class='dim mono' style='font-size:9.5px;margin:-4px 0 9px 4px'>"+enginesForFault(f).length+" motorisation(s) corrélée(s)</div></div>";});}
else{out=DB.tsb.filter(function(t){var rc=isRecall(t);if(L.tab==="recalls"&&!rc)return false;if(L.tab==="tsb"&&rc)return false;return ok(t);}).sort(function(a,b){return b.date.localeCompare(a.date);});
h+="<div class='bar'><span class='cnt'>"+out.length+" bulletin(s) corrélé(s)</span></div><div class='eg' style='grid-template-columns:repeat(auto-fill,minmax(340px,1fr))'>";
out.slice(0,120).forEach(function(t){h+="<div>"+tsbCard(t,false)+"</div>";});}
if(!out.length)h+="<div class='empty' style='grid-column:1/-1'>"+ic("search")+"<p>Aucun résultat pour ces critères.</p></div>";
h+="</div>";return h;}
function vEntretien(){var e=selEngine(),h="";
h+="<div class='vh'><div><span class='kick'>MODULE 04 — ENTRETIEN JUSQU'À 200 000 KM</span><h1>PLAN <i>PAR MOTORISATION</i></h1><div class='sub'>Le plan reprend exactement la sélection du module 2 : marque, modèle, phase, code moteur, puissance et boîte.</div></div><a class='btn sm ghost' href='#/explorer'>"+ic("car")+"Modifier la sélection</a></div>";
if(!e)return h+"<div class='empty'>"+ic("wrench")+"<p><b>Aucune motorisation sélectionnée.</b></p><p class='dim' style='font-size:12px;margin-top:6px'>Choisissez marque → modèle → motorisation dans le module 2 pour obtenir le plan complet jusqu'à 200 000 km.</p><a class='btn pri sm' href='#/explorer' style='margin-top:12px'>"+ic("car")+"Ouvrir le parc</a></div>";
var m=modelOf(e),b=brandOf(e),pl=buildPlan(e,m,b);h+=planHTML(pl,false);
var fs=faultsFor(e).filter(function(f){return f.sev!=="info";}),rc=tsbFor(e).filter(isRecall);
h+="<div class='g2' style='margin-top:13px'><div class='card panel'><h3>"+ic("alert","color:#FFAF2E")+"Pannes à surveiller<span class='chip'>"+fs.length+"</span></h3>"+(fs.length?fs.slice(0,6).map(function(f){return faultCard(f,!f.active,false);}).join(""):"<p class='dim'>Aucune panne référencée.</p>")+"</div>";
h+="<div class='card panel'><h3>"+ic("bell","color:#FFD60A")+"Campagnes de rappel<span class='chip'>"+rc.length+"</span></h3>"+(rc.length?rc.map(function(t){return tsbCard(t,false);}).join(""):"<p class='dim'>Aucune campagne sur ce périmètre.</p>")+"</div></div>";
h+="<div class='calc'><h3>"+ic("cal")+"CALCULATEUR D'ÉCHÉANCE</h3><div class='fr f3'><div><label class='lb'>Kilométrage actuel</label><input class='inp mono' type='number' min='0' max='400000' step='1000' data-calc='km' value='"+S.calc.km+"'></div>";
h+="<div><label class='lb'>Mise en circulation</label><input class='inp mono' type='number' min='2005' max='"+YMAX+"' data-calc='year' value='"+S.calc.year+"'></div>";
h+="<div><label class='lb'>Profil d'usage</label><select class='sel' data-calc='sev'><option value='1' "+(S.calc.sev===1?"selected":"")+">Normal</option><option value='0.75' "+(S.calc.sev===0.75?"selected":"")+">Sévère (urbain / charge)</option></select></div></div>";
h+="<div class='due' id='dueList'>"+dueHTML(pl)+"</div></div>";return h;}
function vStudio(){var P=WP.P,h="";
h+="<div class='vh'><div><span class='kick'>MODULE 05 — STUDIO FOND D'ÉCRAN</span><h1>FONDS <i>DYNAMIQUES</i></h1><div class='sub'>8 scènes animées, palette pilotable, vitesse et sens de défilement."+((isTier())?" Session tiers : réglages conservés en cache local uniquement.":"")+"</div></div>";
h+="<div style='display:flex;gap:7px;flex-wrap:wrap'><button class='btn sm ghost' data-act='stRandom'>"+ic("dice")+"Aléatoire</button><button class='btn sm ghost' data-act='stReset'>"+ic("reset")+"Réinitialiser</button><button class='btn sm pri' data-act='stPng'>"+ic("cam")+"Export PNG</button></div></div>";
h+="<div class='stwrap'><div class='card stage'><div class='screen' id='screen'><canvas id='pv'></canvas><div class='hud' id='hud'></div></div>";
h+="<div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:11px'><button class='btn sm "+(P.run?"amb":"ghost")+"' data-act='stRun'>"+ic(P.run?"pause":"play")+(P.run?"Pause":"Lecture")+"</button><button class='btn sm ghost' data-act='stDir'>"+ic("reset")+(P.dir>0?"Sens : avant":"Sens : arrière")+"</button></div>";
h+="<div class='psrow' style='margin-top:10px'>";Object.keys(WP.PRESETS).forEach(function(n){h+="<button data-act='stPreset' data-n='"+esc(n)+"'>"+esc(n)+"</button>";});h+="</div></div>";
h+="<div class='card ctrl'><div class='csec'><label class='lb'>Scène animée</label><div class='mgrid'>";
WP.MODES.forEach(function(m){h+="<button class='mb "+(P.mode===m[0]?"on":"")+"' data-act='stMode' data-m='"+m[0]+"'><i style='background:linear-gradient(135deg,"+WP.pal().a+","+WP.pal().b+")'></i>"+m[1]+"</button>";});h+="</div></div>";
h+="<div class='csec'><label class='lb'>Palette prédéfinie</label><div class='pgrid'>";
Object.keys(WP.TH).forEach(function(k){var v=WP.TH[k];h+="<button class='pb "+(!P.useCustom&&P.theme===k?"on":"")+"' data-act='stTheme' data-t='"+k+"' title='"+esc(v.n)+"' style='background:linear-gradient(135deg,"+v.a+","+v.b+","+v.c+")'></button>";});h+="</div>";
h+="<div class='srow' style='margin-top:8px'><span>Palette personnalisée</span><label class='sw'><input type='checkbox' id='customToggle' data-act='stCustom' "+(P.useCustom?"checked":"")+"><i></i></label></div>";
h+="<div class='crow' style='margin-top:8px'>";[["bg","Fond"],["a","Dominante"],["b","Accent 1"],["c","Accent 2"],["d","Accent 3"]].forEach(function(c){h+="<div><label>"+c[1]+"</label><input type='color' data-c='"+c[0]+"' value='"+P.custom[c[0]]+"'></div>";});h+="</div></div>";
var sl=[["speed","Vitesse de défilement",0,200,5],["density","Densité",0,100,1],["count","Particules",10,400,5],["turb","Turbulence",0,100,1],["scale","Échelle / grille",20,160,2],["glow","Halo lumineux",0,100,1],["blur","Flou",0,8,0.5],["stroke","Épaisseur trait",0.5,4,0.1],["drift","Dérive caméra",0,100,1]];
h+="<div class='csec'>";sl.forEach(function(s){h+="<div><div class='srow'><span>"+s[1]+"</span><span class='sval' data-pv='"+s[0]+"'>"+WP.label(s[0],P[s[0]])+"</span></div><input type='range' data-p='"+s[0]+"' min='"+s[2]+"' max='"+s[3]+"' step='"+s[4]+"' value='"+P[s[0]]+"'></div>";});h+="</div>";
h+="<div class='csec'><div class='fr f2'><div><label class='lb'>Sens</label><select class='sel' data-p='dir'><option value='1' "+(P.dir>0?"selected":"")+">Avant</option><option value='-1' "+(P.dir<0?"selected":"")+">Arrière</option></select></div>";
h+="<div><label class='lb'>Qualité</label><select class='sel' data-p='quality'><option value='eco' "+(P.quality==="eco"?"selected":"")+">Éco 1×</option><option value='std' "+(P.quality==="std"?"selected":"")+">Standard 1.5×</option><option value='ultra' "+(P.quality==="ultra"?"selected":"")+">Ultra 2×</option></select></div></div>";
h+="<div style='margin-top:9px'><label class='lb'>Format export PNG</label><select class='sel' data-p='format'><option value='free' "+(P.format==="free"?"selected":"")+">1600×900</option><option value='mobile' "+(P.format==="mobile"?"selected":"")+">1170×2532</option><option value='tablet' "+(P.format==="tablet"?"selected":"")+">1668×2224</option><option value='desktop' "+(P.format==="desktop"?"selected":"")+">1920×1080</option></select></div></div>";
h+="<div class='csec'>";[["grid","Grille & repères"],["grain","Grain"],["scan","Balayage"],["vig","Vignettage"],["run","Animation"],["bg","Fond global"]].forEach(function(t){h+="<div class='srow'><span>"+t[1]+"</span><label class='sw'><input type='checkbox' data-p='"+t[0]+"' "+(P[t[0]]?"checked":"")+"><i></i></label></div>";});h+="</div></div></div>";return h;}
function vAdmin(){
if(!isAdmin())return "<div class='empty'>"+ic("lock")+"<p><b>Module réservé à la session administrateur.</b></p><p class='dim' style='font-size:12px;margin-top:6px'>En consultation tiers : visualisation seule — aucune mise à jour, aucun import, aucune modification de l'application.</p></div>";
var A=S.adm,h="";
h+="<div class='vh'><div><span class='kick'>MODULE 06 — ADMINISTRATION ING-3</span><h1>BASE · MISES À JOUR · <i>DIFFUSION</i></h1><div class='sub'>Seul l'administrateur peut mettre à jour la base (méga-base), importer des fichiers, modifier/exporter l'APK et diffuser aux tiers.</div></div>";
h+="<div style='display:flex;gap:7px'><button class='btn sm ghost' data-act='logout'>"+ic("lock")+"Quitter</button></div></div>";
h+="<div class='banner'>"+ic("bcast","width:15px;height:15px;color:#FFD60A")+"<b>Diffusion vers les tiers</b><label class='sw'><input type='checkbox' data-act='liveToggle' "+(META.live?"checked":"")+"><i></i></label><span class='dim mono'>rév. "+(META.pubRev||0)+"</span><button class='btn sm pri' data-act='publish'>"+ic("bcast")+"Diffuser maintenant</button>";
h+="<span class='dim' style='font-size:11px'>"+(META.live?"Chaque mise à jour est diffusée automatiquement aux tiers.":"Diffusion manuelle : les tiers (mot de passe) ne voient que la dernière révision publiée.")+"</span></div>";
h+="<div class='locknote'>"+ic("eye","width:15px;height:15px")+"<b>Tiers = lecture seule.</b> Le module Import/Mise à jour n'est jamais exposé au tiers ; toute écriture projet est bloquée côté exécuteur.</div>";
h+="<div class='atabs'>";[["files","FICHIERS","db",DB.engines.length],["mega","MÉGA-BASE","spark",RAW.cand.length],["import","IMPORT","ul",""],["journal","JOURNAL","clock",AUDIT.length]].forEach(function(t){
h+="<button class='at "+(A.tab===t[0]?"on":"")+"' data-act='admTab' data-t='"+t[0]+"'>"+ic(t[2],"width:13px;height:13px")+t[1]+(t[3]!==""?"<span class='n'>"+t[3]+"</span>":"")+"</button>";});h+="</div>";
if(A.tab==="files"){h+="<div class='fgrid'>";
FILES.forEach(function(f){var a=DB[f[0]],k=Math.round(JSON.stringify(a).length/1024);
h+="<div class='card hov filecard'><div class='fn'>"+ic("file")+f[1]+"</div><div class='ct'>"+fmt(a.length)+" <small>entrées</small></div><div class='dim mono' style='font-size:9px'>"+k+" Ko · "+f[2]+"</div><div class='fa'><button class='btn xs ghost' data-act='fileExp' data-k='"+f[0]+"'>"+ic("dl","width:11px;height:11px")+"JSON</button><button class='btn xs amb' data-act='admTab' data-t='import'>"+ic("ul","width:11px;height:11px")+"Importer</button></div></div>";});
h+="</div><div class='tools'><button class='btn pri sm' data-act='expAll'>"+ic("dl")+"Exporter la base (APK)</button><button class='btn ghost sm' data-act='saveNow'>"+ic("save")+"Sauvegarder</button><button class='btn ghost sm' data-act='integrity'>"+ic("check")+"Intégrité</button><button class='btn dgr sm' data-act='askReset'>"+ic("reset")+"Base usine</button></div>";
h+="<div class='card panel'><h3>"+ic("info")+"État de la base</h3><div class='sg'>";
[["Marques",META.counts.b],["Modèles",META.counts.m],["Motorisations",META.counts.e],["Pannes",META.counts.f],["TSB / rappels",META.counts.t],["Domaines",META.counts.dom],["Familles moteur",META.counts.fam],["Liaisons",META.links],["Corrélations",META.corr],["Intégrité",META.integ.pct+" %"],["Modèles sans moteur",uncoveredModels().length],["Poids",META.size+" Ko"]].forEach(function(r){h+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+fmt(r[1])+"</b></div>";});h+="</div></div>";}
else if(A.tab==="mega"){var q=A.mega.trim().toLowerCase();
var cands=RAW.cand.filter(function(c){return !q||(c.brand+" "+c.model+" "+c.code+" "+c.label+" "+c.note).toLowerCase().indexOf(q)>-1;});
h+="<div class='card panel' style='margin-bottom:12px'><h3>"+ic("spark")+"Mise à jour méga-base (admin seul)</h3><p class='muted' style='font-size:12px;margin-bottom:10px'>Candidats 2025-2027 : nouvelles marques, modèles et motorisations corrélées. Intégration immédiate, diffusion sur votre accord.</p>";
h+="<div class='fr f2'><div><label class='lb'>Recherche candidat</label><input class='inp' type='search' data-mega='q' value='"+esc(A.mega)+"' placeholder='Marque, modèle, code, technologie…'></div>";
h+="<div><label class='lb'>Corrélation sélection module 2</label><input class='inp' value='"+esc(S.sel.b?(BIDX[S.sel.b]?BIDX[S.sel.b].n:"")+" "+(S.sel.m&&MIDX[S.sel.m]?MIDX[S.sel.m].n:""):"aucune sélection")+"' disabled></div></div>";
h+="<div style='display:flex;gap:7px;margin-top:10px;flex-wrap:wrap'><button class='btn sm pri' data-act='megaAll'>"+ic("plus")+"Intégrer les "+cands.length+" résultat(s)</button><button class='btn sm ghost' data-act='megaSel'>"+ic("car")+"Filtrer sur la marque sélectionnée</button></div></div>";
h+="<div class='tw'><table class='t'><thead><tr><th>Type</th><th>Marque</th><th>Modèle / phase</th><th>Motorisation</th><th>Période</th><th>Note</th><th></th></tr></thead><tbody>";
cands.forEach(function(c){var bi=BIDX[c.brand];
h+="<tr><td><span class='tag'>"+esc(c.type)+"</span></td><td>"+esc(bi?bi.n:c.brand)+"</td><td><b>"+esc(c.model)+"</b> <span class='tag'>phase "+c.phase+"</span></td><td class='mono'>"+esc(c.label)+" · "+c.hp+" ch · "+esc(c.code)+"</td><td class='mono'>"+c.y0+"-"+c.y1+"</td><td class='dim' style='font-size:11px'>"+esc(c.note)+"</td><td><button class='btn xs pri' data-act='megaAdd' data-i='"+RAW.cand.indexOf(c)+"'>Intégrer</button></td></tr>";});
h+="</tbody></table></div>";}
else if(A.tab==="import"){h+="<div class='card panel'><h3>"+ic("ul")+"Import universel multi-formats (admin
