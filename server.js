// server.js
const http = require('http');
const socketIo = require('socket.io');

// Create a basic HTTP server (no static file serving – Vite handles the frontend)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Socket.IO server is running.");
});

// Set up Socket.IO with CORS enabled
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Maintain the board state (an array of drawing actions)
let boardState = [];

// Handle incoming connections
io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);
  
  // Send the full board state to new clients
  socket.emit('init', boardState);

  // Listen for drawing actions
  socket.on('draw', (data) => {
    boardState.push(data); // Update the board state
    io.emit('draw', data); // Broadcast to all clients
  });

  // Listen for clear board events
  socket.on('clear', () => {
    boardState = [];
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
