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
            <p style="color: #e8b4b8; text-align: center;">Erro ao carregar as missões do sistema. Verifique o arquivo missions.json na pasta data.</p>
        `;
    }
}

function renderMissions(missions) {
    const grid = document.getElementById('missionGrid');
    grid.innerHTML = '';

    const savedProgress = JSON.parse(localStorage.getItem('investigation_progress')) || {};

    missions.forEach(mission => {
        const status = savedProgress[mission.id] || mission.status;
        const isLocked = status === 'locked';

        const card = document.createElement('div');
        card.className = `mission-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="mission-header">
                <h2 class="mission-title">${mission.title}</h2>
                <span class="badge">Dificuldade: ${mission.difficulty}</span>
            </div>
            <p class="mission-summary">${mission.summary}</p>
            <div style="font-size: 0.85rem; color: #888;">Objetivos da Investigação:</div>
            <ul class="objectives-list">
                ${mission.objectives.map(obj => `<li>${obj}</li>`).join('')}
            </ul>
            <button class="btn-launch" ${isLocked ? 'disabled' : ''} onclick="launchMission('${mission.id}', '${mission.title}')">
                ${isLocked ? 'Missão Bloqueada' : 'Iniciar Missão'}
            </button>
        `;
        
        grid.appendChild(card);
    });
}

function launchMission(missionId, missionTitle) {
    alert(`Iniciando protocolo de investigação para: ${missionTitle}\nID: ${missionId}`);
}
