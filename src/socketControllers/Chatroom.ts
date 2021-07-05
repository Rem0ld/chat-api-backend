import { ChatroomType, Client } from "../types";

export default class Chatroom {
  name: string;
  owner: string;
  dateCreation: string;
  members: Map<string, any>;
  chatHistory: string[];

  constructor(name: string, user: Client) {
    this.name = name;
    this.owner = user.id;
    this.members = new Map();
    this.chatHistory = [];
    this.dateCreation = new Date().toISOString().split('T')[0];;
    this.addMember(user);
  }

  broadcastMessage(message: string) {
    // console.log("message: ", message)
    console.log(this.members)
    this.members.forEach(member => member.emit("message", message))
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
      owner: this.owner,
      size: this.members.size
    };
  }
}