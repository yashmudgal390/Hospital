# Hospital & Clinic Management Website

A modern, full-stack hospital website and content management system built with Next.js 14, Tailwind CSS, and Supabase.

**Live Demo:** [https://hospital-three-livid.vercel.app/](https://hospital-three-livid.vercel.app/)

## ✨ Features

### Public Frontend
- **Dynamic Content:** Real-time updates from the database without redeploying.
- **Services Showcase:** Dedicated pages for medical services.
- **Health Blog & Gallery:** Fully dynamic gallery grid and markdown-supported health blog.
- **Patient Testimonials:** Clean, interactive UI for collecting and displaying verified patient reviews on the homepage.
- **Emergency Banner:** High-visibility banner for critical contact numbers powered directly by the CMS.
- **Fully Responsive:** Mobile-first design that looks beautiful on all devices and screen sizes.
- **Accessibility:** Built-in accessibility toolbar for adjusting text size, contrast, and more.
- **SEO Optimized:** Dynamic meta tags and clean URL structure for search engine visibility.

### Admin Dashboard (CMS)
- **Secure Authentication:** Cookie-based session management using `iron-session`.
- **Global Settings Manager:** Edit hospital name, tagline, operating hours, SEO tags, and social links instantly.
- **Blog & Gallery CMS:** Create, edit, and delete blog posts and gallery photos.
- **Review Moderation:** A dedicated feedback moderation queue to approve, hide, or permanently delete patient reviews.
- **File Uploads:** Integrated with Supabase Storage for seamless media management, supporting images up to 4MB natively.
- **Contact & Appointment Inbox:** View patient submissions with status tracking directly in the dashboard.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `shadcn/ui` components
- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com))
- **ORM:** Drizzle ORM
- **Authentication:** `iron-session` + bcryptjs
- **Icons:** Lucide React

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd hospital
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of your project and add the following keys:
```env
# Supabase PostgreSQL (Transaction Pooler - Port 6543)
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true"

# Supabase Storage 
NEXT_PUBLIC_SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Admin Authentication
ADMIN_EMAIL="admin@clinic.com"
ADMIN_PASSWORD_HASH="$2b$10$..." # Use bcrypt to generate a hash for your password
SESSION_SECRET="must-be-at-least-32-characters-long-secret"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Dr. Clinic"
```

### 3. Database Setup (Drizzle)
Push the schema to your Supabase database. Note that the Supabase Transaction Pooler (port `6543`) does not support DDL statements reliably, so you must use the direct connection (Session Pooler - port `5432`) to execute `push:pg` or migrations!

```bash
# Example syntax using the direct Session Pooler connection for schema migrations
$env:DATABASE_URL="postgresql://<user>:<password>@db.<project>.supabase.co:5432/postgres"; npx drizzle-kit push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to log into the dashboard.

---

## 📚 Project Structure

- `src/app/(public)`: All public-facing routes (Home, About, Services, Blog, Gallery, Contact).
- `src/app/(admin)`: Secure admin dashboard and CMS panels.
- `src/app/api`: Serverless API routes handling form submissions and admin mutations.
- `src/components`: Reusable UI components (Navbar, Footer, Forms, Tables).
- `src/db`: Drizzle ORM configuration and SQL schema definitions.
- `src/lib`: Utility functions, session management, and settings fetchers.

## 🔒 Security Notes
- The default Vercel deployment utilizes Supabase's IPv4 **Transaction Pooler** (Port `6543`) to prevent Serverless connection exhaustion.
- Admin authentication is handled efficiently without a database roundtrip using encrypted cookies via `iron-session`.
- All `POST` / `PUT` / `DELETE` API routes are protected by robust authorization and payload checks.
