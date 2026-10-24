const DEFAULT_USERS = {
  "dep1": {
    id: "dep1",
    role: "DEPORTISTA",
    name: "Mateo Gómez",
    position: "Extremo Izquierdo",
    club: "Envigado FC Sub-20",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bio: "Jugador categoría 2005. Extremo veloz, especialista en mano a mano y desborde por banda izquierda."
  },
  "scout1": {
    id: "scout1",
    role: "SCOUT",
    name: "Carlos Mendoza",
    position: "Scout Principal",
    club: "Boca Juniors Scouting Hub",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    bio: "Ojeador profesional con 12 años de experiencia descubriendo jóvenes talentos."
  }
};

const DEFAULT_POSTS = [
  {
    id: "post-1",
    type: "VIDEO",
    authorId: "dep1",
    title: "Compilado de regates y asistencias - Torneo Apertura",
    videoUrl: "https://www.youtube.com/embed/S3KjmRxRAOc?start=937",
    description: "Resumen de las mejores jugadas actuando como extremo izquierdo.",
    createdAt: "Hace 2 horas"
  }
];

const DEFAULT_EVALUATIONS = [
  {
    id: "eval-1",
    scoutId: "scout1",
    playerId: "dep1",
    pros: "Aceleración en corto y gran control orientado.",
    cons: "Necesita mejorar el perfilamiento con pie derecho.",
    notes: "Excelente prospecto para probar en plantilla competitiva."
  }
];

const DEFAULT_MESSAGES = [
  { id: "m1", from: "scout1", to: "dep1", text: "Hola Mateo, vi tu video. Me interesa tu perfil para una prueba.", timestamp: "10:30 AM" }
];

function loadState(key, fallback) {
  const data = localStorage.getItem('scouttalent_' + key);
  return data ? JSON.parse(data) : fallback;
}

function saveState(key, value) {
  localStorage.setItem('scouttalent_' + key, JSON.stringify(value));
}

let users = loadState('users', DEFAULT_USERS);
let posts = loadState('posts', DEFAULT_POSTS);
let evaluations = loadState('evaluations', DEFAULT_EVALUATIONS);
let messages = loadState('messages', DEFAULT_MESSAGES);
let activeUserId = localStorage.getItem('scouttalent_active_user') || 'dep1';
let activeChatUserId = 'scout1';
let currentPosFilter = 'ALL';

