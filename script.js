// Silas-Spruch Generator
const silasSprüche = [
    "Silas würde einen Toast als Hut tragen.",
    "Silas würde jetzt eine Schnecke interviewen.",
    "Silas würde Peppa zum Armdrücken herausfordern.",
    "Silas würde einen Rap über Gummibärchen schreiben.",
    "Silas würde rückwärts reden, um die Zukunft zu beeinflussen.",
    "Silas würde ein Einhorn als Haustier adoptieren.",
    "Silas würde mit Schorsch eine Gang gründen.",
    "Silas würde lieber in Pfützen springen als Steuern zahlen."
];
  
function generateSilas() {
    const random = Math.floor(Math.random() * silasSprüche.length);
    document.getElementById('silasDisplay').innerText = silasSprüche[random];
}  




const textarea = document.getElementById('input-field');
const sendBtn  = document.getElementById('send-btn');
const messages = document.getElementById('messages');
  
const TOKEN = "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";
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const API = `https://api-inference.huggingface.co/models/${MODEL}`;
  
textarea.addEventListener('input', () => {
    const lh = parseFloat(getComputedStyle(textarea).lineHeight);
    const mh = lh * 5;
    textarea.style.height = Math.min(textarea.scrollHeight, mh) + 'px';
    sendBtn.disabled = !textarea.value.trim();
});
  
sendBtn.addEventListener('click', sendMessage);
  
async function sendMessage() {
    const userText = textarea.value.trim();
    if (!userText) return;
  
    // UI: Spinner & Disable
    sendBtn.disabled = true;
    textarea.disabled = true;
    const oldIcon = sendBtn.innerHTML;
    sendBtn.innerHTML = '<div class="spinner"></div>';
  
    appendMessage(userText, 'user');
    textarea.value = '';
    textarea.style.height = 'auto';
  

    //const prompt = `Frage: ${userText}\nAntwort:`;
    const prompt = `Beantworte die Folgende Frage so, als wärst du Silas Kammer, ein 19 Jähriger Junge aus Deutschland. 
    Du erzählst nicht viel über dich und deine Antworten sind kurz. Frage: ${userText}\nAntwort:`;
  
    try {
        const res = await fetch(API, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                 max_new_tokens: 256,
                 temperature: 0.7,
                 return_full_text: false,
                 stop: ["\nFrage:"]
                }
            })
        });
  
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let bot  = Array.isArray(data) && data[0].generated_text
                       ? data[0].generated_text.trim()
                       : "[keine Antwort]";
        bot = bot.split('Frage:')[0].trim();
        appendMessage(bot, 'bot');
  
      } catch (e) {
        console.error(e);
        appendMessage('Fehler: ' + e.message, 'bot');
      } finally {
        textarea.disabled = false;
        sendBtn.innerHTML = oldIcon;
        sendBtn.disabled = !textarea.value.trim();
        textarea.focus();
      }
    }
  
    function appendMessage(text, sender) {
      if (messages.classList.contains('hidden'))
        messages.classList.remove('hidden');
      const msg = document.createElement('div');
      msg.classList.add('message', sender);
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }