// Configuração da API
const API_URL = 'https://aniversario-back.onrender.com';

// Lista de nomes bloqueados (não podem confirmar presença)
const NOMES_BLOQUEADOS = ['izabelle', 'iza', 'zabele', 'zaza'];

/**
 * Verifica se um nome está na lista de bloqueados
 * @param {string} nome - Nome a ser verificado
 * @returns {boolean} - true se o nome está bloqueado
 */
function isNomeBloqueado(nome) {
    const nomeNormalizado = nome.trim().toLowerCase();
    return NOMES_BLOQUEADOS.some(bloqueado => nomeNormalizado.includes(bloqueado));
}

// Elementos do DOM
const form = document.getElementById('confirmacaoForm');
const nomeInput = document.getElementById('nome');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const mensagemDiv = document.getElementById('mensagem');
const formContainer = document.getElementById('formSection');
const sucessoContainer = document.getElementById('successSection');
const sucessoNome = document.getElementById('successName');
const popupOverlay = document.getElementById('popupOverlay');
const popupClose = document.getElementById('popupClose');
const btnFechar = document.getElementById('btnFechar');
// presentesLista removido - conteúdo agora é estático no HTML
const hintButton = document.getElementById('hintButton');
const btnAddGuest = document.getElementById('btnAddGuest');
const guestsContainer = document.getElementById('guestsContainer');
const errorNome = document.getElementById('errorNome');

// Estado da aplicação
const appState = {
    guests: [], // Array de instâncias GuestField
    maxGuests: 3
};

/**
 * Classe para gerenciar campos de acompanhantes individuais
 */
class GuestField {
    constructor(index) {
        this.index = index;
        this.element = null;
        this.input = null;
        this.errorMessage = null;
        this.removeButton = null;
    }
    
    /**
     * Cria e retorna o elemento HTML do campo
     */
    render() {
        // Criar wrapper do campo
        this.element = document.createElement('div');
        this.element.className = 'guest-field';
        this.element.setAttribute('data-index', this.index);
        
        // Criar input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        
        // Criar input
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.id = `acompanhante${this.index}`;
        this.input.name = `acompanhante${this.index}`;
        this.input.placeholder = `Nome do acompanhante ${this.index}`;
        this.input.setAttribute('aria-label', `Nome do acompanhante ${this.index}`);
        this.input.autocomplete = 'name';
        
        // Criar mensagem de erro
        this.errorMessage = document.createElement('div');
        this.errorMessage.className = 'error-message';
        this.errorMessage.id = `errorAcompanhante${this.index}`;
        
        // Adicionar event listener para limpar erro ao digitar
        this.input.addEventListener('input', () => {
            this.clearError();
        });
        
        // Montar input wrapper
        inputWrapper.appendChild(this.input);
        inputWrapper.appendChild(this.errorMessage);
        
        // Criar botão remover
        this.removeButton = document.createElement('button');
        this.removeButton.type = 'button';
        this.removeButton.className = 'btn-remove-guest';
        this.removeButton.innerHTML = '×';
        this.removeButton.setAttribute('aria-label', `Remover acompanhante ${this.index}`);
        this.removeButton.setAttribute('title', `Remover acompanhante ${this.index}`);
        this.removeButton.addEventListener('click', () => {
            removeGuestField(this.index);
        });
        
        // Keyboard support para botão remover
        this.removeButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                removeGuestField(this.index);
            }
        });
        
        // Montar elemento completo
        this.element.appendChild(inputWrapper);
        this.element.appendChild(this.removeButton);
        
        return this.element;
    }
    
    /**
     * Retorna o valor do input
     */
    getValue() {
        return this.input ? this.input.value.trim() : '';
    }
    
    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        if (this.input && this.errorMessage) {
            this.input.parentElement.classList.add('error');
            this.errorMessage.textContent = message;
            this.errorMessage.classList.add('show');
        }
    }
    
    /**
     * Limpa mensagem de erro
     */
    clearError() {
        if (this.input && this.errorMessage) {
            this.input.parentElement.classList.remove('error');
            this.errorMessage.classList.remove('show');
            this.errorMessage.textContent = '';
        }
    }
    
    /**
     * Remove o elemento do DOM
     */
    remove() {
        if (this.element) {
            this.element.remove();
        }
    }
    
    /**
     * Foca no input
     */
    focus() {
        if (this.input) {
            this.input.focus();
        }
    }
}

