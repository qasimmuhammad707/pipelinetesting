# TicketFlow

A production-grade, ClickUp-style ticket management system built as a **three-tier monorepo**:

- **Frontend** — React 18 + Vite (drag-and-drop Kanban board)
- **Backend** — Node.js + Express REST API with JWT auth
- **Database** — MongoDB (via Mongoose)

Both apps live in one repo as npm workspaces, so a single `npm install` and `npm run dev` boots the whole stack.

---

## Features

- Email/password auth with JWT (register, login, protected routes)
- Workspaces — create, list, update, delete (owner-scoped deletes cascade to tickets)
- Tickets — full CRUD with title, description, status, priority, assignees, tags, due dates
- Kanban board — four columns (To Do / In Progress / In Review / Done) with drag-and-drop between columns
- Per-ticket comments with author avatars
- Search and filter tickets by status, priority, assignee
- Multi-user — assign teammates to tickets, see avatars on cards
- Security hardening — helmet, CORS, rate limiting, compression, input validation

---

## Project structure

```
ticketflow/
├── package.json            # workspace root (runs both apps)
├── docker-compose.yml      # mongo + backend + frontend
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
│       ├── server.js       # Express entry point
│       ├── config/db.js    # MongoDB connection
│       ├── models/         # User, Workspace, Ticket
│       ├── controllers/    # business logic
│       ├── routes/         # API route definitions
│       ├── middleware/     # auth, validation, error handling
│       └── utils/          # JWT helper, seed script
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .env.example
    └── src/
        ├── pages/          # Login, Register, Dashboard, Board
        ├── components/     # Layout, TicketModal
        ├── context/        # AuthContext
        ├── api/            # axios client
        └── utils/          # helpers
```

---

## Quick start (local)

### Prerequisites
- Node.js 20+ (22 recommended)
- A running MongoDB — either local `mongod` on port 27017, or MongoDB Atlas

### 1. Install dependencies
From the repo root:
```bash
npm install
```
This installs both `backend` and `frontend` (npm workspaces).

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Edit `backend/.env` and set a real `JWT_SECRET` and your `MONGO_URI` (see [Environment variables](#environment-variables)).

### 3. Seed demo data (optional)
```bash
npm run seed --workspace=backend
```
Creates a demo workspace, three users, and six tickets.
Login with **admin@ticketflow.dev** / **password123**

### 4. Run both apps
From the repo root:
```bash
npm run dev
```
- Frontend → http://localhost:5173
- Backend API → http://localhost:5000/api

The Vite dev server proxies `/api` to the backend, so there are no CORS issues in development.

---

## Quick start (Docker)

The fastest way to run the entire stack (including MongoDB) with no local Node or Mongo install:

```bash
JWT_SECRET=your_long_random_secret docker compose up --build
```
- Frontend → http://localhost:5173
- Backend → http://localhost:5000
- MongoDB → localhost:27017 (data persisted in a named volume)

To seed demo data into the Dockerized DB:
```bash
docker compose exec backend npm run seed
```

---

## Environment variables

### `backend/.env`
| Variable      | Description                                  | Example                                   |
|---------------|----------------------------------------------|-------------------------------------------|
| `NODE_ENV`    | `development` or `production`                | `development`                             |
| `PORT`        | Port the API listens on                      | `5000`                                     |
| `MONGO_URI`   | MongoDB connection string                    | `mongodb://localhost:27017/ticketflow`     |
| `JWT_SECRET`  | Secret for signing JWTs — **change this**    | `a_long_random_string`                     |
| `JWT_EXPIRE`  | Token lifetime                               | `7d`                                       |
| `CLIENT_URL`  | Frontend origin (for CORS in production)     | `http://localhost:5173`                    |

### `frontend/.env`
| Variable        | Description                          | Example |
|-----------------|--------------------------------------|---------|
| `VITE_API_URL`  | Base URL for API calls               | `/api`  |

In development leave `VITE_API_URL=/api` (the Vite proxy handles it). In production point it at your deployed API origin, e.g. `https://api.yourdomain.com/api`.

---

## API reference

All routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint              | Auth | Description                |
|--------|-----------------------|------|----------------------------|
| POST   | `/auth/register`      | —    | Create account, returns JWT |
| POST   | `/auth/login`         | —    | Login, returns JWT          |
| GET    | `/auth/me`            | ✓    | Current user                |
| GET    | `/auth/users`         | ✓    | List all users              |

### Workspaces
| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| GET    | `/workspaces`       | ✓    | List my workspaces    |
| POST   | `/workspaces`       | ✓    | Create workspace      |
| GET    | `/workspaces/:id`   | ✓    | Get one workspace     |
| PUT    | `/workspaces/:id`   | ✓    | Update workspace      |
| DELETE | `/workspaces/:id`   | ✓    | Delete (owner only)   |

### Tickets
| Method | Endpoint                  | Auth | Description                              |
|--------|---------------------------|------|------------------------------------------|
| GET    | `/tickets`                | ✓    | List tickets (filter via query params)   |
| POST   | `/tickets`                | ✓    | Create ticket                            |
| GET    | `/tickets/:id`            | ✓    | Get one ticket                           |
| PUT    | `/tickets/:id`            | ✓    | Update ticket                            |
| DELETE | `/tickets/:id`            | ✓    | Delete ticket                            |
| POST   | `/tickets/:id/comments`   | ✓    | Add a comment                            |

**Ticket filters** (query params on `GET /tickets`): `workspace`, `status`, `priority`, `assignee`, `search`.

---

## Production notes

- Set a strong, unique `JWT_SECRET` and never commit `.env` files (they're gitignored).
- The frontend Dockerfile builds static assets and serves them via nginx, proxying `/api` to the backend container.
- Rate limiting is set to 500 requests / 15 min per IP on `/api`; tune in `backend/src/server.js`.
- For horizontal scaling, the API is stateless (JWT-based) — run multiple backend replicas behind a load balancer.

---

## Tech stack

| Layer     | Technology                                            |
|-----------|-------------------------------------------------------|
| Frontend  | React 18, React Router, Vite, Axios                   |
| Backend   | Node.js, Express, Mongoose, JWT, bcryptjs             |
| Database  | MongoDB                                                |
| Security  | helmet, cors, express-rate-limit, express-validator   |
| DevOps    | Docker, docker-compose, nginx                         |

---

## Testing status

- Backend: all source files pass syntax checks; the Express app boots and routing, JWT auth guards, input validation, and error/404 handlers are verified via an automated boot test.
- Frontend: production build succeeds (`npm run build`) — all components and imports compile.
- Full DB-backed CRUD flows run the first time you start against a live MongoDB. A seed script is included to populate demo data immediately.

---

## License

MIT
