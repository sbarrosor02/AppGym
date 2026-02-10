// ========== Exercise Card Component ==========
const ExerciseCard = {
    render(exercise, index) {
        const repsStr = exercise.reps.map(r => formatReps(r)).join(', ');
        const setsLabel = exercise.hasApproachSet
            ? `${exercise.sets}+1 series`
            : `${exercise.sets} series`;

        return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <span class="exercise-name">${index !== undefined ? (index + 1) + '. ' : ''}${exercise.name}</span>
                    ${exercise.isPrimary
                        ? '<span class="exercise-badge primary">Principal</span>'
                        : '<span class="exercise-badge secondary">Secundario</span>'
                    }
                </div>
                <div class="exercise-detail">
                    ${setsLabel} &middot; ${repsStr} reps &middot; ${formatRest(exercise.rest)} descanso
                </div>
                ${exercise.comment ? `<div class="exercise-comment">${exercise.comment}</div>` : ''}
                ${exercise.gifUrl ? `
                    <div class="exercise-gif-container" onclick="this.classList.toggle('expanded')">
                        <img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-gif" loading="lazy">
                        <div class="gif-overlay">Ver demostración</div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderWarmup(warmup) {
        if (!warmup) return '';

        const gifHtml = warmup.gifUrl ? `
            <div class="exercise-gif-container" onclick="this.classList.toggle('expanded')">
                <img src="${warmup.gifUrl}" alt="${warmup.name}" class="exercise-gif" loading="lazy">
                <div class="gif-overlay">Ver demostración</div>
            </div>
        ` : '';

        if (warmup.sets) {
            const repsStr = warmup.reps ? warmup.reps.map(r => formatReps(r)).join(', ') : '';
            return `
                <div class="exercise-item">
                    <div class="exercise-header">
                        <span class="exercise-name">
                            <span class="warmup-label">Calentamiento</span>
                            ${warmup.name}
                        </span>
                    </div>
                    <div class="exercise-detail">
                        ${warmup.sets} series${repsStr ? ' &middot; ' + repsStr + ' reps' : ''} &middot; ${formatRest(warmup.rest)} descanso
                    </div>
                    ${warmup.comment ? `<div class="exercise-comment">${warmup.comment}</div>` : ''}
                    ${gifHtml}
                </div>
            `;
        }

        return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <span class="exercise-name">
                        <span class="warmup-label">Calentamiento</span>
                        ${warmup.name}
                    </span>
                </div>
                ${warmup.comment ? `<div class="exercise-comment">${warmup.comment}</div>` : ''}
                ${gifHtml}
            </div>
        `;
    },

    renderCooldown(cooldown) {
        if (!cooldown) return '';

        const gifHtml = cooldown.gifUrl ? `
            <div class="exercise-gif-container" onclick="this.classList.toggle('expanded')">
                <img src="${cooldown.gifUrl}" alt="${cooldown.name}" class="exercise-gif" loading="lazy">
                <div class="gif-overlay">Ver demostración</div>
            </div>
        ` : '';

        const repsStr = cooldown.reps ? cooldown.reps.map(r => formatReps(r)).join(', ') : '';
        return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <span class="exercise-name">
                        <span class="cooldown-label">Vuelta a la calma</span>
                        ${cooldown.name}
                    </span>
                </div>
                <div class="exercise-detail">
                    ${cooldown.sets} series${repsStr ? ' &middot; ' + repsStr + ' reps' : ''} &middot; ${formatRest(cooldown.rest)} descanso
                </div>
                ${cooldown.comment ? `<div class="exercise-comment">${cooldown.comment}</div>` : ''}
                ${gifHtml}
            </div>
        `;
    }
};
