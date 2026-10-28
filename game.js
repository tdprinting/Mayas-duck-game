'use strict';
const $=id=>document.getElementById(id);
// Each place in the kingdom. Ground tuples are [start,end,height]; ledges are [x,y,width,type].
const STAGES=[
 {kind:'woods',scene:'0',title:'The Feather Trail',sub:'Big bounces. Little wings.',art:'feather',tag:'MUSHROOM WOODS',done:'Woods? Waddled.',goal:'Run right, jump the gaps and bounce on the giant mushrooms. Reach the woodland gate!',hint:'Tap JUMP again in the air to flap. QUACK knocks rolling acorns away.',length:3900,exit:3740,
  ground:[[0,650],[770,1280],[1400,1990],[2120,2670],[2810,3900]],ledges:[[330,380,160],[620,290,150],[1000,360,170],[1600,350,180],[1860,255,130],[2400,370,180],[3060,360,170],[3370,280,160]],
  mushrooms:[510,1710,2930],flags:[1020,2220,3180],foes:[[1120,940,1240,'acorn'],[1550,1440,1770,'acorn'],[2500,2180,2620,'acorn'],[3280,3140,3510,'acorn'],[3620,3560,3700,'snail']],secret:[1870,209],portal:2220,exitLabel:'WOODLAND GATE'},
 {kind:'cave',scene:'cave',title:'Glowworm Grotto',sub:'Bright quacks in the dark.',art:'lantern',tag:'THE GLOWWORM GROTTO',done:'Grotto? Glowing!',goal:'It’s dark down here! Quack beside the three sleepy crystals to light the way. Cracked ledges crumble and stalactites drip, so keep moving!',hint:'Crystals glow when you quack and become checkpoints. Bats can be stomped or quacked away.',length:4300,exit:4130,dark:true,
  ground:[[0,620],[760,1250],[1420,1800],[2000,2500],[2700,3150],[3330,4300]],ledges:[[300,370,150],[640,330,100,'crumble'],[1000,350,160],[1290,360,110,'crumble'],[1600,300,150],[1840,350,120,'crumble'],[2200,330,170],[2540,360,120,'crumble'],[2900,300,160],[3170,350,120,'crumble'],[3600,320,170]],
  mushrooms:[1100,2350],flags:[],foes:[[1150,1000,1240,'bat'],[1650,1440,1780,'bat'],[2300,2050,2480,'beetle'],[2950,2720,3130,'bat'],[3800,3400,4000,'bat'],[3950,3700,4050,'beetle']],lanterns:[[880,'crystal'],[2100,'crystal'],[3480,'crystal']],stalactites:[520,1500,2250,2800,3700,3950],secret:[1660,228],exitLabel:'TOWARD THE FOG'},
 {kind:'fog',scene:'1',title:'Voices in the Fog',sub:'Jump toward the little lights.',art:'lantern',tag:'THE FOGGY HOLLOW',done:'A royal rescue!',goal:'Quack beside all three echo lanterns, then jump your way to the missing king.',hint:'Your quack lights nearby lanterns and makes the king answer. Lanterns are checkpoints too.',length:4100,exit:3930,
  ground:[[0,680],[810,1430],[1560,2180],[2310,2890],[3020,4100]],ledges:[[360,370,160],[1020,355,180],[1370,280,150],[1810,350,180],[2500,340,160],[2800,255,150],[3290,350,180]],
  mushrooms:[1190,2610],flags:[],foes:[[1250,900,1390,'wisp'],[1970,1640,2120,'wisp'],[3300,3080,3530,'wisp'],[2600,2330,2870,'owl']],lanterns:[[950,'lantern'],[1810,'lantern'],[3230,'lantern']],secret:[2830,210],findKing:true},
 {kind:'cliffs',scene:'cliff',title:'Blustery Bluffs',sub:'Ride the wind. Hold on tight!',art:'feather',tag:'THE BLUSTERY BLUFFS',done:'Bluffs? Breezy!',goal:'The wind is wild up here! Float up on the dandelion breezes to cross the big gaps, and watch out for gusts.',hint:'Jump into a swirl of dandelion seeds to float upward. Prickly hedgehogs can’t be stomped, so quack them away!',length:4600,exit:4430,windy:true,kingFollows:true,
  ground:[[0,700],[900,1500],[1900,2400],[2580,3100],[3600,4600]],ledges:[[350,370,160],[1050,350,170],[1300,280,140],[2050,340,160],[2750,350,170],[2950,270,120],[3800,350,170],[4100,290,150]],
  clouds:[[1640,330,120,60,1.1,'v'],[2420,380,130,0,0,'v'],[3220,360,120,90,.8,'h'],[3440,290,120,50,1.3,'v']],updrafts:[[740,140],[1560,300],[3150,420]],
  mushrooms:[1200,3950],flags:[1000,2000,2700,3700],foes:[[1250,950,1450,'crow'],[2200,1950,2380,'crow'],[2850,2620,3080,'crow'],[4000,3650,4300,'crow'],[1100,920,1240,'hedgehog'],[4250,4120,4380,'hedgehog']],secret:[1360,206],exitLabel:'DOWN TO THE RIVER'},
 {kind:'river',scene:'2',title:'The River Home',sub:'Mind the wobbly logs!',art:'castle',tag:'THE MORNING RIVER',done:'River? Conquered.',goal:'Hop across the moving logs and collect three royal keys to open the castle. Pebble will bring the king!',hint:'Wait for a log, then jump. You move along with it when you land. A second flap helps with long gaps.',length:4100,exit:3930,kingFollows:true,
  ground:[[0,650],[1150,1730],[2120,2720],[3140,4100]],ledges:[[330,370,150],[1300,350,180],[2330,350,180],[3370,350,180]],logs:[[800,430,210,80,1],[1810,420,210,65,1.2],[2840,430,220,75,.9]],fish:[700,1000,1900,2000,2930,3050],
  mushrooms:[450,2440],flags:[1270,2270,3340],foes:[[1510,1210,1680,'frog'],[2540,2190,2660,'frog'],[3700,3450,3880,'crab']],keys:[[1390,300],[2400,300],[3460,300]],secret:[1360,300],portal:2270,exitLabel:'THE KINGDOM'},
 {kind:'roof',scene:'roof',title:'Twilight Rooftops',sub:'Tiptoe past the sleepy cats.',art:'crown',tag:'THE CASTLE ROOFTOPS',done:'Rooftops? Ringing!',goal:'The crown thief ran over the rooftops! Quack beside the three tower bells to wake the castle. Puffing chimneys launch you sky-high.',hint:'Sleeping cats are harmless, but don’t bump an awake one! Stand on a chimney and wait for the puff.',length:4400,exit:4230,
  ground:[[0,600,480],[700,1150,440],[1250,1700,470],[1850,2250,420],[2400,2800,460],[2950,3350,430],[3500,4400,480]],ledges:[[400,360,140],[870,320,100,'crumble'],[1450,340,150],[1720,330,110,'crumble'],[2550,330,150],[2820,330,110,'crumble'],[3700,330,160]],
  chimneys:[[980,70],[2090,70],[3190,70],[3880,70]],mushrooms:[],flags:[1300,2450],foes:[[800,720,1130,'cat'],[2000,1870,2230,'cat'],[3050,2970,3330,'cat'],[4000,3600,4150,'cat']],lanterns:[[1550,'bell'],[2650,'bell'],[3800,'bell']],secret:[2115,180],exitLabel:'TO THE COURTYARD'},
 {kind:'throne',scene:'3',title:'The Stolen Throne',sub:'A very bouncy royal showdown.',art:'crown',tag:'THE ROYAL COURTYARD',done:'Three very royal heroes!',goal:'Dodge the rolling acorns. Stomp the crown thief, or quack close to him when he lands. Three hits win the crown!',hint:'In two-player mode, quack together for a royal blast. A stomp works too! Look for the gold glow when he lands.',length:2350,exit:2200,boss:true,
  ground:[[0,2350]],ledges:[[300,370,170],[620,290,180],[1060,370,170],[1440,290,180],[1830,370,170]],mushrooms:[460,1190],flags:[920],foes:[[730,550,860,'guard']],secret:[1510,244]}
];
const LAST=STAGES.length-1;
let bookBonusCompleted=false,resumePhase='playing';
let lifetimeFeathers=0,selectedOutfits=['explorer','explorer'];
let mode=1,level=0,phase='home',unlocked=0,finished=false,secretsFound=STAGES.map(()=>false);
try{const s=JSON.parse(localStorage.getItem('maya-crown-fog')||'null');if(s?.v===1||s?.v===2){
 // Version 1 had four levels; they now sit at places 0, 2, 4 and 6 of the bigger kingdom.
 const map=s.v===1?[0,2,4,6]:STAGES.map((_,i)=>i);mode=s.mode===2?2:1;unlocked=Math.max(0,Math.min(LAST,map[Math.min(map.length-1,s.unlocked||0)]));finished=!!s.finished;bookBonusCompleted=!!s.bookBonusCompleted;lifetimeFeathers=Math.max(0,s.feathers||0);if(Array.isArray(s.outfits))selectedOutfits=selectedOutfits.map((_,i)=>s.outfits[i]||'explorer');(s.secrets||[]).forEach((v,i)=>{if(map[i]!==undefined)secretsFound[map[i]]=!!v;});}}catch{}
