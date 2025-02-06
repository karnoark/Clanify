# Technical Specifications Document

## 1. Technology Stack

### 1.1 Frontend
- React Native (Expo SDK 51)
- TypeScript
- State Management: Zustand
- Navigation: React Navigation 6
- UI Components: Native Base or Tailwind CSS
- Form Handling: React Hook Form
- Data Fetching: React Query

### 1.2 Backend
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- API: RESTful + Real-time subscriptions

### 1.3 DevOps
- Version Control: Git
- CI/CD: GitHub Actions
- Error Tracking: Sentry
- Analytics: Mixpanel
- Push Notifications: OneSignal

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  type VARCHAR NOT NULL CHECK (type IN ('customer', 'vendor')),
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  business_name VARCHAR NOT NULL,
  description TEXT,
  operating_hours JSONB,
  service_areas JSONB,
  rating DECIMAL(3,2),
  status VARCHAR DEFAULT 'active'
);

-- Meal Plans table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  meals_included JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR DEFAULT 'active'
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES meal_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR DEFAULT 'active',
  payment_status VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals table
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR,
  cuisine VARCHAR,
  ingredients JSONB,
  nutritional_info JSONB,
  image_url VARCHAR
);

-- Menu table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  meal_id UUID REFERENCES meals(id),
  date DATE NOT NULL,
  meal_type VARCHAR NOT NULL,
  available_quantity INTEGER,
  price DECIMAL(10,2)
);
```

## 3. API Endpoints

### 3.1 Authentication Endpoints
```typescript
// Authentication routes
POST /auth/signup
POST /auth/login
POST /auth/logout
POST /auth/reset-password
GET /auth/user

// Profile management
GET /api/profile
PUT /api/profile
```

### 3.2 Customer Endpoints
```typescript
// Subscription management
GET /api/subscriptions
POST /api/subscriptions
PUT /api/subscriptions/{id}
DELETE /api/subscriptions/{id}

// Meal management
GET /api/meals
GET /api/menu
POST /api/meals/rate
POST /api/meals/skip
```

### 3.3 Vendor Endpoints
```typescript
// Business management
GET /api/vendor/profile
PUT /api/vendor/profile
GET /api/vendor/analytics

// Menu management
GET /api/vendor/meals
POST /api/vendor/meals
PUT /api/vendor/meals/{id}
DELETE /api/vendor/meals/{id}

// Subscription management
GET /api/vendor/subscriptions
PUT /api/vendor/subscriptions/{id}
```

## 4. App Architecture

### 4.1 Directory Structure
```
src/
├── api/                   # API integration
├── components/            # Reusable components
├── constants/             # App constants
├── hooks/                # Custom hooks
├── navigation/           # Navigation configuration
├── screens/              # Screen components
├── store/                # State management
├── types/                # TypeScript types
└── utils/                # Utility functions
```

### 4.2 State Management
Using Zustand for state management with the following stores:
- AuthStore: User authentication state
- ProfileStore: User profile data
- SubscriptionStore: Active subscriptions
- MenuStore: Current menu items
- UIStore: UI-related state (theme, loading, etc.)

## 5. Security Considerations

### 5.1 Authentication
- JWT-based authentication
- Secure token storage using Expo SecureStore
- Biometric authentication support
- Rate limiting on auth endpoints

### 5.2 Data Security
- Input validation using Zod
- SQL injection prevention
- XSS protection
- Data encryption at rest
- HTTPS for all API calls

## 6. Performance Optimization

### 6.1 Frontend Optimization
- Image optimization
- Lazy loading
- Component memoization
- Virtual lists for long scrolling
- Efficient re-rendering strategies

### 6.2 Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Rate limiting
- Connection pooling

## 7. Testing Strategy

### 7.1 Unit Testing
- Jest for component testing
- React Native Testing Library
- Test coverage requirements

### 7.2 Integration Testing
- API endpoint testing
- State management testing
- Navigation flow testing

### 7.3 E2E Testing
- Detox for E2E testing
- Critical user flow testing
- Cross-platform testing