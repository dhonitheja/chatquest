export const encounters = [
 {name:'The Whispering Gate',kind:'RIDDLE',description:'I speak without a mouth and hear without ears. What am I?',command:'!solve your-answer',icon:'◈'},
 {name:'Choose your destiny',kind:'COMMUNITY VOTE',description:'Bridge: powerful strikes, less time. Forest: lighter strikes, a chance to grow more time. Your vote changes the battle.',command:'!vote bridge or !vote forest',icon:'⌘'},
 {name:'The Ember Wyrm',kind:'BOSS BATTLE',description:'Unite your guilds and strike before the clock runs out!',command:'!attack',icon:'♜'}
];
export const routes = {
 bridge:{name:'Crystal bridge',duration:45,damage:15,power:'!charge',description:'45 seconds. 15 damage per strike. Each hero can !charge once for a 25-damage bonus on their next strike.'},
 forest:{name:'Shadow forest',duration:75,damage:8,power:'!grow',description:'75 seconds. 8 damage per strike. Each hero can !grow once to restore 5 seconds, up to 100 seconds remaining.'}
};
export function fresh(){return {phase:0,running:false,started:false,left:60,hp:100,maxHp:100,players:{},votes:{},log:[],outcome:'',result:'',route:null,baseScores:{},damage:10};}
function put(object,key,value){Object.defineProperty(object,key,{value,enumerable:true,writable:true,configurable:true});}
function chooseRoute(s){const votes=Object.values(s.votes);s.route=votes.filter(v=>v==='forest').length>votes.filter(v=>v==='bridge').length?'forest':'bridge';s.running=false;s.result='complete';s.outcome=votes.length?'Route chosen: '+routes[s.route].name+(votes.filter(v=>v==='forest').length===votes.filter(v=>v==='bridge').length?' (tie: bridge wins)':''):'No votes cast. Default route: Crystal bridge';}
function prepare(s){if(s.phase===1)s.route=null;s.running=false;s.started=false;s.result='';s.outcome='';s.left=s.phase===2?routes[s.route||'bridge'].duration:60;if(s.phase===2){s.route ||= 'bridge';s.damage=routes[s.route].damage;s.maxHp=Math.min(600,Math.max(80,Object.keys(s.players).length*30));s.hp=s.maxHp;}for(const p of Object.values(s.players)){p.last=null;p.powerUsed=false;p.charged=false;}}
export function apply(s,a,now=Date.now()){
 if(a.type==='reset')return fresh();
 if(a.type==='start'&&!s.running&&!s.result&&s.left>0){if(!s.started){if(s.phase===2){s.maxHp=Math.min(600,Math.max(80,Object.keys(s.players).length*30));s.hp=s.maxHp;}s.baseScores={};for(const [name,p] of Object.entries(s.players))put(s.baseScores,name,p.score);s.started=true;}s.running=true;}
 if(a.type==='pause')s.running=false;
 if(a.type==='finishVote'&&s.phase===1&&s.started&&!s.result)chooseRoute(s);
 if(a.type==='retry'&&(s.started||s.result)){for(const [name,p] of Object.entries(s.players))p.score=Object.hasOwn(s.baseScores,name)?s.baseScores[name]:0;s.votes={};prepare(s);}
 if(a.type==='next'&&s.phase<2){if(s.phase===1&&!s.route)chooseRoute(s);s.phase++;s.votes={};prepare(s);s.baseScores={};for(const [name,p] of Object.entries(s.players))put(s.baseScores,name,p.score);}
 if(a.type==='tick'&&s.running){s.left=Math.max(0,s.left-(Number.isFinite(a.seconds)?Math.max(0,Math.min(3600,a.seconds)):1));if(!s.left){if(s.phase===1)chooseRoute(s);else{s.running=false;s.result='timeout';s.outcome='The encounter ended. Retry this chapter with your party.';}}}
 if(a.type!=='chat')return s;
 const user=(String(a.user||'Viewer').trim().slice(0,32)||'Viewer').toLowerCase(),msg=String(a.message||'').trim().toLowerCase().replace(/\s+/g,' ').slice(0,200);
 if(!/^!(join(?:\s+(?:sun|moon))?|solve\s+.+|vote\s+(?:bridge|forest)|attack|charge|grow)$/.test(msg))return s;
 if(/^!join(?:\s|$)/.test(msg)&&!Object.hasOwn(s.players,user)){const team=msg.split(/\s+/)[1];put(s.players,user,{team:team==='moon'?'moon':team==='sun'?'sun':Object.keys(s.players).length%2?'moon':'sun',score:0,last:null,powerUsed:false,charged:false});}
 const p=Object.hasOwn(s.players,user)?s.players[user]:null;
 if(p&&s.running){
  if(s.phase===0&&msg==='!solve echo'){p.score+=50;s.running=false;s.result='complete';s.outcome=user+' opened the gate!';}
  if(s.phase===1&&/^!vote (bridge|forest)$/.test(msg))put(s.votes,user,msg.split(' ')[1]);
  if(s.phase===2){
   if(s.route==='bridge'&&msg==='!charge'&&!p.powerUsed){p.powerUsed=true;p.charged=true;}
   if(s.route==='forest'&&msg==='!grow'&&!p.powerUsed&&s.left<100){p.powerUsed=true;const restored=Math.min(5,100-s.left);s.left+=restored;p.score+=restored;}
   if(msg==='!attack'&&(p.last===null||now-p.last>=2000)){p.last=now;const damage=Math.min(s.hp,s.damage+(p.charged?25:0));p.charged=false;p.score+=damage;s.hp-=damage;if(!s.hp){s.running=false;s.result='victory';s.outcome='Victory! The Ember Wyrm is defeated.';}}
  }
 }
 s.log.unshift({user,message:msg});s.log=s.log.slice(0,30);return s;
}
