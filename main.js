// Bouira Python Studio - application controller (UI, projects, tabs, console, plots, libraries, PWA).
import { t, setLang, getLang, applyI18n, LANGS } from './i18n.js';
import * as DB from './storage.js';
import { setZipLib, buildZip, readZip, safePath } from './zipio.js';
import { Runtime } from './runtime.js';
import { CHAPTERS, ALL_EXAMPLES, exampleFileName, SHADOWING } from './examples.js';

const Lib = window.BSPLib;
const TEST = window.__BSP_TEST__ || null;              // hooks used by the automated jsdom UI test only
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const base = TEST ? TEST.base : new URL('../', import.meta.url).href;
const isPhone = () => window.matchMedia('(max-width: 799px)').matches;

// ------------------------------------------------------------------ icons
const IC = {
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z', newfile: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z',
  newfolder: 'M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z',
  folder: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
  save: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
  play: 'M8 5v14l11-7z', stop: 'M6 6h12v12H6z', restart: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  school: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  ext: 'M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z', close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  clear: 'M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z',
  code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  terminal: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM7.5 17l-1.41-1.41L8.67 13l-2.59-2.59L7.5 9l4 4-4 4z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z', upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z', fmt: 'M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z',
  chevron: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z', file: 'M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z',
};
const svg = (n) => `<svg viewBox="0 0 24 24" width="24" height="24"><path d="${IC[n]}"/></svg>`;
function paintIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(b => { if (!b.querySelector(':scope > svg')) b.insertAdjacentHTML('afterbegin', svg(b.dataset.icon)); }); }

// ------------------------------------------------------------------ state
const DEFAULTS = { lang: null, fontSize: 15, autosave: true, wrap: false, timeout: 0 };
const S = { settings: { ...DEFAULTS }, project: null, entries: [], tabs: [], active: null, open: new Set(), saveTimer: null, plots: [], pendingChanges: null };
let editor, rt, deferredInstall = null, consoleBuf = [], rafPending = false;

