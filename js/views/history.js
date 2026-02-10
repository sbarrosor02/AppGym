// ========== History View ==========
const HistoryView = {
    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Historial';
        document.getElementById('header-left').innerHTML = '';
        document.getElementById('header-right').innerHTML = '';

        const workouts = await AppDB.getAllWorkouts();

        if (workouts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">&#128203;</div>
                    <div class="empty-state-text">Sin entrenos registrados</div>
                    <div class="empty-state-subtext">Completa tu primer entrenamiento para verlo aqui</div>
                </div>
            `;
            return this;
        }

        container.innerHTML = `
            <div class="section-title">${workouts.length} entrenamiento${workouts.length !== 1 ? 's' : ''}</div>
            ${workouts.map(w => {
                const session = SESSIONS.find(s => s.id === w.sessionId);
                const color = session ? session.color : 'var(--text-muted)';
                const sessionName = session ? `${session.name}: ${session.subtitle}` : 'Sesion desconocida';
                const date = new Date(w.date);
                const dateStr = date.toLocaleDateString('es-ES', {
                    weekday: 'short', day: 'numeric', month: 'short'
                });
                const duration = w.duration ? `${Math.floor(w.duration / 60)} min` : '';
                const statusLabel = w.status === 'partial' ? ' (parcial)' : '';

                return `
                    <div class="card card-clickable" onclick="Router.navigate('#/history/${w.id}')">
                        <div class="history-item">
                            <div class="history-dot" style="background: ${color}"></div>
                            <div class="history-info">
                                <div class="history-title">${sessionName}${statusLabel}</div>
                                <div class="history-date">${dateStr}</div>
                            </div>
                            <div class="history-duration">${duration}</div>
                            <div class="history-arrow">&#8250;</div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        return this;
    }
};
