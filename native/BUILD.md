# Building the native app (Android) - fixes the mic earcon

The web app on GitHub Pages is unchanged. This wraps it in a thin native shell
so the microphone uses Android's on-device speech recognizer, which has **no
"start listening" beep** and works offline. The shell loads the live site
(`server.url`), so you do NOT rebuild the app for content changes - only rebuild
if you change native config.

## One-time setup (on your computer)
1. Install **Node.js** (nodejs.org) and **Android Studio** (developer.android.com/studio).
2. Open a terminal in this `native/` folder and run:

   ```
   npm install
   npx cap add android
   npx cap sync
   ```

## Add the microphone permission
Open `native/android/app/src/main/AndroidManifest.xml` and, inside `<manifest>`
(above `<application>`), add:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<queries>
  <intent><action android:name="android.speech.RecognitionService" /></intent>
</queries>
```

Then run `npx cap sync` again.

## Build and install
```
npx cap open android
```
Android Studio opens. Plug in your phone (USB debugging on) and press **Run**,
or use **Build > Generate Signed Bundle / APK** to make an installable APK.

## Notes
- The first launch needs internet (to load the site); afterwards the site's
  service worker caches it for offline use.
- If you later want the app fully self-contained (no internet on first launch),
  remove the `server.url` block from `capacitor.config.json` and copy the repo's
  `index.html`, `service-worker.js`, `manifest.webmanifest` and `icon.svg` into
  `native/www/`, then `npx cap sync`. (You would then rebuild on each release.)
- iOS works the same way with `@capacitor/ios` + `npx cap add ios` (needs a Mac
  + Xcode). The mic code already supports it via the same plugin.
