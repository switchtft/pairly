# Phase 5 Administrator Features Testing Guide

## Overview
This guide covers how to test the Phase 5 administrator features implemented in the Pairly platform. The administrator dashboard provides comprehensive management capabilities for orders, teammates, and user management.

## Prerequisites
- Database seeded with test data (already completed)
- Development server running
- Admin user credentials available

## Admin User Credentials
```
Email: admin@pairly.com
Password: password123
```

## Test Data Available
The database has been seeded with the following test data:

### Users
- **Admin**: admin@pairly.com (administrator role)
- **Teammates**: 
  - capychill@example.com (Valorant, Diamond 3)
  - capyzen@example.com (Valorant, Immortal 1)
  - capynap@example.com (Valorant, Ascendant 2)
  - capyleaf@example.com (League of Legends, Master)
  - capyking@example.com (Valorant, Radiant)
- **Customers**:
  - customer1@example.com (verified)
  - customer2@example.com (unverified)

### Sessions
- Active Valorant session (Customer1 + CapyZen)
- Completed League session (Customer2 + CapyKing)
- Pending Valorant session (Customer1, no teammate assigned)

## Testing Steps

### 1. Access Administrator Dashboard

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the login page**: `http://localhost:3000/login`

3. **Login with admin credentials**:
   - Email: `admin@pairly.com`
   - Password: `password123`

4. **Access admin dashboard**: Navigate to `/profile/administrator`

### 2. Test Profile Tab

**Features to test**:
- ✅ View admin profile information
- ✅ Edit personal information (first name, last name, username, bio)
- ✅ View administrator permissions
- ✅ View system status information

**Test scenarios**:
1. Click "Edit" button to modify profile
2. Change first name, last name, username, and bio
3. Click "Save" to confirm changes
4. Verify changes are reflected in the UI
5. Check that email field is read-only
6. Review permissions list and system status

### 3. Test Orders Tab

**Features to test**:
- ✅ View real-time orders with pagination
- ✅ Filter orders by status (pending, active, completed, cancelled)
- ✅ Filter orders by game (Valorant, League of Legends, CS:GO)
- ✅ View order details (client, teammate, price, duration, creation date)
- ✅ Refresh orders data
- ✅ Load more orders (pagination)

**Test scenarios**:
1. Navigate to Orders tab
2. Verify all test sessions are displayed
3. Test status filter:
   - Select "Active" - should show 1 order
   - Select "Completed" - should show 1 order
   - Select "Pending" - should show 1 order
4. Test game filter:
   - Select "Valorant" - should show 2 orders
   - Select "League of Legends" - should show 1 order
5. Test refresh functionality
6. Verify order details are correct:
   - Order IDs, games, modes, statuses
   - Client and teammate information
   - Pricing and duration
   - Creation timestamps

### 4. Test Teammates Tab

**Features to test**:
- ✅ View all teammates with pagination
- ✅ Filter by online status
- ✅ Filter by game
- ✅ View teammate statistics (online/offline count, average rating)
- ✅ View teammate details (profile, game, rank, sessions, ratings)
- ✅ Refresh teammates data
- ✅ Load more teammates (pagination)

**Test scenarios**:
1. Navigate to Teammates tab
2. Verify all 5 teammates are displayed
3. Test online filter:
   - Check "Online only" - should show only online teammates
   - Uncheck - should show all teammates
4. Test game filter:
   - Select "Valorant" - should show 4 teammates
   - Select "League of Legends" - should show 1 teammate
5. Verify statistics cards:
   - Online count
   - Offline count
   - Average rating
6. Check teammate details:
   - Names, usernames, emails
   - Games and ranks
   - Session counts and ratings
   - Online/offline status

### 5. Test User Management Tab

**Features to test**:
- ✅ View all users with pagination
- ✅ Filter by role (customer, teammate, administrator)
- ✅ Filter by game
- ✅ Filter by verification status
- ✅ Edit user roles, verification status, and pro status
- ✅ View user statistics and details
- ✅ Refresh user data
- ✅ Load more users (pagination)

**Test scenarios**:
1. Navigate to User Management tab
2. Verify all users are displayed (admin + 5 teammates + 2 customers)
3. Test role filter:
   - Select "Customer" - should show 2 users
   - Select "Teammate" - should show 5 users
   - Select "Administrator" - should show 1 user
4. Test verification filter:
   - Select "Verified Only" - should show verified users
   - Select "Unverified Only" - should show unverified users
