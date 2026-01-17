#!/bin/bash

# Test GET /api/leads with staff token
curl -X GET "http://localhost:8080/api/leads" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZThkOTZlYWJmNTU5ZTE2YWZlNTQ3MiIsInJvbGUiOiJzdGFmZiIsImlhdCI6MTc2MTczNDMwMSwiZXhwIjoxNzY0MzI2MzAxfQ.3AKY8mEcxdfb3Sb10S21wXRz820_VJw5gZfdBp4GOQE" \
  -H "Content-Type: application/json" \
  -v

