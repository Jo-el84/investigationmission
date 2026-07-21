document.addEventListener("DOMContentLoaded", () => {
    loadMissions();
});

async function loadMissions() {
    try {
        const response = await fetch('data/missions.json');
        if (!response.ok) throw new Error("Erro ao carregar o banco de dados de missões.");
        
        const data = await response.json();
        renderMissions(data.missions);
    } catch (error) {
        console.error(error);
        document.getElementById('missionGrid').innerHTML = `
            <p style="color: #e8b4b8; text-align: center;">Erro ao carregar as missões do sistema.</p>
        `;
    }
}

function renderMissions(missions) {
    const grid = document.getElementById('missionGrid');
    grid.innerHTML = '';

    const savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};

    missions.forEach(mission => {
        // Se já existe progresso salvo, usa ele. Se não, cria a estrutura padrão.
        let missionState = savedProgress[mission.id];
        
        if (!missionState) {
            missionState = {
                ...mission,
                started: false,
                objectives: mission.objectives.map((text, index) => ({
                    id: `obj-${index}`,
                    text: text,
                    completed: false
                }))
            };
        }

        const card = document.createElement('div');
        card.className = `mission-card ${missionState.started ? 'active-mission' : ''}`;
        
        let contentHtml = '';

        if (!missionState.started) {
            contentHtml = `
                <p class="mission-summary">${missionState.summary}</p>
                <button class="btn-launch" onclick="startMission('${mission.id}')">
                    Iniciar Missão
                </button>
            `;
        } else {
            let objectivesHtml = missionState.objectives.map(obj => `
                <li class="objective-item ${obj.completed ? 'completed' : ''}" onclick="toggleObjective('${mission.id}', '${obj.id}')">
                    <span class="checkbox">${obj.completed ? '☑' : '☐'}</span> 
                    <span>${obj.text}</span>
                </li>
            `).join('');

            const allCompleted = missionState.objectives.every(obj => obj.completed);

            contentHtml = `
                <p class="mission-summary">${missionState.summary}</p>
                <div style="font-size: 0.85rem; color: #e8b4b8; margin: 10px 0 5px 0;">Etapas da Investigação (Toque para concluir):</div>
                <ul class="objectives-list">
                    ${objectivesHtml}
                </ul>
                <button class="btn-launch" ${!allCompleted ? 'disabled' : ''} onclick="completeMission('${missionState.title}', '${missionState.reward}')">
                    ${allCompleted ? 'Concluir Investigação' : 'Investigação em Andamento...'}
                </button>
            `;
        }

        card.innerHTML = `
            <div class="mission-header">
                <h2 class="mission-title">${missionState.title}</h2>
                <span class="badge">Dificuldade: ${missionState.difficulty}</span>
            </div>
            ${contentHtml}
        `;
        
        grid.appendChild(card);
    });
}

function startMission(missionId) {
    fetch('data/missions.json')
        .then(res => res.json())
        .then(data => {
            let savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};
            let mission = data.missions.find(m => m.id === missionId);

            savedProgress[missionId] = {
                ...mission,
                started: true,
                objectives: mission.objectives.map((text, index) => ({
                    id: `obj-${index}`,
                    text: text,
                    completed: false
                }))
            };

            localStorage.setItem('investigation_progress', JSON.stringify(savedProgress));
            renderMissions(data.missions);
        });
}

function toggleObjective(missionId, objId) {
    let savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};
    let missionState = savedProgress[missionId];

    if (missionState) {
        missionState.objectives = missionState.objectives.map(obj => {
            if (obj.id === objId) {
                return { ...obj, completed: !obj.completed };
            }
            return obj;
        });

        savedProgress[missionId] = missionState;
        localStorage.setItem('investigation_progress', JSON.stringify(savedProgress));
        
        // Renderiza novamente usando o progresso salvo atualizado
        renderMissionsFromSaved(savedProgress);
    }
}

// Renderização auxiliar para manter o estado local sem re-buscar o JSON toda vez
function renderMissionsFromSaved(savedProgress) {
    fetch('data/missions.json')
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('missionGrid');
            grid.innerHTML = '';

            data.missions.forEach(mission => {
                let missionState = savedProgress[mission.id] || {
                    ...mission,
                    started: false,
                    objectives: mission.objectives.map((text, index) => ({ id: `obj-${index}`, text: text, completed: false }))
                };

                const card = document.createElement('div');
                card.className = `mission-card ${missionState.started ? 'active-mission' : ''}`;
                
                let contentHtml = '';

                if (!missionState.started) {
                    contentHtml = `
                        <p class="mission-summary">${missionState.summary}</p>
                        <button class="btn-launch" onclick="startMission('${mission.id}')">
                            Iniciar Missão
                        </button>
                    `;
                } else {
                    let objectivesHtml = missionState.objectives.map(obj => `
                        <li class="objective-item ${obj.completed ? 'completed' : ''}" onclick="toggleObjective('${mission.id}', '${obj.id}')">
                            <span class="checkbox">${obj.completed ? '☑' : '☐'}</span> 
                            <span>${obj.text}</span>
                        </li>
                    `).join('');

                    const allCompleted = missionState.objectives.every(obj => obj.completed);

                    contentHtml = `
                        <p class="mission-summary">${missionState.summary}</p>
                        <div style="font-size: 0.85rem; color: #e8b4b8; margin: 10px 0 5px 0;">Etapas da Investigação (Toque para concluir):</div>
                        <ul class="objectives-list">
                            ${objectivesHtml}
                        </ul>
                        <button class="btn-launch" ${!allCompleted ? 'disabled' : ''} onclick="completeMission('${missionState.title}', '${missionState.reward}')">
                            ${allCompleted ? 'Concluir Investigação' : 'Investigação em Andamento...'}
                        </button>
                    `;
                }

                card.innerHTML = `
                    <div class="mission-header">
                        <h2 class="mission-title">${missionState.title}</h2>
                        <span class="badge">Dificuldade: ${missionState.difficulty}</span>
                    </div>
                    ${contentHtml}
                `;
                
                grid.appendChild(card);
            });
        });
}

function completeMission(title, reward) {
    alert(`Parabéns! Investigação concluída: "${title}"\nRecompensa obtida: ${reward}`);
}
