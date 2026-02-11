Ganium web app (landing page + auth + dashboard) (Next.js).

## Getting Started

1) Install dependencies (already present in this repo)

```bash
npm install
```

2) Configure env vars (create `verify-ganium/.env`)

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes

- Public: `/` (landing page)
- Auth: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- App: `/app` (dashboard + scanning tools)

## Notes

- App routes require Supabase auth (unauthenticated users are redirected to `/login`).
# ganium-web
