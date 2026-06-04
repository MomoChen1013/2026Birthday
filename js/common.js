/* ============================================================
   Momo's Day — 共用 JS
   提供：
     - DataStore（localStorage 持久化）
     - me_user（名字 + icon）
     - 主題切換
     - 特效（煙火 / 彩帶 / 鞭炮 / 金箔 / 飄浮 emoji）
     - BGM（生日歌音樂盒版）
     - 壽星信箱（網址加 #momo 才出現）
     - 子場景的回大廳 / 左右轉導覽自動套用
     - escapeHtml 等小工具
============================================================ */

/* ---------- 小工具 ---------- */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function $(sel, root){ return (root||document).querySelector(sel); }
function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

/* ---------- localStorage 包裝 ---------- */
const LS = {
  get(key, def){
    try{ const v = localStorage.getItem('momo.'+key); return v===null ? def : JSON.parse(v); }
    catch{ return def; }
  },
  set(key, val){
    try{ localStorage.setItem('momo.'+key, JSON.stringify(val)); }catch{}
  }
};

/* ============================================================
   資料層（DataStore）— 之後接 Firebase 時，只要把每個方法
   內部換成 Firestore 呼叫即可，其他程式碼不用動。
============================================================ */
const DataStore = {
  _wishes:    LS.get('wishes', []),
  _letters:   LS.get('letters', []),
  _hearts:    LS.get('hearts', 0),
  _collected: LS.get('collected', []),
  _cakes:     LS.get('cakes', []),
  _compat:    LS.get('compat', []),

  addWish(w){ this._wishes.push(w);   LS.set('wishes', this._wishes); },
  getWishes(){ return this._wishes; },

  addLetter(l){ this._letters.push(l); LS.set('letters', this._letters); },
  getLetterCount(){ return this._letters.length; },
  getLetters(){ return this._letters; },

  addHeart(){ this._hearts++;          LS.set('hearts', this._hearts); return this._hearts; },
  getHearts(){ return this._hearts; },

  addCollected(c){ this._collected.push(c); LS.set('collected', this._collected); },
  getCollected(){ return this._collected; },

  /* 蛋糕慶祝儀式收集桶 */
  addCake(c){ this._cakes.push(c); LS.set('cakes', this._cakes); },
  getCakes(){ return this._cakes; },

  /* 與 Momo 的契合度：每筆是 [a, b, c, d, e]（題號 → 選項 index） */
  addCompat(answers){ this._compat.push(answers); LS.set('compat', this._compat); },
  getCompat(){ return this._compat; },
};

/* ============================================================
   使用者（名字 + 隨機 icon）
============================================================ */
const ICONS = ['🎀','🌸','🌷','🐰','🐣','🦋','⭐','🍓','☁️','🌈','🍯','🐥','🧁','🌼','💐','🍑','🫧','🪽'];
let me_user = LS.get('user', null) || { name:'朋友', icon:'🎀' };
function saveUser(u){ me_user = u; LS.set('user', u); }
function clearUser(){ me_user = { name:'朋友', icon:'🎀' }; localStorage.removeItem('momo.user'); }

/* 子場景：沒登入就丟回大廳 */
function requireUser(){
  if(!LS.get('user', null)){
    location.href = 'index.html';
    return false;
  }
  return true;
}

/* ============================================================
   主題切換（記到 localStorage）
============================================================ */
function setTheme(t){
  document.body.dataset.theme = t;
  LS.set('theme', t);
}
function initTheme(){
  const saved = LS.get('theme', 'lavender');
  document.body.dataset.theme = saved;
}
initTheme();

/* ============================================================
   全畫面特效 canvas（fireworksBurst / confettiRain / firecracker / goldFall / spawnFloat）
============================================================ */
let fx, ctx, parts = [], fxRunning = false;
function initFx(){
  fx = document.getElementById('fx');
  if(!fx) return;
  ctx = fx.getContext('2d');
  const resize = ()=>{ fx.width = innerWidth; fx.height = innerHeight; };
  resize(); addEventListener('resize', resize);
}

