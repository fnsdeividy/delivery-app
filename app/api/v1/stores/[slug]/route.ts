import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Dados mock para desenvolvimento
    const storeInfo = {
      id: "1",
      name: `Loja ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
      description: `Descrição da loja ${slug}`,
      slug: slug,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        slug
      )}&background=3B82F6&color=fff&size=128`,
      banner: `https://picsum.photos/800/200?random=${slug.length}`,
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
    };

    return NextResponse.json(storeInfo);
  } catch (error) {
    console.error("Erro na API de loja:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
