# BidWise

BidWise is a full-stack reverse bidding platform.

- Buyers create projects.
- Sellers place bids.
- Buyers compare bids and accept the best vendor.

This repository contains:
- `backend/` - Spring Boot API (Java 21, JPA, Security, MySQL)
- `frontend/` - Next.js App Router UI (TypeScript, Tailwind, Zustand)

## 1) Prerequisites

Install these first:
- Git
- Java 21
- Node.js 20+ and npm
- MySQL 8+

Recommended tools:
- VS Code
- IntelliJ IDEA / Eclipse (for backend)

## 2) Download / Clone the Project

### Option A: Clone with Git

```bash
git clone <your-repo-url>
cd Playground
```

### Option B: Download ZIP

1. Download repository ZIP from GitHub.
2. Extract it.
3. Open terminal in extracted `Playground` folder.

## 3) Database Setup (MySQL)

Create database:

```sql
CREATE DATABASE bidwise;
```

## 4) Backend Setup and Run

Open terminal in project root, then:

```bash
cd backend
```

Set environment variables (PowerShell):

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/bidwise"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JPA_DDL_AUTO="update"
$env:JWT_SECRET="replace_with_a_long_random_secret"
$env:JWT_EXPIRATION_MINUTES="120"
```

Run backend:

```bash
./mvnw.cmd spring-boot:run
```

Backend will run on:
- `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 5) Frontend Setup and Run

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Run frontend:

```bash
npm run dev
```

Frontend will run on:
- `http://localhost:3000`

## 6) First-Time Usage

1. Start backend.
2. Start frontend.
3. Open `http://localhost:3000`.
4. Register users (buyer/seller/admin) or use seeded users if available.
5. Test flow:
   - Buyer creates project
   - Seller places bid
   - Buyer compares and accepts bid

## 7) Useful Commands

From `backend/`:

```bash
./mvnw.cmd -q clean verify
```

From `frontend/`:

```bash
npm run build
npm run lint
```

## 8) Environment Variables Summary

Backend:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JPA_DDL_AUTO`
- `JWT_SECRET`
- `JWT_EXPIRATION_MINUTES`

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`

## 9) Notes

- File attachments are currently prototype-level metadata; project details provide downloadable placeholders.
- Theme switching is controlled by `data-theme` and Tailwind dark mode selector.
- If theme styles look stale after config changes, restart frontend dev server.

## 10) Troubleshooting

- `Failed to fetch` in frontend:
  - Confirm backend is running on port `8080`.
  - Confirm `NEXT_PUBLIC_API_BASE_URL` is correct.

- MySQL connection error:
  - Verify database exists.
  - Verify `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

- Port already in use:
  - Stop conflicting app or change port.

## 11) GitHub Push (Quick)

```bash
git add .
git commit -m "docs: add root README with full setup and run guide"
git push
```
