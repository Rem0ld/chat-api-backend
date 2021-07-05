import { ClientManagerType, Client } from "../types";


module.exports = function (): ClientManagerType {
  const clients = new Map<string, Client>();

  function addClient(client: Client) {
    clients.set(client.id, client);
  }

  function removeClient(client: Client) {
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
  };
};
