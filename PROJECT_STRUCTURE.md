# AI Summit - Project Structure

This is a monorepo project with separate backend (Express) and frontend (React + Vite) applications.

## Overall Structure

```
/
├── backend/                          # Express.js backend (API server, port 3001)
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── controllers/              # Route handlers
│   │   │   ├── adminController.ts
│   │   │   ├── publicController.ts
│   │   │   ├── registrationController.ts
│   │   │   └── index.ts
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.ts               # Admin authentication
│   │   │   ├── errorHandler.ts
│   │   │   └── index.ts
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── Banner.ts
│   │   │   ├── Event.ts
│   │   │   ├── Registration.ts
│   │   │   ├── Speaker.ts
│   │   │   ├── Sponsor.ts
│   │   │   └── index.ts
│   │   ├── routes/                   # API route definitions
│   │   │   ├── adminRoutes.ts
│   │   │   ├── publicRoutes.ts
│   │   │   ├── registrationRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/                 # Business logic
│   │   │   ├── database.ts           # MongoDB connection
│   │   │   └── gridfs/               # File upload service
│   │   └── validation/               # Input validation
│   │       └── schemas.ts
│   ├── tsconfig.json                 # TypeScript config (Node.js target)
│   └── package.json                  # Backend dependencies
│
├── frontend/                         # React + Vite frontend (port 3000)
│   ├── src/
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.tsx                   # Main App component
│   │   ├── api.ts                    # API client
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Admin.tsx
│   │   └── styles/                   # Component-specific styles
│   │       ├── Home.css
│   │       ├── Login.css
│   │       ├── Register.css
│   │       └── Admin.css
│   ├── public/                       # Static files (served by backend in production)
│   │   ├── index.html                # Old static version
│   │   ├── admin.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── styles.css
│   │   └── test.html
│   ├── index.html                    # Entry point for Vite dev server
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript config (React target)
│   └── package.json                  # Frontend dependencies
│
├── index.html                        # Root index (can be deleted - not needed)
├── MIGRATION_GUIDE.md                # Migration documentation
├── REACT_SETUP.md                    # React setup notes
└── README.md                         # Project README
```

## Development

**Frontend development (port 3000):**

```bash
cd frontend
npm run dev
```

**Backend development (port 3001):**

```bash
cd backend
npm run dev
```

**Or run both from root:**

```bash
npm run dev          # Runs both frontend and backend concurrently
npm run dev:frontend # Frontend only
npm run dev:backend  # Backend only
```

## Building

**Build frontend:**

```bash
cd frontend
npm run build        # Outputs to frontend/dist (served by backend)
```

**Build backend:**

```bash
cd backend
npm run build        # Outputs to backend/dist
```

## API Endpoints

### Public Routes (`/api`)

- `GET /api/home` - Get banner
- `GET /api/speakers` - Get speakers list
- `GET /api/events` - Get events list
- `GET /api/sponsors` - Get sponsors list
- `GET /api/files/:fileId` - Get uploaded file

### Registration Routes (`/api`)

- `POST /api/register` - Create registration (with resume)
- `GET /api/registrations/:id` - Get registration (admin auth required)

### Admin Routes (`/api/admin`)

- `POST /api/admin/banner` - Create banner (admin auth required)
- `POST /api/admin/speakers` - Create speaker (admin auth required)
- `POST /api/admin/events` - Create event (admin auth required)
- `POST /api/admin/sponsors` - Create sponsor (admin auth required)
- `GET /api/admin/registrations` - Get all registrations (admin auth required)
- `PATCH /api/admin/registrations/:id` - Update registration (admin auth required)

## Backend Server Behavior

- Serves backend API routes at `/api/*`
- Serves frontend static files from `frontend/public/`
- Falls back to `frontend/public/index.html` for client-side routing
- Runs on port 3001 (configurable via `PORT` env var)
