/* ============================================================
   cake.js — 蛋糕櫃「慶祝儀式」
   流程：idle → pick → blow → party → drop → done
   ・最後一步（drop）會呼叫 saveCakeOffering()
     寫入 Firebase（如果頁面已啟用 window.fsDb），否則寫進 localStorage
   ・每筆紀錄包含使用者名字 + icon，壽星可以看到誰送的
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

/* ===== 蛋糕清單（可換成你的照片：把 img 改成圖片網址即可） ===== */
const CAKES = [
  {name:'香草千層蛋糕',   emoji:'🍰', img:''},
  {name:'抹茶戚風蛋糕',   emoji:'🍵', img:''},
  {name:'草莓奶油戚風',   emoji:'🍓', img:''},
  {name:'水果派',         emoji:'🥧', img:''},
  {name:'蘋果派',         emoji:'🍎', img:''},
  {name:'焦糖布蕾',       emoji:'🍮', img:''},
  {name:'蒙布朗',         emoji:'🌰', img:''},
  {name:'伯爵綠葡萄蛋糕', emoji:'🍇', img:''},
];
const WISHES_TXT = ['生日快樂！永遠幸福～','願望都成真 ✦','新的一歲閃閃發光 ✨','平安喜樂，一帆風順 ♡'];

let chosen = CAKES[0];
let step   = 'idle';
const STEP_INDEX = { idle:0, pick:1, blow:2, party:3, drop:4, done:5 };

/* ===== Firebase / localStorage 共通的存讀介面 ===== */
async function saveCakeOffering(payload){
  if(window.fsDb){
    try{
      await window.fsDb.collection('cakes').add(payload);
      return;
    }catch(e){ console.warn('Firebase 寫入失敗，改存 localStorage', e); }
  }
  DataStore.addCake(payload);
}
async function loadCakeOfferings(){
  if(window.fsDb){
    try{
      const snap = await window.fsDb.collection('cakes').orderBy('time').get();
      return snap.docs.map(d => d.data());
    }catch(e){ console.warn('Firebase 讀取失敗，改讀 localStorage', e); }
  }
  return DataStore.getCakes();
}

/* ===== 蛋糕台：渲染選到的蛋糕 ===== */
const slicePhoto = document.getElementById('slicePhoto');
const cakeNameEl = document.getElementById('cakeName');
function applyCake(c){
  chosen = c;
  slicePhoto.innerHTML = c.img
    ? `<img src="${c.img}" alt="${escapeHtml(c.name)}">`
    : `<span class="slice-ph">${c.emoji}</span>`;
  cakeNameEl.textContent = c.name;
}

/* 蛋糕選項 chip */
const picker = document.getElementById('cakePicker');
CAKES.forEach((c,i)=>{
  const chip = document.createElement('div');
  chip.className = 'cake-chip' + (i===0 ? ' sel' : '');
  chip.innerHTML = `${c.emoji} ${c.name}`;
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.cake-chip').forEach(x=>x.classList.remove('sel'));
    chip.classList.add('sel');
    applyCake(c);
  });
  picker.appendChild(chip);
});
applyCake(CAKES[0]);

/* ===== 步驟控制 ===== */
function showStep(name){
  step = name;

  document.querySelectorAll('.step-pane').forEach(p=>{
    p.classList.toggle('active', p.dataset.step === name);
  });

  const idx = STEP_INDEX[name];
  document.querySelectorAll('.step-dot').forEach((d,i)=>{
    const dotIdx = i + 1;
    d.classList.toggle('done',   idx >  dotIdx);
    d.classList.toggle('active', idx === dotIdx);
  });

  // 蛋糕台：pick / blow / party / drop 顯示，idle / done 隱藏
  document.getElementById('ritualPlate').hidden = !(idx >= 1 && idx <= 4);

  // 火苗：只在 blow 點得到
  const flame = document.getElementById('flame');
  if(name === 'blow'){ flame.classList.remove('out'); }
  else               { flame.classList.add('out'); }

  // 重置許願詞（每次回到 pick 都會清空）
  if(name === 'pick'){
    document.getElementById('wishLine').textContent = '';
  }
}

/* idle → pick */
document.getElementById('startBtn').addEventListener('click', ()=>{
  showStep('pick');
});

/* pick → blow */
document.getElementById('toBlowBtn').addEventListener('click', ()=>{
  showStep('blow');
});

/* blow：點火苗 → 自動 party */
document.getElementById('flame').addEventListener('click', function(){
  if(step !== 'blow') return;
  this.classList.add('out');
  document.getElementById('wishLine').textContent =
    WISHES_TXT[Math.floor(Math.random()*WISHES_TXT.length)];
  for(let i=0;i<6;i++) spawnFloat('💨', innerWidth/2, innerHeight/2 - 100);
  setTimeout(runParty, 1100);
});

/* party：自動煙火金箔，~2.4 秒後進入 drop */
function runParty(){
  showStep('party');
  fireworksBurst();
  setTimeout(goldFall, 350);
  setTimeout(confettiRain, 200);
  setTimeout(()=>showStep('drop'), 2400);
  // 預覽送禮者名字
  document.getElementById('senderPreview').textContent = me_user.name;
}

/* drop：飛進桶子 + 寫資料 */
document.getElementById('dropBtn').addEventListener('click', async function(){
  if(step !== 'drop') return;
  this.disabled = true;

  await flyToBucket();

  const payload = {
    name:  me_user.name,
    icon:  me_user.icon,
    cake:  chosen.name,
    emoji: chosen.emoji,
    time:  Date.now(),
  };
  await saveCakeOffering(payload);
  await renderBucket();

  document.getElementById('senderName').textContent = me_user.name;
  document.getElementById('senderCake').textContent = chosen.name;
  showStep('done');
  this.disabled = false;
});

/* done → idle（再送一塊） */
document.getElementById('againBtn').addEventListener('click', ()=>{
  showStep('idle');
});

/* ===== 飛進桶子動畫 ===== */
function flyToBucket(){
  return new Promise(resolve=>{
    const plate  = document.querySelector('.ritual-plate .cake-plate');
    const target = document.getElementById('bucketBody');
    if(!plate || !target){ resolve(); return; }

    const s = plate.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    const fly = document.createElement('div');
    fly.className   = 'fly-cake';
    fly.textContent = chosen.emoji;
    fly.style.left  = (s.left + s.width/2 - 32) + 'px';
    fly.style.top   = (s.top  + s.height/2 - 32) + 'px';
    document.body.appendChild(fly);

    const dx = (t.left + t.width/2) - (s.left + s.width/2);
    const dy = (t.top  + t.height/2) - (s.top  + s.height/2);

    requestAnimationFrame(()=>{
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.4) rotate(360deg)`;
      fly.style.opacity   = '.15';
    });
    setTimeout(()=>{ fly.remove(); resolve(); }, 850);
  });
}

/* ===== 收集桶渲染 ===== */
async function renderBucket(){
  const body  = document.getElementById('bucketBody');
  const count = document.getElementById('bucketCount');
  const items = await loadCakeOfferings();

  count.textContent = items.length;

  if(!items.length){
    body.innerHTML = '<div class="bucket-empty">桶子是空的，第一個來慶生的人就是你！</div>';
    return;
  }
  body.innerHTML = items.slice().reverse().map(it => `
    <div class="bk-item" title="${escapeHtml(it.cake)}・by ${escapeHtml(it.name)}">
      <span class="bk-cake">${it.emoji || '🍰'}</span>
      <span class="bk-by">${it.icon || ''} ${escapeHtml(it.name)}</span>
    </div>
  `).join('');
}
renderBucket();
