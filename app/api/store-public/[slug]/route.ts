import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Chamar o backend real usando variável de ambiente
    const backendUrl =
      process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001/api/v1";
    const response = await fetch(`${backendUrl}/stores/public/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Loja não encontrada",
            message: `A loja "${slug}" não foi encontrada`,
          },
          { status: 404 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Loja indisponível",
            message: "Esta loja está temporariamente indisponível",
          },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Erro do servidor",
            message: "Falha ao buscar dados da loja",
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar loja pública:", error);

    // Se for erro de timeout
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Timeout",
          message: "Tempo limite excedido ao buscar dados da loja",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Falha ao buscar dados da loja",
      },
      { status: 500 }
    );
  }
}
