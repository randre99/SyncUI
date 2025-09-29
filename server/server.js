const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (adjust for production)
app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:4200", // Local development
      "https://localhost:4200", // Local HTTPS
      /^https:\/\/.*\.github\.io$/, // GitHub Pages
      /^https:\/\/.*\.up\.railway\.app$/, // Railway domains
      /^https:\/\/.*\.onrender\.com$/ // Render domains
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage for sessions and users
const sessions = new Map();
const userSessions = new Map(); // userId -> sessionId

class CollaborationSession {
  constructor(id, ownerId, ownerName) {
    this.id = id;
    this.ownerId = ownerId;
    this.participants = new Map();
    this.createdAt = new Date();
    this.isActive = true;
    this.controllingUserId = ownerId; // Owner has control initially
    this.sessionState = new Map(); // Store session state (like counter values)
    this.sessionState = new Map(); // Store session state (like counter values)
    
    // Add owner as first participant
    this.participants.set(ownerId, {
      id: ownerId,
      name: ownerName,
      color: this.generateUserColor(),
      isOwner: true,
      hasControl: true,
      joinedAt: new Date(),
      socketId: null
    });
  }

  addParticipant(userId, userName, socketId) {
    this.participants.set(userId, {
      id: userId,
      name: userName,
      color: this.generateUserColor(),
      isOwner: false,
      hasControl: false,
      joinedAt: new Date(),
      socketId: socketId
    });
  }

  removeParticipant(userId) {
    this.participants.delete(userId);
    
    // If controlling user left, transfer control to owner
    if (this.controllingUserId === userId) {
      this.controllingUserId = this.ownerId;
      const owner = this.participants.get(this.ownerId);
      if (owner) {
        owner.hasControl = true;
      }
    }
  }

  requestControl(userId) {
    // Release current control
    if (this.controllingUserId) {
      const currentController = this.participants.get(this.controllingUserId);
      if (currentController) {
        currentController.hasControl = false;
      }
    }

    // Grant control to requester
    this.controllingUserId = userId;
    const user = this.participants.get(userId);
    if (user) {
      user.hasControl = true;
    }
  }

  releaseControl(userId) {
    if (this.controllingUserId === userId) {
      const user = this.participants.get(userId);
      if (user) {
        user.hasControl = false;
      }
      
      // Transfer control to owner
      this.controllingUserId = this.ownerId;
      const owner = this.participants.get(this.ownerId);
      if (owner) {
        owner.hasControl = true;
      }
    }
  }

  getParticipantsArray() {
    return Array.from(this.participants.values());
  }

  updateState(key, value) {
    this.sessionState.set(key, value);
    console.log(`🔄 Session ${this.id} state updated: ${key} = ${value}`);
  }

  getState() {
    return Object.fromEntries(this.sessionState);
  }

