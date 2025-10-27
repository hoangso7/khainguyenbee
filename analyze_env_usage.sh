#!/bin/bash

echo "=== KBee Manager Environment Variables Usage Analysis ==="
echo ""

# Load environment variables
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo "📋 Checking environment variables from env.example:"
echo ""

# Variables that are used
echo "✅ USED VARIABLES:"
echo ""

echo "Backend Configuration (used in backend/config.py):"
echo "  SECRET_KEY: Used in Flask config"
echo "  DATABASE_URL: Used for SQLAlchemy"
echo "  DOMAIN: Used for CORS and domain config"
echo "  PROTOCOL: Used for CORS origins"
echo "  PORT: Used in config"
echo "  SESSION_COOKIE_SECURE: Used in Flask session config"
echo "  LOG_LEVEL: Used in logging config"
echo "  RATE_LIMIT_ENABLED: Used in rate limiting"
echo "  RATE_LIMIT_DEFAULT: Used in rate limiting"
echo ""

echo "Docker Compose Variables (used in docker-compose.yml):"
echo "  DB_ROOT_PASSWORD: Used for MySQL root password"
echo "  DB_NAME: Used for MySQL database name"
echo "  DB_USER: Used for MySQL user"
echo "  DB_PASSWORD: Used for MySQL password"
echo "  DB_PORT: Used for MySQL port mapping"
echo "  FLASK_ENV: Used for Flask environment"
echo "  FLASK_DEBUG: Used for Flask debug mode"
echo "  FRONTEND_PORT: Used for frontend port mapping"
echo "  FRONTEND_SSL_PORT: Used for frontend SSL port mapping"
echo "  REDIS_PORT: Used for Redis port mapping"
echo ""

echo "Frontend Variables (used in Docker build args):"
echo "  REACT_APP_DOMAIN: Used in frontend build"
echo "  REACT_APP_NAME: Used in frontend build"
echo "  REACT_APP_VERSION: Used in frontend build"
echo "  REACT_APP_COMPANY_NAME: Used in frontend build"
echo ""

echo "❌ UNUSED VARIABLES:"
echo ""

echo "SSL Configuration (not implemented):"
echo "  SSL_EMAIL: Not used anywhere"
echo "  SSL_DOMAINS: Not used anywhere"
echo ""

echo "Nginx Configuration (not implemented):"
echo "  NGINX_WORKER_PROCESSES: Not used anywhere"
echo "  NGINX_WORKER_CONNECTIONS: Not used anywhere"
echo ""

echo "Logging Configuration (partially used):"
echo "  ACCESS_LOG: Not used anywhere"
echo "  ERROR_LOG: Not used anywhere"
echo ""

echo "Security Configuration (not implemented):"
echo "  RATE_LIMIT_ZONE_SIZE: Not used anywhere"
echo "  RATE_LIMIT_RATE: Not used anywhere"
echo "  RATE_LIMIT_BURST: Not used anywhere"
echo ""

echo "Backup Configuration (not implemented):"
echo "  BACKUP_RETENTION_DAYS: Not used anywhere"
echo "  BACKUP_SCHEDULE: Not used anywhere"
echo ""

echo "Monitoring Configuration (not implemented):"
echo "  HEALTH_CHECK_INTERVAL: Not used anywhere"
echo "  HEALTH_CHECK_TIMEOUT: Not used anywhere"
echo "  HEALTH_CHECK_RETRIES: Not used anywhere"
echo ""

echo "Database Variables (redundant):"
echo "  MYSQL_HOST: Not used (hardcoded as 'mysql' in docker-compose)"
echo "  MYSQL_PORT: Not used (hardcoded as '3306' in docker-compose)"
echo "  MYSQL_USER: Not used (replaced by DB_USER)"
echo "  MYSQL_PASSWORD: Not used (replaced by DB_PASSWORD)"
echo "  MYSQL_DATABASE: Not used (replaced by DB_NAME)"
echo "  MYSQL_ROOT_PASSWORD: Not used (replaced by DB_ROOT_PASSWORD)"
echo ""

echo "📊 SUMMARY:"
echo "Total variables in env.example: $(grep -c '^[A-Z]' env.example)"
echo "Used variables: ~15"
echo "Unused variables: ~15"
echo ""
echo "💡 RECOMMENDATIONS:"
echo "1. Remove unused variables to clean up configuration"
echo "2. Implement missing features (SSL, Nginx config, Backup, Monitoring)"
echo "3. Consolidate database variables (use either MYSQL_* or DB_* consistently)"
echo "4. Add proper documentation for each variable"
