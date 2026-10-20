/* ===== Zestrea 3D table: a live view of the shared game state (Three.js, loaded on demand) ===== */
const V3D=(()=>{
  const SRC="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
  let loading=null,ok=false,T=null,R,S,cam,wrap,clock=0,last=0,raf=0,active=false;
  let lights={},table,chest,water,rainG,fireG,confG,dice=[],cards=[],fig={},doms={},labels={},tokens={},fxq=[];
  let seenTurn=null,seenRolls=new Set(),meId=null,state=null,orbit=0,drag=null,userOrbit=0;
  const C={madder:0xe3584a,ver:0x56b6a6,ochre:0xe7ad44,ink:0xf4e7d6,indigo:0x2c4d6b,plum:0x2a1627,skin:0xf0d3b8,hat:0x1d1018};
  const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),E=t=>1-Math.pow(1-cl(t),3),EIO=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  const back2=t=>{t=cl(t);const c1=1.7,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};

  function load(){
    if(loading)return loading;
    loading=new Promise(res=>{
      if(window.THREE){T=window.THREE;ok=true;return res(true);}
      const s=document.createElement("script");s.src=SRC;s.async=true;
      s.onload=()=>{T=window.THREE;ok=!!T;res(ok);};s.onerror=()=>res(false);document.head.appendChild(s);
    });
    return loading;
  }
  /* ---------- textures & shared materials ---------- */
  const texCache={};
  function tex(key,w,h,draw){if(texCache[key])return texCache[key];const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return texCache[key]=t;}
  function band(g,y,w,h){g.fillStyle="#56b6a6";g.fillRect(0,y,w,h);const cs=["#e3584a","#f4e7d6","#e7ad44"];for(let x=0,i=0;x<w;x+=h,i++){g.fillStyle=cs[i%3];g.beginPath();g.moveTo(x,y+h/2);g.lineTo(x+h/2,y);g.lineTo(x+h,y+h/2);g.lineTo(x+h/2,y+h);g.fill();}}
  function rosette(g,cx,cy,r){g.fillStyle="#e3584a";g.fillRect(cx-r,cy-r,2*r,2*r);g.fillStyle="#f4e7d6";for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+r*.85*Math.cos(a)-r*.22*Math.sin(a),cy+r*.85*Math.sin(a)+r*.22*Math.cos(a));g.lineTo(cx+r*.95*Math.cos(a),cy+r*.95*Math.sin(a));g.fill();}}
  const M={};
  function mat(c,o){const k=c+":"+JSON.stringify(o||{});return M[k]||(M[k]=new T.MeshStandardMaterial({color:c,roughness:.75,flatShading:true,...(o||{})}));}
  const G={};
  function geo(k,f){return G[k]||(G[k]=f());}

  /* ---------- static scene ---------- */
  function build(){
    R=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"});
    R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
    R.outputColorSpace=T.SRGBColorSpace;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
    S=new T.Scene();S.background=new T.Color(0x1a0e18);S.fog=new T.Fog(0x1a0e18,15,32);
    cam=new T.PerspectiveCamera(50,1,.1,100);
    lights.hemi=new T.HemisphereLight(0xffe6c8,0x2a1627,.6);S.add(lights.hemi);
    lights.key=new T.DirectionalLight(0xffd9a8,1.5);lights.key.position.set(5,10,6);lights.key.castShadow=true;lights.key.shadow.mapSize.set(1024,1024);
    Object.assign(lights.key.shadow.camera,{left:-8,right:8,top:8,bottom:-8});S.add(lights.key);
    lights.lamp=new T.PointLight(0xffb36b,16,15,2);lights.lamp.position.set(0,5,0);S.add(lights.lamp);
    lights.flash=new T.PointLight(0xdfe8ff,0,40,1.2);lights.flash.position.set(-3,8,-6);S.add(lights.flash);
    const cloth=tex("cloth",512,512,(g,w,h)=>{g.fillStyle="#3a1f35";g.fillRect(0,0,w,h);for(let i=0;i<w;i+=6){g.fillStyle=i%12?"rgba(255,255,255,.025)":"rgba(0,0,0,.05)";g.fillRect(i,0,3,h);g.fillRect(0,i,w,3);}
      band(g,18,w,20);band(g,h-38,w,20);g.save();g.translate(0,h);g.rotate(-Math.PI/2);band(g,18,h,20);band(g,w-38,h,20);g.restore();});
    table=new T.Mesh(new T.CylinderGeometry(7.4,7.6,.5,48),[mat(0x4a2a1a),new T.MeshStandardMaterial({map:cloth,roughness:.95}),mat(0x4a2a1a)]);
    table.position.y=-.25;table.receiveShadow=true;S.add(table);
    // dowry chest
    chest=new T.Group();
    const panel=tex("panel",256,128,(g,w,h)=>{g.fillStyle="#2a1627";g.fillRect(0,0,w,h);rosette(g,w*.27,h*.5,h*.36);rosette(g,w*.73,h*.5,h*.36);});
    const body=new T.Mesh(new T.BoxGeometry(2.4,1.2,1.4),[mat(C.ver),mat(C.ver),mat(C.ver),mat(C.ver),new T.MeshStandardMaterial({map:panel,roughness:.7}),mat(C.ver)]);body.position.y=.8;body.castShadow=true;chest.add(body);
    const lid=new T.Mesh(new T.BoxGeometry(2.6,.28,1.6),mat(C.indigo));lid.position.y=1.54;lid.castShadow=true;chest.add(lid);
    const roof=new T.Mesh(new T.CylinderGeometry(.01,1.25,.45,4,1),mat(C.madder));roof.rotation.y=Math.PI/4;roof.scale.set(1.4,1,.85);roof.position.y=1.9;roof.castShadow=true;chest.add(roof);
    [[-1,-.5],[1,-.5],[-1,.5],[1,.5]].forEach(([x,z])=>{const l=new T.Mesh(new T.BoxGeometry(.3,.3,.3),mat(C.ver));l.position.set(x,.1,z);chest.add(l);});
    chest.scale.setScalar(.6);S.add(chest);
    // card deck
    for(let i=0;i<6;i++){const c=cardMesh(null);c.position.set(-1.9,.02+i*.025,-1.0);c.rotation.y=.25;S.add(c);}
    // weather: water, rain, fire, confetti
    water=new T.Mesh(new T.CylinderGeometry(7.7,7.7,.02,48),new T.MeshStandardMaterial({color:0x3f7fb0,transparent:true,opacity:.5,roughness:.3}));water.position.y=-.5;water.visible=false;S.add(water);
    rainG=new T.Group();const rg=new T.BoxGeometry(.015,.45,.015),rm=new T.MeshBasicMaterial({color:0xaac4e6,transparent:true,opacity:.5});
    for(let i=0;i<160;i++){const m=new T.Mesh(rg,rm);m.userData={x:(Math.random()-.5)*14,z:(Math.random()-.5)*14,o:Math.random()};rainG.add(m);}rainG.visible=false;S.add(rainG);
    fireG=new T.Group();for(let i=0;i<40;i++){const m=new T.Mesh(new T.TetrahedronGeometry(.12),new T.MeshBasicMaterial({color:[0xe7ad44,0xe3584a,0xffd27a][i%3],transparent:true}));m.userData={o:Math.random(),x:(Math.random()-.5)*1.6,z:(Math.random()-.5)*1};fireG.add(m);}fireG.visible=false;S.add(fireG);
    confG=new T.Group();const cc=[C.madder,C.ver,C.ochre,C.ink,C.indigo];
    for(let i=0;i<120;i++){const m=new T.Mesh(new T.PlaneGeometry(.1,.16),new T.MeshStandardMaterial({color:cc[i%5],side:T.DoubleSide}));m.userData={v:new T.Vector3((Math.random()-.5)*5,4+Math.random()*4,(Math.random()-.5)*5),r:new T.Vector3(Math.random()*9,Math.random()*9,Math.random()*9)};confG.add(m);}
    confG.visible=false;S.add(confG);
    // touch / mouse orbit
    const el=R.domElement;el.style.touchAction="pan-y";
    el.addEventListener("pointerdown",e=>{drag={x:e.clientX,o:userOrbit};});
    addEventListener("pointermove",e=>{if(drag)userOrbit=drag.o+(e.clientX-drag.x)*.008;});
    addEventListener("pointerup",()=>{drag=null;});
  }
  function cardMesh(front){
    const bt=tex("cardback",128,192,(g,w,h)=>{g.fillStyle="#2a1627";g.fillRect(0,0,w,h);band(g,0,w,12);band(g,h-12,w,12);rosette(g,w/2,h/2,34);});
    return new T.Mesh(geo("card",()=>new T.BoxGeometry(1.2,.02,1.8)),[mat(C.ink),mat(C.ink),new T.MeshStandardMaterial({map:bt,roughness:.6}),front?new T.MeshStandardMaterial({map:front,roughness:.6}):mat(C.plum),mat(C.ink),mat(C.ink)]);
  }
  function timesTex(card){
    return tex("times:"+card.t,512,768,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,card.g?"#4a3a2a":"#3d2538");gr.addColorStop(1,"#22131f");g.fillStyle=gr;g.fillRect(0,0,w,h);
      band(g,0,w,40);band(g,h-40,w,40);g.textAlign="center";g.fillStyle=card.g?"#e7ad44":"#56b6a6";g.font="700 30px system-ui,sans-serif";g.fillText(card.g?"VREMURI BUNE":"VREMURI GRELE",w/2,120);
      g.fillStyle="#f4e7d6";g.font="58px Georgia,serif";const words=card.t.split(" ");let line="",y=230;
      words.forEach(wd=>{const tst=line?line+" "+wd:wd;if(g.measureText(tst).width>w-70){g.fillText(line,w/2,y);y+=70;line=wd;}else line=tst;});g.fillText(line,w/2,y);
      g.fillStyle="#bfa7b3";g.font="25px system-ui,sans-serif";const d=card.d.split(" ");line="";y=Math.max(y+90,430);
      d.forEach(wd=>{const tst=line?line+" "+wd:wd;if(g.measureText(tst).width>w-80){g.fillText(line,w/2,y);y+=34;line=wd;}else line=tst;});if(y<h-60)g.fillText(line,w/2,y);});
  }
  function dieMesh(){
    const face=n=>tex("die"+n,64,64,(g)=>{g.fillStyle="#f4e7d6";g.fillRect(0,0,64,64);g.fillStyle="#22131f";
      const P={1:[[32,32]],2:[[18,18],[46,46]],3:[[16,16],[32,32],[48,48]],4:[[18,18],[46,18],[18,46],[46,46]],5:[[16,16],[48,16],[32,32],[16,48],[48,48]],6:[[18,15],[46,15],[18,32],[46,32],[18,49],[46,49]]}[n];
      P.forEach(([x,y])=>{g.beginPath();g.arc(x,y,6,0,7);g.fill();});});
    const m=new T.Mesh(geo("die",()=>new T.BoxGeometry(.72,.72,.72)),[3,4,2,5,1,6].map(n=>new T.MeshStandardMaterial({map:face(n),roughness:.4})));m.castShadow=true;return m;
  }
  const DIE_REST={1:[-Math.PI/2,0,0],2:[0,0,0],3:[0,0,Math.PI/2],4:[0,0,-Math.PI/2],5:[Math.PI,0,0],6:[Math.PI/2,0,0]};
  function figMesh(sex,small){
    const g=new T.Group();
    if(sex==="F"){const sk=new T.Mesh(geo("skirt",()=>new T.ConeGeometry(.32,.75,7)),mat(C.madder));sk.position.y=.38;g.add(sk);
      const st=new T.Mesh(geo("stripe",()=>new T.CylinderGeometry(.24,.27,.07,7)),mat(C.ochre));st.position.y=.28;g.add(st);
      const hd=new T.Mesh(geo("head",()=>new T.IcosahedronGeometry(.17,0)),mat(C.skin));hd.position.y=.88;g.add(hd);
      const kf=new T.Mesh(geo("kerchief",()=>new T.ConeGeometry(.2,.22,6)),mat(C.madder));kf.position.y=1.0;g.add(kf);}
    else{const bd=new T.Mesh(geo("body",()=>new T.CylinderGeometry(.2,.24,.55,7)),mat(C.ver));bd.position.y=.55;g.add(bd);
      const belt=new T.Mesh(geo("belt",()=>new T.CylinderGeometry(.215,.215,.08,7)),mat(C.madder));belt.position.y=.5;g.add(belt);
      [-.1,.1].forEach(x=>{const lg=new T.Mesh(geo("leg",()=>new T.CylinderGeometry(.06,.06,.3,5)),mat(C.ink));lg.position.set(x,.15,0);g.add(lg);});
      const hd=new T.Mesh(geo("head",()=>new T.IcosahedronGeometry(.17,0)),mat(C.skin));hd.position.y=.98;g.add(hd);
      const hat=new T.Mesh(geo("hat",()=>new T.CylinderGeometry(.13,.2,.16,7)),mat(C.hat));hat.position.y=1.13;g.add(hat);
      const brim=new T.Mesh(geo("brim",()=>new T.CylinderGeometry(.27,.27,.03,9)),mat(C.hat));brim.position.y=1.06;g.add(brim);}
    g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;
  }
  function landMesh(){
    const lt=tex("land",128,128,(g,w,h)=>{g.fillStyle="#3c7a52";g.fillRect(0,0,w,h);for(let i=0;i<7;i++){g.fillStyle=i%2?"#4f9466":"#6aa86f";g.fillRect(0,i*19,w,9);}g.fillStyle="#e7ad44";for(let i=0;i<10;i++){g.beginPath();g.arc(10+((i*53)%110),10+((i*91)%110),3,0,7);g.fill();}});
    const m=new T.Mesh(geo("land",()=>new T.BoxGeometry(.9,.08,.9)),new T.MeshStandardMaterial({map:lt,roughness:.9}));m.receiveShadow=true;return m;
  }
  function tokenMesh(){
    const tt=tex("tok",64,64,(g)=>{g.fillStyle="#2a1627";g.fillRect(0,0,64,64);rosette(g,20,32,13);rosette(g,44,32,13);});
    const m=new T.Mesh(geo("tok",()=>new T.BoxGeometry(.34,.14,.24)),[mat(C.ver),mat(C.ver),mat(C.indigo),mat(C.ver),new T.MeshStandardMaterial({map:tt}),mat(C.ver)]);m.castShadow=true;return m;
  }
  function labelSprite(text,me){
    const c=document.createElement("canvas");c.width=512;c.height=96;const g=c.getContext("2d");
    g.fillStyle=me?"rgba(231,173,68,.92)":"rgba(48,28,44,.88)";const r=40;g.beginPath();g.roundRect?g.roundRect(4,8,504,80,r):g.rect(4,8,504,80);g.fill();
    g.fillStyle=me?"#2a1610":"#f4e7d6";g.font="700 40px system-ui,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(text,256,50);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
    const s=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(2.3,.43,1);s.renderOrder=10;return s;
  }

  /* ---------- sync with game state ---------- */
  const tw=[];// running tweens on figures
  function seatAngle(i,n,meIdx){return ((i-meIdx+n)%n)/n*Math.PI*2;}
  function domainFrame(ang){const r=4.5;return {pos:new T.Vector3(Math.sin(ang)*r,0,Math.cos(ang)*r),ang};}
  function local(fr,x,z){ // domain-local (x along the arc, z outward) to world
    const c=Math.cos(fr.ang),s=Math.sin(fr.ang);return new T.Vector3(fr.pos.x+x*c+z*s,0,fr.pos.z-x*s+z*c);}
  function sync(s,me){
    if(!active||!s||s.status==="lobby")return;state=s;meId=me;
    const n=s.players.length,meIdx=Math.max(0,s.players.findIndex(p=>p.id===me));
    const want=new Set();
    s.players.forEach((p,i)=>{
      const fr=domainFrame(seatAngle(i,n,meIdx));
      // land tiles
      const d=doms[p.id]||(doms[p.id]={tiles:[]});
      while(d.tiles.length<p.land){const t=landMesh();t.scale.setScalar(.01);S.add(t);d.tiles.push(t);}
      while(d.tiles.length>p.land){const t=d.tiles.pop();t.userData.die=clock;}
      d.tiles.forEach((t,k)=>{const x=(k-(p.land-1)/2)*.95;const w=local(fr,x,.15);t.position.set(w.x,.04,w.z);t.rotation.y=fr.ang;t.userData.tgt=1;});
      // peasants: couples then singles, in rows of slots
      const ps=Object.values(s.P).filter(q=>q.o===p.id);
      const couples=ps.filter(q=>q.sp&&q.id<q.sp).map(q=>[q,s.P[q.sp]]),singles=ps.filter(q=>!q.sp);
      const slots=[];couples.forEach(c=>slots.push(c));singles.forEach(q=>slots.push([q]));
      const perRow=Math.max(3,Math.min(6,p.land+1));
      slots.forEach((sl,k)=>{const row=Math.floor(k/perRow),col=k%perRow,inRow=Math.min(perRow,slots.length-row*perRow);
        const x=(col-(inRow-1)/2)*1.0,z=.15-row*.9;
        sl.forEach((q,j)=>{want.add(q.id);const off=sl.length>1?(j?.24:-.24):0;place(q,local(fr,x+off,z),fr.ang);});});
      // dowry tokens
      const tk=tokens[p.id]||(tokens[p.id]=[]);const shown=Math.min(p.z,15);
      while(tk.length<shown){const m=tokenMesh();m.scale.setScalar(.01);S.add(m);tk.push(m);}
      while(tk.length>shown){const m=tk.pop();m.userData.die=clock;}
      tk.forEach((m,k)=>{const w=local(fr,-(p.land*.48+.55)-(k%3)*.38,.15);m.position.set(w.x,.07+Math.floor(k/3)*.145,w.z);m.rotation.y=fr.ang+(k%2)*.12;m.userData.tgt=1;});
      // label
      const txt=`${p.name}${p.bot?" (bot)":""} · ${p.z} Z`;
      if(!labels[p.id]||labels[p.id].userData.txt!==txt){if(labels[p.id])S.remove(labels[p.id]);const l=labelSprite(txt,p.id===me);l.userData.txt=txt;S.add(l);labels[p.id]=l;}
      const lw=local(fr,0,1.15);labels[p.id].position.set(lw.x,.12,lw.z);
    });
    // remove gone boyars
    Object.keys(doms).forEach(id=>{if(!s.players.some(p=>p.id===id)){doms[id].tiles.forEach(t=>t.userData.die=clock);(tokens[id]||[]).forEach(t=>t.userData.die=clock);if(labels[id])S.remove(labels[id]);delete doms[id];delete tokens[id];delete labels[id];}});
    // peasants that left the table sink away
    Object.keys(fig).forEach(id=>{if(!want.has(+id)&&!fig[id].userData.die){fig[id].userData.die=clock;}});
    // new turn: times card + weather
    const tk=s.code+":"+s.turn;
    if(seenTurn!==tk){const first=seenTurn===null;seenTurn=tk;if((!first||s.phase==="times")&&s.tcur&&typeof TIMES!=="undefined"&&TIMES[s.tcur])timesEvent(s.tcur);}
    // production rolls: throw a die from that boyar's domain
    if(s.phase==="prod"&&s.ts&&s.ts.rolled){Object.entries(s.ts.rolled).forEach(([k,v])=>{const key=tk+":"+k;if(seenRolls.has(key))return;seenRolls.add(key);
      const q=s.P[k];const from=q&&fig[q.id]?fig[q.id].position.clone():new T.Vector3(0,0,4);throwDie(from,v);});}
    else s.ts&&s.ts.rolled&&Object.keys(s.ts.rolled).forEach(k=>seenRolls.add(tk+":"+k));
  }
  function place(q,w,ang){
    let m=fig[q.id];
    if(!m){m=figMesh(q.s);m.userData={born:clock,from:null};m.position.copy(w);m.scale.setScalar(.01);S.add(m);fig[q.id]=m;}
    if(m.userData.sex&&m.userData.sex!==q.s){S.remove(m);delete fig[q.id];return place(q,w,ang);}
    m.userData.sex=q.s;
    const sc=q.nb?.62:.95;m.userData.sc=sc;
    if(!m.userData.tgt||m.userData.tgt.distanceTo(w)>.01){m.userData.from=m.position.clone();m.userData.tgt=w.clone();m.userData.t0=clock;}
    m.rotation.y=ang;
  }
  /* ---------- events ---------- */
  let timesFx=null,weather=null,wedFx=null;
  function timesEvent(key){
    const c=TIMES[key];const m=cardMesh(timesTex(c));S.add(m);m.castShadow=true;
    timesFx={m,t0:clock,good:!!c.g};
    weather={kind:key==="potop"?"flood":key==="foc"?"fire":c.g?"sun":"storm",t0:clock};
    if(weather.kind==="fire"&&state){const rich=state.players.slice().sort((a,b)=>b.z-a.z)[0];const n=state.players.length,mi=Math.max(0,state.players.findIndex(p=>p.id===meId));
      const i=state.players.indexOf(rich);weather.at=domainFrame(seatAngle(i,n,mi)).pos;}
  }
  function throwDie(from,v){
    const m=dieMesh();S.add(m);const to=new T.Vector3((Math.random()-.5)*1.6,.3,1.2+(Math.random()-.5)*.8);
    dice.push({m,from:from.clone().setY(1.6),to,v,t0:clock,spin:new T.Vector3(3+Math.random()*3,2+Math.random()*3,3+Math.random()*3)});
    while(dice.length>4){const d=dice.shift();S.remove(d.m);}
  }
  function wedding(ok){
    if(!active)return;
    if(ok){confG.visible=true;confG.userData.t0=clock;}
    else{weather={kind:"drizzle",t0:clock};}
  }
  function hint(k){ if(!active)return;
    if(k==="death"){lights.flash.intensity=0;}
  }
  /* ---------- loop ---------- */
  function frame(ts){
    raf=active?requestAnimationFrame(frame):0;if(!active||!wrap)return;
    const now=ts/1000;const dt=Math.min(.05,last?now-last:.016);last=now;clock+=dt;
    const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;
    const cv=R.domElement;if(cv.width!==Math.round(w*R.getPixelRatio())||cv.height!==Math.round(h*R.getPixelRatio())){R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
    // camera: slow sway around your seat, drag to orbit
    orbit+=dt*.05;const a=Math.sin(orbit)*.18+userOrbit;
    const portrait=h/w>.62,rad=portrait?10.4:9.6,hy=portrait?9.6:7.4;
    cam.position.set(Math.sin(a)*rad,hy,Math.cos(a)*rad);
    let shake=0;if(weather&&(weather.kind==="storm"||weather.kind==="flood")){const e=clock-weather.t0;if(e>.3&&e<.8)shake=Math.sin(clock*90)*.06;}
    cam.position.x+=shake;cam.lookAt(0,-.2,1.3);
    // figures: walk to target, pop in, sink out
    Object.entries(fig).forEach(([id,m])=>{const u=m.userData;
      if(u.die){const k=cl((clock-u.die)/.9);m.position.y=-.9*E(k);m.rotation.z=-1.1*E(k);if(k>=1){S.remove(m);delete fig[id];}return;}
      const sc=u.sc||.95;const bk=cl((clock-u.born)/.5);m.scale.setScalar(sc*(u.born&&clock-u.born<.6?back2(bk):1));
      if(u.tgt){const k=cl((clock-(u.t0||0))/.9);const p=u.from?u.from.clone().lerp(u.tgt,EIO(k)):u.tgt;m.position.set(p.x,.08+(k<1&&u.from&&u.from.distanceTo(u.tgt)>.5?Math.abs(Math.sin(k*Math.PI*6))*.15:0),p.z);}});
    // tiles & tokens grow/shrink
    S.children.slice().forEach(o=>{const u=o.userData;if(u.tgt!==1&&!u.die)return;if(o.isGroup||o.isSprite)return;
      if(u.die){o.scale.multiplyScalar(.85);if(o.scale.x<.02)S.remove(o);}else if(o.scale.x<1){o.scale.setScalar(Math.min(1,o.scale.x+dt*3.5));}});
    // times card: rise, flip, settle
    if(timesFx){const e=clock-timesFx.t0,m=timesFx.m;const dir=new T.Vector3();cam.getWorldDirection(dir);
      const show=cam.position.clone().add(dir.multiplyScalar(6)).add(new T.Vector3(0,1,0).applyQuaternion(cam.quaternion).multiplyScalar(.6));
      const deck=new T.Vector3(-1.9,.2,-1.0),q0=new T.Quaternion().setFromEuler(new T.Euler(0,.25,0));
      const flip=EIO((e-.7)/.6),q1=cam.quaternion.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0))).multiply(new T.Quaternion().setFromEuler(new T.Euler(0,0,Math.PI*(1-flip))));
      const k=E(e/.7)*(1-EIO((e-3.4)/.6));m.position.lerpVectors(deck,show,k);m.quaternion.slerpQuaternions(q0,q1,k);m.scale.setScalar(1+.25*k);
      if(e>4.1){S.remove(m);timesFx=null;}}
    // weather
    const we=weather?clock-weather.t0:99;
    const stormy=weather&&(weather.kind==="storm"||weather.kind==="flood"||weather.kind==="drizzle")&&we<(weather.kind==="drizzle"?1.6:3.6);
    rainG.visible=!!stormy;if(stormy)rainG.children.forEach(m=>{const u=m.userData;m.position.set(u.x,8-((clock*9+u.o*8)%8.5),u.z);});
    lights.flash.intensity=weather&&weather.kind!=="sun"&&weather.kind!=="drizzle"&&((we>.25&&we<.38)||(we>.5&&we<.56))?110:0;
    const dark=stormy?Math.min(1,we*3)*(weather.kind==="drizzle"?.4:1):0;
    lights.key.intensity=1.5-dark*.9+(weather&&weather.kind==="sun"&&we<2.5?Math.sin(Math.PI*we/2.5)*.8:0);lights.lamp.intensity=16-dark*9;
    if(weather&&weather.kind==="flood"&&we<4.2){water.visible=true;water.position.y=-.4+.85*E(we/1.2)*(1-EIO((we-3)/1.2));}else water.visible=false;
    if(weather&&weather.kind==="fire"&&we<3.2&&weather.at){fireG.visible=true;fireG.position.copy(weather.at);fireG.children.forEach(m=>{const u=m.userData,p=(clock*1.4+u.o)%1;m.position.set(u.x*(1-p*.5),p*1.8,u.z);m.material.opacity=1-p;m.rotation.set(clock*3+u.o,clock*2,0);});}else fireG.visible=false;
    // dice
    dice.forEach(d=>{const e=(clock-d.t0)/1.1,k=E(e);d.m.position.lerpVectors(d.from,d.to,k);d.m.position.y=.3+Math.abs(Math.cos(e*Math.PI*2.5))*1.8*Math.pow(1-cl(e),1.6);
      const r=DIE_REST[d.v]||[0,0,0],sp=1-k;d.m.rotation.set(r[0]+d.spin.x*sp*Math.PI*2,r[1]+d.spin.y*sp*Math.PI*2,r[2]+d.spin.z*sp*Math.PI*2);
      if(clock-d.t0>3.2){d.m.scale.multiplyScalar(.85);if(d.m.scale.x<.05){S.remove(d.m);d.dead=1;}}});
    dice=dice.filter(d=>!d.dead);
    // confetti
    if(confG.visible){const e=clock-confG.userData.t0;confG.children.forEach((m,i)=>{const u=m.userData,ct=e-(i%20)*.01;m.position.set(u.v.x*ct,2+u.v.y*ct-4.9*ct*ct,1.2+u.v.z*ct);if(m.position.y<.05)m.position.y=.05;m.rotation.set(u.r.x*ct,u.r.y*ct,u.r.z*ct);});if(e>3.5)confG.visible=false;}
    R.render(S,cam);
  }
  /* ---------- public API ---------- */
  async function attach(slot){
    if(!slot)return false;
    if(!ok){const good=await load();if(!good)return false;}
    if(!R){try{build();}catch(e){console.error(e);ok=false;return false;}}
    if(!wrap){wrap=document.createElement("div");wrap.className="v3d";wrap.appendChild(R.domElement);
      const b=document.createElement("button");b.className="v3dhint";b.textContent="Glisează ca să rotești masa";wrap.appendChild(b);setTimeout(()=>b.remove(),4000);}
    if(wrap.parentNode!==slot)slot.appendChild(wrap);
    if(!active){active=true;last=0;raf=requestAnimationFrame(frame);}
    return true;
  }
  function detach(){active=false;if(raf)cancelAnimationFrame(raf);raf=0;if(wrap&&wrap.parentNode)wrap.parentNode.removeChild(wrap);}
  function reset(){Object.values(fig).forEach(m=>S&&S.remove(m));fig={};Object.values(doms).forEach(d=>d.tiles.forEach(t=>S.remove(t)));doms={};Object.values(tokens).forEach(a=>a.forEach(t=>S.remove(t)));tokens={};Object.values(labels).forEach(l=>S.remove(l));labels={};seenTurn=null;seenRolls=new Set();}
  document.addEventListener("visibilitychange",()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else if(active&&!raf){last=0;raf=requestAnimationFrame(frame);}});
  return {load,attach,detach,sync,reset,wedding,hint,get ready(){return ok&&!!R;},get active(){return active;}};
})();
