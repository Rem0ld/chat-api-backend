import { Socket } from "socket.io"
import { IChatroomManager, IChatroom, IClientManager, SocketUser, User, TEntry, TSerializedChatroom } from "../types"
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
    const entry: TEntry = { user, ...createEntry() }
    if (chatroom) {
      chatroom.addEntry(entry)
      chatroom.broadcastMessage(entry)
    }
    return chatroom;
  }
  return handleEvent;
}

module.exports = function (client: any, clientManager: IClientManager, chatroomManager: IChatroomManager) {
  const handleEvent = makeHandleEvent(client, clientManager, chatroomManager);

  function handleRegister({ user }: { user: User }, callback: any) {
    user.lastConnection = Date.now();
    clientManager.registerClient(client, user)
    return callback(null, { socketId: client.id, user: user })
  }

  function handleJoin(chatroomName: string, user: User, callback: any) {
    // const createEntry = () => ({ message: `${user.username} joined ${chatroomName}`, type: "event", timestamp: Date.now() })

    // handleEvent(chatroomName, createEntry)
    //   .then((chatroom) => {
    //     console.log("handle join", chatroom)
    //     if (chatroom) {

    //       const members = Array.from(chatroom.members.values())
    //       const member = members.some(element => element.client.id === client.id)

    //       if (!member) {
    //         chatroom.addMember(client, user)
    //       }
    //       callback(null, chatroom.getChatHistory())
    //     }
    //   })
    //   .catch(error => console.error(error))
    const chatroom = chatroomManager.getChatroomByName(chatroomName);
    if (chatroom) {

      const members = Array.from(chatroom.members.values())
      const member = members.some(element => element.client.id === client.id)

      if (!member) {
        chatroom.addMember(client, user)
      }

      chatroom.broadcastMembers();

      const data = {
        chat: chatroom.getChatHistory(),
        listUserConnected: chatroom.getMembers()
      }
      callback(null, data)
    } else {
      callback(new Error("chatroom doesn't exist"), null)
    }
  }

  function handleLeave(chatroomName: string, user: User, callback: any) {
    // const createEntry = () => ({ message: `${user.username} left ${chatroomName}`, type: "event", timestamp: Date.now() })

    // handleEvent(chatroomName, createEntry)
    //   .then(function (chatroom) {
    //     if (chatroom)
    //       chatroom.removeMember(client.id)

    //     // At the moment there is no reason to use this callback
    //     // callback(null)
    //   })
    // .catch(callback)

    const chatroom = chatroomManager.getChatroomByName(chatroomName);
    if (chatroom) {
      chatroom.removeMember(client);
      chatroom.broadcastMembers();
      // callback()
    }
  }

  function handleMessage({ chatroomName, message }: { chatroomName: string, message: string }, callback: any) {
    const createEntry = () => ({ message, type: "message", timestamp: Date.now() })
    const chatroom = chatroomManager.getChatroomByName(chatroomName)
    handleEvent(chatroom?.name as string, createEntry)
      .then(() => callback())
  }

  function handleGetChatrooms(_: any, callback: (arg0: Error | string | null, arg1: { name: string; size: number }[]) => any) {
    return callback(null, chatroomManager.serializeChatrooms())
  }

  function handleCreateChatroom(chatroomName: string, { user }: { user: User }, callback: any) {
    if (chatroomManager.getChatroomByName(chatroomName)) {
      return callback(`${chatroomName} already exist!`, {});
    }
    console.log(user)
    let chatroom: Chatroom = chatroomManager.addChatroom(chatroomName, client, user) as Chatroom;
    console.log(chatroom.serialize());
    return callback(null, chatroomManager.serializeChatrooms());
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