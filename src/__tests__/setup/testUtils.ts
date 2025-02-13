import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const getTestClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase test configuration. ' +
      'Make sure .env.test is properly configured and NODE_ENV=test'
    );
  }

  return createClient(
    supabaseUrl,
    supabaseAnonKey
  );
};