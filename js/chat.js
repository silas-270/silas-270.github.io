// Chat-Klasse für bessere Organisation und Wiederverwendbarkeit
class Chat {
    constructor() {
        // DOM-Elemente
        this.textarea = document.getElementById('input-field');
        this.sendBtn = document.getElementById('send-btn');
        this.messages = document.getElementById('messages');
        this.inputWrapper = document.getElementById('input-wrapper');

        // Chat-Historie
        this.chatHistory = [
            { role: "system", content: CONFIG.CHAT.SYSTEM_PROMPT },
            ...CONFIG.CHAT.INITIAL_MESSAGES
        ];

        // Event-Listener
        this.setupEventListeners();
        
        // Initial UI-Update
        this.updateUI();
    }

    setupEventListeners() {
        // Texteingabe-Handler
        this.textarea.addEventListener('input', () => this.handleInput());
        
        // Enter-Taste zum Senden
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Senden-Button
        this.sendBtn.addEventListener('click', () => this.sendMessage());
    }

    handleInput() {
        // Textarea-Höhe anpassen
        this.textarea.style.height = 'auto';
        const lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
        const maxHeight = lineHeight * 5;
        const newHeight = Math.min(this.textarea.scrollHeight, maxHeight);
        this.textarea.style.height = `${newHeight}px`;

        // Wrapper-Höhe anpassen
        const style = getComputedStyle(this.inputWrapper);
        const padTop = parseFloat(style.paddingTop);
        const padBottom = parseFloat(style.paddingBottom);
        this.inputWrapper.style.height = `${newHeight + padTop + padBottom}px`;

        // Button-Status aktualisieren
        this.sendBtn.disabled = !this.textarea.value.trim();
    }

    async sendMessage() {
        const userText = this.textarea.value.trim();
        if (!userText) return;

        // UI-Status aktualisieren
        this.setLoading(true);
        this.appendMessage(userText, 'user');
        
        // Chat-Historie aktualisieren
        this.chatHistory.push({ role: 'user', content: userText });

        try {
            const response = await this.fetchBotResponse();
            const botMessage = response.choices?.[0]?.message?.content?.trim() || '[keine Antwort]';
            
            this.chatHistory.push({ role: 'assistant', content: botMessage });
            this.appendMessage(botMessage, 'bot');
        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
            this.appendMessage(`Ups, da ist etwas schiefgelaufen: ${error.message}. Versuche es später nochmal!`, 'bot');
        } finally {
            this.setLoading(false);
            // Textarea leeren und Fokus behalten
            this.textarea.value = '';
            this.handleInput();
            this.textarea.focus();
        }
    }

    async fetchBotResponse() {
        try {
            const response = await fetch(CONFIG.API.URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.API.KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.API.MODEL,
                    messages: this.chatHistory,
                    max_tokens: CONFIG.API.MAX_TOKENS,
                    temperature: CONFIG.API.TEMPERATURE,
                    top_p: CONFIG.API.TOP_P
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('API Fehler:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                throw new Error(`API Fehler: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Netzwerk oder API Fehler:', error);
            throw new Error(`Verbindungsfehler: ${error.message}`);
        }
    }

    appendMessage(text, sender) {
        if (this.messages.classList.contains('hidden')) {
            this.messages.classList.remove('hidden');
        }

        const msg = document.createElement('div');
        msg.classList.add('message', sender);
        msg.textContent = text;
        this.messages.appendChild(msg);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    setLoading(isLoading) {
        this.textarea.disabled = isLoading;
        this.sendBtn.disabled = isLoading;
        this.sendBtn.innerHTML = isLoading 
            ? '<div class="spinner"></div>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
    }

    updateUI() {
        this.handleInput();
        // Initiale Nachrichten werden nicht mehr angezeigt
    }
}

// Chat initialisieren wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new Chat();
}); 