"""Executed once inside Pyodide (in the Web Worker). Public functions are called from js/worker.js."""
import ast, base64, builtins, importlib, inspect, io, json, linecache, os, random, shutil, sys, traceback
os.environ["MPLBACKEND"] = "AGG"      # figures are rendered to PNG/SVG, there is no GUI toolkit
import js

PROJECT = "/home/pyodide/project"      # working directory of student programs
_last_globals = {}
_mounted = {}


class NeedInput(BaseException):
    """Raised in compatibility (replay) mode to stop the program until the student typed the next answer."""


# ------------------------------------------------------------------ syntax diagnostics
def check_syntax(code):
    try:
        ast.parse(code, "<editor>")
        return "[]"
    except SyntaxError as e:
        end = getattr(e, "end_offset", None)
        return json.dumps([{"line": e.lineno or 1, "col": e.offset or 1, "endLine": getattr(e, "end_lineno", None),
                            "endCol": end, "msg": (e.msg or "SyntaxError")}])
    except Exception as e:
        return json.dumps([{"line": 1, "col": 1, "msg": str(e)}])


# ------------------------------------------------------------------ interactive input
def _read(prompt, secret):
    r = str(js.bsp_input(prompt, secret))
    kind, _, val = r.partition(":")
    if kind == "ok":
        return val
    if kind == "need":
        raise NeedInput()
    raise KeyboardInterrupt()


def _input(prompt=""):
    p = str(prompt)
    sys.stdout.write(p)
    sys.stdout.flush()
    v = _read(p, False)
    sys.stdout.write(v + "\n")
    sys.stdout.flush()
    return v


def _getpass(prompt="Password: ", stream=None):
    p = str(prompt)
    sys.stdout.write(p)
    sys.stdout.flush()
    v = _read(p, True)
    sys.stdout.write("\n")
    sys.stdout.flush()
    return v


class _Stdin:
    encoding = "utf-8"
    def readline(self, size=-1):
        return _input("") + "\n"
    def __iter__(self):
        return self
    def __next__(self):
        try:
            return self.readline()
        except KeyboardInterrupt:
            raise StopIteration
    def isatty(self):
        return False


# ------------------------------------------------------------------ figures
def _flush_figures():
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return
    for num in plt.get_fignums():
        fig = plt.figure(num)
        png = io.BytesIO()
        fig.savefig(png, format="png", dpi=110, bbox_inches="tight", facecolor="white")
        svg = io.StringIO()
        fig.savefig(svg, format="svg", bbox_inches="tight")
        js.bsp_plot(base64.b64encode(png.getvalue()).decode("ascii"), svg.getvalue())
    plt.close("all")


def _patch_matplotlib():
    try:
        import matplotlib
        matplotlib.use("agg", force=True)
        import matplotlib.pyplot as plt
    except ImportError:
        return
    plt.show = lambda *a, **k: _flush_figures()


# ------------------------------------------------------------------ project files <-> Pyodide file system
def mount_files(files_json):
    global _mounted
    files = json.loads(files_json)
    shutil.rmtree(PROJECT, ignore_errors=True)
    os.makedirs(PROJECT, exist_ok=True)
    for path, content in files.items():
        full = os.path.join(PROJECT, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8", newline="") as f:
            f.write(content)
    os.chdir(PROJECT)
    if PROJECT not in sys.path:
        sys.path.insert(0, PROJECT)
    _mounted = dict(files)
    for name, mod in list(sys.modules.items()):      # student modules must be re-imported on every run
        f = getattr(mod, "__file__", None)
        if f and str(f).startswith(PROJECT):
            del sys.modules[name]
    importlib.invalidate_caches()


def collect_changes():
    changed = {}
    for root, dirs, names in os.walk(PROJECT):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for fn in names:
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, PROJECT).replace(os.sep, "/")
            try:
                if os.path.getsize(full) > 1_000_000:
                    continue
                with open(full, encoding="utf-8", newline="") as f:
                    text = f.read()
            except Exception:
                continue                                  # binary / unreadable: not imported into the project
            if _mounted.get(rel) != text:
                changed[rel] = text
    return json.dumps(changed)


# ------------------------------------------------------------------ run
def run_user_code(code, filename="main.py", seed=None):
    global _last_globals
    g = {"__name__": "__main__", "__file__": filename, "__builtins__": builtins}
    _last_globals = g
    builtins.input = _input
    sys.stdin = _Stdin()
    import getpass
    getpass.getpass = _getpass
    sys.argv = [filename]
    if seed is not None:
        random.seed(seed)
        if "numpy" in sys.modules:
            sys.modules["numpy"].random.seed(seed % (2 ** 32))
    linecache.cache[filename] = (len(code), None, code.splitlines(True), filename)
    _patch_matplotlib()
    try:
        exec(compile(code, filename, "exec"), g)
        return True
    except SystemExit:
        return True
    except NeedInput:
        return True
    except KeyboardInterrupt:
        sys.stderr.write("\nKeyboardInterrupt: program stopped\n")
        return False
    except BaseException:
        et, ev, tb = sys.exc_info()
        sys.stderr.write("".join(traceback.format_exception(et, ev, tb.tb_next if tb else None)))
        return False
    finally:
        try:
            _flush_figures()
        except Exception as e:
            sys.stderr.write("Could not render figure: %s\n" % e)
        sys.stdout.flush()
        sys.stderr.flush()


# ------------------------------------------------------------------ editor intelligence backed by the live runtime
def complete_attrs(spec_json):
    """Names for 'obj.<TAB>' using real objects: a loaded module (spec.module) or a variable of the last run (spec.var)."""
    s = json.loads(spec_json)
    obj = None
    if s.get("module"):
        obj = sys.modules.get(s["module"])
        if obj is None:
            parts = s["module"].split(".")
            obj = sys.modules.get(parts[0])
            for p in parts[1:]:
                obj = inspect.getattr_static(obj, p, None) if obj is not None else None
    elif s.get("var"):
        obj = _last_globals.get(s["var"])
    for p in s.get("path", []):
        obj = inspect.getattr_static(obj, p, None) if obj is not None else None
    if obj is None:
        return "null"
    out = []
    for n in dir(obj):
        if n.startswith("_"):
            continue
        try:
            a = inspect.getattr_static(obj, n)
            kind = "class" if inspect.isclass(a) else "function" if callable(a) or isinstance(a, (staticmethod, classmethod)) \
                else "module" if inspect.ismodule(a) else "variable"
        except Exception:
            kind = "variable"
        out.append([n, kind])
    return json.dumps(out)


def format_code(code):
    import autopep8
    return autopep8.fix_code(code, options={"aggressive": 1, "max_line_length": 100})
