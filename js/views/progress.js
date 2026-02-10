// ========== Progress View ==========
const ProgressView = {
    selectedExercise: null,

    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Progreso';
        document.getElementById('header-left').innerHTML = '';
        document.getElementById('header-right').innerHTML = '';

        const exercises = getAllWeightedExercises();
        const workouts = await AppDB.getAllWorkouts();

        // Auto-select first exercise if none selected
        if (!this.selectedExercise && exercises.length > 0) {
            this.selectedExercise = exercises[0].id;
        }

        container.innerHTML = `
            <select class="progress-exercise-select" id="progress-select">
                ${exercises.map(ex => `
                    <option value="${ex.id}" ${ex.id === this.selectedExercise ? 'selected' : ''}>
                        ${ex.name} (${ex.sessionName})
                    </option>
                `).join('')}
            </select>

            <div id="progress-charts"></div>

            <div class="chart-container" style="margin-top: 16px;">
                <div class="chart-title">Peso corporal</div>
                <canvas class="chart-canvas" id="body-weight-chart"></canvas>
            </div>
        `;

        container.querySelector('#progress-select').addEventListener('change', (e) => {
            this.selectedExercise = e.target.value;
            this.renderCharts(workouts, container);
        });

        this.renderCharts(workouts, container);

        // Body weight chart from measurements
        this.renderBodyWeightChart();

        return this;
    },

    renderCharts(workouts, container) {
        const chartsContainer = container.querySelector('#progress-charts');

        // Get data for selected exercise
        const chartData = [];
        // Sort workouts oldest first for chart
        const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));

        for (const w of sorted) {
            const ex = w.exercises.find(e => e.exerciseId === this.selectedExercise);
            if (!ex || ex.sets.length === 0) continue;

            // Get max weight used in this workout for this exercise
            const workingSets = ex.sets.filter(s => !s.isApproach);
            if (workingSets.length === 0) continue;

            const maxWeight = Math.max(...workingSets.map(s => s.weight));
            const date = new Date(w.date);
            const label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            chartData.push({ value: maxWeight, label });
        }

        if (chartData.length === 0) {
            chartsContainer.innerHTML = `
                <div class="empty-state" style="padding: 32px 16px;">
                    <div class="empty-state-text">Sin datos para este ejercicio</div>
                    <div class="empty-state-subtext">Completa entrenos para ver tu progresion</div>
                </div>
            `;
            return;
        }

        chartsContainer.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">Peso maximo por sesion (kg)</div>
                <canvas class="chart-canvas" id="exercise-chart"></canvas>
            </div>
        `;

        // Draw after DOM update
        requestAnimationFrame(() => {
            const canvas = document.getElementById('exercise-chart');
            if (canvas) {
                Chart.draw(canvas, chartData, { color: '#a29bfe' });
            }
        });
    },

    async renderBodyWeightChart() {
        const measurements = await AppDB.getAllMeasurements();
        const sorted = [...measurements]
            .filter(m => m.peso)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const canvas = document.getElementById('body-weight-chart');
        if (!canvas) return;

        if (sorted.length === 0) {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            ctx.fillStyle = '#555570';
            ctx.font = '13px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos de peso corporal', rect.width / 2, rect.height / 2);
            return;
        }

        const chartData = sorted.map(m => ({
            value: m.peso,
            label: new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        }));

        requestAnimationFrame(() => {
            Chart.draw(canvas, chartData, { color: '#00cec9' });
        });
    }
};
