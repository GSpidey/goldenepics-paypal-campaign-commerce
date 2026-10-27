# Demo and release checklist

1. Configure sandbox merchant credentials and a separate sandbox buyer. Configure an authorized text-generation provider and a low daily allowance.
2. Start on the final HTTPS origin with a persistent SQLite database. Confirm both provider connection badges, then verify the providers with the real workflow.
3. Create a campaign for an original product. Save its brief and generate a proposal. Confirm the result uses that brief.
4. Select the $9 USD test package, approve using the sandbox buyer and return in the same browser.
5. Verify payment. Confirm the server receives a completed capture for the saved amount, currency and campaign ID. Click verify again and confirm no duplicate capture.
6. Produce the campaign pack and download it. Refresh and confirm all saved work remains. Review output for unsupported product claims.
7. Restart the service and confirm the same browser can retrieve its order. Open a separate browser/session and confirm it cannot see the first order.
8. Record a public YouTube demo under three minutes: problem (20s), proposal (30s), sandbox checkout and verification (45s), paid delivery and download (40s), recovery and architecture (30s). Never record credentials or payment-account personal details.
9. Confirm repository setup instructions work on a clean Node 24 environment and license/source are complete. Check official event fields and registration before final submission.

No real-money checkout, automatic refund or live billing is included.
