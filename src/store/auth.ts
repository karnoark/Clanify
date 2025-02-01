//todo scenario: when user aprubptly closes the app when he is passwordRecovery flow before resetting the password(i.e. before calling updatePassword() function) he should be signed out

import type {
  EmailOtpType,
  MobileOtpType,
  Session,
  VerifyEmailOtpParams,
} from '@supabase/supabase-js';
import { AuthError, createClient, SupabaseClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';

// import { ENV } from '../config/env'
import 'react-native-url-polyfill/auto';
import {
  loadFromStorage,
  saveToStorage,
  storage,
  supabase,
} from '@/src/lib/supabase';
import type { HandleError } from '@/src/utils/auth_errors';
import { AuthErrorHandler } from '@/src/utils/auth_errors';
import { AuthEventManager } from '@/src/utils/auth_events';

// Define our core interfaces

export type UserRole =
  | 'admin'
  | 'member'
  | 'admin_verification_pending'
  | 'regular';
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface verifyOtpCredentials {
  email: string;
  token: string;
  type: MobileOtpType | EmailOtpType;
}

interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
}

export interface AdminRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status:
    | 'pending_onboarding'
    | 'onboarding_in_progress'
    | 'verification_pending'
    | 'approved'
    | 'rejected';
  currentOnboardingStep:
    | 'mess_details'
    | 'location_details'
    | 'contact_details'
    | 'timing_details'
    | 'media_files';
}

export type EmailStatus =
  | 'available'
  | 'exists_in_profiles'
  | 'exists_in_admin_registrations';

interface ResendOtpCredentials {
  email: string;
  type: EmailOtpType;
}

