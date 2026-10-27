import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const db = getFirestore(initializeApp(firebaseConfig));

const MAX_LIKES = 5;
const SESSION_KEY = "amigo-invisible:session";
const THEME_KEY = "amigo-invisible:theme";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// ---------- Utilidades ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function randomInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}
const randomString = (n, alphabet = CODE_ALPHABET) =>
  Array.from({ length: n }, () => alphabet[randomInt(alphabet.length)]).join("");

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
}
function writeJson(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

// ---------- Iconos (trazos estilo Lucide) ----------
const ICONS = {
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4M2 6h1.9c1.5 0 2.9.9 3.6 2.2M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zM5 20h14"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
};
const icon = (name) =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => {
    if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon);
  });
}

// ---------- Tema ----------
function applyTheme() {
  const saved = readJson(THEME_KEY);
  if (saved) document.documentElement.dataset.theme = saved;
  else delete document.documentElement.dataset.theme;
  const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  $$(".theme-toggle").forEach((b) => {
    b.innerHTML = b.classList.contains("nav-item")
      ? `${icon(dark ? "sun" : "moon")}<span>${dark ? "Tema claro" : "Tema oscuro"}</span>`
      : icon(dark ? "sun" : "moon");
  });
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".theme-toggle")) return;
  const isDark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  writeJson(THEME_KEY, isDark ? "light" : "dark");
  applyTheme();
});

// ---------- Cifrado: solo el móvil de cada persona puede leer su asignación ----------
const RSA = { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function createKeys() {
  const pair = await crypto.subtle.generateKey(RSA, true, ["encrypt", "decrypt"]);
  return {
    publicJwk: await crypto.subtle.exportKey("jwk", pair.publicKey),
    privateJwk: await crypto.subtle.exportKey("jwk", pair.privateKey),
  };
}
async function encryptFor(publicJwk, text) {
  const key = await crypto.subtle.importKey("jwk", publicJwk, RSA, false, ["encrypt"]);
  return b64(await crypto.subtle.encrypt(RSA, key, new TextEncoder().encode(text)));
}
async function decryptWith(privateJwk, cipher) {
  const key = await crypto.subtle.importKey("jwk", privateJwk, RSA, false, ["decrypt"]);
  return new TextDecoder().decode(await crypto.subtle.decrypt(RSA, key, unb64(cipher)));
}

// ---------- Estado ----------
// session: { code, memberId, privateJwk, isAdmin } guardada solo en este dispositivo.
let session = readJson(SESSION_KEY);
let group = null;
let members = [];
let receiverId = null;
let revealed = false;
let unsubs = [];
let activeTab = "grupo";

const me = () => members.find((m) => m.id === session?.memberId);
const memberById = (id) => members.find((m) => m.id === id);
const groupRef = (code) => doc(db, "groups", code);
const membersCol = (code) => collection(db, "groups", code, "members");
const assignmentRef = (code, id) => doc(db, "groups", code, "assignments", id);
const inviteUrl = (code) => `${location.origin}${location.pathname}?g=${code}`;

function showView(id) {
  $$(".view").forEach((v) => (v.hidden = v.id !== id));
}

// ---------- Inicio: crear / unirse ----------
function showForm(id) {
  $("#create-form").hidden = id !== "create-form";
  $("#join-form").hidden = id !== "join-form";
}
$$("[data-show]").forEach((b) => b.addEventListener("click", () => showForm(b.dataset.show)));

$("#join-code").addEventListener("input", (e) => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

async function setBusy(form, busy) {
  const btn = $("button[type=submit]", form);
  btn.disabled = busy;
  btn.classList.toggle("busy", busy);
}

const newMemberId = () => randomString(10, "abcdefghijkmnopqrstuvwxyz23456789");

async function addMember(code, name, isAdmin, memberId = newMemberId()) {
  const { publicJwk, privateJwk } = await createKeys();
  await setDoc(doc(membersCol(code), memberId), {
    name,
    likes: Array(MAX_LIKES).fill(""),
    publicKey: JSON.stringify(publicJwk),
    joinedAt: serverTimestamp(),
  });
  session = { code, memberId, privateJwk, isAdmin };
  writeJson(SESSION_KEY, session);
}

$("#create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const name = $("#create-name").value.trim();
  const eventName = $("#create-event").value.trim();
  const price = Math.round(Number($("#create-price").value));
  if (!name || !eventName || !(price >= 1 && price <= 1000)) return;
  setBusy(form, true);
  try {
    let code;
    do code = randomString(6);
    while ((await getDoc(groupRef(code))).exists());
    // El organizador se identifica por el id de su ficha de participante.
    const adminId = newMemberId();
    await setDoc(groupRef(code), { name: eventName, priceLimit: price, drawn: false, adminId, createdAt: serverTimestamp() });
    await addMember(code, name, true, adminId);
    history.replaceState(null, "", inviteUrl(code));
    enterGroup();
    toast("Grupo creado. Comparte el enlace con los demás");
  } catch (err) {
    console.error(err);
    toast("No se ha podido crear el grupo. Revisa tu conexión");
  } finally {
    setBusy(form, false);
  }
});

$("#join-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const code = $("#join-code").value.trim().toUpperCase();
  const name = $("#join-name").value.trim();
  if (code.length !== 6 || !name) return toast("Escribe el código de 6 caracteres y tu nombre");
  setBusy(form, true);
  try {
    const g = await getDoc(groupRef(code));
    if (!g.exists()) return toast("No existe ningún grupo con ese código");
    if (g.data().drawn) return toast("Este grupo ya ha hecho el sorteo; pide al organizador que lo repita");
    const existing = await getDocs(membersCol(code));
    if (existing.docs.some((d) => d.data().name.toLowerCase() === name.toLowerCase())) {
      return toast("Ya hay alguien con ese nombre en el grupo. Añade tu apellido o inicial");
    }
    await addMember(code, name, false);
    history.replaceState(null, "", inviteUrl(code));
    enterGroup();
    toast(`Bienvenido/a a ${g.data().name}`);
  } catch (err) {
    console.error(err);
    toast("No se ha podido entrar. Revisa tu conexión");
  } finally {
    setBusy(form, false);
  }
});

