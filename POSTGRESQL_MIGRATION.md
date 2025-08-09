# PostgreSQL Migration Guide

This guide will help you migrate your Pairly project from SQLite to PostgreSQL using Vercel's hosted database service.

## 🚀 Quick Start

### 1. Run the Setup Script

```bash
npm run setup-postgresql
```

This script will:
- Create a `.env.local` file with your database credentials
- Generate the Prisma client for PostgreSQL
- Push the schema to your database
- Run initial migrations

### 2. Restart Your Development Server

```bash
npm run dev
```

## 📋 What Has Changed

### Database Schema Updates

- **Provider**: Changed from `sqlite` to `postgresql`
- **ID Fields**: All ID fields now use `String` type with `@default(cuid())` instead of `Int` with `@default(autoincrement())`
- **Database URL**: Now uses `PRISMA_DATABASE_URL` environment variable

### Code Changes Made

- Updated `prisma/schema.prisma` to use PostgreSQL
- Changed all ID types from `Int` to `String`
- Updated `src/contexts/AuthContext.tsx` to use string IDs
- Updated `src/app/api/quests/route.ts` to remove `parseInt()` calls
- Updated `src/app/api/chat/route.ts` to use string IDs

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create Environment File

Create `.env.local` in your project root:

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

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Push Schema to Database

```bash
npx prisma db push
```

### 4. Run Migrations (Optional)

```bash
npx prisma migrate dev --name init_postgresql
```

## 🗄️ Database Schema

The new schema includes:

- **User Management**: Complete user profiles with authentication
- **Sessions**: Gaming sessions between customers and teammates
- **Queue System**: Matchmaking and order management
- **Chat System**: Real-time messaging and file sharing
- **Payment Processing**: Stripe integration and discount codes
- **Quest System**: Gamification and loyalty points
- **Leaderboards**: Competitive rankings and statistics

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify your Vercel PostgreSQL database is running
   - Check the database URL in `.env.local`
   - Ensure your IP is whitelisted if required

2. **Type Errors After Migration**
   - Run `npx prisma generate` to regenerate the client
   - Restart your development server
   - Check that all `parseInt()` calls have been removed

3. **Authentication Issues**
   - Clear browser cookies
   - Verify JWT_SECRET is set correctly
   - Check the browser console for errors

### Getting Help

- Run `npm run maintenance` for database cleanup
- Check the browser console for detailed error messages
- Verify your database connection in the Vercel dashboard

## 📊 Performance Benefits

PostgreSQL provides several advantages over SQLite:

- **Concurrent Users**: Better handling of multiple simultaneous connections
- **Data Integrity**: ACID compliance and better constraint enforcement
- **Scalability**: Can handle larger datasets and more complex queries
- **Production Ready**: Better suited for deployment and production use
- **Advanced Features**: Full-text search, JSON support, and more

## 🔐 Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **Database Access**: Use connection pooling for production
- **SSL**: Always use SSL connections (enabled by default with `sslmode=require`)
- **JWT Secret**: Use a strong, random JWT secret in production

## 🚀 Next Steps

After successful migration:

1. **Test the Application**: Ensure all features work correctly
2. **Seed Data**: Run `npm run seed` to populate with sample data
3. **Performance Testing**: Monitor database performance under load
4. **Backup Strategy**: Set up regular database backups
5. **Monitoring**: Implement database monitoring and alerting

## 📚 Additional Resources

- [Prisma PostgreSQL Documentation](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel PostgreSQL Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Need Help?** Check the troubleshooting section above or run `npm run maintenance` for database cleanup.
