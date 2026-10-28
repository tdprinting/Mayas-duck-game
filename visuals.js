'use strict';
// Maya E. Dahl's round duck, long bill, tiny eye, wing and pointed tail.
// Feet are the anchor; size is the crownless feet-to-head height (100 native units).
function vPath(c,d,fill,stroke='#334639',width=2.8){c.beginPath();const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}}
function vOval(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function vStroke(c,points,color,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function drawRoyalCrown(c,x,y,size=45,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(size/56,size/56);const gold=c.createLinearGradient(0,-30,0,7);gold.addColorStop(0,'#fff0a4');gold.addColorStop(.55,'#e4b34d');gold.addColorStop(1,'#a97331');vPath(c,'M-25 3 L-28 -20 L-13 -11 L-3 -29 L9 -11 L25 -21 L22 5 Q0 -1 -25 3Z',gold);vStroke(c,[[-21,-2],[16,0]],'#fff1ac',2);[-28,-3,25].forEach((a,i)=>vOval(c,a,i===1?-29:-21,2.7,2.7,'#f5d577'));vOval(c,-3,-4,3.3,4,'#b76758');c.restore();}
function renderDuckRig(c,o={}){
 const {x=0,y=0,size=84,time=0,face=-1,kind='player1',outfit='explorer',walk=0,air=0,talk=0,emotion='happy',squash=0,gesture=0,seed=0}=o;
 const moving=Math.min(1,Math.abs(walk)),step=time*12+seed*2,bob=Math.abs(Math.sin(step))*moving*2.6,breath=Math.sin(time*2.5+seed)*.7;
 const gestureAmount=typeof gesture==='number'?gesture:({point:.9,listen:1,hug:.8,polish:.55,cheer:1}[gesture]||0);
 const ink='#334639',royal=kind==='king'||kind==='queen'||kind==='usurper'||outfit==='royal';
 const scarf=kind==='player2'?'#b46043':kind==='helper'?'#8a9858':kind==='usurper'?'#837294':kind.startsWith('king')?'#984e42':kind==='queen'?'#b97a84':'#377c70';
 c.save();c.translate(x,y);c.scale((face>0?-1:1)*size/100,size/100);c.translate(-80,-145);c.lineCap='round';c.lineJoin='round';c.lineWidth=2.8;
 // Alternate webbed feet keep their contact with the ground while waddling.
 for(let i=0;i<2;i++){const k=Math.sin(step+i*Math.PI),fx=(i?91:61)+k*moving*10,fy=138-Math.max(0,k)*moving*8-air*3;c.save();c.translate(fx,fy);c.rotate(k*moving*.22);vPath(c,'M-7 -3 L-14 5 Q-9 8 -4 6 L0 8 L5 5 L13 5 Q15 1 7 -1 L5 -7Z','#cf9448',ink,2);c.restore();}
 c.translate(0,-bob-air*2);c.translate(80,133);c.scale(1+squash*.06+breath*.002,1-squash*.08-breath*.003);c.rotate(Math.sin(step)*moving*.035+air*.08);c.translate(-80,-133);
 const cream=c.createLinearGradient(35,50,115,140);cream.addColorStop(0,kind==='usurper'?'#f3dfb9':'#fff1d1');cream.addColorStop(.53,'#f4e6be');cream.addColorStop(1,'#d8cba3');
 if(outfit==='firefly'||outfit==='woodland'||royal){vPath(c,'M88 86 Q109 101 132 111 L119 136 Q90 137 74 118Z',outfit==='firefly'?'#647759':outfit==='woodland'?'#71885a':kind==='queen'?'#98718b':'#a2544b');}
 vPath(c,'M61 48 Q42 43 40 66 L39 94 Q30 117 47 130 Q66 144 105 132 Q137 124 142 86 Q122 106 99 101 L92 97 L90 65 Q86 45 61 48Z',cream);
 c.save();c.globalAlpha=.22;vPath(c,'M44 100 Q50 127 85 130 Q56 133 43 120Z','#fff9e5',null);for(let i=0;i<13;i++){const px=53+(i*23%62),py=104+(i*13%22);vStroke(c,[[px,py],[px+2,py-1]],'#aa9971',.7);}c.restore();
 // A hinged wing has a different pose for flapping, quacking and pointing.
 c.save();c.translate(89,104);c.rotate(-gestureAmount*.9-Math.sin(time*15)*air*.6+Math.sin(step+1)*moving*.18+Math.sin(time*6)*talk*.12);
 vPath(c,'M-2 0 Q15 16 35 3 Q23 28 2 13 Q-3 7 -2 0Z','#e2d5ad');vStroke(c,[[12,10],[23,12]],'#b7aa84',1.2);vStroke(c,[[10,15],[18,18]],'#b7aa84',1.2);c.restore();
 // The scarf trails behind the direction of travel.
 vPath(c,'M39 92 Q64 101 92 93 L92 102 Q66 112 39 101Z',scarf);c.save();c.translate(82,102);c.rotate(Math.sin(time*5+seed)*(.06+moving*.18)-air*.35);vPath(c,'M0 0 L26 12 L19 22 L-7 4Z',scarf);vStroke(c,[[18,14],[15,18]],'#f7e7bd',1);c.restore();
 c.save();c.translate(61,64);c.rotate((emotion==='curious'?-.1:emotion==='sad'?.1:0)+Math.sin(time*3+seed)*(.015+talk*.025));c.translate(-61,-64);
 const mouth=Math.max(0,Math.sin(time*16))*talk*7;
 if(mouth>1.5)vPath(c,`M40 76 Q19 80 16 87 Q28 ${92+mouth} 40 ${85+mouth}Z`,'#835941',ink,2);
 vPath(c,'M41 72 Q24 77 16 87 Q20 94 40 88','#dea24d');if(mouth>1.5){vPath(c,`M18 89 Q29 ${91+mouth} 39 ${88+mouth} L40 84 Q25 89 18 89Z`,'#e4ad5d',ink,1.6);}
 const blink=Math.sin(time*.83+seed*1.7)>.992;
 if(blink||emotion==='content')vStroke(c,[[50,68],[54,70],[58,68]],ink,2.7);else vOval(c,54,68,emotion==='surprised'?3.8:3,emotion==='sad'?3.5:5,ink);
 if(emotion==='determined')vStroke(c,[[48,61],[57,63]],ink,2);if(emotion==='curious')vStroke(c,[[49,59],[58,57]],ink,1.7);
 vOval(c,57,81,5,3,'#dba18c77');c.restore();
 if(outfit==='rain'){vPath(c,'M31 61 Q35 32 66 33 Q93 35 98 64 L89 66 Q71 42 42 64Z','#d6b657');vPath(c,'M32 61 Q58 53 96 62 L103 68 Q72 64 30 68Z','#e5c56a');}
 if(outfit==='woodland'){vPath(c,'M35 51 Q60 24 88 48 L102 48 Q64 60 32 57Z','#667e50');vPath(c,'M67 41 Q78 15 88 24 Q88 33 67 41Z','#b9a65a');}
 if(outfit==='page'){vPath(c,'M29 45 L41 58 L87 58 L103 43 L83 47 L65 23 L45 46Z','#f5eacb','#55634e',2);vPath(c,'M45 46 L65 23 L66 48 M29 45 L66 48 L103 43 M41 58 L66 48 L87 58',null,'#baac88',1.1);vPath(c,'M71 44 Q73 31 83 32 Q85 40 71 44Z','#d4b15d',null);vStroke(c,[[72,44],[79,35]],'#a17d36',.8);}
 if(royal&&!o.noCrown)drawRoyalCrown(c,66,45,kind==='queen'?48:53,Math.sin(time*2)*.015);
 if(kind==='queen'){vOval(c,42,86,3,4,'#f1d582',ink);vPath(c,'M42 93 Q64 106 90 96',null,'#e9d098',3);}
 if(outfit==='firefly'){for(let i=0;i<3;i++)vOval(c,103+i*7,119+Math.sin(time*3+i)*5,1.5,1.5,'#f8e895');}
 c.restore();
}
function drawStoryEnemy(c,e,time,level=0){
 c.save();c.translate(e.x,e.y);c.lineWidth=2;c.lineJoin='round';const t=time*5+(e.x%13);
 if(level===0){c.rotate((e.angle||0)*.35);vOval(c,0,0,15,16,'#b69055','#596143');vOval(c,0,-9,18,7,'#77784d','#46573c');vStroke(c,[[1,-15],[4,-22]],'#596143',3);[-6,6].forEach(x=>vOval(c,x,0,1.7,2.4,'#334639'));vStroke(c,[[-4,7],[0,9],[4,7]],'#5c5f3d',1.5);for(let i=0;i<3;i++)vStroke(c,[[-13+i*11,14],[-17+i*13+Math.sin(t+i)*3,20]],'#5c6241',2);}
 else if(level===1){const g=c.createRadialGradient(0,-4,1,0,-4,35);g.addColorStop(0,'#d9e7d1aa');g.addColorStop(1,'#8faea400');c.fillStyle=g;c.fillRect(-38,-40,76,75);vPath(c,`M-21 12 Q-31 -7 -15 -14 Q-12 -35 4 -24 Q28 -28 25 -6 Q39 4 21 15 Q13 ${23+Math.sin(t)*4} 0 16 Q-13 25 -21 12Z`,'#b7cdc0aa','#648985',1.5);[-7,7].forEach(x=>vOval(c,x,-5,2.2,3,'#466b69'));vOval(c,1,6,3,4,'#668e83');}
 else if(level===2){vOval(c,0,2,18,11,'#8f9c61','#455f42');[-10,10].forEach((x,i)=>{vOval(c,x,-9,7,8,'#a7b374','#455f42');vOval(c,x+(i?1:-1),-10,2,3,'#304d39');vStroke(c,[[x,7],[x*1.7,12+Math.sin(t+i)*3],[x*2,10]],'#4d6947',3);});vStroke(c,[[-5,4],[0,6],[6,4]],'#486044',1.5);vStroke(c,[[12,-2],[21,-25],[24,-37]],'#80954f',2);}
 else{c.rotate(Math.sin(t)*.07);vPath(c,'M-14 15 L-14 -13 L0 -26 L15 -13 L15 15 L0 9Z','#e8dbb6','#656854',2);vPath(c,'M0 -26 L0 9 L-14 15 M0 9 L15 15',null,'#ac9c79',1);vPath(c,'M-15 -13 L-19 -19 L0 -27 L18 -19 L14 -13Z','#a56a53');[-6,6].forEach(x=>vOval(c,x,-5,1.5,2,'#394e40'));vStroke(c,[[19,13],[19,-31]],'#7c7953',2);vPath(c,'M19 -31 L24 -23 L15 -23Z','#d2bb7e');vStroke(c,[[-8,14],[-10+Math.sin(t)*4,20],[3,20]],'#5b6750',2);vStroke(c,[[7,14],[10-Math.sin(t)*4,20],[17,20]],'#5b6750',2);}
 c.restore();
}
function drawLivingGrass(c,p,time){
 if(p.type==='log'||p.type==='mushroom'||p.type==='stone')return;
 c.save();c.lineCap='round';for(let x=p.x+8;x<p.x+p.w-3;x+=17){const n=Math.abs(Math.sin(x*12.9898)),wind=Math.sin(time*1.9+x*.027)*3.4,h=5+n*12;c.strokeStyle=n>.4?'#65864b':'#97aa65';c.lineWidth=1.3;c.beginPath();c.moveTo(x,p.y-2);c.quadraticCurveTo(x+wind*.6,p.y-h*.65,x+wind+3,p.y-h);c.moveTo(x,p.y-2);c.quadraticCurveTo(x-4+wind,p.y-h*.5,x-4+wind,p.y-h*.75);c.stroke();if(n>.88){vOval(c,x+wind+3,p.y-h,2.9,2.4,n>.97?'#e2a684':'#e4d28b');vOval(c,x+wind+3,p.y-h,1,1,'#95713f');}if(n<.08){for(let k=0;k<3;k++)vStroke(c,[[x,p.y-k*4],[x-5-k,p.y-6-k*4],[x,p.y-k*4],[x+5+k,p.y-7-k*4]],'#648250',1.1);}}
 c.restore();
}
const vTitlePainting=new Image();vTitlePainting.src='assets/cinema-forest.webp';
function renderTitleScene(canvas,time=0){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.save();c.setTransform(w/1200,0,0,h/700,0,0);
 const sky=c.createLinearGradient(0,0,0,700);sky.addColorStop(0,'#cad4b2');sky.addColorStop(.6,'#e8d8ad');sky.addColorStop(1,'#789b78');c.fillStyle=sky;c.fillRect(0,0,1200,700);
 if(vTitlePainting.complete&&vTitlePainting.naturalWidth){const scale=Math.max(1200/vTitlePainting.naturalWidth,700/vTitlePainting.naturalHeight);c.drawImage(vTitlePainting,(1200-vTitlePainting.naturalWidth*scale)/2,(700-vTitlePainting.naturalHeight*scale)/2,vTitlePainting.naturalWidth*scale,vTitlePainting.naturalHeight*scale);}
 else{for(let i=0;i<7;i++){c.fillStyle=i%2?'#789873':'#91a780';c.beginPath();c.ellipse(i*210-35,520,240,130,0,Math.PI,0);c.fill();}vOval(c,630,552,390,66,'#78a79a');}
 for(let i=0;i<14;i++){const x=220+i*57+Math.sin(time*.5+i)*7;vStroke(c,[[x,550+Math.sin(i)*25],[x+20+Math.sin(time+i)*5,550+Math.sin(i)*25]],'#d1dfb84d',1);}
 ['player1','player2','helper'].forEach((kind,i)=>{vOval(c,500+i*120,458,38,6,'#1f392d22');renderDuckRig(c,{x:500+i*120,y:454+Math.sin(i)*6,size:120-i*6,time,kind,face:i===2?-1:1,walk:.12,gesture:i===2?.3:0,seed:i});});
 for(let i=0;i<10;i++){const x=130+i*111+Math.sin(time*.5+i)*10,y=200+i*37%240+Math.cos(time*.7+i)*9;c.globalAlpha=.4+Math.sin(time*2+i)*.25;vOval(c,x,y,2,2,'#f4d788');}c.globalAlpha=1;
 drawLivingGrass(c,{x:0,y:469,w:1200},time);c.restore();
}
