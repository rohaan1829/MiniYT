# 🚀 MiniYT Backend Setup Guide

This guide will walk you through setting up the backend for your MiniYT video streaming platform.

## ✅ What's Been Created

The following backend structure has been set up:

```
server/
├── src/
│   ├── config/          # Database, Redis, environment configuration
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API endpoints (health, auth, users)
│   ├── services/        # Business logic (authentication)
│   ├── utils/           # Logger, custom errors
│   └── index.ts         # Express server entry point
├── prisma/
│   └── schema.prisma    # Database schema (User, Video, Comment models)
├── package.json         # Dependencies installed ✓
├── tsconfig.json        # TypeScript configuration
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
└── setup-env.sh        # Environment setup script
```

## 📋 Next Steps (YOU NEED TO DO THESE)

### Step 1: Set Up Neon PostgreSQL Database

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up / Log in
3. Click "Create Project"
4. Give it a name (e.g., "miniyt")
5. Select region closest to you
6. Click "Create Project"
7. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require
   ```

### Step 2: Set Up Upstash Redis

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Sign up / Log in
3. Click "Create Database"
4. Give it a name (e.g., "miniyt-cache")
5. Select region closest to you
6. Click "Create"
7. Go to the database details page
8. **Copy the "UPSTASH_REDIS_REST_URL"** or the TLS connection string - it looks like:
   ```
   rediss://default:password@xxx.upstash.io:6379
   ```

### Step 3: Create Your .env File

Run the setup script to create your `.env` file:

```bash
cd server
./setup-env.sh
```

This will create a `.env` file with an auto-generated JWT secret.

### Step 4: Update .env with Your Credentials

Open `server/.env` and replace these values:

```bash
# Replace this line:
DATABASE_URL="postgresql://user:password@host.neon.tech/miniyt?sslmode=require"
# With your actual Neon connection string from Step 1

# Replace this line:
REDIS_URL="rediss://default:password@host.upstash.io:6379"
# With your actual Upstash URL from Step 2
```

### Step 5: Set Up Database with Prisma

Initialize your database with the schema:

```bash
cd server
npm run prisma:push
npm run prisma:generate
```

This will:
- Push the schema to your Neon database (creates tables)
- Generate the Prisma client for TypeScript

### Step 6: Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Redis connected successfully
🚀 Server running on port 4000
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
```

## 🧪 Test Your Backend

### Test 1: Health Check

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T15:25:14.000Z",
  "uptime": 5.123
}
```

### Test 2: Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "image": null,
    "createdAt": "..."
  }
}
```

### Test 3: Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the token from this response!**

### Test 4: Get User Profile (Protected Route)

Replace `YOUR_TOKEN_HERE` with the token from Test 3:

```bash
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User",
    "image": null,
    "createdAt": "...",
    "_count": {
      "videos": 0,
      "comments": 0
    }
  }
}
```

## 🎯 Current Features

✅ **Authentication**
- User registration with email/password
- User login with JWT tokens
- Protected routes with token verification

✅ **Database**
- PostgreSQL with Prisma ORM
- User, Account, Session, Video, Comment models

✅ **Infrastructure**
- Redis caching (ready for use)
- Error handling middleware
- Request validation with Zod
- Winston logging
- CORS configuration

## 📊 Database Schema

The following models are ready in your database:

- **User** - user accounts
- **Account** - OAuth providers (for future social login)
- **Session** - user sessions
- **Video** - video metadata (ready for Phase 2)
- **Comment** - video comments (ready for Phase 2)

## 🔜 What's Next

After confirming the backend works:

1. **Frontend Integration** - Connect Next.js to backend APIs
2. **Video Upload** - Implement S3/R2 storage and video uploads
3. **Video Streaming** - Set up HLS transcoding and CDN
4. **Additional Features** - Playlists, likes, subscriptions, search

## 🛟 Troubleshooting

### "Environment validation failed: DATABASE_URL is required"
Make sure you've created the `.env` file and added your Neon database URL.

### "Database connection error"
Verify your DATABASE_URL in `.env` is correct. Make sure you copied the full connection string from Neon.

### "Redis connection error"
Verify your REDIS_URL in `.env` is correct. Copy the full connection URL from Upstash.

### "Cannot find module"
Run `npm install` in the server directory.

### "Prisma Client not generated"
Run `npm run prisma:generate`

## 📚 Useful Commands

```bash
# Development
npm run dev                 # Start dev server with hot reload

# Prisma
npm run prisma:studio      # Open Prisma Studio (database GUI)
npm run prisma:push        # Push schema to database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create migration

# Production
npm run build              # Build TypeScript
npm start                  # Start production server
```

## 🎉 Success!

Once all tests pass, your backend is fully operational and ready to integrate with your Next.js frontend!
