# AI Summit Frontend (Next.js)

Next.js frontend for the AI Summit event website.

## Requirements

- Node.js 18+
- Express Backend running on port 3001

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Start the backend (Express server) on port 3001:

```bash
# In another terminal, run your Express backend
npm run dev:backend
```

4. Start the Next.js development server:

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

The frontend uses the API client in `app/lib/api.ts` to communicate with the Express backend.

Available endpoints:

- `GET /api/home` - Get banner
- `GET /api/speakers` - Get all speakers
- `GET /api/events` - Get all events
- `GET /api/sponsors` - Get all sponsors
- `POST /api/register` - Submit registration
- `GET /api/files/:fileId` - Download files

## Backend API

The backend (Express) should be running separately. See the backend README for setup instructions.
