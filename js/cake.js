/* ============================================================
   cake.js — 蛋糕櫃「慶祝儀式」
   流程：idle → pick → blow → party →（自動掉進桶子）→ done
   ・煙火結束 ~2.4s 後自動把蛋糕送進桶子（不需按鈕）
   ・收集桶用 Matter.js 物理引擎，蛋糕真實掉落堆疊
   ・hover / 點擊蛋糕才會浮出送禮者姓名
   ・最後一步同時呼叫 Firebase（如有設定）或寫進 localStorage
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

/* ===== 蛋糕清單（換成自己的照片：把 img 改成圖片網址即可） ===== */
const CAKES = [
  {name:'香草千層蛋糕',   emoji:'🍰', img:url('../images/cake-01.jpg')},
  {name:'抹茶戚風蛋糕',   emoji:'🍵', img:url('../images/cake-02.jpg')},
  {name:'草莓奶油戚風',   emoji:'🍓', img:url('../images/cake-03.jpg')},
  {name:'水果派',         emoji:'🥧', img:url('../images/cake-04.jpg')},
  {name:'蘋果派',         emoji:'🍎', img:url('../images/cake-05.jpg')},
  {name:'焦糖布蕾',       emoji:'🍮', img:url('../images/cake-06.jpg')},
  {name:'蒙布朗',         emoji:'🌰', img:url('../images/cake-07.jpg')},
  {name:'伯爵綠葡萄蛋糕', emoji:'🍇', img:url('../images/cake-08.jpg')},
];
const WISHES_TXT = ['生日快樂！永遠幸福～','願望都成真 ✦','新的一歲閃閃發光 ✨','平安喜樂，一帆風順 ♡'];

let chosen = CAKES[0];
let step   = 'idle';
const STEP_INDEX = { idle:0, pick:1, blow:2, party:3, drop:4, done:5 };

/* ============================================================
   Firebase / localStorage 共通存讀介面
============================================================ */
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

/* ============================================================
   蛋糕台（儀式中顯示）
============================================================ */
const slicePhoto = document.getElementById('slicePhoto');
const cakeNameEl = document.getElementById('cakeName');
function applyCake(c){
  chosen = c;
  slicePhoto.innerHTML = c.img
    ? `<img src="${c.img}" alt="${escapeHtml(c.name)}">`
    : `<span class="slice-ph">${c.emoji}</span>`;
  cakeNameEl.textContent = c.name;
}

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

/* 在 drop 步驟預先顯示送禮者名字 */
document.getElementById('senderPreview').textContent = me_user.name;

/* ============================================================
   步驟控制
============================================================ */
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

  // 火苗：只有 blow 步驟可點
  const flame = document.getElementById('flame');
  if(name === 'blow'){ flame.classList.remove('out'); }
  else               { flame.classList.add('out'); }

  if(name === 'pick'){ document.getElementById('wishLine').textContent = ''; }
}

/* idle → pick */
document.getElementById('startBtn').addEventListener('click', ()=>showStep('pick'));

/* pick → blow */
document.getElementById('toBlowBtn').addEventListener('click', ()=>showStep('blow'));

/* blow：點火苗 → 自動進入 party */
document.getElementById('flame').addEventListener('click', function(){
  if(step !== 'blow') return;
  this.classList.add('out');
  document.getElementById('wishLine').textContent =
    WISHES_TXT[Math.floor(Math.random()*WISHES_TXT.length)];
  for(let i=0;i<6;i++) spawnFloat('💨', innerWidth/2, innerHeight/2 - 100);
  setTimeout(runParty, 1100);
});

/* party：自動煙火金箔 + 2.4s 後自動掉進桶子 */
function runParty(){
  showStep('party');
  fireworksBurst();
  setTimeout(goldFall, 350);
  setTimeout(confettiRain, 200);
  setTimeout(autoDrop, 2400);
}

/* 自動掉進桶子（不需按鈕） */
async function autoDrop(){
  showStep('drop');
  await flyToBucket();

  const payload = {
    name:  me_user.name,
    icon:  me_user.icon,
    cake:  chosen.name,
    emoji: chosen.emoji,
    time:  Date.now(),
  };
  await saveCakeOffering(payload);
  appendCake(payload);

  document.getElementById('senderName').textContent = me_user.name;
  document.getElementById('senderCake').textContent = chosen.name;

  // 給物理動畫一點時間落定
  setTimeout(()=>showStep('done'), 500);
}

/* done → idle（再送一塊） */
document.getElementById('againBtn').addEventListener('click', ()=>showStep('idle'));

