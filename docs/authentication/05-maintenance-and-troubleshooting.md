# Authentication Maintenance and Troubleshooting Guide

This guide provides comprehensive information about maintaining and troubleshooting the authentication system in the Clanify app. Understanding how to maintain and debug authentication issues is crucial for keeping the app secure and functional.

## System Monitoring

### Real-time Session Management

Our authentication system requires careful monitoring of session states to ensure users remain securely authenticated. Here's how we implement comprehensive session monitoring:

```typescript
function useSessionMonitor() {
  const { session, refreshSession } = useAuthStore();
  
  useEffect(() => {
    // This function performs health checks on the current session
    function checkSessionHealth() {
      if (!session) return;
      
      const expiresAt = new Date(session.expires_at);
      const now = new Date();
      
      // We refresh the session one hour before expiration to ensure
      // uninterrupted user experience
      const oneHourInMs = 3600000;
      if ((expiresAt.getTime() - now.getTime()) < oneHourInMs) {
        refreshSession();
      }
    }
    
    // Check session health every 5 minutes
    const interval = setInterval(checkSessionHealth, 300000);
    return () => clearInterval(interval);
  }, [session, refreshSession]);
}
```

### Comprehensive Error Tracking

To maintain system reliability, we implement detailed error tracking that captures the context of each error:

```typescript
function logAuthError(error: Error, context: string) {
  // Create a detailed error report that helps with debugging
  const errorReport = {
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString(),
    // Include user information without sensitive data
    userContext: {
      isAuthenticated: !!useAuthStore.getState().session,
      role: useAuthStore.getState().user?.role,
      lastAction: context
    },
    // Include technical context
    technicalContext: {
      environment: process.env.NODE_ENV,
      appVersion: process.env.APP_VERSION,
      // Add other relevant technical information
    }
  };
  
  console.error('Authentication Error:', errorReport);
  
  // You may want to send this to your error tracking service
  // sendToErrorTrackingService(errorReport);
}
```

## Diagnosing and Resolving Common Issues

### Session Persistence Problems

One of the most common issues in authentication systems is unexpected session loss. Here's how we diagnose and resolve these issues:

```typescript
async function diagnoseSessionIssues() {
  // First, we check the consistency between different storage mechanisms
  const storageCheck = await performStorageConsistencyCheck();
  const sessionCheck = await verifySessionValidity();
  
  async function performStorageConsistencyCheck() {
    const mmkvSession = storage.getString('session');
    const { data: { session } } = await supabase.auth.getSession();
    
    // We need to check both existence and content validity
    if (!mmkvSession && session) {
      // Storage inconsistency detected - MMKV missing session
      console.warn('Storage sync issue: MMKV session missing');
      saveToStorage('session', session);
      return false;
    }
    
    if (mmkvSession && !session) {
      // Storage inconsistency detected - Supabase session missing
      console.warn('Storage sync issue: Supabase session missing');
      storage.delete('session');
      return false;
    }
    
    return true;
  }
  
  async function verifySessionValidity() {
    const currentSession = useAuthStore.getState().session;
    if (!currentSession) return false;
    
    // Check if session is expired
    const expiresAt = new Date(currentSession.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      console.warn('Session expired');
      return false;
    }
    
    return true;
  }
  
  return {
    storageConsistent: await storageCheck,
    sessionValid: await sessionCheck,
    timestamp: new Date().toISOString()
  };
}
```

### Navigation and Routing Issues

Authentication-related navigation problems can create a poor user experience. Here's how we detect and prevent these issues:

```typescript
function NavigationDebugger() {
  const navigationHistory = useRef<Array<{
    timestamp: number;
    route: string;
    authState: {
      isAuthenticated: boolean;
      userRole: string | null;
    };
  }>>([]);
  
  useEffect(() => {
    function recordNavigation(route: string) {
      const { session, user } = useAuthStore.getState();
      
      navigationHistory.current.push({
        timestamp: Date.now(),
        route,
        authState: {
          isAuthenticated: !!session,
          userRole: user?.role ?? null
        }
      });
      
      // Keep only last 10 navigation events
      if (navigationHistory.current.length > 10) {
        navigationHistory.current.shift();
      }
      
      // Detect potential navigation loops
      detectNavigationLoop();
    }
    
    function detectNavigationLoop() {
      const recentNavigations = navigationHistory.current
        .slice(-5)
        .map(n => n.timestamp);
      
      // If 5 navigations happen within 1 second, it's likely a loop
      if (recentNavigations.length === 5) {
        const timeSpan = recentNavigations[4] - recentNavigations[0];
        if (timeSpan < 1000) {
          console.warn('Navigation loop detected');
          logNavigationHistory();
        }
      }
    }
    
    function logNavigationHistory() {
      console.log('Recent Navigation History:',
        navigationHistory.current.map(n => ({
          route: n.route,
          time: new Date(n.timestamp).toISOString(),
          auth: n.authState
        }))
      );
    }
    
    // Subscribe to route changes
    const unsubscribe = router.subscribe(recordNavigation);
    return () => unsubscribe();
  }, []);
  
  return null; // This is a monitoring component
}
```

### User Role Synchronization

Keeping user roles synchronized across the system is crucial for security. Here's our comprehensive role management system:

