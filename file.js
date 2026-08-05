// ============ ELEMENT REFERENCES ============
const worldBg = document.getElementById('worldBg');
const bgMusic = document.getElementById('bgMusic');
const waveSound = document.getElementById('waveSound');
const muteBtn = document.getElementById('muteBtn');

const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
const moonBgEl = document.getElementById('moonBgEl');
const moonMessage = document.getElementById('moonMessage');

const scenes = document.querySelectorAll('.scene');
const sceneOrder = ['scene-arrival','scene-letter','scene-photos','scene-walk','scene-sunset','scene-night','scene-wish','scene-final'];

let musicStarted = false;
let starParticles = [];
let shootingStarInterval = null;
let bubbleInterval = null;
let footprintThrottle = false;

// ============ SCENE NAVIGATION ============
function goToScene(id){
  scenes.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');

  const theme = target.dataset.theme;
  worldBg.classList.remove('day','sunset','night');
  worldBg.classList.add(theme);

  if(theme === 'sunset'){
    worldBg.classList.remove('sunset-sequence-play');
    void worldBg.offsetWidth; // restart animation
    worldBg.classList.add('sunset-sequence-play');
  }

  if(id === 'scene-letter') initLetter();
  if(id === 'scene-photos') { /* handled by CSS */ }
  if(id === 'scene-walk') initWalk();
  if(id === 'scene-sunset') initSunset();
  if(id === 'scene-night') initNight();
  if(id === 'scene-wish') initWish();
  if(id === 'scene-final') initFinal();
}

// ============ MUSIC ============
muteBtn.addEventListener('click', () => {
  const muted = !bgMusic.muted;
  bgMusic.muted = muted;
  waveSound.muted = muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
});

function startMusic(){
  if(musicStarted) return;
  musicStarted = true;
  bgMusic.volume = 0.7;
  waveSound.volume = 0.15;
  bgMusic.play().catch(()=>{});
  waveSound.play().catch(()=>{});
}

// ============ SCENE 1: BOTTLE ============
document.getElementById('openBottleBtn').addEventListener('click', () => {
  startMusic();
  const bottle = document.getElementById('bottleContainer');
  bottle.style.transition = 'transform .8s ease, opacity .8s ease';
  bottle.style.transform = 'scale(1.3) rotate(10deg)';
  bottle.style.opacity = '0';
  setTimeout(() => goToScene('scene-letter'), 800);
});

// ============ SCENE 2: LETTER ============
const letterParagraphs = [
"Happy Birthday, Marniè 🎉💖",
"You are such an amazing person.",
"Thank you for making time for me even on the busiest of days—even when you were tired, moody, overwhelmed, anxious, and completely done with the day, you still showed up every single time when it mattered.",
"Knowingly or unknowingly, you've become a part of my routine, and I'm so glad to see you working on yourself and becoming the finest anaesthetist AMC has produced.",
"I can't wait to see you shine even brighter in the future.",
"I pray for you all the time, and I hope God blesses you more and more with happiness, strength, and success.",
"Happy Birthday, Marniè 🥳✨"
];

let letterTyped = false;
function initLetter(){
  if(letterTyped) return; // only type once
  letterTyped = true;
  const el = document.getElementById('letterText');
  const fullText = letterParagraphs.join('\n\n');
  let i = 0;
  el.textContent = '';
  function typeChar(){
    if(i < fullText.length){
      el.textContent += fullText[i];
      i++;
      setTimeout(typeChar, 22);
    } else {
      document.getElementById('letterSignature').classList.add('show');
      document.getElementById('continueFromLetter').style.display = 'inline-block';
    }
  }
  typeChar();
}
document.getElementById('continueFromLetter').addEventListener('click', () => goToScene('scene-photos'));

// ============ SCENE 3: PHOTOS ============
document.getElementById('continueFromPhotos').addEventListener('click', () => goToScene('scene-walk'));

