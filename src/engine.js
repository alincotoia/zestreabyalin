/* ===== Zestrea engine: pure functions over the shared state ===== */
const NAMES_M=["Alimoș","Ciumpălău","Decebal","Bonbonel","Inocențiu","Helmut","Manole","Xavier","Gogu","Matache","Costică","Lică Sămădăul","Cucu","Bolțar","Ion","Aloisiu","Toader","Dumitru","Vasile","Belizarie","Aristică","Iancu","Alin","Alexandru","Nea’ Marin","Cosma","Ghiță","Petrache","Mitică","Fănică","Năstase","Pătru","Grigore","Ilie","Stan","Radu","Tudose","Haralambie","Pantelimon","Zaharia","Spiridon","Ilarie"];
const NAMES_F=["Brunhilda","Aglaia","Zenobia","Eufrosina","Anuța","Bözsi","Corcodușa","Emöke","Florica","Danubia","Consuela","Miorița","Julieta","Maricica","Ileana","Cleopatra","Paula","Raluca","Simo’","Safta","Marioara","Lenuța","Ioana","Floarea","Veta","Saveta","Domnica","Catinca","Tinca","Smaranda","Zamfira","Ruxandra","Vica","Sofica","Profira","Paraschiva","Aurica","Viorica","Marghioala","Anica","Chiriachița","Lucreția"];

const ROLLTAB={1:[1,1],2:[2,1],3:[2,1],4:[2,0],5:[2,0],6:[3,0]};

const FATE={
  haine:{t:"Haine necălcate",role:1,m:-1,d:"Rol. Un Fecior sau o Mândră își ia hainele necălcate și pe dos. −1 șansă de nuntă."},
  moasa:{t:"Moașă",role:1,sex:"F",d:"Rol. O Mândră sau Nevastă devine moașă. Boierul ei primește +1 Zestre pentru fiecare nou-născut de pe domeniul lui."},
  lautar:{t:"Lăutar",role:1,d:"Rol. Un țăran devine Lăutar. Poate cânta la orice nuntă (și poate fi angajat de alți boieri, preț negociabil): +1 șansă de nuntă."},
  ponihoasa:{t:"Ponihoasă",role:1,sex:"F",m:2,d:"Rol. O Mândră își pierde vederea. +2 șanse de nuntă."},
  vladic:{t:"Vlădicul Satului",role:1,sex:"M",d:"Rol. Un Fecior sau Bărbat devine Vlădic și nu se mai poate căsători. Boierul lui primește +1 Zestre pentru fiecare țăran care moare pe alt domeniu."},
  clarv:{t:"Clarvăzătoare",role:1,sex:"F",d:"Rol. O Mândră sau Nevastă devine Clarvăzătoare. Boierul ei vede următoarea carte de Vremuri."},
  urat:{t:"Urâtul satului",role:1,m:-2,d:"Rol. Un Fecior sau o Mândră suferă subit de hidoșenie. −2 șanse de nuntă."},
  deochi:{t:"Deochi",role:1,m:-2,d:"Rol. Ptiu, ptiu! −2 șanse de nuntă."},
  prost:{t:"Prostul satului",role:1,m:-1,d:"Rol. Crește la vârstă, dar rămâne cu mintea în urmă. −1 șansă de nuntă."},
  mono:{t:"Familie monoparentală",role:1,single:1,d:"Rol. Un țăran singur produce ca un Cuplu, dar nu face copii, nu se mai poate căsători și nu contează la bonusul de +5."},
  lac:{t:"Din lac în puț",d:"Cel mai sărac boier (cu cel puțin 1 Zestre) pierde 2 Zestre. La egalitate, pierd toți cei mai săraci."},
  sfadit:{t:"S-o sfădit mama cu tata",d:"Un Cuplu, la alegere, de la orice boier, se desparte. Rămân la același boier ca țărani singuri. Ultimul Cuplu al unui boier nu se poate destrăma."},
  capra:{t:"Să moară capra vecinului",d:"Boierii din stânga și din dreapta ta plătesc fiecare 4 Zestre la Stat."},
  calcat:{t:"Ai călcat în dânsul",any:1,d:"Ai noroc! La următoarea ta aruncare de zar (producție sau nuntă) alegi tu rezultatul. Se poate juca în orice etapă."},
  fura:{t:"Se fură mireasa",after:1,d:"Imediat după o nuntă reușită: mireasa se mărită cu unul dintre Feciorii tăi, în locul mirelui."},
  coasa:{t:"La coasă pă arătură",d:"Un Fecior al tău lucrează beat pământul altui boier, care se simte obligat să plătească. Primești 3 Zestre de la un boier ales."},
  luceafar:{t:"Luceafărul",d:"Un boier, la alegere, primește un copil din flori, adult din start."},
  suflete:{t:"Suflete pereche",d:"Următoarea ta nuntă iese sigur: fără Zestre și fără zar."},
  amsterdam:{t:"Nunți la Amsterdam",d:"Până la finalul turei, oricine poate face nunți între orice țărani, indiferent de sex. Cuplurile de același sex nu fac copii."},
  tuica:{t:"Ziua de țuică",d:"Faci (și bei) țuică pe domeniul tău. +2 Zestre pentru fiecare Pământ."},
  schimb:{t:"Schimb de mame",d:"Schimbă între ele oricare două Neveste sau Mândre din joc. Își păstrează rolurile."},
  hora:{t:"Hora mare",d:"Până la finalul turei, prima încercare de nuntă a fiecărei perechi e gratis."},
  bataie:{t:"Mănâncă bătaie",d:"Feciorii și Mândrele tale singure nu trebuie hrăniți tura asta. Cuplurile mănâncă normal."},
  vinvremuri:{t:"Vin vremuri grele?",d:"Scoți ultima carte de Vremuri din teanc (jocul se scurtează cu o tură) sau adaugi la final una nefolosită (jocul se lungește cu o tură)."},
  tir:{t:"Cu TIR-ul pă Italia",d:"+2 Zestre pentru fiecare Fecior singur al tău, inclusiv nou-născuții."},
  descantec:{t:"Descântec",d:"Aranjezi următoarele 3 cărți de Vremuri în ce ordine vrei."},
  piatra:{t:"Casă de piatră",after:1,own:1,d:"Imediat după o nuntă reușită la care ai participat: ceilalți boieri (în afară de celălalt nuntaș) îți dau câte 2 Zestre."},
  murat:{t:"Afacere cu murături",d:"+2 Zestre pentru fiecare Mândră singură a ta, inclusiv nou-născutele."},
  afara:{t:"Dă p-afară",d:"Un Fecior sau o Mândră singură de-a ta pleacă definitiv la alt boier."},
  dulau:{t:"Pune dulăul pe el",d:"Elimină un Bărbat însurat de la oricare boier. Ultimul Cuplu al unui boier nu se poate destrăma."},
  matrapaz:{t:"Matrapazlâc la hotar",d:"Cineva a mutat gardul în favoarea ta. Iei 1 Pământ de la alt boier (nu ultimul lui)."},
  sexch:{t:"Schimbare de sex",d:"Un țăran (singur sau căsătorit) își schimbă sexul și primește un nume nou."},
  birt:{t:"Bătaie la birt",d:"Băutura-i toate relele. Elimină un Bărbat însurat de la oricare boier. Ultimul Cuplu nu se poate destrăma."}
};
const FATE_DECK=["haine","moasa","lautar","lautar","lautar","ponihoasa","vladic","clarv","urat","deochi","prost","mono","lac","sfadit","capra","calcat","fura","coasa","luceafar","suflete","amsterdam","tuica","schimb","hora","bataie","vinvremuri","tir","descantec","piatra","murat","afara","dulau","matrapaz","sexch","birt"];

