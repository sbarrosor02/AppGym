// ========== Settings View ==========
const SettingsView = {
    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Ajustes';
        document.getElementById('header-left').innerHTML = `
            <button class="header-btn" onclick="Router.navigate('#/')">
                <span class="header-back">&lsaquo;</span> Rutina
            </button>
        `;
        document.getElementById('header-right').innerHTML = '';

        const workouts = await AppDB.getAllWorkouts();
        const measurements = await AppDB.getAllMeasurements();

        container.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">Datos</div>
                <div class="card">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">
                        ${workouts.length} entrenamiento${workouts.length !== 1 ? 's' : ''} &middot;
                        ${measurements.length} medida${measurements.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section-title">Exportar / Importar</div>
                <button class="btn btn-outline settings-btn" id="export-btn">
                    Exportar datos (JSON)
                </button>
                <button class="btn btn-outline settings-btn" id="import-btn">
                    Importar datos (JSON)
                </button>
                <input type="file" id="import-file" accept=".json" style="display: none;">
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                    iOS puede borrar datos de IndexedDB. Usa export como backup periodico.
                </p>
            </div>

            <div class="settings-section">
                <div class="settings-section-title">Almacenamiento</div>
                <button class="btn btn-outline settings-btn" id="persist-btn">
                    Solicitar almacenamiento persistente
                </button>
                <p id="persist-status" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;"></p>
            </div>

            <div class="settings-section">
                <div class="settings-section-title">Zona peligrosa</div>
                <button class="btn btn-danger settings-btn" id="clear-btn">
                    Borrar todos los datos
                </button>
            </div>

            <div style="text-align: center; margin-top: 32px; color: var(--text-muted); font-size: 0.75rem;">
                <p>AppRutina v1.0</p>
                <p>Rutina Personal Sergio Barroso</p>
            </div>
        `;

        // Export
        container.querySelector('#export-btn').addEventListener('click', async () => {
            try {
                const data = await AppDB.exportAll();
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `apprutina-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (e) {
                alert('Error al exportar: ' + e.message);
            }
        });

        // Import
        const fileInput = container.querySelector('#import-file');
        container.querySelector('#import-btn').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-box">
                    <div class="confirm-title">Importar datos?</div>
                    <div class="confirm-text">Esto reemplazara TODOS los datos actuales con los del archivo.</div>
                    <div class="confirm-actions">
                        <button class="btn btn-outline" id="confirm-cancel">Cancelar</button>
                        <button class="btn btn-primary" id="confirm-import">Importar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
                overlay.remove();
                fileInput.value = '';
            });

            overlay.querySelector('#confirm-import').addEventListener('click', async () => {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    await AppDB.importAll(data);
                    overlay.remove();
                    alert('Datos importados correctamente');
                    this.render(params, container);
                } catch (err) {
                    overlay.remove();
                    alert('Error al importar: ' + err.message);
                }
                fileInput.value = '';
            });
        });

        // Persistent storage
        container.querySelector('#persist-btn').addEventListener('click', async () => {
            const statusEl = container.querySelector('#persist-status');
            if (navigator.storage && navigator.storage.persist) {
                const granted = await navigator.storage.persist();
                statusEl.textContent = granted
                    ? 'Almacenamiento persistente concedido'
                    : 'El navegador no concedio almacenamiento persistente';
                statusEl.style.color = granted ? 'var(--success)' : 'var(--warning)';
            } else {
                statusEl.textContent = 'API de almacenamiento persistente no disponible';
            }
        });

        // Check current persistence
        if (navigator.storage && navigator.storage.persisted) {
            const persisted = await navigator.storage.persisted();
            const statusEl = container.querySelector('#persist-status');
            statusEl.textContent = persisted
                ? 'Almacenamiento persistente: activo'
                : 'Almacenamiento persistente: no activo';
        }

        // Clear data
        container.querySelector('#clear-btn').addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-box">
                    <div class="confirm-title">Borrar todos los datos?</div>
                    <div class="confirm-text">Se eliminaran todos los entrenos, medidas y preferencias. Esta accion no se puede deshacer.</div>
                    <div class="confirm-actions">
                        <button class="btn btn-outline" id="confirm-cancel">Cancelar</button>
                        <button class="btn btn-danger" id="confirm-clear">Borrar todo</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
                overlay.remove();
            });

            overlay.querySelector('#confirm-clear').addEventListener('click', async () => {
                await AppDB.clearAll();
                overlay.remove();
                alert('Todos los datos han sido borrados');
                this.render(params, container);
            });
        });

        return this;
    }
};
