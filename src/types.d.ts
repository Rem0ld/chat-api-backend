import { Socket } from "socket.io";
import Chatroom from "./socketControllers/Chatroom";

export interface User {
  id: string;
  username: string;
  email: string;
  lastConnection: number;
}

export type SocketUser = { client: Socket, user: User }
export interface IClientManager {
  registerClient: (arg0: Socket, arg1: User) => void;
  addClient: (arg0: Socket) => void;
  removeClient: (arg0: Socket) => void;
  getUserByClientId: (arg0: string) => User | {};
  getAllClients: (arg0: Socket, arg1: User) => { client: Socket, user: User | undefined }[];
}

export type TEntry = {
  user: User;
  createEntry: () => { message: string, type: string }
}

export interface IChatroom {
  broadcastMessage: (arg0: string) => void;
  broadcastMembers: () => void;
  addEntry: (arg0: string) => void;
  getChatHistory: () => string[];
  addMember: (arg0: User) => void;
  removeMember: (arg: User) => void;
  getMembers: () => User[];
  serialize: () => TSerializedChatroom;
}

export interface IChatroomManager {
  removeClient: (arg0: Socket) => void;
  addChatroom: (arg0: string, arg1: Socket, arg2: User) => Chatroom | undefined;
  getChatroomByName: (arg0: string) => Chatroom | undefined;
  getAllChatrooms: () => Chatroom[];
  serializeChatrooms: () => TSerializedChatroom[];
}

export type TSerializedChatroom = {
  name: string;
  owner: string;
  size: number;
}