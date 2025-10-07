import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api/v1";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}

async function proxyRequest(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/stores/editar-loja${url.search}`;

    // Preparar headers para o backend
    const headers: HeadersInit = {};

    // Copiar headers relevantes da requisição original
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") {
        headers[key] = value;
      }
    });

    // Preparar body se existir
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      body = await request.text();
    }

    // Fazer requisição para o backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Preparar resposta para o cliente
    const responseBody = await response.text();

    // Criar nova resposta com os dados do backend
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copiar headers da resposta do backend
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        nextResponse.headers.set(key, value);
      }
    });

    return nextResponse;
  } catch (error) {
    console.error("Erro no proxy para editar-loja:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Falha ao conectar com o backend",
      },
      { status: 500 }
    );
  }
}