// ------------------------------------------------------------------ UI helpers
function toast(msg, ms = 2600) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (el.hidden = true), ms); }
let modalResolve = null;
function openModal(title, node) { $('#mTitle').textContent = title; const b = $('#mBody'); b.replaceChildren(); typeof node === 'string' ? (b.innerHTML = node) : b.appendChild(node); $('#modal').hidden = false; paintIcons(b); return b; }
function closeModal(result = null) { $('#modal').hidden = true; $('#mBody').replaceChildren(); const r = modalResolve; modalResolve = null; if (r) r(result); }
$('#mClose').onclick = () => closeModal(null);
$('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') closeModal(null); });
function dialog(title, build) { return new Promise(res => { modalResolve = res; openModal(title, build(closeModal)); }); }
function askText(title, def = '', label = '') {
  return dialog(title, (done) => {
    const f = document.createElement('form'); f.className = 'form';
    f.innerHTML = `<label>${esc(label || t('name'))}<input type="text" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false"></label><div class="row"><button type="button" class="btn" data-x>${esc(t('cancel'))}</button><button class="btn primary">${esc(t('ok'))}</button></div>`;
    const inp = f.querySelector('input'); inp.value = def; setTimeout(() => { inp.focus(); inp.select(); }, 30);
    f.onsubmit = (e) => { e.preventDefault(); done(inp.value.trim()); }; f.querySelector('[data-x]').onclick = () => done(null); return f;
  });
}
function confirmBox(message, danger = true) {
  return dialog(t('delete'), (done) => {
    const f = document.createElement('div'); f.className = 'form';
    f.innerHTML = `<div style="font-size:15px;line-height:1.5">${esc(message)}</div><div class="row"><button class="btn" data-x>${esc(t('cancel'))}</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(t('ok'))}</button></div>`;
    f.querySelector('[data-x]').onclick = () => done(false); f.querySelector('[data-ok]').onclick = () => done(true); return f;
  }).then(Boolean);
}
function download(name, data, mime) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  if (window.AndroidBridge && window.AndroidBridge.exportFile) {          // Android wrapper: native "save as" dialog
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    window.AndroidBridge.exportFile(name, btoa(bin), mime); return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
const base64ToBytes = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const basename = (p) => p.slice(p.lastIndexOf('/') + 1), dirname = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');

// ------------------------------------------------------------------ settings
async function loadSettings() {
  Object.assign(S.settings, (await DB.getKV('settings', {})) || {});
  if (!S.settings.lang) { const n = (navigator.language || 'en').slice(0, 2); S.settings.lang = LANGS[n] ? n : 'en'; }
}
const saveSettings = () => DB.setKV('settings', S.settings);
function applySettings() {
  setLang(S.settings.lang); applyI18n(); paintIcons(); renderTree(); renderTabs(); updateStatusTexts();
  editor && (editor.setFontSize(S.settings.fontSize), editor.setWrap(S.settings.wrap));
}

// ------------------------------------------------------------------ projects & tree
async function ensureProject() {
  let ps = await DB.listProjects();
  if (!ps.length) {
    await DB.createProject('My First Project');
    await DB.createEntry('My First Project', 'main.py', 'file', '# Welcome to Bouira Python Studio\n# Python Learning Lab - University of Bouira\n\nname = input("What is your name? ")\nprint("Hello,", name + "!")\n');
    ps = await DB.listProjects();
  }
  return ps;
}
async function switchProject(name, restoreTabs = true) {
  await persistActive();
  S.project = name; await DB.touchProject(name); await DB.setKV('lastProject', name);
  S.tabs = []; S.active = null; S.entries = await DB.listEntries(name);
  S.open = new Set(S.entries.filter(e => e.type === 'dir').map(e => e.path));
  $('#projName').textContent = name;
  let paths = restoreTabs ? ((await DB.getKV('tabs:' + name, null)) || { open: [], active: null }) : { open: [], active: null };
  paths.open = paths.open.filter(p => S.entries.some(e => e.path === p && e.type === 'file'));
  if (!paths.open.length) { const first = S.entries.find(e => e.path === 'main.py') || S.entries.find(e => e.type === 'file' && e.path.endsWith('.py')); if (first) paths = { open: [first.path], active: first.path }; }
  for (const p of paths.open) await openTab(p, p === paths.active || (!paths.active && p === paths.open[0]), true);
  if (!S.tabs.length) showNoFile(true);
  renderTree(); renderTabs();
}
async function refreshEntries() { S.entries = await DB.listEntries(S.project); renderTree(); }
function showNoFile(on) { document.body.classList.toggle('no-file', on); if (on) { $('#stFile').textContent = t('noFile'); $('#stPos').textContent = ''; } }

function renderTree() {
  const box = $('#tree'); if (!box) return; box.replaceChildren();
  if (!S.entries.length) { box.innerHTML = `<div class="empty">${esc(t('emptyProject'))}</div>`; return; }
  const visible = (p) => { const parts = p.split('/'); for (let i = 1; i < parts.length; i++) if (!S.open.has(parts.slice(0, i).join('/'))) return false; return true; };
  for (const e of S.entries) {
    if (!visible(e.path)) continue;
    const depth = e.path.split('/').length - 1, row = document.createElement('div');
    row.className = 'tr' + (e.path === S.active ? ' cur' : ''); row.style.setProperty('--d', depth); row.setAttribute('role', 'treeitem'); row.dataset.path = e.path;
    const isDir = e.type === 'dir';
    row.innerHTML = `<div class="nm">${isDir ? `<span class="fi dir">${S.open.has(e.path) ? '▾' : '▸'} 📁</span>` : `<span class="fi">${e.path.endsWith('.py') ? 'PY' : 'TXT'}</span>`}<span>${esc(basename(e.path))}</span></div>` +
      (isDir ? `<button class="act" data-a="nf" title="${esc(t('newFile'))}">${svg('newfile')}</button>` : '') +
      `<button class="act" data-a="r" title="${esc(t('rename'))}">${svg('edit')}</button><button class="act" data-a="d" title="${esc(t('delete'))}">${svg('del')}</button>`;
    row.onclick = (ev) => {
      const a = ev.target.closest('[data-a]');
      if (a) { ev.stopPropagation(); ({ nf: () => newFile(e.path), r: () => renameEntry(e.path), d: () => deleteEntry(e.path) })[a.dataset.a](); return; }
      if (isDir) { S.open.has(e.path) ? S.open.delete(e.path) : S.open.add(e.path); renderTree(); } else { openTab(e.path, true); if (isPhone()) setView('editor'); }
    };
    box.appendChild(row);
  }
}

function cleanPath(raw, dir = '', defaultExt = '.py') {
  let n = (raw || '').trim().replace(/\\/g, '/').replace(/ +/g, ' ');
  if (!n) return null; if (!n.startsWith('/') && dir) n = dir + '/' + n;
  const last = basename(n); if (defaultExt && !last.includes('.')) n += defaultExt;
  return safePath(n);
}
async function newFile(dir = '') {
  const raw = await askText(t('newFile'), 'untitled.py', t('fileName')); if (raw === null) return;
  const p = cleanPath(raw, dir); if (!p) return toast(t('invalidName'));
  if (await DB.getEntry(S.project, p)) return toast(t('exists', { name: p }));
  await DB.createEntry(S.project, p, 'file', ''); if (dir) S.open.add(dir); await refreshEntries(); await openTab(p, true);
}
async function newFolder() {
  const raw = await askText(t('newFolder'), '', t('folderName')); if (raw === null) return;
  const p = cleanPath(raw, '', ''); if (!p) return toast(t('invalidName'));
  if (await DB.getEntry(S.project, p)) return toast(t('exists', { name: p }));
  await DB.createEntry(S.project, p, 'dir'); S.open.add(p); await refreshEntries();
}
async function renameEntry(path) {
  const raw = await askText(t('rename'), basename(path), t('name')); if (raw === null || raw === basename(path)) return;
  const np = cleanPath(raw, dirname(path), ''); if (!np) return toast(t('invalidName'));
  await persistActive();
  try { await DB.renameEntry(S.project, path, np); } catch (e) { return toast(e.message === 'exists' ? t('exists', { name: np }) : t('invalidName')); }
  for (const tb of S.tabs) if (tb.path === path || tb.path.startsWith(path + '/')) tb.path = np + tb.path.slice(path.length);
  if (S.active === path || (S.active || '').startsWith(path + '/')) S.active = np + S.active.slice(path.length);
  if (S.open.has(path)) { S.open.delete(path); S.open.add(np); }
  await refreshEntries(); renderTabs(); updateStatusTexts(); saveTabs();
}
async function deleteEntry(path) {
  if (!(await confirmBox(t('confirmDelete', { name: path })))) return;
  for (const tb of [...S.tabs]) if (tb.path === path || tb.path.startsWith(path + '/')) await closeTab(tb.path, true);
  await DB.deleteEntry(S.project, path); await refreshEntries();
}

// ------------------------------------------------------------------ tabs & saving
function renderTabs() {
  const box = $('#tabs'); box.replaceChildren();
  for (const tb of S.tabs) {
    const el = document.createElement('div'); el.className = 'tab' + (tb.path === S.active ? ' active' : ''); el.setAttribute('role', 'tab'); el.dataset.path = tb.path;
    el.innerHTML = `<span>${esc(basename(tb.path))}</span>${tb.dirty ? `<span class="dot" title="${esc(t('unsaved'))}">●</span>` : ''}<button class="x" title="${esc(t('closeTab'))}">${svg('close')}</button>`;
    el.onclick = (e) => { if (e.target.closest('.x')) { closeTab(tb.path); return; } activate(tb.path); };
    box.appendChild(el);
  }
  const cur = box.querySelector('.tab.active'); cur && cur.scrollIntoView && cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
const saveTabs = () => S.project && DB.setKV('tabs:' + S.project, { open: S.tabs.map(x => x.path), active: S.active });
const activeTab = () => S.tabs.find(x => x.path === S.active);

async function openTab(path, focus = true, quiet = false) {
  let tb = S.tabs.find(x => x.path === path);
  if (!tb) {
    const e = await DB.getEntry(S.project, path); if (!e || e.type !== 'file') return;
    const text = DB.currentText(e), recovered = e.draft !== undefined && e.draft !== null && e.draft !== e.content;
    tb = { path, state: editor.newState(text), dirty: recovered }; S.tabs.push(tb);
    if (recovered && !quiet) toast(t('draftRecovered', { name: path }), 4000);
  }
  if (focus) await activate(path);
  renderTabs(); saveTabs();
}
async function activate(path) {
  const cur = activeTab(); if (cur && cur.path !== path) { cur.state = editor.getState(); await persistActive(cur); }
  const tb = S.tabs.find(x => x.path === path); if (!tb) return;
  S.active = path; showNoFile(false); editor.setState(tb.state); editor.setFontSize(S.settings.fontSize);
  renderTabs(); renderTree(); updateStatusTexts(); saveTabs();
  if (!isPhone() || document.body.dataset.view === 'editor') editor.focus();
}
async function closeTab(path, skipSave = false) {
  const i = S.tabs.findIndex(x => x.path === path); if (i < 0) return;
  if (!skipSave && S.active === path) await persistActive();
  S.tabs.splice(i, 1);
  if (S.active === path) { S.active = null; const next = S.tabs[Math.min(i, S.tabs.length - 1)]; if (next) await activate(next.path); else { showNoFile(true); updateStatusTexts(); } }
  renderTabs(); renderTree(); saveTabs();
}
/** Write what the student typed to IndexedDB: always as a draft; as the committed file too when auto-save is on. */
async function persistActive(tb = activeTab()) {
  clearTimeout(S.saveTimer); if (!tb || !S.project) return;
  const text = tb.path === S.active ? editor.getValue() : tb.state.doc.toString();
  try {
    if (S.settings.autosave) { await DB.commit(S.project, tb.path, text); tb.dirty = false; } else { await DB.saveDraft(S.project, tb.path, text); }
  } catch (e) { toast('Storage error: ' + e.message); }
  renderTabs();
}
function onEditorChange() { const tb = activeTab(); if (!tb) return; tb.dirty = true; renderTabs(); clearTimeout(S.saveTimer); S.saveTimer = setTimeout(() => persistActive(), 600); }
async function saveNow(announce = true) {
  const tb = activeTab(); if (!tb) return; clearTimeout(S.saveTimer);
  await DB.commit(S.project, tb.path, editor.getValue()); tb.dirty = false; renderTabs(); announce && toast(t('saved'));
}
async function saveAs() {
  const tb = activeTab(); if (!tb) return;
  const raw = await askText(t('saveAs'), basename(tb.path).replace(/\.py$/, '') + '_copy.py', t('fileName')); if (raw === null) return;
  const p = cleanPath(raw, dirname(tb.path)); if (!p) return toast(t('invalidName'));
  if (await DB.getEntry(S.project, p)) return toast(t('exists', { name: p }));        // never overwrite
  await DB.createEntry(S.project, p, 'file', editor.getValue()); await refreshEntries(); await openTab(p, true); toast(t('savedAs', { name: p }));
}
function downloadCurrent() { const tb = activeTab(); if (!tb) return; download(basename(tb.path), editor.getValue(), 'text/x-python'); }

// ------------------------------------------------------------------ import / export
async function projectFiles() {
  await persistActive(); const entries = await DB.listEntries(S.project); const out = {};
  for (const e of entries) if (e.type === 'file') out[e.path] = DB.currentText(e);
  return out;
}
async function exportZip() { const files = await projectFiles(); download(S.project.replace(/[^\w\-. ]+/g, '_') + '.zip', buildZip(files), 'application/zip'); }
async function importZipFile(file) {
  let res; try { res = readZip(new Uint8Array(await file.arrayBuffer())); } catch (e) { return toast(e.message === 'zip-too-big' ? t('zipTooBig') : t('zipInvalid'), 4000); }
  const name = await DB.uniqueProjectName(file.name.replace(/\.zip$/i, '').replace(/[^\w\-. ]+/g, '_') || 'Imported');
  await DB.createProject(name);
  for (const [p, text] of Object.entries(res.files)) await DB.createEntry(name, p, 'file', text);
  await switchProject(name, false); toast(res.skipped.length ? t('zipSkipped', { n: res.skipped.length }) : name, 4000);
}
async function importFiles(fileList) {
  for (const f of fileList) {
    if (/\.zip$/i.test(f.name)) { await importZipFile(f); continue; }
    if (f.size > 2 * 1024 * 1024) { toast(t('zipTooBig')); continue; }
    let text; try { text = new TextDecoder('utf-8', { fatal: true }).decode(await f.arrayBuffer()); } catch (e) { toast(t('zipSkipped', { n: 1 })); continue; }
    let p = cleanPath(f.name.replace(/ /g, '_'), '', ''); if (!p) { toast(t('invalidName')); continue; }
    const u = await DB.uniquePath(S.project, p); if (u !== p) toast(t('renamedOnImport', { old: p, name: u }), 4000); p = u;
    await DB.createEntry(S.project, p, 'file', text); await refreshEntries(); if (p.endsWith('.py')) await openTab(p, true);
  }
}
$('#filePicker').onchange = async (e) => { const fs = [...e.target.files]; e.target.value = ''; await importFiles(fs); };

// ------------------------------------------------------------------ console / plots / status
const out = $('#out'), pane = $('#consoleWrap');
function emit(text, cls) { consoleBuf.push([text, cls]); if (!rafPending) { rafPending = true; (window.requestAnimationFrame || setTimeout)(flushConsole); } }
function flushConsole() {
  rafPending = false; const frag = document.createDocumentFragment();
  for (const [text, cls] of consoleBuf) { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; frag.appendChild(s); }
  consoleBuf = []; out.appendChild(frag); while (out.childNodes.length > 6000) out.removeChild(out.firstChild); pane.scrollTop = pane.scrollHeight;
}
function clearConsole() { consoleBuf = []; out.replaceChildren(); }
function showPanelTab(name) { document.querySelectorAll('.ptab').forEach(b => b.classList.toggle('active', b.dataset.tab === name)); pane.hidden = name !== 'console'; $('#plots').hidden = name !== 'plots'; }
document.querySelectorAll('.ptab').forEach(b => (b.onclick = () => showPanelTab(b.dataset.tab)));
function renderPlots() {
  const box = $('#plots'); box.replaceChildren();
  if (!S.plots.length) box.innerHTML = `<div class="none">${esc(t('noPlots'))}</div>`;
  S.plots.forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'fig';
    d.innerHTML = `<img alt="${esc(t('figure'))} ${i + 1}" src="data:image/png;base64,${p.png}"><div class="cap"><span>${esc(t('figure'))} ${i + 1}</span><span class="grow"></span><button data-f="png">${esc(t('savePNG'))}</button><button data-f="svg">${esc(t('saveSVG'))}</button></div>`;
    d.querySelector('[data-f=png]').onclick = () => download(`figure_${i + 1}.png`, base64ToBytes(p.png), 'image/png');
    d.querySelector('[data-f=svg]').onclick = () => download(`figure_${i + 1}.svg`, p.svg, 'image/svg+xml');
    box.appendChild(d);
  });
  const c = $('#plotCount'); c.textContent = S.plots.length; c.hidden = !S.plots.length;
}
const STATE_KEY = { loading: 'st_loading', ready: 'st_ready', running: 'st_running', waiting: 'st_waiting', done: 'st_done', error: 'st_error', stopped: 'st_stopped', failed: 'st_failed' };
let rtState = 'loading';
function setRuntimeState(s) {
  if (consoleBuf.length) flushConsole();
  rtState = s; const el = $('#stRuntime'); el.className = s; el.textContent = t(STATE_KEY[s] || 'st_ready');
  const busy = s === 'running' || s === 'waiting'; $('#btnRun').disabled = busy || s === 'loading' || s === 'failed'; $('#btnStop').disabled = !busy;
  if (s !== 'waiting') $('#inputRow').hidden = true;
}
function updateStatusTexts() {
  setRuntimeState(rtState); const tb = activeTab(); $('#stFile').textContent = tb ? tb.path : t('noFile');
  $('#stNet').textContent = navigator.onLine ? t('online') : t('offline');
  if (rt && rt.info) $('#stPy').textContent = `Python ${rt.info.python} · ${rt.live ? 'live' : 'compat'}`;
}
function showInput({ prompt, secret }) {
  flushConsole();                                        // the prompt text must be on screen before the input field appears
  const row = $('#inputRow'), inp = $('#stdin'); row.hidden = false; inp.value = ''; inp.type = 'text'; inp.classList.toggle('secret', !!secret); inp.setAttribute('aria-label', prompt || '');
  if (isPhone()) setView('output'); showPanelTab('console'); pane.scrollTop = pane.scrollHeight; setTimeout(() => inp.focus(), 30);
}
$('#inputRow').onsubmit = (e) => { e.preventDefault(); if (rtState !== 'waiting') return; const v = $('#stdin').value; $('#inputRow').hidden = true; rt.submitInput(v); };

