# EduYug 🎓

> **AI-Augmented Learning Marketplace & Course Platform**  
> Scalable Modular Monolith built with NestJS 10, Next.js 14 (App Router), PostgreSQL 16 (`pgvector`), Redis 7, and BullMQ.

---

## Overview

EduYug is a modern, high-performance course marketplace where instructors publish technical video courses and learners consume them with real-time AI-assisted tutoring.

Instead of premature microservice fragmentation, EduYug is engineered as a **modular monolith** with strict domain boundaries, event-driven queues for asynchronous workflows, and native vector search embedded directly into PostgreSQL.

### Key Highlights
- **Modern Monorepo**: Managed via [Turborepo](https://turbo.build/) and `pnpm` workspaces.
- **Unified Vector Search**: PostgreSQL 16 with `pgvector` for course recommendations and lesson transcript semantic search—no secondary vector database required.
- **Resumable Video Ingestion**: Direct multipart S3 uploads with isolated FFmpeg workers encoding an Adaptive Bitrate (ABR) HLS ladder (`360p`, `480p`, `720p`, `1080p`).
- **High-Throughput Telemetry**: Video watch progress buffered in Redis Hashes and batch-flushed to Postgres every 60 seconds to eliminate database write contention.
- **Double-Entry Financial Ledger**: Razorpay integration with an immutable 4-account financial ledger recording platform commission and instructor payable balances.
- **Contextual AI Tutor**: Scoped RAG pipeline with timestamp citations (`[MM:SS]`) that allow learners to jump straight to relevant video segments.

---

## Monorepo Architecture

```
eduyug/
├── apps/
│   ├── api/                     # NestJS 10 Modular Monolith (Port 4000)
│   │   ├── src/modules/
│   │   │   ├── database/        # Drizzle ORM global provider
│   │   │   ├── identity/        # Auth, JWT, Refresh Token Rotation, RBAC
│   │   │   ├── catalog/         # Courses, Sections, Lessons & Versioning
│   │   │   ├── learning/        # Enrollments & Telemetry
│   │   │   └── commerce/        # Razorpay, Orders & Double-Entry Ledger
│   ├── web/                     # Next.js 14 App Router (Port 3000)
│   │   ├── app/                 # Server & Client Components
│   │   ├── components/          # Reusable UI Design System
│   │   └── lib/                 # API Client & Helpers
│   ├── ai/                      # FastAPI Python Service (Whisper ASR, RAG)
│   └── workers/                 # BullMQ Workers (FFmpeg transcode, telemetry flush)
├── packages/
│   ├── database/                # Drizzle schemas, migrations & connection pool
│   ├── shared-types/            # Shared TypeScript DTOs, interfaces & enums
│   └── tsconfig/                # Strict base TypeScript compiler options
├── docker/
│   └── docker-compose.yml       # PostgreSQL 16 (pgvector), Redis 7, MinIO
└── turbo.json                   # Pipeline caching definition
```

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TailwindCSS | Fast SSR for SEO course landing pages; Client components for video player & AI chat |
| **Backend API** | NestJS 10 (TypeScript) | Strict modular monolith structure with dependency injection |
| **Database & Vectors** | PostgreSQL 16 + `pgvector` + Drizzle ORM | Zero-overhead type-safe SQL, native `<->` cosine distance queries |
| **Cache & Queues** | Redis 7 + BullMQ | Video transcoding queue, AI jobs, rate limiting, and progress buffering |
| **Payments** | Razorpay | Native UPI and card checkout with webhook verification & immutable ledger |
| **Video Engine** | FFmpeg + AWS S3 + CloudFront CDN | Direct pre-signed uploads; adaptive HLS bitrate streaming |

---

## Getting Started

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
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure database credentials, Redis configuration, and Razorpay API keys are set.

### 3. Start Local Infrastructure
Run PostgreSQL (with `pgvector`), Redis, and MinIO locally:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Push Database Schema
Generate and run migrations against the database:
```bash
pnpm --filter @eduyug/database push
```

### 5. Run Development Servers
Start both the NestJS API and Next.js frontend concurrently:
```bash
pnpm dev
```
- **Web Application:** `http://localhost:3000`
- **Core API:** `http://localhost:4000`

---

## Sprint Roadmap

- [x] **Sprint 1: Foundation & Identity**
  - Monorepo initialization with Turborepo & pnpm.
  - PostgreSQL schema with Drizzle ORM (19 tables across all domains).
  - NestJS modular monolith skeleton + JWT Auth with refresh token rotation.
  - Next.js 14 App Router frontend with landing page and auth flow.
- [ ] **Sprint 2: Course Catalog & Studio Builder**
  - Section & lesson management with immutable versioning (`course_versions`).
  - Next.js drag-and-drop course builder for instructors.
- [ ] **Sprint 3: Video Pipeline & Media Player**
  - S3 pre-signed multipart uploads.
  - BullMQ FFmpeg transcoding worker generating HLS ABR ladder.
  - Custom Video Player with HLS.js and scrub thumbnail preview.
- [ ] **Sprint 4: Commerce, Ledger & Telemetry**
  - Razorpay order creation and webhook signature validation.
  - Double-entry accounting ledger (`ledger_entries`).
  - Redis heartbeat buffer for video progress (flushed to Postgres every 60s).
- [ ] **Sprint 5: AI Tutor & Whisper Transcription**
  - Speech-to-text with Whisper API chunked into 350-token windows.
  - PostgreSQL `pgvector` similarity search with clickable video timestamp citations.
  - Real-time streaming AI Tutor modal (Server-Sent Events).

---

## Copyright & Ownership
Copyright © 2026 EduYug. All rights reserved. Proprietary and confidential. Developed by Ritesh Kumar.
