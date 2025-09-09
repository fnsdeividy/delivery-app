import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { RegisterLojaFormData } from "@/lib/validation/schemas";
import { useFormValidation } from "@/hooks";
import { ownerSchema } from "@/lib/validation/schemas";
import { useEffect } from "react";

interface OwnerDataStepProps {
  formData: RegisterLojaFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  showConfirmPassword: boolean;
  onToggleConfirmPassword: () => void;
}

export default function OwnerDataStep({ 
  formData, 
  onInputChange, 
  showPassword, 
  onTogglePassword,
  showConfirmPassword,
  onToggleConfirmPassword
}: OwnerDataStepProps) {
  const ownerValidation = useFormValidation(ownerSchema, {
    ownerName: formData.ownerName,
    ownerEmail: formData.ownerEmail,
    ownerPhone: formData.ownerPhone,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });

  // Validação em tempo real quando password muda
  useEffect(() => {
    if (ownerValidation.isFieldTouched('confirmPassword')) {
      ownerValidation.validateFieldRealTime(
        'password',
        formData.password,
        'confirmPassword',
        formData.confirmPassword
      );
    }
  }, [formData.password, formData.confirmPassword, ownerValidation.isFieldTouched, ownerValidation.validateFieldRealTime]);

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-800">
          Nome completo *
        </label>
        <input
          type="text"
          name="ownerName"
          required
          value={
            typeof formData.ownerName === "string"
              ? formData.ownerName
              : ""
          }
          onChange={onInputChange}
          onBlur={() =>
            ownerValidation.handleFieldBlur(
              "ownerName",
              formData.ownerName
            )
          }
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            ownerValidation.shouldShowError("ownerName")
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }`}
          placeholder="Seu nome completo"
        />
        {ownerValidation.shouldShowError("ownerName") && (
          <p className="text-red-500 text-xs mt-1">
            {ownerValidation.getFieldError("ownerName")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Email *
        </label>
        <input
          type="email"
          name="ownerEmail"
          required
          value={
            typeof formData.ownerEmail === "string"
              ? formData.ownerEmail
              : ""
          }
          onChange={onInputChange}
          onBlur={() =>
            ownerValidation.handleFieldBlur(
              "ownerEmail",
              formData.ownerEmail
            )
          }
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            ownerValidation.shouldShowError("ownerEmail")
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }`}
          placeholder="seu@email.com"
        />
        {ownerValidation.shouldShowError("ownerEmail") && (
          <p className="text-red-500 text-xs mt-1">
            {ownerValidation.getFieldError("ownerEmail")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Telefone
        </label>
        <input
          type="tel"
          name="ownerPhone"
          value={
            typeof formData.ownerPhone === "string"
              ? formData.ownerPhone
              : ""
          }
          onChange={onInputChange}
          onBlur={() =>
            ownerValidation.handleFieldBlur(
              "ownerPhone",
              formData.ownerPhone
            )
          }
          className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
            ownerValidation.shouldShowError("ownerPhone")
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }`}
          placeholder="(11) 99999-9999"
        />
        {ownerValidation.shouldShowError("ownerPhone") && (
          <p className="text-red-500 text-xs mt-1">
            {ownerValidation.getFieldError("ownerPhone")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Senha *
        </label>
        <p className="text-xs text-gray-500 mt-1">Digite sua senha</p>
        <div className="mt-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={
              typeof formData.password === "string"
                ? formData.password
                : ""
            }
            onChange={(e) => {
              onInputChange(e);
              // Revalidar confirmPassword se já foi tocado
              if (ownerValidation.isFieldTouched('confirmPassword')) {
                ownerValidation.validateFieldRealTime(
                  'password',
                  e.target.value,
                  'confirmPassword',
                  formData.confirmPassword
                );
              }
            }}
            onBlur={() =>
              ownerValidation.handleFieldBlur(
                "password",
                formData.password
              )
            }
            className={`block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              ownerValidation.shouldShowError("password")
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Digite sua senha"
            aria-invalid={ownerValidation.shouldShowError("password")}
            aria-describedby={ownerValidation.shouldShowError("password") ? "password-error" : undefined}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onTogglePassword}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeSlash className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {ownerValidation.shouldShowError("password") && (
          <p id="password-error" className="text-red-500 text-xs mt-1">
            {ownerValidation.getFieldError("password")}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800">
          Confirmar senha *
        </label>
        <p className="text-xs text-gray-500 mt-1">Confirme sua senha</p>
        <div className="mt-1 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            value={
              typeof formData.confirmPassword === "string"
                ? formData.confirmPassword
                : ""
            }
            onChange={onInputChange}
            onBlur={() => {
              // Só validar se o campo tem conteúdo ou se já foi submetido
              if (formData.confirmPassword || ownerValidation.isSubmitted) {
                ownerValidation.handleFieldBlur(
                  "confirmPassword",
                  formData.confirmPassword
                );
              } else {
                // Apenas marcar como tocado sem validar
                ownerValidation.setFieldTouched('confirmPassword');
              }
            }}
            className={`block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
              ownerValidation.shouldShowError("confirmPassword")
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Confirme sua senha"
            aria-invalid={ownerValidation.shouldShowError("confirmPassword")}
            aria-describedby={ownerValidation.shouldShowError("confirmPassword") ? "confirm-password-error" : undefined}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onToggleConfirmPassword}
            aria-pressed={showConfirmPassword}
            aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
          >
            {showConfirmPassword ? (
              <EyeSlash className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {ownerValidation.shouldShowError("confirmPassword") && (
          <p id="confirm-password-error" className="text-red-500 text-xs mt-1">
            {ownerValidation.getFieldError("confirmPassword")}
          </p>
        )}
      </div>
    </form>
  );
}
