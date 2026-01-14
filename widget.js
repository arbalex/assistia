(function() {
    const API_URL = "http://127.0.0.1:5000";
    
    // Récupérer le client_id depuis l'URL du script
    const scripts = document.currentScript || 
                    document.scripts[document.scripts.length - 1];
    const params = new URLSearchParams(scripts.src.split('?')[1] || '');
    const clientId = params.get('client_id') || 'default';
    
    // Injecter les styles
    const style = document.createElement('style');
    style.textContent = `
        #chatbot-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #2c7be5 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 24px;
            z-index: 9999;
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

        #chatbot-btn:hover {
            transform: scale(1.1);
        }

        #chatbot-popup {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 520px;
            background: #f5f7fb;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
            display: none;
            flex-direction: column;
            z-index: 9998;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }

        #chatbot-popup.show {
            display: flex;
        }

        .chatbot-header {
            background: linear-gradient(135deg, #2c7be5 0%, #764ba2 100%);
            color: white;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chatbot-header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chatbot-header-title {
            font-size: 16px;
            font-weight: 600;
        }

        .chatbot-header-status {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            opacity: 0.9;
        }

        .chatbot-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4caf50;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }

        .chatbot-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chatbot-icon-btn {
            background: transparent;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        .chatbot-info-block {
            background: #ffffff;
            margin: 0 0 10px 0;
            border-radius: 12px;
            padding: 12px 14px 14px 14px;
            box-shadow: 0 2px 6px rgba(15, 35, 52, 0.08);
            font-size: 13px;
            color: #334155;
            text-align: center;
            flex-shrink: 0;
        }


        .chatbot-info-tag {
            display: inline-block;
            background: #4338ca;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 999px;
            margin-bottom: 8px;
        }
        
        .chatbot-info-text {
            text-align: left;
        }


        .chatbot-info-legal {
            margin-top: 6px;
            font-size: 12px;
            color: #2563eb;
            cursor: pointer;
            text-align: center;
        }


        .chatbot-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px 12px 12px 12px;
            background: transparent;
        }

        .chatbot-msg {
            margin-bottom: 10px;
            display: flex;
            animation: slideIn 0.25s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .chatbot-msg.user {
            justify-content: flex-end;
        }

        .chatbot-msg.bot {
            justify-content: flex-start;
        }

        .chatbot-bubble {
            max-width: 75%;
            padding: 9px 13px;
            border-radius: 16px;
            font-size: 13px;
            line-height: 1.4;
            word-wrap: break-word;
        }

        .user .chatbot-bubble {
            background: #2c7be5;
            color: #ffffff;
            border-bottom-right-radius: 4px;
        }

        .bot .chatbot-bubble {
            background: #e5e7eb;
            color: #111827;
            border-bottom-left-radius: 4px;
        }

        .chatbot-input-area {
            padding: 10px 12px 12px 12px;
            border-top: 1px solid #e5e7eb;
            background: #ffffff;
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .chatbot-input-area input {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 13px;
            outline: none;
        }

        .chatbot-input-area input:focus {
            border-color: #2c7be5;
        }

        .chatbot-input-area button {
            background: #2c7be5;
            color: white;
            border: none;
            border-radius: 999px;
            padding: 8px 14px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        }

        .chatbot-input-area button:hover {
            background: #1d63c5;
        }
        
        
        .chatbot-char-counter {
            font-size: 11px;
            color: #6b7280;
            text-align: right;
            padding: 0 14px 8px 14px;
            background: #ffffff;
            border-top: 1px solid #f3f4f6;
        }


        .chatbot-input-area button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        @media (max-width: 480px) {
            #chatbot-popup {
                width: calc(100vw - 20px);
                height: 70vh;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Bouton flottant
    const btn = document.createElement('button');
    btn.id = 'chatbot-btn';
    btn.textContent = '?';
    document.body.appendChild(btn);
    
    // Popup
    const popup = document.createElement('div');
    popup.id = 'chatbot-popup';
    popup.innerHTML = `
        <div class="chatbot-header">
            <div class="chatbot-header-left">
                <div class="chatbot-header-title">Charlie</div>
                <div class="chatbot-header-status">
                    <span class="chatbot-status-dot"></span>
                    <span>En ligne</span>
                </div>
            </div>
            <div class="chatbot-header-actions">
                <button class="chatbot-icon-btn chatbot-close" aria-label="Fermer">×</button>
            </div>
        </div>
        <div class="chatbot-messages">
        <div class="chatbot-info-block">
            <div class="chatbot-info-tag">Information</div>
            <div class="chatbot-info-text">
                Cet assistant est propulsé par une intelligence artificielle.  
                Ses réponses peuvent ne pas être parfaitement adaptées à toutes les situations.
                Merci de ne pas partager d'informations personnelles sensibles.
            </div>
            <div class="chatbot-info-legal">Mentions légales</div>
        </div>
        </div>
        <div class="chatbot-input-area">
            <input type="text" placeholder="Envoyer un message..." maxlength="300" />
            <button>Envoyer</button>
        </div>
        <div class="chatbot-char-counter">0 / 300</div>

    `;
    document.body.appendChild(popup);
    
    // Éléments
    const messagesDiv = popup.querySelector('.chatbot-messages');
    const input = popup.querySelector('.chatbot-input-area input');
    const sendBtn = popup.querySelector('.chatbot-input-area button');
    const closeBtn = popup.querySelector('.chatbot-close');
    let hasGreeted = false;
    const charCounter = popup.querySelector('.chatbot-char-counter');

    input.addEventListener("input", () => {
    const length = input.value.length;
    charCounter.textContent = `${length} / 300`;
    });

    
    // Ouverture / fermeture
    btn.addEventListener('click', () => {
        popup.classList.toggle('show');
        if (popup.classList.contains('show')) {
            if (!hasGreeted) {
                addMessage(
                    "Bonjour, je suis votre assistant virtuel. Comment puis-je vous aider ?",
                    "bot"
                );
                hasGreeted = true;
            }
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
    });
    
    // Envoi message
    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        sendBtn.disabled = true;
        
        addMessage(message, "user");
        input.value = "";
        if (charCounter) {
            charCounter.textContent = "0 / 300";
        }
        
        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    client_id: clientId
                })
            });
            const data = await response.json();
            if (data.error) {
                addMessage("Erreur: " + data.error, "bot");
            } else {
                addMessage(data.response, "bot");
            }
        } catch (e) {
            addMessage("Erreur de connexion au serveur.", "bot");
        }
        
        sendBtn.disabled = false;
        input.focus();
    }

    
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chatbot-msg ${sender}`;
        msgDiv.innerHTML = `<div class="chatbot-bubble">${escapeHtml(text)}</div>`;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, "<br>");
    }
    
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
})();
