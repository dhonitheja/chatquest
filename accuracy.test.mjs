import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply} from './dist/engine.js';
import {parseIRC,createDeduplicator} from './dist/twitch.js';
test('capitalization and whitespace cannot duplicate heroes or votes',()=>{
 const s=fresh();apply(s,{type:'chat',user:'Hero',message:'!JOIN   SUN'});apply(s,{type:'chat',user:'HERO',message:'!join moon'});
 assert.equal(Object.keys(s.players).length,1);assert.equal(s.players.hero.team,'sun');
 apply(s,{type:'next'});apply(s,{type:'start'});apply(s,{type:'chat',user:'hErO',message:'!vote   forest'});assert.equal(s.votes.hero,'forest');
});
test('late joins count toward boss health when encounter starts',()=>{
 const s=fresh();apply(s,{type:'next'});apply(s,{type:'next'});
 for(let i=0;i<5;i++)apply(s,{type:'chat',user:'hero'+i,message:'!join'});
 apply(s,{type:'start'});assert.equal(s.maxHp,150);assert.equal(s.hp,150);
 apply(s,{type:'pause'});apply(s,{type:'start'});assert.equal(s.hp,150);
});
test('elapsed ticks catch up after a delayed callback and stop at zero',()=>{
 const s=fresh();apply(s,{type:'start'});apply(s,{type:'tick',seconds:12.5});assert.equal(s.left,47.5);
 apply(s,{type:'pause'});apply(s,{type:'tick',seconds:20});assert.equal(s.left,47.5);
 apply(s,{type:'start'});apply(s,{type:'tick',seconds:70});assert.equal(s.left,0);assert.equal(s.result,'timeout');
});
test('empty votes are described as a default, not a community decision',()=>{
 const s=fresh();apply(s,{type:'next'});apply(s,{type:'start'});apply(s,{type:'finishVote'});assert.match(s.outcome,/No votes cast/);assert.equal(s.route,'bridge');
});
test('Twitch parser accepts tags and keeps login distinct from display name',()=>{
 const m=parseIRC('@display-name=FANCY;id=message-42 :Hero!hero@hero.tmi.twitch.tv PRIVMSG #Channel :!attack');
 assert.deepEqual(m,{id:'message-42',user:'hero',channel:'channel',message:'!attack'});
 assert.equal(parseIRC('PING :tmi.twitch.tv'),null);
 assert.equal(parseIRC(':hero!hero@host PRIVMSG #channel :!grow').id,null);
});
test('duplicate Twitch deliveries are rejected with bounded memory',()=>{
 const accept=createDeduplicator(2);assert.equal(accept('one'),true);assert.equal(accept('one'),false);assert.equal(accept('two'),true);assert.equal(accept('three'),true);assert.equal(accept('one'),true);assert.equal(accept(null),true);
});
