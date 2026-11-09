## Current owner instruction — November 9, 2026

The owner reopened this PayPal competition repository for focused improvements before the official submission cutoff, 2026-11-12T20:00:00Z (noon PST). Recheck Devpost status before any later competition mutation. After that cutoff, freeze source, README, deployed demo and video through the winner announcement; the current official date is December 21. This authorization does not reopen other competition repositories. Preserve the existing submitted 1:47 video and sandbox purchase-to-delivery flow.

Never print image bytes, binary, base64, data URLs, secrets, signed URLs, repository dumps or long logs. Keep output bounded and checkpoint source in Git. Current owner policy supersedes the older backup instruction below: do not create unrequested Google Drive or OneDrive backups.

# Campaign Commerce

This is the complete scoped PayPal hackathon application. Keep the broader Studio private. Read README.md and docs/CURRENT_STATE.md before continuing.

Use sandbox payments only. Verify captured amount, currency, order ID and merchant order association before fulfillment. Preserve paid orders if production fails. Reconcile uncertain payment outcomes before retrying and reuse the same idempotency key. Never expose credentials, invent payment success, or run live charges. Use provider configuration for model access; fixture tests do not establish a real integration. Back up finished task assets to the existing company Google Drive and OneDrive collection.

Lead audience-facing copy with what the app does and the benefit to its users. Keep operational debugging and unrelated project history in engineering records. Preserve the existing repository and deployed Worker identity. Cloud deployment uses the worker/ adapter and durable SQLite; never replace order storage with an ephemeral filesystem.

## PayPal demo communication — October 29, 2026
The owner rejected narration centered on the sample RiseQuest product, implementation mechanics, test reports and unsolicited limitations. Follow docs/DEMO_NARRATION.md: explain how the customer chooses an AI service, sees its scope and price, pays with PayPal, and receives the purchased work. Keep PayPal's contribution central. Distinguish current functionality from the planned wallet and creator-payment roadmap. Read the existing RiseQuest Audience And Attention guidance for the editorial principle; technical judging answers remain accurate and separate from the main narration.
