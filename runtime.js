// Client side of the Python worker: state machine, interactive input, stop/restart, editor-intelligence requests.
const MAX_INPUT = 65536;

export class Runtime {
  /** @param {{base:string, createWorker:()=>Worker, isolated:boolean, on?:object}} o */
  constructor(o) {
    this.base = o.base; this.createWorker = o.createWorker;
    this.live = !!o.isolated && typeof SharedArrayBuffer !== 'undefined';
    this.cb = Object.assign({ stdout() {}, stderr() {}, plot() {}, state() {}, needInput() {}, reset() {}, changes() {}, pkg() {}, stopped() {} }, o.on || {});
    this.status = 'loading'; this.pending = new Map(); this.nextId = 1; this.info = null; this.stopTimer = null;
  }
  get busy() { return this.status === 'running' || this.status === 'waiting'; }
  _set(s) { this.status = s; this.cb.state(s); }

  start() {
    this._set('loading');
    if (this.live) {
      this.sab = new SharedArrayBuffer(8 + MAX_INPUT); this.ctrl = new Int32Array(this.sab, 0, 2); this.dat = new Uint8Array(this.sab, 8);
      this.intrSab = new SharedArrayBuffer(4); this.intr = new Int32Array(this.intrSab);
    } else { this.sab = null; this.intrSab = null; }
    this.w = this.createWorker();
    this.w.onmessage = (e) => this._msg(e.data);
    this.w.onerror = (e) => { this._set('error'); this.cb.stderr('Worker error: ' + (e.message || e) + '\n'); if (this._ready) this._ready.rej(e); };
    this.readyPromise = new Promise((res, rej) => { this._ready = { res, rej }; });
    this.w.postMessage({ type: 'init', base: this.base, sab: this.sab, intr: this.intrSab });
    return this.readyPromise;
  }

  _msg(m) {
    switch (m.type) {
      case 'stdout': this.cb.stdout(m.text); break;
      case 'stderr': this.cb.stderr(m.text); break;
      case 'plot': this.cb.plot(m.png, m.svg); break;
      case 'pkg': this.cb.pkg(m.msg); break;
      case 'ready': this.info = m; this._set('ready'); this._ready && this._ready.res(m); break;
      case 'running': if (this.status !== 'waiting' || !this.live) this._set('running'); break;
      case 'needInput': if (this.live) { this._set('waiting'); this.cb.needInput({ prompt: m.prompt, secret: m.secret }); } break;
      case 'done': this._done(m); break;
      case 'result': { const p = this.pending.get(m.id); if (p) { this.pending.delete(m.id); m.error ? p.rej(new Error(m.error)) : p.res(m.value); } break; }
      case 'fatal': {
        if (this._ready && this.status === 'loading') { this._set('error'); this.cb.stderr('Python failed to start: ' + m.error + '\n'); this._ready.rej(new Error(m.error)); }
        const p = this.pending.get(m.id); if (p) { this.pending.delete(m.id); p.rej(new Error(m.error)); }
        break;
      }
    }
  }

  _done(m) {
    clearTimeout(this.stopTimer);
    if (!this.live && m.needInput && !this.stopping) { this._set('waiting'); this.cb.needInput(m.needInput); return; }
    const stopped = this.stopping; this.stopping = false;
    this.cb.changes(m.changes || {});
    this._set(stopped ? 'stopped' : m.ok ? 'done' : 'error');
    const r = this._run; this._run = null; r && r.res({ ok: m.ok && !stopped, stopped });
  }

  /** Run a program. Resolves when it finished, failed, or was stopped. */
  run({ code, filename, files }) {
    if (this.status !== 'ready' && this.status !== 'done' && this.status !== 'error' && this.status !== 'stopped') return Promise.resolve({ ok: false, rejected: true });
    this.job = { code, filename, files }; this.answers = []; this.seed = Math.floor(Math.random() * 2147483647);
    this.stopping = false;
    return new Promise((res) => { this._run = { res }; this._exec(); });
  }
  _exec() {
    if (this.intr) this.intr[0] = 0;        // cleared here (not in the worker) so a Stop sent right after Run is never lost
    this._set('running');
    this.w.postMessage({ type: 'run', ...this.job, mode: this.live ? 'live' : 'replay', answers: this.answers, seed: this.seed });
  }

  submitInput(text) {
    if (this.status !== 'waiting') return;
    if (this.live) {
      const bytes = new TextEncoder().encode(String(text)).subarray(0, MAX_INPUT);
      this.dat.set(bytes); Atomics.store(this.ctrl, 1, bytes.length); Atomics.store(this.ctrl, 0, 1); Atomics.notify(this.ctrl, 0);
      this._set('running');
    } else {
      this.answers.push(String(text)); this.cb.reset(); this._exec();
    }
  }

  stop() {
    if (!this.busy) return;
    this.stopping = true;
    if (!this.live) { this._hardRestart(); return; }
    this.intr[0] = 2;                                        // SIGINT -> KeyboardInterrupt at the next Python instruction
    if (this.status === 'waiting') { Atomics.store(this.ctrl, 0, 2); Atomics.notify(this.ctrl, 0); }
    clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => { if (this.busy) this._hardRestart(); }, 2500);   // stuck in native code: kill the worker
  }

  _hardRestart() {
    clearTimeout(this.stopTimer);
    try { this.w.terminate(); } catch (e) { /* ignore */ }
    for (const p of this.pending.values()) p.rej(new Error('Python restarted'));
    this.pending.clear();
    const r = this._run; this._run = null;
    this.stopping = false;
    this.cb.stopped();
    r && r.res({ ok: false, stopped: true });
    return this.start();
  }
  restart() { this.stopping = false; return this._hardRestart(); }

  _req(msg, timeout = 0) {
    return new Promise((res, rej) => {
      const id = this.nextId++; this.pending.set(id, { res, rej });
      this.w.postMessage({ ...msg, id });
      if (timeout) setTimeout(() => { if (this.pending.delete(id)) res(null); }, timeout);
    });
  }
  async syntax(code) { if (this.busy || this.status === 'loading') return []; try { return (await this._req({ type: 'syntax', code }, 5000)) || []; } catch (e) { return []; } }
  async complete(spec) { if (this.busy || this.status === 'loading') return null; try { return await this._req({ type: 'complete', spec }, 1500); } catch (e) { return null; } }
  format(code) { if (this.busy) return Promise.reject(new Error('busy')); return this._req({ type: 'format', code }, 20000); }
  loaded() { return this.busy ? Promise.resolve([]) : this._req({ type: 'loaded' }, 5000); }
  install(name) { return this._req({ type: 'install', name }); }
}