```typescript
class RoleManager {
  private static async verifyRoleConsistency() {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const storedUser = loadFromStorage('user', null);
    const zustandUser = useAuthStore.getState().user;
    
    // Check consistency across all storage mechanisms
    const roles = {
      supabase: supabaseUser?.user_metadata?.role,
      storage: storedUser?.role,
      zustand: zustandUser?.role
    };
    
    // If any roles don't match, we need to synchronize
    if (!this.areRolesConsistent(roles)) {
      await this.synchronizeRoles(roles);
      return false;
    }
    
    return true;
  }
  
  private static areRolesConsistent(roles: Record<string, string | undefined>) {
    const uniqueRoles = new Set(Object.values(roles));
    return uniqueRoles.size === 1;
  }
  
  private static async synchronizeRoles(roles: Record<string, string | undefined>) {
    // Always treat Supabase as the source of truth
    const sourceRole = roles.supabase;
    
    if (!sourceRole) {
      throw new Error('Cannot synchronize roles: Source role is missing');
    }
    
    // Update local storage
    if (roles.storage !== sourceRole) {
      const storedUser = loadFromStorage('user', null);
      if (storedUser) {
        saveToStorage('user', { ...storedUser, role: sourceRole });
      }
    }
    
    // Update Zustand store
    if (roles.zustand !== sourceRole) {
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, role: sourceRole } : null
      }));
    }
    
    // Log the synchronization
    console.log('Roles synchronized:', {
      previous: roles,
      current: sourceRole
    });
  }
}
```

## Maintenance Tasks

### Automated Health Checks

We implement regular automated health checks to catch issues before they affect users:

```typescript
class AuthenticationHealthMonitor {
  private static readonly CHECK_INTERVAL = 300000; // 5 minutes
  
  public static startMonitoring() {
    setInterval(async () => {
      const healthReport = await this.performHealthCheck();
      this.processHealthReport(healthReport);
    }, this.CHECK_INTERVAL);
  }
  
  private static async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Check session health
      const sessionHealth = await this.checkSessionHealth();
      
      // Verify storage integrity
      const storageHealth = await this.verifyStorageIntegrity();
      
      // Check role consistency
      const roleHealth = await RoleManager.verifyRoleConsistency();
      
      // Verify auth state listener
      const listenerHealth = this.verifyAuthStateListener();
      
      const endTime = Date.now();
      
      return {
        timestamp: new Date().toISOString(),
        duration: endTime - startTime,
        status: {
          session: sessionHealth,
          storage: storageHealth,
          roles: roleHealth,
          listener: listenerHealth
        },
        healthy: sessionHealth && storageHealth && roleHealth && listenerHealth
      };
    } catch (error) {
      logAuthError(error, 'healthCheck');
      return null;
    }
  }
  
  private static processHealthReport(report: HealthReport | null) {
    if (!report) {
      console.error('Failed to generate health report');
      return;
    }
    
    if (!report.healthy) {
      console.warn('Authentication system health check failed:', report);
      // Implement your alert mechanism here
      // alertDevTeam(report);
    }
    
    // Store health history for trend analysis
    this.storeHealthHistory(report);
  }
}
```

### Data Cleanup and Maintenance

Regular cleanup of authentication-related data helps maintain system performance and security:

```typescript
class AuthenticationMaintenance {
  public static async performMaintenance() {
    await this.cleanupExpiredSessions();
    await this.removeOrphanedData();
    await this.compactStorage();
  }
  
  private static async cleanupExpiredSessions() {
    const storedSession = loadFromStorage('session', null);
    if (storedSession?.expires_at) {
      const expiryDate = new Date(storedSession.expires_at);
      if (expiryDate < new Date()) {
        await this.performSessionCleanup();
      }
    }
  }
  
  private static async performSessionCleanup() {
    // Clean up storage
    storage.delete('session');
    storage.delete('user');
    
    // Reset authentication state
    useAuthStore.setState({
      session: null,
      user: null,
      isLoading: false,
      error: null
    });
    
    // Log cleanup
    console.log('Session cleanup performed:', new Date().toISOString());
  }
  
  private static async removeOrphanedData() {
    const keys = storage.getAllKeys();
    const authRelatedKeys = keys.filter(key => 
      key.startsWith('auth_') || 
      key.startsWith('session_') ||
      key.startsWith('user_')
    );
    
    for (const key of authRelatedKeys) {
      const value = storage.getString(key);
      if (!value || value === 'null' || value === '{}') {
        storage.delete(key);
        console.log('Removed orphaned key:', key);
      }
    }
  }
}
```

This maintenance system helps ensure the authentication system remains robust and reliable over time. Regular monitoring, proactive maintenance, and quick issue resolution are key to maintaining a secure and user-friendly authentication experience.

## Best Practices for Ongoing Maintenance

1. Run health checks regularly during off-peak hours
2. Monitor authentication logs for unusual patterns
3. Keep error tracking and reporting systems up to date
4. Regularly review and update security measures
5. Maintain comprehensive documentation of any system changes
6. Have a clear incident response plan for authentication issues

Remember that authentication is a critical system component, and its maintenance should be treated as a high-priority task. Regular monitoring and proactive maintenance can prevent many common authentication issues before they impact users.
