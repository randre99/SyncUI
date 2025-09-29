@echo off
echo Starting Collaborative App with ngrok tunnels...
echo.

echo Starting Socket.IO server...
start "Socket.IO Server" cmd /k "node server/server.js"

timeout /t 3 /nobreak > nul

echo Starting Angular development server...
start "Angular Dev Server" cmd /k "ng serve"

timeout /t 5 /nobreak > nul

echo Creating ngrok tunnel for Socket.IO server (port 3001)...
start "ngrok Socket.IO" cmd /k "ngrok http 3001"

timeout /t 2 /nobreak > nul

echo Creating ngrok tunnel for Angular app (port 4200)...
start "ngrok Angular" cmd /k "ngrok http 4200"

echo.
echo ============================================
echo All services started!
echo.
echo NEXT STEPS:
echo.
echo 1. Look at the ngrok terminal windows that just opened
echo    - Find lines like: "Forwarding    https://abc123.ngrok.io -> http://localhost:3001"
echo    - Copy the https://abc123.ngrok.io part (this is your URL)
echo.
echo 2. For Socket.IO server (port 3001):
echo    - Copy the ngrok URL from the "3001" terminal
echo    - Update src/environments/environment.ts:
echo      websocketUrl: 'https://your-ngrok-url.ngrok.io'
echo.
echo 3. Restart Angular server:
echo    - Stop ng serve (Ctrl+C in Angular terminal)
echo    - Run: ng serve
echo.
echo 4. For Angular app (port 4200):
echo    - Copy the ngrok URL from the "4200" terminal  
echo    - Share this URL with your remote collaborator
echo.
echo TIP: You can also visit http://127.0.0.1:4040 to see all ngrok URLs
echo ============================================
pause