// Event Listeners
if (form) {
    form.addEventListener('submit', handleSubmit);
}
if (popupClose) {
    popupClose.addEventListener('click', fecharPopup);
}
if (btnFechar) {
    btnFechar.addEventListener('click', fecharPopup);
}
if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            fecharPopup();
        }
    });
}

// Hint button event listener
if (hintButton) {
    hintButton.addEventListener('click', abrirPopupDica);
}

// Add guest button event listener
if (btnAddGuest) {
    btnAddGuest.addEventListener('click', addGuestField);
}

// Keyboard accessibility: Close popup with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay.style.display === 'flex') {
        fecharPopup();
    }
});

// Keyboard accessibility: Add guest with Ctrl+Plus or Ctrl+Enter on add button
if (btnAddGuest) {
    btnAddGuest.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            addGuestField();
        }
    });
}

// Keyboard accessibility: Navigate between fields with Tab
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Plus para adicionar acompanhante
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        if (appState.guests.length < appState.maxGuests) {
            addGuestField();
        }
    }
});

// Limpar mensagem quando o usuário começar a digitar
if (nomeInput) {
    nomeInput.addEventListener('input', () => {
        esconderMensagem();
        clearFieldError(nomeInput, errorNome);
    });
}

/**
 * Adiciona um novo campo de acompanhante
 */
function addGuestField() {
    // Verificar se já atingiu o máximo
    if (appState.guests.length >= appState.maxGuests) {
        announceToScreenReader('Máximo de 3 acompanhantes atingido');
        return;
    }
    
    // Criar novo campo
    const index = appState.guests.length + 1;
    const guestField = new GuestField(index);
    
    // Adicionar ao array de estado
    appState.guests.push(guestField);
    
    // Renderizar e adicionar ao DOM
    const element = guestField.render();
    guestsContainer.appendChild(element);
    
    // Anunciar para leitores de tela
    announceToScreenReader(`Campo de acompanhante ${index} adicionado`);
    
    // Focar no novo campo
    setTimeout(() => {
        guestField.focus();
    }, 100);
    
    // Atualizar estado do botão adicionar
    updateAddButtonState();
    
    console.log(`✅ Acompanhante ${index} adicionado`);
}

/**
 * Remove um campo de acompanhante
 */
function removeGuestField(index) {
    // Encontrar o campo no array
    const fieldIndex = appState.guests.findIndex(g => g.index === index);
    
    if (fieldIndex === -1) {
        return;
    }
    
    // Remover do DOM
    appState.guests[fieldIndex].remove();
    
    // Remover do array
    appState.guests.splice(fieldIndex, 1);
    
    // Anunciar para leitores de tela
    announceToScreenReader(`Acompanhante ${index} removido`);
    
    // Focar no botão adicionar ou no campo anterior
    setTimeout(() => {
        if (appState.guests.length > 0) {
            // Focar no último acompanhante restante
            appState.guests[appState.guests.length - 1].focus();
        } else {
            // Focar no campo principal
            nomeInput.focus();
        }
    }, 100);
    
    // Atualizar estado do botão adicionar
    updateAddButtonState();
    
    console.log(`❌ Acompanhante ${index} removido`);
}

/**
 * Anuncia mensagem para leitores de tela
 * @param {string} message - Mensagem a ser anunciada
 */
function announceToScreenReader(message) {
    // Criar ou obter região ARIA live
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('class', 'sr-only');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }
    
    // Limpar e definir nova mensagem
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

/**
 * Atualiza o estado do botão adicionar (habilita/desabilita)
 */
function updateAddButtonState() {
    if (appState.guests.length >= appState.maxGuests) {
        btnAddGuest.disabled = true;
        btnAddGuest.style.opacity = '0.5';
    } else {
        btnAddGuest.disabled = false;
        btnAddGuest.style.opacity = '1';
    }
}

/**
 * Limpa erro de um campo específico
 */
