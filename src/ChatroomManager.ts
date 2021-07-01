import Chatroom from "./chatroom";
import { ChatroomManagerType, ChatroomType, Client } from "./types";



module.exports = function (): ChatroomManagerType {
  const chatrooms = new Map<string, any>();

  function removeClient(client: Client) {
    chatrooms.forEach(chatroom => chatroom.removeMember(client))
  }

  function addChatroom(name: string) {
    const chatroom = new Chatroom(name);
    chatrooms.set(name, chatroom);
  }

  function getChatroomByName(name: string) {
    return chatrooms.get(name);
  }

  function getAllChatrooms() {
    return Array.from(chatrooms.values());
  }

  function serializeChatrooms() {
    Array.from(chatrooms.values()).map(chatroom => chatroom.serialize())
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