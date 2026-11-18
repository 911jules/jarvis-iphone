const chat=document.querySelector('#chat');
const form=document.querySelector('#composer');
const input=document.querySelector('#prompt');
let lastReply="Bonjour. Je suis votre prototype d'assistant.";
function addMessage(text,who){const el=document.createElement('div');el.className='message '+who;el.textContent=text;chat.appendChild(el);chat.scrollTop=chat.scrollHeight;}
function answer(q){const s=q.toLowerCase();if(/bonjour|salut|hello/.test(s))return "Bonjour. Ravi de vous assister.";
if(/aide|faire|capable/.test(s))return "Je peux répondre à quelques commandes de démonstration. Les connexions à vos applications seront ajoutées plus tard.";
if(/date|jour/.test(s))return "Nous sommes le "+new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(new Date())+".";
if(/deezer|musique|ninho/.test(s))return "L'intégration Deezer n'est pas encore activée. Elle sera ajoutée dans une prochaine étape.";
if(/pronote|devoir|emploi du temps/.test(s))return "L'intégration PRONOTE n'est pas encore activée. Ne partagez jamais votre mot de passe ici.";
return "J'ai bien reçu votre demande. Mon cerveau connecté n'est pas encore installé : ceci est la première version de l'interface.";}
form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;addMessage(q,'user');lastReply=answer(q);addMessage(lastReply,'bot');input.value='';});
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.prompt;form.requestSubmit();}));
document.querySelector('#speak').addEventListener('click',()=>{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(lastReply);u.lang='fr-FR';u.rate=.92;u.pitch=.82;speechSynthesis.speak(u);}});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
