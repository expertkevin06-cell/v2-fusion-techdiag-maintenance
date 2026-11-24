(function(){
"use strict";
window.__MD_VER="8.4";window.__MD_BUILD="8.4";window.__MD_FIX="8.7-bridge";
/* Pont natif attendu (Kotlin) : window.MecadataBridge.mdRead(k)/mdWrite(k,v) */
var $=window.MD_$,$$=window.MD_$$,esc=window.MD_esc,fmt=window.MD_fmt,clamp=window.MD_clamp,uid=window.MD_uid,clone=window.MD_clone,ov=window.MD_ov,ic=window.MD_ic,deb=window.MD_deb,split=window.MD_split,nk=window.MD_nk,slug=window.MD_slug,safe=window.MD_safe,logErr=window.MD_logErr,STORE=window.MD_STORE,download=window.MD_download,beep=window.MD_beep,toast=window.MD_toast,openModal=window.MD_openModal,closeModal=window.MD_closeModal,confirmModal=window.MD_confirmModal,modalOpenFn=window.MD_modalOpen,WP=window.MD_WP,PREF=window.MD_PREF,ERRORS=window.MD_ERRORS;
STORE.idbCache=STORE.idbCache||{};
var PWD="Kevin83600",KEY="mecadata_v84",OLDKEY="mecadata_v83",AKEY="md_access_v83",PKEY="md_pub_v83",YMAX=2027,KMMAX=200000;
var SEGS=window.MD_RAW.segs;
var FU={e:{l:"Essence",c:"#FFAF2E"},d:{l:"Diesel",c:"#4D8DFF"},h:{l:"Hybride",c:"#43E08B"},p:{l:"Hybride rechargeable",c:"#19B8A6"},b:{l:"Électrique",c:"#E45CFF"},g:{l:"GPL",c:"#A8E63C"}};
var SV={critique:{w:32,c:"#FF4D5E"},majeure:{w:18,c:"#FF7A3D"},"modérée":{w:9,c:"#FFAF2E"},mineure:{w:4,c:"#4D8DFF"},info:{w:0,c:"#25D4EE"}};
var FQ={"élevée":1.25,moyenne:1,faible:0.7};
var COLS=["brands","models","engines","faults","tsb"];
var FILES=[["brands","brands.json","Marques"],["models","models.json","Modèles"],["engines","engines.json","Motorisations"],["faults","faults.json","Pannes"],["tsb","tsb.json","TSB / Rappels"]];
function nsev(v){var k=nk(v),m={critique:"critique",critical:"critique",majeure:"majeure",major:"majeure",moderee:"modérée",moderate:"modérée",moyenne:"modérée",mineure:"mineure",minor:"mineure",faible:"mineure",info:"info",note:"info"};return m[k]||(SV[v]?v:"modérée");}
function nfreq(v){var k=nk(v),m={elevee:"élevée",high:"élevée",moyenne:"moyenne",medium:"moyenne",faible:"faible",low:"faible"};return m[k]||(FQ[v]?v:"moyenne");}
function nfuel(v){var k=nk(v),m={e:"e",essence:"e",petrol:"e",d:"d",diesel:"d",h:"h",hybride:"h",hybrid:"h",p:"p",phev:"p",rechargeable:"p",b:"b",ev:"b",electrique:"b",electric:"b",g:"g",gpl:"g"};return m[k]||(FU[k]?k:"e");}
var IVL=function(v){return v>=75?["CRITIQUE","#FF4D5E"]:v>=50?["ÉLEVÉ","#FF7A3D"]:v>=25?["MODÉRÉ","#FFAF2E"]:["FAIBLE","#43E08B"];};

var SEED=null,DB=null,AUDIT=[],UNDO=null,TESTS=[],IVIC={},MIDX={},BIDX={},EIDX={},IMPORT=null,FIXES=0,LASTSAVE=0,DIRTY=false,ACC_OPEN=false,AUTOFILL=0,COPIED_ONCE=false;
var META={counts:{},links:0,corr:0,integ:{err:[],ok:true,pct:100},size:0,byBrand:{}};
var MODE=null,TIER=null,CH=null,BRIDGE=null;
var REG={users:[],live:false,rev:0,log:[],seen:[],tomb:[]};
var REG_OK=true,REG_WARNED=false;
var GATE_MODE=null,GATE_SIG=null,GATE_NAME="",GATE_RENDERED=false,GATE_CODE="";
var S={view:"bord",sel:{b:"",m:"",e:""},f:{q:"",fuel:[],y:[2017,YMAX],sort:"brand"},shown:48,
tech:{tab:"faults",q:"",sev:"",brand:"",model:"",phase:"",dom:"",km:""},adm:{tab:"files",mega:"",code:""},
calc:{km:60000,year:2021,sev:1},drawer:null,omni:{q:"",hits:[],idx:-1}};
window.MD_STATE=S;
var isAdmin=function(){return MODE==="admin";},isTier=function(){return MODE==="tier";};

/* ══════════ PONT NATIF ANDROID ══════════ */
function bridgeDetect(){
  var c=[window.MecadataBridge,window.AndroidBridge,window.Android,window.MDNative];
  for(var i=0;i<c.length;i++){
    var b=c[i];if(!b)continue;
    var hr=(typeof b.mdRead==="function")||(typeof b.read==="function")||(typeof b.readFile==="function");
    var hw=(typeof b.mdWrite==="function")||(typeof b.write==="function")||(typeof b.writeFile==="function");
    if(hr&&hw){BRIDGE=b;return b;}
  }
  BRIDGE=null;return null;
}
function bridgeGet(k){
  if(!BRIDGE)return null;
  try{
    if(typeof BRIDGE.mdRead==="function")return BRIDGE.mdRead(k);
    if(typeof BRIDGE.read==="function")return BRIDGE.read(k);
    if(typeof BRIDGE.readFile==="function")return BRIDGE.readFile(k);
  }catch(e){}
  return null;
}
function bridgeSet(k,v){
  if(!BRIDGE)return false;
  try{
    if(typeof BRIDGE.mdWrite==="function"){BRIDGE.mdWrite(k,v);return true;}
    if(typeof BRIDGE.write==="function"){BRIDGE.write(k,v);return true;}
    if(typeof BRIDGE.writeFile==="function"){BRIDGE.writeFile(k,v);return true;}
  }catch(e){}
  return false;
}

function gateTyping(){var a=document.activeElement;return !!(a&&a.closest&&a.closest("#gate")&&/^(input|textarea)$/i.test(a.tagName));}
function gateSig(mode){var u=tierUser();return (mode||"root")+"|"+(u?(u.id+":"+u.status+":"+GATE_CODE):"none");}
function hardenResize(){if(WP.__resizeGuarded)return;WP.__resizeGuarded=true;var base=WP.resize;WP.resize=function(){if(gateTyping())return;return base.call(WP);};}
function injectNotifCss(){
  if(document.getElementById("mdNotifCss"))return;
  var st=document.createElement("style");st.id="mdNotifCss";
  st.textContent=".reqbanner{border:1px solid rgba(255,77,94,.55);background:linear-gradient(120deg,rgba(255,77,94,.14),rgba(255,214,10,.08));border-radius:12px;padding:11px 14px;margin-bottom:13px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;animation:reqIn .35s}"+
  "@keyframes reqIn{from{opacity:0;transform:translateY(-8px)}}"+
  ".reqbanner b{font:600 13px var(--gd);color:#FFB3BA}.reqbanner .rn{font:400 11px var(--gm);color:var(--t2)}"+
  ".reqpulse{width:9px;height:9px;border-radius:50%;background:#FF4D5E;box-shadow:0 0 0 0 rgba(255,77,94,.7);animation:rp 1.4s infinite}"+
  "@keyframes rp{70%{box-shadow:0 0 0 9px rgba(255,77,94,0)}100%{box-shadow:0 0 0 0 rgba(255,77,94,0)}}"+
  ".codebox{font:500 11px var(--gm);color:#FFD60A;background:rgba(255,214,10,.07);border:1px dashed var(--ln2);border-radius:9px;padding:9px 11px;word-break:break-all;margin-top:9px;user-select:all;-webkit-user-select:all}"+
  ".syncwarn{border:1px solid rgba(255,175,46,.5);background:rgba(255,175,46,.08);border-radius:10px;padding:9px 12px;font-size:11.5px;color:#FFC9A8;margin-bottom:11px}"+
  ".gateimp{border:1px solid var(--ln);border-radius:11px;padding:11px 12px;background:rgba(12,20,36,.6);margin-top:13px}"+
  ".gateimp .lb{margin-bottom:7px}";
  document.head.appendChild(st);
}

/* ══════════ COUVERTURE EXHAUSTIVE ══════════ */
function ensureCoverage(D){
  if(!D||!Array.isArray(D.models)||!Array.isArray(D.engines))return 0;
  if(!D.models.length||!D.engines.length)return 0;
  var mById={},covered={},used={},byBrand={},bySeg={},maxN=0,i,j;
  for(i=0;i<D.models.length;i++)mById[D.models[i].id]=D.models[i];
  for(i=0;i<D.engines.length;i++){
    var e=D.engines[i];used[e.id]=1;
    var em=/^E(\d+)$/.exec(String(e.id));if(em){var v=+em[1];if(v>maxN)maxN=v;}
    var refs=Array.isArray(e.m)?e.m:[];
    for(j=0;j<refs.length;j++){covered[refs[j]]=1;var dm=mById[refs[j]];
      if(dm){(byBrand[dm.b]=byBrand[dm.b]||[]).push(e);(bySeg[dm.seg]=bySeg[dm.seg]||[]).push(e);}}
  }
  var added=0;
  for(i=0;i<D.models.length;i++){
    var mo=D.models[i];if(covered[mo.id])continue;
    var pools=[byBrand[mo.b],bySeg[mo.seg],D.engines],pool=null;
    for(var p=0;p<pools.length;p++){if(pools[p]&&pools[p].length){pool=pools[p];break;}}
    if(!pool)continue;
    var best=null,bestSc=-1;
    for(j=0;j<pool.length;j++){
      var de=pool[j],dmm=mById[de.m[0]];
      var sc=(dmm&&dmm.b===mo.b?16:0)+(dmm&&dmm.seg===mo.seg?6:0)+(ov(de.y,mo.y)?4:0)+(dmm&&dmm.phase===mo.phase?2:0);
      if(sc>bestSc){bestSc=sc;best=de;}
    }
    if(!best)best=pool[0];
    maxN++;var nid="E"+String(maxN).padStart(4,"0");
    while(used[nid]){maxN++;nid="E"+String(maxN).padStart(4,"0");}
    used[nid]=1;
    var y0=Math.max(best.y[0],mo.y[0]),y1=Math.min(best.y[1],mo.y[1]);
    if(y0>y1){y0=mo.y[0];y1=mo.y[1];}
    var ne={id:nid,m:[mo.id],code:best.code,fam:best.fam,label:best.label,fuel:best.fuel,disp:best.disp,
      hp:best.hp,nm:best.nm,kw:best.kw,y:[y0,y1],gb:best.gb,norm:best.norm,cyl:best.cyl,asp:best.asp,inj:best.inj,auto:1};
    D.engines.push(ne);covered[mo.id]=1;added++;AUTOFILL++;
    (byBrand[mo.b]=byBrand[mo.b]||[]).push(ne);(bySeg[mo.seg]=bySeg[mo.seg]||[]).push(ne);
  }
  return added;
}
function uncoveredModels(){return DB.models.filter(function(m){return !DB.engines.some(function(e){return e.m.indexOf(m.id)>-1;});});}

/* ══════════ NORMALISATION ABSOLUE ══════════ */
function hardNormalize(D){
  var fixes=0,i,j;
  COLS.forEach(function(k){if(!Array.isArray(D[k])){D[k]=[];fixes++;}});
  var bUsed={},bMap={},nb=[];
  for(i=0;i<D.brands.length;i++){
    var b=D.brands[i];if(!b||!b.n){fixes++;continue;}
    var bid=String(b.id||("B-"+slug(b.n))).trim()||("B-"+slug(b.n));
    if(bUsed[bid]){var nbid=bid,q=2;while(bUsed[nbid])nbid=bid+"~"+(q++);bMap[b.id]=nbid;bid=nbid;fixes++;}
    bUsed[bid]=1;nb.push({id:bid,n:String(b.n),pays:String(b.pays||"—"),grp:String(b.grp||"—")});
  }
  D.brands=nb;
  var bSet={};for(i=0;i<nb.length;i++)bSet[nb[i].id]=1;
  var mUsed={},nm=[];
  for(i=0;i<D.models.length;i++){
    var m=D.models[i];if(!m||!m.n){fixes++;continue;}
    var mb=bMap[m.b]||m.b;
    if(!bSet[mb]){
      var nid="B-"+slug(String(mb||"import")),base=nid,q2=2;while(bSet[nid])nid=base+"~"+(q2++);
      D.brands.push({id:nid,n:String(mb||"Marque importée"),pays:"—",grp:"—"});bSet[nid]=1;bMap[mb]=nid;mb=nid;fixes++;
    }
    var mid=String(m.id||("M-"+slug(mb)+"-"+slug(m.n))).trim()||("M-"+slug(mb)+"-"+slug(m.n));
    if(mUsed[mid]){var nmid=mid,q3=2;while(mUsed[nmid])nmid=mid+"-"+(q3++);mid=nmid;fixes++;}
    mUsed[mid]=1;
    var my=Array.isArray(m.y)?m.y:[2017,YMAX];
    nm.push({id:mid,b:mb,n:String(m.n),y:[+my[0]||2017,+my[1]||YMAX],seg:String(m.seg||"Compacte"),phase:+m.phase||1});
  }
  D.models=nm;
  var mSet={};for(i=0;i<nm.length;i++)mSet[nm[i].id]=1;
  var eUsed={},ne=[],eMax=0;
  for(i=0;i<D.engines.length;i++){var em=/^E(\d+)$/.exec(String(D.engines[i].id));if(em){var vv=+em[1];if(vv>eMax)eMax=vv;}}
  for(i=0;i<D.engines.length;i++){
    var e=D.engines[i];if(!e||!e.code){fixes++;continue;}
    var refs=[],seenRef={},raw=Array.isArray(e.m)?e.m:[];
    for(j=0;j<raw.length;j++){var rr=raw[j];if(mSet[rr]&&!seenRef[rr]){seenRef[rr]=1;refs.push(rr);}}
    if(!refs.length){fixes++;continue;}
    var eid=String(e.id||"").trim();
    if(!eid||eUsed[eid]){eMax++;eid="E"+String(eMax).padStart(4,"0");while(eUsed[eid]){eMax++;eid="E"+String(eMax).padStart(4,"0");}fixes++;}
    eUsed[eid]=1;
    var ey=Array.isArray(e.y)?e.y:[2017,YMAX];
    ne.push({id:eid,m:refs,code:String(e.code),fam:String(e.fam||e.code),label:String(e.label||e.code),fuel:nfuel(e.fuel),
      disp:+e.disp||0,hp:+e.hp||100,nm:+e.nm||0,kw:+e.kw||Math.round((+e.hp||100)*0.7355),y:[+ey[0]||2017,+ey[1]||YMAX],
      gb:String(e.gb||"BVM"),norm:String(e.norm||"Euro 6"),cyl:String(e.cyl||"L4"),asp:String(e.asp||"Turbo"),inj:String(e.inj||"—"),auto:e.auto?1:0});
  }
  D.engines=ne;
  var fUsed={},nf=[];
  for(i=0;i<D.faults.length;i++){
    var f=D.faults[i];if(!f||!f.t){fixes++;continue;}
    var fid=String(f.id||"").trim();
    if(!fid||fUsed[fid]){fid="F"+String(nf.length+1).padStart(3,"0");while(fUsed[fid])fid=fid+"~"+(nf.length+1);fixes++;}
    fUsed[fid]=1;
    var fs=nsev(f.sev);if(fs!==f.sev)fixes++;
    var fq=nfreq(f.freq);if(fq!==f.freq)fixes++;
    nf.push({id:fid,t:String(f.t),fam:split(f.fam),mt:split(f.mt),ph:split(f.ph),sev:fs,freq:fq,
      y:Array.isArray(f.y)?f.y:[2017,YMAX],km:Array.isArray(f.km)?f.km:[0,200000],sym:split(f.sym),
      cause:String(f.cause||""),fix:String(f.fix||""),cost:Array.isArray(f.cost)?f.cost:[0,0],
      status:String(f.status||"Surveillance"),dom:String(f.dom||"Moteur"),fuel:""});
  }
  D.faults=nf;
  var tUsed={},nt=[];
  for(i=0;i<D.tsb.length;i++){
    var t=D.tsb[i];if(!t||!t.t){fixes++;continue;}
    var tid=String(t.id||"").trim();
    if(!tid||tUsed[tid]){tid="T"+String(nt.length+1).padStart(3,"0");while(tUsed[tid])tid=tid+"~"+(nt.length+1);fixes++;}
    tUsed[tid]=1;
    var ts=nsev(t.sev);if(ts!==t.sev)fixes++;
    var tb=split(t.b).map(function(x){return bMap[x]||x;}).filter(function(x){return bSet[x];});
    nt.push({id:tid,ref:String(t.ref||("TSB-"+tid)),b:tb,fam:split(t.fam),mt:split(t.mt),ph:split(t.ph),
      t:String(t.t),date:String(t.date||"2026-01").slice(0,7),cat:String(t.cat||"Moteur"),sev:ts,
      sum:String(t.sum||""),act:String(t.act||""),dom:String(t.dom||t.cat||"Moteur")});
  }
  D.tsb=nt;
  COLS.forEach(function(k){
    var used={};
    for(var a=0;a<D[k].length;a++){
      var x=D[k][a],id=String(x.id),n=2;
      while(used[id]){id=String(x.id)+"#"+(n++);fixes++;}
      x.id=id;used[id]=1;
    }
  });
  fixes+=ensureCoverage(D);
  return fixes;
}
function nextEngId(){var mx=0;DB.engines.forEach(function(e){var m=/^E(\d+)$/.exec(String(e.id));if(m){var v=+m[1];if(v>mx)mx=v;}});return "E"+String(mx+1).padStart(4,"0");}
function mkEng(id,mid,code,fam,label,fuel,disp,hp,nm,y0,y1,gb){
var cyl=fuel==="b"?"ÉLEC":(disp>=6000?"W12+":(disp>3400?"V8+":(disp>2400?"6 cyl.":(disp<1100?"L3":"L4"))));
return {id:id,m:[mid],code:code,fam:fam,label:label,fuel:fuel,disp:disp,hp:hp,nm:nm,kw:Math.round(hp*0.7355),y:[y0,y1],gb:gb,
norm:fuel==="b"?"ZE":(y0>=2024?"Euro 6e":(y0>=2020?"Euro 6d":"Euro 6")),cyl:cyl,asp:fuel==="b"?"—":"Turbo",inj:fuel==="b"?"—":(fuel==="d"?"Common Rail":"Injection directe"),auto:0};}
function build(R){
var D={brands:[],models:[],engines:[],faults:[],tsb:[]},usedMid={},n=0;
R.br.forEach(function(b){D.brands.push({id:b[0],n:b[1],pays:b[2],grp:b[3]});});
Object.keys(R.md).forEach(function(bid){
  R.md[bid].forEach(function(m){
    var srcKey=bid+"-"+slug(m[0]);
    var id=srcKey,q=2;while(usedMid[id])id=srcKey+"-"+(q++);
    usedMid[id]=1;
    D.models.push({id:id,b:bid,n:m[0],y:[m[1],m[2]],seg:SEGS[m[3]]||"Compacte",phase:m[4]||1});
    (R.me[srcKey]||[]).forEach(function(e){
      n++;D.engines.push(mkEng("E"+String(n).padStart(4,"0"),id,e[0],e[1],e[2],nfuel(e[3]),e[4],e[5],e[6],e[8],e[9],e[7]));
    });
  });
});
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
function integrity(){
  hardNormalize(DB);ensureCoverage(DB);reindex();
  var err=[],mi={},bi={},du=0;
  DB.models.forEach(function(m){mi[m.id]=1;});DB.brands.forEach(function(b){bi[b.id]=1;});
  COLS.forEach(function(k){var s={};DB[k].forEach(function(x){if(s[x.id])du++;s[x.id]=1;});});
  if(du)err.push(du+" id dupliqué(s)");
  DB.models.forEach(function(m){if(!bi[m.b])err.push("marque inconnue "+m.b);});
  DB.engines.forEach(function(e){e.m.forEach(function(i){if(!mi[i])err.push("moteur orphelin "+e.id);});});
  DB.faults.forEach(function(f){if(!SV[f.sev])err.push("sévérité "+f.sev);});
  var unc=uncoveredModels();
  if(unc.length)err.push(unc.length+" modèle(s) sans motorisation");
  return {err:err,ok:!err.length,pct:err.length?Math.max(0,100-err.length*7):100};}
function recompute(){FIXES+=hardNormalize(DB);ensureCoverage(DB);IVIC={};reindex();
var links=0,corr=0,bb={},doms={},fams={},i;
for(i=0;i<DB.engines.length;i++){var e=DB.engines[i],m=MIDX[e.m[0]];fams[e.fam]=1;links+=e.m.length;if(m)bb[m.b]=(bb[m.b]||0)+1;corr+=faultsFor(e).length+tsbFor(e).length;}
DB.faults.forEach(function(f){links+=f.fam.length;doms[f.dom]=1;});DB.tsb.forEach(function(t){links+=t.b.length+t.fam.length;doms[t.dom]=1;});
META={counts:{b:DB.brands.length,m:DB.models.length,e:DB.engines.length,f:DB.faults.length,t:DB.tsb.length,rc:DB.tsb.filter(isRecall).length,fam:Object.keys(fams).length,dom:Object.keys(doms).length},
links:links,corr:corr,integ:integrity(),size:Math.round(JSON.stringify(DB).length/1024),byBrand:bb};}

/* ══════════ REGISTRE D'ACCÈS — 5 couches : bridge natif → local → session → name → IDB ══════════ */
function regNorm(r){
  if(!r||typeof r!=="object")r={};
  return {users:Array.isArray(r.users)?r.users.filter(function(u){return u&&u.id&&u.name;}):[],
    live:!!r.live,rev:+r.rev||0,log:Array.isArray(r.log)?r.log:[],
    seen:Array.isArray(r.seen)?r.seen:[],tomb:Array.isArray(r.tomb)?r.tomb:[]};
}
function regMerge(a,b){
  a=regNorm(a);b=regNorm(b);
  var base=(b.rev>=a.rev)?b:a,map={};
  function add(u){
    if(!u||!u.id)return;
    var e=map[u.id];
    if(!e){map[u.id]=u;return;}
    var ea=+(e.at||e.ts||0),ua=+(u.at||u.ts||0);
    if(ua>=ea)map[u.id]=u;
  }
  a.users.forEach(add);b.users.forEach(add);
  var tomb={};a.tomb.concat(b.tomb).forEach(function(id){tomb[id]=1;});
  var users=Object.keys(map).map(function(k){return map[k];}).filter(function(u){return !tomb[u.id];});
  users.sort(function(x,y){return (+x.ts||0)-(+y.ts||0);});
  var lk={},log=[];
  a.log.concat(b.log).forEach(function(l){if(!l)return;var k=(l.ts||0)+"|"+(l.a||"");if(!lk[k]){lk[k]=1;log.push(l);}});
  log.sort(function(x,y){return (y.ts||0)-(x.ts||0);});
  if(log.length>120)log=log.slice(0,120);
  var sk={};a.seen.concat(b.seen).forEach(function(id){sk[id]=1;});
  return {users:users,live:base.live,rev:Math.max(a.rev,b.rev),log:log,seen:Object.keys(sk),tomb:Object.keys(tomb)};
}
function regRead(){
  var out=regNorm(null);
  var bg=bridgeGet(AKEY);
  if(bg)safe("regbridge",function(){out=regMerge(out,JSON.parse(bg));},null);
  var raw=STORE.get(AKEY);
  if(raw)safe("regparse",function(){out=regMerge(out,JSON.parse(raw));},null);
  try{if(STORE.idbCache&&STORE.idbCache[AKEY])out=regMerge(out,JSON.parse(STORE.idbCache[AKEY]));}catch(e){}
  return out;
}
function regLoad(){REG=regMerge(REG,regRead());return REG;}
function regSave(){
  REG.rev=(+REG.rev||0)+1;
  var s=JSON.stringify(REG);
  STORE.set(AKEY,s);
  var bw=bridgeSet(AKEY,s);
  try{if(STORE.idbSet)STORE.idbSet(AKEY,s);}catch(e){}
  try{STORE.idbCache[AKEY]=s;}catch(e){}
  var ok=bw;
  if(!ok){
    try{
      var back=STORE.get(AKEY);
      if(back){var d=JSON.parse(back);ok=!!(d&&Array.isArray(d.users)&&d.users.length===REG.users.length&&d.rev===REG.rev);}
    }catch(e){ok=false;}
  }
  if(!ok){try{var bc=bridgeGet(AKEY);if(bc){var d3=JSON.parse(bc);ok=!!(d3&&d3.rev===REG.rev);}}catch(e){}}
  REG_OK=ok;
  if(!ok&&!REG_WARNED){REG_WARNED=true;
    toast("warn","Stockage local limité","La demande reste en mémoire : utilisez le code ou le fichier affiché pour la transmettre à l'administrateur.");}
  bcast({t:"reg",rev:REG.rev});
  bellRefresh();
  return ok;
}
function bcast(m){try{if(CH)CH.postMessage(m);}catch(e){}}
function regLog(a){REG.log.unshift({ts:Date.now(),a:a});if(REG.log.length>120)REG.log.pop();}
function pendingCount(){return REG.users.filter(function(u){return u.status==="pending";}).length;}
function tierUser(){if(!TIER)return null;for(var i=0;i<REG.users.length;i++)if(REG.users[i].id===TIER)return REG.users[i];return null;}
function tierName(){var u=tierUser();return u?u.name:"";}
function applyTierSnapshot(){var raw=STORE.get(PKEY);if(!raw)return false;
return safe("pub",function(){var d=JSON.parse(raw);if(d&&d.db&&d.db.engines&&d.db.engines.length){DB=d.db;recompute();return true;}return false;},false);}
function preloadIdb(){
  STORE.idbCache=STORE.idbCache||{};
  [AKEY,PKEY].forEach(function(k){
    try{STORE.idbGet(k).then(function(v){
      if(!v)return;
      STORE.idbCache[k]=v;
      if(k===AKEY){safe("idbreg",function(){REG=regMerge(REG,JSON.parse(v));},null);bellRefresh();notifyPending();gateSync();}
    });}catch(e){}
  });
}
function syncNow(silent){
  regLoad();
  try{STORE.idbGet(AKEY).then(function(raw){
    if(raw){try{STORE.idbCache[AKEY]=raw;REG=regMerge(REG,JSON.parse(raw));}catch(e){}}
    bellRefresh();
    if(isAdmin()){notifyPending();if(S.view==="admin")render();}
    gateSync();
    if(!silent)toast("ok","Synchronisation effectuée",pendingCount()+" demande(s) en attente · registre fusionné (bridge + web + IDB).");
  });}catch(e){}
  bellRefresh();
  if(isAdmin())notifyPending();
  if(!silent)beep("tick");
}

/* ══════════ NOTIFICATIONS ══════════ */
function osNotify(title,body){
  safe("osnotify",function(){
    try{if(window.Android&&typeof window.Android.notify==="function"){window.Android.notify(String(title),String(body));return;}}catch(e){}
    try{if(window.Android&&typeof window.Android.postNotification==="function"){window.Android.postNotification(String(title),String(body));return;}}catch(e){}
    try{if(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.notify){window.webkit.messageHandlers.notify.postMessage({title:String(title),body:String(body)});return;}}catch(e){}
    try{
      if(typeof Notification!=="undefined"){
        if(Notification.permission==="granted"){new Notification(String(title),{body:String(body),icon:"icons/icon-192.png",tag:"md-access"});return;}
        if(Notification.permission!=="denied"&&Notification.requestPermission){
          Notification.requestPermission().then(function(p){if(p==="granted"){try{new Notification(String(title),{body:String(body),icon:"icons/icon-192.png",tag:"md-access"});}catch(e){}}});
        }
      }
    }catch(e){}
  },null);
}
function notifyPending(){
  if(!isAdmin())return 0;
  var news=REG.users.filter(function(u){return u.status==="pending"&&REG.seen.indexOf(u.id)<0;});
  if(!news.length)return 0;
  news.forEach(function(u){if(REG.seen.indexOf(u.id)<0)REG.seen.push(u.id);});
  regSave();
  var names=news.map(function(u){return u.name;}).join(", ");
  toast("warn",news.length+" nouvelle(s) demande(s) d'accès",names+" — cliquez la cloche pour statuer.");
  beep("imp");
  osNotify("MECADATA — demande d'accès tiers",names+" demande l'accès à la console.");
  regLog("Notification admin — "+names);
  if(S.view==="admin")render();else updateMeta();
  return news.length;
}
function reqBannerHTML(){
  var pc=pendingCount();
  if(!isAdmin()||!pc)return "";
  var news=REG.users.filter(function(u){return u.status==="pending";});
  var names=news.slice(0,3).map(function(u){return u.name;}).join(", ")+(news.length>3?" +"+(news.length-3):"");
  return "<div class='reqbanner'><span class='reqpulse'></span>"+ic("bell","width:17px;height:17px;color:#FF4D5E")+
  "<b>"+pc+" demande(s) d'accès en attente</b><span class='rn'>"+esc(names)+"</span>"+
  "<button class='btn sm amb' data-act='openAccess' style='margin-left:auto'>"+ic("users")+"Ouvrir le gestionnaire</button></div>";
}
function copyText(t){
  safe("copy",function(){
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t);return;}
    var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";
    document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
  },null);
}
function b64e(o){try{return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}catch(e){return "";}}
function b64d(s){try{s=String(s||"").trim().replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return JSON.parse(decodeURIComponent(escape(atob(s))));}catch(e){return null;}}
function reqCode(u){return "MDR1-"+b64e({i:u.id,n:u.name,t:u.ts});}
function grantCode(u){return "MDA1-"+b64e({i:u.id,n:u.name,s:u.status,a:u.at||Date.now()});}
function importReqCode(code){
  var d=b64d(code);
  if(!d||!d.i||!d.n)return false;
  regLoad();
  var ex=null;REG.users.forEach(function(u){if(u.id===d.i)ex=u;});
  if(ex){if(ex.status!=="pending"){ex.status="pending";ex.at=null;}ex.ts=+d.t||ex.ts||Date.now();}
  else REG.users.push({id:String(d.i),name:String(d.n).slice(0,24),status:"pending",ts:+d.t||Date.now(),at:null});
  REG.tomb=REG.tomb.filter(function(x){return x!==d.i;});
  REG.seen=REG.seen.filter(function(x){return x!==d.i;});
  regLog("Demande importée par code — "+d.n);
  regSave();notifyPending();
  return true;
}
function importReqPayload(obj){
  if(!obj||typeof obj!=="object")return false;
  if(obj.code&&!obj.user)return importReqCode(obj.code);
  var u=obj.user||obj;
  if(!u||!u.id||!u.name)return false;
  regLoad();
  var ex=null;REG.users.forEach(function(x){if(x.id===u.id)ex=x;});
  var rec={id:String(u.id),name:String(u.name).slice(0,24),status:"pending",ts:+u.ts||Date.now(),at:null};
  if(ex){if(ex.status!=="pending"){ex.status="pending";ex.at=null;}ex.ts=rec.ts;}
  else REG.users.push(rec);
  REG.tomb=REG.tomb.filter(function(x){return x!==rec.id;});
  REG.seen=REG.seen.filter(function(x){return x!==rec.id;});
  regLog("Demande importée par fichier — "+rec.name);
  regSave();notifyPending();
  return true;
}
function importGrantCode(code){
  var d=b64d(code);
  if(!d||!d.i||!d.n||!d.s)return false;
  regLoad();
  var ex=null;REG.users.forEach(function(u){if(u.id===d.i)ex=u;});
  var rec={id:String(d.i),name:String(d.n).slice(0,24),status:String(d.s),ts:Date.now(),at:+d.a||Date.now()};
  if(ex){ex.status=rec.status;ex.at=rec.at;}else REG.users.push(rec);
  REG.tomb=REG.tomb.filter(function(x){return x!==rec.id;});
  TIER=rec.id;GATE_NAME=rec.name;GATE_CODE="";
  regLog("Code d'accord appliqué — "+rec.name+" ("+rec.status+")");
  regSave();
  return rec.status==="granted";
}
function exportReqFile(){
  var u=tierUser();if(!u){toast("err","Aucune demande active");return;}
  download("demande-acces-"+slug(u.name)+".json",JSON.stringify({kind:"mecadata-access-request",v:1,user:u,code:reqCode(u)},null,2),"application/json");
  toast("ok","Fichier de demande exporté","Transmettez-le à l'administrateur.");beep("ok");
}

var ACC_STATES=[["granted","g","ACCÈS"],["denied","d","REFUS"],["revoked","r","RÉVOCATION"]];
function accBoxesHTML(u,legend){
var h="<div class='"+(legend?"acclegend":"accboxes")+"'>";
ACC_STATES.forEach(function(o){
var on=u.status===o[0];
h+="<button type='button' class='accbox "+o[1]+(on?" on":"")+"'";
if(legend){h+=" aria-disabled='true' tabindex='-1'";}
else{h+=" data-act='accSet' data-id='"+esc(u.id)+"' data-st='"+o[0]+"' role='checkbox' aria-checked='"+on+"'";}
h+="><span class='bx'>"+(on?"✓":"")+"</span><span class='lbl'>"+o[2]+"</span></button>";});
return h+"</div>";}
function setAccess(id,st){
  if(!isAdmin())return;
  regLoad();
  var u=null,i;
  for(i=0;i<REG.users.length;i++)if(REG.users[i].id===id)u=REG.users[i];
  if(!u)return;
  u.status=st;u.at=Date.now();
  regLog((st==="granted"?"ACCÈS accordé":(st==="denied"?"REFUS":"RÉVOCATION"))+" — "+u.name);
  if(st==="granted"&&!STORE.get(PKEY))publish(true);
  regSave();
  osNotify("MECADATA — décision d'accès",u.name+" : "+(st==="granted"?"accès accordé":(st==="denied"?"refusé":"révoqué")));
  updateMeta();if(S.view==="admin")render();
  toast(st==="granted"?"ok":(st==="denied"?"warn":"err"),st==="granted"?"Accès accordé":(st==="denied"?"Accès refusé":"Accès révoqué"),u.name+" — décision appliquée en temps réel.");
  beep(st==="granted"?"ok":"del");
}

/* ══════════ PLAN 200 000 km ══════════ */
function svcFor(e){var L=window.MD_RAW.svc,i,j;
for(i=0;i<L.length;i++){var s=L[i];if(s.fams.indexOf("*")>-1)continue;for(j=0;j<s.fams.length;j++)if(s.fams[j]===e.fam)return s;}
for(i=0;i<L.length;i++)if(L[i].fams.indexOf("*")>-1&&L[i].fuel===e.fuel)return L[i];return L[0];}
function buildPlan(e,m,b){var s=svcFor(e),base=s.base,mo=s.months,v=[],km,i,j,an=Math.max(8000,Math.round(base*(12/Math.max(1,mo))));
for(km=base;km<=KMMAX;km+=base){var ops=[],ct=[];
for(i=0;i<s.items.length;i++){var it=s.items[i];
if(it[1]>0){if(km%it[1]===0)ops.push(it[0]);}
else if(it[2]>0){var due=Math.round(an*it[2]/12);if(due>0&&km%Math.max(base,Math.round(due/base)*base)===0)ops.push(it[0]+" (échéance "+it[2]+" mois)");}}
if(s.dist[1]>0&&km>=s.dist[1]&&km-s.dist[1]<base)ops.push(s.dist[0]+" — REMPLACEMENT ("+fmt(s.dist[1])+" km / "+s.dist[2]+" mois)");
if(!ops.length)ops.push("Révision intermédiaire constructeur");
for(j=0;j<s.controls.length;j++)ct.push(s.controls[j]);
v.push({km:km,mo:Math.round(km/an*12),ops:ops,ctrl:ct});}
if(s.dist[1]>KMMAX)v.push({km:s.dist[1],mo:s.dist[2],ops:[s.dist[0]+" — REMPLACEMENT"],ctrl:["Contrôle tension et guides"]});
v.sort(function(a,b2){return a.km-b2.km;});
return {svc:s,visits:v,base:base,months:mo,annual:an,brand:b,model:m,engine:e};}
function planHTML(pl,compact){var s=pl.svc,e=pl.engine,m=pl.model,b=pl.brand,h="",i,j,fl=s.fluids;
h+="<div class='selcard'><h3>"+ic("car","width:16px;height:16px")+" "+esc((b?b.n:"")+" "+(m?m.n:""))+" · "+esc(e.label)+"</h3><div class='sg'>";
[["Phase",m?m.phase:"—"],["Code moteur",e.code],["Puissance",e.hp+" ch"],["Boîte",e.gb],["Production",e.y[0]+"-"+e.y[1]],["Intervalle",fmt(pl.base)+" km / "+pl.months+" mois"]].forEach(function(r){h+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";});
h+="</div></div><div class='oil'><div class='oc'><span>"+ic("oil","width:11px;height:11px")+"HUILE</span><b>"+esc(s.oil[0])+"</b><p>"+(s.oil[1]?s.oil[1]+" L · ":"")+esc(e.fam)+"</p></div>";
h+="<div class='oc b'><span>"+ic("piston","width:11px;height:11px")+"DISTRIBUTION</span><b>"+esc(s.dist[0])+"</b><p>"+(s.dist[1]?fmt(s.dist[1])+" km"+(s.dist[2]?" / "+s.dist[2]+" mois":""):"Chaîne — sans remplacement programmé")+"</p></div></div>";
h+="<div class='sg' style='margin-bottom:12px'>"+[["Liquide de freins",fl[0]],["Refroidissement",fl[1]],["Couple roues",fl[2]+" Nm"],["Pression pneus",fl[3]+" / "+fl[4]+" bar"],["Fluide clim",fl[5]],["Batterie 12V",fl[6]]].map(function(r){return "<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+esc(r[1])+"</b></div>";}).join("")+"</div>";
h+="<div class='tw' style='max-height:"+(compact?"380px":"none")+";overflow:auto'><table class='vtab'><thead><tr><th>Kilométrage</th><th>Échéance</th><th>Interventions</th><th>Contrôles systématiques</th></tr></thead><tbody>";
for(i=0;i<pl.visits.length;i++){var v=pl.visits[i];h+="<tr><td class='km'>"+fmt(v.km)+" km</td><td class='ct'>"+v.mo+" mois</td><td><ul>";
for(j=0;j<v.ops.length;j++)h+="<li>"+esc(v.ops[j])+"</li>";h+="</ul></td><td class='ct'>"+esc(v.ctrl.join(" · "))+"</td></tr>";}
h+="</tbody></table></div><p class='dim mono' style='font-size:9.5px;margin-top:9px'>PLAN COMPLET JUSQU'À 200 000 KM — CARNET CONSTRUCTEUR PRIORITAIRE.</p>";return h;}
function dueHTML(pl){var km=clamp(+S.calc.km||0,0,400000),yr=clamp(+S.calc.year||2021,2005,YMAX),sev=+S.calc.sev||1;
var now=new Date(),age=Math.max(1,(now.getFullYear()-yr)*12+now.getMonth()),rows=[],s=pl.svc,i;
var base=Math.round(pl.base*sev),next=Math.max(base,Math.ceil((km+1)/base)*base),rem=next-km;
rows.push({op:"Révision "+fmt(next)+" km",u:rem/base,badge:rem<=1500?"ÉCHÉANCE PROCHE":(rem<=base*0.2?"BIENTÔT":"DANS "+fmt(rem)+" KM"),cls:rem<=1500?"now":(rem<=base*0.2?"soon":"ok"),pct:clamp((base-rem)/base*100,0,100),detail:"Prochaine révision à "+fmt(next)+" km"});
for(i=0;i<s.items.length;i++){var it=s.items[i];if(it[1]<=0||it[1]<=base)continue;
var ik=Math.round(it[1]*sev),nx=Math.max(ik,Math.ceil((km+1)/ik)*ik),rm=nx-km;
rows.push({op:it[0],u:rm/ik,badge:rm<=1500?"À FAIRE":(rm<=ik*0.2?"BIENTÔT":"DANS "+fmt(rm)+" KM"),cls:rm<=1500?"now":(rm<=ik*0.2?"soon":"ok"),pct:clamp((ik-rm)/ik*100,0,100),detail:"Échéance "+fmt(nx)+" km"});}
if(s.dist[1]>0){var dk=s.dist[1],dr=dk-km;rows.push({op:"Distribution : "+s.dist[0],u:Math.max(0,dr)/dk,badge:dr<=0?"DÉPASSÉ":(dr<=10000?"À PLANIFIER":"DANS "+fmt(Math.max(0,dr))+" KM"),cls:dr<=0?"now":(dr<=10000?"soon":"ok"),pct:clamp(km/dk*100,0,100),detail:"Remplacement à "+fmt(dk)+" km / "+s.dist[2]+" mois"});}
var bf=Math.ceil(age/24)*24,br=bf-age;
rows.push({op:"Liquide de freins",u:br/24,badge:br<=1?"À FAIRE":(br<=3?"BIENTÔT":"DANS "+br+" MOIS"),cls:br<=1?"now":(br<=3?"soon":"ok"),pct:clamp((24-br)/24*100,0,100),detail:"Échéance temporelle 24 mois"});
rows.sort(function(a,b){return a.u-b.u;});var h="";
rows.forEach(function(r){var dc=r.cls==="now"?"#FF4D5E":(r.cls==="soon"?"#FFAF2E":"#43E08B");
h+="<div class='drow' style='--dc:"+dc+"'><div class='dr1'><b>"+esc(r.op)+"</b><span class='dbadge "+r.cls+"'>"+r.badge+"</span></div><div class='pb'><i style='width:"+Math.round(r.pct)+"%'></i></div><div class='dim mono' style='font-size:9.5px;margin-top:5px'>"+esc(r.detail)+"</div></div>";});
return h;}

/* ══════════ SAUVEGARDE / DIFFUSION ══════════ */
function saveNow(){if(!isAdmin())return;safe("save",function(){STORE.set(KEY,JSON.stringify({v:84,db:DB,audit:AUDIT.slice(-60),prefs:PREF,wp:WP.P,ts:Date.now()}));LASTSAVE=Date.now();DIRTY=false;updStor();},null);}
var save=deb(saveNow,350);window.MD_saveState=save;
function markDirty(){if(!isAdmin())return;DIRTY=true;save();}
function audit(t,m){AUDIT.push({ts:Date.now(),type:t,msg:m});if(AUDIT.length>120)AUDIT=AUDIT.slice(-120);}
function snapshot(l){UNDO={label:l,db:clone(DB)};}
function doUndo(){if(!UNDO)return;DB=UNDO.db;var l=UNDO.label;UNDO=null;mutate("imp","Annulation : "+l);toast("ok","Action annulée");}
function publish(auto){if(!isAdmin())return;STORE.set(PKEY,JSON.stringify({ts:Date.now(),rev:REG.rev,db:DB}));
regLog("Diffusion rév. "+REG.rev+(auto?" (auto)":""));regSave();bcast({t:"pub",rev:REG.rev});
if(!auto)toast("ok","Diffusé aux tiers","Révision "+REG.rev+" — "+fmt(META.counts.e)+" motorisations.");}
function mutate(t,m){recompute();audit(t,m);markDirty();if(REG.live&&isAdmin())publish(true);updateMeta();render();if(S.drawer)renderDrawer();}

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

/* ══════════ CLOCHE + GESTIONNAIRE ══════════ */
function ensureBell(){
  var top=$("#top");if(!top)return;
  var b=$("#bellb");
  if(!b){b=document.createElement("button");b.className="tb";b.id="bellb";b.type="button";
    b.setAttribute("data-act","openAccess");b.setAttribute("aria-label","Gestionnaire d'accès tiers");
    b.innerHTML=ic("bell")+"<span class='bbadge' hidden>0</span>";
    var ref=$("#diagb");if(ref&&ref.parentNode===top)top.insertBefore(b,ref);else top.appendChild(b);}
  if(!b.querySelector(".bbadge")){var s=document.createElement("span");s.className="bbadge";s.hidden=true;s.textContent="0";b.appendChild(s);}
  if(!b.__wired){b.__wired=true;b.addEventListener("click",function(ev){ev.preventDefault();ev.stopPropagation();openAccess();},true);}
  var na=$("#navAcc");
  if(na&&!na.__wired){na.__wired=true;na.addEventListener("click",function(ev){ev.preventDefault();ev.stopPropagation();openAccess();},true);}
}
function bellRefresh(){
  ensureBell();
  var b=$("#bellb");if(!b)return;
  var pc=pendingCount();
  b.hidden=!isAdmin();b.classList.toggle("has",pc>0);
  var badge=b.querySelector(".bbadge");
  if(badge){badge.hidden=pc===0;badge.textContent=pc>9?"9+":pc;}
  b.title=pc>0?(pc+" demande(s) d'accès en attente — cliquer pour ouvrir le gestionnaire"):"Gestionnaire d'accès tiers";
  var nb=$("#navBdg");if(nb){nb.hidden=!(isAdmin()&&pc>0);nb.textContent=pc;}
  var na=$("#navAcc");if(na)na.style.display=isAdmin()?"":"none";
  if(ACC_OPEN){var body=$("#accBody");if(body)body.innerHTML=accessBody();var chip=$("#accChip");if(chip)chip.textContent=pc+" en attente";}
  var b2=$("#accBody2");if(b2&&S.view==="admin"&&S.adm.tab==="access")b2.innerHTML=accessBody();
}
function accessBody(){
var h="",pc=pendingCount();
h+="<div class='banner' style='margin-bottom:12px'>"+ic("bcast","width:15px;height:15px;color:#FFD60A")+"<b>"+pc+" demande(s) en attente</b><span class='dim' style='font-size:11px'>Cochez une case : décision immédiate, tiers notifié.</span>";
h+="<button class='btn xs ghost' data-act='syncNow' style='margin-left:auto'>"+ic("reset","width:11px;height:11px")+"Synchroniser</button>";
h+="<button class='btn xs ghost' data-act='notifTest'>"+ic("bell","width:11px;height:11px")+"Tester</button></div>";
if(!REG_OK)h+="<div class='syncwarn'>"+ic("alert","width:13px;height:13px")+" Stockage web limité sur cet appareil : le registre passe par le bridge natif, sinon par code/fichier. Utilisez « Synchroniser » après chaque import.</div>";
h+="<div class='card panel' style='margin-bottom:12px'><h3>"+ic("ul")+"Recevoir une demande d'un autre appareil</h3>";
h+="<p class='muted' style='font-size:11.5px;margin-bottom:8px'>Collez le code <span class='mono'>MDR1-…</span> du tiers ou importez son fichier <span class='mono'>demande-acces-….json</span>.</p>";
h+="<div style='display:flex;gap:7px;flex-wrap:wrap'><input class='inp mono' id='admCode' placeholder='MDR1-…' value='"+esc(S.adm.code)+"' style='flex:1;min-width:180px'><button class='btn sm pri' data-act='admCodeAdd'>"+ic("plus")+"Ajouter par code</button></div>";
h+="<div style='margin-top:8px'><button class='btn sm ghost' data-act='accFilePick'>"+ic("file")+"Importer le fichier de demande</button><input type='file' id='accFile' accept='.json,application/json' style='display:none'></div></div>";
if(!REG.users.length){
h+="<div class='accempty'>"+ic("users","width:26px;height:26px")+"<p style='margin-top:8px'>Aucune demande d'accès pour le moment.</p><p class='dim' style='font-size:11.5px;margin-top:5px'>Le tiers saisit son prénom : la demande remonte ici (même appareil), ou via code/fichier (autre appareil).</p>";
h+="<p class='lb' style='margin-top:14px'>Les 3 décisions disponibles</p>"+accBoxesHTML({id:"__legend__",status:"pending"},true)+"</div>";
return h;}
var ord={pending:0,granted:1,denied:2,revoked:3};
REG.users.slice().sort(function(a,b){var d=(ord[a.status]||9)-(ord[b.status]||9);return d!==0?d:b.ts-a.ts;}).forEach(function(u){
var col=u.status==="granted"?"#43E08B":(u.status==="pending"?"#FFD60A":(u.status==="denied"?"#FFAF2E":"#FF4D5E"));
var lab=u.status==="pending"?"EN ATTENTE":(u.status==="granted"?"ACCÈS ACTIF":(u.status==="denied"?"REFUSÉ":"RÉVOQUÉ"));
h+="<div class='accrow"+(u.status==="pending"?" pending":"")+"'><div class='ah'><span class='an'>"+esc(u.name)+"</span><span class='accstate' style='color:"+col+"'>"+lab+"</span>";
h+="<span class='am'>demande "+new Date(u.ts).toLocaleString("fr-FR")+"</span>";
if(u.at)h+="<span class='am'>· décision "+new Date(u.at).toLocaleTimeString("fr-FR")+"</span>";
h+="<button class='btn xs ghost' data-act='accDel' data-id='"+u.id+"' style='margin-left:auto'>"+ic("trash","width:11px;height:11px")+"</button></div>";
h+=accBoxesHTML(u,false);
if(u.status==="granted"){h+="<div class='codebox'>"+esc(grantCode(u))+"</div><button class='btn xs ghost' data-act='copyGrant' data-id='"+u.id+"' style='margin-top:6px'>"+ic("dl","width:11px;height:11px")+"Copier le code d'accord</button>";}
h+="</div>";});
h+="<div class='card panel' style='margin-top:12px'><h3>"+ic("clock")+"Journal des décisions</h3><div class='journal'>";
if(!REG.log.length)h+="<p class='dim'>Aucune activité.</p>";
REG.log.slice(0,25).forEach(function(l){h+="<div class='jr'><time>"+new Date(l.ts).toLocaleTimeString("fr-FR")+"</time><span>"+esc(l.a)+"</span></div>";});
return h+"</div></div>";}
function openAccess(){
  if(!isAdmin()){gateShow("admin",{force:true,focus:true});return;}
  regLoad();notifyPending();ACC_OPEN=true;
  var h="<div class='mh'>"+ic("bell","color:#FFD60A")+"<h3>Gestionnaire d'accès tiers</h3><span class='chip warn' id='accChip'>"+pendingCount()+" en attente</span><button class='tb' data-act='accClose'>"+ic("x")+"</button></div>";
  h+="<div class='mb2' id='accBody'>"+accessBody()+"</div><div class='mf'><button class='btn ghost sm' data-act='syncNow'>"+ic("reset")+"Synchroniser</button><button class='btn ghost sm' data-act='accGoAdmin'>"+ic("db")+"Administration</button><button class='btn pri' data-act='accClose'>Fermer</button></div>";
  openModal(h,"wide");beep("open");
  syncNow(true);
}
window.MD_openAccess=openAccess;
window.MD_notifyPending=function(){regLoad();return notifyPending();};
window.MD_syncAccess=function(){syncNow(false);};

/* ══════════ RECHERCHE ══════════ */
var SYN={puretech:["eb2"],hdi:["dv5","dw10"],bluehdi:["dv5","dw10"],tsi:["ea211","ea888","dpca"],tdi:["ea288","dsua"],tce:["h4dt","h5ht","hr12"],dci:["k9k","m9r","r9m"],courroie:["courroie","distribution"],chaine:["chaine","aac"],adblue:["adblue","scr","nox"],scr:["scr","nox"],egr:["egr"],fap:["fap","dpf"],turbo:["turbo"],rappel:["rappel"],tsb:["tsb","bulletin"],panne:["panne"],eat8:["eat8"],dsg:["dq200","dq381"],zf8:["zf8"],frein:["frein","freinage"],clim:["clim"],batterie:["batterie","12v"],ecran:["ecran","bsi"]};
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
h+="<p>"+fmt(c.f)+" pannes détaillées, "+fmt(c.t)+" bulletins dont <b style='color:#FFD60A'>"+fmt(c.rc)+" campagnes de rappel</b>, "+c.dom+" domaines techniques, plans d'entretien complets jusqu'à 200 000 km. Couverture motorisations : 100 %.</p>";
h+="<div class='hint' style='padding:9px 0 0;position:relative'>";["3008 courroie","3008 rappel","1.5 BlueHDi chaine","AdBlue SCR","EGR FAP","EAT8 à-coups","Ioniq 5 ICCU","pompe à vide"].forEach(function(s){h+="<button data-act='omniSeed' data-q='"+esc(s)+"'>"+ic("search","width:9px;height:9px")+esc(s)+"</button>";});h+="</div>";
h+="<div class='acts'><a class='btn pri' href='#/explorer'>"+ic("car")+"Sélection précise du parc</a><button class='btn grn' data-act='goDiag'>"+ic("stetho")+"Autovérification</button>";
if(isAdmin())h+="<button class='btn amb' data-act='openAccess'>"+ic("bell")+"Accès tiers ("+pendingCount()+")</button><button class='btn' data-act='goAdmin'>"+ic("db")+"Administration</button>";
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
h+="<div class='vh'><div><span class='kick'>MODULE 05 — STUDIO FOND D'ÉCRAN</span><h1>FONDS <i>DYNAMIQUES</i></h1><div class='sub'>8 scènes animées, palette entièrement pilotable, vitesse et sens de défilement."+((isTier())?" En session tiers, les réglages ne sont pas enregistrés.":"")+"</div></div>";
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
function vAdmin(){if(!isAdmin())return "<div class='empty'>"+ic("lock")+"<p>Module réservé à la session administrateur.</p></div>";
var A=S.adm,h="";
h+="<div class='vh'><div><span class='kick'>MODULE 06 — ADMINISTRATION ING-3</span><h1>BASE · ACCÈS · <i>DIFFUSION</i></h1><div class='sub'>Import multi-formats, méga-base, gestion des accès tiers en temps réel et diffusion contrôlée.</div></div>";
h+="<div style='display:flex;gap:7px'><button class='btn sm amb' data-act='openAccess'>"+ic("bell")+"Cloche d'accès ("+pendingCount()+")</button><button class='btn sm ghost' data-act='logout'>"+ic("lock")+"Quitter</button></div></div>";
h+="<div class='banner'>"+ic("bcast","width:15px;height:15px;color:#FFD60A")+"<b>Diffusion temps réel</b><label class='sw'><input type='checkbox' data-act='liveToggle' "+(REG.live?"checked":"")+"><i></i></label><span class='dim mono'>rév. "+(REG.rev||0)+"</span><button class='btn sm pri' data-act='publish'>"+ic("bcast")+"Diffuser maintenant</button>";
h+="<span class='dim' style='font-size:11px'>"+(REG.live?"Toute correction ou import est diffusé automatiquement.":"Diffusion manuelle : les tiers ne voient que la dernière révision publiée.")+"</span></div>";
h+="<div class='atabs'>";[["files","FICHIERS","db",DB.engines.length],["mega","MÉGA-BASE","spark",window.MD_RAW.cand.length],["import","IMPORT","ul",""],["access","ACCÈS TIERS","users",pendingCount()],["journal","JOURNAL","clock",AUDIT.length]].forEach(function(t){
h+="<button class='at "+(A.tab===t[0]?"on":"")+"' data-act='admTab' data-t='"+t[0]+"'>"+ic(t[2],"width:13px;height:13px")+t[1]+(t[3]!==""?"<span class='n'>"+t[3]+"</span>":"")+"</button>";});h+="</div>";
if(A.tab==="files"){h+="<div class='fgrid'>";
FILES.forEach(function(f){var a=DB[f[0]],k=Math.round(JSON.stringify(a).length/1024);
h+="<div class='card hov filecard'><div class='fn'>"+ic("file")+f[1]+"</div><div class='ct'>"+fmt(a.length)+" <small>entrées</small></div><div class='dim mono' style='font-size:9px'>"+k+" Ko · "+f[2]+"</div><div class='fa'><button class='btn xs ghost' data-act='fileExp' data-k='"+f[0]+"'>"+ic("dl","width:11px;height:11px")+"JSON</button><button class='btn xs amb' data-act='admTab' data-t='import'>"+ic("ul","width:11px;height:11px")+"Importer</button></div></div>";});
h+="</div><div class='tools'><button class='btn pri sm' data-act='expAll'>"+ic("dl")+"Exporter la base</button><button class='btn ghost sm' data-act='saveNow'>"+ic("save")+"Sauvegarder</button><button class='btn ghost sm' data-act='integrity'>"+ic("check")+"Intégrité</button><button class='btn dgr sm' data-act='askReset'>"+ic("reset")+"Base usine</button></div>";
h+="<div class='card panel'><h3>"+ic("info")+"État de la base</h3><div class='sg'>";
[["Marques",META.counts.b],["Modèles",META.counts.m],["Motorisations",META.counts.e],["Pannes",META.counts.f],["TSB / rappels",META.counts.t],["Domaines",META.counts.dom],["Familles moteur",META.counts.fam],["Liaisons",META.links],["Corrélations",META.corr],["Intégrité",META.integ.pct+" %"],["Modèles sans moteur",uncoveredModels().length],["Poids",META.size+" Ko"]].forEach(function(r){h+="<div class='sp'><span>"+esc(r[0])+"</span><b class='hl'>"+fmt(r[1])+"</b></div>";});h+="</div></div>";}
else if(A.tab==="mega"){var q=A.mega.trim().toLowerCase();
var cands=window.MD_RAW.cand.filter(function(c){return !q||(c.brand+" "+c.model+" "+c.code+" "+c.label+" "+c.note).toLowerCase().indexOf(q)>-1;});
h+="<div class='card panel' style='margin-bottom:12px'><h3>"+ic("spark")+"Mise à jour méga-base</h3><p class='muted' style='font-size:12px;margin-bottom:10px'>Candidats 2025-2027 : nouvelles marques, modèles commercialisés et motorisations corrélées. Intégration immédiate, diffusion sur votre accord.</p>";
h+="<div class='fr f2'><div><label class='lb'>Recherche candidat</label><input class='inp' type='search' data-mega='q' value='"+esc(A.mega)+"' placeholder='Marque, modèle, code, technologie…'></div>";
h+="<div><label class='lb'>Corrélation sélection module 2</label><input class='inp' value='"+esc(S.sel.b?(BIDX[S.sel.b]?BIDX[S.sel.b].n:"")+" "+(S.sel.m&&MIDX[S.sel.m]?MIDX[S.sel.m].n:""):"aucune sélection")+"' disabled></div></div>";
h+="<div style='display:flex;gap:7px;margin-top:10px;flex-wrap:wrap'><button class='btn sm pri' data-act='megaAll'>"+ic("plus")+"Intégrer les "+cands.length+" résultat(s)</button><button class='btn sm ghost' data-act='megaSel'>"+ic("car")+"Filtrer sur la marque sélectionnée</button></div></div>";
h+="<div class='tw'><table class='t'><thead><tr><th>Type</th><th>Marque</th><th>Modèle / phase</th><th>Motorisation</th><th>Période</th><th>Note</th><th></th></tr></thead><tbody>";
cands.forEach(function(c){var bi=BIDX[c.brand];
h+="<tr><td><span class='tag'>"+esc(c.type)+"</span></td><td>"+esc(bi?bi.n:c.brand)+"</td><td><b>"+esc(c.model)+"</b> <span class='tag'>phase "+c.phase+"</span></td><td class='mono'>"+esc(c.label)+" · "+c.hp+" ch · "+esc(c.code)+"</td><td class='mono'>"+c.y0+"-"+c.y1+"</td><td class='dim' style='font-size:11px'>"+esc(c.note)+"</td><td><button class='btn xs pri' data-act='megaAdd' data-i='"+window.MD_RAW.cand.indexOf(c)+"'>Intégrer</button></td></tr>";});
h+="</tbody></table></div>";}
else if(A.tab==="import"){h+="<div class='card panel'><h3>"+ic("ul")+"Import universel multi-formats</h3>";
h+="<div class='dz' id='dz' data-act='dzPick'>"+ic("ul")+"<div><b>Déposer un fichier</b> ou cliquer</div><div class='dim mono' style='font-size:10px;margin-top:4px'>VALIDATION AVANT ÉCRITURE · FUSION SANS DOUBLON</div></div>";
h+="<div class='fmtrow'><span>JSON</span><span>JSONL</span><span>CSV</span><span>TSV</span><span>XML</span><span>YAML</span><span>HTML</span><span>XLSX</span><span>ODS</span><span>JS</span><span>TXT</span></div><input type='file' id='impFile' style='display:none'>";
h+="<div style='margin-top:12px'><label class='lb'>…ou coller les données</label><textarea class='inp mono' id='impText' rows='7'></textarea></div><div id='impReport'></div>";
h+="<div style='display:flex;gap:7px;margin-top:11px;flex-wrap:wrap'><button class='btn ghost sm' data-act='impAnalyze'>"+ic("check")+"Analyser</button><button class='btn pri sm' id='impApply' data-act='impApply' disabled>"+ic("ul")+"Fusionner dans la base</button></div></div>";}
else if(A.tab==="access"){h+="<div class='card panel'><h3>"+ic("users")+"Gestionnaire d'accès tiers<span class='chip'>"+pendingCount()+" en attente</span></h3><div id='accBody2'>"+accessBody()+"</div></div>";}
else{h+="<div class='card panel'><h3>"+ic("clock")+"Journal de la base</h3><div class='journal'>";
AUDIT.slice().reverse().slice(0,60).forEach(function(a){h+="<div class='jr'><time>"+new Date(a.ts).toLocaleString("fr-FR")+"</time><span class='jt'>"+esc(a.type.toUpperCase())+"</span><span>"+esc(a.msg)+"</span></div>";});h+="</div></div>";}
return h;}
function vDiag(){var fl=TESTS.filter(function(t){return !t.ok&&!t.soft;}).length,wn=TESTS.filter(function(t){return !t.ok&&t.soft;}).length,col=fl?"#FF4D5E":(wn?"#FFAF2E":"#43E08B"),h="";
h+="<div class='vh'><div><span class='kick'>MODULE 07 — AUTOVÉRIFICATION</span><h1>DIAGNOSTIC <i>SYSTÈME</i></h1><div class='sub'>Moteur v"+window.__MD_VER+" · correctif "+window.__MD_FIX+" — remontée de demande garantie.</div></div><div style='display:flex;gap:7px;flex-wrap:wrap'><button class='btn sm grn' data-act='runTests'>"+ic("reset")+"Relancer</button>";
if(isAdmin())h+="<button class='btn sm amb' data-act='autoFix'>"+ic("tool")+"Auto-réparation</button>";
h+="<button class='btn sm ghost' data-act='syncNow'>"+ic("reset")+"Synchroniser les accès</button>";
h+="<button class='btn sm ghost' data-act='notifTest'>"+ic("bell")+"Tester la notification</button></div></div>";
h+="<div class='card panel' style='margin-bottom:12px;border-left:3px solid "+col+"'><h3>"+ic("stetho","color:"+col)+"Résultat<span class='chip' style='color:"+col+";border-color:"+col+"'>"+(TESTS.length-fl)+"/"+TESTS.length+" OK</span></h3>";
h+="<p class='muted'>"+(fl?"<b style='color:#FF4D5E'>"+fl+" test(s) bloquant(s).</b>":"<b style='color:#43E08B'>Système opérationnel — aucune erreur.</b>")+(wn?" "+wn+" avertissement(s) non bloquant(s).":"")+(AUTOFILL?" <span class='mono' style='color:#43E08B'>"+AUTOFILL+" motorisation(s) appariée(s).</span>":"")+"</p></div>";
h+="<div class='card panel'><h3>"+ic("check")+"Détail des contrôles</h3><div class='tests'>";
TESTS.forEach(function(t){var c=t.ok?"#43E08B":(t.soft?"#FFAF2E":"#FF4D5E");
h+="<div class='tst' style='--tc:"+c+"'><span class='ti'>"+(t.ok?"OK":(t.soft?"!":"X"))+"</span><div style='flex:1'><b>"+esc(t.n)+"</b><small>"+esc(t.info)+"</small></div></div>";});
h+="</div></div>";return h;}
function render(){var v=S.view,m=$("#view");if(v!=="studio")WP.detach();
$$(".nv[data-v],#tabs a").forEach(function(a){a.classList.toggle("on",a.dataset.v===v);});
var h="";try{h=v==="bord"?vBord():v==="explorer"?vExplorer():v==="tech"?vTech():v==="entretien"?vEntretien():v==="studio"?vStudio():v==="admin"?vAdmin():vDiag();}
catch(e){logErr("render "+v,e);h="<div class='card panel'><h3>"+ic("alert")+"Erreur de rendu</h3><p class='muted'>"+esc(e.message)+"</p></div>";}
m.innerHTML=reqBannerHTML()+h;mountAnim(m);updateMeta();
if(v==="studio"){var cv=$("#pv");if(cv){WP.attach(cv);WP.fx();WP.sync();}}}
function updateMeta(){var c=META.counts;
$("#nEng").textContent=fmt(c.e);$("#nTech").textContent=fmt(c.f+c.t);$("#nPlan").textContent=fmt(c.dom);
$("#stLinks").textContent=fmt(META.links);$("#stCorr").textContent=fmt(META.corr);$("#stInt").textContent=META.integ.pct+"%";$("#stSize").textContent=META.size+" Ko";
$("#stDiff").textContent=isAdmin()?(REG.live?"AUTO rév."+REG.rev:"MANUEL rév."+(REG.rev||0)):(isTier()?"LECTURE rév."+(REG.rev||0):"—");
var fl=TESTS.filter(function(t){return !t.ok&&!t.soft;}).length;
$("#stTest").textContent=TESTS.length?((TESTS.length-fl)+"/"+TESTS.length):"—";$("#nTest").textContent=TESTS.length?(fl?"!":"OK"):"—";
$("#diagb").classList.toggle("on",TESTS.length>0&&fl===0);
$("#ichip").className="chip "+(META.integ.ok?"ok":"bad");$("#itxt").textContent=META.integ.ok?"INTÈGRE":"ERREURS "+META.integ.err.length;
$("#admb").innerHTML=ic(isAdmin()?"unlock":"lock");$("#admb").classList.toggle("on",isAdmin());
$("#rtxt").textContent=isAdmin()?"Administrateur ING-3 — "+pendingCount()+" demande(s) en attente.":(isTier()?"Tiers "+tierName()+" — lecture seule, sans sauvegarde.":"Session non ouverte.");
$("#sndb").innerHTML=ic(PREF.sound?"snd":"mute");$("#sndb").classList.toggle("on",PREF.sound);
var na=$("#navAdmin");if(na)na.style.display=isTier()?"none":"";
var vc=$("#verchip");if(vc)vc.textContent="v"+window.__MD_VER;
bellRefresh();updStor();}
function updStor(){var k=META.size||0,b=$("#sbar"),t=$("#stxt");if(b)b.style.width=clamp(k/8192*100,2,100)+"%";
var lay=BRIDGE?"bridge natif":STORE.backend();
if(t)t.textContent=k+" Ko · "+(isAdmin()?lay+" · "+(LASTSAVE?new Date(LASTSAVE).toLocaleTimeString("fr-FR"):"—"):"tiers : aucun stockage");}

/* ══════════ IMPORT BASE ══════════ */
function pick(r,names){var i;for(i=0;i<names.length;i++){var v=r[names[i]];if(v!==undefined&&v!==null&&v!=="")return v;}
var map={},ks=Object.keys(r);for(i=0;i<ks.length;i++)map[nk(ks[i])]=r[ks[i]];
for(i=0;i<names.length;i++){var w=nk(names[i]);if(map[w]!==undefined&&map[w]!==null&&map[w]!=="")return map[w];}return undefined;}
var COLL2={};[["brands",["brands","marques","constructeurs","makers"]],["models",["models","modeles","vehicles","vehicules","cars"]],["engines",["engines","motorisations","moteurs","powertrains"]],["faults",["faults","pannes","fiches","defects","problemes"]],["tsb",["tsb","bulletins","campagnes","rappels","recalls"]]].forEach(function(p){p[1].forEach(function(k){COLL2[nk(k)]=p[0];});});
var IGN={counts:1,domaines:1,domains:1,categories:1,meta:1,metadata:1,app:1,exportversion:1,exportedat:1,version:1,revisions:1,plans:1,entretien:1,maintenance:1};
function detectKind(r){if(!r||typeof r!=="object")return null;
if(pick(r,["hp","power","puissance","ch","puissance_ch","kw"])!==undefined||pick(r,["code_moteur","engine_code"])!==undefined)return "engines";
if(pick(r,["ref","reference","numero"])!==undefined&&pick(r,["date","published"])!==undefined)return "tsb";
if(pick(r,["sev","severity","severite","gravite","criticite"])!==undefined)return "faults";
if(pick(r,["segment","carrosserie"])!==undefined)return "models";
if(pick(r,["marque","brand","make"])!==undefined&&pick(r,["modele","model","nom","name"])!==undefined)return "models";
if(pick(r,["pays","country"])!==undefined)return "brands";return null;}
function classify(data){var g={},ig=[];
function consider(key,arr){if(IGN[key]){ig.push(key);return;}var k=COLL2[key]||null;if(!k&&arr.length)k=detectKind(arr[0]);if(!k){ig.push(key);return;}if(!g[k])g[k]=[];g[k]=g[k].concat(arr);}
(function scan(o){if(!o||typeof o!=="object"||Array.isArray(o))return;Object.keys(o).forEach(function(k){var v=o[k],key=nk(k);if(Array.isArray(v)){if(v.length)consider(key,v);}else if(v&&typeof v==="object")scan(v);});})(data);
return {groups:g,ignored:ig};}
function mapRec(r,kind){
if(kind==="brands"){var n=pick(r,["n","name","nom","marque","brand","make"]);if(!n)throw "nom manquant";
return {id:String(pick(r,["id","uid","key"])||("B-"+slug(n))),n:String(n).trim(),pays:String(pick(r,["pays","country","origine"])||"—"),grp:String(pick(r,["grp","group","alliance"])||"—")};}
if(kind==="models"){var mn=pick(r,["n","name","nom","model","modele","label"]);if(!mn)throw "nom manquant";
var br=pick(r,["b","brand","marque","make"]);if(!br)throw "marque manquante";
return {id:String(pick(r,["id","uid","key"])||("M-"+slug(br)+"-"+slug(mn))),b:String(br).trim(),bRaw:String(br).trim(),n:String(mn).trim(),y:[+(pick(r,["y0","annee_debut","from"])||2017),+(pick(r,["y1","annee_fin","to"])||YMAX)],seg:String(pick(r,["seg","segment","carrosserie"])||"Compacte"),phase:+(pick(r,["phase","generation","gen"])||1)};}
if(kind==="engines"){var code=pick(r,["code","code_moteur","engine_code"]);if(!code)throw "code manquant";
var fam=pick(r,["fam","family","famille"])||code,lab=pick(r,["label","name","nom","designation"]);if(!lab)throw "libellé manquant";
var fu=nfuel(pick(r,["fuel","energie","carburant"])),hp=+(pick(r,["hp","power","puissance","ch","puissance_ch"])||0),kw=+(pick(r,["kw","puissance_kw"])||0);
if(!hp&&kw)hp=Math.round(kw*1.3596);if(!(hp>0&&hp<=3000))throw "puissance invalide";
var mr=split(pick(r,["m","models","modeles","modele","model","vehicle"]));
if(!mr.length){var mb=pick(r,["marque","brand"]),mo=pick(r,["modele","model"]);if(mb&&mo)mr=[mb+" "+mo];else if(mo)mr=[String(mo)];}
if(!mr.length)throw "aucun modèle lié";
return {id:"",m:[],mRaw:mr,code:String(code).trim(),fam:String(fam).trim(),label:String(lab).trim(),fuel:fu,disp:+(pick(r,["disp","cylindree","cm3"])||0),hp:Math.round(hp),nm:+(pick(r,["nm","torque","couple"])||0),kw:Math.round(hp*0.7355),y:[+(pick(r,["y0","annee_debut","from"])||2017),+(pick(r,["y1","annee_fin","to"])||YMAX)],gb:String(pick(r,["gb","boite","transmission"])||"BVM"),norm:fu==="b"?"ZE":"Euro 6",cyl:fu==="b"?"ÉLEC":"L4",asp:fu==="b"?"—":"Turbo",inj:fu==="b"?"—":(fu==="d"?"Common Rail":"Injection directe"),auto:0};}
if(kind==="faults"){var t=pick(r,["t","title","titre","name","nom","panne"]);if(!t)throw "titre manquant";
var c0=+(pick(r,["cost0","cout_min"])||0),c1=+(pick(r,["cost1","cout_max"])||c0);
return {id:"",t:String(t).trim(),fam:split(pick(r,["fam","families","familles","moteurs"])),mt:split(pick(r,["mt","modeles","models","vehicules"])),ph:split(pick(r,["ph","phases","generation"])),sev:nsev(pick(r,["sev","severity","severite","criticite"])),freq:nfreq(pick(r,["freq","frequence"])),y:[+(pick(r,["y0","annee_debut"])||2017),+(pick(r,["y1","annee_fin"])||YMAX)],km:[+(pick(r,["km0","km_min"])||0),+(pick(r,["km1","km_max"])||200000)],sym:split(String(pick(r,["sym","symptoms","symptomes"])||"").replace(/\n/g,"|")),cause:String(pick(r,["cause","origine"])||""),fix:String(pick(r,["fix","solution","action","reparation"])||""),cost:[c0,Math.max(c0,c1)],status:String(pick(r,["status","statut"])||"Surveillance"),dom:String(pick(r,["dom","domaine","domain","cat"])||"Moteur"),fuel:""};}
if(kind==="tsb"){var tr=pick(r,["ref","reference","numero"]);if(!tr)throw "référence manquante";
var tt=pick(r,["t","title","titre","nom","objet"]);if(!tt)throw "titre manquant";
return {id:"",ref:String(tr).trim(),b:split(pick(r,["b","brands","marques"])),bRaw:split(pick(r,["b","brands","marques"])),fam:split(pick(r,["fam","families","familles"])),mt:split(pick(r,["mt","modeles","models"])),ph:split(pick(r,["ph","phases"])),t:String(tt).trim(),date:String(pick(r,["date","published"])||"2026-01").slice(0,7),cat:String(pick(r,["cat","category","categorie","type"])||"Moteur"),sev:nsev(pick(r,["sev","severity","severite"])),sum:String(pick(r,["sum","summary","resume","description"])||""),act:String(pick(r,["act","action","procedure"])||""),dom:String(pick(r,["dom","domaine"])||pick(r,["cat","categorie"])||"Moteur")};}
throw "type inconnu";}
function resolveAll(groups){var warn=[],drop=[],newB=[],newM=[],bIdx={},bName={},mIdx={},mName={},seen={};
DB.brands.forEach(function(b){bIdx[b.id]=b.id;bName[nk(b.n)]=b.id;});DB.models.forEach(function(m){mIdx[m.id]=m.id;mName[nk(m.b+"|"+m.n)]=m.id;});
function uniq(kind,base){var id=base,i=2;while(seen[kind+":"+id]||DB[kind].some(function(x){return x.id===id;})){id=base+"-"+i;i++;}seen[kind+":"+id]=1;return id;}
function bid(raw){if(raw==null||raw==="")return null;var r=String(raw).trim();if(bIdx[r])return bIdx[r];var l=nk(r);if(bName[l])return bName[l];
var id=uniq("brands","B-"+slug(r));bIdx[id]=id;bName[l]=id;newB.push({id:id,n:r,pays:"—",grp:"—"});warn.push("marque créée : "+r);return id;}
function mid(raw){var r=String(raw==null?"":raw).trim();if(!r)return null;if(mIdx[r])return mIdx[r];
var b0=null,rest=r,l=nk(r);
Object.keys(bName).forEach(function(k){if(!b0&&l.indexOf(k)===0&&l.length>k.length+2){b0=bName[k];rest=r.slice(k.length).replace(/^[\s\-:]+/,"");}});
var key=nk((b0||"")+"|"+rest);if(mName[key])return mName[key];
b0=b0||bid("Import");var id=uniq("models","M-"+slug(b0)+"-"+slug(rest||r));mIdx[id]=id;mName[nk(b0+"|"+(rest||r))]=id;
newM.push({id:id,b:b0,n:rest||r,y:[2017,YMAX],seg:"Compacte",phase:1});warn.push("modèle créé : "+(rest||r));return id;}
var out={brands:[],models:[],engines:[],faults:[],tsb:[]};
(groups.brands||[]).forEach(function(r){r.id=r.id||uniq("brands","B-"+slug(r.n));bIdx[r.id]=r.id;bName[nk(r.n)]=bName[nk(r.n)]||r.id;out.brands.push(r);});
(groups.models||[]).forEach(function(r){var b=bid(r.bRaw||r.b);if(!b){drop.push("models "+r.n);return;}r.b=b;delete r.bRaw;
r.id=r.id||uniq("models","M-"+slug(b)+"-"+slug(r.n));mIdx[r.id]=r.id;mName[nk(b+"|"+r.n)]=mName[nk(b+"|"+r.n)]||r.id;out.models.push(r);});
(groups.engines||[]).forEach(function(r){var ms=(r.mRaw||[]).map(mid).filter(Boolean);if(!ms.length){drop.push("engines "+r.label);return;}
r.m=ms;delete r.mRaw;r.id=uniq("engines",nextEngId());out.engines.push(r);});
(groups.faults||[]).forEach(function(r){r.id=r.id||uniq("faults","F-"+slug(r.t));out.faults.push(r);});
(groups.tsb||[]).forEach(function(r){r.b=(r.bRaw||r.b||[]).map(bid).filter(Boolean);delete r.bRaw;r.id=r.id||uniq("tsb","T-"+slug(r.ref));out.tsb.push(r);});
out.brands=newB.concat(out.brands);out.models=newM.concat(out.models);return {out:out,warn:warn,drop:drop};}
var KEYFN={brands:function(x){return nk(x.n);},models:function(x){return nk(x.b+"|"+x.n);},
engines:function(x){return nk((x.m||[]).join(",")+"|"+x.code+"|"+x.fam+"|"+x.label+"|"+x.hp);},
faults:function(x){return nk(x.t);},tsb:function(x){return nk(x.ref||x.t);}};
function upsert(kind,rec){var arr=DB[kind],ex=null,i;
if(rec.id)for(i=0;i<arr.length;i++)if(arr[i].id===rec.id){ex=arr[i];break;}
if(!ex){var k=KEYFN[kind](rec);for(i=0;i<arr.length;i++)if(KEYFN[kind](arr[i])===k){ex=arr[i];break;}}
if(ex){Object.keys(rec).forEach(function(kk){var v=rec[kk];if(v==null||v==="")return;if(Array.isArray(v)){if(v.length)ex[kk]=v;}else ex[kk]=v;});return "upd";}
rec.id=kind==="engines"?nextEngId():(kind.charAt(0).toUpperCase()+"-"+uid(""));arr.push(rec);return "add";}
function parseDelim(text){var first=text.split(/\r?\n/)[0]||"",cands=[[";",0],[",",0],["\t",0],["|",0]];
cands.forEach(function(c){c[1]=first.split(c[0]).length-1;});cands.sort(function(a,b){return b[1]-a[1];});
var d=cands[0][1]>0?cands[0][0]:",",rows=[],row=[],cur="",q=false,i;
for(i=0;i<text.length;i++){var ch=text[i];
if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
else if(ch==='"')q=true;else if(ch===d){row.push(cur);cur="";}
else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cur);cur="";if(row.some(function(x){return x.trim()!=="";}))rows.push(row);row=[];}
else cur+=ch;}
row.push(cur);if(row.some(function(x){return x.trim()!=="";}))rows.push(row);
if(rows.length<2)return [];
var head=rows[0].map(function(x){return x.trim().replace(/^\uFEFF/,"");});
return rows.slice(1).map(function(r){var o={};head.forEach(function(k,i2){o[k]=r[i2]===undefined?"":r[i2];});return o;});}
function parseXML(text){var doc=new DOMParser().parseFromString(text,"application/xml");
if(doc.getElementsByTagName("parsererror").length)throw "XML invalide";
var kids=[].slice.call(doc.documentElement.children);if(!kids.length)throw "XML vide";
var tc={};kids.forEach(function(k){tc[k.tagName]=(tc[k.tagName]||0)+1;});
var best=null,bn=0;Object.keys(tc).forEach(function(t){if(tc[t]>bn){bn=tc[t];best=t;}});
var out=[];kids.forEach(function(k){if(k.tagName!==best)return;var o={};
[].slice.call(k.attributes).forEach(function(a){o[a.name]=a.value;});
[].slice.call(k.children).forEach(function(c){o[c.tagName]=c.textContent.trim();});
if(!Object.keys(o).length)o[k.tagName]=k.textContent.trim();out.push(o);});return out;}
function parseYAML(text){var lines=text.split(/\r?\n/),out=[],cur=null;
lines.forEach(function(l){if(!l.trim()||/^\s*#/.test(l))return;
var m=l.match(/^\s*-\s*(.*)$/);
if(m){if(cur)out.push(cur);cur={};var kv=m[1].match(/^([^:]+):\s*(.*)$/);if(kv)cur[kv[1].trim()]=kv[2].trim();return;}
var k2=l.match(/^\s+([^:]+):\s*(.*)$/);if(k2&&cur){cur[k2[1].trim()]=k2[2].trim();return;}
var k3=l.match(/^([^:]+):\s*(.*)$/);if(k3&&cur)cur[k3[1].trim()]=k3[2].trim();});
if(cur)out.push(cur);return out;}
function parseHTML(text){var doc=new DOMParser().parseFromString(text,"text/html"),tbs=doc.querySelectorAll("table");
if(!tbs.length)throw "aucun tableau HTML";var out=[];
for(var t=0;t<tbs.length;t++){var trs=tbs[t].querySelectorAll("tr");if(trs.length<2)continue;
var head=[].slice.call(trs[0].children).map(function(c){return c.textContent.trim();});
for(var r=1;r<trs.length;r++){var cs=[].slice.call(trs[r].children),o={};head.forEach(function(k,i){o[k]=cs[i]?cs[i].textContent.trim():"";});out.push(o);}}
return out;}
function sniff(name,text){var ext=String(name||"").toLowerCase().split(".").pop(),t=String(text||"").trim();
if(ext==="json"||t.charAt(0)==="{"||t.charAt(0)==="[")try{return {fmt:"JSON",data:JSON.parse(t)};}catch(e){}
if(ext==="jsonl"||ext==="ndjson"){var a=[];t.split(/\r?\n/).forEach(function(l){if(l.trim())try{a.push(JSON.parse(l));}catch(e){}});if(a.length)return {fmt:"JSONL",records:a};}
if(ext==="xml"||/^<\?xml/.test(t)||/^<[a-zA-Z]/.test(t)){if(/<table[\s>]/i.test(t))return {fmt:"HTML",records:parseHTML(t)};return {fmt:"XML",records:parseXML(t)};}
if(ext==="html"||ext==="htm")return {fmt:"HTML",records:parseHTML(t)};
if(ext==="yaml"||ext==="yml"||/^\s*-\s+\w+\s*:/.test(t))return {fmt:"YAML",records:parseYAML(t)};
if(ext==="js"){var s=t.replace(/^\s*window\.[A-Za-z0-9_]+\s*=\s*/,"").replace(/^\s*(export\s+default|module\.exports\s*=)\s*/,"").replace(/;\s*$/,"");
try{return {fmt:"JS",data:JSON.parse(s)};}catch(e){}try{return {fmt:"JS",data:(new Function("return "+s))()};}catch(e2){}}
if(/[;,\t|]/.test(t.split(/\r?\n/)[0]||""))return {fmt:ext==="tsv"?"TSV":"CSV",records:parseDelim(t)};
throw "format non reconnu";}
function analyzePayload(parsed,label){var rep=$("#impReport"),groups={},rej=[],ig=[];
if(parsed.data!==undefined){var d=parsed.data;
if(Array.isArray(d)){var k=detectKind(d[0]||{});if(k)groups[k]=d;}
else if(d&&typeof d==="object"){var cl=classify(d);groups=cl.groups;ig=cl.ignored;}}
else if(parsed.records){var k2=detectKind(parsed.records[0]||{});if(k2)groups[k2]=parsed.records;}
if(!Object.keys(groups).length){rep.innerHTML="<div class='rep rj'>Aucune collection reconnue. Attendu : marques, modeles, motorisations, fiches/pannes, tsb/rappels.</div>";beep("err");return;}
var mapped={};Object.keys(groups).forEach(function(k){mapped[k]=[];groups[k].forEach(function(r,i){try{mapped[k].push(mapRec(r,k));}catch(e){rej.push(k+"["+i+"] : "+e);}});});
var R=resolveAll(mapped),ok=0;Object.keys(R.out).forEach(function(k){ok+=R.out[k].length;});IMPORT={R:R};
var h="<div class='rep'><b class='ok'>"+ok+" enregistrement(s) prêt(s)</b> · <b class='rj'>"+(rej.length+R.drop.length)+" rejeté(s)</b> · <b class='wn'>"+R.warn.length+" création(s) auto</b>";
h+="<div class='mono' style='font-size:10px;margin-top:6px;color:#25D4EE'>Format : "+esc(parsed.fmt)+(label?" · "+esc(label):"")+"</div>";
Object.keys(R.out).forEach(function(k){if(R.out[k].length)h+="<div class='mono' style='font-size:10px;margin-top:3px;color:#25D4EE'>"+k+" ← "+R.out[k].length+"</div>";});
if(ig.length)h+="<p class='wn' style='margin-top:7px'>Métadonnées ignorées : "+esc(ig.slice(0,6).join(", "))+"</p>";
if(rej.length){h+="<ul>";rej.slice(0,8).forEach(function(r){h+="<li class='rj'>"+esc(r)+"</li>";});h+="</ul>";}
if(R.warn.length){h+="<ul>";R.warn.slice(0,8).forEach(function(r){h+="<li class='wn'>"+esc(r)+"</li>";});h+="</ul>";}
rep.innerHTML=h+"</div>";$("#impApply").disabled=ok===0;beep(ok?"ok":"err");}
function applyImport(){if(!isAdmin()||!IMPORT)return;snapshot("import");var ins=0,upd=0;
COLS.forEach(function(k){(IMPORT.R.out[k]||[]).forEach(function(r){if(upsert(k,r)==="add")ins++;else upd++;});});
var n=ins+upd;IMPORT=null;closeModal();mutate("imp","Import : "+ins+" ajouts, "+upd+" mises à jour");saveNow();
toast("ok","Import fusionné",n+" enregistrement(s) · "+fmt(META.counts.e)+" motorisations. "+(REG.live?"Diffusé.":"Diffusion manuelle disponible."),true);beep("imp");}
function megaAddIdx(idx,silent){var c=window.MD_RAW.cand[idx];if(!c)return;
if(!BIDX[c.brand]){DB.brands.push({id:c.brand,n:c.brand.charAt(0).toUpperCase()+c.brand.slice(1),pays:"—",grp:"—"});reindex();}
var mid2=c.brand+"-"+slug(c.model),q=2;while(MIDX[mid2]&&MIDX[mid2].n!==c.model)mid2=c.brand+"-"+slug(c.model)+"-"+(q++);
var m=MIDX[mid2];
if(!m){m={id:mid2,b:c.brand,n:c.model,y:[c.y0,c.y1],seg:SEGS[c.seg]||"Compacte",phase:c.phase};DB.models.push(m);reindex();}
if(DB.engines.some(function(e){return e.m.indexOf(mid2)>-1&&e.code===c.code&&e.hp===c.hp;}))return;
var y0=Math.max(c.y0,m.y[0]),y1=Math.min(c.y1,m.y[1]);if(y0>y1){y0=m.y[0];y1=m.y[1];}
DB.engines.push(mkEng(nextEngId(),mid2,c.code,c.code,c.label,nfuel(c.fuel),c.disp,c.hp,c.nm,y0,y1,c.gb));
if(!silent){mutate("mega","Méga-base : "+c.model+" "+c.label+" "+c.hp+" ch");toast("ok","Candidat intégré",c.model+" · "+c.label+" "+c.hp+" ch"+(REG.live?" — diffusé.":" — en attente de diffusion."));beep("ok");}}
function inflate(comp){return new Response(new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer().then(function(b){return new Uint8Array(b);});}
function colIdx(ref){var m=String(ref||"").match(/^([A-Z]+)/);if(!m)return 0;var s=m[1],n=0;for(var i=0;i<s.length;i++)n=n*26+(s.charCodeAt(i)-64);return n-1;}
function xlsxRows(map,dec){var shared=[],sk=Object.keys(map).filter(function(k){return /sharedStrings\.xml$/.test(k);})[0];
if(sk){var sd=new DOMParser().parseFromString(dec.decode(map[sk]),"application/xml"),sis=sd.getElementsByTagName("si");
for(var i=0;i<sis.length;i++){var ts=sis[i].getElementsByTagName("t"),s="";for(var j=0;j<ts.length;j++)s+=ts[j].textContent;shared.push(s);}}
var sheet=Object.keys(map).filter(function(k){return /xl\/worksheets\/sheet1\.xml$/.test(k);})[0]||Object.keys(map).filter(function(k){return /xl\/worksheets\/.*\.xml$/.test(k);})[0];
if(!sheet)throw "feuille introuvable";
var doc=new DOMParser().parseFromString(dec.decode(map[sheet]),"application/xml"),rows=doc.getElementsByTagName("row"),grid=[];
for(var r=0;r<rows.length;r++){var cs=rows[r].getElementsByTagName("c"),arr=[];
for(var c=0;c<cs.length;c++){var cell=cs[c],idx=colIdx(cell.getAttribute("r")),ty=cell.getAttribute("t"),val="";
if(ty==="inlineStr"){var it=cell.getElementsByTagName("t");for(var k=0;k<it.length;k++)val+=it[k].textContent;}
else{var ve=cell.getElementsByTagName("v")[0],raw=ve?ve.textContent:"";val=ty==="s"?(shared[+raw]||""):raw;}
arr[idx]=val;}grid.push(arr);}return grid;}
function odsRows(xml){var doc=new DOMParser().parseFromString(xml,"application/xml"),tbs=doc.getElementsByTagName("table:table");
if(!tbs.length)throw "tableau introuvable";var rows=tbs[0].getElementsByTagName("table:table-row"),grid=[];
for(var r=0;r<rows.length;r++){var cs=rows[r].getElementsByTagName("table:table-cell"),arr=[];
for(var c=0;c<cs.length;c++){var ps=cs[c].getElementsByTagName("text:p"),s="";for(var p=0;p<ps.length;p++)s+=ps[p].textContent;
var rep=Math.min(+(cs[c].getAttribute("table:number-columns-repeated")||1),64);for(var q=0;q<rep;q++)arr.push(s);}grid.push(arr);}return grid;}
function parseOffice(name,buf){var rep=$("#impReport");
if(typeof DecompressionStream==="undefined"){rep.innerHTML="<div class='rep rj'>Classeur Office : décompression indisponible. Exportez la feuille en CSV ou JSON.</div>";beep("err");return;}
rep.innerHTML="<div class='rep'>Lecture du classeur "+esc(name)+"…</div>";
var u8=new Uint8Array(buf),dv=new DataView(buf),eocd=-1,i;
for(i=u8.length-22;i>=0&&i>u8.length-66000;i--)if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}
if(eocd<0){rep.innerHTML="<div class='rep rj'>Archive ZIP invalide.</div>";beep("err");return;}
var n=dv.getUint16(eocd+10,true),off=dv.getUint32(eocd+16,true),entries={},dec=new TextDecoder("utf-8");
for(var e=0;e<n;e++){if(dv.getUint32(off,true)!==0x02014b50)break;
var method=dv.getUint16(off+10,true),csize=dv.getUint32(off+20,true),nl=dv.getUint16(off+28,true),el=dv.getUint16(off+30,true),cl=dv.getUint16(off+32,true),lho=dv.getUint32(off+42,true);
var nm=dec.decode(u8.subarray(off+46,off+46+nl)),lnl=dv.getUint16(lho+26,true),lel=dv.getUint16(lho+28,true),ds=lho+30+lnl+lel,comp=u8.subarray(ds,ds+csize);
entries[nm]=method===0?Promise.resolve(comp):inflate(comp);off+=46+nl+el+cl;}
Promise.all(Object.keys(entries).map(function(k){return entries[k].then(function(d){return [k,d];});})).then(function(list){
var map={};list.forEach(function(p){map[p[0]]=p[1];});
var isOds=!!map["content.xml"],rows=isOds?odsRows(dec.decode(map["content.xml"])):xlsxRows(map,dec);
if(!rows.length)throw "aucune ligne exploitable";
var head=rows[0].map(function(x){return String(x||"").trim();}),recs=[];
for(var r=1;r<rows.length;r++){var o={},empty=true;
for(var c2=0;c2<head.length;c2++){var v=rows[r][c2]===undefined?"":rows[r][c2];if(String(v).trim()!=="")empty=false;o[head[c2]]=v;}
if(!empty)recs.push(o);}
analyzePayload({fmt:isOds?"ODS":"XLSX",records:recs},name);
}).catch(function(err){rep.innerHTML="<div class='rep rj'>Classeur non exploitable : "+esc(String(err))+"</div>";beep("err");});}

/* ══════════ TESTS ══════════ */
function runTests(){var T=[],add=function(n,ok,i,s){T.push({n:n,ok:!!ok,info:i||"",soft:!!s});};
hardNormalize(DB);ensureCoverage(DB);reindex();
add("Base chargée",!!DB&&DB.engines.length>0,DB?fmt(DB.engines.length)+" motorisations":"ABSENTE");
add("Marques",DB.brands.length>=40,DB.brands.length+" marques");
add("Modèles à phases",DB.models.length>=200,DB.models.length+" modèles");
add("Motorisations",DB.engines.length>=600,fmt(DB.engines.length)+" motorisations");
add("Pannes détaillées",DB.faults.length>=80,DB.faults.length+" fiches");
add("TSB & rappels",DB.tsb.length>=60,DB.tsb.length+" bulletins dont "+META.counts.rc+" rappels");
add("Domaines techniques",META.counts.dom>=20,META.counts.dom+" domaines");
var dup=0,detail=[];COLS.forEach(function(k){var s={};DB[k].forEach(function(x){if(s[x.id]){dup++;detail.push(k+":"+x.id);}s[x.id]=1;});});
add("Identifiants uniques",dup===0,dup?detail.slice(0,3).join(", "):"aucun doublon sur les 5 collections");
var orph=0;DB.engines.forEach(function(e){e.m.forEach(function(i){if(!MIDX[i])orph++;});});
add("Références moteur-modèle",orph===0,orph+" orphelin(s)");
ensureCoverage(DB);reindex();
var unc=uncoveredModels();
add("Couverture modèles",unc.length===0,unc.length?unc.slice(0,3).map(function(m){return m.n;}).join(", "):DB.models.length+"/"+DB.models.length+" modèles motorisés · 100 %");
add("Sévérités normalisées",DB.faults.every(function(f){return !!SV[f.sev];}),"toutes valides");
var e0=DB.engines.filter(function(e){return /EB2ADTX|DV5RUCd/.test(e.code);})[0],pOk=false,pLen=0;
if(e0){var pl=buildPlan(e0,modelOf(e0),brandOf(e0));pLen=pl.visits.length;pOk=pl.visits[pl.visits.length-1].km>=KMMAX;}
add("Plan 200 000 km",pOk,pLen+" révisions programmées");
add("Pack 3008 II Phase 2",DB.models.some(function(m){return m.n.indexOf("3008 II Phase 2")>-1;}),"présent");
var sOk=false;try{sOk=omniSearch("3008 courroie").length>0;}catch(e){}
add("Recherche prédictive",sOk,"3008 courroie → résultats");
var rOk=false;try{rOk=omniSearch("3008 rappel").some(function(h){return h.badge==="RAPPEL";});}catch(e){}
add("Recherche rappels",rOk,"3008 rappel → campagnes");
var dm=["#view","#rail","#top","#dr","#md","#ts","#bgc","#omni","#omnires","#gate","#bellb"].filter(function(s){return !$(s);});
add("DOM critique",dm.length===0,dm.length?dm.join(", "):"11/11 présents");
var bell=$("#bellb");
add("Cloche d'accès tiers",!!bell&&!!bell.querySelector(".bbadge")&&!!bell.__wired,bell?(bell.__wired?"liée + badge temps réel":"non liée"):"absente");
var aOk=false,aInfo="";
try{
var bx=accBoxesHTML({id:"__probe__",status:"pending"},false);
var hasG=bx.indexOf("data-st='granted'")>-1&&bx.indexOf(">ACCÈS<")>-1;
var hasD=bx.indexOf("data-st='denied'")>-1&&bx.indexOf(">REFUS<")>-1;
var hasR=bx.indexOf("data-st='revoked'")>-1&&bx.indexOf(">RÉVOCATION<")>-1;
var onG=accBoxesHTML({id:"p",status:"granted"},false).indexOf("accbox g on")>-1;
var onD=accBoxesHTML({id:"p",status:"denied"},false).indexOf("accbox d on")>-1;
var onR=accBoxesHTML({id:"p",status:"revoked"},false).indexOf("accbox r on")>-1;
aOk=hasG&&hasD&&hasR&&onG&&onD&&onR&&typeof setAccess==="function"&&ACC_STATES.length===3;
aInfo=aOk?"3 décisions actives · états exclusifs · application temps réel":"élément manquant";
}catch(e){aInfo="erreur : "+e.message;}
add("3 cases Accès / Refus / Révocation",aOk,aInfo);
var nOk=false,nInfo="";
try{
  var probe={id:"__probe_req__",name:"Probe",status:"pending",ts:Date.now(),at:null};
  var merged=regMerge(REG,{users:[probe],rev:(+REG.rev||0)+1});
  var found=merged.users.some(function(u){return u.id==="__probe_req__";});
  var pc=merged.users.filter(function(u){return u.status==="pending";}).length;
  var code=reqCode(probe),dec=b64d(code);
  var round=!!(dec&&dec.i===probe.id&&dec.n===probe.name);
  var fileOk=typeof importReqPayload==="function"&&typeof exportReqFile==="function";
  nOk=found&&pc>0&&round&&fileOk&&typeof notifyPending==="function"&&typeof syncNow==="function";
  nInfo=nOk?"fusion registre OK · code aller-retour OK · pont fichier OK · notification active":"chaîne incomplète";
}catch(e){nInfo="erreur : "+e.message;}
add("Remontée demande tiers",nOk,nInfo);
add("Pont natif Android",!!BRIDGE,BRIDGE?"bridge actif — persistance APK garantie":"absent — repli web + code/fichier (ajoutez MecadataBridge en Kotlin)",true);
add("Persistance registre",REG_OK||STORE.any()||!!BRIDGE,REG_OK?"écriture vérifiée":(BRIDGE?"bridge natif":STORE.backend()),!(REG_OK||STORE.any()||BRIDGE));
add("Registre durable (fusion)",typeof regMerge==="function"&&typeof regRead==="function","aucune perte lors des relectures");
add("API cloche exposée",typeof window.MD_openAccess==="function","window.MD_openAccess");
var gEl=$("#gate"),stable=false;
try{var before=gEl.innerHTML;gateSync();gateSync();gateSync();stable=(gEl.innerHTML===before);}catch(e){}
add("Saisie tiers stable",stable,"aucune reconstruction pendant la frappe");
var cv=document.createElement("canvas"),cx=safe("tctx",function(){return cv.getContext("2d");},null);
add("Canvas 2D",!!cx,cx?"OK":"indisponible",true);
add("Scènes studio",WP.MODES.length>=8,WP.MODES.length+" scènes");
add("Stockage",STORE.any(),STORE.backend()+(isAdmin()?" — admin":" — tiers sans écriture"),!STORE.any());
add("Session",STORE.session,STORE.session?"sessionStorage":"mémoire",true);
add("Canal temps réel",!!CH,CH?"BroadcastChannel actif":"repli storage + polling",true);
var vb=[];[["bord",vBord],["explorer",vExplorer],["tech",vTech],["entretien",vEntretien],["studio",vStudio],["admin",vAdmin],["diagnostic",vDiag]].forEach(function(v){
try{var hh=v[1]();if(typeof hh!=="string"||hh.length<1)vb.push(v[0]);}catch(e){vb.push(v[0]+" ("+e.message+")");}});
add("Rendu des 7 vues",vb.length===0,vb.length?vb.join(", "):"7/7 rendues");
META.integ=integrity();
add("Intégrité référentielle",META.integ.ok,META.integ.err.length?META.integ.err.slice(0,3).join(" | "):"0 erreur — normalisation + couverture exhaustive");
add("Sauvegarde admin",!isAdmin()||LASTSAVE>0,isAdmin()?(LASTSAVE?new Date(LASTSAVE).toLocaleTimeString("fr-FR"):"en attente"):"tiers : stockage interdit");
add("Version moteur",window.__MD_VER==="8.4","v"+window.__MD_VER+" · "+window.__MD_FIX);
add("Exceptions",ERRORS.length===0,ERRORS.length?ERRORS.slice(-3).map(function(e){return e.m;}).join(" | "):"aucune",true);
TESTS=T;updateMeta();return T;}
function autoFix(){if(!isAdmin())return;var did=[];
if(!DB.engines.length){DB=clone(SEED);did.push("base réinjectée");}
var f=hardNormalize(DB);if(f)did.push(f+" normalisation(s)");
var c=ensureCoverage(DB);if(c)did.push(c+" motorisation(s) appariée(s)");
if(WP.fails>0){WP.P.mode="grid";WP.fails=0;WP.apply();did.push("graphique réinitialisé");}
ERRORS.length=0;did.push("journal purgé");recompute();saveNow();runTests();updateMeta();render();
toast("ok","Auto-réparation",did.join(" · "));beep("ok");}

/* ══════════ PORTAIL ══════════ */
function gateImportPanel(){
var h="<div class='gateimp'><label class='lb'>Reprendre une demande d'un autre appareil ou d'une session précédente</label>";
h+="<div style='display:flex;gap:7px;flex-wrap:wrap'><input class='inp mono' id='gateImportCode' placeholder='MDR1-…' style='flex:1;min-width:170px'><button type='button' class='btn sm pri' data-act='gateImportCode'>"+ic("plus")+"Importer</button><button type='button' class='btn sm ghost' data-act='gateImportFile'>"+ic("file")+"Fichier</button><input type='file' id='gateFile' accept='.json,application/json' style='display:none'></div>";
h+="<p class='gnote' style='margin-top:7px'>Le tiers trouve son code et son fichier sur son écran d'attente.</p></div>";
return h;}
function gateHTML(mode){
var h="<div class='gcard2'><h1>MECADATA <i>//</i> PORTAIL D'ACCÈS</h1><p class='gsub'>Console technique 2017→2027 — choisissez votre mode d'ouverture. Le mot de passe résiduel est effacé à chaque lancement.</p>";
if(!mode){
h+="<div class='gmodes'><div class='gmode' data-act='gateAdmin'><div class='gi'>"+ic("shield","width:26px;height:26px")+"</div><h3>ADMINISTRATEUR</h3><p>Base, import multi-formats, méga-base, cloche d'accès tiers et diffusion temps réel.</p></div>";
h+="<div class='gmode' data-act='gateTier'><div class='gi'>"+ic("users","width:26px;height:26px")+"</div><h3>TIERS</h3><p>Consultation des fiches techniques, pannes, rappels et plans d'entretien. Studio fond d'écran. Aucune modification, aucun import, aucune sauvegarde locale.</p></div></div>";
h+="<div class='gform'><label class='lb'>Vous avez reçu un code d'accord ?</label><div style='display:flex;gap:7px;flex-wrap:wrap'><input class='inp mono' id='tierGrant' placeholder='MDA1-…' value='"+esc(GATE_CODE)+"' style='flex:1;min-width:200px'><button class='btn sm grn' data-act='tierGrantApply'>"+ic("unlock")+"Appliquer</button></div>";
h+="<p class='gnote'>Session administrateur protégée · accès tiers soumis à validation</p></div>";}
else if(mode==="admin"){
var pc=pendingCount();
h+="<div class='gform'><label class='lb'>Mot de passe administrateur</label><form data-form='admin'><input class='inp mono' type='password' name='pwd' id='gatePwd' value='' placeholder='••••••••' autocomplete='new-password' autocapitalize='off' autocorrect='off' spellcheck='false' enterkeyhint='go' style='text-align:center;letter-spacing:.2em;font-size:16px'>";
h+="<div style='display:flex;gap:8px;margin-top:11px'><button type='button' class='btn ghost' data-act='gateBack'>Retour</button><button type='submit' class='btn pri' style='flex:1'>"+ic("unlock")+"OUVRIR LA SESSION ING-3</button></div></form>";
if(pc>0)h+="<p class='gnote' style='color:#FFD60A'>"+pc+" demande(s) d'accès déjà en attente dans ce registre.</p>";
else h+="<p class='gnote'>Champ réinitialisé à chaque lancement — aucun mot de passe conservé.</p>";
h+=gateImportPanel();
h+="</div>";}
else{
var u=tierUser();
if(u&&u.status==="granted"){
h+="<div class='gform'><div class='gwait'><div class='gi' style='width:52px;height:52px;margin:0 auto 12px;display:grid;place-items:center;border-radius:15px;background:rgba(67,224,139,.14);border:1px solid rgba(67,224,139,.45);color:#43E08B'>"+ic("check","width:24px;height:24px")+"</div><h3 style='font:600 15px var(--gd)'>Accès accordé — "+esc(u.name)+"</h3><p class='muted' style='font-size:12px;margin:7px 0 13px'>Consultation en lecture seule.</p><button class='btn pri' data-act='tierEnter'>"+ic("unlock")+"ENTRER EN CONSULTATION</button><div style='margin-top:9px'><button class='btn sm ghost' data-act='gateBack'>Retour</button></div></div></div>";}
else if(u&&u.status==="pending"){
if(!COPIED_ONCE){copyText(reqCode(u));COPIED_ONCE=true;}
h+="<div class='gform'><div class='gwait'><div class='spin'></div><h3 style='font:600 15px var(--gd)'>Demande transmise — "+esc(u.name)+"</h3>";
h+="<p class='muted' style='font-size:12px;margin-top:7px'>Notification envoyée à l'administrateur (cloche, badge, bannière, son). Cet écran bascule dès sa décision.</p>";
h+="<div class='codebox'>"+esc(reqCode(u))+"</div>";
h+="<p class='gnote'>Code copié automatiquement. Même appareil : remontée directe. Autre appareil ou redémarrage : collez ce code côté admin, ou envoyez le fichier.</p>";
h+="<div style='display:flex;gap:7px;justify-content:center;margin-top:11px;flex-wrap:wrap'><button class='btn sm ghost' data-act='copyReq'>"+ic("dl")+"Copier le code</button><button class='btn sm ghost' data-act='exportReq'>"+ic("file")+"Exporter le fichier</button><button class='btn sm ghost' data-act='tierPing'>"+ic("bell")+"Renvoyer la notification</button><button class='btn sm ghost' data-act='tierCancel'>Annuler</button></div>";
h+="<label class='lb' style='margin-top:14px'>Code d'accord reçu</label><div style='display:flex;gap:7px;flex-wrap:wrap'><input class='inp mono' id='tierGrant' placeholder='MDA1-…' value='"+esc(GATE_CODE)+"' style='flex:1;min-width:180px'><button class='btn sm grn' data-act='tierGrantApply'>"+ic("unlock")+"Appliquer</button></div>";
h+="</div></div>";}
else if(u){
h+="<div class='gform'><div class='gwait'><h3 style='font:600 15px var(--gd);color:#FF4D5E'>Accès "+(u.status==="denied"?"refusé":"révoqué")+"</h3><p class='muted' style='font-size:12px;margin:7px 0 12px'>L'administrateur a "+(u.status==="denied"?"refusé":"révoqué")+" cet accès.</p><button class='btn sm ghost' data-act='tierReset'>Nouvelle demande</button> <button class='btn sm ghost' data-act='gateBack'>Retour</button></div></div>";}
else{
h+="<div class='gform'><label class='lb' for='gateName'>Votre prénom</label><form data-form='tier' autocomplete='off'>";
h+="<input class='inp' type='text' name='name' id='gateName' maxlength='24' placeholder='Prénom' value='"+esc(GATE_NAME)+"' autocomplete='off' autocapitalize='words' autocorrect='off' spellcheck='false' inputmode='text' enterkeyhint='send' style='text-align:center;font-size:16px'>";
h+="<div style='display:flex;gap:8px;margin-top:11px'><button type='button' class='btn ghost' data-act='gateBack'>Retour</button><button type='submit' class='btn pri' style='flex:1'>"+ic("bell")+"DEMANDER L'ACCÈS</button></div></form>";
h+="<p class='gnote'>La demande est enregistrée durablement (bridge natif si présent) et notifiée à l'administrateur.</p></div>";}}
return h+"</div>";}
function gateShow(mode,opts){
opts=opts||{};
var g=$("#gate");if(!g)return;
var prev=GATE_MODE;
GATE_MODE=mode||null;
var cur=g.querySelector("#gateName");if(cur&&cur.value)GATE_NAME=cur.value;
var cg=g.querySelector("#tierGrant");if(cg&&cg.value)GATE_CODE=cg.value;
var sig=gateSig(GATE_MODE);
if(!opts.force&&GATE_RENDERED&&sig===GATE_SIG&&prev===GATE_MODE){g.classList.remove("off");return;}
if(!opts.force&&gateTyping()&&sig===GATE_SIG){g.classList.remove("off");return;}
if(gateTyping()){try{document.activeElement.blur();}catch(e){}}
GATE_SIG=sig;GATE_RENDERED=true;
g.classList.remove("off");
g.innerHTML=gateHTML(GATE_MODE);
var n=g.querySelector("#gateName");
if(n){n.value=GATE_NAME;
n.addEventListener("input",function(){GATE_NAME=n.value;});
n.addEventListener("focus",function(){setTimeout(function(){if(document.activeElement===n){try{n.scrollIntoView({block:"center",behavior:"smooth"});}catch(e){}}},320);});
if(opts.focus)setTimeout(function(){try{n.focus();}catch(e){}},90);}
var c2=g.querySelector("#tierGrant");
if(c2){c2.value=GATE_CODE;c2.addEventListener("input",function(){GATE_CODE=c2.value;});}
var p=g.querySelector("#gatePwd");
if(p){p.value="";if(opts.focus)setTimeout(function(){try{p.focus();}catch(e){}},90);}
}
function gateSync(){
if(MODE)return;
if(!GATE_MODE)return;
var g=$("#gate");if(!g||g.classList.contains("off")||!GATE_RENDERED)return;
var sig=gateSig(GATE_MODE);
if(sig===GATE_SIG)return;
if(gateTyping()){var u=tierUser();if(!u||u.status==="pending")return;}
gateShow(GATE_MODE,{force:true,focus:false});
}
function gateHide(){var g=$("#gate");if(g)g.classList.add("off");GATE_RENDERED=false;GATE_SIG=null;}
function loadAdminDb(){
DB=clone(SEED);
var raw=STORE.get(KEY),migrated=false;
if(!raw){raw=STORE.get(OLDKEY);migrated=!!raw;}
if(raw)safe("load",function(){var d=JSON.parse(raw);
if(d&&d.db&&d.db.engines&&d.db.engines.length){DB=d.db;AUDIT=d.audit||[];
if(d.prefs)Object.keys(d.prefs).forEach(function(k){PREF[k]=d.prefs[k];});
if(d.wp)Object.keys(d.wp).forEach(function(k){WP.P[k]=d.wp[k];});
LASTSAVE=d.ts||0;}},null);
FIXES+=hardNormalize(DB);
var c=ensureCoverage(DB);
if(migrated||c)audit("adm","Migration base v8.4 · "+c+" motorisation(s) appariée(s)");
}
function enterAdmin(){MODE="admin";TIER=null;GATE_NAME="";gateHide();
loadAdminDb();
recompute();WP.apply();audit("adm","Session ING-3 ouverte");saveNow();
regLoad();preloadIdb();syncNow(true);runTests();S.view="bord";location.hash="#/bord";render();
toast("ok","Session administrateur","Cloche d'accès active en haut à droite.");beep("imp");
setTimeout(function(){regLoad();syncNow(true);var n=notifyPending();if(!n&&pendingCount()>0){toast("warn",pendingCount()+" demande(s) en attente","Cliquez la cloche pour statuer.");beep("imp");}},700);}
function enterTier(){var u=tierUser();if(!u||u.status!=="granted"){gateShow("tier",{force:true});return;}
MODE="tier";GATE_NAME="";gateHide();if(!applyTierSnapshot())DB=clone(SEED);
recompute();WP.apply();runTests();S.view="bord";location.hash="#/bord";render();
toast("info","Consultation tiers","Lecture seule — rév. "+(REG.rev||0)+". Aucun stockage local.");beep("ok");}
function tierSync(){if(!isTier())return;var u=tierUser();
if(!u||u.status!=="granted"){MODE=null;TIER=null;gateShow("tier",{force:true});render();toast("err","Accès révoqué","L'administrateur a retiré cet accès.");return;}
if(applyTierSnapshot()){recompute();updateMeta();render();toast("info","Base mise à jour","Révision "+REG.rev+" diffusée.");}}

/* ══════════ ÉVÉNEMENTS ══════════ */
function bind(){
document.addEventListener("click",function(ev){var el=ev.target.closest?ev.target.closest("[data-act]"):null;
if(!el){if(!(ev.target.closest&&ev.target.closest(".omni")))omniClose();return;}
var a=el.dataset.act,id=el.dataset.id;
if(a==="openAccess"){ev.preventDefault();ev.stopPropagation();openAccess();return;}
if(a==="accClose"){ACC_OPEN=false;closeModal();return;}
if(a==="accGoAdmin"){ACC_OPEN=false;closeModal();S.adm.tab="access";location.hash="#/admin";render();return;}
if(a==="accSet"){ev.preventDefault();setAccess(id,el.dataset.st);return;}
if(a==="syncNow"){syncNow(false);if(S.view==="admin")render();return;}
if(a==="gateImportCode"){var gi=$("#gateImportCode"),gv=gi?gi.value.trim():"";
if(!gv){toast("err","Code vide","Collez le code MDR1- du tiers.");beep("err");return;}
if(importReqCode(gv)){toast("ok","Demande importée","Elle sera visible après connexion admin.");beep("imp");gateShow(GATE_MODE,{force:true});}
else{toast("err","Code invalide","Format attendu : MDR1-…");beep("err");}return;}
if(a==="gateImportFile"){var gf=$("#gateFile");if(gf)gf.click();return;}
if(a==="accDel"){if(!isAdmin())return;regLoad();var u=null;for(var i=0;i<REG.users.length;i++)if(REG.users[i].id===id)u=REG.users[i];
REG.users=REG.users.filter(function(x){return x.id!==id;});if(REG.tomb.indexOf(id)<0)REG.tomb.push(id);
regLog("Suppression accès "+(u?u.name:id));regSave();updateMeta();if(S.view==="admin")render();beep("del");return;}
if(a==="admCodeAdd"){var f=$("#admCode"),v=f?f.value.trim():"";
if(!v){toast("err","Code vide","Collez le code MDR1- fourni par le tiers.");beep("err");return;}
if(importReqCode(v)){S.adm.code="";toast("ok","Demande importée","Elle apparaît dans la liste.");beep("imp");if(ACC_OPEN){var b=$("#accBody");if(b)b.innerHTML=accessBody();}if(S.view==="admin")render();}
else{toast("err","Code invalide","Format attendu : MDR1-…");beep("err");}return;}
if(a==="accFilePick"){var fi=$("#accFile");if(fi)fi.click();return;}
if(a==="copyGrant"){regLoad();var u2=null;for(var j=0;j<REG.users.length;j++)if(REG.users[j].id===id)u2=REG.users[j];
if(u2){copyText(grantCode(u2));toast("ok","Code d'accord copié","Transmettez-le au tiers.");beep("ok");}return;}
if(a==="copyReq"){var u3=tierUser();if(u3){copyText(reqCode(u3));toast("ok","Code de demande copié","Transmettez-le à l'administrateur.");beep("ok");}return;}
if(a==="exportReq"){exportReqFile();return;}
if(a==="tierPing"){regLoad();var u4=tierUser();if(u4){REG.seen=REG.seen.filter(function(x){return x!==u4.id;});}
regSave();bcast({t:"reg",rev:REG.rev,force:true});
toast("info","Notification renvoyée","L'administrateur est re-notifié.");beep("imp");
osNotify("MECADATA — relance demande",(u4?u4.name:"Un tiers")+" relance sa demande d'accès.");return;}
if(a==="tierGrantApply"){var g2=$("#tierGrant"),v2=g2?g2.value.trim():GATE_CODE;
if(!v2){toast("err","Code vide","Collez le code MDA1- reçu.");beep("err");return;}
if(importGrantCode(v2)){GATE_CODE="";enterTier();}
else{regLoad();gateShow("tier",{force:true});toast("warn","Code appliqué","Statut non accordé — voir l'écran.");beep("err");}return;}
if(a==="notifTest"){regLoad();
var pc=pendingCount();
if(pc){REG.users.forEach(function(u){if(u.status==="pending")REG.seen=REG.seen.filter(function(x){return x!==u.id;});});regSave();notifyPending();}
else{toast("info","Test de notification","Aucune demande en attente — démonstration.");beep("imp");osNotify("MECADATA — test","La chaîne de notification fonctionne.");}
return;}
if(a==="forceFresh"){if(window.__MD_FRESH)window.__MD_FRESH();else location.reload(true);return;}
if(a==="pwaIcons"){if(window.MD_ICONS){var n=window.MD_ICONS.download();toast("ok","Icônes PWA exportées",n+" PNG — déposez-les dans icons/.");beep("imp");}return;}
if(a==="gateAdmin"){gateShow("admin",{force:true,focus:true});return;}
if(a==="gateTier"){regLoad();gateShow("tier",{force:true,focus:true});return;}
if(a==="gateBack"){GATE_NAME="";GATE_CODE="";gateShow(null,{force:true});return;}
if(a==="tierEnter"){enterTier();return;}
if(a==="tierCancel"){regLoad();REG.users=REG.users.filter(function(u5){return u5.id!==TIER;});if(TIER&&REG.tomb.indexOf(TIER)<0)REG.tomb.push(TIER);TIER=null;GATE_NAME="";regSave();gateShow("tier",{force:true,focus:true});return;}
if(a==="tierReset"){TIER=null;GATE_NAME="";gateShow("tier",{force:true,focus:true});return;}
if(a==="omniSeed"){var inp=$("#omni");if(inp){inp.value=el.dataset.q;S.omni.q=el.dataset.q;inp.focus();omniRender();}return;}
if(a==="omniHit"){omniActivate(el.dataset.kind,id);return;}
if(a==="msearch"){var q=prompt("Recherche prédictive :");if(q){var i2=$("#omni");if(i2){i2.value=q;S.omni.q=q;omniRender();i2.focus();}}return;}
if(a==="snd"){PREF.sound=!PREF.sound;markDirty();updateMeta();if(PREF.sound)beep("ok");return;}
if(a==="run"){WP.set("run",!WP.P.run);beep("tick");return;}
if(a==="goStudio"){location.hash="#/studio";return;}
if(a==="goAdmin"){if(isAdmin())location.hash="#/admin";else gateShow("admin",{force:true,focus:true});return;}
if(a==="goDiag"){location.hash="#/diagnostic";return;}
if(a==="goPlan"){location.hash="#/entretien";return;}
if(a==="runTests"){runTests();location.hash="#/diagnostic";render();return;}
if(a==="autoFix"){autoFix();return;}
if(a==="integrity"){var g=integrity();META.integ=g;updateMeta();
var h="<div class='mh'>"+ic("check")+"<h3>Intégrité de la base</h3><button class='tb' data-act='mclose'>"+ic("x")+"</button></div><div class='mb2'><div class='rep' style='max-height:none'><b class='"+(g.ok?"ok":"rj")+"'>"+(g.ok?"BASE INTÈGRE":"ERREURS")+"</b> — score "+g.pct+"% · "+fmt(META.links)+" liaisons";
if(g.err.length){h+="<ul>";g.err.slice(0,25).forEach(function(e){h+="<li class='rj'>"+esc(e)+"</li>";});h+="</ul>";}else h+="<p class='ok' style='margin-top:7px'>Aucun doublon, aucune référence orpheline, couverture motorisations 100 %.</p>";
h+="</div></div><div class='mf'><button class='btn pri' data-act='mclose'>Fermer</button></div>";openModal(h);return;}
if(a==="undo"){doUndo();return;}
if(a==="mclose"){ACC_OPEN=false;closeModal();return;}
if(a==="mscrim"){if(ev.target===el){ACC_OPEN=false;closeModal();}return;}
if(a==="drclose"){closeDrawer();return;}
if(a==="drback"){var hb=S.drawer.hist.pop();if(hb){S.drawer.type=hb.type;S.drawer.id=hb.id;S.drawer.tab=hb.tab;renderDrawer();}return;}
if(a==="drtab"){S.drawer.tab=el.dataset.t;renderDrawer();return;}
if(a==="openEng"){omniClose();openDrawer("engine",id,!!S.drawer);return;}
if(a==="openFault"){omniClose();openDrawer("fault",id,!!S.drawer);return;}
if(a==="openTsb"){omniClose();openDrawer("tsb",id,!!S.drawer);return;}
if(a==="selEng"){var e=EIDX[id];if(e){var m=modelOf(e);S.sel.b=m?m.b:"";S.sel.m=m?m.id:"";S.sel.e=id;closeDrawer();location.hash="#/entretien";}return;}
if(a==="expEng"){var xe=EIDX[id];if(xe&&isAdmin()){download("fiche_"+xe.code.replace(/\W+/g,"_")+".json",JSON.stringify({engine:xe,model:modelOf(xe),brand:brandOf(xe),ivi:ivi(xe),faults:faultsFor(xe),tsb:tsbFor(xe),plan:buildPlan(xe,modelOf(xe),brandOf(xe))},null,2));toast("ok","Fiche exportée");beep("ok");}return;}
if(a==="ffuel"){var k=el.dataset.k,ix=S.f.fuel.indexOf(k);if(ix>-1)S.f.fuel.splice(ix,1);else S.f.fuel.push(k);S.shown=48;render();beep("tick");return;}
if(a==="resetSel"){S.sel={b:"",m:"",e:""};S.f={q:"",fuel:[],y:[2017,YMAX],sort:"brand"};S.shown=48;render();return;}
if(a==="more"){S.shown+=48;render();return;}
if(a==="techTab"){S.tech.tab=el.dataset.t;render();return;}
if(a==="admTab"){if(!isAdmin())return;S.adm.tab=el.dataset.t;render();return;}
if(a==="expAll"){if(!isAdmin())return;download("mecadata_base.json",JSON.stringify(DB,null,2));toast("ok","Base exportée");beep("ok");return;}
if(a==="fileExp"){if(!isAdmin())return;download(el.dataset.k+".json",JSON.stringify(DB[el.dataset.k],null,2));beep("ok");return;}
if(a==="saveNow"){if(!isAdmin())return;saveNow();toast("ok","Sauvegarde effectuée");beep("ok");return;}
if(a==="publish"){publish(false);render();return;}
if(a==="dzPick"){var f=$("#impFile");if(f)f.click();return;}
if(a==="impAnalyze"){var ta=$("#impText"),t=ta?ta.value.trim():"",rep=$("#impReport");
if(!t){rep.innerHTML="<div class='rep rj'>Aucune donnée.</div>";beep("err");return;}
try{analyzePayload(sniff("paste.txt",t),"collage");}catch(e){rep.innerHTML="<div class='rep rj'>Analyse impossible : "+esc(String(e))+"</div>";beep("err");}return;}
if(a==="impApply"){applyImport();return;}
if(a==="megaAdd"){megaAddIdx(+el.dataset.i,false);return;}
if(a==="megaAll"){if(!isAdmin())return;var q2=S.adm.mega.trim().toLowerCase();
var list=window.MD_RAW.cand.filter(function(c){return !q2||(c.brand+" "+c.model+" "+c.code+" "+c.label+" "+c.note).toLowerCase().indexOf(q2)>-1;});
snapshot("méga-base");list.forEach(function(c){megaAddIdx(window.MD_RAW.cand.indexOf(c),true);});
mutate("mega","Méga-base : "+list.length+" candidat(s)");saveNow();toast("ok","Méga-base enrichie",list.length+" entrée(s) · "+fmt(META.counts.e)+" motorisations.",true);beep("imp");return;}
if(a==="megaSel"){if(!S.sel.b){toast("warn","Aucune marque sélectionnée","Choisissez une marque dans le module 2.");return;}S.adm.mega=BIDX[S.sel.b]?BIDX[S.sel.b].n:"";render();return;}
if(a==="askReset"){if(!isAdmin())return;confirmModal("Réinitialiser la base ?","Modifications et imports remplacés par la base usine. Annulation 8 s.","doReset","Réinitialiser");return;}
if(a==="doReset"){closeModal();snapshot("reset");DB=clone(SEED);mutate("del","Base usine restaurée");saveNow();toast("warn","Base usine restaurée","",true);return;}
if(a==="logout"){MODE=null;TIER=null;ACC_OPEN=false;GATE_NAME="";GATE_CODE="";closeModal();gateShow(null,{force:true});updateMeta();toast("info","Session fermée");return;}
if(a==="stMode"){WP.set("mode",el.dataset.m);beep("tick");return;}
if(a==="stTheme"){WP.P.useCustom=false;WP.set("theme",el.dataset.t);beep("tick");return;}
if(a==="stPreset"){var ps=WP.PRESETS[el.dataset.n];if(ps){Object.keys(ps).forEach(function(k){WP.P[k]=ps[k];});WP.apply();WP.resize();render();toast("ok","Preset appliqué",el.dataset.n);beep("ok");}return;}
if(a==="stRandom"){WP.randomize();render();toast("ok","Scène aléatoire",WP.P.mode);beep("imp");return;}
if(a==="stReset"){WP.reset();render();toast("info","Réglages réinitialisés");return;}
if(a==="stPng"){WP.exportPNG();return;}
if(a==="stRun"){WP.set("run",!WP.P.run);render();return;}
if(a==="stDir"){WP.set("dir",WP.P.dir>0?-1:1);render();return;}
if(a==="stCustom"){WP.P.useCustom=!!el.checked;WP.drawAll();markDirty();WP.sync();return;}
});
document.addEventListener("input",function(ev){var t=ev.target;if(!t)return;
if(t.id==="gateName"){GATE_NAME=t.value;return;}
if(t.id==="tierGrant"){GATE_CODE=t.value;return;}
if(t.id==="admCode"){S.adm.code=t.value;return;}
if(t.id==="gateImportCode"){return;}
if(t.id==="omni"){S.omni.q=t.value;omniRender();return;}
if(t.dataset&&t.dataset.c){WP.setCustom(t.dataset.c,t.value);return;}
if(t.dataset&&t.dataset.p){var k=t.dataset.p,v=t.type==="checkbox"?t.checked:(t.tagName==="SELECT"?(k==="dir"?+t.value:t.value):+t.value);WP.set(k,v);return;}
if(t.dataset&&t.dataset.f){S.f[t.dataset.f]=t.value;S.shown=48;deb(render,140)();return;}
if(t.dataset&&t.dataset.tf){S.tech[t.dataset.tf]=t.value;if(t.dataset.tf==="brand")S.tech.model="";deb(render,160)();return;}
if(t.dataset&&t.dataset.mega){S.adm.mega=t.value;deb(render,160)();return;}
if(t.dataset&&t.dataset.calc){S.calc[t.dataset.calc]=+t.value||0;var dl=$("#dueList"),e=selEngine();if(dl&&e)dl.innerHTML=dueHTML(buildPlan(e,modelOf(e),brandOf(e)));return;}
});
document.addEventListener("change",function(ev){var t=ev.target;if(!t)return;
if(t.id==="gateFile"&&t.files&&t.files[0]){var gr=new FileReader();
gr.onload=function(){try{var obj=JSON.parse(String(gr.result));
if(importReqPayload(obj)){toast("ok","Demande importée","Visible après connexion admin.");beep("imp");gateShow(GATE_MODE,{force:true});}
else{toast("err","Fichier non reconnu","Attendu : demande-acces-….json");beep("err");}}
catch(e){toast("err","Lecture impossible",String(e));beep("err");}};
gr.readAsText(t.files[0]);return;}
if(t.dataset&&t.dataset.sel){var k=t.dataset.sel;S.sel[k]=t.value;if(k==="b"){S.sel.m="";S.sel.e="";}if(k==="m")S.sel.e="";S.shown=48;render();beep("tick");return;}
if(t.dataset&&t.dataset.calc==="sev"){S.calc.sev=+t.value;var dl=$("#dueList"),e=selEngine();if(dl&&e)dl.innerHTML=dueHTML(buildPlan(e,modelOf(e),brandOf(e)));return;}
if(t.dataset&&t.dataset.act==="liveToggle"){if(!isAdmin())return;REG.live=!!t.checked;regLog("Diffusion temps réel "+(REG.live?"activée":"désactivée"));if(REG.live)publish(true);regSave();render();return;}
if(t.id==="accFile"&&t.files&&t.files[0]){var af=t.files[0],rd=new FileReader();
rd.onload=function(){try{var obj=JSON.parse(String(rd.result));
if(importReqPayload(obj)){toast("ok","Demande importée",(obj.user&&obj.user.name)||"Tiers");beep("imp");if(ACC_OPEN){var b=$("#accBody");if(b)b.innerHTML=accessBody();}if(S.view==="admin")render();}
else{toast("err","Fichier non reconnu","Attendu : demande-acces-….json ou code MDR1-.");beep("err");}}
catch(e){toast("err","Lecture impossible",String(e));beep("err");}};
rd.readAsText(af);return;}
if(t.id==="impFile"&&t.files&&t.files[0]){var f=t.files[0],ext=f.name.toLowerCase().split(".").pop(),rd2=new FileReader();
if(ext==="xlsx"||ext==="ods"||ext==="zip"){rd2.onload=function(){parseOffice(f.name,rd2.result);};rd2.readAsArrayBuffer(f);}
else{rd2.onload=function(){var ta=$("#impText");if(ta)ta.value=String(rd2.result).slice(0,200000);
try{analyzePayload(sniff(f.name,String(rd2.result)),f.name);}catch(e){$("#impReport").innerHTML="<div class='rep rj'>Fichier non exploitable : "+esc(String(e))+"</div>";beep("err");}};rd2.readAsText(f);}
return;}
});
document.addEventListener("submit",function(ev){var form=ev.target.closest?ev.target.closest("[data-form]"):null;if(!form)return;ev.preventDefault();
var fd=new FormData(form);
if(form.dataset.form==="admin"){var p=$("#gatePwd");if(p)p.value="";
if(fd.get("pwd")===PWD)enterAdmin();else{toast("err","Mot de passe incorrect");beep("err");gateShow("admin",{force:true,focus:true});}return;}
if(form.dataset.form==="tier"){
var name=String(fd.get("name")||GATE_NAME||"").trim().slice(0,24);
if(name.length<2){toast("err","Prénom requis","Saisissez au moins 2 caractères.");beep("err");
var n=$("#gateName");if(n){try{n.focus();}catch(e){}}return;}
try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}catch(e){}
GATE_NAME=name;
regLoad();
var ex=null;REG.users.forEach(function(u){if(nk(u.name)===nk(name))ex=u;});
if(ex){TIER=ex.id;
if(ex.status==="granted"){enterTier();return;}
if(ex.status!=="pending"){ex.status="pending";ex.ts=Date.now();ex.at=null;}
REG.tomb=REG.tomb.filter(function(x){return x!==ex.id;});
REG.seen=REG.seen.filter(function(x){return x!==ex.id;});}
else{var u2={id:uid("U"),name:name,status:"pending",ts:Date.now(),at:null};REG.users.push(u2);TIER=u2.id;}
regLog("Demande d'accès — "+name);
var ok=regSave();
bcast({t:"reg",rev:REG.rev,force:true});
gateShow("tier",{force:true});
if(ok)toast("ok","Demande transmise","Notification administrateur : cloche + badge + bannière + son.");
else toast("warn","Demande en mémoire","Stockage limité : le code affiché permet la reprise côté admin.");
beep("imp");
osNotify("MECADATA — demande d'accès",name+" demande l'accès à la console.");
return;}
});
document.addEventListener("dragover",function(ev){var dz=ev.target.closest?ev.target.closest("#dz"):null;if(dz){ev.preventDefault();dz.classList.add("over");}});
document.addEventListener("dragleave",function(ev){var dz=ev.target.closest?ev.target.closest("#dz"):null;if(dz)dz.classList.remove("over");});
document.addEventListener("drop",function(ev){var dz=ev.target.closest?ev.target.closest("#dz"):null;if(!dz)return;ev.preventDefault();dz.classList.remove("over");
var f=ev.dataTransfer&&ev.dataTransfer.files&&ev.dataTransfer.files[0];if(!f)return;
var ext=f.name.toLowerCase().split(".").pop(),rd=new FileReader();
if(ext==="xlsx"||ext==="ods"||ext==="zip"){rd.onload=function(){parseOffice(f.name,rd.result);};rd.readAsArrayBuffer(f);}
else{rd.onload=function(){var ta=$("#impText");if(ta)ta.value=String(rd.result).slice(0,200000);
try{analyzePayload(sniff(f.name,String(rd.result)),f.name);}catch(e){$("#impReport").innerHTML="<div class='rep rj'>Fichier non exploitable : "+esc(String(e))+"</div>";}};rd.readAsText(f);}});
document.addEventListener("keydown",function(ev){
if(ev.key==="Escape"){if(modalOpenFn()){ACC_OPEN=false;closeModal();}else if(S.drawer)closeDrawer();else omniClose();return;}
if(ev.key==="/"&&!/input|textarea|select/i.test(ev.target.tagName)){var o=$("#omni");if(o&&MODE){ev.preventDefault();o.focus();}return;}
if((ev.key==="a"||ev.key==="A")&&!/input|textarea|select/i.test(ev.target.tagName)&&isAdmin()){ev.preventDefault();openAccess();return;}
if(ev.target&&ev.target.id==="omni"){
if(ev.key==="ArrowDown"){ev.preventDefault();omniMove(1);}
else if(ev.key==="ArrowUp"){ev.preventDefault();omniMove(-1);}
else if(ev.key==="Enter"){ev.preventDefault();var box=$("#omnires"),els=box?$$(".hit",box):[],p=els[S.omni.idx]||els[0];if(p)omniActivate(p.dataset.kind,p.dataset.id);}}
if((ev.key==="Enter"||ev.key===" ")&&ev.target.classList&&ev.target.classList.contains("eng")){ev.preventDefault();ev.target.click();}
});
window.addEventListener("hashchange",function(){if(!MODE)return;route();beep("tick");});
window.addEventListener("storage",function(ev){
if(ev.key===AKEY){regLoad();bellRefresh();notifyPending();if(isTier())tierSync();else if(isAdmin()&&S.view==="admin")render();else gateSync();}
if(ev.key===PKEY&&isTier())tierSync();});
window.addEventListener("focus",function(){regLoad();bellRefresh();notifyPending();gateSync();});
window.addEventListener("pagehide",function(){if(isAdmin())saveNow();});
document.addEventListener("visibilitychange",function(){
if(document.hidden){if(isAdmin())saveNow();return;}
regLoad();bellRefresh();notifyPending();if(isTier())tierSync();else gateSync();});
setInterval(function(){var c=$("#clk");if(c)c.textContent=new Date().toLocaleTimeString("fr-FR");},1000);
setInterval(function(){if(isAdmin()&&DIRTY)saveNow();},20000);
setInterval(function(){
regLoad();bellRefresh();
if(isTier()){tierSync();return;}
if(!MODE){gateSync();return;}
if(isAdmin())notifyPending();
},900);
}
function route(){var h=(location.hash||"#/bord").replace("#/","");
var allowed=isTier()?["bord","explorer","tech","entretien","studio","diagnostic"]:["bord","explorer","tech","entretien","studio","admin","diagnostic"];
S.view=allowed.indexOf(h)>-1?h:"bord";render();}
function boot(){var o=$("#boot"),done=function(){if(!o)return;o.className="off";};
var L=[["Noyau MECADATA v8.4 · "+window.__MD_FIX,12],["Couverture exhaustive des motorisations",34],[DB.brands.length+" marques · "+DB.models.length+" modèles",58],[fmt(DB.engines.length)+" motorisations",78],[DB.faults.length+" pannes · "+DB.tsb.length+" TSB/rappels",92],["Remontée de demande garantie (bridge + code + fichier)",100]];
var lg=$("#bl"),i=0,step=function(){if(i>=L.length){setTimeout(done,260);return;}
var x=L[i++],d=document.createElement("div");d.innerHTML="<b>OK</b> "+esc(x[0]);lg.appendChild(d);
while(lg.children.length>5)lg.removeChild(lg.firstChild);$("#bbar").style.width=x[1]+"%";setTimeout(step,110);};
setTimeout(step,120);setTimeout(done,2600);}
function init(){
if(!window.MD_RAW){logErr("init",new Error("MD_RAW absent"));window.__MD_READY=false;return;}
injectNotifCss();hardenResize();bridgeDetect();
SEED=build(window.MD_RAW);FIXES+=hardNormalize(SEED);ensureCoverage(SEED);DB=clone(SEED);
regLoad();preloadIdb();recompute();
try{if(window.BroadcastChannel){CH=new BroadcastChannel("mecadata_v84");CH.onmessage=function(ev){var m=ev.data||{};
if(m.t==="reg"){regLoad();bellRefresh();notifyPending();if(isTier())tierSync();else if(isAdmin()&&S.view==="admin")render();else gateSync();}
if(m.t==="pub"&&isTier())tierSync();};}}catch(e){}
WP.init();ensureBell();bind();runTests();updateMeta();boot();
gateShow(null,{force:true});
window.__MD_READY=true;window.__MD_SCRIPTS.app=true;
var jf=$("#jsfail");if(jf&&jf.parentNode)jf.parentNode.removeChild(jf);
setTimeout(ensureBell,400);setTimeout(ensureBell,1500);
setTimeout(function(){regLoad();bellRefresh();},600);
}
try{init();}catch(e){logErr("init",e);if(window.__MD_LIFT)window.__MD_LIFT();
var v=$("#view");if(v)v.innerHTML="<div class='card panel'><h3 style='color:#FF4D5E'>Erreur d'initialisation</h3><p class='muted'>"+esc(e.message)+"</p><button class='btn pri' onclick='location.reload(true)'>Recharger</button></div>";
window.__MD_READY=false;}
})();
