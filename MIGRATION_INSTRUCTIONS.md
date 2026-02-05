# Database Migration Instructions

## Overview
This migration converts the database from separate user tables (admin, teacher, student, parent) to a unified users table with a many-to-many relationship for roles via the user_role_mappings table.

## Steps to Apply Migration

### 1. Stop the Running API
Before creating the migration, make sure the API is not running. If it is, stop it.

### 2. Create the Migration
Run the following command in the `SchoolManagementAPI` directory:

```powershell
dotnet ef migrations add AddUserRoleMappings --context ApplicationDbContext
```

### 3. Review the Migration
The migration will:
- Create the `user_role_mappings` table
- Remove the `role` column from the `users` table (if it exists)
- Drop old tables: `admin`, `teacher`, `student`, `parent` (if they exist)
- Set up foreign keys and indexes

### 4. Apply the Migration
The migration will be automatically applied when the API starts (as configured in Program.cs).

Alternatively, you can apply it manually:

```powershell
dotnet ef database update --context ApplicationDbContext
```

### 5. Verify the Migration
After the API starts, check:
- The `users` table exists with all user data
- The `user_role_mappings` table exists
- Seed data is created correctly
- You can log in with the test users

## Test Users Created by Seeder

1. **Admin User:**
   - Email: `admin@school.com`
   - Password: `admin123`
   - Roles: Admin

2. **Teacher Users:**
   - Email: `john.smith@school.com`, `jane.doe@school.com`, `robert.johnson@school.com`
   - Password: `teacher123`
   - Roles: Teacher

3. **Multi-Role User (Admin + Teacher):**
   - Email: `admin.teacher@school.com`
   - Password: `adminteacher123`
   - Roles: Admin, Teacher

4. **Student Users:**
   - Email: `alice.brown@school.com`, `bob.wilson@school.com`
   - Password: `student123`
   - Roles: Student

5. **Parent Users:**
   - Email: `michael.brown@email.com`, `sarah.wilson@email.com`
   - Password: `parent123`
   - Roles: Parent

## Important Notes

- **Data Migration**: If you have existing data in the old tables (admin, teacher, student, parent), you'll need to manually migrate that data to the new `users` table before dropping the old tables. The current migration assumes a fresh database or that you'll handle data migration separately.

- **Backup**: Always backup your database before running migrations in production.

- **Rollback**: If you need to rollback, you can use:
  ```powershell
  dotnet ef database update <PreviousMigrationName> --context ApplicationDbContext
  ```