// ------------------------------------------------------------------ run
let runClock = null;
async function run() {
  if (rtState === 'loading') return toast(t('pythonNotReady'));
  if (!rt || rt.busy || rtState === 'failed') return;                         // no duplicate executions
  const tb = activeTab(); if (!tb) return toast(t('noFile'));
  if (!tb.path.endsWith('.py')) return toast(t('invalidName'));
  const files = await projectFiles(); const code = editor.getValue(); files[tb.path] = code;
  clearConsole(); S.plots = []; renderPlots(); showPanelTab('console'); if (isPhone()) setView('output');
  S.runs = (S.runs || 0) + 1;
  const stem = basename(tb.path).replace(/\.py$/, '');
  emit(`▶ ${tb.path}\n`, 'sys'); if (SHADOWING.has(stem)) emit(`⚠ "${stem}.py" has the same name as a Python module: "import ${stem}" will load YOUR file. Rename it.\n`, 'err');
  let secs = 0; clearInterval(runClock);
  runClock = setInterval(() => { if (rt.status === 'running' && S.settings.timeout > 0 && ++secs >= S.settings.timeout) { clearInterval(runClock); emit('\n' + t('autoStopped', { n: S.settings.timeout }) + '\n', 'err'); rt.stop(); } }, 1000);
  const t0 = performance.now(); const res = await rt.run({ code, filename: tb.path, files }); clearInterval(runClock);
  if (res.rejected) return;
  emit(`\n■ ${res.stopped ? t('st_stopped') : res.ok ? t('st_done') : t('st_error')} · ${((performance.now() - t0) / 1000).toFixed(2)} s\n`, res.ok ? 'sys' : 'err');
  if (S.plots.length) showPanelTab('plots');
  await applyChanges();
}
async function applyChanges() {
  const ch = S.pendingChanges || {}; S.pendingChanges = null; const names = [];
  for (const [p0, text] of Object.entries(ch)) {
    const p = safePath(p0); if (!p) continue; const open = S.tabs.find(x => x.path === p);
    if (open && (open.dirty || p === S.active)) continue;                      // never replace something the student is editing
    const ex = await DB.getEntry(S.project, p);
    if (ex && DB.currentText(ex) === text) continue;
    if (ex) await DB.commit(S.project, p, text); else await DB.createEntry(S.project, p, 'file', text);
    names.push(p);
  }
  if (names.length) { await refreshEntries(); emit(t('changedByProgram', { names: names.join(', ') }) + '\n', 'info'); }
}

