const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const world = $("#world");
const scenes = $$(".scene");
const sceneOrder = ["arrival", "letter", "memories", "bottles", "walk", "golden", "night", "cake", "finale"];
const progressBar = $("#progressBar");
const music = $("#music");
const waves = $("#waves");
const musicButton = $("#musicButton");
const backButton = $("#backButton");
let currentScene = 0;
let musicStarted = false;
let userMuted = false;
let sceneTimer;
let toastTimer;
let memoryTimer;

window.addEventListener("load", () => {
  setTimeout(() => $("#loader").classList.add("done"), reduceMotion ? 50 : 2500);
  initializeArrival();
  startAudio();
});

["pointerdown", "keydown", "touchstart"].forEach(eventName => {
  document.addEventListener(eventName, event => {
    if (event.target?.closest?.(".music-button")) return;
    startAudio();
  }, { passive: true });
});

function initializeArrival() {
  const journey = $("#bottleJourney");
  const openButton = $("#openBottle");
  const noButton = $("#noThanks");
  journey.classList.add("arriving");

  const arrivalTime = reduceMotion ? 100 : 12000;
  setTimeout(() => {
    openButton.disabled = false;
    openButton.classList.add("ready");
    noButton.disabled = false;
    noButton.classList.add("ready");
  }, arrivalTime);
}

function updateBackButton() {
  backButton.hidden = currentScene <= 0;
}

function showScene(id) {
  clearTimeout(sceneTimer);
  const next = document.getElementById(id);
  if (!next) return;

  const old = $(".scene.active");
  if (old === next) return;
  old?.classList.add("leaving");

  setTimeout(() => {
    if (old) {
      old.classList.remove("active", "leaving");
      old.hidden = true;
    }
    next.hidden = false;
    requestAnimationFrame(() => next.classList.add("active"));

    currentScene = sceneOrder.indexOf(id);
    if (currentScene < 0) currentScene = scenes.indexOf(next);
    progressBar.style.width = `${((currentScene + 1) / sceneOrder.length) * 100}%`;
    world.className = `world ${next.dataset.theme}`;
    $("#moon").tabIndex = id === "night" || id === "finale" ? 0 : -1;
    updateBackButton();

    if (id === "letter") typeLetter();
    if (id === "memories") startMemoryCarousel();
    if (id === "bottles") initBottles();
    if (id === "golden") revealWishes();
    if (id === "night") startShootingStars();
    if (id === "cake") resetCake();
    if (id === "finale") startFinale();
    if (id !== "memories") clearInterval(memoryTimer);
    if (id !== "night" && id !== "finale") clearInterval(shootingStarTimer);
  }, reduceMotion ? 0 : 700);
}

function goBack() {
  if (currentScene <= 0) return;
  showScene(sceneOrder[currentScene - 1]);
}

function resetCake() {
  $(".cake")?.classList.remove("blown");
  const blow = $("#blowCandles");
  if (blow) blow.disabled = false;
}

$$("[data-next]").forEach(button => {
  button.addEventListener("click", () => showScene(button.dataset.next));
});

backButton.addEventListener("click", goBack);
updateBackButton();

$("#openBottle").addEventListener("click", () => {
  startAudio();
  $(".bottle-wrap").classList.add("opening");
  sceneTimer = setTimeout(() => showScene("letter"), reduceMotion ? 0 : 850);
});

const cuteNoTexts = [
  "the tide already said yes 🌊",
  "nice try — the bottle chose you 💌",
  "this surprise does not take no for an answer",
  "even the waves voted yes",
  "come on, just a tiny peek?"
];

$("#noThanks").addEventListener("click", () => {
  const bubble = $("#cuteBubble");
  bubble.textContent = cuteNoTexts[Math.floor(Math.random() * cuteNoTexts.length)];
  bubble.classList.add("show");
  clearTimeout(bubble.hideTimer);
  bubble.hideTimer = setTimeout(() => bubble.classList.remove("show"), 2000);
});

function startAudio() {
  if (userMuted) return;
  if (!music.paused && musicStarted) return;
  music.volume = 0.6;
  waves.volume = 0.13;
  music.play().then(() => {
    musicStarted = true;
    updateMusicButton(true);
    waves.play().catch(() => {});
  }).catch(() => {
    musicStarted = false;
    updateMusicButton(false);
  });
}

function updateMusicButton(playing) {
  musicButton.classList.toggle("playing", playing);
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
  $(".music-label", musicButton).textContent = playing ? "music on" : "music off";
  $(".music-icon", musicButton).textContent = playing ? "♫" : "♪";
}

musicButton.addEventListener("click", event => {
  event.stopPropagation();
  if (!music.paused) {
    userMuted = true;
    music.pause();
    waves.pause();
    updateMusicButton(false);
    return;
  }
  userMuted = false;
  startAudio();
});

