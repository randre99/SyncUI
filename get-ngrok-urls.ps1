# PowerShell script to get ngrok URLs from the web interface
Write-Host "🔍 Checking for active ngrok tunnels..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
    
    if ($response.tunnels.Count -eq 0) {
        Write-Host "❌ No active ngrok tunnels found!" -ForegroundColor Red
        Write-Host "Make sure ngrok is running first:" -ForegroundColor Yellow
        Write-Host "  ngrok http 3001" -ForegroundColor White
        Write-Host "  ngrok http 4200" -ForegroundColor White
    } else {
        Write-Host "✅ Found $($response.tunnels.Count) active tunnel(s):" -ForegroundColor Green
        Write-Host ""
        
        foreach ($tunnel in $response.tunnels) {
            $port = $tunnel.config.addr.Split(':')[-1]
            $publicUrl = $tunnel.public_url
            
            if ($port -eq "3001") {
                Write-Host "🔌 Socket.IO Server:" -ForegroundColor Cyan
                Write-Host "   Local:  http://localhost:3001" -ForegroundColor White
                Write-Host "   Public: $publicUrl" -ForegroundColor Yellow
                Write-Host "   👉 Use this in src/environments/environment.ts" -ForegroundColor Green
                Write-Host ""
            } elseif ($port -eq "4200") {
                Write-Host "🌐 Angular App:" -ForegroundColor Cyan
                Write-Host "   Local:  http://localhost:4200" -ForegroundColor White
                Write-Host "   Public: $publicUrl" -ForegroundColor Yellow
                Write-Host "   👉 Share this URL with remote users" -ForegroundColor Green
                Write-Host ""
            } else {
                Write-Host "🔗 Other tunnel (port $port):" -ForegroundColor Cyan
                Write-Host "   Public: $publicUrl" -ForegroundColor Yellow
                Write-Host ""
            }
        }
        
        Write-Host "💡 You can also view all tunnels at: http://127.0.0.1:4040" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ Could not connect to ngrok web interface" -ForegroundColor Red
    Write-Host "Make sure ngrok is running and try again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor White
    Write-Host "1. Look at the ngrok terminal windows" -ForegroundColor White
    Write-Host "2. Find lines like: 'Forwarding https://abc123.ngrok.io -> http://localhost:3001'" -ForegroundColor White
    Write-Host "3. Copy the https://abc123.ngrok.io part" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to continue"