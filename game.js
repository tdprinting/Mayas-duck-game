'use strict';
const $=id=>document.getElementById(id);
const STAGES=[
 {title:'The Feather Trail',sub:'Big bounces. Little wings.',art:'feather',tag:'MUSHROOM WOODS',goal:'Run right, jump the gaps and bounce on the giant mushrooms. Reach the woodland gate!',hint:'Tap JUMP again in the air to flap. QUACK knocks rolling acorns away.',length:3900,exit:3740,ground:[[0,650],[770,1280],[1400,1990],[2120,2670],[2810,3900]],ledges:[[330,380,160],[620,290,150],[1000,360,170],[1600,350,180],[1860,255,130],[2400,370,180],[3060,360,170],[3370,280,160]],mushrooms:[510,1710,2930],flags:[1020,2220,3180],foes:[[1120,940,1240],[1550,1440,1770],[2500,2180,2620],[3280,3140,3510]]},
 {title:'Voices in the Fog',sub:'Jump toward the little lights.',art:'lantern',tag:'THE FOGGY HOLLOW',goal:'Quack beside all three echo lanterns, then jump your way to the missing king.',hint:'Your quack lights nearby lanterns and makes the king answer. Lanterns are checkpoints too.',length:4100,exit:3930,ground:[[0,680],[810,1430],[1560,2180],[2310,2890],[3020,4100]],ledges:[[360,370,160],[1020,355,180],[1370,280,150],[1810,350,180],[2500,340,160],[2800,255,150],[3290,350,180]],mushrooms:[1190,2610],flags:[],foes:[[1250,900,1390],[1970,1640,2120],[3300,3080,3530]],lanterns:[950,1810,3230]},
 {title:'The River Home',sub:'Mind the wobbly logs!',art:'castle',tag:'THE MORNING RIVER',goal:'Hop across the moving logs and collect three royal keys to open the castle. Pebble will bring the king!',hint:'Wait for a log, then jump. You move along with it when you land. A second flap helps with long gaps.',length:4100,exit:3930,ground:[[0,650],[1150,1730],[2120,2720],[3140,4100]],ledges:[[330,370,150],[1300,350,180],[2330,350,180],[3370,350,180]],logs:[[800,430,210,80,1],[1810,420,210,65,1.2],[2840,430,220,75,.9]],mushrooms:[450,2440],flags:[1270,2270,3340],foes:[[1510,1210,1680],[2540,2190,2660]],keys:[[1390,300],[2400,300],[3460,300]]},
 {title:'The Stolen Throne',sub:'A very bouncy royal showdown.',art:'crown',tag:'THE ROYAL COURTYARD',goal:'Dodge the rolling acorns. Stomp the crown thief, or quack close to him when he lands. Three hits win the crown!',hint:'In two-player mode, quack together for a royal blast. A stomp works too! Look for the gold glow when he lands.',length:2350,exit:2200,ground:[[0,2350]],ledges:[[300,370,170],[620,290,180],[1060,370,170],[1440,290,180],[1830,370,170]],mushrooms:[460,1190],flags:[920],foes:[[730,550,860]]}
];
let bookBonusCompleted=false,resumePhase='playing';
let lifetimeFeathers=0,selectedOutfits=['explorer','explorer'];
let mode=1,level=0,phase='home',unlocked=0,finished=false,secretsFound=[false,false,false,false];
try{const s=JSON.parse(localStorage.getItem('maya-crown-fog')||'null');if(s?.v===1){mode=s.mode===2?2:1;unlocked=Math.max(0,Math.min(3,s.unlocked||0));finished=!!s.finished;bookBonusCompleted=!!s.bookBonusCompleted;lifetimeFeathers=Math.max(0,s.feathers||0);if(Array.isArray(s.outfits))selectedOutfits=selectedOutfits.map((_,i)=>s.outfits[i]||'explorer');secretsFound=secretsFound.map((_,i)=>!!s.secrets?.[i]);}}catch{}
let players=[],helper=null,king=null,platforms=[],mushrooms=[],pickups=[],lanterns=[],royalKeys=[],flags=[],enemies=[],particles=[],effects=[],hazards=[],boss=null,secret=null;
let W=1000,H=580,V_H=580,camY=0,cam=0,clock=0,checkpoint=130,collected=0,toastTime=0,kingCall=0,finishWait=0,shake=0,lastTime=0,accumulator=0,buddyWait=0,boostToast=0;
const canvas=$('world'),ctx=canvas.getContext('2d'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sprite={};for(const name of ['player1','player2','helper','king','king-lost','usurper',...['rain','firefly','woodland','royal'].flatMap(o=>['player1-'+o,'player2-'+o]),'feather','lantern','crown','castle']){const im=new Image();im.src=`assets/${name}.svg`;sprite[name]=im;}
const backgrounds={};for(const n of ['platform-forest','platform-castle']){const im=new Image();im.src=`assets/${n}.webp`;backgrounds[n]=im;}
const input=[{x:0,y:0,id:null,jump:false},{x:0,y:0,id:null,jump:false}],keys=new Set();
let gamepads=[],lastPadCount=-1,padPrevious=new Map(),muted=false,audio=null,modalCloseable=false,previousFocus=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const activeCount=()=>mode===1?1:2;
function writeSave(){try{localStorage.setItem('maya-crown-fog',JSON.stringify({v:1,mode,unlocked,finished,secrets:secretsFound,feathers:lifetimeFeathers,outfits:selectedOutfits,bookBonusCompleted}));}catch{}}
function setMode(n){mode=n;document.body.classList.toggle('solo',n===1);for(const i of [1,2]){$('mode'+i).classList.toggle('selected',i===n);$('mode'+i).setAttribute('aria-pressed',String(i===n));}writeSave();}
$('mode1').onclick=()=>setMode(1);$('mode2').onclick=()=>setMode(2);setMode(mode);
function makeLevels(){$('chapters').innerHTML=STAGES.map((c,i)=>`<button class="chapter-card" data-level="${i}" ${i>unlocked?'disabled':''}><img src="assets/${c.art}.svg" alt=""><small>LEVEL 0${i+1}${i>unlocked?' · LOCKED':''}</small><h3>${c.title}</h3><p>${c.sub}</p></button>`).join('');document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>enterLevel(Number(b.dataset.level)));$('continue').classList.toggle('hidden',unlocked===0&&!finished);$('continue').textContent=finished?'Play the final showdown again →':`Continue level ${unlocked+1} →`;}
makeLevels();
function sound(kind='quack'){
 if(muted)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();const base=kind==='land'?105:kind==='jump'?340:kind==='bounce'?220:kind==='quack'?260:650;const duration=kind==='land'?.13:.23;o.type=kind==='quack'?'triangle':'sine';f.type=kind==='quack'?'bandpass':'lowpass';f.frequency.value=kind==='quack'?980:1800;f.Q.value=.75;o.frequency.setValueAtTime(base,t);o.frequency.exponentialRampToValueAtTime(kind==='land'?48:kind==='quack'?145:base*1.65,t+duration*.8);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='land'?.035:.07,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(f).connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.02);}catch{}
}

