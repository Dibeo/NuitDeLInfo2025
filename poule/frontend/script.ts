const inputField = document.getElementById('user-input') as HTMLInputElement;
const sendButton = document.getElementById('send-btn') as HTMLButtonElement;
const messageDisplay = document.getElementById('message-display') as HTMLDivElement;
const chickenStatus = document.getElementById('chicken-status') as HTMLParagraphElement;

async function envoyer() {
  const question = inputField.value.trim();
  if (!question) return;

  messageDisplay.innerHTML += `<div class="flex justify-end my-4"><div class="bg-gray-200 p-3 rounded-xl max-w-xs">${question}</div></div>`;
  inputField.value = "";
  chickenStatus.textContent = "Je picore… cot cot";

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question })
    });

    const data = await res.json();
    const reponse = data.choices[0].message.content;

    // BONUS : COCO DANSE QUAND ELLE RÉPOND
    const chickenModel = document.getElementById('chicken-model');
    chickenModel.style.animation = 'none';
    chickenModel.style.animation = 'pouleFolle 6s ease-in-out 1';
    setTimeout(() => {
        chickenModel.style.animation = 'pouleFolle 30s ease-in-out infinite';
    }, 6000);

    messageDisplay.innerHTML += `
      <div class="flex items-start my-4">
        <div class="speech-bubble bg-white p-4 rounded-2xl rounded-bl-none max-w-md">
          ${reponse.replace(/\n/g, "<br>")}
        </div>
      </div>`;
   
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
    chickenStatus.textContent = "Prête à caqueter ! cot cot";

  } catch (e) {
    messageDisplay.innerHTML += `<div class="speech-bubble bg-red-100 p-4 rounded-2xl rounded-bl-none">Oups ! Le renard a mangé le Wi-Fi…</div>`;
  }
}

// Bouton et Entrée
sendButton.onclick = envoyer;
inputField.addEventListener("keypress", (e) => { if (e.key === "Enter") envoyer(); });

messageDisplay.innerHTML = `<div class="flex items-start my-4"><div class="speech-bubble bg-white p-4 rounded-2xl rounded-bl-none">Cocorico ! Je suis Coco, la poule la plus intelligente du poulailler ! Pose-moi une question, petit grain de maïs ! cot cot</div></div>`;