// ------------------------------------------------------------------ examples / libraries / projects / settings dialogs
async function showExamples() {
  const wrap = document.createElement('div');
  for (const c of CHAPTERS) {
    wrap.insertAdjacentHTML('beforeend', `<div class="chap">${c.id}. ${esc(c.title[getLang()] || c.title.en)}${getLang() !== 'en' ? ` <span style="color:var(--fg2);font-weight:400">· ${esc(c.title.en)}</span>` : ''}</div>`);
    for (const ex of c.examples) {
      const b = document.createElement('button'); b.className = 'li';
      b.innerHTML = `<div dir="ltr" style="text-align:start"><b>${esc(ex.title)}</b><small>examples/${esc(exampleFileName({ ...ex, chapter: c.id }))}</small></div>${ex.exercise ? `<span class="tagx">${esc(t('exercise'))}</span>` : ''}`;
      b.onclick = async () => {
        closeModal(); const want = 'examples/' + exampleFileName({ ...ex, chapter: c.id }); const p = await DB.uniquePath(S.project, want);
        await DB.createEntry(S.project, p, 'file', ex.code); S.open.add('examples'); await refreshEntries(); await openTab(p, true);
        toast(p === want ? t('opened', { name: p }) : t('copyKept', { name: p }), 3500); if (isPhone()) setView('editor');
      };
      wrap.appendChild(b);
    }
  }
  openModal(t('chapters'), wrap);
}
const STD = ['math', 'statistics', 'random', 'itertools', 'collections', 'datetime', 'decimal', 'csv', 'json'];
const LIBS = [['numpy', 'numpy', 'import numpy as np'], ['pandas', 'pandas', 'import pandas as pd'], ['scipy', 'scipy', 'from scipy import stats'], ['matplotlib', 'matplotlib', 'import matplotlib.pyplot as plt'],
  ['sympy', 'sympy', 'import sympy as sp'], ['statsmodels', 'statsmodels', 'import statsmodels.api as sm'], ['scikit-learn', 'scikit-learn', 'from sklearn.linear_model import LinearRegression'], ['seaborn', 'seaborn', 'import seaborn as sns']];