$('sound').onclick=()=>{muted=!muted;$('sound').setAttribute('aria-pressed',String(!muted));$('sound').querySelector('span').textContent=muted?'Sound off':'Sound on';if(!muted)sound('bell');};
function modal({title,eyebrow='',body='',art='king',action='Let’s go →',onAction,secondary='',onSecondary,closeable=false}){
 previousFocus=document.activeElement;modalCloseable=closeable;$('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalBody').innerHTML=body;$('modalArt').innerHTML=art==='team'?'<img src="assets/player1.svg" alt=""><img src="assets/king.svg" alt=""><img src="assets/player2.svg" alt="">':`<img src="assets/${art}.svg" alt="">`;$('modalAction').textContent=action;$('modalAction').onclick=()=>{closeModal();onAction?.();};$('modalSecondary').textContent=secondary;$('modalSecondary').classList.toggle('hidden',!secondary);$('modalSecondary').onclick=()=>{closeModal();onSecondary?.();};$('closeModal').classList.toggle('hidden',!closeable);$('modal').classList.remove('hidden');$('modalAction').focus();
}
function closeModal(){$('modal').classList.add('hidden');previousFocus?.focus?.();}
$('closeModal').onclick=()=>{if(modalCloseable){closeModal();if(phase==='paused')phase=resumePhase;}};
$('modal').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const b=[...$('modal').querySelectorAll('button:not(.hidden)')];if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===b.at(-1)){e.preventDefault();b[0].focus();}});
$('storyButton').onclick=()=>modal({title:'Maya’s duck kingdom.',eyebrow:'MADE BY MAYA E. DAHL',art:'king',body:'<div class="story-text"><p>A little duck stole his father’s crown in a great forest fog. The real king went missing, and three brave ducks set out to save him.</p><p>They heard his voice, found him and brought him home. After a royal showdown, the king won back his crown and made the rescuers his sons: three royal princes!</p><p>And the naughty little duck? He ended up polishing the family’s shoes.</p><p class="story-note">The Crown in the Fog brings Maya’s original two-page story and crowned duck drawing to life as a platform game. The names Pip, Puddle and Pebble, and the platforming challenges, were added for play.</p></div>',action:'Let’s play →',closeable:true});
function showToast(text,time=3.2){$('toast').textContent=text;$('toast').classList.add('visible');toastTime=time;}
function resize(){const b=$('arena').getBoundingClientRect();if(!b.width||!b.height)return;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(b.width*d);canvas.height=Math.round(b.height*d);V_H=b.width/b.height>1.15?520:580;W=V_H*b.width/b.height;camY=players.length?clamp(players[0].y-V_H*.64,0,190):0;cam=clamp(cam,0,Math.max(0,(STAGES[level]?.length||4000)-W));if(players.length)draw();}
new ResizeObserver(resize).observe($('arena'));
function duck(x,i){return {x,y:390,vx:0,vy:0,w:30,h:43,face:1,index:i,grounded:false,coyote:0,buffer:0,flap:true,health:3,invuln:0,cool:0,callAt:-99,platform:null,aiJump:0,bubble:0,respawns:0};}
function buildLevel(){
 const s=STAGES[level];platforms=s.ground.map(([x,end],i)=>({id:'g'+i,x,y:480,w:end-x,h:125,type:level===3?'stone':'ground',dx:0}));
 for(const [i,[x,y,w]] of s.ledges.entries())platforms.push({id:'p'+i,x,y,w,h:25,type:level===3?'stone':'ledge',dx:0});
 for(const [i,[x,y,w,amplitude,speed]] of (s.logs||[]).entries())platforms.push({id:'l'+i,x,y,w,h:24,type:'log',origin:x,amplitude,speed,dx:0});
 mushrooms=s.mushrooms.map((x,i)=>({id:'m'+i,x,y:450,w:78,h:30,type:'mushroom',squish:0}));platforms.push(...mushrooms);
 pickups=[];for(const [a,b] of s.ground)for(let x=a+180;x<b-60;x+=160)pickups.push({x,y:426,taken:false});for(const p of platforms)if(p.type==='ledge'||p.type==='stone'&&p.h===25)for(let x=p.x+35;x<p.x+p.w-20;x+=55)pickups.push({x,y:p.y-42,taken:false});
 lanterns=(s.lanterns||[]).map(x=>({x,y:448,lit:false}));royalKeys=(s.keys||[]).map(([x,y])=>({x,y,taken:false}));flags=s.flags.map(x=>({x,y:480,lit:false}));enemies=s.foes.map(([x,min,max])=>({x,y:466,vx:-95,min,max,alive:true,angle:0}));
 const secretPos=[[1870,209],[2830,210],[1360,300],[1510,244]][level];secret={x:secretPos[0],y:secretPos[1],found:secretsFound[level]};
 boss=level===3?{x:1710,y:480,vx:0,vy:0,health:3,invuln:0,timer:2.2,grounded:true,active:false,landed:0}:null;
}
function enterLevel(n){
 level=n;phase='intro';$('home').classList.add('hidden');$('overworld').classList.add('hidden');$('game').classList.remove('hidden');document.body.classList.add('playing');setMode(mode);scrollTo(0,0);clock=0;cam=0;camY=0;checkpoint=130;collected=0;kingCall=0;finishWait=0;buddyWait=0;boostToast=0;particles=[];effects=[];hazards=[];players=[duck(130,0),duck(185,1)];helper=duck(80,2);king=duck(60,3);buildLevel();resize();resetInputs();const s=STAGES[level];$('levelTitle').textContent=s.title;$('chapterNumber').textContent=`LEVEL 0${level+1}`;$('mapTag').textContent=s.tag;$('chapterDots').innerHTML=STAGES.map((_,i)=>`<span class="${i===level?'current':i<level?'done':''}"></span>`).join('');updateHud();
 playScene('intro'+level,()=>modal({title:s.title,eyebrow:`LEVEL ${level+1} OF 4 · ${mode===1?'SOLO':'CO-OP'}`,art:s.art,body:`<p class="goal">${s.goal}</p><p>${s.hint}</p><p class="story-note">Touch: thumbstick + JUMP + QUACK.<br>Controller: stick + A / Cross + X / Square.</p>`,action:'Into the kingdom →',onAction:()=>{phase='playing';showToast(level===0?'Move right. Jump again in the air to flap!':s.hint,4);}}));
}
$('start').onclick=()=>enterLevel(0);$('continue').onclick=()=>enterLevel(unlocked);
function home(){showMap();}
function pause(){if(phase==='paused'){closeModal();phase=resumePhase;resetInputs();return;}if(!['playing','bonus3d'].includes(phase))return;resumePhase=phase;phase='paused';resetInputs();modal({title:'Rest those little wings.',eyebrow:'THE KINGDOM CAN WAIT',art:'helper',body:'<p>Your place in the story is safe.</p><p class="story-note">Controller: A jumps, X quacks.<br>Touch: move with the big thumbstick, then jump and flap.</p>',action:'Keep exploring →',onAction:()=>{phase=resumePhase;},secondary:resumePhase==='bonus3d'?'Return to the book':'Return to the kingdom map',onSecondary:()=>{if(resumePhase==='bonus3d')window.BookWorld?.exit();else home();},closeable:true});}