const letterText = `Happy Birthday, Marniè 🎉💖

You are such an amazing person.

Thank you for making time for me even on the busiest of days—even when you were tired, moody, overwhelmed, anxious, and completely done with the day, you still showed up every single time when it mattered.

Knowingly or unknowingly, you've become a part of my routine, and I'm so glad to see you working on yourself and becoming the finest anaesthetist AMC has produced.

I can't wait to see you shine even brighter in the future.

I pray for you all the time, and I hope God blesses you more and more with happiness, strength and success.

Happy Birthday, Marniè 🥳✨`;

let letterHasTyped = false;
function typeLetter() {
  if (letterHasTyped) return;
  letterHasTyped = true;
  const copy = $("#letterCopy");
  const next = $("#letter .next-button");

  if (reduceMotion) {
    copy.textContent = letterText;
    finishLetter();
    return;
  }

  copy.classList.add("typing");
  let index = 0;
  const type = () => {
    copy.textContent += letterText[index] || "";
    index += 1;
    copy.parentElement.scrollTop = copy.parentElement.scrollHeight;
    if (index < letterText.length) {
      setTimeout(type, letterText[index] === "\n" ? 180 : 30);
    } else {
      finishLetter();
    }
  };
  type();

  function finishLetter() {
    copy.classList.remove("typing");
    $("#signature").classList.add("show");
    next.disabled = false;
  }
}

function revealWishes() {
  $$(".wishes p").forEach((wish, index) => {
    setTimeout(() => wish.classList.add("show"), reduceMotion ? 0 : 350 + index * 550);
  });
}

function startMemoryCarousel() {
  clearInterval(memoryTimer);
  const cards = $$("#memories .polaroid").filter(card => !$(".missing", card));
  if (!cards.length) return;

  cards.forEach(card => card.classList.remove("current", "leaving-photo"));
  let index = 0;
  cards[index].classList.add("current");

  if (cards.length === 1 || reduceMotion) return;
  memoryTimer = setInterval(() => {
    const previous = cards[index];
    previous.classList.remove("current");
    previous.classList.add("leaving-photo");

    index = (index + 1) % cards.length;
    cards[index].classList.add("current");

    setTimeout(() => previous.classList.remove("leaving-photo"), 1300);
  }, 5000);
}

const bottleMessages = [
  "Thank you for always making time for me.",
  "You're genuinely one of my favorite people.",
  "I'm proud of how far you've come.",
  "Keep becoming the amazing doctor you're meant to be."
];

function initBottles() {
  const row = $("#bottleRow");
  if (row.dataset.ready) return;
  row.dataset.ready = "true";
  bottleMessages.forEach(message => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "message-bottle";
    button.setAttribute("aria-label", "Open a message in a bottle");
    button.innerHTML = `<span class="mini-bottle" aria-hidden="true"><i class="cork"></i><i class="neck"></i><i class="body"></i></span>`;
    button.addEventListener("click", () => {
      button.classList.add("opened");
      const box = $("#bottleMsg");
      box.textContent = message;
      box.classList.add("show");
    });
    row.append(button);
  });
}

let foundCount = 0;
let discoveryTimer;
$$(".treasure").forEach(treasure => {
  treasure.addEventListener("click", () => {
    if (!treasure.classList.contains("found")) {
      treasure.classList.add("found");
      treasure.setAttribute("aria-pressed", "true");
      foundCount += 1;
      $("#foundCount").textContent = foundCount;
    }
    const discovery = $("#discovery");
    discovery.textContent = treasure.dataset.message;
    discovery.classList.add("show");
    clearTimeout(discoveryTimer);
    discoveryTimer = setTimeout(() => discovery.classList.remove("show"), 3200);
  });
});

let lastFootprint = 0;
$("#treasureBeach").addEventListener("pointermove", event => {
  if (event.pointerType === "touch" || reduceMotion || Date.now() - lastFootprint < 180) return;
  lastFootprint = Date.now();
  const rect = event.currentTarget.getBoundingClientRect();
  const footprint = document.createElement("i");
  footprint.className = "footprint";
  footprint.style.left = `${event.clientX - rect.left}px`;
  footprint.style.top = `${event.clientY - rect.top}px`;
  event.currentTarget.append(footprint);
  setTimeout(() => footprint.remove(), 1900);
});

const moonMessages = [
  "The moon always reminds me of you.",
  "Every beautiful moon somehow finds its way into our chats.",
  "I saw the moon today… instinctively, I wanted to send you a picture.",
  "Some traditions are worth keeping. Ours is sending each other the moon.",
  "No matter where we are, we're probably looking at the same moon.",
  "Promise me we'll keep sending each other moon pictures.",
  "Funny how a moon became one of my favorite conversations."
];
let lastMoonMessage = -1;

$("#moon").addEventListener("click", () => {
  let index;
  do index = Math.floor(Math.random() * moonMessages.length);
  while (index === lastMoonMessage && moonMessages.length > 1);
  lastMoonMessage = index;
  const note = $("#moonNote");
  note.textContent = moonMessages[index];
  note.classList.add("show");
  $("#moon").classList.add("touched");
  setTimeout(() => $("#moon").classList.remove("touched"), 600);
  clearTimeout(note.hideTimer);
  note.hideTimer = setTimeout(() => note.classList.remove("show"), 4300);
});