// ============ SCENE 4: BEACH WALK ============
let foundCount = 0;
function initWalk(){
  foundCount = 0;
  document.getElementById('foundCount').textContent = '0';
  document.querySelectorAll('.hidden-object').forEach(obj => {
    obj.classList.remove('found');
  });

  const walkArea = document.getElementById('walkArea');

  if(!walkArea.dataset.listenersAttached){
    walkArea.dataset.listenersAttached = 'true';

    document.querySelectorAll('.hidden-object').forEach(obj => {
      obj.addEventListener('click', (e) => {
        if(obj.classList.contains('found')) return;
        obj.classList.add('found');
        foundCount++;
        document.getElementById('foundCount').textContent = foundCount;
        showObjectMessage(obj);
      });
    });

    walkArea.addEventListener('mousemove', (e) => {
      if(footprintThrottle) return;
      footprintThrottle = true;
      setTimeout(()=> footprintThrottle = false, 180);
      const rect = walkArea.getBoundingClientRect();
      const fp = document.createElement('div');
      fp.className = 'footprint';
      fp.style.left = (e.clientX - rect.left) + 'px';
      fp.style.top = (e.clientY - rect.top) + 'px';
      walkArea.appendChild(fp);
      setTimeout(() => { fp.style.opacity = '0'; }, 50);
      setTimeout(() => fp.remove(), 1500);
    });
  }

  clearInterval(bubbleInterval);
  bubbleInterval = setInterval(() => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.animationDuration = (3 + Math.random()*2) + 's';
    walkArea.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove());
  }, 700);
}

function showObjectMessage(obj){
  const walkArea = document.getElementById('walkArea');
  const msg = document.createElement('div');
  msg.className = 'object-message';
  msg.textContent = obj.dataset.message;
  msg.style.left = obj.style.left;
  msg.style.top = obj.style.top;
  walkArea.appendChild(msg);
  requestAnimationFrame(() => msg.classList.add('show'));
  setTimeout(() => {
    msg.classList.remove('show');
    setTimeout(() => msg.remove(), 500);
  }, 2800);
}

document.getElementById('continueFromWalk').addEventListener('click', () => {
  clearInterval(bubbleInterval);
  goToScene('scene-sunset');
});

// ============ SCENE 5: SUNSET CARDS ============
function initSunset(){
  const cards = document.querySelectorAll('#sunsetCards .msg-card');
  cards.forEach(c => c.classList.remove('show'));
  cards.forEach((card, idx) => {
    setTimeout(() => card.classList.add('show'), 600 + idx * 1000);
  });
}
document.getElementById('continueFromSunset').addEventListener('click', () => goToScene('scene-night'));

// ============ SCENE 6: NIGHT (stars, moon, shooting stars) ============
const moonMessages = [
"The moon always reminds me of you.",
"Every beautiful moon somehow finds its way into our chats.",
"I saw the moon today... instinctively, I wanted to send you a picture.",
"Some traditions are worth keeping. Ours is sending each other the moon. 🌙",
"Maybe that's why moonlit nights feel familiar.",
"Every time the moon looks pretty, I wonder if you've already noticed it too.",
"No matter where we are, we're probably looking at the same moon.",
"Funny how a moon became one of my favorite conversations.",
"Here's today's moon... except this time, it's inside your birthday website.",
"Promise me we'll keep sending each other moon pictures."
];
let lastMoonMsg = -1;

moonBgEl.addEventListener('click', () => {
  if(!worldBg.classList.contains('night') && !worldBg.classList.contains('sunset')) return;
  let idx;
  do { idx = Math.floor(Math.random() * moonMessages.length); } while(idx === lastMoonMsg);
  lastMoonMsg = idx;
  moonMessage.textContent = moonMessages[idx];
  moonMessage.classList.add('show');
  moonBgEl.style.transform = 'scale(1.15)';
  setTimeout(() => moonBgEl.style.transform = '', 400);
  setTimeout(() => moonMessage.classList.remove('show'), 3500);
});

function resizeStarsCanvas(){
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeStarsCanvas);
resizeStarsCanvas();

function createStars(){
  starParticles = [];
  const count = 180;
  for(let i=0;i<count;i++){
    starParticles.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height * 0.75,
      r: Math.random() * 1.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02
    });
  }
}
createStars();

function animateStars(){
  starsCtx.clearRect(0,0,starsCanvas.width, starsCanvas.height);
  starParticles.forEach(s => {
    s.phase += s.speed;
    const alpha = 0.4 + Math.sin(s.phase) * 0.4;
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    starsCtx.fillStyle = `rgba(255,249,196,${Math.max(0,alpha)})`;
    starsCtx.fill();
  });
  requestAnimationFrame(animateStars);
}
animateStars();

