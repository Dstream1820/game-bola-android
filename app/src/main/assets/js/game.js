const bgm=new Audio('data/sound/bgm/BGM_Late_Check-In_Night.dat');
bgm.loop=true;bgm.preload='auto';bgm.volume=1;
let gameSoundVolume=1;
function startBGM(){bgm.play().catch(()=>{})}
window.addEventListener('load',startBGM);
document.addEventListener('click',startBGM,{once:true});
document.addEventListener('touchstart',startBGM,{once:true});
document.addEventListener('visibilitychange',()=>document.hidden?bgm.pause():startBGM());

const mainButtons=document.querySelector('.main-buttons');
const settingsOverlay=document.getElementById('settingsModal');
const exitOverlay=document.getElementById('exitModal');
const openSettingsBtn=document.getElementById('openSettingsBtn');
const closeSettingsBtn=document.getElementById('closeSettingsBtn');
const startBtn=document.getElementById('startBtn');
const exitBtn=document.getElementById('exitBtn');
const exitMessage=document.getElementById('exitMessage');
const cancelExitBtn=document.getElementById('cancelExitBtn');
const confirmExitBtn=document.getElementById('confirmExitBtn');
const gameSoundSlider=document.getElementById('gameSoundSlider');
const bgmSlider=document.getElementById('bgmSlider');
const languageSelect=document.getElementById('languageSelect');
let settingsFromGameplay=false;

openSettingsBtn.onclick=()=>{settingsFromGameplay=false;mainButtons.style.display='none';settingsOverlay.classList.add('active')};
function closeSettings(){
 settingsOverlay.classList.remove('active');
 settingsFromGameplay=false;
 if(gameScreen.classList.contains('active')&&!gameResult.classList.contains('active')){
  running=true;
  lastTime=0;
  cancelAnimationFrame(animationId);
  animationId=requestAnimationFrame(gameLoop);
 }else{
  mainButtons.style.display='flex';
 }
}
closeSettingsBtn.onclick=closeSettings;
settingsOverlay.onclick=e=>{if(e.target===settingsOverlay)closeSettings()};
gameSoundSlider.oninput=()=>gameSoundVolume=Number(gameSoundSlider.value)/100;
bgmSlider.oninput=()=>bgm.volume=Number(bgmSlider.value)/100;

const translations={
id:{
 title:'Pengaturan',start:'Mulai',settings:'Pengaturan',exit:'Keluar',
 gameSound:'• Suara Game',bgm:'• BGM',language:'• Language',close:'[Tutup]',
 confirmMessage:'Yakin mau keluar?',cancel:'BATAL',ok:'OKE',
 score:'Score',menu:'MENU',resume:'Lanjut',gameplaySettings:'Pengaturan',
 mainMenu:'Kembali ke Menu Utama',gameOver:'GAME OVER',win:'MENANG!',
 playAgain:'Main Lagi',mainMenuBtn:'Menu Utama'
},
en:{
 title:'Settings',start:'Start',settings:'Settings',exit:'Exit',
 gameSound:'• Game Sound',bgm:'• BGM',language:'• Language',close:'[Close]',
 confirmMessage:'Are you sure you want to exit?',cancel:'CANCEL',ok:'OK',
 score:'Score',menu:'MENU',resume:'Resume',gameplaySettings:'Settings',
 mainMenu:'Back to Main Menu',gameOver:'GAME OVER',win:'YOU WIN!',
 playAgain:'Play Again',mainMenuBtn:'Main Menu'
}
};
function applyLanguage(){
 const t=translations[languageSelect.value];
 document.documentElement.lang=languageSelect.value;
 document.getElementById('settingsTitle').textContent=t.title;
 startBtn.textContent=t.start;
 openSettingsBtn.textContent=t.settings;
 exitBtn.textContent=t.exit;
 document.getElementById('gameSoundLabel').textContent=t.gameSound;
 document.getElementById('bgmLabel').textContent=t.bgm;
 document.getElementById('languageLabel').textContent=t.language;
 closeSettingsBtn.textContent=t.close;
 exitMessage.textContent=t.confirmMessage;
 cancelExitBtn.textContent=t.cancel;
 confirmExitBtn.textContent=t.ok;
 document.getElementById('scoreLabel').textContent=t.score;
 document.getElementById('gameplayMenuTitle').textContent=t.menu;
 gameplayResumeBtn.textContent=t.resume;
 gameplaySettingsBtn.textContent=t.gameplaySettings;
 gameplayMainMenuBtn.textContent=t.mainMenu;
 resultTitle.textContent=gameResult.classList.contains('active')&&resultTitle.textContent===translations.id.win? t.win : resultTitle.textContent==='MENANG!'||resultTitle.textContent==='YOU WIN!' ? t.win : t.gameOver;
 restartBtn.textContent=t.playAgain;
 menuBtn.textContent=t.mainMenuBtn;
 if(gameResult.classList.contains('active')) resultScore.textContent=t.score+': '+score;
}
languageSelect.onchange=applyLanguage;
function openExitConfirm(){mainButtons.style.display='none';exitOverlay.classList.add('active')}
function closeExitConfirm(){exitOverlay.classList.remove('active');mainButtons.style.display='flex'}
exitBtn.onclick=openExitConfirm;
cancelExitBtn.onclick=closeExitConfirm;
exitOverlay.onclick=e=>{if(e.target===exitOverlay)closeExitConfirm()};
confirmExitBtn.onclick=()=>{if(window.Android&&typeof window.Android.exitApp==='function'){window.Android.exitApp()}else{window.close()}};

