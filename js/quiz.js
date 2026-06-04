/* ============================================================
   quiz.js — 你有多了解 Momo？
   ============================================================
   ▸ 題目格式
     ── 單選題：
        {type:'single', q:'問題', opts:['A','B','C','D'], answer:0}
        answer = 正確選項的位置（從 0 開始數，第一個是 0）

     ── 多選題（必須「全選對」才得 1 分；少選 / 多選都算錯）：
        {type:'multi',  q:'問題', opts:['A','B','C','D','E'], answer:[1,3]}
        answer = 所有正確答案的位置陣列

   ▸ 怎麼編題
     1. 想新增題目 → 複製某一行貼進陣列，改 q / opts / answer 即可
     2. 想刪題     → 把整行刪掉
     3. 題目順序、題數都可以自由增減，進度點、計分會自動跟著變
     4. 選項數量任意（單選建議 3–4 個、多選建議 4–13 個）

   ▸ 寫多選題的小撇步：選項很多時可以用空白切，省得自己加引號
        opts: '射箭 騎馬 跆拳道 街舞 書法'.split(' ')

   ▸ 怎麼改結算文案
     最下面 QUIZ_MSG 陣列，依正確率（從高到低）顯示不同訊息，
     想增減訊息層級或改字，動 text/min 即可。
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

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

  /* ============ 多選題（共 5 題・全對才得分） ============ */

  // ── 1. Momo 提供的真實題 ✓ ──
  {type:'multi', q:'Momo 沒學過下列哪些？',
    opts: '射箭 騎馬 跆拳道 街舞 書法 素描 鋼琴 芭蕾 設計 拉花 甜點 羊毛氈 鉤針'.split(' '),
    answer:[2, 7, 12]},   // 跆拳道(2)、芭蕾(7)、鉤針(12)

  // ── 2～5：以下為★範本★，請依 Momo 真實答案修改 ──
  {type:'multi', q:'Momo 養過下列哪些寵物？',
    opts: '貓 狗 兔子 倉鼠 烏龜 魚 鸚鵡 刺蝟'.split(' '),
    answer:[0, 1]},        // 貓、狗

  {type:'multi', q:'Momo 喜歡下列哪些料理？',
    opts: '日式 韓式 義式 墨西哥 泰式 中式 法式 越式'.split(' '),
    answer:[0, 2, 4]},     // 日式、義式、泰式

  {type:'multi', q:'Momo 去過下列哪些國家？',
    opts: '日本 韓國 泰國 越南 英國 法國 美國 加拿大'.split(' '),
    answer:[0, 1, 2]},     // 日本、韓國、泰國

  {type:'multi', q:'Momo 喜歡看哪些類型的影集？',
    opts: '喜劇 推理 紀錄片 戀愛 奇幻 恐怖 動作 科幻'.split(' '),
    answer:[0, 1, 3]},     // 喜劇、推理、戀愛
];

/* ============================================================
   結算文案：依正確率顯示不同訊息（從高到低判斷）
   想改字或新增層級，直接動 min / text 即可
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
    /* 多選：點選項切換 sel 狀態，按「送出答案」才判分 */
    optBtns.forEach(btn => btn.addEventListener('click', ()=> btn.classList.toggle('sel')));
    document.getElementById('qSubmit').addEventListener('click', ()=> gradeMulti(item, optBtns));
  } else {
    /* 單選：點到就立刻判分 */
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

  /* 把所有正確答案標綠、選錯（多選的）標紅 */
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
