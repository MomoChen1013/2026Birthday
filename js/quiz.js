/* ============================================================
   quiz.js — 你有多了解 Momo？ + 與 Momo 的契合度
   ============================================================
   ▸ 題目格式（主測驗）
     ── 單選題：
        {type:'single', q:'問題', opts:['A','B','C','D'], answer:0}
        answer = 正確選項的位置（從 0 開始數，第一個是 0）

     ── 多選題（必須「全選對」才得 1 分；少選 / 多選都算錯）：
        {type:'multi',  q:'問題', opts:['A','B','C','D','E'], answer:[1,3]}
        answer = 所有正確答案的位置陣列

   ▸ 怎麼編題
     1. 想新增題目 → 複製某一行貼進陣列，改 q / opts / answer
     2. 想刪題     → 把整行刪掉
     3. 題目順序、題數都可以自由增減，進度點、計分會自動跟上

   ▸ 寫多選題的小撇步：選項很多時可以用空白切，省得自己加引號
        opts: '射箭 騎馬 跆拳道 街舞 書法'.split(' ')

   ▸ 怎麼改結算文案
     最下面 QUIZ_MSG 陣列，依正確率（從高到低）顯示不同訊息

   ▸ COMPAT（5 題價值觀題）使用方式
     ・這 5 題會「自動同時」出現在兩個地方：
         a) 主測驗的最後 5 題 — 問題會自動變成 "你覺得對 Momo 來說…"
            答對 = 跟 Momo 的真實答案一致
         b) 下方「與 Momo 的契合度」區塊 — 問題會問你自己的看法
            作答後會儲存、並用長條圖顯示大家的選擇分布
     ・改 momoAnswer 就會同步影響兩邊
     ・想新增 / 刪除契合度題目，動 COMPAT 陣列即可，QUIZ 會自動跟上
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

/* ============================================================
   契合度題庫（兼用：主測驗 + 下方契合度區塊）
   momoAnswer：0=A、1=B、2=C、3=D
============================================================ */
const COMPAT = [
  {
    emoji:'💰', title:'金錢觀',
    self:      '對你來說，錢最大的意義是？',
    aboutMomo: '你覺得對 Momo 來說，錢最大的意義是？',
    opts:[
      '安全感的來源，存款足夠我才安心',
      '我能力與成就的證明，越多越能肯定自己',
      '夠用就好，更在意能不能幫助別人或支持理念',
      '讓我體驗新事物、保有選擇與自由的工具',
    ],
    momoAnswer: 3,  // D
  },
  {
    emoji:'🌱', title:'人生觀',
    self:      '你覺得「過得好的一生」最重要的是？',
    aboutMomo: '你覺得對 Momo 來說，「過得好的一生」最重要的是？',
    opts:[
      '不斷探索與嘗試，活得新鮮、有變化',
      '對他人或世界有正面影響，活得有意義',
      '達成目標、做出成績，留下屬於自己的成就',
      '安穩平順，少一點波折地把日子過好',
    ],
    momoAnswer: 0,  // A
  },
  {
    emoji:'💗', title:'戀愛觀',
    self:      '一段感情裡你最看重的是？',
    aboutMomo: '你覺得對 Momo 來說，一段感情裡最看重的是？',
    opts:[
      '彼此扶持，願意無條件為對方著想',
      '穩定、忠誠、可以長久依靠',
      '對方欣賞我、讓我覺得自己更好、更有自信',
      '兩人能一起冒險、保持新鮮與成長',
    ],
    momoAnswer: 1,  // B
  },
  {
    emoji:'🏠', title:'家庭觀',
    self:      '你心中理想的家庭是？',
    aboutMomo: '你覺得對 Momo 來說，理想的家庭是？',
    opts:[
      '重視傳統與和諧，凝聚、有秩序',
      '家人各有所成、彼此成長、為家庭爭光',
      '彼此包容照顧，把愛無條件給家人',
      '尊重每個人的獨立與自由，各自精彩',
    ],
    momoAnswer: 3,  // D
  },
  {
    emoji:'💼', title:'職場觀',
    self:      '工作中最讓你有動力的是？',
    aboutMomo: '你覺得對 Momo 來說，工作中最有動力的是？',
    opts:[
      '升遷、被看見、證明自己的實力',
      '工作能幫助別人、對社會有貢獻',
      '能發揮創意、自由探索新做法',
      '穩定有保障、流程清楚可預期',
    ],
    momoAnswer: 2,  // C
  },
];