const gameScreen=document.getElementById('gameScreen');
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
const scoreText=document.getElementById('scoreText');

const gameResult=document.getElementById('gameResult');
const gameplayMenu=document.getElementById('gameplayMenu');
const gameplayMenuBtn=document.getElementById('gameplayMenuBtn');
const gameplayResumeBtn=document.getElementById('gameplayResumeBtn');
const gameplaySettingsBtn=document.getElementById('gameplaySettingsBtn');
const gameplayMainMenuBtn=document.getElementById('gameplayMainMenuBtn');
const gameplayMenuOverlay=document.getElementById('gameplayMenuOverlay');
const resultTitle=document.getElementById('resultTitle');
const resultScore=document.getElementById('resultScore');
const restartBtn=document.getElementById('restartBtn');
const menuBtn=document.getElementById('menuBtn');

function resizeCanvas(){
const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
}

const levels=[
{name:'Mini',radius:16,color:'#FFD900'},
{name:'Kecil',radius:22,color:'#FF9800'},
{name:'Sedang',radius:29,color:'#F44336'},
{name:'Besar',radius:37,color:'#E91E63'},
{name:'Jumbo',radius:46,color:'#9C27B0'},
{name:'Raksasa',radius:57,color:'#2196F3'},
{name:'Super',radius:70,color:'#00BCD4'},
{name:'Mega',radius:85,color:'#4CAF50'},
{name:'Ultra',radius:102,color:'#CDDC39'},
{name:'Titan',radius:122,color:'#B8860B'}
];

let balls=[],currentBall=null,score=0,running=false,dragging=false,hasMoved=false,pointerDownX=0,animationId=null,spawnCount=0,gameHasStartedDropping=false,lastTime=0;
let arenaLeft=0,arenaRight=0,arenaBottom=0,dangerY=0;

function updateArena(){
const w=canvas.clientWidth,h=canvas.clientHeight;
arenaLeft=w*.055;arenaRight=w*.945;arenaBottom=h*.90;dangerY=h*.28;
}

function drawArena(){
const w=canvas.clientWidth,h=canvas.clientHeight;
ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
ctx.strokeStyle='#111';ctx.lineWidth=5;
ctx.beginPath();ctx.moveTo(arenaLeft,dangerY);ctx.lineTo(arenaLeft,arenaBottom);ctx.stroke();
ctx.beginPath();ctx.moveTo(arenaRight,dangerY);ctx.lineTo(arenaRight,arenaBottom);ctx.stroke();
ctx.beginPath();ctx.moveTo(arenaLeft,arenaBottom);ctx.lineTo(arenaRight,arenaBottom);ctx.stroke();
ctx.strokeStyle='#f00';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(arenaLeft,dangerY);ctx.lineTo(arenaRight,dangerY);ctx.stroke();
}

function createCurrentBall(){
if(!running)return;
let level;
if(spawnCount===0)level=0;
else{
let maxLevel=1;
if(spawnCount>=8)maxLevel=2;
if(spawnCount>=20)maxLevel=3;
if(spawnCount>=40)maxLevel=4;
level=Math.floor(Math.random()*(maxLevel+1));
}
spawnCount++;
const data=levels[level];
currentBall={level,x:(arenaLeft+arenaRight)/2,y:dangerY-70,radius:data.radius};

}

function drawBall(ball){
const data=levels[ball.level];
const pulse=ball.mergePulse||0;
const drawRadius=ball.radius*(1+0.10*pulse);
ctx.beginPath();ctx.arc(ball.x,ball.y,drawRadius,0,Math.PI*2);
ctx.fillStyle=data.color;ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.stroke();
}

