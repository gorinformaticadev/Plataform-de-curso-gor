# Docker Setup Guide - EduPlatform

## Overview
This document provides instructions for running the EduPlatform application using Docker containers.

## Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 3001, and 5432 available

## Quick Start

### 1. Start all services
```bash
docker-compose up -d
```

### 2. Run database migrations (first time only)
```bash
docker-compose exec api npx prisma migrate dev
```

### 3. Verify services are running
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

## Services
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## Environment Variables

### API (.env)
- DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/eduplatform
- JWT_SECRET: seu-jwt-secret-super-seguro
- JWT_EXPIRES_IN: 7d
- PORT: 3001
- FRONTEND_URL: http://localhost:3000

### Frontend (.env.local)
- NEXT_PUBLIC_API_URL: http://localhost:3001/api
- NEXT_PUBLIC_APP_URL: http://localhost:3000

## Useful Commands

### Stop all services
```bash
docker-compose down
```

### Rebuild containers
```bash
docker-compose build --no-cache
```

### Access container shell
```bash
docker-compose exec api sh
docker-compose exec web sh
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec api npx prisma migrate dev
