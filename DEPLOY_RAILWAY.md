# Railway Deployment (Backend + Main Frontend + Courier Frontend + Postgres)

## 1) Create project and services (one GitHub repo)

1. In Railway create a new project from this GitHub repository.
2. Add service `backend` with **Root Directory**: `backend`.
3. Add service `postgres` using Railway PostgreSQL template.
4. Add service `frontend-main` with **Root Directory**: `/` (repo root).
5. Add service `frontend-courier` with **Root Directory**: `cargo-courier-app`.

## 2) Backend service settings

- Build Command: `go build -o server ./cmd/server`
- Start Command: `./server`
- Healthcheck Path: `/health`

Environment variables:

- `JWT_SECRET=<strong-random-secret>`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `CORS_ALLOWED_ORIGINS=https://<frontend-domain>`

Note: `PORT` is automatically injected by Railway.

## 3) Frontend service settings (`frontend-main`)

- Build Command: `npm ci && npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

Environment variables:

- `VITE_API_URL=https://<backend-domain>`
- `BACKEND_URL=https://<backend-domain>` (only needed when using `npm run start` / `server.js`)

The main frontend supports external API base through `VITE_API_URL`.

## 4) Courier frontend service settings (`frontend-courier`)

- Root Directory: `cargo-courier-app`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

Environment variables:

- `VITE_API_URL=https://<backend-domain>`

The courier frontend uses the dedicated courier login endpoint:

- `POST /api/auth/courier/login`

## 5) CORS

In backend service set:

- `CORS_ALLOWED_ORIGINS=https://<main-frontend-domain>,https://<courier-frontend-domain>`

## 6) Apply database migrations

The Go backend currently applies embedded SQL files at startup. For a new Railway database, start the backend once and then verify the schema. If applying manually, run the migration files in lexical order:

```sql
\i /path/to/backend/migrations/001_create_tables.up.sql
\i /path/to/backend/migrations/002_migrate_existing_schema.up.sql
\i /path/to/backend/migrations/003_test_data.up.sql
\i /path/to/backend/migrations/004_add_mobile_group_role.sql
\i /path/to/backend/migrations/006_client_segments_and_views.up.sql
\i /path/to/backend/migrations/007_add_door_to_door.sql
\i /path/to/backend/migrations/008_remove_train_time.sql
\i /path/to/backend/migrations/009_add_courier_role.sql
\i /path/to/backend/migrations/010_add_payment_required_fields.sql
\i /path/to/backend/migrations/011_add_courier_id.sql
\i /path/to/backend/migrations/012_add_sender_phone.sql
\i /path/to/backend/migrations/013_add_pickup_issue_codes.sql
\i /path/to/backend/migrations/014_add_audit_operator_name.sql
\i /path/to/backend/migrations/015_add_mobius_ticket.sql
\i /path/to/backend/migrations/016_rename_email_to_login.sql
\i /path/to/backend/migrations/017_add_scanned_places.sql
\i /path/to/backend/migrations/018_add_received_scanned_places.sql
```

If SQL console does not support `\i`, paste migration files content sequentially.

Do not set `BOOTSTRAP_ADMIN_PASSWORD` in production unless you are initializing an empty database. Existing admin passwords are not reset automatically.

## 7) Verify

1. `https://<backend-domain>/health` returns 200.
2. Main frontend loads and login works.
3. Courier frontend loads at its domain and courier login works.
4. Door-to-door flow works end-to-end:
   - individual creates door-to-door shipment
   - courier sees task and confirms pickup
   - receiver confirms final weight
5. CORS errors are absent in browser console.
