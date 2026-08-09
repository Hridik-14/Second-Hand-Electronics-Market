# DeviceInspector — Second-Hand Electronics MVP

## Scenario and problem

This project addresses the second-hand electronics market scenario. The business's costliest failure mode is a bad purchase decision — buying a risky or misrepresented device from a seller who is then gone, which the owner says can erase the profit from several good sales. The root cause is inconsistent, undocumented inspection: every employee checks differently, so purchase decisions can't be justified or audited afterward.

This MVP addresses the purchase-decision side of that problem: a standardized inspection produces a deterministic condition score, risk score, and purchase-price ceiling, so a bad buy is caught before money changes hands, with a traceable record from intake through purchase, repair, and sale. Explaining what the business charges a *customer* for a listed device is a related but separate problem — the condition grade and inspection evidence captured here could support that conversation, but this MVP does not build a sale/listing-price calculator (see "With five more hours").

The primary users are intake employees and managers; the lightweight repair queue supports technicians after a device is purchased.

## What the MVP does

```text
Inspection History (home) → New Inspection → score, risk, and price → BUY / REVIEW / REJECT
REVIEW → back to Inspection History → approve purchase or reject
BUY → Inventory → Repair required → Under repair → Available → Sold
```

Inspection History is the landing page. A standalone dashboard was considered and dropped: the owner's stated problems (inconsistent inspection, unexplainable pricing, losses on bad purchases) are about decision quality, not needing an aggregate status view, and a card-based summary would have just duplicated what History already shows with search and filters.

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

In priority order:

1. **Role-oriented pages, not full authentication.** Split Inspector (intake + their in-progress inspections), Manager (pending-review/approval queue), and Technician (Repair Queue only) into separate routes with a lightweight role switcher — no login, no permission system. This matches "employees have different levels of technical knowledge" and keeps each screen scoped to the one decision that role makes, instead of every user seeing every page.
2. **A QA/re-inspection step before a repaired device returns to Available**, closing the loop on "some faults appear only after extended use" — right now completing a repair flips status directly with no re-verification.
