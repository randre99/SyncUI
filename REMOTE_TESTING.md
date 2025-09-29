# Testing with Remote Users

## Quick Setup with ngrok (Recommended for Testing)

### 1. Start your local servers
```bash
# Terminal 1: Start Angular dev server
ng serve

# Terminal 2: Start Socket.IO server  
node server/server.js
```

### 2. Create ngrok tunnels
```bash
# Terminal 3: Tunnel for Angular app (port 4200)
ngrok http 4200

# Terminal 4: Tunnel for Socket.IO server (port 3001)
ngrok http 3001
```

### 3. Update configuration
- Copy the Socket.IO ngrok URL (e.g., https://abc123.ngrok.io)
- Update Angular environment to use this URL instead of localhost:3001
- Update server CORS to allow the Angular ngrok URL

### 4. Share links
- Share the Angular ngrok URL with your remote collaborator
- Both users can now test real-time collaboration!

## Step-by-Step Instructions

### Prerequisites
- Both local servers running (Angular on 4200, Socket.IO on 3001)
- ngrok installed globally

### Commands to run: