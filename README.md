# AI Summit

Next.js app for the AI Summit website (frontend + API routes).

## Requirements

- Node.js 18+
- MongoDB 6+

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | - | MongoDB connection string |
| `DB_NAME` | `ai_summit` | Database name |
| `GRIDFS_BUCKET` | `uploads` | GridFS bucket name |
| `JWT_SECRET` | - | Secret for signing admin session cookies |
| `DISCORD_CLIENT_ID` | - | Discord OAuth client id |
| `DISCORD_CLIENT_SECRET` | - | Discord OAuth client secret |
| `DISCORD_REDIRECT_URI` | - | OAuth callback URL (must match Discord app settings) |
| `DISCORD_GUILD_ID` | - | Discord server (guild) id |
| `DISCORD_BOT_TOKEN` | - | Bot token used to verify guild roles |
| `ALLOWED_LOGIN_ROLE_IDS` | - | Comma-separated role ids allowed to access `/admin` |
| `NEXT_PUBLIC_API_URL` | - | Optional API base URL; if set the frontend calls this instead of same-origin `/api` |

## Setup

```bash
npm install
npm run build
npm start
```

Copy `.env.sample` to `.env.local` and fill in values for local development.

For development:
```bash
npm run dev
```

## API Endpoints

### Auth (Admin)

- `GET /api/auth/discord` - Start Discord sign-in
- `GET /api/auth/discord/callback` - OAuth callback
- `GET /api/auth/session` - Check current admin session (also enforces roles per request)
- `POST /api/auth/logout` - Clear session cookie

### Public

- `GET /api/home` - Get banner
- `GET /api/speakers` - Get all speakers
- `GET /api/events` - Get all events
- `GET /api/sponsors` - Get all sponsors (sorted by tier)
- `GET /api/files/{fileId}` - Get uploaded file (resumes require admin)

## Security

See [../SECURITY_AUDIT_LOG.md](../SECURITY_AUDIT_LOG.md) for security notes and follow-ups.

### Registration

- `POST /api/register` - Submit registration (multipart form)

### Admin (requires Discord session + allowed role)

- `POST /api/admin/banner` - Create banner
- `POST /api/admin/speaker` - Create speaker
- `PUT /api/admin/speaker/{id}` - Update speaker
- `DELETE /api/admin/speaker/{id}` - Delete speaker
- `POST /api/admin/event` - Create event
- `PUT /api/admin/event/{id}` - Update event
- `DELETE /api/admin/event/{id}` - Delete event
- `POST /api/admin/sponsor` - Create sponsor
- `PUT /api/admin/sponsor/{id}` - Update sponsor
- `DELETE /api/admin/sponsor/{id}` - Delete sponsor
- `GET /api/admin/registrations` - Get all registrations
- `PUT /api/admin/registration/{registrationId}/status` - Update registration status

## Registration Validation

- Email must be `@asu.edu` or `@gmail.com`
- `why_attend` min 500 chars (unless Staff)
- Resume required (unless Staff), PDF only, max 5MB
- `photo_release` must be true
