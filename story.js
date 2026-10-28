'use strict';
// Maya's original story is the heart of the world, dialogue and characters.
const scenes={
 intro0:{name:'The night the crown disappeared',image:'cover',cast:['king','usurper'],lines:[
 ['Narrator','king','In the Duck Kingdom, one little duck dreamed of wearing his father’s golden crown. Waiting his turn was not part of the plan.'],
 ['The little duck','usurper','“Come for a walk, Dad. I know a wonderful shortcut through the forest…”'],
 ['Narrator','lantern','At exactly 3:00 a.m., a great fog rolled between the trees. The king could not see a thing. A little wing reached for his crown.'],
 ['The little duck','usurper','“A crown makes a king… doesn’t it?” He slipped away. By morning, the real king was missing.'],
 ['Pip, a brave duck','player1','“Puddle! Pebble! The king needs us. We’ll follow the feathers, stick together, and bring him home.”']]},
 outro0:{name:'A path into the unknown',image:'forest',cast:['player1','player2','helper'],lines:[
 ['Puddle','player2','“Giant mushrooms, rolling acorns and a secret woodland gate. I think we’re getting good at this.”'],
 ['Pebble','helper','“Shh… Do you hear that? Somewhere beyond the fog, someone is calling.”'],
 ['Pip','player1','“Then that’s where we’re going. No duck gets left behind.”']]},
 intro1:{name:'A voice in the fog',image:'cover',cast:['helper','player1','player2'],lines:[
 ['Narrator','lantern','The hollow was wrapped in a blanket of silver fog. Even the moon had lost its way. Three old lanterns stood cold beside the path.'],
 ['Pebble','helper','“Those are echo lanterns! A good loud quack will wake their fireflies.”'],
 ['Puddle','player2','“And if we quack, the king can answer! We can listen our way through.”']]},
 outro1:{name:'The king in the hollow',image:'rescue',cast:[],lines:[
 ['The king','king-lost','“Three little ducks? You came all this way… for me?”'],
 ['Pip','player1','“Of course, Your Majesty. Crowns can go missing. Friends don’t give up.”'],
 ['The king','king-lost','“My own son took the crown. But a kingdom needs kindness, not just gold. Will you help me get home?”'],
 ['All three ducks','helper','“QUACK, QUACK, QUACK! That means yes!”']]},
 intro2:{name:'The long way home',image:'rescue',cast:['king-lost','player1','player2'],lines:[
 ['Narrator','castle','The morning river lay between the forest and the kingdom. The bridges were gone, the logs were moving, and the king’s wings were tired.'],
 ['Pebble','helper','“I’ll help the king along. You two hop across those floating logs and collect the three royal keys!”'],
 ['The king','king-lost','“I’ll stay close. Lead the way, brave ducks. Slowly now—I’m a king, not a racing goose!”']]},
 outro2:{name:'A kingdom holding its breath',image:'courtyard',cast:['king-lost','usurper'],lines:[
 ['Narrator','castle','At last, the castle doors opened. The queen hurried to the king, and the whole courtyard filled with relieved quacks.'],
 ['The little duck','usurper','“No! I’m king now! I have the crown!”'],
 ['The king','king-lost','“You have my crown, little duck. But being king means looking after everyone. Let us show you.”']]},
 intro3:{name:'The very royal showdown',image:'courtyard',cast:['king-lost','usurper','player1','player2'],lines:[
 ['The little duck','usurper','“Then catch me! I’ve saved some of that forest fog!”'],
 ['Narrator','crown','He shook out three great foggy puffs. They were chilly, swirly, and just a little bit silly. The courtyard disappeared into mist.'],
 ['Puddle','player2','“We can quack the fog away! Get close, then quack together. He can’t hide from all of us.”'],
 ['Pip','player1','“For the king. For our friends. For the loudest QUACK in the kingdom!”']]},
 outro3:{name:'Three very royal princes',image:'rescue',cast:['king','player1','player2','helper'],lines:[
 ['Narrator','crown','Three mighty quacks rang across the courtyard. The fog scattered, the stolen crown tumbled free, and the rightful king caught it.'],
 ['The king','king','“Pip, Puddle, Pebble. You saved me when I had nothing but a voice in the fog. I would be honoured to call you my sons.”'],
 ['All three ducks','helper','“Sons? As in… princes? As in… royal pudding?”'],
 ['The queen','crown','“Yes, princes. And as for our crown thief: you are banished from the throne. You have a few things to learn about serving a family.”'],
 ['Narrator','usurper','And that is how three brave ducks became royal princes… while the little duck became the royal shoe-polisher.'],
 ['The little duck','usurper','“All right, all right. But why does a duck family have SO MANY SHOES?”']]}
};
let sceneKey='',sceneIndex=0,sceneDone=null;
let moviePaused=false,movieTime=0,shotTime=0;
let cinematicLastStamp=0,cinematicFrame=0;
const cinemaImages={};
for(const n of ['cinema-forest','cinema-throne','platform-forest','courtyard','rescue']){const im=new Image();im.src=`assets/${n}.webp`;cinemaImages[n]=im;}
const filmReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cineClamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const cineEase=v=>{v=cineClamp(v);return v*v*(3-2*v);};
const cineLerp=(a,b,t)=>a+(b-a)*cineEase(t);
function shotDuration(){const line=scenes[sceneKey]?.lines[sceneIndex];return line?Math.min(7.5,Math.max(5.5,4.7+line[2].length/85)):6;}
function playScene(key,onDone){
 if(!scenes[key]){onDone?.();return;}
 sceneKey=key;sceneIndex=0;sceneDone=onDone;movieTime=0;shotTime=0;moviePaused=false;cinematicLastStamp=0;
 phase='cutscene';resetInputs();closeModal();document.body.classList.add('cinema-active');$('scene').classList.remove('hidden');renderScene();renderCinematic();
 $('nextScene')?.focus({preventScroll:true});
 cancelAnimationFrame(cinematicFrame);cinematicFrame=requestAnimationFrame(cinematicTick);
}
function renderScene(){
 const s=scenes[sceneKey],l=s.lines[sceneIndex];if(!l)return;
 $('sceneChapter').textContent=s.name;$('sceneSpeaker').textContent=l[0];$('sceneText').textContent=l[2];
 if($('scenePortrait'))$('scenePortrait').src=`assets/${l[1]}.svg`;
 $('sceneProgress').innerHTML=s.lines.map((_,i)=>`<span class="${i<=sceneIndex?'read':''}" aria-label="Shot ${i+1} of ${s.lines.length}"></span>`).join('');
 $('nextScene').textContent=sceneIndex===s.lines.length-1?'Onward →':'Next →';
 $('scene').dataset.scene=sceneKey;$('scene').dataset.shot=String(sceneIndex);
 updateMoviePause();
}
function updateMoviePause(){const b=$('scenePlay');if(b){b.textContent=moviePaused?'Play':'Pause';b.setAttribute('aria-label',moviePaused?'Play story':'Pause story');b.setAttribute('aria-pressed',String(moviePaused));}}
function nextScene(){if(phase!=='cutscene')return;sceneIndex++;shotTime=0;cinematicLastStamp=0;if(sceneIndex>=scenes[sceneKey].lines.length)endScene();else{renderScene();renderCinematic();}}
function endScene(){if(phase!=='cutscene')return;cancelAnimationFrame(cinematicFrame);document.body.classList.remove('cinema-active');$('scene').classList.add('hidden');const fn=sceneDone;sceneDone=null;phase='intro';fn?.();}
function cinematicTick(now){
 if(phase!=='cutscene')return;
 const dt=cinematicLastStamp?Math.min(1,(now-cinematicLastStamp)/1000):0;cinematicLastStamp=now;
 if(!moviePaused&&!document.hidden){movieTime+=dt;shotTime+=dt;if(shotTime>=shotDuration())nextScene();}
 if(phase==='cutscene'){renderCinematic();cinematicFrame=requestAnimationFrame(cinematicTick);}
}
function setupStory(){
 $('nextScene').onclick=nextScene;$('skipScene').onclick=endScene;
 if($('scenePlay'))$('scenePlay').onclick=()=>{moviePaused=!moviePaused;cinematicLastStamp=0;updateMoviePause();};
 document.addEventListener('visibilitychange',()=>{cinematicLastStamp=0;});
 $('scene').addEventListener('keydown',e=>{if(e.key==='Tab'){const controls=[$('scenePlay'),$('nextScene'),$('skipScene')].filter(Boolean),i=controls.indexOf(document.activeElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();}});
}
function cineCover(c,im,w,h,dx=0){if(!im?.complete||!im.naturalWidth)return false;const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight)*1.045,iw=im.naturalWidth*scale,ih=im.naturalHeight*scale;c.drawImage(im,(w-iw)/2+dx,(h-ih)/2,iw,ih);return true;}
function cineGlow(c,x,y,r,color='#ffe5a6',alpha=.4){c.save();const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function cineRing(c,x,y,p,color='#ffe3a1',r=170){if(p<0||p>1)return;c.save();c.globalAlpha=(1-p)*.8;c.strokeStyle=color;c.lineWidth=3*(1-p)+1;c.beginPath();c.ellipse(x+p*r,y,p*Math.abs(r)*.55+5,p*Math.abs(r)*.37+4,0,r<0?Math.PI*.55:-Math.PI*.45,r<0?Math.PI*1.45:Math.PI*.45);c.stroke();c.restore();}
function cineFog(c,w,h,t,density=1,split=0){
 c.save();for(let i=0;i<13;i++){const side=i%2?1:-1,x=((i*223+t*(filmReducedMotion?3:11))%(w+540))-270+side*split*w*.65,y=h*(.35+(i%5)*.075)+Math.sin(t*.3+i)*6;
 c.save();c.translate(x,y);c.scale(1.7,.36);const g=c.createRadialGradient(0,0,10,0,0,210);g.addColorStop(0,`rgba(193,215,204,${.23*density})`);g.addColorStop(1,'rgba(193,215,204,0)');c.fillStyle=g;c.fillRect(-220,-220,440,440);c.restore();}c.restore();
}
function cinePuff(c,x,y,r,t,alpha=1,face=true){c.save();c.globalAlpha=alpha;c.translate(x,y);const g=c.createRadialGradient(0,-r*.2,r*.1,0,0,r);g.addColorStop(0,'#d9e3ce');g.addColorStop(.8,'#94b6aecc');g.addColorStop(1,'#94b6ae00');for(let i=0;i<5;i++){vOval(c,Math.cos(i*1.6+t*.2)*r*.35,Math.sin(i*1.6+t*.2)*r*.18,r*.7,r*.48,g);}if(face){[-.22,.22].forEach(n=>vOval(c,n*r,-r*.1,3,4,'#4e7772'));vOval(c,0,r*.12,5,7,'#608b7f');}c.restore();}
function cineLantern(c,x,y,lit,t){
 vStroke(c,[[x,y+76],[x,y-54],[x+13,y-62],[x+28,y-54]],'#495f48',5);if(lit)cineGlow(c,x+28,y-26,108,'#ffe59e',.5);
 c.save();c.translate(x+28,y-23);vPath(c,'M-14 -18 L14 -18 L19 -10 L14 23 L-14 23 L-19 -10Z',lit?'#edcc76':'#789181','#425b46',2.5);vPath(c,'M-18 -18 L0 -29 L18 -18Z','#6c7750');vStroke(c,[[-8,-11],[-8,15]],lit?'#fff3ba':'#a6b29a',2);if(lit)vOval(c,0,0,3+Math.sin(t*6)*.4,7,'#fff4bd');c.restore();
}
function cineShoe(c,x,y,size=40,angle=0){c.save();c.translate(x,y);c.scale(size/50,size/50);c.rotate(angle);vPath(c,'M-22 4 Q-20 -5 -7 -6 L-5 -20 L10 -19 L11 -4 Q28 -3 29 7 Q28 13 -21 12Z','#76543f','#394d3e',2);vStroke(c,[[-19,12],[25,12]],'#d1af75',3);vStroke(c,[[0,-10],[8,-9],[0,-6],[8,-5]],'#c1a071',1);c.restore();}
function cinematicBackdrop(c,w,h,key,t){
 const court=key==='outro2'||key==='intro3'||key==='outro3',river=key==='intro2',night=key==='intro0'||key==='intro1';
 const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#183d4b':court?'#efdaa6':'#b2c8a3');bg.addColorStop(1,night?'#608c7c':'#718f6a');c.fillStyle=bg;c.fillRect(0,0,w,h);
 const im=river?cinemaImages['platform-forest']:court?cinemaImages['cinema-throne']:cinemaImages['cinema-forest'];
 const fallback=court?cinemaImages.courtyard:cinemaImages['platform-forest'];
 cineCover(c,im.complete&&im.naturalWidth?im:fallback,w,h,Math.min(13,t*.4));
 if(night){c.fillStyle=key==='intro0'?'#0b26394d':'#214a5955';c.fillRect(0,0,w,h);cineGlow(c,w*.25,h*.12,180,'#dfe5ba',.1);}
 if(river){const dawn=c.createLinearGradient(0,0,0,h);dawn.addColorStop(0,'#f9c87e48');dawn.addColorStop(.7,'#f9dca414');dawn.addColorStop(1,'#f9dca400');c.fillStyle=dawn;c.fillRect(0,0,w,h);cineGlow(c,w*.79,h*.2,230,'#ffe1a1',.19);}
 const ground=h*(court||river?.71:.65);
 c.fillStyle=court?'#d0bd8d33':river?'#709b8a':'#7b8d6020';c.beginPath();c.moveTo(0,ground+5);c.bezierCurveTo(w*.3,ground-24,w*.6,ground+24,w,ground-12);c.lineTo(w,h);c.lineTo(0,h);c.fill();
 if(court){c.strokeStyle='#a99b74';c.lineWidth=1;for(let i=0;i<9;i++){const y=ground+25+i*i*4;vStroke(c,[[0,y],[w,y]],'#a99b7460',1);}for(let i=-4;i<8;i++)vStroke(c,[[w*.5,ground],[i*w*.23,h]],'#a99b7455',1);}
 else if(river){const water=c.createLinearGradient(0,ground,0,h);water.addColorStop(0,'#7ba89a');water.addColorStop(1,'#3c7978');c.fillStyle=water;c.fillRect(0,ground+5,w,h);for(let i=0;i<30;i++){const x=(i*97+t*12)%w,y=ground+15+(i*29%Math.max(25,h-ground-30));vStroke(c,[[x,y],[x+28+Math.sin(i)*12,y]],'#dbdfb775',1.5);}}
 else{drawLivingGrass(c,{x:0,y:ground+18,w:w},t);}
 if(river){
  // Uneven grassy banks frame moving water; the stepping ducks land on the far bank.
  vPath(c,`M0 ${ground-9} Q${w*.16} ${ground-21} ${w*.27} ${ground-3} Q${w*.3} ${ground+50} ${w*.23} ${h} L0 ${h}Z`,'#7c9165','#5d7751',2);
  vPath(c,`M${w*.84} ${ground-2} Q${w*.91} ${ground-15} ${w} ${ground-11} L${w} ${h} L${w*.88} ${h} Q${w*.81} ${ground+65} ${w*.84} ${ground-2}Z`,'#899c6b','#5d7751',2);
  drawLivingGrass(c,{x:0,y:ground-5,w:w*.27},t);drawLivingGrass(c,{x:w*.84,y:ground-7,w:w*.16},t);
  for(let j=0;j<16;j++){const y=ground+13+j*(h-ground)/17,x=w*.73+Math.sin(t*.9+j*2)*10,half=8+j*2+Math.sin(t+j)*6;vStroke(c,[[x-half,y],[x+half,y]],'#f2d79344',1+j%2);}
  for(let j=0;j<4;j++){const x=w*.245+j*8,y=ground+55+j*31;vStroke(c,[[x,y+25],[x+Math.sin(t*1.5+j)*4,y-27]],'#5e7d4d',2);vOval(c,x+Math.sin(t*1.5+j)*4,y-29,3,9,'#8f7c47');}
 }
 // Drifting motes, hanging leaves and a foreground fern move independently of the painted landscape.
 for(let i=0;i<18;i++){const x=(i*131+t*5)%w,y=h*.18+(i*37%Math.max(50,h*.4))+Math.sin(t*.6+i)*9;c.save();c.globalAlpha=.35+Math.sin(t*2+i)*.2;vOval(c,x,y,1.7,1.7,night?'#f7dfa1':'#f8edbd');c.restore();}
 if(!court){c.save();c.strokeStyle='#344f3e99';c.lineWidth=3;for(let i=0;i<7;i++){const x=i*29-25,wind=Math.sin(t*1.3+i*.2)*4;vStroke(c,[[x,h],[x+30+wind,h-100-i%3*23]],'#415e4390',2);for(let k=1;k<5;k++){const y=h-k*18;vStroke(c,[[x+k*5,y],[x+k*5-15,y-12],[x+k*5,y],[x+k*5+23,y-14]],'#526d4880',2);}}c.restore();}
 if(key==='intro1')cineFog(c,w,h,t,1.6);return ground;
}
function renderCinematic(){
 const canvas=$('cinemaCanvas');if(!canvas||!scenes[sceneKey])return;
 const width=Math.max(320,innerWidth),height=Math.max(240,innerHeight),dpr=Math.min(devicePixelRatio||1,1.5);
 if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 const c=canvas.getContext('2d'),w=1440,h=w*height/width,t=movieTime,s=shotTime,i=sceneIndex,dur=shotDuration(),p=cineClamp(s/dur),g=cinematicBackdrop.bind(null,c,w,h,sceneKey,t);
 c.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);c.clearRect(0,0,w,h);const ground=g(),size=Math.min(135,h*.215),small=size*.82;
 const speaking=scenes[sceneKey].lines[i][1],ambient=filmReducedMotion?t*.35:t;
 const duck=(kind,x,opts={})=>{const yy=opts.y??ground;vOval(c,x*w,yy+3,(opts.size||size)*.31,(opts.size||size)*.045,'#233d3426');renderDuckRig(c,{x:x*w,y:yy,size:opts.size||size,time:ambient,face:opts.face??1,kind,seed:kind==='player1'?1:kind==='player2'?2:3,talk:speaking===kind ? .75 : 0,emotion:'happy',...opts});};
 const trio=(base=.25,gap=.105,opts={})=>['player1','player2','helper'].forEach((kind,j)=>duck(kind,base+gap*j,{size:small,seed:j,...(typeof opts==='function'?opts(kind,j):opts)}));
 const crown=(x,y,angle=0,sz=50)=>drawRoyalCrown(c,x*w,y,sz,angle);
 const hop=(delay=0,height=35)=>{const a=cineClamp((s-delay)/1.2);return Math.sin(a*Math.PI)*height;};
 const fogPuff=(x,y,r,offset=0,alpha=1)=>cinePuff(c,x*w,y,r,ambient+offset,alpha);
 if(sceneKey==='intro0'){
  if(i===0){const shift=cineLerp(0,.14,p);duck('king',.39+shift,{walk:.55,emotion:'content'});duck('usurper',.27+shift,{size:small,noCrown:true,walk:.8,emotion:'curious',gesture:Math.sin(t*2)*.15});}
  if(i===1){duck('king',cineLerp(.53,.59,p),{walk:p<.5?.35:0,emotion:'content',gesture:Math.sin(s*2)*.1});duck('usurper',cineLerp(.42,.75,p/.7),{size:small,noCrown:true,walk:p<.7?.8:0,face:p>.65?-1:1,gesture:p>.35?.9:0,emotion:'curious'});}
  if(i===2){const steal=cineEase((p-.32)/.45);duck('king',.54,{noCrown:p>.32,face:-1,emotion:'worried'});duck('usurper',cineLerp(.74,.65,p/.3),{size:small,noCrown:true,face:-1,walk:p<.3?.25:0,gesture:steal>0?1:0,emotion:'determined'});if(p>.32){const cx=cineLerp(.54-size*.14/w,.65-small*.14/w,steal),cy=ground-size-Math.sin(steal*Math.PI)*65+steal*(size-small);crown(cx,cy,Math.sin(steal*Math.PI)*.5,cineLerp(size,small,steal)*.53);}cineFog(c,w,h,t,Math.min(1.8,p*2));c.fillStyle='#eee6c3cc';c.font='500 17px Georgia';c.fillText('3:00 a.m.',w*.14,h*.2);}
  if(i===3){c.save();c.globalAlpha=1-p*.6;duck('king-lost',.5-p*.05,{face:Math.sin(s*2)>0?-1:1,emotion:'worried',talk:.6,gesture:.5});c.restore();duck('usurper',cineLerp(.65,1.13,p),{size:small,walk:1,emotion:'proud'});cineFog(c,w,h,t,1.7);cineRing(c,.45*w,ground-size*.48,(s%2)/2,'#dde6c3',100);}
  if(i===4){duck('helper',cineLerp(.22,.43,p),{size:small,walk:.65,gesture:.35});duck('player2',cineLerp(.34,.54,p),{size:small,walk:.7});duck('player1',cineLerp(.48,.65,p),{size:small,gesture:.9,emotion:'determined',walk:.7});}
 }
 else if(sceneKey==='outro0'){
  // A real archway and its hanging lantern give the walk a destination.
  c.save();c.translate(w*.81,ground);vPath(c,`M-90 0 L-90 -${size*1.65} Q0 -${size*2.1} 90 -${size*1.65} L90 0`,null,'#506443',13);vPath(c,`M-90 -${size*1.2} Q-115 -${size*1.8} -65 -${size*1.9} M80 -${size*1.35} Q120 -${size*1.75} 70 -${size*1.9}`,null,'#788657',5);c.restore();
  if(i===0){trio(cineLerp(.2,.48,p),.105,(kind)=>({walk:.8,face:kind==='player2'?-1:1,gesture:kind==='player2'?.8:0}));}
  if(i===1){trio(.48,.105,(kind)=>({face:1,emotion:'curious',gesture:kind==='helper'?1:.35}));cineRing(c,.88*w,ground-size*.6,(s%2.6)/2.6,'#ffe6ac',-180);cineGlow(c,.9*w,ground-size*.7,90,'#ffdfa5',.15+Math.sin(t)*.05);}
  if(i===2){trio(cineLerp(.67,1.03,p),-.1,(kind)=>({walk:.7,gesture:kind==='player1'?.9:.4,emotion:'determined'}));}
 }
 else if(sceneKey==='intro1'){
  [.29,.52,.77].forEach((x,j)=>cineLantern(c,x*w,ground-77,i>0&&(j===0||i===2&&p>j*.18),t));
  const x=i===0?cineLerp(.08,.26,p):i===2?cineLerp(.26,.64,p):.26;
  trio(x,.09,(kind)=>({walk:i===1?0:.55,emotion:'curious',gesture:i===1&&kind==='helper'?.85:0,talk:i===1&&kind==='helper'?1:0}));
  if(i===1){cineRing(c,w*.39,ground-small*.5,(s%2)/2);for(let j=0;j<22;j++){const a=j*.91+s*1.5,r=(1-cineClamp(p*1.6))*100+14;vOval(c,w*.31+Math.cos(a)*r,ground-100+Math.sin(a)*r*.5,2,2,'#ffeda0');}cineGlow(c,w*.31,ground-100,180,'#ffdc83',cineClamp(p*2)*.4);}
  if(i===2){cineRing(c,(.45+p*.15)*w,ground-small*.55,(s%2)/2);cineRing(c,.85*w,ground-small*.6,((s+1)%3)/3,'#e8dcab',-220);cineFog(c,w,h,t,.6,Math.min(1,p*.8));}
 }
 else if(sceneKey==='outro1'){
  cineGlow(c,w*.66,ground-size*.5,210,'#ffe0a0',.35);
  if(i===0){trio(cineLerp(.15,.4,p),.09,{walk:.5,emotion:'surprised'});duck('king-lost',.75,{squash:.7*(1-p),emotion:p<.5?'sad':'surprised',gesture:p*.3});}
  if(i===1){duck('king-lost',.72,{face:-1,emotion:'content',squash:.2});duck('player1',cineLerp(.47,.61,p),{size:small,gesture:.85,walk:p<.7?.4:0,squash:p*.3});duck('player2',.43,{size:small});duck('helper',.34,{size:small});}
  if(i===2){trio(.37,.09,{face:1,emotion:'curious'});duck('king-lost',.73,{face:-1,gesture:.8,emotion:'sad',squash:.3*(1-p)});}
  if(i===3){['player1','player2','helper'].forEach((kind,j)=>{const jump=hop(.25+j*.28,35);duck(kind,.4+j*.1,{size:small,y:ground-jump,air:jump/35,talk:1,gesture:1,emotion:'happy'});cineRing(c,(.43+j*.1)*w,ground-small*.55,((s+j*.3)%2)/2);});duck('king-lost',.74,{face:-1,emotion:'content',gesture:.55});cineGlow(c,.59*w,ground-small*.4,230,'#f6d698',.16);}
 }
 else if(sceneKey==='intro2'){
  // Bobbing stepping logs and their reflections travel over the actual river.
  [.42,.67].forEach((x,j)=>{const yy=ground+10+Math.sin(t*1.7+j)*5;c.save();c.translate(w*x+Math.sin(t*.8+j)*12,yy);c.rotate(Math.sin(t+j)*.025);vPath(c,'M-95 -3 Q-100 -20 -80 -23 L79 -23 Q105 -17 98 1 L84 10 L-78 10Z','#99774e','#5b6647',3);for(let k=0;k<3;k++)vStroke(c,[[-70,-15+k*7],[72,-14+k*7]],'#c2a16b',1);vOval(c,-81,-7,12,15,'#c4aa77','#6c6a48');c.restore();});
  if(i===0){trio(.08,.075,{size:small*.88,gesture:.3,emotion:'curious'});duck('king-lost',.31,{size:size*.92,emotion:'worried'});}
  if(i===1){duck('king-lost',.25,{size:size*.9});duck('helper',.31,{size:small,face:-1,gesture:.9});['player1','player2'].forEach((kind,j)=>{const prog=cineClamp((p-j*.18)/.65),jump=Math.sin(prog*Math.PI)*110;duck(kind,cineLerp(.18+j*.075,.43+j*.09,prog),{size:small,y:ground-jump-10*prog,air:jump/110,walk:prog===0?.4:0,squash:prog>.9?(1-prog)*8:0,gesture:.6});});}
  if(i===2){const wobble=Math.sin(s*5)*Math.max(0,1-p*1.8),raft=cineLerp(.34,.72,p),raftY=ground+5+Math.sin(t*1.7)*5;
   c.save();c.translate(raft*w,raftY);c.rotate(wobble*.025);for(let j=0;j<4;j++){vPath(c,`M-121 ${j*5-4} Q-130 ${j*5-10} -116 ${j*5-16} L116 ${j*5-16} Q133 ${j*5-8} 122 ${j*5-1}Z`,j%2?'#a88a59':'#95794d','#596648',2);vStroke(c,[[-103,j*5-9],[105,j*5-9]],'#c4a775',1);}[-73,73].forEach(x=>vStroke(c,[[x,-17],[x,14]],'#d4bf85',4));c.restore();
   duck('king-lost',raft-.035,{size:size*.92,gesture:.5+wobble*.4,emotion:p<.5?'surprised':'proud',y:raftY-10});duck('helper',raft+.055,{size:small,gesture:.6,face:-1,y:raftY-10});duck('player1',.85,{size:small,face:-1,gesture:.3,talk:.5});duck('player2',.94,{size:small,face:-1,y:ground-hop(1,20),emotion:'happy'});}
 }
 else if(sceneKey==='outro2'){
  if(i===0){trio(cineLerp(.06,.3,p),.085,{walk:.55,size:small*.9});duck('king-lost',cineLerp(.38,.56,p),{walk:.35});duck('queen',cineLerp(.91,.66,p/.7),{face:-1,walk:p<.7?1:0,gesture:.9,emotion:'content'});cineGlow(c,w*.61,ground-size*.45,220,'#fce2a5',.18);}
  if(i===1){c.fillStyle='#ae7751';c.fillRect(w*.74,ground-45,w*.15,45);vPath(c,`M${w*.76} ${ground-50} L${w*.76} ${ground-240} Q${w*.82} ${ground-300} ${w*.88} ${ground-240} L${w*.88} ${ground-50}Z`,'#965d4c','#596047',5);duck('usurper',.81,{y:ground-45,size:small,face:-1,gesture:Math.sin(s*8)*.6,emotion:'determined',squash:Math.abs(Math.sin(s*7))*.6});trio(.19,.08,{size:small*.85});duck('king-lost',.52,{face:1});duck('queen',.63,{face:1});}
  if(i===2){duck('king-lost',cineLerp(.5,.63,p),{walk:.25,gesture:.9,emotion:'proud'});duck('usurper',.82,{size:small,face:p<.5?-1:1,gesture:.15,emotion:'worried'});duck('queen',.47,{face:1});trio(.18,.075,{size:small*.85});}
 }
 else if(sceneKey==='intro3'){
  if(i<2)trio(.17,.105,{size:small,emotion:'worried',gesture:.25});duck('king-lost',.1,{size:size*.84});
  const thiefX=.81+Math.sin(t*2)*.008;duck('usurper',thiefX,{size:small,face:-1,gesture:i<2?.9:.2,emotion:'proud',walk:i===0?.3:0});
  if(i<2){const jarX=w*.75,jarY=ground-small*.5;vPath(c,`M${jarX-12} ${jarY-22} L${jarX+13} ${jarY-22} L${jarX+18} ${jarY+15} Q${jarX} ${jarY+27} ${jarX-18} ${jarY+15}Z`,'#76958d','#3c594a',3);vOval(c,jarX,jarY-22,15,5,'#ac9b6d','#3c594a');}
  if(i===1){for(let j=0;j<3;j++){const a=cineClamp((s-(j+1))/.6);if(a>0)fogPuff(.7-j*.18,ground-size*.4-Math.sin(t+j)*10,Math.min(120,size*.72)*a,j,.8);}cineFog(c,w,h,t,p*.8);}
  if(i===0)fogPuff(.76,ground-small*.65,30+Math.sin(t*6)*3,0,.5);
  if(i===2){const q=(s%2.7)/2.7;duck('player1',.17,{size:small,emotion:'determined',gesture:.3});duck('helper',.27,{size:small,emotion:'curious',gesture:.3});duck('player2',.37,{size:small,gesture:.8,talk:q>.25?1:0,squash:q<.25?-.7:.1});cineRing(c,.4*w,ground-small*.48,cineClamp((q-.2)/.8),'#ffe29d',260);fogPuff(.6+cineEase(q)*.2,ground-small*.4,90,0,1-q*.6);fogPuff(.85,ground-small*.55,90,1,.6);}
  if(i===3){trio(.26,.12,{size:small,gesture:.9,squash:.5,emotion:'determined',talk:p>.6?1:0});cineRing(c,.46*w,ground-small*.5,(s%2)/2,'#ffe8ad',300);cineGlow(c,w*.44,ground-small*.4,250,'#ffe2a1',.15);fogPuff(.81,ground-small*.5,110,2,.7);}
 }
 else if(sceneKey==='outro3'){
  if(i===0){const flight=cineEase((p-.23)/.52),caught=p>.75;trio(.2,.105,{size:small,talk:1,gesture:.9});duck('king-lost',.6,{noCrown:true,gesture:.9,emotion:'surprised'});duck('usurper',.84,{size:small,noCrown:p>.23,face:-1,emotion:'surprised',squash:.2});if(p>.23&&!caught)crown(cineLerp(.84-small*.14/w,.6+size*.14/w,flight),ground-small-(size-small)*flight-Math.sin(flight*Math.PI)*size*1.3,flight*Math.PI*2,cineLerp(small,size,flight)*.53);if(caught)crown(.6+size*.14/w,ground-size,0,size*.53);cineFog(c,w,h,t,1.7*(1-p),p);for(let j=0;j<3;j++)cineRing(c,(.24+j*.105)*w,ground-small*.5,cineClamp((p-j*.06)*2),'#ffedb4',400);}
  if(i===1){duck('king',.63,{face:-1,gesture:1,emotion:'content',squash:p*.6});['player1','player2','helper'].forEach((kind,j)=>duck(kind,cineLerp(.21+j*.1,.45+j*.045,p),{size:small,walk:p<.8?.55:0,gesture:.8,emotion:'happy'}));duck('queen',.78,{face:-1,gesture:.4});}
  if(i===2){duck('king',.64,{face:-1,gesture:.7,emotion:'content'});duck('queen',.79,{face:-1});['player1','player2','helper'].forEach((kind,j)=>{const show=cineEase((p-j*.17)/.28),jump=hop(.3+j*.5,30);duck(kind,.27+j*.105,{size:small,noCrown:true,y:ground-jump,air:jump/30,gesture:1,talk:1,emotion:'surprised'});if(show>0)crown(.27+j*.105+small*.14/w,ground-small-jump-(1-show)*80,0,small*.53);});vOval(c,w*.46,ground+30,38,10,'#d5be8d','#6d7453');vOval(c,w*.46,ground+22,25,18,'#c89752','#7f7952');}
  if(i===3){trio(.19,.085,{size:small,outfit:'royal',emotion:'content'});duck('king',.5,{face:1});duck('queen',cineLerp(.65,.71,p),{gesture:.95,emotion:'determined'});duck('usurper',.86,{size:small,noCrown:true,face:-1,squash:.5,emotion:'sad',gesture:.1});for(let j=0;j<4;j++)cineShoe(c,w*.9+(j%2)*22,ground-j*16,32);}
  if(i===4||i===5){
   // The camera cuts to a bustling family and a very real shoe-polishing gag.
   duck('king',.2,{size:size*.82,face:1,gesture:.3,emotion:'content'});duck('queen',.3,{size:size*.8,face:-1,emotion:'content'});trio(.36,.075,{size:small*.82,outfit:'royal',gesture:.4,walk:.1});
   c.fillStyle='#a17f52';c.fillRect(w*.64,ground-10,w*.25,12);vStroke(c,[[w*.66,ground],[w*.66,ground+40],[w*.87,ground+40],[w*.87,ground]],'#5d6748',7);
   duck('usurper',.72,{size:small,noCrown:true,face:1,gesture:2.95+Math.sin(s*10)*.13,squash:.5,emotion:i===5&&p>.5?'surprised':'sad',talk:i===5?.8:0});
   cineShoe(c,w*.745,ground-42,53);const handX=w*.741+Math.cos(s*10)*5,handY=ground-51+Math.sin(s*10)*4;vOval(c,handX,handY,12,6,'#d5ba7d','#536344');
   for(let j=0;j<12+(i===5&&p>.3?1:0);j++)cineShoe(c,w*.88+((j%3)-1)*30,ground-17-Math.floor(j/3)*29,39,(j%2?1:-1)*.14);
   const glint=(s%1.5)/1.5;if(glint<.6){c.save();c.globalAlpha=1-glint/.6;vStroke(c,[[w*.755-10,ground-50],[w*.755+10,ground-50]],'#fff0b9',2);vStroke(c,[[w*.755,ground-60],[w*.755,ground-40]],'#fff0b9',2);c.restore();}
   if(i===5){c.save();c.globalAlpha=cineEase((p-.4)/.3);c.font=`italic ${Math.max(18,h*.032)}px Georgia`;c.textAlign='center';c.fillStyle='#3f5d45';c.fillText('Made by Maya E. Dahl',w*.46,h*.23);c.restore();}
  }
 }
 // Gentle edge shading gives dimensional light without obscuring the animation.
 const vignette=c.createRadialGradient(w*.5,h*.45,h*.1,w*.5,h*.45,w*.7);vignette.addColorStop(0,'#102d2100');vignette.addColorStop(1,'#102d2144');c.fillStyle=vignette;c.fillRect(0,0,w,h);
 if(s<.32){c.fillStyle=`rgba(19,39,31,${(1-s/.32)*.17})`;c.fillRect(0,0,w,h);}
 canvas.dataset.scene=sceneKey;canvas.dataset.shot=String(i);canvas.dataset.time=shotTime.toFixed(2);
 const bar=$('sceneProgress');if(bar)bar.style.setProperty('--shot-progress',`${p*100}%`);
}
// Readable deterministic surface for book textures, screenshots and regression checks.
window.sharedSceneCanvas={render:renderCinematic,seek(key,index,seconds=0){sceneKey=key;sceneIndex=index;shotTime=seconds;movieTime=index*6+seconds;renderScene();renderCinematic();},get canvas(){return $('cinemaCanvas');}};
