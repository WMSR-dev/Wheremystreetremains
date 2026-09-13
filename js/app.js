// app switching 

function showApp(name){
  document.querySelectorAll('.app').forEach(el => {
    el.classList.toggle('active', el.dataset.app === name);
  });
  document.querySelectorAll('.dock button[data-app]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.app === name);
  });
}
document.querySelectorAll('.dock button[data-app]').forEach(btn => {
  btn.addEventListener('click', () => showApp(btn.dataset.app));
});

//language
const LANG = 'en';
function t(field){
  if (!field) return '';
  return field[LANG] ?? field.en ?? '';
}



//data
let people = [];          // everyone who exists in the archive
let messages = [];        // messages that have "arrived"
let pendingQueue = [];    // messages waiting to arrive
let openThreadId = null;  // which person's thread is open
let photoFolders = [];

async function loadData(){
  const [peopleRes, messagesRes, photosRes] = await Promise.all([
    fetch('data/people.json'),
    fetch('data/messages.json'),
    fetch('data/photos.json')
  ]);
  people = await peopleRes.json();
  photoFolders = await photosRes.json();
  const all = await messagesRes.json();
  messages = all.filter(m => m.arrived);
  pendingQueue = all.filter(m => !m.arrived);
  renderThreadList();
  renderContactsList();
  renderPhotoFolders();
  startSequence();
}


function getPerson(id){ return people.find(p => p.id === id); }
function messagesFor(personId){ return messages.filter(m => m.personId === personId); }


// appearing in the list only when a msg is received // diff between new msg for an introduced character and a new character

function knownPeople(){
  return people.filter(p => messagesFor(p.id).length > 0);
}

//thread list

