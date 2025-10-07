"use client";

import { useParams } from "next/navigation";

export default function TestRoute() {
  const params = useParams();

  return (
    <div className="p-4">
      <h1>Teste de Rota Dinâmica</h1>
      <p>Parâmetros: {JSON.stringify(params)}</p>
      <p>StoreSlug: {params?.storeSlug || "não definido"}</p>
    </div>
  );
}
