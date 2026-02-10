// ========== IndexedDB Wrapper ==========
const DB_NAME = 'AppRutinaDB';
const DB_VERSION = 1;

const AppDB = {
    db: null,

    async open() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Workouts store
                if (!db.objectStoreNames.contains('workouts')) {
                    const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
                    workoutStore.createIndex('sessionId', 'sessionId', { unique: false });
                    workoutStore.createIndex('date', 'date', { unique: false });
                }

                // Measurements store
                if (!db.objectStoreNames.contains('measurements')) {
                    const measurementStore = db.createObjectStore('measurements', { keyPath: 'id', autoIncrement: true });
                    measurementStore.createIndex('date', 'date', { unique: false });
                }

                // Preferences store (key-value)
                if (!db.objectStoreNames.contains('preferences')) {
                    db.createObjectStore('preferences', { keyPath: 'key' });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });
    },

    // ---- Workouts ----
    async saveWorkout(workout) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('workouts', 'readwrite');
            const store = tx.objectStore('workouts');
            const req = store.put(workout);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getWorkout(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('workouts', 'readonly');
            const store = tx.objectStore('workouts');
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getAllWorkouts() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('workouts', 'readonly');
            const store = tx.objectStore('workouts');
            const req = store.getAll();
            req.onsuccess = () => {
                const results = req.result || [];
                results.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    },

    async getWorkoutsBySession(sessionId) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('workouts', 'readonly');
            const store = tx.objectStore('workouts');
            const index = store.index('sessionId');
            const req = index.getAll(sessionId);
            req.onsuccess = () => {
                const results = req.result || [];
                results.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    },

    async getLastWorkoutForSession(sessionId) {
        const workouts = await this.getWorkoutsBySession(sessionId);
        return workouts.length > 0 ? workouts[0] : null;
    },

    async deleteWorkout(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('workouts', 'readwrite');
            const store = tx.objectStore('workouts');
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    // ---- Measurements ----
    async saveMeasurement(measurement) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('measurements', 'readwrite');
            const store = tx.objectStore('measurements');
            const req = store.put(measurement);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async getAllMeasurements() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('measurements', 'readonly');
            const store = tx.objectStore('measurements');
            const req = store.getAll();
            req.onsuccess = () => {
                const results = req.result || [];
                results.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    },

    async deleteMeasurement(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('measurements', 'readwrite');
            const store = tx.objectStore('measurements');
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    // ---- Preferences ----
    async getPref(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('preferences', 'readonly');
            const store = tx.objectStore('preferences');
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result ? req.result.value : null);
            req.onerror = () => reject(req.error);
        });
    },

    async setPref(key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('preferences', 'readwrite');
            const store = tx.objectStore('preferences');
            const req = store.put({ key, value });
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    // ---- Routine ----
    async getCustomRoutine() {
        return await this.getPref('custom_routine');
    },

    async saveCustomRoutine(routine) {
        await this.setPref('custom_routine', routine);
    },

    // ---- Last weights per exercise ----
    async getLastWeights(exerciseId) {
        const weights = await this.getPref(`lastWeights_${exerciseId}`);
        return weights || null;
    },

    async saveLastWeights(exerciseId, weights) {
        await this.setPref(`lastWeights_${exerciseId}`, weights);
    },

    // ---- Export / Import ----
    async exportAll() {
        const workouts = await this.getAllWorkouts();
        const measurements = await this.getAllMeasurements();
        const db = await this.open();

        // Get all preferences
        const prefs = await new Promise((resolve, reject) => {
            const tx = db.transaction('preferences', 'readonly');
            const store = tx.objectStore('preferences');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });

        return {
            version: 1,
            exportDate: new Date().toISOString(),
            workouts,
            measurements,
            preferences: prefs
        };
    },

    async importAll(data) {
        if (!data || !data.version) throw new Error('Formato de datos invalido');

        const db = await this.open();

        // Clear all stores
        const stores = ['workouts', 'measurements', 'preferences'];
        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.clear();
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }

        // Import workouts
        if (data.workouts) {
            for (const w of data.workouts) {
                await this.saveWorkout(w);
            }
        }

        // Import measurements
        if (data.measurements) {
            for (const m of data.measurements) {
                await this.saveMeasurement(m);
            }
        }

        // Import preferences
        if (data.preferences) {
            for (const p of data.preferences) {
                await this.setPref(p.key, p.value);
            }
        }
    },

    async clearAll() {
        const db = await this.open();
        const stores = ['workouts', 'measurements', 'preferences'];
        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.clear();
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }
    }
};
