# EduYug Production Deployment & Hosting Guide 🚀

This document outlines the deployment strategy, environment configuration, and hosting architectures for taking **EduYug** live for a portfolio showcase or production rollout.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Cloudflare / Vercel Edge  |
                      |   SSL, CDN, DDoS Protection |
                      +--------------+--------------+
                                     |
                +--------------------+--------------------+
                |                                         |
     (Web: Port 3000 / Edge)                    (API: Port 4000)
+---------------+---------------+         +---------------+---------------+
|       Next.js 14 App          |         |    NestJS 10 Core API         |
|  - Server-Side Rendering (SSR)|         |  - Modular Monolith           |
|  - Dynamic Route Caching      |         |  - JWT Auth & RBAC Guards     |
|  - HLS.js Adaptive Player     |         |  - Razorpay Verification      |
|  - AI Tutor Chat Interface    |         |  - BullMQ Job Dispatcher      |
+---------------+---------------+         +---------------+---------------+
                |                                         |
                |                               +---------+---------+
                |                               |                   |
                |                        (FastAPI: 8000)     (Redis 7: 6379)
                |                     +---------+---------+ +-------+-------+
                |                     | Python AI Engine  | | Cache, Queues |
                |                     | - Whisper STT     | | Telemetry     |
                |                     | - RAG Citations   | | Progress      |
                |                     +---------+---------+ +---------------+
                |                               |
                +---------------+---------------+
                                |
                   (PostgreSQL 16 + pgvector: 5432)
                +---------------+---------------+
                | Managed PostgreSQL Database   |
                | - 19 Drizzle ORM Tables       |
                | - pgvector Cosine Search (<=>)|
                | - Immutable Ledger & Audit    |
                +-------------------------------+
```

---

## Recommended Deployment Architectures

### Option 1: 100% Free Tier Stack (Recommended for Portfolio)

This setup is **completely free (₹0 / $0 per month)**, requires no credit card for the primary services, and is ideal for showcasing on LinkedIn and resumes.

| Component | Platform | Free Tier Limits | Why It's Best |
|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com/) | Unlimited deployments, 100GB bandwidth | Native Next.js 14 support, instant preview URLs, automatic HTTPS |
| **Backend API** | [Render](https://render.com/) or [Koyeb](https://www.koyeb.com/) | 750 free hrs/mo (Render) / Free micro (Koyeb) | Connects directly to GitHub repo, auto-deploy on `git push` |
| **Database** | [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) | 0.5GB storage, 100% free tier | Managed PostgreSQL 16 with **`pgvector` pre-installed** |
| **Redis** | [Upstash](https://upstash.com/) | 10,000 commands/day free | Serverless Redis, standard TCP + REST, zero idle sleep |
| **Video & Media** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | 10GB storage/mo, **0 egress fees** | Full AWS S3 SDK compatibility with zero egress bills |
| **Keep-Alive Cron** | [UptimeRobot](https://uptimerobot.com/) | 50 monitors free (5-min intervals) | Pings your free API so it stays warm and never spins down |

#### Step-by-Step PaaS Deployment:

1. **Database Setup (Neon or Supabase):**
   - Create a PostgreSQL 16 database.
   - Run in the SQL editor:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     CREATE EXTENSION IF NOT EXISTS "pgcrypto";
     ```
   - Copy the database connection string: `postgresql://user:pass@ep-xyz.neon.tech/eduyug?sslmode=require`.

2. **Backend API Deployment (Render / Railway):**
   - Connect your GitHub repository `bhrataRitesh/eduyug`.
   - Set Root Directory: `apps/api`.
   - Build Command: `pnpm --filter @eduyug/shared-types build && pnpm --filter @eduyug/database build && pnpm --filter @eduyug/api build`.
   - Start Command: `node dist/main`.
   - Add Environment Variables:
     - `DATABASE_URL`: Your Neon/Supabase connection string.
     - `REDIS_HOST` & `REDIS_PORT`: From Upstash / Railway Redis.
     - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Random 64-char strings.
     - `RAZORPAY_KEY` & `RAZORPAY_SECRET`: From Razorpay Dashboard.
     - `FRONTEND_URL`: Your Vercel frontend URL.

