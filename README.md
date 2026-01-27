# Smart School Application

A comprehensive school management system built with Spring Boot, designed to streamline administration, enhance communication, and improve educational outcomes.

## Features

### Welcome Page
The application includes a modern, responsive welcome page with:
- **Hero Section**: Eye-catching introduction with call-to-action buttons
- **Key Features Showcase**: Six main feature cards highlighting:
  - Student Management
  - Attendance Tracking
  - Grade Management
  - Communication Hub
  - Fee Management
  - Analytics & Reports
- **Responsive Design**: Mobile-friendly layout that adapts to all screen sizes
- **Modern UI**: Beautiful gradient design with smooth animations

## Technology Stack

- **Backend**: Spring Boot 4.0.2
- **Template Engine**: Thymeleaf
- **Security**: Spring Security
- **Database**: MySQL with Spring Data JPA
- **Build Tool**: Maven
- **Java Version**: 17

## Project Structure

```
src/
├── main/
│   ├── java/com/kantechsolution/smart_school/
│   │   ├── SmartSchoolApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   └── controller/
│   │       └── HomeController.java
│   └── resources/
│       ├── application.properties
│       ├── static/
│       │   └── css/
│       │       └── welcome.css
│       └── templates/
│           └── welcome.html
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Database Setup
1. Create a MySQL database named `smart_schoolapp`
2. Update the database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### Running the Application

#### Option 1: Using Your IDE (Easiest Method)

**IntelliJ IDEA / Eclipse / VS Code:**
1. Open the project in your IDE
2. Navigate to `src/main/java/com/kantechsolution/smart_school/SmartSchoolApplication.java`
3. Right-click and select "Run"
4. The application will start on `http://localhost:8080`

#### Option 2: Using Maven Command Line
```bash
mvn spring-boot:run
```

#### Option 3: Using Maven Wrapper
```bash
# On Windows
.\mvnw.cmd spring-boot:run

# On Linux/Mac
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`

> 💡 **See [RUNNING_INSTRUCTIONS.md](RUNNING_INSTRUCTIONS.md) for detailed step-by-step instructions**

## Accessing the Welcome Page

Once the application is running, navigate to:
- `http://localhost:8080/` - Main welcome page
- `http://localhost:8080/home` - Alternative route to welcome page

## Security Configuration

The welcome page and static resources are publicly accessible. The following routes are configured to allow public access:
- `/` - Home/Welcome page
- `/home` - Alternative home route
- `/css/**` - CSS files
- `/js/**` - JavaScript files
- `/images/**` - Image files
- `/about`, `/features`, `/contact`, `/register` - Public pages

All other routes require authentication.

## Next Steps

To extend the application:
1. Create login and registration pages
2. Implement user roles (Admin, Teacher, Student, Parent)
3. Add student management features
4. Implement attendance tracking system
5. Create grade management module
6. Add fee management functionality

## License

This project is part of Kantech Solutions.

## Support

For support and questions, please contact the development team.