function clearFieldError(input, errorElement) {
    if (input && errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
}

/**
 * Mostra erro em um campo específico
 */
function showFieldError(input, errorElement, message) {
    if (input && errorElement) {
        input.parentElement.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Limpa todos os erros dos campos
 */
function clearAllErrors() {
    // Limpar erro do campo principal
    clearFieldError(nomeInput, errorNome);
    
    // Limpar erros dos acompanhantes
    appState.guests.forEach(guest => {
        guest.clearError();
    });
}

/**
 * Valida todos os campos (vazio e duplicatas locais)
 * @returns {Object} { valid: boolean, errors: Object }
 */
function validateAllFields() {
    const errors = {
        nome: null,
        acompanhantes: []
    };
    let valid = true;
    
    // Validar campo principal
    const nomePrincipal = nomeInput.value.trim();
    if (!nomePrincipal) {
        errors.nome = 'Preencha todos os campos';
        valid = false;
    } else if (isNomeBloqueado(nomePrincipal)) {
        errors.nome = 'Essa pessoa não foi convidada';
        valid = false;
    }
    
    // Coletar todos os nomes (principal + acompanhantes)
    const todosNomes = [nomePrincipal];
    const nomesAcompanhantes = [];
    
    // Validar campos de acompanhantes
    appState.guests.forEach((guest, index) => {
        const nomeAcompanhante = guest.getValue();
        
        if (!nomeAcompanhante) {
            errors.acompanhantes[index] = 'Preencha todos os campos';
            valid = false;
        } else if (isNomeBloqueado(nomeAcompanhante)) {
            errors.acompanhantes[index] = 'Essa pessoa não foi convidada';
            valid = false;
        } else {
            nomesAcompanhantes.push(nomeAcompanhante);
            todosNomes.push(nomeAcompanhante);
        }
    });
    
    // Verificar duplicatas locais (entre os campos do formulário)
    const duplicatasLocais = checkLocalDuplicates(todosNomes);
    
    if (duplicatasLocais.length > 0) {
        duplicatasLocais.forEach(duplicateInfo => {
            if (duplicateInfo.index === 0) {
                // Duplicata no campo principal
                errors.nome = 'Nome duplicado no formulário';
                valid = false;
            } else {
                // Duplicata em acompanhante
                const guestIndex = duplicateInfo.index - 1;
                errors.acompanhantes[guestIndex] = 'Nome duplicado no formulário';
                valid = false;
            }
        });
    }
    
    return { valid, errors };
}

/**
 * Verifica duplicatas locais entre os campos do formulário
 * @param {Array<string>} nomes - Array de nomes para verificar
 * @returns {Array<Object>} Array de objetos com índices duplicados
 */
function checkLocalDuplicates(nomes) {
    const duplicates = [];
    const seen = new Map();
    
    nomes.forEach((nome, index) => {
        const nomeLower = nome.toLowerCase().trim();
        
        if (nomeLower && seen.has(nomeLower)) {
            // Encontrou duplicata
            duplicates.push({ 
                index: index, 
                nome: nome,
                firstIndex: seen.get(nomeLower)
            });
            
            // Também marcar o primeiro como duplicata
            if (!duplicates.find(d => d.index === seen.get(nomeLower))) {
                duplicates.push({
                    index: seen.get(nomeLower),
                    nome: nome,
                    firstIndex: seen.get(nomeLower)
                });
            }
        } else if (nomeLower) {
            seen.set(nomeLower, index);
        }
    });
    
    return duplicates;
}

/**
 * Exibe erros de validação nos campos
 * @param {Object} errors - Objeto com erros por campo
 */
function displayValidationErrors(errors) {
    // Mostrar erro no campo principal
    if (errors.nome) {
        showFieldError(nomeInput, errorNome, errors.nome);
    }
    
    // Mostrar erros nos acompanhantes
    errors.acompanhantes.forEach((error, index) => {
        if (error && appState.guests[index]) {
            appState.guests[index].showError(error);
        }
    });
}

/**
 * Handler do submit do formulário
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    
    // Limpar erros anteriores
    clearAllErrors();
    
    // Validar todos os campos (vazios e duplicatas locais)
    const validation = validateAllFields();
    
    if (!validation.valid) {
        displayValidationErrors(validation.errors);
        
        // Focar no primeiro campo com erro
        if (validation.errors.nome) {
            nomeInput.focus();
        } else {
            // Focar no primeiro acompanhante com erro
            const firstErrorIndex = validation.errors.acompanhantes.findIndex(e => e !== null && e !== undefined);
            if (firstErrorIndex !== -1 && appState.guests[firstErrorIndex]) {
                appState.guests[firstErrorIndex].focus();
            }
        }
        
        return;
    }
    
    // Coletar nomes dos acompanhantes (já validados)
    const acompanhantes = appState.guests.map(guest => guest.getValue());
    
    // Adicionar classe clicked para manter estado hover
    btnConfirmar.classList.add('clicked');
    
    // Desabilitar botão e mostrar loading
    setLoading(true);
    esconderMensagem();
    
    // Preparar payload
    const payload = { nome };
    if (acompanhantes.length > 0) {
        payload.acompanhantes = acompanhantes;
    }
    
    console.log('📤 Enviando:', payload);
    
    try {
        // Fazer requisição para API
        const response = await fetch(`${API_URL}/api/confirmar-presenca`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📦 Data recebida:', data);
        
        if (response.ok && data.success) {
            // Sucesso!
            console.log('✅ Confirmação bem-sucedida!');
            const todosNomes = [nome, ...acompanhantes];
            mostrarSucesso(todosNomes, data.sugestoes_presentes);
        } else {
            // Erro (duplicata, campos vazios, nome bloqueado ou outro)
            console.log('❌ Erro na confirmação:', data.message);
            
            // Verificar se é nome bloqueado
            if (data.nome_bloqueado) {
                // Mostrar erro no campo principal se for bloqueado
                if (response.status === 403) {
                    showFieldError(nomeInput, errorNome, data.message);
                }
                
                // Mostrar erros nos acompanhantes bloqueados
                if (data.acompanhantes_bloqueados) {
                    data.acompanhantes_bloqueados.forEach((isBloqueado, index) => {
                        if (isBloqueado && appState.guests[index]) {
                            appState.guests[index].showError(data.message);
                        }
                    });
                }
            } else if (data.duplicatas) {
                // Mostrar erro no campo principal se for duplicata
                if (data.duplicatas.nome) {
                    showFieldError(nomeInput, errorNome, 'Presença já confirmada');
                }
                
                // Mostrar erros nos acompanhantes
                if (data.duplicatas.acompanhantes) {
                    data.duplicatas.acompanhantes.forEach((isDuplicate, index) => {
                        if (isDuplicate && appState.guests[index]) {
                            appState.guests[index].showError('Presença já confirmada');
                        }
                    });
                }
            } else if (data.campos_vazios) {
                // Mostrar erro de campos vazios
                if (data.campos_vazios.nome) {
                    showFieldError(nomeInput, errorNome, 'Preencha todos os campos');
                }
                
                if (data.campos_vazios.acompanhantes) {
                    data.campos_vazios.acompanhantes.forEach((isEmpty, index) => {
                        if (isEmpty && appState.guests[index]) {
                            appState.guests[index].showError('Preencha todos os campos');
                        }
                    });
                }
            } else {
                // Erro genérico
                mostrarMensagem(data.message || 'Erro ao confirmar presença', 'erro');
            }
            
            setLoading(false);
            // Remover classe clicked em caso de erro
            btnConfirmar.classList.remove('clicked');
        }
        
    } catch (error) {
        console.error('❌ Erro ao confirmar presença:', error);
        mostrarMensagem('Erro ao conectar com o servidor. Tente novamente.', 'erro');
        setLoading(false);
        // Remover classe clicked em caso de erro
        btnConfirmar.classList.remove('clicked');
    }
}

/**
 * Ativa/desativa estado de loading do botão
 */
function setLoading(loading) {
    if (loading) {
        btnConfirmar.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        btnConfirmar.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

/**
 * Mostra mensagem de feedback
 */
function mostrarMensagem(texto, tipo) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.style.display = 'block';
    
    // Scroll suave até a mensagem
    mensagemDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Esconde mensagem de feedback
 */
function esconderMensagem() {
    mensagemDiv.style.display = 'none';
}

/**
 * Mostra tela de sucesso e pop-up de presentes
 */
function mostrarSucesso(nomes, sugestoes) {
    // nomes pode ser string ou array
    const nomesArray = Array.isArray(nomes) ? nomes : [nomes];
    const nomePrincipal = nomesArray[0];
    const acompanhantes = nomesArray.slice(1);
    
    console.log('🎉 Mostrando sucesso para:', nomePrincipal);
    if (acompanhantes.length > 0) {
        console.log('   + Acompanhantes:', acompanhantes.join(', '));
    }
    
    // Explosão de confetes do centro!
    explosaoConfetes();
    
    // Esconder formulário
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    
    // Mostrar container de sucesso
    if (sucessoNome) {
        if (acompanhantes.length > 0) {
            // Mostrar nome principal + acompanhantes
            const acompanhantesHtml = acompanhantes.map(nome => 
                `<span style="display: block; font-size: 16px; color: #666; margin-top: 5px;">• ${nome}</span>`
            ).join('');
            
            sucessoNome.innerHTML = `
                <strong style="display: block; margin-bottom: 10px;">${nomePrincipal}</strong>
                ${acompanhantesHtml}
            `;
        } else {
            sucessoNome.textContent = nomePrincipal;
        }
    }
    if (sucessoContainer) {
        sucessoContainer.style.display = 'block';
    }
    
    // Conteúdo do popup agora é estático no HTML
    // Não precisa mais preencher dinamicamente
    
    // Mostrar pop-up após um pequeno delay
    setTimeout(() => {
        abrirPopup();
    }, 1000);
}

/**
 * Abre o pop-up de sugestões
 */
function abrirPopup() {
    popupOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
    
    // Update ARIA attributes for accessibility
    if (hintButton) {
        hintButton.setAttribute('aria-expanded', 'true');
    }
    
    // Focus on close button for keyboard accessibility
    setTimeout(() => {
        if (popupClose) {
            popupClose.focus();
        }
    }, 100);
}

/**
 * Abre o pop-up de dicas (quando clica no hint button)
 */
function abrirPopupDica() {
    // Conteúdo do popup agora é estático no HTML
    // Apenas abre o popup
    abrirPopup();
}

/**
 * Fecha o pop-up de sugestões
 */
function fecharPopup() {
    popupOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restaurar scroll do body
    
    // Update ARIA attributes for accessibility
    if (hintButton) {
        hintButton.setAttribute('aria-expanded', 'false');
    }
    
    // Remove focus to prevent hover issues
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

// Prevenir envio múltiplo do formulário
let submitting = false;
form.addEventListener('submit', (e) => {
    if (submitting) {
        e.preventDefault();
        return false;
    }
});

// Criar confetes animados (caindo do topo)
function criarConfetes() {
    const container = document.getElementById('confettiContainer');
    const cores = ['#B76E79', '#C0C0C0', '#E8E8E8', '#B76E79'];
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti';
        confete.style.left = Math.random() * 100 + '%';
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        confete.style.animationDelay = Math.random() * 3 + 's';
        confete.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confete);
    }
}

// Explosão de confetes do centro da tela
function explosaoConfetes() {
    const container = document.getElementById('confettiContainer');
    const cores = ['#B76E79', '#C0C0C0', '#E8E8E8', '#B76E79'];
    const quantidade = 80;
    
    for (let i = 0; i < quantidade; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti-explosion';
        
        // Posição inicial no centro
        confete.style.left = '50%';
        confete.style.top = '50%';
        
        // Cor aleatória
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        
        // Ângulo aleatório para explosão (360 graus)
        const angulo = (Math.random() * 360) * (Math.PI / 180);
        const velocidade = 150 + Math.random() * 200;
        const distanciaX = Math.cos(angulo) * velocidade;
        const distanciaY = Math.sin(angulo) * velocidade;
        
        // Definir variáveis CSS customizadas para animação
        confete.style.setProperty('--x', `${distanciaX}px`);
        confete.style.setProperty('--y', `${distanciaY}px`);
        confete.style.animationDelay = Math.random() * 0.1 + 's';
        
        container.appendChild(confete);
        
        // Remover confete após animação
        setTimeout(() => {
            confete.remove();
        }, 2000);
    }
}

// Criar confetes ao carregar a página
window.addEventListener('load', criarConfetes);

// Log de inicialização
console.log('✅ Sistema de confirmação de presença carregado');
console.log(`📡 API URL: ${API_URL}`);
