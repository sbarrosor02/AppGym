// ========== History Detail View ==========
const HistoryDetailView = {
    async render(params, container) {
        const workoutId = parseInt(params.id);
        const workout = await AppDB.getWorkout(workoutId);

        if (!workout) {
            Router.navigate('#/history');
            return this;
        }

        Nav.show();
        Nav.update();

        const sessions = await getSessions();
        const session = sessions.find(s => s.id === workout.sessionId);
        const sessionName = session ? `${session.name}: ${session.subtitle}` : 'Entrenamiento';

        document.getElementById('header-title').textContent = sessionName;
        document.getElementById('header-left').innerHTML = `
            <button class="header-btn" onclick="Router.navigate('#/history')">
                <span class="header-back">&lsaquo;</span> Historial
            </button>
        `;
        document.getElementById('header-right').innerHTML = `
            <button class="header-btn text-danger" id="delete-workout-btn">
                Borrar
            </button>
        `;

        const date = new Date(workout.date);
        const dateStr = date.toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        const duration = workout.duration ? Math.floor(workout.duration / 60) : 0;
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = workout.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + (set.weight * set.actualReps), 0), 0);

        container.innerHTML = `
            <p class="text-secondary mb-16" style="font-size: 0.85rem;">${dateStr}</p>

            <div class="detail-summary">
                <div class="detail-stat">
                    <div class="detail-stat-value">${duration} min</div>
                    <div class="detail-stat-label">Duracion</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-value">${totalSets}</div>
                    <div class="detail-stat-label">Series</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-value">${workout.exercises.filter(e => e.sets.length > 0).length}</div>
                    <div class="detail-stat-label">Ejercicios</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-value">${Math.round(totalVolume)} kg</div>
                    <div class="detail-stat-label">Volumen</div>
                </div>
            </div>

            <div class="section-title">Detalle por ejercicio</div>

            ${workout.exercises.map(ex => {
                if (ex.sets.length === 0) return '';
                return `
                    <div class="detail-exercise">
                        <div class="detail-exercise-name">${ex.name}</div>
                        ${ex.sets.map((set, idx) => {
                            const hasApproach = ex.sets.some(s => s.isApproach);
                            const label = set.isApproach
                                ? 'Aproximacion'
                                : `Serie ${hasApproach ? idx : idx + 1}`;
                            return `
                                <div class="detail-set-row">
                                    <span class="detail-set-label ${set.isApproach ? 'approach' : ''}">${label}</span>
                                    <span>${set.weight} kg x ${set.actualReps} reps</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).join('')}
        `;

        // Delete button
        document.getElementById('delete-workout-btn').addEventListener('click', () => {
            this.confirmDelete(workoutId);
        });

        return this;
    },

    confirmDelete(workoutId) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-title">Borrar entrenamiento?</div>
                <div class="confirm-text">Esta accion no se puede deshacer.</div>
                <div class="confirm-actions">
                    <button class="btn btn-outline" id="confirm-cancel">Cancelar</button>
                    <button class="btn btn-danger" id="confirm-delete">Borrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#confirm-delete').addEventListener('click', async () => {
            await AppDB.deleteWorkout(workoutId);
            overlay.remove();
            Router.navigate('#/history');
        });
    }
};