async function prepareJoin(code) {
  showForm("join-form");
  $("#join-code").value = code;
  try {
    const g = await getDoc(groupRef(code));
    if (g.exists()) {
      $("#join-group-name").textContent = g.data().name;
      $("#join-group-info").textContent = `Límite de precio: ${g.data().priceLimit} €`;
      $("#join-name").focus();
    } else {
      $("#join-group-info").textContent = "Ese enlace no corresponde a ningún grupo.";
    }
  } catch (_) {}
}

// ---------- Grupo en tiempo real ----------
function stopListening() {
  unsubs.forEach((u) => u());
  unsubs = [];
}

function enterGroup() {
  stopListening();
  group = null;
  members = [];
  receiverId = null;
  revealed = false;
  showView("view-loading");
  const { code } = session;

  unsubs.push(onSnapshot(groupRef(code), (snap) => {
    if (!snap.exists()) {
      toast("Este grupo ya no existe");
      return leaveGroup();
    }
    group = snap.data();
    if (!group.drawn) { receiverId = null; revealed = false; }
    render();
  }, onListenError));

  unsubs.push(onSnapshot(membersCol(code), (snap) => {
    members = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0));
    if (pendingLikes && me()) me().likes = [...pendingLikes];
    if (group && !me()) {
      toast("El organizador te ha quitado del grupo");
      return leaveGroup();
    }
    render();
  }, onListenError));

  unsubs.push(onSnapshot(assignmentRef(code, session.memberId), async (snap) => {
    if (!snap.exists()) { receiverId = null; return render(); }
    try {
      receiverId = await decryptWith(session.privateJwk, snap.data().cipher);
    } catch (_) {
      receiverId = "?";
    }
    render();
  }, onListenError));
}

function onListenError(err) {
  console.error(err);
  toast("Sin conexión con el servidor");
}

function leaveGroup() {
  stopListening();
  session = null;
  writeJson(SESSION_KEY, null);
  history.replaceState(null, "", location.pathname);
  showForm("create-form");
  showView("view-home");
}

$$(".leave-btn").forEach((b) => b.addEventListener("click", () => {
  if (confirm("Saldrás del grupo en este dispositivo. Si ya se ha hecho el sorteo, guarda antes tu enlace personal para poder volver.")) leaveGroup();
}));

// ---------- Navegación ----------
$$(".nav-item[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    activeTab = b.dataset.tab;
    render();
    window.scrollTo({ top: 0 });
  })
);

