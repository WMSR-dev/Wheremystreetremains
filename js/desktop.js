
export async function initMessenger() {

    const windowEl = document.getElementById('messenger-window');
    const contactList = document.getElementById('contact-list');
    const messageList = document.getElementById('message-list');
    const conversationName = document.getElementById('conversation-name');

    if (!windowEl || !contactList || !messageList) {
        console.error('Messenger elements not found');
        return;
    }

    let messages = [];
    let activePerson = 'Asem';

    // =========================
    // LOAD MESSAGES
    // =========================

    async function loadMessages() {

        try {

            const response = await fetch('../data/messages.json');

            if (!response.ok) {
                throw new Error('Could not load messages.json');
            }

            messages = await response.json();

            renderContacts();
            renderConversation();

        } catch (error) {

            console.error('Messenger loading error:', error);

            messageList.textContent = 'Could not load messages.';

        }

    }


    // =========================
    // CONTACT HELPERS
    // =========================

    function getPeople() {

        const people = [...new Set(
            messages.map(message => message.personId)
        )];

        people.sort((a, b) => {

            if (a === 'Asem') return -1;
            if (b === 'Asem') return 1;

            return a.localeCompare(b);

        });

        return people;

    }


    function formatName(personId) {

        if (personId === 'Asem') return 'Asem';

        return personId
            .replaceAll('_', ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

    }


    function getLatestMessage(personId) {

        const personMessages = messages.filter(
            message =>
                message.personId === personId &&
                message.arrived === true
        );

        return personMessages[personMessages.length - 1];

    }


    // =========================
    // RENDER CONTACTS
    // =========================

    function renderContacts() {

        contactList.innerHTML = '';

        getPeople().forEach(personId => {

            const lastMessage = getLatestMessage(personId);

            const contact = document.createElement('div');

            contact.className = 'contact';

            if (personId === activePerson) {
                contact.classList.add('active');
            }

            // Avatar
            const avatar = document.createElement('div');

            avatar.className = 'contact-avatar';

            avatar.textContent = formatName(personId).charAt(0);


            // Contact information
            const info = document.createElement('div');

            info.className = 'contact-info';

            const name = document.createElement('div');

            name.className = 'contact-name';

            name.textContent = formatName(personId);


            const preview = document.createElement('div');

            preview.className = 'contact-preview';

            preview.textContent =
                lastMessage?.transcript?.en ||
                (lastMessage?.image ? 'Image' : '');


            info.append(name, preview);

            contact.append(avatar, info);


            // Click contact
            contact.addEventListener('click', () => {

                activePerson = personId;

                renderContacts();
                renderConversation();

            });

            contactList.appendChild(contact);

        });

    }


    // =========================
    // RENDER CONVERSATION
    // =========================

    function renderConversation() {

        if (!activePerson) return;

        const personMessages = messages.filter(
            message =>
                message.personId === activePerson &&
                message.arrived === true
        );

        conversationName.textContent = formatName(activePerson);

        messageList.innerHTML = '';

        if (!personMessages.length) {

            const empty = document.createElement('div');

            empty.className = 'empty-state';

            empty.textContent = 'No messages yet.';

            messageList.appendChild(empty);

            return;

        }

        personMessages.forEach(message => {

            renderMessage(message);

        });

        messageList.scrollTop = messageList.scrollHeight;

    }


    // =========================
    // RENDER INDIVIDUAL MESSAGE
    // =========================

    function renderMessage(message) {

        const wrapper = document.createElement('div');

        wrapper.className = 'message';

        wrapper.dataset.messageId = message.id;


        // Text
        if (message.transcript?.en) {

            const bubble = document.createElement('div');

            bubble.className = 'message-bubble';

            bubble.textContent = message.transcript.en;

            wrapper.appendChild(bubble);

        }


        // Image
        if (message.image) {

            const img = document.createElement('img');

            img.className = 'message-image';

            img.src = message.image;

            img.alt = `Image shared by ${formatName(message.personId)}`;

            img.loading = 'lazy';

            wrapper.appendChild(img);

        }


        // Audio
        if (message.audio) {

            const audio = document.createElement('audio');

            audio.className = 'message-audio';

            audio.controls = true;

            audio.preload = 'none';

            audio.src = message.audio;

            wrapper.appendChild(audio);

        }


        // Time
        if (message.time) {

            const time = document.createElement('div');

            time.className = 'message-time';

            time.textContent = message.time;

            wrapper.appendChild(time);

        }


        messageList.appendChild(wrapper);

    }


    // =========================
    // SCHEDULE MESSAGE ARRIVALS
    // =========================

    function scheduleMessages() {

        messages.forEach(message => {

            // Already arrived: nothing to schedule
            if (message.arrived) return;

            const delay = Math.max(0, Number(message.delay) || 0);

            const timeout = delay * 1000;

            setTimeout(() => {

                message.arrived = true;

                renderContacts();

                // Update conversation if currently open
                if (activePerson === message.personId) {

                    renderConversation();

                }

            }, timeout);

        });

    }


    // =========================
    // CLOSE WINDOW
    // =========================

    const closeButton = windowEl.querySelector('.window-close');

    if (closeButton) {

        closeButton.addEventListener('click', () => {

            windowEl.classList.remove('open');

            windowEl.style.display = 'none';

        });

    }


    // =========================
    // INITIALISE
    // =========================

    await loadMessages();

    if (messages.length) {

        scheduleMessages();

    }

}


function updateDesktopStatus() {
    const now = new Date();

    document.getElementById("desktop-date").textContent =
        now.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

    document.getElementById("desktop-clock").textContent =
        now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
}

updateDesktopStatus();
setInterval(updateDesktopStatus, 1000);