let players=[],helper=null,king=null,platforms=[],mushrooms=[],pickups=[],lanterns=[],royalKeys=[],flags=[],enemies=[],particles=[],effects=[],hazards=[],boss=null,secret=null,stalactites=[],updrafts=[],chimneys=[],fishes=[];
let W=1000,H=580,V_H=580,camY=0,cam=0,clock=0,checkpoint=130,collected=0,toastTime=0,kingCall=0,finishWait=0,shake=0,lastTime=0,accumulator=0,buddyWait=0,boostToast=0,combo=0,comboTime=0,windTimer=0,wind=0,windDir=1,windState='calm',windToast=false,flash=0;
const canvas=$('world'),ctx=canvas.getContext('2d'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sprite={};for(const name of ['player1','player2','helper','king','king-lost','usurper',...['rain','firefly','woodland','royal'].flatMap(o=>['player1-'+o,'player2-'+o]),'feather','lantern','crown','castle']){const im=new Image();im.src=`assets/${name}.svg`;sprite[name]=im;}
const backgrounds={};for(const n of ['platform-forest','platform-castle']){const im=new Image();im.src=`assets/${n}.webp`;backgrounds[n]=im;}
const input=[{x:0,y:0,id:null,jump:false},{x:0,y:0,id:null,jump:false}],keys=new Set();
let gamepads=[],lastPadCount=-1,padPrevious=new Map(),muted=false,audio=null,modalCloseable=false,previousFocus=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const activeCount=()=>mode===1?1:2;
const stage=()=>STAGES[level];
function groundYAt(x){const g=stage().ground.find(([a,b])=>x>=a&&x<=b);return g?(g[2]||480):480;}
function writeSave(){try{localStorage.setItem('maya-crown-fog',JSON.stringify({v:2,mode,unlocked,finished,secrets:secretsFound,feathers:lifetimeFeathers,outfits:selectedOutfits,bookBonusCompleted}));}catch{}}
function setMode(n){mode=n;document.body.classList.toggle('solo',n===1);for(const i of [1,2]){$('mode'+i).classList.toggle('selected',i===n);$('mode'+i).setAttribute('aria-pressed',String(i===n));}writeSave();}
$('mode1').onclick=()=>setMode(1);$('mode2').onclick=()=>setMode(2);setMode(mode);
const pad2=n=>String(n).padStart(2,'0');
function makeLevels(){$('chapters').innerHTML=STAGES.map((c,i)=>`<button class="chapter-card" data-level="${i}" ${i>unlocked?'disabled':''}><img src="assets/${c.art}.svg" alt=""><small>LEVEL ${pad2(i+1)}${i>unlocked?' · LOCKED':''}</small><h3>${c.title}</h3><p>${c.sub}</p></button>`).join('');document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>enterLevel(Number(b.dataset.level)));$('continue').classList.toggle('hidden',unlocked===0&&!finished);$('continue').textContent=finished?'Play the final showdown again →':`Continue level ${unlocked+1} →`;}
makeLevels();
function sound(kind='quack',arg){if(muted)return;try{SFX.play(kind,arg);}catch{}}
$('sound').onclick=()=>{muted=!muted;$('sound').setAttribute('aria-pressed',String(!muted));$('sound').querySelector('span').textContent=muted?'Sound off':'Sound on';if(!muted)sound('bell');if(typeof syncMusic==='function')syncMusic(true);};
function modal({title,eyebrow='',body='',art='king',action='Let’s go →',onAction,secondary='',onSecondary,closeable=false}){
 previousFocus=document.activeElement;modalCloseable=closeable;$('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalBody').innerHTML=body;$('modalArt').innerHTML=art==='team'?'<img src="assets/player1.svg" alt=""><img src="assets/king.svg" alt=""><img src="assets/player2.svg" alt="">':`<img src="assets/${art}.svg" alt="">`;$('modalAction').textContent=action;$('modalAction').onclick=()=>{closeModal();sound('ui');onAction?.();};$('modalSecondary').textContent=secondary;$('modalSecondary').classList.toggle('hidden',!secondary);$('modalSecondary').onclick=()=>{closeModal();sound('ui');onSecondary?.();};$('closeModal').classList.toggle('hidden',!closeable);$('modal').classList.remove('hidden');$('modalAction').focus();
}
function closeModal(){$('modal').classList.add('hidden');previousFocus?.focus?.();}
$('closeModal').onclick=()=>{if(modalCloseable){closeModal();if(phase==='paused')phase=resumePhase;}};
$('modal').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const b=[...$('modal').querySelectorAll('button:not(.hidden)')];if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===b.at(-1)){e.preventDefault();b[0].focus();}});
$('storyButton').onclick=()=>modal({title:'Maya’s duck kingdom.',eyebrow:'MADE BY MAYA E. DAHL',art:'king',body:'<div class="story-text"><p>A little duck stole his father’s crown in a great forest fog. The real king went missing, and three brave ducks set out to save him.</p><p>They heard his voice, found him and brought him home. After a royal showdown, the king won back his crown and made the rescuers his sons: three royal princes!</p><p>And the naughty little duck? He ended up polishing the family’s shoes.</p><p class="story-note">The Crown in the Fog brings Maya’s original two-page story and crowned duck drawing to life as a platform game. The names Pip, Puddle and Pebble, the grotto, bluffs and rooftops, and the platforming challenges were added for play.</p></div>',action:'Let’s play →',closeable:true});
function showToast(text,time=3.2){$('toast').textContent=text;$('toast').classList.add('visible');toastTime=time;}
function resize(){const b=$('arena').getBoundingClientRect();if(!b.width||!b.height)return;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(b.width*d);canvas.height=Math.round(b.height*d);const aspect=b.width/b.height;V_H=aspect>1.15?520:aspect<.9?660:580;W=V_H*aspect;camY=players.length?clamp(players[0].y-V_H*.64,0,190):0;cam=clamp(cam,0,Math.max(0,(STAGES[level]?.length||4000)-W));if(players.length)draw();}
new ResizeObserver(resize).observe($('arena'));
function duck(x,i){return {x,y:390,vx:0,vy:0,w:30,h:43,face:1,index:i,grounded:false,coyote:0,buffer:0,flap:true,health:3,invuln:0,cool:0,callAt:-99,platform:null,aiJump:0,bubble:0,respawns:0,idle:0,dust:0,flapT:0,wasGrounded:true};}
function buildLevel(){
 const s=stage(),k=s.kind,gType=k==='cave'?'rock':k==='roof'?'roof':k==='throne'?'stone':'ground',lType=k==='cave'?'rockledge':k==='roof'?'beam':k==='throne'?'stoneledge':'ledge';
 platforms=s.ground.map(([x,end,y=480],i)=>({id:'g'+i,x,y,w:end-x,h:605-y,type:gType,dx:0,dy:0}));
 for(const [i,[x,y,w,t]] of s.ledges.entries())platforms.push({id:'p'+i,x,y,w,h:25,type:t==='crumble'?'crumble':lType,ledge:true,dx:0,dy:0,oy:y,state:'solid',standT:0,timer:0});
 for(const [i,[x,y,w,amplitude,speed]] of (s.logs||[]).entries())platforms.push({id:'l'+i,x,y,w,h:24,type:'log',origin:x,amplitude,speed,dx:0,dy:0});
 for(const [i,[x,y,w,amplitude,speed,axis]] of (s.clouds||[]).entries())platforms.push({id:'c'+i,x,y,w,h:22,type:'cloud',origin:x,oy:y,amplitude,speed,axis,dx:0,dy:0,ledge:true});
 chimneys=(s.chimneys||[]).map(([x,h],i)=>{const base=groundYAt(x+25),q={id:'ch'+i,x,y:base-h,w:52,h,type:'chimney',dx:0,dy:0,phase:i*.9,puff:0,armed:true};platforms.push(q);return q;});
 mushrooms=s.mushrooms.map((x,i)=>({id:'m'+i,x,y:groundYAt(x+39)-30,w:78,h:30,type:'mushroom',squish:0,glow:k==='cave'}));platforms.push(...mushrooms);
 pickups=[];for(const [a,b,y=480] of s.ground)for(let x=a+180;x<b-60;x+=160)pickups.push({x,y:y-54,taken:false,bob:Math.random()*6});
 for(const p of platforms)if(p.ledge&&p.type!=='crumble'&&p.type!=='cloud')for(let x=p.x+35;x<p.x+p.w-20;x+=55)pickups.push({x,y:p.y-42,taken:false,bob:Math.random()*6});
 for(const [x,w] of (s.updrafts||[]))for(let j=0;j<3;j++)pickups.push({x:x+w*(.3+j*.2),y:300-j*60,taken:false,bob:Math.random()*6});
 lanterns=(s.lanterns||[]).map(([x,style])=>({x,y:groundYAt(x)-32,lit:false,style,ring:0}));royalKeys=(s.keys||[]).map(([x,y])=>({x,y,taken:false}));flags=s.flags.map(x=>({x,y:groundYAt(x),lit:false,wave:0}));
 enemies=s.foes.map(([x,min,max,kind])=>{const flying=['bat','crow','owl'].includes(kind),gy=groundYAt(x);return {x,y:flying?(kind==='crow'?300:kind==='owl'?330:395):gy-14,base:flying?(kind==='crow'?300:kind==='owl'?330:395):gy-14,vx:kind==='snail'?-35:kind==='hedgehog'?-70:kind==='cat'?-80:kind==='crab'?-110:-95,min,max,kind,alive:true,angle:0,t:Math.random()*5,state:kind==='cat'?'sleep':'go',stateT:kind==='cat'?2+Math.random()*2:0,dive:0,cool:1,dying:0};});
 stalactites=(s.stalactites||[]).map(x=>({x,y:118,state:'hang',t:0,vy:0,ox:x}));updrafts=(s.updrafts||[]).map(([x,w])=>({x,w}));
 fishes=(s.fish||[]).map((x,i)=>({x,t:i*1.7,period:3.2+i%3*.6}));
 secret={x:s.secret[0],y:s.secret[1],found:secretsFound[level]};
 boss=s.boss?{x:1710,y:480,vx:0,vy:0,health:3,invuln:0,timer:2.2,grounded:true,active:false,landed:0,squash:0}:null;
 windTimer=4;wind=0;windState='calm';windToast=false;
}
function enterLevel(n){
 level=n;phase='intro';$('home').classList.add('hidden');$('overworld').classList.add('hidden');$('game').classList.remove('hidden');document.body.classList.add('playing');document.body.dataset.stage=STAGES[n].kind;setMode(mode);scrollTo(0,0);clock=0;cam=0;camY=0;checkpoint=130;collected=0;kingCall=0;finishWait=0;buddyWait=0;boostToast=0;combo=0;particles=[];effects=[];hazards=[];players=[duck(130,0),duck(185,1)];helper=duck(80,2);king=duck(60,3);buildLevel();resize();resetInputs();const s=stage();$('levelTitle').textContent=s.title;$('chapterNumber').textContent=`LEVEL ${pad2(level+1)}`;$('mapTag').textContent=s.tag;$('chapterDots').innerHTML=STAGES.map((_,i)=>`<span class="${i===level?'current':i<level?'done':''}"></span>`).join('');updateHud();
 playScene('intro'+s.scene,()=>modal({title:s.title,eyebrow:`LEVEL ${level+1} OF ${STAGES.length} · ${mode===1?'SOLO':'CO-OP'}`,art:s.art,body:`<p class="goal">${s.goal}</p><p>${s.hint}</p><p class="story-note">Touch: thumbstick + JUMP + QUACK.<br>Controller: stick + A / Cross + X / Square.</p>`,action:'Into the kingdom →',onAction:()=>{phase='playing';showToast(level===0?'Move right. Jump again in the air to flap!':s.hint,4);}}));
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
 if(!e.repeat){if(e.code==='KeyW')jump(0);if(e.code==='ArrowUp'&&mode===2)jump(1);if(e.code==='KeyE')quack(0);if(e.code==='Space'&&mode===2)quack(1);if(e.code==='Space'&&mode===1)jump(0);}
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
function controls(i){let x=input[i].x+(keys.has(i===0?'KeyD':'ArrowRight')?1:0)-(keys.has(i===0?'KeyA':'ArrowLeft')?1:0),held=input[i].jump||keys.has(i===0?'KeyW':'ArrowUp')||(mode===1&&keys.has('Space'));if(mode===1&&i===0)x+=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);const p=gamepads[i];if(p){const ax=p.axes[0]||0;if(Math.abs(ax)>.18)x+=ax;x+=(p.buttons[15]?.pressed?1:0)-(p.buttons[14]?.pressed?1:0);held ||= !!p.buttons[0]?.pressed;}return {x:clamp(x,-1,1),held};}
function earnFeathers(n){const before=lifetimeFeathers;lifetimeFeathers+=n;writeSave();if(typeof onFeathersEarned==='function')onFeathersEarned(before);}
// Particles come in shapes: dot, star, dust, leaf, drop, spark, shard.
function burst(x,y,color='#edce79',n=13,shape='dot',speed=1){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*250*speed,vy:(-60-Math.random()*180)*speed,life:.6+Math.random()*.6,max:1.2,color,shape,size:shape==='star'?4+Math.random()*4:shape==='leaf'?5:3,spin:(Math.random()-.5)*12,a:Math.random()*6,g:shape==='dust'?-30:shape==='leaf'?120:500});}
function dustPuff(x,y,n=6,dir=0){for(let i=0;i<n;i++){const side=dir||(i%2?1:-1);particles.push({x:x+side*6,y:y-3,vx:side*(40+Math.random()*90),vy:-10-Math.random()*40,life:.35+Math.random()*.3,max:.65,color:stage().kind==='cave'?'#8c88a3':stage().kind==='roof'?'#b98d7c':'#e3d7b3',shape:'dust',size:3+Math.random()*4,g:-40,a:0,spin:0});}}
function floatText(x,y,word,color='#fff1b8',size=15){effects.push({x,y,life:.9,max:.9,word,color,ring:false,size});}
function checkpointAt(x){if(x<=checkpoint)return;checkpoint=x;for(const p of players)p.health=3;burst(x,415,'#f4dd94',22,'star');sound('checkpoint');showToast('Checkpoint! Your little wings are safe.');updateHud();}
function respawn(p,ai=false){p.respawns++;const leader=players[0];p.x=ai?clamp(leader.x-50,40,stage().length-50):checkpoint+p.index*45;p.y=ai?leader.y-80:groundYAt(p.x)-130;p.vx=p.vy=0;p.grounded=false;p.platform=null;p.health=3;p.invuln=2;p.flap=true;p.bubble=.8;if(!ai){showToast('A soft landing. Back to the checkpoint!',2);sound('respawn');}updateHud();}
function hurt(p,fromX){if(p.invuln>0||p.index>=2)return;p.health--;p.invuln=1.6;p.vx=p.x<fromX?-220:220;p.vy=-330;if(!reducedMotion)shake=.18;burst(p.x,p.y-20,'#e9ddbd',10,'leaf');sound('hurt');floatText(p.x,p.y-60,'Oof!','#ffd2b8');if(p.health<=0)respawn(p,mode===1&&p.index===1);updateHud();}
function defeat(e,how='quack'){e.alive=false;e.dying=1;e.vy=-320;e.spin=(Math.random()<.5?-1:1)*9;burst(e.x,e.y,'#ffe7a0',10,'star');burst(e.x,e.y,'#cfb17a',6);collected+=2;earnFeathers(2);sound(how==='stomp'?'stomp':'pop');floatText(e.x,e.y-30,['POP!','BONK!','+2','Wheee!','Shoo!'][Math.floor(Math.random()*5)],'#ffe5a4',16);if(e.kind==='cat')sound('meow');if(e.kind==='crow')sound('caw');updateHud();}
function hitBoss(source='quack'){if(!boss||boss.health<=0||boss.invuln>0||(!boss.grounded&&source!=='stomp'))return false;boss.health--;boss.invuln=1.5;boss.timer=1.8;boss.squash=1;burst(boss.x,boss.y-50,'#f1c961',35,'star',1.4);sound('bossHit');flash=.25;players.forEach(p=>p.callAt=-99);showToast(boss.health?`${3-boss.health} of 3! Watch for the next landing.`:'The crown is free! The kingdom is safe!',3);floatText(boss.x,boss.y-130,boss.health?['Hey! My crown!','Ow ow ow!'][boss.health-1]||'Ow!':'Nooo!','#ffd9a8',20);if(!reducedMotion)shake=.3;updateHud();return true;}
function quack(i){
 if(phase==='bonus3d'){window.BookWorld?.quack(i);return;}
 if(phase!=='playing'||!players[i]||players[i].cool>0)return;const p=players[i],s=stage();const portalX=s.portal??-999;if(Math.abs(p.x-portalX)<90&&p.y>390&&window.BookWorld?.ready){window.enterBookBonus();return;}p.cool=.55;p.callAt=clock;p.idle=0;effects.push({x:p.x,y:p.y-25,life:.65,max:.65,word:'QUACK!',color:i===0?'#e2f1c5':'#ffe2b4',ring:true});sound('quack',i);
 for(const e of enemies)if(e.alive&&Math.abs(e.x-p.x)<150&&Math.abs(e.y-p.y)<110)defeat(e,'quack');
 for(const h of hazards)if(h.alive&&dist({x:p.x,y:p.y-20},h)<150){h.alive=false;burst(h.x,h.y,'#d3dfbd',8);}
 for(const l of lanterns)if(!l.lit&&Math.abs(l.x-p.x)<130&&Math.abs(l.y-p.y)<120){l.lit=true;l.ring=1.5;checkpointAt(l.x);burst(l.x,l.y-20,l.style==='crystal'?'#bff6ff':'#fff0af',28,'star');sound(l.style==='crystal'?'crystal':l.style==='bell'?'tower':'bell');const n=lanterns.filter(q=>q.lit).length;showToast(l.style==='crystal'?`A crystal wakes up and glows! ${n} of 3.`:l.style==='bell'?`DONG! A tower bell rings! ${n} of 3.`:'Echo lantern lit! QUACK!');if(l.style==='bell'&&!reducedMotion)shake=.15;}
 if(s.findKing){kingCall=3;effects.push({x:s.exit-30,y:400,life:2,max:2,word:'Over here!',color:'#f5d38a',ring:true});}
 if(boss?.active&&boss.health>0&&Math.abs(p.x-boss.x)<170&&Math.abs(p.y-boss.y)<140){if(mode===1){effects.push({x:players[1].x,y:players[1].y-25,life:.65,max:.65,word:'QUACK!',color:'#ffe2b4',ring:true});setTimeout(()=>sound('quack',1),90);hitBoss();}else{const q=players[1-i];if(clock-q.callAt<2&&Math.abs(q.x-boss.x)<210&&Math.abs(q.y-boss.y)<150)hitBoss();else if(boss.grounded&&boss.invuln<=0)showToast('Other duck, quack now! Or jump on his head.',2);}}
 updateHud();
}
function solid(q){return q.type!=='crumble'||q.state==='solid'||q.state==='shaking';}
function physics(p,c,dt){
 const s=stage(),human=p.index<activeCount();p.invuln=Math.max(0,p.invuln-dt);p.cool=Math.max(0,p.cool-dt);p.bubble=Math.max(0,p.bubble-dt);p.buffer=Math.max(0,p.buffer-dt);p.aiJump=Math.max(0,p.aiJump-dt);p.land=Math.max(0,(p.land||0)-dt);p.flapT=Math.max(0,p.flapT-dt);
 const previous=platforms.find(q=>q.id===p.platform);if(previous&&p.grounded){p.x+=previous.dx||0;p.y+=previous.dy||0;}
 p.coyote=p.grounded?.12:Math.max(0,p.coyote-dt);
 const acceleration=p.grounded?2400:1400,target=c.x*285,step=acceleration*dt;p.vx += clamp(target-p.vx,-step,step);if(Math.abs(c.x)>.08)p.face=Math.sign(c.x);
 if(wind)p.vx+=wind*windDir*dt*(p.grounded?380:620);
 if(Math.abs(c.x)>.08||!p.grounded)p.idle=0;else p.idle+=dt;
 if(p.buffer>0){if(p.coyote>0){let v=-620;if(mode===2&&p.index<2&&players.some(q=>q!==p&&q.grounded&&Math.abs(q.x-p.x)<62)){v=-770;if(boostToast<=0){showToast('Buddy boost! Little ducks, big jumps.',2);boostToast=3;}burst(p.x,p.y-20,'#f1d789',7,'star');sound('boost');}p.vy=v;p.grounded=false;p.coyote=0;p.flap=true;p.platform=null;p.buffer=0;if(human||p.index<2)sound('jump');dustPuff(p.x,p.y,4);}
 else if(p.flap){p.vy=-520;p.flap=false;p.buffer=0;p.flapT=.3;burst(p.x,p.y-20,'#f4edc5',7,'leaf');if(p.index<2)sound('flap');}}
 // Dandelion breezes lift a duck gently, fading near the top of the sky.
 for(const u of updrafts)if(p.x>u.x&&p.x<u.x+u.w&&p.y<560){const lift=clamp((p.y-110)/220,0,1);p.vy-=2500*lift*dt;if(p.vy<-380)p.vy=-380;p.flap=true;if(Math.random()<dt*20)particles.push({x:p.x+(Math.random()-.5)*30,y:p.y,vx:(Math.random()-.5)*30,vy:-160,life:.6,max:.6,color:'#fffbe8',shape:'seed',size:3,g:-60,a:0,spin:0});}
 const prevY=p.y;p.vy += (p.vy<0&&!c.held?2050:1500)*dt;p.vy=Math.min(p.vy,900);p.x=clamp(p.x+p.vx*dt,22,s.length-22);p.y+=p.vy*dt;if(p.y<50){p.y=50;p.vy=Math.max(0,p.vy);}p.grounded=false;p.platform=null;
 if(p.vy>=0){let landing=null;for(const q of platforms){if(!solid(q))continue;if(p.x+p.w/2>q.x&&p.x-p.w/2<q.x+q.w&&prevY<=q.y+3+Math.max(0,-(q.dy||0))&&p.y>=q.y&&(!landing||q.y<landing.y))landing=q;}
  if(mode===2&&p.index<2)for(const other of players){if(other===p||!other.grounded)continue;const top=other.y-other.h;if(Math.abs(p.x-other.x)<26&&prevY<=top+2&&p.y>=top&&(!landing||top<landing.y))landing={id:'duck',y:top,type:'buddy'};}
  if(landing){if(p.vy>100){p.land=.22;if(p.vy>350){dustPuff(p.x,landing.y,7);if(p.index===0||human)sound('land',Math.min(1.2,p.vy/700));}}p.y=landing.y;p.vy=0;p.grounded=true;p.coyote=.12;p.flap=true;p.platform=landing.id;
   if(landing.type==='mushroom'){p.vy=-930;p.grounded=false;p.platform=null;landing.squish=.3;burst(p.x,p.y,landing.glow?'#a9f0ff':'#efd49a',12,'star');sound('bounce');floatText(p.x,p.y-40,'Boing!','#ffe9b7',14);}
   else if(landing.type==='cloud'&&p.vy===0){landing.squish=.25;}}
 }
 if(p.grounded&&Math.abs(p.vx)>200){p.dust-=dt;if(p.dust<=0){p.dust=.16;dustPuff(p.x-p.face*10,p.y,1,-p.face);}}
 if(p.grounded&&!p.wasGrounded&&p.vy===0){p.squashIn=.18;}
 p.wasGrounded=p.grounded;
 const gateX=s.exit-(s.lanterns?180:130);if((s.lanterns&&lanterns.some(l=>!l.lit)||s.keys&&royalKeys.some(k=>!k.taken))&&p.x>gateX){p.x=gateX;if(p.vx>0)p.vx=0;}
 if(p.y>690){if(human&&['woods','fog','river','cave'].includes(s.kind)){burst(p.x,560,'#cfe7e7',14,'drop',1.3);sound('splash');}respawn(p,p.index>=2||mode===1&&p.index===1);}
}
function supportAt(x,y){return platforms.some(q=>solid(q)&&x>=q.x-8&&x<=q.x+q.w+8&&q.y>=y-10&&q.y<y+110);}
function aiControls(p,leader){const dx=leader.x-p.x,dir=dx>0?1:-1;let x=Math.abs(dx)>58?dir:0;let held=p.aiJump>0;
 const needsJump=p.grounded&&((Math.abs(dx)>65&&!supportAt(p.x+dir*64,p.y))||(leader.y<p.y-55&&Math.abs(dx)>35));
 if(needsJump&&p.aiJump<=0){p.buffer=.16;p.aiJump=.45;held=true;}
 if(!p.grounded&&p.vy>80&&p.flap&&!supportAt(p.x+dir*40,p.y)&&Math.abs(dx)>70){p.buffer=.16;p.aiJump=.4;held=true;}
 if(Math.abs(dx)>Math.max(650,W*.8)||p.y>660){respawn(p,true);x=0;}
 return {x,held};}