const TIMES={
  vbune:{t:"Vremuri Bune",g:1,d:"Toți boierii primesc o carte de Soartă."},
  fonduri:{t:"Fonduri Europene",g:1,d:"Toți boierii primesc 2 Zestre."},
  sanz:{t:"Sânziene",g:1,d:"Mândrele își visează ursitul. Tura asta, nunțile reușesc la 1, 2 sau 3."},
  colinda:{t:"Cu colinda",i:1,d:"Fiecare boier alege un alt boier la care merge la colindat și primește de acolo 1 Zestre pentru fiecare țăran singur al său (sau 1 Zestre dacă nu are)."},
  cerno:{t:"Umbra Cernobâlului",d:"Toate nașterile din tura asta sunt gemeni."},
  comunism:{t:"Comunism",d:"Toată Zestrea și tot Pământul din sat se împart egal. Ce rămâne merge la Stat."},
  zilele:{t:"Zilele satului",i:1,d:"Cel mai sărac boier câștigă 3 Zestre la păcănele. Oricine poate plăti la Stat câtă Zestre vrea ca țăranii să se dea în Linghișpir; ceilalți trebuie să plătească la fel de mult, să nu rămână mai prejos."},
  foncirea:{t:"Foncirea",i:1,d:"Fiecare boier plătește 1 Zestre pentru fiecare Pământ. Poți cere împrumut altora. Cine nu plătește tot pierde jumătate din Pământ."},
  potop:{t:"Potop",i:1,d:"Fiecare boier pierde, la alegere, un Fecior singur, o Mândră singură, un Cuplu sau un Pământ. Ultimul Cuplu nu se poate pierde."},
  haiducii:{t:"Vin haiducii",d:"Haiducii fură toate Mândrele singure. Cine nu are Mândre singure pierde 1 Zestre pentru fiecare Pământ."},
  batuti:{t:"Bătuți de soartă",d:"Toate cărțile de Soartă din mână se amestecă și se împart egal. Cine rămâne cu mai puține primește una din pachet. Minim o carte de boier."},
  primar:{t:"Primarul satului",i:1,d:"Se votează primarul. Fiecare boier votează cu câte un vot pentru fiecare țăran. Primarul primește 1 Zestre la fiecare nuntă reușită din sat, până la finalul jocului."},
  catanie:{t:"Cătănie",d:"Pentru fiecare Fecior singur se dă cu zarul. La 1, 2 sau 3 nu se mai întoarce din război."},
  foc:{t:"Așe feri, de foc",d:"Incendiu! Cel mai bogat boier pierde jumătate din Zestre. La 1–4 pe zar focul trece la vecinii din stânga și dreapta (dacă au Zestre), care pierd 2 Zestre și dau și ei cu zarul. Focul atinge fiecare boier o singură dată."},
  autostrada:{t:"Autostradă în ogradă",d:"Fiecare boier dă cu zarul. La 1, 2 sau 3 autostrada trece prin ograda lui și vinde la Stat jumătate din Pământ, cu 1 Zestre bucata."},
  dragobete:{t:"Dragobete",d:"Toate Cuplurile fac un prunc."},
  pasalac:{t:"Pașalâc",i:1,d:"Toți boierii plătesc peșcheș la Sultan jumătate din Zestre și dau o Nevastă la harem sau un Bărbat însurat la armată. Ultimul Cuplu nu se poate destrăma."}
};
const GOOD=["vbune","fonduri","sanz"];
const HARD=["colinda","cerno","comunism","zilele","foncirea","potop","haiducii","batuti","primar","catanie","foc","autostrada","dragobete","pasalac"];
const PHASES=[["times","Vremuri"],["prod","Producție"],["auct","Licitație"],["neg","Nunți"],["feed","Hrană"]];

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const d6=()=>1+Math.floor(Math.random()*6);
function E(m){const e=new Error(m);e.user=1;return e;}

/* --- queries --- */
const pl=(s,id)=>s.players.find(p=>p.id===id);
const peas=(s,o)=>Object.values(s.P).filter(p=>p.o===o);
const coupleList=(s,o)=>peas(s,o).filter(p=>p.sp&&p.id<p.sp).map(p=>[p,s.P[p.sp]]);
const singles=(s,o)=>peas(s,o).filter(p=>!p.sp);
const hasRole=(p,r)=>p.r.includes(r);
const isMono=p=>!p.sp&&hasRole(p,"mono");
const canMarry=p=>!p.sp&&!p.nb&&!hasRole(p,"vladic")&&!hasRole(p,"mono");
const lastCouple=(s,o)=>coupleList(s,o).length<=1;
function units(s,o){
  const u=coupleList(s,o).map(([a,b])=>({k:a.id,a,b,c:1}));
  singles(s,o).filter(p=>isMono(p)&&!p.nb).forEach(p=>u.push({k:p.id,a:p,c:0}));
  return u;
}
const productive=(s,o)=>units(s,o).slice(0,pl(s,o).land);
function canChild(s,o){return singles(s,o).length<7&&s.pdeck.length>0;}
function nbrs(s,id){
  const n=s.players.length,i=s.players.findIndex(p=>p.id===id);
  const L=s.players[(i+n-1)%n],R=s.players[(i+1)%n];
  return [...new Set([L,R].filter(p=>p.id!==id))];
}
function richest(s){
  const m=Math.max(...s.players.map(p=>p.z));
  return shuffle(s.players.filter(p=>p.z===m))[0];
}
const pname=(s,id)=>(pl(s,id)||{}).name||"?";
function log(s,m){s.log.push([Date.now(),m]);if(s.log.length>80)s.log.splice(0,s.log.length-80);}
function fx(s,k,id){s.fxn=(s.fxn||0)+1;(s.fx=s.fx||[]).push([s.fxn,k,id||null]);if(s.fx.length>24)s.fx.shift();}
function setDL(s,sec){s.dl=sec?Date.now()+sec*1000:null;s.dlLen=sec||0;}
const negCur=s=>s.players[((s.negStart||0)+(s.negI||0))%s.players.length].id;

/* --- mutations --- */
function drawP(s,o,nb){
  if(!s.pdeck.length)return null;
  const [n,sx]=s.pdeck.shift();const id=++s.seq;
  s.P[id]={id,n,s:sx,o,sp:null,nb:!!nb,r:[]};return s.P[id];
}
function drawFate(s,p){if(!s.fdeck.length)return null;const c=s.fdeck.shift();p.hand.push(c);return c;}
function removeP(s,id,death){
  const p=s.P[id];if(!p)return;
  if(p.sp&&s.P[p.sp])s.P[p.sp].sp=null;
  delete s.P[id];
  if(death){fx(s,"death");
    Object.values(s.P).filter(v=>hasRole(v,"vladic")&&v.o!==p.o).forEach(v=>{pl(s,v.o).z+=1;});
  }
}
function birth(s,o,count){
  const out=[];
  for(let i=0;i<count;i++){
    if(!canChild(s,o))break;
    const c=drawP(s,o,true);if(!c)break;out.push(c);
    if(peas(s,o).some(p=>hasRole(p,"moasa")))pl(s,o).z+=1;
  }
  return out;
}

/* --- setup --- */
function newGame(code,host,hostName,hard,tm){
  return {v:0,code,status:"lobby",host,created:Date.now(),hard:hard||5,tm:tm||{turn:30,wed:120,auct:20},dl:null,dlLen:0,fx:[],fxn:0,wroll:null,
    players:[{id:host,name:hostName,z:0,land:3,hand:[],ready:false,fix:false,suf:false}],
    P:{},seq:0,pdeck:[],fdeck:[],fdisc:[],tdeck:[],tunused:[],tcur:null,turn:0,total:0,phase:"lobby",
    last:false,fl:{},ts:{},auction:null,props:{},lastW:null,mayor:null,log:[],results:null};
}
function startGame(s){
  if(s.players.length<2)throw E("Ai nevoie de cel puțin 2 boieri.");
  const deck=[...NAMES_M.map(n=>[n,"M"]),...NAMES_F.map(n=>[n,"F"])];
  s.pdeck=shuffle(deck).slice(0,84);
  s.players.forEach(p=>{
    for(const sx of ["M","F"]){
      const i=s.pdeck.findIndex(c=>c[1]===sx);const [n]=s.pdeck.splice(i,1)[0];
      const id=++s.seq;s.P[id]={id,n,s:sx,o:p.id,sp:null,nb:false,r:[]};
    }
    const [a,b]=peas(s,p.id);a.sp=b.id;b.sp=a.id;
  });
  s.players=shuffle(s.players);
  s.fdeck=shuffle([...FATE_DECK]);
  const hard=shuffle([...HARD]);
  s.tdeck=[...shuffle([...GOOD]),...hard.slice(0,s.hard)];
  s.tunused=hard.slice(s.hard);
  s.total=s.tdeck.length;
  s.status="play";
  log(s,"Jocul începe. Ordinea la masă: "+s.players.map(p=>p.name).join(", ")+".");
  nextTurn(s);
}

