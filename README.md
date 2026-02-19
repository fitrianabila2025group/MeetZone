# MeetZone – Time Zone & Meeting Planner Hub

A production-ready time zone converter and meeting planner built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

**Live:** [https://meetzone.es](https://meetzone.es)

## Features

- **Time Zone Converter** – Convert times between 300+ cities with DST-aware accuracy
- **Programmatic SEO** – Auto-generated pages for every city pair (1000s+ pages)
- **Meeting Planner** – Find best meeting times across multiple time zones
- **Shareable Meetings** – Create meeting links with ICS calendar export
- **World Clock** – Track current time in up to 12 cities
- **Full Admin Panel** – Manage cities, pairs, SEO templates, FAQs, ads, users, and more
- **Ad Monetization** – Support for AdSense, Adsterra, Monetag, HilltopAds, and custom providers
- **Docker Deployment** – Ready for PhalaCloud and any Docker host

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Standalone) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| Timezone | date-fns-tz (IANA database) |
| Testing | Vitest |
| Deployment | Docker (multi-stage) |

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/MeetZone.git
cd MeetZone
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Start Database

```bash
# Option A: Use existing PostgreSQL
# Just ensure DATABASE_URL in .env points to your instance

# Option B: Use Docker
docker run -d --name meetzone-pg \
  -e POSTGRES_DB=timewise \
  -e POSTGRES_USER=timewise \
  -e POSTGRES_PASSWORD=timewise \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Initialize Database

```bash
npx prisma migrate dev    # Create tables
npx prisma db seed         # Seed 300+ cities, 200+ pairs, blog posts
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Access Admin Panel

Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default credentials (from .env):
- **Email:** `admin@meetzone.es`
- **Password:** `admin123`

## Docker Deployment

### Build & Run with Docker Compose

```bash
docker-compose up -d --build
```

This starts:
- PostgreSQL 16 on port 5432
- MeetZone app on port 3000

The app automatically runs migrations and seeds the database on first start.

### PhalaCloud Deployment

1. Build and push your Docker image:
```bash
docker build -t mpratamamail/meetzone:latest .
docker push mpratamamail/meetzone:latest
```

2. Use `docker-compose.phala.yml` as your compose template:
   - Update all `CHANGE_ME_*` values
   - Set `NEXTAUTH_URL` to your domain (`https://meetzone.es`)

**Important:** PhalaCloud does not support `.env` files. All configuration must be in the compose YAML `environment` block.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string (32+ chars) for JWT signing |
| `NEXTAUTH_URL` | Yes | Public URL (e.g., `https://meetzone.es`) |
| `ADMIN_EMAIL` | Yes | Initial admin user email |
| `ADMIN_PASSWORD` | Yes | Initial admin user password |

## Admin Panel

The admin panel (`/admin`) provides full control over:

| Section | Features |
|---------|----------|
| **Dashboard** | Stats overview |
| **Cities** | CRUD, bulk CSV import with dry run |
| **Timezones** | CRUD for IANA zones |
| **Popular Pairs** | Priority ordering, bulk generator |
| **SEO Templates** | Edit title/desc/h1/intro with live preview |
| **FAQs** | Global + pair-scoped, reorder, publish toggle |
| **Internal Links** | Configurable link blocks |
| **Blog** | Full CRUD with HTML content |
| **Ads Manager** | Provider select, slot IDs, ads.txt, custom HTML |
| **Site Settings** | Name, URL, social, analytics |
| **Users** | CRUD with roles (Admin/Editor), password reset |
| **Audit Logs** | Track all admin actions |

## Ads Verification

To verify your site with ad networks:

1. Go to **Admin → Ads Manager**
2. Enter your publisher ID and verification meta tag
3. Paste your `ads.txt` content
4. The app serves `/ads.txt` dynamically from the database

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages with header/footer
│   │   ├── page.tsx       # Home
│   │   ├── time/          # Converter hub + pair pages
│   │   ├── meeting-planner/
│   │   ├── world-clock/
│   │   ├── cities/
│   │   ├── timezones/
│   │   ├── blog/
│   │   └── about|contact|privacy|terms|...
│   ├── admin/
│   │   ├── login/         # Admin login
│   │   └── (dashboard)/   # Dashboard layout + all admin pages
│   ├── api/
│   │   ├── admin/         # Protected admin API routes
│   │   ├── public/        # Public API (cities, pairs, meetings)
│   │   ├── auth/          # NextAuth
│   │   └── health/        # Health check
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── robots.txt/        # Dynamic robots.txt
│   └── ads.txt/           # Dynamic ads.txt
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── converter-widget.tsx
│   ├── meeting-planner-client.tsx
│   └── ...
├── lib/
│   ├── timezone.ts        # Core timezone logic
│   ├── prisma.ts          # Prisma singleton
│   ├── auth.ts            # NextAuth config
│   └── settings.ts        # Site settings cache
└── __tests__/
    └── timezone.test.ts   # Timezone unit tests
```

## Running Tests

```bash
npm test
```

## License

MIT
