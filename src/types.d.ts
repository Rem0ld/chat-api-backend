import { Socket } from "socket.io";


export interface Client {
  id: string;
  username: string;
  email: string;
  lastConnection: number;
}

export interface ClientManagerType {
  addClient: (arg0: Client) => void;
  removeClient: (arg0: Client) => void;
  getUserByClientId: (arg0: string) => Client | {};
  getAllClients: () => Client[];
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
  addChatroom: (arg0: string, arg1: Client) => void;
  getChatroomByName: (arg0: string) => ChatroomType | undefined;
  getAllChatrooms: () => ChatroomType[];
  serializeChatrooms: () => { name: string, size: number }[];
}