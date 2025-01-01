// src/stores/auth.ts

//todo scenario: when user aprubptly closes the app when he is passwordRecovery flow before resetting the password(i.e. before calling updatePassword() function) he should be signed out

import { MMKV } from "react-native-mmkv";
import {
  createClient,
  EmailOtpType,
  MobileOtpType,
  VerifyEmailOtpParams,
} from "@supabase/supabase-js";
import { create } from "zustand";
// import { ENV } from '../config/env'
import "react-native-url-polyfill/auto";

//Supabase Configuration
const supabaseUrl = "https://udgtgwhwrgwxitiesiqg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ3Rnd2h3cmd3eGl0aWVzaXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMzk1MzksImV4cCI6MjA1MDYxNTUzOX0.oU1EpmirPJC0kkK_FndSkApHTfstB_8bTSQZg-lxoYk";

// Define our core interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

interface AuthState {
  user: User | null;
  session: any | null; // You might want to type this properly based on Supabase session
  isLoading: boolean;
  isPasswordRecovery: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (new_password: string) => Promise<void>;
  verifyOtp: (credentials: verifyOtpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  initialize: () => Promise<void>;
  getExistingSession: () => Promise<void>;
}

// Initialize MMKV storage with encryption
export const storage = new MMKV({
  id: "auth-storage",
  // encryptionKey: ENV.MMKV_ENCRYPTION_KEY
  encryptionKey: "UN$q)!GJe2$HTeiDhoIAMStXLKqc$)cb", // Consider moving this to env variables
});

// Create a storage adapter for Supabase to use MMKV
const customStorageAdapter = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
//todo: learn about why it's used promise here? as main featture of mmkv is its synchronous nature

// Initialize Supabase client with our custom storage adapter
const supabase = createClient(
  // Use ENV.SUPABASE_URL,
  supabaseUrl,
  // Use ENV.SUPABASE_ANON_KEY,
  supabaseAnonKey,
  {
    auth: {
      storage: customStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper functions for managing MMKV storage
const saveToStorage = (key: string, value: any) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Create our authentication store using Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize state from storage
  user: loadFromStorage("user", null),
  session: loadFromStorage("session", null),
  isLoading: true,
  isPasswordRecovery: false,

  initialize: async () => {
    try {
      console.log("auth/initialize:-> ");

      // Load isPasswordRecovery flag from storage
      const isPasswordRecovery = loadFromStorage("isPasswordRecovery", false);

      // Check for existing session
      console.log("auth/initialize:-> checking for existing session");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      console.log(
        "auth/initialize:-> No errors upon calling getSession(), here is session: ",
        session
      );

      if (session) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? "",
          firstName: session.user.user_metadata?.first_name ?? "",
          lastName: session.user.user_metadata?.last_name ?? "",
        };

        set({ session, user, isPasswordRecovery });
        console.log("auth/initialize:-> saved session & user info in zustand ");
        saveToStorage("session", session);
        saveToStorage("user", user);
        console.log("auth/initialize:-> session: ", session);
        console.log("auth/initialize:-> user: ", user);
        console.log(
          "auth/initialize:-> saved session & user info in mmkv storage "
        );
      }

      set({ isLoading: false });

      // Subscribe to auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        // Don't clear session if we're in password recovery flow, because during password update stage temprarily, the session might appear to be null . isPasswordRecovery flag acts like a "Do Not Disturb" sign. When it's set to true, we're telling the listener: "Yes, we know the auth state is changing, but don't clear anything - we're in the middle of a special process."

        // if (get().isPasswordRecovery) {
        //   return;
        // }
        if (get().isPasswordRecovery) {
          switch (event) {
            case "PASSWORD_RECOVERY":
              // Handle password recovery specifically
              return;
            case "USER_UPDATED":
              // Handle successful password update
              set({ isPasswordRecovery: false }); // Clear the flag after success
              saveToStorage("isPasswordRecovery", false);
              return;
            default:
              // Ignore other events during recovery
              return;
          }
        }

        if (session) {
          console.log("auth/initialize:-> AuthStateChange Event happened");
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? "",
            firstName: session.user.user_metadata?.first_name ?? "",
            lastName: session.user.user_metadata?.last_name ?? "",
          };

          set({ session, user });
          saveToStorage("session", session);
          saveToStorage("user", user);
        } else {
          set({ session: null, user: null });
          storage.delete("session");
          storage.delete("user");
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ isLoading: false });
    }
  },

  signIn: async (credentials: SignInCredentials) => {
    console.log("auth/signIn:-> ");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;
      console.log(
        "auth/signIn:-> got no error after calling auth.signInWithPassword()"
      );

      if (session) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? "",
          firstName: session.user.user_metadata?.first_name ?? "",
          lastName: session.user.user_metadata?.last_name ?? "",
        };

        console.log("auth/signIn:-> session: ", session);
        console.log("auth/signIn:-> user: ", user);

        set({ session, user });
        saveToStorage("session", session);
        saveToStorage("user", user);
        console.log(
          "auth/signIn:-> stored session & user to zustand & mmkv storage"
        );
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  signUp: async (credentials: SignUpCredentials) => {
    console.log("auth/signUp:-> ");
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
          },
        },
      });

      if (error) throw error;

      console.log("auth/signUp:-> got no error after calling auth.signUp()");
      console.log("auth/signUp:-> session: ", session);
      console.log("auth/signUp:-> user: ", user);

      if (user) {
        const transformedUser: User = {
          id: user.id,
          email: user.email ?? "",
          firstName: credentials.firstName,
          lastName: credentials.lastName,
        };

        set({ session, user: transformedUser });
        saveToStorage("session", session);
        saveToStorage("user", transformedUser);
        console.log(
          "auth/signUp:-> stored session & user to zustand & mmkv storage"
        );
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    console.log("auth/resetPassword:-> ");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This redirectTo should be your app's deep link that opens ResetPasswordScreen
        // You'll need to set this up in your Supabase dashboard
        redirectTo: "clanify://resetPassword",
      });

      if (error) throw error;

      console.log(
        "auth/resetPassword:-> got no error after calling resetPasswordForEmail"
      );
    } catch (error) {
      console.error("Error resetting password: ", error);
      throw error;
    }
  },

  updatePassword: async (new_password: string) => {
    console.log("auth/updatePassword:-> ");
    const isPasswordRecovery = get().isPasswordRecovery;
    console.log(
      "auth/updatePassword:-> isPasswordRecovery: ",
      isPasswordRecovery
    );
    if (!isPasswordRecovery) {
      throw Error("auth/updatePassword:-> isPasswordRecovery flag is false");
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
        "auth/updatePassword:->  got no error after calling updatePassword"
      );

      console.log(
        "auth/updatePassword:->  user info retrieved from supabase: ",
        user
      );

      const currentUser = get().user;
      console.log(
        "auth/updatePassword:->  User info stored in zustand: ",
        currentUser
      );
      // if (currentUser) {
      //   const updatedUser: User = {
      //     ...currentUser,
      //     firstName: updates.firstName ?? currentUser.firstName,
      //     lastName: updates.lastName ?? currentUser.lastName,
      //   };
      //   set({ user: updatedUser });
      //   saveToStorage("user", updatedUser);
      // }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      console.log(
        "auth/updatePassword:-> isPasswordRecovery: ",
        isPasswordRecovery
      );
      set({ isPasswordRecovery: false });
      saveToStorage("isPasswordRecovery", false);
    }
  },

  verifyOtp: async (credentials: verifyOtpCredentials) => {
    console.log("auth/verifyOtp:-> ");
    console.log("auth/verifyOtp:-> credentials: ", credentials);
    try {
      if (credentials.type === "email" || credentials.type === "recovery") {
        const params: VerifyEmailOtpParams = {
          email: credentials.email,
          token: credentials.token,
          type: credentials.type,
        };

        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp(params);

        console.log("auth/verifyOtp:-> session: ", session);

        if (error) throw error;
        console.log(
          "auth/verifyOtp:-> got no error after calling auth.verifyOtp()"
        );

        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? "",
            firstName: session.user.user_metadata?.first_name ?? "",
            lastName: session.user.user_metadata?.last_name ?? "",
          };

          console.log("auth/verifyOtp:-> session: ", session);
          console.log("auth/verifyOtp:-> user: ", user);

          set({ session, user });
          saveToStorage("session", session);
          saveToStorage("user", user);
          console.log(
            "auth/verifyOtp:-> stored session & user to zustand & mmkv storage"
          );

          if (credentials.type === "recovery") {
            // Set a flag to indicate we're in password recovery flow
            set({ isPasswordRecovery: true });
            saveToStorage("isPasswordRecovery", true);
          }
        }
      }
    } catch (error) {
      console.error("Error verifying otp:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
      storage.delete("session");
      storage.delete("user");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  getExistingSession: async () => {
    try {
      console.log("auth/getExistingSession:-> ");
      // Check for existing session
      console.log("auth/getExistingSession:-> checking for existing session");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      console.log(
        "auth/getExistingSession:-> No errors upon calling getSession(), here is session: ",
        session
      );
    } catch (error) {
      console.error("Error checking existing session:", error);
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
        saveToStorage("user", updatedUser);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
}));

// Export initialization function for use in app startup
export const initializeAuth = () => {
  const initialize = useAuthStore.getState().initialize;
  initialize();
};

//todo integrate dotenv

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
