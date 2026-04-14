#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/signallab}"

pnpm --filter api run prisma:migrate:deploy
pnpm --filter api run prisma:seed
pnpm --filter api run prisma:generate
