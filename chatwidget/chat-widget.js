// chat-widget.js
// Ausgelagerter JavaScript-Code für das Chat-Widget mit Groq

// === Konfiguration ===
const API_KEY = "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";                // Dein GROQ API-Key
const MODEL   = "llama-3.3-70b-versatile";          // Modellname
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// DOM-Elemente
const textarea = document.getElementById('input-field');
const sendBtn  = document.getElementById('send-btn');
const messages = document.getElementById('messages');

// ===== Chat-Historie mit Persönlichkeit und Few-Shot-Beispiel =====
const chatHistory = [
  {
    role: "system",
    content: 
      "Du bist Silas Kammer, ein 19-jähriger Junge aus Deutschland. " +
      "Du schreibst locker, direkt, humorvoll. " +
      "Nutze gelegentlich Jugendsprache und Emojis. " +
      "Antworte immer in maximal 20 Wörtern, wie in WhatsApp: direkt, kein Fließtext."
  },
  { role: "user", content: "Hi" },
  { role: "assistant", content: "Hi, was geht? 👋" }
];

// Automatische Anpassung der Textarea-Höhe & Aktivierung des Send-Buttons
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

  // UI: Spinner anzeigen und Eingabe deaktivieren
  sendBtn.disabled = true;
  textarea.disabled = true;
  const oldIcon = sendBtn.innerHTML;
  sendBtn.innerHTML = '<div class="spinner"></div>';

  // Nachricht anzeigen
  appendMessage(userText, 'user');

  // Chat-Historie erweitern
  chatHistory.push({ role: 'user', content: userText });

  // Eingabefeld leeren
  textarea.value = '';
  textarea.style.height = 'auto';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatHistory,
        max_completion_tokens: 75,   // Kurzantwort erzwingen
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const botMsg = data.choices?.[0]?.message?.content?.trim() || '[keine Antwort]';

    // Historie erweitern und anzeigen
    chatHistory.push({ role: 'assistant', content: botMsg });
    appendMessage(botMsg, 'bot');

  } catch (e) {
    console.error(e);
    appendMessage('Fehler: ' + e.message, 'bot');
  } finally {
    // UI zurücksetzen
    textarea.disabled = false;
    sendBtn.innerHTML = oldIcon;
    sendBtn.disabled = !textarea.value.trim();
    textarea.focus();
  }
}

// Hilfsfunktion zum Einfügen von Nachrichten in den Chat
function appendMessage(text, sender) {
  if (messages.classList.contains('hidden')) messages.classList.remove('hidden');
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}