/* --- turn flow --- */
function nextTurn(s){
  if(!s.tdeck.length)return endGame(s);
  s.turn++;s.tcur=s.tdeck.shift();s.last=s.tdeck.length===0;
  s.fl={hora:{},bataie:{}};s.ts={};s.props={};s.lastW=null;s.auction=null;
  s.phase="times";s.players.forEach(p=>p.ready=false);
  log(s,`Tura ${s.turn}: ${TIMES[s.tcur].t}.`);
  setDL(s,(s.tm||{}).turn);fx(s,TIMES[s.tcur].g?"good":"times");
  applyTimes(s);
  tryAdvance(s);
}
function applyTimes(s){
  const k=s.tcur,P=s.players;
  switch(k){
    case"vbune":P.forEach(p=>drawFate(s,p));break;
    case"fonduri":P.forEach(p=>p.z+=2);break;
    case"sanz":s.fl.sanz=1;break;
    case"cerno":s.fl.twins=1;break;
    case"comunism":{
      const tz=P.reduce((a,p)=>a+p.z,0),tl=P.reduce((a,p)=>a+p.land,0),n=P.length;
      P.forEach(p=>{p.z=Math.floor(tz/n);p.land=Math.max(1,Math.min(5,Math.floor(tl/n)));});
      log(s,`Comunism: fiecare boier are acum ${P[0].z} Zestre și ${P[0].land} Pământ.`);break;}
    case"zilele":{
      const m=Math.min(...P.map(p=>p.z));const w=shuffle(P.filter(p=>p.z===m))[0];w.z+=3;
      log(s,`${w.name} câștigă 3 Zestre la păcănele.`);break;}
    case"haiducii":P.forEach(p=>{
      const f=singles(s,p.id).filter(x=>x.s==="F");
      if(f.length){f.forEach(x=>removeP(s,x.id,false));log(s,`Haiducii fură ${f.length} Mândre de la ${p.name}.`);}
      else{const l=Math.min(p.z,p.land);p.z-=l;if(l)log(s,`Haiducii iau ${l} Zestre de la ${p.name}.`);}
    });break;
    case"batuti":{
      const pool=shuffle(P.flatMap(p=>p.hand));P.forEach(p=>p.hand=[]);
      let i=Math.floor(Math.random()*P.length);pool.forEach(c=>{P[i%P.length].hand.push(c);i++;});
      const mx=Math.max(1,...P.map(p=>p.hand.length));
      P.forEach(p=>{while(p.hand.length<mx&&s.fdeck.length)drawFate(s,p);});
      log(s,"Cărțile de Soartă s-au reîmpărțit.");break;}
    case"catanie":P.forEach(p=>{
      singles(s,p.id).filter(x=>x.s==="M"&&!x.nb).forEach(x=>{const r=d6();
        if(r<=3){log(s,`${x.n} (${p.name}) nu se mai întoarce din război (zar ${r}).`);removeP(s,x.id,true);}
        else log(s,`${x.n} (${p.name}) se întoarce din război (zar ${r}).`);});
    });break;
    case"foc":{
      const st=richest(s);const seen=new Set([st.id]);const q=[[st,true]];
      while(q.length){const [p,first]=q.shift();
        const loss=first?Math.floor(p.z/2):Math.min(2,p.z);p.z-=loss;const r=d6();
        log(s,`Focul îl atinge pe ${p.name}: −${loss} Zestre (zar ${r}).`);
        if(r<=4)nbrs(s,p.id).forEach(n=>{if(!seen.has(n.id)&&n.z>0){seen.add(n.id);q.push([n,false]);}});
      }break;}
    case"autostrada":P.forEach(p=>{const r=d6();
      if(r<=3){const l=Math.min(Math.floor(p.land/2),p.land-1);p.land-=l;p.z+=l;log(s,`Autostrada trece prin ograda lui ${p.name} (zar ${r}): vinde ${l} Pământ.`);}
      else log(s,`${p.name} scapă de autostradă (zar ${r}).`);});break;
    case"dragobete":P.forEach(p=>{
      coupleList(s,p.id).forEach(([a,b])=>{if(a.s!==b.s)birth(s,p.id,1);});});
      log(s,"De Dragobete, toate Cuplurile au făcut câte un prunc.");break;
    case"pasalac":P.forEach(p=>{const l=Math.floor(p.z/2);p.z-=l;
      if(lastCouple(s,p.id))p.ready=true;});log(s,"Toți boierii plătesc peșcheș jumătate din Zestre.");break;
    case"primar":s.ts.votes={};break;
  }
}

/* times-phase interactive actions */
function tAct(s,me,a,x){
  if(s.phase!=="times")throw E("Nu e etapa de Vremuri.");
  const p=pl(s,me),k=s.tcur;
  if(a==="ready"){if(TIMES[k].i&&k!=="zilele"&&!p.ready)throw E("Mai întâi alege ce faci la cartea asta.");p.ready=true;}
  else if(a==="colinda"){
    if(p.ready)throw E("Ai colindat deja.");
    if(x){const t=pl(s,x);if(!t||t.id===me)throw E("Alege alt boier.");
      const want=Math.max(1,singles(s,me).length),take=Math.min(want,t.z);t.z-=take;p.z+=take;
      log(s,`${p.name} colindă la ${t.name} și primește ${take} Zestre.`);}
    p.ready=true;}
  else if(a==="zilele"){
    const n=+x;if(!(n>=1)||n>p.z)throw E("Nu ai atâta Zestre.");
    p.z-=n;s.players.forEach(o=>{if(o.id!==me)o.z-=Math.min(n,o.z);});
    log(s,`${p.name} plătește ${n} Zestre pentru Linghișpir. Ceilalți plătesc la fel.`);}
  else if(a==="foncirea"){
    if(p.ready)throw E("Ai plătit deja.");
    if(p.z>=p.land){p.z-=p.land;log(s,`${p.name} plătește foncirea: ${p.land} Zestre.`);}
    else{const l=Math.min(Math.floor(p.land/2),p.land-1);log(s,`${p.name} nu are toată foncirea, plătește ${p.z} și pierde ${l} Pământ.`);p.z=0;p.land-=l;}
    p.ready=true;}
  else if(a==="potop"){
    if(p.ready)throw E("Ai ales deja.");
    potopLose(s,p,x);p.ready=true;}
  else if(a==="vote"){
    if(p.ready)throw E("Ai votat deja.");
    if(!pl(s,x))throw E("Candidat necunoscut.");
    s.ts.votes[me]=x;p.ready=true;log(s,`${p.name} a votat.`);}
  else if(a==="pasalac"){
    if(p.ready)throw E("Ai dat deja.");
    const c=coupleList(s,me).find(([a,b])=>a.s===x||b.s===x);
    if(!c)throw E("N-ai un astfel de țăran căsătorit.");
    const v=c[0].s===x?c[0]:c[1];removeP(s,v.id,false);
    log(s,`${p.name} dă pe ${v.n} ${x==="F"?"la harem":"la armată"}.`);p.ready=true;}
  else throw E("Acțiune necunoscută.");
  tryAdvance(s);
}
function potopOptions(s,me){
  const p=pl(s,me),o=[];const sg=singles(s,me).filter(x=>!isMono(x)||true);
  if(sg.some(x=>x.s==="M"))o.push("M");
  if(sg.some(x=>x.s==="F"))o.push("F");
  if(!lastCouple(s,me))o.push("C");
  if(p.land>1)o.push("L");
  return o;
}
function potopLose(s,p,x){
  const opts=potopOptions(s,p.id);
  if(!opts.length){log(s,`${p.name} nu are ce pierde la potop.`);return;}
  if(!opts.includes(x))throw E("Nu poți alege asta.");
  if(x==="L"){p.land--;log(s,`${p.name} pierde un Pământ la potop.`);}
  else if(x==="C"){const [a,b]=coupleList(s,p.id).slice(-1)[0];log(s,`${a.n} și ${b.n} (${p.name}) se îneacă.`);removeP(s,a.id,true);removeP(s,b.id,true);}
  else{const v=singles(s,p.id).filter(y=>y.s===x).slice(-1)[0];log(s,`${v.n} (${p.name}) se îneacă.`);removeP(s,v.id,true);}
}
function forceTimes(s){
  const k=s.tcur;
  s.players.forEach(p=>{if(p.ready)return;
    if(k==="foncirea")tAct0(()=>{tAct(s,p.id,"foncirea");});
    else if(k==="potop"){const o=potopOptions(s,p.id);const pick=["L","M","F","C"].find(v=>o.includes(v));if(pick)potopLose(s,p,pick);}
    else if(k==="pasalac"){const c=coupleList(s,p.id);if(c.length>1){const v=c[c.length-1][0].s==="F"?c[c.length-1][0]:c[c.length-1][1];removeP(s,v.id,false);log(s,`${p.name} dă pe ${v.n} Sultanului.`);}}
    p.ready=true;});
}
function tAct0(f){try{f();}catch(e){}}

