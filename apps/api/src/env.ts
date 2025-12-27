/**
 * API environment bootstrap
 *
 * Must run before importing modules that initialize Prisma.
 * This file loads `.env` and provides backward-compatible env var mapping.
 */

import dotenv from 'dotenv';

// Load env from repo root
dotenv.config({ path: '../../.env' });

// Backward-compatible env var mapping (helps local dev / existing setups)
const baseDbUrl =
  process.env.API_DATABASE_URL ||
  process.env.POSTGRES_DATABASE_PUBLIC_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_DATABASE_URL;

if (!process.env.API_DATABASE_URL && baseDbUrl) {
  // IMPORTANT (safety): if we reuse the Web/NextAuth database, we must NOT run API Prisma in the `public`
  // schema because `prisma db push` would attempt to drop unrelated tables it doesn't know about.
  // We default the API to its own schema to avoid destructive changes.
  const needsSchemaParam = !/[?&]schema=/.test(baseDbUrl);
  process.env.API_DATABASE_URL = needsSchemaParam
    ? `${baseDbUrl}${baseDbUrl.includes('?') ? '&' : '?'}schema=mynaga_api`
    : baseDbUrl;
}


