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
| `RESEND_API_KEY` | - | Resend API key for sending transactional emails (format: `re_...`) |
| `EMAIL_FROM` | - | Sender address used in outgoing emails (must be on a verified Resend domain) |
| `NEXT_PUBLIC_SITE_URL` | - | Public site URL with no trailing slash — embedded in QR code check-in links |

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
- `POST /api/admin/checkin` - Validate a QR token and mark attendee as checked in

## Registration Validation

- Email must be `@asu.edu` or `@gmail.com`
- `why_attend` min 50 chars (unless Staff)
- Resume required (unless Staff), PDF only, max 5MB
- `photo_release` must be true

## Email System

Transactional emails are sent via **[Resend](https://resend.com)** (`resend` v6.9.2, `lib/server/email.ts`). All sends are fire-and-forget — a failure does not block registration or status updates, but is logged to the console with an `[email]` prefix.

### Emails sent

| Event | Subject | QR code included |
|-------|---------|-----------------|
| Initial registration submitted | "You're registered for AI Summit!" | Yes |
| Admin sets status → Approved | "Your Registration Has Been Approved!" | Yes |
| Admin sets status → Waitlisted | "Registration Update - Waitlisted" | No |
| Admin sets status → Rejected | "Registration Update" | No |

### Rate limits

Resend's free tier allows **3,000 emails / month**. If volume is expected to exceed this, upgrade the Resend plan before the event.

## QR Code System

### Generation

QR codes are generated server-side using the **`qrcode`** npm package (v1.5.4, `lib/server/qrcode.ts`).

Each registrant receives a unique `qr_token` (UUID v4, created with `crypto.randomUUID()` at registration and stored in the `registrations` collection). The QR code encodes a full check-in URL:

```
https://<NEXT_PUBLIC_SITE_URL>/admin/checkin?token=<qr_token>
```

Generation settings:

| Setting | Value |
|---------|-------|
| Format | PNG (Data URI) |
| Size | 300 × 300 px generated; 200 × 200 px displayed in email |
| Margin | 2 px quiet zone |
| Error correction | H (High — 30% recovery) |
| Colors | `#000000` on `#FFFFFF` |

Encoded URL length is typically 70–100 characters (base path + 36-char UUID), well within the capacity of QR version 3–4 at H error correction.

### Delivery

The QR code PNG is attached inline to approval emails (as a `cid:` embedded image). It is regenerated fresh for each approval send.

### Scanning & check-in

The `/admin/checkin` page uses **`@zxing/browser`** (v0.1.5, dynamically imported) to read QR codes from the device camera in continuous mode.

After a successful scan:
1. The token is extracted from the decoded URL (validated against UUID v4 regex).
2. A `POST /api/admin/checkin` request is made (requires admin session).
3. The endpoint looks up the token in the database and sets `checked_in: true` and `checked_in_at` (Unix timestamp in seconds).

A **3-second debounce** prevents duplicate scans of the same token, and the scanner auto-resets 4 seconds after each scan.

Check-in endpoint response codes:

| Code | Meaning |
|------|---------|
| `200` | Successfully checked in |
| `400` | Invalid token format |
| `403` | Registration not in Approved status |
| `404` | Token not found |
| `409` | Already checked in (returns previous timestamp) |
