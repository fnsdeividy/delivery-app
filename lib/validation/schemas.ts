// validation/schemas.ts
import * as yup from "yup";

/* =========================
 * Utilitários de normalização
 * ========================= */
const toDigits = (v?: unknown) =>
  typeof v === "string" ? v.replace(/\D+/g, "") : v ?? "";

const toEmail = (v?: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : v ?? "";

const toUF = (v?: unknown) =>
  typeof v === "string" ? v.trim().toUpperCase() : v ?? "";

const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const toSlug = (v?: unknown) => {
  if (typeof v !== "string") return v ?? "";
  const base = stripDiacritics(v.trim().toLowerCase());
  let s = base
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  s = s.replace(/^-+/, "").replace(/-+$/, "");
  return s;
};

const reservedSlugs = new Set([
  "admin",
  "dashboard",
  "api",
  "login",
  "logout",
  "register",
  "auth",
  "settings",
  "config",
  "store",
  "loja",
  "me",
]);

/**
 * Converte "12,50" ou "12.50" para número. Vazio vira undefined.
 */
const currencyToNumber = (v?: unknown) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return v;
  if (typeof v !== "string") return undefined;

  const trimmed = v.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);

  if (Number.isNaN(num)) return undefined;
  return num;
};

/* =========================
 * Mensagens padrão (genéricas)
 * ========================= */
const MSG = {
  required: "Campo obrigatório",
  emailInvalid: "Email deve ser válido",
  passwordRequired: "Senha é obrigatória",
  passwordWeak: "Senha deve ter pelo menos 6 caracteres",
  confirmPasswordRequired: "Confirmação de senha é obrigatória",
  confirmPasswordMatch: "Senhas devem ser iguais",
  nameMin: "Nome deve ter pelo menos 2 caracteres",
  nameMax: "Nome deve ter no máximo 100 caracteres",
  storeNameMin: "Nome da loja deve ter pelo menos 2 caracteres",
  storeNameMax: "Nome da loja deve ter no máximo 100 caracteres",
  slugChars:
    "URL deve conter apenas letras minúsculas, números e hífens (sem acentos)",
  slugLenMin: "URL da loja deve ter pelo menos 3 caracteres",
  slugLenMax: "URL da loja deve ter no máximo 50 caracteres",
  slugNoDoubleHyphen: "URL não pode ter hífens consecutivos",
  slugNoEdgeHyphen: "URL não pode começar ou terminar com hífen",
  slugReserved: "Esta URL não está disponível",
  descMax: "Descrição deve ter no máximo 500 caracteres",
  categoryRequired: "Categoria é obrigatória",
  addressMin: "Endereço deve ter pelo menos 5 caracteres",
  addressMax: "Endereço deve ter no máximo 200 caracteres",
  cityMin: "Cidade deve ter pelo menos 2 caracteres",
  cityMax: "Cidade deve ter no máximo 100 caracteres",
  ufInvalid: "Estado deve ser uma sigla válida do Brasil",
  cepInvalid: "CEP deve ser válido (ex.: 00000-000)",
  phoneInvalid:
    "Telefone deve ser válido (ex.: (DD) 9XXXX-XXXX ou DDD + número)",
  feeRequired: "Taxa de entrega é obrigatória",
  feeInvalid: "Taxa de entrega deve ser um número válido (ex.: 5 ou 5,00)",
  minOrderRequired: "Pedido mínimo é obrigatório",
  minOrderInvalid: "Pedido mínimo deve ser um número válido (ex.: 20 ou 20,00)",
};

/* =========================
 * Schemas
 * ========================= */

// Schema para login
export const loginSchema = yup.object({
  email: yup
    .string()
    .transform(toEmail)
    .email(MSG.emailInvalid)
    .required("Email é obrigatório"),
  password: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(6, MSG.passwordWeak)
    .required(MSG.passwordRequired),
});

// Schema para dados do proprietário (Step 1)
export const ownerSchema = yup.object({
  ownerName: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, MSG.nameMin)
    .max(100, MSG.nameMax)
    .required("Nome é obrigatório"),

  ownerEmail: yup
    .string()
    .transform(toEmail)
    .email(MSG.emailInvalid)
    .matches(
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
      "Email deve ter formato válido (ex.: nome@dominio.com)"
    )
    .test(
      "no-dot-before-at",
      "Email não pode ter ponto imediatamente antes do @",
      (value) => {
        if (!value) return true;
        const at = value.indexOf("@");
        if (at <= 0) return true;
        return value[at - 1] !== ".";
      }
    )
    .required("Email é obrigatório"),

  ownerPhone: yup
    .string()
    .transform(toDigits)
    .test("phone-br", MSG.phoneInvalid, (digits) => {
      if (!digits) return true; // opcional
      // 10 (fixo c/ DDD) ou 11 (celular c/ DDD iniciando com 9)
      if (digits.length === 10) return true;
      if (digits.length === 11 && digits.startsWith("9", 2)) return true;
      return false;
    })
    .optional(),

  password: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(6, MSG.passwordWeak)
    .required(MSG.passwordRequired),

  confirmPassword: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .oneOf([yup.ref("password")], MSG.confirmPasswordMatch)
    .required(MSG.confirmPasswordRequired),
});

