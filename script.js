document.addEventListener('DOMContentLoaded',()=>{

const stage=document.getElementById('stage');
const dotWrapper=document.getElementById('dotWrapper');
const startStop=document.getElementById('startStop'),menuBtn=document.getElementById('menuBtn'),menu=document.getElementById('menu');
const speedRange=document.getElementById('speedRange'),speedLabel=document.getElementById('speedLabel');
const durationSelect=document.getElementById('durationSelect');
const timerDisplay=document.getElementById('timer');
const heartbeat=document.getElementById('heartbeat');

/* State */
let running=false,direction=1,pos=0,lastTs=null,beatTimer=null,animFrame=null,timerInterval=null;
let speedBPM=parseInt(speedRange.value,10);
let durationSec=parseInt(durationSelect.value,10);
let remainingSec=durationSec;

/* helpers */
const updateSpeedLabel=()=>speedLabel.textContent=speedBPM;
const fmt=s=>('00'+s).slice(-2);

/* audio */
function playBeat(){heartbeat.currentTime=0;heartbeat.play().catch(()=>{});}
function startBeats(){stopBeats();playBeat();beatTimer=setInterval(playBeat,60000/speedBPM);}
function stopBeats(){if(beatTimer){clearInterval(beatTimer);beatTimer=null;}heartbeat.pause();heartbeat.currentTime=0;}

/* timer */
function startTimer(){remainingSec=durationSec;display();timerInterval=setInterval(()=>{remainingSec--;display();if(remainingSec<=0)stop();},1000);}
function stopTimer(){if(timerInterval){clearInterval(timerInterval);timerInterval=null;}}
function display(){timerDisplay.textContent=`${fmt(remainingSec)} s`;}

/* anim */
function step(ts){
  if(!running)return;
  if(!lastTs)lastTs=ts;
  const dt=(ts-lastTs)/1000;lastTs=ts;
  const bps=speedBPM/60;
  const distancePerSec=1/bps; // half cycle per beat (left to right in 1 beat)
  pos+=direction*dt/distancePerSec; // direction +/-1
  if(pos>=1){pos=1;direction=-1;}
  else if(pos<=0){pos=0;direction=1;}
  updatePos();
  animFrame=requestAnimationFrame(step);
}
function updatePos(){
  const stageW=stage.clientWidth;
  const dotW=dotWrapper.clientWidth;
  const offset=20;
  const travel=stageW-dotW-offset*2;
  const x=offset+pos*travel;
  dotWrapper.style.transform=`translate(${x}px,-50%)`;
}

/* flow */
function start(){
  running=true;startStop.textContent='Stop';lastTs=null;startBeats();startTimer();animFrame=requestAnimationFrame(step);
}
function stop(){
  running=false;startStop.textContent='Start';stopBeats();stopTimer();if(animFrame)cancelAnimationFrame(animFrame);
}

startStop.addEventListener('click',()=>running?stop():start());

/* menu */
menuBtn.addEventListener('click',()=>{menu.classList.toggle('hidden');menu.setAttribute('aria-hidden',menu.classList.contains('hidden'));});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!menuBtn.contains(e.target)&&!menu.classList.contains('hidden')){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');}});
speedRange.addEventListener('input',()=>{speedBPM=parseInt(speedRange.value,10);updateSpeedLabel();if(running)startBeats();});
durationSelect.addEventListener('change',()=>{durationSec=parseInt(durationSelect.value,10);if(!running)remainingSec=durationSec;display();});

updateSpeedLabel();display();window.addEventListener('resize',updatePos);updatePos();

});
