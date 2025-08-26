import * as yup from 'yup';

// Schema para login
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email deve ser válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
});

// Schema para dados do proprietário (Step 1)
export const ownerSchema = yup.object({
  ownerName: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .required('Nome é obrigatório'),
  ownerEmail: yup
    .string()
    .email('Email deve ser válido')
    .required('Email é obrigatório'),
  ownerPhone: yup
    .string()
    .matches(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/, 'Telefone deve ser válido (ex: (11) 99999-9999)')
    .optional(),
  password: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
    .required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Senhas devem ser iguais')
    .required('Confirmação de senha é obrigatória'),
});

// Schema para dados da loja (Step 2)
export const storeSchema = yup.object({
  storeName: yup
    .string()
    .min(3, 'Nome da loja deve ter pelo menos 3 caracteres')
    .max(100, 'Nome da loja deve ter no máximo 100 caracteres')
    .required('Nome da loja é obrigatório'),
  storeSlug: yup
    .string()
    .min(3, 'URL da loja deve ter pelo menos 3 caracteres')
    .max(50, 'URL da loja deve ter no máximo 50 caracteres')
    .matches(/^[a-z0-9-]+$/, 'URL deve conter apenas letras minúsculas, números e hífens')
    .required('URL da loja é obrigatória'),
  description: yup
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  category: yup
    .string()
    .required('Categoria é obrigatória'),
  address: yup
    .string()
    .min(10, 'Endereço deve ter pelo menos 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .required('Endereço é obrigatório'),
  city: yup
    .string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .required('Cidade é obrigatória'),
  state: yup
    .string()
    .min(2, 'Estado deve ter pelo menos 2 caracteres')
    .max(2, 'Estado deve ter exatamente 2 caracteres (ex: SP, RJ)')
    .required('Estado é obrigatório'),
  zipCode: yup
    .string()
    .matches(/^\d{5}-?\d{3}$/, 'CEP deve ser válido (ex: 00000-000)')
    .optional(),
});

// Schema completo para cadastro de loja
export const registerLojaSchema = yup.object({
  // Dados do proprietário
  ownerName: ownerSchema.fields.ownerName,
  ownerEmail: ownerSchema.fields.ownerEmail,
  ownerPhone: ownerSchema.fields.ownerPhone,
  password: ownerSchema.fields.password,
  confirmPassword: ownerSchema.fields.confirmPassword,
  
  // Dados da loja
  storeName: storeSchema.fields.storeName,
  storeSlug: storeSchema.fields.storeSlug,
  description: storeSchema.fields.description,
  category: storeSchema.fields.category,
  
  // Endereço
  address: storeSchema.fields.address,
  city: storeSchema.fields.city,
  state: storeSchema.fields.state,
  zipCode: storeSchema.fields.zipCode,
  
  // Configurações
  deliveryEnabled: yup.boolean().default(true),
  deliveryFee: yup
    .string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Taxa de entrega deve ser um número válido')
    .required('Taxa de entrega é obrigatória'),
  minimumOrder: yup
    .string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Pedido mínimo deve ser um número válido')
    .required('Pedido mínimo é obrigatório'),
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type OwnerFormData = yup.InferType<typeof ownerSchema>;
export type StoreFormData = yup.InferType<typeof storeSchema>;
export type RegisterLojaFormData = yup.InferType<typeof registerLojaSchema>;
