# NovaOS

NovaOS is a Puter-inspired web desktop with a ProzillaOS-inspired visual style.

## Run locally

```bash
npm install
npm run dev:all
```

Open the Vite URL, normally `http://localhost:5173`. The GitHub page shows source code; the desktop appears only when the app is running.

## Install as a PWA

PWA installation requires a secure context: an HTTPS deployment or localhost. After deploying the app, open it in Chrome/Edge on Android and choose **Install app**. On iPhone/iPad, open the HTTPS URL in Safari, tap **Share**, then **Add to Home Screen**. The NovaOS desktop includes an Install button when the browser provides an install prompt.

For local phone testing, run Vite with a network host and open the computer's LAN address:

```bash
npm run dev:all -- --host 0.0.0.0
```

Then use `http://YOUR_COMPUTER_IP:5173` on the phone. Browser PWA installation may not be available over plain LAN HTTP; deploy over HTTPS for installation.

## Android and iPhone packaging

The current project is PWA-ready. To create store-style native wrappers later, use Capacitor after the web app is deployed/built:

```bash
npm run build
npm install @capacitor/core @capacitor/cli
npx cap init NovaOS com.eduardo.novaos --web-dir dist
npx cap add android
npx cap add ios
npx cap sync
```

Android requires Android Studio; iOS requires macOS and Xcode. The secure proxy should be hosted on HTTPS rather than bundled into a mobile client.

## Proxy safety

The browser uses `/api/proxy?url=...`. The server has an explicit domain allowlist, timeout, DNS private-network blocking, URL rewriting, and response headers. Do not deploy an unrestricted open proxy; add authentication, rate limiting, logging, and stronger HTML sanitization before making it public.