let shootingStarTimer;
function startShootingStars() {
  clearInterval(shootingStarTimer);
  spawnShootingStar();
  shootingStarTimer = setInterval(() => {
    if ($("#night").classList.contains("active")) spawnShootingStar();
  }, 3500);
}

function spawnShootingStar() {
  if (reduceMotion) return;
  const field = $("#shootingStars");
  const star = document.createElement("button");
  star.type = "button";
  star.className = "shooting-star";
  star.setAttribute("aria-label", "Make a wish on this shooting star");
  star.style.left = `${60 + Math.random() * 35}%`;
  star.style.top = `${7 + Math.random() * 25}%`;
  star.addEventListener("click", () => {
    showToast("Wish made 🌠");
    star.remove();
  });
  field.append(star);
  setTimeout(() => star.remove(), 1800);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

$("#blowCandles").addEventListener("click", event => {
  event.currentTarget.disabled = true;
  $(".cake").classList.add("blown");
  waves.volume = 0.04;
  setTimeout(() => showScene("finale"), reduceMotion ? 100 : 2300);
});

function markImageMissing(image) {
  image.classList.add("missing");
  image.closest(".polaroid")?.remove();
}

$$("img").forEach(image => {
  image.addEventListener("error", () => markImageMissing(image));
  if (image.complete && image.naturalWidth === 0) markImageMissing(image);
});

const starsCanvas = $("#starsCanvas");
const starsContext = starsCanvas.getContext("2d");
let stars = [];

function sizeStars() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  starsCanvas.width = innerWidth * ratio;
  starsCanvas.height = innerHeight * .72 * ratio;
  starsContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.min(260, Math.floor(innerWidth / 4)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight * .68,
    radius: Math.random() * 1.2 + .25,
    alpha: Math.random() * .6 + .2,
    speed: Math.random() * .018 + .005
  }));
}

function drawStars(time = 0) {
  starsContext.clearRect(0, 0, innerWidth, innerHeight * .72);
  stars.forEach((star, index) => {
    const glow = reduceMotion ? star.alpha : star.alpha + Math.sin(time * star.speed + index) * .22;
    starsContext.beginPath();
    starsContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    starsContext.fillStyle = `rgba(255,249,196,${Math.max(.08, glow)})`;
    starsContext.fill();
  });
  requestAnimationFrame(drawStars);
}
sizeStars();
drawStars();

const fireworksCanvas = $("#fireworksCanvas");
const fireworksContext = fireworksCanvas.getContext("2d");
const fireworks = [];
const fireworkColors = ["#fff8e7", "#f7d88a", "#f4b5bd", "#8fc8eb"];
let fireworksStarted = false;

function sizeFireworks() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  fireworksCanvas.width = innerWidth * ratio;
  fireworksCanvas.height = innerHeight * ratio;
  fireworksContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function launchFirework() {
  const x = innerWidth * (.12 + Math.random() * .76);
  const y = innerHeight * (.1 + Math.random() * .4);
  const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
  const count = innerWidth < 600 ? 42 : 64;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * .05;
    const speed = 1.1 + Math.random() * 2.7;
    fireworks.push({
      x, y, color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: Math.random() * 1.4 + .5
    });
  }
}

function drawFireworks() {
  fireworksContext.clearRect(0, 0, innerWidth, innerHeight);
  fireworks.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += .018;
    particle.vx *= .993;
    particle.life -= .009;
    fireworksContext.globalAlpha = Math.max(0, particle.life);
    fireworksContext.fillStyle = particle.color;
    fireworksContext.beginPath();
    fireworksContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    fireworksContext.fill();

    if (particle.y < innerHeight * .72) {
      const reflectedY = innerHeight * 1.44 - particle.y;
      fireworksContext.globalAlpha = Math.max(0, particle.life) * .12;
      fireworksContext.fillRect(particle.x - 3, reflectedY, 6, 1);
    }
  });
  fireworksContext.globalAlpha = 1;
  for (let i = fireworks.length - 1; i >= 0; i -= 1) {
    if (fireworks[i].life <= 0) fireworks.splice(i, 1);
  }
  requestAnimationFrame(drawFireworks);
}

function startFinale() {
  clearInterval(shootingStarTimer);
  if (!fireworksStarted && !reduceMotion) {
    fireworksStarted = true;
    sizeFireworks();
    drawFireworks();
    launchFirework();
    setInterval(() => {
      if ($("#finale").classList.contains("active")) launchFirework();
    }, 1100);
  }

  setTimeout(() => $(".final-photo-wrap").classList.add("show"), reduceMotion ? 0 : 1700);
  $$("#finalLines p").forEach((line, index) => {
    setTimeout(() => line.classList.add("show"), reduceMotion ? 0 : 2800 + index * 950);
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    sizeStars();
    if (fireworksStarted) sizeFireworks();
  }, 150);
});

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") {
    goBack();
    return;
  }
  if (event.key !== "ArrowRight") return;
  const active = $(".scene.active");
  const nextButton = $(".next-button:not(:disabled)", active);
  if (nextButton) nextButton.click();
});