/* ============================================================
   主測驗題庫
============================================================ */
const QUIZ = [
  /* ============ 單選題（共 10 題） ============ */

  // ── 1～3：原本就有，是 Momo 本人的真實答案 ──
  {type:'single', q:'Momo 最喜歡的運動是？',
    opts:['空中瑜伽','跑步','重訓','游泳'], answer:0},

  {type:'single', q:'Momo 一個月大概讀幾本書？',
    opts:['1 本','2 本','4 本左右','完全沒空讀'], answer:2},

  {type:'single', q:'Momo 的職業是？',
    opts:['工程師','UX／產品設計師','老師','行銷企劃'], answer:1},

  // ── 4～10：以下為★範本★，請依 Momo 真實答案修改 ──
  {type:'single', q:'Momo 的星座是？',
    opts:['雙子','處女','天秤','雙魚'], answer:0},

  {type:'single', q:'Momo 最喜歡的顏色是？',
    opts:['粉紅','薰衣草紫','天空藍','奶油黃'], answer:1},

  {type:'single', q:'Momo 最愛的甜點是？',
    opts:['千層','草莓蛋糕','馬卡龍','焦糖布蕾'], answer:0},

  {type:'single', q:'Momo 平常最常喝的飲料是？',
    opts:['拿鐵','抹茶拿鐵','氣泡水','鮮奶茶'], answer:0},

  {type:'single', q:'Momo 一週運動幾次？',
    opts:['1 次','2–3 次','4–5 次','幾乎天天'], answer:1},

  {type:'single', q:'Momo 最理想的旅行方式是？',
    opts:['海邊度假','山林健行','城市探險','在家躺平'], answer:0},

  {type:'single', q:'Momo 最喜歡的季節是？',
    opts:['春','夏','秋','冬'], answer:0},

  /* ============ COMPAT 5 題自動加入主測驗（問題改成「你覺得對 Momo 來說…」） ============ */
  ...COMPAT.map(c => ({
    type: 'single',
    q: c.aboutMomo,
    opts: c.opts,
    answer: c.momoAnswer,
  })),

  /* ============ 多選題（共 5 題・全對才得分） ============ */

  // ── 1. Momo 提供的真實題 ✓ ──
  {type:'multi', q:'Momo 沒學過下列哪些？',
    opts: '射箭 騎馬 跆拳道 街舞 書法 素描 鋼琴 芭蕾 設計 拉花 甜點 羊毛氈 鉤針'.split(' '),
    answer:[2, 7, 12]},

  // ── 2～5：以下為★範本★，請依 Momo 真實答案修改 ──
  {type:'multi', q:'Momo 養過下列哪些寵物？',
    opts: '貓 狗 兔子 倉鼠 烏龜 魚 鸚鵡 刺蝟'.split(' '),
    answer:[0, 1]},

  {type:'multi', q:'Momo 喜歡下列哪些料理？',
    opts: '日式 韓式 義式 墨西哥 泰式 中式 法式 越式'.split(' '),
    answer:[0, 2, 4]},

  {type:'multi', q:'Momo 去過下列哪些國家？',
    opts: '日本 韓國 泰國 越南 英國 法國 美國 加拿大'.split(' '),
    answer:[0, 1, 2]},

  {type:'multi', q:'Momo 喜歡看哪些類型的影集？',
    opts: '喜劇 推理 紀錄片 戀愛 奇幻 恐怖 動作 科幻'.split(' '),
    answer:[0, 1, 3]},
];

/* ============================================================
   結算文案：依正確率顯示不同訊息（從高到低判斷）
============================================================ */
const QUIZ_MSG = [
  {min:1.0,  text:'你是 Momo 的頭號粉絲！💜'},
  {min:0.8,  text:'根本是 Momo 本人吧 ✨'},
  {min:0.6,  text:'超級了解 Momo～ ♡'},
  {min:0.3,  text:'還不錯，再多認識一點吧！'},
  {min:0,    text:'沒關係，今天開始更認識 Momo ♡'},
];

/* ============================================================
   以下為渲染與計分邏輯，編題不用動
============================================================ */
let qi = 0, qscore = 0;
const quizCard = document.getElementById('quizCard');

