# NovaOS

NovaOS is a Puter-inspired web desktop with a ProzillaOS-inspired visual style.

## Run the desktop locally

The GitHub repository displays source code; it does not execute the app. To open the actual desktop:

```bash
npm install
npm run dev:all
```

Open the local URL printed by Vite, normally **http://localhost:5173**. Keep that terminal running. `dev:all` starts both the Vite desktop and the local proxy server.

You can also use two terminals:

```bash
npm run dev:server   # terminal 1
npm run dev          # terminal 2
```

## Browser proxy

The Browser app uses `/api/proxy?url=...`. The server validates HTTP(S) URLs, resolves DNS to block private-network targets, applies a domain allowlist, enforces a timeout, rewrites common document URLs, and adds response hardening headers.

The default allowlist contains example.com, MDN, GitHub, and raw GitHub content. Add domains explicitly when developing:

```bash
PROXY_ALLOWLIST=example.com,developer.mozilla.org,nasa.gov npm run dev:server
```

Do not deploy an unrestricted open proxy. Add authentication, rate limiting, logging, a strict allowlist, and stronger HTML sanitization before making it public.

## Build

```bash
npm run build
npm run preview
```