async function showLibs() {
  const b = openModal(t('libraries'), '<div class="note">…</div>'); let lock = {};
  try { lock = (await (await fetch(base + 'pyodide/pyodide-lock.json')).json()).packages || {}; } catch (e) { /* offline and not cached yet */ }
  const norm = (n) => n.toLowerCase().replace(/_/g, '-'); const by = {}; Object.keys(lock).forEach(k => (by[norm(k)] = lock[k]));
  let loaded = []; try { loaded = (await rt.loaded()).map(norm); } catch (e) { /* ignore */ }
  let html = `<div class="note">${esc(t('installNote'))}</div>`;
  html += `<div class="lib"><div><b>${esc(t('stdlib'))}</b><code>${STD.join(', ')}</code></div><span class="pill ok">${esc(t('bundled'))}</span></div>`;
  for (const [name, pk, imp] of LIBS) {
    const info = by[norm(pk)]; const isLoaded = loaded.includes(norm(pk));
    html += `<div class="lib"><div><b>${esc(name)}</b> <span style="color:var(--fg2)">${info ? esc(info.version) : ''}</span><code>${esc(imp)}</code></div><span class="pill ${info ? 'ok' : 'no'}">${esc(info ? t('bundled') + (isLoaded ? ' · ' + t('loadedNow') : '') : t('notBundled'))}</span></div>`;
  }
  html += `<form class="form" id="instForm" style="margin-top:12px"><label>pip / micropip (${esc(t('install'))})<input type="text" dir="ltr" id="instName" placeholder="package-name" autocapitalize="off" spellcheck="false"></label><div class="row"><span id="instMsg" class="note" style="flex:1;padding:0"></span><button class="btn primary">${esc(t('install'))}</button></div></form>`;
  b.innerHTML = html;
  $('#instForm').onsubmit = async (e) => {
    e.preventDefault(); const n = $('#instName').value.trim(); if (!n) return; const m = $('#instMsg'); m.textContent = t('installing');
    try { await rt.install(n); m.textContent = t('installed') + ': ' + n; } catch (er) { m.textContent = t('installFailed', { err: er.message }); }
  };
}
async function showProjects() {
  await persistActive(); const ps = await DB.listProjects(); const wrap = document.createElement('div');
  wrap.insertAdjacentHTML('beforeend', `<div class="chap">${esc(t('recent'))}</div>`);
  for (const p of ps) {
    const row = document.createElement('div'); row.className = 'li'; row.style.padding = '4px 8px 4px 16px';
    row.innerHTML = `<button style="flex:1;text-align:start;min-height:44px" data-o><b>${esc(p.name)}</b>${p.name === S.project ? ' ✓' : ''}</button><button class="ib sm" data-d title="${esc(t('delete'))}">${svg('del')}</button>`;
    row.querySelector('[data-o]').onclick = async () => { closeModal(); await switchProject(p.name); };
    row.querySelector('[data-d]').onclick = async () => {
      closeModal(); if (!(await confirmBox(t('confirmDeleteProject', { name: p.name })))) return;
      await DB.deleteProject(p.name); await DB.setKV('tabs:' + p.name, null);
      if (p.name === S.project) { S.project = null; const rest = await ensureProject(); await switchProject(rest[0].name); }
    };
    wrap.appendChild(row);
  }
  const f = document.createElement('div'); f.className = 'form'; f.style.paddingTop = '12px';
  f.innerHTML = `<div class="row" style="justify-content:flex-start;flex-wrap:wrap"><button class="btn primary" data-np>${esc(t('newProject'))}</button><button class="btn" data-ez>${esc(t('exportZip'))}</button><button class="btn" data-iz>${esc(t('importZip'))}</button></div>`;
  f.querySelector('[data-np]').onclick = async () => {
    const raw = await askText(t('newProject'), 'Project ' + (ps.length + 1), t('projectName')); if (!raw) return;
    const n = raw.replace(/[\u0000-\u001f/\\]/g, '_').slice(0, 60); if (await DB.getProject(n)) return toast(t('exists', { name: n }));
    await DB.createProject(n); await DB.createEntry(n, 'main.py', 'file', 'print("Hello, World!")\n'); await switchProject(n);
  };
  f.querySelector('[data-ez]').onclick = () => { closeModal(); exportZip(); };
  f.querySelector('[data-iz]').onclick = () => { closeModal(); const pk = $('#filePicker'); pk.accept = '.zip,application/zip'; pk.click(); setTimeout(() => (pk.accept = '.py,.txt,.csv,.json,.md,.zip,text/*,application/zip'), 1000); };
  wrap.appendChild(f); openModal(t('projects'), wrap);
}
async function offlineInfo() {
  if (!('serviceWorker' in navigator) || !window.caches) return { ok: false, msg: t('offlineNoSW') };
  try {
    const list = await (await fetch(base + 'precache.json', { cache: 'no-store' })).json(); const names = (await caches.keys()).filter(n => n.startsWith('bsp-'));
    let have = 0; if (names.length) { const c = await caches.open(names[names.length - 1]); have = (await c.keys()).length; }
    const ok = have >= list.files.length; return { ok, msg: ok ? t('offlineReady') : t('offlineNotReady', { done: have, total: list.files.length }) };
  } catch (e) { return { ok: false, msg: t('offlineNoSW') }; }
}
async function showSettings() {
  const st = S.settings; const f = document.createElement('div'); f.className = 'form';
  f.innerHTML = `<label>${esc(t('language'))}<select id="sLang">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === st.lang ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  <label>${esc(t('fontSize'))}: <span id="sFsv">${st.fontSize}</span> px<input type="range" id="sFs" min="11" max="26" value="${st.fontSize}"></label>
  <label class="chk"><input type="checkbox" id="sAuto" ${st.autosave ? 'checked' : ''}>${esc(t('autosave'))}</label>
  <label class="chk"><input type="checkbox" id="sWrap" ${st.wrap ? 'checked' : ''}>${esc(t('wrapLines'))}</label>
  <label>${esc(t('timeout'))}<input type="number" id="sTo" min="0" max="3600" value="${st.timeout}"></label>
  <div class="note" style="padding:0"><b>${esc(t('interactiveMode'))}:</b> ${esc(rt && rt.live ? t('modeLive') : t('modeCompat'))}</div>
  <div class="note" style="padding:0"><b>${esc(t('offlineStatus'))}:</b> <span id="sOff">…</span> <button class="btn" id="sOffBtn" style="height:34px;padding:0 10px">${esc(t('checkOffline'))}</button></div>
  ${deferredInstall ? `<button class="btn primary" id="sInstall">${esc(t('installApp'))}</button>` : ''}
  <div class="note" style="padding:0"><b>${esc(t('shortcuts'))}</b><br><kbd>Ctrl</kbd>+<kbd>Enter</kbd> / <kbd>F5</kbd> ${esc(t('run'))} · <kbd>Ctrl</kbd>+<kbd>S</kbd> ${esc(t('save'))} · <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>L</kbd> ${esc(t('format'))} · <kbd>Ctrl</kbd>+<kbd>F</kbd> ${esc(t('find'))} · <kbd>Ctrl</kbd>+<kbd>/</kbd> # · <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> · <kbd>Ctrl</kbd>+<kbd>B</kbd> ${esc(t('files'))} · <kbd>Esc</kbd> ${esc(t('close'))}</div>
  <div class="note" style="padding:0">${esc(t('about', { v: rt && rt.info ? rt.info.python : '…' }))}</div>`;
  openModal(t('settings'), f);
  const upd = async () => { Object.assign(st, { lang: $('#sLang').value, fontSize: +$('#sFs').value, autosave: $('#sAuto').checked, wrap: $('#sWrap').checked, timeout: Math.max(0, +$('#sTo').value || 0) }); $('#sFsv').textContent = st.fontSize; await saveSettings(); const l = getLang(); applySettings(); if (l !== st.lang) { $('#mTitle').textContent = t('settings'); } };
  ['sLang', 'sFs', 'sAuto', 'sWrap', 'sTo'].forEach(id => (f.querySelector('#' + id).onchange = upd)); f.querySelector('#sFs').oninput = upd;
  const chk = async () => { $('#sOff').textContent = (await offlineInfo()).msg; }; f.querySelector('#sOffBtn').onclick = chk; chk();
  const ib = f.querySelector('#sInstall'); ib && (ib.onclick = async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; closeModal(); });
}

