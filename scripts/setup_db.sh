#!/bin/bash

# Create database
# Using || true to prevent script failure if database already exists
createdb mynaga_gabay || echo "Database 'mynaga_gabay' might already exist."

# Enable pgvector
psql mynaga_gabay -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create documents table
psql mynaga_gabay -c "
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);"

echo "Database setup complete."
