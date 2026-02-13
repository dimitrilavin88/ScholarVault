# ScholarVault

Educational record-keeping MVP: teacher dashboard, student profiles, work sample uploads, and historical records. Built for **local testing first** (Phase 1), with clear placeholders for **AWS integration** (Phase 2).

## Stack

- **Frontend:** Angular (latest) + TypeScript
- **Backend:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL (local for Phase 1; Aurora Serverless in Phase 2)
- **Auth:** JWT placeholders (Phase 1); AWS Cognito (Phase 2)
- **Files:** Local storage (Phase 1); S3 (Phase 2)

## Phase 1 — Local MVP

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker)
- npm or yarn

### Setting up Docker (Windows)

To use the Docker option for the database:

1. **Download Docker Desktop for Windows**
   - [Direct download (64-bit)](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
   - Or install from [Microsoft Store](https://apps.microsoft.com/detail/xp8cbj40xlbwkx)

2. **Install**
   - Run the installer.
   - If prompted, enable **WSL 2** (recommended) or **Hyper-V**.
   - Restart Windows if asked.

3. **Start Docker**
   - Open **Docker Desktop** from the Start menu.
   - Wait until it says “Docker Desktop is running” (whale icon in the system tray).

4. **Verify**
   - Open PowerShell and run:
   ```powershell
   docker --version
   docker compose version
   ```
   - You should see version numbers for both.

5. **Start the database**
   - In your project folder:
   ```powershell
   cd c:\Users\Dimitri\ScholarVault
   docker compose up -d
   ```
   - The first run may take a minute while the Postgres image downloads. When it’s ready, the `scholarvault-db` container will be running and the schema + seed will have been applied.

To stop the database later: `docker compose down`. To start it again: `docker compose up -d`.

**If the backend fails with "column contains null values" or schema errors**, the DB may have been created by TypeORM earlier. Reset it so Docker re-runs the schema and seed:

```powershell
docker compose down -v
docker compose up -d
```

Then start the backend again. (The `-v` removes the data volume so Postgres starts fresh.)

**If you see "relation student_transfers does not exist"** (e.g. when using Request transfer), add the table. From the project root, with the Postgres container running:

```powershell
Get-Content database\add-student-transfers.sql | docker exec -i scholarvault-db psql -U postgres -d scholarvault
```

**If you see "relation classrooms does not exist"** (e.g. when using Create class), the DB was created before the classrooms feature. Add the missing tables without resetting the DB. From the project root, with the Postgres container running:

```powershell
Get-Content database\add-classrooms-enrollments.sql | docker exec -i scholarvault-db psql -U postgres -d scholarvault
```

Then (optional) add seed classrooms/enrollments:  
`Get-Content database\seed.sql | docker exec -i scholarvault-db psql -U postgres -d scholarvault`  
(Seed uses `ON CONFLICT DO NOTHING`, so it’s safe to run again.)

### 1. Database

**Option A — With Docker**

If Docker Desktop is installed and running, from the project root run:

```powershell
docker compose up -d
```

On older setups you may have the standalone tool: `docker-compose up -d`.

**Option B — Without Docker**

If Docker is not installed, use a local PostgreSQL 16 (or 15+) installation:

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/) and ensure `psql` is on your PATH (or use pgAdmin / another client).
2. Create a database named `scholarvault` (e.g. in pgAdmin: right‑click Databases → Create → Database → name: `scholarvault`).
3. Run the schema and seed (replace with your postgres user if different):

```powershell
cd ScholarVault
psql -U postgres -d scholarvault -f database/schema.sql
psql -U postgres -d scholarvault -f database/seed.sql
```

If `psql` is not in PATH, use the full path to it (e.g. `"C:\Program Files\PostgreSQL\16\bin\psql.exe"`) or run the contents of `database/schema.sql` and `database/seed.sql` in pgAdmin’s Query Tool.

The seed adds a demo district, school, two students, and three teachers:

- **teacher@demo.edu** (role: teacher) — password: `password123`
- **admin@demo.edu** (role: admin) — password: `password123`
- **district@demo.edu** (role: district_admin) — password: `password123`

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (DB_*, JWT_SECRET, PLACEHOLDER_PASSWORD)
npm install
npm run start:dev
```

API runs at **http://localhost:3000**.

- `POST /login` — body: `{ "email", "password" }` → `{ "access_token", "user" }`
- `GET /students` — list students (JWT required)
- `GET /students/:id` — student profile (JWT required)
- `POST /students/:id/work` — upload work sample (form: gradeLevel, subject, notes, file)
- `GET /students/:id/work` — list work samples
- `GET /students/:studentId/records/:recordId/file` — download file (JWT required)

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at **http://localhost:4200**.

- **Login:** use `teacher@demo.edu` / `password123`
- **Dashboard:** list of students (role-based)
- **Student profile:** view details, go to upload or historical records
- **Upload work sample:** grade, subject, notes, optional file
- **Historical records:** list and download work samples

### Role-based UI

- **teacher / admin:** see only students in their school’s district
- **district_admin:** see all students in the system (for Phase 1 demo, same district)

## Phase 2 — AWS (after local testing)

Planned replacements (with placeholders in code and env):

| Component      | Phase 1           | Phase 2                    |
|----------------|-------------------|----------------------------|
| Database       | Local PostgreSQL  | Aurora Serverless         |
| Auth           | JWT placeholder   | Cognito + roles            |
| File storage   | Local `uploads/`  | S3 + pre-signed URLs       |
| Logging        | Local files       | CloudWatch                 |
| Backend deploy | —                 | Lambda + API Gateway or ECS |
| Frontend deploy| —                 | Amplify or S3 + CloudFront |

See `backend/.env.example` and code comments for where to plug in AWS (Cognito, S3, CloudWatch, Aurora).

## Security (Phase 1)

- Input validation on frontend and backend (Angular + class-validator)
- Angular’s default XSS protection (no unsafe `innerHTML` with user data)
- Role-based access on API (teacher, admin, district_admin)
- HTTPS and encryption at rest/transit: placeholders for Phase 2 production

## Project layout

```
ScholarVault/
├── backend/          # NestJS API
├── frontend/         # Angular app
├── database/         # schema.sql, seed.sql
├── docker-compose.yml
└── README.md
```

## License

Proprietary / internal use as needed.
