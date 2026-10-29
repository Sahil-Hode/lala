# NEXUS INTEL — Cyber Intelligence Platform (Next.js Edition)

Converted from plain PHP/MySQL to a modern, production-grade Next.js (App Router, React 19, TypeScript) application architected for deployment on Vercel.

---

## Overview

**NEXUS INTEL** is a cyber-intelligence themed platform designed with military/defense aesthetics:
- Classified global threat feeds with live threat-level indicators
- Operational metrics & capability matrix
- Surveillance asset gallery with category tagging
- DarkScan WhatsApp extraction comms module with responsive chat playback
- Secure terminal command simulator
- Protected operator control panel (`/admin`) for full content, gallery, feed, and comms management
- Health check verification endpoint (`/api/health`)

---

## Tech Stack & Architecture

- **Framework**: Next.js 16+ (App Router, Server Components by default)
- **Language**: TypeScript (strict types for all database entities and APIs)
- **UI & Styling**: Vanilla Cyber CSS Design System preserving 100% of the original styles (`app/globals.css`), with zero CSS bloat
- **Fonts**: Self-hosted via `next/font/google` (*Orbitron*, *Rajdhani*, *Share Tech Mono*)
- **Database**: MySQL connection pooling via `mysql2/promise` with automatic graceful fallback when running offline or without credentials
- **Authentication**: Stateless, Edge-compatible JWT via `jose`, signed HTTP-only cookies, bcrypt passphrase verification, brute-force protection, and Next.js middleware
- **Image Storage**: External cloud object storage abstraction (`lib/uploads.ts`) supporting Cloudinary in production with automatic fallback for local development

---

## Route Structure

```text
app/
  layout.tsx              # Root layout with Google Cyber fonts & atmosphere layers
  page.tsx                # Public homepage (Server Component)
  globals.css             # Unified cyber design tokens, front site, and admin styles

  api/
    health/route.ts       # Health endpoint verifying DB, tables, & uploads
    content/route.ts      # Public & admin content endpoint
    gallery/route.ts      # Public & admin gallery items endpoint
    feeds/route.ts        # Threat feed endpoint
    chats/route.ts        # Comms contacts & messages endpoint
    admin/
      login/route.ts      # Secure admin login & JWT session creation
      logout/route.ts     # Admin logout & cookie invalidation
      session/route.ts    # Session inspection endpoint
      content/route.ts    # Admin content batch update endpoint
      gallery/route.ts    # Admin gallery CRUD & upload endpoint
      feeds/route.ts      # Admin feed CRUD endpoint
      chats/route.ts      # Admin chat contacts & messages CRUD endpoint

  admin/
    login/page.tsx        # Cyberpunk clearance gate / login interface
    page.tsx              # Command overview & metrics dashboard
    content/page.tsx      # Section-by-section text editor
    gallery/page.tsx      # Surveillance asset manager with image upload
    feeds/page.tsx        # Intel stream broadcast manager
    chats/page.tsx        # WhatsApp extraction manager (contacts & messages)

components/
  public/
    Header.tsx            # Navigation bar & live status
    Hero.tsx              # Full-bleed hero, radar animation, & brand glitch
    Stats.tsx             # 4-metric operational statistics strip
    AgencySection.tsx     # Agency briefing section
    Capabilities.tsx      # 4-module capability matrix
    Gallery.tsx           # Surveillance photo grid
    IntelFeeds.tsx        # Threat-level color-coded live stream
    ChatDump.tsx          # WhatsApp chat interface (search, view, contact switch)
    ContactSection.tsx    # Secure channel intake with typewriter terminal
    Footer.tsx            # Clearance disclaimer & copyright
    UtcClock.tsx          # Real-time ticking UTC clock
    TerminalAnimation.tsx # Terminal typewriter simulator
    ScrollObserver.tsx    # Intersection observer for scroll reveal animations

  admin/
    AdminShell.tsx        # Shell layout for all authenticated admin views
    AdminSidebar.tsx      # Navigation sidebar with active state and logout
    AdminHeader.tsx       # Operator header & flash alert banners
    DashboardCards.tsx    # Overview metrics cards & quick action links
    ContentEditor.tsx     # Accordion-style content editor with live save
    GalleryManager.tsx    # Photo asset manager with previews and deletion
    FeedManager.tsx       # Live feed broadcaster
    ChatManager.tsx       # Dual-tab WhatsApp contact & message editor

lib/
  db.ts                   # MySQL2 connection pool with connectivity tester
  auth.ts                 # JWT signing, verification, and bcrypt hashing
  queries.ts              # Parameterized queries with prepared statements & fallbacks
  validation.ts           # File type, file size, threat level, & string validation
  uploads.ts              # Cloudinary REST integration & local file handling
  defaults.ts             # Default seed data matching schema.sql & chat_migration.sql

types/
  database.ts             # Admin, SiteContent, GalleryItem, IntelFeed, ChatContact, ChatMessage
  content.ts              # Grouped content & dictionary types
  gallery.ts              # Gallery input & category types
  feed.ts                 # Threat levels & feed input types
  chat.ts                 # ChatThread, ContactInput, MessageInput types

middleware.ts             # Edge middleware route protection for /admin/*
```

