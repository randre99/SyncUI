# PowerShell Helper Script for GitHub Beginners
Write-Host "🚀 GitHub Setup Helper for Complete Beginners" -ForegroundColor Green
Write-Host "This script will help you upload your collaborative app to GitHub" -ForegroundColor Gray
Write-Host ""

# Check if Git is installed
Write-Host "🔍 Checking if Git is installed..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://git-scm.com/" -ForegroundColor White
    Write-Host "2. Download Git for Windows" -ForegroundColor White
    Write-Host "3. Install with default settings" -ForegroundColor White
    Write-Host "4. Restart PowerShell and run this script again" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""

# Check if already a Git repository
if (Test-Path ".git") {
    Write-Host "✅ This is already a Git repository" -ForegroundColor Green
} else {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

Write-Host ""

# Get GitHub username
Write-Host "🔑 GitHub Setup" -ForegroundColor Yellow
Write-Host "Make sure you have:" -ForegroundColor Gray
Write-Host "- Created a GitHub account at github.com" -ForegroundColor Gray
Write-Host "- Created a repository named 'SyncUI'" -ForegroundColor Gray
Write-Host "- Set the repository to 'Public'" -ForegroundColor Gray
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "📤 Preparing to upload your code..." -ForegroundColor Cyan

# Add all files
Write-Host "Adding all files..." -ForegroundColor Gray
git add .

# Check if there are changes to commit
$status = git status --porcelain 2>$null
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️ No new changes to commit" -ForegroundColor Yellow
} else {
    # Commit changes
    Write-Host "Creating commit..." -ForegroundColor Gray
    git commit -m "Initial commit - Collaborative Angular App"
}

# Set main branch
Write-Host "Setting main branch..." -ForegroundColor Gray
git branch -M main

# Check if remote already exists
$remotes = git remote -v 2>$null
if ($remotes -match "origin") {
    Write-Host "ℹ️ GitHub remote already configured" -ForegroundColor Yellow
} else {
    # Add GitHub remote
    Write-Host "Connecting to GitHub..." -ForegroundColor Gray
    $repoUrl = "https://github.com/$githubUsername/SyncUI.git"
    git remote add origin $repoUrl
    Write-Host "✅ Connected to: $repoUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Uploading to GitHub..." -ForegroundColor Cyan
Write-Host "You may be asked for your GitHub username and password" -ForegroundColor Yellow
Write-Host ""

# Push to GitHub
try {
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your code is now on GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. 🌐 Visit your repository: https://github.com/$githubUsername/SyncUI" -ForegroundColor White
    Write-Host "2. 🚀 Deploy backend: Go to railway.app or render.com" -ForegroundColor White
    Write-Host "3. ⚙️ Update src/environments/environment.prod.ts with backend URL" -ForegroundColor White
    Write-Host "4. 📱 Enable GitHub Pages: Repository Settings → Pages → GitHub Actions" -ForegroundColor White
    Write-Host "5. 🎯 Your live app will be at: https://$githubUsername.github.io/SyncUI/" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Full instructions in: GITHUB_COMPLETE_BEGINNER_GUIDE.md" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Wrong GitHub username or password" -ForegroundColor White
    Write-Host "- Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "- Repository is not set to 'Public'" -ForegroundColor White
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Double-check your GitHub username: $githubUsername" -ForegroundColor White
    Write-Host "2. Make sure you created the 'SyncUI' repository on GitHub" -ForegroundColor White
    Write-Host "3. Ensure the repository is set to 'Public'" -ForegroundColor White
    Write-Host "4. Try running this script again" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to continue"