3. **Frontend Deployment (Vercel):**
   - Import `bhrataRitesh/eduyug` in Vercel.
   - Select Framework: **Next.js**.
   - Root Directory: `apps/web`.
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com` (your Render/Railway API URL).
     - `NEXT_PUBLIC_RAZORPAY_KEY`: Your Razorpay test/live key ID.

---

### Option 2: Single VPS with Docker Compose (Most Impressive for Senior DevOps)

Deploying the complete stack on a single cloud VPS (DigitalOcean Droplet, Hetzner Cloud, or AWS Lightsail) shows recruiters you understand Docker, reverse proxies, and infrastructure cost optimization.

**Total Cost:** ~$5 to $10/month (e.g., Hetzner CPX21: 3 vCPU, 4GB RAM, or DigitalOcean 2GB Droplet).

#### Production Docker Compose (`docker-compose.prod.yml`):

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - web
      - api

  postgres:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-eduyug}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d eduyug"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      NODE_ENV: production
      PORT: 4000
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
    depends_on:
      - api

volumes:
  caddy_data:
  caddy_config:
  postgres_data:
  redis_data:
```

#### Automatic SSL Reverse Proxy (`Caddyfile`):

```caddy
yourdomain.com {
    reverse_proxy web:3000
}

api.yourdomain.com {
    reverse_proxy api:4000
}
```
*Caddy automatically provisions and renews Let's Encrypt SSL certificates without manual certbot configuration.*

---

### Option 3: Enterprise AWS Architecture

For enterprise scale:
- **Compute:** AWS ECS Fargate running API, Web, and Python AI containers.
- **Database:** AWS Aurora Serverless v2 PostgreSQL (with `pgvector` extension enabled).
- **Cache:** AWS ElastiCache for Redis (Cluster mode enabled).
- **Storage & Delivery:** Amazon S3 bucket with CloudFront CDN distribution and OAC (Origin Access Control) for signed HLS playlists.

---

## Production Readiness Checklist

- [ ] **Security**: Rotate all JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) with `openssl rand -hex 32`.
- [ ] **Database Connection Pooling**: Set pool bounds (`max: 20`, `idleTimeoutMillis: 30000`).
- [ ] **CORS Configuration**: Restrict `app.enableCors()` in `main.ts` to your production frontend domain.
- [ ] **Rate Limiting**: Configure Redis-backed rate limiting on `/auth/login` and `/ai/tutor`.
- [ ] **Webhook Signature Verification**: Verify Razorpay cryptographic HMAC signatures on payment capture.
- [ ] **Cold Start Prevention**: Run a periodic ping cron (e.g. via UptimeRobot or BetterUptime) to keep free-tier instances warm.

---

## Portfolio Presentation Tips

When showcasing EduYug to recruiters, hiring managers, or on LinkedIn:

1. **Highlight the Architectural Rationale:**
   - *"Engineered as a modular monolith to maximize velocity and transactional consistency, avoiding premature microservice overhead while keeping clean domain boundaries ready for extraction."*
2. **Demonstrate System Resiliency:**
   - Mention the **double-entry financial ledger** preventing financial reconciliation discrepancies.
   - Mention the **Redis telemetry buffer** eliminating PostgreSQL write contention under concurrent video playback.
3. **Showcase AI Innovation:**
   - Emphasize that the AI Tutor performs **timestamped RAG retrieval directly in PostgreSQL via `pgvector`**, deep-linking video timestamps (`[MM:SS]`) into an adaptive HLS video player.
4. **Live Interactive Credentials:**
   - Provide pre-seeded test accounts (`learner@eduyug.com` / `Password123!` and `instructor@eduyug.com` / `Password123!`) so reviewers can test instructor and learner views immediately.

---

## Copyright & Ownership

Copyright © 2026 EduYug. All rights reserved. Proprietary and confidential. Developed by Ritesh Kumar.
