# DeviceCheck MVP

A frontend-only internal tool for evaluating second-hand electronic devices. It uses React, TypeScript, Tailwind CSS, React Router, and browser `localStorage`—no backend or external APIs.

## Run locally

```bash
npm install
npm run dev
```

## Core workflow

1. Create a new inspection.
2. Enter the device and seller details.
3. Complete the standardized physical, functional, battery, and repair checklist.
4. Review calculated condition, risk, maximum purchase price, and the BUY / REVIEW / REJECT recommendation.
5. Save the record to inventory and open its full details page.

The app seeds realistic demo devices when its `localStorage` key is empty. Saved inspections persist through page refreshes.

## Evaluation logic

The scoring and pricing helpers are in `src/lib/evaluation.ts`.

- Condition score: Physical 25%, Functional 35%, Battery 20%, Parts/Repair 20%.
- Risk: unknown identification/repairs, water damage, failed tests, low battery, and incomplete seller information add deterministic risk points.
- Decision: High risk → REJECT; Medium risk or condition below 60 → REVIEW; otherwise BUY.
- Maximum purchase price: `adjusted market value − repair cost − risk buffer − desired profit`.

Condition grade determines the market-value multiplier, while risk level determines the risk buffer (Low 3%, Medium 7%, High 15%).
