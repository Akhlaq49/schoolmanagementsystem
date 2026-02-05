# School Management System - .NET & Angular

This is a complete conversion of the PHP/CodeIgniter School Management System to .NET 8 Web API and Angular 17.

## Project Structure

```
├── SchoolManagementAPI/          # .NET 8 Web API Backend
│   ├── Controllers/              # API Controllers
│   ├── Models/                   # Entity Models
│   ├── Services/                 # Business Logic Services
│   ├── Data/                     # DbContext and Database
│   ├── DTOs/                     # Data Transfer Objects
│   └── Program.cs                # Application Entry Point
│
└── school-management-ui/         # Angular 17 Frontend
    └── src/
        ├── app/
        │   ├── core/              # Core services, guards, interceptors
        │   └── features/          # Feature modules
        └── environments/         # Environment configuration
```

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin, Teacher, Student, Parent roles
- **Student Management**: CRUD operations for students
- **Teacher Management**: CRUD operations for teachers
- **Class & Subject Management**: Academic structure management
- **Attendance Tracking**: Student attendance management
- **Exam Management**: Exam creation and management
- **Payment System**: Invoice and payment tracking

## Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- MySQL Server
- Angular CLI 17+

## Quick Start - Run Both Applications

### Option 1: Run Both at Once (Windows)
```bash
start-all.bat
```

### Option 2: Run Both at Once (Linux/Mac)
```bash
chmod +x start-all.sh
./start-all.sh
```

### Option 3: Run Separately

#### Backend (.NET API)

**Windows:**
```bash
cd SchoolManagementAPI
run-api.bat
```

**Linux/Mac:**
```bash
cd SchoolManagementAPI
chmod +x run-api.sh
./run-api.sh
```

**Or manually:**
```bash
cd SchoolManagementAPI
dotnet run
```

The API will be available at `https://localhost:7000` (or `http://localhost:5000`)

#### Frontend (Angular)

**Windows:**
```bash
cd school-management-ui
run-ui.bat
```

**Linux/Mac:**
```bash
cd school-management-ui
chmod +x run-ui.sh
./run-ui.sh
```

**Or manually:**
```bash
cd school-management-ui
ng serve
```

The UI will be available at `http://localhost:4200`

## Setup Instructions

### Prerequisites Check

1. **Check .NET SDK:**
```bash
dotnet --version
```
Should be 8.0 or higher

2. **Check Node.js:**
```bash
node --version
```
Should be 18.0 or higher

3. **Check Angular CLI:**
```bash
ng version
```
If not installed:
```bash
npm install -g @angular/cli
```

### Backend Setup

1. Navigate to the API directory:
```bash
cd SchoolManagementAPI
```

2. Update `appsettings.json` with your database connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=school_management;User=root;Password=yourpassword;Port=3306;"
  }
}
```

3. Restore packages:
```bash
dotnet restore
```

4. (Optional) Install Entity Framework tools (if not already installed):
```bash
dotnet tool install --global dotnet-ef
```

5. (Optional) Create and apply migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**Note:** You can also import the original database from `installation/sql/database.sql`

6. Run the API:
```bash
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`
- Swagger UI: `https://localhost:7000/swagger`

### Frontend Setup

1. Navigate to the Angular directory:
```bash
cd school-management-ui
```

2. Install dependencies:
```bash
npm install
```

3. Update `src/environments/environment.ts` with your API URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'  // Use HTTP for development, or https://localhost:7000 for HTTPS
};
```

4. Run the development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

### Troubleshooting

**API won't start:**
- Check if port 5000/7000 is already in use
- Verify database connection string
- Ensure MySQL server is running

**Angular won't start:**
- Delete `node_modules` and run `npm install` again
- Check if port 4200 is already in use
- Verify Node.js version (18+)

**CORS errors:**
- Ensure API is running before starting Angular
- Check `Program.cs` CORS configuration
- Verify API URL in `environment.ts`

## Default Login Credentials

Based on the original database:
- **Admin**: admin@admin.com / password: 1234 (SHA1 hashed in original DB)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `GET /api/students/class/{classId}` - Get students by class
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/{id}` - Update student (Admin only)
- `DELETE /api/students/{id}` - Delete student (Admin only)

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/{id}` - Get teacher by ID
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/{id}` - Update teacher (Admin only)
- `DELETE /api/teachers/{id}` - Delete teacher (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/{id}` - Get class by ID
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/{id}` - Update class (Admin only)
- `DELETE /api/classes/{id}` - Delete class (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/{id}` - Get subject by ID
- `GET /api/subjects/class/{classId}` - Get subjects by class
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/{id}` - Update subject (Admin only)
- `DELETE /api/subjects/{id}` - Delete subject (Admin only)

### Attendance
- `GET /api/attendance?date={date}&classId={id}&sectionId={id}` - Get attendance
- `GET /api/attendance/{id}` - Get attendance by ID
- `GET /api/attendance/report/{studentId}?month={m}&year={y}` - Get attendance report
- `POST /api/attendance` - Create attendance (Admin/Teacher)
- `PUT /api/attendance/{id}` - Update attendance (Admin/Teacher)
- `DELETE /api/attendance/{id}` - Delete attendance (Admin only)

## Database Migration

The original MySQL database schema is preserved. You can:

1. Import the original SQL file from `installation/sql/database.sql`
2. Or use Entity Framework migrations to create the schema

## Security Notes

- Passwords in the original system use SHA1. The AuthService supports both SHA1 (for existing passwords) and BCrypt (for new passwords).
- JWT tokens are used for authentication
- Role-based authorization is implemented using `[Authorize(Roles = "...")]` attributes
- CORS is configured to allow requests from the Angular app

## Next Steps

1. Complete remaining controllers (Exams, Payments, Assignments, etc.)
2. Add file upload functionality for student images, assignments, etc.
3. Implement SMS/Email notifications
4. Add payment gateway integrations
5. Create additional Angular components for all features
6. Add unit tests
7. Implement proper error handling and logging

## License

This project is open source and available for educational purposes.

