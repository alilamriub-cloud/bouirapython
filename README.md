# Bouira Python Studio — offline Python IDE for the browser, PWA and Android
*Python Learning Lab – University of Bouira.* Real CPython 3.12 (Pyodide / WebAssembly) running **locally** in a Web Worker. No server executes code, no mock interpreter.
UI languages: العربية (RTL) · English · Français. Python code, editor and console are always left-to-right.

## 1. Quick start
| Where | How |
|---|---|
| **Windows PC** | Double-click `start_windows.bat` (needs Python 3 only to start the tiny local server). First start downloads the runtime once (~100 MB), later starts are offline. |
| **Linux / macOS** | `./start_linux_mac.sh` |
| **Any OS, manual** | `python3 scripts/fetch_pyodide.py` (once, internet) → `python3 scripts/make_precache.py` → `python3 scripts/serve.py` → open <http://localhost:8000> |
| **Android / iPhone (PWA)** | Host the `www/` folder on any **https** site (school server, GitHub Pages…), open it in Chrome, menu → *Install app*. After the first visit finishes caching (Settings → Offline availability = *Ready*) it works in airplane mode. |
| **Android APK** | Optional wrapper in `android/` (see `android/README.md`). |

The ZIP that contains `www/pyodide/` is ready to use; the "source" ZIP only needs `scripts/fetch_pyodide.py` once.

**Why a server at all?** Browsers refuse WebAssembly workers from `file://` (no `fetch`, no service worker, no IndexedDB origin). Opening `index.html` by double-click therefore does **not** work. `serve.py` is ~60 lines of standard-library Python; any static web server works (see headers below).

## 2. Architecture
```
www/                       <- the whole app (static files; this is what you host / install)
  index.html  css/app.css  manifest.webmanifest  sw.js  precache.json
  js/main.js        UI controller: projects, tabs, console, plots, dialogs, PWA
  js/runtime.js     client of the worker: state machine, input(), stop/restart, completion/format/syntax requests
  js/worker.js      Pyodide worker (blocking input via SharedArrayBuffer, replay fallback, interrupts, file mounting)
  js/storage.js     IndexedDB (projects, files, drafts, settings)     js/zipio.js  safe ZIP import/export
  js/i18n.js        ar/en/fr strings                                  js/examples.js  21 chapters, 38 examples/exercises
  js/vendor.bundle.js  CodeMirror 6 + fflate (built from editor/src/lib.js)
  python/runner.py  runs programs, tracebacks, figures, syntax check, introspection, autopep8
  pyodide/          runtime + wheels (created by scripts/fetch_pyodide.py)
scripts/  fetch_pyodide.py  make_precache.py  serve.py  build_editor.sh      tests/  editor/  android/
```

### Interactive `input()` — how it really works
`input()`, `getpass.getpass()` and `sys.stdin.readline()` are replaced inside the worker. The prompt is printed, the **console shows an input field** (no browser pop-ups), and Python waits.
* **Live mode** (page is *cross-origin isolated*, i.e. served with `COOP: same-origin` + `COEP: require-corp`): the worker blocks with `Atomics.wait()` on a `SharedArrayBuffer`; the UI writes the typed text into it. The program keeps its variables, loops and state exactly like a terminal. `OSError: [Errno 29]` cannot occur because Pyodide's stdin is never read.
  Headers come from `serve.py`, **or** from `sw.js`, which adds them to every response — so https static hosting works too (the first visit reloads once).
* **Compatibility mode** (no `SharedArrayBuffer`, e.g. plain `http://192.168.x.x` on a Wi-Fi, or Android System WebView): `input()` stops the program, the console asks for the value, then the program is **re-run from the start** with all previous answers fed in (`random` is re-seeded identically). Correct for deterministic exercises (all bundled examples work). Differences: output is redrawn after every answer; side effects (file writes) repeat; `time`-dependent values differ; a bare `except:` that swallows `BaseException` can hide the pause. The mode in use is shown in the status bar (`live` / `compat`) and in Settings.
* **Stop**: live mode sends `KeyboardInterrupt` through Pyodide's interrupt buffer (works in infinite Python loops and while waiting for input); if the worker does not react within 2.5 s (stuck inside native NumPy code) or in compatibility mode, the worker is killed and restarted (~5 s). Optional auto-stop after N seconds in Settings.
* **Restart** gives a fresh interpreter. Run is disabled while a program runs (no duplicate execution).

