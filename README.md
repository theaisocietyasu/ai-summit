# AI Summit Backend

Backend for the AI Summit event website

## Requirements

- Node.js 18+
- MongoDB 6+

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `ai_summit` | Database name |
| `PORT` | `3000` | Server port |
| `MONGO_MAX_POOL_SIZE` | driver default | Maximum number of connections in the MongoDB pool |
| `MONGO_MIN_POOL_SIZE` | `0` | Minimum number of connections to keep in the MongoDB pool |
| `MONGO_MAX_IDLE_TIME_MS` | driver default | Maximum time in milliseconds a connection can remain idle in the pool |
| `MONGO_WAIT_QUEUE_TIMEOUT_MS` | driver default | Maximum time in milliseconds to wait for a connection from the pool |

## Setup

```bash
npm install
npm run build
npm start
```

For development:
```bash
npm run dev
```

## Admin Credentials

- Username: `admin`
- Password: `admin`

Use Basic Auth for all `/api/admin/*` endpoints.

## API Endpoints

### Public

- `GET /api/home` - Get banner
- `GET /api/speakers` - Get all speakers
- `GET /api/events` - Get all events
- `GET /api/sponsors` - Get all sponsors (sorted by tier)
- `GET /api/files/:fileId` - Get uploaded file

### Registration

- `POST /api/register` - Submit registration (multipart form)
- `GET /api/registrations/:id` - Get registration by ID (admin only)

### Admin (requires Basic Auth)

- `POST /api/admin/banner` - Create banner
- `POST /api/admin/speakers` - Create speaker
- `POST /api/admin/events` - Create event
- `POST /api/admin/sponsors` - Create sponsor
- `GET /api/admin/registrations` - Get all registrations
- `PATCH /api/admin/registrations/:id` - Update registration status

## Registration Validation

- Email must be `@asu.edu` or `@gmail.com`
- `why_attend` min 500 chars (unless Staff)
- Resume required (unless Staff), PDF only, max 5MB
- `photo_release` must be true
