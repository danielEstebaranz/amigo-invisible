// ---------- Estado ----------
const STORAGE_KEY = "amigo-invisible:v1";
const MAX_LIKES = 5;

const defaultState = () => ({
  eventName: "",
  priceLimit: 20,
  participants: [], // { id, name, likes: string[5] }
  assignments: null, // { giverId: receiverId }
  revealed: {}, // { giverId: true } -> ya ha visto su resultado
  selectedProfile: null,
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (_) { /* almacenamiento no disponible */ }
  return defaultState();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}

const $ = (sel) => document.querySelector(sel);
const uid = () => Math.random().toString(36).slice(2, 10);
const byId = (id) => state.participants.find((p) => p.id === id);
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Sorteo ----------
function randomInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genera una permutación sin puntos fijos (nadie se regala a sí mismo).
function drawAssignments(ids) {
  for (;;) {
    const receivers = shuffle(ids);
    if (receivers.every((r, i) => r !== ids[i])) {
      return Object.fromEntries(ids.map((id, i) => [id, receivers[i]]));
    }
  }
}

function resetDraw() {
  state.assignments = null;
  state.revealed = {};
}

// ---------- Pestañas ----------
document.querySelectorAll(".tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".panel").forEach((p) =>
      p.classList.toggle("active", p.id === `tab-${btn.dataset.tab}`)
    );
    render();
  })
);

// ---------- Grupo ----------
$("#event-name").addEventListener("input", (e) => {
  state.eventName = e.target.value;
  save();
  renderHeader();
});

$("#price-limit").addEventListener("input", (e) => {
  const v = Math.max(1, Math.min(1000, Number(e.target.value) || 0));
  if (!e.target.value) return;
  state.priceLimit = v;
  save();
  renderHeader();
  renderPresets();
});

$("#price-presets").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-price]");
  if (!chip) return;
  state.priceLimit = Number(chip.dataset.price);
  $("#price-limit").value = state.priceLimit;
  save();
  renderHeader();
  renderPresets();
});

$("#add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#new-name");
  const name = input.value.trim();
  if (!name) return;
  if (state.participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    toast("Ese nombre ya está en el grupo");
    return;
  }
  const p = { id: uid(), name, likes: Array(MAX_LIKES).fill("") };
  state.participants.push(p);
  if (state.assignments) {
    resetDraw();
    toast("Se ha reiniciado el sorteo al cambiar el grupo");
  }
  if (!state.selectedProfile) state.selectedProfile = p.id;
  input.value = "";
  save();
  render();
});

$("#participant-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  const id = btn.dataset.remove;
  const p = byId(id);
  if (!confirm(`¿Quitar a ${p.name} del grupo?`)) return;
  state.participants = state.participants.filter((x) => x.id !== id);
  if (state.selectedProfile === id) state.selectedProfile = state.participants[0]?.id || null;
  if (state.assignments) {
    resetDraw();
    toast("Se ha reiniciado el sorteo al cambiar el grupo");
  }
  save();
  render();
});

function renderPresets() {
  document.querySelectorAll("#price-presets .chip").forEach((c) =>
    c.classList.toggle("active", Number(c.dataset.price) === state.priceLimit)
  );
}

function renderGroup() {
  $("#event-name").value = state.eventName;
  $("#price-limit").value = state.priceLimit;
  renderPresets();

  const n = state.participants.length;
  $("#participant-count").textContent = n ? `(${n})` : "";
  $("#participant-list").innerHTML = state.participants
    .map((p) => {
      const filled = p.likes.filter((l) => l.trim()).length;
      return `
        <li class="list-item">
          <span class="avatar">${escapeHtml(p.name[0].toUpperCase())}</span>
          <div class="grow">
            <strong>${escapeHtml(p.name)}</strong>
            <small class="${filled === MAX_LIKES ? "ok" : "muted"}">${filled}/${MAX_LIKES} gustos</small>
          </div>
          <button class="icon-btn" data-remove="${p.id}" title="Quitar">✕</button>
        </li>`;
    })
    .join("");

  $("#group-hint").textContent =
    n === 0 ? "Añade al menos 3 personas para poder sortear." :
    n < 3 ? `Faltan ${3 - n} persona(s) más para poder sortear.` :
    "¡Listo! Pide a cada uno que rellene su perfil y ve a la pestaña Sorteo.";
}

// ---------- Perfil ----------
$("#profile-select").addEventListener("change", (e) => {
  state.selectedProfile = e.target.value;
  save();
  renderProfile();
});

