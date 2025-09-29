# 📋 GitHub Deployment Checklist

## Pre-Deployment Setup ✅

- [x] GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- [x] Server deployment configs created (`railway.toml`, `render.yaml`)  
- [x] Production environment configured (`environment.prod.ts`)
- [x] CORS updated for GitHub Pages domains
- [x] Build configuration verified

## Deployment Steps

### 1. ⚙️ Setup Git & GitHub
- [ ] Repository pushed to GitHub
- [ ] Main branch configured
- [ ] Repository is public (required for GitHub Pages free tier)

### 2. 🚀 Deploy Backend (Choose one)

#### Option A: Railway (Recommended)
- [ ] Go to [Railway.app](https://railway.app)
- [ ] Sign up with GitHub account
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your `SyncUI` repository
- [ ] Railway auto-detects Node.js in `/server` folder
- [ ] Copy your Railway URL (e.g., `syncui-server-production-abc123.up.railway.app`)

#### Option B: Render
- [ ] Go to [Render.com](https://render.com)
- [ ] Click "New Web Service" → Connect GitHub repo
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Copy your Render URL

### 3. 🔧 Update Frontend Configuration
- [ ] Edit `src/environments/environment.prod.ts`
- [ ] Replace `websocketUrl` with your actual backend URL
- [ ] Example: `websocketUrl: 'https://your-app.up.railway.app'`

### 4. 📱 Enable GitHub Pages
- [ ] Go to GitHub repository → Settings → Pages
- [ ] Source: "GitHub Actions" (not "Deploy from branch")
- [ ] Wait for Actions to be enabled

### 5. 🚀 Deploy
```bash
git add .
git commit -m "Deploy to production"
git push
```
- [ ] Push changes to GitHub
- [ ] Check GitHub Actions tab for deployment progress
- [ ] Wait for green checkmark (build & deploy complete)

## 🌐 Access Your App

After successful deployment:

- **Frontend**: `https://YOUR_USERNAME.github.io/SyncUI/`
- **Backend Health**: `https://your-backend-url/health`
- **Sessions API**: `https://your-backend-url/sessions`

## ✅ Verification Tests

Test these features with someone in another country:

- [ ] **Create Session**: Start a new collaboration session
- [ ] **Join Session**: Second user joins with session ID
- [ ] **Counter Sync**: Increment/decrement counter in real-time
- [ ] **Form Sync**: Type in form fields, see updates immediately
- [ ] **Navigation Sync**: Navigate between pages together
- [ ] **Cursor Tracking**: See each other's mouse cursors
- [ ] **Dynamic Content**: Add/remove dynamic items
- [ ] **Session Persistence**: Refresh page, stay in session

## 🔍 Troubleshooting

### GitHub Actions Fails
- Check build errors in Actions tab
- Verify `angular.json` output path matches workflow
- Ensure all dependencies are in `package.json`

### Backend Connection Fails
- Verify backend URL in `environment.prod.ts`
- Check backend health endpoint
- Review CORS configuration in server

### App Loads but No Real-time Sync
- Check browser console for WebSocket errors
- Verify backend is running and accessible
- Test backend health endpoint

## 📊 Free Tier Limits

**GitHub Pages**: Unlimited static hosting
**Railway**: 500 hours/month, $5 credit monthly
**Render**: 750 hours/month free tier

Perfect for testing and small-scale collaboration!

## 🎉 Success!

Your collaborative Angular app is now live and accessible worldwide!

Share the GitHub Pages URL with collaborators anywhere in the world for real-time UI synchronization.