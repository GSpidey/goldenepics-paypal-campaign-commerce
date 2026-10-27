# GoldenEpics Campaign Commerce

A focused, open-source PayPal Sandbox application: save a campaign brief, generate a proposal, approve a package purchase, verify capture on the server, produce the written campaign package and download it. The wider GoldenEpics Studio remains a separate private project.

## Run locally

Requires Node.js 24 or newer. No third-party packages are needed.

```sh
cp .env.example .env
npm test
npm start
```

Open http://localhost:8789. Set APP_ORIGIN to that exact origin. You can save briefs without provider credentials; proposal generation requires the AI configuration and checkout requires PayPal Sandbox merchant credentials. Connection badges mean configuration is present, not that a live request has been verified.

## Configure providers

Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET from a PayPal Developer **sandbox** application. The client fixes all PayPal requests to api-m.sandbox.paypal.com and never calls the live payment endpoint. Use a separate sandbox buyer account to approve a purchase. The $9 USD starter price is a test price owned by the server.

Set AI_BASE_URL, AI_API_KEY and AI_MODEL for an authorized OpenAI-compatible text-generation provider. The example points to Cloudflare Workers AI; replace YOUR_ACCOUNT_ID and choose an available model. No model/provider is silently provisioned, and the adapter has not yet been verified against an actual account. AI_DAILY_MAX_CALLS bounds proposal/production requests (default 20, maximum 100, zero disables generation). Failed requests consume the allowance conservatively.

Keep .env out of source control. No provider key reaches the browser.

## What it produces

A proposal followed by three hooks, a 30-second script, three captions, a five-card carousel outline and a visual production brief. Deliverables are editable copy downloaded as Markdown. This version does not generate finished image/video assets or publish social posts.

## Payment and recovery

The server validates order ID, internal campaign ID, amount, currency and capture completion before enabling delivery. It reuses stable PayPal request IDs and reads the order before attempting another capture. A lost checkout response enters review and can be reconciled with the same request reference within five hours. Longer or unresolved cases require operator review rather than creating another charge. A failed generation preserves the verified receipt and campaign proposal; uncertain generation outcomes stop for review.

SQLite retains orders and the daily generation allowance across process restarts. A random HttpOnly cookie identifies this browser workspace. Clearing cookies or switching devices loses access to these browser-scoped records; there is no account recovery yet. Keep the same browser through sandbox checkout.

## Hosting

Run one Node process behind an HTTPS reverse proxy on a host with a persistent disk. The service binds 127.0.0.1, so only the reverse proxy should expose it. Set APP_ORIGIN to the exact HTTPS URL and DATABASE_PATH to the persistent SQLite location. Back up the database using SQLite backup facilities, including WAL considerations. Do not place the database on ephemeral container storage. Multi-region replication, account recovery, webhook reconciliation and production billing are outside this hackathon prototype.

## Verification

`npm test` covers server-owned prices, session isolation, payment mismatches, duplicate actions, recovery after lost provider responses, retained paid work, SQLite restart persistence, sandbox redirects and request origin checks. Tests use controlled provider doubles; they are not proof of real PayPal or model success.

See [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) and [docs/DEMO_CHECKLIST.md](docs/DEMO_CHECKLIST.md) for remaining verification.

MIT license. Built with Node.js, SQLite, JavaScript, HTML/CSS, PayPal Orders v2 Sandbox and a configurable text-generation API.
