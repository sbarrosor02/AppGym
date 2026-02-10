// ========== Measurements View ==========
const MeasurementsView = {
    currentTab: 'form',

    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Medidas';
        document.getElementById('header-left').innerHTML = '';
        document.getElementById('header-right').innerHTML = '';

        const measurements = await AppDB.getAllMeasurements();
        const last = measurements.length > 0 ? measurements[0] : null;

        container.innerHTML = `
            <div class="tab-bar">
                <button class="tab-btn ${this.currentTab === 'form' ? 'active' : ''}" data-tab="form">Nueva medida</button>
                <button class="tab-btn ${this.currentTab === 'history' ? 'active' : ''}" data-tab="history">Historial (${measurements.length})</button>
            </div>
            <div id="measurements-content"></div>
        `;

        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentTab = btn.dataset.tab;
                this.render(params, container);
            });
        });

        const content = container.querySelector('#measurements-content');
        if (this.currentTab === 'form') {
            this.renderForm(content, last);
        } else {
            this.renderHistory(content, measurements);
        }

        return this;
    },

    renderForm(container, last) {
        const fields = [
            { key: 'altura', label: 'Altura (cm)', placeholder: 'ej. 178' },
            { key: 'peso', label: 'Peso (kg)', placeholder: 'ej. 75.5' },
            { key: 'grasoPct', label: '% Graso', placeholder: 'Opcional' }
        ];

        const contornoFields = [
            { key: 'gemelo', label: 'Gemelo' },
            { key: 'pierna', label: 'Pierna (cuadriceps)' },
            { key: 'cadera', label: 'Cadera (gluteo)' },
            { key: 'cintura', label: 'Cintura (ombligo)' },
            { key: 'pecho', label: 'Pecho y espalda' },
            { key: 'hombro', label: 'Hombro' },
            { key: 'brazo', label: 'Brazo (biceps)' }
        ];

        container.innerHTML = `
            <form id="measurement-form" class="measurement-form">
                ${fields.map(f => `
                    <div class="form-group">
                        <label>${f.label}</label>
                        <input class="form-input" type="number" step="0.1" name="${f.key}"
                               placeholder="${f.placeholder}"
                               value="${last && last[f.key] ? last[f.key] : ''}">
                    </div>
                `).join('')}

                <div class="form-section-title">Contorno en centimetros</div>

                <div class="form-row">
                    ${contornoFields.slice(0, 2).map(f => `
                        <div class="form-group">
                            <label>${f.label}</label>
                            <input class="form-input" type="number" step="0.1" name="${f.key}"
                                   placeholder="cm" value="${last && last[f.key] ? last[f.key] : ''}">
                        </div>
                    `).join('')}
                </div>

                <div class="form-row">
                    ${contornoFields.slice(2, 4).map(f => `
                        <div class="form-group">
                            <label>${f.label}</label>
                            <input class="form-input" type="number" step="0.1" name="${f.key}"
                                   placeholder="cm" value="${last && last[f.key] ? last[f.key] : ''}">
                        </div>
                    `).join('')}
                </div>

                <div class="form-row">
                    ${contornoFields.slice(4, 6).map(f => `
                        <div class="form-group">
                            <label>${f.label}</label>
                            <input class="form-input" type="number" step="0.1" name="${f.key}"
                                   placeholder="cm" value="${last && last[f.key] ? last[f.key] : ''}">
                        </div>
                    `).join('')}
                </div>

                ${contornoFields.slice(6).map(f => `
                    <div class="form-group">
                        <label>${f.label}</label>
                        <input class="form-input" type="number" step="0.1" name="${f.key}"
                               placeholder="cm" value="${last && last[f.key] ? last[f.key] : ''}">
                    </div>
                `).join('')}

                <button type="submit" class="btn btn-primary btn-block mt-16">
                    Guardar medidas
                </button>
            </form>
        `;

        container.querySelector('#measurement-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
                date: new Date().toISOString()
            };

            const allFields = [...fields, ...contornoFields];
            let hasData = false;
            for (const f of allFields) {
                const val = form.elements[f.key].value;
                if (val) {
                    data[f.key] = parseFloat(val);
                    hasData = true;
                }
            }

            if (!hasData) return;

            await AppDB.saveMeasurement(data);
            this.currentTab = 'history';
            // Re-render from the parent
            const parentContainer = document.getElementById('app-content');
            this.render({}, parentContainer);
        });
    },

    renderHistory(container, measurements) {
        if (measurements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">&#128207;</div>
                    <div class="empty-state-text">Sin medidas registradas</div>
                    <div class="empty-state-subtext">Registra tus medidas para hacer seguimiento</div>
                </div>
            `;
            return;
        }

        container.innerHTML = measurements.map(m => {
            const date = new Date(m.date);
            const dateStr = date.toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            const details = [];
            if (m.peso) details.push(`Peso: ${m.peso}kg`);
            if (m.grasoPct) details.push(`Graso: ${m.grasoPct}%`);
            if (m.brazo) details.push(`Brazo: ${m.brazo}cm`);
            if (m.pecho) details.push(`Pecho: ${m.pecho}cm`);
            if (m.cintura) details.push(`Cintura: ${m.cintura}cm`);
            if (m.pierna) details.push(`Pierna: ${m.pierna}cm`);

            return `
                <div class="card" style="position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div class="measurement-date">${dateStr}</div>
                            <div class="measurement-detail-grid" style="margin-top: 6px;">
                                ${details.map(d => `<span style="font-size: 0.82rem; color: var(--text-secondary);">${d}</span>`).join('')}
                            </div>
                        </div>
                        <button class="header-btn text-danger" style="font-size: 0.8rem; padding: 4px 8px;"
                                onclick="MeasurementsView.deleteMeasurement(${m.id})">
                            Borrar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    async deleteMeasurement(id) {
        await AppDB.deleteMeasurement(id);
        const container = document.getElementById('app-content');
        this.render({}, container);
    }
};
