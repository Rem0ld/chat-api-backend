import { ChatroomManagerType, Client, ClientManagerType } from "../types"
import Chatroom from "./chatroom"

function makeHandleEvent(client: Client, clientManager: ClientManagerType, chatroomManager: ChatroomManagerType) {

  function ensureExists(getter: () => any, rejectionMessage: string): any {
    return new Promise((resolve, reject) => {
      const response = getter()
      return response ?
        resolve(response) :
        reject(rejectionMessage)
    })
  }

  function ensureUserSelected(clientId: string): Promise<Client | string> {
    return ensureExists(
      () => clientManager.getUserByClientId(clientId),
      "select a user")
  }

  function ensureValidChatroom(chatroomName: string): Promise<Chatroom | string> {
    return ensureExists(
      () => chatroomManager.getChatroomByName(chatroomName) as Chatroom,
      "select a chatroom")
  }

  async function ensureUserSelectedAndChatroomValid(chatroomName: string) {
    console.log("ensure user is selected", client.id)
    const [user, chatroom] = await Promise.all([
      ensureUserSelected(client.id),
      ensureValidChatroom(chatroomName)
    ])
    return await Promise.resolve({ chatroom, user })
  }

  async function handleEvent(chatroomName: string, createEntry: any) {
    const { chatroom, user } = await ensureUserSelectedAndChatroomValid(chatroomName)
    const entry = { user, ...createEntry() }
    if (typeof chatroom !== "string") {
      chatroom.addEntry(entry)
      chatroom.broadcastMessage({ chat: chatroomName, ...entry })
    }

    return chatroom;
  }

  return handleEvent;

}
module.exports = function (client: any, clientManager: ClientManagerType, chatroomManager: ChatroomManagerType) {
  const handleEvent = makeHandleEvent(client, clientManager, chatroomManager);

  function handleRegister(connection: any, callback: any) {
    const now = Date.now()
    // connection.lastConnection = now;
    // client = connection;
    clientManager.addClient(client)
    return callback(null, connection)
  }

  function handleJoin(chatroomName: string, callback: any) {
    const createEntry = () => ({ event: `joined ${chatroomName}` })

    handleEvent(chatroomName, createEntry)
      .then((chatroom) => {
        if (typeof chatroom !== "string") {

          const members = Array.from(chatroom.members.values())
          const member = members.some(element => element.id === client.id)

          if (!member) {
            chatroom.addMember(client)
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

  function handleCreateChatroom(chatroomName: string, user: Client, callback: any) {
    const chatroom = chatroomManager.addChatroom(chatroomName, user)
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