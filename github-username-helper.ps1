# GitHub Username Helper Script
Write-Host "🔍 GitHub Username Helper" -ForegroundColor Green
Write-Host "This will help you find and set the correct GitHub remote URL" -ForegroundColor Gray
Write-Host ""

# Check current remote
Write-Host "Current remote configuration:" -ForegroundColor Yellow
$currentRemote = git remote -v 2>$null
if ($currentRemote) {
    Write-Host $currentRemote -ForegroundColor White
    if ($currentRemote -match "YOURUSERNAME") {
        Write-Host ""
        Write-Host "❌ PROBLEM FOUND: You're using 'YOURUSERNAME' literally!" -ForegroundColor Red
        Write-Host "You need to replace it with your actual GitHub username." -ForegroundColor Yellow
    }
} else {
    Write-Host "No remote configured yet." -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔍 To find your GitHub username:" -ForegroundColor Cyan
Write-Host "1. Go to github.com and sign in" -ForegroundColor White
Write-Host "2. Look at the top-right corner" -ForegroundColor White
Write-Host "3. Your username is displayed there" -ForegroundColor White
Write-Host "4. It might look like: johnsmith2024, mary-developer, regis-coding, etc." -ForegroundColor White
Write-Host ""

$username = Read-Host "Enter your ACTUAL GitHub username (not 'YOURUSERNAME')"

# Validate input
if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

if ($username -eq "YOURUSERNAME" -or $username -eq "yourusername") {
    Write-Host "❌ Don't use 'YOURUSERNAME' literally!" -ForegroundColor Red
    Write-Host "Use your actual GitHub username that you see when you log into github.com" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Check if repository exists by attempting to access it
$repoUrl = "https://github.com/$username/SyncUI.git"
Write-Host ""
Write-Host "🔍 Checking if repository exists..." -ForegroundColor Cyan
Write-Host "Repository should be at: https://github.com/$username/SyncUI" -ForegroundColor Gray

$confirm = Read-Host "Have you created the 'SyncUI' repository on GitHub? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host ""
    Write-Host "❌ Please create the repository first:" -ForegroundColor Red
    Write-Host "1. Go to github.com" -ForegroundColor White
    Write-Host "2. Click the green 'New' button" -ForegroundColor White
    Write-Host "3. Repository name: SyncUI" -ForegroundColor White
    Write-Host "4. Make sure it's set to 'Public'" -ForegroundColor White
    Write-Host "5. Don't check any boxes" -ForegroundColor White
    Write-Host "6. Click 'Create repository'" -ForegroundColor White
    Read-Host "Press Enter when done"
}

Write-Host ""
Write-Host "🔧 Fixing remote URL..." -ForegroundColor Cyan

# Remove existing remote
git remote remove origin 2>$null

# Add correct remote
git remote add origin $repoUrl
Write-Host "✅ Remote URL set to: $repoUrl" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Attempting to push to GitHub..." -ForegroundColor Cyan
Write-Host "You may be asked for your GitHub username and password." -ForegroundColor Yellow
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your code is now on GitHub!" -ForegroundColor Green
    Write-Host "Visit: https://github.com/$username/SyncUI" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "1. Wrong username or password" -ForegroundColor White
    Write-Host "2. Repository doesn't exist: https://github.com/$username/SyncUI" -ForegroundColor White
    Write-Host "3. Repository is set to 'Private' instead of 'Public'" -ForegroundColor White
    Write-Host ""
    Write-Host "Double-check the repository exists and is public." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"