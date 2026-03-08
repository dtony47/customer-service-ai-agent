# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│ Web Browser              Mobile App           Third-party SDKs   │
│ (React Frontend)         (React Native)       (API Integration)  │
└──────────────┬───────────────────────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                   Express.js API Server                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Authentication │ Multi-tenancy │ Rate Limiting │ Logging │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Routes:                                                          │
│  • /api/auth     - Authentication & authorization                │
│  • /api/billing  - Subscription management                       │
│  • /api/kb       - Knowledge base (FAQs, Policies, SOPs)        │
│  • /api/messages - Message handling                              │
│  • /api/conversations - Conversation management                  │
│  • /api/channels - Channel management                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ PostgreSQL   │  │ External Services │
│ Database     │  │                   │
│              │  │ • Google Gemini   │
│ • Tenants    │  │ • Stripe          │
│ • Users      │  │ • Slack           │
│ • Messages   │  │ • WhatsApp        │
│ • KB Items   │  │ • Email (SMTP)    │
│ • Billing    │  │ • Twilio Voice    │
└──────────────┘  └──────────────────┘
```

## Multi-Tenancy Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Tenant A          │     │   Tenant B          │     │   Tenant C          │
│ • User 1            │     │ • User 3            │     │ • User 5            │
│ • User 2            │     │ • User 4            │     │ • User 6            │
│ • Conversations     │     │ • Conversations     │     │ • Conversations     │
│ • Messages          │     │ • Messages          │     │ • Messages          │
│ • KB Items          │     │ • KB Items          │     │ • KB Items          │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                          │                           │
         └──────────────┬───────────┴───────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────┐
         │  PostgreSQL Database                 │
         │  (Separate schema per tenant)        │
         │  (Row-level security if needed)      │
         └──────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ 1. POST /auth/signup or /auth/login
       ▼
┌──────────────────────────────┐
│  Auth Service                │
│  • Validate credentials      │
│  • Hash/compare passwords    │
│  • Generate JWT token       │
└──────┬───────────────────────┘
       │ 2. Return token
       ▼
┌──────────────────────────────┐
│  Client Storage              │
│  • Store JWT in local        │
│  • Include in API headers    │
└──────┬───────────────────────┘
       │ 3. GET /api/resource
       │    Authorization: Bearer <token>
       ▼
┌──────────────────────────────┐
│  Auth Middleware             │
│  • Verify token signature    │
│  • Check expiration          │
│  • Extract tenant ID         │
└──────┬───────────────────────┘
       │ 4. allow/deny
       ▼
┌──────────────────────────────┐
│  Protected Route             │
│  • Access granted            │
│  • Tenant ID passed          │
└──────────────────────────────┘
```

## Billing & Subscription Flow

```
┌──────────────────┐
│  New Tenant      │
└────────┬─────────┘
         │ 1. Sign up (Free/Starter)
         ▼
┌────────────────────────────────┐
│  Tenant Created                │
│  • Default plan: Starter       │
│  • Stripe customer created     │
└────────┬───────────────────────┘
         │ 2. User upgrades plan
         ▼
┌────────────────────────────────┐
│  Create Subscription           │
│  • Call Stripe API             │
│  • Store subscription ID       │
│  • Update tenant record        │
└────────┬───────────────────────┘
         │ 3. Payment success
         ▼
┌────────────────────────────────┐
│  Update Subscription Status    │
│  • Set status: active          │
│  • Enable premium features     │
│  • Update usage limits         │
└────────┬───────────────────────┘
         │ 4. Billing webhook
         ▼
┌────────────────────────────────┐
│  Process Webhook               │
│  • Update subscription status  │
│  • Handle invoice events       │
│  • Track payment history       │
└────────────────────────────────┘
```

## Message Processing Flow

```
┌─────────────────────┐
│  Channel Gateway    │
│  (Slack/WhatsApp)   │
└──────────┬──────────┘
           │ 1. Incoming message webhook
           ▼
┌──────────────────────────────────┐
│  Channel Handler                 │
│  • Parse message                 │
│  • Extract sender info           │
│  • Validate API key              │
└──────────┬───────────────────────┘
           │ 2. Create/update conversation
           ▼
┌──────────────────────────────────┐
│  Conversation Service            │
│  • Find or create conversation   │
│  • Enforce tenant isolation      │
│  • Track metadata                │
└──────────┬───────────────────────┘
           │ 3. Generate AI response
           ▼
┌──────────────────────────────────┐
│  AI Service (Google Gemini)      │
│  • Build context from KB         │
│  • Get conversation history      │
│  • Generate intelligent response │
└──────────┬───────────────────────┘
           │ 4. Check usage limits
           ▼
┌──────────────────────────────────┐
│  Usage Service                   │
│  • Track event                   │
│  • Check plan limits             │
│  • Enforce rate limits           │
└──────────┬───────────────────────┘
           │ 5. Send response
           ▼
┌──────────────────────────────────┐
│  Channel Handler                 │
│  • Send via appropriate channel  │
│  • Log message                   │
│  • Update conversation status    │
└──────────────────────────────────┘
```

## Database Schema

### Core Tables
- **tenants**: SaaS instances (companies)
- **users**: Team members and admins
- **conversations**: Customer interactions
- **messages**: Individual messages in conversations

### Knowledge Base
- **faqs**: Frequently asked questions
- **policies**: Company policies
- **sops**: Standard operating procedures

### Integrations
- **channel_integrations**: Connected channels (Slack, WhatsApp)
- **usage_events**: Usage tracking for billing
- **audit_logs**: Action audit trail

### Key Features
- Row-level tenant isolation
- Relationship integrity
- Performance indexes
- Audit trail for compliance

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (can add instances)
- Load balanced via Render
- Database connection pooling
- Session store (future: Redis)

### Vertical Scaling
- Database: Memory/CPU upgrades
- Services: Larger instances
- Caching layer (Redis) for frequently accessed data

### Rate Limiting
- Per-tenant quotas via subscription plan
- Request rate limiting per API key
- Message rate limiting per channel
- Connection limits per tenant

## Security Architecture

```
┌────────────────────────────────────────┐
│         HTTPS/TLS Layer                │
│  (Encrypt data in transit)             │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│      CORS & API Gateway                │
│  (Control access)                      │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│    Authentication Middleware           │
│  (Verify JWT or API key)               │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│   Authorization & Tenant Isolation     │
│  (Ensure tenant can only see own data) │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│        Application Logic               │
│  (Encrypted sensitive fields)          │
└────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────┐
│    Database Security                   │
│  (Encrypted at rest, backups secured) │
└────────────────────────────────────────┘
```

## Deployment Architecture (Render)

```
┌────────────────────────────────────────────────┐
│            Render.com Deployment               │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  Frontend    │  │  Backend     │          │
│  │  Service     │  │  Service     │          │
│  │  (React)     │  │  (Express)   │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │
│         └──────────────────┴────────┐         │
│                                     │         │
│              ┌──────────────────────▼──┐     │
│              │  PostgreSQL Database    │     │
│              │  (Managed)              │     │
│              └─────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Background Worker (Email, etc)       │ │
│  └────────────────────────────────────────┘ │
│                                              │
└────────────────────────────────────────────────┘
```

## Data Flow Summary

1. **User Signs Up** → Tenant created, User created
2. **User Logs In** → JWT token issued
3. **Team Member Joins** → New user created, assigned to tenant
4. **Configure KB** → Admin adds FAQs, Policies, SOPs
5. **Customer Message** → Received via channel webhook
6. **Process & Respond** → AI generates response using KB
7. **Track Usage** → Message counted against quota
8. **Billing** → Stripe charges based on plan
