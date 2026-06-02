/* ============================================================
   wall.js — 祝福牆：寫小卡、寄信
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

/* ---------- 簽到祝福留言牆 ---------- */
const NOTE_COLORS=['#fff3b0','#ffd6e3','#d6f0fa','#e3ddf9','#d9f7df','#ffe1cf'];
function renderWishes(){
  const wall=document.getElementById('wishWall'); wall.innerHTML='';
  DataStore.getWishes().slice().reverse().forEach((w,i)=>{
    const d=document.createElement('div'); d.className='wish-note';
    d.style.background=NOTE_COLORS[i%NOTE_COLORS.length];
    d.innerHTML=`${escapeHtml(w.text)}<div class="by">${w.icon} ${escapeHtml(w.name)}</div>`;
    wall.appendChild(d);
  });
}
document.getElementById('postWish').addEventListener('click',()=>{
  const t=document.getElementById('wishText').value.trim();
  if(!t) return;
  DataStore.addWish({name:me_user.name, icon:me_user.icon, text:t, time:Date.now()});
  document.getElementById('wishText').value='';
  renderWishes(); confettiRain();
});
/* 第一次造訪時放一張示範祝福（之後接 Firebase 可移除） */
if(!DataStore.getWishes().length){
  DataStore.addWish({name:'小編', icon:'🐰', text:'Momo 生日快樂！這一年也要繼續發光發熱 ✨', time:Date.now()});
}
renderWishes();

/* ---------- 信箱 ---------- */
const letterModal = document.getElementById('letterModal');
const letterText  = document.getElementById('letterText');
const letterCount = document.getElementById('letterCount');

function renderLetterCount(){
  letterCount.textContent = DataStore.getLetterCount();
  const oc=document.getElementById('ownerCount'); if(oc) oc.textContent=DataStore.getLetterCount();
}
function openLetter(){ letterModal.classList.add('open'); setTimeout(()=>letterText.focus(),60); }
function closeLetter(){ letterModal.classList.remove('open'); }
function submitLetter(){
  const t=letterText.value.trim();
  if(!t){ letterText.focus(); return; }
  DataStore.addLetter({name:me_user.name, icon:me_user.icon, text:t, time:Date.now()});
  renderLetterCount();
  letterText.value='';
  closeLetter();
  spawnFloat('💌', innerWidth/2, innerHeight*0.7);
  confettiRain();
}

document.getElementById('mailbox').addEventListener('click', openLetter);
document.getElementById('writeLetter').addEventListener('click', openLetter);
document.getElementById('letterClose').addEventListener('click', closeLetter);
document.getElementById('letterCancel').addEventListener('click', closeLetter);
document.getElementById('letterSend').addEventListener('click', submitLetter);
letterModal.addEventListener('click', e=>{ if(e.target===letterModal) closeLetter(); });

renderLetterCount();
