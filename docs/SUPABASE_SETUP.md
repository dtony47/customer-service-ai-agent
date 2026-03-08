# Supabase Integration Guide

## Overview

This customer service AI agent SaaS supports optional Supabase integration, which provides:

- **Managed PostgreSQL Database**: Reduces DevOps overhead, automatic backups, monitoring
- **Authentication**: Supabase Auth for email/password, OAuth, MFA support
- **Real-time Subscriptions**: Built-in WebSocket support for live conversation updates
- **File Storage**: Secure bucket storage for conversation transcripts, attachments
- **Vector Database** (pgvector): Optional AI embeddings for semantic search
- **Edge Functions**: Serverless functions for background tasks

## Setup

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `customer-service-ai`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get API Keys

From Supabase project Settings → API:

- **Project URL**: `https://[project-id].supabase.co`
- **Anon Key**: Public API key (safe for frontend)
- **Service Role Key**: Secret key (backend only)

### 3. Update Environment Variables

Copy keys to `.env`:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (anon key from Supabase)
```

## Database Setup

### Option A: Auto-Initialize (Recommended)

The project creates tables automatically on first run. Supabase uses the same schema as PostgreSQL:

```bash
cd backend
npm install
npm run dev
```

### Option B: Manual SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Create tables using schema from `backend/src/db/schema.ts`
3. Run SQL:

```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_plan TEXT DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Additional tables follow same pattern...
```

## Features

### 1. Real-time Conversations

Subscribe to live conversation updates:

```typescript
import { subscribeToConversations } from './integrations/supabase';

// Subscribe to tenant's conversations
const subscription = subscribeToConversations(tenantId, (payload) => {
  console.log('Conversation update:', payload);
  // payload.eventType = 'INSERT' | 'UPDATE' | 'DELETE'
  // payload.new = new row data
  // payload.old = old row data
});

// Unsubscribe
subscription?.unsubscribe();
```

### 2. File Storage

Upload conversation transcripts or attachments:

```typescript
import { uploadFile, getSignedUrl } from './integrations/supabase';

// Upload file
const { data, error } = await uploadFile(
  'conversations',              // bucket name
  `${tenantId}/${conversationId}/transcript.pdf`,
  fileBuffer,
  'application/pdf'
);

// Get signed URL (valid for 1 hour)
const { data: url } = await getSignedUrl(
  'conversations',
  `${tenantId}/${conversationId}/transcript.pdf`
);
```

### 3. Authentication

Use Supabase Auth for user management:

```typescript
import { signUpUser, signInUser, verifySession } from './integrations/supabase';

// Sign up
const { data, error } = await signUpUser('user@example.com', 'password123');

// Sign in
const { data: session } = await signInUser('user@example.com', 'password123');

// Verify session
const { data: user } = await verifySession(token);
```

## Deployment on Render

### 1. Connect PostgreSQL

Render → PostgreSQL → Create Database → Copy connection string

```bash
# Set in .env on Render
DATABASE_URL=postgresql://user:password@dpg-xyz.render.internal:5432/db_name
```

### 2. Or Use Supabase Database

In Supabase Settings → Database → Connection Pooling:

- Copy Full connection string (with password)
- Use for `DATABASE_URL` on Render

### 3. Enable RLS (Row-Level Security)

For Supabase to work with row-level isolation:

1. Go to Supabase → Authentication → Row Level Security
2. Enable RLS on all tables
3. Create policy for tenant isolation:

```sql
CREATE POLICY "Users can access their tenant's data"
  ON public.conversations
  USING (tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  ));
```

## Pricing

### Self-hosted PostgreSQL
- **Free**: Limited resources
- **Production**: ~$15-30/month on Render

### Supabase
- **Free Tier**: 
  - 500MB database
  - 2GB file storage
  - 50k realtime connections
  - Good for development/testing
  
- **Pro Tier**: 
  - $25/month
  - 8GB database
  - 100GB file storage
  - Recommended for production

- **Team/Custom**: 
  - Contact sales

## Hybrid Approach

You can use both:

- **Supabase**: For user authentication, file storage, realtime
- **Self-hosted PostgreSQL**: For application data (conversations, messages, KB)

Update `backend/src/db/schema.ts` to split between:

```typescript
import { getSupabase } from '../integrations/supabase.js';

// Auth tables in Supabase
supabase.schema('public').from('users');

// Data tables in PostgreSQL
pool.query('SELECT * FROM conversations WHERE tenant_id = $1');
```

## Migration from PostgreSQL to Supabase

### 1. Export Data

```bash
pg_dump -h localhost -U postgres customer_service_ai > backup.sql
```

### 2. Create Supabase Database

Follow Setup steps above.

### 3. Import Data

In Supabase SQL Editor:
1. Copy contents of `backup.sql`
2. Paste and run (or use CLI)

### 4. Update Connection String

```bash
# .env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Troubleshooting

### Connection Issues
```typescript
// Test Supabase connection
const supabase = getSupabase();
if (!supabase) {
  console.error('Supabase not initialized - check SUPABASE_URL and SUPABASE_ANON_KEY');
}
```

### Real-time Not Working
1. Ensure RLS is enabled
2. Check Supabase dashboard logs
3. Verify network connectivity
4. Create policy for table access

### Storage Access Denied
- Ensure bucket is created
- Check bucket policies in Supabase Storage
- Verify service role has write permissions

## Next Steps

1. ✅ Create Supabase project
2. ✅ Copy API keys to `.env`
3. ✅ Initialize database (auto or manual)
4. ✅ Test connection: `npm run dev`
5. ✅ Deploy to Render with Supabase credentials
6. ✅ Monitor logs: Supabase Dashboard → Logs

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://github.com/supabase/supabase-js)
- [JDBC/PostgreSQL Drivers](https://www.postgresql.org/download/)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
