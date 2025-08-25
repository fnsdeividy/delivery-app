import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dados mock para desenvolvimento
    const mockMetrics = {
      totalProducts: 24,
      totalOrders: 156,
      pendingOrders: 8,
      todaySales: 1250.5,
      weekSales: 8750.0,
      lowStockProducts: 3,
      outOfStockProducts: 1,
    };

    // Simular variação baseada no slug para demonstrar funcionalidade
    const slugHash = slug
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (slugHash % 10) + 1;

    const metrics = {
      totalProducts: mockMetrics.totalProducts + variation,
      totalOrders: mockMetrics.totalOrders + variation * 5,
      pendingOrders: Math.max(1, mockMetrics.pendingOrders + (variation % 3)),
      todaySales: mockMetrics.todaySales + variation * 50,
      weekSales: mockMetrics.weekSales + variation * 200,
      lowStockProducts: Math.max(
        0,
        mockMetrics.lowStockProducts + (variation % 2)
      ),
      outOfStockProducts: Math.max(
        0,
        mockMetrics.outOfStockProducts + (variation % 2)
      ),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Erro na API de métricas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
