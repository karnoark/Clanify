// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV storage with encryption
export const storage = new MMKV({
  id: 'auth-storage',
  encryptionKey: process.env.ENCRYPTION_KEY,
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

// Supabase Configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL or Anon Key is missing. Ensure environment variables are set.',
  );
}

// Create a single Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for MMKV storage
export const saveToStorage = <T>(key: string, value: T) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};
