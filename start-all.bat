@echo off
echo Starting School Management System...
echo.
echo Starting API Server...
start "School Management API" cmd /k "cd SchoolManagementAPI && dotnet run"
timeout /t 5 /nobreak >nul
echo.
echo Starting Angular UI...
start "School Management UI" cmd /k "cd school-management-ui && ng serve"
echo.
echo Both servers are starting...
echo API will be available at: https://localhost:7000
echo UI will be available at: http://localhost:4200
echo.
pause





