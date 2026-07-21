document.addEventListener("DOMContentLoaded", () => {
    loadGame();
});

function loadGame() {
    // Carrega a primeira missão do banco de dados local
    const mission = GAME_DATA.missions[0];
    let savedState = JSON.parse(localStorage.getItem('carmen_progress')) || {
        currentStep: "inicio",
        collectedEvidence: []
    };

    renderGame(mission, savedState);
}

function renderGame(mission, state) {
    const grid = document.getElementById('missionGrid');
    grid.innerHTML = '';

    const currentStepData = mission.steps[state.currentStep] || mission.steps["inicio"];

    let card = document.createElement('div');
    card.className = 'mission-card';

    // Bloco de Imagem (Estilo Carmen Sandiego)
    let imageHtml = currentStepData.image ? `
        <div class="mission-image-container" style="margin-bottom: 15px;">
            <img src="${currentStepData.image}" alt="Cena do Crime" style="width: 100%; height: 180px; object-fit: cover; border-radius: 4px; border: 1px solid #444;">
        </div>
    ` : '';

    // Se a etapa atual coletar uma prova, adiciona automaticamente ao inventário
    if (currentStepData.isEvidence && !state.collectedEvidence.includes(currentStepData.evidenceName)) {
        state.collectedEvidence.push(currentStepData.evidenceName);
        localStorage.setItem('carmen_progress', JSON.stringify(state));
    }

    let optionsHtml = '';
    
    if (currentStepData.isFinal) {
        optionsHtml = `
            <div style="background: #1a3a1a; padding: 15px; border-radius: 4px; border: 1px solid #4CAF50; margin-bottom: 15px;">
                <p style="color: #4CAF50; font-weight: bold; margin: 0;">${currentStepData.summary}</p>
            </div>
            <button class="btn-launch" onclick="resetGame()" style="background-color: #e8b4b8; color: #121212;">
                Jogar Novamente
            </button>
        `;
    } else if (currentStepData.isFailed) {
        optionsHtml = `
            <div style="background: #3a1a1a; padding: 15px; border-radius: 4px; border: 1px solid #f44336; margin-bottom: 15px;">
                <p style="color: #f44336; font-weight: bold; margin: 0;">${currentStepData.summary}</p>
            </div>
            <button class="btn-launch" onclick="resetGame()" style="background-color: #f44336; color: #fff;">
                Tentar Novamente (Afastado por Processo)
            </button>
        `;
    } else {
        // Renderiza as opções normais
        optionsHtml = currentStepData.options.map(opt => `
            <button class="btn-option" onclick="makeChoice('${opt.nextStep}')">
                🔍 ${opt.text}
            </button>
        `).join('');

        // Botão especial de "Julgamento / Acusação" para testar se tem provas suficientes
        optionsHtml += `
            <button class="btn-launch" onclick="checkAcquisition('${mission.evidenceRequired}')" style="margin-top: 15px; background-color: #d4af37; color: #121212;">
                ⚖️ Fazer Prisão / Acusação Final (${state.collectedEvidence.length}/${mission.evidenceRequired} Provas)
            </button>
        `;
    }

    // Painel lateral de Provas Coletadas (Caderneta do Detetive)
    let evidenceListHtml = state.collectedEvidence.length > 0 
        ? state.collectedEvidence.map(ev => `<li style="font-size: 0.8rem; color: #e8b4b8;">✔ ${ev}</li>`).join('')
        : `<span style="font-size: 0.8rem; color: #777;">Nenhuma pista forte coletada ainda.</span>`;

    card.innerHTML = `
        <div class="mission-header">
            <h2 class="mission-title">${mission.title}</h2>
            <span class="badge">Dificuldade: ${mission.difficulty}</span>
        </div>
        ${imageHtml}
        <p class="mission-summary">${currentStepData.summary}</p>
        
        <div style="background: #181818; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px dashed #444;">
            <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 5px;">📁 Caderneta de Provas do Investigador:</div>
            <ul style="margin: 0; padding-left: 15px;">${evidenceListHtml}</ul>
        </div>

        <div class="options-container">
            ${optionsHtml}
        </div>
    `;

    grid.appendChild(card);
}

function makeChoice(nextStep) {
    let state = JSON.parse(localStorage.getItem('carmen_progress')) || { collectedEvidence: [] };
    state.currentStep = nextStep;
    localStorage.setItem('carmen_progress', JSON.stringify(state));
    loadGame();
}

function checkAcquisition(requiredCount) {
    let state = JSON.parse(localStorage.getItem('carmen_progress')) || { collectedEvidence: [] };
    
    const mission = GAME_DATA.missions[0];

    if (state.collectedEvidence.length >= parseInt(requiredCount)) {
        // Sucesso! Tem provas suficientes
        mission.steps["resultado_sucesso"] = {
            summary: "PARABÉNS! Com base nas provas recolhidas, o juiz emitiu o mandado. O infrator foi condenado e você foi promovido!",
            isFinal: true
        };
        makeChoice("resultado_sucesso");
    } else {
        // Fracasso! Acusou cedo demais e foi processado por abuso de autoridade
        mission.steps["resultado_falha"] = {
            summary: "ERRO CRÍTICO! Você prendeu o suspeito sem provas suficientes. O advogado dele abriu um processo por abuso de autoridade, e você foi afastado das suas funções!",
            isFailed: true
        };
        makeChoice("resultado_falha");
    }
}

function resetGame() {
    localStorage.removeItem('carmen_progress');
    loadGame();
}
