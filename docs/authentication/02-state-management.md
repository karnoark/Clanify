# Authentication State Management

This document details how authentication state is managed in the Clanify app.

## Auth Store

The auth store is implemented using Zustand and provides a centralized way to manage authentication state. It handles both the Supabase authentication state and app-specific user data.

### Store Structure

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  error: HandleError | null;
}
```

### Storage Strategy

The app employs a dual storage strategy:

1. **Supabase Storage**
   - Manages raw authentication data
   - Handles tokens and session information
   - Managed by Supabase client

2. **MMKV Storage**
   - Stores transformed user data
   - Caches frequently accessed information
   - Provides fast access to user state

### State Updates

State updates follow a strict pattern:

1. **Authentication Events**
   ```typescript
   if (newSession) {
     const user = transformSessionToUser(newSession);
     set({ session: newSession, user });
     saveToStorage('session', newSession);
     saveToStorage('user', user);
   }
   ```

2. **Profile Updates**
   ```typescript
   const updatedUser = {
     ...currentUser,
     ...updates
   };
   set({ user: updatedUser });
   saveToStorage('user', updatedUser);
   ```

### State Synchronization

The store maintains synchronization between different storage mechanisms:

1. **Session Sync**
   - Automatic session refresh
   - Real-time updates from Supabase
   - State reconciliation on conflicts

2. **Storage Sync**
   - MMKV storage stays in sync with Zustand
   - Automatic cleanup on logout
   - Error recovery mechanisms

## User Types and Interfaces

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
```

### Admin Registration
```typescript
interface AdminRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: RegistrationStatus;
  currentOnboardingStep: OnboardingStep;
}
```

## State Flow Examples

### Sign In Flow
1. User submits credentials
2. Supabase authenticates
3. Session created and stored
4. User data transformed and cached
5. State updated in Zustand
6. Listeners notified
7. UI updates

### Sign Out Flow
1. User initiates logout
2. Supabase session cleared
3. Local storage cleaned
4. State reset in Zustand
5. UI updates
6. Navigation triggered

## Error Handling

The store implements comprehensive error handling:

1. **Authentication Errors**
   - Invalid credentials
   - Network issues
   - Session expiration

2. **State Recovery**
   - Automatic retry mechanisms
   - Graceful degradation
   - User feedback

## Store Initialization

The store initializes in several steps:

1. Load cached data from MMKV
2. Check for existing Supabase session
3. Set up auth state change listeners
4. Initialize error handlers
5. Set initial loading state

## Usage Guidelines

1. **Accessing State**
   ```typescript
   const { user, session } = useAuthStore();
   ```

2. **Performing Actions**
   ```typescript
   const signIn = useAuthStore(state => state.signIn);
   await signIn(credentials);
   ```

3. **Error Handling**
   ```typescript
   try {
     await action();
   } catch (error) {
     // Error already handled by store
   }
   ```

## Best Practices

1. Always use store actions for authentication operations
2. Don't modify state directly; use provided methods
3. Handle loading states appropriately
4. Implement proper error boundaries
5. Use selectors for optimal performance
6. Keep state updates atomic
7. Maintain synchronization with storage