function renderThreadList(){
  const list = document.getElementById('message-list');
  const known = knownPeople();
 
  if (known.length === 0){
    list.innerHTML = `<p class="pane-placeholder">No messages yet.</p>`;
    return;
  }
 
  list.innerHTML = known.map(person => {
    const thread = messagesFor(person.id);
    const latest = thread[thread.length - 1];
    const count = thread.length;
    return `
      <div class="message-row" data-person="${person.id}">
        <img class="message-row-thumb" src="${person.avatar}" alt="">
        <div class="message-row-text">
          <div class="message-row-from">
            ${t(person.name)}
            ${count > 1 ? `<span class="thread-count">${count}</span>` : ''}
          </div>
          <div class="message-row-snippet">${t(latest.transcript)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderContactsList() {
  const contactList = document.getElementById('contacts-list');
  const contacts = people;

  contactList.innerHTML = contacts.map(person => `
    <div class="contact-row" data-person="${person.id}">
      <img
        class="contact-row-avatar"
        src="${person.avatar}"
        alt=""
      >
      <div class="contact-row-name">
        ${t(person.name)}
      </div>
    </div>
  `).join('');

  contactList.querySelectorAll('.contact-row').forEach(row => {
    row.addEventListener('click', () => {
      const person = contacts.find(p => p.id === row.dataset.person);
      renderContactProfile(person);
    });
  });
}


function renderContactProfile(person) {
  const list = document.getElementById('contacts-list');

  list.innerHTML = `
    <div class="contact-profile">

      <button class="contact-back" id="contact-back">
        ← Back
      </button>

      <div class="contact-profile-header">
        <img
          class="contact-profile-avatar"
          src="${person.avatar}"
          alt=""
        >

        <h2>${t(person.name)}</h2>
      </div>

      <div class="contact-profile-section">
        <h3>Notes</h3>
        <p class="contact-notes">
          ${person.bio ? t(person.bio) : ''}
        </p>
      </div>

    </div>
  `;

  document.getElementById('contact-back').addEventListener('click', () => {
    renderContactsList();
  });
}
 
document.getElementById('message-list').addEventListener('click', (e) => {
  const row = e.target.closest('.message-row');
  if (!row) return;
  openThread(row.dataset.person);
});




//single contact msg view
function openThread(personId){
  openThreadId = personId;
  renderThread();
  document.getElementById('message-detail').classList.add('show');
}

function renderPhotoFolders() {
  const photoList = document.getElementById('photos-list');

  photoList.innerHTML = photoFolders.map(folder => `
    <div class="photo-folder" data-folder="${folder.id}">

      <img
        class="photo-folder-cover"
        src="${folder.cover}"
        alt=""
      >

      <div class="photo-folder-info">
        <div class="photo-folder-name">
          ${folder.name}
        </div>

        <div class="photo-folder-count">
          ${folder.photos.length} photos
        </div>
      </div>

    </div>
  `).join('');

  photoList.querySelectorAll('.photo-folder').forEach(folderElement => {
    folderElement.addEventListener('click', () => {

      const folder = photoFolders.find(
        f => f.id === folderElement.dataset.folder
      );

      renderPhotoFolder(folder);
    });
  });
}


function renderPhotoFolder(folder) {
  const photoList = document.getElementById('photos-list');

  photoList.innerHTML = `
    <div class="photo-folder-view">

      <button class="photo-back" id="photo-folder-back">
        ← Back
      </button>

      <h2 class="photo-folder-title">
        ${t(folder.name)}
      </h2>

      <div class="photo-grid">
        ${folder.photos.map(photo => `
          <div
            class="photo-item"
            data-photo="${photo.id}"
          >
            <img
              src="${photo.src}"
              alt="${photo.caption ? t(photo.caption) : ''}"
            >
          </div>
        `).join('')}
      </div>

    </div>
  `;

  document
    .getElementById('photo-folder-back')
    .addEventListener('click', renderPhotoFolders);


  photoList.querySelectorAll('.photo-item').forEach(photoElement => {
    photoElement.addEventListener('click', () => {

      const photo = folder.photos.find(
        p => p.id === photoElement.dataset.photo
      );

      renderPhoto(photo, folder);
    });
  });
}


function renderPhoto(photo, folder) {
  const photoList = document.getElementById('photos-list');

  photoList.innerHTML = `
    <div class="photo-view">

      <button class="photo-back" id="photo-back">
        ← Back
      </button>

      <div class="photo-view-image">
        <img
          src="${photo.src}"
          alt="${photo.caption ? t(photo.caption) : ''}"
        >
      </div>

      ${photo.caption ? `
        <div class="photo-caption">
          ${t(photo.caption)}
        </div>
      ` : ''}

    </div>
  `;

  document
    .getElementById('photo-back')
    .addEventListener('click', () => {
      renderPhotoFolder(folder);
    });
}
 
function renderThread(){
  const person = getPerson(openThreadId);
  const detail = document.getElementById('message-detail');
  if (!person){ detail.innerHTML = ''; return; }

  const bubbles = messagesFor(person.id).map(m => `
    <div class="bubble" data-id="${m.id}">
      <img class="bubble-photo" src="${m.image}" alt="">

      <div class="voice-note">
        <button class="vn-play" data-audio="${m.id}" aria-label="Play voice note">
          <span class="vn-icon">&#9654;</span>
        </button>
        <div class="vn-track">
          <div class="vn-progress"></div>
        </div>
        <span class="vn-time">--:--</span>
        <audio preload="metadata" src="${m.audio}"></audio>
      </div>

      <button class="transcript-toggle" data-toggle="${m.id}">transcript</button>
      <p class="bubble-transcript" hidden>${t(m.transcript)}</p>

      <span class="bubble-meta">${m.time || ''}</span>
    </div>
  `).join('');

    detail.innerHTML = `
    <div class="thread-topbar">
      <button class="detail-close" id="detail-close" aria-label="Back">&#8249;</button>
      <img class="thread-avatar" src="${person.avatar}" alt="">
      <div class="thread-titles">
        <div class="thread-name">${t(person.name)}</div>
        <div class="thread-bio">${t(person.bio)}</div>
      </div>
    </div>
    <div class="thread-body">${bubbles}</div>
  `;

   document.getElementById('detail-close').addEventListener('click', () => {
    stopAllAudio();
    detail.classList.remove('show');
    openThreadId = null;
  });

  wireVoiceNotes(detail);
  wireTranscriptToggles(detail);

  // land at the newest message, like opening a real thread
  const body = detail.querySelector('.thread-body');
  body.scrollTop = body.scrollHeight;
}

// vns

function stopAllAudio(){
  document.querySelectorAll('.voice-note audio').forEach(a => { a.pause(); });
  document.querySelectorAll('.vn-icon').forEach(i => { i.innerHTML = '&#9654;'; });
}

function formatTime(seconds){
  if (!isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function wireVoiceNotes(scope){
  scope.querySelectorAll('.voice-note').forEach(vn => {
    const audio = vn.querySelector('audio');
    const btn = vn.querySelector('.vn-play');
    const icon = vn.querySelector('.vn-icon');
    const progress = vn.querySelector('.vn-progress');
    const timeLabel = vn.querySelector('.vn-time');

    // duration isn't known until metadata loads, hence preload="metadata"
    audio.addEventListener('loadedmetadata', () => {
      timeLabel.textContent = formatTime(audio.duration);
    });

    btn.addEventListener('click', () => {
      const wasPlaying = !audio.paused;
      stopAllAudio();               // only one voice note at a time
      if (wasPlaying) return;       // that click was a pause
      audio.play();
      icon.innerHTML = '&#10074;&#10074;';
    });

    audio.addEventListener('timeupdate', () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      progress.style.width = `${pct}%`;
      timeLabel.textContent = formatTime(audio.duration - audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      icon.innerHTML = '&#9654;';
      progress.style.width = '0%';
      timeLabel.textContent = formatTime(audio.duration);
    });

    // scrub by tapping the track
    vn.querySelector('.vn-track').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = ratio * audio.duration;
    });
  });
}

//transcript toggle
function wireTranscriptToggles(scope){
  scope.querySelectorAll('.transcript-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.nextElementSibling;
      const showing = !p.hidden;
      p.hidden = showing;
      btn.textContent = showing ? 'transcript' : 'hide transcript';
      btn.classList.toggle('open', !showing);
    });
  });
}

//arrival + delay (currently fixed delays we need to develop this later with more complex triggers)

function startSequence(){
  pendingQueue.forEach(message => {
    setTimeout(() => deliver(message), (message.delay || 0) * 1000);
  });
}
 
function deliver(next){
  if (next.arrived) return;
  next.arrived = true;
 
  const person = getPerson(next.personId);
  // did we already know this person before this message landed?
  const isNewPerson = messagesFor(person.id).length === 0;
 
  messages.push(next);
  renderThreadList();
  if (openThreadId === person.id) renderThread();
 
  showBanner(next, person, isNewPerson);
}
 
function showBanner(message, person, isNewPerson){
  const banner = document.getElementById('notif-banner');
  document.getElementById('notif-thumb').style.backgroundImage = `url(${message.image})`;
  document.getElementById('notif-from').textContent =
    isNewPerson ? `${t(person.name)} — new contact` : t(person.name);
  document.getElementById('notif-snippet').textContent = t(message.transcript);
 
  banner.classList.add('show');
  banner.onclick = () => {
    banner.classList.remove('show');
    showApp('messages');
    openThread(person.id);
  };
  setTimeout(() => banner.classList.remove('show'), 4000);
}

// demo button: delivers whatever's still pending, for showing this without waiting
// document.getElementById('notify-trigger').addEventListener('click', () => {
//   const next = pendingQueue.find(m => !m.arrived);
//   if (next) deliver(next);
// });
 
loadData();




