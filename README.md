# 🏥 Dr. Clinic — Single-Doctor Clinic Website

A production-ready, fully editable single-doctor clinic website built with **Next.js 14**, **Drizzle ORM + Neon PostgreSQL**, and the **Healing Teal** design system.

---

## ⚡ 5-Step Setup

### Step 1 — Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd hospital
npm install
```

### Step 2 — Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

Generate the admin password hash using the built-in script:

```bash
node -e "const b = require('bcryptjs'); b.hash('YOUR_PASSWORD', 12).then(h => console.log(h))"
```

Paste the output as `ADMIN_PASSWORD_HASH` in `.env.local`.

### Step 3 — Set Up the Database

Push the Drizzle schema to your Neon database:

```bash
npx drizzle-kit push
```

Seed the default `settings` row (run once):

```bash
npx tsx src/db/seed.ts
```

### Step 4 — Initialize shadcn/ui Components

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea label dialog toast sheet table tabs switch badge scroll-area
```

### Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.  
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   └── (admin)/           # Admin panel pages
├── components/
│   ├── layout/            # Navbar, Footer, TopBar
│   ├── admin/             # Admin UI components
│   └── accessibility/     # Accessibility toolbar
├── db/
│   ├── index.ts           # Drizzle client
│   └── schema/            # All schema definitions
├── lib/                   # Utils, auth, email, cloudinary
├── emails/                # React Email templates
└── middleware.ts           # Route protection
```

## 🔐 Environment Variables

See `.env.example` for a full list. Required at minimum:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ADMIN_EMAIL` — Doctor's login email
- `ADMIN_PASSWORD_HASH` — bcrypt hash of the login password
- `SESSION_SECRET` — 32+ character random string for iron-session
- `CLOUDINARY_*` — Cloudinary credentials for image uploads

## 🚀 Deployment

Deploy to **Vercel** with zero configuration. Set all environment variables in the Vercel dashboard. The `DATABASE_URL` from Neon works perfectly in serverless environments.
