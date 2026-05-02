const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let players = [];

io.on("connection", (socket) => {
  console.log("Novo jogador:", socket.id);

  players.push(socket.id);

  socket.on("disconnect", () => {
    players = players.filter(p => p !== socket.id);
  });

  socket.on("resposta", (data) => {
    socket.broadcast.emit("resposta", data);
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando");
});
