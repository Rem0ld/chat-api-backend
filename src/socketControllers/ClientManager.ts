import { Socket } from "socket.io";
import { ClientManagerType, Client } from "../types";




module.exports = function (): ClientManagerType {
  const clients = new Map<string, { client: Socket, user: Client | undefined }>();

  function registerClient(client: Socket, user: Client) {
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
