import { ChatroomType, Client } from "./types";

export default class Chatroom {
  name: any;
  members: Map<string, Client>;
  chatHistory: string[];

  constructor(name: string) {
    this.name = name;
    this.members = new Map();
    this.chatHistory = [];
  }

  broadcastMessage(message: string) {
    console.log("message: ", message)
    // this.members.forEach(member => member.emit("message", message))
  }

  addEntry(message: string) {
    this.chatHistory.push(message)
  }

  getChatHistory() {
    return this.chatHistory.slice();
  }

  addMember(user: Client) {
    this.members.set(user.id, user)
  }

  removeMember(member: any) {
    this.members.delete(member.id)
  }

  serialize() {
    return {
      name: this.name,
      size: this.members.size
    };
  }
}