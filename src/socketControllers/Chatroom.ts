import { Socket } from "socket.io";
import { TEntry, User } from "../types";

export default class Chatroom {
  name: string;
  owner: User;
  dateCreation: string;
  members: Map<string, { client: Socket, user: User }>;
  chatHistory: TEntry[];

  constructor(name: string, client: Socket, user: User) {
    this.name = name;
    this.owner = user;
    this.members = new Map();
    this.chatHistory = [];
    this.dateCreation = new Date().toISOString().split('T')[0];;
    this.addMember(client, user);
  }

  broadcastMessage(entry: TEntry) {
    this.members.forEach(member => member.client.emit("message", entry))
  }

  broadcastMembers() {
    const members = this.getMembers();
    this.members.forEach(member => member.client.emit("event-connection", members))
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

  removeMember(member: Socket) {
    this.members.delete(member.id)
  }

  getMembers() {
    const members = this.members.values();
    const returnValue = [];
    for (let member of members) {
      returnValue.push(member.user)
    }
    return returnValue;
  }

  serialize() {
    return {
      name: this.name,
      owner: this.owner.username,
      size: this.members.size
    };
  }
}