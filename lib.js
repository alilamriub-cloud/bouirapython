// Bundled offline as window.BSPLib: CodeMirror 6 Python editor (Darcula look) + fflate (ZIP).
import { EditorState, Prec, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, highlightSpecialChars, dropCursor } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab, insertNewlineAndIndent, undo, redo, indentMore, indentLess, toggleComment, undoDepth } from "@codemirror/commands";
import { indentOnInput, bracketMatching, syntaxHighlighting, HighlightStyle, indentUnit, foldGutter, foldKeymap } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap, completionStatus } from "@codemirror/autocomplete";
import { linter, lintGutter } from "@codemirror/lint";
import { search, searchKeymap, highlightSelectionMatches, openSearchPanel } from "@codemirror/search";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";

export const fflate = { zipSync, unzipSync, strToU8, strFromU8 };

const C = { bg: "#2B2B2B", fg: "#A9B7C6", gutter: "#313335", gutterFg: "#606366", line: "#323232", sel: "#214283", kw: "#CC7832", str: "#6A8759", num: "#6897BB", com: "#808080", fn: "#FFC66D", builtin: "#8888C6", deco: "#BBB529", self: "#94558D" };
const theme = EditorView.theme({
  "&": { color: C.fg, backgroundColor: C.bg, height: "100%" },
  ".cm-content": { fontFamily: "'JetBrains Mono','Roboto Mono',Menlo,Consolas,monospace", fontSize: "var(--editor-fs, 14px)", caretColor: "#BBBBBB", padding: "4px 0" },
  ".cm-scroller": { overflow: "auto", lineHeight: "1.5", fontFamily: "inherit" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#BBBBBB", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: C.sel },
  ".cm-activeLine": { backgroundColor: C.line },
  ".cm-gutters": { backgroundColor: C.gutter, color: C.gutterFg, border: "none", borderRight: "1px solid #3a3a3a", fontSize: "var(--editor-fs, 14px)" },
  ".cm-activeLineGutter": { backgroundColor: "#3a3d3f", color: "#a4a3a3" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 10px", minWidth: "30px" },
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#3b514d", outline: "1px solid #5a7f78", color: "#ffef28" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#6e2b2b", outline: "1px solid #a33" },
  ".cm-selectionMatch": { backgroundColor: "#3a4a3a" },
  ".cm-foldGutter span": { color: "#606366" },
  ".cm-tooltip": { backgroundColor: "#3C3F41", border: "1px solid #555", color: "#BBBBBB", borderRadius: "6px" },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "inherit", maxHeight: "40vh" },
  ".cm-tooltip-autocomplete > ul > li": { padding: "7px 10px" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "#4B6EAF", color: "#fff" },
  ".cm-completionDetail": { color: "#888", fontStyle: "normal", marginLeft: "8px" },
  ".cm-diagnostic-error": { borderLeft: "4px solid #ff5555", backgroundColor: "#3C3F41", color: "#ddd", padding: "6px 8px", fontSize: "13px" },
  ".cm-lintRange-error": { backgroundImage: "none", textDecoration: "underline wavy #ff5555", textDecorationSkipInk: "none" },
  ".cm-panels": { backgroundColor: "#3C3F41", color: "#ccc" },
  ".cm-panels input, .cm-panels button": { fontSize: "14px" },
  ".cm-searchMatch": { backgroundColor: "#5a4a1f" },
}, { dark: true });
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword], color: C.kw },
  { tag: [t.bool, t.null], color: C.kw }, { tag: t.self, color: C.self },
  { tag: [t.string, t.special(t.string)], color: C.str }, { tag: [t.number, t.integer, t.float], color: C.num },
  { tag: t.comment, color: C.com, fontStyle: "italic" },
  { tag: t.function(t.definition(t.variableName)), color: C.fn }, { tag: t.definition(t.className), color: C.fn },
  { tag: t.standard(t.variableName), color: C.builtin }, { tag: t.meta, color: C.deco },
]);

