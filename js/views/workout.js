// ========== Workout Active View ==========
const WorkoutView = {
    session: null,
    workout: null,
    currentExerciseIndex: -1,  // -1 = warmup, exercises.length = cooldown
    currentSetIndex: 0,
    wakeLock: null,
    startTime: null,
    destroyed: false,

    // Build flat list of all exercises (warmup + exercises + cooldown)
    getAllExercises() {
        const list = [];
        const s = this.session;

        // Warmup (if it has sets)
        if (s.warmup && s.warmup.sets) {
            list.push({
                type: 'warmup',
                id: s.warmup.id || 'warmup_' + s.id,
                name: s.warmup.name,
                comment: s.warmup.comment,
                sets: s.warmup.sets,
                hasApproachSet: false,
                reps: s.warmup.reps || [],
                rest: s.warmup.rest || 30,
                isWarmup: true
            });
        }

        // Main exercises
        for (const ex of s.exercises) {
            list.push({
                type: 'exercise',
                id: ex.id,
                name: ex.name,
                comment: ex.comment,
                sets: ex.sets,
                hasApproachSet: ex.hasApproachSet,
                reps: ex.reps,
                rest: ex.rest,
                isPrimary: ex.isPrimary
            });
        }

        // Cooldown
        if (s.cooldown) {
            list.push({
                type: 'cooldown',
                id: s.cooldown.id || 'cooldown_' + s.id,
                name: s.cooldown.name,
                comment: s.cooldown.comment,
                sets: s.cooldown.sets,
                hasApproachSet: false,
                reps: s.cooldown.reps || [],
                rest: s.cooldown.rest || 30,
                isCooldown: true
            });
        }

        return list;
    },

    // Get total sets for an exercise (including approach)
    getTotalSets(exercise) {
        return exercise.sets + (exercise.hasApproachSet ? 1 : 0);
    },

    // Is current set an approach set?
    isApproachSet(exercise, setIdx) {
        return exercise.hasApproachSet && setIdx === 0;
    },

    // Get target reps for a set
    getTargetReps(exercise, setIdx) {
        if (this.isApproachSet(exercise, setIdx)) {
            // Approach set - use first rep target
            return exercise.reps[0] || null;
        }
        const workingIdx = exercise.hasApproachSet ? setIdx - 1 : setIdx;
        return exercise.reps[workingIdx] !== undefined ? exercise.reps[workingIdx] : null;
    },

    async render(params, container) {
        const sessionId = parseInt(params.id);
        this.session = SESSIONS.find(s => s.id === sessionId);
        if (!this.session) {
            Router.navigate('#/');
            return this;
        }

        this.destroyed = false;
        this.startTime = Date.now();
        this.currentExerciseIndex = 0;
        this.currentSetIndex = 0;

        Nav.hide();

        document.getElementById('header-title').textContent = this.session.name;
        document.getElementById('header-left').innerHTML = `
            <button class="header-btn" id="workout-back-btn">
                <span class="header-back">&lsaquo;</span> Salir
            </button>
        `;
        document.getElementById('header-right').innerHTML = '';

        // Init workout data
        const allExercises = this.getAllExercises();
        this.workout = {
            sessionId: this.session.id,
            date: new Date().toISOString(),
            status: 'in_progress',
            duration: 0,
            exercises: allExercises.map(ex => ({
                exerciseId: ex.id,
                name: ex.name,
                type: ex.type,
                sets: []
            }))
        };

        // Load last weights
        this.lastWeights = {};
        for (const ex of allExercises) {
            const saved = await AppDB.getLastWeights(ex.id);
            if (saved) this.lastWeights[ex.id] = saved;
        }

        // Init audio on first interaction
        Timer.initAudio();

        // Request wake lock
        this.requestWakeLock();

        this.renderCurrentSet(container);

        // Back button with confirmation
        document.getElementById('workout-back-btn').addEventListener('click', () => {
            this.showConfirmExit(container);
        });

        return this;
    },

    renderCurrentSet(container) {
        if (this.destroyed) return;

        const allExercises = this.getAllExercises();

        // Check if workout is complete
        if (this.currentExerciseIndex >= allExercises.length) {
            this.finishWorkout(container);
            return;
        }

        const exercise = allExercises[this.currentExerciseIndex];
        const totalSets = this.getTotalSets(exercise);
        const isApproach = this.isApproachSet(exercise, this.currentSetIndex);
        const targetReps = this.getTargetReps(exercise, this.currentSetIndex);

        // Get last weight for this exercise
        const lastWeight = this.lastWeights[exercise.id];
        let prefillWeight = 0;
        if (lastWeight) {
            const setKey = `set_${this.currentSetIndex}`;
            prefillWeight = lastWeight[setKey] || lastWeight.lastUsed || 0;
        }

        // Build set dots
        let dotsHtml = '';
        for (let i = 0; i < totalSets; i++) {
            const isAppr = this.isApproachSet(exercise, i);
            let cls = 'set-dot';
            if (i < this.currentSetIndex) cls += ' completed';
            if (i === this.currentSetIndex) cls += ' current';
            if (isAppr) cls += ' approach';
            dotsHtml += `<div class="${cls}"></div>`;
        }

        // Type label
        let typeLabel = '';
        if (exercise.isWarmup) typeLabel = '<span class="warmup-label">Calentamiento</span> ';
        else if (exercise.isCooldown) typeLabel = '<span class="cooldown-label">Vuelta a la calma</span> ';

        const setLabel = isApproach
            ? 'Serie de Aproximacion'
            : `Serie ${exercise.hasApproachSet ? this.currentSetIndex : this.currentSetIndex + 1} de ${exercise.sets}`;

        const repsDisplay = targetReps === null ? 'MAX' : targetReps;
        const isLastSetOfLastExercise = this.currentExerciseIndex === allExercises.length - 1
            && this.currentSetIndex === totalSets - 1;

        container.innerHTML = `
            <div style="padding-top: 8px;">
                ${typeLabel}
                <div class="workout-exercise-title">${exercise.name}</div>
                ${exercise.comment ? `<div class="workout-exercise-comment">${exercise.comment}</div>` : ''}

                <div class="workout-progress-bar">${dotsHtml}</div>
                <div class="workout-exercise-counter">
                    Ejercicio ${this.currentExerciseIndex + 1} de ${allExercises.length}
                </div>

                <div class="workout-set-info">
                    <div class="workout-set-label">${setLabel}</div>
                    <div class="workout-set-target">Objetivo: ${repsDisplay} reps</div>
                </div>

                <div class="input-group">
                    <label class="input-label">Peso (kg)</label>
                    <div class="stepper">
                        <button class="stepper-btn" id="weight-minus">-</button>
                        <div class="stepper-value" id="weight-value">
                            ${prefillWeight}<span class="stepper-unit"> kg</span>
                        </div>
                        <button class="stepper-btn" id="weight-plus">+</button>
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">Repeticiones</label>
                    <div class="stepper">
                        <button class="stepper-btn" id="reps-minus">-</button>
                        <div class="stepper-value" id="reps-value">${repsDisplay}</div>
                        <button class="stepper-btn" id="reps-plus">+</button>
                    </div>
                </div>

                <button class="btn-complete-set ${isLastSetOfLastExercise ? 'finish' : ''}" id="complete-set-btn">
                    ${isLastSetOfLastExercise ? 'Finalizar Entrenamiento' : 'Completar Serie'}
                </button>
            </div>
        `;

        // Wire up steppers
        let currentWeight = prefillWeight;
        let currentReps = targetReps === null ? 0 : targetReps;

        const weightDisplay = container.querySelector('#weight-value');
        const repsDisplay2 = container.querySelector('#reps-value');

        const updateWeightDisplay = () => {
            weightDisplay.innerHTML = `${currentWeight}<span class="stepper-unit"> kg</span>`;
        };
        const updateRepsDisplay = () => {
            repsDisplay2.textContent = currentReps;
        };

        container.querySelector('#weight-minus').addEventListener('click', () => {
            currentWeight = Math.max(0, currentWeight - 2.5);
            updateWeightDisplay();
        });
        container.querySelector('#weight-plus').addEventListener('click', () => {
            currentWeight += 2.5;
            updateWeightDisplay();
        });
        container.querySelector('#reps-minus').addEventListener('click', () => {
            currentReps = Math.max(0, currentReps - 1);
            updateRepsDisplay();
        });
        container.querySelector('#reps-plus').addEventListener('click', () => {
            currentReps++;
            updateRepsDisplay();
        });

        // Complete set
        container.querySelector('#complete-set-btn').addEventListener('click', async () => {
            // Record set data
            const exerciseData = this.workout.exercises[this.currentExerciseIndex];
            exerciseData.sets.push({
                setNumber: this.currentSetIndex,
                targetReps: targetReps,
                actualReps: currentReps,
                weight: currentWeight,
                isApproach: isApproach
            });

            // Save last weight
            if (!this.lastWeights[exercise.id]) {
                this.lastWeights[exercise.id] = {};
            }
            this.lastWeights[exercise.id][`set_${this.currentSetIndex}`] = currentWeight;
            this.lastWeights[exercise.id].lastUsed = currentWeight;
            await AppDB.saveLastWeights(exercise.id, this.lastWeights[exercise.id]);

            // Advance to next set or exercise
            const totalSetsForExercise = this.getTotalSets(exercise);
            if (this.currentSetIndex < totalSetsForExercise - 1) {
                // Next set of same exercise
                this.currentSetIndex++;
                const nextIsApproach = this.isApproachSet(exercise, this.currentSetIndex);
                const nextReps = this.getTargetReps(exercise, this.currentSetIndex);
                const nextInfo = `Siguiente: ${nextIsApproach ? 'Aproximacion' : 'Serie ' + (exercise.hasApproachSet ? this.currentSetIndex : this.currentSetIndex + 1)} - ${nextReps === null ? 'MAX' : nextReps} reps`;

                Timer.show(exercise.rest, nextInfo, () => {
                    this.renderCurrentSet(container);
                });
            } else if (this.currentExerciseIndex < allExercises.length - 1) {
                // Next exercise
                this.currentExerciseIndex++;
                this.currentSetIndex = 0;
                const nextEx = allExercises[this.currentExerciseIndex];
                const nextInfo = `Siguiente ejercicio: ${nextEx.name}`;

                Timer.show(exercise.rest, nextInfo, () => {
                    this.renderCurrentSet(container);
                });
            } else {
                // Workout complete
                this.finishWorkout(container);
            }
        });
    },

    async finishWorkout(container) {
        if (this.destroyed) return;

        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.workout.duration = duration;
        this.workout.status = 'completed';

        // Save workout
        await AppDB.saveWorkout(this.workout);

        // Release wake lock
        this.releaseWakeLock();

        // Show summary
        const minutes = Math.floor(duration / 60);
        const totalSets = this.workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = this.workout.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + (set.weight * set.actualReps), 0), 0);

        container.innerHTML = `
            <div class="summary-container">
                <div class="summary-icon">&#127942;</div>
                <div class="summary-title">Entrenamiento completado</div>

                <div class="summary-stats">
                    <div class="detail-stat">
                        <div class="detail-stat-value">${minutes} min</div>
                        <div class="detail-stat-label">Duracion</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${totalSets}</div>
                        <div class="detail-stat-label">Series</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${this.workout.exercises.length}</div>
                        <div class="detail-stat-label">Ejercicios</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${Math.round(totalVolume)} kg</div>
                        <div class="detail-stat-label">Volumen total</div>
                    </div>
                </div>

                <div class="summary-exercises">
                    ${this.workout.exercises.map(ex => {
                        if (ex.sets.length === 0) return '';
                        const maxWeight = Math.max(...ex.sets.map(s => s.weight));
                        return `
                            <div class="summary-exercise-item">
                                <span>${ex.name}</span>
                                <span>${ex.sets.length} series &middot; ${maxWeight}kg max</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <button class="btn btn-primary btn-block" onclick="Router.navigate('#/')">
                    Volver al inicio
                </button>
            </div>
        `;

        Nav.show();
    },

    showConfirmExit(container) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-title">Salir del entrenamiento?</div>
                <div class="confirm-text">El progreso se guardara como incompleto.</div>
                <div class="confirm-actions">
                    <button class="btn btn-outline" id="confirm-cancel">Seguir</button>
                    <button class="btn btn-danger" id="confirm-exit">Salir</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#confirm-exit').addEventListener('click', async () => {
            overlay.remove();
            // Save partial workout
            const duration = Math.floor((Date.now() - this.startTime) / 1000);
            this.workout.duration = duration;
            this.workout.status = 'partial';
            await AppDB.saveWorkout(this.workout);
            this.releaseWakeLock();
            Nav.show();
            Router.navigate('#/');
        });
    },

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (e) {
            // Wake Lock not available
        }
    },

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    },

    destroy() {
        this.destroyed = true;
        this.releaseWakeLock();
        Nav.show();
    }
};
