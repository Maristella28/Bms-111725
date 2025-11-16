#!/bin/bash

# URL Sanitization Quick Test Script
# This script tests the URL sanitization system using cURL

echo "=== URL Sanitization Quick Test ==="
echo ""

# Base URL (adjust if your server runs on different port)
BASE_URL="http://localhost:8000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local description="$4"
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data")
    else
        response=$(curl -s -X GET "$BASE_URL$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "Response: $response" | head -c 200
        echo ""
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo "---"
}

# Test 1: Basic URL Sanitization
echo "1. Testing URL Sanitization..."
test_endpoint "/api/test/sanitization/url" "POST" '{
    "url": "javascript:alert(\"xss\")",
    "path": "../../../etc/passwd",
    "filename": "file<>:\"/\\|?*.txt",
    "email": "user@example.com",
    "phone": "+1-555-123-4567",
    "text": "Hello, World!"
}' "URL Sanitization Test"

# Test 2: Malicious Input Detection
echo "2. Testing Malicious Input Detection..."
test_endpoint "/api/test/sanitization/malicious" "GET" "" "Malicious Input Test"

# Test 3: Query Parameter Sanitization
echo "3. Testing Query Parameter Sanitization..."
test_endpoint "/api/test/sanitization/query-params?param1=<script>alert('xss')</script>&param2=../../../etc/passwd" "GET" "" "Query Parameter Test"

# Test 4: Middleware Sanitization
echo "4. Testing Middleware Sanitization..."
test_endpoint "/api/test/sanitization/middleware" "POST" '{
    "malicious_input": "<script>alert(\"xss\")</script>",
    "sql_injection": "'; DROP TABLE users; --",
    "directory_traversal": "../../../etc/passwd",
    "control_chars": "text\x00\x01\x02text"
}' "Middleware Sanitization Test"

# Test 5: API Connection Test
echo "5. Testing API Connection..."
test_endpoint "/api/test-connection" "GET" "" "API Connection Test"

echo ""
echo "=== Test Summary ==="
echo "All tests completed. Check the responses above for sanitization results."
echo ""
echo "Expected Results:"
echo "- Malicious URLs should be cleaned or blocked"
echo "- XSS patterns should be removed or encoded"
echo "- SQL injection patterns should be filtered"
echo "- Directory traversal should be prevented"
echo "- Control characters should be removed"
echo ""
echo "If you see sanitized/cleaned data in the responses, the system is working correctly!"
