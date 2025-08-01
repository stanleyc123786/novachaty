const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
  socket.on('chat', ({ username, message }) => {
    io.emit('chat', { username, message });
  });
});

server.listen(8000, () => {
  console.log('Chat running on http://localhost:8000');
});
