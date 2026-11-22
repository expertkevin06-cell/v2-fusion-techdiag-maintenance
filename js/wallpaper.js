/* MECADATA — moteur de fonds d'écran animés : 8 scènes × 6 palettes, 20 réglages live */
'use strict';
const WP={
P:{mode:'blueprint',theme:'diag',density:62,count:130,speed:100,turb:34,scale:64,glow:56,blur:0,stroke:1.4,drift:38,quality:'std',format:'free',grid:true,grain:true,scan:true,vig:true,run:true,bg:true},
TH:{
 diag:{n:'Diagnostic',bg:'#04070D',a:'#25D4EE',b:'#4D8DFF',c:'#E45CFF',d:'#43E08B'},
 torque:{n:'Couple',bg:'#0B0603',a:'#FFAF2E',b:'#FF7A3D',c:'#FF4D5E',d:'#FFD98A'},
 acid:{n:'Acide',bg:'#040A06',a:'#A8E63C',b:'#43E08B',c:'#25D4EE',d:'#E4FF7A'},
 plasma:{n:'Plasma',bg:'#08040F',a:'#E45CFF',b:'#8F7CFF',c:'#25D4EE',d:'#FF6FB1'},
 ocean:{n:'Océan',bg:'#02080C',a:'#19B8A6',b:'#4D8DFF',c:'#25D4EE',d:'#7CE8D0'},
 steel:{n:'Acier',bg:'#070A0E',a:'#9FB2C8',b:'#5F7288',c:'#25D4EE',d:'#E6EEF9'}
},
MODES:[['blueprint','GRILLE'],['aurora','AURORA'],['flux','FLUX'],['radar','RADAR'],['oscillo','OSCILLO'],['gears','MÉCA'],['carbon','CARBONE'],['telemetry','TÉLÉM.']],
PRESETS:{
 'Diagnostic':{mode:'blueprint',theme:'diag',density:62,count:130,speed:100,turb:34,scale:64,glow:56,stroke:1.4,drift:38},
 'Banc dyno':{mode:'telemetry',theme:'torque',density:70,count:120,speed:120,turb:45,scale:56,glow:62,stroke:1.8,drift:20},
 'Nuit carbone':{mode:'carbon',theme:'steel',density:55,count:80,speed:60,turb:20,scale:48,glow:34,stroke:1.2,drift:26},
 'Radar atelier':{mode:'radar',theme:'acid',density:60,count:110,speed:85,turb:30,scale:70,glow:70,stroke:1.6,drift:30},
 'Scope 4 cyl':{mode:'oscillo',theme:'acid',density:66,count:100,speed:130,turb:52,scale:60,glow:66,stroke:1.6,drift:18},
 'Plasma':{mode:'aurora',theme:'plasma',density:74,count:150,speed:70,turb:40,scale:80,glow:78,stroke:1.4,drift:44},
 'Train d’engrenages':{mode:'gears',theme:'torque',density:60,count:90,speed:80,turb:24,scale:74,glow:52,stroke:1.6,drift:22},
 'Flux de données':{mode:'flux',theme:'ocean',density:68,count:170,speed:110,turb:48,scale:64,glow:58,stroke:1.2,drift:34}
},
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
  t.W=w;t.H=h;t.cv.width=Math.max(1,Math.round(w*dpr));t.cv.height=Math.max(1,Math.round(h*dpr));
  t.ctx.setTransform(dpr,0,0,dpr,0,0);t.key='';
 });
 this.drawAll();
},
set(k,v){this.P[k]=v;if(k==='quality')this.resize();if(['mode','count','scale','density'].includes(k))this.targets.forEach(t=>t.key='');
 if(['grain','scan','vig'].includes(k))this.fx();if(k==='blur')this.fx();if(this.P.run)this.drawAll();save();this.sync()},
