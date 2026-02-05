#!/bin/bash
echo "Starting School Management System..."
echo ""
echo "Starting API Server..."
cd SchoolManagementAPI
dotnet run &
API_PID=$!
cd ..
echo ""
echo "Starting Angular UI..."
cd school-management-ui
ng serve &
UI_PID=$!
cd ..
echo ""
echo "Both servers are starting..."
echo "API will be available at: https://localhost:7000"
echo "UI will be available at: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop both servers"
wait $API_PID $UI_PID





