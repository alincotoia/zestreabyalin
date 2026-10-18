const G=require('./engine.js');
const pick=a=>a[Math.floor(Math.random()*a.length)];
function tryDo(f){try{f();return true}catch(e){if(!e.user)throw e;return false}}
let games=0,turnsTot=0;
for(let g=0;g<300;g++){
 const n=2+Math.floor(Math.random()*5);
 const s=G.newGame('ABCD','p0','A',5+Math.floor(Math.random()*3));
 for(let i=1;i<n;i++)s.players.push({id:'p'+i,name:'B'+i,z:0,land:3,hand:[],ready:false,fix:false,suf:false});
 G.startGame(s);
 let steps=0;
 while(s.status==='play'&&steps<4000){
  steps++;
  let p=pick(s.players),me=p.id;if(s.phase==='neg'&&Math.random()<.5){me=G.negCur(s);p=s.players.find(q=>q.id===me);}
  const r=Math.random();
  if(r<0.02){G.force(s);continue;} if(r<0.04){s.dl=Date.now()-1;G.timeout(s);continue;}
  if(s.phase==='times'){
   const k=s.tcur;
   const o=pick(s.players.filter(q=>q.id!==me))||p;
   tryDo(()=>{
    if(k==='colinda')G.tAct(s,me,'colinda',o.id);
    else if(k==='foncirea')G.tAct(s,me,'foncirea');
    else if(k==='potop'){const op=G.potopOptions(s,me);G.tAct(s,me,'potop',op.length?pick(op):'L')}
    else if(k==='primar')G.tAct(s,me,'vote',pick(s.players).id);
    else if(k==='pasalac')G.tAct(s,me,'pasalac',pick(['F','M']));
    else if(k==='zilele'&&Math.random()<.3)G.tAct(s,me,'zilele',1);
    else G.tAct(s,me,'ready');
   });
   if(Math.random()<.1)tryDo(()=>G.give(s,me,o.id,'z',1));
  }else if(s.phase==='prod'){
   const u=G.productive(s,me);const nr=u.filter(x=>!s.ts.rolled[x.k]);
   if(nr.length&&Math.random()<.9)tryDo(()=>G.prodRoll(s,me,nr[0].k,p.fix?3:undefined));else tryDo(()=>G.prodDone(s,me));
  }else if(s.phase==='auct'){
   if(Math.random()<.4)tryDo(()=>G.bid(s,me,s.auction.bid+1));else tryDo(()=>G.passBid(s,me));
  }else if(s.phase==='neg'){
   const a=Math.random();
   if(a<.15)tryDo(()=>G.buy(s,me,pick(['land','fate','adopt'])));
   else if(a<.4){
     const mine=G.singles(s,me).filter(G.canMarry);const others=Object.values(s.P).filter(q=>q.o!==me&&G.canMarry(q));
     if(mine.length&&others.length)tryDo(()=>G.propose(s,me,{mine:pick(mine).id,theirs:pick(others).id,pay:pick(['split','me','them']),laut:[],suf:p.suf&&Math.random()<.5}));
   }else if(a<.55){
     const fr=Object.keys(s.props).find(f=>s.props[f].to===me);
     if(fr)tryDo(()=>Math.random()<.8?G.acceptProp(s,me,fr):G.declineProp(s,me,fr));
   }else if(a<.75&&p.hand.length){
     const key=pick(p.hand);const c=G.FATE[key];
     const anyP=pick(Object.values(s.P));const o=pick(s.players);
     const x={p:anyP&&anyP.id,b:o.id,q:pick(Object.values(s.P)).id,c:pick(['scurt','lung']),o:[0,1,2].slice(0,Math.min(3,s.tdeck.length)).sort(()=>Math.random()-.5)};
     if(c.role){const t=G.roleTargets(s,key);if(t.length)x.p=pick(t).id;}
     if(key==='fura'){const f=G.singles(s,me).filter(q=>q.s==='M'&&G.canMarry(q));if(f.length)x.p=f[0].id;}
     tryDo(()=>G.playFate(s,me,key,x));
   }else tryDo(()=>G.readyNeg(s,me,true));
  }
  // invariants
  for(const q of s.players){ if(q.z<0||q.land<1||q.land>5) throw new Error('bad player '+JSON.stringify(q)+' '+s.phase+' '+s.tcur);
   if(G.coupleList(s,q.id).length<1) throw new Error('lost last couple '+q.id+' '+s.tcur);}
  for(const pp of Object.values(s.P)){ if(pp.sp){const o=s.P[pp.sp]; if(!o||o.sp!==pp.id||o.o!==pp.o) throw new Error('bad spouse '+JSON.stringify(pp));}}
 }
 if(s.status!=='ended')throw new Error('stuck '+s.phase+' '+s.tcur+' steps '+steps);
 games++;turnsTot+=s.turn;
 if(JSON.stringify(s).length>200000)throw new Error('big');
}
console.log('ok',games,'avg turns',turnsTot/games);
