const input = document.getElementById('user-input');
const btncoco = document.getElementById('send-btn');
const btnbaba = document.getElementById('send-btn2');
const messages = document.getElementById('message-display');
const status = document.getElementById('chicken-status');
const coco = document.getElementById('chicken-container');
const baba = document.getElementById('fox-container');
const model = document.querySelector('model-viewer');

let targetX = 0;
let targetY = 0;
let currentX = 0; 
let currentY = 0;

document.getElementById('enter-btn').addEventListener('click', () => {
  const welcome = document.getElementById('welcome-screen');
  const modal = document.getElementById('chatbot-modal');

  welcome.style.transition = 'opacity 0.6s ease-out';
  welcome.style.opacity = '0';
  setTimeout(() => welcome.remove(), 600);

  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';

});

document.getElementById('back-btn').addEventListener('click', () => {
  window.history.back();
});



model.addEventListener('load', () => {
  model.animationName = "Take 001";
  model.animationName = "rigAction";
  model.play({ repetitions: Infinity });
  startWandering();
});


function startWandering() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 10 + Math.random() * 100; 
  const newX = currentX + Math.cos(angle) * distance;
  const newY = currentY + Math.sin(angle) * distance;

  const distFromCenter = Math.sqrt(newX * newX + newY * newY);
  if (distFromCenter > 400) {
    currentX = newX * 0.7;
    currentY = newY * 0.7;
  } else {
    currentX = newX;
    currentY = newY;
  }

  const duration = 3000 + Math.random() * 4000;

    coco.style.transition = `transform ${duration}ms cubic-bezier(0.45, 0, 0.55, 1)`;
    coco.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    
    baba.style.transition = `transform ${duration-2000}ms cubic-bezier(0.45, 0, 0.55, 1)`;
    baba.style.transform = `translate(calc(-50% + ${currentY+100}px), calc(-50% + ${currentX+100}px))`;

  setTimeout(startWandering, duration+500 );
}

async function envoyerCoco() {
  const q = input.value.trim();
  if (!q) return;

  input.value = '';

  try {
    const res = await fetch('http://localhost:3000/api/chat/coco', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    });
    const data = await res.json();
    const rep = data.choices[0].message.content;

    document.getElementById('message-display').innerHTML =
      `<div class="flex justify-end my-4"><div class="bg-gray-200 p-3 rounded-xl max-w-xs">${q}</div></div><div class="speech-bubble">${rep.replace(/\n/g, '<br>')}</div>`;

  } catch (e) {
    messages.innerHTML += `<div class="speech-bubble bg-red-100 p-4 rounded-2xl rounded-bl-none">Le renard a volé le Wi-Fi…</div></div>`;
  }
}

async function envoyerBaba() {
  const q = input.value.trim();
  if (!q) return;

  input.value = '';

  try {
    const res = await fetch('http://localhost:3000/api/chat/baba', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    });
    const data = await res.json();
    const rep = data.choices[0].message.content;

    document.getElementById('message-display').innerHTML =
      `<div class="flex justify-end my-4"><div class="bg-gray-200 p-3 rounded-xl max-w-xs">${q}</div></div><div class="speech-bubble">${rep.replace(/\n/g, '<br>')}</div>`;

  } catch (e) {
    messages.innerHTML += `<div class="speech-bubble bg-red-100 p-4 rounded-2xl rounded-bl-none">Baba a volé le Wi-Fi…</div></div>`;
  }
}



coco.addEventListener('click', () => {
  const scene = document.getElementById('chat-container');

  const oeuf = document.createElement('img');
  oeuf.src = 'oeuf.png';
  oeuf.style.position = 'absolute';
  oeuf.style.width = '15px';
  oeuf.style.height = '20px';
  oeuf.style.pointerEvents = 'none';
  oeuf.style.zIndex = '30';
  oeuf.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';
  oeuf.style.userSelect = 'none';


  const cocoRect = coco.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();

  let x = cocoRect.left - sceneRect.left + cocoRect.width / 2 - 25;
  let y = cocoRect.top - sceneRect.top + cocoRect.height / 2 - 30;

  oeuf.style.left = x + 'px';
  oeuf.style.top = y + 'px';

  scene.appendChild(oeuf);

  let vx = (Math.random() - 0.5) * 16;
  let vy = (Math.random() - 0.5) * 16;

  const sceneWidth = scene.clientWidth;
  const sceneHeight = scene.clientHeight;

  function animate() {
    x += vx;
    y += vy;

    if (x <= 0 || x >= sceneWidth - 50) {
      vx = -vx * 0.92;
      x = Math.max(0, Math.min(sceneWidth - 50, x));
    }
    if (y <= 0 || y >= sceneHeight - 60) {
      vy = -vy * 0.92;
      y = Math.max(0, Math.min(sceneHeight - 60, y));
    }

    oeuf.style.left = x + 'px';
    oeuf.style.top = y + 'px';
    oeuf.style.transform = `rotate(${x * 8}deg)`;

    requestAnimationFrame(animate);
  }

  animate();
});


btncoco.onclick = envoyerCoco;
btnbaba.onclick = envoyerBaba;
input.addEventListener('keypress', e => e.key === 'Enter' && envoyerCoco());