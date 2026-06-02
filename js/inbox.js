/* ============================================================
   inbox.js — 隱藏的悄悄話信箱頁
   - 密碼門：0613（純前端門檻，不是高強度保護）
   - 解鎖狀態存 sessionStorage：同個分頁重整不必再輸入
   - 關閉分頁就會失效，下次重新進入需要再次輸入
============================================================ */
const PASSWORD = '0613';
const SESSION_KEY = 'momo.inboxUnlocked';

const pwGate   = document.getElementById('pwGate');
const pwInput  = document.getElementById('pwInput');
const pwErr    = document.getElementById('pwErr');
const pwBtn    = document.getElementById('pwBtn');
const ibPage   = document.getElementById('inboxPage');
const backBtn  = document.getElementById('backLobby');
const lockBtn  = document.getElementById('ibLock');

/* ---------- 解鎖 / 上鎖 ---------- */
function unlock(){
  pwGate.style.display = 'none';
  ibPage.hidden = false;
  backBtn.classList.add('show');
  sessionStorage.setItem(SESSION_KEY, '1');
  renderInbox();
  setTimeout(()=>window.scrollTo({top:0, behavior:'instant'}), 0);
}
function lock(){
  sessionStorage.removeItem(SESSION_KEY);
  ibPage.hidden = true;
  backBtn.classList.remove('show');
  pwInput.value = '';
  pwErr.innerHTML = '&nbsp;';
  pwGate.style.display = '';
  setTimeout(()=>pwInput.focus(), 60);
}
function tryUnlock(){
  if(pwInput.value.trim() === PASSWORD){
    unlock();
    return;
  }
  pwErr.textContent = '密碼錯誤 ⨯';
  pwInput.value = '';
  pwInput.focus();
  const card = document.querySelector('#pwGate .gate-card');
  card.animate(
    [{transform:'translateX(0)'},{transform:'translateX(-8px)'},
     {transform:'translateX(8px)'},{transform:'translateX(0)'}],
    {duration:300}
  );
}

pwBtn.addEventListener('click', tryUnlock);
pwInput.addEventListener('keydown', e=>{ if(e.key === 'Enter') tryUnlock(); });
lockBtn.addEventListener('click', lock);

/* 同個 session 已解鎖 → 直接放行 */
if(sessionStorage.getItem(SESSION_KEY) === '1'){
  unlock();
} else {
  setTimeout(()=>pwInput.focus(), 100);
}

/* ---------- 信箱渲染 ---------- */
function timeStr(ts){
  const d = new Date(ts);
  const m = d.getMonth()+1, day = d.getDate();
  const h = String(d.getHours()).padStart(2,'0');
  const mn = String(d.getMinutes()).padStart(2,'0');
  return `${m}/${day} ${h}:${mn}`;
}

function renderInbox(){
  const letters = DataStore.getLetters().slice().reverse();
  document.getElementById('ibCount').textContent = letters.length;

  const list = document.getElementById('ibList');
  if(!letters.length){
    list.innerHTML = `
      <div class="ib-empty">
        <span class="em">📭</span>
        目前還沒有人投信進來<br>
        等朋友們從祝福牆寫信給妳，這裡就會出現囉～
      </div>`;
    return;
  }
  list.innerHTML = letters.map(l => `
    <div class="ib-letter">
      <div class="ib-head">
        <span class="ib-ic">${l.icon || '💌'}</span>
        <span class="ib-name">${escapeHtml(l.name || '朋友')}</span>
        <span class="ib-time">${timeStr(l.time || Date.now())}</span>
      </div>
      <div class="ib-body">${escapeHtml(l.text || '')}</div>
    </div>
  `).join('');
}