function allReady(s){return s.players.every(p=>p.ready);}
function tryAdvance(s){
  if(!allReady(s))return;
  if(s.phase==="times"){
    if(s.tcur==="primar")tallyMayor(s);
    enterProd(s);
  }else if(s.phase==="prod")enterAuct(s);
}
function tallyMayor(s){
  const w={};Object.entries(s.ts.votes||{}).forEach(([v,c])=>{w[c]=(w[c]||0)+peas(s,v).length;});
  const m=Math.max(0,...Object.values(w));if(!m){log(s,"Nu s-a ales niciun primar.");return;}
  const win=shuffle(Object.keys(w).filter(c=>w[c]===m))[0];s.mayor=win;
  log(s,`${pname(s,win)} este noul Primar al satului (${m} voturi).`);
}
function enterProd(s){
  s.phase="prod";s.ts={rolled:{}};setDL(s,(s.tm||{}).turn);
  s.players.forEach(p=>{p.ready=productive(s,p.id).length===0;});
  tryAdvance(s);
}
function prodRoll(s,me,key,val){
  if(s.phase!=="prod")throw E("Nu e etapa de Producție.");
  const p=pl(s,me);const u=productive(s,me).find(x=>x.k===+key);
  if(!u)throw E("Unitatea nu are Pământ.");
  if(s.ts.rolled[key])throw E("Ai dat deja cu zarul pentru ei.");
  let r=d6();
  if(val){if(!p.fix)throw E("Nu ai Ai călcat în dânsul.");r=+val;p.fix=false;}
  s.ts.rolled[key]=r;fx(s,"dice");
  const [z,c]=ROLLTAB[r];p.z+=z;
  let kids=[];
  if(c&&u.c&&u.a.s!==u.b.s&&canChild(s,me))kids=birth(s,me,s.fl.twins?2:1);
  const who=u.c?`${u.a.n} și ${u.b.n}`:u.a.n;
  log(s,`${p.name}: ${who} dau ${r} → +${z} Zestre${kids.length?`, se naște ${kids.map(k=>k.n).join(" și ")}`:""}.`);
  if(productive(s,me).every(x=>s.ts.rolled[x.k]))p.ready=true;
  tryAdvance(s);
}
function prodDone(s,me){if(s.phase!=="prod")throw E("Nu e etapa de Producție.");pl(s,me).ready=true;tryAdvance(s);}
function enterAuct(s){
  s.players.forEach(p=>p.ready=false);
  if(s.last||!s.fdeck.length){if(s.last)log(s,"Ultima tură: nu se mai licitează cărți de Soartă.");return enterNeg(s);}
  s.phase="auct";s.auction={card:s.fdeck.shift(),bid:0,by:null,passed:{}};setDL(s,(s.tm||{}).auct);fx(s,"auct");
  log(s,`La licitație: ${FATE[s.auction.card].t}.`);
}
function bid(s,me,amt){
  if(s.phase!=="auct")throw E("Licitația s-a încheiat.");
  const a=s.auction,p=pl(s,me);amt=+amt;
  if(amt<=a.bid)throw E("Trebuie să dai mai mult decât "+a.bid+".");
  if(amt>p.z)throw E("Nu ai atâta Zestre.");
  a.bid=amt;a.by=me;delete a.passed[me];fx(s,"bid");
  log(s,`${p.name} oferă ${amt} Zestre.`);checkAuct(s);
}
function passBid(s,me){if(s.phase!=="auct")throw E("Licitația s-a încheiat.");s.auction.passed[me]=1;checkAuct(s);}
function checkAuct(s){
  const a=s.auction;
  if(!s.players.every(p=>a.passed[p.id]||p.id===a.by))return;
  if(a.by){const w=pl(s,a.by);w.z-=a.bid;w.hand.push(a.card);fx(s,"win");log(s,`${w.name} câștigă ${FATE[a.card].t} cu ${a.bid} Zestre.`);}
  else{s.fdisc.push(a.card);log(s,`Nimeni nu vrea ${FATE[a.card].t}. Cartea se aruncă.`);}
  s.auction=null;enterNeg(s);
}
function forceAuct(s){s.players.forEach(p=>{if(p.id!==s.auction.by)s.auction.passed[p.id]=1;});checkAuct(s);}
function enterNeg(s){s.phase="neg";s.players.forEach(p=>p.ready=false);s.lastW=null;s.props={};
  s.negStart=(s.turn-1)%s.players.length;s.negI=0;setDL(s,(s.tm||{}).wed);fx(s,"neg");fx(s,"turn",negCur(s));
  log(s,`Nunți și negocieri: începe ${pname(s,negCur(s))}.`);}
function advanceNeg(s){
  const cur=negCur(s);delete s.props[cur];s.negI++;
  if(s.negI>=s.players.length)return feedAndNext(s);
  setDL(s,(s.tm||{}).wed);fx(s,"turn",negCur(s));log(s,`Acum e rândul lui ${pname(s,negCur(s))}.`);
}
function endNegTurn(s,me){needNeg(s);if(negCur(s)!==me)throw E("Nu e rândul tău.");advanceNeg(s);}