$('pause').onclick=pause;$('homeLogo').onclick=e=>{e.preventDefault();if(phase==='home')scrollTo(0,0);else if(phase==='map')backToBeginning();else pause();};
function resetInputs(){keys.clear();input.forEach((p,i)=>{p.x=0;p.y=0;p.jump=false;if(p.id!==null){try{$('stick'+i).releasePointerCapture(p.id);}catch{}}p.id=null;$('stick'+i).querySelector('.knob').style.transform='';});}
window.addEventListener('blur',()=>{resetInputs();if(['playing','bonus3d'].includes(phase))pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','bonus3d'].includes(phase))pause();});
function jump(i){if(phase==='bonus3d'){window.BookWorld?.jump(i);return;}if(phase==='playing'&&players[i])players[i].buffer=.16;}
window.addEventListener('keydown',e=>{
 if(phase==='bonus3d'){if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','KeyE','ShiftRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat){if(e.code==='Space')jump(0);if(e.code==='Enter'&&mode===2)jump(1);if(e.code==='KeyE')quack(0);if(e.code==='ShiftRight'&&mode===2)quack(1);if(e.code==='Escape')pause();}return;}
 if(phase==='cutscene'){if(['Enter','Space','ArrowRight'].includes(e.code)){e.preventDefault();if(!e.repeat)nextScene();}if(e.code==='Escape')endScene();return;}
 if(!$('modal').classList.contains('hidden')){if(e.code==='Escape'&&modalCloseable)$('closeModal').click();return;}
 if(e.code==='Escape'){pause();return;}if(phase!=='playing')return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS','KeyE'].includes(e.code))e.preventDefault();keys.add(e.code);
 if(!e.repeat){if(e.code==='KeyW')jump(0);if(e.code==='ArrowUp'&&mode===2)jump(1);if(e.code==='KeyE')quack(0);if(e.code==='Space'&&mode===2)quack(1);}
});window.addEventListener('keyup',e=>keys.delete(e.code));
for(let i=0;i<2;i++){
 const stick=$('stick'+i),knob=stick.querySelector('.knob');const move=e=>{if(input[i].id!==e.pointerId)return;const b=stick.getBoundingClientRect(),r=b.width*.32,x=clamp(e.clientX-b.left-b.width/2,-r,r),y=clamp(e.clientY-b.top-b.height/2,-r,r);input[i].x=Math.abs(x/r)<.08?0:x/r;input[i].y=Math.abs(y/r)<.08?0:y/r;knob.style.transform=`translate(${x}px,${phase==='bonus3d'?y:0}px)`;e.preventDefault();};
 stick.addEventListener('pointerdown',e=>{if(!['playing','bonus3d'].includes(phase)||input[i].id!==null)return;input[i].id=e.pointerId;stick.setPointerCapture(e.pointerId);move(e);});stick.addEventListener('pointermove',move);
 const release=e=>{if(input[i].id!==e.pointerId)return;input[i].id=null;input[i].x=0;input[i].y=0;knob.style.transform='';};for(const ev of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(ev,release);
 const j=$('jump'+i);j.addEventListener('pointerdown',e=>{e.preventDefault();if(!['playing','bonus3d'].includes(phase))return;j.setPointerCapture(e.pointerId);input[i].jump=true;jump(i);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])j.addEventListener(ev,()=>input[i].jump=false);j.addEventListener('click',e=>{if(e.detail===0)jump(i);});
 $('quack'+i).addEventListener('pointerdown',e=>{e.preventDefault();quack(i);});$('quack'+i).addEventListener('click',e=>{if(e.detail===0)quack(i);});
}
function pollPads(){
 try{gamepads=[...(navigator.getGamepads?.()||[])].filter(p=>p?.connected);}catch{gamepads=[];}
 if(gamepads.length!==lastPadCount){if(gamepads.length<lastPadCount&&['playing','bonus3d'].includes(phase))pause();lastPadCount=gamepads.length;$('controllerStatus').textContent=gamepads.length?`${gamepads.length} controller${gamepads.length>1?'s':''} ready · A jumps · X quacks`:'No controllers detected · touch is ready';}
 const connected=new Set(gamepads.map(p=>p.index));for(const k of padPrevious.keys())if(!connected.has(k))padPrevious.delete(k);
 gamepads.forEach((p,i)=>{const a=!!p.buttons[0]?.pressed,x=!!(p.buttons[2]?.pressed||p.buttons[1]?.pressed),start=!!p.buttons[9]?.pressed,old=padPrevious.get(p.index)||{};if(i===0&&typeof handlePadMenu==='function'&&handlePadMenu(p,a&&!old.a||start&&!old.start,x&&!old.x)){padPrevious.set(p.index,{a,x,start});return;}
  if((a&&!old.a)||(start&&!old.start)){if(phase==='cutscene'){if(start&&!old.start)$('scenePlay').click();else nextScene();}else if(['intro','chapterdone','won','bonuswon','paused'].includes(phase))$('modalAction').click();else if(start&&!old.start)pause();else if(['playing','bonus3d'].includes(phase)&&i<activeCount())jump(i);}
  if(x&&!old.x&&['playing','bonus3d'].includes(phase)&&i<activeCount())quack(i);padPrevious.set(p.index,{a,x,start});
 });
}
window.addEventListener('gamepadconnected',pollPads);window.addEventListener('gamepaddisconnected',pollPads);
function controls(i){let x=input[i].x+(keys.has(i===0?'KeyD':'ArrowRight')?1:0)-(keys.has(i===0?'KeyA':'ArrowLeft')?1:0),held=input[i].jump||keys.has(i===0?'KeyW':'ArrowUp');const p=gamepads[i];if(p){const ax=p.axes[0]||0;if(Math.abs(ax)>.18)x+=ax;x+=(p.buttons[15]?.pressed?1:0)-(p.buttons[14]?.pressed?1:0);held ||= !!p.buttons[0]?.pressed;}return {x:clamp(x,-1,1),held};}
function earnFeathers(n){const before=lifetimeFeathers;lifetimeFeathers+=n;writeSave();if(typeof onFeathersEarned==='function')onFeathersEarned(before);}
function burst(x,y,color='#edce79',n=13){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*250,vy:-60-Math.random()*180,life:.6+Math.random()*.6,color});}
function checkpointAt(x){if(x<=checkpoint)return;checkpoint=x;for(const p of players)p.health=3;burst(x,415,'#f4dd94',22);sound('bell');showToast('Checkpoint! Your little wings are safe.');updateHud();}
function respawn(p,ai=false){p.respawns++;const leader=players[0];p.x=ai?clamp(leader.x-50,40,STAGES[level].length-50):checkpoint+p.index*45;p.y=ai?leader.y-80:350;p.vx=p.vy=0;p.grounded=false;p.platform=null;p.health=3;p.invuln=2;p.flap=true;p.bubble=.8;if(!ai)showToast('A soft landing. Back to the checkpoint!',2);updateHud();}
function hurt(p,fromX){if(p.invuln>0||p.index>=2)return;p.health--;p.invuln=1.6;p.vx=p.x<fromX?-220:220;p.vy=-330;if(!reducedMotion)shake=.16;burst(p.x,p.y-20,'#e9ddbd',10);if(p.health<=0)respawn(p,mode===1&&p.index===1);updateHud();}
function hitBoss(source='quack'){if(!boss||boss.health<=0||boss.invuln>0||(!boss.grounded&&source!=='stomp'))return false;boss.health--;boss.invuln=1.5;boss.timer=1.8;burst(boss.x,boss.y-50,'#f1c961',35);sound('bell');players.forEach(p=>p.callAt=-99);showToast(boss.health?`${3-boss.health} of 3! Watch for the next landing.`:'The crown is free! The kingdom is safe!',3);if(!reducedMotion)shake=.2;updateHud();return true;}
function quack(i){
 if(phase==='bonus3d'){window.BookWorld?.quack(i);return;}
 if(phase!=='playing'||!players[i]||players[i].cool>0)return;const p=players[i];const portalX=level===0?2220:level===2?2270:-999;if(Math.abs(p.x-portalX)<90&&p.y>390&&window.BookWorld?.ready){window.enterBookBonus();return;}p.cool=.55;p.callAt=clock;effects.push({x:p.x,y:p.y-25,life:.65,max:.65,word:'QUACK!',color:i===0?'#e2f1c5':'#ffe2b4'});sound();
 for(const e of enemies)if(e.alive&&Math.abs(e.x-p.x)<150&&Math.abs(e.y-p.y)<95){e.alive=false;burst(e.x,e.y,'#cfb17a');collected+=2;earnFeathers(2);}
 for(const h of hazards)if(h.alive&&dist({x:p.x,y:p.y-20},h)<150){h.alive=false;burst(h.x,h.y,'#d3dfbd',8);}
 for(const l of lanterns)if(!l.lit&&Math.abs(l.x-p.x)<130&&Math.abs(l.y-p.y)<100){l.lit=true;checkpointAt(l.x);burst(l.x,l.y,'#fff0af',25);sound('bell');showToast('Echo lantern lit! QUACK!');}
 if(level===1){kingCall=3;effects.push({x:STAGES[level].exit-30,y:400,life:2,max:2,word:'Over here!',color:'#f5d38a'});}
 if(boss?.active&&boss.health>0&&Math.abs(p.x-boss.x)<170&&Math.abs(p.y-boss.y)<140){if(mode===1){effects.push({x:players[1].x,y:players[1].y-25,life:.65,max:.65,word:'QUACK!',color:'#ffe2b4'});hitBoss();}else{const q=players[1-i];if(clock-q.callAt<2&&Math.abs(q.x-boss.x)<210&&Math.abs(q.y-boss.y)<150)hitBoss();else if(boss.grounded&&boss.invuln<=0)showToast('Other duck, quack now! Or jump on his head.',2);}}
 updateHud();
}
function physics(p,c,dt){
 const s=STAGES[level];p.invuln=Math.max(0,p.invuln-dt);p.cool=Math.max(0,p.cool-dt);p.bubble=Math.max(0,p.bubble-dt);p.buffer=Math.max(0,p.buffer-dt);p.aiJump=Math.max(0,p.aiJump-dt);p.land=Math.max(0,(p.land||0)-dt);
 const previous=platforms.find(q=>q.id===p.platform);if(previous&&p.grounded)p.x+=previous.dx||0;
 p.coyote=p.grounded?.12:Math.max(0,p.coyote-dt);
 const acceleration=p.grounded?2400:1400,target=c.x*285,step=acceleration*dt;p.vx += clamp(target-p.vx,-step,step);if(Math.abs(c.x)>.08)p.face=Math.sign(c.x);
 if(p.buffer>0){if(p.coyote>0){let v=-620;if(mode===2&&p.index<2&&players.some(q=>q!==p&&q.grounded&&Math.abs(q.x-p.x)<62)){v=-770;if(boostToast<=0){showToast('Buddy boost! Little ducks, big jumps.',2);boostToast=3;}burst(p.x,p.y-20,'#f1d789',7);}p.vy=v;p.grounded=false;p.coyote=0;p.flap=true;p.platform=null;p.buffer=0;sound('jump');}
 else if(p.flap){p.vy=-520;p.flap=false;p.buffer=0;burst(p.x,p.y-20,'#f4edc5',7);sound('jump');}}
 const prevY=p.y;p.vy += (p.vy<0&&!c.held?2050:1500)*dt;p.vy=Math.min(p.vy,900);p.x=clamp(p.x+p.vx*dt,22,s.length-22);p.y+=p.vy*dt;if(p.y<50){p.y=50;p.vy=Math.max(0,p.vy);}p.grounded=false;p.platform=null;
 if(p.vy>=0){let landing=null;for(const q of platforms){if(p.x+p.w/2>q.x&&p.x-p.w/2<q.x+q.w&&prevY<=q.y+3&&p.y>=q.y&&(!landing||q.y<landing.y))landing=q;}
  if(mode===2&&p.index<2)for(const other of players){if(other===p||!other.grounded)continue;const top=other.y-other.h;if(Math.abs(p.x-other.x)<26&&prevY<=top+2&&p.y>=top&&(!landing||top<landing.y))landing={id:'duck',y:top,type:'buddy'};}
  if(landing){if(p.vy>100){p.land=.22;if(p.index===0&&p.vy>350)sound('land');}p.y=landing.y;p.vy=0;p.grounded=true;p.coyote=.12;p.flap=true;p.platform=landing.id;if(landing.type==='mushroom'){p.vy=-930;p.grounded=false;p.platform=null;landing.squish=.3;burst(p.x,p.y,'#efd49a',12);sound('bounce');}}
 }
 for(const m of mushrooms)if(p.grounded&&Math.abs(p.x-(m.x+m.w/2))<34&&p.y>m.y&&p.y<m.y+45){p.y=m.y;p.vy=-930;p.grounded=false;p.platform=null;p.flap=true;m.squish=.3;sound('bounce');burst(p.x,p.y,'#f4db92');}
 if(level===1&&lanterns.some(l=>!l.lit)&&p.x>STAGES[1].exit-180)p.x=STAGES[1].exit-180;
 if(level===2&&royalKeys.some(k=>!k.taken)&&p.x>STAGES[2].exit-130)p.x=STAGES[2].exit-130;
 if(p.y>690)respawn(p,p.index>=2||mode===1&&p.index===1);
}
function supportAt(x,y){return platforms.some(q=>x>=q.x-8&&x<=q.x+q.w+8&&q.y>=y-10&&q.y<y+110);}
function aiControls(p,leader){const dx=leader.x-p.x,dir=dx>0?1:-1;let x=Math.abs(dx)>58?dir:0;let held=p.aiJump>0;
 const needsJump=p.grounded&&((Math.abs(dx)>65&&!supportAt(p.x+dir*64,p.y))||(leader.y<p.y-55&&Math.abs(dx)>35));
 if(needsJump&&p.aiJump<=0){p.buffer=.16;p.aiJump=.45;held=true;}
 if(!p.grounded&&p.vy>80&&p.flap&&!supportAt(p.x+dir*40,p.y)&&Math.abs(dx)>70){p.buffer=.16;p.aiJump=.4;held=true;}
 if(Math.abs(dx)>Math.max(650,W*.8)||p.y>660){respawn(p,true);x=0;}
 return {x,held};}