// ---------------------------------------------------------------- completion
const mem = (s) => s.split(/\s+/).filter(Boolean);
export const KEYWORDS = mem("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case");
export const BUILTINS = mem("abs all any bin bool bytes callable chr complex dict dir divmod enumerate eval exec filter float format frozenset getattr globals hasattr hash help hex id input int isinstance issubclass iter len list locals map max min next object oct open ord pow print property range repr reversed round set setattr slice sorted staticmethod str sum super tuple type vars zip self");
export const MODULES = mem("math statistics random itertools functools collections datetime decimal fractions csv json re os sys time string numpy pandas matplotlib matplotlib.pyplot scipy scipy.stats sympy seaborn statsmodels statsmodels.api sklearn");
export const MEMBERS = {
  math: mem("pi e tau inf nan sqrt pow exp log log2 log10 sin cos tan asin acos atan atan2 sinh cosh tanh degrees radians floor ceil trunc fabs factorial gcd lcm comb perm isclose isnan isinf hypot fsum prod erf gamma dist"),
  statistics: mem("mean fmean geometric_mean harmonic_mean median median_low median_high mode multimode pstdev pvariance stdev variance quantiles correlation covariance linear_regression NormalDist"),
  random: mem("random randint randrange choice choices sample shuffle uniform gauss normalvariate seed betavariate expovariate triangular"),
  decimal: mem("Decimal getcontext ROUND_HALF_UP ROUND_DOWN localcontext"), csv: mem("reader writer DictReader DictWriter"), json: mem("dumps loads dump load"),
  itertools: mem("product permutations combinations chain count cycle groupby islice accumulate zip_longest"), collections: mem("Counter defaultdict OrderedDict deque namedtuple"),
  datetime: mem("datetime date time timedelta timezone"),
  numpy: mem("array arange linspace zeros ones full eye reshape mean median std var sum prod min max argmin argmax sort unique where cumsum diff dot matmul transpose linalg random sqrt exp log sin cos abs round floor ceil clip concatenate percentile corrcoef cov histogram pi e nan inf polyfit polyval"),
  pandas: mem("DataFrame Series read_csv to_datetime concat merge date_range cut get_dummies crosstab pivot_table isna value_counts"),
  "matplotlib.pyplot": mem("plot scatter bar barh hist pie boxplot errorbar fill_between imshow subplots subplot figure show title xlabel ylabel legend grid xlim ylim xticks yticks savefig tight_layout axhline axvline text annotate colorbar close"),
  seaborn: mem("histplot kdeplot scatterplot lineplot barplot boxplot violinplot heatmap pairplot regplot countplot displot jointplot load_dataset set_theme"),
  "scipy.stats": mem("norm t chi2 f binom poisson expon uniform gamma beta ttest_1samp ttest_ind ttest_rel chisquare chi2_contingency pearsonr spearmanr linregress f_oneway mannwhitneyu shapiro zscore sem describe skew kurtosis"),
  scipy: mem("stats optimize integrate linalg interpolate special"),
  sympy: mem("symbols Symbol solve diff integrate limit simplify expand factor Eq sqrt sin cos exp log pi oo Matrix Rational series lambdify latex"),
  "statsmodels.api": mem("OLS WLS GLM Logit add_constant"),
};
const VAR_METHODS = mem("append extend insert remove pop sort reverse index count copy clear keys values items get update join split strip replace upper lower startswith endswith format mean median std var sum min max shape dtype head tail describe info astype reshape tolist apply groupby loc iloc drop dropna fillna rename sort_values value_counts corr plot");
const ALIAS_DEFAULTS = { np: "numpy", pd: "pandas", plt: "matplotlib.pyplot", sns: "seaborn", sp: "sympy", sm: "statsmodels.api" };

export function parseImports(doc) {
  const alias = { ...ALIAS_DEFAULTS }, names = new Set(); let m;
  const reAs = /^[ \t]*import[ \t]+([\w.]+)[ \t]+as[ \t]+(\w+)/gm; while ((m = reAs.exec(doc))) alias[m[2]] = m[1];
  const reImp = /^[ \t]*import[ \t]+([\w., \t]+)$/gm; while ((m = reImp.exec(doc))) m[1].split(",").forEach(s => { const n = s.trim().split(/\s+as\s+/)[0]; if (n && !/\s/.test(n)) alias[n] = alias[n] || n; });
  const reFrom = /^[ \t]*from[ \t]+([\w.]+)[ \t]+import[ \t]+([\w*, \t()]+)/gm;
  while ((m = reFrom.exec(doc))) m[2].replace(/[()]/g, "").split(",").forEach(s => { const p = s.trim().split(/\s+as\s+/); const n = p[p.length - 1]; if (!n || n === "*") return; names.add(n); alias[n] = m[1] + "." + p[0]; });
  return { alias, names };
}