/* --- negotiation actions --- */
function needNeg(s){if(s.phase!=="neg")throw E("Asta se face doar în etapa de Nunți și negocieri.");}
function buy(s,me,what){
  needNeg(s);const p=pl(s,me);
  if(what==="land"){if(p.land>=5)throw E("Ai deja 5 Pământuri.");if(p.z<4)throw E("Pământul costă 4 Zestre.");p.z-=4;p.land++;log(s,`${p.name} cumpără un Pământ.`);}
  else if(what==="fate"){if(s.last)throw E("În ultima tură nu se mai cumpără Soartă.");if(!s.fdeck.length)throw E("S-au terminat cărțile de Soartă.");if(p.z<2)throw E("O carte de Soartă costă 2 Zestre.");p.z-=2;drawFate(s,p);log(s,`${p.name} cumpără o carte de Soartă.`);}
  else if(what==="adopt"){if(singles(s,me).length>=7)throw E("Ai deja 7 țărani singuri.");if(p.z<2)throw E("Adopția costă 2 Zestre.");const c=drawP(s,me,false);if(!c)throw E("Nu mai sunt țărani la Stat.");p.z-=2;log(s,`${p.name} adoptă pe ${c.n}.`);}
  p.ready=false;fx(s,"coin");
}
function give(s,me,to,kind,x){
  if(!["times","neg"].includes(s.phase))throw E("Daruri și împrumuturi se fac la Vremuri sau la Nunți și negocieri.");
  const p=pl(s,me),t=pl(s,to);if(!t||t.id===me)throw E("Alege alt boier.");
  if(kind==="z"){const n=+x;if(!(n>=1)||n>p.z)throw E("Nu ai atâta Zestre.");p.z-=n;t.z+=n;log(s,`${p.name} îi dă ${n} Zestre lui ${t.name}.`);}
  else{const i=p.hand.indexOf(x);if(i<0)throw E("Nu ai cartea.");p.hand.splice(i,1);t.hand.push(x);log(s,`${p.name} îi dă o carte de Soartă lui ${t.name}.`);}
}
function chance(s,a,b,laut){
  let c=2+(s.fl.sanz?1:0);
  [a,b].forEach(p=>p.r.forEach(r=>{c+=FATE[r].m||0;}));
  c+=(laut||[]).filter(id=>s.P[id]&&hasRole(s.P[id],"lautar")&&+id!==a.id&&+id!==b.id).length;
  return Math.max(0,Math.min(6,c));
}
function pairKey(a,b){return [a,b].sort((x,y)=>x-y).join("-");}
function validPair(s,me,mine,theirs){
  const a=s.P[mine],b=s.P[theirs];
  if(!a||a.o!==me)throw E("Alege un țăran de-al tău.");
  if(!b||b.o===me)throw E("Al doilea țăran trebuie să fie al altui boier.");
  if(!canMarry(a)||!canMarry(b))throw E("Unul dintre ei nu se poate căsători.");
  if(a.s===b.s&&!s.fl.ams)throw E("Doar țărani de sex opus (în afară de Nunți la Amsterdam).");
  return [a,b];
}
function propose(s,me,o){
  needNeg(s);if(negCur(s)!==me)throw E(`Nu e rândul tău. Acum propune ${pname(s,negCur(s))}.`);
  const [a,b]=validPair(s,me,o.mine,o.theirs);const p=pl(s,me);
  if(o.suf&&!p.suf)throw E("Nu ai Suflete pereche activ.");
  s.props[me]={mine:a.id,theirs:b.id,to:b.o,pay:o.pay||"split",laut:o.laut||[],keep:o.keep||"me",suf:!!o.suf,at:Date.now()};
  log(s,`${p.name} propune nunta ${a.n} + ${b.n} lui ${pname(s,b.o)}.`);
}
function cancelProp(s,me){delete s.props[me];}
function declineProp(s,me,from){const pr=s.props[from];if(!pr||pr.to!==me)throw E("Propunerea nu mai există.");delete s.props[from];log(s,`${pname(s,me)} refuză nunta propusă de ${pname(s,from)}.`);}
function acceptProp(s,me,from){
  needNeg(s);const pr=s.props[from];if(!pr||pr.to!==me)throw E("Propunerea nu mai există.");
  const [a,b]=validPair(s,from,pr.mine,pr.theirs);let roll=null,need=null;
  const P1=pl(s,from),P2=pl(s,me);const pk=pairKey(a.id,b.id);
  let cost=2;if(pr.suf)cost=0;else if(s.fl.horaOn&&!s.fl.hora[pk])cost=0;
  if(cost){
    if(pr.pay==="split"){if(P1.z<1||P2.z<1)throw E("Fiecare trebuie să aibă cel puțin 1 Zestre.");P1.z--;P2.z--;}
    else if(pr.pay==="me"){if(P1.z<2)throw E(`${P1.name} nu are 2 Zestre.`);P1.z-=2;}
    else{if(P2.z<2)throw E("Nu ai 2 Zestre.");P2.z-=2;}
  }
  if(s.fl.horaOn)s.fl.hora[pk]=1;
  delete s.props[from];
  let ok,txt;
  if(pr.suf){P1.suf=false;ok=true;txt="Suflete pereche";}
  else if(P1.fix||P2.fix){(P1.fix?P1:P2).fix=false;ok=true;txt="Ai călcat în dânsul";}
  else{const c=chance(s,a,b,pr.laut);const r=d6();ok=r<=c;roll=r;need=c;txt=`zar ${r}, trebuia ${c?"1–"+c:"imposibil"}`;}
  s.wroll={n:(s.wroll?s.wroll.n:0)+1,at:Date.now(),a:a.n,b:b.n,from,to:me,r:roll,need,ok,how:roll?null:txt};
  fx(s,ok?"wedok":"wedfail");
  if(!ok){log(s,`Nunta ${a.n} + ${b.n} n-a ieșit (${txt}).`);return;}
  let groom,bride,recv,giver;
  if(a.s!==b.s){groom=a.s==="M"?a:b;bride=a.s==="M"?b:a;giver=bride.o;recv=groom.o;}
  else{const keepFrom=pr.keep==="me";groom=keepFrom?a:b;bride=keepFrom?b:a;giver=bride.o;recv=groom.o;}
  bride.o=recv;bride.sp=groom.id;groom.sp=bride.id;
  const g=pl(s,giver);const fc=drawFate(s,g);
  if(s.mayor&&pl(s,s.mayor))pl(s,s.mayor).z+=1;
  s.lastW={n:Date.now(),bride:bride.id,groom:groom.id,recv,giver};
  log(s,`Nuntă! ${groom.n} și ${bride.n} (${txt}). Cuplul rămâne la ${pname(s,recv)}${fc?`, ${g.name} trage o carte de Soartă`:""}.`);
  P1.ready=false;P2.ready=false;
}
function readyNeg(s,me){endNegTurn(s,me);}

