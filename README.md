# BookStore Backend

Production-ready backend API for the BookStore management system. The service is built with NestJS, Bun, Prisma, PostgreSQL, Redis, MinIO, and Mailpit-compatible SMTP configuration.

The application exposes bookstore operations for authentication, customers, employees, books, inventory, bills, income receipts, purchase outcomes, vouchers, rules, settings, search, statistics, file uploads, and health checks.

## Badges

![NestJS](https://img.shields.io/badge/NestJS-framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-language-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-3982CE?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-runtime-F9F1E1?style=for-the-badge&logo=bun&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-container-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-cloud-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | NestJS 11 |
| Language | TypeScript |
| Runtime | Bun |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Cache / rate infrastructure | Redis 7 |
| Object storage | MinIO |
| Email | Nest Mailer / SMTP |
| API docs | Swagger + Scalar in non-production mode |
| Containerization | Docker and Docker Compose |

## Main Features

- JWT authentication for employees and customers.
- Role-based authorization helpers and route guards.
- Book catalog with authors, publishers, categories, cover upload, and inventory tracking.
- Customer, employee, department, and position management.
- Sales bills, bill details, voucher usage, debit tracking, and income receipts.
- Purchase outcome records from publishers with outcome line items.
- System settings, business rules, search endpoints, and dashboard statistics.
- PostgreSQL persistence through Prisma migrations.
- Redis, MinIO, and SMTP integration for production-like deployments.

## Project Structure

```text
.
├── Dockerfile
├── docker-compose.yaml
├── package.json
├── prisma.config.ts
├── prisma
│   ├── migrations
│   ├── models
│   └── seed
└── src
    ├── bases
    │   ├── commons
    │   ├── decorators
    │   ├── filters
    │   ├── guards
    │   └── interceptors
    ├── minio
    ├── modules
    │   ├── admin
    │   ├── author
    │   ├── auth
    │   ├── bill
    │   ├── book
    │   ├── category
    │   ├── customer
    │   ├── employee
    │   ├── health
    │   ├── income
    │   ├── inventory
    │   ├── outcome
    │   ├── publisher
    │   ├── redis
    │   ├── rule
    │   ├── search
    │   ├── settings
    │   └── voucher
    ├── prisma
    └── statistic
```

## Environment Variables

Create a `.env` file in the project root before running the app. Use strong secrets in production.

```env
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

DATABASE_URL=postgresql://admin:admin@postgres:5432/app_db

ACCESS_SECRET_KEY=change-me
REFRESH_SECRET_KEY=change-me
RESET_PASSWORD_SECRET_KEY=change-me
RESET_EMAIL_SECRET_KEY=change-me
VERIFY_SECRET_KEY=change-me

REDIS_HOST=redis
REDIS_PORT=6379

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_USE_SSL=false
MINIO_USER=minioadmin
MINIO_PASSWORD=minioadmin
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bookstore

MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USER=
MAIL_PASS=
MAIL_FROM=no-reply@bookstore.local
```

For local development outside Docker, change service hostnames such as `postgres`, `redis`, `minio`, and `mailpit` to `localhost`.

## Production Docker Build

Build the production API image from the multi-stage Dockerfile:

```bash
docker build -t bookstore-be:production .
```

Or build the `api` service through Docker Compose:

```bash
docker compose build api
```

The Dockerfile installs dependencies with Bun, generates the Prisma client, builds TypeScript into `dist`, copies runtime assets, and starts the compiled app with:

```bash
bun run dist/src/main.js
```

## Production Docker Run

Start the full production stack:

```bash
docker compose up -d --build
```

This starts:

| Service | Container | Port |
| --- | --- | --- |
| API | `app-be-server` | `4000` |
| PostgreSQL | `postgres` | `5432` |
| Redis | `redis` | `6379` |
| MinIO API | `minio` | `9000` |
| MinIO Console | `minio` | `9001` |
| Mailpit SMTP | `mailpit` | `1025` |
| Mailpit Web UI | `mailpit` | `8025` |

After the database is available, apply migrations from the source checkout or CI runner:

```bash
bunx prisma migrate deploy
```

Optional seed command:

```bash
bunx prisma db seed
```

Check the API after startup:

```bash
curl http://localhost:4000/api/health/liveness
```

## Development

Install dependencies:

```bash
bun install
```

Start infrastructure services:

```bash
docker compose up -d postgres redis minio mailpit
```

Run migrations:

```bash
bunx prisma migrate dev
```

Start the development server:

```bash
bun dev
```

The API is available at:

```text
http://localhost:4000/api
```

Interactive API documentation is available only when `NODE_ENV` is not `production`:

```text
http://localhost:4000/api/docs
```

## Available Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Run the API in watch mode |
| `bun run build` | Build TypeScript output into `dist` |
| `bun start` | Run Nest through the Nest CLI |
| `bun run lint` | Run ESLint with fixes |
| `bun run format` | Format source and test files |
| `bun test` | Run unit tests |
| `bun test:e2e` | Run end-to-end tests |
| `bun test:cov` | Run tests with coverage |

## Database Schema

The Prisma schema is split across files in `prisma/models`. The main relationships are shown below.

```mermaid
erDiagram
    CUSTOMER {
        Int id PK
        String code UK
        String name
        String email UK
        String phone UK
        String password
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
        MemberGrade grade
    }

    EMPLOYEE {
        Int id PK
        String code UK
        String email UK
        String password
        String phone UK
        String name
        String avatar
        EmployeeStatus status
        Boolean active
        Decimal salary
        Int departmentId FK
        Int positionId FK
        String resume
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    DEPARTMENT {
        Int id PK
        String name UK
        DateTime deletedAt
    }

    POSITION {
        Int id PK
        String name
        Int departmentId FK
        DateTime deletedAt
    }

    BOOK {
        Int id PK
        String code UK
        Decimal cost
        String title
        Int year
        String coverImage
        BookCategory category
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    INVENTORY {
        Int bookId PK
        Int stock
        DateTime updatedAt
    }

    AUTHOR {
        Int id PK
        String code UK
        String name
    }

    AUTHOR_BOOK {
        Int id PK
        Int authorId FK
        Int bookId FK
    }

    PUBLISHER {
        Int id PK
        String name UK
    }

    PUBLISHER_BOOK {
        Int id PK
        Int publisherId FK
        Int bookId FK
    }

    BILL {
        Int id PK
        String code UK
        Int customerId FK
        BillStatus status
        Decimal cost
        Decimal debit
        DateTime createdAt
        DateTime updatedAt
    }

    BILL_DETAIL {
        Int id PK
        Int billId FK
        Int bookId FK
        Int quantity
    }

    BILL_INCOME {
        Int id PK
        String code UK
        Decimal cost
        IncomeStatus status
        IncomePaymentType paymentMethod
        Int employeeId FK
        Int billId FK
        String shortDescription
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    BILL_OUTCOME {
        Int id PK
        String code UK
        Int publisherId FK
        Int employeeId FK
        Decimal cost
        OutcomeStatus status
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    BILL_OUTCOME_ITEM {
        Int id PK
        Int outcomeId FK
        Int bookId FK
        Int quantity
        Decimal unitCost
        DateTime createdAt
        DateTime deleteAt
    }

    VOUCHER {
        Int id PK
        String name
        String code UK
        String eventName
        Decimal sale
        VoucherStatus status
        Int usedNumber
        Int quantity
        DateTime expiresAt
        String description
        VoucherType type
        DateTime startDate
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    VOUCHER_USAGE {
        Int id PK
        Int billId FK
        Int voucherId FK
        DateTime usedAt
    }

    RULE {
        Int id PK
        String title
        String content
        String shortDescription
        RuleType type
        RuleStatus status
        Int creatorId FK
        DateTime appliedAt
        DateTime createdAt
        DateTime updatedAt
    }

    TOKEN {
        Int id PK
        String token
        TokenType type
        Int customerId
        Int employeeId
        DateTime createdAt
        DateTime usedAt
        DateTime expiresAt
    }

    USER_ROLE {
        Int id PK
        Int userId
        Role role
    }

    SYSTEM_SETTING {
        Int id PK
        String key UK
        String value
        String description
        DateTime updatedAt
    }

    CUSTOMER ||--o{ BILL : places
    BILL ||--o{ BILL_DETAIL : contains
    BOOK ||--o{ BILL_DETAIL : sold_as

    BILL ||--o{ BILL_INCOME : paid_by
    EMPLOYEE ||--o{ BILL_INCOME : records

    PUBLISHER ||--o{ BILL_OUTCOME : supplies
    EMPLOYEE ||--o{ BILL_OUTCOME : creates
    BILL_OUTCOME ||--o{ BILL_OUTCOME_ITEM : contains
    BOOK ||--o{ BILL_OUTCOME_ITEM : purchased_as

    BOOK ||--o| INVENTORY : has
    AUTHOR ||--o{ AUTHOR_BOOK : writes
    BOOK ||--o{ AUTHOR_BOOK : has_author
    PUBLISHER ||--o{ PUBLISHER_BOOK : publishes
    BOOK ||--o{ PUBLISHER_BOOK : has_publisher

    BILL ||--o{ VOUCHER_USAGE : uses
    VOUCHER ||--o{ VOUCHER_USAGE : applied_to

    DEPARTMENT ||--o{ POSITION : owns
    DEPARTMENT ||--o{ EMPLOYEE : has
    POSITION ||--o{ EMPLOYEE : assigned_to
    EMPLOYEE ||--o{ RULE : creates
```

## Important Production Notes

- Keep `.env` values private and rotate all JWT secrets before release.
- Run `bunx prisma migrate deploy` during deployment so the database matches `prisma/migrations`.
- `NODE_ENV=production` disables Scalar API documentation at `/api/docs`.
- The API uses global prefix `/api`; all application routes are served under this prefix.
- Persistent Docker volumes are configured for PostgreSQL, MinIO, and Redis data.

## License

Made with **Cloudian** with love **Cloud**.