$("#profile-body").addEventListener("input", (e) => {
  const p = byId(state.selectedProfile);
  if (!p) return;
  if (e.target.dataset.like !== undefined) {
    p.likes[Number(e.target.dataset.like)] = e.target.value;
    save();
    renderProfileRecs();
    updateLikesCounter();
  }
});

$("#profile-body").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-suggest]");
  if (!chip) return;
  const p = byId(state.selectedProfile);
  const label = chip.dataset.suggest;
  if (p.likes.some((l) => normalize(l) === normalize(label))) return toast("Ya está en tus gustos");
  const idx = p.likes.findIndex((l) => !l.trim());
  if (idx === -1) return toast(`Ya tienes ${MAX_LIKES} gustos; borra uno para cambiarlo`);
  p.likes[idx] = label;
  save();
  renderProfile();
});

function updateLikesCounter() {
  const p = byId(state.selectedProfile);
  const el = $("#likes-counter");
  if (!p || !el) return;
  const filled = p.likes.filter((l) => l.trim()).length;
  el.textContent = `${filled}/${MAX_LIKES}`;
  el.classList.toggle("ok", filled === MAX_LIKES);
}

function renderProfile() {
  const sel = $("#profile-select");
  if (!state.participants.length) {
    sel.innerHTML = "";
    sel.disabled = true;
    $("#profile-body").innerHTML = `<p class="empty">Primero añade participantes en la pestaña <b>Grupo</b>.</p>`;
    $("#profile-recs-card").hidden = true;
    return;
  }
  if (!byId(state.selectedProfile)) state.selectedProfile = state.participants[0].id;
  sel.disabled = false;
  sel.innerHTML = state.participants
    .map((p) => `<option value="${p.id}" ${p.id === state.selectedProfile ? "selected" : ""}>${escapeHtml(p.name)}</option>`)
    .join("");

  const p = byId(state.selectedProfile);
  $("#profile-body").innerHTML = `
    <div class="likes-head">
      <h3>Mis 5 gustos</h3>
      <span class="pill" id="likes-counter"></span>
    </div>
    <div class="likes">
      ${p.likes
        .map(
          (l, i) => `
        <label class="like-input">
          <span class="num">${i + 1}</span>
          <input type="text" maxlength="40" data-like="${i}" value="${escapeHtml(l)}"
            placeholder="${["Ej: café", "Ej: senderismo", "Ej: videojuegos", "Ej: leer novelas", "Ej: gatos"][i]}">
        </label>`
        )
        .join("")}
    </div>
    <p class="hint">Ideas rápidas (toca para añadir):</p>
    <div class="chips wrap">
      ${CATALOG.map((c) => `<button type="button" class="chip" data-suggest="${escapeHtml(c.label)}">${c.emoji} ${escapeHtml(c.label)}</button>`).join("")}
    </div>`;
  updateLikesCounter();
  renderProfileRecs();
}

function recsHtml(likes) {
  const filled = likes.filter((l) => l.trim());
  if (!filled.length) return `<p class="empty">Añade gustos para ver recomendaciones.</p>`;
  const { items, overBudget } = getRecommendations(filled, state.priceLimit);
  if (!items.length) {
    return `<p class="empty">No hay ideas dentro de ${state.priceLimit} €. Prueba a subir el límite de precio.</p>`;
  }
  return `
    <ul class="recs">
      ${items
        .slice(0, 10)
        .map(
          (i) => `
        <li class="rec">
          <span class="rec-emoji">${i.emoji}</span>
          <div class="grow">
            <strong>${escapeHtml(i.name)}</strong>
            <small>Porque le gusta: ${escapeHtml(i.reason)}</small>
          </div>
          <div class="rec-side">
            <span class="price">~${i.price} €</span>
            <a class="search" target="_blank" rel="noopener"
               href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(i.name)}">Buscar ↗</a>
          </div>
        </li>`
        )
        .join("")}
    </ul>
    ${overBudget ? `<p class="hint">${overBudget} idea(s) más quedan fuera del límite de ${state.priceLimit} €.</p>` : ""}`;
}

function renderProfileRecs() {
  const p = byId(state.selectedProfile);
  const card = $("#profile-recs-card");
  if (!p) return (card.hidden = true);
  card.hidden = false;
  $("#profile-recs").innerHTML = recsHtml(p.likes);
}