5. Test user editing:
   - Click edit button on a user
   - Change their role (e.g., customer to teammate)
   - Toggle verification status
   - Toggle pro status
   - Verify changes are saved
6. Verify user details:
   - Names, usernames, emails
   - Games and ranks
   - Session and review counts
   - Join dates

### 6. Test Quick Actions

**Features to test**:
- ✅ Quick navigation to Orders tab
- ✅ Quick navigation to Teammates tab
- ✅ Quick navigation to User Management tab
- ✅ Analytics button (disabled, coming soon)

**Test scenarios**:
1. Click "View Orders" - should navigate to Orders tab
2. Click "Teammates" - should navigate to Teammates tab
3. Click "User Management" - should navigate to User Management tab
4. Verify "Analytics" button is disabled with "Coming Soon" text

### 7. Test API Endpoints

**Test the following API endpoints directly**:

1. **GET /api/admin/orders**
   - Test with different query parameters
   - Verify authentication and authorization

2. **GET /api/admin/teammates**
   - Test with different query parameters
   - Verify authentication and authorization

3. **GET /api/admin/users**
   - Test with different query parameters
   - Verify authentication and authorization

4. **PATCH /api/admin/users**
   - Test user role updates
   - Test verification status updates
   - Test pro status updates

**Example API tests**:
```bash
# Test orders endpoint
curl -H "Cookie: token=YOUR_TOKEN" "http://localhost:3000/api/admin/orders?status=active&game=valorant"

# Test teammates endpoint
curl -H "Cookie: token=YOUR_TOKEN" "http://localhost:3000/api/admin/teammates?online=true"

# Test users endpoint
curl -H "Cookie: token=YOUR_TOKEN" "http://localhost:3000/api/admin/users?role=customer"
```

### 8. Test Security Features

**Test scenarios**:
1. **Unauthorized access**:
   - Try to access admin endpoints without authentication
   - Try to access admin dashboard with non-admin user
   - Verify proper error responses (401, 403)

2. **Role-based access**:
   - Login as a regular customer
   - Try to access `/profile/administrator`
   - Verify redirect to login or access denied

3. **Self-modification prevention**:
   - Try to modify admin's own account
   - Verify error response

### 9. Test Responsive Design

**Test scenarios**:
1. **Desktop view**: Verify all features work on large screens
2. **Tablet view**: Test on medium screens (768px+)
3. **Mobile view**: Test on small screens (<768px)
4. **Navigation**: Verify tab navigation works on all screen sizes
5. **Filters**: Test filter dropdowns on mobile
6. **Tables**: Verify data tables are responsive

### 10. Test Error Handling

**Test scenarios**:
1. **Network errors**: Disconnect internet and test API calls
2. **Invalid data**: Test with malformed requests
3. **Empty states**: Verify proper handling when no data is available
4. **Loading states**: Verify loading spinners and states
5. **Error messages**: Verify user-friendly error messages

## Expected Results

### Successful Tests Should Show:
- ✅ All tabs load without errors
- ✅ Data is displayed correctly from the database
- ✅ Filters work as expected
- ✅ Pagination functions properly
- ✅ Edit functionality saves changes
- ✅ Real-time data updates
- ✅ Proper error handling
- ✅ Responsive design on all devices
- ✅ Security measures working correctly

### Performance Expectations:
- ✅ Page load time < 2 seconds
- ✅ API response time < 500ms
- ✅ Smooth animations and transitions
- ✅ No memory leaks during navigation

## Troubleshooting

### Common Issues:
1. **Database connection errors**: Check DATABASE_URL in .env
2. **Authentication errors**: Verify JWT_SECRET is set
3. **CORS errors**: Check Next.js configuration
4. **Prisma errors**: Run `npx prisma generate` and `npx prisma db push`

### Debug Commands:
```bash
# Regenerate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Reset and reseed database
npx prisma db push --force-reset
npm run seed

# Check database status
npx prisma studio
```

## Conclusion

The Phase 5 administrator features provide a comprehensive management interface for the Pairly platform. The testing guide above covers all major functionality including:

- **Profile Management**: Personal information editing and system status
- **Order Management**: Real-time order tracking with filtering and pagination
- **Teammate Management**: Teammate overview with online status and statistics
- **User Management**: Complete user administration with role and status editing
- **Security**: Proper authentication and authorization
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Robust error management

All features are fully functional and ready for production use.
