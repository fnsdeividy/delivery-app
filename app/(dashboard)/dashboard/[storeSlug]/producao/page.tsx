"use client";

import { ProductionDashboard } from "@/components/ProductionDashboard";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProducaoPage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  return (
    <div className="container mx-auto p-6">
      <ProductionDashboard
        storeSlug={storeSlug}
        selectedOrderId={selectedOrderId}
        onOrderSelect={setSelectedOrderId}
      />
    </div>
  );
}
