// IndexedDB persistence: projects, files/folders, drafts and settings. Nothing is ever deleted or overwritten implicitly.
const DB_NAME = 'bouira-python-studio', DB_VERSION = 1;
let dbp = null;

export function openDB() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      const e = db.createObjectStore('entries', { keyPath: 'key' }); e.createIndex('project', 'project');
      db.createObjectStore('projects', { keyPath: 'name' });
      db.createObjectStore('kv', { keyPath: 'k' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbp = null; rej(r.error); };
  });
  return dbp;
}
export function resetForTests() { dbp = null; }

async function tx(store, mode, fn) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode); const s = Array.isArray(store) ? store.map(n => t.objectStore(n)) : t.objectStore(store);
    let out; try { out = fn(s, t); } catch (e) { rej(e); return; }
    t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}
const wrap = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

// ---- settings / misc key-value
export async function getKV(k, def = null) { const db = await openDB(); const r = await wrap(db.transaction('kv').objectStore('kv').get(k)); return r ? r.v : def; }
export async function setKV(k, v) { return tx('kv', 'readwrite', s => { s.put({ k, v }); }); }

// ---- projects
export async function listProjects() {
  const db = await openDB(); const all = await wrap(db.transaction('projects').objectStore('projects').getAll());
  return all.sort((a, b) => (b.opened || 0) - (a.opened || 0));
}
export async function getProject(name) { const db = await openDB(); return wrap(db.transaction('projects').objectStore('projects').get(name)); }
export async function createProject(name) {
  if (await getProject(name)) throw new Error('exists');
  const now = Date.now(); await tx('projects', 'readwrite', s => { s.put({ name, created: now, opened: now }); });
  return name;
}
export async function uniqueProjectName(base) {
  let n = base, i = 2; while (await getProject(n)) n = `${base} (${i++})`; return n;
}
export async function touchProject(name) { const p = await getProject(name); if (p) { p.opened = Date.now(); await tx('projects', 'readwrite', s => { s.put(p); }); } }
export async function deleteProject(name) {
  const db = await openDB(); const keys = await wrap(db.transaction('entries').objectStore('entries').index('project').getAllKeys(name));
  await tx(['entries', 'projects'], 'readwrite', ([e, p]) => { keys.forEach(k => e.delete(k)); p.delete(name); });
}

// ---- entries: {key, project, path, type:'file'|'dir', content, draft?, updated}
const keyOf = (project, path) => project + '\u0000' + path;
export async function listEntries(project) {
  const db = await openDB(); const all = await wrap(db.transaction('entries').objectStore('entries').index('project').getAll(project));
  return all.sort((a, b) => a.path.localeCompare(b.path));
}
export async function getEntry(project, path) { const db = await openDB(); return wrap(db.transaction('entries').objectStore('entries').get(keyOf(project, path))); }
export async function putEntry(project, path, fields) {
  const old = await getEntry(project, path);
  const e = { key: keyOf(project, path), project, path, type: 'file', content: '', updated: Date.now(), ...(old || {}), ...fields };
  e.updated = Date.now();
  await tx('entries', 'readwrite', s => { s.put(e); });
  return e;
}
/** Create a file or folder; refuses to replace an existing one. */
export async function createEntry(project, path, type, content = '') {
  if (await getEntry(project, path)) throw new Error('exists');
  const parts = path.split('/'); // make parent folders
  for (let i = 1; i < parts.length; i++) { const d = parts.slice(0, i).join('/'); if (!(await getEntry(project, d))) await putEntry(project, d, { type: 'dir', content: '' }); }
  return putEntry(project, path, { type, content });
}
export async function uniquePath(project, path) {
  if (!(await getEntry(project, path))) return path;
  const m = /^(.*?)(\.[^./]+)?$/.exec(path); let i = 2, p;
  do { p = `${m[1]} (${i++})${m[2] || ''}`; } while (await getEntry(project, p));
  return p;
}
export async function deleteEntry(project, path) {
  const all = await listEntries(project);
  const victims = all.filter(e => e.path === path || e.path.startsWith(path + '/'));
  await tx('entries', 'readwrite', s => { victims.forEach(v => s.delete(v.key)); });
  return victims.length;
}
export async function renameEntry(project, from, to) {
  if (await getEntry(project, to)) throw new Error('exists');
  if (to.startsWith(from + '/')) throw new Error('invalid');
  const all = await listEntries(project);
  const moving = all.filter(e => e.path === from || e.path.startsWith(from + '/'));
  if (!moving.length) throw new Error('missing');
  const toParts = to.split('/'); const parents = [];
  for (let i = 1; i < toParts.length; i++) { const d = toParts.slice(0, i).join('/'); if (!all.some(e => e.path === d)) parents.push(d); }
  await tx('entries', 'readwrite', s => {
    parents.forEach(d => s.put({ key: keyOf(project, d), project, path: d, type: 'dir', content: '', updated: Date.now() }));
    moving.forEach(e => { s.delete(e.key); const np = to + e.path.slice(from.length); s.put({ ...e, key: keyOf(project, np), path: np, updated: Date.now() }); });
  });
}
/** Autosave target: text typed by the student. 'draft' survives crashes; 'content' is the committed version. */
export async function saveDraft(project, path, text) { return putEntry(project, path, { draft: text }); }
export async function commit(project, path, text) { return putEntry(project, path, { content: text, draft: undefined }); }
export const currentText = (e) => (e.draft !== undefined && e.draft !== null ? e.draft : e.content);
