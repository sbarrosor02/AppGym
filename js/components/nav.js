// ========== Bottom Navigation Component ==========
const Nav = {
    tabs: [
        { id: 'home', label: 'Rutina', icon: '&#128170;', hash: '#/' },
        { id: 'history', label: 'Historial', icon: '&#128203;', hash: '#/history' },
        { id: 'measurements', label: 'Medidas', icon: '&#128207;', hash: '#/measurements' },
        { id: 'progress', label: 'Progreso', icon: '&#128200;', hash: '#/progress' }
    ],

    render() {
        const nav = document.getElementById('app-nav');
        nav.innerHTML = this.tabs.map(tab => `
            <button class="nav-item" data-tab="${tab.id}" data-hash="${tab.hash}">
                <span class="nav-icon">${tab.icon}</span>
                <span>${tab.label}</span>
            </button>
        `).join('');

        nav.addEventListener('click', (e) => {
            const item = e.target.closest('.nav-item');
            if (item) {
                Router.navigate(item.dataset.hash);
            }
        });

        this.update();
    },

    update() {
        const hash = window.location.hash || '#/';
        const nav = document.getElementById('app-nav');
        const items = nav.querySelectorAll('.nav-item');

        items.forEach(item => {
            const tabHash = item.dataset.hash;
            if (hash === tabHash || (tabHash !== '#/' && hash.startsWith(tabHash))) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    show() {
        document.getElementById('app-nav').classList.remove('hidden');
        document.getElementById('app-content').classList.remove('no-nav');
    },

    hide() {
        document.getElementById('app-nav').classList.add('hidden');
        document.getElementById('app-content').classList.add('no-nav');
    }
};