/* ============================================================
   飛進桶子的視覺動畫
============================================================ */
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
    fly.style.left  = (s.left + s.width/2 - 30) + 'px';
    fly.style.top   = (s.top  + s.height/2 - 30) + 'px';
    document.body.appendChild(fly);

    const dx = (t.left + t.width/2) - (s.left + s.width/2);
    const dy = (t.top + 20)         - (s.top  + s.height/2);

    requestAnimationFrame(()=>{
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(.6) rotate(420deg)`;
      fly.style.opacity   = '.15';
    });
    setTimeout(()=>{ fly.remove(); resolve(); }, 850);
  });
}

/* ============================================================
   Matter.js 物理桶子
============================================================ */
const M = window.Matter;
const Engine = M.Engine, World = M.World, Bodies = M.Bodies, Body = M.Body, Events = M.Events, Runner = M.Runner;

const bucketEl   = document.getElementById('bucketBody');
const countEl    = document.getElementById('bucketCount');
const emptyEl    = bucketEl.querySelector('.bucket-empty');
const RADIUS     = 27;     // 蛋糕半徑
const MAX_BODIES = 60;     // 同時最多渲染這麼多顆（再多會 FIFO）
const cakeItems  = [];     // [{ body, el, payload }]
let totalCakes   = 0;
let bucketW = bucketEl.clientWidth || 320;
let bucketH = bucketEl.clientHeight || 280;

const engine = Engine.create({ gravity:{ x:0, y:1, scale:0.0015 } });
const runner = Runner.create();

const wallOpts = { isStatic:true, friction:.6, restitution:.1 };
const floor  = Bodies.rectangle(bucketW/2, bucketH + 30, bucketW * 2, 60, wallOpts);
const leftW  = Bodies.rectangle(-30, bucketH/2, 60, bucketH * 2, wallOpts);
const rightW = Bodies.rectangle(bucketW + 30, bucketH/2, 60, bucketH * 2, wallOpts);
World.add(engine.world, [floor, leftW, rightW]);

Runner.run(runner, engine);

Events.on(engine, 'afterUpdate', ()=>{
  for(const item of cakeItems){
    const p = item.body.position;
    const a = item.body.angle;
    item.el.style.transform = `translate(${p.x - RADIUS}px, ${p.y - RADIUS}px) rotate(${a}rad)`;
  }
});

/* 視窗大小變化時更新牆面位置 */
addEventListener('resize', ()=>{
  bucketW = bucketEl.clientWidth;
  bucketH = bucketEl.clientHeight;
  Body.setPosition(floor,  { x: bucketW/2,    y: bucketH + 30 });
  Body.setPosition(leftW,  { x: -30,          y: bucketH/2    });
  Body.setPosition(rightW, { x: bucketW + 30, y: bucketH/2    });
});

/* ===== 名字浮出泡泡 ===== */
let _tip = null;
function ensureTip(){
  if(_tip) return _tip;
  _tip = document.createElement('div');
  _tip.className = 'bk-tip';
  document.body.appendChild(_tip);
  return _tip;
}
function showTip(el, payload){
  const tip = ensureTip();
  tip.innerHTML = `<span class="ic">${payload.icon||'🎀'}</span><b>${escapeHtml(payload.name)}</b>・送了 ${payload.emoji||'🍰'} ${escapeHtml(payload.cake)}`;
  const r = el.getBoundingClientRect();
  tip.style.left = (r.left + r.width/2) + 'px';
  tip.style.top  = (r.top - 10) + 'px';
  tip.classList.add('show');
}
function hideTip(){ if(_tip) _tip.classList.remove('show'); }

/* ===== 加一個蛋糕（含 body + DOM） ===== */
function addCakeBody(payload){
  const x = RADIUS + 10 + Math.random() * (bucketW - (RADIUS + 10) * 2);
  const y = -RADIUS - Math.random() * 40;

  const body = Bodies.circle(x, y, RADIUS, {
    restitution: 0.32,
    friction:    0.45,
    frictionAir: 0.012,
    density:     0.0012,
  });
  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
  World.add(engine.world, body);

  const el = document.createElement('div');
  el.className   = 'bk-item';
  el.textContent = payload.emoji || '🍰';
  el.style.transform = `translate(${x - RADIUS}px, ${y - RADIUS}px)`;
  bucketEl.appendChild(el);

  el.addEventListener('mouseenter', ()=>showTip(el, payload));
  el.addEventListener('mouseleave', hideTip);
  el.addEventListener('click',      ()=>{
    showTip(el, payload);
    setTimeout(hideTip, 2200);
  });

  cakeItems.push({ body, el, payload });

  // 超過上限：移除最舊的
  if(cakeItems.length > MAX_BODIES){
    const oldest = cakeItems.shift();
    World.remove(engine.world, oldest.body);
    oldest.el.remove();
  }
}

function updateCount(n){
  totalCakes = n;
  countEl.textContent = n;
  bucketEl.classList.toggle('has-items', n > 0);
}

/* 第一次載入：把已存的蛋糕一個一個丟進去 */
async function initBucket(){
  const items = await loadCakeOfferings();
  updateCount(items.length);
  if(!items.length) return;

  // 只渲染最近 MAX_BODIES 個
  const visible = items.slice(-MAX_BODIES);
  visible.forEach((p, i)=>{
    setTimeout(()=> addCakeBody(p), i * 80);
  });
}

/* 慶祝儀式送出新蛋糕時呼叫 */
function appendCake(payload){
  updateCount(totalCakes + 1);
  addCakeBody(payload);
}

initBucket();
