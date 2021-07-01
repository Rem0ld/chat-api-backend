import express from "express";
import { Socket } from "socket.io";
import { ChatroomManagerType, ChatroomType, Client } from "./types";


const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);
const http = require("http").Server(app);
// Binding socket.io to http server
const io = require("socket.io")(http);
const ClientManager = require("./ClientManager");
const ChatroomManager = require("./chatroomManager");
const makeHandlers = require("./handlers");

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

app.get("/", (req: any, res: any) => {
  res.send("hello world");
});
const client: Client = {
  id: "1192387",
  name: "Pierre",
  email: "p.lovergne@hotmail.fr",
  lastConnection: Date.now()
}
const {
  handleJoin,
  handleLeave,
  handleMessage,
  handleGetChatrooms,
  handleDisconnect
} = makeHandlers(client, clientManager, chatroomManager)

clientManager.addClient(client)
console.log(clientManager.getAllClients())

chatroomManager.addChatroom("salon1")
console.log(chatroomManager.serializeChatrooms());
const salon: ChatroomType = chatroomManager.getChatroomByName("salon1");
salon.addMember(client)
salon.addEntry("test")
console.log(salon.serialize())
// console.log(salon.getChatHistory())
// console.log(chatroomManager.serializeChatrooms())



// io.on('connection', function (client: Socket) {
//   client.on('register', handleRegister)

//   client.on('join', handleJoin)

//   client.on('leave', handleLeave)

//   client.on('message', handleMessage)

//   client.on('chatrooms', handleGetChatrooms)

//   // client.on('availableUsers', handleGetAvailableUsers)

//   client.on('disconnect', function () {
//     console.log('client disconnect...', client.id)
//     handleDisconnect()
//   })

//   client.on('error', function (err) {
//     console.log('received error from client:', client.id)
//     console.log(err)
//   })
// })

const server = http.listen(port, function () {
  console.log(`Listening on localhost:${port}`);
});