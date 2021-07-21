import { Socket } from "socket.io"
import { IChatroomManager, IChatroom, IClientManager, SocketUser, User } from "../types"
import Chatroom from "./chatroom"

function makeHandleEvent(client: Socket, clientManager: IClientManager, chatroomManager: IChatroomManager) {

  function ensureExists(getter: () => any, rejectionMessage: string): any {
    return new Promise((resolve, reject) => {
      const response = getter()
      return response ?
        resolve(response) :
        reject(rejectionMessage)
    })
  }

  function ensureUserSelected(clientId: string): Promise<{ client: Socket, user: User }> {
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

  async function handleEvent(chatroomName: string, createEntry: any) {
    const { chatroom, socket }: { chatroom: Chatroom, socket: SocketUser } = await ensureUserSelectedAndChatroomValid(chatroomName);
    const { client, user } = socket
    const entry = { socket: { client, user }, ...createEntry() }
    // console.log("handleEvent chatroom", chatroom)
    // console.log("handleEvent user", socket)
    // console.log("handleEvent entry", entry)
    if (chatroom) {
      console.log("adding entry and broadcasting")
      chatroom.addEntry(entry)
      chatroom.broadcastMessage(entry)
    }

    return chatroom;
  }

  return handleEvent;

}
module.exports = function (client: any, clientManager: IClientManager, chatroomManager: IChatroomManager) {
  const handleEvent = makeHandleEvent(client, clientManager, chatroomManager);

  function handleRegister(user: User, callback: any) {
    const now = Date.now()
    user.lastConnection = now;
    clientManager.registerClient(client, user)
    return callback(null, { socketId: client.id, user: user })
  }

  function handleJoin(chatroomName: string, user: User, callback: any) {
    const createEntry = () => ({ message: `${user.username} joined ${chatroomName}`, type: "event" })

    handleEvent(chatroomName, createEntry)
      .then((chatroom) => {
        console.log("handle join", chatroom)
        if (chatroom) {

          const members = Array.from(chatroom.members.values())
          const member = members.some(element => element.client.id === client.id)

          if (!member) {
            chatroom.addMember(client, user)
          }
          callback(null, chatroom.getChatHistory())
        }
      })
      .catch(error => console.error(error))
  }

  function handleLeave(chatroomName: string, user: User, callback: any) {
    const createEntry = () => ({ message: `${user.username} left ${chatroomName}`, type: "event" })

    handleEvent(chatroomName, createEntry)
      .then(function (chatroom) {
        if (typeof chatroom !== "string")
          chatroom.removeMember(client.id)

        callback(null)
      })
    // .catch(callback)
  }

  function handleMessage({ chatroomName, message }: { chatroomName: string, message: string }, callback: any) {
    const createEntry = () => ({ message, type: "message" })
    const chatroom = chatroomManager.getChatroomByName(chatroomName)
    handleEvent(chatroom?.name as string, createEntry)
      .then(() => callback())
  }

  function handleGetChatrooms(_: any, callback: (arg0: null, arg1: { name: string; size: number }[]) => any) {
    return callback(null, chatroomManager.serializeChatrooms())
  }

  function handleCreateChatroom(chatroomName: string, user: User, callback: any) {
    let chatroom: Chatroom | undefined;
    try {
      chatroom = chatroomManager.addChatroom(chatroomName, client, user)
    } catch (error) {
      return callback(error.message, undefined);
    }
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