import { RegisterLojaFormData } from "@/lib/validation/schemas";
import { useFormValidation } from "@/hooks";
import { storeSchema } from "@/lib/validation/schemas";
import AddressForm from "./AddressForm";

interface StoreDataStepProps {
  formData: RegisterLojaFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  categories: string[];
  isLoadingCep: boolean;
  cepError: string | null;
  onFetchAddress: (cep: string) => Promise<void>;
  isSubmitted?: boolean;
}

export default function StoreDataStep({ 
  formData, 
  onInputChange, 
  categories,
  isLoadingCep,
  cepError,
  onFetchAddress,
  isSubmitted = false
}: StoreDataStepProps) {
  const storeValidation = useFormValidation(storeSchema, {
    storeName: formData.storeName,
    storeSlug: formData.storeSlug,
    description: formData.description,
    category: formData.category,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
  });
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-800">
          Nome da loja *
        </label>
        <p className="text-xs text-gray-500 mt-1">Usaremos este nome para gerar a URL da loja.</p>
        <input
          type="text"
          name="storeName"
          required
          value={
            typeof formData.storeName === "string"
              ? formData.storeName
              : ""
          }
          onChange={onInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          placeholder="Ex: Pizzaria do João"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          URL da loja *
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            cardap.io/store/
          </span>
          <input
            type="text"
            name="storeSlug"
            required
            value={
              typeof formData.storeSlug === "string"
                ? formData.storeSlug
                : ""
            }
            onChange={onInputChange}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            placeholder="pizzaria-do-joao"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Gerada automaticamente a partir do nome. Você poderá ajustar o slug.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Categoria *
        </label>
        <select
          name="category"
          required
          value={
            typeof formData.category === "string"
              ? formData.category
              : ""
          }
          onChange={onInputChange}
          onBlur={() =>
            storeValidation.handleFieldBlur(
              "category",
              formData.category
            )
          }
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            (storeValidation.shouldShowError("category") || (isSubmitted && !formData.category))
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          aria-invalid={(storeValidation.shouldShowError("category") || (isSubmitted && !formData.category))}
          aria-describedby={(storeValidation.shouldShowError("category") || (isSubmitted && !formData.category)) ? "category-error" : undefined}
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {(storeValidation.shouldShowError("category") || (isSubmitted && !formData.category)) && (
          <p id="category-error" className="mt-1 text-xs text-red-500">
            Categoria é obrigatória.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Descrição
        </label>
        <textarea
          name="description"
          rows={3}
          value={
            typeof formData.description === "string"
              ? formData.description
              : ""
          }
          onChange={onInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          placeholder="Descreva sua loja…"
        />
      </div>

      <AddressForm
        formData={formData}
        onInputChange={onInputChange}
        isLoadingCep={isLoadingCep}
        cepError={cepError}
        onFetchAddress={onFetchAddress}
        isSubmitted={isSubmitted}
      />
    </form>
  );
}
