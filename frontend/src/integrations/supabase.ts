import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client for frontend
 */
export function initializeSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured - check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return null;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    console.log('✅ Supabase frontend client initialized');
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

/**
 * Get Supabase client instance
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabase) {
    return initializeSupabase();
  }
  return supabase;
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string) {
  const client = getSupabase();
  if (!client) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
    });

    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'Sign up failed' };
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string) {
  const client = getSupabase();
  if (!client) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Sign in failed' };
  }
}

/**
 * Get current user session
 */
export async function getSession() {
  const client = getSupabase();
  if (!client) return { session: null };

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    return { session };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const client = getSupabase();
  if (!client) return { error: 'Supabase not initialized' };

  try {
    const { error } = await client.auth.signOut();
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'Sign out failed' };
  }
}

/**
 * Subscribe to conversation changes in real-time
 */
export function subscribeToConversations(
  tenantId: string,
  callback: (payload: any) => void
) {
  const client = getSupabase();
  if (!client) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const subscription = client
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
          console.log('Conversation updated:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to conversations:', error);
    return null;
  }
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (payload: any) => void
) {
  const client = getSupabase();
  if (!client) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const subscription = client
      .channel(`conversation:${conversationId}:messages`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('New message:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to messages:', error);
    return null;
  }
}

/**
 * Download file from storage
 */
export async function downloadFile(bucket: string, path: string) {
  const client = getSupabase();
  if (!client) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .download(path);

    if (error) return { error: error.message };
    return { data };
  } catch (error) {
    console.error('Download error:', error);
    return { error: 'Download failed' };
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Get public URL error:', error);
    return null;
  }
}

/**
 * Initialize Supabase on app load
 */
export function initSupabaseOnLoad() {
  return initializeSupabase();
}