  toJSON() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      participants: this.getParticipantsArray(),
      createdAt: this.createdAt,
      isActive: this.isActive,
      state: this.getState()
    };
  }

  generateUserColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd93d'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  const userName = socket.handshake.auth.userName;
  
  console.log(`🔗 User connected: ${userName} (${userId})`);

  // Handle session creation
  socket.on('create-session', () => {
    const sessionId = generateSessionId();
    const session = new CollaborationSession(sessionId, userId, userName);
    
    sessions.set(sessionId, session);
    userSessions.set(userId, sessionId);
    
    // Join the socket room
    socket.join(sessionId);
    
    // Update participant's socket ID
    const participant = session.participants.get(userId);
    if (participant) {
      participant.socketId = socket.id;
    }

    console.log(`🆕 Session created: ${sessionId} by ${userName}`);
    
    // Send session info back to creator
    socket.emit('session-updated', session.toJSON());
  });

  // Handle joining existing session
  socket.on('join-session', ({ sessionId }) => {
    const session = sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      socket.emit('error', { message: 'Session not found or inactive' });
      return;
    }

    // Leave current session if in one
    const currentSessionId = userSessions.get(userId);
    if (currentSessionId && currentSessionId !== sessionId) {
      socket.leave(currentSessionId);
      const currentSession = sessions.get(currentSessionId);
      if (currentSession) {
        currentSession.removeParticipant(userId);
        io.to(currentSessionId).emit('session-updated', currentSession.toJSON());
      }
    }

    // Join new session
    session.addParticipant(userId, userName, socket.id);
    userSessions.set(userId, sessionId);
    socket.join(sessionId);

    console.log(`👥 ${userName} joined session: ${sessionId}`);

    // Send current session state to the new joiner
    const sessionState = session.getState();
    if (Object.keys(sessionState).length > 0) {
      console.log(`📤 Sending initial state to ${userName}:`, sessionState);
      socket.emit('initial-state', sessionState);
    }

    // Notify all participants about the update
    io.to(sessionId).emit('session-updated', session.toJSON());
  });

  // Handle leaving session
  socket.on('leave-session', ({ sessionId }) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.removeParticipant(userId);
      socket.leave(sessionId);
      userSessions.delete(userId);

      console.log(`👋 ${userName} left session: ${sessionId}`);

      // If no participants left, deactivate session
      if (session.participants.size === 0) {
        session.isActive = false;
        sessions.delete(sessionId);
        console.log(`🗑️ Session ${sessionId} deleted (no participants)`);
      } else {
        // Notify remaining participants
        io.to(sessionId).emit('session-updated', session.toJSON());
      }
    }
  });

  // Handle control requests
  socket.on('request-control', ({ sessionId }) => {
    const session = sessions.get(sessionId);
    if (session && session.participants.has(userId)) {
      session.requestControl(userId);
      console.log(`🎛️ ${userName} requested control in session: ${sessionId}`);
      io.to(sessionId).emit('session-updated', session.toJSON());
    }
  });

  socket.on('release-control', ({ sessionId }) => {
    const session = sessions.get(sessionId);
    if (session && session.participants.has(userId)) {
      session.releaseControl(userId);
      console.log(`🔓 ${userName} released control in session: ${sessionId}`);
      io.to(sessionId).emit('session-updated', session.toJSON());
    }
  });

  // Handle collaborative events
  socket.on('collaborative-event', (event) => {
    const sessionId = userSessions.get(userId);
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session && session.participants.has(userId)) {
        // Store state for form changes and other persistent data
        if (event.type === 'form-change' && event.data) {
          session.updateState(event.data.elementId, event.data.value);
        }
        
        // Broadcast the event to all other participants
        socket.to(sessionId).emit('collaborative-event', event);
        
        // Log the event for debugging
        if (event.type !== 'cursor-move') {
          console.log(`🔄 Collaborative event in ${sessionId}: ${event.type} from ${userName}`);
        }
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userName} (${userId})`);
    
    const sessionId = userSessions.get(userId);
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        session.removeParticipant(userId);
        userSessions.delete(userId);

        // If no participants left, deactivate session
        if (session.participants.size === 0) {
          session.isActive = false;
          sessions.delete(sessionId);
          console.log(`🗑️ Session ${sessionId} deleted (no participants after disconnect)`);
        } else {
          // Notify remaining participants
          io.to(sessionId).emit('session-updated', session.toJSON());
        }
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error from ${userName} (${userId}):`, error);
  });
});

// Basic HTTP endpoints for health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    activeConnections: io.engine.clientsCount
  });
});

app.get('/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(session => ({
    id: session.id,
    participantCount: session.participants.size,
    createdAt: session.createdAt,
    isActive: session.isActive
  }));
  
  res.json(sessionList);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Collaboration server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Sessions list: http://localhost:${PORT}/sessions`);
  console.log(`🌐 Accepting connections from: http://localhost:4200`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down collaboration server...');
  server.close(() => {
    console.log('✅ Server shutdown complete');
    process.exit(0);
  });
});

// Clean up inactive sessions periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [sessionId, session] of sessions.entries()) {
    if (!session.isActive || (now - session.createdAt.getTime()) > maxAge) {
      sessions.delete(sessionId);
      console.log(`🧹 Cleaned up inactive session: ${sessionId}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour