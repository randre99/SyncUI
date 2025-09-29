# How to Check ngrok Terminal URLs

## Visual Guide

When you run ngrok, you'll see a terminal window like this:

```
ngrok                                                       (Ctrl+C to quit)

Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001  ← THIS IS YOUR URL
Forwarding                    http://abc123.ngrok.io -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                             0       0       0.00    0.00    0.00    0.00
```

## What URLs You Need:

### For Socket.IO Server (port 3001):
- Look for: `https://abc123.ngrok.io -> http://localhost:3001`
- Copy: `https://abc123.ngrok.io`
- Use this in: `src/environments/environment.ts`

### For Angular App (port 4200):
- Look for: `https://def456.ngrok.io -> http://localhost:4200`  
- Copy: `https://def456.ngrok.io`
- Share this URL with your remote collaborator

## Alternative Methods:

### 1. ngrok Web Interface
- Open browser to: `http://127.0.0.1:4040`
- See all active tunnels in a web interface
- View request logs and tunnel status

### 2. Command Line Status
```bash
# List all active tunnels
ngrok api tunnels list

# Or check the status
curl http://127.0.0.1:4040/api/tunnels
```

### 3. If Terminal Windows Close
If the ngrok terminal windows close or you lose them:

```bash
# Restart ngrok for Socket.IO server
ngrok http 3001

# Restart ngrok for Angular app  
ngrok http 4200
```

## Quick Setup Checklist:

1. ✅ Start Socket.IO server: `node server/server.js`
2. ✅ Start Angular server: `ng serve`
3. ✅ Start ngrok for Socket.IO: `ngrok http 3001`
4. ✅ Start ngrok for Angular: `ngrok http 4200`
5. ✅ Copy Socket.IO ngrok URL from terminal
6. ✅ Update `src/environments/environment.ts`
7. ✅ Restart Angular server
8. ✅ Copy Angular ngrok URL from terminal
9. ✅ Share Angular URL with collaborator

## Troubleshooting:

**Can't see the terminal?** 
- Check your taskbar for multiple command prompt windows
- Each ngrok instance opens its own window

**Terminal shows errors?**
- Make sure the local server (3001 or 4200) is running first
- Check if ports are already in use

**URLs not working?**
- Verify the local servers are accessible at localhost:3001 and localhost:4200
- Check Windows Firewall settings