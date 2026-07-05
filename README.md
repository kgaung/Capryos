# Capryos

Capryos is a React and Netlify site for publishing crypto and business education content. The public site includes blog browsing, newsletter signup, content suggestions, and a visitor signup page. The protected admin area manages posts, subscribers, and suggestions.

## Tech Stack

- React 18, TypeScript, Vite, and Tailwind CSS
- React Router for public and admin routes
- Netlify Functions for server-side API routes under `/api/*`
- Netlify Database with Drizzle ORM for persistent blog, subscriber, and suggestion data
- Netlify Identity for public visitor signup
- Environment-variable protected admin login for the dashboard

## Local Setup

```bash
npm install
npm run dev
```

For Netlify feature emulation, run the site with Netlify Dev:

```bash
/opt/buildhome/node-deps/node_modules/.bin/netlify dev --port 8889
```

## Netlify Configuration

The repository includes `netlify.toml` with the production build command, publish directory, functions directory, and SPA redirects.

Required production environment variables:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

Recommended production environment variable:

```text
ADMIN_SESSION_SECRET
```

Admin credentials must be configured as Netlify site environment variables for the deployed site. In the Netlify dashboard, open the `capryos` site and go to `Project configuration` > `Environment variables`. Add the variables for the production context, then redeploy production so the function runtime receives them.

Do not commit admin credentials to this repository. The public `/signup` route creates a normal Netlify Identity user and does not grant admin dashboard access.

## Admin Access

- Admin login: `/admin/login`
- Dashboard: `/admin`
- Create a post: `/admin/posts/new`
- Manage posts: `/admin/posts`
- Manage subscribers: `/admin/subscribers`
- Manage suggestions: `/admin/suggestions`

If the admin login shows `Admin credentials are not configured`, the deployed Netlify Function cannot read `ADMIN_EMAIL` and `ADMIN_PASSWORD` in that deploy context. Check the exact variable names, make sure they are available to production, and redeploy the site.

## Database

Capryos uses Netlify Database through Drizzle ORM. The schema lives in:

```text
db/schema.ts
```

Database migrations live in:

```text
netlify/database/migrations
```

The currently applied migration creates:

- `blog_posts`
- `subscribers`
- `content_suggestions`

Never edit, rename, or delete an applied migration. If the schema needs to change, update `db/schema.ts` and generate a new migration instead.

## API

The Netlify Function in `netlify/functions/api.ts` handles:

- `POST /api/auth` for admin sign-in
- `GET /api/auth` for current admin session
- `DELETE /api/auth` for sign-out
- `/api/blog_posts` for public and admin post operations
- `/api/subscribers` for newsletter subscribers
- `/api/content_suggestions` for submitted content ideas

Admin-only mutations require a signed HTTP-only session cookie.

## Available Scripts

```bash
npm run dev
npm run lint
npm run preview
npm run build
```

The automatic deployment system runs production validation. Avoid committing generated build output.
