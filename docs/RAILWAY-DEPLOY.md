# Deploy Smart School to Railway

This guide deploys the app with **database credentials and demo login passwords stored only in Railway environment variables** — not in Git.

## 1. Push code to GitHub

1. Create a GitHub repository.
2. Push this project (ensure `.gitignore` excludes `application-local.properties` and `.env`).
3. **Do not commit** real passwords in `application.properties` (defaults are for local dev only).

## 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** → select your repo.
3. Railway detects Maven/Java via Nixpacks (`railway.toml` is included).

## 3. Add MySQL

1. In the project, click **+ New** → **Database** → **MySQL**.
2. Open your **web service** → **Variables** → **Add variable reference** (or **Connect** the MySQL service).
3. Railway injects `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.

Add these variables on the **web service** (map Railway MySQL to Spring Boot):

| Variable | Value |
|----------|--------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?useSSL=true&requireSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | `${{MYSQLUSER}}` |
| `SPRING_DATASOURCE_PASSWORD` | `${{MYSQLPASSWORD}}` |
| `SPRING_PROFILES_ACTIVE` | `prod` |

> Use Railway’s **Variable Reference** UI so `${{MYSQLHOST}}` etc. resolve from the linked MySQL service.

## 4. Set demo login passwords (secrets)

In the web service **Variables** tab, add strong passwords for your public demo:

| Variable | Purpose |
|----------|---------|
| `APP_DEMO_STUDENT_PASSWORD` | Student panel user `std1` |
| `APP_DEMO_PARENT_PASSWORD` | Parent panel user `parent1` |
| `APP_DEMO_STAFF_SUPERADMIN_PASSWORD` | Staff login `superadmin@gmail.com` |
| `APP_DEMO_STAFF_ADMIN_PASSWORD` | Staff login `admin@gmail.com` |
| `APP_DEMO_STAFF_TEACHER_PASSWORD` | Staff login `teacher@gmail.com` |
| `APP_DEMO_STAFF_ACCOUNTANT_PASSWORD` | Staff login `accountant@gmail.com` |
| `APP_DEMO_STAFF_RECEPTIONIST_PASSWORD` | Staff login `receptionist@gmail.com` |
| `APP_DEMO_STAFF_LIBRARIAN_PASSWORD` | Staff login `librarian@gmail.com` |

**Usernames stay the same** (e.g. `admin@gmail.com`); only passwords are secret.

Share demo access with testers privately — do not put passwords in README or Git.

## 5. Optional: persistent file uploads

Student/staff photos are stored on disk. Without a volume, uploads may be lost on redeploy.

1. **Web service** → **Settings** → **Volumes** → Add volume mount path: `/data/uploads`
2. Set variable: `APP_UPLOAD_DIR=/data/uploads`

## 6. Deploy and open the app

1. Railway builds with `./mvnw -DskipTests package` and starts the JAR.
2. **Settings** → **Networking** → **Generate Domain** for a public URL.
3. First boot may take several minutes while the database bootstrap runs.

## 7. Test logins

| Panel | URL | Username |
|-------|-----|----------|
| Admin / staff | `https://your-app.up.railway.app/login` | `admin@gmail.com` (or other staff emails) |
| Student / parent | `https://your-app.up.railway.app/site/login` | `std1` or `parent1` |

Use the passwords you set in Railway variables.

## Local development

1. Copy `application-local.properties.example` → `application-local.properties`
2. Set your local MySQL password there (file is gitignored).
3. Run: `.\mvnw.cmd spring-boot:run`

See `.env.example` for a full list of supported environment variables.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check Railway build logs; ensure Java 17 is used (Nixpacks default). |
| DB connection error | Verify `SPRING_DATASOURCE_*` references the MySQL service. |
| Login fails after deploy | Restart the app after changing `APP_DEMO_*` passwords (accounts are re-seeded on startup). |
| Slow first start | Normal — SQL bootstrap on empty DB can take time. |
