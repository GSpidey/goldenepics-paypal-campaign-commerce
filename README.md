# GoldenEpics Campaign Commerce

A campaign workspace for small businesses and independent creatives: save a brief, explore an AI proposal, purchase a package through PayPal Sandbox, and collect the campaign copy and production guidance.

Hosted workspace: https://goldenepics-campaign-commerce.wispy-silence-1cb0.workers.dev/

## Cloud deployment

The hosted service runs on Cloudflare Workers with durable SQLite order storage and Workers AI. The worker adapter reuses the same payment verification and commerce logic as the Node service. Browser workspaces retain their proposals, receipts and deliveries across service restarts.

Run `npm ci`, `npm run build:worker`, then `npm test`. `wrangler.jsonc` defines the existing Worker identity, SQLite migration, AI binding and a ten-request daily generation ceiling. Set `APP_ORIGIN` to the deployment URL and provision `CREDENTIAL_KEY` as a 32-byte base64 Worker secret before deploying. Preserve that key across deployments: it encrypts the sandbox configuration in durable storage.

Sandbox provisioning uses an operator-only, one-time setup flow. An operator temporarily sets a high-entropy `SETUP_TOKEN` secret and a short `SETUP_EXPIRES` epoch-millisecond expiry. `/setup` accepts the token and sandbox credentials over HTTPS, verifies PayPal authentication, encrypts the credentials with AES-GCM, and permanently closes setup after successful configuration. Remove the setup bindings afterward. The setup flow remains closed while those bindings are absent. Credentials never appear in app responses, source or exports. Worker request logging is disabled.

The hosted proposal workflow has been verified with a real Workers AI request. PayPal sandbox credential installation and an actual buyer checkout are still pending; see `docs/CURRENT_STATE.md`.

## Run locally

Requires Node.js 24 or newer. The Node service uses built-in modules; the test suite uses Miniflare to exercise the hosted runtime.

```sh
cp .env.example .env
npm ci
npm test
npm start
```

Open http://localhost:8789. Set APP_ORIGIN to that exact origin. You can save briefs without provider credentials; proposal generation requires the AI configuration and checkout requires PayPal Sandbox merchant credentials. Connection badges mean configuration is present, not that a live request has been verified.

## Configure providers

Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET from a PayPal Developer **sandbox** application. The client fixes all PayPal requests to api-m.sandbox.paypal.com and never calls the live payment endpoint. Use a separate sandbox buyer account to approve a purchase. The $9 USD starter price is a test price owned by the server.

Set AI_BASE_URL, AI_API_KEY and AI_MODEL for an authorized OpenAI-compatible text-generation provider. The example points to Cloudflare Workers AI; replace YOUR_ACCOUNT_ID and choose an available model. No model/provider is silently provisioned, and the adapter has not yet been verified against an actual account. AI_DAILY_MAX_CALLS bounds proposal/production requests (default 20, maximum 100, zero disables generation). Failed requests consume the allowance conservatively.

Keep .env out of source control. No provider key reaches the browser.

## What it produces

A proposal followed by three hooks, a 30-second script, three captions, a five-card carousel outline and a visual production brief. Deliverables are editable copy downloaded as Markdown, ready for a creative collaborator to develop.

## Payment and recovery

The server validates order ID, internal campaign ID, amount, currency and capture completion before enabling delivery. It reuses stable PayPal request IDs and reads the order before attempting another capture. A lost checkout response enters review and can be reconciled with the same request reference within five hours. Longer or unresolved cases require operator review rather than creating another charge. A failed generation preserves the verified receipt and campaign proposal; uncertain generation outcomes stop for review.

SQLite retains orders and the daily generation allowance across process restarts. A random HttpOnly cookie identifies this browser workspace. Clearing cookies or switching devices loses access to these browser-scoped records; there is no account recovery yet. Keep the same browser through sandbox checkout.

## Optional Node hosting

Run one Node process behind an HTTPS reverse proxy on a host with a persistent disk. The service binds 127.0.0.1, so only the reverse proxy should expose it. Set APP_ORIGIN to the exact HTTPS URL and DATABASE_PATH to the persistent SQLite location. Back up the database using SQLite backup facilities, including WAL considerations. Do not place the database on ephemeral container storage. Multi-region replication, account recovery, webhook reconciliation and production billing are outside this hackathon prototype.

## Verification

`npm test` covers server-owned prices, session isolation, payment mismatches, duplicate actions, recovery after lost provider responses, retained paid work, SQLite restart persistence, sandbox redirects and request origin checks. Tests use controlled provider doubles; they are not proof of real PayPal or model success.

See [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) and [docs/DEMO_CHECKLIST.md](docs/DEMO_CHECKLIST.md) for remaining verification.

MIT license. Built with Node.js, SQLite, JavaScript, HTML/CSS, PayPal Orders v2 Sandbox and a configurable text-generation API.