function spawnShootingStar(){
  const star = document.createElement('div');
  star.className = 'shooting-star';
  const startX = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
  const startY = Math.random() * window.innerHeight * 0.3;
  star.style.left = startX + 'px';
  star.style.top = startY + 'px';
  document.body.appendChild(star);

  const endX = startX - 250;
  const endY = startY + 150;
  let progress = 0;
  const duration = 1200;
  const startTime = performance.now();

  function move(now){
    progress = Math.min(1, (now - startTime) / duration);
    star.style.left = (startX + (endX - startX) * progress) + 'px';
    star.style.top = (startY + (endY - startY) * progress) + 'px';
    star.style.opacity = 1 - progress;
    if(progress < 1) requestAnimationFrame(move);
    else star.remove();
  }
  requestAnimationFrame(move);

  star.addEventListener('click', (e) => {
    e.stopPropagation();
    const wish = document.createElement('div');
    wish.className = 'wish-message';
    wish.textContent = 'Wish made 🌠';
    wish.style.left = star.style.left;
    wish.style.top = star.style.top;
    document.body.appendChild(wish);
    requestAnimationFrame(() => wish.classList.add('show'));
    setTimeout(() => {
      wish.classList.remove('show');
      setTimeout(() => wish.remove(), 500);
    }, 1500);
    star.remove();
  });
}

function initNight(){
  clearInterval(shootingStarInterval);
  shootingStarInterval = setInterval(() => {
    if(worldBg.classList.contains('night')) spawnShootingStar();
  }, 4000);
}
document.getElementById('continueFromNight').addEventListener('click', () => {
  goToScene('scene-wish');
});

// ============ SCENE 7: BIRTHDAY WISH ============
function initWish(){
  document.querySelectorAll('.flame').forEach(f => f.classList.remove('blown'));
}
document.getElementById('blowBtn').addEventListener('click', () => {
  document.querySelectorAll('.flame').forEach((f, i) => {
    setTimeout(() => f.classList.add('blown'), i * 300);
  });
  waveSound.volume = 0.05;
  setTimeout(() => goToScene('scene-final'), 2000);
});

// ============ SCENE 8: FINAL CELEBRATION ============
const fireworksCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fireworksCanvas.getContext('2d');
let fireworkParticles = [];
let fireworksInterval = null;
let fireworksRunning = false;
const fwColors = ['#FFD700','#FFFFFF','#FFC1E3','#AEE0FF'];

function resizeFireworksCanvas(){
  fireworksCanvas.width = fireworksCanvas.offsetWidth;
  fireworksCanvas.height = fireworksCanvas.offsetHeight;
}
window.addEventListener('resize', resizeFireworksCanvas);

function launchFirework(){
  const x = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
  const y = Math.random() * fireworksCanvas.height * 0.4 + fireworksCanvas.height * 0.1;
  const color = fwColors[Math.floor(Math.random() * fwColors.length)];
  const count = 40;
  for(let i=0;i<count;i++){
    const angle = (Math.PI * 2 * i) / count;
    const speed = Math.random() * 3 + 2;
    fireworkParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color
    });
  }
}

function animateFireworks(){
  if(!fireworksRunning) return;
  fwCtx.fillStyle = 'rgba(8,27,51,0.15)';
  fwCtx.fillRect(0,0,fireworksCanvas.width, fireworksCanvas.height);

  fireworkParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    p.alpha -= 0.012;
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, 2, 0, Math.PI*2);
    fwCtx.fillStyle = p.color.replace(')', '').replace('rgb','rgba');
    fwCtx.globalAlpha = Math.max(0, p.alpha);
    fwCtx.fillStyle = p.color;
    fwCtx.fill();
  });
  fwCtx.globalAlpha = 1;
  fireworkParticles = fireworkParticles.filter(p => p.alpha > 0);

  requestAnimationFrame(animateFireworks);
}

function initFinal(){
  resizeFireworksCanvas();
  fireworksRunning = true;
  animateFireworks();
  clearInterval(fireworksInterval);
  fireworksInterval = setInterval(launchFirework, 900);
  launchFirework();

  setTimeout(() => {
    document.getElementById('finalPhotoContainer').classList.add('show');
  }, 2500);

  const finalLines = [
    "Thank you for being such an amazing person.",
    "Thank you for every conversation.",
    "Thank you for every moon picture.",
    "Thank you for being part of my routine.",
    "Some traditions are worth keeping.",
    "Ours is sending each other the moon. 🌙",
    "See you under the next beautiful moon.",
    "— Aelius"
  ];

  const finalText = document.getElementById('finalText');
  finalText.innerHTML = '';
  let delay = 4500;
  finalLines.forEach((line, i) => {
    const div = document.createElement('div');
    div.className = 'final-line' + (i === finalLines.length - 1 ? ' signature' : '');
    div.textContent = line;
    finalText.appendChild(div);
    setTimeout(() => div.classList.add('show'), delay);
    delay += 2200;
  });
}
