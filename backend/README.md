# BidWise Backend (Spring Boot + JWT Security)

Scalable backend for BidWise reverse-bidding platform.

## Base URL
`http://localhost:8080/api`

## Tech Stack
- Java 21
- Spring Boot 4.0.3
- Spring Web, Spring Data JPA, Validation
- Spring Security + JWT (JJWT)
- Springdoc OpenAPI (Swagger)
- MySQL default profile + H2 test profile

## Security Features
- Password hashing with BCrypt
- JWT token generation on login/register
- Role-based route protection
  - `/api/admin/**` -> `ROLE_ADMIN`
  - `/api/buyer/**` -> `ROLE_BUYER`
  - `/api/seller/**` -> `ROLE_SELLER`
- Public auth routes
  - `/api/auth/login`
  - `/api/auth/register`
- CORS enabled for frontend `http://localhost:3000`

## Default Seed Credentials
All seeded users have password `password`.
- `buyer@bidwise.com`
- `seller@bidwise.com`
- `seller2@bidwise.com`
- `admin@bidwise.com`

## Run
1. Start MySQL with Docker:
```bash
cd backend
docker compose up -d
```

2. Configure backend DB env vars (pick one option):

Option A: use defaults already configured in `application.properties` (`bidwise/bidwise`).

Option B: copy `.env.example` values into your shell before starting backend:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/bidwise?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="bidwise"
$env:DB_PASSWORD="bidwise"
```

3. Start the API:
```bash
./mvnw spring-boot:run
```

4. Stop MySQL when done:
```bash
docker compose down
```

Tests use in-memory H2 automatically via `src/test/resources/application.properties`.

Swagger UI:
- `http://localhost:8080/swagger-ui.html`

## Authorization Header (Protected APIs)
```http
Authorization: Bearer <jwt>
```

## Endpoint Reference

## Auth
## `POST /api/auth/register`
What it does:
- Creates a new user and returns token + user.

Request body:
```json
{
  "name": "John Seller",
  "email": "john@bidwise.com",
  "password": "Secret123",
  "role": "SELLER",
  "phone": "+91-9999999999",
  "companyName": "Seller Labs",
  "skills": ["React", "Spring"]
}
```

Response:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "John Seller",
    "email": "john@bidwise.com",
    "role": "SELLER"
  }
}
```

## `POST /api/auth/login`
What it does:
- Authenticates existing user and returns token + user.

Request body:
```json
{
  "email": "buyer@bidwise.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "Olivia Carter",
    "email": "buyer@bidwise.com",
    "role": "BUYER"
  }
}
```

## Health
## `GET /api/health`
What it does:
- Service health check.

Response:
```json
{
  "status": "UP",
  "service": "bidwise-backend"
}
```

## Common (JWT required)
## `GET /api/users?role=&page=&size=`
What it does:
- Lists users, optionally filtered by role.

Query params:
- `role` optional (`BUYER`, `SELLER`, `ADMIN`)
- `page` optional
- `size` optional

Response:
```json
{
  "content": [ { "id": "...", "name": "..." } ],
  "page": 0,
  "size": 20,
  "totalElements": 10,
  "totalPages": 1
}
```

## `GET /api/users/{id}`
What it does:
- Returns user by id.

Path param:
- `id` user UUID

Response:
- User object.

## `POST /api/messages`
What it does:
- Sends a message.

Request body:
```json
{
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "content": "Hello",
  "attachment": "file.pdf"
}
```

Response:
- Created message object.

## `GET /api/messages?userA={id}&userB={id}`
What it does:
- Returns conversation between two users.

Query params:
- `userA` UUID
- `userB` UUID

Response:
- Array of messages ordered by time.

## `GET /api/notifications?userId={id}&page=0&size=20`
What it does:
- Lists notifications for user.

Response:
- Paginated notifications.

## `PATCH /api/notifications/{id}/read`
What it does:
- Marks notification as read.

Response:
- Updated notification.

## `POST /api/reviews`
What it does:
- Creates review/rating.

Request body:
```json
{
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "rating": 5,
  "comment": "Great work"
}
```

Response:
- Created review.

## `GET /api/reviews?toUserId={id}&page=0&size=20`
What it does:
- Lists reviews for a target user.

Response:
- Paginated reviews.

## `POST /api/disputes`
What it does:
- Creates dispute.

Request body:
```json
{
  "projectId": "uuid",
  "raisedBy": "uuid",
  "against": "uuid",
  "reason": "Scope mismatch"
}
```

Response:
- Created dispute object.

## Buyer (`ROLE_BUYER`)
## `POST /api/buyer/projects`
What it does:
- Creates a project requirement.

Request body:
```json
{
  "buyerId": "uuid",
  "title": "Landing page revamp",
  "description": "Improve conversion",
  "budget": 10000,
  "category": "Design",
  "deadline": "2026-04-20",
  "location": "Remote",
  "attachments": ["brief.pdf"]
}
```

Response:
- Created project.

## `GET /api/buyer/projects?status=&buyerId=&page=&size=`
What it does:
- Lists buyer projects.

Response:
- Paginated projects.

## `GET /api/buyer/projects/{projectId}`
What it does:
- Gets single project.

Response:
- Project object.

## `GET /api/buyer/projects/{projectId}/bids`
What it does:
- Lists bids for project.

Response:
- Array of bids.

## `PATCH /api/buyer/projects/{projectId}/bids/{bidId}/accept`
What it does:
- Accepts bid, rejects others, updates project, creates contract.

Response:
- Contract object.

## `PATCH /api/buyer/projects/{projectId}/bids/{bidId}/reject`
What it does:
- Rejects selected bid.

Response:
- Updated bid.

## Seller (`ROLE_SELLER`)
## `GET /api/seller/projects?status=OPEN&page=0&size=20`
What it does:
- Lists open projects.

Response:
- Paginated projects.

## `POST /api/seller/bids`
What it does:
- Places a bid on project.

Request body:
```json
{
  "projectId": "uuid",
  "sellerId": "uuid",
  "price": 8500,
  "deliveryDays": 15,
  "proposal": "Can deliver in 2 phases"
}
```

Response:
- Created bid object.

## `GET /api/seller/bids?sellerId={id}&page=0&size=20`
What it does:
- Lists seller bids.

Response:
- Paginated bids.

## Admin (`ROLE_ADMIN`)
## `GET /api/admin/users?role=SELLER&page=0&size=20`
What it does:
- Lists users for moderation.

Response:
- Paginated users.

## `PATCH /api/admin/users/{id}/block`
What it does:
- Blocks user.

Response:
- Updated user.

## `PATCH /api/admin/users/{id}/verify`
What it does:
- Verifies vendor/seller.

Response:
- Updated user.

## `GET /api/admin/disputes?status=OPEN&page=0&size=20`
What it does:
- Lists disputes.

Response:
- Paginated disputes.

## `PATCH /api/admin/disputes/{id}/resolve`
What it does:
- Marks dispute as resolved.

Response:
- Updated dispute.

## Frontend Connection
Set frontend env in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Flow:
- UI calls `frontend/features/services/api.ts`
- API client sends request with JWT bearer token
- Backend validates token and role
- Controller -> Service -> Repository -> DB
- Response updates Zustand state/UI
