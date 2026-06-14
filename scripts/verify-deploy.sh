#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-https://macrosift.site}"
PASS=0
FAIL=0

pass() { echo "  ✅ $1"; ((PASS++)); }
fail() { echo "  ❌ $1"; ((FAIL++)); }
check() { if eval "$2" >/dev/null 2>&1; then pass "$1"; else fail "$1"; fi }

echo "=== MacroSift Deploy Verification ==="
echo "Target: $BASE_URL"
echo ""

check "HTTPS响应 200" "curl -sfI $BASE_URL | grep -q 'HTTP/2 200'"
check "SSL证书有效" "curl -sfI $BASE_URL 2>&1 | grep -q 'HTTP/2'"
check "HTTP重定向到HTTPS" "curl -sfI http://macrosift.site 2>&1 | grep -q '308'"

check "首页加载" "curl -sf $BASE_URL/ | grep -q 'MacroSift'"
check "NextAuth handler" "curl -sf $BASE_URL/api/auth/signin -o /dev/null -w '%{http_code}' | grep -q '200\|302\|405'"

check "Health endpoint" "curl -sf $BASE_URL/api/health | python3 -c \"import sys,json; d=json.load(sys.stdin); assert d.get('status')=='healthy'\""
check "Database ok" "curl -sf $BASE_URL/api/health | python3 -c \"import sys,json; d=json.load(sys.stdin); assert d['checks']['database']=='ok'\""
check "Redis ok" "curl -sf $BASE_URL/api/health | python3 -c \"import sys,json; d=json.load(sys.stdin); assert d['checks']['redis']=='ok'\""
check "Markets API" "curl -sf $BASE_URL/api/markets | python3 -c \"import sys,json; d=json.load(sys.stdin); assert 'symbols' in d\""

if command -v docker &>/dev/null; then
  check "Docker daemon" "docker info >/dev/null 2>&1"
  check "Postgres" "docker ps --filter name=postgres --format '{{.Status}}' | grep -q healthy"
  check "Redis" "docker ps --filter name=redis --format '{{.Status}}' | grep -q healthy"
  check "App" "docker ps --filter name=app --format '{{.Status}}' | grep -q Up"
  check "Bot" "docker ps --filter name=bot --format '{{.Status}}' | grep -q Up"
  check "Caddy" "docker ps --filter name=caddy --format '{{.Status}}' | grep -q Up"
fi

# Check critical env vars in app container
if docker ps --filter name=app --format '{{.Names}}' | grep -q app; then
  if [ -n "$(docker exec trading-platform-app-1 printenv GOOGLE_CLIENT_ID 2>/dev/null)" ]; then
    pass "GOOGLE_CLIENT_ID set"
  else
    fail "GOOGLE_CLIENT_ID set"
  fi
  if echo "$(docker exec trading-platform-app-1 printenv STRIPE_PRICE_PRO_MONTHLY 2>/dev/null)" | grep -q price_; then
    pass "STRIPE_PRICE_PRO_MONTHLY set"
  else
    fail "STRIPE_PRICE_PRO_MONTHLY set"
  fi
  if [ -n "$(docker exec trading-platform-app-1 printenv TELEGRAM_BOT_TOKEN 2>/dev/null)" ]; then
    pass "TELEGRAM_BOT_TOKEN set"
  else
    fail "TELEGRAM_BOT_TOKEN set"
  fi
fi

echo ""
echo "================================"
echo "  ✅ Passed: $PASS"
echo "  ❌ Failed: $FAIL"
echo "================================"

if [ "$FAIL" -gt 0 ]; then exit 1; fi
echo "✨ All checks passed!"