function switchTab(tabName) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`view-${tabName}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`nav-${tabName}`);
  if(activeBtn) activeBtn.classList.add('active');

  if(tabName === 'feed') renderFeed();
  if(tabName === 'directory') renderDirectory();
  if(tabName === 'chat') renderChatView();
  if(tabName === 'profile') populateProfileForm();
}

function setActiveUser(userId) {
  activeUserId = userId;
  localStorage.setItem('scouttalent_active_user', userId);
  updateUserHeaderUI();
  renderFeed();
}

function updateUserHeaderUI() {
  const user = users[activeUserId];
  document.getElementById('header-avatar').src = user.avatar;
  document.getElementById('side-user-avatar').src = user.avatar;
  document.getElementById('side-user-name').innerText = user.name;
  document.getElementById('side-user-role').innerText = user.role;
  document.getElementById('side-user-pos').innerText = user.position + ' • ' + user.club;
  document.getElementById('side-user-bio').innerText = user.bio || 'Sin bibliografía.';

  const postCard = document.getElementById('post-creation-card');
  const scoutCard = document.getElementById('scout-tools-card');

  if(user.role === 'DEPORTISTA') {
    postCard.classList.remove('hidden');
    scoutCard.classList.add('hidden');
    document.getElementById('post-author-img').src = user.avatar;
  } else {
    postCard.classList.add('hidden');
    scoutCard.classList.remove('hidden');
    populatePlayerSelectOptions();
  }
}

function switchScoutTool(tool) {
  document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
  if(tool === 'eval') {
    document.getElementById('scout-tool-eval').classList.remove('hidden');
    document.getElementById('scout-tool-photo').classList.add('hidden');
    event.target.classList.add('active');
  } else {
    document.getElementById('scout-tool-eval').classList.add('hidden');
    document.getElementById('scout-tool-photo').classList.remove('hidden');
    event.target.classList.add('active');
  }
}

function populatePlayerSelectOptions() {
  const select = document.getElementById('eval-target-player');
  select.innerHTML = '<option value="">-- Selecciona el jugador a evaluar --</option>';
  Object.keys(users).filter(id => users[id].role === 'DEPORTISTA').forEach(id => {
    select.innerHTML += `<option value="${id}">${users[id].name} (${users[id].position})</option>`;
  });
}

function handleCreatePost(event) {
  event.preventDefault();
  const newPost = {
    id: 'post-' + Date.now(),
    type: "VIDEO",
    authorId: activeUserId,
    title: document.getElementById('post-title').value,
    videoUrl: document.getElementById('post-video-url').value,
    description: document.getElementById('post-desc').value,
    createdAt: 'Hace un momento'
  };

  posts.unshift(newPost);
  saveState('posts', posts);
  event.target.reset();
  renderFeed();
}

function handleCreatePhotoPost(event) {
  event.preventDefault();
  const newPost = {
    id: 'post-' + Date.now(),
    type: "PHOTO",
    authorId: activeUserId,
    title: document.getElementById('photo-title').value,
    photoUrl: document.getElementById('photo-url').value,
    description: document.getElementById('photo-desc').value,
    createdAt: 'Hace un momento'
  };

  posts.unshift(newPost);
  saveState('posts', posts);
  event.target.reset();
  renderFeed();
}

function handleCreateEvaluation(event) {
  event.preventDefault();
  const playerId = document.getElementById('eval-target-player').value;
  if(!playerId) return alert('Por favor selecciona un jugador');

  const newEval = {
    id: 'eval-' + Date.now(),
    scoutId: activeUserId,
    playerId: playerId,
    pros: document.getElementById('eval-pros').value,
    cons: document.getElementById('eval-cons').value,
    notes: document.getElementById('eval-notes').value
  };

  evaluations.unshift(newEval);
  saveState('evaluations', evaluations);
  event.target.reset();
  alert('¡Informe técnico guardado!');
  renderFeed();
}

function filterFeedByPos(pos) {
  currentPosFilter = pos;
  renderFeed();
}

function renderFeed() {
  const container = document.getElementById('feed-container');
  container.innerHTML = '';

  let filteredPosts = posts;
  if(currentPosFilter !== 'ALL') {
    filteredPosts = posts.filter(p => {
      const author = users[p.authorId];
      return author && author.position.toLowerCase().includes(currentPosFilter.toLowerCase());
    });
  }

  filteredPosts.forEach(post => {
    const author = users[post.authorId] || { name: 'Desconocido', avatar: '', position: 'N/A' };
    const playerEvals = evaluations.filter(e => e.playerId === post.authorId);

    let mediaHtml = '';
    if(post.type === 'PHOTO') {
      mediaHtml = `<div class="photo-post-wrapper"><img src="${post.photoUrl}" class="photo-post-img"></div>`;
    } else {
      mediaHtml = `<div class="video-container"><iframe src="${post.videoUrl}" allowfullscreen></iframe></div>`;
    }

    let evalsHtml = '';
    if(playerEvals.length > 0) {
      evalsHtml = playerEvals.map(ev => {
        const scout = users[ev.scoutId] || { name: 'Ojeador' };
        return `
          <div class="eval-box">
            <strong style="color:#38bdf8;">📋 Informe de ${scout.name}:</strong>
            <p style="margin-top:4px;"><span style="color:#10b981;">✔ Puntos fuertes:</span> ${ev.pros}</p>
            <p><span style="color:#f43f5e;">✖ A mejorar:</span> ${ev.cons}</p>
            <p style="color:#94a3b8; font-style:italic; margin-top:2px;">"${ev.notes}"</p>
          </div>`;
      }).join('');
    }

    const postCard = document.createElement('article');
    postCard.className = "card";
    postCard.innerHTML = `
      <div class="card-header">
        <img src="${author.avatar}" class="avatar-img">
        <div>
          <h4 style="font-size:0.9rem;">${author.name} <span class="badge ${author.role==='SCOUT'?'badge-scout':''}">${author.position}</span></h4>
          <p style="font-size:0.75rem; color:#94a3b8;">${author.club || 'Libre'} • ${post.createdAt}</p>
        </div>
      </div>
      <h3>${post.title}</h3>
      <p style="font-size:0.85rem; color:#cbd5e1; margin:8px 0;">${post.description}</p>
      ${mediaHtml}
      ${evalsHtml}
    `;
    container.appendChild(postCard);
  });
}

function renderDirectory() {
  const grid = document.getElementById('athletes-grid');
  const searchVal = document.getElementById('search-athlete').value.toLowerCase();
  grid.innerHTML = '';

  Object.keys(users).forEach(id => {
    const u = users[id];
    if(u.name.toLowerCase().includes(searchVal) || u.position.toLowerCase().includes(searchVal)) {
      
      const currentUser = users[activeUserId];
      const hasScoutMessaged = messages.some(m => m.from === id && m.to === activeUserId);
      
      let actionButtonHtml = '';

      if(currentUser.role === 'DEPORTISTA' && u.role === 'SCOUT' && !hasScoutMessaged) {
        actionButtonHtml = `<button class="btn-secondary btn-disabled" style="width:100%; font-size:0.75rem;" disabled>🔒 Esperando primer mensaje del ojeador</button>`;
      } else if(id !== activeUserId) {
        actionButtonHtml = `<button onclick="openChatWith('${u.id}')" class="btn-primary" style="width:100%; font-size:0.8rem;">Iniciar Chat Privado</button>`;
      }

      const card = document.createElement('div');
      card.className = "card";
      card.innerHTML = `
        <div class="card-header">
          <img src="${u.avatar}" class="avatar-img" style="width:48px; height:48px;">
          <div>
            <h4>${u.name}</h4>
            <p style="color:${u.role==='SCOUT'?'#38bdf8':'#10b981'}; font-size:0.8rem;">${u.role} • ${u.position}</p>
          </div>
        </div>
        <p style="font-size:0.8rem; color:#cbd5e1; margin-bottom:12px;">${u.bio || 'Sin bibliografía'}</p>
        ${actionButtonHtml}
      `;
      grid.appendChild(card);
    }
  });
}

function openChatWith(targetUserId) {
  if(targetUserId === activeUserId) return;
  activeChatUserId = targetUserId;
  switchTab('chat');
}

function renderChatView() {
  const listContainer = document.getElementById('chat-list');
  listContainer.innerHTML = '';

  const currentUser = users[activeUserId];

  Object.keys(users).filter(id => id !== activeUserId).forEach(id => {
    const u = users[id];
    const hasScoutMessaged = messages.some(m => m.from === id && m.to === activeUserId);
    if(currentUser.role === 'DEPORTISTA' && u.role === 'SCOUT' && !hasScoutMessaged) {
      return;
    }

    const item = document.createElement('div');
    item.onclick = () => { activeChatUserId = id; renderChatView(); };
    item.className = `chat-user-item ${id === activeChatUserId ? 'active' : ''}`;
    item.innerHTML = `<img src="${u.avatar}" class="avatar-img" style="width:32px; height:32px;"> <div><div style="font-size:0.8rem; font-weight:bold;">${u.name}</div></div>`;
    listContainer.appendChild(item);
  });

  const targetUser = users[activeChatUserId];
  if(targetUser) {
    document.getElementById('chat-target-name').innerText = 'Chat con ' + targetUser.name;
  }

  const container = document.getElementById('chat-messages-container');
  container.innerHTML = '';

  const chatHistory = messages.filter(m => 
    (m.from === activeUserId && m.to === activeChatUserId) || (m.from === activeChatUserId && m.to === activeUserId)
  );

  chatHistory.forEach(msg => {
    const isMine = msg.from === activeUserId;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-bubble ${isMine ? 'msg-mine' : 'msg-other'}`;
    msgDiv.innerText = msg.text;
    container.appendChild(msgDiv);
  });
  container.scrollTop = container.scrollHeight;
}

function handleSendMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input-text');
  const text = input.value.trim();
  if(!text || !activeChatUserId) return;

  messages.push({ id: 'msg-' + Date.now(), from: activeUserId, to: activeChatUserId, text: text, timestamp: 'Ahora' });
  saveState('messages', messages);
  input.value = '';
  renderChatView();
}

function handleSendSupportTicket(event) {
  event.preventDefault();
  alert('¡Mensaje enviado a Soporte técnico! Te responderemos muy pronto.');
  event.target.reset();
  switchTab('feed');
}

function populateProfileForm() {
  const user = users[activeUserId];
  document.getElementById('edit-avatar-url').value = user.avatar;
  document.getElementById('edit-name').value = user.name;
  document.getElementById('edit-position').value = user.position;
  document.getElementById('edit-bio').value = user.bio || '';
}

function handleSaveProfile(event) {
  event.preventDefault();
  const user = users[activeUserId];
  user.avatar = document.getElementById('edit-avatar-url').value;
  user.name = document.getElementById('edit-name').value;
  user.position = document.getElementById('edit-position').value;
  user.bio = document.getElementById('edit-bio').value;

  saveState('users', users);
  updateUserHeaderUI();
  alert('¡Perfil guardado con éxito!');
}

window.addEventListener('DOMContentLoaded', () => {
  updateUserHeaderUI();
  switchTab('feed');
});