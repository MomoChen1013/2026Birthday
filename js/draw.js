/* ============================================================
   draw.js — 抽 Momo 小卡
   之後填入照片小卡：{art:'圖片網址或emoji', name:'卡名', rarity:'SSR|SR|R|N'}
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

const CARDS=[
  {art:'🎀', name:'日常 Momo',   rarity:'R'},
  {art:'🌸', name:'春日 Momo',   rarity:'SR'},
  {art:'⭐', name:'閃耀 Momo',   rarity:'SSR'},
  {art:'🐰', name:'療癒 Momo',   rarity:'N'},
  {art:'🦋', name:'夢幻 Momo',   rarity:'SR'},
  {art:'🌈', name:'限定 Momo',   rarity:'SSR'},
];
const RANK={SSR:'✦✦ SSR', SR:'✦ SR', R:'★ R', N:'N'};

const card = document.getElementById('photocard');
const coll = document.getElementById('collection');
const collCount = document.getElementById('collCount');
let drawing = false;

/* 還原歷史收藏（localStorage） */
function appendMini(pick){
  const mc=document.createElement('div'); mc.className='mini-card';
  mc.style.background=`linear-gradient(135deg,var(--primary-soft),var(--bg-blob2))`;
  mc.innerHTML=(String(pick.art).startsWith('http')?'🖼️':pick.art)
              + ((pick.rarity==='SSR'||pick.rarity==='SR')?'<div class="mh"></div>':'');
  mc.title=pick.name+'・'+pick.rarity;
  coll.appendChild(mc);
}
DataStore.getCollected().forEach(appendMini);
collCount.textContent = DataStore.getCollected().length;

document.getElementById('drawBtn').addEventListener('click', ()=>{
  if(drawing) return; drawing=true;
  card.classList.remove('flipped','shine');
  const pick = CARDS[Math.floor(Math.random()*CARDS.length)];
  setTimeout(()=>{
    const art=document.getElementById('cardArt');
    art.innerHTML = String(pick.art).startsWith('http')
      ? `<img src="${pick.art}">`
      : pick.art;
    document.getElementById('cardRk').textContent=RANK[pick.rarity];
    document.getElementById('cardNm').textContent=pick.name;
    card.classList.add('flipped');
    if(pick.rarity==='SSR'||pick.rarity==='SR'){ card.classList.add('shine'); fireworksBurst(); }
    confettiRain();
    DataStore.addCollected(pick);
    appendMini(pick);
    collCount.textContent = DataStore.getCollected().length;
    drawing=false;
  },300);
});
