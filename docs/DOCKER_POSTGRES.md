Docker PostgreSQL (Windows + PowerShell)

Overview
- Spins up PostgreSQL 16 via Docker with persisted volume `svr_pgdata`.
- Uses a local `.env` file (not committed) for credentials and port.

Prerequisites
- Docker Desktop installed and running.
- From the repo root (`Sistema Venta de Ropa`).

1) Create your local .env
- Copy the example and adjust values if needed:
  - `Copy-Item .env.example .env`

2) Start/stop the database
- Start in background: `docker compose up -d`
- Stop containers: `docker compose down`
- Stop and remove volume/data: `docker compose down -v`

3) Connect with DBeaver
- Driver: PostgreSQL
- Host: `localhost`
- Port: value of `POSTGRES_PORT` from your local `.env` (default `5432`)
- Database: value of `POSTGRES_DB` (default `sistema_venta_ropa`)
- User: value of `POSTGRES_USER` (default `svr_user`)
- Password: value of `POSTGRES_PASSWORD` (default `svr_pass`)

4) Load schema and seed data
Option A — Using DBeaver
- Open `db/schema.sql` and execute it.
- Then open `db/data.sql` and execute it.

Option B — Using Docker CLI (PowerShell)
- Copy SQL files into the container:
  - `docker compose cp db/schema.sql svr_postgres:/tmp/schema.sql`
  - `docker compose cp db/data.sql   svr_postgres:/tmp/data.sql`
- Execute inside the container (uses env from `.env`):
  - `docker compose exec svr_postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/schema.sql'`
  - `docker compose exec svr_postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/data.sql'`

5) Common issue: port conflict
- Symptom: `docker compose up -d` fails or logs show port already in use.
- Fix: edit your local `.env` and change `POSTGRES_PORT` (e.g., `5433`). Then run `docker compose up -d` again.

Notes
- Data persists in the Docker volume `svr_pgdata`. Use `docker compose down -v` to reset.
- Do NOT commit your `.env` file. `.gitignore` already ignores it; use `.env.example` as reference.

