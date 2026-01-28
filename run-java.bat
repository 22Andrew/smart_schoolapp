@echo off
echo Starting Smart School Application...
echo.

REM Check if Java is installed
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Java not found in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Run the Spring Boot application
echo Starting application on http://localhost:8080
echo.
echo Login credentials:
echo - Super Admin: superadmin@gmail.com / Superadmin1
echo - Admin: admin@gmail.com / Admin123
echo - Teacher: teacher@gmail.com / Teacher123
echo.

java -cp "target/classes;%USERPROFILE%\.m2\repository\*" com.kantechsolution.smart_school.SmartSchoolApplication

pause
