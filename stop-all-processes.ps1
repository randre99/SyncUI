# PowerShell script to stop all collaborative app processes
Write-Host "🛑 Stopping all collaborative app processes..." -ForegroundColor Red
Write-Host ""

# Function to stop processes on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            $processId = $process.OwningProcess
            Write-Host "🔄 Stopping process on port $Port (PID: $processId)" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✅ Port $Port cleared" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No processes found on port $Port" -ForegroundColor Gray
    }
}

# Stop processes on ports 3001 and 4200
Stop-ProcessOnPort -Port 3001
Stop-ProcessOnPort -Port 4200

# Kill any remaining node or ng processes
Write-Host ""
Write-Host "🔍 Stopping any remaining Node.js and Angular CLI processes..." -ForegroundColor Cyan

Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "ng" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop ngrok processes
Write-Host "🌐 Stopping ngrok processes..." -ForegroundColor Cyan
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ All processes stopped!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to continue"