### Libraries
Bundled offline (chosen in `scripts/fetch_pyodide.py`): **numpy, pandas, scipy, matplotlib, sympy, statsmodels, scikit-learn, seaborn** (+ dependencies, micropip, autopep8) and the standard library (math, statistics, random, itertools, collections, datetime, decimal, csv, json …). Wheels are loaded lazily when the program imports them (`loadPackagesFromImports`, also following `import helper` into your other project files). The Libraries panel reads the real `pyodide-lock.json` for versions and shows "bundled" vs "not bundled".
More packages: *permanently* — `python scripts/fetch_pyodide.py --add networkx` (any package of the Pyodide distribution), rebuild precache. *Temporarily, online only* — type a name in the Libraries panel (micropip, pure-Python PyPI wheels, lost on restart). Not every PyPI package works in WebAssembly (no sockets/threads/subprocess, no compiled wheels outside Pyodide's list). seaborn and autopep8 are pure-Python wheels fetched from PyPI by the script (not in Pyodide itself).

### Editor
CodeMirror 6: Python highlighting, Darcula theme, line numbers, current-line highlight, folding, bracket matching, auto-closing brackets/quotes, search & replace (Ctrl+F), multiple tabs (separate undo history each), auto-indent after `:` (if/elif/else/for/while/def/class/try/except/finally/with) and dedent after `return/pass/break/continue/raise` and when typing `else:`/`elif:`/`except:`; autocomplete from the **first character** (keywords, built-ins, your identifiers, imported aliases) and, after `module.` / `variable.`, the **real attribute list from the live interpreter** once the library has been loaded by a run (otherwise a curated static list). Syntax errors use Python's own `ast.parse` → red squiggle + hover message (and gutter marker). Format code = autopep8 (Ctrl+Alt+L). Phones get a symbol row (`Tab : () [] {} = == + - _ " ' #`, arrows, undo/redo).
Not provided: semantic diagnostics (undefined names, type errors), jump-to-definition, debugger.

### Files & projects
Projects with folders and multiple files live in IndexedDB. Autosave (default) commits 0.6 s after typing; with autosave off, typing is kept as a **draft** that is recovered on next start (shown as unsaved). Programs run in a virtual project folder: `open("data.txt")`, `pd.read_csv("x.csv")`, `import helper` work; files the program creates/changes (text, ≤1 MB) are added to the project, never over a file you are editing. New/rename/delete (with confirmation)/save as never overwrite silently (name clashes are refused or auto-numbered). Open `.py/.txt/.csv/.json` from the device (file picker), download a `.py`, export/import projects as ZIP. Imports are validated: path traversal, absolute paths, binary files, >2 MB files, >500 entries, >20 MB total are rejected; an imported ZIP always becomes a **new** project.
A file named like a library (`pandas.py`) shadows it; the console warns, and examples are saved as `examples/chNN_name.py`.

### Security notes
Code runs in a Web Worker inside WebAssembly (browser sandbox; no host file access). No network calls are made by the app; the Android wrapper has no INTERNET permission and exposes a single native method (`exportFile`). The service worker only handles same-origin GETs. User text is inserted with `textContent`/escaping. Beware: online `micropip` installs run third-party code.

## 3. Tests (`node tests/run_all.mjs`, needs `npm install` in the project root and `scripts/build_editor.sh` once for editor deps)
**98 automated checks, all passing in the build environment** (Linux, Node 22, real Pyodide 0.27.7 / Python 3.12.7):
| Requirement | Test | Result |
|---|---|---|
| 1 Hello World; 2 multiple `input()`; 3 `int()/float(input())`; 4 input in `while`/`for`; empty input; getpass; `sys.stdin` | `test_runtime.mjs` (real worker, real blocking stdin) and `test_ui.mjs` (typing in the real console form) | pass |
| Conversion error / full traceback with source lines; recover and run again | both | pass |
| 5 Auto-indentation (11 block types, nesting, dedent), brackets/quotes, undo/redo, tabs | `test_editor.mjs` (CodeMirror under jsdom) | pass |
| 6 Autocomplete from first char, module/alias/variable members, live introspection, Enter accepts | `test_editor.mjs`, `test_runtime.mjs` | pass |
| 7 Syntax errors with line/column | `test_runtime.mjs` | pass |
| 8/16 Save → close → reopen; project persistence after "restart"; draft recovery | `test_data.mjs`, `test_ui.mjs` (fake-indexeddb) | pass |
| 9–11 numpy, pandas, SciPy (+ sympy, statsmodels, sklearn, seaborn) | `test_runtime.mjs`, all 38 examples | pass |
| 12 Matplotlib: line, hist, bar, scatter, pie, box, heatmap, normal PDF/CDF → PNG + SVG in Plots tab | `test_runtime.mjs`, `test_ui.mjs` | pass |
| 13 Offline: all files precached; with the network switched off the real `sw.js` serves shell, worker, wasm, wheels with COOP/COEP | `test_pwa.mjs` (simulated SW scope) | pass |
| 15 Stop infinite loop / stop while waiting for input / restart / recover; compat-mode stop | `test_runtime.mjs`, `test_ui.mjs` | pass |
| ZIP safety (zip-slip, bombs, binaries), never-overwrite rules, ar/en/fr completeness, no CDN URLs | `test_data.mjs`, `test_i18n_usage.mjs`, `test_pwa.mjs` | pass |

**Not tested (no browser, phone, Windows or Android SDK was available) — please verify:**
* 14 Responsive behaviour on a real Android phone: CSS layout, soft-keyboard resizing, touch autocomplete, Gboard composition/predictive text with CodeMirror, landscape. Only the view-switching *logic* and the symbol row were tested (jsdom).
* The real browser service-worker flow: registration, the one-time reload that enables cross-origin isolation, `beforeinstallprompt`, installed-PWA offline launch. The SW code itself was run in a simulated scope; `crossOriginIsolated` in Chrome was not observed.
* `start_windows.bat` (written on Linux), the Android wrapper (never compiled), iOS Safari.
* Online `micropip` installation, Pyodide running inside a *real* Web Worker (tests ran the same `worker.js` in a Node worker_thread), performance/memory on low-end phones (scipy/pandas/sklearn need several hundred MB RAM; first import takes several seconds).

## 4. Known limitations
* Not every package works; no threads, sockets, subprocess; `time.sleep` blocks the worker (Stop works).
* Compatibility-mode `input()` re-runs the program (see above). Android System WebView usually lacks cross-origin isolation → compat mode there.
* Output panel is bottom-only (also on desktop). Only dark theme. Arabic/French translate the UI and chapter titles; example code/comments are English.
* Files created by a program are imported only as text ≤ 1 MB; deleted files are not removed from the project; binary files cannot be stored.
* HTTP on a LAN (`serve.py --lan`) has no service worker (not a secure context) → no offline install and compat mode. Use https for phones.
* Releasing: serve `www/` with any static host (Nginx/Apache/GitHub Pages). If you set COOP/COEP yourself, send `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, `application/wasm` for `.wasm`. After updating files re-run `scripts/make_precache.py` so clients refresh their cache.
