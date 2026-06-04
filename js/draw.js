/* ============================================================
   draw.js — 抽 Momo 小卡
   ============================================================
   ▸ 怎麼加 / 改 / 刪小卡？
     在下方 CARDS 陣列加一行：
       {
         art:    'images/card-01.png',  // ① 圖片或 emoji
         name:   '日常 Momo',            // ② 卡名（顯示在卡片下方）
         rarity: 'R',                   // ③ 等級：SSR / SR / R / N
         desc:   '咖啡與書的下午 ☕',     // ④ 說明（選填）
       },
     ・刪除 = 把整行刪掉
     ・順序、總張數隨便調，程式會自動處理

   ▸ art 寫什麼？
     ・自己上傳的圖：'images/card-01.png'（檔案放 images/ 資料夾下）
     ・外部網址：    'https://example.com/photo.jpg'
     ・想用 emoji ：  '🎀'
     程式會自動分辨：含「/」或副檔名（.png .jpg .webp 等）→ 當圖片
                     其他 → 當 emoji 顯示

   ▸ 等級（rarity）會影響什麼？
     ・SSR ＝ ✦✦ SSR：卡面有彩虹光膜 + 抽到時放煙火 🎆
     ・SR  ＝ ✦ SR ：卡面有彩虹光膜 + 抽到時放煙火 🎆
     ・R   ＝ ★ R  ：一般卡（沒光膜、沒煙火）
     ・N   ＝ N    ：一般卡
     ・目前每張卡的抽中機率相同
       想做「越稀有越難抽」？把高稀有卡少放幾張、N 卡多放幾張即可

   ▸ desc（說明）寫什麼？
     ・選填，留空就不顯示
     ・短一點比較好看，建議一句話內
     ・會顯示在大卡片下方的小紙條上

   ▸ 圖片建議
     ・卡片比例約 2:3（直式）
     ・解析度 800×1200 以上比較清楚
     ・檔名愛叫什麼都行，path 對到 art 就好
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

const CARDS = [
  /* ── 自己上傳的照片小卡（最常用） ── */
  {art:'images/card-01.png', name:'日常 Momo', rarity:'R',
   desc:'咖啡與書的下午，最 Momo 的時刻 ☕'},

  {art:'images/card-02.png', name:'閃耀 Momo', rarity:'SSR',
   desc:'壽星本日限定的閃亮造型 ✨'},

  /* ── 還沒上傳照片？先用 emoji 佔位也 OK ── */
  {art:'🌸', name:'春日 Momo', rarity:'SR',
   desc:'櫻花季的微醺午後'},

  {art:'⭐', name:'夢幻 Momo', rarity:'SSR',
   desc:'你抽到的是限定夢幻款，幸運加倍 🍀'},

  {art:'🐰', name:'療癒 Momo', rarity:'N',
   desc:'柔軟、毛茸茸、想抱緊的那種日子'},

  {art:'🦋', name:'夢蝶 Momo', rarity:'SR'},   /* desc 是選填，不寫就沒說明 */

  {art:'🌈', name:'限定 Momo', rarity:'SSR',
   desc:'雨後的彩虹，剛好屬於今天的 Momo'},
];

const RANK = {SSR:'✦✦ SSR', SR:'✦ SR', R:'★ R', N:'N'};

/* 判斷 art 是圖片路徑還是 emoji
   含 / 反斜線 或 副檔名 → 圖片；否則當 emoji */
function isImage(s){
  if(typeof s !== 'string') return false;
  return /[\/\\]/.test(s) || /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(s);
}

const card      = document.getElementById('photocard');
const coll      = document.getElementById('collection');
const collCount = document.getElementById('collCount');
const descEl    = document.getElementById('cardDesc');
let drawing = false;

/* ===== 收藏（mini-card） ===== */
function appendMini(pick){
  const mc = document.createElement('div');
  mc.className = 'mini-card' + (isImage(pick.art) ? ' has-img' : '');
  if(isImage(pick.art)){
    mc.innerHTML = `<img src="${pick.art}" alt="" draggable="false">`;
  } else {
    mc.style.background = `linear-gradient(135deg,var(--primary-soft),var(--bg-blob2))`;
    mc.innerHTML = pick.art;
  }
  if(pick.rarity === 'SSR' || pick.rarity === 'SR'){
    mc.insertAdjacentHTML('beforeend', '<div class="mh"></div>');
  }
  mc.title = pick.name + '・' + pick.rarity + (pick.desc ? '\n' + pick.desc : '');
  coll.appendChild(mc);
}

/* 還原歷史收藏（localStorage） */
DataStore.getCollected().forEach(appendMini);
collCount.textContent = DataStore.getCollected().length;

/* ===== 抽卡 ===== */
document.getElementById('drawBtn').addEventListener('click', ()=>{
  if(drawing) return; drawing = true;
  card.classList.remove('flipped', 'shine');
  if(descEl) descEl.classList.remove('show');

  const pick = CARDS[Math.floor(Math.random() * CARDS.length)];

  setTimeout(()=>{
    const art = document.getElementById('cardArt');
    art.innerHTML = isImage(pick.art)
      ? `<img src="${pick.art}" alt="${escapeHtml(pick.name)}" draggable="false">`
      : pick.art;
    document.getElementById('cardRk').textContent = RANK[pick.rarity];
    document.getElementById('cardNm').textContent = pick.name;

    /* 卡下方的說明小紙條 */
    if(descEl){
      if(pick.desc){
        descEl.textContent = pick.desc;
        descEl.classList.add('show');
      } else {
        descEl.textContent = '';
      }
    }

    card.classList.add('flipped');
    if(pick.rarity === 'SSR' || pick.rarity === 'SR'){
      card.classList.add('shine');
      fireworksBurst();
    }
    confettiRain();

    DataStore.addCollected(pick);
    appendMini(pick);
    collCount.textContent = DataStore.getCollected().length;
    drawing = false;
  }, 300);
});
