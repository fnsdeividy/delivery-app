import { RegisterLojaFormData } from "@/lib/validation/schemas";

interface ConfirmationStepProps {
  formData: RegisterLojaFormData;
}

export default function ConfirmationStep({ formData }: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-green-800 mb-2">
          Quase pronto! 🎉
        </h3>
        <p className="text-green-700 text-sm">
          Revise os dados abaixo e confirme a criação da sua loja.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Proprietário</h4>
          <p className="text-sm text-gray-600">
            {typeof formData.ownerName === "string"
              ? formData.ownerName
              : ""}
          </p>
          <p className="text-sm text-gray-600">
            {typeof formData.ownerEmail === "string"
              ? formData.ownerEmail
              : ""}
          </p>
          {formData.ownerPhone ? (
            <p className="text-sm text-gray-600">
              {typeof formData.ownerPhone === "string"
                ? formData.ownerPhone
                : ""}
            </p>
          ) : null}
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Loja</h4>
          <p className="text-sm text-gray-600">
            {typeof formData.storeName === "string"
              ? formData.storeName
              : ""}
          </p>
          <p className="text-sm text-gray-500">
            {typeof formData.storeSlug === "string"
              ? formData.storeSlug
              : ""}
          </p>
          <p className="text-sm text-gray-600">
            {typeof formData.category === "string"
              ? formData.category
              : ""}
          </p>
          {Boolean(formData.description) && (
            <p className="text-sm text-gray-500 italic">
              {formData.description ? String(formData.description) : ""}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Endereço</h4>
          <p className="text-sm text-gray-600">
            {typeof formData.address === "string"
              ? formData.address
              : ""}
          </p>
          <p className="text-sm text-gray-600">
            {typeof formData.city === "string" ? formData.city : ""} -{" "}
            {typeof formData.state === "string" ? formData.state : ""}
          </p>
          <p className="text-sm text-gray-600">
            {typeof formData.zipCode === "string" ||
            typeof formData.zipCode === "number"
              ? String(formData.zipCode)
              : ""}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Configurações</h4>
          <p className="text-sm text-gray-600">
            Entrega:{" "}
            {formData.deliveryEnabled ? "Ativada" : "Desativada"}
          </p>
          {formData.deliveryEnabled && (
            <>
              <p className="text-sm text-gray-600">
                Taxa de entrega: R${" "}
                {(() => {
                  const fee =
                    typeof formData.deliveryFee === "number"
                      ? formData.deliveryFee
                      : typeof formData.deliveryFee === "string"
                      ? parseFloat(formData.deliveryFee)
                      : 0;
                  return !isNaN(fee) ? fee.toFixed(2) : "0.00";
                })()}
              </p>
              <p className="text-sm text-gray-600">
                Pedido mínimo: R${" "}
                {(() => {
                  const minOrder =
                    typeof formData.minimumOrder === "number"
                      ? formData.minimumOrder
                      : typeof formData.minimumOrder === "string"
                      ? parseFloat(formData.minimumOrder)
                      : 0;
                  return !isNaN(minOrder)
                    ? minOrder.toFixed(2)
                    : "0.00";
                })()}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          Próximos passos
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            🏠 Será redirecionado para a página inicial como usuário logado
          </li>
          <li>🏪 Poderá acessar o dashboard para configurar produtos</li>
          <li>🎨 Personalizar cores e logo da loja</li>
          <li>📱 Configurar horários de funcionamento</li>
          <li>💳 Configurar métodos de pagamento</li>
        </ul>
      </div>
    </div>
  );
}
