# Render Deployment Guide

## Prerequisites

1. **GitHub Account**: Code must be in a GitHub repository
2. **Render Account**: Free account at https://render.com
3. **Environment Variables**: All configuration values ready
4. **Stripe Account** (for billing): Tests use mock by default

## Step-by-Step Deployment

### 1. Create GitHub Repository

Push your code to GitHub:

```bash
cd /Users/tony/GitHub/customer-service-ai-agent

# If not already initialized
git remote add origin https://github.com/Dtony47/customer-service-ai-agent.git
git branch -M main
git push -u origin main
```

### 2. Connect Render to GitHub

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint" (or "Web Service" for individual services)
3. Connect your GitHub account
4. Select the `customer-service-ai-agent` repository

### 3. Select Deployment Method

Choose one:

#### Option A: Blueprint (Recommended - Deploy Everything)
```yaml
# Uses render.yaml for coordinated deployment of:
# - PostgreSQL Database
# - Backend API Service
# - Frontend Service
# - Background Worker
```

**Steps:**
1. Click "Blueprint" when connecting repository
2. Render will auto-detect `render.yaml`
3. Fill in environment variables
4. Click "Deploy"

#### Option B: Individual Services (Manual)

**Create Backend Service:**
1. New Web Service
2. Repository: `customer-service-ai-agent`
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`
5. Plan: Standard or Pro
6. Add environment variables (see section below)

**Create Frontend Service:**
1. New Web Service  
2. Repository: `customer-service-ai-agent`
3. Build Command: `cd frontend && npm install && npm run build`
4. Start Command: `cd frontend && npm run preview`
5. Plan: Standard or Pro

**Create PostgreSQL:**
1. New PostgreSQL
2. Select region
3. Choose plan

### 4. Environment Variables

#### Backend Service
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=generate_a_strong_random_string_min_32_chars
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PRO=price_pro_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_id
LOG_LEVEL=info
FRONTEND_URL=https://your-frontend-app.onrender.com
SLACK_BOT_TOKEN=xoxb_your_token (optional)
SLACK_SIGNING_SECRET=your_secret (optional)
SLACK_APP_TOKEN=xapp_your_token (optional)
WHATSAPP_API_URL=http://your_evolution_api_url (optional)
WHATSAPP_API_KEY=your_api_key (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_account_sid (optional)
TWILIO_AUTH_TOKEN=your_auth_token (optional)
TWILIO_PHONE_NUMBER=+1234567890 (optional)
```

#### Frontend Service
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_SOCKET_URL=https://your-backend-app.onrender.com
```

### 5. Database Setup

After PostgreSQL is created:

1. Get the connection string from Render database dashboard
2. SSH into backend service or use database connection
3. Initialize schema:
   ```bash
   npm run db:init
   ```

### 6. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-app.onrender.com/api/billing/webhook`
3. Select events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 7. Custom Domain

1. In Render dashboard, go to your service
2. Settings → Custom Domain
3. Add your domain (e.g., `api.yourcompany.com`)
4. Update DNS records as shown
5. Update `FRONTEND_URL` to use custom domain

### 8. Verify Deployment

Check service health:
```bash
# Backend API
curl https://your-backend-app.onrender.com/health

# Frontend (should load)
https://your-frontend-app.onrender.com
```

Test sign up:
```bash
curl -X POST https://your-backend-app.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "email": "test@example.com",
    "password": "TestPassword123",
    "slug": "test-company"
  }'
```

## Troubleshooting

### Build Failures

**Check logs:**
```bash
# View full deployment logs in Render dashboard
# Or use Render CLI if installed
```

**Common issues:**
- Missing environment variables: Add them in service settings
- Database not initialized: Run migrations manually
- Node version: Ensure Node 20+ is available

### Runtime Errors

**Check logs:**
1. Render dashboard → Service → Logs
2. Look for errors and stack traces

**Database Issues:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL connection limits
- Ensure database is in same region

### Stuck Deployments

1. Cancel deployment
2. Check for syntax errors
3. Verify environment variables
4. Review build logs carefully

## Performance Optimization

### Database
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

### Scaling
- **Horizontal**: Create multiple instances via Render dashboard
- **Caching**: Add Redis service for session/cache
- **CDN**: Use Render's built-in CDN for static assets

## Monitoring

### View Metrics
1. Render Dashboard → Service → Metrics
2. Monitor:
   - CPU usage
   - Memory usage
   - Requests/sec
   - Error rate

### Logs
- Streaming logs in Render dashboard
- Export for analysis

### Alerts
1. Set up monitoring in Render
2. Configure email notifications for failures
3. Monitor uptime

## Maintenance

### Updating Code
```bash
git push origin main
# Render auto-redeploys on git push (if auto-deploy enabled)
```

### Database Backups
1. Render → PostgreSQL Instance → Settings
2. Enable automatic backups
3. Configure retention period
4. Manual backup: Export via Render UI or pg_dump

### Rolling Updates
- Render automatically handles zero-downtime deployments
- Services restart in order based on dependencies in render.yaml

## Costs

**Render Free Tier:**
- PostgreSQL: 90-day free trial, then $7/month minimum
- Web Services: Free tier with limitations (shared CPU, 0.5GB RAM)

**Production Pricing:**
- Web Service (Standard): $7/month per instance
- PostgreSQL: $9+/month depending on size
- Background Worker: $7/month

**Estimate for SaaS:**
- Starter plan: Free tier services
- Growth: Standard plan services ($25-50/month)
- Enterprise: Pro plan services ($100+/month)

## Support

- Render Docs: https://render.com/docs
- GitHub Issues: Report bugs in your repository
- Render Support: support@render.com