// ------------------------------------------------------------------ menu, views, key row
function showMenu() {
  const m = $('#menu'); if (!m.hidden) { m.hidden = true; return; }
  const I = [[t('newFile'), 'newfile', () => newFile()], [t('importFiles'), 'folder', () => $('#filePicker').click()], [t('save'), 'save', () => saveNow()], [t('saveAs'), 'save', saveAs],
    [t('download'), 'download', downloadCurrent], [t('format'), 'fmt', formatCode], [t('find'), 'search', () => editor.openSearch()], null,
    [t('projects'), 'folder', showProjects], [t('exportZip'), 'download', exportZip], [t('importZip'), 'upload', () => { const pk = $('#filePicker'); pk.accept = '.zip,application/zip'; pk.click(); setTimeout(() => (pk.accept = '.py,.txt,.csv,.json,.md,.zip,text/*,application/zip'), 1000); }], null,
    [t('examples'), 'school', showExamples], [t('libraries'), 'ext', showLibs], [t('settings'), 'gear', showSettings], [t('clearConsole'), 'clear', clearConsole]];
  m.replaceChildren(); for (const it of I) { if (!it) { m.appendChild(document.createElement('hr')); continue; } const b = document.createElement('button'); b.innerHTML = svg(it[1]) + `<span>${esc(it[0])}</span>`; b.onclick = () => { m.hidden = true; it[2](); }; m.appendChild(b); }
  m.hidden = false;
}
document.addEventListener('pointerdown', e => { const m = $('#menu'); if (!m.hidden && !m.contains(e.target) && !e.target.closest('#btnMore')) m.hidden = true; });
function setView(v) { document.body.dataset.view = v; document.querySelectorAll('#bottomNav button').forEach(b => b.classList.toggle('on', b.dataset.view === v)); if (v === 'editor') setTimeout(() => editor.focus(), 50); }
document.querySelectorAll('#bottomNav button').forEach(b => (b.onclick = () => setView(b.dataset.view)));
async function formatCode() {
  if (!activeTab()) return; if (rt.busy) return toast(t('formatBusy'));
  try { const res = await rt.format(editor.getValue()); if (res !== editor.getValue()) editor.replaceAll(res); } catch (e) { toast(t('formatFailed', { err: String(e.message).split('\n').slice(-1)[0] }), 4000); }
}
const KEYS = [['Tab', () => editor.insert('    ')], ['⇤', () => editor.dedent()], [':', () => editor.insert(':')], ['()', () => editor.insert('()', 1)], ['[]', () => editor.insert('[]', 1)], ['{}', () => editor.insert('{}', 1)],
  ['=', () => editor.insert('=')], ['==', () => editor.insert('==')], ['+', () => editor.insert('+')], ['-', () => editor.insert('-')], ['_', () => editor.insert('_')], ['"', () => editor.insert('""', 1)], ["'", () => editor.insert("''", 1)], ['#', () => editor.insert('#')],
  ['←', () => editor.moveCursor(-1)], ['→', () => editor.moveCursor(1)], ['↶', () => editor.undo()], ['↷', () => editor.redo()]];
