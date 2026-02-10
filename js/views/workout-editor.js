// ========== Workout Editor View ==========
const WorkoutEditorView = {
    async render(params, container) {
        Nav.show();
        Nav.update();

        document.getElementById('header-title').textContent = 'Editar Rutina';
        document.getElementById('header-left').innerHTML = `
            <button class="header-btn" onclick="Router.navigate('#/settings')">
                <span class="header-back">&lsaquo;</span> Ajustes
            </button>
        `;
        document.getElementById('header-right').innerHTML = `
            <button class="header-btn" id="save-routine-btn">
                Guardar
            </button>
        `;

        const sessions = await getSessions();
        
        container.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">Importar desde PDF</div>
                <button class="btn btn-outline settings-btn" id="pdf-import-btn">
                    Seleccionar PDF del entrenador
                </button>
                <input type="file" id="pdf-file" accept=".pdf" style="display: none;">
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                    El PDF debe tener el formato estándar del entrenador.
                </p>
            </div>

            <div class="settings-section">
                <div class="settings-section-title">Edición Manual (JSON)</div>
                <textarea id="routine-json" class="form-input" style="height: 300px; font-family: monospace; font-size: 0.8rem; line-height: 1.2;">${JSON.stringify(sessions, null, 2)}</textarea>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                    Cuidado: un formato inválido romperá la app. Copia el JSON actual antes de modificar.
                </p>
            </div>

            <div class="settings-section">
                <button class="btn btn-danger settings-btn" id="reset-routine-btn">
                    Restablecer a rutina por defecto
                </button>
            </div>
        `;

        // Save
        container.querySelector('#save-routine-btn').addEventListener('click', async () => {
            try {
                const jsonText = container.querySelector('#routine-json').value;
                const newRoutine = JSON.parse(jsonText);
                await AppDB.saveCustomRoutine(newRoutine);
                alert('Rutina guardada correctamente');
            } catch (e) {
                alert('Error en el formato JSON: ' + e.message);
            }
        });

        // Reset
        container.querySelector('#reset-routine-btn').addEventListener('click', async () => {
            if (confirm('¿Seguro que quieres restablecer la rutina original? Se perderán tus cambios manuales.')) {
                await AppDB.saveCustomRoutine(null);
                this.render(params, container);
            }
        });

        // PDF Import
        const pdfInput = container.querySelector('#pdf-file');
        container.querySelector('#pdf-import-btn').addEventListener('click', () => {
            pdfInput.click();
        });

        pdfInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const routine = await this.parsePDF(file);
                if (routine) {
                    container.querySelector('#routine-json').value = JSON.stringify(routine, null, 2);
                    alert('PDF procesado. Revisa el JSON y dale a Guardar.');
                }
            } catch (err) {
                alert('Error al procesar PDF: ' + err.message);
            }
            pdfInput.value = '';
        });

        return this;
    },

    async parsePDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        console.log('PDF Text:', fullText);
        
        // Simple parsing logic (Placeholder - needs adjustment to real PDF format)
        // This is a VERY rough heuristic parser
        const sessions = [];
        const sessionMatches = fullText.split(/Sesión\s+(\d+)/i);
        
        // sessionMatches[0] is text before "Sesión 1"
        for (let i = 1; i < sessionMatches.length; i += 2) {
            const id = parseInt(sessionMatches[i]);
            const content = sessionMatches[i+1];
            
            const session = {
                id: id,
                name: `Sesion ${id}`,
                subtitle: 'Importada',
                color: `var(--session${(id-1)%4 + 1})`,
                exercises: []
            };

            // Heuristic for exercises: look for lines that seem like exercises
            // Usually: [Name] [Sets]x[Reps] [Rest] [Comment]
            // This is VERY hard without a specific format.
            // I will try to find exercise names by looking for common patterns.
            
            // For now, I'll provide a message that the parser is experimental
            // and maybe just extract the text for them to see.
        }

        // Given the complexity, I'll implement a regex-based parser 
        // that matches the structure of the existing routines if possible.
        
        return this.heuristicParse(fullText);
    },

    heuristicParse(text) {
        // This is a simplified parser based on the example data.js structure
        const sessions = [];
        
        // Split by "SESION" or "SESIÓN"
        const sessionBlocks = text.split(/SESI[ÓO]N\s+(\d+)/i);
        
        for (let i = 1; i < sessionBlocks.length; i += 2) {
            const num = sessionBlocks[i];
            const content = sessionBlocks[i+1];
            
            const session = {
                id: parseInt(num),
                name: `Sesión ${num}`,
                subtitle: '',
                color: `var(--session${(parseInt(num)-1)%4 + 1})`,
                warmup: null,
                exercises: [],
                cooldown: null
            };

            // Extract subtitle (text before the first exercise)
            const firstExMatch = content.match(/\d+\.\s+/);
            if (firstExMatch) {
                session.subtitle = content.substring(0, firstExMatch.index).trim().split('\n')[0];
            }

            // Extract exercises using "1. ", "2. ", etc.
            const exerciseBlocks = content.split(/(\d+)\.\s+/);
            for (let j = 1; j < exerciseBlocks.length; j += 2) {
                const exNameAndDetails = exerciseBlocks[j+1];
                const lines = exNameAndDetails.split('\n').map(l => l.trim()).filter(l => l);
                
                if (lines.length > 0) {
                    const name = lines[0];
                    const details = lines.find(l => l.includes('series') || l.includes('x')) || '';
                    
                    // Try to extract sets and reps: "4 series de 10-12" or "4x10-12"
                    let sets = 3;
                    let reps = [10, 10, 10];
                    
                    const setsMatch = details.match(/(\d+)\s*series/i) || details.match(/(\d+)x/i);
                    if (setsMatch) sets = parseInt(setsMatch[1]);
                    
                    const repsMatch = details.match(/(\d+)-(\d+)/) || details.match(/de\s+(\d+)/i);
                    if (repsMatch) {
                        const r = parseInt(repsMatch[1]);
                        reps = Array(sets).fill(r);
                    }

                    session.exercises.push({
                        id: `s${num}e${Math.floor(j/2)+1}`,
                        name: name,
                        sets: sets,
                        hasApproachSet: details.includes('aproximación'),
                        reps: reps,
                        rest: 60,
                        comment: lines.slice(1).join(' '),
                        isPrimary: j < 5,
                        gifUrl: ''
                    });
                }
            }
            
            sessions.push(session);
        }

        if (sessions.length === 0) {
            throw new Error('No se detectaron sesiones. Asegúrate de que el PDF contiene texto y usa el formato esperado.');
        }

        return sessions;
    }
};
