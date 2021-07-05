import { Socket } from "socket.io"
import { ChatroomManagerType, ChatroomType, Client, ClientManagerType } from "../types"
import Chatroom from "./chatroom"

function makeHandleEvent(client: Socket, clientManager: ClientManagerType, chatroomManager: ChatroomManagerType) {

  function ensureExists(getter: () => any, rejectionMessage: string): any {
    return new Promise((resolve, reject) => {
      const response = getter()
      return response ?
        resolve(response) :
        reject(rejectionMessage)
    })
  }

  function ensureUserSelected(clientId: string): Promise<{ client: Socket, user: Client }> {
    return ensureExists(
      () => clientManager.getUserByClientId(clientId),
      "select a user")
  }

  function ensureValidChatroom(chatroomName: string): Promise<Chatroom> {
    return ensureExists(
      () => chatroomManager.getChatroomByName(chatroomName) as unknown as Chatroom,
      "select a chatroom")
  }

  async function ensureUserSelectedAndChatroomValid(chatroomName: string) {
    const [socket, chatroom] = await Promise.all([
      ensureUserSelected(client.id),
      ensureValidChatroom(chatroomName)
    ])
    return await Promise.resolve({ chatroom, socket })
  }

  type SocketUser = { client: Socket, user: Client }

  async function handleEvent(chatroomName: string, createEntry: any) {
    const { chatroom, socket }: { chatroom: Chatroom, socket: SocketUser } = await ensureUserSelectedAndChatroomValid(chatroomName);
    const { client, user } = socket
    const entry = { socket: { client, user }, ...createEntry() }
    // console.log("handleEvent chatroom", chatroom)
    // console.log("handleEvent user", socket)
    // console.log("handleEvent entry", entry)
    if (typeof chatroom !== "string") {
      console.log("adding entry and broadcasting")
      chatroom.addEntry(entry)
      chatroom.broadcastMessage({ chat: chatroomName, ...entry })
    }

    return chatroom;
  }

  return handleEvent;

}
module.exports = function (client: any, clientManager: ClientManagerType, chatroomManager: ChatroomManagerType) {
  const handleEvent = makeHandleEvent(client, clientManager, chatroomManager);

  function handleRegister(user: Client, callback: any) {
    const now = Date.now()
    user.lastConnection = now;
    clientManager.registerClient(client, user)
    return callback(null, { socketId: client.id, user: user })
  }

  function handleJoin(chatroomName: string, user: Client, callback: any) {
    const createEntry = () => ({ event: `joined ${chatroomName}` })

    handleEvent(chatroomName, createEntry)
      .then((chatroom) => {
        console.log("handle join", chatroom)
        if (typeof chatroom !== "string") {

          const members = Array.from(chatroom.members.values())
          const member = members.some(element => element.client.id === client.id)

          if (!member) {
            chatroom.addMember(client, user)
          }
          callback(null, chatroom.getChatHistory())
        }
      })
      .catch(callback)
  }

  function handleLeave(chatroomName: string, callback: any) {
    const createEntry = () => ({ event: `left ${chatroomName}` })

    handleEvent(chatroomName, createEntry)
      .then(function (chatroom) {
        if (typeof chatroom !== "string")
          chatroom.removeMember(client.id)

        callback(null)
      })
      .catch(callback)
  }

  function handleMessage({ chatroomName, message }: { chatroomName: string, message: string }, callback: any) {
    const createEntry = () => ({ message })
    const chatroom = chatroomManager.getChatroomByName(chatroomName)
    handleEvent(chatroomName, createEntry)
      .then(() => callback("Ok"))
  }

  function handleGetChatrooms(_: any, callback: (arg0: null, arg1: { name: string; size: number }[]) => any) {
    return callback(null, chatroomManager.serializeChatrooms())
  }

  function handleCreateChatroom(chatroomName: string, { socketId, user }: { socketId: string, user: Client }, callback: any) {
    const chatroom = chatroomManager.addChatroom(chatroomName, client, user)
    return callback(null, chatroom);
  }

  function handleDisconnect() {
    // remove user profile
    clientManager.removeClient(client)
    // remove member from all chatrooms
    chatroomManager.removeClient(client)
  }

  return {
    handleRegister,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetChatrooms,
    handleCreateChatroom,
    handleDisconnect
  }
}