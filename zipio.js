// Project import/export as ZIP with strict validation (zip-slip, zip-bomb, binary and oversized files are rejected).
export const LIMITS = { entries: 500, perFile: 2 * 1024 * 1024, total: 20 * 1024 * 1024 };
export const TEXT_EXT = ['.py', '.txt', '.csv', '.json', '.md', '.tsv', '.ini', '.cfg', '.toml', '.yaml', '.yml', '.xml', '.html'];
let lib = null;
export function setZipLib(l) { lib = l; }

export function safePath(p) {
  if (typeof p !== 'string') return null;
  let s = p.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!s || s.startsWith('/') || /^[A-Za-z]:/.test(s) || s.length > 200 || /[\u0000-\u001f<>:"|?*]/.test(s)) return null;
  const parts = s.split('/').filter(x => x !== '');
  if (!parts.length || parts.some(x => x === '..' || x === '.' || x.length > 80)) return null;
  return parts.join('/');
}
export const isTextFile = (p) => TEXT_EXT.some(e => p.toLowerCase().endsWith(e));

/** @param {Record<string,string>} files path->text */
export function buildZip(files) {
  const obj = {}; for (const [p, t] of Object.entries(files)) obj[p] = lib.strToU8(t);
  return lib.zipSync(obj, { level: 6 });
}

/** @returns {{files: Record<string,string>, skipped: {path:string, reason:string}[]}} ; throws Error('zip-invalid'|'zip-too-big') */
export function readZip(u8) {
  let total = 0, count = 0; const skipped = [];
  let raw;
  try {
    raw = lib.unzipSync(u8, {
      filter(f) {
        if (f.name.endsWith('/')) return false;
        if (++count > LIMITS.entries) throw new Error('zip-too-big');
        const p = safePath(f.name);
        if (!p) { skipped.push({ path: f.name, reason: 'unsafe path' }); return false; }
        if (!isTextFile(p)) { skipped.push({ path: f.name, reason: 'unsupported type' }); return false; }
        if (f.originalSize > LIMITS.perFile) { skipped.push({ path: f.name, reason: 'too large' }); return false; }
        total += f.originalSize; if (total > LIMITS.total) throw new Error('zip-too-big');
        return true;
      },
    });
  } catch (e) { if (e.message === 'zip-too-big') throw e; throw new Error('zip-invalid'); }
  const files = {};
  for (const [name, data] of Object.entries(raw)) {
    const p = safePath(name); let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(data); } catch (e) { skipped.push({ path: name, reason: 'not UTF-8 text' }); continue; }
    files[p] = text;
  }
  return { files, skipped };
}
