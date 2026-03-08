# Troubleshooting Guide

## Common Issues and Solutions

### Database Connection Issues

**Issue**: `PostgreSQL connection refused`

**Solutions:**
1. Check DATABASE_URL format
2. Verify PostgreSQL is running
3. Ensure credentials are correct
4. Check firewall/security groups

### Authentication Issues

**Issue**: `Invalid token` or `Missing authentication token`

**Solutions:**
1. Verify JWT_SECRET is set and consistent
2. Check token format (should be "Bearer token")
3. Ensure token hasn't expired
4. Validate token generation

### Stripe Integration Issues

**Issue**: `Stripe authentication failed`

**Solutions:**
1. Verify STRIPE_SECRET_KEY is set
2. Check API key is for correct environment (test vs live)
3. Ensure webhook secret is correct
4. Verify Stripe account has billing enabled

### Multi-tenancy Issues

**Issue**: `Tenant data is mixed up`

**Solutions:**
1. Verify tenant_id is included in all queries
2. Check API authentication passes correct tenant
3. Review auth middleware for tenant isolation
4. Check row-level security policies (if using)

### Channel Integration Issues

**Issue**: `Slack/WhatsApp not receiving messages`

**Solutions:**
1. Verify channel credentials in environment
2. Check webhook URLs are correct
3. Ensure channel service is initialized
4. Review channel-specific logs

### Performance Issues

**Issue**: `Slow API responses` or `High database load`

**Solutions:**
1. Add database indexes
2. Implement caching (Redis)
3. Optimize queries with EXPLAIN
4. Scale services (add instances)
5. Enable connection pooling

### CORS Issues

**Issue**: `CORS error in browser console`

**Solutions:**
1. Verify FRONTEND_URL matches actual frontend domain
2. Check CORS middleware configuration
3. Allow credentials if needed
4. Verify API is accessible from frontend domain

## Development Issues

### TypeScript Compilation Errors

**Issue**: `TS compilation failed`

**Solutions:**
1. Run `npm run build` locally first
2. Check for type errors: `npx tsc --noEmit`
3. Verify all imports are correct
4. Check tsconfig.json settings

### Module Not Found

**Issue**: `Cannot find module 'x'`

**Solutions:**
1. Verify import paths match file structure
2. Reinstall dependencies: `npm install`
3. Check package.json has all dependencies
4. Verify path aliases in tsconfig.json

### Tests Failing

**Issue**: `Some or all tests fail`

**Solutions:**
1. Run tests locally: `npm test`
2. Check for database setup issues
3. Verify mock data is correct
4. Review test logs for errors

## Deployment Issues

### Build Fails on Render

**Issue**: `Build failed on Render`

**Solutions:**
1. Check Render logs for error details
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Ensure all dependencies are listed
5. Check Node version requirement

### Service Won't Start

**Issue**: `Service crashes immediately after launch`

**Solutions:**
1. Check environment variables
2. Verify database connection
3. Review startup logs
4. Check for port conflicts
5. Ensure all required services are running

### High Memory Usage

**Issue**: `Service running out of memory`

**Solutions:**
1. Check for memory leaks
2. Monitor active connections
3. Implement caching
4. Scale up instance size
5. Optimize database queries

## Monitoring

### Health Checks

```bash
# Check backend health
curl https://api.yourapp.com/health

# Check database availability
psql $DATABASE_URL -c "SELECT 1"

# Check external integrations
curl -I https://slack.com
curl -I https://stripe.com
```

### Log Patterns

**Look for these patterns in logs:**
- `ERROR`: System errors
- `WARN`: Potential issues
- `CONNECT`: Connection events
- `DISCONNECT`: Disconnection events
- `RATE_LIMIT`: Usage limit warnings

## Recovery Procedures

### Reset Database

```bash
# Backup first
pg_dump $DATABASE_URL > backup.sql

# Drop and recreate
dropdb
createdb
psql < schema.sql
```

### Restart Services

```bash
# Render CLI (if installed)
render restart <service-id>

# Or via dashboard: Service → Restart
```

### Clear Cache

```bash
# If using Redis
redis-cli FLUSHDB

# Or restart Redis service
```

## Getting Help

1. **Check logs first** - Most issues are in logs
2. **Search documentation** - Common solutions documented
3. **GitHub Issues** - Check existing issues
4. **Community forums** - Stack Overflow, Reddit
5. **Support channels** - Reach out to me or Render support

## Best Practices

1. **Monitor regularly** - Check metrics daily
2. **Update dependencies** - Keep packages current
3. **Test before deploying** - Verify locally first
4. **Use feature flags** - Gradual rollouts
5. **Implement logging** - Log important events
6. **Set up alerts** - Get notified of issues
7. **Document changes** - Keep changelog updated
8. **Backup data** - Regular automated backups
