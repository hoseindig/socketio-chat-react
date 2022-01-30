const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://192.168.1.151:3000",
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const dbUsers = [{
  name: 'reza',
  id: 13131,
  type: 2,
  username: 'h1',
  password: '1'
}]

io.on("connection", (socket) => {
  const userConected = socket.handshake.auth
  const users = [];

  console.log("io.on connection", socket.username)

  //if user is admin veryfy
  const resAdminFind = dbUsers.find(u => u.username === userConected.username && u.type === userConected.type && u.password === userConected.password)
  if (resAdminFind) {
    console.log("io.on connection", socket.username, userConected.type === 2 ? 'Admin' : 'User')

    // fetch existing users
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        isAdmin: resAdminFind ? true : false,
        username: socket.username,
      });
    }
  } else
    // fetch existing users
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        isAdmin: false,
        username: socket.username,
      });
    }

  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
    isAdmin:  resAdminFind ? true : false,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({
    content,
    to
  }) => {
    console.log("private message", content, to, socket.id);
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
    let user = users.find(i => i.userID === socket.id)
    console.log("user disconnected", user.username, socket.id);

  });
});

const PORT = process.env.PORT || 9901;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);