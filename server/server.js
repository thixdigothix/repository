const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");

console.log("Iniciando servidor...");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "..") });
const handle = nextApp.getRequestHandler();

console.log("Preparando Next.js...");

nextApp.prepare().then(() => {
  console.log("Next.js preparado.");
  isReady = true;
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  socket.on("joinRoom", ({ roomCode, playerName }) => {
    socket.join(roomCode);
    
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, {
        players: [],
        gameState: null,
        currentTurn: 1
      });
    }

    const room = rooms.get(roomCode);
    const playerIndex = room.players.length;

    if (playerIndex < 2) {
      room.players.push({ id: socket.id, name: playerName, role: playerIndex + 1 });
      socket.emit("joined", { role: playerIndex + 1, room });
      io.to(roomCode).emit("roomUpdate", room);
    } else {
      socket.emit("error", "Sala cheia");
    }
  });

  socket.on("gameEvent", ({ roomCode, event }) => {
    const room = rooms.get(roomCode);
    if (room) {
      // Broadcast the event to everyone in the room except the sender
      socket.to(roomCode).emit("gameEvent", event);
    }
  });

  socket.on("disconnect", () => {
    console.log("Saiu:", socket.id);
    rooms.forEach((room, roomCode) => {
      const playerIdx = room.players.findIndex(p => p.id === socket.id);
      if (playerIdx !== -1) {
        room.players.splice(playerIdx, 1);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        } else {
          io.to(roomCode).emit("roomUpdate", room);
        }
      }
    });
  });
});

let isReady = false;

// Next.js request handling
app.all(/.*/, (req, res) => {
  if (!isReady && !req.url.startsWith("/_next") && req.url !== "/favicon.ico") {
    return res.send("Aguarde, o servidor está iniciando...");
  }
  return handle(req, res);
});

const PORT = 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Rodando na porta", PORT);
});
