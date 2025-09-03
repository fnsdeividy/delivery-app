import { RegisterLojaFormData } from "@/lib/validation/schemas";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface AddressFormProps {
  formData: RegisterLojaFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isLoadingCep: boolean;
  cepError: string | null;
  onFetchAddress: (cep: string) => Promise<void>;
}

export default function AddressForm({ 
  formData, 
  onInputChange, 
  isLoadingCep, 
  cepError,
  onFetchAddress 
}: AddressFormProps) {
  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCep(value);
    
    // Criar evento sintético com valor formatado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
    
    onInputChange(syntheticEvent);

    // Consultar CEP automaticamente quando completo
    const cleanCep = formattedValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      onFetchAddress(formattedValue);
    }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Endereço da Loja
      </h3>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-800">
          CEP
        </label>
        <div className="relative">
          <input
            type="text"
            name="zipCode"
            value={
              typeof formData.zipCode === "string" ||
              typeof formData.zipCode === "number"
                ? String(formData.zipCode)
                : ""
            }
            onChange={handleCepChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              cepError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            placeholder="00000-000"
            maxLength={9}
          />
          {isLoadingCep && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {cepError && (
          <p className="text-red-500 text-xs mt-1">
            {String(cepError)}
          </p>
        )}
        {!cepError &&
          !isLoadingCep &&
          (typeof formData.zipCode === "string" ||
            typeof formData.zipCode === "number") &&
          formData.zipCode && (
            <p className="text-green-600 text-xs mt-1">
              Digite o CEP completo para preencher o endereço
              automaticamente
            </p>
          )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Endereço *
        </label>
        <input
          type="text"
          name="address"
          required
          value={
            typeof formData.address === "string"
              ? formData.address
              : ""
          }
          onChange={onInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          placeholder="Rua, número, bairro"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Cidade *
          </label>
          <input
            type="text"
            name="city"
            required
            value={
              typeof formData.city === "string" ? formData.city : ""
            }
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            placeholder="Sua cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800">
            Estado *
          </label>
          <input
            type="text"
            name="state"
            required
            value={
              typeof formData.state === "string" ? formData.state : ""
            }
            onChange={onInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            placeholder="SP, RJ, MG..."
            maxLength={2}
          />
          <p className="mt-1 text-xs text-gray-500">
            Digite apenas a sigla (ex: SP, RJ, MG)
          </p>
        </div>
      </div>
    </div>
  );
}
