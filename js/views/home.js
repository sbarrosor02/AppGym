// ========== Home View ==========
const HomeView = {
    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Mi Rutina';
        document.getElementById('header-left').innerHTML = '';
        document.getElementById('header-right').innerHTML = `
            <button class="header-btn" onclick="Router.navigate('#/settings')">
                &#9881;
            </button>
        `;

        // Get last workout dates for each session
        const lastWorkouts = {};
        for (const session of SESSIONS) {
            lastWorkouts[session.id] = await AppDB.getLastWorkoutForSession(session.id);
        }

        container.innerHTML = `
            <div class="section-title">4 Sesiones de entrenamiento</div>
            ${SESSIONS.map(session => {
                const last = lastWorkouts[session.id];
                const lastDate = last
                    ? new Date(last.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : 'Sin entrenos';
                const exerciseCount = session.exercises.length;

                return `
                    <div class="card card-clickable session-card" data-session="${session.id}"
                         onclick="Router.navigate('#/session/${session.id}')">
                        <div class="session-card-title">${session.name}: ${session.subtitle}</div>
                        <div class="session-card-subtitle">${exerciseCount} ejercicios + calentamiento</div>
                        <div class="session-card-meta">
                            <span class="session-card-exercises">
                                ${session.exercises.filter(e => e.isPrimary).length} principales
                            </span>
                            <span>Ultimo: ${lastDate}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        return this;
    }
};