function updateHud(){const s=stage(),lit=lanterns.filter(l=>l.lit).length;let goal={woods:'Run, jump and flap to the woodland gate.',cave:`Wake the sleepy crystals (${lit}/3). Mind the drips!`,fog:`Light the echo lanterns (${lit}/3). Find the king!`,cliffs:'Float on the dandelion breezes. Mind the gusts!',river:`Ride the logs. Gather royal keys (${royalKeys.filter(k=>k.taken).length}/3).`,roof:`Ring the tower bells (${lit}/3). Shh, cats!`,throne:'Stomp the thief, or quack close when he lands.'}[s.kind];if(boss)goal=boss.invuln>0?'Good hit! Dodge the next acorns.':boss.grounded?'Gold glow! Stomp or quack the crown thief.':'Watch his jump. Keep those wings moving!';$('objectiveText').textContent=goal;$('lives').innerHTML=players.slice(0,activeCount()).map((p,i)=>`<span class="heart-group" role="img" aria-label="Player ${i+1}: ${p.health} hearts">${Array.from({length:3},(_,n)=>`<img src="assets/ui-heart${n<p.health?(i===1?'-rust':''):'-empty'}.svg" alt="">`).join('')}</span>`).join(' ');$('counter').classList.toggle('boss-count',!!boss);$('counter').textContent=boss?`${3-boss.health}/3`:`${collected}`;$('secretCounter').textContent=`♧ ${secretsFound.filter(Boolean).length}/${STAGES.length}`;}
function complete(){
 if(phase!=='playing')return;if(level===LAST)finished=true;else unlocked=Math.max(unlocked,level+1);writeSave();resetInputs();sound('win');
 playScene('outro'+stage().scene,()=>{phase=level===LAST?'won':'chapterdone';const total=secretsFound.filter(Boolean).length;if(level===LAST)modal({title:'Three very royal heroes!',eyebrow:'THE KINGDOM IS SAFE · MADE BY MAYA E. DAHL',art:'team',body:`<p>The crown is back where it belongs, and Maya’s three brave ducks are now <strong>three royal princes!</strong></p><p>Royal prince outfits are now waiting in Little Outfits.</p><p class="collection-badge">${total===STAGES.length?'Every secret acorn found! Royal explorers!':`${total} of ${STAGES.length} secret acorns found. There are more high places to explore!`}</p><p class="story-note">And somewhere in the castle, a little duck is still polishing a mountain of shoes…</p>`,action:'Back to the menu →',onAction:home,secondary:'Explore the kingdom again',onSecondary:()=>enterLevel(0)});
 else modal({title:stage().done,eyebrow:`LEVEL ${level+1} COMPLETE`,art:stage().art,body:`<p>${collected} feathers found. Those little wings did big things!</p>`,action:'Back to the kingdom map →',onAction:showMap,secondary:`Continue to ${STAGES[level+1].title} →`,onSecondary:()=>enterLevel(level+1)});});
}
function updateWorld(dt,humans){
 const s=stage();
 for(const q of platforms){q.dx=0;q.dy=0;if(q.type==='log'){const x=q.x;q.x=q.origin+Math.sin(clock*q.speed)*q.amplitude;q.dx=q.x-x;}
  if(q.type==='cloud'){const x=q.x,y=q.y,o=Math.sin(clock*q.speed)*q.amplitude;if(q.axis==='h')q.x=q.origin+o;else q.y=q.oy+o;q.dx=q.x-x;q.dy=q.y-y;q.squish=Math.max(0,(q.squish||0)-dt);}
  if(q.type==='crumble'){const stood=[...players,helper,king].some(p=>p.grounded&&p.platform===q.id);
   if(q.state==='solid'){if(stood){q.standT+=dt;if(q.standT>.3){q.state='shaking';q.timer=.5;sound('rumble');}}else q.standT=Math.max(0,q.standT-dt);}
   else if(q.state==='shaking'){q.timer-=dt;if(q.timer<=0){q.state='falling';q.vy=0;sound('crumble');for(let k=0;k<8;k++)particles.push({x:q.x+Math.random()*q.w,y:q.y+8,vx:(Math.random()-.5)*80,vy:Math.random()*-60,life:1,max:1,color:s.kind==='roof'?'#b0614a':'#8a8199',shape:'shard',size:4+Math.random()*4,g:900,a:Math.random()*6,spin:(Math.random()-.5)*8});}}
   else if(q.state==='falling'){q.vy+=1400*dt;q.y+=q.vy*dt;if(q.y>720){q.state='gone';q.timer=3;}}
   else if(q.state==='gone'){q.timer-=dt;if(q.timer<=0){q.state='solid';q.y=q.oy;q.standT=0;burst(q.x+q.w/2,q.y,'#e8dcb5',8,'dust');}}}
 }
 for(const m of mushrooms)m.squish=Math.max(0,m.squish-dt);
 // Chimneys puff every few seconds and fling anyone standing on top up into the sky.
 for(const c of chimneys){const cyc=(clock+c.phase)%3.2;const active=cyc>2.4;if(active&&c.armed){c.armed=false;c.puff=.8;if(Math.abs(c.x-cam-W/2)<W)sound('steam');for(const p of [...players,helper]){if(p.grounded&&p.platform===c.id||Math.abs(p.x-(c.x+26))<34&&p.y<=c.y+4&&p.y>c.y-60){p.vy=-1060;p.grounded=false;p.platform=null;p.flap=true;if(p.index<2)floatText(p.x,p.y-50,'Wheee!','#fff2d0',16);}}}if(!active)c.armed=true;c.puff=Math.max(0,c.puff-dt);if(c.puff>0&&Math.random()<dt*40)particles.push({x:c.x+26+(Math.random()-.5)*20,y:c.y-4,vx:(Math.random()-.5)*40,vy:-250-Math.random()*150,life:.9,max:.9,color:'#f1ece4',shape:'puff',size:8+Math.random()*8,g:-80,a:0,spin:0});else if(Math.random()<dt*3)particles.push({x:c.x+26,y:c.y-4,vx:10,vy:-40,life:1.4,max:1.4,color:'#d9d1cc',shape:'puff',size:5,g:-10,a:0,spin:0});}
 // Stalactites wobble when a duck passes underneath, then fall.
 for(const t of stalactites){if(t.state==='hang'){if(humans.some(p=>Math.abs(p.x-t.x)<60&&p.y>t.y)){t.state='shake';t.t=.6;sound('rumble');}}
  else if(t.state==='shake'){t.t-=dt;t.x=t.ox+Math.sin(clock*60)*2;if(t.t<=0){t.state='fall';t.vy=0;t.x=t.ox;}}
  else if(t.state==='fall'){t.vy+=1600*dt;t.y+=t.vy*dt;for(const p of humans)if(Math.abs(p.x-t.x)<22&&Math.abs((p.y-25)-t.y)<30)hurt(p,t.x);const gy=platforms.find(q=>q.type==='rock'&&t.x>=q.x&&t.x<=q.x+q.w)?.y;if(gy&&t.y>=gy-10||t.y>700){if(t.y<700){burst(t.x,t.y,'#b9b2d6',14,'shard');sound('drip');}t.state='gone';t.t=5;}}
  else if(t.state==='gone'){t.t-=dt;if(t.t<=0){t.state='hang';t.y=118;}}}
 // Wind gusts on the bluffs: calm, a warning rustle, then a whoosh.
 if(s.windy){windTimer-=dt;if(windState==='calm'&&windTimer<=0){windState='warn';windTimer=1;windDir=Math.random()<.6?-1:1;}else if(windState==='warn'&&windTimer<=0){windState='gust';windTimer=2.4;sound('wind');if(!windToast){windToast=true;showToast(windDir<0?'Whoosh! Lean into the wind!':'Whoosh! The wind gives you a push!',2.5);}}else if(windState==='gust'&&windTimer<=0){windState='calm';windTimer=3.5+Math.random()*2;}
  const target=windState==='gust'?1:0;wind+=(target-wind)*Math.min(1,dt*2.5);if(windState!=='calm'&&Math.random()<dt*(windState==='gust'?40:8))particles.push({x:cam+(windDir>0?-20:W+20),y:camY+Math.random()*V_H*.85,vx:windDir*(380+Math.random()*200),vy:(Math.random()-.5)*40,life:3,max:3,color:Math.random()<.5?'#c9a85a':'#97ad63',shape:'leaf',size:5,g:20,a:Math.random()*6,spin:(Math.random()-.5)*10});}
 for(const f of fishes){f.t+=dt;}
 for(const l of lanterns)l.ring=Math.max(0,l.ring-dt);
}
function updateEnemies(dt,humans){
 for(const e of enemies){
  if(!e.alive){if(e.dying>0){e.dying-=dt;e.vy+=900*dt;e.y+=e.vy*dt;e.angle+=e.spin*dt;}continue;}
  e.t+=dt;const k=e.kind;
  if(k==='cat'){e.stateT-=dt;if(e.state==='sleep'){if(e.stateT<=0||humans.some(p=>Math.abs(p.x-e.x)<70&&Math.abs(p.y-e.y)<60&&Math.abs(p.vx)>240)){e.state='stretch';e.stateT=.9;if(Math.abs(e.x-cam-W/2)<W*.6)sound('meow');}}else if(e.state==='stretch'){if(e.stateT<=0){e.state='go';e.stateT=4+Math.random()*2;}}else{e.x+=e.vx*dt;if(e.stateT<=0){e.state='sleep';e.stateT=3+Math.random()*2;}}}
  else if(k==='bat'){e.x+=e.vx*1.2*dt;e.y=e.base+Math.sin(e.t*3)*40;if(Math.random()<dt*.3&&Math.abs(e.x-cam-W/2)<W*.5)sound('squeak');}
  else if(k==='owl'){e.x+=e.vx*.6*dt;e.y=e.base+Math.sin(e.t*1.5)*25;}
  else if(k==='crow'){e.cool-=dt;e.x+=e.vx*1.5*dt;if(e.dive>0){e.dive-=dt;e.y=e.base+Math.sin((1-e.dive/1.3)*Math.PI)*165;}else{e.y=e.base+Math.sin(e.t*2)*12;if(e.cool<=0&&humans.some(p=>Math.abs(p.x-e.x)<180&&p.y>e.y+80)){e.dive=1.3;e.cool=3.5;if(Math.abs(e.x-cam-W/2)<W*.6)sound('caw');}}}
  else e.x+=e.vx*dt;
  e.angle+=e.vx*dt*.06;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1;}
  const harmless=k==='cat'&&e.state==='sleep';
  for(const p of humans){if(Math.abs(p.x-e.x)<30&&Math.abs((p.y-16)-e.y)<38){if(p.vy>60&&p.y<e.y+12&&k!=='hedgehog'){defeat(e,'stomp');p.vy=-510;p.flap=true;}else if(k==='hedgehog'&&p.vy>60&&p.y<e.y+12){p.vy=-560;hurt(p,e.x);floatText(e.x,e.y-30,'Prickly!','#ffd1b0');}else if(!harmless)hurt(p,e.x);}}
 }
 enemies=enemies.filter(e=>e.alive||e.dying>0);
}
function update(dt){
 clock+=dt;toastTime=Math.max(0,toastTime-dt);if(toastTime===0)$('toast').classList.remove('visible');kingCall=Math.max(0,kingCall-dt);shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);boostToast=Math.max(0,boostToast-dt);comboTime=Math.max(0,comboTime-dt);if(comboTime===0)combo=0;
 const s=stage(),humans=players.slice(0,activeCount());
 updateWorld(dt,humans);
 for(let i=0;i<players.length;i++)physics(players[i],i===1&&mode===1?aiControls(players[i],players[0]):controls(i),dt);
 physics(helper,aiControls(helper,players[mode===1?0:1]),dt);if(s.kingFollows)physics(king,aiControls(king,helper),dt);
 if(mode===2&&Math.abs(players[0].x-players[1].x)>Math.max(W*.8,300)){buddyWait+=dt;if(buddyWait>2){const lead=players.reduce((a,b)=>a.x>b.x?a:b),lag=players.find(p=>p!==lead);lag.x=lead.x-55;lag.y=lead.y-65;lag.vx=lag.vy=0;lag.invuln=2;lag.bubble=.8;lag.flap=true;buddyWait=0;showToast('Together again! Your duck gets a little lift.',2);}}else buddyWait=0;
 for(const f of pickups)if(!f.taken&&humans.some(p=>dist({x:p.x,y:p.y-25},f)<39)){f.taken=true;collected++;earnFeathers(1);combo++;comboTime=1.1;burst(f.x,f.y,'#f4d47c',7,'spark');sound('feather',combo-1);if(combo>=5&&combo%5===0)floatText(f.x,f.y-30,`${combo} in a row!`,'#ffe9a8',15);updateHud();}
 if(!secret.found&&humans.some(p=>dist({x:p.x,y:p.y-25},secret)<40)){secret.found=true;secretsFound[level]=true;writeSave();burst(secret.x,secret.y,'#f5cc62',30,'star',1.3);showToast('A secret royal acorn! What a jump!');sound('secret');updateHud();}
 for(const k of royalKeys)if(!k.taken&&humans.some(p=>dist({x:p.x,y:p.y-25},k)<43)){k.taken=true;burst(k.x,k.y,'#efc95c',22,'star');sound('key');showToast('A royal key! '+royalKeys.filter(k=>k.taken).length+' of 3.');updateHud();}
 for(const f of flags){f.wave+=dt;if(!f.lit&&humans.some(p=>Math.abs(p.x-f.x)<45&&p.y>f.y-130)){f.lit=true;checkpointAt(f.x);}}
 updateEnemies(dt,humans);
 if(boss){boss.squash=Math.max(0,boss.squash-dt*2);boss.active ||= humans.some(p=>p.x>940);boss.invuln=Math.max(0,boss.invuln-dt);boss.landed=Math.max(0,boss.landed-dt);if(boss.active&&boss.health>0){boss.timer-=dt;if(boss.grounded&&boss.timer<=0){boss.grounded=false;updateHud();boss.vy=-660;const target=clamp(humans.reduce((a,p)=>a+p.x,0)/humans.length+160,1120,2020);boss.vx=(target-boss.x)*1.1;boss.timer=3.8;for(const vx of [-225,210])hazards.push({x:boss.x,y:boss.y-30,vx,vy:-190,age:0,alive:true});if(Math.random()<.5){sound('taunt');floatText(boss.x,boss.y-120,['Nyah nyah!','Can’t catch me!','My crown!','Hee hee!'][Math.floor(Math.random()*4)],'#e7d6ff',16);}}
 if(!boss.grounded){boss.vy+=1500*dt;boss.x=clamp(boss.x+boss.vx*dt,1010,2110);boss.y+=boss.vy*dt;if(boss.y>=480){boss.y=480;boss.vy=0;boss.grounded=true;boss.landed=.4;boss.squash=.8;for(const vx of [-240,240])hazards.push({x:boss.x,y:465,vx,vy:-80,age:0,alive:true});dustPuff(boss.x,480,12);sound('land',1.4);if(!reducedMotion)shake=.12;updateHud();}}
 for(const p of humans)if(Math.abs(p.x-boss.x)<43&&Math.abs((p.y-25)-(boss.y-35))<62){if(p.vy>80&&p.y<boss.y-24){if(hitBoss('stomp')){p.vy=-630;p.flap=true;}}else if(boss.invuln<=0)hurt(p,boss.x);}}
 if(boss.health<=0){finishWait+=dt;if(finishWait>1.7)complete();}}
 for(const h of hazards){h.age+=dt;h.x+=h.vx*dt;h.vy+=700*dt;h.y+=h.vy*dt;if(h.y>466){h.y=466;h.vy=-Math.abs(h.vy)*.45;}for(const p of humans)if(h.alive&&dist({x:p.x,y:p.y-20},h)<30){if(p.vy>80&&p.y<h.y+5){h.alive=false;p.vy=-500;p.flap=true;burst(h.x,h.y,'#d5bc8c',8,'star');sound('pop');}else{hurt(p,h.x);h.alive=false;}}}hazards=hazards.filter(h=>h.alive&&h.age<9&&h.x>0&&h.x<s.length);
 if(!boss&&humans.every(p=>p.x>s.exit)&&(!s.lanterns||lanterns.every(l=>l.lit))&&(!s.keys||royalKeys.every(k=>k.taken)))complete();
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g??500)*dt;p.a+=(p.spin||0)*dt;if(p.shape==='dust'||p.shape==='puff'){p.vx*=1-dt*3;p.size+=dt*(p.shape==='puff'?30:8);}}particles=particles.filter(p=>p.life>0);if(particles.length>500)particles.splice(0,particles.length-500);for(const e of effects)e.life-=dt;effects=effects.filter(e=>e.life>0);
 const lead=humans[0],look=(lead.face||1)*W*.06,mid=humans.reduce((a,p)=>a+p.x,0)/humans.length,desired=clamp(mid-W*(W<620?.32:.42)+(mode===1?look:0),0,Math.max(0,s.length-W));cam+=(desired-cam)*Math.min(1,dt*5);const midY=humans.reduce((a,p)=>a+p.y,0)/humans.length;camY+=(clamp(midY-V_H*.64,0,190)-camY)*Math.min(1,dt*6);
}
// ---------- Drawing ----------
function ellipse(x,y,rx,ry,fill,stroke){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function line(points,color,width=2){ctx.beginPath();for(let i=0;i<points.length;i++)i?ctx.lineTo(...points[i]):ctx.moveTo(...points[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function label(text,x,y,color='#f7ecd0',size=17,outline=true){ctx.font=`600 ${size}px 'Patrick Hand','DM Sans',system-ui,sans-serif`;ctx.textAlign='center';if(outline){ctx.lineWidth=Math.max(2,size*.22);ctx.strokeStyle='#1d3a2ecc';ctx.lineJoin='round';ctx.strokeText(text,x,y);}ctx.fillStyle=color;ctx.fillText(text,x,y);}
function image(name,x,y,size){const im=sprite[name];if(im?.complete&&im.naturalWidth)ctx.drawImage(im,x-size/2,y-size/2,size,size);}
function shadowBelow(p,scale=1){let best=null;for(const q of platforms){if(!solid(q)||p.x<q.x||p.x>q.x+q.w||q.y<p.y-4)continue;if(!best||q.y<best.y)best=q;}if(!best||best.y-p.y>320)return;const d=clamp((best.y-p.y)/320,0,1);ctx.save();ctx.globalAlpha=.28*(1-d*.7);ellipse(p.x,best.y+1,(19-d*8)*scale,(5-d*2)*scale,'#1d2f24');ctx.restore();}
function drawDuck(p,name){if(p.x<cam-130||p.x>cam+W+130)return;shadowBelow(p);ctx.save();if(p.invuln>0&&Math.floor(clock*12)%2===0)ctx.globalAlpha=.58;if(p.bubble>0)ellipse(p.x,p.y-35,40,46,'#e2edd633','#f4edc7');const outfit=p.index<2?selectedOutfits[p.index]:'explorer';const kind=p.index===0?'player1':p.index===1?'player2':name==='usurper'?'usurper':name.startsWith('king')?name:'helper';
 const idle=p.idle||0,falling=!p.grounded&&p.vy>520,stretch=!p.grounded&&p.vy<-300?-.7:0;const emotion=p.invuln>1.1?'sad':falling?'surprised':(p.grounded&&Math.abs(p.vx)>250)?'determined':idle>5?'content':'happy';
 const preen=idle>3.5?Math.max(0,Math.sin(idle*1.4))*.9:0;
 renderDuckRig(ctx,{x:p.x,y:p.y,size:72,time:clock,face:p.face,kind,outfit,walk:p.grounded?Math.min(1,Math.abs(p.vx)/200):0,air:p.grounded?0:1,flap:p.flapT>0?p.flapT/.3:0,talk:p.cool>.35?1:0,gesture:p.cool>.35?.7:preen,squash:(p.land||0)*4+stretch,seed:p.index||0,emotion});ctx.restore();
 if(idle>6&&p.index<2)label('z',p.x+18+Math.sin(clock*2)*3,p.y-78-((clock*12)%14),'#f4ecd1',12);
 if(p.index<2){ellipse(p.x,p.y-92,11,9,p.index===0?'#2c7565':'#ab5a3d');label(mode===1&&p.index===1?'♡':String(p.index+1),p.x,p.y-88,'#f5ecd6',11,false);}}
function acorn(x,y,angle=0,large=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle);const r=large?16:13;ellipse(0,0,r,r+1,'#bd9254','#735f3e');ellipse(-r*.35,-r*.1,r*.25,r*.4,'#e2bd7e88');ellipse(0,-r*.5,r+3,6,'#7d7650','#5d6040');line([[1,-r-1],[4,-r-8]],'#6c6846',3);ctx.restore();}
function drawParticles(){for(const p of particles){const a=Math.min(1,p.life/(p.max||1)*2);ctx.globalAlpha=a;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a||0);const z=p.size||3;
 if(p.shape==='star'){ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?z*.45:z;ctx.lineTo(Math.cos(i*Math.PI/5)*r,Math.sin(i*Math.PI/5)*r);}ctx.closePath();ctx.fillStyle=p.color;ctx.fill();}
 else if(p.shape==='leaf'){ctx.scale(1,Math.cos((p.a||0)*1.7));ctx.beginPath();ctx.ellipse(0,0,z,z*.45,0,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();}
 else if(p.shape==='dust'||p.shape==='puff'){ctx.globalAlpha=a*(p.shape==='puff'?.55:.5);ellipse(0,0,z,z*.8,p.color);}
 else if(p.shape==='drop'){ellipse(0,0,z*.8,z*1.3,p.color);}
 else if(p.shape==='spark'){ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-z*1.6,0);ctx.lineTo(z*1.6,0);ctx.moveTo(0,-z*1.6);ctx.lineTo(0,z*1.6);ctx.stroke();}
 else if(p.shape==='shard'){ctx.beginPath();ctx.moveTo(-z,-z*.4);ctx.lineTo(z,-z*.6);ctx.lineTo(z*.2,z);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();}
 else if(p.shape==='seed'){ctx.strokeStyle=p.color;ctx.lineWidth=1;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(i)*5,-3-Math.sin(i)*3);ctx.stroke();}ellipse(0,1,1,2,'#c8b06a');}
 else ellipse(0,0,z,z,p.color);ctx.restore();}ctx.globalAlpha=1;}
