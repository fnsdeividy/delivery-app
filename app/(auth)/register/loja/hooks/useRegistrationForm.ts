import { RegisterLojaFormData } from "@/lib/validation/schemas";
import { useState } from "react";

// Interface para resposta da API ViaCEP
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

export function useRegistrationForm() {
  const [formData, setFormData] = useState<RegisterLojaFormData>({
    // Dados do proprietário
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
    confirmPassword: "",

    // Dados da loja
    storeName: "",
    storeSlug: "",
    description: "",
    category: "",

    // Endereço
    address: "",
    city: "",
    state: "",
    zipCode: "",

    // Configurações iniciais
    deliveryEnabled: true,
    deliveryFee: 5.0,
    minimumOrder: 20.0,
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  // Função para consultar CEP na API ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setCepError("CEP deve conter 8 dígitos");
      return;
    }

    setIsLoadingCep(true);
    setCepError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }

      // Preencher campos automaticamente
      setFormData((prev) => ({
        ...prev,
        address: data.logradouro
          ? `${data.logradouro}, ${data.bairro}`
          : prev.address,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
    } catch (error) {
      setCepError("Erro ao consultar CEP. Tente novamente.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      let stringValue = String(value);

      // Aplicar máscara de CEP
      if (name === "zipCode") {
        stringValue = formatCep(stringValue);
        setCepError(null); // Limpar erro quando usuário digitar
      }

      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: stringValue,
        };

        return newData;
      });

      // Auto-gerar slug quando digitar nome da loja
      if (name === "storeName") {
        const slug = stringValue
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, "");

        setFormData((prev) => ({
          ...prev,
          storeSlug: slug,
        }));
      }

      // Consultar CEP automaticamente quando completo
      if (name === "zipCode") {
        const cleanCep = stringValue.replace(/\D/g, "");
        if (cleanCep.length === 8) {
          fetchAddressByCep(stringValue);
        }
      }
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    isLoadingCep,
    cepError,
    setCepError,
    fetchAddressByCep,
  };
}
