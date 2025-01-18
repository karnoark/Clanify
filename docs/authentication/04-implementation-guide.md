# Authentication Implementation Guide

This document provides a detailed guide on implementing authentication features in the Clanify app.

## Setup and Configuration

### 1. Environment Setup

Create appropriate environment files:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Supabase Client Configuration

Our Supabase client is configured to work optimally with React Native, using custom storage adaptation and persistent sessions:

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter, // Uses MMKV for efficient storage
    autoRefreshToken: true,       // Keeps sessions fresh
    persistSession: true,         // Maintains session across app restarts
    detectSessionInUrl: false,    // Mobile apps don't use URL auth
  },
});
```

## Core Implementation

### 1. Sign In Implementation

The sign-in process is designed to be secure and user-friendly. Note how we let the auth store handle the state management and routing:

```typescript
const handleSubmit = async () => {
  try {
    // Let auth store handle the signin
    await signIn({
      email: formState.email,
      password: formState.password,
    });
    // Do not navigate manually - AuthStateManager handles routing
  } catch (error) {
    Alert.alert('Error', getErrorMessage(error));
  }
};
```

### 2. Sign Up Implementation

Our sign-up process includes role selection and proper error handling:

```typescript
const handleSignUp = async () => {
  try {
    await signUp({
      email,
      password,
      firstName,
      lastName,
      role,  // 'member' or 'admin_verification_pending'
    });
    // AuthStateManager handles post-signup navigation
  } catch (error) {
    Alert.alert('Error', getErrorMessage(error));
  }
};
```

### 3. Password Recovery Flow

The password recovery system uses Supabase's secure recovery process:

```typescript
const handlePasswordReset = async () => {
  try {
    await resetPassword(email);
    Alert.alert(
      'Success',
      'Check your email for password reset instructions'
    );
  } catch (error) {
    Alert.alert('Error', getErrorMessage(error));
  }
};
```

## Integrating with Auth Store

### 1. Using Auth Store in Components

Here's how to properly integrate the auth store in your components:

```typescript
function ProfileComponent() {
  // Access multiple values with a single subscription
  const { user, session, isLoading } = useAuthStore();
  
  // Get specific actions individually for better performance
  const signOut = useAuthStore(state => state.signOut);
  const updateProfile = useAuthStore(state => state.updateProfile);
  
  // Example profile update
  const handleUpdateProfile = async (updates) => {
    try {
      await updateProfile(updates);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };
  
  return (
    <View>
      {user ? (
        <>
          <Text>Welcome, {user.firstName}</Text>
          <Button 
            onPress={() => handleUpdateProfile({ firstName: 'New Name' })}
            title="Update Profile"
          />
        </>
      ) : null}
    </View>
  );
}
```

### 2. Handling Loading and Error States

Proper loading and error state management is crucial for a good user experience:

```typescript
function ProtectedComponent() {
  const { isLoading, user, error } = useAuthStore();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Handle error states gracefully
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error.message}</Text>
        <Button 
          title="Retry" 
          onPress={() => window.location.reload()}
        />
      </View>
    );
  }
  
  return (
    <View>
      <Text>Protected Content for {user.email}</Text>
    </View>
  );
}
```

### 3. Role-Based Component Rendering

Implement role-based UI components securely:

```typescript
function AdminOnlyFeature() {
  const { user } = useAuthStore();
  
  // Early return for non-admin users
  if (user?.role !== 'admin') {
    return null;
  }
  
  return (
    <View>
      <Text>Admin-only settings</Text>
      {/* Admin specific controls */}
    </View>
  );
}
```

## Common Patterns and Best Practices

### 1. Auth State Persistence

Our app maintains authentication state across sessions using MMKV storage:

```typescript
// Custom storage adapter for Supabase
const customStorageAdapter = {
  getItem: async (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: async (key: string) => {
    storage.delete(key);
  },
};
```

### 2. Session Management

Proper session management includes handling token refresh and session expiry:

```typescript
function useSessionManager() {
  const refreshSession = useAuthStore(state => state.refreshSession);
  
  useEffect(() => {
    // Set up session refresh interval
    const interval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }, 1000 * 60 * 60); // Refresh every hour
    
    return () => clearInterval(interval);
  }, [refreshSession]);
}
```

### 3. Deep Linking Support

Handle authentication deep links properly:

```typescript
function useAuthDeepLinks() {
  const verifyOtp = useAuthStore(state => state.verifyOtp);
  
  useEffect(() => {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      // Handle password reset deep links
      if (url.includes('type=recovery')) {
        const token = extractTokenFromUrl(url);
        try {
          await verifyOtp({
            email: storedEmail,
            token,
            type: 'recovery'
          });
        } catch (error) {
          Alert.alert('Error', 'Invalid or expired reset link');
        }
      }
    });
    
    return () => subscription.remove();
  }, [verifyOtp]);
}
```

## Error Handling Guidelines

### 1. Graceful Error Recovery

Implement comprehensive error handling:

```typescript
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  const resetError = useAuthStore(state => state.resetError);
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Button 
          title="Try Again" 
          onPress={() => {
            setError(null);
            resetError();
          }}
        />
      </View>
    );
  }
  
  return children;
}
```

### 2. Network Error Handling

Handle network-related authentication errors gracefully:

```typescript
async function handleAuthOperation(operation) {
  try {
    await operation();
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.'
      );
    } else if (error.code === 'INVALID_CREDENTIALS') {
      Alert.alert(
        'Authentication Failed',
        'Please check your email and password.'
      );
    } else {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.'
      );
    }
  }
}
```

## Security Considerations

### 1. Token Storage

Secure token storage implementation:

```typescript
// Use MMKV with encryption for token storage
const storage = new MMKV({
  id: 'auth-storage',
  encryptionKey: process.env.MMKV_ENCRYPTION_KEY
});

// Helper functions for secure storage
function secureStore(key: string, value: any) {
  try {
    const serialized = JSON.stringify(value);
    storage.set(key, serialized);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
}

function secureRetrieve(key: string) {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
}
```

### 2. Session Cleanup

Proper cleanup on logout:

```typescript
async function handleLogout() {
  try {
    await signOut();
    // Clear all sensitive data
    storage.clearAll();
    // Reset navigation state
    router.replace('/(auth)/signin');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

## Testing Authentication

### 1. Unit Tests

Example of testing authentication logic:

```typescript
describe('Authentication', () => {
  it('should handle successful login', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.signIn(credentials);
    });
    
    expect(result.current.user).toBeTruthy();
    expect(result.current.session).toBeTruthy();
  });
});
```

### 2. Integration Tests

Example of testing protected routes:

```typescript
describe('Protected Routes', () => {
  it('should redirect unauthenticated users', async () => {
    const { result } = renderHook(() => useRouter());
    
    await act(async () => {
      result.current.push('/(admin)/dashboard');
    });
    
    expect(result.current.pathname).toBe('/(auth)/signin');
  });
});
```

Remember to follow these implementation guidelines and best practices to maintain a secure and reliable authentication system in your app. Regular security audits and updates are recommended to keep the system robust and protected against emerging threats.

