# Quick Fix Script for GitHub Remote URL Error
Write-Host "🔧 Fixing GitHub Remote URL Error" -ForegroundColor Yellow
Write-Host ""

# Check current remote
Write-Host "Current remote configuration:" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "The error 'repository not found' means you need to replace 'YOURUSERNAME' with your actual GitHub username." -ForegroundColor Yellow
Write-Host ""

# Get the correct username
Write-Host "🔍 To find your GitHub username:" -ForegroundColor Cyan
Write-Host "1. Go to github.com and sign in" -ForegroundColor Gray
Write-Host "2. Look at the top-right corner for your username" -ForegroundColor Gray
Write-Host "3. Or check the URL when on your profile: github.com/YOUR-USERNAME" -ForegroundColor Gray
Write-Host ""

$username = Read-Host "Enter your actual GitHub username (not 'YOURUSERNAME')"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

if ($username -eq "YOURUSERNAME") {
    Write-Host "❌ Don't use 'YOURUSERNAME' literally! Use your actual username!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "🔄 Fixing the remote URL..." -ForegroundColor Cyan

# Remove old remote
Write-Host "Removing old remote..." -ForegroundColor Gray
git remote remove origin 2>$null

# Add correct remote
Write-Host "Adding correct remote..." -ForegroundColor Gray
$repoUrl = "https://github.com/$username/SyncUI.git"
git remote add origin $repoUrl

Write-Host "✅ Remote URL updated to: $repoUrl" -ForegroundColor Green
Write-Host ""

# Verify the repository exists
Write-Host "🔍 Make sure your repository exists:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/$username/SyncUI" -ForegroundColor White
Write-Host "2. If it doesn't exist, create a new repository named 'SyncUI'" -ForegroundColor White
Write-Host "3. Make sure it's set to 'Public'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Press Enter when you've confirmed the repository exists, or type 'skip' to try anyway"

if ($continue -ne "skip") {
    Write-Host ""
    Write-Host "🚀 Attempting to push to GitHub..." -ForegroundColor Cyan
    
    try {
        git push -u origin main
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your code is now on GitHub!" -ForegroundColor Green
        Write-Host "Visit: https://github.com/$username/SyncUI" -ForegroundColor Yellow
    } catch {
        Write-Host ""
        Write-Host "❌ Still having issues. Common problems:" -ForegroundColor Red
        Write-Host "1. Repository doesn't exist on GitHub" -ForegroundColor White
        Write-Host "2. Repository is set to 'Private' instead of 'Public'" -ForegroundColor White
        Write-Host "3. Incorrect username or password" -ForegroundColor White
        Write-Host "4. Username spelling is wrong" -ForegroundColor White
        Write-Host ""
        Write-Host "Double-check: https://github.com/$username/SyncUI" -ForegroundColor Yellow
    }
}

Write-Host ""
Read-Host "Press Enter to continue"