function updateHud(){const s=STAGES[level];let goal=level===0?'Run, jump and flap to the woodland gate.':level===1?`Light the echo lanterns (${lanterns.filter(l=>l.lit).length}/3). Find the king!`:level===2?`Ride the logs. Gather royal keys (${royalKeys.filter(k=>k.taken).length}/3).`:'Stomp the thief, or quack close when he lands.';if(level===3&&boss)goal=boss.invuln>0?'Good hit! Dodge the next acorns.':boss.grounded?'Gold glow! Stomp or quack the crown thief.':'Watch his jump. Keep those wings moving!';$('objectiveText').textContent=goal;$('lives').innerHTML=players.slice(0,activeCount()).map((p,i)=>`<span class="heart-group" role="img" aria-label="Player ${i+1}: ${p.health} hearts">${Array.from({length:3},(_,n)=>`<img src="assets/ui-heart${n<p.health?(i===1?'-rust':''):'-empty'}.svg" alt="">`).join('')}</span>`).join(' ');$('counter').classList.toggle('boss-count',level===3);$('counter').textContent=level===3&&boss?`${3-boss.health}/3`:`${collected}`;$('secretCounter').textContent=`${secretsFound.filter(Boolean).length}/4`;}
function complete(){
 if(phase!=='playing')return;if(level===3)finished=true;else unlocked=Math.max(unlocked,level+1);writeSave();resetInputs();sound('bell');
 playScene('outro'+level,()=>{phase=level===3?'won':'chapterdone';const total=secretsFound.filter(Boolean).length;if(level===3)modal({title:'Three very royal heroes!',eyebrow:'THE KINGDOM IS SAFE · MADE BY MAYA E. DAHL',art:'team',body:`<p>The crown is back where it belongs, and Maya’s three brave ducks are now <strong>three royal princes!</strong></p><p>Royal prince outfits are now waiting in Little Outfits.</p><p class="collection-badge">${total===4?'All four secret acorns found! Royal explorers!':`${total} of 4 secret acorns found. There are more high places to explore!`}</p><p class="story-note">And somewhere in the castle, a little duck is still polishing a mountain of shoes…</p>`,action:'Back to the menu →',onAction:home,secondary:'Explore the kingdom again',onSecondary:()=>enterLevel(0)});
 else modal({title:['Woods? Waddled.','A royal rescue!','River? Conquered.'][level],eyebrow:`LEVEL ${level+1} COMPLETE`,art:STAGES[level].art,body:`<p>${collected} feathers found. Those little wings did big things!</p>`,action:'Back to the kingdom map →',onAction:showMap,secondary:`Continue to ${STAGES[level+1].title} →`,onSecondary:()=>enterLevel(level+1)});});
}
function update(dt){
 clock+=dt;toastTime=Math.max(0,toastTime-dt);if(toastTime===0)$('toast').classList.remove('visible');kingCall=Math.max(0,kingCall-dt);shake=Math.max(0,shake-dt);boostToast=Math.max(0,boostToast-dt);
 for(const q of platforms){q.dx=0;if(q.type==='log'){const x=q.x;q.x=q.origin+Math.sin(clock*q.speed)*q.amplitude;q.dx=q.x-x;}}for(const m of mushrooms)m.squish=Math.max(0,m.squish-dt);
 for(let i=0;i<players.length;i++)physics(players[i],i===1&&mode===1?aiControls(players[i],players[0]):controls(i),dt);
 physics(helper,aiControls(helper,players[mode===1?0:1]),dt);if(level===2)physics(king,aiControls(king,helper),dt);
 const humans=players.slice(0,activeCount());
 if(mode===2&&Math.abs(players[0].x-players[1].x)>Math.max(W*.8,300)){buddyWait+=dt;if(buddyWait>2){const lead=players.reduce((a,b)=>a.x>b.x?a:b),lag=players.find(p=>p!==lead);lag.x=lead.x-55;lag.y=lead.y-65;lag.vx=lag.vy=0;lag.invuln=2;lag.bubble=.8;lag.flap=true;buddyWait=0;showToast('Together again! Your duck gets a little lift.',2);}}else buddyWait=0;
 for(const f of pickups)if(!f.taken&&humans.some(p=>dist({x:p.x,y:p.y-25},f)<39)){f.taken=true;collected++;earnFeathers(1);burst(f.x,f.y,'#f4d47c',6);sound('bell');updateHud();}
 if(!secret.found&&humans.some(p=>dist({x:p.x,y:p.y-25},secret)<40)){secret.found=true;secretsFound[level]=true;writeSave();burst(secret.x,secret.y,'#f5cc62',25);showToast('A secret royal acorn! What a jump!');sound('bell');updateHud();}
 for(const k of royalKeys)if(!k.taken&&humans.some(p=>dist({x:p.x,y:p.y-25},k)<43)){k.taken=true;burst(k.x,k.y,'#efc95c',20);sound('bell');showToast('A royal key! '+royalKeys.filter(k=>k.taken).length+' of 3.');updateHud();}
 for(const f of flags)if(!f.lit&&humans.some(p=>Math.abs(p.x-f.x)<45&&p.y>350)){f.lit=true;checkpointAt(f.x);}
 for(const e of enemies){if(!e.alive)continue;e.x+=e.vx*dt;e.angle+=e.vx*dt*.06;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1;}for(const p of humans){if(Math.abs(p.x-e.x)<30&&Math.abs((p.y-16)-e.y)<38){if(p.vy>60&&p.y<e.y+12){e.alive=false;p.vy=-510;p.flap=true;collected+=2;earnFeathers(2);burst(e.x,e.y,'#d3b87b');sound('bounce');updateHud();}else hurt(p,e.x);}}}
 if(boss){boss.active ||= humans.some(p=>p.x>940);boss.invuln=Math.max(0,boss.invuln-dt);boss.landed=Math.max(0,boss.landed-dt);if(boss.active&&boss.health>0){boss.timer-=dt;if(boss.grounded&&boss.timer<=0){boss.grounded=false;updateHud();boss.vy=-660;const target=clamp(humans.reduce((a,p)=>a+p.x,0)/humans.length+160,1120,2020);boss.vx=(target-boss.x)*1.1;boss.timer=3.8;for(const vx of [-225,210])hazards.push({x:boss.x,y:boss.y-30,vx,vy:-190,age:0,alive:true});}
 if(!boss.grounded){boss.vy+=1500*dt;boss.x=clamp(boss.x+boss.vx*dt,1010,2110);boss.y+=boss.vy*dt;if(boss.y>=480){boss.y=480;boss.vy=0;boss.grounded=true;boss.landed=.4;for(const vx of [-240,240])hazards.push({x:boss.x,y:465,vx,vy:-80,age:0,alive:true});burst(boss.x,480,'#d3c8a3',12);updateHud();}}
 for(const p of humans)if(Math.abs(p.x-boss.x)<43&&Math.abs((p.y-25)-(boss.y-35))<62){if(p.vy>80&&p.y<boss.y-24){if(hitBoss('stomp')){p.vy=-630;p.flap=true;}}else if(boss.invuln<=0)hurt(p,boss.x);}}
 if(boss.health<=0){finishWait+=dt;if(finishWait>1.7)complete();}}
 for(const h of hazards){h.age+=dt;h.x+=h.vx*dt;h.vy+=700*dt;h.y+=h.vy*dt;if(h.y>466){h.y=466;h.vy=-Math.abs(h.vy)*.45;}for(const p of humans)if(h.alive&&dist({x:p.x,y:p.y-20},h)<30){if(p.vy>80&&p.y<h.y+5){h.alive=false;p.vy=-500;p.flap=true;burst(h.x,h.y,'#d5bc8c');}else{hurt(p,h.x);h.alive=false;}}}hazards=hazards.filter(h=>h.alive&&h.age<9&&h.x>0&&h.x<STAGES[level].length);
 if(level<3&&humans.every(p=>p.x>STAGES[level].exit)&&(level!==1||lanterns.every(l=>l.lit))&&(level!==2||royalKeys.every(k=>k.taken)))complete();
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;}particles=particles.filter(p=>p.life>0);for(const e of effects)e.life-=dt;effects=effects.filter(e=>e.life>0);
 const mid=humans.reduce((a,p)=>a+p.x,0)/humans.length,desired=clamp(mid-W*.42,0,Math.max(0,STAGES[level].length-W));cam+=(desired-cam)*Math.min(1,dt*6);const midY=humans.reduce((a,p)=>a+p.y,0)/humans.length;camY+=(clamp(midY-V_H*.64,0,190)-camY)*Math.min(1,dt*6);
}
function ellipse(x,y,rx,ry,fill,stroke){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function line(points,color,width=2){ctx.beginPath();for(let i=0;i<points.length;i++)i?ctx.lineTo(...points[i]):ctx.moveTo(...points[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function label(text,x,y,color='#f7ecd0',size=17){ctx.font=`600 ${size}px 'DM Sans',system-ui,sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,x,y);}
function image(name,x,y,size){const im=sprite[name];if(im?.complete&&im.naturalWidth)ctx.drawImage(im,x-size/2,y-size/2,size,size);}
function pine(x,y,h,color){ctx.fillStyle='#62724b';ctx.fillRect(x-4,y-h*.5,8,h*.5);for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(x,y-h+j*h*.2);ctx.lineTo(x-h*.28+j*6,y-h*.25+j*h*.1);ctx.quadraticCurveTo(x,y-h*.12+j*h*.1,x+h*.28-j*6,y-h*.25+j*h*.1);ctx.closePath();ctx.fillStyle=color;ctx.fill();}}
function backdrop(){
 const im=backgrounds[level===3?'platform-castle':'platform-forest'];ctx.fillStyle=level===1?'#759d93':'#b5c8a5';ctx.fillRect(0,0,W,H);
 if(im.complete&&im.naturalWidth){const tile=H*im.naturalWidth/im.naturalHeight,off=-((cam*.18)%tile);for(let x=off-tile;x<W;x+=tile){ctx.save();ctx.translate(x,0);ctx.drawImage(im,0,0,tile,H);ctx.restore();}}
 if(level===1){ctx.fillStyle='#133f534a';ctx.fillRect(0,0,W,H);}if(level!==3){for(let i=0;i<12;i++){const x=i*170-(cam*.4)%170;pine(x,485,110+(i%3)*45,level===1?'#416b6955':'#547c5755');}}
 const water=ctx.createLinearGradient(0,475,0,H);water.addColorStop(0,level===2?'#609d99':'#77a89a');water.addColorStop(1,level===2?'#285f67':'#427f74');ctx.fillStyle=water;ctx.fillRect(0,485,W,H+240-485);for(let i=0;i<14;i++){const x=(i*149-clock*18-cam*.7)%W,y=505+i%4*17;line([[x,y],[x+43,y]],'#c3dac066',2);}
 for(let i=0;i<10;i++){const x=(i*191-cam*.1+Math.sin(clock*.6+i)*12)%W,y=80+(i*71)%300;ctx.globalAlpha=.35+(Math.sin(clock*1.5+i)+1)*.2;ellipse(x,y,2.5,2.5,'#ffedb2');}ctx.globalAlpha=1;
}
function terrain(q){if(q.x+q.w<cam-100||q.x>cam+W+100)return;
 if(q.type==='mushroom'){const squish=q.squish>0?Math.sin(q.squish*12)*7:0;ctx.fillStyle='#e8d3a2';ctx.fillRect(q.x+30,q.y+4,18,31);ctx.strokeStyle='#736b48';ctx.lineWidth=2;ctx.strokeRect(q.x+30,q.y+4,18,31);ellipse(q.x+39,q.y+3+squish,45,16,'#bf6d49','#6c6745');ellipse(q.x+21,q.y,7,4,'#f6e6b8');ellipse(q.x+48,q.y-4,8,5,'#f6e6b8');ellipse(q.x+65,q.y+4,6,3,'#f6e6b8');return;}
 if(q.type==='log'){ctx.fillStyle='#9b8055';ctx.beginPath();ctx.roundRect(q.x,q.y,q.w,q.h,12);ctx.fill();ctx.strokeStyle='#5f6546';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<4;i++)line([[q.x+14,q.y+5+i*5],[q.x+q.w-12,q.y+5+i*5]],i%2?'#b59d69':'#7d704c',1);ellipse(q.x+10,q.y+12,9,10,'#baa373','#756e48');return;}
 const stone=q.type==='stone';const earth=ctx.createLinearGradient(0,q.y,0,q.y+q.h);earth.addColorStop(0,stone?'#d4c9a5':'#b09a6d');earth.addColorStop(.5,stone?'#bfb596':'#938059');earth.addColorStop(1,stone?'#a6a48c':'#7d7353');ctx.fillStyle=earth;ctx.beginPath();ctx.roundRect(q.x,q.y,q.w,q.h,q.type==='ground'?[9,9,0,0]:9);ctx.fill();ctx.strokeStyle=stone?'#7a8066':'#6a7650';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=stone?'#dfd5aa':'#879d65';ctx.beginPath();ctx.roundRect(q.x-2,q.y-5,q.w+4,13,6);ctx.fill();
 for(let j=0;j<80;j++){const x=q.x+((Math.sin(j*17.91)*.5+.5)*q.w),y=q.y+8+(Math.cos(j*13.17)*.5+.5)*(q.h-12);if(x>cam-20&&x<cam+W+20){ctx.globalAlpha=.12;ellipse(x,y,3+j%5,1.5+j%3,j%2?'#f4e3b5':'#4d6042');}}ctx.globalAlpha=1;
 for(let x=q.x+12;x<q.x+q.w;x+=30){if(x<cam-20||x>cam+W+20)continue;if(stone){line([[x,q.y+16],[x+18,q.y+16]],'#928b71',1);if(q.h>30)line([[x+6,q.y+30],[x+6,q.y+44]],'#9e9675',1);}else{line([[x,q.y-2],[x+2,q.y-10],[x+5,q.y-3],[x+10,q.y-8]],'#617d4d',1.5);if(q.h>30)line([[x+5,q.y+5],[x+7,q.y+15],[x+2,q.y+24]],'#788052',1.3);if(q.h>30){ellipse(x+8,q.y+30+(x%3)*10,3,2,'#b6a075');if(Math.floor(x/30)%4===0)ellipse(x+6,q.y-12,3,3,'#e5c977');}}}
}
function drawDuck(p,name){if(p.x<cam-130||p.x>cam+W+130)return;ctx.save();if(p.invuln>0&&Math.floor(clock*12)%2===0)ctx.globalAlpha=.58;if(p.bubble>0)ellipse(p.x,p.y-35,40,46,'#e2edd633','#f4edc7');const outfit=p.index<2?selectedOutfits[p.index]:'explorer';const kind=p.index===0?'player1':p.index===1?'player2':name==='usurper'?'usurper':name.startsWith('king')?name:'helper';renderDuckRig(ctx,{x:p.x,y:p.y,size:72,time:clock,face:p.face,kind,outfit,walk:p.grounded?Math.min(1,Math.abs(p.vx)/200):0,air:p.grounded?0:1,talk:p.cool>.35?1:0,gesture:p.cool>.35?.7:0,squash:(p.land||0)*4,seed:p.index||0});ctx.restore();if(p.index<2){ellipse(p.x,p.y-92,11,9,p.index===0?'#2c7565':'#ab5a3d');label(mode===1&&p.index===1?'♡':String(p.index+1),p.x,p.y-88,'#f5ecd6',11);}}

function acorn(x,y,angle=0,large=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const r=large?16:13;ellipse(0,0,r,r+1,'#bd9254','#735f3e');ellipse(0,-r*.5,r+3,6,'#7d7650','#5d6040');line([[1,-r-1],[4,-r-8]],'#6c6846',3);ctx.restore();}
function scenery(){
 for(const f of flags){line([[f.x,480],[f.x,390]],'#706b48',4);ctx.beginPath();ctx.moveTo(f.x,392);ctx.lineTo(f.x+43,402);ctx.lineTo(f.x,418);ctx.closePath();ctx.fillStyle=f.lit?'#d2a547':'#718b6b';ctx.fill();if(!f.lit)label('CHECKPOINT',f.x,370,'#f6eccd',11);}
 for(const l of lanterns){if(l.lit){const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,130);g.addColorStop(0,'#ffe7a267');g.addColorStop(1,'#ffe7a200');ctx.fillStyle=g;ctx.fillRect(l.x-130,l.y-130,260,260);}image('lantern',l.x,l.y-5,52);if(!l.lit)label('QUACK',l.x,l.y-45,'#f5e5b6',12);}
 const x=STAGES[level].exit;if(level<3){if(level===1){drawDuck({x:x+20,y:480,face:-1,index:3,vx:0,vy:0,grounded:true},'king-lost');if(kingCall>0){ctx.strokeStyle='#efd28c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+20,430,30+(Math.sin(clock*5)+1)*15,0,Math.PI*2);ctx.stroke();label('“Over here!”',x,360,'#ffe3a4',18);}}
 else{image(level===2?'castle':'crown',x+20,415,level===2?140:75);label(level===0?'WOODLAND GATE':'THE KINGDOM',x,338,'#f6ebce',13);}
 if(level===1&&lanterns.some(l=>!l.lit)||level===2&&royalKeys.some(k=>!k.taken)){line([[x-100,480],[x-100,345]],'#756c50',7);for(let j=0;j<3;j++)line([[x-125,380+j*30],[x-75,380+j*30]],'#c0b079',7);}}
}
function draw(){
 if(!players.length)return;ctx.setTransform(canvas.width/W,0,0,canvas.height/V_H,0,0);ctx.clearRect(0,0,W,V_H);ctx.save();if(shake>0&&!reducedMotion)ctx.translate(Math.sin(clock*90)*3,Math.cos(clock*75)*2);ctx.translate(0,-camY);backdrop();ctx.save();ctx.translate(-cam,0);
 for(const q of platforms){terrain(q);if(q.type!=='mushroom'&&q.type!=='log'&&q.x+q.w>cam-60&&q.x<cam+W+60)drawLivingGrass(ctx,q,clock);}scenery();if(typeof drawBookmarkPortal==='function')drawBookmarkPortal(ctx,clock);
 for(const f of pickups)if(!f.taken&&f.x>cam-40&&f.x<cam+W+40){ellipse(f.x,f.y+14,13,4,'#36563e19');image('feather',f.x,f.y+Math.sin(clock*3+f.x)*4,31);}
 for(const k of royalKeys)if(!k.taken){const y=k.y+Math.sin(clock*3)*4;ellipse(k.x-5,y,9,9,'#e6bb53','#826c3d');line([[k.x+3,y],[k.x+24,y],[k.x+24,y+9],[k.x+17,y+9],[k.x+17,y]],'#e6bb53',5);label('✧',k.x,y-27,'#f8e5ae',18);}
 if(!secret.found){acorn(secret.x,secret.y+Math.sin(clock*2)*4,0,true);label('✧',secret.x+24,secret.y-10,'#ffe5a4',23);}
 for(const e of enemies)if(e.alive)drawStoryEnemy(ctx,e,clock,level);for(const h of hazards)acorn(h.x,h.y,clock*4);
 drawDuck(helper,'helper');if(level===2)drawDuck(king,'king-lost');players.forEach((p,i)=>{const outfit=selectedOutfits[i];drawDuck(p,'player'+(i+1)+(outfit&&outfit!=='explorer'?'-'+outfit:''));});
 if(boss&&boss.health>0){if(boss.grounded&&boss.invuln<=0){ellipse(boss.x,boss.y-30,57+Math.sin(clock*4)*3,58,'#f8d67535','#ebc85f');label('QUACK OR STOMP!',boss.x,boss.y-118,'#f9e2a2',13);}ctx.globalAlpha=boss.invuln>0?.55:1;drawDuck({x:boss.x,y:boss.y,face:-1,index:4,vx:boss.vx,vy:boss.vy,grounded:boss.grounded},'usurper');ctx.globalAlpha=1;for(let i=0;i<boss.health;i++)image('crown',boss.x-25+i*25,boss.y-90,22);}
 for(const e of effects){const age=1-e.life/e.max;ctx.globalAlpha=e.life/e.max;ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,35+age*130,25+age*60,0,0,Math.PI*2);ctx.stroke();label(e.word,e.x,e.y-55-age*18,e.color,17);}ctx.globalAlpha=1;
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ellipse(p.x,p.y,3,3,p.color);}ctx.globalAlpha=1;ctx.restore();
 if(level===1){const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#dae5d054');g.addColorStop(.5,'#a9c9bd0b');g.addColorStop(1,'#c5d8cf66');ctx.fillStyle=g;ctx.fillRect(0,0,W,H+220);for(let i=0;i<4;i++){const x=((i*360+clock*18-cam*.07)%(W+450))-200;ellipse(x,210+i*80,230,20,'#d8e7db10');}}
 if(typeof livingLight==='function')livingLight(ctx,clock,cam,W,H,level);ctx.translate(0,camY);
 // Small progress line makes the length of a level easy to read.
 ctx.fillStyle='#1d493c33';ctx.fillRect(18,32,W-36,2);ctx.fillStyle='#eed293';ctx.fillRect(18,32,(W-36)*clamp(players[0].x/STAGES[level].length,0,1),3);ctx.restore();canvas.dataset.frameStamp=clock.toFixed(4);
}
function frame(now){const dt=Math.min((now-lastTime)/1000||0,.08);lastTime=now;pollPads();if(phase==='playing'){accumulator+=dt;let count=0;while(accumulator>=1/120&&count++<10&&phase==='playing'){update(1/120);accumulator-=1/120;}draw();}else{accumulator=0;if(phase==='intro')draw();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
