console.log("JARVIS NOUVEAU CERVEAU CHARGÉ");

const chat = document.querySelector("#chat");
const form = document.querySelector("#composer");
const input = document.querySelector("#prompt");

const jarvis = {
  name: "JARVIS",
  personality: "poli, intelligent, calme et légèrement ironique",
  lastReply: "Bonjour. Comment puis-je vous assister ?",
  history: []
};

function speak(text) {
  jarvis.lastReply = text;

  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();

    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = "fr-FR";
    voice.rate = 0.9;
    voice.pitch = 0.8;

    speechSynthesis.speak(voice);
  }
}

function reply(text, who) {
  const element = document.createElement("div");
  element.className = "message " + who;
  element.textContent = text;

  chat.appendChild(element);
  chat.scrollTop = chat.scrollHeight;
}

function think(question) {
  const q = question.toLowerCase().trim();

  if (/bonjour|salut|hello/.test(q)) {
    return "Bonjour Monsieur. Tous les systèmes sont prêts. Que puis-je faire pour vous ?";
  }

  if (/comment vas-tu|ça va/.test(q)) {
    return "Parfaitement opérationnel. Merci de vous en inquiéter.";
  }

  if (/ton nom|qui es-tu/.test(q)) {
    return "Je suis JARVIS, votre assistant personnel.";
  }

  if (/heure/.test(q)) {
    return "Il est actuellement " +
      new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
  }

  if (/date|quel jour/.test(q)) {
    return "Nous sommes le " +
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
  }

  if (/deezer|musique|ninho/.test(q)) {
    window.open(
      "https://www.deezer.com/search/" +
      encodeURIComponent(question),
      "_blank"
    );

    return "Je vous ouvre Deezer.";
  }

  if (/google|recherche|cherche/.test(q)) {
    window.open(
      "https://www.google.com/search?q=" +
      encodeURIComponent(question),
      "_blank"
    );

    return "Voici votre recherche.";
  }

  if (/aide|commandes/.test(q)) {
    return "Je peux vous donner l'heure, la date, ouvrir Deezer et effectuer des recherches Google. Mes capacités évolueront avec mes prochaines mises à jour.";
  }

  return "Je n'ai pas encore appris à répondre à cette demande, Monsieur. Mon intelligence est en cours de développement.";
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const question = input.value.trim();
  if (!question) return;

  reply(question, "user");

  jarvis.history.push({
    user: question,
    date: new Date().toISOString()
  });

  const answer = think(question);

  reply(answer, "bot");
  speak(answer);

  input.value = "";
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});

document.querySelector("#speak").addEventListener("click", () => {
  speak(jarvis.lastReply);
});
