import express from "express";
import { Socket } from "socket.io";
import { ChatroomManagerType, ChatroomType, Client } from "./types";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);
const http = require("http").Server(app);
// Binding socket.io to http server
const io = require("socket.io")(http, {
  cors: {
    origin: "http://127.0.0.1:3001",
    methods: ["GET", "POST"]
  }
});
const ClientManager = require("./ClientManager");
const ChatroomManager = require("./chatroomManager");
const makeHandlers = require("./handlers");

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

// app.get("/", (req: any, res: any) => {
//   res.send("hello world");
// });

io.on('connection', function (socket: Socket) {
  const {
    handleRegister,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetChatrooms,
    handleDisconnect
  } = makeHandlers(socket, clientManager, chatroomManager)

  console.log("connected : ", socket.id)

  socket.on('register', handleRegister)

  socket.on('join', handleJoin)

  socket.on('leave', handleLeave)

  socket.on('message', handleMessage)

  socket.on('chatrooms', handleGetChatrooms)

  // socket.on('availableUsers', handleGetAvailableUsers)

  socket.on('disconnect', function () {
    console.log('socket disconnect...', socket.id)
    handleDisconnect()
  })

  socket.on('error', function (err) {
    console.log('received error from socket:', socket.id)
    console.log(err)
  })
})

// const client: Client = {
//   id: "1192387",
//   name: "Pierre",
//   email: "p.lovergne@hotmail.fr",
//   lastConnection: Date.now()
// }
// clientManager.addClient(client)
// console.log(clientManager.getAllClients())

// chatroomManager.addChatroom("salon1")
// // console.log(chatroomManager.serializeChatrooms());
// const salon: ChatroomType = chatroomManager.getChatroomByName("salon1");
// salon.addMember(client)
// salon.addEntry("test")
// handleMessage({ chatroomName: "salon1", message: "je suis message" })
// salon.getChatHistory();
// // console.log(salon.getChatHistory())

const server = http.listen(port, function () {
  console.log(`Listening on localhost:${port}`);
});