function scenery(){
 const s=stage();
 for(const f of flags)drawFlag(ctx,f,clock);
 for(const l of lanterns)drawGateLight(ctx,l,clock,image,label);
 const x=s.exit;if(!s.boss){drawExit(ctx,s,x,clock,{image,label,drawDuck,kingCall});
  if(s.lanterns&&lanterns.some(l=>!l.lit)||s.keys&&royalKeys.some(k=>!k.taken))drawBarrier(ctx,x-(s.lanterns?150:100),groundYAt(x-120),clock,s.kind);}
}
function draw(){
 if(!players.length)return;const s=stage();ctx.setTransform(canvas.width/W,0,0,canvas.height/V_H,0,0);ctx.clearRect(0,0,W,V_H);ctx.save();if(shake>0&&!reducedMotion)ctx.translate(Math.sin(clock*90)*4*Math.min(1,shake*6),Math.cos(clock*75)*3*Math.min(1,shake*6));ctx.translate(0,-camY);
 drawBackdrop(ctx,s,{cam,camY,W,H:V_H,clock,backgrounds,fishes});ctx.save();ctx.translate(-cam,0);
 drawBackLayer(ctx,s,{cam,W,clock,updrafts,stalactites,chimneys});
 for(const q of platforms){if(q.x+q.w<cam-100||q.x>cam+W+100)continue;drawTerrain(ctx,q,{cam,W,clock,kind:s.kind});}scenery();if(typeof drawBookmarkPortal==='function')drawBookmarkPortal(ctx,clock);
 for(const f of pickups)if(!f.taken&&f.x>cam-40&&f.x<cam+W+40){const by=Math.sin(clock*3+f.x)*4;ellipse(f.x,f.y+14,13,4,'#36563e19');ctx.save();ctx.translate(f.x,f.y+by);ctx.rotate(Math.sin(clock*2+f.bob)*.25);image('feather',0,0,31);ctx.restore();if(Math.sin(clock*4+f.bob*3)>.97){ctx.globalAlpha=.8;line([[f.x+8,f.y-14],[f.x+8,f.y-4]],'#fff7d0',1.5);line([[f.x+3,f.y-9],[f.x+13,f.y-9]],'#fff7d0',1.5);ctx.globalAlpha=1;}}
 for(const k of royalKeys)if(!k.taken){const y=k.y+Math.sin(clock*3)*4;ctx.save();ctx.globalAlpha=.35;ellipse(k.x+8,y+3,30,22,'#ffe7a0');ctx.restore();ellipse(k.x-5,y,9,9,'#e6bb53','#826c3d');ellipse(k.x-5,y,3,3,'#826c3d');line([[k.x+3,y],[k.x+24,y],[k.x+24,y+9],[k.x+17,y+9],[k.x+17,y]],'#e6bb53',5);label('✧',k.x+Math.sin(clock*4)*4,y-27,'#f8e5ae',18,false);}
 if(!secret.found){ctx.save();ctx.globalAlpha=.3+Math.sin(clock*3)*.15;ellipse(secret.x,secret.y,30,30,'#ffe7a0');ctx.restore();acorn(secret.x,secret.y+Math.sin(clock*2)*4,Math.sin(clock*1.5)*.2,true);label('✧',secret.x+24,secret.y-10+Math.sin(clock*3)*3,'#ffe5a4',23,false);}
 for(const e of enemies){if(e.x<cam-80||e.x>cam+W+80)continue;if(e.alive&&!['bat','crow','owl'].includes(e.kind))ellipse(e.x,groundYAt(e.x)+1,16,4,'#1d2f2433');ctx.save();if(!e.alive){ctx.globalAlpha=clamp(e.dying,0,1);ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.translate(-e.x,-e.y);}drawStoryEnemy(ctx,e,clock,s.kind);ctx.restore();}
 for(const h of hazards)acorn(h.x,h.y,clock*4);
 drawDuck(helper,'helper');if(s.kingFollows)drawDuck(king,'king-lost');players.forEach((p,i)=>{const outfit=selectedOutfits[i];drawDuck(p,'player'+(i+1)+(outfit&&outfit!=='explorer'?'-'+outfit:''));});
 if(boss&&boss.health>0){if(boss.grounded&&boss.invuln<=0){ellipse(boss.x,boss.y-30,57+Math.sin(clock*4)*3,58,'#f8d67535','#ebc85f');label('QUACK OR STOMP!',boss.x,boss.y-118,'#f9e2a2',15);}ctx.globalAlpha=boss.invuln>0?.55:1;drawDuck({x:boss.x,y:boss.y,face:-1,index:4,vx:boss.vx,vy:boss.vy,grounded:boss.grounded,land:boss.squash*.12,idle:0,flapT:boss.grounded?0:.2,invuln:0,cool:boss.grounded&&boss.timer>2.8?.4:0},'usurper');ctx.globalAlpha=1;for(let i=0;i<boss.health;i++)image('crown',boss.x-25+i*25,boss.y-95+Math.sin(clock*3+i)*2,22);}
 drawParticles();
 for(const e of effects){const age=1-e.life/e.max;ctx.globalAlpha=Math.min(1,e.life/e.max*1.5);if(e.ring!==false){ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,35+age*130,25+age*60,0,0,Math.PI*2);ctx.stroke();label(e.word,e.x,e.y-55-age*18,e.color,19);}else{const pop=age<.15?age/.15:1;label(e.word,e.x,e.y-age*40,e.color,(e.size||15)*(.6+pop*.4));}}ctx.globalAlpha=1;
 drawFrontLayer(ctx,s,{cam,W,clock,chimneys});
 ctx.restore();
 drawForeground(ctx,s,{cam,camY,W,H:V_H,clock,wind,windDir,windState});
 if(s.dark)drawDarkness(ctx,{cam,camY,W,H:V_H,clock,canvas,players:players.slice(0,activeCount()),allDucks:[...players,helper],lanterns,mushrooms,pickups,enemies,stalactites});
 if(typeof livingLight==='function')livingLight(ctx,clock,cam,W,V_H,s.kind);ctx.translate(0,camY);
 if(flash>0){ctx.fillStyle=`rgba(255,240,200,${flash*1.6})`;ctx.fillRect(0,0,W,V_H);}
 ctx.fillStyle='#1d493c33';ctx.fillRect(18,32,W-36,2);ctx.fillStyle='#eed293';ctx.fillRect(18,32,(W-36)*clamp(players[0].x/s.length,0,1),3);ctx.save();ctx.translate(18+(W-36)*clamp(players[0].x/s.length,0,1),33);ctx.fillStyle='#fff0c0';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.restore();ctx.restore();canvas.dataset.frameStamp=clock.toFixed(4);
}
function frame(now){const dt=Math.min((now-lastTime)/1000||0,.08);lastTime=now;pollPads();if(phase==='playing'){accumulator+=dt;let count=0;while(accumulator>=1/120&&count++<10&&phase==='playing'){update(1/120);accumulator-=1/120;}draw();}else{accumulator=0;if(phase==='intro')draw();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
