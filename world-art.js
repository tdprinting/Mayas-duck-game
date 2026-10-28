'use strict';
// Painted-by-code scenery for every place in the kingdom: skies, parallax layers, terrain, props and light.
const wNoise=(x,s=0)=>Math.sin(x*.0041+s)*.5+Math.sin(x*.0113+s*2.3)*.3+Math.sin(x*.0271+s*4.1)*.2;
const wHash=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
function wOval(c,x,y,rx,ry,fill,stroke,lw=2){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function wLine(c,pts,color,width=2){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function wGlow(c,x,y,r,color,alpha=1){c.save();c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
// A filled silhouette ridge across the screen, scrolled by a parallax factor.
function wRidge(c,{cam,W,par,base,amp,seed,color,bottom=900,step=16,top=false}){c.beginPath();const off=cam*par;c.moveTo(-20,top?-300:bottom);for(let x=-20;x<=W+20;x+=step){const y=base+wNoise(x+off,seed)*amp;c.lineTo(x,y);}c.lineTo(W+20,top?-300:bottom);c.closePath();c.fillStyle=color;c.fill();}
function wPine(c,x,y,h,color,trunk='#4f5d3e'){c.fillStyle=trunk;c.fillRect(x-3,y-h*.3,6,h*.3);for(let j=0;j<4;j++){const yy=y-h+j*h*.19,ww=h*(.16+j*.08);c.beginPath();c.moveTo(x,yy-8);c.lineTo(x-ww,yy+h*.24);c.quadraticCurveTo(x,yy+h*.2,x+ww,yy+h*.24);c.closePath();c.fillStyle=color;c.fill();}}
function wTree(c,x,y,h,color){c.fillStyle='#5a5240';c.fillRect(x-4,y-h*.45,8,h*.45);[[0,-.75,.32],[-.22,-.58,.26],[.22,-.6,.27],[0,-.5,.3]].forEach(([dx,dy,r])=>wOval(c,x+dx*h,y+dy*h,r*h,r*h*.85,color));}

// ---------- Skies and parallax ----------
function drawBackdrop(c,s,o){
 const {cam,W,H,clock:t}=o,k=s.kind,FULL=H+260;
 if(k==='cave')return caveSky(c,o,FULL);if(k==='cliffs')return cliffSky(c,o,FULL);if(k==='roof')return roofSky(c,o,FULL);
 const im=o.backgrounds[k==='throne'?'platform-castle':'platform-forest'];c.fillStyle=k==='fog'?'#759d93':'#b5c8a5';c.fillRect(0,0,W,FULL);
 if(k==='river'){const sky=c.createLinearGradient(0,0,0,480);sky.addColorStop(0,'#f6cf9a');sky.addColorStop(1,'#b5c8a5');c.fillStyle=sky;c.fillRect(0,0,W,FULL);}
 if(im?.complete&&im.naturalWidth){const tile=H*im.naturalWidth/im.naturalHeight,off=-((cam*.18)%tile);for(let x=off-tile;x<W;x+=tile)c.drawImage(im,x,0,tile,H);}
 if(k==='river'){c.fillStyle='#ffcf8a26';c.fillRect(0,0,W,FULL);wGlow(c,W*.78,90,220,'#fff1c8',.5);}
 if(k==='fog'){c.fillStyle='#133f534a';c.fillRect(0,0,W,FULL);}
 if(k==='throne'){// banners hang from the castle walls behind the courtyard
  for(let i=0;i<8;i++){const x=((i*330-cam*.35)%(W+330)+W+330)%(W+330)-160,sw=Math.sin(t*1.6+i)*5;c.fillStyle=i%2?'#9e4b43':'#3b6e64';c.beginPath();c.moveTo(x,150);c.lineTo(x+46,150);c.lineTo(x+46+sw,265);c.lineTo(x+23+sw,248);c.lineTo(x+sw,265);c.closePath();c.fill();c.strokeStyle='#e5c56a';c.lineWidth=3;c.stroke();drawRoyalCrown(c,x+23+sw*.5,205,26);wLine(c,[[x-6,150],[x+52,150]],'#6a5a3e',5);}
 }
 if(k!=='throne'){
  // Two layers of painted trees drift at different speeds for depth.
  for(let i=0;i<10;i++){const x=((i*230-cam*.3)%(W+230)+W+230)%(W+230)-100,h=150+(i%3)*40;if(k==='fog')wPine(c,x,485,h,'#3e65634d','#30484a4d');else if(i%2)wPine(c,x,485,h,'#5d7f5850','#5466464d');else wTree(c,x,485,h*.8,'#6e8f5a4d');}
  for(let i=0;i<12;i++){const x=((i*170-cam*.45)%(W+170)+W+170)%(W+170)-80;wPine(c,x,490,110+(i%3)*45,k==='fog'?'#416b6966':'#547c5770','#4c5b3e88');}
  // Birds flap across the sky.
  if(k!=='fog')for(let i=0;i<4;i++){const x=((i*400+t*(30+i*6)-cam*.1)%(W+200)+W+200)%(W+200)-100,y=90+i*28+Math.sin(t*.8+i)*12,f=Math.sin(t*8+i*2)*6;wLine(c,[[x-9,y-f],[x,y],[x+9,y-f]],'#3d4c3f99',2);}
  const water=c.createLinearGradient(0,475,0,FULL);water.addColorStop(0,k==='river'?'#6aa7a1':'#77a89a');water.addColorStop(1,k==='river'?'#235766':'#3a7469');c.fillStyle=water;c.fillRect(0,485,W,FULL-485);
  for(let i=0;i<18;i++){const x=((i*149-t*18-cam*.7)%W+W)%W,y=500+i%5*22;wLine(c,[[x,y],[x+43,y]],'#d3e6cc66',2);}
  if(k==='river')for(let i=0;i<7;i++){const x=((i*260-cam*.8)%(W+260)+W+260)%(W+260)-120,y=520+i%3*30+Math.sin(t+i)*2;wOval(c,x,y,24,7,'#5f8f55');c.fillStyle='#6aa7a1';c.beginPath();c.moveTo(x,y);c.lineTo(x+24,y-3);c.lineTo(x+24,y+3);c.fill();if(i%3===0){wOval(c,x-6,y-4,5,4,'#f2c9d6');wOval(c,x-6,y-5,2,2,'#f8e7a0');}}
 }else{c.fillStyle='#b9ad8a';c.fillRect(0,485,W,FULL-485);}
 for(let i=0;i<10;i++){const x=((i*191-cam*.1+Math.sin(t*.6+i)*12)%W+W)%W,y=80+(i*71)%300;c.globalAlpha=.35+(Math.sin(t*1.5+i)+1)*.2;wOval(c,x,y,2.5,2.5,'#ffedb2');}c.globalAlpha=1;
}
function caveSky(c,{cam,W,clock:t},FULL){
 const g=c.createLinearGradient(0,0,0,FULL);g.addColorStop(0,'#0d1320');g.addColorStop(.45,'#1c2a3f');g.addColorStop(1,'#271f3b');c.fillStyle=g;c.fillRect(0,0,W,FULL);
 wRidge(c,{cam,W,par:.08,base:120,amp:70,seed:1,color:'#151d2e',top:true});
 wRidge(c,{cam,W,par:.1,base:420,amp:90,seed:2,color:'#1a2337'});
 // Distant crystal clusters glow in the gloom.
 for(let i=0;i<9;i++){const x=((i*290-cam*.22)%(W+290)+W+290)%(W+290)-140,y=380+wHash(i)*90,hue=i%3===0?'#c79bff':'#7fe3ff';wGlow(c,x,y-20,70,hue+'55',.8+Math.sin(t*1.3+i)*.2);for(let j=0;j<3;j++){const h=24+j*10+wHash(i+j)*14,dx=(j-1)*10;c.fillStyle=hue+'aa';c.beginPath();c.moveTo(x+dx-6,y);c.lineTo(x+dx,y-h);c.lineTo(x+dx+6,y);c.closePath();c.fill();}}
 wRidge(c,{cam,W,par:.25,base:455,amp:50,seed:5,color:'#211b33'});
 for(let i=0;i<40;i++){const x=((i*97-cam*.15)%(W+50)+W+50)%(W+50)-25,y=30+wHash(i*3)*130,b=Math.sin(t*2+i*1.7);c.globalAlpha=.4+b*.35;wOval(c,x,y,1.6,1.6,i%4?'#9ff3ff':'#d7f9c0');wLine(c,[[x,y-12-wHash(i)*20],[x,y]],'#9ff3ff22',1);}c.globalAlpha=1;
 const water=c.createLinearGradient(0,485,0,FULL);water.addColorStop(0,'#1e3b4e');water.addColorStop(1,'#0c1622');c.fillStyle=water;c.fillRect(0,485,W,FULL-485);
 for(let i=0;i<14;i++){const x=((i*151-t*10-cam*.7)%W+W)%W,y=505+i%5*20;wLine(c,[[x,y],[x+30,y]],'#7fe3ff40',1.5);}
}
function cliffSky(c,{cam,W,clock:t},FULL){
 const g=c.createLinearGradient(0,0,0,520);g.addColorStop(0,'#7fb8e0');g.addColorStop(.55,'#cfe5ec');g.addColorStop(1,'#f6e2bb');c.fillStyle=g;c.fillRect(0,0,W,FULL);
 wGlow(c,W*.82,100,260,'#fff6d6',.9);wOval(c,W*.82,100,38,38,'#fff7dc');
 // Fluffy clouds drift on their own breeze.
 for(let i=0;i<7;i++){const x=((i*330+t*(8+i%3*4)-cam*.05)%(W+400)+W+400)%(W+400)-200,y=60+(i*53)%170;c.globalAlpha=.85;for(let j=0;j<5;j++)wOval(c,x+j*28-56,y-Math.sin(j*1.3)*14,32+j%2*8,20+j%3*5,'#ffffff');c.globalAlpha=1;}
 wRidge(c,{cam,W,par:.06,base:300,amp:110,seed:7,color:'#a9a7cf'});
 // snowy caps on the far mountains
 c.save();c.beginPath();const off=cam*.06;c.moveTo(-20,-300);for(let x=-20;x<=W+20;x+=16)c.lineTo(x,300+wNoise(x+off,7)*110+18);c.lineTo(W+20,-300);c.closePath();c.clip();wRidge(c,{cam,W,par:.06,base:300,amp:110,seed:7,color:'#f3f1fb'});c.restore();
 wRidge(c,{cam,W,par:.15,base:380,amp:70,seed:9,color:'#9cbf86'});
 // Windmills and cottages on the middle hills.
 for(let i=0;i<4;i++){const x=((i*620-cam*.15)%(W+620)+W+620)%(W+620)-200,base=380+wNoise(x+cam*.15,9)*70;c.fillStyle='#e8dcc2';c.beginPath();c.moveTo(x-12,base);c.lineTo(x-7,base-62);c.lineTo(x+7,base-62);c.lineTo(x+12,base);c.fill();c.fillStyle='#a8553f';c.beginPath();c.moveTo(x-10,base-62);c.lineTo(x,base-75);c.lineTo(x+10,base-62);c.fill();c.save();c.translate(x,base-62);c.rotate(t*.9+i);for(let b=0;b<4;b++){c.rotate(Math.PI/2);c.fillStyle='#f4ecd8';c.fillRect(-3,4,6,38);c.strokeStyle='#8c7a5c';c.lineWidth=1;c.strokeRect(-3,4,6,38);}c.restore();wOval(c,x,base-62,3,3,'#6c5a44');
  const hx=x+90;c.fillStyle='#f0e4c8';c.fillRect(hx,base-22,30,22);c.fillStyle='#b4614a';c.beginPath();c.moveTo(hx-4,base-22);c.lineTo(hx+15,base-38);c.lineTo(hx+34,base-22);c.fill();c.fillStyle='#f5d77f';c.fillRect(hx+11,base-15,7,7);}
 wRidge(c,{cam,W,par:.35,base:430,amp:55,seed:11,color:'#7fa56c'});
 for(let i=0;i<9;i++){const x=((i*210-cam*.35)%(W+210)+W+210)%(W+210)-100,y=430+wNoise(x+cam*.35,11)*55;wTree(c,x,y+4,46+i%3*12,'#5f8a52');}
 const mist=c.createLinearGradient(0,470,0,FULL);mist.addColorStop(0,'#e8f0ea');mist.addColorStop(1,'#a7c3c6');c.fillStyle=mist;c.fillRect(0,485,W,FULL-485);
 for(let i=0;i<6;i++){const x=((i*260+t*14-cam*.6)%(W+300)+W+300)%(W+300)-150;c.globalAlpha=.6;wOval(c,x,520+i%3*25,140,18,'#ffffff');c.globalAlpha=1;}
}
function roofSky(c,{cam,W,clock:t},FULL){
 const g=c.createLinearGradient(0,0,0,500);g.addColorStop(0,'#232552');g.addColorStop(.38,'#5d4479');g.addColorStop(.72,'#d77e6c');g.addColorStop(1,'#f7c57e');c.fillStyle=g;c.fillRect(0,0,W,FULL);
 for(let i=0;i<60;i++){const x=((i*83-cam*.02)%W+W)%W,y=wHash(i)*190,tw=Math.sin(t*2+i*2.1);c.globalAlpha=Math.max(0,.25+tw*.5)*(1-y/220);wOval(c,x,y,1.3,1.3,'#fff6dd');}c.globalAlpha=1;
 wOval(c,W*.85,80,30,30,'#f6f0d6');wOval(c,W*.85+12,72,26,26,'#3a3266');wGlow(c,W*.85,80,90,'#f6f0d6',.25);
 wGlow(c,W*.28,430,260,'#ffd38a',.75);wOval(c,W*.28,430,70,70,'#ffcf7a');
 // Far town with twinkling windows.
 const town=(par,base,color,hmin,hvar,seed,win)=>{const off=cam*par,sp=70;const start=Math.floor((off-60)/sp);for(let n=start;n<start+W/sp+3;n++){const x=n*sp-off,h=hmin+wHash(n*seed)*hvar,w=sp-6;c.fillStyle=color;c.fillRect(x,base-h,w,h+600);c.beginPath();c.moveTo(x-4,base-h);c.lineTo(x+w/2,base-h-24-wHash(n)*16);c.lineTo(x+w+4,base-h);c.fill();if(wHash(n*7)>.5){c.fillRect(x+w*.7,base-h-30,9,22);}
  if(win)for(let r=0;r<3;r++)for(let q=0;q<2;q++){const on=wHash(n*13+r*3+q)>.45;if(!on)continue;const fl=.75+Math.sin(t*3+n+r)*.1*(wHash(n+r)>.8?1:0);c.globalAlpha=fl;c.fillStyle=win;c.fillRect(x+10+q*26,base-h+14+r*24,10,12);c.globalAlpha=1;c.fillStyle=color;}}};
 town(.08,400,'#57406a',40,70,3,'#ffdf9a88');
 // Castle towers in the middle distance.
 for(let i=0;i<3;i++){const x=((i*900-cam*.18)%(W+900)+W+900)%(W+900)-300;c.fillStyle='#43325a';c.fillRect(x,240,70,300);c.fillRect(x+90,200,50,340);c.beginPath();c.moveTo(x-8,240);c.lineTo(x+35,175);c.lineTo(x+78,240);c.fill();c.beginPath();c.moveTo(x+84,200);c.lineTo(x+115,140);c.lineTo(x+146,200);c.fill();wLine(c,[[x+115,140],[x+115,115]],'#43325a',3);const fw=Math.sin(t*3+i)*4;c.fillStyle='#d9665a';c.beginPath();c.moveTo(x+115,115);c.lineTo(x+138,121+fw);c.lineTo(x+115,128);c.fill();c.fillStyle='#ffd889';c.fillRect(x+28,280,14,20);c.fillRect(x+108,240,12,18);}
 town(.3,470,'#33284a',30,60,5,'#ffd38acc');
 c.fillStyle='#1a1528';c.fillRect(0,500,W,FULL-500);
 for(let i=0;i<6;i++){const x=((i*300-cam*.7)%(W+300)+W+300)%(W+300)-150;wLine(c,[[x,560],[x,515]],'#3b3350',3);wGlow(c,x,512,50,'#ffd38a',.5);wOval(c,x,512,4,4,'#ffe2a6');}
}

// ---------- World-space layers ----------
function drawBackLayer(c,s,o){
 const {cam,W,clock:t}=o,k=s.kind;
 if(k==='cave'){
  // Jagged ceiling with hanging glowworm threads.
  c.fillStyle='#1d1a2c';c.beginPath();c.moveTo(cam-50,-300);for(let x=Math.floor((cam-50)/24)*24;x<=cam+W+60;x+=24){c.lineTo(x,48+wNoise(x,3)*30+(wHash(x)>.8?28:0));}c.lineTo(cam+W+60,-300);c.closePath();c.fill();
  for(let x=Math.floor((cam-50)/60)*60;x<=cam+W+60;x+=60){const h=wHash(x*1.3);if(h>.55){const len=20+h*60,sw=Math.sin(t*.8+x)*2;wLine(c,[[x,60],[x+sw,60+len]],'#7fe3ff30',1);wOval(c,x+sw,62+len,2.4,2.4,'#aaf6ff');wGlow(c,x+sw,62+len,14,'#7fe3ff',.5+Math.sin(t*2+x)*.2);}}
  for(const st of o.stalactites){if(st.state==='gone')continue;c.save();c.translate(st.x,st.y);c.fillStyle='#5b5674';c.strokeStyle='#2b2840';c.lineWidth=2;c.beginPath();c.moveTo(-14,-70);c.lineTo(14,-70);c.lineTo(3,10);c.lineTo(0,18);c.lineTo(-3,10);c.closePath();c.fill();c.stroke();wLine(c,[[-5,-60],[-1,2]],'#8a84a8',2);if(st.state==='hang'&&Math.sin(t*1.3+st.ox)>.9){wOval(c,0,22+((t*40)%30),2,3,'#9fe7ff');}if(st.state==='shake'){c.globalAlpha=.8;wLine(c,[[-20,-75],[-26,-82]],'#c8c2e0',2);wLine(c,[[20,-75],[26,-82]],'#c8c2e0',2);}c.restore();}
 }
 if(k==='cliffs')for(const u of o.updrafts){if(u.x+u.w<cam-50||u.x>cam+W+50)continue;const g=c.createLinearGradient(0,120,0,520);g.addColorStop(0,'#ffffff00');g.addColorStop(.5,'#fffbe833');g.addColorStop(1,'#fffbe855');c.fillStyle=g;c.fillRect(u.x,100,u.w,440);
  for(let j=0;j<14;j++){const y=520-((t*90+j*37)%420),x=u.x+u.w/2+Math.sin(t*2+j*1.7)*u.w*.38;c.save();c.translate(x,y);c.strokeStyle='#fffdf2cc';c.lineWidth=1;for(let r=0;r<6;r++){c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(r+j)*5,-4-Math.sin(r)*2);c.stroke();}wOval(c,0,2,1.2,2.5,'#c8b06a');c.restore();}
  for(let j=0;j<3;j++){c.save();c.globalAlpha=.35;c.strokeStyle='#ffffff';c.lineWidth=2;c.beginPath();const yy=480-((t*60+j*140)%380);c.ellipse(u.x+u.w/2,yy,u.w*.35,10,0,0,Math.PI*1.4);c.stroke();c.restore();}
  label2(c,'↑ BREEZE ↑',u.x+u.w/2,545,'#fff8e2',12);}
 if(k==='river')for(const f of o.fishes||[]){const ph=(f.t%f.period)/f.period;if(ph>.35)continue;const q=ph/.35,x=f.x+q*90,y=500-Math.sin(q*Math.PI)*110;c.save();c.translate(x,y);c.rotate(-Math.cos(q*Math.PI)*1.1);wOval(c,0,0,15,7,'#e98c5a','#7d4a35');c.fillStyle='#e98c5a';c.beginPath();c.moveTo(-13,0);c.lineTo(-24,-7);c.lineTo(-24,7);c.fill();wOval(c,8,-2,1.5,1.5,'#2c3a33');c.restore();if(q<.08||q>.92)for(let d=0;d<3;d++)wOval(c,f.x+(q>.5?90:0)+(d-1)*8,495-d*4,2,3,'#d6efef');}
 if(k==='woods'||k==='river'||k==='cliffs')for(let i=0;i<6;i++){const bx=400+i*640,x=bx+Math.sin(t*.7+i)*60,y=330+Math.sin(t*1.3+i*2)*40;if(x<cam-30||x>cam+W+30)continue;const f=Math.abs(Math.sin(t*14+i));const col=['#f2b45a','#e7869a','#9fc5f0','#f4e27a'][i%4];c.save();c.translate(x,y);c.scale(f*.8+.2,1);wOval(c,-5,-3,6,5,col,'#5a4a3a',1);wOval(c,5,-3,6,5,col,'#5a4a3a',1);wOval(c,-4,4,4,3,col);wOval(c,4,4,4,3,col);c.restore();wLine(c,[[x,y-5],[x,y+5]],'#4a3c2e',1.5);}
 if(k==='fog')for(let i=0;i<5;i++){const x=500+i*800,y=250+i%2*50;if(x<cam-40||x>cam+W+40)continue;const blink=Math.sin(t*.9+i*2)>.95;wOval(c,x-7,y,5,blink?1:5,'#ffe48a');wOval(c,x+7,y,5,blink?1:5,'#ffe48a');wGlow(c,x,y,30,'#ffe48a',.25);}
 if(k==='roof')for(let i=0;i<5;i++){const x=650+i*820;if(x<cam-200||x>cam+W+200)continue;const y=300+i%2*30;wLine(c,[[x,y],[x+170,y]],'#2d2338',1.5);for(let j=0;j<4;j++){const cx=x+20+j*38,sw=Math.sin(t*2.2+j+i)*5;c.fillStyle=['#e4b2b5','#a9cbe0','#f3e2a2','#b9d9a8'][(i+j)%4];c.beginPath();c.moveTo(cx,y+2);c.lineTo(cx+22,y+2);c.lineTo(cx+20+sw,y+30);c.lineTo(cx+2+sw,y+30);c.closePath();c.fill();wLine(c,[[cx+3,y],[cx+3,y+5]],'#5c4b3e',2);wLine(c,[[cx+19,y],[cx+19,y+5]],'#5c4b3e',2);}}
}
function label2(c,text,x,y,color,size){c.font=`600 ${size}px 'Patrick Hand','DM Sans',sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#1d3a2e99';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
function drawFrontLayer(c,s,o){
 // Chimney steam glows when it is about to puff; drawn over the ducks.
 for(const ch of o.chimneys){const cyc=(o.clock+ch.phase)%3.2;if(cyc>1.9&&cyc<2.4){c.save();c.globalAlpha=.6;label2(c,'puff…',ch.x+26,ch.y-18-Math.sin(o.clock*10)*2,'#fff1dd',12);c.restore();}}
}
function drawForeground(c,s,{cam,camY,W,H,clock:t,wind,windDir,windState}){
 const k=s.kind,bottom=H+camY;
 // A few out-of-focus props pass in front at 1.4x speed for depth.
 for(let i=0;i<5;i++){const x=((i*520-cam*1.4)%(W+520)+W+520)%(W+520)-200;c.save();c.globalAlpha=.85;
  if(k==='woods'||k==='river'||k==='cliffs'||k==='fog'){const col=k==='fog'?'#1d3a3a':k==='cliffs'?'#3f6a3a':'#2c4a2c';for(let j=0;j<7;j++){const sw=Math.sin(t*1.5+i+j*.4)*5;wLine(c,[[x+j*9,bottom+10],[x+j*9-20+sw+j*6,bottom-42-(j%3)*16]],col,5);}if(k==='woods'&&i%2===0){wOval(c,x+60,bottom-14,16,10,'#a8553f');wOval(c,x+54,bottom-17,3,2,'#f2e0b8');wOval(c,x+66,bottom-12,3,2,'#f2e0b8');}}
  else if(k==='cave'){c.fillStyle='#0b0a14';c.beginPath();c.moveTo(x-30,bottom+10);c.lineTo(x,bottom-60-i%2*30);c.lineTo(x+26,bottom+10);c.fill();c.beginPath();c.moveTo(x+60,camY-10);c.lineTo(x+80,camY+50+i%3*20);c.lineTo(x+100,camY-10);c.fill();}
  else if(k==='roof'){c.fillStyle='#120e1c';c.fillRect(x,bottom-30,4,40);c.save();c.translate(x+2,bottom-34);c.rotate(Math.sin(t*.5+i)*.4);c.fillRect(-14,-2,28,4);c.beginPath();c.moveTo(14,-6);c.lineTo(22,0);c.lineTo(14,6);c.fill();c.restore();}
  c.restore();}
 if(k==='cliffs'&&wind>.05){c.save();c.globalAlpha=wind*.55;c.strokeStyle='#ffffff';c.lineWidth=2;for(let i=0;i<14;i++){const y=camY+40+(i*47)%(H-80),x=((i*233+t*700*windDir)%(W+300)+W+300)%(W+300)-150;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+40*windDir,y-8,x+80*windDir,y+8,x+130*windDir,y);c.stroke();}c.restore();}
 if(k==='cliffs'&&windState==='warn'){c.save();c.globalAlpha=.25+Math.sin(t*20)*.1;label2(c,windDir<0?'⟵ gust coming!':'gust coming! ⟶',W/2,camY+H*.22,'#ffffff',18);c.restore();}
}

// ---------- Terrain ----------
const PAL={
 woods:{top:'#b09a6d',mid:'#938059',bot:'#7d7353',stroke:'#6a7650',cap:'#879d65'},
 fog:{top:'#9e9a78',mid:'#7f7d5f',bot:'#68694f',stroke:'#56664d',cap:'#6f8f68'},
 river:{top:'#b8a272',mid:'#9a865c',bot:'#7d7353',stroke:'#6a7650',cap:'#8fa66a'},
 cliffs:{top:'#e2d6b0',mid:'#cbbd92',bot:'#ad9f78',stroke:'#8b8a64',cap:'#9cbf6a'},
 cave:{top:'#5d5873',mid:'#433f58',bot:'#2a2738',stroke:'#211e2e',cap:'#3f6e64'},
 throne:{top:'#d4c9a5',mid:'#bfb596',bot:'#a6a48c',stroke:'#7a8066',cap:'#dfd5aa'}
};
function drawTerrain(c,q,{cam,W,clock:t,kind}){
 const T=q.type;
 if(T==='mushroom')return drawMushroom(c,q,t);
 if(T==='log'){c.fillStyle='#9b8055';c.beginPath();c.roundRect(q.x,q.y,q.w,q.h,12);c.fill();c.strokeStyle='#5f6546';c.lineWidth=2;c.stroke();for(let i=0;i<4;i++)wLine(c,[[q.x+14,q.y+5+i*5],[q.x+q.w-12,q.y+5+i*5]],i%2?'#b59d69':'#7d704c',1);wOval(c,q.x+10,q.y+12,9,10,'#baa373','#756e48');wOval(c,q.x+10,q.y+12,4,5,null,'#8a7a50',1);wOval(c,q.x+q.w*.6,q.y-3,10,4,'#77a35a');const r=(t*2+q.x)%3;if(r<1){c.globalAlpha=1-r;wOval(c,q.x+q.w/2,q.y+q.h+2,q.w*.55*(0.6+r*.5),5,null,'#dbeee6',1.5);c.globalAlpha=1;}return;}
 if(T==='cloud'){const sq=Math.sin((q.squish||0)*20)*3;c.save();c.translate(0,sq);for(let i=0;i<5;i++)wOval(c,q.x+12+i*(q.w-24)/4,q.y+8-Math.sin(i*1.4)*6,22,15,'#ffffff','#c9d9e6',1.5);for(let i=0;i<5;i++)wOval(c,q.x+12+i*(q.w-24)/4,q.y+8-Math.sin(i*1.4)*6,20,13,'#ffffff');wOval(c,q.x+q.w*.5,q.y+16,q.w*.45,9,'#e8f1f8');wLine(c,[[q.x+q.w*.4,q.y+8],[q.x+q.w*.43,q.y+10],[q.x+q.w*.46,q.y+8]],'#6f8aa0',1.8);wLine(c,[[q.x+q.w*.56,q.y+8],[q.x+q.w*.59,q.y+10],[q.x+q.w*.62,q.y+8]],'#6f8aa0',1.8);wOval(c,q.x+q.w*.37,q.y+13,4,2,'#f4bfc8');wOval(c,q.x+q.w*.65,q.y+13,4,2,'#f4bfc8');c.restore();return;}
 if(T==='chimney'){const cyc=(t+q.phase)%3.2,warn=cyc>1.9&&cyc<2.4?Math.sin(t*50)*1.5:0;c.save();c.translate(warn,0);c.fillStyle='#a3533f';c.fillRect(q.x+4,q.y+10,q.w-8,q.h);c.strokeStyle='#5a2e26';c.lineWidth=2;c.strokeRect(q.x+4,q.y+10,q.w-8,q.h);for(let r=0;r<q.h/10;r++){wLine(c,[[q.x+4,q.y+20+r*10],[q.x+q.w-4,q.y+20+r*10]],'#7d3d30',1);for(let b=0;b<3;b++)wLine(c,[[q.x+12+b*13+(r%2)*6,q.y+10+r*10],[q.x+12+b*13+(r%2)*6,q.y+20+r*10]],'#7d3d30',1);}c.fillStyle='#6b3a30';c.fillRect(q.x-2,q.y,q.w+4,12);c.strokeRect(q.x-2,q.y,q.w+4,12);if(cyc>1.9&&cyc<2.4)wGlow(c,q.x+q.w/2,q.y,40,'#ffe2c0',.5);c.restore();return;}
 if(T==='crumble'){if(q.state==='gone')return;c.save();if(q.state==='shaking')c.translate(Math.sin(t*70)*2.5,0);if(q.state==='falling'){c.globalAlpha=Math.max(0,1-(q.y-q.oy)/200);c.translate(q.x+q.w/2,q.y);c.rotate((q.y-q.oy)*.003);c.translate(-q.x-q.w/2,-q.y);}
  if(kind==='roof'){c.fillStyle='#8a5a3e';c.beginPath();c.roundRect(q.x,q.y,q.w,16,4);c.fill();c.strokeStyle='#4e3022';c.lineWidth=2;c.stroke();for(let x=q.x+12;x<q.x+q.w-6;x+=22)wLine(c,[[x,q.y+2],[x,q.y+14]],'#5e3a28',1.5);}
  else{const p=PAL[kind]||PAL.cave;c.fillStyle=p.top;c.beginPath();c.roundRect(q.x,q.y,q.w,q.h,8);c.fill();c.strokeStyle=p.stroke;c.lineWidth=2;c.stroke();c.fillStyle=p.cap;c.beginPath();c.roundRect(q.x-2,q.y-4,q.w+4,9,5);c.fill();}
  wLine(c,[[q.x+q.w*.3,q.y+1],[q.x+q.w*.38,q.y+10],[q.x+q.w*.32,q.y+17]],'#1d1a26',1.6);wLine(c,[[q.x+q.w*.68,q.y+3],[q.x+q.w*.62,q.y+12],[q.x+q.w*.7,q.y+20]],'#1d1a26',1.6);c.restore();return;}
 if(T==='roof')return drawRoof(c,q,cam,W,t);
 if(T==='beam'){c.fillStyle='#8a6448';c.beginPath();c.roundRect(q.x,q.y,q.w,14,3);c.fill();c.strokeStyle='#4e3324';c.lineWidth=2;c.stroke();wLine(c,[[q.x+6,q.y+5],[q.x+q.w-6,q.y+5]],'#a8805c',1.5);for(const bx of [q.x+16,q.x+q.w-16]){wLine(c,[[bx,q.y+14],[bx,q.y+40]],'#4e3324',4);}c.fillStyle='#d7c27e';for(let x=q.x+20;x<q.x+q.w-10;x+=30){const sw=Math.sin(t*2+x)*3;wLine(c,[[x,q.y+14],[x+sw,q.y+26]],'#4e3324',1);wOval(c,x+sw,q.y+30,5,6,['#f2c46a','#e88a7a','#9ccfe6'][(x/30|0)%3]);}return;}
 const stone=T==='stone'||T==='stoneledge',rock=T==='rock'||T==='rockledge',p=stone?PAL.throne:PAL[kind]||PAL.woods;
 const earth=c.createLinearGradient(0,q.y,0,q.y+q.h);earth.addColorStop(0,p.top);earth.addColorStop(.5,p.mid);earth.addColorStop(1,p.bot);c.fillStyle=earth;c.beginPath();c.roundRect(q.x,q.y,q.w,q.h,q.h>30?[9,9,0,0]:9);c.fill();c.strokeStyle=p.stroke;c.lineWidth=2;c.stroke();
 c.fillStyle=p.cap;c.beginPath();c.roundRect(q.x-2,q.y-5,q.w+4,13,6);c.fill();
 if(!stone&&!rock){c.fillStyle=p.cap;for(let x=q.x+4;x<q.x+q.w-6;x+=14){if(x<cam-20||x>cam+W+20)continue;c.beginPath();c.arc(x+7,q.y+7,6+Math.sin(x)*1.5,0,Math.PI);c.fill();}}
 for(let j=0;j<80;j++){const x=q.x+((Math.sin(j*17.91)*.5+.5)*q.w),y=q.y+12+(Math.cos(j*13.17)*.5+.5)*(q.h-16);if(x>cam-20&&x<cam+W+20){c.globalAlpha=.14;wOval(c,x,y,3+j%5,1.5+j%3,j%2?'#f4e3b5':'#3d4a36');}}c.globalAlpha=1;
 for(let x=q.x+12;x<q.x+q.w;x+=30){if(x<cam-20||x>cam+W+20)continue;const n=wHash(x);
  if(stone){wLine(c,[[x,q.y+16],[x+18,q.y+16]],'#928b71',1);if(q.h>30)wLine(c,[[x+6,q.y+30],[x+6,q.y+44]],'#9e9675',1);}
  else if(rock){if(n>.6){c.fillStyle=n>.85?'#c79bff':'#7fe3ff';c.beginPath();c.moveTo(x,q.y);c.lineTo(x+4,q.y-12-n*8);c.lineTo(x+8,q.y);c.fill();wGlow(c,x+4,q.y-6,16,n>.85?'#c79bff':'#7fe3ff',.35);}if(q.h>30){wOval(c,x+8,q.y+30+(x%3)*14,4,3,'#6b6688');if(n<.2)wOval(c,x+12,q.y+60,6,4,'#3a8e86aa');}if(n>.3&&n<.4)for(let m=0;m<3;m++)wOval(c,x+m*4,q.y+2,1.5,1.5,'#9ff3ff');}
  else{if(q.h>30)wLine(c,[[x+5,q.y+12],[x+7,q.y+22],[x+2,q.y+31]],'#78805288',1.3);if(q.h>30){wOval(c,x+8,q.y+36+(x%3)*10,3,2,'#b6a075');if(n>.88)wOval(c,x+14,q.y+70,7,5,'#a49a86','#7d7560',1);}if(n<.1&&q.h>30){wLine(c,[[x+10,q.y+40],[x+18,q.y+52],[x+12,q.y+64]],'#6b8a50',1.5);}}}
 if(!stone&&!rock&&typeof drawLivingGrass==='function')drawLivingGrass(c,{x:q.x,y:q.y,w:q.w,type:'ground'},t);
 if(rock&&q.h>30){c.save();c.globalAlpha=.5;for(let x=q.x+20;x<q.x+q.w;x+=70){if(x<cam-40||x>cam+W+40)continue;const sw=Math.sin(t+x)*2;wLine(c,[[x,q.y+4],[x+sw,q.y+18+wHash(x)*20]],'#4f8f72',2);}c.restore();}
}
function drawMushroom(c,q,t){const squish=q.squish>0?Math.sin(q.squish*12)*7:0,glow=q.glow;
 if(glow)wGlow(c,q.x+39,q.y,80,'#7fe3ff',.35+Math.sin(t*2+q.x)*.1);
 c.fillStyle=glow?'#cfe3e8':'#e8d3a2';c.beginPath();c.roundRect(q.x+29,q.y+4,20,31,4);c.fill();c.strokeStyle='#736b48';c.lineWidth=2;c.stroke();
 c.save();c.translate(q.x+39,q.y+3+squish);c.scale(1+squish*.02,1-squish*.03);
 c.beginPath();c.ellipse(0,0,45,18,0,Math.PI,0);c.quadraticCurveTo(0,10,-45,0);c.fillStyle=glow?'#4fb7c9':'#c4704a';c.fill();c.strokeStyle=glow?'#2b5e6a':'#6c4a35';c.lineWidth=2;c.stroke();
 c.beginPath();c.ellipse(-8,-9,22,6,-.2,Math.PI,0);c.fillStyle='#ffffff30';c.fill();
 [[-24,-4,7,4],[6,-12,8,5],[26,-3,6,3],[-6,-2,4,2]].forEach(([x,y,rx,ry])=>wOval(c,x,y,rx,ry,glow?'#d8fbff':'#f6e6b8'));
 wLine(c,[[-6,8],[-3,10],[0,8]],'#5a3d2a',1.6);wOval(c,-12,6,1.6,2.2,'#3a2a20');wOval(c,6,6,1.6,2.2,'#3a2a20');
 c.restore();}
function drawRoof(c,q,cam,W,t){
 // Plaster wall with timber beams and warm windows under a scalloped tiled roof.
 const top=q.y;c.fillStyle='#e7d6b4';c.fillRect(q.x+6,top+16,q.w-12,q.h);c.strokeStyle='#5b4030';c.lineWidth=2;c.strokeRect(q.x+6,top+16,q.w-12,q.h);
 for(let x=q.x+6;x<q.x+q.w-6;x+=80){if(x<cam-90||x>cam+W+90)continue;wLine(c,[[x,top+16],[x,top+q.h]],'#6d4c3b',5);wLine(c,[[x,top+40],[Math.min(x+80,q.x+q.w-6),top+80]],'#6d4c3b',4);const wx=x+28;if(wx+26<q.x+q.w-6){const lit=wHash(wx)>.35;c.fillStyle=lit?'#ffd88a':'#5b5170';c.fillRect(wx,top+56,24,30);if(lit)wGlow(c,wx+12,top+71,40,'#ffd88a',.4);wLine(c,[[wx+12,top+56],[wx+12,top+86]],'#6d4c3b',2);wLine(c,[[wx,top+71],[wx+24,top+71]],'#6d4c3b',2);c.strokeStyle='#6d4c3b';c.strokeRect(wx,top+56,24,30);c.fillStyle='#4f7f73';c.fillRect(wx-9,top+54,8,34);c.fillRect(wx+25,top+54,8,34);if(wHash(wx*2)>.6){c.fillStyle='#8a5a3e';c.fillRect(wx-4,top+88,32,7);for(let f=0;f<3;f++)wOval(c,wx+3+f*9,top+86,4,4,['#e88a9a','#f2d36a','#ffffff'][f]);}}}
 c.fillStyle='#b5553f';c.beginPath();c.roundRect(q.x-6,top-4,q.w+12,24,6);c.fill();c.strokeStyle='#5e2a20';c.lineWidth=2;c.stroke();
 for(let r=0;r<2;r++)for(let x=q.x-2+(r%2)*8;x<q.x+q.w+2;x+=16){if(x<cam-20||x>cam+W+20)continue;c.beginPath();c.arc(x+8,top+2+r*9,8,0,Math.PI);c.fillStyle=r?'#a44a36':'#c96a4f';c.fill();c.strokeStyle='#7a3628';c.lineWidth=1;c.stroke();}
 wLine(c,[[q.x-6,top-4],[q.x+q.w+6,top-4]],'#e89a7a',2);
}
function drawFlag(c,f,t){const y=f.y;wLine(c,[[f.x,y],[f.x,y-92]],'#706b48',4);wOval(c,f.x,y-93,4,4,'#d7b65a');c.beginPath();c.moveTo(f.x,y-90);for(let i=0;i<=8;i++){const xx=f.x+i*5.5,yy=y-88+Math.sin(t*5-i*.7)*(2+i*.4);c.lineTo(xx,yy+(i===8?7:0));}for(let i=8;i>=0;i--){const xx=f.x+i*5.5,yy=y-64+Math.sin(t*5-i*.7)*(2+i*.4)-i*1.2;c.lineTo(xx,yy);}c.closePath();c.fillStyle=f.lit?'#d9a845':'#718b6b';c.fill();c.strokeStyle=f.lit?'#8a6a2a':'#4f6650';c.lineWidth=1.5;c.stroke();if(f.lit){c.fillStyle='#fff3c4';c.font='600 13px serif';c.textAlign='center';c.fillText('♛',f.x+21,y-71);}else label2(c,'CHECKPOINT',f.x,y-108,'#f6eccd',12);}
function drawGateLight(c,l,t,image,label){
 if(l.style==='crystal'){const lit=l.lit;if(lit)wGlow(c,l.x,l.y-20,150,'#8ff0ff',.55+Math.sin(t*2)*.1);[[-14,32,-.25],[0,52,0],[14,38,.25],[-6,22,-.5],[9,20,.5]].forEach(([dx,h,a],i)=>{c.save();c.translate(l.x+dx,l.y+30);c.rotate(a);const g=c.createLinearGradient(0,-h,0,0);g.addColorStop(0,lit?'#f2feff':'#8a83a8');g.addColorStop(1,lit?(i%2?'#79d9ff':'#c39bff'):'#4b4664');c.fillStyle=g;c.beginPath();c.moveTo(-7,0);c.lineTo(-6,-h*.7);c.lineTo(0,-h);c.lineTo(6,-h*.7);c.lineTo(7,0);c.closePath();c.fill();c.strokeStyle=lit?'#ffffff':'#2e2a40';c.lineWidth=1.5;c.stroke();c.restore();});if(l.ring>0){c.save();c.globalAlpha=l.ring/1.5;c.strokeStyle='#bff6ff';c.lineWidth=3;c.beginPath();c.arc(l.x,l.y-15,40+(1.5-l.ring)*100,0,Math.PI*2);c.stroke();c.restore();}if(!lit)label2(c,'QUACK',l.x,l.y-48+Math.sin(t*3)*3,'#d7f6ff',13);return;}
 if(l.style==='bell'){const y=l.y-50,sw=l.lit?Math.sin(t*6)*Math.max(.15,l.ring*.5):0;c.fillStyle='#6d4c3b';c.fillRect(l.x-34,y-40,7,82);c.fillRect(l.x+27,y-40,7,82);c.beginPath();c.moveTo(l.x-44,y-36);c.lineTo(l.x,y-62);c.lineTo(l.x+44,y-36);c.closePath();c.fillStyle='#b5553f';c.fill();c.strokeStyle='#5e2a20';c.lineWidth=2;c.stroke();wLine(c,[[l.x-30,y-34],[l.x+30,y-34]],'#4e3324',4);
  if(l.lit)wGlow(c,l.x,y,110,'#ffd889',.45);c.save();c.translate(l.x,y-34);c.rotate(sw);const g=c.createLinearGradient(-20,0,20,0);g.addColorStop(0,l.lit?'#a8742e':'#5d5038');g.addColorStop(.4,l.lit?'#ffe7a0':'#8c7a58');g.addColorStop(1,l.lit?'#b27e34':'#5d5038');c.fillStyle=g;c.beginPath();c.moveTo(-6,2);c.quadraticCurveTo(-16,8,-17,28);c.lineTo(-22,38);c.lineTo(22,38);c.lineTo(17,28);c.quadraticCurveTo(16,8,6,2);c.closePath();c.fill();c.strokeStyle='#4e3a20';c.lineWidth=2;c.stroke();wOval(c,0,40,5,5,'#4e3a20');c.restore();
  if(l.ring>0)for(let r=0;r<3;r++){const p=((1.5-l.ring)*1.4+r*.3)%1;c.save();c.globalAlpha=(1-p)*.8;c.strokeStyle='#ffe7a0';c.lineWidth=3;c.beginPath();c.arc(l.x,y,30+p*120,-Math.PI*.9,-Math.PI*.1);c.stroke();c.restore();}
  if(!l.lit)label2(c,'QUACK',l.x,y-75+Math.sin(t*3)*3,'#ffe9b8',13);return;}
 if(l.lit){wGlow(c,l.x,l.y,130,'#ffe7a2',.45);}image('lantern',l.x,l.y-5,52);if(l.lit){for(let i=0;i<4;i++){const a=t*1.5+i*1.6;wOval(c,l.x+Math.cos(a)*28,l.y-10+Math.sin(a*1.3)*18,1.8,1.8,'#fff3b0');}}if(!l.lit)label2(c,'QUACK',l.x,l.y-45+Math.sin(t*3)*3,'#f5e5b6',13);
}
function drawBarrier(c,x,y,t,kind){const post=kind==='cave'?'#4b4664':kind==='roof'?'#6d4c3b':'#756c50',bar=kind==='cave'?'#8a83a8':kind==='roof'?'#a8805c':'#c0b079';wLine(c,[[x,y],[x,y-135]],post,7);for(let j=0;j<3;j++)wLine(c,[[x-25,y-100+j*30],[x+25,y-100+j*30]],bar,7);c.save();c.globalAlpha=.6+Math.sin(t*3)*.2;label2(c,kind==='cave'?'wake the crystals!':kind==='roof'?'ring the bells!':kind==='river'?'find the keys!':'light the lanterns!',x,y-150,'#fff1c8',13);c.restore();}
function drawExit(c,s,x,t,h){
 const y=groundYAt(x+20);
 if(s.findKing){h.drawDuck({x:x+20,y,face:-1,index:3,vx:0,vy:0,grounded:true,idle:0},'king-lost');if(h.kingCall>0){c.strokeStyle='#efd28c';c.lineWidth=3;c.beginPath();c.arc(x+20,y-50,30+(Math.sin(t*5)+1)*15,0,Math.PI*2);c.stroke();h.label('“Over here!”',x,y-120,'#ffe3a4',20);}else if(Math.sin(t*.8)>.6)h.label('“Hello? Anyone?”',x+10,y-110,'#e9e2c8',15);return;}
 if(s.kind==='woods'){c.save();c.translate(x+20,y);wLine(c,[[-50,0],[-50,-120]],'#6b5a3e',10);wLine(c,[[50,0],[50,-120]],'#6b5a3e',10);c.beginPath();c.moveTo(-62,-112);c.quadraticCurveTo(0,-170,62,-112);c.strokeStyle='#6b5a3e';c.lineWidth=12;c.stroke();for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;wOval(c,Math.cos(a)*58,-118+Math.sin(a)*40,9,7,i%2?'#6f9a52':'#83ad5f');}for(let i=0;i<5;i++)wOval(c,-50+Math.sin(i)*5,-20-i*22,6,5,'#77a35a');wGlow(c,0,-60,90,'#fff3c4',.35+Math.sin(t*2)*.1);c.restore();h.label('WOODLAND GATE',x+20,y-180,'#f6ebce',15);return;}
 if(s.kind==='cave'){wGlow(c,x+30,y-70,170,'#fff1c8',.75);c.fillStyle='#fff7df';c.beginPath();c.ellipse(x+30,y-60,48,70,0,Math.PI,0);c.lineTo(x+78,y);c.lineTo(x-18,y);c.fill();for(let i=0;i<6;i++){const a=t*.5+i;wLine(c,[[x+30,y-60],[x+30+Math.cos(a)*140,y-60+Math.sin(a)*90]],'#fff3c422',8);}h.label(s.exitLabel,x+30,y-150,'#fff3cf',15);return;}
 if(s.kind==='cliffs'){wLine(c,[[x,y],[x,y-90]],'#6b5a3e',6);c.fillStyle='#c9a46a';c.beginPath();c.moveTo(x-10,y-90);c.lineTo(x+60,y-90);c.lineTo(x+75,y-78);c.lineTo(x+60,y-66);c.lineTo(x-10,y-66);c.fill();c.strokeStyle='#6b5a3e';c.lineWidth=2;c.stroke();c.fillStyle='#4e3a28';c.font="600 11px 'Patrick Hand',sans-serif";c.textAlign='center';c.fillText('RIVER →',x+30,y-74);for(let i=0;i<8;i++){const bx=x-80+i*22,by=y-130+Math.sin(i*.5)*10+Math.sin(t*3+i)*3;c.fillStyle=['#e88a7a','#f2d36a','#8fc5e8','#9fd08a'][i%4];c.beginPath();c.moveTo(bx,by);c.lineTo(bx+16,by);c.lineTo(bx+8,by+16);c.fill();}wLine(c,[[x-86,y-132],[x+96,y-128]],'#6b5a3e',1.5);h.label(s.exitLabel,x+30,y-150,'#fff5dc',15);return;}
 if(s.kind==='river'){h.image('castle',x+20,y-65,140);for(let i=0;i<3;i++){const fx=x-20+i*40,fy=y-150-i%2*16,fw=Math.sin(t*4+i)*4;wLine(c,[[fx,fy],[fx,fy-24]],'#5a4a3a',2);c.fillStyle=i%2?'#3b6e64':'#9e4b43';c.beginPath();c.moveTo(fx,fy-24);c.lineTo(fx+18,fy-20+fw);c.lineTo(fx,fy-14);c.fill();}h.label(s.exitLabel,x+20,y-188,'#f6ebce',15);return;}
 if(s.kind==='roof'){c.fillStyle='#4e3324';c.fillRect(x-8,y-120,64,120);c.fillStyle='#b5553f';c.beginPath();c.moveTo(x-20,y-118);c.lineTo(x+24,y-168);c.lineTo(x+68,y-118);c.fill();c.fillStyle='#ffd889';c.beginPath();c.roundRect(x+6,y-90,36,90,[18,18,0,0]);c.fill();wGlow(c,x+24,y-50,90,'#ffd889',.5);h.label(s.exitLabel,x+24,y-180,'#fff0d0',15);}
}
// Darkness with soft holes of light for the grotto.
let darkCanvas=null;
function drawDarkness(c,o){
 const {cam,camY,W,H,clock:t,canvas}=o;if(!darkCanvas)darkCanvas=document.createElement('canvas');const d=darkCanvas;if(d.width!==canvas.width||d.height!==canvas.height){d.width=canvas.width;d.height=canvas.height;}
 const x=d.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(0,0,d.width,d.height);x.setTransform(d.width/W,0,0,d.height/H,0,0);
 const lit=o.lanterns.filter(l=>l.lit).length;x.fillStyle=`rgba(6,8,20,${.86-lit*.08})`;x.fillRect(0,0,W,H);x.globalCompositeOperation='destination-out';
 const hole=(wx,wy,r,a=1)=>{const sx=wx-cam,sy=wy-camY;if(sx<-r||sx>W+r)return;const g=x.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.55,`rgba(0,0,0,${a*.7})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-r,sy-r,r*2,r*2);};
 for(const p of o.allDucks)hole(p.x,p.y-30,(p.index<2?175:110)+Math.sin(t*3+p.index)*6,1);
 for(const l of o.lanterns)hole(l.x,l.y-10,l.lit?300:60,l.lit?1:.5);
 for(const m of o.mushrooms)hole(m.x+39,m.y,120,.8);
 for(const f of o.pickups)if(!f.taken)hole(f.x,f.y,34,.6);
 for(const e of o.enemies)if(e.alive&&e.kind==='bat')hole(e.x,e.y,30,.5);
 hole(STAGES[level].exit+30,groundYAt(STAGES[level].exit)-60,200,1);
 for(let i=0;i<30;i++){const wx=Math.floor(cam/60)*60+i*60;if(wHash(wx*1.3)>.55)hole(wx,62+(20+wHash(wx*1.3)*60),22,.6);}
 c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(d,0,0);c.restore();
}
