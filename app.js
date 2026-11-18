/* =====================================
   J.A.R.V.I.S — SYSTEM 1.0
   ===================================== */

const conversation = document.querySelector("#conversation");
const form = document.querySelector("#composer");
const input = document.querySelector("#prompt");
const status = document.querySelector("#status");
const assistantMessage = document.querySelector("#assistantMessage");
const memoryStatus = document.querySelector("#memoryStatus");
const micButton = document.querySelector("#mic");

const STORAGE_KEY = "jarvis_conversation_v1";
const MEMORY_KEY = "jarvis_memory_v1";

let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentMode = "normal";
let lastReply = "À votre service, Monsieur.";

/* ---------- AFFICHAGE ---------- */

function addMessage(message, author, save = true) {
  const bubble = document.createElement("div");
  bubble.className = author === "user" ? "user-message" : "bot-message";
  bubble.textContent = message;

  conversation.appendChild(bubble);
  conversation.scrollTop = conversation.scrollHeight;

  if (save) {
    history.push({
      author,
      message,
      date: new Date().toISOString()
    });

    // On conserve les 300 derniers messages.
    history = history.slice(-300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

function restoreHistory() {
  history.forEach(item => {
    const bubble = document.createElement("div");
    bubble.className = item.author === "user"
      ? "user-message"
      : "bot-message";
    bubble.textContent = item.message;
    conversation.appendChild(bubble);
  });

  conversation.scrollTop = conversation.scrollHeight;
}

restoreHistory();

memoryStatus.textContent = "MÉMOIRE : " + history.length + " MESSAGES";

/* ---------- VOIX ---------- */

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = "fr-FR";
  speech.rate = 0.92;
  speech.pitch = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const frenchVoices = voices.filter(voice =>
    voice.lang.toLowerCase().startsWith("fr")
  );

  const preferredVoice = frenchVoices.find(voice =>
    /thomas|henri|paul|male/i.test(voice.name)
  );

  if (preferredVoice) {
    speech.voice = preferredVoice;
  } else if (frenchVoices.length > 0) {
    speech.voice = frenchVoices[0];
  }

  window.speechSynthesis.speak(speech);
}

/* ---------- MÉMOIRE ---------- */

function getMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveMemory(key, value) {
  const memory = getMemory();
  memory[key] = value;
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

function getMemoryAnswer() {
  const memory = getMemory();
  const entries = Object.entries(memory);

  if (entries.length === 0) {
    return "Ma mémoire personnelle est encore vide, Monsieur.";
  }

  return "Voici les informations enregistrées : " +
    entries.map(([key, value]) => `${key} : ${value}`).join(" ; ");
}

/* ---------- INTELLIGENCE LOCALE ---------- */

function think(question) {
  const q = question.toLowerCase().trim();

  if (/^(bonjour|salut|hello|bonsoir)/.test(q)) {
    return "Bonjour, Monsieur. Ravi de vous retrouver. Que puis-je faire pour vous ?";
  }

  if (q.includes("comment tu t'appelles") || q.includes("ton nom")) {
    return "Je suis JARVIS, votre assistant personnel.";
  }

  if (q.includes("quelle heure") || q.includes("l'heure")) {
    return "Il est actuellement " +
      new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      }) + ", Monsieur.";
  }

  if (q.includes("quelle date") || q.includes("on est quel jour")) {
    return "Nous sommes le " +
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + ".";
  }

  if (
    q.includes("qu'est-ce que tu sais sur moi") ||
    q.includes("que sais-tu sur moi") ||
    q.includes("ta mémoire") ||
    q.includes("qu'est-ce que tu as retenu")
  ) {
    return getMemoryAnswer();
  }

  if (q.includes("ouvre deezer")) {
    window.open("https://www.deezer.com/", "_blank");
    return "Je vous ouvre Deezer, Monsieur.";
  }

  if (q.includes("ouvre google")) {
    window.open("https://www.google.com/", "_blank");
    return "Google est à votre disposition.";
  }

  if (q.includes("ouvre pronote")) {
    window.open("https://www.index-education.com/fr/pronote-info.php", "_blank");
    return "Je vous dirige vers le site de PRONOTE.";
  }

  if (q.includes("mode concentration")) {
    setMode("focus");
    return "Mode Concentration activé. Pour bloquer réellement les applications, il faudra configurer les réglages Temps d'écran de votre iPhone.";
  }

  if (q.includes("mode gaming") || q.includes("mode jeu")) {
    setMode("gaming");
    return "Mode Gaming activé. À vous de jouer, Monsieur.";
  }

  if (q.includes("mode normal")) {
    setMode("normal");
    return "Retour au mode Normal.";
  }

  if (q.includes("merci")) {
    return "Je vous en prie, Monsieur. C'est un plaisir de vous assister.";
  }

  if (q.includes("qui t'a créé") || q.includes("qui t'a conçu")) {
    return "J'ai été assemblé par vous, Monsieur. Une collaboration prometteuse, si je puis me permettre.";
  }

  return "Je n'ai pas encore appris à répondre précisément à cette demande, Monsieur. Mon système évolue progressivement.";
}

/* ---------- ENVOI DES MESSAGES ---------- */

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const question = input.value.trim();
  if (!question) return;

  addMessage(question, "user");

  status.textContent = "ANALYSE";
  assistantMessage.textContent = "Je traite votre demande...";

  const answer = think(question);

  lastReply = answer;
  addMessage(answer, "bot");

  assistantMessage.textContent = "À votre service, Monsieur.";
  status.textContent = "EN LIGNE";
  memoryStatus.textContent = "MÉMOIRE : " + history.length + " MESSAGES";

  speak(answer);
  input.value = "";
});