let pointerActive=false;
let pointerMoved=false;
let pointerStartX=0;
let ballStartX=0;
let pointerIdActive=null;
const dragThreshold=6;

function pointerPos(e){
 const rect=canvas.getBoundingClientRect();
 return {x:e.clientX-rect.left,y:e.clientY-rect.top};
}

canvas.addEventListener('pointerdown',e=>{
 if(!running||!currentBall)return;
 e.preventDefault();
 const p=pointerPos(e);
 pointerActive=true;pointerMoved=false;pointerStartX=p.x;ballStartX=currentBall.x;pointerIdActive=e.pointerId;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
});

canvas.addEventListener('pointermove',e=>{
 if(!running||!currentBall||!pointerActive||e.pointerId!==pointerIdActive)return;
 e.preventDefault();
 const p=pointerPos(e),dx=p.x-pointerStartX;
 if(!pointerMoved&&Math.abs(dx)>=dragThreshold)pointerMoved=true;
 if(pointerMoved){
  const r=currentBall.radius;
  currentBall.x=Math.max(arenaLeft+r,Math.min(arenaRight-r,ballStartX+dx));
 }
});

function endPointer(e){
 if(!pointerActive||e.pointerId!==pointerIdActive)return;
 const wasMoved=pointerMoved;pointerActive=false;pointerMoved=false;pointerIdActive=null;
 try{canvas.releasePointerCapture(e.pointerId)}catch(_){}
 if(running&&currentBall&&!wasMoved)dropCurrentBall();
}
canvas.addEventListener('pointerup',endPointer);
canvas.addEventListener('pointercancel',endPointer);

function dropCurrentBall(){
 if(!currentBall||!running)return;
 balls.push({level:currentBall.level,x:currentBall.x,y:currentBall.y,vx:0,vy:25,radius:currentBall.radius,hasEnteredArena:false,sleeping:false,sleepTimer:0,settlePhase:Math.random()*Math.PI*2});
 gameHasStartedDropping=true;currentBall=null;
 setTimeout(()=>{if(running)createCurrentBall()},180);
}

