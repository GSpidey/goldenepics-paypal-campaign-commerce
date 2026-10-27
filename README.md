# GoldenEpics Campaign Commerce

AI campaign packages with PayPal sandbox checkout and delivery for small businesses and independent creators.

Status: planning and documentation. Implementation and a functional demonstration are pending.

## Planned workflow

1. Describe a product, audience and campaign goal.
2. Generate a campaign proposal and an accurately priced creative package.
3. Review the package and approve a PayPal sandbox checkout.
4. Verify payment server-side and create the production order.
5. Generate and deliver the purchased campaign outputs with an order receipt and status.

PayPal is central to the purchase-to-delivery workflow. Sandbox transactions will be identified throughout the demonstration.

## Development scope

The submission will include the complete source, interface, AI integration, server-side PayPal order/capture handling, delivery flow, sample inputs, tests and setup instructions for this workflow. Provider credentials will be configured through environment variables.

Reliability work will cover duplicate requests, payment confirmation, order recovery, isolated production failures and accurate order status.

## Milestones

- Verify PayPal sandbox access and select the AI generation integration.
- Implement the brief-to-proposal-to-checkout-to-delivery workflow.
- Validate payment integrity, idempotency and recovery behavior.
- Prepare a reproducible public release, functional judge access and a public demonstration video under three minutes.

Target: PayPal AI Hackathon, November 12, 2026, noon Pacific.
Official rules: https://paypalaihackathon.devpost.com/rules

## Relationship to GoldenEpics Studio

This focused open-source application contributes a commerce capability to GoldenEpics Studio's broader advertising workflow. Its release will be independently runnable with documented provider configuration. Shared components and their provenance will be documented.

Related audience-research project: https://github.com/GSpidey/goldenepics-qloo-creative-agent

## License

MIT. Third-party dependencies retain their respective licenses.
