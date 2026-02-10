// ========== Hash-based Router ==========
const Router = {
    routes: {},
    currentView: null,

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigate(hash) {
        window.location.hash = hash;
    },

    getParams() {
        const hash = window.location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);
        return parts;
    },

    matchRoute(hash) {
        const path = hash.slice(1) || '/';

        // Try exact match first
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        // Try pattern matching
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const patternParts = pattern.split('/').filter(Boolean);
            const pathParts = path.split('/').filter(Boolean);

            if (patternParts.length !== pathParts.length) continue;

            const params = {};
            let match = true;

            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    params[patternParts[i].slice(1)] = pathParts[i];
                } else if (patternParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }

            if (match) return { handler, params };
        }

        return null;
    },

    async handleRoute() {
        const hash = window.location.hash || '#/';
        const match = this.matchRoute(hash);

        if (match) {
            const content = document.getElementById('app-content');
            if (this.currentView && this.currentView.destroy) {
                this.currentView.destroy();
            }
            this.currentView = await match.handler(match.params, content);
        } else {
            // Default to home
            this.navigate('#/');
        }
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());

        if (!window.location.hash) {
            window.location.hash = '#/';
        }

        this.handleRoute();
    }
};
