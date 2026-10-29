# Vidya Rakshak frontend

This directory contains the React dashboard used by school staff. It is a Vite application with Tailwind CSS and React Router.

The frontend is deliberately thin: it handles the screens, navigation, login state, and API calls. Student data, authentication decisions, database writes, and ML requests belong to the backend.

## Screens

The dashboard has separate areas for each role:

- **School admin:** risk overview and staff account management
- **Teacher:** attendance, marks, homework, student summaries, and risk predictions
- **Fee coordinator:** student records and fee status

Routes are protected in [`src/routes.jsx`](./src/routes.jsx). The API client is in [`src/api/client.js`](./src/api/client.js).

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set the local backend URL in `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

Vite exposes only variables beginning with `VITE_` to browser code. Never put MongoDB credentials, JWT secrets, or other private values in this directory’s environment files.

## Build and preview

```bash
npm run lint
npm run build
npm run preview
```

The production build is written to `dist/`.

## Production deployment

The frontend is deployed from this directory on Vercel:

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Production variable:** `VITE_API_URL=https://api.vidyarakshak.in`

The value is also recorded in [`.env.production`](./.env.production) for repository-based builds. The Vercel rewrite in [`vercel.json`](./vercel.json) sends client-side routes back to `index.html`, so refreshing a dashboard route continues to work.
