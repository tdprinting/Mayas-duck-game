'use strict';
// Every sound in the kingdom is synthesised live: no audio files to download.
const SFX=(()=>{
 let ctx=null,master=null,sfxBus=null,musicBus=null,noiseBuf=null,song=null,timer=null,step=0,nextTime=0,musicWanted=null;
 let musicOn=true;
 try{musicOn=localStorage.getItem('maya-music')!=='off';}catch{}
 function init(){
  if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();
  master=ctx.createGain();master.gain.value=.85;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.2;master.connect(comp).connect(ctx.destination);
  sfxBus=ctx.createGain();sfxBus.gain.value=.9;sfxBus.connect(master);
  musicBus=ctx.createGain();musicBus.gain.value=0;musicBus.connect(master);
  // A soft echo gives the music a storybook "room".
  const delay=ctx.createDelay(1);delay.delayTime.value=.3;const fb=ctx.createGain();fb.gain.value=.3;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1900;const wet=ctx.createGain();wet.gain.value=.4;
  musicBus.connect(delay);delay.connect(lp);lp.connect(fb);fb.connect(delay);lp.connect(wet);wet.connect(master);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return ctx;
 }
 function wake(){const c=init();if(c&&c.state!=='running')c.resume().catch(()=>{});return c;}
 const now=()=>ctx.currentTime;
 function tone({f=440,f2=null,type='sine',at=null,t=0,dur=.2,vol=.2,attack=.006,bus,filter=null,vib=0,vibRate=6,linear=false,release=null}){
  const st=at??now()+t,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,st);
  if(f2){if(linear)o.frequency.linearRampToValueAtTime(f2,st+dur);else o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),st+dur);}
  if(vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=vibRate;lg.gain.value=vib;l.connect(lg).connect(o.frequency);l.start(st);l.stop(st+dur+.1);}
  g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol,st+attack);g.gain.exponentialRampToValueAtTime(.0006,st+(release??dur));
  let node=o;if(filter){const fl=ctx.createBiquadFilter();fl.type=filter.type||'lowpass';fl.frequency.setValueAtTime(filter.f,st);if(filter.f2)fl.frequency.exponentialRampToValueAtTime(filter.f2,st+dur);fl.Q.value=filter.q||1;node.connect(fl);node=fl;}
  node.connect(g).connect(bus||sfxBus);o.start(st);o.stop(st+(release??dur)+.05);
 }
 function noise({at=null,t=0,dur=.2,vol=.2,f=1200,f2=null,type='bandpass',q=1,attack=.004,bus}){
  const st=at??now()+t,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,st);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,st+dur);fl.Q.value=q;
  g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol,st+attack);g.gain.exponentialRampToValueAtTime(.0006,st+dur);s.connect(fl).connect(g).connect(bus||sfxBus);s.start(st,Math.random()*.5);s.stop(st+dur+.05);
 }
 // A nasal duck voice: buzzy sawtooth through two "beak" formants with a quick pitch dip.
 function quack(pitch=1,t=0,vol=.6){
  const st=now()+t,o=ctx.createOscillator(),o2=ctx.createOscillator();o.type='sawtooth';o2.type='square';const base=280*pitch;
  for(const [osc,m] of [[o,1],[o2,1.007]]){osc.frequency.setValueAtTime(base*1.2*m,st);osc.frequency.linearRampToValueAtTime(base*1.45*m,st+.035);osc.frequency.exponentialRampToValueAtTime(base*.78*m,st+.19);}
  const f1=ctx.createBiquadFilter();f1.type='bandpass';f1.frequency.setValueAtTime(800,st);f1.frequency.linearRampToValueAtTime(1350,st+.05);f1.frequency.linearRampToValueAtTime(650,st+.2);f1.Q.value=3.5;
  const f2=ctx.createBiquadFilter();f2.type='bandpass';f2.frequency.value=2400*pitch;f2.Q.value=5;
  const mix=ctx.createGain(),g=ctx.createGain(),g2=ctx.createGain();g2.gain.value=.25;mix.gain.value=1;
  g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(vol,st+.012);g.gain.setValueAtTime(vol*.9,st+.1);g.gain.exponentialRampToValueAtTime(.001,st+.23);
  o.connect(f1);o.connect(f2);o2.connect(g2).connect(f1);f1.connect(mix);f2.connect(mix);mix.connect(g).connect(sfxBus);
  for(const osc of [o,o2]){osc.start(st);osc.stop(st+.26);}
 }
 function bell(f=880,t=0,vol=.16,len=1.4){[[1,1],[2.76,.45],[5.4,.22],[8.9,.1]].forEach(([m,v])=>tone({f:f*m,t,dur:len/m**.3,vol:vol*v,attack:.003}));}
 const PENTA=[0,2,4,7,9,12,14,16,19,21,24,26,28,31];
 const play={
  quack:(who=0)=>{const pitch=[1,1.18,.86,.74,.9][who]??1;quack(pitch*(.97+Math.random()*.06));},
  jump:()=>{tone({f:300,f2:640,type:'square',dur:.13,vol:.05,filter:{f:2200}});tone({f:600,f2:1100,type:'sine',dur:.1,vol:.04});},
  flap:()=>{noise({f:700,f2:2200,dur:.11,vol:.18,q:1.4});noise({t:.07,f:900,f2:2600,dur:.1,vol:.12,q:1.4});},
  land:(big=1)=>{noise({f:500,f2:160,type:'lowpass',dur:.12,vol:.22*big});tone({f:130,f2:55,dur:.12,vol:.18*big});},
  step:()=>noise({f:300+Math.random()*200,type:'lowpass',dur:.05,vol:.05}),
  bounce:()=>{tone({f:170,f2:560,dur:.36,vol:.22,vib:30,vibRate:16});tone({f:340,f2:1120,type:'triangle',dur:.3,vol:.08});},
  feather:(n=0)=>{const note=PENTA[Math.min(PENTA.length-1,n)],f=659*2**(note/12);tone({f,type:'triangle',dur:.2,vol:.1});tone({f:f*2,t:.035,dur:.16,vol:.035});},
  key:()=>[0,4,7,12,16].forEach((n,i)=>tone({f:784*2**(n/12),type:'triangle',t:i*.06,dur:.35,vol:.09})),
  bell:()=>bell(880),
  checkpoint:()=>{[0,7,12].forEach((n,i)=>tone({f:523*2**(n/12),type:'triangle',t:i*.09,dur:.4,vol:.1}));bell(1568,.26,.07,1.1);},
  tower:()=>{bell(392,0,.22,2.4);bell(587,.05,.08,1.8);},
  crystal:()=>{[0,7,12,19,24].forEach((n,i)=>tone({f:1047*2**(n/12),t:i*.05,dur:.9,vol:.06,attack:.002}));},
  hurt:()=>{tone({f:520,f2:150,type:'sawtooth',dur:.32,vol:.1,filter:{f:1400}});quack(.7,.02,.35);},
  pop:()=>{tone({f:500,f2:1500,dur:.08,vol:.14});noise({f:3000,dur:.06,vol:.1,type:'highpass'});tone({f:1200,f2:1800,type:'triangle',t:.06,dur:.12,vol:.06});},
  stomp:()=>{tone({f:220,f2:70,type:'square',dur:.11,vol:.08,filter:{f:900}});play.pop();},
  splash:()=>{noise({f:3200,f2:300,type:'lowpass',dur:.55,vol:.3});for(let i=0;i<4;i++)tone({f:500+Math.random()*700,f2:1400+Math.random()*900,t:.08+i*.06,dur:.07,vol:.05});},
  wind:()=>noise({f:300,f2:900,dur:2.3,vol:.13,q:.8,attack:.6}),
  steam:()=>{noise({f:2400,f2:1200,type:'highpass',dur:.6,vol:.14,attack:.02});tone({f:90,f2:60,dur:.3,vol:.08});},
  crumble:()=>{noise({f:420,f2:120,type:'lowpass',dur:.45,vol:.25});for(let i=0;i<5;i++)noise({t:i*.05,f:900+i*200,dur:.04,vol:.07,q:4});},
  rumble:()=>noise({f:180,f2:90,type:'lowpass',dur:.5,vol:.18}),
  meow:()=>{tone({f:520,f2:880,type:'sawtooth',dur:.18,vol:.07,filter:{type:'bandpass',f:1300,q:3},linear:true});tone({f:880,f2:430,type:'sawtooth',t:.17,dur:.3,vol:.07,filter:{type:'bandpass',f:1200,q:3},linear:true});},
  squeak:()=>{tone({f:3200,f2:2200,dur:.06,vol:.04});tone({f:3000,f2:2400,t:.08,dur:.05,vol:.03});},
  caw:()=>{tone({f:420,f2:300,type:'sawtooth',dur:.2,vol:.07,filter:{type:'bandpass',f:900,q:2}});tone({f:420,f2:280,type:'sawtooth',t:.22,dur:.18,vol:.06,filter:{type:'bandpass',f:900,q:2}});},
  secret:()=>{for(let i=0;i<9;i++)tone({f:880*2**(PENTA[i]/12),type:'triangle',t:i*.045,dur:.5,vol:.06});},
  bossHit:()=>{tone({f:110,f2:40,dur:.5,vol:.3});noise({f:600,f2:80,type:'lowpass',dur:.4,vol:.25});bell(660,.1,.12,1.6);},
  taunt:()=>{quack(1.35,0,.4);quack(1.5,.16,.35);},
  win:()=>{const m=[[0,.0],[4,.14],[7,.28],[12,.42],[7,.62],[12,.76],[16,.9]];m.forEach(([n,t])=>{tone({f:523*2**(n/12),type:'square',t,dur:.22,vol:.05,filter:{f:2400}});tone({f:523*2**(n/12),type:'triangle',t,dur:.3,vol:.08});});bell(2093,1.05,.08,1.5);},
  ui:()=>tone({f:880,f2:1320,type:'triangle',dur:.08,vol:.06}),
  respawn:()=>[12,7,4,0].forEach((n,i)=>tone({f:523*2**(n/12),type:'sine',t:i*.07,dur:.2,vol:.07})),
  drip:()=>tone({f:1800+Math.random()*800,f2:900,dur:.09,vol:.05}),
  boost:()=>{tone({f:400,f2:1200,type:'triangle',dur:.25,vol:.1});}
 };
 // ---------- Music: a small seeded composer with a different band for each place. ----------
 const SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],mixo:[0,2,4,5,7,9,10],harm:[0,2,3,5,7,8,11]};
 const SONGS={
  title:{tempo:84,root:60,scale:'major',prog:[0,3,4,0,5,3,1,4],lead:'triangle',bass:'sine',drums:0,arp:1,density:.45,seed:3,leadVol:.07},
  woods:{tempo:116,root:62,scale:'major',prog:[0,4,5,3,0,4,3,4],lead:'square',bass:'triangle',drums:1,arp:0,density:.62,seed:11,leadVol:.035,swing:.1},
  cave:{tempo:78,root:57,scale:'minor',prog:[0,5,3,4,0,5,6,4],lead:'sine',bass:'sine',drums:0,arp:1,density:.35,seed:27,leadVol:.075,drip:1},
  fog:{tempo:70,root:62,scale:'dorian',prog:[0,3,0,6,0,3,4,4],lead:'sine',bass:'sine',drums:0,arp:1,density:.3,seed:41,leadVol:.07,pad:1},
  cliffs:{tempo:126,root:67,scale:'mixo',prog:[0,6,3,0,0,6,4,4],lead:'flute',bass:'triangle',drums:2,arp:0,density:.6,seed:53,leadVol:.06},
  river:{tempo:100,root:65,scale:'major',prog:[0,5,3,4,0,2,3,4],lead:'triangle',bass:'sine',drums:1,arp:1,density:.5,seed:67,leadVol:.07},
  roof:{tempo:98,root:64,scale:'harm',prog:[0,0,3,4,5,3,4,4],lead:'pluck',bass:'pluck',drums:3,arp:0,density:.55,seed:79,leadVol:.08,swing:.18},
  throne:{tempo:136,root:60,scale:'minor',prog:[0,5,6,4,0,5,3,4],lead:'square',bass:'sawtooth',drums:4,arp:0,density:.7,seed:97,leadVol:.035},
  story:{tempo:72,root:60,scale:'major',prog:[0,5,3,4],lead:'triangle',bass:'sine',drums:0,arp:1,density:.3,seed:5,leadVol:.05,pad:1}
 };
 function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
 function build(name){
  const cfg=SONGS[name]||SONGS.title,r=rng(cfg.seed),sc=SCALES[cfg.scale],bars=cfg.prog.length,len=bars*16,notes=new Array(len).fill(null);
  const deg=(d)=>{const o=Math.floor(d/7);return sc[((d%7)+7)%7]+12*o;};
  let cur=7;// melody walks around the scale, leaning on chord tones on strong beats
  const motif=[];for(let i=0;i<16;i++)motif.push(r()<cfg.density||i%8===0);
  for(let b=0;b<bars;b++){const chord=cfg.prog[b];for(let s=0;s<16;s++){if(!motif[s]||(b%4===3&&s>10))continue;const strong=s%4===0;if(strong){const tones=[chord,chord+2,chord+4].map(x=>x+7);let best=tones[0];for(const tn of tones)if(Math.abs(tn-cur)<Math.abs(best-cur))best=tn;cur=best+(r()<.3?7*(r()<.5?-1:1):0);}else cur+=[-2,-1,-1,1,1,2][Math.floor(r()*6)];cur=Math.max(3,Math.min(15,cur));notes[b*16+s]={n:deg(cur),long:strong&&r()<.4};}}
  return {name,cfg,len,notes,deg};
 }
 function voice(kind,f,at,dur,vol){
  if(kind==='flute'){tone({f,at,dur,vol,type:'sine',attack:.04,vib:f*.012,vibRate:5.5,bus:musicBus});tone({f:f*2,at,dur,vol:vol*.15,type:'sine',attack:.05,bus:musicBus});noise({at,dur:.05,vol:vol*.4,f:f*2,q:3,bus:musicBus});return;}
  if(kind==='pluck'){tone({f,at,dur:Math.min(dur,.35),vol,type:'triangle',attack:.002,filter:{f:f*6,f2:f*1.5},bus:musicBus});return;}
  tone({f,at,dur,vol,type:kind,attack:kind==='square'||kind==='sawtooth'?.01:.004,filter:kind==='square'||kind==='sawtooth'?{f:2200}:null,bus:musicBus});
 }
 function playStep(s,i,at){
  const c=s.cfg,b=Math.floor(i/16),st=i%16,chord=c.prog[b],sixteenth=60/c.tempo/4,root=c.root,mf=n=>440*2**((n-69)/12);
  const swing=(c.swing||0)*(st%2)*sixteenth;at+=swing;
  const _tone=(o)=>tone({...o,bus:musicBus});
  const n=s.notes[i];if(n)voice(c.lead,mf(root+n.n),at,n.long?sixteenth*3.5:sixteenth*1.7,c.leadVol);
  // Bass on the beat, with a walking pickup in the faster songs.
  if(st===0||st===8||(c.drums>=2&&st===14)){const bn=root-24+s.deg(chord+(st===14?4:0));voice(c.bass==='pluck'?'pluck':c.bass,mf(bn),at,sixteenth*(st===14?1.5:6),c.bass==='sawtooth'?.035:.09);}
  if(c.arp&&st%2===0){const a=[0,2,4,7][(st/2)%4],an=root-12+s.deg(chord+a);_tone({f:mf(an),at,dur:sixteenth*3,vol:.03,type:'triangle',attack:.003});}
  if(c.pad&&st===0){[0,2,4].forEach(k=>_tone({f:mf(root-12+s.deg(chord+k)),at,dur:sixteenth*16,vol:.022,type:'sine',attack:.6,release:sixteenth*16}));}
  if(c.drip&&st===6&&b%2===1)_tone({f:2200,f2:1100,at,dur:.08,vol:.03});
  const d=c.drums;if(d){
   if(d===1){if(st===0||st===8)_tone({f:120,f2:50,at,dur:.12,vol:.12});if(st%4===2)noise({at,dur:.03,vol:.04,f:7000,type:'highpass',bus:musicBus});}
   if(d===2){if(st%8===0)_tone({f:130,f2:50,at,dur:.12,vol:.12});if(st%2===1)noise({at,dur:.025,vol:.03,f:8000,type:'highpass',bus:musicBus});if(st===4||st===12)noise({at,dur:.08,vol:.05,f:2500,q:.8,bus:musicBus});}
   if(d===3){if(st===0||st===10)_tone({f:110,f2:50,at,dur:.1,vol:.11});if(st===4||st===12)noise({at,dur:.05,vol:.05,f:3500,q:3,bus:musicBus});if(st%4===2)_tone({f:1800,at,dur:.03,vol:.02,type:'square'});}
   if(d===4){if(st%4===0)_tone({f:140,f2:45,at,dur:.15,vol:.15});if(st===4||st===12)noise({at,dur:.12,vol:.09,f:1800,q:.7,bus:musicBus});if(st%2===0)noise({at,dur:.02,vol:.03,f:9000,type:'highpass',bus:musicBus});if(st===14||st===15)noise({at,dur:.06,vol:.06,f:1500,q:.7,bus:musicBus});}
  }
 }
 function schedule(){if(!song||!ctx)return;while(nextTime<now()+.15){playStep(song,step,nextTime);nextTime+=60/song.cfg.tempo/4;step=(step+1)%song.len;}}
 function fadeTo(v,time=.6){if(!ctx)return;const t=now();musicBus.gain.cancelScheduledValues(t);musicBus.gain.setValueAtTime(musicBus.gain.value,t);musicBus.gain.linearRampToValueAtTime(v,t+time);}
 function music(name,{muted=false,duck=false}={}){
  musicWanted=name;if(!ctx)return;
  if(muted||!musicOn||!name){if(song){fadeTo(0,.4);const old=song;setTimeout(()=>{if(song===old){clearInterval(timer);timer=null;song=null;}},450);}return;}
  const target=duck?.12:.3;
  if(song&&song.name===name){fadeTo(target,.5);return;}
  const begin=()=>{song=build(name);step=0;nextTime=now()+.08;clearInterval(timer);timer=setInterval(schedule,30);fadeTo(target,.8);};
  if(song){fadeTo(0,.35);setTimeout(begin,380);}else begin();
 }
 return {
  wake,
  play(kind,arg){const c=wake();if(!c)return;try{(play[kind]||play.bell)(arg);}catch{}},
  music,
  get musicOn(){return musicOn;},
  setMusic(on){musicOn=on;try{localStorage.setItem('maya-music',on?'on':'off');}catch{}music(musicWanted);},
  resumeWanted(muted){if(ctx)music(musicWanted,{muted});}
 };
})();
// Browsers only allow sound after a touch, so the first tap anywhere wakes the band.
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,()=>{SFX.wake();if(typeof syncMusic==='function')syncMusic(true);},{passive:true}));
