import express from "express";
import { Socket } from "socket.io";
import {
  IChatroomManager,
  IClientManager,
} from "./types";
import { createContext } from "./config/context";
const { ApolloServer, gql } = require("apollo-server-express");
import { typeDefs } from "./graphql/schemas/Schema";
import { permissions } from "./config/permissions";
import { resolvers } from "./graphql/resolvers";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: "http://127.0.0.1:3001",
}))
app.set("port", port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make and Attach ApolloServer to the App
const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers,
  permissions: [permissions],
  context: createContext,
});
server.applyMiddleware({ app });


const http = app.listen(port, function () {
  console.log(`Listening on localhost:${port}`);
  console.log(`GraphQL API server at http://localhost:${port}/graphql`);
});

// Attach socket.io to the App
const io = require("socket.io")(http, {
  cors: {
    origin: "http://127.0.0.1:3001",
    methods: ["GET", "POST"],
  },
});

// Import everything for websockets
const ClientManager = require("./socketControllers/ClientManager");
const ChatroomManager = require("./socketControllers/chatroomManager");
const makeHandlers = require("./socketControllers/handlers");

const clientManager: IClientManager = ClientManager();
const chatroomManager: IChatroomManager = ChatroomManager();

io.on("connection", function (socket: Socket) {
  const {
    handleRegister,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetChatrooms,
    handleCreateChatroom,
    handleDeleteChatroom,
    handleDisconnect,
  } = makeHandlers(socket, clientManager, chatroomManager);

  // console.log("connected : ", socket.id);

  // console.log("Users", clientManager.getAllClients())
  clientManager.addClient(socket)

  socket.on("register", handleRegister);

  socket.on("join", handleJoin);

  socket.on("leave", handleLeave);

  socket.on("message", handleMessage);

  socket.on("chatrooms", handleGetChatrooms);

  socket.on("create_chatrooms", handleCreateChatroom);

  socket.on("delete_chatrooms", handleDeleteChatroom);

  socket.on("disconnect", function () {
    handleDisconnect();
  });

  socket.on("error", function (err) {
    console.log("received error from socket:", socket.id);
    console.log(err);
  });
});