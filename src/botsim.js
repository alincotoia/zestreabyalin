const G=require('./engine.js');
let games=0,stuck=0,turns=0,weds=0,wins={bot:0};
for(let g=0;g<200;g++){
  const s=G.newGame('ABCD','h','Host',5+(g%3));
  s.players[0].bot=true;
  const n=2+Math.floor(Math.random()*5);for(let i=0;i<n-1;i++)G.addBot(s);
  G.startGame(s);let steps=0;
  while(s.status==='play'&&steps<5000){steps++;if(!G.botTick(s)){G.force(s);}}
  if(s.status!=='ended'){stuck++;console.log('stuck',s.phase,s.tcur,G.botsPending(s));break;}
  games++;turns+=s.turn;weds+=s.log.filter(l=>l[1].startsWith('Nuntă!')).length;
  for(const q of s.players){if(q.z<0||q.land<1||q.land>5)throw new Error('bad');}
}
console.log({games,stuck,avgTurns:turns/games,wedsPerGame:weds/games});
