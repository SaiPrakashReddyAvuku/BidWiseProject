# BidWise Frontend

BidWise is a reverse bidding SaaS frontend built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI components, and Zustand state management.

The app is connected to the Spring Boot backend API and reads/writes data from the database through HTTP endpoints.

## Features

- Public pages: landing, register, login, forgot password
- Buyer flow: dashboard, create project, project details, bid comparison, accept/reject bid, contract view
- Seller flow: dashboard, browse projects with filters, project details, place bid modal, my bids, seller profile
- Admin flow: dashboard metrics/charts, user management, moderation, dispute resolution
- Shared modules: messaging UI, notifications, settings, reviews/ratings
- API client layer in `features/services/api.ts`
- Strongly typed domain models in `types/index.ts`

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style reusable UI components
- Zustand

## Project Structure

- `app/` routes and layouts
- `components/` reusable UI/layout/domain components
- `features/` state store and API client
- `hooks/` reusable hooks
- `types/` TypeScript interfaces and domain types
- `utils/` shared utility helpers

## Getting Started

1. Start backend API first (`http://localhost:8080/api`).

2. Configure frontend API base URL:

```bash
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api > .env.local
```

3. Install dependencies:

```bash
npm install
```

4. Start dev server:

```bash
npm run dev
```

5. Open:

- [http://localhost:3000](http://localhost:3000)

## Demo Accounts

Use these seeded accounts on `/login` (password: `password`):

- Buyer: `buyer@bidwise.com`
- Seller: `seller@bidwise.com`
- Seller: `seller2@bidwise.com`
- Admin: `admin@bidwise.com`

## Reverse Bidding Workflow

1. Login as buyer and create a project.
2. Login as seller and place bids on open projects.
3. Login as buyer and compare bids in Buyer Bid Comparison.
4. Accept the lowest (or any) bid from project details.
5. View generated order/contract data.
6. Use messaging, notifications, settings, and reviews to test end-to-end UX.

## Notes

- Core marketplace data is persisted through backend APIs and database.
- `forgot-password` is currently UI simulation only.
- Settings currently persist `name`, `phone`, and `companyName`; password/payment fields are UI placeholders.
