# Environment Setup Guide

## Quick Fix for Authentication Issues

To resolve the sign-in problems, you need to create a `.env.local` file in your project root.

### Step 1: Create Environment File

Create a file named `.env.local` in the root directory of your project with the following content:

```env
# JWT Secret - Required for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database URL (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"

# Next.js Environment
NODE_ENV=development
```

### Step 2: Restart Your Development Server

After creating the `.env.local` file:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Test Authentication

Try logging in with these test credentials:

- **Email**: `demo@pairly.com`
- **Password**: `password`

Or use any of the pro player accounts:
- **Email**: `capychill@example.com`
- **Password**: `password123`

## What This Fixes

1. **Persistent Sessions**: Your login will now persist across browser restarts
2. **No More Auto-Logouts**: You won't be automatically signed out when navigating between pages
3. **Proper Token Validation**: JWT tokens will be properly validated and managed
4. **Session Cleanup**: Expired sessions are automatically cleaned up

## If You Still Have Issues

1. **Clear browser cookies** for your site
2. **Run maintenance**: `npm run maintenance`
3. **Check the browser console** for any error messages
4. **Restart the development server**

## Production Note

For production, make sure to:
- Change the JWT_SECRET to a secure random string
- Set NODE_ENV=production
- Use HTTPS for secure cookie transmission 