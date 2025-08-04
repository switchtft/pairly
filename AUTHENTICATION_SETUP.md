# Authentication System Setup

## Overview
The authentication system has been successfully set up with the following components:

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages authentication state across the application
- Provides login, register, logout, and user update functions
- Automatically checks authentication status on app load

### 2. **useAuthForm Hook** (`src/hooks/useAuthForm.ts`)
- Handles form validation for login and registration
- Manages form submission states and error handling
- Provides reusable authentication form logic

### 3. **API Endpoints**
- `/api/auth/register` - User registration
- `/api/auth/login` - User login with JWT tokens
- `/api/auth/logout` - User logout and session cleanup
- `/api/auth/me` - Get current user information
- `/api/auth/profile` - Update user profile

### 4. **Database Schema**
- User model with gaming-specific fields
- AuthSession model for session management
- Proper relationships and constraints

## Environment Variables Required

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pairly_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NODE_ENV="development"
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Using the AuthContext
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication functions
}
```

### Using the useAuthForm Hook
```tsx
import { useAuthForm } from '@/hooks/useAuthForm';

function LoginForm() {
  const { errors, isSubmitting, handleLogin } = useAuthForm();
  
  // Handle form submission
}
```

## Features

- ✅ JWT-based authentication with HTTP-only cookies
- ✅ Session management with database storage
- ✅ Form validation and error handling
- ✅ Automatic redirects for authenticated users
- ✅ User profile management
- ✅ Gaming-specific user fields (game, role, rank, etc.)
- ✅ TypeScript support throughout

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- HTTP-only cookies for token storage
- Session cleanup on logout
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM

## Next Steps

1. Set up your database and update the DATABASE_URL
2. Generate a secure JWT_SECRET
3. Test the registration and login flows
4. Customize the user profile fields as needed
5. Add additional security measures for production 