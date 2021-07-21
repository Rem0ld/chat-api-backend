import { Socket } from "socket.io";
import { TEntry, User } from "../types";

export default class Chatroom {
  name: string;
  owner: string;
  dateCreation: string;
  members: Map<string, { client: Socket, user: User }>;
  chatHistory: TEntry[];

  constructor(name: string, client: Socket, user: User) {
    this.name = name;
    this.owner = user.id;
    this.members = new Map();
    this.chatHistory = [];
    this.dateCreation = new Date().toISOString().split('T')[0];;
    this.addMember(client, user);
  }

  broadcastMessage(entry: TEntry) {
    this.members.forEach(member => member.client.emit("message", entry))
  }

  addEntry(entry: TEntry) {
    this.chatHistory.push(entry)
  }

  getChatHistory() {
    return this.chatHistory.slice();
  }

  addMember(client: Socket, user: User) {
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