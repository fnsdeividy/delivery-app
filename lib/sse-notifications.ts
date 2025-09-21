// Store para gerenciar conexões SSE
const connections = new Map<string, ReadableStreamDefaultController>();

// Função para notificar sobre novos pedidos
export function notifyNewOrder(storeSlug: string, orderData: any) {
  Array.from(connections.entries()).forEach(([id, controller]) => {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: "new_order",
          order: orderData,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        // Remover conexão inválida
        connections.delete(id);
      }
    }
  });
}

// Função para notificar sobre atualizações de pedidos
export function notifyOrderUpdate(
  storeSlug: string,
  orderId: string,
  orderData: any
) {
  Array.from(connections.entries()).forEach(([id, controller]) => {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: "order_update",
          orderId,
          order: orderData,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(id);
      }
    }
  });
}

// Função para notificar sobre cancelamento de pedidos
export function notifyOrderCancel(storeSlug: string, orderId: string) {
  Array.from(connections.entries()).forEach(([id, controller]) => {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: "order_cancel",
          orderId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(id);
      }
    }
  });
}

// Função para adicionar conexão
export function addConnection(
  connectionId: string,
  controller: ReadableStreamDefaultController
) {
  connections.set(connectionId, controller);
}

// Função para remover conexão
export function removeConnection(connectionId: string) {
  connections.delete(connectionId);
}

// Função para obter todas as conexões
export function getConnections() {
  return connections;
}
