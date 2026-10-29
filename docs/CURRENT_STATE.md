# Current state — 2026-10-28

The hosted campaign workspace is deployed at https://goldenepics-campaign-commerce.wispy-silence-1cb0.workers.dev/ . Cloudflare account 7349e3ce28f93aafff1618088bf5afac, Worker goldenepics-campaign-commerce, durable class CampaignCommerce, named instance campaign-commerce-v1. The Cloudflare API accepted the upload and enabled its workers.dev route; browser verification loaded the live app.

Version 0.2.0 adds the Cloudflare adapter while preserving the existing repository and Node workflow. Orders, budgets, locks and encrypted provider configuration use durable SQLite. CREDENTIAL_KEY is a Worker secret; preserve it. Setup is closed by default, enabled only by a temporary secret token plus expiry, and closes after successful sandbox verification. No PayPal credentials have been installed yet. The bootstrap token and expiry are currently absent.

All 15 tests passed, including an actual Miniflare Workers runtime test covering credential sealing, redirect rejection, sandbox checkout/capture/delivery with controlled provider doubles, duplicate capture prevention, session isolation, and state/configuration recovery after a complete runtime restart. These tests do not constitute a real PayPal purchase.

The live UI saved the built-in RiseQuest sample brief (order prefix a3f5ca71) and made one real Workers AI request. The returned proposal, Rise to the Quest, reflects the supplied companion-app brief and contains three hooks, visual guidance and a production plan. The global AI request ceiling is ten per UTC day. Model: @cf/meta/llama-3.3-70b-instruct-fp8-fast.

The PayPal plugin connection was confirmed. Secure browser sign-in and email verification reached the Developer dashboard, sandbox mode, and its existing Default Application. During a prolonged tool interruption the cloud browser session reset; a fresh dashboard visit now requires sign-in again. No sandbox secret, buyer password or access token was printed or copied. Resume the existing browser tab if available; never claim the current session is authenticated solely from this earlier success.

Next: restore PayPal Developer sign-in, install existing sandbox merchant credentials through the one-time encrypted setup, and use a separate sandbox buyer to complete one real sandbox checkout and delivery. Check duplicate capture, deployed restart recovery and cross-session isolation. Record the public demo and verify the official PayPal event requirements and registration before final submission. The entry is not yet submission-ready.

Preserve the private Studio and Qloo separation. All payment requests are sandbox-only.

## Sandbox connection — October 29, 2026 UTC

Fresh secure PayPal Developer sign-in succeeded. The existing sandbox Default Application credentials were transferred directly between the browser credential-copy controls and the authorized app setup form, without printing the secret. The server verified sandbox OAuth and stored the configuration encrypted using its existing CREDENTIAL_KEY. Both temporary SETUP_TOKEN and SETUP_EXPIRES bindings were removed after setup succeeded. Preserve CREDENTIAL_KEY and durable configuration.

The original saved RiseQuest proposal remains available. Checkout created an actual PayPal sandbox order and redirected to PayPal's sandbox buyer sign-in. Buyer approval, capture and delivery are still pending; the login must use a separate sandbox buyer. No live payment or payout occurred.

The secure sandbox buyer sign-in attempt was submitted but PayPal reported incorrect information. Buyer approval and capture remain unverified. Continue through the saved checkout with the separate personal sandbox test account; do not use the merchant or live login. The developer buyer-account page remains available in the browser.
