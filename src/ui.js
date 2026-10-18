/* ===== Zestrea UI ===== */
const $=q=>document.querySelector(q);
const esc=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let db=null,user=null,ME=null,myName=LS.get("zname")||"",code=null,S=null,unsubG=null,lobby=[],busy=false,view="loading",hardSel=5,forceArm=0;
let SH=null; // open sheet state
let tmSel={turn:30,wed:120,auct:20},lastFx=null,seenW=0,seenNeg={},popQ=[],popOpen=null,popT=null,timeoutTried=null,lastTick=null;
let chat=[],unsubC=null,chatOpen=false,chatSeen=0,chatFirst=true,muted=LS.get("zmute")==="1";

/* ---------- sound (synthesized, no files) ---------- */
let AC=null,OUT=null,unlocked=false,htmlA=null;
const SILENT="data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
function ac(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();
    const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
    OUT=AC.createGain();OUT.gain.value=.95;OUT.connect(comp).connect(AC.destination);}catch(e){return null;}}
  return AC;
}
function unlock(){
  const a=ac();if(!a)return;
  try{if(navigator.audioSession&&navigator.audioSession.type!=="playback")navigator.audioSession.type="playback";}catch(e){}
  if(a.state!=="running")a.resume().catch(()=>{});
  if(!unlocked){unlocked=true;
    try{const b=a.createBuffer(1,1,22050),src=a.createBufferSource();src.buffer=b;src.connect(a.destination);src.start(0);}catch(e){}
    // older iPhones mute Web Audio on the ring/silent switch; a playing <audio> element moves the page to the media channel
    if(!navigator.audioSession){try{htmlA=new Audio(SILENT);htmlA.loop=true;htmlA.setAttribute("playsinline","");htmlA.play().catch(()=>{});}catch(e){}}
  }
}
["touchend","click","keydown"].forEach(ev=>document.addEventListener(ev,unlock,{capture:true,passive:true}));
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(htmlA)htmlA.pause();}else{if(htmlA&&unlocked)htmlA.play().catch(()=>{});if(AC&&AC.state!=="running")AC.resume().catch(()=>{});}});
function sfx(k){
  if(muted||!SFX[k])return;const a=ac();if(!a)return;
  const go=()=>{try{SFX[k](a.currentTime+.02);}catch(e){}};
  if(a.state==="running")go();else a.resume().then(go).catch(()=>{});
}
// building blocks: _o()=oscillator note, _n()=filtered noise burst
function _o(t,f,d,{type="sine",g=.15,to=null,lp=null,vib=0,a=.01}={}){
  const x=AC.createOscillator(),v=AC.createGain();x.type=type;x.frequency.setValueAtTime(f,t);
  if(to)x.frequency.exponentialRampToValueAtTime(to,t+d);
  if(vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.5;lg.gain.value=vib;l.connect(lg).connect(x.frequency);l.start(t);l.stop(t+d+.1);}
  v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+a);v.gain.exponentialRampToValueAtTime(.0001,t+d);
  let node=x;if(lp){const fl=AC.createBiquadFilter();fl.type="lowpass";fl.frequency.value=lp;x.connect(fl);node=fl;}
  node.connect(v).connect(OUT);x.start(t);x.stop(t+d+.05);
}
function _n(t,d,{g=.2,type="bandpass",f=2000,q=1,to=null}={}){
  const len=Math.max(1,AC.sampleRate*d|0),b=AC.createBuffer(1,len,AC.sampleRate),ch=b.getChannelData(0);
  for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
  const src=AC.createBufferSource();src.buffer=b;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);fl.Q.value=q;
  if(to)fl.frequency.exponentialRampToValueAtTime(to,t+d);
  const v=AC.createGain();v.gain.value=g;src.connect(fl).connect(v).connect(OUT);src.start(t);
}
const bell=(t,f,g=.12,d=1.2)=>{_o(t,f,d,{g});_o(t,f*2.76,d*.5,{g:g*.35});_o(t,f*5.4,d*.25,{g:g*.15});};
const SFX={
  tap(t){_n(t,.03,{g:.35,f:1800,q:3});_o(t,520,.06,{type:"triangle",g:.08});},
  dice(t){let x=t;for(let i=0;i<9;i++){x+=.035+Math.random()*.06;_n(x,.03,{g:.5,f:2400+Math.random()*1500,q:4});}
    x+=.06;_o(x,140,.18,{type:"triangle",g:.35,to:70});_n(x,.08,{g:.4,type:"lowpass",f:600});
    _o(x+.13,120,.12,{type:"triangle",g:.2,to:80});_n(x+.13,.05,{g:.25,type:"lowpass",f:700});},
  coin(t){bell(t,1568,.09,.5);bell(t+.08,2093,.08,.6);_n(t,.15,{g:.12,f:6000,q:2});},
  bid(t){_o(t,180,.12,{type:"triangle",g:.45,to:90});_n(t,.05,{g:.5,type:"lowpass",f:900});},
  win(t){[523,659,784,1046].forEach((f,i)=>_o(t+i*.1,f,.35,{type:"sawtooth",g:.07,lp:2200}));_o(t+.42,1046,.9,{type:"sawtooth",g:.08,lp:2600,vib:6});_o(t+.42,784,.9,{type:"sawtooth",g:.05,lp:2000});bell(t+.42,2093,.06,1);},
  card(t){_n(t,.25,{g:.35,f:900,q:.8,to:5000});_o(t+.12,880,.08,{type:"triangle",g:.06});},
  wedok(t){ // joyful fanfare with bells and a little hora run
    const mel=[[523,0,.16],[659,.15,.16],[784,.3,.16],[1046,.45,.5],[880,.95,.14],[1046,1.08,.14],[1175,1.21,.14],[1318,1.34,.7]];
    mel.forEach(([f,d,l])=>{_o(t+d,f,l+.1,{type:"sawtooth",g:.08,lp:2800});_o(t+d,f/2,l+.1,{type:"triangle",g:.05});});
    [[523,659,784],[659,784,1046]].forEach((ch,i)=>ch.forEach(f=>_o(t+.45+i*.89,f,.6,{type:"triangle",g:.05})));
    for(let i=0;i<10;i++)bell(t+.45+i*.12,[2093,2637,3136][i%3],.04,.4);
    for(let i=0;i<8;i++)_n(t+.95+i*.13,.04,{g:.3,f:4500,q:2});},
  wedfail(t){ // sad trombone: wah wah wah waaah
    [[392,0,.32],[370,.38,.32],[349,.76,.32],[330,1.14,1.1]].forEach(([f,d,l],i)=>_o(t+d,f,l,{type:"sawtooth",g:.11,lp:900,vib:i===3?7:0,a:.04,to:i===3?300:null}));},
  times(t){_n(t,1.8,{g:.5,type:"lowpass",f:180,q:.7});_n(t+.15,1.2,{g:.25,type:"lowpass",f:420});_o(t,65,1.8,{g:.25,to:45});_o(t,98,1.4,{g:.1});},
  good(t){[784,988,1175,1568].forEach((f,i)=>bell(t+i*.12,f,.08,.9));},
  death(t){bell(t,196,.22,2.4);bell(t+1.1,196,.14,2);},
  born(t){_o(t,700,.14,{g:.1,to:1100});_o(t+.16,900,.2,{g:.09,to:1400});},
  feed(t){for(let i=0;i<3;i++)_n(t+i*.16,.09,{g:.4,type:"lowpass",f:500+i*80,q:2});},
  propose(t){[659,784,988,1318].forEach((f,i)=>_o(t+i*.07,f,.5,{type:"triangle",g:.08}));},
  tick(t){_o(t,1250,.05,{type:"square",g:.04});},
  chat(t){_o(t,1320,.09,{g:.08,to:1760});_o(t+.1,1760,.12,{g:.06});},
  neg(t){[392,494,587,784].forEach((f,i)=>_o(t+i*.09,f,.35,{type:"triangle",g:.1}));bell(t+.36,1568,.05,.8);},
  auct(t){bell(t,880,.1,.4);bell(t+.18,880,.1,.4);bell(t+.36,1318,.12,.9);},
  ready(t){_o(t,988,.12,{type:"triangle",g:.06});}
};
function onState(s){
  if(lastFx===null){lastFx=s.fxn||0;seenW=s.wroll?s.wroll.n:0;if(s.phase==="neg")seenNeg[s.code+":"+s.turn]=1;return;}
  const fresh=(s.fx||[]).filter(([n])=>n>lastFx).slice(-4);lastFx=Math.max(lastFx,s.fxn||0);
  fresh.forEach(([n,k,id],i)=>setTimeout(()=>{
    if(k==="propose"){if(id===ME)sfx("propose");}
    else if(k==="ready"||k==="turn"||k==="wedok"||k==="wedfail"){} // wedding sounds play with their popup
    else sfx(k);},i*240));
  if(s.wroll&&s.wroll.n>seenW){seenW=s.wroll.n;if(Date.now()-(s.wroll.at||0)<20000)queuePop({t:"w",w:s.wroll});}
  if(s.phase==="neg"&&!seenNeg[s.code+":"+s.turn]){seenNeg[s.code+":"+s.turn]=1;queuePop({t:"neg"});}
}
function queuePop(x){popQ.push(x);if(!popOpen)nextPop();}
function nextPop(){
  clearTimeout(popT);const el=$("#pop");popOpen=popQ.shift()||null;
  if(!popOpen){el.hidden=true;return;}
  let h="";
  if(popOpen.t==="w"){const w=popOpen.w;
    h=`<div class="popc wed pending ${w.ok?"ok":"no"}"><p class="eyebrow">Nuntă · ${esc(pname(S,w.from))} și ${esc(pname(S,w.to))}</p><h2>${esc(w.a)} + ${esc(w.b)}</h2>
    <div class="bigdie">${w.r?dieFace(w.r):"✓"}</div>
    <p class="need">${w.r?`A picat <b>${w.r}</b> · trebuia ${w.need?`1${w.need>1?"–"+w.need:""}`:"un miracol"}`:esc(w.how||"")}</p>
    <p class="verdict">${w.ok?"Nunta a ieșit!":"Nunta n-a ieșit."}</p><button class="btn" data-a="pop-x">Închide</button></div>`;
    if(w.r)sfx("dice");
    setTimeout(()=>{const c=$("#pop .popc");if(!c||popOpen&&popOpen.w!==w)return;c.classList.remove("pending");
      if(w.ok){sfx("wedok");burst("confetti");}else{sfx("wedfail");burst("rain");}},w.r?750:150);
    popT=setTimeout(nextPop,7000);}
  else if(popOpen.t==="neg"){const p=meP();
    h=`<div class="popc"><p class="eyebrow">Etapa IV</p><h2>Nunți și negocieri</h2>
    <p>Acum poți juca <b>cărțile de Soartă</b> și poți propune nunți oricui, oricând în etapa asta. Când ai terminat, apasă „Sunt gata de Hrană”.</p>
    ${p&&p.hand.length?`<div class="grid1">${p.hand.map(k=>`<button class="btn" data-a="pop-card" data-v="${k}">${esc(FATE[k].t)}</button>`).join("")}</div>`:`<p class="muted small">Nu ai cărți acum. Poți cumpăra una cu 2 Zestre.</p>`}
    <button class="btn primary" data-a="pop-x">Am înțeles</button></div>`;}
  el.innerHTML=h;el.hidden=false;
}
/* ---------- animations ---------- */
const reduceMotion=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}};
function burst(kind){
  if(reduceMotion())return;const L=document.createElement("div");L.className="fxlayer "+kind;
  const cols=["#e3584a","#56b6a6","#e7ad44","#f4e7d6","#2c4d6b"];
  const N=kind==="confetti"?70:kind==="hearts"?16:40;
  for(let i=0;i<N;i++){const d=document.createElement("i");
    d.style.left=(Math.random()*100)+"%";d.style.animationDelay=(Math.random()*(kind==="rain"?1.2:.5))+"s";
    d.style.animationDuration=(kind==="rain"?.7+Math.random()*.5:1.8+Math.random()*1.4)+"s";
    if(kind==="confetti"){d.style.background=cols[i%5];d.style.setProperty("--r",(Math.random()*720-360)+"deg");d.style.setProperty("--x",(Math.random()*120-60)+"px");}
    L.appendChild(d);}
  document.body.appendChild(L);setTimeout(()=>L.remove(),3800);
}
let seenP=null,seenRoll=new Set(),animTurn=null,animAuct=null,prevStat=null,handSeen=null,openOthers=new Set();
function afterRender(){
  if(!S||S.status==="lobby")return;const p=meP();if(!p)return;
  // floating +/- next to your Zestre and Land
  const st={z:p.z,land:p.land};
  if(prevStat&&prevStat.code===S.code){
    [["z",0],["land",1]].forEach(([k,i])=>{const d=st[k]-prevStat[k];if(!d)return;const box=document.querySelectorAll(".stats > span")[i];if(!box)return;
      box.classList.add(d>0?"up":"down");const f=document.createElement("em");f.className="delta "+(d>0?"pos":"neg");f.textContent=(d>0?"+":"")+d;box.appendChild(f);});
  }
  prevStat={...st,code:S.code};
}
function dieFace(n){const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[25,25],[50,50],[75,75]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]}[n]||[];
  return `<svg viewBox="0 0 100 100" aria-label="zar ${n}"><rect x="4" y="4" width="92" height="92" rx="18" class="df"/>${P.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" class="dp"/>`).join("")}</svg>`;}

/* ---------- chat ---------- */
function subChat(c){
  if(unsubC)unsubC();chat=[];chatFirst=true;chatSeen=+(LS.get("zchat:"+c)||0);
  unsubC=db.collection("chat/"+c+"/m").orderBy("t","desc").limit(60).onSnapshot(q=>{
    const list=q.docs.map(d=>d.data()).filter(m=>m&&m.t).sort((a,b)=>a.t-b.t);
    if(!chatFirst&&list.some(m=>m.id!==ME&&!chat.some(o=>o.t===m.t&&o.id===m.id)))sfx("chat");
    chatFirst=false;chat=list;renderChat();
  },()=>{});
}
function renderChat(){
  const btn=$("#chatbtn"),box=$("#chat");if(!btn)return;
  const inGame=view==="game"&&S;btn.hidden=!inGame;if(!inGame){box.hidden=true;return;}
  if(chatOpen&&chat.length){chatSeen=chat[chat.length-1].t;LS.set("zchat:"+code,String(chatSeen));}
  const unread=chat.filter(m=>m.t>chatSeen&&m.id!==ME).length;
  btn.querySelector("b").textContent=unread||"";btn.querySelector("b").hidden=!unread;
  box.hidden=!chatOpen;
  if(chatOpen){const l=$("#chatlist");const atEnd=l.scrollTop+l.clientHeight>=l.scrollHeight-30;
    l.innerHTML=chat.length?chat.map(m=>`<li class="${m.id===ME?"me":""}"><b>${esc(m.n)}</b><span>${esc(m.m)}</span></li>`).join(""):`<li class="sys">Niciun mesaj încă. Negociați aici.</li>`;
    if(atEnd||l.dataset.first!=="0"){l.scrollTop=l.scrollHeight;l.dataset.first="0";}}
}
async function sendChat(){
  const i=$("#chatin");const m=i.value.trim().slice(0,300);if(!m||!code)return;i.value="";
  const me=meP();
  try{await db.collection("chat/"+code+"/m").add({t:Date.now(),id:ME,n:(me&&me.name)||myName||"Boier",m});}
  catch(e){toast("Mesajul nu s-a trimis.");i.value=m;}
}
const fmtT=sec=>{sec=Math.max(0,Math.ceil(sec));return sec>=60?`${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`:`${sec} s`;};
function mustAct(){const p=meP();if(!p)return false;
  if(S.phase==="times"||S.phase==="prod")return !p.ready;
  if(S.phase==="auct")return S.auction&&!S.auction.passed[ME]&&S.auction.by!==ME;
  if(S.phase==="neg")return !p.ready;return false;}
setInterval(()=>{
  if(view!=="game"||!S||S.status!=="play"||!S.dl)return;
  const rem=(S.dl-Date.now())/1000,el=$("#tbar");
  if(el){el.querySelector("i").style.width=Math.max(0,Math.min(1,rem/(S.dlLen||1)))*100+"%";el.querySelector("span").textContent=rem>0?fmtT(rem):"Timpul a expirat";el.classList.toggle("low",rem<=5);}
  const sec=Math.ceil(rem);if(rem>0&&rem<=5&&sec!==lastTick&&mustAct()){lastTick=sec;sfx("tick");}
  if(rem<-1.2&&timeoutTried!==S.dl&&!busy){timeoutTried=S.dl;setTimeout(()=>act(s=>timeout(s),true),Math.random()*600);}
},250);

/* ---------- boot ---------- */
async function boot(){
  render();
  const use=window.claude&&window.claude.use;
  if(use){[db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);}
  if(!db){view="nodb";render();return;}
  ME=user?await user.id():null;
  if(!ME){ME=LS.get("zid")||("g"+Math.random().toString(36).slice(2,10));LS.set("zid",ME);}
  if(!myName&&user){const m=await user.me();myName=(m&&m.name)||"";}
  db.collection("games").orderBy("created","desc").limit(25).onSnapshot(q=>{lobby=q.docs.map(d=>d.data());if(view==="lobby")renderLobbyList();},e=>toast("Lista de jocuri nu se poate încărca."));
  view="lobby";render();
  const last=LS.get("zcode");if(last)openGame(last,true);
}
function openGame(c,silent){
  if(unsubG)unsubG();code=c;LS.set("zcode",c);lastFx=null;subChat(c);
  unsubG=db.doc("games/"+c).onSnapshot(sn=>{
    if(!sn.exists){if(!silent)toast("Jocul nu mai există.");closeGame();return;}
    S=sn.data();onState(S);
    if(!S.players.some(p=>p.id===ME)&&S.status!=="lobby"){closeGame();if(!silent)toast("Nu ești în acest joc.");return;}
    view="game";render();
  },e=>{toast("Conexiunea cu jocul s-a pierdut. Redeschide pagina.");});
}
function closeGame(){if(unsubG)unsubG();unsubG=null;if(unsubC)unsubC();unsubC=null;chatOpen=false;code=null;S=null;LS.set("zcode",null);view="lobby";render();}
const gref=()=>db.doc("games/"+code);

async function act(fn,silent){
  if(busy)return;busy=true;document.body.classList.add("busy");
  try{
    const lock=db.doc("locks/"+code);let got=false;
    for(let i=0;i<20&&!got;i++){
      const r=await lock.acquire({holder:ME+"-"+Math.random().toString(36).slice(2,7),ttlMs:1500});
      got=r.acquired;if(!got)await sleep(250+Math.random()*350);
    }
    if(!got){if(silent)return false;throw E("Altcineva face o mutare chiar acum. Mai încearcă o dată.");}
    const sn=await gref().get();if(!sn.exists)throw E("Jocul nu mai există.");
    const s=JSON.parse(JSON.stringify(sn.data()));
    if(fn(s)===false)return true;s.v=(s.v||0)+1;
    await gref().set(s);S=s;render();
    return true;
  }catch(e){
    if(silent)return false;
    if(e.user)toast(e.message);
    else if(e.code==="invalid_argument")toast("Nu ai drept de scriere aici. Cere-i gazdei acces de Editor la pagină.");
    else{toast("Ceva n-a mers. Mai încearcă o dată.");console.error(e);}
    return false;
  }finally{busy=false;document.body.classList.remove("busy");}
}
let toastT;
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3800);}

/* ---------- small renderers ---------- */
function fig(p,cls=""){
  const F=p.s==="F";
  return `<svg class="fig ${F?"f":"m"} ${cls}" viewBox="0 0 24 36" aria-hidden="true">${F?
   `<path d="M6 9 Q12 1 18 9 Z" class="k"/><circle cx="12" cy="9" r="4.2" class="h"/><path d="M8 14 h8 l4 17 h-16 z" class="b"/><path d="M5.5 25 h13" class="st"/><path d="M5 28.5 h14" class="st2"/>`:
   `<rect x="7" y="2.4" width="10" height="3" rx="1" class="k"/><circle cx="12" cy="9" r="4.2" class="h"/><rect x="7" y="14" width="10" height="13" rx="1.5" class="b"/><path d="M7 20 h10" class="st"/><path d="M9 27 v7 M15 27 v7" class="lg"/>`}</svg>`;
}
const roleTag=r=>`<span class="tag ${FATE[r].m<0?"neg":FATE[r].m>0?"pos":""}">${esc(FATE[r].t)}</span>`;
function chip(p,opts={}){
  const sel=opts.sel?" sel":"",dis=opts.dis?" dis":"";
  return `<button class="pchip${sel}${dis}" ${opts.a?`data-a="${opts.a}" data-v="${p.id}"`:"disabled"}>${fig(p,p.nb?"nb":"")}<span><b>${esc(p.n)}</b>${p.nb?`<i>nou-născut</i>`:""}${p.r.map(roleTag).join("")}</span></button>`;
}
function zIcon(){return `<svg class="ico" viewBox="0 0 20 16" aria-hidden="true"><path d="M2 5 h16 v9 h-16z" class="c1"/><path d="M1 3 h18 v3 h-18z" class="c2"/><path d="M10 7.5 l2 2 -2 2 -2 -2z" class="c3"/></svg>`;}
function lIcon(){return `<svg class="ico" viewBox="0 0 20 16" aria-hidden="true"><path d="M1 13 L7 5 L11 10 L14 7 L19 13z" class="l1"/><path d="M1 13 h18 v2 h-18z" class="l2"/></svg>`;}
const meP=()=>S&&pl(S,ME);
const others=()=>S.players.filter(p=>p.id!==ME);
const isHost=()=>S&&S.host===ME;

/* ---------- top-level render ---------- */
function render(){
  const app=$("#app");
  if(view==="loading"){app.innerHTML=`<div class="center"><div class="spin"></div><p>Se deschide domeniul…</p></div>`;return;}
  if(view==="nodb"){app.innerHTML=`<section class="card pad"><h2>Jocul are nevoie de conexiune</h2><p>Zestrea păstrează mutările tuturor jucătorilor într-o bază de date comună. Deschide pagina din aplicația Claude, autentificat în contul tău, ca să poți juca.</p></section>`;return;}
  if(view==="lobby"){renderLobby();renderChat();return;}
  if(view==="game"&&S){S.status==="lobby"?renderRoom():renderGame();if(SH)renderSheet();afterRender();}
  renderChat();
}

/* ---------- lobby ---------- */
function renderLobby(){
  const app=$("#app");
  if(!$("#lobbyshell")){
    app.innerHTML=`<div id="lobbyshell">
    <section class="hero">
      <p class="eyebrow">Joc de societate pentru 3–6 boieri</p>
      <h1 class="word">Zestrea</h1>
      <p class="lead">Mărită Mândre, însoară Feciori și ține-ți țăranii sătui până trec Vremurile Grele. Cine strânge cea mai multă Zestre câștigă.</p>
    </section>
    <section class="card pad stack">
      <label class="lbl" for="nm">Cum te cheamă, boierule?</label>
      <input id="nm" maxlength="24" placeholder="ex. Vornicul Alin" value="${esc(myName)}" autocomplete="off">
      <div class="row wrap"><span class="lbl">Vremuri Grele</span>
        <div class="seg" id="hardseg">${[5,6,7].map(n=>`<button data-a="hard" data-v="${n}" class="${n===hardSel?"on":""}">${n}</button>`).join("")}</div>
        <span class="muted small">5 e jocul normal, 6–7 îl lungesc</span></div>
      <p class="lbl">Cronometre</p>
      ${tmRow("turn","Pe tură",[[0,"Fără"],[20,"20 s"],[30,"30 s"],[45,"45 s"],[60,"1 min"]])}
      ${tmRow("wed","Rândul la nunți",[[0,"Fără"],[60,"1 min"],[120,"2 min"],[180,"3 min"]])}
      ${tmRow("auct","Licitație",[[0,"Fără"],[10,"10 s"],[20,"20 s"],[30,"30 s"]])}
      <p class="small muted">Când expiră timpul, jocul trece mai departe singur: se aruncă zarurile rămase, licitația se încheie, rândul trece la următorul boier.</p>
      <button class="btn primary" data-a="create">Deschide un joc nou</button>
    </section>
    <h3 class="sect">Jocuri deschise</h3>
    <div id="list"></div>
    <details class="card pad rules"><summary>Reguli pe scurt</summary>${rulesHTML()}</details>
    </div>`;
    $("#nm").addEventListener("input",e=>{myName=e.target.value.trim();LS.set("zname",myName);});
  }
  renderLobbyList();
}
function renderLobbyList(){
  const el=$("#list");if(!el)return;
  const mine=lobby.filter(g=>g.status!=="ended"&&(g.status==="lobby"||g.players.some(p=>p.id===ME)));
  if(!mine.length){el.innerHTML=`<p class="empty">Niciun joc deschis încă. Deschide unul și trimite-le prietenilor linkul acestei pagini.</p>`;return;}
  el.innerHTML=mine.map(g=>{
    const inG=g.players.some(p=>p.id===ME);
    return `<div class="card game-row"><div><b class="code">${esc(g.code)}</b> <span class="muted">· ${g.status==="lobby"?"se adună boierii":"Tura "+g.turn+" din "+g.total}</span><div class="small">${g.players.map(p=>esc(p.name)).join(", ")}</div></div>
      ${inG?`<button class="btn" data-a="open" data-v="${g.code}">Continuă</button>`:g.status==="lobby"&&g.players.length<6?`<button class="btn primary" data-a="join" data-v="${g.code}">Intră</button>`:`<span class="muted small">în desfășurare</span>`}</div>`;
  }).join("");
}
function tmRow(k,label,opts){return `<div class="tmrow"><span>${label}</span><div class="seg" data-tm="${k}">${opts.map(([v,t])=>`<button data-a="tm" data-v="${k}:${v}" class="${tmSel[k]===v?"on":""}">${t}</button>`).join("")}</div></div>`;}
const tmTxt=t=>t?fmtT(t):"fără limită";
function needName(){if(!myName){toast("Scrie-ți întâi numele.");$("#nm")&&$("#nm").focus();return false;}return true;}
async function createGame(){
  if(!needName()||busy)return;
  const L="ABCDEFGHJKLMNPRSTUVZ";let c="";for(let i=0;i<4;i++)c+=L[Math.floor(Math.random()*L.length)];
  busy=true;
  try{await db.doc("games/"+c).set(newGame(c,ME,myName,hardSel,{...tmSel}));openGame(c);}
  catch(e){toast(e.code==="invalid_argument"?"Nu ai drept de scriere aici. Cere-i gazdei acces de Editor la pagină.":"Jocul nu s-a putut crea. Mai încearcă.");}
  finally{busy=false;}
}
async function joinGame(c){
  if(!needName())return;
  code=c;
  const ok=await act(s=>{
    if(s.players.some(p=>p.id===ME))return;
    if(s.status!=="lobby")throw E("Jocul a început deja.");
    if(s.players.length>=6)throw E("Masa e plină (6 boieri).");
    s.players.push({id:ME,name:myName,z:0,land:3,hand:[],ready:false,fix:false,suf:false});
    log(s,`${myName} s-a așezat la masă.`);
  });
  if(ok)openGame(c);else code=null;
}

/* ---------- waiting room ---------- */
function renderRoom(){
  const n=S.players.length;
  $("#app").innerHTML=`${topBar()}
  <section class="card pad stack">
    <h2>Masa ${esc(S.code)}</h2>
    <p class="muted">Prietenii deschid aceeași pagină și apasă „Intră” la jocul ${esc(S.code)}. Se joacă cu ${S.hard} Vremuri Grele.</p>
    <p class="small">Cronometre: tură ${tmTxt((S.tm||{}).turn)} · rândul la nunți ${tmTxt((S.tm||{}).wed)} · licitație ${tmTxt((S.tm||{}).auct)}</p>
    <p class="small muted">Ordinea la masă se trage la începutul jocului și rămâne aceeași până la final, în sensul acelor de ceasornic.</p>
    <ul class="seats">${S.players.map((p,i)=>`<li><span class="seatn">${i+1}</span>${esc(p.name)}${p.id===S.host?` <span class="tag">gazdă</span>`:""}${p.id===ME?` <span class="tag pos">tu</span>`:""}</li>`).join("")}</ul>
    ${isHost()?`<button class="btn primary" data-a="start" ${n<2?"disabled":""}>Începe jocul (${n} ${n===1?"boier":"boieri"})</button>${n<3?`<p class="small muted">Regulile sunt gândite pentru 3–6 boieri. Cu 2 se poate testa.</p>`:""}`:`<p class="waiting">Așteptăm ca ${esc(pname(S,S.host))} să înceapă jocul…</p>`}
    <button class="btn ghost" data-a="leave">Ieși de la masă</button>
  </section>`;
}
function topBar(){
  return `<header class="top"><button class="home" data-a="home" aria-label="Înapoi la jocuri">‹</button><span class="word sm">Zestrea</span>${S?`<span class="code">${esc(S.code)}</span>`:""}${S&&S.status==="play"?`<span class="turn">Tura ${S.turn}<small>/${S.total}</small></span>`:""}<button class="mute ${muted?"off":""}" data-a="mute" aria-label="${muted?"Pornește sunetul":"Oprește sunetul"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" class="sp"/>${muted?`<path d="M16 9l5 6M21 9l-5 6" class="sw"/>`:`<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" class="sw"/>`}</svg></button></header>`;
}

/* ---------- game ---------- */
function renderGame(){
  const p=meP();if(!p)return;
  const ph=S.phase;
  $("#app").innerHTML=`${topBar()}
  ${S.status==="ended"?endHTML():`
  <nav class="phases">${PHASES.map(([k,t],i)=>`<span class="${k===ph?"on":""} ${PHASES.findIndex(x=>x[0]===ph)>i?"done":""}"><b>${"I II III IV V".split(" ")[i]}</b>${t}</span>`).join("")}</nav>
  ${S.dl?`<div id="tbar" class="tbar"><i></i><span>${fmtT((S.dl-Date.now())/1000)}</span><em>${S.phase==="neg"?"Nunțile se închid în":S.phase==="auct"?"Licitația se închide în":"Timp rămas"}</em></div>`:""}
  ${timesHTML()}
  <section class="card pad panel">${panelHTML()}</section>`}
  ${domainHTML(p)}
  ${handHTML(p)}
  <h3 class="sect">Ceilalți boieri</h3>
  ${others().map(otherHTML).join("")}
  <details class="card pad"><summary>Cronica satului</summary><ol class="log">${S.log.slice().reverse().slice(0,40).map(l=>`<li>${esc(l[1])}</li>`).join("")}</ol></details>
  <details class="card pad rules"><summary>Reguli pe scurt</summary>${rulesHTML()}</details>
  ${isHost()&&S.status==="play"?`<div class="host"><button class="btn ghost small" data-a="force">${forceArm?"Apasă din nou ca să treci mai departe":"Gazdă: treci peste cine nu răspunde"}</button></div>`:""}`;
}
function timesHTML(){
  const c=TIMES[S.tcur];if(!c)return"";
  const p=meP();const seer=peas(S,ME).some(x=>hasRole(x,"clarv"));
  const k=S.code+":"+S.turn,fresh=animTurn!==k;animTurn=k;
  if(fresh&&!c.g&&!reduceMotion())setTimeout(()=>{document.body.classList.add("quake");setTimeout(()=>document.body.classList.remove("quake"),700);},250);
  return `<section class="times ${c.g?"good":"hard"} ${fresh?"reveal":""}"><div class="band"></div>${fresh&&!c.g?`<div class="bolt"></div>`:""}<p class="eyebrow">${c.g?"Vremuri Bune":"Vremuri Grele"} · ${S.last?"ultima tură":`${S.tdeck.length} ${S.tdeck.length===1?"carte rămasă":"cărți rămase"}`}</p><h2>${esc(c.t)}</h2><p>${esc(c.d)}</p>
  ${seer&&S.tdeck.length?`<p class="seer">Clarvăzătoarea ta vede ce urmează: <b>${esc(TIMES[S.tdeck[0]].t)}</b></p>`:""}
  ${S.mayor?`<p class="small muted">Primarul satului: ${esc(pname(S,S.mayor))}</p>`:""}</section>`;
}
function readyRow(){return `<div class="readyrow">${S.players.map(q=>`<span class="rd ${q.ready?"ok":""}">${esc(q.name)}${q.id===ME?" (tu)":""}</span>`).join("")}</div>`;}
function panelHTML(){
  const p=meP(),ph=S.phase,k=S.tcur;
  if(ph==="times"){
    let h=`<h3>I. Vremuri</h3>`;
    if(p.ready)h+=`<p class="waiting">Gata. Așteptăm ceilalți boieri.</p>`;
    else if(k==="colinda")h+=`<p>La cine mergi la colindat? Primești ${Math.max(1,singles(S,ME).length)} Zestre (cât are gazda).</p><div class="grid2">${others().map(o=>`<button class="btn" data-a="t" data-v="colinda:${o.id}">${esc(o.name)} <small>${o.z} Z</small></button>`).join("")}</div><button class="btn ghost" data-a="t" data-v="colinda:">Nu merg</button>`;
    else if(k==="zilele")h+=`<p>Plătești pentru Linghișpir? Ceilalți vor plăti aceeași sumă.</p><div class="grid3">${[1,2,3,5].filter(n=>n<=p.z).map(n=>`<button class="btn" data-a="t" data-v="zilele:${n}">Plătesc ${n}</button>`).join("")}</div><button class="btn primary" data-a="t" data-v="ready:">Mai departe</button>`;
    else if(k==="foncirea")h+=`<p>Datorezi ${p.land} Zestre (ai ${p.z}). ${p.z<p.land?`Dacă nu ai tot, pierzi ${Math.min(Math.floor(p.land/2),p.land-1)} Pământ. Poți cere împrumut.`:""}</p><div class="row wrap"><button class="btn primary" data-a="t" data-v="foncirea:">Plătesc foncirea</button><button class="btn" data-a="g-open">Dă sau împrumută Zestre</button></div>`;
    else if(k==="potop"){const o=potopOptions(S,ME);const lab={M:"Un Fecior singur",F:"O Mândră singură",C:"Un Cuplu",L:"Un Pământ"};
      h+=o.length?`<p>Ce pierzi la potop?</p><div class="grid2">${o.map(v=>`<button class="btn" data-a="t" data-v="potop:${v}">${lab[v]}</button>`).join("")}</div>`:`<p>Nu ai ce pierde.</p><button class="btn primary" data-a="t" data-v="potop:">Mai departe</button>`;}
    else if(k==="primar")h+=`<p>Pe cine votezi? Ai ${peas(S,ME).length} voturi, câte unul pentru fiecare țăran.</p><div class="grid2">${S.players.map(o=>`<button class="btn" data-a="t" data-v="vote:${o.id}">${esc(o.name)}${o.id===ME?" (tu)":""}</button>`).join("")}</div>`;
    else if(k==="pasalac"){const cs=coupleList(S,ME);const hasF=cs.some(([a,b])=>a.s==="F"||b.s==="F"),hasM=cs.some(([a,b])=>a.s==="M"||b.s==="M");
      h+=`<p>Pe cine dai Sultanului?</p><div class="grid2">${hasF?`<button class="btn" data-a="t" data-v="pasalac:F">O Nevastă la harem</button>`:""}${hasM?`<button class="btn" data-a="t" data-v="pasalac:M">Un Bărbat la armată</button>`:""}</div>`;}
    else h+=`<p class="muted">Efectul cărții s-a aplicat. Vezi Cronica satului pentru detalii.</p><button class="btn primary" data-a="t" data-v="ready:">Mai departe</button>`;
    if(p.hand.includes("calcat")&&!p.fix)h+=`<button class="btn ghost small" data-a="f-open" data-v="calcat">Joacă Ai călcat în dânsul</button>`;
    return h+readyRow();
  }
  if(ph==="prod"){
    const u=productive(S,ME),all=units(S,ME);
    let h=`<h3>II. Producție</h3><p class="small muted">1: +1 Zestre și un copil · 2–3: +2 și un copil · 4–5: +2 · 6: +3${!canChild(S,ME)?" · Ai 7 țărani singuri, nu se mai nasc copii.":""}${S.fl.twins?" · Tura asta se nasc gemeni.":""}</p>`;
    if(!u.length)h+=`<p>Niciun Cuplu nu are Pământ, nu produci nimic tura asta.</p>`;
    h+=u.map(x=>{const r=S.ts.rolled[x.k];const nm=x.c?`${esc(x.a.n)} și ${esc(x.b.n)}`:esc(x.a.n);
      return `<div class="unit">${fig(x.a)}${x.c?fig(x.b):""}<span class="un">${nm}</span>${r?(()=>{const rk=S.code+":"+S.turn+":"+x.k,nw=!seenRoll.has(rk);seenRoll.add(rk);return `<span class="die ${nw?"spin":""}">${r}</span>`;})():p.ready?"":p.fix?`<span class="pick">${[1,2,3,4,5,6].map(v=>`<button data-a="roll" data-v="${x.k}:${v}">${v}</button>`).join("")}</span>`:`<button class="btn small primary" data-a="roll" data-v="${x.k}:">Dă cu zarul</button>`}</div>`;}).join("");
    if(all.length>u.length)h+=`<p class="small muted">${all.length-u.length} ${all.length-u.length===1?"Cuplu nu are":"Cupluri nu au"} Pământ și nu produc.</p>`;
    if(p.fix)h+=`<p class="small seer">Ai călcat în dânsul: alegi tu numărul la următoarea aruncare.</p>`;
    else if(p.hand.includes("calcat"))h+=`<button class="btn ghost small" data-a="f-open" data-v="calcat">Joacă Ai călcat în dânsul</button>`;
    if(!p.ready)h+=`<button class="btn" data-a="prod-done">Am terminat producția</button>`;else h+=`<p class="waiting">Gata. Așteptăm ceilalți boieri.</p>`;
    return h+readyRow();
  }
  if(ph==="auct"){
    const a=S.auction,c=FATE[a.card];const lead=a.by===ME,passed=a.passed[ME];
    const ak=S.code+":"+S.turn+":"+a.card,af=animAuct!==ak;animAuct=ak;
    return `<h3>III. Licitație</h3><div class="fate big ${af?"flipin":""}"><div class="band"></div><b>${esc(c.t)}</b>${c.role?`<i>Rol</i>`:""}<p>${esc(c.d)}</p></div>
      <p class="bidline">${a.by?`Oferta: <b>${a.bid} Zestre</b> de la ${esc(pname(S,a.by))}`:"Nicio ofertă încă. Pornește de la 1 Zestre."}</p>
      ${lead?`<p class="waiting">Tu conduci licitația.</p>`:`<div class="grid3">${[1,2,3].map(d=>a.bid+d).filter(v=>v<=p.z).map(v=>`<button class="btn primary" data-a="bid" data-v="${v}">Dau ${v}</button>`).join("")||`<p class="small muted">Nu ai destulă Zestre.</p>`}</div>
      ${passed?`<p class="small muted">Ai spus pas. Poți reintra cu o ofertă.</p>`:`<button class="btn ghost" data-a="pass">Pas</button>`}`}
      <div class="readyrow">${S.players.map(q=>`<span class="rd ${a.passed[q.id]?"":"ok"}">${esc(q.name)}${a.passed[q.id]?": pas":q.id===a.by?": conduce":""}</span>`).join("")}</div>`;
  }
  if(ph==="neg"){
    let h=`<h3>IV. Nunți și negocieri</h3><p class="small muted">Toți boierii pot propune nunți acum, în orice ordine. Fiecare poate avea câte o propunere deschisă.</p>`;
    Object.entries(S.props).filter(([f,pr])=>pr.to===ME).forEach(([f,pr])=>{const a=S.P[pr.mine],b=S.P[pr.theirs];if(!a||!b)return;
      h+=`<div class="prop in"><p><b>${esc(pname(S,f))}</b> îți propune nunta <b>${esc(a.n)}</b> + <b>${esc(b.n)}</b> (al tău).</p><p class="small">${propTerms(pr,a,b,f)}</p><div class="row"><button class="btn primary" data-a="p-acc" data-v="${f}">Acceptă și dă cu zarul</button><button class="btn ghost" data-a="p-dec" data-v="${f}">Refuz</button></div></div>`;});
    const mine=S.props[ME];
    if(mine){const a=S.P[mine.mine],b=S.P[mine.theirs];if(a&&b)h+=`<div class="prop out"><p>Ai propus nunta <b>${esc(a.n)}</b> + <b>${esc(b.n)}</b>. Așteptăm răspunsul lui ${esc(pname(S,mine.to))}.</p><p class="small">${propTerms(mine,a,b,ME)}</p><button class="btn ghost small" data-a="p-can">Retrage propunerea</button></div>`;}
    const w=S.lastW;
    if(w){const can=[];if(p.hand.includes("fura")&&S.P[w.bride]&&S.P[w.bride].s==="F")can.push("fura");if(p.hand.includes("piatra")&&(w.recv===ME||w.giver===ME))can.push("piatra");
      if(can.length)h+=`<div class="prop out"><p>Tocmai a fost o nuntă. Poți juca acum:</p><div class="row wrap">${can.map(k=>`<button class="btn" data-a="f-open" data-v="${k}">${esc(FATE[k].t)}</button>`).join("")}</div></div>`;}
    h+=`<div class="grid2 acts">
      <button class="btn primary" data-a="w-open" ${S.props[ME]?"disabled":""}>${S.props[ME]?"Aștepți răspunsul":"Propune o nuntă"}</button>
      <button class="btn" data-a="buy" data-v="land" ${p.z<4||p.land>=5?"disabled":""}>Cumpără Pământ <small>4 Z</small></button>
      <button class="btn" data-a="buy" data-v="fate" ${p.z<2||S.last||!S.fdeck.length?"disabled":""}>Cumpără Soartă <small>2 Z</small></button>
      <button class="btn" data-a="buy" data-v="adopt" ${p.z<2||singles(S,ME).length>=7?"disabled":""}>Adoptă un copil <small>2 Z</small></button>
      <button class="btn" data-a="g-open">Dă Zestre sau Soartă</button>
      </div>`;
    const fd=feedPreview(p);
    h+=`<p class="small muted feedp">La Hrană: ${fd.units} ${fd.units===1?"gură":"guri"} de hrănit, ${p.land} pe Pământ.${fd.need?` Vei plăti ${Math.min(fd.need,p.z)} Zestre${fd.need>p.z?` și vei pierde ${Math.min(fd.need-p.z,p.land-1)} Pământ`:""}${fd.need>p.z+p.land-1?`; ${fd.need-p.z-(p.land-1)} țărani mor de foame`:""}.`:" Nu plătești nimic."}</p>`;
    h+=p.ready?`<button class="btn ghost" data-a="ready" data-v="0">Nu mai sunt gata</button><p class="waiting">Ești gata. Hrana vine când sunt gata toți.</p>`:`<button class="btn ochre" data-a="ready" data-v="1">Sunt gata de Hrană</button>`;
    return h+readyRow();
  }
  return "";
}
function propTerms(pr,a,b,from){
  if(pr.suf)return "Suflete pereche: nunta iese sigur, fără Zestre.";
  const pk=pairKey(a.id,b.id);const free=S.fl.horaOn&&!S.fl.hora[pk];
  const pay=free?"Gratis (Hora mare)":pr.pay==="split"?"Fiecare plătește 1 Zestre":pr.pay==="me"?`Plătește ${esc(pname(S,from))} 2 Zestre`:`Plătește ${esc(pname(S,pr.to))} 2 Zestre`;
  const c=chance(S,a,b,pr.laut);const l=(pr.laut||[]).filter(id=>S.P[id]).map(id=>S.P[id].n);
  return `${pay}. Reușește la ${c?`1–${c}`:"nimic"} pe zar${l.length?` · Lăutari: ${l.map(esc).join(", ")}`:""}${a.s===b.s?` · Cuplul rămâne la ${esc(pname(S,pr.keep==="me"?from:pr.to))}`:""}.`;
}
function feedPreview(p){
  const units=coupleList(S,p.id).length+singles(S,p.id).filter(x=>!x.nb&&!S.fl.bataie[p.id]).length;
  return {units,need:Math.max(0,units-p.land)};
}
function domainHTML(p){
  const cs=coupleList(S,p.id),sg=singles(S,p.id);const prodKeys=new Set(units(S,p.id).slice(0,p.land).map(u=>u.k));
  return `<section class="card pad dom"><div class="domhead"><h3>Domeniul tău</h3>${p.fix?`<span class="tag pos">Ai călcat în dânsul</span>`:""}${p.suf?`<span class="tag pos">Suflete pereche</span>`:""}</div>
  <div class="stats"><span>${zIcon()}<b>${p.z}</b> Zestre</span><span>${lIcon()}<b>${p.land}</b>/5 Pământ</span><span><b>${cs.length}</b> Cupluri</span><span><b>${sg.length}</b> singuri</span></div>
  <div class="peas">${cs.map(([a,b])=>`<div class="couple ${prodKeys.has(a.id)?"land":""}">${chipStatic(a)}${chipStatic(b)}${prodKeys.has(a.id)?`<span class="onland">pe Pământ</span>`:""}</div>`).join("")}
  ${sg.map(x=>`<div class="single ${prodKeys.has(x.id)?"land":""}">${chipStatic(x)}</div>`).join("")}</div></section>`;
}
function chipStatic(p){let pop="";if(seenP){if(!seenP.has(p.id))pop=" born";}seenP=seenP||new Set();seenP.add(p.id);return `<div class="pc${pop}">${fig(p,p.nb?"nb":"")}<span><b>${esc(p.n)}</b>${p.nb?`<i>nou-născut</i>`:""}${p.r.map(roleTag).join("")}</span></div>`;}
function handHTML(p){
  const prev=handSeen&&handSeen.code===S.code?handSeen.c:null,now={};
  const cards=p.hand.map(k=>{const c=FATE[k];now[k]=(now[k]||0)+1;const nw=prev&&now[k]>(prev[k]||0);
    return `<button class="fate${nw?" dealt":""}" data-a="f-open" data-v="${k}"><div class="band"></div><b>${esc(c.t)}</b>${c.role?`<i>Rol</i>`:""}<p>${esc(c.d)}</p></button>`;}).join("");
  handSeen={code:S.code,c:now};
  return `<section class="card pad"><h3>Cărțile tale de Soartă <span class="muted small">(${p.hand.length})</span></h3>
  ${p.hand.length?`<div class="hand">${cards}</div>`:`<p class="muted small">Nu ai cărți. Le câștigi la licitație, le cumperi cu 2 Zestre sau le primești când dai o Mândră la nuntă.</p>`}</section>`;
}
function otherHTML(o){
  const cs=coupleList(S,o.id),sg=singles(S,o.id);
  return `<details class="card other" data-o="${esc(o.id)}" ${openOthers.has(o.id)?"open":""}><summary><span class="oname">${esc(o.name)}${S.mayor===o.id?` <span class="tag">primar</span>`:""}</span><span class="ostats">${zIcon()}${o.z} ${lIcon()}${o.land} · ${cs.length} cupl. · ${sg.length} sing. · ${o.hand.length} cărți</span></summary>
  <div class="peas">${cs.map(([a,b])=>`<div class="couple">${chipStatic(a)}${chipStatic(b)}</div>`).join("")}${sg.map(x=>`<div class="single">${chipStatic(x)}</div>`).join("")}</div></details>`;
}
function endHTML(){
  const r=S.results||score(S);
  return `<section class="card pad end"><p class="eyebrow">Vremurile Grele au trecut</p><h2>Câștigă ${esc(r[0].name)}</h2>
  <table class="res"><thead><tr><th></th><th>Boier</th><th>Zestre</th><th>Pământ</th><th>Bonus</th><th>Total</th></tr></thead><tbody>
  ${r.map((x,i)=>`<tr class="${x.id===ME?"me":""}"><td>${i+1}</td><td>${esc(x.name)}</td><td>${x.z}</td><td>${x.land}</td><td>${x.bonus?"+5":"–"}</td><td><b>${x.total}</b></td></tr>`).join("")}</tbody></table>
  <p class="small muted">Bonusul de +5 îl ia boierul cu cele mai multe Cupluri, doar dacă nu e egalitate. La egalitate de Zestre câștigă cine are mai mulți țărani.</p>
  <button class="btn" data-a="home">Înapoi la jocuri</button></section>`;
}
function rulesHTML(){return `<ol class="rl">
<li><b>Vremuri.</b> Se întoarce o carte de Vremuri și se urmează ce scrie. Primele 3 ture sunt Vremuri Bune.</li>
<li><b>Producție.</b> Fiecare Cuplu cu Pământ dă cu zarul: 1 → +1 Zestre și un copil, 2–3 → +2 și un copil, 4–5 → +2, 6 → +3. Cu 7 țărani singuri nu se mai fac copii.</li>
<li><b>Licitație.</b> Se licitează o carte de Soartă. Cine dă mai mult o ia.</li>
<li><b>Nunți și negocieri.</b> Mărită țăranii tăi cu ai altor boieri: o încercare costă 2 Zestre și reușește la 1–2 pe zar. Mândra merge la Fecior, iar boierul care a dat Mândra trage o carte de Soartă. Pământ 4 Z · Soartă 2 Z · Adopție 2 Z.</li>
<li><b>Hrană.</b> Fiecare Cuplu sau țăran singur mănâncă 1. Un Pământ hrănește pe cineva, restul plătesc cu Zestre. Fără Zestre pierzi Pământ, apoi țăranii mor de foame. Ultimul Cuplu și ultimul Pământ nu se pierd niciodată.</li>
<li><b>Final.</b> Zestre + 1 pentru fiecare Pământ + 5 pentru cele mai multe Cupluri.</li></ol>`;}

/* ---------- sheets ---------- */
function openSheet(st){SH=st;renderSheet();}
function closeSheet(){SH=null;$("#sheet").hidden=true;$("#scrim").hidden=true;}
function renderSheet(){
  if(!SH)return;const el=$("#sheet");let h="";
  if(SH.t==="w")h=wedSheet();else if(SH.t==="f")h=fateSheet();else if(SH.t==="g")h=giveSheet();
  el.innerHTML=`<div class="grab"></div><button class="x" data-a="sh-x" aria-label="Închide">×</button>${h}`;el.hidden=false;$("#scrim").hidden=false;
}
function peasantGroups(filter,a,selSet){
  return S.players.map(o=>{const list=peas(S,o.id).filter(filter);if(!list.length)return"";
    return `<p class="grp">${esc(o.name)}${o.id===ME?" (tu)":""}</p><div class="chips">${list.map(p=>chip(p,{a,sel:selSet.has(p.id)})).join("")}</div>`;}).join("")||`<p class="muted small">Nu e niciun țăran potrivit.</p>`;
}
function wedSheet(){
  const w=SH;const a=S.P[w.mine],b=S.P[w.theirs];
  let h=`<h3>Propune o nuntă</h3><p class="lbl">1. Țăranul tău</p><div class="chips">${singles(S,ME).filter(canMarry).map(p=>chip(p,{a:"w-mine",sel:w.mine===p.id})).join("")||`<span class="muted small">Nu ai țărani singuri care se pot căsători.</span>`}</div>`;
  if(a){h+=`<p class="lbl">2. Cu cine</p>`+peasantGroups(p=>p.o!==ME&&canMarry(p)&&(S.fl.ams||p.s!==a.s),"w-theirs",new Set([w.theirs]));}
  if(a&&b){
    const lauts=Object.values(S.P).filter(p=>hasRole(p,"lautar")&&p.id!==a.id&&p.id!==b.id);
    const c=chance(S,a,b,[...w.laut]);
    h+=`<p class="lbl">3. Cine plătește cele 2 Zestre</p><div class="seg wide">${[["split","Câte 1"],["me","Eu 2"],["them",esc(pname(S,b.o))+" 2"]].map(([k,t])=>`<button class="${w.pay===k?"on":""}" data-a="w-pay" data-v="${k}">${t}</button>`).join("")}</div>`;
    if(lauts.length)h+=`<p class="lbl">Lăutari la nuntă <span class="muted small">(+1 fiecare; plata se negociază)</span></p><div class="chips">${lauts.map(p=>chip(p,{a:"w-laut",sel:w.laut.has(p.id)})).join("")}</div>`;
    if(a.s===b.s)h+=`<p class="lbl">Cuplul rămâne la</p><div class="seg wide"><button class="${w.keep==="me"?"on":""}" data-a="w-keep" data-v="me">Mine</button><button class="${w.keep==="them"?"on":""}" data-a="w-keep" data-v="them">${esc(pname(S,b.o))}</button></div>`;
    if(meP().suf)h+=`<label class="check"><input type="checkbox" id="wsuf" ${w.suf?"checked":""} data-a="w-suf"> Folosește Suflete pereche (sigur, gratis)</label>`;
    h+=`<div class="odds"><span class="die">${w.suf?"✓":c}</span><span>${w.suf?"Nunta iese sigur.":c?`Reușește dacă pică 1${c>1?"–"+c:""} pe zar.`:"Șanse zero. Adaugă lăutari."}</span></div>
    <button class="btn primary" data-a="w-send">Trimite propunerea lui ${esc(pname(S,b.o))}</button><p class="small muted">Zarul se dă când ${esc(pname(S,b.o))} acceptă.</p>`;
  }
  return h;
}
const NEED={
  sfadit:[["p","peasant","Ce Cuplu se desparte?",p=>p.sp&&!lastCouple(S,p.o)]],
  fura:[["p","peasant","Cu care Fecior de-al tău se mărită mireasa?",p=>p.o===ME&&p.s==="M"&&canMarry(p)]],
  coasa:[["b","boier","De la cine iei 3 Zestre?",o=>o.id!==ME]],
  luceafar:[["b","boier","Cine primește copilul din flori?",o=>true]],
  matrapaz:[["b","boier","De la cine iei un Pământ?",o=>o.id!==ME&&o.land>1]],
  schimb:[["p","peasant","Prima Mândră sau Nevastă",p=>p.s==="F"],["q","peasant","A doua Mândră sau Nevastă",p=>p.s==="F"]],
  afara:[["p","peasant","Pe cine dai afară?",p=>p.o===ME&&!p.sp],["b","boier","La ce boier pleacă?",o=>o.id!==ME]],
  dulau:[["p","peasant","Ce Bărbat însurat elimini?",p=>p.s==="M"&&p.sp&&!lastCouple(S,p.o)]],
  birt:[["p","peasant","Ce Bărbat însurat elimini?",p=>p.s==="M"&&p.sp&&!lastCouple(S,p.o)]],
  sexch:[["p","peasant","Cine își schimbă sexul?",p=>true]],
  vinvremuri:[["c","choice","Ce faci?",[["scurt","Scurtez jocul cu o tură"],["lung","Lungesc jocul cu o tură"]]]],
  descantec:[["o","order","Atinge cărțile în ordinea în care vrei să vină",null]]
};
function needsFor(k){return FATE[k].role?[["p","peasant","Pe ce țăran pui rolul?",p=>roleTargets(S,k).includes(p)]]:(NEED[k]||[]);}
function fateSheet(){
  const k=SH.k,c=FATE[k],x=SH.x;
  let h=`<div class="fate big"><div class="band"></div><b>${esc(c.t)}</b>${c.role?`<i>Rol</i>`:""}<p>${esc(c.d)}</p></div>`;
  const okPhase=c.any||S.phase==="neg";
  if(!okPhase){return h+`<p class="muted">Cartea se poate juca în etapa de Nunți și negocieri.</p>`;}
  let ready=true;
  for(const [f,kind,label,flt] of needsFor(k)){
    h+=`<p class="lbl">${esc(label)}</p>`;
    if(kind==="peasant")h+=peasantGroups(flt,"f-pick:"+f,new Set([x[f]]));
    else if(kind==="boier")h+=`<div class="grid2">${S.players.filter(flt).map(o=>`<button class="btn ${x[f]===o.id?"sel":""}" data-a="f-pick:${f}" data-v="${o.id}">${esc(o.name)}</button>`).join("")}</div>`;
    else if(kind==="choice")h+=`<div class="grid2">${flt.map(([v,t])=>`<button class="btn ${x[f]===v?"sel":""}" data-a="f-pick:${f}" data-v="${v}">${t}</button>`).join("")}</div>`;
    else if(kind==="order"){const n=Math.min(3,S.tdeck.length);const ord=x.o||[];
      h+=`<div class="grid1">${S.tdeck.slice(0,n).map((t,i)=>{const pos=ord.indexOf(i);return `<button class="btn ${pos>=0?"sel":""}" data-a="f-ord" data-v="${i}">${pos>=0?`<span class="die sm">${pos+1}</span>`:""}${esc(TIMES[t].t)}</button>`;}).join("")}</div>`;
      if(ord.length<n)ready=false;}
    if(kind!=="order"&&x[f]==null)ready=false;
  }
  return h+`<button class="btn primary" data-a="f-send" ${ready?"":"disabled"}>Joacă ${esc(c.t)}</button>`;
}
function giveSheet(){
  const g=SH,p=meP();
  let h=`<h3>Dă Zestre sau Soartă</h3><p class="small muted">Pentru daruri, împrumuturi sau plata unui Lăutar. Pământul și țăranii nu se pot da.</p><p class="lbl">Cui?</p><div class="grid2">${others().map(o=>`<button class="btn ${g.to===o.id?"sel":""}" data-a="g-to" data-v="${o.id}">${esc(o.name)}</button>`).join("")}</div>`;
  if(g.to){h+=`<p class="lbl">Zestre <span class="muted small">(ai ${p.z})</span></p><div class="grid3">${[1,2,3,4,5,10].filter(n=>n<=p.z).map(n=>`<button class="btn" data-a="g-z" data-v="${n}">Dă ${n}</button>`).join("")||`<span class="muted small">Nu ai Zestre.</span>`}</div>`;
    if(p.hand.length)h+=`<p class="lbl">Sau o carte de Soartă</p><div class="grid2">${[...new Set(p.hand)].map(k=>`<button class="btn" data-a="g-c" data-v="${k}">${esc(FATE[k].t)}</button>`).join("")}</div>`;}
  return h;
}

/* ---------- events ---------- */
const H={
  hard:v=>{hardSel=+v;document.querySelectorAll("#hardseg button").forEach(b=>b.classList.toggle("on",+b.dataset.v===hardSel));},
  create:()=>createGame(),
  join:v=>joinGame(v),
  open:v=>openGame(v),
  home:()=>{closeSheet();if(unsubG)unsubG();unsubG=null;if(unsubC)unsubC();unsubC=null;chatOpen=false;code=null;S=null;view="lobby";render();},
  leave:async()=>{const ok=await act(s=>{s.players=s.players.filter(p=>p.id!==ME);if(s.host===ME&&s.players.length)s.host=s.players[0].id;});if(ok)closeGame();},
  start:()=>act(s=>startGame(s)),
  t:v=>{const [a,x]=v.split(":");act(s=>tAct(s,ME,a,x||undefined));},
  roll:v=>{const [k,val]=v.split(":");act(s=>prodRoll(s,ME,k,val||undefined));},
  "prod-done":()=>act(s=>prodDone(s,ME)),
  bid:v=>act(s=>bid(s,ME,v)),
  pass:()=>act(s=>passBid(s,ME)),
  buy:v=>act(s=>buy(s,ME,v)),
  ready:v=>act(s=>readyNeg(s,ME,v==="1")),
  tm:v=>{const [k,x]=v.split(":");tmSel[k]=+x;document.querySelectorAll(`[data-tm="${k}"] button`).forEach(b=>b.classList.toggle("on",b.dataset.v===v));},
  mute:()=>{muted=!muted;LS.set("zmute",muted?"1":"0");if(!muted){unlock();sfx("coin");}render();},
  "pop-x":()=>nextPop(),
  "pop-card":v=>{nextPop();openSheet({t:"f",k:v,x:{}});},
  chat:()=>{chatOpen=!chatOpen;renderChat();if(chatOpen)setTimeout(()=>$("#chatin")&&$("#chatin").focus(),50);},
  "p-acc":v=>act(s=>acceptProp(s,ME,v)),
  "p-dec":v=>act(s=>declineProp(s,ME,v)),
  "p-can":()=>act(s=>cancelProp(s,ME)),
  "w-open":()=>openSheet({t:"w",mine:null,theirs:null,pay:"split",laut:new Set(),keep:"me",suf:false}),
  "w-mine":v=>{SH.mine=+v;SH.theirs=null;renderSheet();},
  "w-theirs":v=>{SH.theirs=+v;renderSheet();},
  "w-pay":v=>{SH.pay=v;renderSheet();},
  "w-keep":v=>{SH.keep=v;renderSheet();},
  "w-laut":v=>{v=+v;SH.laut.has(v)?SH.laut.delete(v):SH.laut.add(v);renderSheet();},
  "w-send":async()=>{const w=SH;const ok=await act(s=>propose(s,ME,{mine:w.mine,theirs:w.theirs,pay:w.pay,laut:[...w.laut],keep:w.keep,suf:w.suf}));if(ok)closeSheet();},
  "f-open":v=>openSheet({t:"f",k:v,x:{}}),
  "f-ord":v=>{const o=SH.x.o||(SH.x.o=[]);v=+v;const i=o.indexOf(v);i>=0?o.splice(i,1):o.push(v);renderSheet();},
  "f-send":async()=>{const f=SH;const ok=await act(s=>playFate(s,ME,f.k,f.x));if(ok)closeSheet();},
  "g-open":()=>openSheet({t:"g",to:null}),
  "g-to":v=>{SH.to=v;renderSheet();},
  "g-z":async v=>{const ok=await act(s=>give(s,ME,SH.to,"z",v));if(ok)closeSheet();},
  "g-c":async v=>{const ok=await act(s=>give(s,ME,SH.to,"f",v));if(ok)closeSheet();},
  "sh-x":()=>closeSheet(),
  force:()=>{if(!forceArm){forceArm=1;render();setTimeout(()=>{forceArm=0;render();},4000);return;}forceArm=0;act(s=>force(s));}
};
document.addEventListener("click",e=>{
  if(e.target.id==="scrim"){closeSheet();return;}
  const b=e.target.closest("[data-a]");if(!b||b.disabled)return;
  const a=b.dataset.a;
  if(a==="w-suf"){SH.suf=b.checked;renderSheet();return;}
  if(a.startsWith("f-pick:")){const f=a.slice(7);let v=b.dataset.v;SH.x[f]=(f==="p"||f==="q")?+v:v;renderSheet();return;}
  if(H[a]){e.preventDefault();if(a!=="mute")sfx("tap");H[a](b.dataset.v,b);}
});
$("#chatform").addEventListener("submit",e=>{e.preventDefault();sendChat();});
document.addEventListener("toggle",e=>{const d=e.target;if(d&&d.dataset&&d.dataset.o){d.open?openOthers.add(d.dataset.o):openOthers.delete(d.dataset.o);}},true);
boot();
