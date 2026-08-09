# DeviceCheck — Second-Hand Electronics MVP

## Scenario and problem

This project addresses the second-hand electronics market scenario. The underlying problem is not just inconsistent inspection: the business lacks a traceable decision trail from intake through purchase, repair, availability, and sale. That makes pricing hard to explain and allows risky devices to enter stock.

The primary users are intake employees and managers; the lightweight repair queue supports technicians after a device is purchased.

## What the MVP does

```text
New inspection → score, risk, and price → BUY / REVIEW / REJECT
REVIEW → Inspection History → approve purchase or reject
BUY → Inventory → Repair required → Under repair → Available → Sold
```

- Standardized device, physical, functional, battery, repair-history, and identification checks.
- Deterministic condition score, risk level, price ceiling, expected profit, and margin.
- Seller quote and actual agreed purchase price are compared with the calculated maximum buy price.
- A simple inspection-based warranty summary states covered parts, exclusions, and duration; it is guidance only, not warranty-claim management.
- Inspection History retains every assessed device; active Inventory contains accepted purchases only.
- Repair Queue lets a technician take and complete a repair; the item then becomes Available.
- Local serial number and IMEI duplicate checks prevent duplicate active inventory/pending-review records. A rejected historical match requires acknowledgement.
- Mock demo data and browser `localStorage` persistence; no backend or external API.

## Assumptions and deliberate exclusions

All devices, seller details, prices, and repairs are mock data. The identifier check is a local traceability safeguard, not an ownership, stolen-device, or external IMEI lookup.

To preserve scope, this MVP does not include authentication, technician accounts, real marketplace pricing, cloud photo storage, inventory parts, invoices, warranty claims/returns, notifications, or real repair management.

## Run locally

```bash
npm install
npm run dev
```

## Key logic

`src/lib/evaluation.ts` contains the condition, risk, pricing, and recommendation rules. Maximum buy price is calculated as:

`adjusted market value − repair cost − risk buffer − desired profit`

## With five more hours

I would add lightweight role-oriented workspaces—not full authentication or permission management. An inspector would see intake and their incomplete inspections; a manager would see the pending-review/approval queue; and a technician would see only the Repair Queue.
