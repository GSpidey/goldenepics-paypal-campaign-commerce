# Campaign Commerce

This is the complete scoped PayPal hackathon application. Keep the broader Studio private. Read README.md and docs/CURRENT_STATE.md before continuing.

Use sandbox payments only. Verify captured amount, currency, order ID and merchant order association before fulfillment. Preserve paid orders if production fails. Reconcile uncertain payment outcomes before retrying and reuse the same idempotency key. Never expose credentials, invent payment success, or run live charges. Use provider configuration for model access; fixture tests do not establish a real integration. Back up finished task assets to the existing company Google Drive and OneDrive collection.

Lead audience-facing copy with what the app does and the benefit to its users. Keep operational debugging and unrelated project history in engineering records. Preserve the existing repository and deployed Worker identity. Cloud deployment uses the worker/ adapter and durable SQLite; never replace order storage with an ephemeral filesystem.

## PayPal demo communication — October 29, 2026
The owner rejected narration centered on the sample RiseQuest product, implementation mechanics, test reports and unsolicited limitations. Follow docs/DEMO_NARRATION.md: explain how the customer chooses an AI service, sees its scope and price, pays with PayPal, and receives the purchased work. Keep PayPal's contribution central. Distinguish current functionality from the planned wallet and creator-payment roadmap. Read the existing RiseQuest Audience And Attention guidance for the editorial principle; technical judging answers remain accurate and separate from the main narration.
