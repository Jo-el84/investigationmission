document.addEventListener("DOMContentLoaded", () => {
    loadMissions();
});

async function loadMissions() {
    try {
        const response = await fetch('data/missions.json');
        if (!response.ok) throw new Error("Erro ao carregar o banco de dados.");
        
        const data = await response.json();
        renderMissionHub(data.missions);
    } catch (error) {
        console.error(error);
        document.getElementById('missionGrid').innerHTML = `
            <p style="color: #e8b4b8; text-align: center;">Erro ao carregar as missões do sistema.</p>
        `;
    }
}

function renderMissionHub(missions) {
    const grid = document.getElementById('missionGrid');
    grid.innerHTML = '';

    const savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};

    missions.forEach(mission => {
        // Se a missão não foi iniciada ou não tem etapa salva, começa no passo "inicio"
        let currentStepId = savedProgress[mission.id] || "inicio";
        let stepData = mission.steps[currentStepId];

        const card = document.createElement('div');
        card.className = `mission-card ${currentStepId !== 'inicio' ? 'active-mission' : ''}`;

        let contentHtml = '';

        if (currentStepId === 'inicio') {
            // Tela inicial da missão
            contentHtml = `
                <p class="mission-summary">${mission.steps.inicio.summary}</p>
                <button class="btn-launch" onclick="advanceStep('${mission.id}', 'inicio')">
                    Iniciar Investigação
                </button>
            `;
        } else if (stepData.isFinal) {
            // Fase final / Mistério resolvido
            contentHtml = `
                <p class="mission-summary" style="color: #f3d6d8; font-weight: bold;">${stepData.summary}</p>
                <button class="btn-launch" onclick="resetMission('${mission.id}')" style="background-color: #4CAF50; color: #fff;">
                    Reiniciar Investigação
                </button>
            `;
        } else {
            // Passos intermediários (exibe o novo resumo e as novas opções)
            let optionsHtml = stepData.options.map(opt => `
                <button class="btn-option" onclick="advanceStep('${mission.id}', '${opt.nextStep}')">
                    🔍 ${opt.text}
                </button>
            `).join('');

            contentHtml = `
                <p class="mission-summary">${stepData.summary}</p>
                <div style="font-size: 0.85rem; color: #e8b4b8; margin: 15px 0 10px 0;">Escolha sua próxima ação:</div>
                <div class="options-container">
                    ${optionsHtml}
                </div>
                <button class="btn-reset-step" onclick="resetMission('${mission.id}')">
                    Reiniciar Caso
                </button>
            `;
        }

        card.innerHTML = `
            <div class="mission-header">
                <h2 class="mission-title">${mission.title}</h2>
                <span class="badge">Dificuldade: ${mission.difficulty}</span>
            </div>
            ${contentHtml}
        `;
        
        grid.appendChild(card);
    });
}

function advanceStep(missionId, nextStepId) {
    let savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};
    savedProgress[missionId] = nextStepId;
    localStorage.setItem('investigation_progress', JSON.stringify(savedProgress));
    
    // Recarrega os dados para atualizar a tela
    loadMissions();
}

function resetMission(missionId) {
    let savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};
    delete savedProgress[missionId];
    localStorage.setItem('investigation_progress', JSON.stringify(savedProgress));
    
    loadMissions();
}
