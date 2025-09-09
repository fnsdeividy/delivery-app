import { useState, useCallback, useMemo } from 'react';
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
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      
      // Para confirmPassword, validar apenas se já foi tocado e tem conteúdo
      if (fieldName === 'confirmPassword') {
        const password = (initialData as any).password;
        if (value && value !== password) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: 'A confirmação deve ser igual à senha.',
          }));
        } else if (value === password) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: '',
          }));
        }
        return;
      }
      
      const error = await validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || '',
      }));
    },
    [validateField, setFieldTouched, initialData]
  );

  // Validação em tempo real para confirmPassword quando password muda
  const validateFieldRealTime = useCallback(
    async (fieldName: string, value: any, relatedField?: string, relatedValue?: any) => {
      if (fieldName === 'password' && relatedField === 'confirmPassword' && touched.confirmPassword) {
        // Revalidar confirmPassword quando password muda
        if (relatedValue && relatedValue !== value) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: 'A confirmação deve ser igual à senha.',
          }));
        } else if (relatedValue === value) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: '',
          }));
        }
      }
    },
    [touched]
  );

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  }, []);

  // Limpar erro específico
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
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

  // Verificar se deve mostrar erro (campo tocado e com erro OU submetido)
  const shouldShowError = useCallback(
    (fieldName: string): boolean => {
      return (isFieldTouched(fieldName) || isSubmitted) && hasError(fieldName);
    },
    [isFieldTouched, hasError, isSubmitted]
  );

  return useMemo(() => ({
    // Estados
    errors,
    touched,
    isSubmitted,
    isValid: Object.keys(errors).length === 0,

    // Ações
    validateField,
    validateForm,
    setFieldTouched,
    handleFieldBlur,
    clearErrors,
    clearFieldError,
    validateFieldRealTime,
    setIsSubmitted,

    // Utilitários
    hasError,
    getFieldError,
    isFieldTouched,
    shouldShowError,
  }), [
    errors,
    touched,
    isSubmitted,
    validateField,
    validateForm,
    setFieldTouched,
    handleFieldBlur,
    clearErrors,
    clearFieldError,
    validateFieldRealTime,
    hasError,
    getFieldError,
    isFieldTouched,
    shouldShowError,
  ]);
}