// Schema para dados da loja (Step 2)
export const storeSchema = yup.object({
  storeName: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, MSG.storeNameMin)
    .max(100, MSG.storeNameMax)
    .required("Nome da loja é obrigatório"),

  storeSlug: yup
    .string()
    .transform(toSlug)
    .min(3, MSG.slugLenMin)
    .max(50, MSG.slugLenMax)
    .matches(/^[a-z0-9-]+$/, MSG.slugChars)
    .test(
      "no-consecutive-hyphens",
      MSG.slugNoDoubleHyphen,
      (value) => !value || !value.includes("--")
    )
    .test(
      "no-start-end-hyphen",
      MSG.slugNoEdgeHyphen,
      (value) => !value || (!value.startsWith("-") && !value.endsWith("-"))
    )
    .test("not-reserved", MSG.slugReserved, (value) => {
      if (!value) return true;
      return !reservedSlugs.has(value);
    })
    .required("URL da loja é obrigatória"),

  description: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .max(500, MSG.descMax)
    .optional(),

  category: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(1, MSG.categoryRequired)
    .required(MSG.categoryRequired),

  address: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(5, MSG.addressMin)
    .max(200, MSG.addressMax)
    .required("Endereço é obrigatório"),

  city: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .min(2, MSG.cityMin)
    .max(100, MSG.cityMax)
    .required("Cidade é obrigatória"),

  state: yup
    .string()
    .transform(toUF)
    .matches(
      /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/,
      MSG.ufInvalid
    )
    .required("Estado é obrigatório"),

  zipCode: yup
    .string()
    .transform(toDigits)
    .test("cep", MSG.cepInvalid, (digits) => {
      if (!digits) return true; // opcional
      return digits.length === 8;
    })
    .optional(),

  number: yup
    .string()
    .transform(toDigits)
    .min(1, "Número do estabelecimento é obrigatório")
    .required("Número do estabelecimento é obrigatório"),
});

// Schema completo para cadastro de loja
export const registerLojaSchema = yup
  .object({
    // Proprietário
    ownerName: ownerSchema.fields.ownerName,
    ownerEmail: ownerSchema.fields.ownerEmail,
    ownerPhone: ownerSchema.fields.ownerPhone,
    password: ownerSchema.fields.password,
    confirmPassword: ownerSchema.fields.confirmPassword,

    // Loja
    storeName: storeSchema.fields.storeName,
    storeSlug: storeSchema.fields.storeSlug,
    description: storeSchema.fields.description,
    category: storeSchema.fields.category,

    // Endereço
    address: storeSchema.fields.address,
    city: storeSchema.fields.city,
    state: storeSchema.fields.state,
    zipCode: storeSchema.fields.zipCode,
    number: storeSchema.fields.number,

    // Configurações
    deliveryEnabled: yup.boolean().default(true),

    deliveryFee: yup
      .mixed<number>()
      .transform(currencyToNumber)
      .typeError(MSG.feeInvalid)
      .test("valid-fee", MSG.feeInvalid, (v) => v === undefined || v >= 0)
      .required(MSG.feeRequired),

    minimumOrder: yup
      .mixed<number>()
      .transform(currencyToNumber)
      .typeError(MSG.minOrderInvalid)
      .test(
        "valid-min-order",
        MSG.minOrderInvalid,
        (v) => v === undefined || v >= 0
      )
      .required(MSG.minOrderRequired),
  })
  .test(
    "minOrder-vs-fee",
    "Pedido mínimo não pode ser menor que a taxa de entrega",
    (obj) => {
      const fee = obj.deliveryFee as number | undefined;
      const min = obj.minimumOrder as number | undefined;
      if (typeof fee !== "number" || typeof min !== "number") return true;
      return min >= fee;
    }
  );

/* =========================
 * Tipos TypeScript
 * ========================= */
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type OwnerFormData = yup.InferType<typeof ownerSchema>;
export type StoreFormData = yup.InferType<typeof storeSchema>;
export type RegisterLojaFormData = yup.InferType<typeof registerLojaSchema>;
