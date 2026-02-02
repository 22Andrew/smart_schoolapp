@echo off
echo ========================================
echo Cleaning and Rebuilding Application
echo ========================================
echo.

echo Step 1: Cleaning old builds...
call mvn clean
echo.

echo Step 2: Compiling and packaging...
call mvn install -DskipTests
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo You can now run: mvn spring-boot:run
pause
