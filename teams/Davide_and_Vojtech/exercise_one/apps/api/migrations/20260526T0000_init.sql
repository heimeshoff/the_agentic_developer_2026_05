-- Migration: init
-- Bootstrap migration. Proves the runner works and enables UUID generation
-- (pgcrypto's gen_random_uuid) for primary keys in later migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
