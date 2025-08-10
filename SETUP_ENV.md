# Environment Setup Guide

## Database Configuration

This project now uses **PostgreSQL** instead of SQLite. You need to create a `.env.local` file in your project root with the following configuration:

### Step 1: Create Environment File

Create a file named `.env.local` in the root directory of your project with the following content:

```env
# Database Configuration - PostgreSQL
PRISMA_DATABASE_URL="postgres://5d26190e58af9e454074e2049a101484d1ce9fb984711d6624230c0fc5db3e9c:sk_XXEBNl8p4RiaEqCKu7e_Q@db.prisma.io:5432/?sslmode=require"

# Alternative database URL
POSTGRES_URL="postgres://5d26190e58af9e454074e2049a101484d1ce9fb984711d6624230c0fc5db3e9c:sk_XXEBNl8p4RiaEqCKu7e_Q@db.prisma.io:5432/?sslmode=require"

# JWT Secret - Required for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Environment
NODE_ENV=development

# Database name
DATABASE_NAME=pairly-db
```

### Step 2: Database Setup

After creating the `.env.local` file, you need to set up the database:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push the schema to your PostgreSQL database
npx prisma db push

# (Optional) Run database migrations
npx prisma migrate dev --name init_postgresql
```

### Step 3: Restart Your Development Server

After setting up the database:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 4: Test Authentication

Try logging in with these test credentials:

- **Email**: `demo@pairly.com`
- **Password**: `password`

Or use any of the pro player accounts:
- **Email**: `capychill@example.com`
- **Password**: `password123`

## What This Configuration Provides

1. **PostgreSQL Database**: Production-ready database hosted on Vercel
2. **Persistent Sessions**: Your login will now persist across browser restarts
3. **No More Auto-Logouts**: You won't be automatically signed out when navigating between pages
4. **Proper Token Validation**: JWT tokens will be properly validated and managed
5. **Session Cleanup**: Expired sessions are automatically cleaned up
6. **Scalability**: PostgreSQL provides better performance and scalability than SQLite

## Database Schema Changes

The project has been updated to use:
- **String IDs** instead of Integer IDs (using CUID for better performance)
- **PostgreSQL** as the database provider
- **Proper foreign key relationships** optimized for PostgreSQL

## If You Still Have Issues

1. **Clear browser cookies** for your site
2. **Run maintenance**: `npm run maintenance`
3. **Check the browser console** for any error messages
4. **Verify database connection**: Check if the database is accessible
5. **Restart the development server**

## Production Note

For production, make sure to:
- Change the JWT_SECRET to a secure random string
- Set NODE_ENV=production
- Use HTTPS for secure cookie transmission
- Ensure your PostgreSQL database is properly secured
- Consider using connection pooling for better performance 