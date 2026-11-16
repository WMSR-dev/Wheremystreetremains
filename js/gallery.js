
export async function initGallery() {

    const galleryWindow = document.getElementById('gallery-window');

    if (!galleryWindow) {
        console.error('Gallery window not found');
        return;
    }

    // Elements
    const foldersContainer = document.getElementById('gallery-folders');
    const photosContainer = document.getElementById('gallery-photos');

    const locationLabel = document.getElementById('gallery-location');
    const backButton = document.getElementById('gallery-back');

    const viewer = document.getElementById('gallery-viewer');
    const viewerImage = document.getElementById('gallery-large-image');

    const viewerCaption = document.getElementById('gallery-caption');
    const viewerDate = document.getElementById('gallery-date');

    const viewerClose = document.getElementById('gallery-viewer-close');
    const prevButton = document.getElementById('gallery-prev');
    const nextButton = document.getElementById('gallery-next');


    // State
    let folders = [];
    let currentFolder = null;
    let currentPhotos = [];
    let currentPhotoIndex = 0;

    let viewerOpen = false;


    // =========================
    // LOAD JSON
    // =========================

    async function loadGallery() {

        try {

            const response = await fetch('../data/photos.json');

            if (!response.ok) {
                throw new Error('Could not load photos.json');
            }

            folders = await response.json();

            renderFolders();

        } catch (error) {

            console.error('Gallery loading error:', error);

            foldersContainer.innerHTML = '';

            const errorMessage = document.createElement('div');

            errorMessage.className = 'gallery-empty';

            errorMessage.textContent = 'Could not load gallery.';

            foldersContainer.appendChild(errorMessage);

        }

    }


    // =========================
    // HELPERS
    // =========================

    function getName(folder) {

        return folder.name?.en || folder.id;

    }


    function getCaption(photo) {

        return photo.caption?.en || '';

    }


    function formatDate(date) {

        if (!date) return '';

        const parsed = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsed.getTime())) return date;

        return parsed.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    }


    // =========================
    // FOLDERS VIEW
    // =========================

    function renderFolders() {

        currentFolder = null;
        currentPhotos = [];

        foldersContainer.style.display = 'grid';
        photosContainer.style.display = 'none';

        foldersContainer.innerHTML = '';

        locationLabel.textContent = 'My Photos';

        backButton.disabled = true;

        if (!folders.length) {

            showEmpty(foldersContainer, 'No folders available.');

            return;

        }

        folders.forEach(folder => {

            const folderElement = document.createElement('div');

            folderElement.className = 'gallery-folder';


            const cover = document.createElement('img');

            cover.className = 'gallery-folder-cover';

            cover.src = folder.cover || '';

            cover.alt = getName(folder);

            cover.loading = 'lazy';


            const name = document.createElement('div');

            name.className = 'gallery-folder-name';

            name.textContent = getName(folder);


            folderElement.append(cover, name);


            folderElement.addEventListener('click', () => {

                openFolder(folder);

            });


            foldersContainer.appendChild(folderElement);

        });

    }


    // =========================
    // OPEN FOLDER
    // =========================

    function openFolder(folder) {

        currentFolder = folder;

        currentPhotos = folder.photos || [];

        foldersContainer.style.display = 'none';
        photosContainer.style.display = 'grid';

        photosContainer.innerHTML = '';

        locationLabel.textContent = getName(folder);

        backButton.disabled = false;

        if (!currentPhotos.length) {

            showEmpty(photosContainer, 'This folder is empty.');

            return;

        }

        currentPhotos.forEach((photo, index) => {

            const photoElement = document.createElement('div');

            photoElement.className = 'gallery-photo';


            const img = document.createElement('img');

            img.src = photo.src;

            img.alt = getCaption(photo);

            img.loading = 'lazy';


            const caption = document.createElement('div');

            caption.className = 'gallery-photo-caption';

            caption.textContent = getCaption(photo);


            photoElement.append(img, caption);


            photoElement.addEventListener('click', () => {

                openViewer(index);

            });


            photosContainer.appendChild(photoElement);

        });

    }


    // =========================
    // PHOTO VIEWER
    // =========================

    function openViewer(index) {

        currentPhotoIndex = index;

        viewerOpen = true;

        updateViewer();

        viewer.classList.add('active');

    }


    function updateViewer() {

        const photo = currentPhotos[currentPhotoIndex];

        if (!photo) return;

        viewerImage.src = photo.src;

        viewerImage.alt = getCaption(photo);

        viewerCaption.textContent = getCaption(photo);

        viewerDate.textContent = formatDate(photo.date);

        prevButton.disabled = currentPhotoIndex === 0;

        nextButton.disabled = currentPhotoIndex === currentPhotos.length - 1;

    }


    function closeViewer() {

        viewerOpen = false;

        viewer.classList.remove('active');

        viewerImage.src = '';

    }


    function showPrevious() {

        if (currentPhotoIndex <= 0) return;

        currentPhotoIndex--;

        updateViewer();

    }


    function showNext() {

        if (currentPhotoIndex >= currentPhotos.length - 1) return;

        currentPhotoIndex++;

        updateViewer();

    }


    // =========================
    // VIEWER EVENTS
    // =========================

    viewerClose.addEventListener('click', closeViewer);

    prevButton.addEventListener('click', showPrevious);

    nextButton.addEventListener('click', showNext);


    // =========================
    // BACK NAVIGATION
    // =========================

    backButton.addEventListener('click', () => {

        if (viewerOpen) {

            closeViewer();

            return;

        }

        renderFolders();

    });


    // =========================
    // EMPTY STATES
    // =========================

    function showEmpty(container, message) {

        const empty = document.createElement('div');

        empty.className = 'gallery-empty';

        empty.textContent = message;

        container.appendChild(empty);

    }


    // =========================
    // KEYBOARD NAVIGATION
    // =========================

    galleryWindow.addEventListener('keydown', event => {

        if (!viewer.classList.contains('active')) return;

        if (event.key === 'Escape') {
            closeViewer();
        }

        if (event.key === 'ArrowLeft') {
            showPrevious();
        }

        if (event.key === 'ArrowRight') {
            showNext();
        }

    });


    // =========================
    // INITIALIZE
    // =========================

    await loadGallery();

}
