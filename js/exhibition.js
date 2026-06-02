/* ============================================================
   exhibition.js — 展覽照片牆
   之後在這裡填入 Momo 的照片網址：{src:'圖片網址', cap:'說明'}
   src 可以是相對路徑（例如 'images/momo-2024.jpg'）或外部網址
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

const PHOTOS = [
  {src:'', cap:'最愛的日子'},
  {src:'', cap:'和朋友的回憶'},
  {src:'', cap:'療癒時光'},
  {src:'', cap:'今年的我'},
  {src:'', cap:'美好瞬間'},
  {src:'', cap:'下次見 ♡'},
];

const wall = document.getElementById('polaroidWall');
PHOTOS.forEach(p=>{
  const d=document.createElement('div'); d.className='polaroid';
  d.innerHTML=`<div class="ph">${p.src?`<img src="${p.src}" alt="">`:'📷'}</div>
               <div class="cap">${escapeHtml(p.cap)}</div>`;
  wall.appendChild(d);
});
