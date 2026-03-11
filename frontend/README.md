# BidWise Frontend Prototype

BidWise is a complete frontend prototype of a reverse bidding SaaS platform built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI components, and Zustand state management.

This project uses mock data and a simulated API layer, so the full reverse bidding workflow can be tested without any backend.

## Features

- Public pages: landing, register, login, forgot password
- Buyer flow: dashboard, create project, project details, bid comparison, accept/reject bid, contract view
- Seller flow: dashboard, browse projects with filters, project details, place bid modal, my bids, seller profile
- Admin flow: dashboard metrics/charts, user management, moderation, dispute resolution
- Shared modules: messaging UI (with attachment mock + notification indicator), notifications, settings, reviews/ratings
- Simulated service layer in `features/services/api.ts`
- Strongly typed domain models in `types/index.ts`

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style reusable UI components
- Zustand

## Project Structure

- `app/` routes and layouts
- `components/` reusable UI/layout/domain components
- `features/` state store and API simulation
- `hooks/` reusable hooks
- `mock-data/` seeded buyers, sellers, admin, projects, bids, messages, contracts
- `types/` TypeScript interfaces and domain types
- `utils/` shared utility helpers

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Open:

- [http://localhost:3000](http://localhost:3000)

## Demo Accounts

Use these emails on `/login` (password is mock-only and not validated):

- Buyer: `buyer@bidwise.com`
- Seller: `seller@bidwise.com`
- Seller: `seller2@bidwise.com`
- Seller: `seller3@bidwise.com`
- Admin: `admin@bidwise.com`

## Reverse Bidding Workflow (Mock)

1. Login as buyer and create a project.
2. Login as seller and place bids on open projects.
3. Login as buyer and compare bids in Buyer Bid Comparison.
4. Accept the lowest (or any) bid from project details.
5. View generated order/contract data.
6. Use messaging, notifications, settings, and reviews to test end-to-end UX.

## Notes

- All data is mock data stored in Zustand; updates are immediate in UI.
- API-like calls are simulated in `features/services/api.ts` using delays and store actions.
- No backend, database, or real authentication is required.
