/* ============================================================
   cake.js — 蛋糕櫃頁面
============================================================ */
if(!requireUser()) { /* requireUser 已導向首頁，下方不會執行 */ }

/* 切片蛋糕清單：之後把 img 換成你的蛋糕照片網址即可（空字串會顯示 emoji 佔位） */
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

const slicePhoto = document.getElementById('slicePhoto');
const cakeNameEl = document.getElementById('cakeName');
const picker     = document.getElementById('cakePicker');

function applyCake(c){
  slicePhoto.innerHTML = c.img
    ? `<img src="${c.img}" alt="${escapeHtml(c.name)}">`
    : `<span class="slice-ph">${c.emoji}</span>`;
  cakeNameEl.textContent = c.name;
}
CAKES.forEach((c,i)=>{
  const chip=document.createElement('div');
  chip.className='cake-chip'+(i===0?' sel':'');
  chip.innerHTML=`${c.emoji} ${c.name}`;
  chip.addEventListener('click',()=>{
    document.querySelectorAll('.cake-chip').forEach(x=>x.classList.remove('sel'));
    chip.classList.add('sel');
    applyCake(c);
  });
  picker.appendChild(chip);
});
applyCake(CAKES[0]);

/* 火苗 → 吹熄、許願、撒彩帶 */
const WISHES_TXT=['生日快樂！永遠幸福～','願望都成真 ✦','新的一歲閃閃發光 ✨','平安喜樂，一帆風順 ♡'];
document.getElementById('flame').addEventListener('click', function(){
  this.classList.add('out');
  document.getElementById('wishLine').textContent=WISHES_TXT[Math.floor(Math.random()*WISHES_TXT.length)];
  confettiRain();
  for(let i=0;i<6;i++) spawnFloat('💨', innerWidth/2, innerHeight/2-100);
  setTimeout(()=>this.classList.remove('out'),2600);
});

/* 慶賀按鈕 */
document.querySelectorAll('[data-fx]').forEach(b=>{
  b.addEventListener('click', ()=>{
    const fx = b.dataset.fx;
    if(fx==='fireworks') fireworksBurst();
    else if(fx==='confetti') confettiRain();
    else if(fx==='firecracker') firecracker();
    else if(fx==='gold') goldFall();
  });
});

/* 愛心集氣 */
const heartMeter = document.getElementById('heartMeter');
const heartFill  = document.getElementById('heartFill');
function renderHearts(){
  const n=DataStore.getHearts();
  document.getElementById('heartCount').textContent=n;
  const pct=Math.min(8+n*4,100);
  heartFill.style.y=(165-(132*pct/100))+'px';
}
heartMeter.addEventListener('click',(e)=>{
  DataStore.addHeart(); renderHearts();
  spawnFloat('💜', e.clientX, e.clientY);
});
renderHearts();
