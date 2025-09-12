import {
  centsToReais,
  extractNumbers,
  formatCentsToBRL,
  formatForInput,
  formatNumberBR,
  formatReaisToBRL,
  parseBRLToCents,
  parseBRLToReais,
  reaisToCents,
  validateCurrencyValue,
} from "@/lib/utils/currency";

describe("Currency Utils", () => {
  describe("centsToReais", () => {
    it("deve converter centavos para reais corretamente", () => {
      expect(centsToReais(250)).toBe(2.5);
      expect(centsToReais(100)).toBe(1);
      expect(centsToReais(1)).toBe(0.01);
      expect(centsToReais(0)).toBe(0);
    });
  });

  describe("reaisToCents", () => {
    it("deve converter reais para centavos corretamente", () => {
      expect(reaisToCents(2.5)).toBe(250);
      expect(reaisToCents(1)).toBe(100);
      expect(reaisToCents(0.01)).toBe(1);
      expect(reaisToCents(0)).toBe(0);
    });

    it("deve arredondar corretamente", () => {
      expect(reaisToCents(2.555)).toBe(256);
      expect(reaisToCents(2.554)).toBe(255);
    });
  });

  describe("formatCentsToBRL", () => {
    it("deve formatar centavos para BRL corretamente", () => {
      expect(formatCentsToBRL(250)).toBe("R$ 2,50");
      expect(formatCentsToBRL(100)).toBe("R$ 1,00");
      expect(formatCentsToBRL(1)).toBe("R$ 0,01");
      expect(formatCentsToBRL(0)).toBe("R$ 0,00");
    });
  });

  describe("formatReaisToBRL", () => {
    it("deve formatar reais para BRL corretamente", () => {
      expect(formatReaisToBRL(2.5)).toBe("R$ 2,50");
      expect(formatReaisToBRL(1)).toBe("R$ 1,00");
      expect(formatReaisToBRL(0.01)).toBe("R$ 0,01");
      expect(formatReaisToBRL(0)).toBe("R$ 0,00");
    });
  });

  describe("parseBRLToCents", () => {
    it("deve parsear strings BRL para centavos corretamente", () => {
      // Formato brasileiro com vírgula
      expect(parseBRLToCents("2,50")).toBe(250);
      expect(parseBRLToCents("R$ 2,50")).toBe(250);
      expect(parseBRLToCents("R$ 1.234,56")).toBe(123456);

      // Formato americano com ponto
      expect(parseBRLToCents("2.50")).toBe(250);
      expect(parseBRLToCents("1234.56")).toBe(123456);

      // Apenas números
      expect(parseBRLToCents("250")).toBe(250);
      expect(parseBRLToCents("123456")).toBe(123456);

      // Valores vazios
      expect(parseBRLToCents("")).toBe(0);
      expect(parseBRLToCents("   ")).toBe(0);
    });

    it("deve lidar com formatos mistos", () => {
      expect(parseBRLToCents("2,5")).toBe(250);
      expect(parseBRLToCents("2.5")).toBe(250);
      expect(parseBRLToCents("2,500")).toBe(250);
      expect(parseBRLToCents("2.500")).toBe(250);
    });

    it("deve lidar com separadores de milhares", () => {
      expect(parseBRLToCents("1.234,56")).toBe(123456);
      expect(parseBRLToCents("1,234.56")).toBe(123456);
      expect(parseBRLToCents("10.000,00")).toBe(1000000);
    });
  });

  describe("parseBRLToReais", () => {
    it("deve parsear strings BRL para reais corretamente", () => {
      expect(parseBRLToReais("2,50")).toBe(2.5);
      expect(parseBRLToReais("R$ 2,50")).toBe(2.5);
      expect(parseBRLToReais("1.234,56")).toBe(1234.56);
    });
  });

  describe("validateCurrencyValue", () => {
    it("deve validar valores corretamente", () => {
      expect(validateCurrencyValue(100)).toEqual({ isValid: true });
      expect(validateCurrencyValue(0)).toEqual({ isValid: true });
      expect(validateCurrencyValue(9999999)).toEqual({ isValid: true });
    });

    it("deve rejeitar valores inválidos", () => {
      expect(validateCurrencyValue(-1)).toEqual({
        isValid: false,
        errorMessage: "Valor deve ser um número válido",
      });
      expect(validateCurrencyValue(NaN)).toEqual({
        isValid: false,
        errorMessage: "Valor deve ser um número válido",
      });
    });

    it("deve validar limites personalizados", () => {
      expect(validateCurrencyValue(50, 100, 1000)).toEqual({
        isValid: false,
        errorMessage: "Valor mínimo é R$ 1,00",
      });
      expect(validateCurrencyValue(1500, 100, 1000)).toEqual({
        isValid: false,
        errorMessage: "Valor máximo é R$ 10,00",
      });
    });
  });

  describe("formatForInput", () => {
    it("deve formatar para input corretamente", () => {
      expect(formatForInput(250)).toBe("2,50");
      expect(formatForInput(100)).toBe("1,00");
      expect(formatForInput(0)).toBe("");
    });
  });

  describe("extractNumbers", () => {
    it("deve extrair apenas números de uma string", () => {
      expect(extractNumbers("abc123def456")).toBe("123456");
      expect(extractNumbers("R$ 2,50")).toBe("250");
      expect(extractNumbers("")).toBe("");
    });
  });

  describe("formatNumberBR", () => {
    it("deve formatar número para padrão brasileiro", () => {
      expect(formatNumberBR(1234.56)).toBe("1.234,56");
      expect(formatNumberBR(100)).toBe("100,00");
      expect(formatNumberBR(0)).toBe("0,00");
    });
  });
});
