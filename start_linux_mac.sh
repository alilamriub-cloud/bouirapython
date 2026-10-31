#!/bin/sh
cd "$(dirname "$0")"
[ -f www/pyodide/pyodide.asm.wasm ] || { python3 scripts/fetch_pyodide.py && python3 scripts/make_precache.py; }
exec python3 scripts/serve.py --port 8000
