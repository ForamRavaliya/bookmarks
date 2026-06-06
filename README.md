<img width="1918" height="860" alt="image" src="https://github.com/user-attachments/assets/0b0b2b4a-9d3b-4fcc-bb3c-1c8f0949a9fd" />
<img width="793" height="808" alt="image" src="https://github.com/user-attachments/assets/f0018a02-6f4a-470c-a4de-28bf869396a3" />
<img width="763" height="745" alt="image" src="https://github.com/user-attachments/assets/95c6ed16-febd-4bba-af3d-2e73ff08d8bd" />
<img width="1913" height="866" alt="image" src="https://github.com/user-attachments/assets/133590eb-43f8-463c-82f2-c3f83aef7961" />
<img width="1919" height="859" alt="image" src="https://github.com/user-attachments/assets/66e17388-ba19-4c7f-ba91-06ee3f37c37f" />
<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/8faf45e9-6f39-4105-bdf7-eaa038d13319" />



# 🔖 Bookmarks App

A "Linktree meets Pocket" personal bookmarks app. Save links, keep them private or share a beautiful public profile.

**Tech stack:** Next.js 14 (App Router) · Supabase (auth + PostgreSQL + RLS) · Resend (welcome email) · Vercel

---

## Folder structure

```
bookmarks-app/
├── middleware.js                    # Session refresh + route protection
├── next.config.js
├── package.json
├── .env.local.example
├── supabase/
│   └── schema.sql                  # Run this in Supabase SQL editor
└── src/
    ├── app/
    │   ├── layout.js               # Root layout
    │   ├── globals.css             # All styles
    │   ├── page.js                 # / (home)
    │   ├── signup/page.js          # /signup
    │   ├── login/page.js           # /login
    │   ├── dashboard/
    │   │   ├── page.js             # /dashboard (server component)
    │   │   └── settings/page.js    # /dashboard/settings
    │   ├── [handle]/page.js        # /[handle] (public profile)
    │   └── api/
    │       ├── send-welcome/route.js
    │       └── bookmarks/
    │           ├── route.js        # GET + POST
    │           └── [id]/route.js   # PATCH + DELETE
    ├── components/
    │   ├── DashboardClient.js      # Full dashboard UI
    │   └── SettingsClient.js       # Handle setup form
    └── lib/
        └── supabase/
            ├── client.js           # Browser Supabase client
            └── server.js           # Server Supabase client
```

---

## 1. Run locally

```bash
# Clone / copy the project, then:
cd bookmarks-app
npm install

# Copy the env example and fill in your keys
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Resend credentials

npm run dev
# Open http://localhost:3000
```

---

## 2. Supabase setup

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once the project is ready, open **SQL Editor** (left sidebar).
3. Paste the **entire contents** of `supabase/schema.sql` and click **Run**.
   - This creates the `profiles` and `bookmarks` tables.
   - It also sets up **Row Level Security** policies (critical for privacy).
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Paste these into your `.env.local`.

> **Email confirmation:** By default Supabase requires email confirmation before login works. During development you can disable this under **Authentication → Providers → Email → disable "Confirm email"**.

---

## 3. Resend setup

1. Sign up at [resend.com](https://resend.com).
2. Go to **API Keys** → Create a key → copy it as `RESEND_API_KEY`.
3. Add a verified sending domain (or use Resend's sandbox domain for testing).
4. Set `RESEND_FROM_EMAIL` to an address on your verified domain, e.g. `hello@yourdomain.com`.
5. Paste both into `.env.local`.

> **Tip:** If you don't want to set up Resend immediately, the app still works — the welcome email failure is caught silently and doesn't block signup.

---

## 4. Vercel deploy

```bash
# Install Vercel CLI (optional, you can also use the dashboard)
npm i -g vercel
vercel
```

Or via the Vercel dashboard:

1. Push your code to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → Import project → select the repo.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. Click **Deploy**.

---

## 5. AI agent mistake — and how I fixed it

> **"The AI initially focused on frontend checks for bookmark privacy. I caught that this is not enough because users can call APIs directly. I fixed it by adding Supabase Row Level Security policies so bookmark access is enforced at the database level."**

Concretely, this means:

- The public profile page (`/[handle]`) queries with `is_public = true` on the frontend — but that alone is bypassable.
- The fix: the `schema.sql` RLS policy `"Public can read public bookmarks"` enforces `is_public = true` for anonymous (unauthenticated) requests **at the Postgres level**. Even if someone calls the Supabase REST API directly without going through our frontend, they cannot retrieve private bookmarks.
- Similarly, the `"Users can read own bookmarks"` policy ensures an authenticated user can never read another user's bookmarks — even via direct API calls with their own valid JWT.

---

## 6. One improvement with more time

**Drag-to-reorder with a `position` column.**

Right now bookmarks are sorted by `created_at`. A `position` integer column plus a drag-and-drop UI (e.g. `@dnd-kit/core`) would let users order their public profile links exactly like Linktree. This is the highest-value UX improvement for a "link sharing" app.

---

## Pages at a glance

| Route | Who can access |
|---|---|
| `/` | Everyone |
| `/signup` | Logged-out only |
| `/login` | Logged-out only |
| `/dashboard` | Logged-in only (enforced by middleware + RLS) |
| `/dashboard/settings` | Logged-in only |
| `/[handle]` | Everyone (only public bookmarks shown) |
