# Smart School Application

A comprehensive school management system built with Spring Boot, modeled after the Smart School admin demo. It covers administration, academics, finance, HR, communication, examinations, and a student/parent user panel.

## Technology Stack

- **Backend:** Spring Boot 4.0.2, Java 17
- **Templates:** Thymeleaf
- **Security:** Spring Security (role-based access)
- **Database:** MySQL + JPA/Hibernate (H2 supported for runtime)
- **Build:** Maven
- **Frontend:** HTML/CSS/JavaScript (static assets under `src/main/resources/static`)

## Application Scope

| Layer | Count (approx.) |
|-------|-----------------|
| Controllers | 199 |
| Domain models | 236 |
| HTML templates | 272 |
| Repositories | 212+ |

### Major modules

- **Admin panel:** Dashboard (role-based), sidebar navigation, staff/student management, fees, attendance, exams (CBSE + general), library, transport, hostel, inventory, HR/payroll, communications, front CMS, system settings
- **User panel:** Student/parent dashboard, profile, fees, homework, timetable, hostel, online courses
- **Auth:** Login, staff roles (Super Admin, Admin, Teacher, Accountant, Receptionist, Librarian), student/parent panel
- **Internationalization:** Header language picker (English, Hindi, Arabic, Swahili, French, Turkish, Russian, German, Dutch) with client-side UI translation via `language-i18n.js`

## Project Structure

```
src/main/
├── java/com/kantechsolution/smart_school/
│   ├── controller/          # REST + MVC controllers
│   ├── service/             # Business logic
│   ├── repository/          # JPA repositories
│   ├── model/               # Entities
│   └── config/              # Security, layout advice, etc.
└── resources/
    ├── templates/           # Thymeleaf HTML pages + fragments
    ├── static/              # CSS, JS, images
    └── i18n/                # Generated UI phrase JSON per language
scripts/
├── generate-i18n-phrases.js # Extract & translate UI strings
└── run-all-translations.ps1  # Start all 8 language jobs (Windows)
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8.0+ (or use embedded H2 if configured)

### Database

Create a MySQL database (e.g. `smart_schoolapp`) and set credentials in `src/main/resources/application.properties`.

### Run the application

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Open `http://localhost:8080` — login at `/login` or `/site/login`.

### Demo logins

Demo **usernames** are fixed (e.g. `admin@gmail.com`, `std1`). **Passwords** are configured via environment variables — see `.env.example` and `docs/RAILWAY-DEPLOY.md`. For local dev, copy `application-local.properties.example` to `application-local.properties`.

| Role | Username (staff panel) |
|------|------------------------|
| Super Admin | superadmin@gmail.com |
| Admin | admin@gmail.com |
| Teacher | teacher@gmail.com |
| Student panel | std1 |
| Parent panel | parent1 |

Do not commit real passwords to Git.

## Run with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

Build the image (first build may take several minutes while Maven downloads dependencies):

```bash
docker build -t springboot-app .
```

If the build fails with a Docker Hub error (`502 Bad Gateway` or timeout), wait a minute and retry — that is a temporary registry/network issue.

If Maven downloads fail inside Docker but work on your PC, build the JAR locally first, then use the runtime-only Dockerfile:

```bash
.\mvnw.cmd package -DskipTests
docker build -f Dockerfile.local -t springboot-app .
```

Start the app and MySQL together:

```bash
docker compose up --build
```

Open `http://localhost:8080`. The first boot may take several minutes while the database bootstrap runs.

| Service | URL / port |
|---------|------------|
| App | http://localhost:8080 |
| MySQL | localhost:3306 (user `root`, password `rootpassword`, database `smart_schoolapp`) |

Use the demo logins above (passwords match the defaults in `docker-compose.yml`).

```bash
# Run in background
docker compose up --build -d

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (fresh database)
docker compose down -v
```

Run the built image (requires MySQL reachable from Docker):

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/smart_schoolapp?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your-password \
  -e APP_DEMO_STUDENT_PASSWORD=110001 \
  -e APP_DEMO_PARENT_PASSWORD=110001 \
  -e APP_DEMO_STAFF_SUPERADMIN_PASSWORD=Superadmin1 \
  -e APP_DEMO_STAFF_ADMIN_PASSWORD=Admin123 \
  -e APP_DEMO_STAFF_TEACHER_PASSWORD=Teacher123 \
  -e APP_DEMO_STAFF_ACCOUNTANT_PASSWORD=Accountant123 \
  -e APP_DEMO_STAFF_RECEPTIONIST_PASSWORD=Receptionist123 \
  -e APP_DEMO_STAFF_LIBRARIAN_PASSWORD=Librarian123 \
  springboot-app
```

## Deploy to Railway (online demo)

See **[docs/RAILWAY-DEPLOY.md](docs/RAILWAY-DEPLOY.md)** for step-by-step hosting with MySQL and secrets in Railway environment variables.

## Language / i18n

1. Use the **flag icon** in the top navbar to switch language.
2. Phrases are loaded from `src/main/resources/i18n/messages-{lang}.json` at startup (`PhraseCatalogLoader`).
3. To generate or refresh translations:

```bash
# Extract UI strings only
node scripts/generate-i18n-phrases.js --extract-only

# Translate one language
node scripts/generate-i18n-phrases.js --lang=hi

# Translate all header languages (sequential)
node scripts/generate-i18n-phrases.js

# Windows: all 8 languages in parallel
powershell -File scripts/run-all-translations.ps1
```

Restart the Spring Boot app after phrase files change so the catalog reloads.

See `scripts/README-i18n.md` for details.

## Development Status

**Implemented:** Full admin module surface, user panel, security, dashboards, language picker, i18n pipeline.

**In progress:** Bulk UI phrase translation (3,000+ strings × 8 languages). Hindi and other language JSON files grow as `scripts/generate-i18n-phrases.js` runs.

**Not yet:** Automated test suite, full Smart School demo parity sign-off on every screen.

## License

Kantech Solutions.