interface AuthState {
  user: User | null;
  session: Session | null; // You might want to type this properly based on Supabase session
  isLoading: boolean;
  isPasswordRecovery: boolean;
  error: HandleError | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  getAdminRegistrationStatus: (
    email: string,
  ) => Promise<AdminRegistration | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (new_password: string) => Promise<void>;
  verifyOtp: (credentials: verifyOtpCredentials) => Promise<void>;
  resendOtp: (credentials: ResendOtpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  initialize: () => Promise<void>;
  getExistingSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create our authentication store using Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize state from storage
  user: loadFromStorage('user', null),
  session: loadFromStorage('session', null),
  isLoading: true,
  isPasswordRecovery: false,
  error: null,

  initialize: async (): Promise<void> => {
    try {
      console.log('auth/initialize:-> ');

      // Load isPasswordRecovery flag from storage
      const isPasswordRecovery = loadFromStorage('isPasswordRecovery', false);

      // Check for existing session
      console.log('auth/initialize:-> checking for existing session');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      console.log(
        'auth/initialize:-> No errors upon calling getSession(), here is session: ',
        session,
      );

      if (session) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          firstName: session.user.user_metadata?.first_name ?? '',
          lastName: session.user.user_metadata?.last_name ?? '',
          role: session.user.user_metadata?.role ?? 'regular',
        };

        set({ session, user, isPasswordRecovery });
        console.log('auth/initialize:-> saved session & user info in zustand ');
        saveToStorage('session', session);
        saveToStorage('user', user);
        console.log('auth/initialize:-> session: ', session);
        console.log('auth/initialize:-> user: ', user);
        console.log(
          'auth/initialize:-> saved session & user info in mmkv storage ',
        );
      }

      set({ isLoading: false });

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        // Don't clear session if we're in password recovery flow, because during password update stage temprarily, the session might appear to be null . isPasswordRecovery flag acts like a "Do Not Disturb" sign. When it's set to true, we're telling the listener: "Yes, we know the auth state is changing, but don't clear anything - we're in the middle of a special process."

        // if (get().isPasswordRecovery) {
        //   return;
        // }

        // Delegate event handling to AuthEventManager
        AuthEventManager.handleAuthStateChange(event, newSession);

        if (get().isPasswordRecovery) {
          switch (event) {
            case 'PASSWORD_RECOVERY':
              // Handle password recovery specifically
              return;
            case 'USER_UPDATED':
              // Handle successful password update
              set({ isPasswordRecovery: false }); // Clear the flag after success
              saveToStorage('isPasswordRecovery', false);
              return;
            default:
              // Ignore other events during recovery
              return;
          }
        }

        if (newSession) {
          console.log('auth/initialize:-> AuthStateChange Event happened');
          const user: User = {
            id: newSession.user.id,
            email: newSession.user.email ?? '',
            firstName: newSession.user.user_metadata?.first_name ?? '',
            lastName: newSession.user.user_metadata?.last_name ?? '',
            role: newSession.user.user_metadata?.role ?? 'regular',
          };

          set({ session: newSession, user });
          saveToStorage('session', newSession);
          saveToStorage('user', user);
        } else {
          set({ session: null, user: null });
          storage.delete('session');
          storage.delete('user');
        }
      });

      //todo I'm not sure about the unsubscribing thing and how it will affect, using it just because claude said so
      // Cleanup subscription on unmount
      // subscription.unsubscribe();

      //todo try to uncomment following line, see if its useful
      // set({ isLoading: false });
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/initialize:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
      } else {
        console.error('auth/initialize:-> Unknown error:', error);
        set({ isLoading: false });
      }
    }
  },

  //todo when user signs in, the zustand store should be cleared first in the same way it's cleared when user logs out.
  signIn: async (credentials: SignInCredentials) => {
    console.log('auth/signIn:-> ');
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;
      console.log(
        'auth/signIn:-> got no error after calling auth.signInWithPassword()',
      );

      if (session) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          firstName: session.user.user_metadata?.first_name ?? '',
          lastName: session.user.user_metadata?.last_name ?? '',
          role: session.user.user_metadata?.role ?? 'regular',
        };

        console.log('auth/signIn:-> session: ', session);
        console.log('auth/signIn:-> user: ', user);

        set({ session, user });
        saveToStorage('session', session);
        saveToStorage('user', user);
        console.log(
          'auth/signIn:-> stored session & user to zustand & mmkv storage',
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/signIn:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/signIn:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },

  signUp: async (credentials: SignUpCredentials) => {
    console.log('auth/signUp:-> Starting signup process');
    try {
      const {
        data: { session, user },
        error,
      } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            role: credentials.role || 'regular',
          },
        },
      });

      if (error) throw error;

      if (user?.identities?.length === 0) {
        console.log('Email already exists');
        throw new Error('Email already exists');
      }

      console.log('auth/signUp:-> Signup successful, user:', user);
      console.log('auth/signUp:-> session: ', session);

      if (user) {
        const transformedUser: User = {
          id: user.id,
          email: user.email ?? '',
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          role: credentials.role || 'regular',
        };

        set({ session, user: transformedUser });
        saveToStorage('session', session);
        saveToStorage('user', transformedUser);
        console.log(
          'auth/signUp:-> stored session & user to zustand & mmkv storage',
        );
      }
    } catch (error) {
      console.error('auth/signUp:-> Error details:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (error instanceof Error) {
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/signUp:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },
  getAdminRegistrationStatus: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_registrations')
        .select(
          'id, email, first_name, last_name, status, current_onboarding_step',
        ) // Include current_onboarding_step
        .eq('email', email)
        .single();

      if (error) throw error;

      // Map the response to match your AdminRegistration interface
      const adminRegistration: AdminRegistration = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        status: data.status,
        currentOnboardingStep: data.current_onboarding_step,
      };

      return adminRegistration;
    } catch (error) {
      console.error('Error fetching admin registration:', error);
      return null;
    }
  },

  resetPassword: async (email: string) => {
    console.log('auth/resetPassword:-> ');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This redirectTo should be your app's deep link that opens ResetPasswordScreen
        // You'll need to set this up in your Supabase dashboard
        redirectTo: 'clanify://resetPassword',
      });

      if (error) throw error;

      console.log(
        'auth/resetPassword:-> got no error after calling resetPasswordForEmail',
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/resetPassword:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/resetPassword:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },

  updatePassword: async (new_password: string) => {
    console.log('auth/updatePassword:-> ');
    const isPasswordRecovery = get().isPasswordRecovery;
    console.log(
      'auth/updatePassword:-> isPasswordRecovery: ',
      isPasswordRecovery,
    );
    if (!isPasswordRecovery) {
      throw Error('auth/updatePassword:-> isPasswordRecovery flag is false');
    }
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        password: new_password,
      });

      if (error) throw error;
      console.log(
        'auth/updatePassword:->  got no error after calling updatePassword',
      );

      console.log(
        'auth/updatePassword:->  user info retrieved from supabase: ',
        user,
      );

      const currentUser = get().user;
      console.log(
        'auth/updatePassword:->  User info stored in zustand: ',
        currentUser,
      );
      set({ isPasswordRecovery: false });
      saveToStorage('isPasswordRecovery', false);
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/updatePassword:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/updatePassword:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    } finally {
      console.log(
        'auth/updatePassword:-> isPasswordRecovery: ',
        isPasswordRecovery,
      );
    }
  },

  verifyOtp: async (credentials: verifyOtpCredentials) => {
    console.log('auth/verifyOtp:-> ');
    console.log('auth/verifyOtp:-> credentials: ', credentials);
    try {
      if (credentials.type === 'email' || credentials.type === 'recovery') {
        const params: VerifyEmailOtpParams = {
          email: credentials.email,
          token: credentials.token,
          type: credentials.type,
        };

        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp(params);

        console.log('auth/verifyOtp:-> session: ', session);

        if (error) throw error;
        console.log(
          'auth/verifyOtp:-> got no error after calling auth.verifyOtp()',
        );

        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? '',
            firstName: session.user.user_metadata?.first_name ?? '',
            lastName: session.user.user_metadata?.last_name ?? '',
            role: session.user.user_metadata?.role ?? 'regular',
          };

          console.log('auth/verifyOtp:-> session: ', session);
          console.log('auth/verifyOtp:-> user: ', user);

          set({ session, user });
          saveToStorage('session', session);
          saveToStorage('user', user);
          console.log(
            'auth/verifyOtp:-> stored session & user to zustand & mmkv storage',
          );

          if (credentials.type === 'recovery') {
            // Set a flag to indicate we're in password recovery flow
            set({ isPasswordRecovery: true });
            saveToStorage('isPasswordRecovery', true);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/verifyOtp:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/verifyOtp:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },

  resendOtp: async (credentials: ResendOtpCredentials) => {
    console.log('auth/resendOtp:-> Starting resend process');
    console.log('auth/resendOtp:-> credentials:', credentials);

    try {
      // For email verification (signup flow)
      if (credentials.type === 'email') {
        const { data, error } = await supabase.auth.resend({
          type: 'signup',
          email: credentials.email,
        });

        if (error) throw error;

        console.log(
          'auth/resendOtp:-> Successfully resent signup verification email, data: ',
          data,
        );
      }
      // For password recovery
      else if (credentials.type === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          credentials.email,
          {
            redirectTo: 'clanify://resetPassword',
          },
        );

        if (error) throw error;

        console.log(
          'auth/resendOtp:-> Successfully resent password recovery email',
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/resendOtp:-> Error:', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError });
        throw new Error(handledError.message);
      } else {
        console.error('auth/resendOtp:-> Unknown error:', error);
        throw error;
      }
    }
  },

  //todo clear the local cache(MMKV) and reset the zustand store To prevent data from being mixed when a different user logs in, Use MMKV's clearAll method, create the reset function to clear all the stores in zustand.
  signOut: async () => {
    try {
      // Set loading state to prevent premature redirects
      set({ isLoading: true });
      await supabase.auth.signOut();
      // Wait a tick to ensure auth listener has fired
      await new Promise(resolve => setTimeout(resolve, 0));
      // Final cleanup
      set({ user: null, session: null, isLoading: false });
      storage.delete('session');
      storage.delete('user');
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof Error) {
        console.error('auth/signOut:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/signOut:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },

  getExistingSession: async () => {
    try {
      console.log('auth/getExistingSession:-> ');
      // Check for existing session
      console.log('auth/getExistingSession:-> checking for existing session');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      console.log(
        'auth/getExistingSession:-> No errors upon calling getSession(), here is session: ',
        session,
      );
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  },

  updateProfile: async (updates: UserProfileUpdate) => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
        },
      });

      if (error) throw error;

      const currentUser = get().user;
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          firstName: updates.firstName ?? currentUser.firstName,
          lastName: updates.lastName ?? currentUser.lastName,
        };
        set({ user: updatedUser });
        saveToStorage('user', updatedUser);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('auth/updateProfile:-> Error: ', error);
        const handledError = AuthErrorHandler.handleError(error);
        set({ error: handledError, isLoading: false });
        throw new Error(handledError.message);
      } else {
        console.error('auth/updateProfile:-> Unknown error:', error);
        set({ isLoading: false });
        throw error;
      }
    }
  },

  refreshSession: async () => {
    await supabase.auth.refreshSession();
  },
}));

// Export initialization function for use in app startup
export const initializeAuth = () => {
  const initialize = useAuthStore.getState().initialize;
  initialize();
};

/* 
we are telling supabase whether to store the data, and we are also explicitly storing the data using saveToStorage function, why?

Let me explain the two different types of storage happening here:

 1. Supabase's Storage (via customStorageAdapter)
This storage handles Supabase-specific authentication data like tokens, refresh tokens, and session information. Think of it as storing your "membership card" that proves you're authenticated with Supabase.

 2. Our Custom Storage (via saveToStorage)
This storage handles our application's user data in a format that's convenient for our app to use. Think of it as storing your "user profile" with the exact fields and format your app needs.
The reason we need both is because:

Different Data Formats:

Supabase stores raw authentication data (tokens, expiry times, etc.)
Our app stores transformed user data (formatted name, phone number, etc.)


Different Purposes:

Supabase storage ensures the authentication system works properly
Our storage ensures quick access to user data in the exact format our app needs



*/