for (const [l, f] of KEYS) { const b = document.createElement('button'); b.textContent = l; b.type = 'button'; b.addEventListener('pointerdown', (e) => { e.preventDefault(); f(); editor.focus(); }); $('#keys').appendChild(b); }

// resizable output panel
(() => {
  const h = $('#handle'); let drag = false;
  h.addEventListener('pointerdown', e => { drag = true; h.setPointerCapture(e.pointerId); });
  h.addEventListener('pointermove', e => { if (!drag) return; const r = $('#center').getBoundingClientRect(); document.documentElement.style.setProperty('--panel-h', Math.min(Math.max(r.bottom - e.clientY, 100), r.height - 150) + 'px'); });
  h.addEventListener('pointerup', () => (drag = false));
})();

// ------------------------------------------------------------------ wiring
$('#btnNew').onclick = () => newFile(); $('#btnOpen').onclick = () => $('#filePicker').click(); $('#btnSave').onclick = () => saveNow();
$('#btnRun').onclick = run; $('#btnStop').onclick = () => rt.stop(); $('#btnRestart').onclick = async () => { clearConsole(); S.plots = []; renderPlots(); await persistActive(); setRuntimeState('loading'); await rt.restart().catch(() => {}); };
$('#btnExamples').onclick = showExamples; $('#btnLibs').onclick = showLibs; $('#btnSettings').onclick = showSettings; $('#btnMore').onclick = showMenu;
$('#sNewFile').onclick = () => newFile(); $('#sNewFolder').onclick = newFolder; $('#sProjects').onclick = showProjects;
$('#btnSide').onclick = () => document.body.classList.toggle('side-closed'); $('#btnBackEditor').onclick = () => setView('editor'); $('#btnClear').onclick = () => ($('#plots').hidden ? clearConsole() : ((S.plots = []), renderPlots()));
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(null); else if (!$('#menu').hidden) $('#menu').hidden = true; }
  else if (mod && e.key === 's') { e.preventDefault(); saveNow(); }
  else if (mod && e.key === 'b') { e.preventDefault(); document.body.classList.toggle('side-closed'); }
  else if (e.key === 'F5' || (mod && e.key === 'Enter')) { e.preventDefault(); run(); }
});
window.addEventListener('beforeunload', () => { persistActive(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) persistActive(); });
window.addEventListener('online', updateStatusTexts); window.addEventListener('offline', updateStatusTexts);
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
// Back button / gesture: close dialogs and return to the editor before leaving the app.
window.BSP_BACK = () => {
  if (!$('#modal').hidden) { closeModal(null); return true; }
  if (!$('#menu').hidden) { $('#menu').hidden = true; return true; }
  if (isPhone() && document.body.dataset.view !== 'editor') { setView('editor'); return true; }
  return false;
};
if (window.history && window.history.pushState && !window.AndroidBridge) {
  window.history.pushState({ bsp: 1 }, '');
  window.addEventListener('popstate', () => { if (window.BSP_BACK()) window.history.pushState({ bsp: 1 }, ''); });
}

