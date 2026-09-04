# Deploy Smart School to Railway

This deploys the GitHub source with Dockerfile.railway and a new Railway MySQL service. The local Docker container continues to run independently. Local database records and uploaded files are not copied automatically.

## 1. Push the deployment files

Run in the project directory. The current branch is development.

```powershell
git add Dockerfile Dockerfile.railway railway.toml .dockerignore docker/certs/README.md docker/certs/.gitignore docs/RAILWAY-DEPLOY.md
git diff --cached --stat
git commit -m "Configure Docker deployment for Railway"
git push -u origin development
```

Review the staged files before committing. Local application-local.properties, uploads, and docker/certs/*.crt must stay out of Git. Dockerfile.railway does not import local corporate certificates or use a service-specific cache mount.

## 2. Create a project and MySQL

1. Sign in to https://railway.com.
2. Create a new empty project named Smart School.
3. Select + New (or Create), then Database, then MySQL.
4. Keep the service name MySQL so the variable references below match.
5. Wait until MySQL is running. Keep its database volume attached.

Railway creates its own database name and credentials. Use its MYSQLDATABASE value; the database does not need to be named smart_schoolapp.

## 3. Add the application

1. In the same project/environment, add a GitHub Repository service.
2. Select 22Andrew/smart_schoolapp. Grant Railway access to that repository if prompted.
3. In the app service's source settings, select branch development and the repository root directory.
4. Select Dockerfile.railway as the Dockerfile path. The included railway.toml specifies this for services that read config-as-code.
5. Leave custom Build Command and Start Command empty. The Dockerfile builds and starts /app/app.jar.
6. Set healthcheck path /login and timeout 600 seconds if these are not populated from railway.toml.

An automatic initial deployment may fail until the variables and volume are configured. Finish the following steps and redeploy.

## 4. Set application variables

Open the APP service's Variables tab and Raw Editor. Add:

```dotenv
SPRING_PROFILES_ACTIVE=prod
PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_DATABASE_BOOTSTRAP=off
APP_UPLOAD_DIR=/data/uploads
RAILWAY_RUN_UID=0
```

These database references use Railway's private network. If the database service has a different name, replace MySQL in every reference. Do not use localhost, host.docker.internal, your local MySQL password, or an empty password.

The production profile also requires all eight login password variables. Add each through Railway's Variables UI with a strong password you choose:

| Variable | Login username |
| --- | --- |
| APP_DEMO_STAFF_SUPERADMIN_PASSWORD | superadmin@gmail.com |
| APP_DEMO_STAFF_ADMIN_PASSWORD | admin@gmail.com |
| APP_DEMO_STAFF_TEACHER_PASSWORD | teacher@gmail.com |
| APP_DEMO_STAFF_ACCOUNTANT_PASSWORD | accountant@gmail.com |
| APP_DEMO_STAFF_RECEPTIONIST_PASSWORD | receptionist@gmail.com |
| APP_DEMO_STAFF_LIBRARIAN_PASSWORD | librarian@gmail.com |
| APP_DEMO_STUDENT_PASSWORD | std1 |
| APP_DEMO_PARENT_PASSWORD | parent1 |

Do not commit these passwords. APP_DATABASE_BOOTSTRAP=off disables SQL-backup restoration; Hibernate schema creation/update and application seeders still run.

## 5. Add persistent uploads

Create a volume, attach it to the APP service, and set mount path /data/uploads. This is separate from MySQL's database volume.

Railway mounts volumes as root. RAILWAY_RUN_UID=0 runs this deployment as root so the current image can write to that volume; local Docker still uses the spring user. A later hardening change can initialize volume ownership and drop privileges.

## 6. Deploy and verify

Apply the staged changes and deploy the app. Build logs should identify Dockerfile.railway and finish with BUILD SUCCESS. Runtime logs should show a successful Hikari database connection and Started SmartSchoolApplication. Check for subsequent startup-runner failures as well.

The first build/start can take several minutes. If the process exits with code 137 or an out-of-memory message, increase the service memory allocation and redeploy.

## 7. Generate the public URL

On the APP service, open Settings > Networking > Public Networking > Generate Domain. Choose target port 8080 if prompted.

Open /login for staff and /site/login for students/parents. Sign in with a username from the table and the password configured on Railway. Verify a page loads after login, and test that a newly uploaded photo remains after a redeploy.

Future pushes to the configured development branch can trigger automatic redeployment.

## Troubleshooting

| Error | Check |
| --- | --- |
| Unable to access jarfile target/... | Remove the old custom Start Command; use Dockerfile.railway's entrypoint. |
| Cache mounts MUST use a service ID | Confirm the Dockerfile path is Dockerfile.railway. |
| Could not resolve placeholder APP_DEMO_... | Add every required login password on the app service. |
| Access denied / using password: NO | Check the MySQL service variable references on the app service. |
| AccessDeniedException: /data/uploads | Verify the app volume mount and RAILWAY_RUN_UID=0. |
| Application failed to respond | Check runtime logs, PORT=8080, and domain target port 8080. |
| Missing local records/photos | This is a new cloud database and volume; migration is a separate step. |

## Official references

- Dockerfiles and cache mounts: https://docs.railway.com/builds/dockerfiles
- MySQL setup: https://docs.railway.com/databases/mysql
- Variable references: https://docs.railway.com/variables
- Volumes and permissions: https://docs.railway.com/volumes
- Public networking: https://docs.railway.com/networking/public-networking
