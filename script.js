document.addEventListener('DOMContentLoaded', () => {
    // Variável para armazenar o número, que será carregado do config.json
    let WHATSAPP_PHONE_NUMBER = "";

    // Elementos do DOM
    const messageInput = document.getElementById('message-input');
    const phoneInput = document.getElementById('phone-input');
    const finalLink = document.getElementById('final-link');
    const testLinkBtn = document.getElementById('test-link-btn');
    const copyBtn = document.getElementById('copy-btn');
    const previewText = document.getElementById('preview-text');
    const charCount = document.getElementById('char-count');
    const sentTime = document.getElementById('sent-bubble-time');
    const receivedTime = document.getElementById('received-bubble-time');

    // Inicializa os horários das bolhas do chat com o horário do sistema do usuário
    function updateChatTimes() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        if (sentTime) sentTime.textContent = formattedTime;
        
        // Coloca a bolha recebida 1 minuto antes
        const recTime = new Date(now.getTime() - 60000);
        const recHours = String(recTime.getHours()).padStart(2, '0');
        const recMinutes = String(recTime.getMinutes()).padStart(2, '0');
        if (receivedTime) receivedTime.textContent = `${recHours}:${recMinutes}`;
    }

    updateChatTimes();

    // Busca o arquivo de configuração
    fetch('config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Não foi possível carregar o arquivo config.json");
            }
            return response.json();
        })
        .then(config => {
            WHATSAPP_PHONE_NUMBER = config.WHATSAPP_PHONE_NUMBER;
            // Preenche o campo de input com o número carregado
            if (phoneInput) {
                phoneInput.value = WHATSAPP_PHONE_NUMBER;
            }
            updateLink(); // Atualiza o link inicial
            console.log("Configurações carregadas com sucesso.");
        })
        .catch(error => {
            console.error("Erro ao carregar configurações:", error);
            if (phoneInput) phoneInput.placeholder = "Erro ao carregar config.json";
        });

    // Funcionalidade: Copiar o link com feedback visual
    function copyLinkToClipboard() {
        if (finalLink.value && finalLink.value.startsWith('http')) {
            finalLink.select();
            finalLink.setSelectionRange(0, 99999); // Para compatibilidade com celulares
            
            navigator.clipboard.writeText(finalLink.value)
                .then(() => {
                    // Adiciona a classe de sucesso no botão
                    copyBtn.classList.add('copied');
                    
                    // Restaura o estado normal após 2 segundos
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Falha ao copiar link:', err);
                    alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
                });
        }
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', copyLinkToClipboard);
    }

    // Funcionalidade alternativa: clicar no próprio input do link para copiar
    finalLink.addEventListener('click', () => {
        copyLinkToClipboard();
    });

    // Atualiza o link toda vez que o usuário digita algo
    messageInput.addEventListener('input', () => {
        updateLink();
        updatePreview();
    });

    phoneInput.addEventListener('input', () => {
        updateLink();
    });

    function updatePreview() {
        const message = messageInput.value;
        
        // Atualiza contagem de caracteres
        if (charCount) {
            charCount.textContent = `${message.length} caracteres`;
        }

        // Atualiza a bolha de pré-visualização
        if (previewText) {
            if (message.trim() === "") {
                previewText.textContent = "Sua mensagem aparecerá aqui...";
                previewText.style.fontStyle = "italic";
                previewText.style.opacity = "0.7";
            } else {
                previewText.textContent = message;
                previewText.style.fontStyle = "normal";
                previewText.style.opacity = "1";
            }
        }
    }

    function updateLink() {
        const message = messageInput.value;
        // Pega o telefone do input (remove caracteres não numéricos) ou usa o padrão
        const currentPhone = phoneInput.value.replace(/\D/g, '') || WHATSAPP_PHONE_NUMBER;
        
        if (!currentPhone) {
            if (testLinkBtn) {
                testLinkBtn.classList.add('test-link-disabled');
                testLinkBtn.href = "#";
            }
            return; // Aguarda ter um número
        }
        
        if (message.trim() === "") {
            finalLink.value = "";
            if (testLinkBtn) {
                testLinkBtn.classList.add('test-link-disabled');
                testLinkBtn.href = "#";
            }
        } else {
            const url = `https://wa.me/${currentPhone}?text=${encodeURIComponent(message)}`;
            finalLink.value = url;
            if (testLinkBtn) {
                testLinkBtn.classList.remove('test-link-disabled');
                testLinkBtn.href = url;
            }
        }
    }
});

