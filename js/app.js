const state = { screen: 'intro' };

function showScreen(name){
  document.querySelectorAll('.screen').forEach(el =>
    el.classList.toggle('active', el.dataset.screen === name)
  );
  state.screen = name;
}

console.log('app.js loaded, current screen:', state.screen);

document.getElementById('intro-continue').addEventListener('click', () => showScreen('lock'));
document.getElementById('unlock-btn').addEventListener('click', () => showScreen('prompt'));
document.getElementById('prompt-continue').addEventListener('click', () => showScreen('os'));

function showApp(name){
  document.querySelectorAll('.app').forEach(el =>
    el.classList.toggle('active', el.dataset.app === name)
  );
  document.querySelectorAll('.dock button').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.app === name)
  );
  state.app = name;
}

document.querySelectorAll('.dock button').forEach(btn => {
  btn.addEventListener('click', () => showApp(btn.dataset.app));
});

async function loadContent(){
  const response = await fetch('content/en.json');
  const content = await response.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const value = key.split('.').reduce((obj, part) => obj?.[part], content);
    if (value) el.textContent = value;
  });
}


async function loadGallery(){
  const response = await fetch('data/archive.json');
  const items = await response.json();

  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = items.map(item => `
    <div class="tile" style="background:${item.color}"></div>
  `).join('');
}

let messages = [];
let pendingQueue = [];
let selectedMessageId = null;

async function loadMessages(){
  const response = await fetch('data/messages.json');
  const all = await response.json();
  messages = all.filter(m => m.arrived);
  pendingQueue = all.filter(m => !m.arrived);
  renderMessageList();
}

function triggerNotification(){
  if (pendingQueue.length === 0) return;
  const next = pendingQueue.shift();
  messages.push(next);
  renderMessageList();
  showBanner(next);
}
function showBanner(message){
  document.getElementById('notif-from').textContent = message.from;
  document.getElementById('notif-snippet').textContent = message.snippet;

  const banner = document.getElementById('notif-banner');
  banner.classList.add('show');

  banner.onclick = () => {
    banner.classList.remove('show');
    showApp('messages');
    selectedMessageId = message.id;
    renderMessageList();
    renderMessageDetail();
  };

  setTimeout(() => banner.classList.remove('show'), 4000);
}

document.getElementById('notify-trigger').addEventListener('click', triggerNotification);

function renderMessageList(){
  const list = document.getElementById('message-list');
  list.innerHTML = messages.map(m => `
    <div class="message-row ${m.id === selectedMessageId ? 'selected' : ''}" data-id="${m.id}">
      <div class="from">${m.from}</div>
      <div>${m.snippet}</div>
    </div>
  `).join('');
}

function renderMessageDetail(){
  const message = messages.find(m => m.id === selectedMessageId);
  const detail = document.getElementById('message-detail');

  if (!message) {
    detail.innerHTML = '<p class="pane-placeholder">Select a message to read it</p>';
    return;
  }

  detail.innerHTML = `
    <p class="prompt-line">${message.prompt}</p>
    <p>${message.transcript}</p>
    ${renderResponseSection(message)}
  `;

  attachResponseListeners(message);
}

function renderResponseSection(message){
  if (message.responseType === 'text') return renderTextResponse(message);
  if (message.responseType === 'choice') return renderChoiceResponse(message);
  return `<p class="pane-placeholder">Response type "${message.responseType}" — coming soon.</p>`;
}

function renderChoiceResponse(message){
  const buttons = message.choices.map(choice => `
    <button class="choice-btn ${choice === message.savedChoice ? 'selected' : ''}" data-choice="${choice}">
      ${choice}
    </button>
  `).join('');

  return `
    <div class="choice-list">${buttons}</div>
    ${message.savedChoice ? '<div class="saved-note">Saved locally — not yet connected to a backend.</div>' : ''}
  `;
}

function renderTextResponse(message){
  const saved = message.savedText;
  return `
    <textarea class="response-box" id="response-input" placeholder="Type a response...">${saved || ''}</textarea>
    <button class="save-btn" id="save-response">Save response</button>
    ${saved ? '<div class="saved-note">Saved locally — not yet connected to a backend.</div>' : ''}
  `;
}

function attachResponseListeners(message){
  if (message.responseType === 'text') {
    const saveBtn = document.getElementById('save-response');
    const input = document.getElementById('response-input');
    saveBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) return;
      message.savedText = value;
      renderMessageDetail();
    });
  }
  if (message.responseType === 'choice') {
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        message.savedChoice = btn.dataset.choice;
        renderMessageDetail();
      });
    });
  }
}

document.getElementById('message-list').addEventListener('click', (event) => {
  const row = event.target.closest('.message-row');
  if (!row) return;
  selectedMessageId = row.dataset.id;
  renderMessageList();
  renderMessageDetail();
});



loadContent();
loadGallery();
loadMessages();
