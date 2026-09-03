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

### Default staff logins (seeded in SecurityConfig)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@gmail.com | Superadmin1 |
| Admin | admin@gmail.com | Admin123 |
| Teacher | teacher@gmail.com | Teacher123 |
| Accountant | accountant@gmail.com | Accountant123 |
| Receptionist | receptionist@gmail.com | Receptionist123 |
| Librarian | librarian@gmail.com | Librarian123 |

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
