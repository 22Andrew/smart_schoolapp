@echo off
title Smart School Application Launcher
color 0A

echo ========================================
echo   SMART SCHOOL APPLICATION
echo   Super Admin Login Demo
echo ========================================
echo.

REM Check if Java is installed
echo [1/3] Checking Java installation...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Java is not installed or not in PATH
    echo.
    echo Please install Java 17 or higher:
    echo - Download from: https://www.oracle.com/java/technologies/downloads/
    echo - Or use OpenJDK: https://adoptium.net/
    echo.
    echo After installation, restart this script.
    pause
    exit /b 1
)
echo [OK] Java found!
java -version
echo.

REM Check if Maven is installed
echo [2/3] Checking Maven installation...
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo [WARNING] Maven is not installed in PATH
    echo.
    echo RECOMMENDED SOLUTION: Use your IDE to run the application
    echo.
    echo === IntelliJ IDEA ===
    echo 1. Open the project in IntelliJ IDEA
    echo 2. Navigate to SmartSchoolApplication.java
    echo 3. Right-click and select "Run"
    echo.
    echo === VS Code ===
    echo 1. Install "Spring Boot Extension Pack"
    echo 2. Press F5 to run
    echo.
    echo === Eclipse ===
    echo 1. Import as Maven project
    echo 2. Right-click SmartSchoolApplication.java
    echo 3. Select "Run As" ^> "Java Application"
    echo.
    echo Or install Maven from: https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)
echo [OK] Maven found!
echo.

REM Run the application
echo [3/3] Starting Smart School Application...
echo.
echo ========================================
echo   APPLICATION STARTING...
echo ========================================
echo.
echo ^> Using H2 in-memory database (no MySQL needed)
echo ^> Application will run on: http://localhost:8080
echo ^> Login page: http://localhost:8080/login
echo.
echo ========================================
echo   SUPER ADMIN CREDENTIALS
echo ========================================
echo   Email: superadmin@gmail.com
echo   Password: Superadmin1
echo ========================================
echo.
echo ^> Click the "Super Admin" button (blue button)
echo ^> Credentials will auto-fill
echo ^> Click "Sign In" to access dashboard
echo.
echo Press Ctrl+C to stop the application
echo.
echo ----------------------------------------
echo.

REM Run with H2 database profile (no MySQL required)
call mvn clean spring-boot:run -Dspring-boot.run.profiles=test

pause
