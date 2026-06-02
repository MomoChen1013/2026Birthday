/* ============================================================
   exhibition.js — 橫向時間軸照片牆
   ・每張照片帶 year + month，依時間排序
   ・垂直滾動驅動橫向位移，畫面中央的卡片放大變清晰
   ・支援滑鼠拖曳、鍵盤 ← →、點卡片開 lightbox
   填資料：在下方 PHOTOS 陣列加入 {year, month, src, cap}
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

const PHOTOS = [
  {year:2021, month:3,  src:'', cap:'最愛的日子'},
  {year:2022, month:7,  src:'', cap:'和朋友的回憶'},
  {year:2023, month:5,  src:'', cap:'療癒時光'},
  {year:2024, month:3,  src:'', cap:'生日旅行'},
  {year:2025, month:11, src:'', cap:'美好瞬間'},
  {year:2026, month:6,  src:'', cap:'下次見 ♡'},
];

const MONTH_TXT = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const MONTH_EN  = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

/* 依年月排序 */
PHOTOS.sort((a,b)=> (a.year - b.year) || (a.month - b.month));

const track    = document.getElementById('tlTrack');
const tlSec    = document.getElementById('tlSec');
const yearBack = document.getElementById('tlYearBack');
const topProg  = document.getElementById('tlTopbar');
const dotsWrap = document.getElementById('tlDots');

/* ===== 渲染所有節點 ===== */
PHOTOS.forEach((p, i)=>{
  const node = document.createElement('div');
  const isFinale = (i === PHOTOS.length - 1);
  node.className = 'tl-node' + (isFinale ? ' finale' : '');
  node.dataset.idx = i;
  node.dataset.year  = p.year;
  node.dataset.month = p.month;

  const layout = (i % 2 === 0) ? 'tall' : 'wide';
  const fallback = isFinale ? '🎂' : '📷';
  const monthLabel = String(p.month).padStart(2,'0');

  node.innerHTML = `
    <span class="tl-yr">${p.year}<span class="mn">${monthLabel}月</span></span>
    <div class="tl-media ${layout}">
      <div class="tl-dot"></div>
      <div class="tl-ph">${p.src ? `<img src="${p.src}" alt="">` : fallback}</div>
    </div>
    <div class="tl-meta">
      <div class="when">${MONTH_EN[p.month-1]} ${p.year}・${MONTH_TXT[p.month-1]}</div>
      <div class="t">${escapeHtml(p.cap)}</div>
    </div>
  `;
  track.appendChild(node);

  const d = document.createElement('div');
  d.className = 'pd' + (i === 0 ? ' on' : '');
  dotsWrap.appendChild(d);
});

const nodes = [...track.querySelectorAll('.tl-node')];
const dots  = [...dotsWrap.children];

/* ===== 動態高度（卡片越多滾得越久） ===== */
tlSec.style.height = Math.max(300, 100 + PHOTOS.length * 80) + 'vh';

/* ===== 滾動邏輯 ===== */
let dragOffset = 0;
let maxShift   = 0;

function recalc(){
  maxShift = track.scrollWidth - window.innerWidth + window.innerWidth * 0.06;
}
recalc();
addEventListener('resize', ()=>{ recalc(); onScroll(); });

function onScroll(){
  const r = tlSec.getBoundingClientRect();
  const total = tlSec.offsetHeight - window.innerHeight;

  // 全頁進度條
  const sc = window.scrollY;
  const h  = document.documentElement.scrollHeight - window.innerHeight;
  topProg.style.width = (h > 0 ? sc / h * 100 : 0) + '%';

  // 計算時間軸段內的進度 0~1
  let p = 0;
  if(r.top <= 0 && r.bottom >= window.innerHeight) p = (-r.top) / total;
  else if(r.top > 0) p = 0;
  else p = 1;
  p = Math.max(0, Math.min(1, p));

  // 套用 translateX
  const base = p * maxShift;
  const x = Math.max(0, Math.min(maxShift, base - dragOffset));
  track.style.transform = 'translateX(' + (-x) + 'px)';

  // 找最靠近視窗中央的節點 → 設為 focus
  const centerX = window.innerWidth / 2;
  let nearest = 0, nd = Infinity;
  nodes.forEach((n, i)=>{
    const nr = n.getBoundingClientRect();
    const nc = nr.left + nr.width / 2;
    const dist = Math.abs(nc - centerX);
    if(dist < nd){ nd = dist; nearest = i; }
  });
  nodes.forEach((n, i)=> n.classList.toggle('focus', i === nearest));
  yearBack.textContent = nodes[nearest].dataset.year;
  dots.forEach((d, i)=> d.classList.toggle('on', i === nearest));
}
addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* ===== 拖曳橫向（只在 sticky 釘住時可動） ===== */
let dragging = false, startX = 0, startOffset = 0;
track.addEventListener('pointerdown', e=>{
  const r = tlSec.getBoundingClientRect();
  if(r.top > 0 || r.bottom < window.innerHeight) return;
  dragging = true; startX = e.clientX; startOffset = dragOffset;
  track.setPointerCapture(e.pointerId);
});
track.addEventListener('pointermove', e=>{
  if(!dragging) return;
  dragOffset = startOffset + (e.clientX - startX);
  onScroll();
});
track.addEventListener('pointerup',     ()=> dragging = false);
track.addEventListener('pointercancel', ()=> dragging = false);

/* ===== 鍵盤左右 ===== */
addEventListener('keydown', e=>{
  if(e.target.matches('input, textarea')) return;
  if(e.key === 'ArrowRight'){ dragOffset -= window.innerWidth * 0.35; onScroll(); }
  if(e.key === 'ArrowLeft' ){ dragOffset += window.innerWidth * 0.35; onScroll(); }
});

/* ===== lightbox ===== */
const lb     = document.getElementById('lb');
const lbPh   = document.getElementById('lbPh');
const lbT    = document.getElementById('lbT');
const lbDate = document.getElementById('lbDate');

nodes.forEach((n, i)=>{
  n.querySelector('.tl-media').addEventListener('click', ()=>{
    const p = PHOTOS[i];
    lbPh.innerHTML  = p.src ? `<img src="${p.src}" alt="">` : (i === PHOTOS.length - 1 ? '🎂' : '📷');
    lbT.textContent = p.cap;
    lbDate.textContent = `${p.year}.${String(p.month).padStart(2,'0')}・${MONTH_TXT[p.month-1]}`;
    lb.classList.add('open');
  });
});
document.getElementById('lbClose').onclick = ()=> lb.classList.remove('open');
lb.addEventListener('click', e=>{ if(e.target === lb) lb.classList.remove('open'); });
addEventListener('keydown', e=>{ if(e.key === 'Escape') lb.classList.remove('open'); });