// ---------- Sorteo (pestaña) ----------
function renderDraw() {
  const card = $("#draw-card");
  const n = state.participants.length;

  if (n < 3) {
    card.innerHTML = `
      <h2>Sorteo</h2>
      <p class="empty">Necesitas al menos 3 participantes (ahora hay ${n}).</p>`;
    return;
  }

  if (!state.assignments) {
    const incomplete = state.participants.filter((p) => p.likes.filter((l) => l.trim()).length < MAX_LIKES);
    card.innerHTML = `
      <h2>Sorteo</h2>
      <p>${n} participantes · límite <b>${state.priceLimit} €</b></p>
      ${incomplete.length ? `<p class="warn">⚠️ Aún no han completado sus 5 gustos: ${incomplete.map((p) => escapeHtml(p.name)).join(", ")}. Puedes sortear igualmente; las recomendaciones se actualizarán cuando los rellenen.</p>` : ""}
      <button class="btn primary big" id="do-draw">🎲 Hacer el sorteo</button>`;
    $("#do-draw").addEventListener("click", () => {
      state.assignments = drawAssignments(state.participants.map((p) => p.id));
      state.revealed = {};
      save();
      renderDraw();
      toast("¡Sorteo realizado!");
    });
    return;
  }

  const seen = Object.keys(state.revealed).length;
  card.innerHTML = `
    <h2>¡Sorteo hecho! 🎉</h2>
    <p>Pasa el dispositivo: cada persona toca su nombre para ver en secreto a quién regala.</p>
    <div class="progress"><div style="width:${(seen / n) * 100}%"></div></div>
    <p class="hint">${seen} de ${n} ya han visto su amigo invisible.</p>
    <ul class="list">
      ${state.participants
        .map(
          (p) => `
        <li class="list-item">
          <span class="avatar">${escapeHtml(p.name[0].toUpperCase())}</span>
          <strong class="grow">${escapeHtml(p.name)}</strong>
          ${state.revealed[p.id] ? `<span class="pill ok">Visto</span>` : ""}
          <button class="btn" data-reveal="${p.id}">Ver el mío</button>
        </li>`
        )
        .join("")}
    </ul>
    <button class="btn danger" id="reset-draw">Repetir sorteo</button>`;

  card.querySelectorAll("[data-reveal]").forEach((b) =>
    b.addEventListener("click", () => openReveal(b.dataset.reveal))
  );
  $("#reset-draw").addEventListener("click", () => {
    if (!confirm("Se perderán las asignaciones actuales. ¿Repetir el sorteo?")) return;
    resetDraw();
    save();
    renderDraw();
  });
}

function openReveal(giverId) {
  const giver = byId(giverId);
  const dlg = $("#reveal-dialog");
  const content = $("#reveal-content");

  content.innerHTML = `
    <h2>¿Eres ${escapeHtml(giver.name)}?</h2>
    <p>Asegúrate de que nadie más está mirando la pantalla 👀</p>
    <div class="row">
      <button class="btn" data-close>Cancelar</button>
      <button class="btn primary" id="confirm-reveal">Sí, mostrar</button>
    </div>`;
  dlg.showModal();

  $("#confirm-reveal").addEventListener("click", () => {
    const receiver = byId(state.assignments[giverId]);
    const likes = receiver.likes.filter((l) => l.trim());
    state.revealed[giverId] = true;
    save();
    content.innerHTML = `
      <p class="muted center">${escapeHtml(giver.name)}, tu amigo invisible es…</p>
      <div class="reveal-name">🎁 ${escapeHtml(receiver.name)}</div>
      <p class="center">Presupuesto máximo: <b>${state.priceLimit} €</b></p>
      <h3>Sus gustos</h3>
      ${likes.length ? `<div class="chips wrap">${likes.map((l) => `<span class="chip static">${escapeHtml(l)}</span>`).join("")}</div>` : `<p class="empty">Todavía no ha rellenado su perfil.</p>`}
      <h3>Recomendaciones para ${escapeHtml(receiver.name)}</h3>
      ${recsHtml(receiver.likes)}
      <button class="btn primary full" data-close>Ocultar y pasar el dispositivo</button>`;
  });
}

$("#reveal-dialog").addEventListener("click", (e) => {
  if (e.target.closest("[data-close]") || e.target.id === "reveal-dialog") {
    $("#reveal-dialog").close();
    renderDraw();
  }
});

// ---------- Render ----------
function renderHeader() {
  const title = state.eventName.trim() || "Amigo Invisible";
  $("#event-title").textContent = title;
  document.title = title;
  $("#budget-badge").textContent = `Límite de precio: ${state.priceLimit} €`;
}

function render() {
  renderHeader();
  renderGroup();
  renderProfile();
  renderDraw();
}

render();
