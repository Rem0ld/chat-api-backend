import { Socket } from "socket.io";
import { ChatroomManagerType, ChatroomType, Client } from "../types";
import Chatroom from "./chatroom";




module.exports = function (): ChatroomManagerType {
  const chatrooms = new Map<string, Chatroom>();

  function removeClient(client: Client) {
    chatrooms.forEach(chatroom => chatroom.removeMember(client))
  }

  function addChatroom(name: string, client: Socket, user: Client) {
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