/* --- fate cards --- */
function roleTargets(s,key){
  const c=FATE[key];return Object.values(s.P).filter(p=>(!c.sex||p.s===c.sex)&&!hasRole(p,key)&&(!c.single||(!p.sp)));
}
function playFate(s,me,key,x){
  const p=pl(s,me);const i=p.hand.indexOf(key);if(i<0)throw E("Nu ai cartea asta.");
  const c=FATE[key];x=x||{};
  if(!c.any&&s.phase!=="neg")throw E("Cărțile de Soartă se joacă la Nunți și negocieri.");
  const used=()=>{p.hand.splice(p.hand.indexOf(key),1);s.fdisc.push(key);fx(s,"card");};
  const T=id=>{const t=pl(s,id);if(!t)throw E("Alege un boier.");return t;};
  const PS=id=>{const t=s.P[id];if(!t)throw E("Alege un țăran.");return t;};
  if(c.role){
    const t=PS(x.p);if(!roleTargets(s,key).includes(t))throw E("Rolul nu se poate pune pe acest țăran.");
    t.r.push(key);used();log(s,`${p.name} joacă ${c.t} pe ${t.n} (${pname(s,t.o)}).`);return;
  }
  switch(key){
    case"lac":{const rich=s.players.filter(q=>q.z>=1);if(!rich.length)throw E("Nimeni nu are Zestre.");
      const m=Math.min(...rich.map(q=>q.z));rich.filter(q=>q.z===m).forEach(q=>{q.z-=Math.min(2,q.z);log(s,`${q.name} pierde 2 Zestre (Din lac în puț).`);});break;}
    case"sfadit":{const a=PS(x.p);if(!a.sp)throw E("Alege un țăran căsătorit.");if(lastCouple(s,a.o))throw E("Ultimul Cuplu nu se poate despărți.");
      const b=s.P[a.sp];a.sp=null;b.sp=null;log(s,`${a.n} și ${b.n} (${pname(s,a.o)}) s-au despărțit.`);break;}
    case"capra":nbrs(s,me).forEach(n=>{const l=Math.min(4,n.z);n.z-=l;log(s,`${n.name} plătește ${l} Zestre la Stat (Să moară capra vecinului).`);});break;
    case"calcat":if(p.fix)throw E("Ai deja efectul activ.");p.fix=true;log(s,`${p.name} a călcat în ceva norocos.`);break;
    case"fura":{const w=s.lastW;if(!w)throw E("Se joacă imediat după o nuntă reușită.");
      const br=s.P[w.bride],gr=s.P[w.groom];if(!br||!gr||br.sp!==gr.id)throw E("Cuplul nu mai există.");
      if(br.s!=="F")throw E("Merge doar la o nuntă cu mireasă.");
      const f=PS(x.p);if(f.o!==me||f.s!=="M"||!canMarry(f))throw E("Alege un Fecior singur de-al tău.");
      gr.sp=null;br.sp=f.id;f.sp=br.id;br.o=me;s.lastW=null;log(s,`${p.name} fură mireasa! ${br.n} se mărită cu ${f.n}.`);break;}
    case"coasa":{const t=T(x.b);if(t.id===me)throw E("Alege alt boier.");const l=Math.min(3,t.z);t.z-=l;p.z+=l;log(s,`${t.name} îi plătește ${l} Zestre lui ${p.name} (La coasă pă arătură).`);break;}
    case"luceafar":{const t=T(x.b);if(singles(s,t.id).length>=7)throw E("Boierul are deja 7 țărani singuri.");const ch=drawP(s,t.id,false);if(!ch)throw E("Nu mai sunt țărani.");log(s,`${t.name} primește un copil din flori: ${ch.n}.`);break;}
    case"suflete":if(p.suf)throw E("Ai deja efectul activ.");p.suf=true;log(s,`${p.name} își găsește sufletul pereche pentru următoarea nuntă.`);break;
    case"amsterdam":s.fl.ams=1;log(s,"Nunți la Amsterdam: tura asta oricine se poate căsători cu oricine.");break;
    case"tuica":p.z+=2*p.land;log(s,`${p.name} face țuică: +${2*p.land} Zestre.`);break;
    case"schimb":{const a=PS(x.p),b=PS(x.q);if(a===b||a.s!=="F"||b.s!=="F")throw E("Alege două Mândre sau Neveste diferite.");
      const sa=a.sp,sb=b.sp,oa=a.o,ob=b.o;a.sp=sb;a.o=ob;b.sp=sa;b.o=oa;if(sb)s.P[sb].sp=a.id;if(sa)s.P[sa].sp=b.id;
      log(s,`Schimb de mame: ${a.n} și ${b.n} își schimbă locurile.`);break;}
    case"hora":s.fl.horaOn=1;log(s,`${p.name} organizează Hora mare: prima încercare de nuntă a fiecărei perechi e gratis.`);break;
    case"bataie":s.fl.bataie[me]=1;log(s,`Țăranii singuri ai lui ${p.name} nu mănâncă tura asta.`);break;
    case"vinvremuri":if(x.c==="scurt"){if(!s.tdeck.length)throw E("Nu mai sunt Vremuri de scos.");s.tunused.push(s.tdeck.pop());s.total--;log(s,`${p.name} scurtează jocul cu o tură.`);}
      else{if(!s.tunused.length)throw E("Nu mai sunt Vremuri nefolosite.");shuffle(s.tunused);s.tdeck.push(s.tunused.pop());s.total++;s.last=false;log(s,`${p.name} lungește jocul cu o tură.`);}
      break;
    case"tir":{const n=singles(s,me).filter(q=>q.s==="M").length;p.z+=2*n;log(s,`${p.name}: Cu TIR-ul pă Italia, +${2*n} Zestre.`);break;}
    case"murat":{const n=singles(s,me).filter(q=>q.s==="F").length;p.z+=2*n;log(s,`${p.name}: Afacere cu murături, +${2*n} Zestre.`);break;}
    case"descantec":{const k=Math.min(3,s.tdeck.length);const ord=(x.o||[]).map(Number);
      if(ord.length!==k||new Set(ord).size!==k||ord.some(v=>v<0||v>=k))throw E("Alege ordinea tuturor cărților.");
      const top=s.tdeck.slice(0,k);s.tdeck.splice(0,k,...ord.map(v=>top[v]));log(s,`${p.name} a descântat următoarele Vremuri.`);break;}
    case"piatra":{const w=s.lastW;if(!w)throw E("Se joacă imediat după o nuntă reușită.");if(w.recv!==me&&w.giver!==me)throw E("Doar după o nuntă la care ai participat.");
      const other=w.recv===me?w.giver:w.recv;s.players.forEach(q=>{if(q.id!==me&&q.id!==other){const l=Math.min(2,q.z);q.z-=l;p.z+=l;}});
      s.lastW=null;log(s,`Casă de piatră! Boierii îl felicită pe ${p.name} cu câte 2 Zestre.`);break;}
    case"afara":{const t=PS(x.p),b=T(x.b);if(t.o!==me||t.sp)throw E("Alege un țăran singur de-al tău.");if(b.id===me)throw E("Alege alt boier.");
      t.o=b.id;log(s,`${p.name} îl dă afară pe ${t.n}, care pleacă la ${b.name}.`);break;}
    case"dulau":case"birt":{const t=PS(x.p);if(t.s!=="M"||!t.sp)throw E("Alege un Bărbat însurat.");if(lastCouple(s,t.o))throw E("Ultimul Cuplu nu se poate destrăma.");
      log(s,`${t.n} (${pname(s,t.o)}) a fost eliminat (${c.t}).`);removeP(s,t.id,true);break;}
    case"matrapaz":{const t=T(x.b);if(t.id===me||t.land<=1)throw E("Alege un boier cu mai mult de un Pământ.");if(p.land>=5)throw E("Ai deja 5 Pământuri.");
      t.land--;p.land++;log(s,`${p.name} mută gardul și ia un Pământ de la ${t.name}.`);break;}
    case"sexch":{const t=PS(x.p);const ns=t.s==="M"?"F":"M";const i2=s.pdeck.findIndex(q=>q[1]===ns);
      const old=t.n;if(i2>=0){const [nm]=s.pdeck.splice(i2,1)[0];s.pdeck.push([t.n,t.s]);t.n=nm;}t.s=ns;
      log(s,`${old} își schimbă sexul și devine ${t.n}.`);break;}
    default:throw E("Carte necunoscută.");
  }
  used();
}

