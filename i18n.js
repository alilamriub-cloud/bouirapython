// UI translations. Python code, console output and the editor are always left-to-right.
export const LANGS = { ar: 'العربية', en: 'English', fr: 'Français' };
export const STR = {
  en: {
    appName: 'Bouira Python Studio', subtitle: 'Python Learning Lab – University of Bouira',
    new: 'New', open: 'Open', save: 'Save', run: 'Run', stop: 'Stop', restart: 'Restart', examples: 'Examples', libraries: 'Libraries', settings: 'Settings',
    format: 'Format code', download: 'Download .py', find: 'Find & replace', projects: 'Projects', files: 'Files', editor: 'Editor', output: 'Output', console: 'Console', plots: 'Plots',
    newFile: 'New Python file', newFolder: 'New folder', newProject: 'New project', rename: 'Rename', delete: 'Delete', saveAs: 'Save as…', importFiles: 'Open files from device…',
    exportZip: 'Export project (ZIP)', importZip: 'Import project (ZIP)', cancel: 'Cancel', ok: 'OK', close: 'Close', name: 'Name', more: 'More',
    confirmDelete: 'Delete "{name}" permanently?', confirmDeleteProject: 'Delete project "{name}" and all its files permanently?', exists: '"{name}" already exists.', invalidName: 'Invalid name. Use letters, digits, space, _ - . and /',
    recent: 'Recent projects', emptyProject: 'This project is empty.', draftRecovered: 'Unsaved changes of "{name}" were recovered.', saved: 'Saved', savedAs: 'Saved as {name}', renamedOnImport: '"{old}" existed, imported as "{name}".',
    language: 'Language', fontSize: 'Font size', autosave: 'Auto-save while typing', wrapLines: 'Wrap long lines', timeout: 'Auto-stop long programs after (seconds, 0 = never)',
    installApp: 'Install app', offlineStatus: 'Offline availability', offlineReady: 'Ready: everything is stored on this device.', offlineNotReady: 'Not complete yet ({done}/{total} files cached).', offlineNoSW: 'Service worker unavailable (open via http://localhost or https://).', checkOffline: 'Check again',
    shortcuts: 'Keyboard shortcuts', interactiveMode: 'Interactive input mode', modeLive: 'Live (full terminal-like input, uses SharedArrayBuffer)', modeCompat: 'Compatibility (the program is re-run after each answer; see README)',
    st_loading: 'Python loading…', st_ready: 'Python ready', st_running: 'Program running', st_waiting: 'Waiting for input', st_done: 'Execution completed', st_error: 'Error detected', st_stopped: 'Stopped', st_failed: 'Python failed to start',
    inputPlaceholder: 'Type here and press Enter', send: 'Send', secretInput: 'Hidden input', clearConsole: 'Clear console', noPlots: 'No figures yet. Use matplotlib and plt.show().', savePNG: 'PNG', saveSVG: 'SVG', figure: 'Figure',
    libName: 'Library', libVersion: 'Version', libStatus: 'Status', bundled: 'Bundled offline', stdlib: 'Python standard library', notBundled: 'Not bundled', loadedNow: 'loaded', install: 'Install (needs internet)', installing: 'Installing…', installed: 'Installed for this session', installFailed: 'Installation failed: {err}',
    importExample: 'Import example', installNote: 'Only Pyodide-compatible packages work. Offline-bundled packages need no installation. Pure-Python packages from PyPI can be installed while online (until the app is restarted); to bundle more packages permanently use scripts/fetch_pyodide.py --add NAME.',
    chapters: 'Examples & exercises', exercise: 'Exercise', example: 'Example', opened: 'Opened {name}', copyKept: 'Your own copy is kept; the example was opened as "{name}".',
    projectName: 'Project name', fileName: 'File name', folderName: 'Folder name', zipInvalid: 'This ZIP file is not valid.', zipTooBig: 'ZIP rejected: too many or too large files.', zipSkipped: '{n} file(s) skipped (unsafe, binary or too large).',
    formatFailed: 'Cannot format: {err}', formatBusy: 'Wait until the program has finished.', pythonNotReady: 'Python is still loading…', autoStopped: 'Program stopped automatically after {n} s.',
    about: 'Offline Python ({v}) running locally in your browser with Pyodide. No server is used.', noFile: 'No file open', line: 'Ln', col: 'Col', changedByProgram: 'Files updated by the program: {names}',
    unsaved: 'unsaved', closeTab: 'Close tab', undo: 'Undo', redo: 'Redo', indent: 'Indent', dedent: 'Dedent', offline: 'Offline', online: 'Online', hideKeys: 'Symbol bar',
  },
  fr: {
    appName: 'Bouira Python Studio', subtitle: 'Python Learning Lab – Université de Bouira',
    new: 'Nouveau', open: 'Ouvrir', save: 'Enregistrer', run: 'Exécuter', stop: 'Arrêter', restart: 'Redémarrer', examples: 'Exemples', libraries: 'Bibliothèques', settings: 'Paramètres',
    format: 'Formater le code', download: 'Télécharger .py', find: 'Rechercher / remplacer', projects: 'Projets', files: 'Fichiers', editor: 'Éditeur', output: 'Sortie', console: 'Console', plots: 'Graphiques',
    newFile: 'Nouveau fichier Python', newFolder: 'Nouveau dossier', newProject: 'Nouveau projet', rename: 'Renommer', delete: 'Supprimer', saveAs: 'Enregistrer sous…', importFiles: 'Ouvrir des fichiers de l’appareil…',
    exportZip: 'Exporter le projet (ZIP)', importZip: 'Importer un projet (ZIP)', cancel: 'Annuler', ok: 'OK', close: 'Fermer', name: 'Nom', more: 'Plus',
    confirmDelete: 'Supprimer « {name} » définitivement ?', confirmDeleteProject: 'Supprimer le projet « {name} » et tous ses fichiers définitivement ?', exists: '« {name} » existe déjà.', invalidName: 'Nom invalide. Utilisez lettres, chiffres, espace, _ - . et /',
    recent: 'Projets récents', emptyProject: 'Ce projet est vide.', draftRecovered: 'Les modifications non enregistrées de « {name} » ont été récupérées.', saved: 'Enregistré', savedAs: 'Enregistré sous {name}', renamedOnImport: '« {old} » existait, importé sous « {name} ».',
    language: 'Langue', fontSize: 'Taille de police', autosave: 'Enregistrement automatique', wrapLines: 'Retour à la ligne', timeout: 'Arrêt automatique après (secondes, 0 = jamais)',
    installApp: 'Installer l’application', offlineStatus: 'Disponibilité hors ligne', offlineReady: 'Prêt : tout est stocké sur cet appareil.', offlineNotReady: 'Pas encore complet ({done}/{total} fichiers en cache).', offlineNoSW: 'Service worker indisponible (ouvrir via http://localhost ou https://).', checkOffline: 'Vérifier',
    shortcuts: 'Raccourcis clavier', interactiveMode: 'Mode de saisie interactive', modeLive: 'Direct (saisie type terminal, SharedArrayBuffer)', modeCompat: 'Compatibilité (le programme est relancé après chaque réponse ; voir README)',
    st_loading: 'Chargement de Python…', st_ready: 'Python prêt', st_running: 'Programme en cours', st_waiting: 'En attente de saisie', st_done: 'Exécution terminée', st_error: 'Erreur détectée', st_stopped: 'Arrêté', st_failed: 'Échec du démarrage de Python',
    inputPlaceholder: 'Saisissez puis Entrée', send: 'Envoyer', secretInput: 'Saisie masquée', clearConsole: 'Effacer la console', noPlots: 'Aucune figure. Utilisez matplotlib et plt.show().', savePNG: 'PNG', saveSVG: 'SVG', figure: 'Figure',
    libName: 'Bibliothèque', libVersion: 'Version', libStatus: 'État', bundled: 'Incluse hors ligne', stdlib: 'Bibliothèque standard Python', notBundled: 'Non incluse', loadedNow: 'chargée', install: 'Installer (internet requis)', installing: 'Installation…', installed: 'Installée pour cette session', installFailed: 'Échec de l’installation : {err}',
    importExample: 'Exemple d’import', installNote: 'Seuls les paquets compatibles Pyodide fonctionnent. Les paquets inclus hors ligne ne demandent aucune installation. Les paquets Python purs de PyPI s’installent en ligne (jusqu’au redémarrage) ; pour en inclure d’autres durablement : scripts/fetch_pyodide.py --add NOM.',
    chapters: 'Exemples et exercices', exercise: 'Exercice', example: 'Exemple', opened: '{name} ouvert', copyKept: 'Votre copie est conservée ; l’exemple est ouvert sous « {name} ».',
    projectName: 'Nom du projet', fileName: 'Nom du fichier', folderName: 'Nom du dossier', zipInvalid: 'Ce fichier ZIP n’est pas valide.', zipTooBig: 'ZIP refusé : trop de fichiers ou fichiers trop gros.', zipSkipped: '{n} fichier(s) ignoré(s) (dangereux, binaire ou trop gros).',
    formatFailed: 'Formatage impossible : {err}', formatBusy: 'Attendez la fin du programme.', pythonNotReady: 'Python est en cours de chargement…', autoStopped: 'Programme arrêté automatiquement après {n} s.',
    about: 'Python hors ligne ({v}) exécuté localement dans votre navigateur avec Pyodide. Aucun serveur n’est utilisé.', noFile: 'Aucun fichier ouvert', line: 'L', col: 'Col', changedByProgram: 'Fichiers modifiés par le programme : {names}',
    unsaved: 'non enregistré', closeTab: 'Fermer l’onglet', undo: 'Annuler', redo: 'Rétablir', indent: 'Indenter', dedent: 'Désindenter', offline: 'Hors ligne', online: 'En ligne', hideKeys: 'Barre de symboles',
  },
  ar: {
    appName: 'Bouira Python Studio', subtitle: 'مخبر تعلّم بايثون – جامعة البويرة',
    new: 'جديد', open: 'فتح', save: 'حفظ', run: 'تشغيل', stop: 'إيقاف', restart: 'إعادة التشغيل', examples: 'أمثلة', libraries: 'المكتبات', settings: 'الإعدادات',
    format: 'تنسيق الكود', download: 'تنزيل ‎.py', find: 'بحث واستبدال', projects: 'المشاريع', files: 'الملفات', editor: 'المحرر', output: 'النتائج', console: 'الطرفية', plots: 'الرسوم',
    newFile: 'ملف بايثون جديد', newFolder: 'مجلد جديد', newProject: 'مشروع جديد', rename: 'إعادة تسمية', delete: 'حذف', saveAs: 'حفظ باسم…', importFiles: 'فتح ملفات من الجهاز…',
    exportZip: 'تصدير المشروع (ZIP)', importZip: 'استيراد مشروع (ZIP)', cancel: 'إلغاء', ok: 'موافق', close: 'إغلاق', name: 'الاسم', more: 'المزيد',
    confirmDelete: 'هل تريد حذف "{name}" نهائيًا؟', confirmDeleteProject: 'هل تريد حذف المشروع "{name}" وكل ملفاته نهائيًا؟', exists: '"{name}" موجود مسبقًا.', invalidName: 'اسم غير صالح. استعمل الحروف والأرقام والمسافة و _ - . و /',
    recent: 'المشاريع الأخيرة', emptyProject: 'هذا المشروع فارغ.', draftRecovered: 'تم استرجاع التعديلات غير المحفوظة في "{name}".', saved: 'تم الحفظ', savedAs: 'تم الحفظ باسم {name}', renamedOnImport: '"{old}" موجود، تم الاستيراد باسم "{name}".',
    language: 'اللغة', fontSize: 'حجم الخط', autosave: 'حفظ تلقائي أثناء الكتابة', wrapLines: 'التفاف الأسطر الطويلة', timeout: 'إيقاف البرامج الطويلة تلقائيًا بعد (ثوانٍ، 0 = أبدًا)',
    installApp: 'تثبيت التطبيق', offlineStatus: 'العمل دون اتصال', offlineReady: 'جاهز: كل شيء مخزّن على هذا الجهاز.', offlineNotReady: 'غير مكتمل بعد ({done}/{total} ملف).', offlineNoSW: 'خدمة العامل غير متاحة (افتح عبر http://localhost أو https://).', checkOffline: 'تحقق مجددًا',
    shortcuts: 'اختصارات لوحة المفاتيح', interactiveMode: 'نمط الإدخال التفاعلي', modeLive: 'مباشر (إدخال كالطرفية، SharedArrayBuffer)', modeCompat: 'توافق (يُعاد تشغيل البرنامج بعد كل إجابة؛ انظر README)',
    st_loading: 'جارٍ تحميل بايثون…', st_ready: 'بايثون جاهز', st_running: 'البرنامج قيد التشغيل', st_waiting: 'في انتظار إدخال', st_done: 'اكتمل التنفيذ', st_error: 'تم اكتشاف خطأ', st_stopped: 'تم الإيقاف', st_failed: 'تعذّر تشغيل بايثون',
    inputPlaceholder: 'اكتب ثم اضغط Enter', send: 'إرسال', secretInput: 'إدخال مخفي', clearConsole: 'مسح الطرفية', noPlots: 'لا توجد رسوم بعد. استعمل matplotlib و plt.show().', savePNG: 'PNG', saveSVG: 'SVG', figure: 'شكل',
    libName: 'المكتبة', libVersion: 'الإصدار', libStatus: 'الحالة', bundled: 'مضمّنة دون اتصال', stdlib: 'المكتبة القياسية لبايثون', notBundled: 'غير مضمّنة', loadedNow: 'محمّلة', install: 'تثبيت (يتطلب إنترنت)', installing: 'جارٍ التثبيت…', installed: 'مثبّتة لهذه الجلسة', installFailed: 'فشل التثبيت: {err}',
    importExample: 'مثال الاستيراد', installNote: 'تعمل فقط الحزم المتوافقة مع Pyodide. الحزم المضمّنة لا تحتاج تثبيتًا. يمكن تثبيت حزم بايثون الخالصة من PyPI أثناء الاتصال (حتى إعادة تشغيل التطبيق)؛ ولتضمين حزم أخرى بشكل دائم: scripts/fetch_pyodide.py --add NAME.',
    chapters: 'أمثلة وتمارين', exercise: 'تمرين', example: 'مثال', opened: 'تم فتح {name}', copyKept: 'نسختك محفوظة؛ تم فتح المثال باسم "{name}".',
    projectName: 'اسم المشروع', fileName: 'اسم الملف', folderName: 'اسم المجلد', zipInvalid: 'ملف ZIP غير صالح.', zipTooBig: 'تم رفض ZIP: ملفات كثيرة أو كبيرة جدًا.', zipSkipped: 'تم تجاهل {n} ملف (غير آمن أو ثنائي أو كبير).',
    formatFailed: 'تعذّر التنسيق: {err}', formatBusy: 'انتظر حتى ينتهي البرنامج.', pythonNotReady: 'بايثون ما زال قيد التحميل…', autoStopped: 'تم إيقاف البرنامج تلقائيًا بعد {n} ثانية.',
    about: 'بايثون دون اتصال ({v}) يعمل محليًا في متصفحك عبر Pyodide. لا يُستعمل أي خادم.', noFile: 'لا يوجد ملف مفتوح', line: 'س', col: 'ع', changedByProgram: 'ملفات حدّثها البرنامج: {names}',
    unsaved: 'غير محفوظ', closeTab: 'إغلاق التبويب', undo: 'تراجع', redo: 'إعادة', indent: 'إزاحة', dedent: 'إلغاء الإزاحة', offline: 'دون اتصال', online: 'متصل', hideKeys: 'شريط الرموز',
  },
};

let lang = 'en';
export const getLang = () => lang;
export function setLang(l) { lang = STR[l] ? l : 'en'; }
export function t(key, vars) {
  let s = (STR[lang] && STR[lang][key]) ?? STR.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll('{' + k + '}', v);
  return s;
}
/** Translate all [data-i18n], [data-i18n-title], [data-i18n-ph] elements and flip the UI direction for Arabic. */
export function applyI18n(root = document) {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach(e => { const v = t(e.dataset.i18nTitle); e.title = v; e.setAttribute('aria-label', v); });
  root.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
}