function renderQuiz(){
  if(qi >= QUIZ.length){ renderQuizResult(); return; }
  const item    = QUIZ[qi];
  const isMulti = item.type === 'multi';

  const dots = QUIZ.map((_,i)=>`<div class="q-dot ${i<qi?'done':''}"></div>`).join('');
  const opts = item.opts.map((o,i)=>`<button class="q-opt" data-i="${i}">${escapeHtml(o)}</button>`).join('');
  const badge = isMulti
    ? '<span class="q-type multi">多選・全對才得分</span>'
    : '<span class="q-type single">單選</span>';
  const submitBtn = isMulti
    ? '<button class="btn small q-submit" id="qSubmit">送出答案</button>'
    : '';

  quizCard.innerHTML = `
    <div class="q-progress">${dots}</div>
    <div class="q-type-row">${badge}</div>
    <div class="q-text"><span class="q-num">Q${qi+1}.</span> ${escapeHtml(item.q)}</div>
    <div class="q-options ${isMulti ? 'multi' : ''}">${opts}</div>
    ${submitBtn}
  `;

  const optBtns = quizCard.querySelectorAll('.q-opt');

  if(isMulti){
    optBtns.forEach(btn => btn.addEventListener('click', ()=> btn.classList.toggle('sel')));
    document.getElementById('qSubmit').addEventListener('click', ()=> gradeMulti(item, optBtns));
  } else {
    optBtns.forEach(btn=>{
      btn.addEventListener('click', ()=> gradeSingle(item, optBtns, +btn.dataset.i));
    });
  }
}

function gradeSingle(item, optBtns, picked){
  optBtns.forEach(b => b.style.pointerEvents = 'none');
  if(picked === item.answer){
    optBtns[picked].classList.add('correct');
    qscore++;
  } else {
    optBtns[picked].classList.add('wrong');
    optBtns[item.answer].classList.add('correct');
  }
  setTimeout(()=>{ qi++; renderQuiz(); }, 900);
}

function gradeMulti(item, optBtns){
  const picked  = [...optBtns].filter(b => b.classList.contains('sel'))
                              .map(b => +b.dataset.i).sort((a,b)=>a-b);
  const correct = [...item.answer].sort((a,b)=>a-b);
  const allRight = picked.length === correct.length &&
                   picked.every((v,i) => v === correct[i]);

  optBtns.forEach(b => b.style.pointerEvents = 'none');
  const submit = document.getElementById('qSubmit');
  if(submit) submit.style.display = 'none';

  optBtns.forEach((b, i)=>{
    const isAns   = item.answer.includes(i);
    const wasPick = b.classList.contains('sel');
    if(isAns)        b.classList.add('correct');
    else if(wasPick) b.classList.add('wrong');
  });

  if(allRight) qscore++;
  setTimeout(()=>{ qi++; renderQuiz(); }, 1600);
}

function renderQuizResult(){
  const total = QUIZ.length;
  const ratio = total ? qscore / total : 0;
  const msg   = (QUIZ_MSG.find(m => ratio >= m.min) || {text:''}).text;

  quizCard.innerHTML = `
    <div class="q-result">
      <div class="big">${qscore}/${total}</div>
      <div class="msg">${msg}</div>
      <button class="btn small" id="quizAgain">再玩一次</button>
    </div>`;
  confettiRain();
  document.getElementById('quizAgain').addEventListener('click', ()=>{
    qi = 0; qscore = 0; renderQuiz();
  });
}

renderQuiz();

/* ============================================================
   與 Momo 的契合度（5 題 + 長條圖）
============================================================ */
const MOMO_COMPAT_ANSWERS = COMPAT.map(c => c.momoAnswer);
const SESSION_COMPAT_KEY  = 'momo.compatSubmitted';
let compatPicks = new Array(COMPAT.length).fill(null);

function letter(i){ return String.fromCharCode(65 + i); }   // 0→A, 1→B…

function renderCompat(){
  const card = document.getElementById('compatCard');
  if(!card) return;

  // 同個 session 已作答 → 直接看結果
  if(sessionStorage.getItem(SESSION_COMPAT_KEY) === '1'){
    const saved = LS.get('compatLast', null);
    if(saved){ compatPicks = saved; renderCompatChart(card); return; }
  }
  renderCompatForm(card);
}

