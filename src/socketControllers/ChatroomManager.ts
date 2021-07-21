import { Socket } from "socket.io";
import { IChatroomManager, User } from "../types";
import Chatroom from "./chatroom";




module.exports = function (): IChatroomManager {
  const chatrooms = new Map<string, Chatroom>();

  function removeClient(client: User) {
    chatrooms.forEach(chatroom => chatroom.removeMember(client))
  }

  function addChatroom(name: string, client: Socket, user: User) {
    if (getChatroomByName(name)) {
      throw new Error(`${name} already exist!`);
    }
    const chatroom = new Chatroom(name, client, user);
    chatrooms.set(name, chatroom);
    return chatroom;
  }

  function getChatroomByName(name: string) {
    return chatrooms.get(name);
  }

  function getAllChatrooms() {
    return Array.from(chatrooms.values());
  }

  function serializeChatrooms() {
    return Array.from(chatrooms.values()).map(chatroom => chatroom.serialize())
  }

  return {
    removeClient,
    addChatroom,
    getChatroomByName,
    getAllChatrooms,
    serializeChatrooms
  }
}