// ---------- Render ----------
function render() {
  if (!session || !group) return;
  const mine = me();
  if (!mine) return;
  showView("view-group");

  $$(".nav-item[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === activeTab));
  $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${activeTab}`));

  document.title = `${group.name} · Amigo Invisible`;
  $("#group-title").textContent = group.name;
  $("#me-label").textContent = `Hola, ${mine.name}`;
  $("#price-tag").innerHTML = `${icon("wallet")} Hasta ${group.priceLimit} €`;
  $("#code-tag").innerHTML = `${icon("lock")} ${session.code}`;
  $("#status-tag").innerHTML = group.drawn
    ? `${icon("check")} Sorteo hecho`
    : `${icon("clock")} ${members.length} apuntados`;
  $("#status-tag").classList.toggle("success", !!group.drawn);

  if (activeTab === "grupo") renderGroupTab();
  if (activeTab === "perfil") renderProfileTab();
  if (activeTab === "amigo") renderFriendTab();
}

const isAdmin = () => session.isAdmin && group.adminId === session.memberId;
const filledLikes = (m) => (m.likes || []).filter((l) => l && l.trim());

function renderGroupTab() {
  const panel = $("#tab-grupo");
  const admin = isAdmin();
  const n = members.length;
  const url = inviteUrl(session.code);
  const pending = members.filter((m) => filledLikes(m).length < MAX_LIKES);

  panel.innerHTML = `
    <div class="grid two">
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>Invita al grupo</h2></div>
          <p class="muted">Manda este enlace. Cada persona entra desde su móvil y se apunta con su nombre.</p>
          <div class="code-box">
            <span class="mono code-big">${session.code}</span>
            <button class="btn ghost sm" data-action="copy-link">${icon("copy")} Copiar enlace</button>
          </div>
          <div class="row">
            <button class="btn primary" data-action="share">${icon("share")} Compartir</button>
            <a class="btn ghost" target="_blank" rel="noopener"
               href="https://wa.me/?text=${encodeURIComponent(`Únete a nuestro amigo invisible "${group.name}" (máx. ${group.priceLimit} €): ${url}`)}">WhatsApp</a>
          </div>
        </div>

        ${admin ? `
        <div class="card">
          <div class="card-head"><h2>Organización</h2><span class="tag accent">${icon("crown")} Organizas tú</span></div>
          <label class="field"><span>Límite de precio</span>
            <div class="price-row">
              <div class="price-input"><input id="price-edit" type="number" min="1" max="1000" value="${group.priceLimit}"><span>€</span></div>
              ${[10, 20, 30, 50].map((p) => `<button type="button" class="chip ${p === group.priceLimit ? "active" : ""}" data-price="${p}">${p} €</button>`).join("")}
            </div>
          </label>
          ${group.drawn ? `
            <p class="success-text">${icon("check")} Sorteo hecho. Cada persona ya puede ver a quién regala en «Mi amigo».</p>
            <button class="btn ghost danger" data-action="reset">${icon("shuffle")} Repetir el sorteo</button>
          ` : n < 3 ? `
            <p class="muted">Hacen falta al menos 3 personas para sortear (ahora hay ${n}).</p>
          ` : `
            ${pending.length ? `<p class="warn">Aún no han completado sus 5 gustos: ${pending.map((m) => escapeHtml(m.name)).join(", ")}. Puedes sortear igualmente: las ideas se actualizarán cuando los rellenen.</p>` : ""}
            <p class="muted">Al sortear se cierra el grupo: nadie más podrá apuntarse.</p>
            <button class="btn primary full lg" data-action="draw">${icon("shuffle")} Hacer el sorteo</button>
          `}
        </div>` : `
        <div class="card">
          <div class="card-head"><h2>Sorteo</h2></div>
          <p class="muted">${group.drawn
            ? `${icon("check")} Ya se ha hecho. Ve a <b>Mi amigo</b> para descubrir a quién regalas.`
            : `${icon("clock")} Esperando a que ${escapeHtml(memberById(group.adminId)?.name || "el organizador")} haga el sorteo. Mientras, completa tus 5 gustos en <b>Mi perfil</b>.`}</p>
          ${group.drawn ? `<button class="btn primary" data-tab-go="amigo">${icon("gift")} Ver mi amigo invisible</button>` : `<button class="btn ghost" data-tab-go="perfil">${icon("user")} Completar mi perfil</button>`}
        </div>`}
      </div>

      <div class="card">
        <div class="card-head"><h2>Participantes</h2><span class="tag">${n}</span></div>
        <ul class="members">
          ${members.map((m, i) => {
            const f = filledLikes(m).length;
            return `
            <li style="--i:${i}">
              <span class="avatar">${escapeHtml(m.name[0].toUpperCase())}</span>
              <div class="grow">
                <b>${escapeHtml(m.name)}${m.id === session.memberId ? " <span class=\"muted\">(tú)</span>" : ""}</b>
                <div class="progress-line"><div style="width:${(f / MAX_LIKES) * 100}%"></div></div>
                <small class="${f === MAX_LIKES ? "success-text" : "muted"}">${f}/${MAX_LIKES} gustos${m.id === group.adminId ? " · organiza" : ""}</small>
              </div>
              ${admin && !group.drawn && m.id !== session.memberId
                ? `<button class="icon-btn" data-remove="${m.id}" aria-label="Quitar a ${escapeHtml(m.name)}">${icon("x")}</button>` : ""}
            </li>`;
          }).join("")}
        </ul>
      </div>
    </div>`;
}

let likesTimer = null;
let pendingLikes = null; // gustos escritos que aún no se han guardado
function renderProfileTab() {
  const panel = $("#tab-perfil");
  const mine = me();
  // No rehacer los campos mientras se escribe, para no perder el foco.
  if (panel.contains(document.activeElement) && document.activeElement.matches("[data-like]")) {
    renderProfileRecs();
    return;
  }
  const examples = ["café", "senderismo", "videojuegos", "leer novelas", "gatos"];
  panel.innerHTML = `
    <div class="grid two">
      <div class="card">
        <div class="card-head"><h2>Mis 5 gustos</h2><span class="tag" id="likes-count"></span></div>
        <p class="muted">Tu amigo invisible los verá para acertar con el regalo.</p>
        <div class="likes">
          ${mine.likes.map((l, i) => `
            <label class="like-input">
              <span class="num">${i + 1}</span>
              <input type="text" maxlength="40" data-like="${i}" value="${escapeHtml(l)}" placeholder="Ej.: ${examples[i]}">
            </label>`).join("")}
        </div>
        <p class="label">Ideas rápidas</p>
        <div class="chips">
          ${CATALOG.map((c) => `<button type="button" class="chip" data-suggest="${escapeHtml(c.label)}">${escapeHtml(c.label)}</button>`).join("")}
        </div>
        <details class="recover">
          <summary>${icon("link")} Usar mi perfil en otro dispositivo</summary>
          <p class="muted">Este enlace personal te devuelve a tu perfil y a tu resultado desde otro móvil o navegador. No lo compartas: quien lo tenga verá a quién regalas.</p>
          <button class="btn ghost sm" data-action="copy-access">${icon("copy")} Copiar mi enlace personal</button>
        </details>
      </div>
      <div class="card">
        <div class="card-head"><h2>Ideas para regalarte</h2><span class="tag">${icon("wallet")} Hasta ${group.priceLimit} €</span></div>
        <p class="muted">Así verá tu amigo invisible las recomendaciones según tus gustos.</p>
        <div id="profile-recs"></div>
      </div>
    </div>`;
  updateLikesCount();
  renderProfileRecs();
}

function updateLikesCount() {
  const el = $("#likes-count");
  if (!el) return;
  const f = filledLikes(me()).length;
  el.textContent = `${f}/${MAX_LIKES}`;
  el.classList.toggle("success", f === MAX_LIKES);
}

function renderProfileRecs() {
  const el = $("#profile-recs");
  if (el) el.innerHTML = recsHtml(me().likes);
}

function saveLikesSoon() {
  pendingLikes = [...me().likes];
  clearTimeout(likesTimer);
  likesTimer = setTimeout(() => {
    const likes = pendingLikes;
    pendingLikes = null;
    updateDoc(doc(membersCol(session.code), session.memberId), { likes })
      .catch(() => toast("No se han podido guardar tus gustos"));
  }, 500);
}

function recsHtml(likes) {
  const filled = (likes || []).filter((l) => l && l.trim());
  if (!filled.length) {
    return `<div class="empty">${icon("sparkles")}<p>Cuando haya gustos apuntados, aquí aparecerán ideas de regalo.</p></div>`;
  }
  const { items, overBudget } = getRecommendations(filled, group.priceLimit);
  if (!items.length) {
    return `<div class="empty">${icon("wallet")}<p>No hay ideas dentro de ${group.priceLimit} €.</p></div>`;
  }
  return `
    <ul class="recs">
      ${items.slice(0, 10).map((i, n) => `
        <li class="rec" style="--i:${n}">
          <div class="grow">
            <b>${escapeHtml(i.name)}</b>
            <small><span class="tag tiny">${escapeHtml(i.category)}</span> porque le gusta ${escapeHtml(i.reason)}</small>
          </div>
          <div class="rec-side">
            <span class="price">~${i.price} €</span>
            <a class="search" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(i.name)}">${icon("search")} Buscar</a>
          </div>
        </li>`).join("")}
    </ul>
    ${overBudget ? `<p class="muted small">${overBudget} idea(s) más quedan por encima del límite.</p>` : ""}`;
}

function renderFriendTab() {
  const panel = $("#tab-amigo");
  if (!group.drawn) {
    panel.innerHTML = `
      <div class="card narrow center">
        <div class="empty">${icon("clock")}
          <h2>Aún no se ha hecho el sorteo</h2>
          <p>Cuando ${escapeHtml(memberById(group.adminId)?.name || "el organizador")} lo haga, aquí verás a quién regalas. Solo tú podrás verlo.</p>
        </div>
      </div>`;
    return;
  }
  if (!receiverId) {
    panel.innerHTML = `<div class="card narrow"><div class="skeleton" style="height:28px;width:60%"></div><div class="skeleton" style="height:16px;width:80%"></div></div>`;
    return;
  }
  const receiver = memberById(receiverId);
  if (!receiver) {
    panel.innerHTML = `
      <div class="card narrow center"><div class="empty">${icon("lock")}
        <h2>No se puede leer tu resultado</h2>
        <p>Este dispositivo no tiene tu clave. Abre tu enlace personal desde el móvil con el que te apuntaste, o pide al organizador que repita el sorteo.</p>
      </div></div>`;
    return;
  }
  if (!revealed) {
    panel.innerHTML = `
      <div class="card narrow center reveal-card">
        <div class="gift-art">${icon("gift")}</div>
        <h2>Tu amigo invisible está listo</h2>
        <p class="muted">Asegúrate de que nadie está mirando la pantalla.</p>
        <button class="btn primary lg" data-action="reveal">${icon("eye")} Descubrir a quién regalo</button>
      </div>`;
    return;
  }
  const likes = filledLikes(receiver);
  panel.innerHTML = `
    <div class="grid two">
      <div class="card reveal-card">
        <p class="eyebrow">Regalas a</p>
        <div class="reveal-name">${escapeHtml(receiver.name)}</div>
        <p class="muted">${icon("wallet")} Presupuesto máximo: <b>${group.priceLimit} €</b></p>
        <p class="label">Sus gustos</p>
        ${likes.length
          ? `<div class="chips">${likes.map((l) => `<span class="chip static">${escapeHtml(l)}</span>`).join("")}</div>`
          : `<p class="muted">Todavía no ha apuntado sus gustos. Las ideas aparecerán en cuanto lo haga.</p>`}
        <button class="btn ghost sm" data-action="hide">${icon("eye")} Ocultar</button>
      </div>
      <div class="card">
        <div class="card-head"><h2>Ideas para ${escapeHtml(receiver.name)}</h2></div>
        ${recsHtml(receiver.likes)}
      </div>
    </div>`;
}

// ---------- Acciones ----------
document.addEventListener("input", (e) => {
  if (!e.target.matches("[data-like]") || !session) return;
  me().likes[Number(e.target.dataset.like)] = e.target.value;
  updateLikesCount();
  renderProfileRecs();
  saveLikesSoon();
});

document.addEventListener("change", (e) => {
  if (e.target.id !== "price-edit") return;
  const v = Math.round(Number(e.target.value));
  if (v >= 1 && v <= 1000) updateDoc(groupRef(session.code), { priceLimit: v });
  else toast("El límite debe estar entre 1 y 1000 €");
});

document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action], [data-price], [data-suggest], [data-remove], [data-tab-go]");
  if (!el || !session) return;

  if (el.dataset.tabGo) {
    activeTab = el.dataset.tabGo;
    return render();
  }
  if (el.dataset.price) {
    return updateDoc(groupRef(session.code), { priceLimit: Number(el.dataset.price) });
  }
  if (el.dataset.suggest) {
    const mine = me();
    const label = el.dataset.suggest;
    if (mine.likes.some((l) => normalize(l) === normalize(label))) return toast("Ya está en tus gustos");
    const idx = mine.likes.findIndex((l) => !l.trim());
    if (idx === -1) return toast(`Ya tienes ${MAX_LIKES} gustos. Borra uno para cambiarlo`);
    mine.likes[idx] = label;
    document.activeElement?.blur();
    renderProfileTab();
    return saveLikesSoon();
  }
  if (el.dataset.remove) {
    const m = memberById(el.dataset.remove);
    if (confirm(`¿Quitar a ${m.name} del grupo?`)) await deleteDoc(doc(membersCol(session.code), m.id));
    return;
  }

  switch (el.dataset.action) {
    case "copy-link":
      await navigator.clipboard.writeText(inviteUrl(session.code));
      return toast("Enlace copiado");
    case "share":
      if (navigator.share) {
        return navigator.share({ title: group.name, text: `Únete a nuestro amigo invisible (máx. ${group.priceLimit} €)`, url: inviteUrl(session.code) }).catch(() => {});
      }
      await navigator.clipboard.writeText(inviteUrl(session.code));
      return toast("Enlace copiado");
    case "copy-access": {
      const token = btoa(unescape(encodeURIComponent(JSON.stringify(session))));
      await navigator.clipboard.writeText(`${inviteUrl(session.code)}#acceso=${token}`);
      return toast("Enlace personal copiado. Guárdalo en privado");
    }
    case "draw":
      return doDraw(el);
    case "reset":
      if (!confirm("Se borrarán las asignaciones actuales y se podrá volver a sortear. ¿Seguir?")) return;
      return resetDraw();
    case "reveal":
      revealed = true;
      return render();
    case "hide":
      revealed = false;
      return render();
  }
});

