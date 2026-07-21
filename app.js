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
        // Mescla o estado salvo com o JSON
        const missionState = savedProgress[mission.id] || mission;

        const card = document.createElement('div');
        card.className = 'mission-card';
        
        let objectivesHtml = missionState.objectives.map(obj => `
            <li class="objective-item ${obj.completed ? 'completed' : ''}" onclick="toggleObjective('${mission.id}', '${obj.id}')">
                <span class="checkbox">${obj.completed ? '☑' : '☐'}</span> 
                <span>${obj.text}</span>
            </li>
        `).join('');

        const allCompleted = missionState.objectives.every(obj => obj.completed);

        card.innerHTML = `
            <div class="mission-header">
                <h2 class="mission-title">${mission.title}</h2>
                <span class="badge">Dificuldade: ${mission.difficulty}</span>
            </div>
            <p class="mission-summary">${mission.summary}</p>
            <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">Toque nos objetivos para investigar:</div>
            <ul class="objectives-list">
                ${objectivesHtml}
            </ul>
            <div class="mission-footer">
                <button class="btn-launch" ${!allCompleted ? 'disabled' : ''} onclick="completeMission('${mission.title}', '${mission.reward}')">
                    ${allCompleted ? 'Concluir Investigação' : 'Investigação em Andamento'}
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function toggleObjective(missionId, objId) {
    let savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};
    
    // Pega o estado atual ou busca do missions.json padrão (simulação rápida)
    fetch('data/missions.json')
        .then(res => res.json())
        .then(data => {
            let mission = savedProgress[missionId];
            if (!mission) {
                mission = data.missions.find(m => m.id === missionId);
            }

            mission.objectives = mission.objectives.map(obj => {
                if (obj.id === objId) {
                    return { ...obj, completed: !obj.completed };
                }
                return obj;
            });

            savedProgress[missionId] = mission;
            localStorage.setItem('investigation_progress', JSON.stringify(savedProgress));
            renderMissions(data.missions);
        });
}

function completeMission(title, reward) {
    alert(`Parabéns! Você concluiu com sucesso a investigação: "${title}".\nRecompensa desbloqueada: ${reward}`);
}
