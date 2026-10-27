// Parse chat messages with or without Twitch IRCv3 tags. Identity is the login,
// never display-name: capitalization must not create a second player.
export function parseIRC(line){
 const match=line.match(/^(?:@([^ ]+) )?:([^! ]+)![^ ]+ PRIVMSG #([^ ]+) :(.*)$/);
 if(!match)return null;
 const tags=Object.fromEntries((match[1]||'').split(';').filter(Boolean).map(t=>{const i=t.indexOf('=');return i<0?[t,'']:[t.slice(0,i),t.slice(i+1)];}));
 return {id:tags.id||null,user:match[2].toLowerCase(),channel:match[3].toLowerCase(),message:match[4]};
}
export function createDeduplicator(limit=2000){
 const seen=new Set();return id=>{if(!id)return true;if(seen.has(id))return false;seen.add(id);if(seen.size>limit)seen.delete(seen.values().next().value);return true;};
}
