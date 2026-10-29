# GoldenEpics Campaign Commerce — Devpost draft
Draft prepared October 28, 2026. Not yet submitted. Read the readiness notes below before publishing.

## Title
GoldenEpics Campaign Commerce

## Tagline
Turn a business brief into a creative proposal, pay with PayPal, and collect a ready-to-edit campaign package.

## Inspiration
Small businesses and independent creators often have an idea to promote but lack a clear campaign direction and a simple way to commission the work. GoldenEpics brings the brief, creative proposal, checkout and delivery into one focused workspace.

## What it does
Users describe their product, audience and goal. The app generates an AI proposal with hooks and a visual direction. They can purchase the Campaign Starter package through PayPal Sandbox, then create and download a package containing three hooks, a 30-second script, three captions, a carousel outline and a visual production brief.

Orders retain their proposals, payment references, receipts and deliverables. Payment confirmation checks the saved package amount and currency before enabling production. Interrupted checkout and production steps retain saved work so the same order can be reviewed and recovered.

## How we built it
The application runs on Cloudflare Workers with a Durable Object backed by SQLite. PayPal REST Orders v2 creates sandbox checkout orders and verifies captures. Stable request identifiers and stored order state protect repeated actions. Cloudflare Workers AI runs Meta Llama 3.3 70B Instruct to create campaign proposals and copy packages from the supplied brief.

The public repository contains the complete competition application, its assets, setup instructions, MIT licence and tests.

Codex assisted with implementation, debugging, tests and documentation. Runtime campaign planning is performed by the deployed model API.

## What we learned
Reliable AI commerce needs more than a checkout button: saved scope, verified payments, predictable recovery and clear delivery all have to refer to the same order. Keeping payment confirmation separate from content generation lets paid work remain recoverable if generation needs another attempt.

## Links
- Demo: https://goldenepics-campaign-commerce.wispy-silence-1cb0.workers.dev/
- Public source: https://github.com/GSpidey/goldenepics-paypal-campaign-commerce
- Public YouTube demo: PENDING — record the verified workflow, under three minutes.

## Technical submission answers prepared from evidence
Main technology requirement: PayPal REST Orders v2 Sandbox creates the checkout and confirms the completed capture against the server-owned campaign order, amount and currency. Cloudflare Workers AI, using @cf/meta/llama-3.3-70b-instruct-fp8-fast, creates the campaign proposal and paid copy package. Durable SQLite preserves orders and payment/generation recovery state.
Additional listed sponsor tools: None, used other AI tools.
AI tools used: Cloudflare Workers AI / Meta Llama 3.3 70B Instruct at runtime; Codex for implementation assistance.
Testing: open the demo, save a brief, prepare a proposal, approve the test purchase with a PayPal sandbox buyer account, return, check payment, create the package and download it. Refresh to review the saved order. Repeat payment verification to check the retained receipt. No real money is needed. The public standalone app keeps its order access in this browser's secure session cookie.

## Demo storyboard — target 2 minutes 40 seconds
0:00–0:15: Show the campaign workspace and explain the small-business problem.
0:15–0:45: Save an original brief and show its actual generated proposal.
0:45–1:20: Show the package price, sandbox checkout approval and return. Cut credential entry and personal account information.
1:20–1:50: Show verified payment, generate the campaign package and download.
1:50–2:15: Refresh the saved order and repeat payment verification; show the same receipt.
2:15–2:40: Explain the customer benefit and the PayPal/AI roles over the finished app.
Capture only observed functionality; never substitute staged success screens for a failed payment.
