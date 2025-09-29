# Remote Testing Setup Guide

## Quick Testing with ngrok (Recommended)

### Prerequisites
- Node.js and npm installed
- ngrok installed globally: `npm install -g ngrok`
- Your Angular app and Socket.IO server running locally

### Step-by-Step Setup

#### 1. Start Local Servers
```bash
# Terminal 1: Start Socket.IO server
cd c:\Users\Regis\_RegisGitProjects\SyncUI
node server/server.js

# Terminal 2: Start Angular development server
ng serve
```

#### 2. Create ngrok Tunnels
```bash
# Terminal 3: Create tunnel for Socket.IO server (port 3001)
ngrok http 3001

# Terminal 4: Create tunnel for Angular app (port 4200) 
ngrok http 4200
```

#### 3. Configure URLs
After running ngrok, you'll see URLs like:
- Socket.IO tunnel: `https://abc123.ngrok.io` (for port 3001)
- Angular tunnel: `https://def456.ngrok.io` (for port 4200)

#### 4. Update Environment
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  websocketUrl: 'https://abc123.ngrok.io' // Your Socket.IO ngrok URL
};
```

#### 5. Restart Angular
```bash
# Stop Angular dev server (Ctrl+C) and restart
ng serve
```

#### 6. Test Collaboration
- Share the Angular ngrok URL with your remote collaborator
- Both users can now access the same collaborative session!

## Alternative Deployment Options

### 1. Heroku (Free tier available)
- Deploy both Angular and Node.js apps
- Use Heroku Postgres for session persistence
- Automatic HTTPS and global CDN

### 2. Vercel + Railway
- Frontend: Deploy Angular app on Vercel
- Backend: Deploy Socket.IO server on Railway
- Both have generous free tiers

### 3. DigitalOcean App Platform
- Full-stack deployment in one platform
- Auto-scaling and built-in monitoring
- $5/month for basic setup

### 4. AWS (More complex but scalable)
- Frontend: S3 + CloudFront
- Backend: EC2 or Lambda + API Gateway
- Database: RDS or DynamoDB

### 5. Local Network Testing
For users on the same network:
```bash
# Find your local IP
ipconfig

# Update environment to use your local IP
# Example: websocketUrl: 'http://192.168.1.100:3001'
```

## Security Notes

⚠️ **For Production Use:**
- Replace `origin: true` in CORS with specific allowed domains
- Use environment variables for sensitive configuration
- Implement proper authentication and authorization
- Use HTTPS/WSS in production
- Add rate limiting and input validation

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure server allows your frontend domain
2. **Connection Failed**: Check if both servers are running
3. **ngrok Timeout**: Free ngrok sessions timeout after 2 hours
4. **Firewall Issues**: ngrok handles most firewall problems automatically

### Debug Commands:
```bash
# Check if servers are running
netstat -an | findstr :3001
netstat -an | findstr :4200

# Test Socket.IO server directly
curl https://your-ngrok-url.ngrok.io/socket.io/
```