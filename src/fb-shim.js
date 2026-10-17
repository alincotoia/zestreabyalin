/* Firebase adapter: exposes the same small db API the game uses (doc/collection/onSnapshot/acquire) */
(function(){
  const cfg=window.ZESTREA_FIREBASE;
  let ready=null;
  function init(){
    if(ready)return ready;
    ready=(async()=>{
      if(!cfg||!cfg.apiKey||cfg.apiKey==="PUNE_AICI"){window.ZESTREA_ERR="config-lipsa";return null;}
      if(!window.firebase||!firebase.firestore||!firebase.auth){window.ZESTREA_ERR="firebase-sdk-nu-s-a-incarcat";return null;}
      try{firebase.initializeApp(cfg);}catch(e){}
      try{await firebase.auth().signInAnonymously();}catch(e){console.error(e);window.ZESTREA_ERR=(e&&e.code)||String(e&&e.message||e);return null;}
      const fs=firebase.firestore();
      try{fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch(e){}
      return fs;
    })();
    return ready;
  }
  // Firestore can't store nested arrays, so game state travels as a JSON string next to a few summary fields.
  const isGame=p=>/^games\/[^/]+$/.test(p);
  function enc(path,d){
    if(!isGame(path))return d;
    return {code:d.code,status:d.status,created:d.created,turn:d.turn||0,total:d.total||0,
      players:(d.players||[]).map(p=>({id:p.id,name:p.name})),s:JSON.stringify(d)};
  }
  function dec(d){if(d&&typeof d.s==="string"){try{return JSON.parse(d.s);}catch(e){}}return d;}
  const err=e=>{const x=new Error(e&&e.message||"eroare");x.code=e&&e.code==="permission-denied"?"denied":"unavailable";return x;};
  function wrapSnap(sn){return{id:sn.id,exists:sn.exists,data:()=>sn.exists?dec(sn.data()):undefined};}
  function makeDB(fs){
    function doc(path){
      const ref=fs.doc(path);
      return{path,id:ref.id,
        async get(){try{return wrapSnap(await ref.get());}catch(e){throw err(e);}},
        async set(d){try{await ref.set(enc(path,d));}catch(e){throw err(e);}},
        async delete(){await ref.delete();},
        async acquire({holder,ttlMs}){
          ttlMs=ttlMs||30000;
          try{return await fs.runTransaction(async tx=>{
            const s=await tx.get(ref);const now=Date.now();const d=s.exists?s.data():null;
            if(d&&d.exp>now&&d.holder!==holder)return{acquired:false};
            tx.set(ref,{holder,exp:now+ttlMs});return{acquired:true};
          });}catch(e){return{acquired:false};}
        },
        onSnapshot(next,error){return ref.onSnapshot(sn=>next(wrapSnap(sn)),e=>error&&error(err(e)));},
        collection(sub){return coll(path+"/"+sub);}
      };
    }
    function coll(path,q){
      q=q||fs.collection(path);
      const o={path,
        where:(f,op,v)=>coll(path,q.where(f,op,v)),
        orderBy:(f,d)=>coll(path,q.orderBy(f,d||"asc")),
        limit:n=>coll(path,q.limit(n)),
        doc:id=>doc(path+"/"+(id||fs.collection(path).doc().id)),
        async add(d){const r=fs.collection(path).doc();await r.set(d);return doc(path+"/"+r.id);},
        async get(){const s=await q.get();return{docs:s.docs.map(wrapSnap),size:s.size,empty:s.empty};},
        onSnapshot(next,error){return q.onSnapshot(s=>next({docs:s.docs.map(wrapSnap),size:s.size,empty:s.empty}),e=>error&&error(err(e)));}
      };
      return o;
    }
    return{doc,collection:p=>coll(p)};
  }
  window.claude={use:async name=>{
    if(name!=="db")return null;
    const fs=await init();return fs?makeDB(fs):null;
  }};
})();
