
export function initDesktopIcons() {

    const desktop = document.querySelector('.desktop');

    if (!desktop) {
        console.error('Desktop element not found');
        return;
    }

    const icons = desktop.querySelectorAll('.desktop-icon');

    const windows = desktop.querySelectorAll(
        '#messenger-window, .app-window'
    );

    let highestZ = 20;


    // =========================
    // OPEN APPLICATIONS
    // =========================

    function openApp(app) {

        const appWindows = {
            messenger: 'messenger-window',
            notes: 'notes-window',
            gallery: 'gallery-window'
        };

        const windowId = appWindows[app];

        if (!windowId) return;

        const windowEl = document.getElementById(windowId);

        if (!windowEl) {
            console.warn(`Window not found: ${windowId}`);
            return;
        }

        windowEl.style.display = 'flex';
        windowEl.classList.add('open');

        bringToFront(windowEl);

    }


    // =========================
    // WINDOW FOCUS
    // =========================

    function bringToFront(windowEl) {

        highestZ++;

        windowEl.style.zIndex = highestZ;

    }


    // =========================
    // DRAGGABLE DESKTOP ICONS
    // =========================

    icons.forEach(icon => {

        let dragging = false;
        let moved = false;

        let startX = 0;
        let startY = 0;

        let originalX = 0;
        let originalY = 0;


        icon.addEventListener('pointerdown', event => {

            if (event.button !== 0) return;

            event.stopPropagation();

            dragging = true;
            moved = false;

            startX = event.clientX;
            startY = event.clientY;

            originalX = icon.offsetLeft;
            originalY = icon.offsetTop;

            icon.setPointerCapture(event.pointerId);

            // Select icon
            icons.forEach(el => {
                el.classList.remove('selected');
            });

            icon.classList.add('selected');

        });


        icon.addEventListener('pointermove', event => {

            if (!dragging) return;

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                moved = true;
            }

            if (!moved) return;

            const maxX = desktop.clientWidth - icon.offsetWidth;
            const maxY = desktop.clientHeight - icon.offsetHeight;

            const x = Math.max(
                0,
                Math.min(maxX, originalX + dx)
            );

            const y = Math.max(
                0,
                Math.min(maxY, originalY + dy)
            );

            icon.style.left = `${x}px`;
            icon.style.top = `${y}px`;

        });


        icon.addEventListener('pointerup', event => {

            if (!dragging) return;

            dragging = false;

            // Open only if the icon wasn't moved
            if (!moved) {

                openApp(icon.dataset.app);

            }

        });


        icon.addEventListener('pointercancel', () => {

            dragging = false;

        });

    });


    // =========================
    // DRAGGABLE APPLICATION WINDOWS
    // =========================

    windows.forEach(windowEl => {

        const titlebar = windowEl.querySelector(
            '.messenger-titlebar, .app-titlebar'
        );

        if (!titlebar) return;

        let dragging = false;

        let startX = 0;
        let startY = 0;

        let originalX = 0;
        let originalY = 0;


        // Focus window when clicked
        windowEl.addEventListener('pointerdown', () => {

            bringToFront(windowEl);

        });


        // Start dragging
        titlebar.addEventListener('pointerdown', event => {

            if (event.button !== 0) return;

            if (event.target.closest('button')) return;

            dragging = true;

            bringToFront(windowEl);

            const rect = windowEl.getBoundingClientRect();

            const desktopRect = desktop.getBoundingClientRect();

            startX = event.clientX;
            startY = event.clientY;

            originalX = rect.left - desktopRect.left;
            originalY = rect.top - desktopRect.top;

            titlebar.setPointerCapture(event.pointerId);

        });


        // Move window
        titlebar.addEventListener('pointermove', event => {

            if (!dragging) return;

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            const maxX = desktop.clientWidth - windowEl.offsetWidth;
            const maxY = desktop.clientHeight - windowEl.offsetHeight;

            const x = Math.max(
                0,
                Math.min(maxX, originalX + dx)
            );

            const y = Math.max(
                0,
                Math.min(maxY, originalY + dy)
            );

            windowEl.style.left = `${x}px`;
            windowEl.style.top = `${y}px`;

            windowEl.style.transform = 'none';

        });


        // Stop dragging
        titlebar.addEventListener('pointerup', () => {

            dragging = false;

        });


        titlebar.addEventListener('pointercancel', () => {

            dragging = false;

        });

    });


    // =========================
    // CLOSE APPLICATION WINDOWS
    // =========================

    windows.forEach(windowEl => {

        const closeButton = windowEl.querySelector(
            '.window-close, .app-close'
        );

        if (!closeButton) return;

        closeButton.addEventListener('click', event => {

            event.stopPropagation();

            windowEl.classList.remove('open');

            windowEl.style.display = 'none';

        });

    });


    // =========================
    // DESKTOP DESELECTION
    // =========================

    desktop.addEventListener('pointerdown', event => {

        if (
            event.target === desktop ||
            event.target.classList.contains('desktop-icons')
        ) {

            icons.forEach(icon => {
                icon.classList.remove('selected');
            });

        }

    });


    console.log('Desktop icons initialized');

}