/** @param {{introspect?:(spec:object)=>Promise<[string,string][]|null>}} opts */
export function makeCompletionSource(opts = {}) {
  return async function completions(ctx) {
    const doc = ctx.state.doc.toString();
    const dot = ctx.matchBefore(/[A-Za-z_][\w.]*\.\w*$/);
    if (dot) {
      const text = dot.text, cut = text.lastIndexOf("."), chain = text.slice(0, cut).split("."), from = dot.from + cut + 1;
      const { alias } = parseImports(doc);
      const head = chain[0], isMod = alias[head] !== undefined;
      const modPath = [alias[head] || head, ...chain.slice(1)].join(".");
      let live = null;
      if (opts.introspect) live = await opts.introspect(isMod ? { module: modPath, path: [] } : { var: head, path: chain.slice(1) });
      let options;
      if (live && live.length) options = live.map(([label, type]) => ({ label, type, boost: type === "function" || type === "class" ? 2 : 1, detail: "" }));
      else { const list = MEMBERS[modPath] || (isMod ? [] : VAR_METHODS); options = list.map(l => ({ label: l, type: isMod ? "function" : "method", boost: 2 })); }
      if (ctx.aborted) return null;
      return options.length ? { from, options, validFor: /^\w*$/ } : null;
    }
    const word = ctx.matchBefore(/[A-Za-z_]\w*/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;
    const { alias, names } = parseImports(doc); const seen = new Set(), options = [];
    const add = (label, type, boost = 0, detail) => { if (!seen.has(label)) { seen.add(label); options.push({ label, type, boost, detail }); } };
    KEYWORDS.forEach(k => add(k, "keyword", 1)); BUILTINS.forEach(b => add(b, "function"));
    Object.keys(alias).forEach(a => add(a, "namespace", 2)); names.forEach(n => add(n, "variable", 2)); MODULES.forEach(m => add(m, "namespace", -1, "module"));
    for (const id of new Set(doc.match(/[A-Za-z_]\w{2,}/g) || [])) if (id !== word.text) add(id, "variable", 1);
    return { from: word.from, options, validFor: /^\w*$/ };
  };
}

// ---------------------------------------------------------------- indentation behaviour
export const smartEnter = (view) => {
  const { state } = view; if (completionStatus(state) === "active") return false;
  const sel = state.selection.main; if (!sel.empty) return false;
  const line = state.doc.lineAt(sel.head), before = line.text.slice(0, sel.head - line.from), after = line.text.slice(sel.head - line.from);
  const code = before.replace(/\s+#.*$/, "").trimEnd(), base = /^\s*/.exec(line.text)[0];
  if (code.endsWith(":") && after.trim() === "" && !/^\s*#/.test(before)) {
    view.dispatch({ changes: { from: sel.head, insert: "\n" + base + "    " }, selection: { anchor: sel.head + 5 + base.length }, scrollIntoView: true, userEvent: "input" }); return true;
  }
  if (/^\s*(return|pass|break|continue|raise)\b/.test(before) && base.length >= 4 && after.trim() === "") {
    const ind = base.slice(0, base.length - 4);
    view.dispatch({ changes: { from: sel.head, insert: "\n" + ind }, selection: { anchor: sel.head + 1 + ind.length }, scrollIntoView: true, userEvent: "input" }); return true;
  }
  return insertNewlineAndIndent(view);
};
const dedentOnColon = EditorView.inputHandler.of((view, from, to, text) => {
  if (text !== ":") return false;
  const doc = view.state.doc, line = doc.lineAt(from), upto = line.text.slice(0, from - line.from);
  const m = /^(\s{4,})(else|elif\b.*|except\b.*|finally)\s*$/.exec(upto); if (!m) return false;
  let n = line.number - 1; while (n > 0 && doc.line(n).text.trim() === "") n--; if (n < 1) return false;
  const prev = doc.line(n).text, prevInd = /^\s*/.exec(prev)[0].length;
  if (m[1].length !== prevInd || prev.trimEnd().endsWith(":")) return false;
  view.dispatch({ changes: [{ from: line.from, to: line.from + 4, insert: "" }, { from, to, insert: ":" }], selection: { anchor: from - 3 }, userEvent: "input.type" }); return true;
});

// ---------------------------------------------------------------- editor host
/**
 * One EditorView shared by all tabs; every tab keeps its own EditorState (so undo history, cursor and folds are per file).
 * opts: {onChange, onCursor, syntaxCheck(code)->Promise<[{line,col,msg}]>, introspect(spec), onCommand(name)}
 */
export function createEditorHost(parent, opts = {}) {
  const wrapC = new Compartment();
  const syntaxLinter = linter(async (view) => {
    if (!opts.syntaxCheck) return [];
    const doc = view.state.doc; let errs = [];
    try { errs = (await opts.syntaxCheck(doc.toString())) || []; } catch (e) { return []; }
    return errs.map(e => {
      const ln = Math.min(Math.max(e.line || 1, 1), doc.lines), line = doc.line(ln);
      let from = Math.min(line.from + Math.max((e.col || 1) - 1, 0), line.to), to = Math.min(from + 1, line.to);
      if (from >= line.to) { from = line.from; to = line.to; } else if (e.endLine === e.line && e.endCol > e.col) to = Math.min(line.from + e.endCol - 1, line.to);
      if (to <= from) to = Math.min(line.to, from + 1);
      return { from, to: Math.max(from, to), severity: "error", message: e.msg || "SyntaxError" };
    });
  }, { delay: 500 });
  const cmd = (name) => () => { opts.onCommand && opts.onCommand(name); return true; };
  const extensions = () => [
    lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(), history(), foldGutter(), drawSelection(), dropCursor(),
    EditorState.allowMultipleSelections.of(true), indentOnInput(), bracketMatching(), closeBrackets(),
    autocompletion({ override: [makeCompletionSource({ introspect: opts.introspect })], activateOnTyping: true, maxRenderedOptions: 40 }),
    highlightActiveLine(), highlightSelectionMatches(), search({ top: true }), lintGutter(), syntaxLinter,
    python(), indentUnit.of("    "), EditorState.tabSize.of(4), theme, syntaxHighlighting(highlight, { fallback: true }), dedentOnColon, wrapC.of([]),
    EditorView.contentAttributes.of({ autocapitalize: "off", autocorrect: "off", spellcheck: "false", autocomplete: "off", "data-gramm": "false", enterkeyhint: "enter" }),
    EditorView.editorAttributes.of({ dir: "ltr" }),
    Prec.highest(keymap.of([
      { key: "Mod-Enter", run: cmd("run") }, { key: "Shift-F10", run: cmd("run") }, { key: "F5", run: cmd("run") },
      { key: "Mod-s", run: cmd("save"), preventDefault: true }, { key: "Mod-Alt-l", run: cmd("format"), preventDefault: true }, { key: "Shift-Alt-f", run: cmd("format"), preventDefault: true },
    ])),
    keymap.of([{ key: "Enter", run: smartEnter }, ...closeBracketsKeymap, ...completionKeymap, ...searchKeymap, ...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab, { key: "Mod-/", run: toggleComment }]),
    EditorView.updateListener.of(u => {
      if (u.docChanged && opts.onChange) opts.onChange();
      if ((u.selectionSet || u.docChanged) && opts.onCursor) { const h = u.state.selection.main.head, l = u.state.doc.lineAt(h); opts.onCursor(l.number, h - l.from + 1); }
    }),
  ];
  const view = new EditorView({ parent, state: EditorState.create({ doc: "", extensions: extensions() }) });
  let wrap = false;
  const applyWrap = () => view.dispatch({ effects: wrapC.reconfigure(wrap ? EditorView.lineWrapping : []) });
  return {
    view,
    newState: (doc) => EditorState.create({ doc, extensions: extensions() }),
    setState(state) { view.setState(state); applyWrap(); },
    getState: () => view.state,
    getValue: () => view.state.doc.toString(),
    replaceAll(text) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, userEvent: "input.format" }); },
    insert(text, back = 0) { const r = view.state.selection.main; view.dispatch({ changes: { from: r.from, to: r.to, insert: text }, selection: { anchor: r.from + text.length - back }, userEvent: "input.type", scrollIntoView: true }); },
    undo: () => undo(view), redo: () => redo(view), indent: () => indentMore(view), dedent: () => indentLess(view),
    moveCursor(d) { const r = view.state.selection.main, p = Math.max(0, Math.min(view.state.doc.length, r.head + d)); view.dispatch({ selection: { anchor: p }, scrollIntoView: true }); },
    openSearch: () => openSearchPanel(view), focus: () => view.focus(),
    setWrap(on) { wrap = !!on; applyWrap(); },
    setFontSize(px) { view.dom.style.setProperty("--editor-fs", px + "px"); view.requestMeasure(); },
    canUndo: () => undoDepth(view.state) > 0,
  };
}
