# PowerShell script to start collaborative app with port checking
Write-Host "🚀 Starting Collaborative App with ngrok tunnels..." -ForegroundColor Green
Write-Host ""

# Function to stop processes on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            $processId = $process.OwningProcess
            Write-Host "🔄 Stopping existing process on port $Port (PID: $processId)" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}

# Clear ports
Write-Host "🔍 Checking for existing processes on ports 3001 and 4200..."
Stop-ProcessOnPort -Port 3001
Stop-ProcessOnPort -Port 4200
Write-Host "✅ Ports cleared!" -ForegroundColor Green
Write-Host ""

# Start Socket.IO server
Write-Host "🔌 Starting Socket.IO server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "node server/server.js" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start Angular development server
Write-Host "🅰️ Starting Angular development server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "ng serve" -WindowStyle Normal
Start-Sleep -Seconds 10

# Start ngrok tunnels
Write-Host "🌐 Creating ngrok tunnel for Socket.IO server (port 3001)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "ngrok http 3001" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "🌐 Creating ngrok tunnel for Angular app (port 4200)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "ngrok http 4200" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Run this command to get your ngrok URLs:" -ForegroundColor White
Write-Host "   .\get-ngrok-urls.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Update src/environments/environment.ts with Socket.IO URL" -ForegroundColor White
Write-Host ""
Write-Host "3. Restart Angular server (Ctrl+C then ng serve)" -ForegroundColor White
Write-Host ""
Write-Host "4. Share Angular ngrok URL with your collaborator" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Green

Read-Host "Press Enter to continue"