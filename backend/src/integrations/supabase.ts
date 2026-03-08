import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../middleware/index.js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  logger.warn('Supabase credentials not configured - using PostgreSQL fallback');
}

let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 * Falls back to null if credentials not configured
 */
export function initializeSupabase(): SupabaseClient | null {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
    logger.info('✅ Supabase initialized successfully');
    return supabase;
  } catch (error) {
    logger.error('Failed to initialize Supabase:', error);
    return null;
  }
}

/**
 * Get Supabase client instance
 */
export function getSupabase(): SupabaseClient | null {
  return supabase;
}

/**
 * Execute Supabase query with error handling
 */
export async function executeSupabaseQuery<T>(
  query: Promise<{ data: T | null; error: any }>,
  operation: string
): Promise<T | null> {
  try {
    const { data, error } = await query;

    if (error) {
      logger.error(`Supabase operation failed (${operation}):`, error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error(`Error executing Supabase operation (${operation}):`, error);
    return null;
  }
}

/**
 * Supabase authentication helpers
 */
export async function signUpUser(email: string, password: string) {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error('Sign up failed:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    logger.error('Unexpected error during sign up:', error);
    return { error: 'Sign up failed' };
  }
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email: string, password: string) {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Sign in failed:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    logger.error('Unexpected error during sign in:', error);
    return { error: 'Sign in failed' };
  }
}

/**
 * Verify user session
 */
export async function verifySession(token: string) {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return { error: error.message, user: null };
    }

    return { data: data.user };
  } catch (error) {
    logger.error('Error verifying session:', error);
    return { error: 'Session verification failed', user: null };
  }
}

/**
 * Set up real-time subscriptions for conversations
 */
export function subscribeToConversations(
  tenantId: string,
  callback: (payload: any) => void
) {
  if (!supabase) return null;

  try {
    const subscription = supabase
      .channel(`tenant:${tenantId}:conversations`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          logger.debug('Conversation update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    logger.error('Failed to subscribe to conversations:', error);
    return null;
  }
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
) {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      logger.error('File upload failed:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    logger.error('Unexpected error during file upload:', error);
    return { error: 'File upload failed' };
  }
}

/**
 * Get signed URL for file access
 */
export async function getSignedUrl(bucket: string, path: string) {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      logger.error('Failed to create signed URL:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    logger.error('Unexpected error creating signed URL:', error);
    return { error: 'Failed to create signed URL' };
  }
}
