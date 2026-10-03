# EduYug 🎓

> **AI-Augmented Course Marketplace & Learning Platform**  
> High-Scale Modular Monolith built with **NestJS 10**, **Next.js 14 (App Router)**, **PostgreSQL 16 (`pgvector`)**, **Redis 7**, and **BullMQ**.

[![CI / Architecture Invariants](https://img.shields.io/badge/Architecture%20Audit-100%25%20Passed-emerald.svg)](https://github.com/bhrataRitesh/eduyug)
[![P99 Latency](https://img.shields.io/badge/P99%20Latency-%3C35ms-blue.svg)](https://github.com/bhrataRitesh/eduyug)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-cyan.svg)](https://github.com/bhrataRitesh/eduyug)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20HMAC-indigo.svg)](https://github.com/bhrataRitesh/eduyug)

---

## Executive Summary

**EduYug** is a modern, high-performance course marketplace where instructors publish technical video courses and learners consume them with real-time AI-assisted tutoring.

Rather than fragmenting into premature microservices, EduYug is engineered as a **modular monolith** with strict domain boundaries, event-driven queues for asynchronous workflows, and native vector search embedded directly into PostgreSQL using `pgvector`.

### Key Technical Innovations
- **Unified Vector Search**: PostgreSQL 16 with `pgvector` for course recommendations and lesson transcript semantic search—eliminating the operational complexity and cost of external vector databases.
- **Timestamped RAG AI Tutor**: Contextual retrieval augmented generation with millisecond timestamp deep-linking (`[MM:SS]`), allowing learners to jump straight to relevant video segments.
- **Adaptive Bitrate HLS Player**: Custom video engine built on `hls.js` supporting multi-bitrate ladders (`360p`, `480p`, `720p`, `1080p`), speed adjustments, and programmatic timestamp seeking.
- **High-Throughput Telemetry**: Video watch progress buffered in Redis and batch-flushed to Postgres every 60 seconds to eliminate database write contention.
- **Double-Entry Financial Ledger**: Razorpay integration backed by an immutable double-entry financial ledger recording platform commission and instructor payable balances.

---

## System Architecture

```
                      +-----------------------------+
                      |       Next.js 14 App        |
                      |   SSR, Dark Theme, HLS.js   |
                      +--------------+--------------+
                                     | HTTP / REST
                      +--------------v--------------+
                      |   NestJS 10 Core Monolith   |
                      |  - Identity & Argon2/JWT    |
                      |  - Catalog & Versioning     |
                      |  - Commerce & Razorpay HMAC |
                      |  - Learning & Telemetry     |
                      |  - AI RAG Proxy & Fallback  |
                      +-------+--------------+------+
                              |              |
             +----------------+              +----------------+
             |                                                |
   +---------v---------+                            +---------v---------+
   |   PostgreSQL 16   |                            |      Redis 7      |
   | - 19 Drizzle ORM  |                            | - Progress Buffer |
   | - pgvector (<=>)  |                            | - BullMQ Queues   |
   | - Immutable Audit |                            | - Session Cache   |
   +-------------------+                            +-------------------+
```

---

## Monorepo Directory Structure

```
eduyug/
├── apps/
│   ├── api/                     # NestJS 10 Modular Monolith (Port 4000)
│   │   ├── src/modules/
│   │   │   ├── database/        # Drizzle ORM global provider & connection pool
│   │   │   ├── identity/        # Auth, JWT, Refresh Token Rotation, RBAC
│   │   │   ├── catalog/         # Courses, Sections, Lessons & Versioning
│   │   │   ├── learning/        # Enrollments & Video Watch Telemetry
│   │   │   ├── commerce/        # Razorpay Orders, Webhooks & Double-Entry Ledger
│   │   │   └── ai/              # AI Tutor, Enrollment Security & RAG Service
│   │   ├── src/seed.ts          # One-command database seed script
│   │   ├── src/test-backend-audit.ts  # Senior Principal Backend Audit suite
│   │   └── src/test-performance.ts    # Latency & throughput benchmark suite
│   ├── web/                     # Next.js 14 App Router (Port 3000)
│   │   ├── app/                 # Landing, Catalog, Classroom, Studio, Earnings
│   │   ├── components/          # VideoPlayer, Navbar, Footer, RazorpayModal
│   │   └── lib/                 # Type-safe API Client & Helpers
│   ├── ai/                      # FastAPI Python Service (Port 8000)
│   │   ├── rag_engine.py        # pgvector cosine similarity search (<=>)
│   │   └── main.py              # Whisper STT & RAG endpoints
│   └── workers/                 # BullMQ Workers (FFmpeg transcode pipeline)
├── packages/
│   ├── database/                # Drizzle ORM schemas, migrations & pool
│   ├── shared-types/            # Shared TypeScript DTOs, interfaces & enums
│   └── tsconfig/                # Strict base TypeScript compiler options
├── docker/
│   └── docker-compose.yml       # Local PostgreSQL 16 (pgvector), Redis 7, MinIO
└── turbo.json                   # Turborepo task pipeline definition
```

---

## Local Setup & Quickstart

### Prerequisites
- **Node.js** >= 20.x
- **pnpm** >= 9.x (`corepack enable`)
- **Docker** & **Docker Compose**

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:bhrataRitesh/eduyug.git
cd eduyug
pnpm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Spin Up Infrastructure (Postgres, Redis, MinIO)
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Push Database Schema & Seed Demo Data
```bash
# Push 19 tables and vector extensions to PostgreSQL
pnpm --filter @eduyug/database push

# Seed accounts, course, lessons, transcripts, vector embeddings, and enrollment
pnpm --filter @eduyug/api seed
```

### 5. Start Application Development Servers
```bash
pnpm dev
```
- **Web Application:** [http://localhost:3000](http://localhost:3000)
- **Core API Server:** [http://localhost:4000](http://localhost:4000)
- **MinIO Storage Console:** [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

---

## Demo Test Credentials

| Role | Email | Password | Pre-Configured Access |
|---|---|---|---|
| **Learner** | `learner@eduyug.com` | `Password123!` | Enrolled in *Distributed Systems with Kafka & Go*, full classroom & AI Tutor access |
| **Instructor** | `instructor@eduyug.com` | `Password123!` | Author of *Distributed Systems with Kafka & Go*, Studio & Earnings access |

---

## Architectural Audit & Invariant Verification

Run the comprehensive **Senior Principal Backend Engineer Audit Suite** to verify all 13 core invariants:

```bash
pnpm --filter @eduyug/api exec ts-node src/test-backend-audit.ts
```

```
================================================================
🏛️  SENIOR PRINCIPAL BACKEND ENGINEER AUDIT SUITE
================================================================
🔒 SUITE 1: IAM, JWT Rotation & RBAC Guarantees               (4/4 PASS)
📚 SUITE 2: Catalog Management & Immutable Version Snapshots  (3/3 PASS)
💳 SUITE 3: Commerce, Razorpay Signatures & Financial Ledger  (2/2 PASS)
📊 SUITE 4: Video Watch Telemetry & Completion Threshold      (2/2 PASS)
🧠 SUITE 5: AI Tutor, Tenancy Isolation & Timestamp Citations (2/2 PASS)
================================================================
Total Invariants Tested: 13 | Passed: 13 (100%) | Duration: 991ms
🏆 ALL ARCHITECTURAL INVARIANTS VERIFIED SUCCESSFULLY!
```

---

## Performance & Load Benchmarks

Run the automated throughput and database index benchmarks:

```bash
pnpm --filter @eduyug/api exec ts-node src/test-performance.ts
```

| Benchmark Target | Concurrency | Total Requests | Throughput | P50 Latency | P99 Latency |
|---|---|---|---|---|---|
| **Public Catalog (`GET /courses`)** | 10 | 100 | **800 req/sec** | 10ms | 35ms |
| **Course Detail by Slug** | 10 | 100 | **1,162 req/sec** | 9ms | 15ms |
| **15s Video Telemetry Heartbeat** | 10 | 100 | **1,265 req/sec** | 7ms | 15ms |
| **PostgreSQL `pgvector <=> Cosine Search`** | Direct DB | 1 | — | **0.427ms** | — |

---

## Production Deployment & Portfolio Showcase

Complete step-by-step instructions for hosting EduYug live are available in [DEPLOYMENT.md](./DEPLOYMENT.md):

- **Option 1 (Recommended PaaS):** Vercel (Next.js) + Render/Railway (NestJS + Redis) + Neon/Supabase (PostgreSQL 16 `pgvector`) + Cloudflare R2 (Video Storage).
- **Option 2 (Single VPS):** DigitalOcean / Hetzner Cloud running `docker-compose.prod.yml` with Caddy automatic SSL reverse proxy (~$5–$10/mo).
- **Option 3 (Enterprise AWS):** ECS Fargate + RDS Aurora PostgreSQL + ElastiCache + CloudFront CDN.

---

## Sprint Roadmap (Completed)

- [x] **Sprint 1: Foundation & Identity**
  - Monorepo initialization with Turborepo & pnpm.
  - PostgreSQL schema with Drizzle ORM (19 tables across all domains).
  - NestJS modular monolith skeleton + JWT Auth with refresh token rotation.
  - Next.js 14 App Router frontend with landing page and auth flow.
- [x] **Sprint 2: Course Catalog & Studio Builder**
  - Section & lesson management with immutable versioning (`course_versions`).
  - Next.js curriculum builder for instructors with live syllabus view.
- [x] **Sprint 3: Video Pipeline & Media Player**
  - S3 pre-signed direct uploads with media transcode pipeline.
  - Custom Video Player with HLS.js adaptive bitrate streaming and seek controls.
- [x] **Sprint 4: Commerce, Ledger & Telemetry**
  - Razorpay order creation and HMAC-SHA256 signature verification.
  - Double-entry accounting ledger (`ledger_entries`) with platform split.
  - Video progress telemetry heartbeat and learner course progress tracking.
- [x] **Sprint 5: AI Tutor & Whisper Transcription**
  - FastAPI Python service with pgvector cosine distance search.
  - PostgreSQL `pgvector` similarity search with clickable video timestamp citations.
  - Interactive AI Tutor classroom chat with video deep-linking.

---

## Copyright & Ownership

Copyright © 2026 EduYug. All rights reserved. Proprietary and confidential. Developed by Ritesh Kumar.
