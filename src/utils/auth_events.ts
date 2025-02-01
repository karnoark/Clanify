import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthEventHandler = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export class AuthEventManager {
  private static eventMap: Record<AuthChangeEvent, AuthEventHandler> = {
    INITIAL_SESSION: (event, session) => {
      console.log('Initial session check complete');
    },
    SIGNED_IN: (event, session) => {
      if (!session?.user) return;
      // Handle successful sign in
      console.log('AuthEventManager --> Sign In happened');
    },
    SIGNED_OUT: (event, session) => {
      // Clean up app state on sign out
      console.log('AuthEventManager --> Sign Out  happened');
    },
    PASSWORD_RECOVERY: (event, session) => {
      if (!session?.user) return;
      // Handle Password Recovery Flow
    },
    TOKEN_REFRESHED: (event, session) => {
      // Handle Token Refresh
    },
    USER_UPDATED: (event, session) => {
      if (!session?.user) return;
      // handle user data updates
    },
    MFA_CHALLENGE_VERIFIED: (event, session) => {
      // What should be done here?
    },
  };

  static handleAuthStateChange: AuthEventHandler = (event, session) => {
    console.log(`Auth event: ${event}`, { sessionExists: !!session });

    const handler = this.eventMap[event];
    if (handler) {
      handler(event, session);
    }
  };
}
