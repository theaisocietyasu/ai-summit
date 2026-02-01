# AI Summit Frontend (Next.js)

Next.js frontend for the AI Summit event website.

## Requirements

- Node.js 18+
- MongoDB 6+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ai_summit
GRIDFS_BUCKET=uploads
JWT_SECRET=change-me

DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
DISCORD_GUILD_ID=...
DISCORD_BOT_TOKEN=...
ALLOWED_LOGIN_ROLE_IDS=...
```

3. Start the Next.js development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  ├── layout.tsx        # Root layout
  ├── page.tsx          # Home page
  ├── globals.css       # Global styles
  └── lib/
      └── api.ts        # API client functions

components/
  └── (Your React components here)
```

## API Integration

The frontend uses the API client in `app/lib/api.ts` to call same-origin Next.js Route Handlers under `/api/*`.

Available endpoints:

- `GET /api/home` - Get banner
- `GET /api/speakers` - Get all speakers
- `GET /api/events` - Get all events
- `GET /api/sponsors` - Get all sponsors
- `POST /api/register` - Submit registration
- `GET /api/files/{fileId}` - Download files (resumes require admin)

## Notes

- Admin authentication uses Discord OAuth and an HTTP-only cookie session.
- Admin endpoints re-check Discord role membership per request.
