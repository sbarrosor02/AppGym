// ========== Session Detail View ==========
const SessionView = {
    async render(params, container) {
        const sessionId = parseInt(params.id);
        const sessions = await getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) {
            Router.navigate('#/');
            return;
        }

        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = session.name;
        document.getElementById('header-left').innerHTML = `
            <button class="header-btn" onclick="Router.navigate('#/')">
                <span class="header-back">&lsaquo;</span> Rutina
            </button>
        `;
        document.getElementById('header-right').innerHTML = '';

        container.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h2 style="font-size: 1.2rem; margin-bottom: 4px;">${session.name}: ${session.subtitle}</h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    ${session.exercises.length} ejercicios &middot; ~${getSessionTotalSets(session)} series totales
                </p>
            </div>

            <div class="card" style="padding: 0; overflow: hidden;">
                ${ExerciseCard.renderWarmup(session.warmup)}
                ${session.exercises.map((ex, i) => ExerciseCard.render(ex, i)).join('')}
                ${ExerciseCard.renderCooldown(session.cooldown)}
            </div>

            <button class="btn btn-primary btn-start" onclick="Router.navigate('#/workout/${session.id}')">
                Comenzar Entrenamiento
            </button>
        `;

        return this;
    }
};
