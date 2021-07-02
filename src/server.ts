import express from "express";
import { Socket } from "socket.io";
import { ChatroomManagerType, ChatroomType, Client, ClientManagerType } from "./types";
import { buildSchema } from "graphql";
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const typeDefs = gql(`
type Query {
  hello: String
}`)

const resolvers = {
  Query: {
    hello: () => {
      return "Hello World!";
    }
  }
}
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const ClientManager = require("./socketControllers/ClientManager");
const ChatroomManager = require("./socketControllers/chatroomManager");
const makeHandlers = require("./socketControllers/handlers");

const clientManager: ClientManagerType = ClientManager();
const chatroomManager: ChatroomManagerType = ChatroomManager();


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

const http = app.listen(port, function () {
  console.log(`Listening on localhost:${port}`)
  console.log(`GraphQL API server at http://localhost:${port}/graphql`);
});
const io = require("socket.io")(http, {
  cors: {
    origin: "http://127.0.0.1:3001",
    methods: ["GET", "POST"]
  }
});

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