# Protected Routing in Clanify

This document explains how protected routing is implemented in the Clanify app using Expo Router and the AuthStateManager.

## Route Structure

The app uses Expo Router's group-based routing system:

```
app/
├── (auth)
│   ├── signin.tsx
│   ├── signup.tsx
│   └── forgotPassword.tsx
├── (admin)
│   ├── (tabs)
│   └── onboarding/
├── (member)
│   └── (tabs)
└── _layout.tsx
```

## AuthStateManager

Located in `app/_layout.tsx`, the AuthStateManager is a React component that handles all authentication-related routing logic.

### Core Functionality

```typescript
function AuthStateManager({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { user, session, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (isLoading) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inMemberGroup = segments[0] === '(member)';
    
    // Protected routes logic
  }, [isLoading, segments, session, user]);
  
  return <>{children}</>;
}
```

### Protection Rules

The AuthStateManager enforces several levels of protection:

1. **Authentication Check**
   - Unauthenticated users can only access auth routes
   - Authenticated users are redirected from auth routes

2. **Role-Based Access**
   - Members can't access admin routes
   - Admins can't access member routes
   - Pending admins are restricted to onboarding

3. **Status-Based Routing**
   - Pending admins are guided through onboarding
   - Verification status affects available routes
   - Session changes trigger route updates

## Route Protection Logic

### 1. Base Authentication
```typescript
if (!session || !user) {
  if (!inAuthGroup) {
    router.replace('/(auth)/signin');
  }
  return;
}
```

### 2. Auth Group Protection
```typescript
if (inAuthGroup) {
  if (user.role === 'member') {
    router.replace('/(member)/(tabs)/home');
  } else if (user.role === 'admin') {
    router.replace('/(admin)/(tabs)/dashboard');
  }
  return;
}
```

### 3. Admin Verification Flow
```typescript
if (user.role === 'admin_verification_pending') {
  const registration = await getAdminRegistrationStatus(user.email);
  
  switch (registration.status) {
    case 'pending_onboarding':
      router.replace('/(admin)/onboarding/');
      break;
    case 'verification_pending':
      router.replace('/(admin)/onboarding/verificationStatus');
      break;
  }
}
```

## Navigation Patterns

### 1. Direct Navigation
- Avoid manual navigation after auth state changes
- Let AuthStateManager handle routing
- Use router.replace instead of push for auth routes

### 2. Deep Linking
- Protected routes handle deep links
- Authentication state checked before navigation
- Fallback routes for unauthorized access

### 3. Route Groups
- (auth): Public authentication routes
- (admin): Protected admin routes
- (member): Protected member routes

## Implementation Guidelines

1. **Route Protection**
   - Always use AuthStateManager for protection
   - Don't implement manual checks in components
   - Keep protection logic centralized

2. **Navigation**
   - Avoid manual navigation after auth changes
   - Use router.replace for auth-related navigation
   - Handle deep links appropriately

3. **State Changes**
   - Monitor relevant state changes
   - Update routes based on role changes
   - Handle loading states properly

4. **Error Handling**
   - Provide fallback routes
   - Handle navigation errors
   - Show appropriate error messages

## Best Practices

1. **Centralized Protection**
   - Keep all protection logic in AuthStateManager
   - Avoid scattered authentication checks
   - Maintain single source of truth

2. **Clean Navigation**
   - Let auth state drive navigation
   - Avoid manual intervention
   - Use appropriate navigation methods

3. **State Management**
   - Monitor necessary state changes
   - Handle transitions smoothly
   - Maintain loading states

4. **User Experience**
   - Provide clear feedback
   - Handle errors gracefully
   - Maintain smooth transitions

## Common Pitfalls

1. **Manual Navigation**
   - Don't manually navigate after auth changes
   - Let AuthStateManager handle routing
   - Avoid route conflicts

2. **Scattered Checks**
   - Don't implement protection in components
   - Keep logic centralized
   - Maintain consistent rules

3. **Deep Linking**
   - Handle deep links properly
   - Check authentication state
   - Provide fallback routes