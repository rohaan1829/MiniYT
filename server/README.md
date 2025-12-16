# MiniYT Backend

Backend API for MiniYT video streaming platform built with Node.js, TypeScript, Express, Prisma, and Redis.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Neon PostgreSQL account (free at https://neon.tech)
- Upstash Redis account (free at https://upstash.com)

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `REDIS_URL`: Your Upstash Redis connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

3. Set up database:
```bash
npm run prisma:push
npm run prisma:generate
```

4. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:4000`

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Environment and service configs
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## 🔌 API Endpoints

### Health
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile (protected)

## 🧪 Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:4000/api/health

# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (use token from login response)
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:migrate` - Create migration
- `npm run prisma:studio` - Open Prisma Studio

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Cache**: Redis (via Upstash)
- **Validation**: Zod
- **Auth**: JWT
- **Logging**: Winston
