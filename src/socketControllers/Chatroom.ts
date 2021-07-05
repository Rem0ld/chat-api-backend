import { Socket } from "socket.io";
import { ChatroomType, Client } from "../types";

export default class Chatroom {
  name: string;
  owner: string;
  dateCreation: string;
  members: Map<string, { client: Socket, user: Client }>;
  chatHistory: string[];

  constructor(name: string, client: Socket, user: Client) {
    this.name = name;
    this.owner = user.id;
    this.members = new Map();
    this.chatHistory = [];
    this.dateCreation = new Date().toISOString().split('T')[0];;
    this.addMember(client, user);
  }

  broadcastMessage(message: string) {
    console.log("this is the message\n *******************", message)
    this.members.forEach(member => member.client.emit("message", message))
  }

  addEntry(message: string) {
    this.chatHistory.push(message)
  }

  getChatHistory() {
    return this.chatHistory.slice();
  }

  addMember(client: Socket, user: Client) {
    this.members.set(client.id, { client, user })
  }

  removeMember(member: any) {
    this.members.delete(member.id)
  }

  serialize() {
    return {
      name: this.name,
      owner: this.owner,
      size: this.members.size
    };
  }
}