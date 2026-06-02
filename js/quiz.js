/* ============================================================
   quiz.js — 你有多了解 Momo？
   想新增題目：複製一行，貼進陣列裡，改成你的內容即可。
       {q:'問題文字', opts:['選項A','選項B','選項C','選項D'], answer:0},
   ・opts 可放 2～4 個選項
   ・answer 從 0 開始數
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁 */ }

const QUIZ=[
  {q:'Momo 最喜歡的運動是？',     opts:['空中瑜伽','跑步','重訓','游泳'],             answer:0},
  {q:'Momo 一個月大概讀幾本書？', opts:['1 本','2 本','4 本左右','完全沒空讀'],       answer:2},
  {q:'Momo 的職業是？',           opts:['工程師','UX／產品設計師','老師','行銷企劃'], answer:1},
  // {q:'在這裡新增你的題目', opts:['','','',''], answer:0},
];

let qi=0, qscore=0;
const quizCard=document.getElementById('quizCard');

function renderQuiz(){
  if(qi>=QUIZ.length){ renderQuizResult(); return; }
  const item=QUIZ[qi];
  const dots=QUIZ.map((_,i)=>`<div class="q-dot ${i<qi?'done':''}"></div>`).join('');
  const opts=item.opts.map((o,i)=>`<button class="q-opt" data-i="${i}">${escapeHtml(o)}</button>`).join('');
  quizCard.innerHTML=`<div class="q-progress">${dots}</div>
    <div class="q-text"><span class="q-num">Q${qi+1}.</span> ${escapeHtml(item.q)}</div>
    <div class="q-options">${opts}</div>`;
  quizCard.querySelectorAll('.q-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const i=+btn.dataset.i;
      quizCard.querySelectorAll('.q-opt').forEach(b=>b.style.pointerEvents='none');
      if(i===item.answer){ btn.classList.add('correct'); qscore++; }
      else{
        btn.classList.add('wrong');
        quizCard.querySelectorAll('.q-opt')[item.answer].classList.add('correct');
      }
      setTimeout(()=>{ qi++; renderQuiz(); },900);
    });
  });
}
function renderQuizResult(){
  const total=QUIZ.length, ratio=total?qscore/total:0;
  let msg;
  if(ratio>=1)        msg='你是 Momo 的頭號粉絲！💜';
  else if(ratio>=0.6) msg='超級了解 Momo～ ✨';
  else if(ratio>=0.3) msg='還不錯，再多認識一點吧！';
  else                msg='沒關係，今天開始更認識 Momo ♡';
  quizCard.innerHTML=`<div class="q-result">
    <div class="big">${qscore}/${total}</div>
    <div class="msg">${msg}</div>
    <button class="btn small" id="quizAgain">再玩一次</button></div>`;
  confettiRain();
  document.getElementById('quizAgain').addEventListener('click',()=>{
    qi=0; qscore=0; renderQuiz();
  });
}
renderQuiz();
