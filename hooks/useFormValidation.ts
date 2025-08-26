import { useState, useCallback } from 'react';
import { ValidationError } from 'yup';

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: any,
  initialData: T
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validar campo específico
  const validateField = useCallback(
    async (fieldName: string, value: any): Promise<string | null> => {
      try {
        await schema.validateAt(fieldName, { [fieldName]: value });
        return null;
      } catch (error) {
        if (error instanceof ValidationError) {
          return error.message;
        }
        return 'Erro de validação';
      }
    },
    [schema]
  );

  // Validar formulário completo
  const validateForm = useCallback(
    async (data: T): Promise<ValidationState> => {
      try {
        await schema.validate(data, { abortEarly: false });
        setErrors({});
        return { errors: {}, isValid: true };
      } catch (error) {
        if (error instanceof ValidationError) {
          const newErrors: Record<string, string> = {};
          error.inner.forEach((err) => {
            if (err.path) {
              newErrors[err.path] = err.message;
            }
          });
          setErrors(newErrors);
          return { errors: newErrors, isValid: false };
        }
        return { errors: {}, isValid: false };
      }
    },
    [schema]
  );

  // Marcar campo como tocado
  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  // Validar e marcar campo como tocado
  const handleFieldBlur = useCallback(
    async (fieldName: string, value: any) => {
      setFieldTouched(fieldName);
      const error = await validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || '',
      }));
    },
    [validateField, setFieldTouched]
  );

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Verificar se campo tem erro
  const hasError = useCallback(
    (fieldName: string): boolean => {
      return !!errors[fieldName];
    },
    [errors]
  );

  // Obter mensagem de erro do campo
  const getFieldError = useCallback(
    (fieldName: string): string => {
      return errors[fieldName] || '';
    },
    [errors]
  );

  // Verificar se campo foi tocado
  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return !!touched[fieldName];
    },
    [touched]
  );

  // Verificar se deve mostrar erro (campo tocado e com erro)
  const shouldShowError = useCallback(
    (fieldName: string): boolean => {
      return isFieldTouched(fieldName) && hasError(fieldName);
    },
    [isFieldTouched, hasError]
  );

  return {
    // Estados
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,

    // Ações
    validateField,
    validateForm,
    setFieldTouched,
    handleFieldBlur,
    clearErrors,

    // Utilitários
    hasError,
    getFieldError,
    isFieldTouched,
    shouldShowError,
  };
}
