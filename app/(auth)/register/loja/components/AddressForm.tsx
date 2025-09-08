import { RegisterLojaFormData } from "@/lib/validation/schemas";
import { useFormValidation } from "@/hooks";
import { storeSchema } from "@/lib/validation/schemas";
import { useState } from "react";

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
  isSubmitted?: boolean;
}

export default function AddressForm({ 
  formData, 
  onInputChange, 
  isLoadingCep, 
  cepError,
  onFetchAddress,
  isSubmitted = false
}: AddressFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const addressValidation = useFormValidation(storeSchema, {
    storeName: formData.storeName,
    storeSlug: formData.storeSlug,
    description: formData.description,
    category: formData.category,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    number: formData.number,
  });

  // Função para formatar CEP com máscara 00000-000
  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  // Função para formatar estado como UF (maiúsculas)
  const formatState = (value: string) => {
    return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
  };

  // Função para permitir apenas dígitos no número
  const formatNumber = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCep(value);
    
    // Preservar o CEP formatado no estado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "zipCode",
        value: formattedValue
      }
    };
    
    onInputChange(syntheticEvent);

    // Consultar CEP automaticamente quando completo (8 dígitos)
    const cleanCep = formattedValue.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        // Fazer lookup no ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data: ViaCepResponse = await response.json();
        
        if (!data.erro && data.logradouro) {
          // Preencher campos automaticamente SEM apagar o CEP
          const addressEvent = {
            target: { name: "address", value: `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}` }
          } as React.ChangeEvent<HTMLInputElement>;
          
          const cityEvent = {
            target: { name: "city", value: data.localidade }
          } as React.ChangeEvent<HTMLInputElement>;
          
          const stateEvent = {
            target: { name: "state", value: data.uf }
          } as React.ChangeEvent<HTMLInputElement>;

          onInputChange(addressEvent);
          onInputChange(cityEvent);
          onInputChange(stateEvent);
        }
      } catch (error) {
        // Erro silencioso - não limpa campos já preenchidos
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatState(value);
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
    
    onInputChange(syntheticEvent);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir digitação livre - não filtrar durante onChange
    onInputChange(e);
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatNumber(value);
    
    // Aplicar filtro apenas no blur se o valor mudou
    if (value !== formattedValue) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: "number",
          value: formattedValue
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onInputChange(syntheticEvent);
    }
    
    // Executar validação
    handleFieldBlur("number");
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    addressValidation.handleFieldBlur(fieldName, (formData as any)[fieldName]);
  };

  const shouldShowError = (fieldName: string) => {
    return (touched[fieldName] || isSubmitted) && addressValidation.hasError(fieldName);
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Endereço da Loja
      </h3>
      
      {/* CEP */}
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
            onBlur={() => handleFieldBlur("zipCode")}
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              cepError || shouldShowError("zipCode")
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="00000-000"
            maxLength={9}
            aria-invalid={!!(cepError || shouldShowError("zipCode"))}
            aria-describedby={cepError || shouldShowError("zipCode") ? "cep-error" : undefined}
          />
          {isLoadingCep && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {(cepError || shouldShowError("zipCode")) && (
          <p id="cep-error" className="text-red-500 text-xs mt-1">
            {cepError || addressValidation.getFieldError("zipCode")}
          </p>
        )}
        {!cepError &&
          !isLoadingCep &&
          !shouldShowError("zipCode") &&
          (typeof formData.zipCode === "string" ||
            typeof formData.zipCode === "number") &&
          formData.zipCode && (
            <p className="text-green-600 text-xs mt-1">
              Digite o CEP completo para preencher o endereço automaticamente
            </p>
          )}
      </div>

      {/* Endereço */}
      <div className="mt-4">
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
          onBlur={() => handleFieldBlur("address")}
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            shouldShowError("address")
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          placeholder="Rua, avenida, travessa..."
          aria-invalid={shouldShowError("address")}
          aria-describedby={shouldShowError("address") ? "address-error" : undefined}
        />
        {shouldShowError("address") && (
          <p id="address-error" className="text-red-500 text-xs mt-1">
            {addressValidation.getFieldError("address")}
          </p>
        )}
      </div>

      {/* Número do Estabelecimento */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-800">
          Número *
        </label>
        <input
          type="text"
          name="number"
          required
          value={
            typeof formData.number === "string" ||
            typeof formData.number === "number"
              ? String(formData.number)
              : ""
          }
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            shouldShowError("number")
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          placeholder="123"
          inputMode="numeric"
          aria-invalid={shouldShowError("number")}
          aria-describedby={shouldShowError("number") ? "number-error" : undefined}
        />
        {shouldShowError("number") && (
          <p id="number-error" className="text-red-500 text-xs mt-1">
            {addressValidation.getFieldError("number")}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Apenas números são permitidos
        </p>
      </div>

      {/* Cidade e Estado */}
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
            onBlur={() => handleFieldBlur("city")}
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              shouldShowError("city")
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Sua cidade"
            aria-invalid={shouldShowError("city")}
            aria-describedby={shouldShowError("city") ? "city-error" : undefined}
          />
          {shouldShowError("city") && (
            <p id="city-error" className="text-red-500 text-xs mt-1">
              {addressValidation.getFieldError("city")}
            </p>
          )}
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
            onChange={handleStateChange}
            onBlur={() => handleFieldBlur("state")}
            className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              shouldShowError("state")
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="SP, RJ, MG..."
            maxLength={2}
            aria-invalid={shouldShowError("state")}
            aria-describedby={shouldShowError("state") ? "state-error" : undefined}
          />
          {shouldShowError("state") && (
            <p id="state-error" className="text-red-500 text-xs mt-1">
              {addressValidation.getFieldError("state")}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Digite apenas a sigla (ex: SP, RJ, MG)
          </p>
        </div>
      </div>
    </div>
  );
}
