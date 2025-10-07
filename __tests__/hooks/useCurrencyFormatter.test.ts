import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { renderHook } from "@testing-library/react";

describe("useCurrencyFormatter", () => {
  let hook: ReturnType<typeof useCurrencyFormatter>;

  beforeEach(() => {
    const { result } = renderHook(() => useCurrencyFormatter());
    hook = result.current;
  });

  describe("parseAndFormatBRL", () => {
    it("deve formatar valores digitados como centavos", () => {
      const result = hook.parseAndFormatBRL("1234");
      expect(result.value).toBe(1234);
      expect(result.text).toMatch(/R\$\s*1\.234,00/);
    });

    it("deve formatar valores com vírgula decimal", () => {
      const result = hook.parseAndFormatBRL("1234,56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve formatar valores com ponto decimal", () => {
      const result = hook.parseAndFormatBRL("1234.56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve retornar valor zero para entrada vazia", () => {
      const result = hook.parseAndFormatBRL("");
      expect(result.value).toBe(0);
      expect(result.text).toBe("");
    });

    it("deve ignorar caracteres inválidos", () => {
      const result = hook.parseAndFormatBRL("abc123def");
      expect(result.value).toBe(123);
      expect(result.text).toMatch(/R\$\s*123,00/);
    });

    it("deve limitar o número de dígitos", () => {
      const result = hook.parseAndFormatBRL("12345678901234567890");
      expect(result.value).toBe(12345678901234567000);
      expect(result.text).toMatch(/R\$\s*12\.345\.678\.901\.234\.567\.000,00/);
    });
  });

  describe("formatBRL", () => {
    it("deve formatar números corretamente", () => {
      expect(hook.formatBRL(12.34)).toMatch(/R\$\s*12,34/);
      expect(hook.formatBRL(1234.56)).toMatch(/R\$\s*1\.234,56/);
      expect(hook.formatBRL(0)).toMatch(/R\$\s*0,00/);
    });

    it("deve tratar valores inválidos", () => {
      expect(hook.formatBRL(NaN)).toMatch(/R\$\s*0,00/);
      expect(hook.formatBRL(Infinity)).toMatch(/R\$\s*0,00/);
      expect(hook.formatBRL(-Infinity)).toMatch(/R\$\s*0,00/);
    });
  });

  describe("parsePastedValue", () => {
    it("deve processar valores formatados com R$", () => {
      const result = hook.parsePastedValue("R$ 1.234,56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve processar valores com vírgula e ponto", () => {
      const result = hook.parsePastedValue("1.234,56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve processar valores só com vírgula", () => {
      const result = hook.parsePastedValue("1234,56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve processar valores só com ponto", () => {
      const result = hook.parsePastedValue("1234.56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });

    it("deve processar valores sem separadores", () => {
      const result = hook.parsePastedValue("123456");
      expect(result.value).toBe(123456);
      expect(result.text).toMatch(/R\$\s*123\.456,00/);
    });

    it("deve tratar valores inválidos", () => {
      const result = hook.parsePastedValue("abc");
      expect(result.value).toBe(0);
      expect(result.text).toBe("");
    });

    it("deve tratar entrada vazia", () => {
      const result = hook.parsePastedValue("");
      expect(result.value).toBe(0);
      expect(result.text).toBe("");
    });

    it("deve processar valores com espaços", () => {
      const result = hook.parsePastedValue("R$ 1 234,56");
      expect(result.value).toBe(1234.56);
      expect(result.text).toMatch(/R\$\s*1\.234,56/);
    });
  });

  describe("parseIntegerDigits", () => {
    it("deve processar dígitos inteiros", () => {
      const result = hook.parseIntegerDigits("1234");
      expect(result.value).toBe(1234);
      expect(result.text).toBe("1234");
    });

    it("deve limitar o número de dígitos", () => {
      const result = hook.parseIntegerDigits("12345678901234567890", 5);
      expect(result.value).toBe(12345);
      expect(result.text).toBe("12345");
    });

    it("deve tratar entrada vazia", () => {
      const result = hook.parseIntegerDigits("");
      expect(result.value).toBe(0);
      expect(result.text).toBe("");
    });
  });
});