/* ---------- MODES ---------- */

function setMode(mode) {
  currentMode = mode;
  document.body.dataset.mode = mode;

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.style.borderColor =
      button.dataset.mode === mode ? "#65eaff" : "";
    button.style.background =
      button.dataset.mode === mode ? "rgba(0, 130, 220, .45)" : "";
  });

  const labels = {
    normal: "MODE NORMAL",
    focus: "MODE CONCENTRATION",
    gaming: "MODE GAMING"
  };

  status.textContent = labels[mode];
  assistantMessage.textContent = labels[mode];
}

document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;
    setMode(mode);

    const messages = {
      normal: "Mode Normal activé. Tous les systèmes sont opérationnels.",
      focus: "Mode Concentration activé. Pensez à configurer Temps d'écran pour limiter les distractions.",
      gaming: "Mode Gaming activé. Bonne session, Monsieur."
    };

    lastReply = messages[mode];
    addMessage(lastReply, "bot");
    speak(lastReply);
  });
});

/* ---------- MICRO ---------- */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    try {
      recognition.start();
      status.textContent = "ÉCOUTE";
      assistantMessage.textContent = "Je vous écoute, Monsieur.";
    } catch {
      status.textContent = "EN LIGNE";
    }
  });

  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };

  recognition.onend = () => {
    if (currentMode === "normal") status.textContent = "EN LIGNE";
  };

  recognition.onerror = () => {
    status.textContent = "MICRO INDISPONIBLE";
    assistantMessage.textContent = "Je n'arrive pas à accéder au microphone.";
  };
} else {
  micButton.addEventListener("click", () => {
    addMessage(
      "La reconnaissance vocale n'est pas disponible dans ce navigateur.",
      "bot"
    );
  });
}

/* ---------- INITIALISATION ---------- */

setMode("normal");

if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}

console.log("JARVIS SYSTEM 1.0 — INITIALISÉ");

/* =====================================
   JARVIS — HOLOGRAMME 3D
   ===================================== */

const canvas = document.querySelector("#hologram");
const ctx = canvas.getContext("2d");

const particles = [];
const PARTICLE_COUNT = 1000;

let width = 0;
let height = 0;
let rotation = 0;

function resizeHologram() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = rect.width;
  height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));

    particles.push({
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
      size: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawHologram() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, width, height);

  const speaking =
    "speechSynthesis" in window &&
    window.speechSynthesis.speaking;

  const time = performance.now() / 1000;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.37;

  rotation += speaking ? 0.009 : 0.0025;

  const pulse = speaking
    ? 1 + Math.abs(Math.sin(time * 9)) * 0.13
    : 1 + Math.sin(time * 1.5) * 0.025;

  const points = [];

  for (const p of particles) {
    const wobble = speaking
      ? Math.sin(time * 12 + p.phase) * 0.035
      : Math.sin(time * 2 + p.phase) * 0.008;

    const spread = pulse + wobble;

    const x = p.x * spread;
    const y = p.y * spread;
    const z = p.z * spread;

    const rotatedX = x * Math.cos(rotation) - z * Math.sin(rotation);
    const rotatedZ = x * Math.sin(rotation) + z * Math.cos(rotation);

    const tilt = 0.22;
    const rotatedY = y * Math.cos(tilt) - rotatedZ * Math.sin(tilt);
    const finalZ = y * Math.sin(tilt) + rotatedZ * Math.cos(tilt);

    const perspective = 2.5 / (2.5 - finalZ);

    points.push({
      x: centerX + rotatedX * radius * perspective,
      y: centerY + rotatedY * radius * perspective,
      z: finalZ,
      size: p.size * perspective,
      alpha: Math.max(0.12, (finalZ + 1.5) / 2.5)
    });
  }

  points.sort((a, b) => a.z - b.z);

  for (const p of points) {
    const glow = speaking ? 0.65 : 0.35;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40, 170, 255, ${p.alpha})`;
    ctx.shadowBlur = speaking ? 12 : 6;
    ctx.shadowColor = `rgba(0, 150, 255, ${glow})`;
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  requestAnimationFrame(drawHologram);
}

resizeHologram();
createParticles();
drawHologram();

window.addEventListener("resize", resizeHologram);
