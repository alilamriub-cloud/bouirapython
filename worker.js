/* Python execution worker. Everything Python-related runs here so the UI never freezes.
 *
 * Interactive input():
 *   - "live" mode (page is cross-origin isolated): input() blocks this worker with Atomics.wait() on a SharedArrayBuffer
 *     until the UI writes the typed text into it. The program keeps its state, loops and variables - exactly like a terminal.
 *   - "replay" mode (no SharedArrayBuffer, e.g. plain http:// on a LAN): input() stops the program, the UI collects the answer,
 *     and the program is re-run from the start feeding all previous answers (random is re-seeded identically).
 * Stop: Python's interrupt buffer (SIGINT) in live mode; otherwise the UI terminates and restarts this worker.
 */
'use strict';
let py = null, runner = null, base = '', ctrl = null, data = null, intr = null, canBlock = false;
let replay = null;
const post = (m) => self.postMessage(m);
const enc = new TextEncoder();

function writer(kind) {
  const dec = new TextDecoder();
  return { write(buf) { const t = dec.decode(buf, { stream: true }); if (t) post({ type: kind, text: t }); return buf.length; }, isatty: false };
}

// called from Python (runner.py): returns "ok:<text>" | "cancel:" | "need:"
self.bsp_input = (prompt, secret) => {
  if (canBlock) {
    Atomics.store(ctrl, 0, 0);
    post({ type: 'needInput', prompt: String(prompt), secret: !!secret });
    Atomics.wait(ctrl, 0, 0);
    const state = Atomics.load(ctrl, 0), len = Atomics.load(ctrl, 1);
    Atomics.store(ctrl, 0, 0);
    if (state === 1) return 'ok:' + new TextDecoder().decode(data.slice(0, len));
    return 'cancel:';
  }
  if (replay && replay.idx < replay.answers.length) return 'ok:' + replay.answers[replay.idx++];
  if (replay) replay.needed = { prompt: String(prompt), secret: !!secret };
  return 'need:';
};
self.bsp_plot = (png, svg) => post({ type: 'plot', png, svg });

async function loadPackagesFor(code, files) {
  // follow "import helper" into other project files so their libraries are loaded too
  const seen = new Set(), queue = [code];
  const cb = { messageCallback: (m) => { if (/^Load/.test(m)) post({ type: 'pkg', msg: m }); }, errorCallback: (m) => post({ type: 'stderr', text: m + '\n' }) };
  while (queue.length) {
    const src = queue.pop();
    await py.loadPackagesFromImports(src, cb);
    for (const m of src.matchAll(/^\s*(?:from|import)\s+([A-Za-z_][\w]*)/gm)) {
      const f = m[1] + '.py';
      if (files[f] !== undefined && !seen.has(f)) { seen.add(f); queue.push(files[f]); }
    }
  }
}

const handlers = {
  async init(m) {
    base = m.base; canBlock = !!m.sab;
    if (m.sab) { ctrl = new Int32Array(m.sab, 0, 2); data = new Uint8Array(m.sab, 8); }
    if (m.intr) intr = new Int32Array(m.intr);
    importScripts(base + 'pyodide/pyodide.js');
    py = await loadPyodide({ indexURL: base + 'pyodide/' });
    py.setStdout(writer('stdout'));
    py.setStderr(writer('stderr'));
    if (intr) py.setInterruptBuffer(intr);
    py.runPython(await (await fetch(base + 'python/runner.py')).text());
    runner = py.globals.get('run_user_code');
    post({ type: 'ready', python: py.runPython('import sys; sys.version.split()[0]'), pyodide: py.version, live: canBlock });
  },

  async run(m) {
    replay = m.mode === 'replay' ? { answers: m.answers || [], idx: 0, needed: null } : null;
    let ok = false, changes = {}, error = null;
    try {
      await loadPackagesFor(m.code, m.files || {});
      py.globals.get('mount_files')(JSON.stringify(m.files || {}));
      post({ type: 'running' });
      await new Promise((r) => setTimeout(r, 0));
      ok = runner(m.code, m.filename || 'main.py', m.seed == null ? null : m.seed);
      changes = JSON.parse(py.globals.get('collect_changes')());
    } catch (e) { error = String(e && e.message || e); post({ type: 'stderr', text: error + '\n' }); }
    post({ type: 'done', id: m.id, ok: !!ok && !error, needInput: replay ? replay.needed : null, changes });
  },

  syntax(m) { post({ type: 'result', id: m.id, value: JSON.parse(py.globals.get('check_syntax')(m.code)) }); },
  complete(m) { post({ type: 'result', id: m.id, value: JSON.parse(py.globals.get('complete_attrs')(JSON.stringify(m.spec))) }); },
  async format(m) {
    try {
      await py.loadPackage('autopep8');
      post({ type: 'result', id: m.id, value: py.globals.get('format_code')(m.code) }); }
    catch (e) { post({ type: 'result', id: m.id, error: String(e.message || e) }); }
  },
  async loaded(m) { post({ type: 'result', id: m.id, value: Object.keys(py.loadedPackages) }); },
  async install(m) {
    try {
      await py.loadPackage('micropip');
      const mp = py.pyimport('micropip');
      await mp.install(m.name);
      post({ type: 'result', id: m.id, value: true });
    } catch (e) { post({ type: 'result', id: m.id, error: String(e.message || e).split('\n').slice(-2).join(' ') }); }
  },
};

self.onmessage = async (ev) => {
  const m = ev.data;
  try { await handlers[m.type](m); }
  catch (e) { post({ type: 'fatal', id: m.id, error: String(e && e.message || e) }); }
};