// Permutación aleatoria sin puntos fijos: nadie se regala a sí mismo.
function derangement(ids) {
  for (;;) {
    const r = [...ids];
    for (let i = r.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [r[i], r[j]] = [r[j], r[i]];
    }
    if (r.every((x, i) => x !== ids[i])) return r;
  }
}

async function doDraw(btn) {
  btn.disabled = true;
  try {
    const snap = await getDocs(membersCol(session.code));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (list.length < 3) return toast("Hacen falta al menos 3 personas");
    const ids = list.map((m) => m.id);
    const receivers = derangement(ids);
    const batch = writeBatch(db);
    batch.update(groupRef(session.code), { drawn: true });
    for (let i = 0; i < list.length; i++) {
      const cipher = await encryptFor(JSON.parse(list[i].publicKey), receivers[i]);
      batch.set(assignmentRef(session.code, ids[i]), { cipher });
    }
    await batch.commit();
    toast("Sorteo hecho. Ya podéis ver vuestro amigo invisible");
  } catch (err) {
    console.error(err);
    toast("No se ha podido hacer el sorteo");
    btn.disabled = false;
  }
}

async function resetDraw() {
  const batch = writeBatch(db);
  members.forEach((m) => batch.delete(assignmentRef(session.code, m.id)));
  batch.update(groupRef(session.code), { drawn: false });
  await batch.commit();
  toast("Sorteo anulado. Ya se puede repetir");
}

// ---------- Arranque ----------
function importAccessLink() {
  const m = location.hash.match(/acceso=([^&]+)/);
  if (!m) return;
  try {
    const s = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if (s.code && s.memberId && s.privateJwk) {
      session = s;
      writeJson(SESSION_KEY, s);
      toast("Perfil recuperado en este dispositivo");
    }
  } catch (_) {
    toast("El enlace personal no es válido");
  }
  history.replaceState(null, "", location.pathname + location.search);
}

hydrateIcons();
applyTheme();
importAccessLink();

const urlCode = new URLSearchParams(location.search).get("g")?.toUpperCase();
if (session && (!urlCode || urlCode === session.code)) {
  enterGroup();
} else {
  showView("view-home");
  if (urlCode) prepareJoin(urlCode);
}