function renderCompatForm(card){
  card.innerHTML = `
    <p class="compat-intro">回答下面 5 題，看看你的價值觀和 Momo 多接近 ✦<br>
      <small>送出後會匿名記錄、和大家的選擇一起做成長條圖</small></p>
    ${COMPAT.map((c, qi) => `
      <div class="compat-q" data-qi="${qi}">
        <div class="compat-q-title">
          <span class="em">${c.emoji}</span> ${escapeHtml(c.title)}
        </div>
        <div class="compat-q-text">${escapeHtml(c.self)}</div>
        <div class="compat-opts">
          ${c.opts.map((opt, oi) => `
            <button class="compat-opt" data-qi="${qi}" data-oi="${oi}">
              <span class="ltr">${letter(oi)}.</span>
              <span>${escapeHtml(opt)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('')}
    <button class="btn compat-submit" id="compatSubmit" disabled>送出 → 看結果</button>
  `;

  card.querySelectorAll('.compat-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const qi = +btn.dataset.qi, oi = +btn.dataset.oi;
      compatPicks[qi] = oi;
      card.querySelectorAll(`.compat-opt[data-qi="${qi}"]`)
          .forEach(b => b.classList.toggle('sel', b === btn));
      document.getElementById('compatSubmit').disabled =
        compatPicks.some(p => p === null);
    });
  });

  document.getElementById('compatSubmit').addEventListener('click', ()=>{
    if(compatPicks.some(p => p === null)) return;
    DataStore.addCompat([...compatPicks]);
    LS.set('compatLast', [...compatPicks]);
    sessionStorage.setItem(SESSION_COMPAT_KEY, '1');
    renderCompatChart(card);
    confettiRain();
  });
}

function renderCompatChart(card){
  const all     = DataStore.getCompat();
  const total   = all.length;
  const matches = compatPicks.reduce(
    (acc, pick, i) => acc + (pick === MOMO_COMPAT_ANSWERS[i] ? 1 : 0), 0);

  const chartHtml = COMPAT.map((c, qi) => {
    const counts = [0, 0, 0, 0];
    all.forEach(entry => {
      const v = entry[qi];
      if(typeof v === 'number' && v >= 0 && v < 4) counts[v]++;
    });
    const max = Math.max(...counts, 1);

    const bars = c.opts.map((opt, oi) => {
      const cnt   = counts[oi];
      const pct   = cnt / max * 100;
      const isYou  = compatPicks[qi] === oi;
      const isMomo = MOMO_COMPAT_ANSWERS[qi] === oi;
      let cls = '';
      if(isYou && isMomo) cls = 'match';
      else if(isYou)      cls = 'you';
      else if(isMomo)     cls = 'momo';
      const badges =
        (isYou && isMomo) ? '<span class="badge match">⭐ 你+Momo</span>' :
        isYou             ? '<span class="badge you">你</span>' :
        isMomo            ? '<span class="badge momo">⭐ Momo</span>' : '';

      return `
        <div class="compat-bar-row ${cls}" title="${escapeHtml(opt)}">
          <span class="compat-bar-letter">${letter(oi)}</span>
          <div class="compat-bar-track">
            <div class="compat-bar-fill" style="width:${pct}%"></div>
            <span class="compat-bar-badges">${badges}</span>
          </div>
          <span class="compat-bar-count">${cnt}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="compat-chart-q">
        <div class="compat-chart-title">
          <span class="em">${c.emoji}</span> ${escapeHtml(c.title)}
        </div>
        <div class="compat-chart-q-text">${escapeHtml(c.self)}</div>
        <div class="compat-bars">${bars}</div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="compat-result-head">
      <div class="compat-score">${matches} <small>／</small> ${COMPAT.length}</div>
      <div class="compat-score-hint">與 Momo 的答案一致 ✨</div>
      <div class="compat-total-hint">目前 <b>${total}</b> 人完成這個調查</div>
    </div>
    ${chartHtml}
    <p class="compat-foot">💡 跟你選相同答案的長條是 <span class="legend-you">粉色</span>；
       跟 Momo 一致時會變 <span class="legend-match">綠色 ⭐</span>；
       Momo 自己的選擇是 <span class="legend-momo">金色 ⭐</span></p>
    <button class="btn ghost small compat-reset" id="compatReset">重新作答</button>
  `;

  document.getElementById('compatReset').addEventListener('click', ()=>{
    sessionStorage.removeItem(SESSION_COMPAT_KEY);
    compatPicks = new Array(COMPAT.length).fill(null);
    renderCompatForm(card);
    window.scrollTo({top: card.offsetTop - 80, behavior:'smooth'});
  });
}

renderCompat();
