@echo off
echo Starting Smart School Application...
echo.

REM Check if Maven is installed
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Maven found, using mvn spring-boot:run
    mvn spring-boot:run
) else (
    echo Maven not found in PATH
    echo.
    echo Please install Maven or use your IDE to run the application:
    echo   - In IntelliJ IDEA: Right-click SmartSchoolApplication.java and select "Run"
    echo   - In Eclipse: Right-click SmartSchoolApplication.java and select "Run As" ^> "Java Application"
    echo   - In VS Code: Use Spring Boot Dashboard extension
    echo.
    echo Or install Maven and add it to your PATH
    pause
)
