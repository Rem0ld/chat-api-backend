import { Socket } from "socket.io";
import { IClientManager, User } from "../types";




module.exports = function (): IClientManager {
  const clients = new Map<string, { client: Socket, user: User | undefined }>();

  function registerClient(client: Socket, user: User) {
    clients.set(client.id, { client, user })
  }

  function addClient(client: Socket) {
    clients.set(client.id, { client, user: undefined });
  }

  function removeClient(client: Socket) {
    clients.delete(client.id);
  }

  function getUserByClientId(clientId: string) {
    return clients.get(clientId) || {};
  }

  function getAllClients() {
    return Array.from(clients.values());
  }

  return {
    addClient,
    removeClient,
    getUserByClientId,
    getAllClients,
    registerClient,
  };
};
