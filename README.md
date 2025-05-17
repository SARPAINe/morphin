# Morphin Backend

This project is a scalable Node.js backend for the Morphin application, built with Express, PostgreSQL, Redis, and TypeScript. It is designed for high performance, observability, and ease of deployment in modern cloud environments.

---

## Table of Contents

- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Logging & Monitoring](#logging--monitoring)
- [Scaling & Performance](#scaling--performance)
- [Deployment Guide](#deployment-guide)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## Features

- **RESTful API** for employee management and authentication
- **Role-based hierarchy** with closure table for fast queries
- **Caching** with Redis for high-performance read operations
- **Automated tests** with Jest and Supertest
- **Structured JSON logging** for easy log aggregation and analysis
- **Docker Compose** for local development and multi-service orchestration
- **PM2 & Nginx** for process management and load balancing
- **Load testing** scripts and reporting

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- Docker & Docker Compose
- npm

### Clone the repository

```bash
git clone <repo-url>
cd morphin
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
DB_NAME=morphin
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Running the Application

### Local (without Docker)

1. Start PostgreSQL and Redis locally.
2. Set `DB_HOST=localhost` and `REDIS_HOST=localhost` in `.env`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

### With Docker Compose

1. Build and start all services:

   ```bash
   docker compose up --build
   ```

2. The API will be available at `http://localhost:4000` (via Nginx load balancer).

---

## Testing

- **Unit & Integration Tests:**

  ```bash
  npm test
  ```

- **Test Coverage:**

  ```bash
  npm run test -- --coverage
  ```

  Coverage reports are generated in the `coverage/` directory.

---

## Logging & Monitoring

- **Structured Logging:**  
  All logs are output as JSON using [winston](https://github.com/winstonjs/winston), making them easy to parse and aggregate in tools like ELK, Datadog, or CloudWatch.

- **Example log:**

  ```json
  {
    "email": "morphin-userne@gmail.com",
    "employeeId": 1002,
    "level": "info",
    "message": "User registered",
    "timestamp": "2025-05-17T17:37:34.710Z"
  }
  ```

---

**Monitoring at Scale:**

- Use centralized log aggregation (ELK, Datadog, etc.).
- Use health check endpoints and container healthchecks.
- Integrate with metrics tools (Prometheus, Grafana) for real-time monitoring.

---

## Scaling & Performance

- **Horizontal Scaling:**

  - The backend is stateless and can be scaled horizontally using PM2 (`pm2.config.js`) or Docker Compose with multiple replicas.
  - Nginx is used as a load balancer in Docker Compose.

- **Caching:**

  - Redis is used to cache expensive queries (e.g., subordinates/managers) with a TTL to reduce DB load.

- **Load Testing:**

  - Use the provided `loadtest.js` script with [k6](https://k6.io/) to simulate thousands of users.
  - Example:
    ```bash
    k6 run src/loadtest/loadtest.js --summary-export=summary.json
    ```
  - The summary report can be found in `summary.json`.

- **Database Indexing:**
  - Use Sequelize migrations to add indexes for frequently queried fields.
  - Always run migrations before starting the server in production.

---

## Deployment Guide

1. **Build Docker images:**

   ```bash
   docker compose build
   ```

2. **Run migrations:**

   - Use a migration tool (e.g., `sequelize-cli`) to apply DB schema changes:
     ```bash
     npx sequelize-cli db:migrate
     ```

3. **Start services:**

   ```bash
   docker compose up -d
   ```

4. **Scaling:**

   - Scale app containers as needed:
     ```bash
     docker compose up --scale app=4
     ```
   - Or use PM2 in production VMs:
     ```bash
     pm2 start pm2.config.js
     ```

5. **Environment Variables:**

   - Use `.env.production` for production deployments.
   - Store secrets securely (not in version control).

6. **Reverse Proxy:**
   - Nginx is included in Docker Compose for local load balancing.
   - For production, use a managed load balancer or cloud-native solution.

---

## API Documentation

- The API follows RESTful conventions.
- See `src/routes/` for available endpoints.
- Example endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/employees`
  - `GET /api/v1/employees/:id`
  - `GET /api/v1/employees/subordinates/:id`
  - `GET /api/v1/employees/managers/:id`

---

## Notes

- For large-scale deployments, we can consider using Kubernetes for orchestration.
- Use managed database and Redis services for reliability.
- Monitor and tune PostgreSQL connection pool settings for optimal performance.