const gravity=1850,airDrag=.9968,floorFriction=.997,wallFriction=.998,wallBounce=.30,floorBounce=.22,positionCorrection=.82,maxVelocity=3400,collisionRestitution=.34,collisionFriction=.002,subSteps=8,solverIterations=8,mergeContactPadding=2.2;
function wakeBall(ball){ball.sleeping=false;ball.sleepTimer=0}
function ballMass(ball){return Math.max(1,ball.radius*ball.radius*0.42)}
function keepBallInside(ball){
 const r=ball.radius;
 if(ball.x-r<arenaLeft){ball.x=arenaLeft+r;if(ball.vx<0){ball.vx=-ball.vx*wallBounce;ball.vy*=wallFriction;wakeBall(ball)}}
 if(ball.x+r>arenaRight){ball.x=arenaRight-r;if(ball.vx>0){ball.vx=-ball.vx*wallBounce;ball.vy*=wallFriction;wakeBall(ball)}}
 if(ball.y+r>arenaBottom){ball.y=arenaBottom-r;if(ball.vy>0){const impact=ball.vy;ball.vy=impact>48?-impact*floorBounce:0;ball.vx*=floorFriction;if(Math.abs(ball.vx)<1.5)ball.vx=0;wakeBall(ball)}}
}
function applyContactFriction(a,b,nx,ny,normalImpulse){
 const tx=-ny,ty=nx,rvx=b.vx-a.vx,rvy=b.vy-a.vy,tangentSpeed=rvx*tx+rvy*ty;
 const invA=1/ballMass(a),invB=1/ballMass(b),invTotal=invA+invB;
 let jt=-tangentSpeed/invTotal,maxFriction=Math.abs(normalImpulse)*collisionFriction;
 jt=Math.max(-maxFriction,Math.min(maxFriction,jt));
 a.vx-=jt*invA*tx;a.vy-=jt*invA*ty;b.vx+=jt*invB*tx;b.vy+=jt*invB*ty;
}
function normalCollision(a,b,nx,ny,dist){
 const minDist=a.radius+b.radius,overlap=minDist-dist;if(overlap<=0)return;
 const invA=1/ballMass(a),invB=1/ballMass(b),invTotal=invA+invB,correction=Math.max(0,overlap-.02)*positionCorrection;
 a.x-=nx*correction*(invA/invTotal);a.y-=ny*correction*(invA/invTotal);b.x+=nx*correction*(invB/invTotal);b.y+=ny*correction*(invB/invTotal);
 const rvx=b.vx-a.vx,rvy=b.vy-a.vy,velNormal=rvx*nx+rvy*ny;
 if(velNormal>=0){applyContactFriction(a,b,nx,ny,0);return}
 const impulse=-(1+collisionRestitution)*velNormal/invTotal;
 a.vx-=impulse*invA*nx;a.vy-=impulse*invA*ny;b.vx+=impulse*invB*nx;b.vy+=impulse*invB*ny;
 applyContactFriction(a,b,nx,ny,impulse);wakeBall(a);wakeBall(b);
}
function solveCollision(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);
 if(dist<.0001){
  if(a.level===b.level&&a.level<9){mergeBalls(a,b);return true}
  const angle=((a.level+1)*31+(b.level+1)*17)%100/100*Math.PI*2;
  normalCollision(a,b,Math.cos(angle),Math.sin(angle),.0001);return false;
 }
 const minDist=a.radius+b.radius,nx=dx/dist,ny=dy/dist;
 if(a.level===b.level&&a.level<9&&dist<=minDist+mergeContactPadding){mergeBalls(a,b);return true}
 if(dist>=minDist)return false;
 normalCollision(a,b,nx,ny,dist);return false;
}
const settleRange=3.5,settleStrength=260,settleMaxSpeed=220;
function applySettlingGravity(){
 if(balls.length<2)return;
 for(let i=0;i<balls.length;i++){
  const a=balls[i];if(a.sleeping)continue;
  let hasSupport=false,leftContact=false,rightContact=false;
  for(let j=0;j<balls.length;j++){
   if(i===j)continue;const b=balls[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),contactDist=a.radius+b.radius+settleRange;
   if(dist>contactDist)continue;
   if(dy>0&&Math.abs(dx)<contactDist)hasSupport=true;
   if(Math.abs(dy)<contactDist){if(dx<0)leftContact=true;if(dx>0)rightContact=true}
  }
  if(!hasSupport)continue;
  let dir=0;if(leftContact&&!rightContact)dir=1;else if(rightContact&&!leftContact)dir=-1;else if(!leftContact&&!rightContact)dir=Math.sin(a.settlePhase||0)>=0?1:-1;
  if(dir!==0){a.vx+=dir*settleStrength*(1/60);a.vx=Math.max(-settleMaxSpeed,Math.min(settleMaxSpeed,a.vx));wakeBall(a)}
 }
}
function updatePhysics(dt){
 dt=Math.min(dt,.025);
 for(const ball of balls)if(ball.mergePulse>0)ball.mergePulse=Math.max(0,ball.mergePulse-dt/0.14);const stepDt=dt/subSteps;
 for(let step=0;step<subSteps;step++){
  for(const ball of balls){
   if(ball.sleeping){if(Math.abs(ball.vx)>2.5||Math.abs(ball.vy)>2.5)wakeBall(ball);else continue}
   ball.vy+=gravity*stepDt;const drag=Math.pow(airDrag,stepDt*60);ball.vx*=drag;ball.vy*=drag;
   ball.vx=Math.max(-maxVelocity,Math.min(maxVelocity,ball.vx));ball.vy=Math.max(-maxVelocity,Math.min(maxVelocity,ball.vy));
   ball.x+=ball.vx*stepDt;ball.y+=ball.vy*stepDt;keepBallInside(ball);
   if(!ball.hasEnteredArena&&ball.y-ball.radius>dangerY+12)ball.hasEnteredArena=true;
  }
  for(let iteration=0;iteration<solverIterations;iteration++){
   let merged=false;
   for(let i=0;i<balls.length&&!merged;i++)for(let j=i+1;j<balls.length;j++)if(balls[i]&&balls[j]&&solveCollision(balls[i],balls[j])){merged=true;break}
   for(const ball of balls)keepBallInside(ball);if(merged)continue;
  }
  applySettlingGravity();
 }
 for(const ball of balls){
  const speed=Math.hypot(ball.vx,ball.vy),onFloor=ball.y+ball.radius>=arenaBottom-1.1;
  if(onFloor&&speed<8)ball.sleepTimer+=dt;else{ball.sleepTimer=0;ball.sleeping=false}
  if(ball.sleepTimer>.8){ball.vx=0;ball.vy=0;ball.sleeping=true}
 }
}
function mergeBalls(a,b){
 const ia=balls.indexOf(a),ib=balls.indexOf(b);if(ia===-1||ib===-1)return;
 const newLevel=a.level+1,newX=(a.x+b.x)/2,newY=(a.y+b.y)/2,newVx=(a.vx+b.vx)/2,newVy=(a.vy+b.vy)/2;
 balls.splice(Math.max(ia,ib),1);balls.splice(Math.min(ia,ib),1);
 if(newLevel>=9){
  const radius=levels[9].radius,finalBall={level:9,x:newX,y:newY,vx:newVx*.55,vy:Math.min(newVy*.18,-170),radius,hasEnteredArena:true,sleeping:false,sleepTimer:0,settlePhase:Math.random()*Math.PI*2,mergePulse:1};
  finalBall.x=Math.max(arenaLeft+radius,Math.min(arenaRight-radius,finalBall.x));finalBall.y=Math.min(arenaBottom-radius,finalBall.y);balls.push(finalBall);score+=1000;updateScore();setTimeout(winGame,600);return;
 }
 const radius=levels[newLevel].radius,mergedBall={level:newLevel,x:newX,y:newY,vx:newVx*.55,vy:Math.min(newVy*.18,-105),radius,hasEnteredArena:true,sleeping:false,sleepTimer:0,settlePhase:Math.random()*Math.PI*2,mergePulse:1};
 mergedBall.x=Math.max(arenaLeft+radius,Math.min(arenaRight-radius,mergedBall.x));mergedBall.y=Math.min(arenaBottom-radius,mergedBall.y);balls.push(mergedBall);score+=(newLevel+1)*20;updateScore();
}
function updateScore(){scoreText.textContent=score}
function checkGameOver(){if(!gameHasStartedDropping)return;for(const ball of balls)if(ball.hasEnteredArena&&ball.y-ball.radius<=dangerY&&Math.abs(ball.vy)<12&&Math.abs(ball.vx)<12){gameOver();return}}
function gameOver(){if(!running)return;running=false;const t=translations[languageSelect.value];resultTitle.textContent=t.gameOver;resultScore.textContent=t.score+': '+score;gameResult.classList.add('active')}
function winGame(){if(!running)return;running=false;const t=translations[languageSelect.value];resultTitle.textContent=t.win;resultScore.textContent=t.score+': '+score;gameResult.classList.add('active')}
function drawGame(){drawArena();for(const ball of balls)drawBall(ball);if(currentBall)drawBall(currentBall)}
function gameLoop(timestamp){if(!running)return;if(!lastTime)lastTime=timestamp;const dt=(timestamp-lastTime)/1000;lastTime=timestamp;updatePhysics(dt);checkGameOver();drawGame();animationId=requestAnimationFrame(gameLoop)}
gameplayMenuBtn.onclick=()=>{
 if(!gameScreen.classList.contains('active')||gameResult.classList.contains('active'))return;
 running=false;cancelAnimationFrame(animationId);gameplayMenuOverlay.classList.add('active');
};
gameplayResumeBtn.onclick=()=>{if(gameplayMenuOverlay.classList.contains('active')){gameplayMenuOverlay.classList.remove('active');running=true;lastTime=0;cancelAnimationFrame(animationId);animationId=requestAnimationFrame(gameLoop)}};
gameplaySettingsBtn.onclick=()=>{gameplayMenuOverlay.classList.remove('active');settingsFromGameplay=true;settingsOverlay.classList.add('active')};
gameplayMainMenuBtn.onclick=()=>{gameplayMenuOverlay.classList.remove('active');gameScreen.classList.remove('active');mainButtons.style.display='flex';balls=[];currentBall=null;running=false};
startBtn.onclick=startGame;
function startGame(){mainButtons.style.display='none';gameScreen.classList.add('active');gameResult.classList.remove('active');resizeCanvas();updateArena();balls=[];currentBall=null;score=0;spawnCount=0;running=true;dragging=false;hasMoved=false;gameHasStartedDropping=false;lastTime=0;updateScore();createCurrentBall();cancelAnimationFrame(animationId);animationId=requestAnimationFrame(gameLoop)}
restartBtn.onclick=()=>{gameResult.classList.remove('active');startGame()};
menuBtn.onclick=()=>{running=false;cancelAnimationFrame(animationId);gameResult.classList.remove('active');gameScreen.classList.remove('active');mainButtons.style.display='flex'};
window.addEventListener('resize',()=>{if(gameScreen.classList.contains('active')){resizeCanvas();updateArena();for(const ball of balls)keepBallInside(ball)}});
// Exit confirmation enabled.
