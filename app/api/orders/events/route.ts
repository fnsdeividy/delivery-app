import { addConnection, removeConnection } from "@/lib/sse-notifications";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeSlug = searchParams.get("storeSlug");
  const userId = searchParams.get("userId");

  if (!storeSlug || !userId) {
    return new Response("Missing storeSlug or userId", { status: 400 });
  }

  const connectionId = `${storeSlug}-${userId}`;

  // Criar stream SSE
  const stream = new ReadableStream({
    start(controller) {
      // Armazenar conexão
      addConnection(connectionId, controller);

      // Enviar mensagem de conexão estabelecida
      const data = JSON.stringify({
        type: "connected",
        message: "Conexão estabelecida",
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(`data: ${data}\n\n`);

      // Enviar heartbeat a cada 30 segundos
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(`data: ${heartbeatData}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          removeConnection(connectionId);
        }
      }, 30000);

      // Cleanup quando a conexão for fechada
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeConnection(connectionId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
