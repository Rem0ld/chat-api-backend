import { Socket } from "socket.io";
import Chatroom from "./socketControllers/Chatroom";


export interface Client {
  id: string;
  username: string;
  email: string;
  lastConnection: number;
}

export interface ClientManagerType {
  registerClient: (arg0: Socket, arg1: Client) => void;
  addClient: (arg0: Socket) => void;
  removeClient: (arg0: Socket) => void;
  getUserByClientId: (arg0: string) => Client | {};
  getAllClients: (arg0: Socket, arg1: Client) => { client: Socket, user: Client | undefined }[];
}

export interface ChatroomType {
  broadcastMessage: (arg0: string) => void;
  addEntry: (arg0: string) => void;
  getChatHistory: () => string[];
  addMember: (arg0: Client) => void;
  removeMember: (arg: Client) => void;
  serialize: () => { name: string, size: number }
}

export interface ChatroomManagerType {
  removeClient: (arg0: Client) => void;
  addChatroom: (arg0: string, arg1: Socket, arg2: Client) => void;
  getChatroomByName: (arg0: string) => Chatroom | undefined;
  getAllChatrooms: () => Chatroom[];
  serializeChatrooms: () => { name: string, size: number }[];
}