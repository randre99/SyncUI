# 🚀 GitHub Deployment Guide

Deploy your collaborative Angular app to GitHub Pages + Railway/Render for free global access!

## 📋 Quick Overview

**Frontend**: GitHub Pages (Angular app)
**Backend**: Railway or Render (Socket.IO server)
**CI/CD**: GitHub Actions (automatic deployment)

## 🎯 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/SyncUI.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend (Socket.IO Server)

#### Option A: Railway (Recommended)

1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo" 
3. Select your `SyncUI` repository
4. Railway will auto-detect and deploy from the `/server` folder
5. Copy your Railway URL (e.g., `https://your-app-name.up.railway.app`)

#### Option B: Render

1. Go to [Render.com](https://render.com) and sign up with GitHub
2. Click "New Web Service" → Connect your GitHub repo
3. Set:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Copy your Render URL

### 3. Update Frontend Configuration

Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  websocketUrl: 'https://your-railway-url.up.railway.app' // Your actual backend URL
};
```

### 4. Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: "GitHub Actions"
4. The workflow will automatically deploy on your next push

### 5. Push Changes

```bash
git add .
git commit -m "Add production deployment configuration"
git push
```

## 🌐 Access Your App

- **Frontend**: `https://YOUR_USERNAME.github.io/SyncUI/`
- **Backend**: Your Railway/Render URL
- **Health Check**: `https://your-backend-url/health`

## 🔧 Configuration Files Created

✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
✅ `server/railway.toml` - Railway deployment config  
✅ `server/render.yaml` - Render deployment config
✅ Updated environment files for production

## 🚀 Features

- **Automatic Deployment**: Push to main branch = auto-deploy
- **HTTPS**: Both frontend and backend use secure connections
- **Global CDN**: Fast loading worldwide via GitHub Pages
- **Health Monitoring**: Built-in health check endpoints
- **Session Persistence**: Server maintains state between deployments

## 🔍 Testing Your Deployment

1. Visit your GitHub Pages URL
2. Create a collaboration session
3. Share the URL with someone in another country
4. Test real-time synchronization:
   - Counter increments/decrements
   - Form inputs
   - Navigation sync
   - Cursor tracking

## 💡 Tips

- **Custom Domain**: Add a CNAME file for custom domain
- **Environment Variables**: Use Railway/Render dashboard for secrets
- **Monitoring**: Check Railway/Render logs for server issues
- **Updates**: Any push to main auto-deploys both frontend and backend

## 🔒 Security Notes

- Backend CORS is configured for your GitHub Pages domain
- Use HTTPS in production (automatically enabled)
- Consider adding authentication for private sessions
- Monitor usage to stay within free tier limits

## 📊 Free Tier Limits

**Railway**: 500 hours/month, $5 credit
**Render**: 750 hours/month free tier
**GitHub Pages**: Unlimited static hosting

Perfect for testing and small-scale collaboration! 🎉