const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8000;

let messages = [];

// Load messages from file safely
if (fs.existsSync("messages.json")) {
  try {
    const data = fs.readFileSync("messages.json", "utf-8");
    messages = JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading messages.json. Starting with empty message list.");
    messages = [];
  }
}

app.use(express.static("public"));

io.on("connection", (socket) => {
  // Send message history to the new user
  socket.emit("load-messages", messages);

  // Handle new chat message
  socket.on("chat", (msg) => {
    msg.id = Date.now().toString();
    messages.push(msg);
    saveMessages();
    io.emit("chat", msg);
  });

  // Handle message deletion
  socket.on("delete-message", ({ id, forAll, username }) => {
    if (forAll) {
      // Only allow if the user owns the message
      const index = messages.findIndex((m) => m.id === id && m.username === username);
      if (index !== -1) {
        messages.splice(index, 1);
        saveMessages();
        io.emit("delete-message", { id });
      }
    } else {
      // Delete only for self
      socket.emit("delete-message", { id });
    }
  });
});

function saveMessages() {
  fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));
}

server.listen(PORT, () => {
  console.log(`YR6 GC running at http://localhost:${PORT}`);
});