---

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v24)
- npm or pnpm
- (Optional) Local MySQL instance or Docker container

### 2. Installation
```bash
# Navigate to the project directory
cd lala-next

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
# Database Credentials (optional for viewing with fallback data, required for live DB)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nexus_intel
DB_USER=root
DB_PASSWORD=

# Session Secret (Generate via `openssl rand -hex 32`)
AUTH_SECRET=nexus_super_classified_jwt_secret_2026_change_in_production
ADMIN_SESSION_SECRET=nexus_super_classified_jwt_secret_2026_change_in_production

# Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note on Offline / Fallback Mode:**
> If `DB_HOST` is left blank or MySQL is not running, NEXUS INTEL starts in **Graceful Fallback Mode**. The website and admin panel remain fully navigable and interactive using the exact default seed dataset from `schema.sql`.

### 4. Database Setup (Optional for Local, Required for Production)
Create a MySQL database and import the schemas:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nexus_intel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import baseline schema
mysql -u root -p nexus_intel < database/schema.sql

# Import WhatsApp chat migrations (if not already included)
mysql -u root -p nexus_intel < database/chat_migration.sql
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the front site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the operator control panel.

**Default Admin Credentials:**
- **Operator ID**: `admin`
- **Passphrase**: `nexus2026`
*(Change this password immediately in production via the database).*

---

## Build & Quality Checks

Run linting:
```bash
npm run lint
```

Create production build:
```bash
npm run build
```

Run production server:
```bash
npm run start
```

---

## Deployment to Vercel

Vercel is a serverless platform. Follow these steps for production deployment:

### Step 1: External MySQL Database
*Note: Vercel does not host a built-in MySQL database.* You must provision an external MySQL-compatible provider, such as:
- **PlanetScale**
- **Railway MySQL**
- **Aiven for MySQL**
- **DigitalOcean Managed MySQL**
- **AWS RDS (MySQL)**

After creating the database instance, import `database/schema.sql`:
```bash
mysql -h "<YOUR_REMOTE_HOST>" -P "<PORT>" -u "<USER>" -p "<DB_NAME>" < database/schema.sql
```

### Step 2: Image Storage Setup (Cloudinary)
Vercel serverless function filesystems are ephemeral (read-only in serverless lambda environments). To support permanent image uploads (photos and avatars):
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. Obtain your **Cloud Name**, **API Key**, and **API Secret**.

### Step 3: Configure Environment Variables in Vercel
In the Vercel Dashboard -> Project Settings -> Environment Variables, add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DB_HOST` | MySQL hostname | `aws.connect.psdb.cloud` or `monorail.proxy.rlwy.net` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `nexus_intel` |
| `DB_USER` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `••••••••••••` |
| `AUTH_SECRET` | Secure 64-char hex key | Run `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | Production domain | `https://your-domain.vercel.app` |
| `UPLOAD_PROVIDER` | Upload provider | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `••••••••••••` |

### Step 4: Deploy
Push your repository to GitHub and connect it to Vercel. Vercel will automatically detect Next.js and build with `npm run build`.

---

## Security Enhancements Over PHP Version

1. **Authentication**: Replaced unencrypted PHP session cookies with cryptographic signed JWTs via `jose` using HS256 and stored in `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies.
2. **Brute-Force Protection**: Added login rate-limiting to prevent password guessing on `/api/admin/login`.
3. **Route Protection**: Next.js Edge `middleware.ts` intercepts all requests to `/admin/*`, redirecting unauthenticated visitors before executing page logic.
4. **SQL Injection Prevention**: All queries use parameterized inputs and prepared statements (`mysql2/promise`). Untrusted inputs are never concatenated into SQL strings.
5. **Safe File Uploads**:
   - Strict MIME-type allowlist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`)
   - 5MB maximum file size limit
   - Random cryptographically-generated file names
   - Rejection of SVG/executable file uploads to prevent stored XSS
6. **No Public Database Reset**: Removed unsafe `setup.php?fresh=1` endpoint that previously dropped tables without authentication.
7. **Safe Error Handling**: Database errors, stack traces, and internal passwords/hashes are never sent to the client.

---

## Health Check Verification

The endpoint `GET /api/health` monitors service availability:
- Database connectivity test (`SELECT 1`)
- Verification that all six tables exist (`admins`, `site_content`, `gallery`, `intel_feeds`, `chat_contacts`, `chat_messages`)
- Upload provider availability

**Response (HTTP 200 OK):**
```json
{
  "ok": true,
  "database": true,
  "database_configured": true,
  "tables_ready": true,
  "uploads": true,
  "timestamp": "2026-10-29T09:35:00.000Z"
}
```
If the database connection is unreachable or tables are missing, it returns HTTP 503 Service Unavailable without exposing internal connection strings.
