# How to Run Smart School Application

## ✅ Configuration Complete

Your welcome page is **already configured** and ready to display at `http://localhost:8080/`

The following files have been created:
- ✅ `HomeController.java` - Maps `/` to the welcome page
- ✅ `welcome.html` - Beautiful responsive welcome page template
- ✅ `welcome.css` - Modern styling with gradients and animations
- ✅ `SecurityConfig.java` - Allows public access to the welcome page

## 🚀 How to Run the Application

### Option 1: Using Your IDE (Recommended)

#### IntelliJ IDEA:
1. Open the project in IntelliJ IDEA
2. Navigate to `src/main/java/com/kantechsolution/smart_school/SmartSchoolApplication.java`
3. Right-click on the file
4. Select **"Run 'SmartSchoolApplication'"**
5. Wait for the application to start
6. Open your browser and go to: `http://localhost:8080/`

#### Eclipse:
1. Open the project in Eclipse
2. Navigate to `src/main/java/com/kantechsolution/smart_school/SmartSchoolApplication.java`
3. Right-click on the file
4. Select **"Run As" → "Java Application"**
5. Wait for the application to start
6. Open your browser and go to: `http://localhost:8080/`

#### VS Code:
1. Install the "Spring Boot Extension Pack" if not already installed
2. Open the project in VS Code
3. Open the Spring Boot Dashboard (click the Spring icon in the left sidebar)
4. Click the "Run" button next to "smart-school"
5. Wait for the application to start
6. Open your browser and go to: `http://localhost:8080/`

### Option 2: Using Maven Command Line

If you have Maven installed and added to your PATH:

```bash
mvn spring-boot:run
```

Then open: `http://localhost:8080/`

### Option 3: Build and Run JAR

```bash
# Build the JAR file
mvn clean package

# Run the JAR
java -jar target/smart-school-0.0.1-SNAPSHOT.jar
```

Then open: `http://localhost:8080/`

## 🎯 What You'll See

When you navigate to `http://localhost:8080/`, you'll see:

1. **Navigation Bar** - With "Smart School" branding and action buttons
2. **Hero Section** - Eye-catching welcome message with call-to-action buttons
3. **Features Section** - Six feature cards showcasing:
   - 👥 Student Management
   - 📅 Attendance Tracking
   - 📝 Grade Management
   - 💬 Communication Hub
   - 💰 Fee Management
   - 📊 Analytics & Reports
4. **Footer** - With quick links and legal information

## ⚙️ Configuration Details

### Routes Configured:
- `http://localhost:8080/` → Welcome Page ✅
- `http://localhost:8080/home` → Welcome Page ✅

### Public Access Enabled For:
- `/` - Home page
- `/home` - Alternative home route
- `/css/**` - All CSS files
- `/js/**` - All JavaScript files
- `/images/**` - All image files
- `/about`, `/features`, `/contact`, `/register` - Public pages

## 🔍 Troubleshooting

### Issue: Port 8080 is already in use
**Solution:** Either stop the other application using port 8080, or change the port in `application.properties`:
```properties
server.port=8081
```

### Issue: Database connection error
**Solution:** Make sure MySQL is running and the database credentials in `application.properties` are correct:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Issue: Maven not found
**Solution:** Use your IDE to run the application (Option 1 above) - this is the easiest method!

## 📱 Responsive Design

The welcome page is fully responsive and looks great on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📲 Tablets

## 🎨 Design Features

- Modern gradient color scheme (purple/blue)
- Smooth animations and transitions
- Card-based layout for features
- Hover effects on interactive elements
- Professional typography with Poppins font
- SVG icons for visual appeal

## ✨ Next Steps

Once the application is running and you can see the welcome page:
1. Create login and registration pages
2. Implement user authentication
3. Add role-based access control
4. Build out the feature modules (students, attendance, grades, etc.)

---

**Need Help?** Make sure MySQL is running and your IDE is properly configured for Spring Boot development.