// ------------------------------------------------------------------ PWA / cross-origin isolation (needed for blocking input())
async function setupServiceWorker() {
  if (TEST || window.AndroidBridge || !('serviceWorker' in navigator)) return true;   // Android wrapper serves local assets itself
  try {
    const reg = await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready;
    // The service worker adds COOP/COEP headers; the first load needs one reload before the page is cross-origin isolated.
    if (!window.crossOriginIsolated && !sessionStorage.getItem('bsp.coi')) { sessionStorage.setItem('bsp.coi', '1'); location.reload(); return false; }
    navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.type === 'precache-progress') $('#stNet').textContent = `${navigator.onLine ? t('online') : t('offline')} · ${e.data.done}/${e.data.total}`; if (e.data && e.data.type === 'precache-done') updateStatusTexts(); });
    (reg.active || navigator.serviceWorker.controller)?.postMessage({ type: 'precache' });
  } catch (e) { console.warn('Service worker unavailable:', e); }
  return true;
}

// ------------------------------------------------------------------ boot
async function boot() {
  await DB.openDB().catch((e) => { toast('IndexedDB unavailable: ' + e.message, 8000); throw e; });
  await loadSettings(); setLang(S.settings.lang); applyI18n(); paintIcons();
  if (!(await setupServiceWorker())) return;
  setZipLib(Lib.fflate);
  editor = Lib.createEditorHost($('#editor'), {
    onChange: onEditorChange, onCommand: (c) => ({ run, save: () => saveNow(), format: formatCode })[c](),
    onCursor: (l, c) => ($('#stPos').textContent = `${t('line')} ${l}:${t('col')} ${c}`),
    syntaxCheck: (code) => (rt ? rt.syntax(code) : []),
    introspect: (spec) => (rt ? rt.complete(spec) : null),
  });
  editor.setFontSize(S.settings.fontSize); editor.setWrap(S.settings.wrap);
  const isolated = TEST ? TEST.isolated : window.crossOriginIsolated;
  rt = new Runtime({
    base, isolated, createWorker: TEST ? TEST.createWorker : () => new Worker(base + 'js/worker.js'),
    on: { stdout: (x) => emit(x), stderr: (x) => emit(x, 'err'), plot: (png, svg) => { S.plots.push({ png, svg }); renderPlots(); }, state: (s) => setRuntimeState(s), needInput: showInput,
          reset: () => { clearConsole(); S.plots = []; renderPlots(); }, changes: (c) => { S.pendingChanges = c; }, pkg: (m) => $('#stRuntime').textContent = m, stopped: () => {} },
  });
  const ps = await ensureProject(); const last = await DB.getKV('lastProject', null);
  await switchProject(ps.some(p => p.name === last) ? last : ps[0].name);
  setView('editor'); renderPlots(); updateStatusTexts(); document.body.classList.add('ready');
  rt.start().then(() => { setRuntimeState('ready'); updateStatusTexts(); }).catch((e) => { setRuntimeState('failed'); emit('Python could not start: ' + e.message + '\nRun scripts/fetch_pyodide.py once, then serve the www folder (see README).\n', 'err'); });
}
window.BSP_APP = { S, get rt() { return rt; }, get editor() { return editor; }, run, switchProject, openTab, newFile, exportZip, importZipFile, importFiles, showExamples, showLibs };
boot().catch(e => { console.error(e); const el = document.createElement('pre'); el.style.cssText = 'color:#f88;padding:16px;white-space:pre-wrap'; el.textContent = 'Startup error: ' + (e && e.stack || e); document.body.prepend(el); });
