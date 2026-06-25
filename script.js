const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
  const toggle=document.getElementById('toggle'),menu=document.getElementById('menu');
  toggle.addEventListener('click',()=>menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
  const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0.12});
  document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%5*0.05)+'s';io.observe(el)});

  /* bell + stag — official frames; legs at gif cadence, body at natural walk speed */
  const FW=75, FH=69, SHEET_N=22;
  const CFG={ frameMs:120, dispH:150, walkPxPerSec:115,
    pauseBeforeGrazeFrames:5, grazeLoopCycles:4, pauseAfterGrazeFrames:5,
    centerRatio:0.5, edgePadding:24, chewBob:[6,7,8,9,8,7] };
  const SCALE=CFG.dispH/FH, dispW=FW*SCALE;
  const stag=document.getElementById('stag'), meadow=document.getElementById('meadow');
  const snackGrass=document.getElementById('snackGrass');
  const bell=document.getElementById('bell'), hint=document.getElementById('bellHint');
  stag.style.width=dispW+'px'; stag.style.height=CFG.dispH+'px';
  stag.style.backgroundSize=(FW*SHEET_N*SCALE)+'px '+CFG.dispH+'px';
  const WALK=[0,1,2,3,4,5,6,7], eat=k=>8+k;
  const repeat=(a,c)=>Array.from({length:c},()=>a).flat();
  function grazeTimeline(){
    return [
      ...Array(CFG.pauseBeforeGrazeFrames).fill(eat(0)),
      eat(0),eat(1),eat(2),eat(3),eat(4),eat(5),eat(6),eat(7),eat(8),eat(9),
      ...repeat(CFG.chewBob.map(eat),CFG.grazeLoopCycles),
      eat(9),eat(10),eat(11),eat(12),eat(13),
      ...Array(CFG.pauseAfterGrazeFrames).fill(eat(13)),
    ];
  }
  const setFrame=i=>{stag.style.backgroundPositionX=(-(i*dispW))+'px';};
  const setX=x=>{stag.style.transform='translate3d('+x+'px,0,0)';};
  function chime(){try{const A=new (window.AudioContext||window.webkitAudioContext)();[880,1318.5].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=f;const t=A.currentTime+i*0.09;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.1,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+0.65);});}catch(e){}}
  let busy=false;
  function run(){
    if(busy)return; busy=true;
    const W=meadow.clientWidth;
    const startX=-dispW-CFG.edgePadding, centerX=Math.round(W*CFG.centerRatio-dispW/2), endX=W+CFG.edgePadding;
    const graze=grazeTimeline();
    let phase='in', t0=null, gi=0, gLast=0;
    snackGrass.classList.remove('show');
    stag.style.opacity='1'; setFrame(0); setX(startX);
    function frame(now){
      if(t0===null)t0=now;
      const el=now-t0;
      if(phase==='in'){
        setFrame(WALK[Math.floor(el/CFG.frameMs)%8]);
        const x=startX+CFG.walkPxPerSec*(el/1000);
        if(x>=centerX){ setX(centerX); phase='graze'; t0=now; gi=0; gLast=now; snackGrass.classList.add('show'); setFrame(graze[0]); }
        else setX(x);
      } else if(phase==='graze'){
        setX(centerX);
        if(now-gLast>=CFG.frameMs){ gLast=now; gi++;
          if(gi>=graze.length){ phase='out'; t0=now; }
          else setFrame(graze[gi]); }
      } else { // out
        setFrame(WALK[Math.floor(el/CFG.frameMs)%8]);
        const x=centerX+CFG.walkPxPerSec*(el/1000);
        if(x>=endX){ stag.style.opacity='0'; snackGrass.classList.remove('show'); busy=false; return; }
        setX(x);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  bell.addEventListener('click',()=>{bell.classList.remove('ringing');void bell.offsetWidth;bell.classList.add('ringing');hint.classList.add('gone');chime();run();});
