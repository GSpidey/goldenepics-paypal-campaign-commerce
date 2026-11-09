# Checkout return update — 2026-11-09

The existing PayPal AI Hackathon entry already includes the original 1:47 video. No submission or video change was needed. This focused 0.3.1 update improves the same demonstrated purchase-to-delivery flow.

Returning from PayPal selects an order already present in the current browser workspace, requests its server-side payment confirmation, then focuses that campaign. It never trusts token, PayerID or paid flags as proof of payment. Cancelled, foreign, malformed and ambiguous returns cannot initiate confirmation. Already verified purchases are reused; an uncertain capture remains recoverable through Check payment. AI production still requires an explicit action. Controls visibly disable while an action runs.

Validation: all 18 tests passed, including new return-flow cases against actual Commerce verification: tampered approved amount, lost capture acknowledgement/reconciliation without another capture, repeated paid returns, cancellation and foreign/ambiguous references. The existing real Workers/Durable SQLite sandbox/tenant-isolation/restart regression passed. Native Wrangler dry-run passed. These tests use synthetic provider responses and do not establish a new real buyer payment.

Native deployment and live asset/UI acceptance will be recorded after completion. Preserve the current Durable Object namespace, encrypted sandbox configuration, six bindings and ten-request daily generation ceiling. No live checkout, self-payment, new order, AI generation or video replacement is required for this update.

Official cutoff remains 2026-11-12T20:00:00Z. Freeze competition source/docs/demo/video after it through the winner announcement. This repository's scope remains the sandbox AI campaign service; the broader Studio stays private.

## Native release and browser acceptance

Source `96be101deed5a46d883c9d8838cb2ca968550a5b` is deployed at 100% as Worker version `e1e27386-8cba-4a2a-a7ba-78bb4fa3af9e`, deployment `6f94c9a2-db82-4ecd-b0fa-54fce6f72ee2` (2026-11-09T21:46:46.748748Z). Retrieved native module SHA256 `764de3f8a70d50718086d2f82718eed2f9a851cb17928dc39da6eddc7006390d` exactly matches the tested bundle. All six bindings and every non-annotation Worker setting match the prior deployment; the existing encryption secret was inherited and the Durable Object namespace was retained.

The live browser loaded the new module and configured connections, filled the existing sample brief without saving, and rejected a well-formed foreign checkout return (including a forged paid flag) with no order card or verified payment. Controls returned to enabled, and the order parameter was cleared. The canonical demo was left open. No real buyer checkout, new campaign, AI generation or charge occurred. The ordinary public fetch path from the API execution environment returned an access restriction, so public UI acceptance used the actual browser rather than claiming that fetch path succeeded.

The existing Devpost video remains attached and embedded; its signed-out page loads with the correct title/duration. The cloud browser's video stream did not advance, so full playback remains unverified here. No Devpost field, video URL or competition identity changed.
