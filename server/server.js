const express = require("express");
const { userJoin, userLeave, getRoomUsers } = require("./users");

const app = express();

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});
app.get("/", (req, res) => {
  res.json("Server is running");
});

const Time = new Date().toLocaleTimeString();
const botName = "ChatCord";

io.on("connection", (socket) => {
  console.log("user connected");
  const userId = socket.id;

  // join room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(userId, username, room);
    socket.join(user.room);

    //broadcast to specific room
    io.to(user.room).emit("chat", {
      message: `${user.username} has joined the chat`,
      username: botName,
      time: Time,
    });

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chat", (payload) => {
    io.to(payload.room).emit("chat", payload);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("chat", {
        message: `${user.username} has left the chat`,
        username: botName,
        time: Time,
      });

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

httpServer.listen(3000, () => {
  console.log("server started on localhost:3000");
});
