const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Basic route to test server is running
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running!');
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your domain later
    methods: ["GET", "POST"]
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a chat room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });
  
  // Handle new messages
  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    // Send message to all users in the room
    io.to(data.room).emit('receive_message', data);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', data);
  });
  
  socket.on('stop_typing', (data) => {
    socket.to(data.room).emit('user_stop_typing', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});