const PCOLORS=['#ff9ec4','#b9a5e3','#a6d8f0','#fce38a','#9be7a0','#ffb3c6'];
function addParts(x,y,n,opt={}){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, sp=(opt.speed||4)*(0.4+Math.random());
    parts.push({x,y,vx:Math.cos(a)*sp*(opt.spread||1),vy:Math.sin(a)*sp - (opt.up||0),
      g:opt.g??0.08, life:60+Math.random()*30, c:PCOLORS[(Math.random()*PCOLORS.length)|0],
      size:opt.size||(3+Math.random()*4), rect:opt.rect});
  }
}
function fireworksBurst(){
  if(!fx) return;
  for(let k=0;k<3;k++){
    const x=fx.width*(0.25+Math.random()*0.5), y=fx.height*(0.2+Math.random()*0.3);
    setTimeout(()=>addParts(x,y,60,{speed:6,spread:1}),k*180);
  }
  runFx();
}
function confettiRain(){
  if(!fx) return;
  for(let i=0;i<80;i++){
    parts.push({x:Math.random()*fx.width,y:-20,vx:(Math.random()-0.5)*2,vy:2+Math.random()*3,
      g:0.05,life:120,c:PCOLORS[(Math.random()*PCOLORS.length)|0],size:5+Math.random()*5,rect:true,rot:Math.random()*6});
  }
  runFx();
}
function firecracker(){
  if(!fx) return;
  const x=fx.width/2, y=fx.height-40;
  addParts(x,y,50,{speed:8,up:6,g:0.18}); runFx();
}
const GOLDS=['#c9a06b','#e3ca9a','#d8b074','#bfa15f','#f0dca0'];
function goldFall(){
  if(!fx) return;
  for(let i=0;i<34;i++){
    parts.push({x:Math.random()*fx.width,y:-20,vx:(Math.random()-0.5)*1.2,vy:0.8+Math.random()*1.4,
      g:0.012,life:200,c:GOLDS[(Math.random()*GOLDS.length)|0],size:3+Math.random()*4,rect:true,rot:Math.random()*6});
  }
  runFx();
}
function runFx(){ if(fxRunning||!fx) return; fxRunning=true; loopFx(); }
function loopFx(){
  ctx.clearRect(0,0,fx.width,fx.height);
  parts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.life--;
    ctx.globalAlpha=Math.max(p.life/60,0); ctx.fillStyle=p.c;
    if(p.rect){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate((p.rot=(p.rot||0)+0.1)); ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); ctx.restore(); }
    else{ ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,7); ctx.fill(); }
  });
  ctx.globalAlpha=1;
  parts=parts.filter(p=>p.life>0 && p.y<fx.height+30);
  if(parts.length){ requestAnimationFrame(loopFx); } else { ctx.clearRect(0,0,fx.width,fx.height); fxRunning=false; }
}

function spawnFloat(emoji,x,y){
  const h=document.createElement('div'); h.className='float-heart'; h.textContent=emoji;
  h.style.left=(x-13)+'px'; h.style.top=(y-13)+'px'; document.body.appendChild(h);
  setTimeout(()=>h.remove(),1400);
}

/* ============================================================
   BGM：用 Web Audio 合成「生日快樂歌」音樂盒版
============================================================ */
let audioCtx=null, bgmOn=false, bgmTimer=null;
const _NOTE={G4:392.00,A4:440.00,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
const _MELODY=[
  ['G4',.5],['G4',.5],['A4',1],['G4',1],['C5',1],['B4',2],
  ['G4',.5],['G4',.5],['A4',1],['G4',1],['D5',1],['C5',2],
  ['G4',.5],['G4',.5],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
  ['F5',.5],['F5',.5],['E5',1],['C5',1],['D5',1],['C5',2.5],
];
function playNote(freq,start,dur){
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type='triangle'; o.frequency.value=freq;
  o.connect(g); g.connect(audioCtx.destination);
  const t=audioCtx.currentTime+start;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(.18,t+.02);
  g.gain.exponentialRampToValueAtTime(.001,t+dur*0.9);
  o.start(t); o.stop(t+dur);
}
function playMelodyOnce(){
  const beat=.42; let t=0;
  _MELODY.forEach(([n,d])=>{ playNote(_NOTE[n],t,d*beat); t+=d*beat; });
  return t;
}
function startBGM(){
  if(bgmOn) return;
  try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  if(audioCtx.state==='suspended') audioCtx.resume();
  bgmOn=true;
  const fab=document.getElementById('bgmFab'); if(fab) fab.textContent='🎵';
  const loop=()=>{ if(!bgmOn) return; const dur=playMelodyOnce(); bgmTimer=setTimeout(loop,(dur+1.2)*1000); };
  loop();
}
function stopBGM(){
  bgmOn=false; clearTimeout(bgmTimer);
  const fab=document.getElementById('bgmFab'); if(fab) fab.textContent='🔇';
}

/* ============================================================
   壽星信箱：網址加 #momo 才出現
============================================================ */
const OWNER_KEY = '#momo';
function isOwnerVisitor(){
  return location.hash === OWNER_KEY || /[?&]owner/.test(location.search);
}
function timeStr(ts){
  const d=new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function renderInbox(){
  const list=document.getElementById('inboxList');
  if(!list) return;
  const letters=DataStore.getLetters().slice().reverse();
  if(!letters.length){
    list.innerHTML=`<div class="inbox-empty">目前還沒有信件 💭<br>等朋友們投信進來，這裡就會出現囉～<br><br>（接上 Firebase 後，大家寄的信會自動收進這個信箱）</div>`;
    return;
  }
  list.innerHTML=letters.map(l=>`
    <div class="letter-item">
      <div class="li-head">
        <span class="li-ic">${l.icon||'💌'}</span>
        <span class="li-name">${escapeHtml(l.name||'朋友')}</span>
        <span class="li-time">${timeStr(l.time||Date.now())}</span>
      </div>
      <div class="li-body">${escapeHtml(l.text||'')}</div>
    </div>`).join('');
}

/* ============================================================
   共用 UI 綁定（在每頁載入時呼叫一次）
============================================================ */
function bindCommonUI(){
  initFx();

  /* 主題切換 */
  const themeFab = document.getElementById('themeFab');
  const themePop = document.getElementById('themePop');
  if(themeFab && themePop){
    themeFab.addEventListener('click', ()=>themePop.classList.toggle('open'));
    themePop.querySelectorAll('.theme-dot').forEach(dot=>{
      dot.addEventListener('click', ()=>setTheme(dot.dataset.theme));
    });
  }

  /* BGM 按鈕 */
  const bgmFab = document.getElementById('bgmFab');
  if(bgmFab){
    bgmFab.addEventListener('click', ()=>{ bgmOn ? stopBGM() : startBGM(); });
  }

  /* 壽星信箱 */
  const ownerFab  = document.getElementById('ownerFab');
  const inboxModal= document.getElementById('inboxModal');
  const inboxClose= document.getElementById('inboxClose');
  const ownerCount= document.getElementById('ownerCount');
  if(ownerCount) ownerCount.textContent = DataStore.getLetterCount();
  if(ownerFab && isOwnerVisitor()) ownerFab.classList.add('show');
  if(ownerFab) ownerFab.addEventListener('click', ()=>{ renderInbox(); inboxModal.classList.add('open'); });
  if(inboxClose) inboxClose.addEventListener('click', ()=>inboxModal.classList.remove('open'));
  if(inboxModal) inboxModal.addEventListener('click', e=>{ if(e.target===inboxModal) inboxModal.classList.remove('open'); });

  /* 子場景：顯示右上小頭像（lobby 不顯示） */
  const meMini = document.getElementById('meMini');
  if(meMini){
    meMini.querySelector('.ic').textContent = me_user.icon || '🎀';
    meMini.querySelector('.nm').textContent = me_user.name || '朋友';
  }

  /* 顯示場景背景照 */
  document.querySelectorAll('.scene-bg').forEach(el=>{
    requestAnimationFrame(()=>el.classList.add('show'));
  });
}

/* DOMContentLoaded 後自動套用 */
document.addEventListener('DOMContentLoaded', bindCommonUI);
