# GoldenEpics Studio — PayPal submission copy
Updated October 29, 2026. Prepared for the PayPal AI Hackathon; final submission pending public YouTube URL and required entrant answers.

## Title
GoldenEpics Studio

## Tagline
Choose an AI campaign service, pay with PayPal, and collect your creative work in one workspace.

## Inspiration
Small businesses and independent creators need a clear way to turn an idea into promotional material—and a straightforward way to purchase the creative work. GoldenEpics Studio brings the proposal, service price, PayPal checkout and results into one connected experience.

## What it does
Describe the product you want to promote, the audience you want to reach and the action you want them to take. AI creates a proposal with campaign hooks and a visual direction.

Review the idea and the package details before purchasing. The Campaign Starter package shows its $9 USD price and included deliverables. Choose PayPal, approve the sandbox purchase and return to the saved campaign.

Payment confirmation enables creation of the purchased AI campaign package: three hooks, a 30-second script, three social captions, a carousel outline and a visual production brief. Read the results in the workspace and download the editable copy for your next promotion.

Your brief, purchase and delivered work stay together in the same campaign.

## Why PayPal is central
PayPal turns the AI workflow into a service customers can purchase through a familiar checkout. Each payment is connected to the selected campaign and its deliverables, giving the customer a clear path from reviewing an idea to paying for and collecting the work.

## How we built it
PayPal REST Orders v2 creates sandbox checkout orders and verifies completed captures against the saved campaign, amount and currency. Cloudflare Workers AI runs Meta Llama 3.3 70B Instruct to create proposals and campaign packages from each customer's brief.

Cloudflare Workers and SQLite-backed Durable Objects preserve campaign and order state. Stored payment references and stable request identifiers support repeated requests and recovery. The public MIT-licensed repository contains the application, setup instructions and tests.

Codex assisted with implementation, debugging, testing and documentation. Async supplied the demo narration, and FFmpeg assembled the captioned walkthrough.

## What we accomplished
A working hosted purchase-to-delivery experience: an AI proposal, a completed PayPal Sandbox purchase, campaign generation and a successful download. The delivered campaign remained available after reloading the workspace.

## What we learned
The most useful AI service connects creative scope, price, payment and delivery. Keeping those steps tied to one campaign makes the experience easier to understand and the purchased work easier to collect.

## Links
- Hosted app: https://goldenepics-campaign-commerce.wispy-silence-1cb0.workers.dev/
- Public source: https://github.com/GSpidey/goldenepics-paypal-campaign-commerce
- Public YouTube demo: PENDING — approved captioned 1:47 export is ready; upload interrupted when YouTube signed the browser out.

## Technical submission answers
Main technology requirement: PayPal REST Orders v2 Sandbox creates the checkout and verifies the completed capture against the server-owned campaign order, amount and currency. Cloudflare Workers AI / Meta Llama 3.3 70B Instruct generates the proposal and purchased creative package. SQLite-backed Durable Objects retain the campaign and its delivery.

Additional listed sponsor tools: None, used other AI tools.

AI tools: Cloudflare Workers AI / Meta Llama 3.3 70B Instruct at runtime; Codex for implementation assistance; Async for the demo narration.

Testing instructions: Open the hosted app in one browser, save a brief and prepare an AI proposal. Review the $9 USD Campaign Starter package and choose PayPal sandbox checkout. Approve with a separate PayPal sandbox buyer account, return to the same browser, choose Check payment, then Create campaign package. Read and download the result. Reload to revisit the saved campaign. The app keeps standalone order access in that browser's session cookie. Sandbox buyer accounts can be managed through the PayPal Developer dashboard. Local setup instructions are in the public README.

## Demo
The final captioned video runs 1:47. It shows the service scope and price, the checkout action, the owner's actual PayPal Sandbox approval screen, and the delivered AI campaign package. The source screenshot's account details are hidden.
