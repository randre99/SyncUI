# PowerShell script to automate GitHub deployment setup
Write-Host "🚀 Setting up GitHub deployment for Collaborative Angular App..." -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check for GitHub remote
$remotes = git remote -v 2>$null
if ($remotes -notmatch "github.com") {
    Write-Host ""
    Write-Host "⚠️  GitHub remote not found!" -ForegroundColor Yellow
    Write-Host "Please run this command with your GitHub repository URL:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/SyncUI.git" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ GitHub remote configured" -ForegroundColor Green
}

# Build the project to check for errors
Write-Host ""
Write-Host "🔨 Building Angular project..." -ForegroundColor Cyan
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Please fix build errors before deploying:" -ForegroundColor Yellow
    Write-Host $buildResult -ForegroundColor Red
    Read-Host "Press Enter to continue anyway"
}

# Check if all deployment files exist
Write-Host ""
Write-Host "📋 Checking deployment configuration..." -ForegroundColor Cyan

$deploymentFiles = @(
    ".github\workflows\deploy.yml",
    "server\package.json", 
    "server\railway.toml",
    "server\render.yaml",
    "src\environments\environment.prod.ts"
)

$allFilesExist = $true
foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some deployment files are missing!" -ForegroundColor Yellow
    Write-Host "Please ensure all configuration files are created." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
}

# Show next steps
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ Deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🌐 Deploy Backend (Socket.IO Server):" -ForegroundColor White
Write-Host "   • Go to Railway.app or Render.com" -ForegroundColor Gray
Write-Host "   • Connect your GitHub repository" -ForegroundColor Gray
Write-Host "   • Deploy from /server folder" -ForegroundColor Gray
Write-Host "   • Copy your deployment URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ⚙️  Update Frontend Configuration:" -ForegroundColor White
Write-Host "   • Edit src/environments/environment.prod.ts" -ForegroundColor Gray
Write-Host "   • Replace websocketUrl with your backend URL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📱 Enable GitHub Pages:" -ForegroundColor White
Write-Host "   • Go to GitHub repository Settings → Pages" -ForegroundColor Gray
Write-Host "   • Source: GitHub Actions" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🚀 Deploy:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m ""Deploy to production""" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌍 Your app will be live at:" -ForegroundColor Green
Write-Host "https://YOUR_USERNAME.github.io/SyncUI/" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Green

Read-Host "Press Enter to continue"