fx(){
 const b=document.body;b.classList.toggle('nograin',!this.P.grain);b.classList.toggle('noscan',!this.P.scan);b.classList.toggle('novig',!this.P.vig);
 $('#bgc').style.filter=this.P.blur?`blur(${this.P.blur}px)`:'none';
 const sc=$('#screen');if(sc){sc.classList.toggle('nograin',!this.P.grain);sc.classList.toggle('noscan',!this.P.scan);sc.classList.toggle('novig',!this.P.vig);const c=sc.querySelector('canvas');if(c)c.style.filter=this.P.blur?`blur(${this.P.blur}px)`:'none'}
},
apply(){this.fx();this.targets.forEach(t=>t.key='');if(this.P.run&&!document.hidden)this.start();else{this.stop();this.drawAll()}this.sync()},
start(){if(this.running)return;this.running=true;this.last=performance.now();
 const loop=now=>{if(!this.running)return;const dt=Math.min(.05,(now-this.last)/1000);this.last=now;this.t+=dt*(this.P.speed/100);this.drawAll();this.raf=requestAnimationFrame(loop)};
 this.raf=requestAnimationFrame(loop)},
stop(){this.running=false;cancelAnimationFrame(this.raf)},
mkState(t){
 const P=this.P,W=t.W,H=t.H,I=P.density/100,sc=t.scale;
 const n=Math.round(clamp(P.count*(W*H)/(1280*720),12,420)*sc);
 const pts=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(.2+Math.random()*.8)*(Math.random()<.5?-1:1),vy:(Math.random()-.5)*.4,r:.8+Math.random()*1.9,p:Math.random()*6.28,k:Math.floor(Math.random()*4)}));
 return {pts,blips:Array.from({length:Math.round(16*I)+5},()=>({a:Math.random()*6.28,d:.14+Math.random()*.82,h:0})),
 lanes:Array.from({length:Math.round(9*I)+3},()=>({h:Math.random()<.5,pos:Math.random(),sp:.0007+Math.random()*.0022,o:Math.random()})),
 tr:[Array.from({length:150},()=>.5),Array.from({length:150},()=>.4),Array.from({length:150},()=>.6)],ph:0,gears:null,tile:null,tk:'',fade:false};
},
drawAll(){this.targets.forEach(t=>{if(!t.W||!t.H)return;const key=[this.P.mode,this.P.count,this.P.scale,this.P.density,t.W,t.H,t.scale].join('|');if(t.key!==key){t.st=this.mkState(t);t.key=key}this.draw(t.ctx,t.W,t.H,this.t,this.P,t.st,this.TH[this.P.theme]||this.TH.diag,t.scale)})},
gearPath(r,teeth,d){
 const p=new Path2D(),s=Math.PI*2/teeth;
 for(let i=0;i<teeth;i++){const a=i*s;
  p.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  p.lineTo(Math.cos(a+s*.17)*(r+d),Math.sin(a+s*.17)*(r+d));
  p.lineTo(Math.cos(a+s*.43)*(r+d),Math.sin(a+s*.43)*(r+d));
  p.lineTo(Math.cos(a+s*.6)*r,Math.sin(a+s*.6)*r);}
 p.closePath();return p;
},
draw(c,W,H,t,P,st,TH,sc){
 const I=P.density/100,TB=P.turb/100,G=P.glow/100,LW=P.stroke,DR=.2+P.drift/100;
 const cols=[TH.a,TH.b,TH.c,TH.d];
 if(P.mode==='oscillo'){c.fillStyle=TH.bg+'2E';c.fillRect(0,0,W,H)}
 else{c.fillStyle=TH.bg;c.fillRect(0,0,W,H)}
 c.lineWidth=LW;c.lineCap='round';
 if(P.grid&&P.mode!=='carbon'&&P.mode!=='aurora'){
  const s=Math.max(18,P.scale),o=(t*9*DR)%s;
  c.strokeStyle=TH.a+'12';c.beginPath();
  for(let x=-o;x<W+s;x+=s){c.moveTo(x,0);c.lineTo(x,H)}
  for(let y=-o*.6;y<H+s;y+=s){c.moveTo(0,y);c.lineTo(W,y)}
  c.stroke();
 }
 const glow=v=>{c.shadowColor=v;c.shadowBlur=G*16};
 const noglow=()=>{c.shadowBlur=0};
 if(P.mode==='blueprint'){
  const s=Math.max(18,P.scale),o=(t*9*DR)%s;
  c.strokeStyle=TH.b+'14';c.beginPath();for(let x=-o*2;x<W+H;x+=s*4){c.moveTo(x,0);c.lineTo(x-H,H)}c.stroke();
  st.lanes.forEach(l=>{l.o=(l.o+l.sp*P.speed/100*2)%1;const px=l.h?W*l.o:H*l.o;glow(TH.a);c.fillStyle=TH.a+'CC';
   if(l.h)c.fillRect(px,Math.floor(l.pos*H/s)*s-o*.6,26,LW+1);else c.fillRect(Math.floor(l.pos*W/s)*s-o,px,LW+1,26);noglow()});
  st.pts.forEach((p,i)=>{if(i%2)return;p.p+=.02*P.speed/100;const a=(.22+Math.sin(p.p)*.18)*I;
   c.strokeStyle=TH.a+Math.round(a*255).toString(16).padStart(2,'0');c.beginPath();c.moveTo(p.x-5,p.y);c.lineTo(p.x+5,p.y);c.moveTo(p.x,p.y-5);c.lineTo(p.x,p.y+5);c.stroke();
   if(Math.sin(p.p*.5)>.965){c.strokeStyle=TH.c+'66';c.beginPath();c.arc(p.x,p.y,8+Math.sin(p.p)*3,0,6.283);c.stroke()}});
 }else if(P.mode==='aurora'){
  const bl=[[.26,.3,0],[.74,.62,2],[.54,.2,1],[.3,.82,3]];
  bl.forEach((b,i)=>{const x=W*(b[0]+Math.sin(t*.22*DR+i*2)*.12),y=H*(b[1]+Math.cos(t*.18*DR+i)*.12),r=Math.min(W,H)*(.34+.09*Math.sin(t*.3+i));
   const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cols[b[2]]+Math.round(46*I).toString(16).padStart(2,'0'));g.addColorStop(1,cols[b[2]]+'00');c.fillStyle=g;c.fillRect(0,0,W,H)});
  st.pts.slice(0,Math.round(70*sc)).forEach(p=>{p.p+=.03;c.fillStyle=TH.d+Math.round((.14+Math.sin(p.p)*.12)*255*I).toString(16).padStart(2,'0');c.fillRect(p.x,p.y,1.6,1.6)});
 }else if(P.mode==='flux'){
  const pts=st.pts,sp=P.speed/100;
  pts.forEach(p=>{p.x+=p.vx*sp*1.7+Math.sin(t*.6+p.p)*TB*.7;p.y+=p.vy*sp*1.7+Math.cos(t*.5+p.p)*TB*.7;
   if(p.x<-12)p.x=W+12;if(p.x>W+12)p.x=-12;if(p.y<-12)p.y=H+12;if(p.y>H+12)p.y=-12});
  const R=Math.max(48,P.scale*1.4),R2=R*R;
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
   const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;
   if(d<R2){c.strokeStyle=TH.a+Math.round((1-d/R2)*36*I).toString(16).padStart(2,'0');c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}}
  pts.forEach(p=>{const col=cols[p.k];glow(col);c.fillStyle=col;c.globalAlpha=.72*I+.15;c.beginPath();c.arc(p.x,p.y,p.r,0,6.283);c.fill();c.globalAlpha=1;noglow()});
 }else if(P.mode==='radar'){
  const cx=W*.66,cy=H*.46,R=Math.min(W,H)*.42,ang=(t*.8*(P.speed/100))%6.283;
  c.strokeStyle=TH.a+'22';for(let i=1;i<=4;i++){c.beginPath();c.arc(cx,cy,R*i/4,0,6.283);c.stroke()}
  c.beginPath();c.moveTo(cx-R,cy);c.lineTo(cx+R,cy);c.moveTo(cx,cy-R);c.lineTo(cx,cy+R);c.stroke();
  for(let a=0;a<6.283;a+=Math.PI/12){c.beginPath();c.moveTo(cx+Math.cos(a)*R*.94,cy+Math.sin(a)*R*.94);c.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);c.stroke()}
  if(c.createConicGradient){const g=c.createConicGradient(ang,cx,cy);g.addColorStop(0,TH.a+'55');g.addColorStop(.14,TH.a+'00');g.addColorStop(1,TH.a+'00');c.fillStyle=g;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,0,6.283);c.fill()}
  glow(TH.a);c.strokeStyle=TH.a;c.lineWidth=LW+.6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);c.stroke();noglow();c.lineWidth=LW;
  st.blips.forEach(b=>{const da=((ang-b.a)%6.283+6.283)%6.283;if(da<.07)b.h=1;b.h*=.986;
   if(b.h>.02){const x=cx+Math.cos(b.a)*R*b.d,y=cy+Math.sin(b.a)*R*b.d;glow(TH.d);c.fillStyle=TH.d+Math.round(b.h*230).toString(16).padStart(2,'0');c.beginPath();c.arc(x,y,3,0,6.283);c.fill();noglow()}});
  c.fillStyle=TH.a+'88';c.font='9px "IBM Plex Mono",monospace';c.fillText('PORTÉE '+Math.round(R)+' u',cx-R,cy+R+16);c.fillText(Math.round(ang*57.3)+'°',cx+6,cy-R-6);
 }else if(P.mode==='oscillo'){
  const ch=Math.max(2,Math.round(2+I*4)),sp=P.speed/100;
  st.ph+=.05*sp;
  for(let k=0;k<ch;k++){
   const base=H*(k+.6)/(ch+.2),amp=H/(ch*3.1),col=cols[k%4];
   glow(col);c.strokeStyle=col;c.lineWidth=LW+.4;c.beginPath();
   for(let x=0;x<=W;x+=3){
    const u=x/W*12+st.ph+k*1.3;
    const y=base+Math.sin(u)*amp*.6+Math.sin(u*3.1+k)*amp*.28*TB+Math.sin(u*7.7)*amp*.14*TB+(Math.random()-.5)*TB*3;
    x?c.lineTo(x,y):c.moveTo(x,y);
   }
   c.stroke();noglow();
   c.fillStyle=col+'99';c.font='9px "IBM Plex Mono",monospace';c.fillText('CYL'+(k+1),8,base-amp-4);
  }
  c.strokeStyle=TH.d+'55';c.setLineDash([4,5]);c.beginPath();c.moveTo(W*.5,0);c.lineTo(W*.5,H);c.stroke();c.setLineDash([]);
  c.fillStyle=TH.d+'99';c.fillText('TRIG',W*.5+5,14);c.lineWidth=LW;
 }else if(P.mode==='gears'){
  const s=Math.max(30,P.scale),ang=t*.7*(P.speed/100)*DR*2;
  if(!st.gears){
   const defs=[[s*1.15,18],[s*.78,12],[s*.55,9],[s*.9,14]];let x=0;
   st.gears=defs.map((d,i)=>{const r=d[0],prev=i?st.gears[i-1]:null;const cx=i?prev.cx+prev.r+r+s*.16:0;
    return {cx,r,teeth:d[1],path:this.gearPath(r,d[1],s*.16),col:cols[i%4],dir:i%2?-1:1,ratio:18/d[1]}});
   const span=st.gears[st.gears.length-1].cx;st.goff=-span/2;
  }
  c.save();c.translate(W*.5+st.goff,H*.46);
  st.gears.forEach((g,i)=>{c.save();c.translate(g.cx,0);c.rotate(ang*g.dir*g_ratio(g));
   glow(g.col);c.strokeStyle=g.col;c.lineWidth=LW+.5;c.stroke(g.path);noglow();
   c.strokeStyle=g.col+'66';c.beginPath();c.arc(0,0,g.r*.32,0,6.283);c.stroke();
   for(let k=0;k<5;k++){const a=k*1.2566;c.beginPath();c.moveTo(Math.cos(a)*g.r*.32,Math.sin(a)*g.r*.32);c.lineTo(Math.cos(a)*g.r*.82,Math.sin(a)*g.r*.82);c.stroke()}
   c.restore()});
  c.restore();
  const cr=Math.min(W,H)*.11,rl=cr*3.1,px=W*.5,py=H*.86,a2=ang*1.6;
  const pinx=px+Math.cos(a2)*cr,piny=py+Math.sin(a2)*cr;
  const pist=py-Math.sqrt(Math.max(1,rl*rl-Math.pow(pinx-px,2)));
  glow(TH.b);c.strokeStyle=TH.b;c.lineWidth=LW+.8;
  c.beginPath();c.arc(px,py,cr,0,6.283);c.stroke();
  c.beginPath();c.moveTo(px,py);c.lineTo(pinx,piny);c.lineTo(px,pist);c.stroke();
  c.strokeRect(px-cr*.62,pist-cr*.5,cr*1.24,cr*.72);
  noglow();c.strokeStyle=TH.a+'55';c.lineWidth=LW;
  c.beginPath();c.moveTo(px-cr*.8,pist-cr*1.9);c.lineTo(px-cr*.8,py-cr*.4);c.moveTo(px+cr*.8,pist-cr*1.9);c.lineTo(px+cr*.8,py-cr*.4);c.stroke();
  c.fillStyle=TH.d+'99';c.font='9px "IBM Plex Mono",monospace';c.fillText('VILEBREQUIN '+Math.round((a2*57.3)%360)+'°',px+cr+10,py);
 }else if(P.mode==='carbon'){
  const s=Math.max(14,Math.round(P.scale/2));
  if(!st.tile||st.tk!==s+TH.bg){
   const o=document.createElement('canvas');o.width=o.height=s*2;const oc=o.getContext('2d');
   oc.fillStyle=TH.bg;oc.fillRect(0,0,s*2,s*2);
   for(let y=0;y<2;y++)for(let x=0;x<2;x++){
    const g=oc.createLinearGradient(x*s,y*s,(x+1)*s,(y+1)*s);
    const dark=(x+y)%2===0;g.addColorStop(0,dark?'#FFFFFF10':'#FFFFFF04');g.addColorStop(1,'#00000030');
    oc.fillStyle=g;oc.fillRect(x*s,y*s,s,s);
    oc.strokeStyle='#FFFFFF08';oc.strokeRect(x*s+.5,y*s+.5,s-1,s-1);
   }
   st.tile=c.createPattern(o,'repeat');st.tk=s+TH.bg;
  }
  c.fillStyle=st.tile;c.fillRect(0,0,W,H);
  const sweep=((t*.16*(P.speed/100)*DR*2)%1.6-.3)*W;
  const g=c.createLinearGradient(sweep-W*.2,0,sweep+W*.2,H);
  g.addColorStop(0,TH.a+'00');g.addColorStop(.5,TH.a+Math.round(30*I+12).toString(16).padStart(2,'0'));g.addColorStop(1,TH.a+'00');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  st.pts.slice(0,Math.round(26*sc)).forEach((p,i)=>{p.p+=.012;const r=8+Math.sin(p.p)*4;
   c.strokeStyle=cols[i%4]+Math.round((.18+Math.sin(p.p)*.12)*255*I).toString(16).padStart(2,'0');
   c.beginPath();for(let k=0;k<6;k++){const a=k*1.0472+p.p*.2;const x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;k?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.stroke()});
 }else{ /* telemetry */
  const sp=P.speed/100;
  st.tr.forEach((arr,i)=>{const last=arr[arr.length-1];
   const target=.5+Math.sin(t*(.6+i*.35))*.3+Math.sin(t*(2.1+i))*.12*TB;
   arr.push(clamp(last+(target-last)*.16*sp+(Math.random()-.5)*TB*.05,.05,.95));if(arr.length>150)arr.shift()});
  const gw=W*.72,gh=H*.62,ox=W*.06,oy=H*.12;
  c.strokeStyle=TH.a+'18';for(let i=0;i<=4;i++){const y=oy+gh*i/4;c.beginPath();c.moveTo(ox,y);c.lineTo(ox+gw,y);c.stroke()}
  st.tr.forEach((arr,i)=>{const col=cols[i%4];glow(col);c.strokeStyle=col;c.lineWidth=LW+.5;c.beginPath();
   arr.forEach((v,j)=>{const x=ox+gw*j/(arr.length-1),y=oy+gh*(1-v);j?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();noglow();
   const lv=arr[arr.length-1];c.fillStyle=col;c.font='600 11px "IBM Plex Mono",monospace';
   c.fillText(['RÉGIME','COUPLE','PRESSION'][i]+'  '+Math.round(lv*(i===0?7000:i===1?600:2.4)*(i===2?10:1))/(i===2?10:1),ox+gw+12,oy+18+i*20);
   c.fillStyle=col+'22';c.fillRect(ox+gw+12,oy+24+i*20,Math.max(2,lv*70),3)});
  const bars=8,bw=(W*.86)/bars;
  for(let i=0;i<bars;i++){const v=.25+Math.abs(Math.sin(t*1.4+i*.7))*.7*(.5+TB*.5);
   const x=ox+i*bw,h=H*.14*v;glow(cols[i%4]);c.fillStyle=cols[i%4]+'AA';c.fillRect(x,H*.92-h,bw*.62,h);noglow()}
  c.fillStyle=TH.a+'77';c.font='9px "IBM Plex Mono",monospace';c.fillText('PRESSION CYLINDRE (bar)',ox,H*.96+12);
  c.lineWidth=LW;
 }
 if(P.vig){const g=c.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.2,W*.5,H*.5,Math.max(W,H)*.75);
  g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000'+(P.mode==='aurora'?'55':'88'));c.fillStyle=g;c.fillRect(0,0,W,H)}
},
exportPNG(){
 const F={free:[1600,900],mobile:[1170,2532],tablet:[1668,2224],desktop:[1920,1080]}[this.P.format]||[1600,900];
 const cv=document.createElement('canvas');cv.width=F[0];cv.height=F[1];
 const ctx=cv.getContext('2d'),t={W:F[0],H:F[1],scale:1};t.st=this.mkState(t);
 this.draw(ctx,F[0],F[1],this.t,this.P,t.st,this.TH[this.P.theme],1);
 cv.toBlob(b=>{if(!b){toast('err','Export impossible');return}
  const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`mecadata_fond_${this.P.mode}_${this.P.theme}_${F[0]}x${F[1]}.png`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),600);
  toast('ok','Fond exporté',`${F[0]}×${F[1]} px — scène « ${this.P.mode} », palette « ${this.TH[this.P.theme].n} ».`);beep('ok')},'image/png');
},
sync(){
 const rb=$('#runb');if(rb){rb.innerHTML=ic(this.P.run?'pause':'play');rb.classList.toggle('on',this.P.run)}
 $$('.mb').forEach(b=>b.classList.toggle('on',b.dataset.m===this.P.mode));
 $$('.pb').forEach(b=>b.classList.toggle('on',b.dataset.t===this.P.theme));
 $$('[data-p]').forEach(el=>{const k=el.dataset.p,v=this.P[k];
  if(el.type==='checkbox')el.checked=!!v;else if(el.type==='range'||el.tagName==='SELECT')el.value=v;
  const out=$(`[data-pv="${k}"]`);if(out)out.textContent=this.label(k,v)});
 const hud=$('#hud');if(hud)hud.innerHTML=`<span>${this.P.mode.toUpperCase()}</span><span>${this.TH[this.P.theme].n.toUpperCase()}</span><span>${this.P.count} pts</span><span>${this.P.speed}%</span><span>${this.P.run?'LIVE':'PAUSE'}</span>`;
}
,label(k,v){
 const u={density:'%',speed:'%',turb:'%',glow:'%',scale:' px',stroke:' px',blur:' px',drift:'%',count:''};
 return (k==='stroke'?(+v).toFixed(1):Math.round(v))+(u[k]||'');
}
};
function g_ratio(g){return g.ratio}
