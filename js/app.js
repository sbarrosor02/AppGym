// ========== App Entry Point ==========
(async function () {
    // Initialize database
    await AppDB.open();

    // Register routes
    Router.register('/', (params, container) => HomeView.render(params, container));
    Router.register('session/:id', (params, container) => SessionView.render(params, container));
    Router.register('workout/:id', (params, container) => WorkoutView.render(params, container));
    Router.register('history', (params, container) => HistoryView.render(params, container));
    Router.register('history/:id', (params, container) => HistoryDetailView.render(params, container));
    Router.register('measurements', (params, container) => MeasurementsView.render(params, container));
    Router.register('progress', (params, container) => ProgressView.render(params, container));
    Router.register('settings', (params, container) => SettingsView.render(params, container));
    Router.register('workout-editor', (params, container) => WorkoutEditorView.render(params, container));

    // Render nav
    Nav.render();

    // Update nav on route change
    window.addEventListener('hashchange', () => Nav.update());

    // Initialize router
    Router.init();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.log('SW registration failed:', e);
        }
    }

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist();
    }

    // iOS install banner
    showInstallBanner();
})();

function showInstallBanner() {
    // Only show on iOS Safari, not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    const dismissed = localStorage.getItem('install_banner_dismissed');

    if (isIOS && !isStandalone && !dismissed) {
        const banner = document.getElementById('install-banner');
        banner.classList.remove('hidden');

        document.getElementById('install-banner-close').addEventListener('click', () => {
            banner.classList.add('hidden');
            localStorage.setItem('install_banner_dismissed', '1');
        });
    }
}
