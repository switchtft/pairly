#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PostgreSQL database for Pairly...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Database Configuration - PostgreSQL
PRISMA_DATABASE_URL="postgres://5d26190e58af9e454074e2049a101484d1ce9fb984711d6624230c0fc5db3e9c:sk_XXEBNl8p4RiaEqCKu7e_Q@db.prisma.io:5432/?sslmode=require"

# Alternative database URL
POSTGRES_URL="postgres://5d26190e58af9e454074e2049a101484d1ce9fb984711d6624230c0fc5db3e9c:sk_XXEBNl8p4RiaEqCKu7e_Q@db.prisma.io:5432/?sslmode=require"

# JWT Secret - Required for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Environment
NODE_ENV=development

# Database name
DATABASE_NAME=pairly-db
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!\n');
} else {
  console.log('✅ .env.local file already exists\n');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client for PostgreSQL...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Push schema to database
console.log('📊 Pushing schema to PostgreSQL database...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully!\n');
} catch (error) {
  console.error('❌ Failed to push schema to database:', error.message);
  console.log('\n💡 This might be expected if the database is not accessible yet.');
  console.log('   Make sure your Vercel PostgreSQL database is running and accessible.\n');
}

// Optional: Run migrations
console.log('🔄 Running database migrations...');
try {
  execSync('npx prisma migrate dev --name init_postgresql', { stdio: 'inherit' });
  console.log('✅ Database migrations completed successfully!\n');
} catch (error) {
  console.error('❌ Failed to run migrations:', error.message);
  console.log('\n💡 This might be expected if the database is not accessible yet.');
  console.log('   Make sure your Vercel PostgreSQL database is running and accessible.\n');
}

console.log('🎉 PostgreSQL setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Make sure your Vercel PostgreSQL database is running');
console.log('2. Restart your development server: npm run dev');
console.log('3. Test the application to ensure everything works');
console.log('\n🔍 If you encounter issues:');
console.log('- Check the database connection in your Vercel dashboard');
console.log('- Verify the database URL in .env.local');
console.log('- Check the browser console for any error messages');
console.log('- Run: npm run maintenance');
