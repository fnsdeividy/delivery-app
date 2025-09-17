import { NextRequest } from 'next/server';

// Store para gerenciar conexões SSE
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeSlug = searchParams.get('storeSlug');
  const userId = searchParams.get('userId');

  if (!storeSlug || !userId) {
    return new Response('Missing storeSlug or userId', { status: 400 });
  }

  const connectionId = `${storeSlug}-${userId}`;

  // Criar stream SSE
  const stream = new ReadableStream({
    start(controller) {
      // Armazenar conexão
      connections.set(connectionId, controller);

      // Enviar mensagem de conexão estabelecida
      const data = JSON.stringify({
        type: 'connected',
        message: 'Conexão estabelecida',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(`data: ${data}\n\n`);

      // Enviar heartbeat a cada 30 segundos
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(`data: ${heartbeatData}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(connectionId);
        }
      }, 30000);

      // Cleanup quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(connectionId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Função para notificar sobre novos pedidos
export function notifyNewOrder(storeSlug: string, orderData: any) {
  const connectionId = `${storeSlug}-*`; // Notificar todos os usuários da loja
  
  for (const [id, controller] of connections.entries()) {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: 'new_order',
          order: orderData,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        // Remover conexão inválida
        connections.delete(id);
      }
    }
  }
}

// Função para notificar sobre atualizações de pedidos
export function notifyOrderUpdate(storeSlug: string, orderId: string, orderData: any) {
  const connectionId = `${storeSlug}-*`;
  
  for (const [id, controller] of connections.entries()) {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: 'order_update',
          orderId,
          order: orderData,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(id);
      }
    }
  }
}

// Função para notificar sobre cancelamento de pedidos
export function notifyOrderCancel(storeSlug: string, orderId: string) {
  const connectionId = `${storeSlug}-*`;
  
  for (const [id, controller] of connections.entries()) {
    if (id.startsWith(`${storeSlug}-`)) {
      try {
        const data = JSON.stringify({
          type: 'order_cancel',
          orderId,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(id);
      }
    }
  }
}