# Android wrapper (optional)

Open this `android/` folder in Android Studio. Before building, prepare the web app once (from the project root):

    python3 scripts/fetch_pyodide.py && python3 scripts/make_precache.py

Gradle packages `../www` into the APK/AAB assets (about 100 MB). Build > Generate Signed Bundle / APK for release.

Status: written but NOT compiled or run in this environment (no Android SDK/device available). The web code it loads is tested.
Note: Android System WebView generally does not enable cross-origin isolation, so on most phones this wrapper runs the web app in
its *compatibility* input mode (the program is re-run after every `input()` answer). Use Chrome + PWA for the full "live" mode.
