# Checkout return update — 2026-11-09

The existing PayPal AI Hackathon entry already includes the original 1:47 video. No submission or video change was needed. This focused 0.3.1 update improves the same demonstrated purchase-to-delivery flow.

Returning from PayPal selects an order already present in the current browser workspace, requests its server-side payment confirmation, then focuses that campaign. It never trusts token, PayerID or paid flags as proof of payment. Cancelled, foreign, malformed and ambiguous returns cannot initiate confirmation. Already verified purchases are reused; an uncertain capture remains recoverable through Check payment. AI production still requires an explicit action. Controls visibly disable while an action runs.

Validation: all 18 tests passed, including new return-flow cases against actual Commerce verification: tampered approved amount, lost capture acknowledgement/reconciliation without another capture, repeated paid returns, cancellation and foreign/ambiguous references. The existing real Workers/Durable SQLite sandbox/tenant-isolation/restart regression passed. Native Wrangler dry-run passed. These tests use synthetic provider responses and do not establish a new real buyer payment.

Native deployment and live asset/UI acceptance will be recorded after completion. Preserve the current Durable Object namespace, encrypted sandbox configuration, six bindings and ten-request daily generation ceiling. No live checkout, self-payment, new order, AI generation or video replacement is required for this update.

Official cutoff remains 2026-11-12T20:00:00Z. Freeze competition source/docs/demo/video after it through the winner announcement. This repository's scope remains the sandbox AI campaign service; the broader Studio stays private.