/* --- feeding, end --- */
function feedAndNext(s){
  s.phase="feed";
  s.players.forEach(p=>{
    const cs=coupleList(s,p.id);const sg=singles(s,p.id).filter(x=>!x.nb&&!s.fl.bataie[p.id]);
    const units=cs.length+sg.length;let hungry=Math.max(0,units-p.land);
    const pay=Math.min(p.z,hungry);p.z-=pay;hungry-=pay;
    const ll=Math.min(hungry,p.land-1);p.land-=ll;hungry-=ll;
    const msg=[`${p.name} hrănește ${units} guri`];if(pay)msg.push(`plătește ${pay} Zestre`);if(ll)msg.push(`pierde ${ll} Pământ`);
    const dead=[];
    const victims=[...sg].sort((a,b)=>a.r.length-b.r.length);
    while(hungry>0&&victims.length){const v=victims.shift();dead.push(v.n);removeP(s,v.id,true);hungry--;}
    while(hungry>0&&!lastCouple(s,p.id)){const [a,b]=coupleList(s,p.id).slice(-1)[0];dead.push(`${a.n} și ${b.n}`);removeP(s,a.id,true);removeP(s,b.id,true);hungry--;}
    if(dead.length)msg.push(`mor de foame: ${dead.join(", ")}`);
    log(s,msg.join(", ")+".");
  });
  Object.values(s.P).forEach(p=>p.nb=false);
  nextTurn(s);
}
function score(s){
  const cc=s.players.map(p=>coupleList(s,p.id).length);const mx=Math.max(...cc);
  const uniq=cc.filter(c=>c===mx).length===1&&mx>0;
  return s.players.map((p,i)=>{const bonus=uniq&&cc[i]===mx?5:0;
    return {id:p.id,name:p.name,z:p.z,land:p.land,couples:cc[i],bonus,total:p.z+p.land+bonus,peas:peas(s,p.id).length};
  }).sort((a,b)=>b.total-a.total||b.peas-a.peas);
}
function endGame(s){s.status="ended";s.phase="ended";s.dl=null;fx(s,"win");s.results=score(s);log(s,`Vremurile Grele au trecut. Câștigă ${s.results[0].name} cu ${s.results[0].total} Zestre!`);}
function force(s){
  if(s.phase==="times"){forceTimes(s);tryAdvance(s);}
  else if(s.phase==="prod"){
    for(const p of s.players){if(p.ready)continue;
      for(const u of productive(s,p.id)){if(s.phase!=="prod")break;if(!s.ts.rolled[u.k]){try{p.fix=false;prodRoll(s,p.id,u.k);}catch(e){}}}
      if(s.phase!=="prod")return true;p.ready=true;}
    tryAdvance(s);}
  else if(s.phase==="auct")forceAuct(s);
  else if(s.phase==="neg")advanceNeg(s);
  return true;
}
function timeout(s){if(s.status!=="play"||!s.dl||Date.now()<s.dl)return false;return force(s);}
if(typeof module!=="undefined")module.exports={timeout,endNegTurn,negCur,newGame,startGame,tAct,prodRoll,prodDone,bid,passBid,buy,give,propose,acceptProp,declineProp,cancelProp,readyNeg,playFate,force,productive,potopOptions,roleTargets,coupleList,singles,peas,canMarry,FATE,TIMES,score};
