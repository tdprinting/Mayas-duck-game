'use strict';
const OUTFITS=[
 {id:'explorer',name:'Maya’s little duck',hint:'Your very first adventure outfit.',unlocked:()=>true},
 {id:'rain',name:'Rainy-day explorer',hint:'Find 12 little feathers.',unlocked:()=>lifetimeFeathers>=12},
 {id:'firefly',name:'Firefly cape',hint:'Find 30 little feathers.',unlocked:()=>lifetimeFeathers>=30},
 {id:'woodland',name:'Woodland wanderer',hint:'Discover a hidden royal acorn.',unlocked:()=>secretsFound.some(Boolean)},
 {id:'royal',name:'Royal prince',hint:'Bring the king home and win back his crown.',unlocked:()=>finished},
 {id:'page',name:'Paperboat adventurer',hint:'Bring the nine tabletop feathers home.',unlocked:()=>bookBonusCompleted}
];
function outfitImage(i,id){return `assets/player${i+1}${id==='explorer'?'':'-'+id}.svg`;}
function onFeathersEarned(before){for(const [n,name] of [[12,'Rainy-day explorer'],[30,'Firefly cape']])if(before<n&&lifetimeFeathers>=n)showToast(`${name} outfit unlocked! Find it in Little Outfits.`,4);}
function backToBeginning(){resetInputs();closeModal();phase='home';$('scene').classList.add('hidden');$('overworld').classList.add('hidden');$('game').classList.add('hidden');$('home').classList.remove('hidden');document.body.classList.remove('playing');makeLevels();scrollTo(0,0);}
function showMap(){
 resetInputs();closeModal();phase='map';$('scene').classList.add('hidden');$('home').classList.add('hidden');$('game').classList.add('hidden');$('overworld').classList.remove('hidden');document.body.classList.remove('playing');
 const positions=[[9,74],[22,50],[34,32],[50,56],[63,78],[77,52],[90,31]];
 $('mapNodes').innerHTML=STAGES.map((s,i)=>{const locked=i>unlocked,[x,y]=positions[i];return `<button class="map-node ${locked?'locked':''} ${!locked&&i===unlocked&&!finished?'next-place':''}" style="left:${x}%;top:${y}%" data-map-level="${i}" ${locked?'disabled':''}><span class="node-seal">${locked?'<svg viewBox="0 0 20 24" aria-hidden="true"><rect x="3" y="10" width="14" height="11" rx="2"/><path d="M6 10V6a4 4 0 0 1 8 0v4M10 14v3"/></svg>':i<unlocked||finished?'✓':i+1}</span><span class="node-name">${s.title}</span><small>${locked?'A little further along…':secretsFound[i]?'Royal acorn found ♧':'Explore this place →'}</small></button>`;}).join('');
 document.querySelectorAll('[data-map-level]').forEach(b=>b.onclick=()=>enterLevel(Number(b.dataset.mapLevel)));
 $('mapIntro').textContent=finished?'The rightful king is home, and three brave little ducks are royal princes. There are still little secrets to find…':'A crown has vanished. A king needs finding. Choose a place for your next little adventure.';
 $('featherBank').textContent=`${lifetimeFeathers} little feathers found`;$('acornBank').textContent=`${secretsFound.filter(Boolean).length} of ${STAGES.length} royal acorns`;
 scrollTo(0,0);const next=$('mapNodes').querySelector('.next-place');next?.focus({preventScroll:true});if(document.body.classList.contains('tall')){const ow=$('overworld'),target=next||$('mapNodes').lastElementChild;requestAnimationFrame(()=>{if(target)ow.scrollLeft=Math.max(0,target.offsetLeft-ow.clientWidth/2);});}
}
function wardrobe(i=0){
 const equipped=selectedOutfits[i];modal({title:'Little outfits. Big adventures.',eyebrow:'A WARDROBE FOR TWO BRAVE DUCKS',art:'player'+(i+1),body:`<p class="wardrobe-bank">${lifetimeFeathers} feathers found · ${secretsFound.filter(Boolean).length} royal acorns</p><div class="duck-tabs"><button data-duck="0" class="${i===0?'chosen':''}">Pip · Player 1</button><button data-duck="1" class="${i===1?'chosen':''}">Puddle · Player 2</button></div><div class="outfit-grid">${OUTFITS.map(o=>`<button data-outfit="${o.id}" class="outfit-card ${equipped===o.id?'equipped':''}" ${o.unlocked()?'':'disabled'}><img src="${outfitImage(i,o.id)}" alt="${o.name}"><strong>${o.name}</strong><small>${equipped===o.id?'Wearing it ✓':o.unlocked()?'Ready to wear':o.hint}</small></button>`).join('')}</div><p class="story-note">Outfits are little rewards for exploring. Every outfit keeps Maya’s original duck shape.</p>`,action:'Back to the kingdom →',onAction:()=>{},closeable:true});
 document.querySelectorAll('[data-duck]').forEach(b=>b.onclick=()=>wardrobe(Number(b.dataset.duck)));
 document.querySelectorAll('[data-outfit]').forEach(b=>b.onclick=()=>{selectedOutfits[i]=b.dataset.outfit;writeSave();wardrobe(i);sound('bell');});
}
$('start').onclick=showMap;$('continue').onclick=showMap;$('mapBack').onclick=backToBeginning;$('wardrobe').onclick=()=>wardrobe(0);
// Validate saved choices against the current unlocks; no locked outfit can equip itself.
selectedOutfits=selectedOutfits.map(id=>OUTFITS.some(o=>o.id===id&&o.unlocked())?id:'explorer');
