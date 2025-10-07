import { checkStoreStatus, WorkingHours } from "@/lib/utils/store-status";

describe("Store Status Utils", () => {
  // Mock do Date para testes controlados
  const mockDate = (dateString: string) => {
    const mockDate = new Date(dateString);
    jest.spyOn(global, "Date").mockImplementation(() => mockDate);
    return mockDate;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkStoreStatus", () => {
    const workingHours: WorkingHours = {
      monday: {
        open: true,
        hours: [{ start: "08:00", end: "18:00" }],
      },
      tuesday: {
        open: true,
        hours: [{ start: "08:00", end: "18:00" }],
      },
      wednesday: {
        open: true,
        hours: [{ start: "08:00", end: "18:00" }],
      },
      thursday: {
        open: true,
        hours: [{ start: "08:00", end: "18:00" }],
      },
      friday: {
        open: true,
        hours: [{ start: "08:00", end: "20:00" }],
      },
      saturday: {
        open: true,
        hours: [{ start: "10:00", end: "16:00" }],
      },
      sunday: {
        open: false,
        hours: [],
      },
    };

    it("deve retornar loja aberta quando está dentro do horário de funcionamento", () => {
      // Segunda-feira às 10:00 (dentro do horário 08:00-18:00)
      mockDate("2024-01-15T10:00:00-03:00"); // Segunda-feira

      const status = checkStoreStatus(workingHours);

      expect(status.isOpen).toBe(true);
      expect(status.message).toBe("Loja aberta");
      expect(status.reason).toBe("open");
    });

    it("deve retornar loja fechada quando está fora do horário de funcionamento", () => {
      // Segunda-feira às 20:00 (fora do horário 08:00-18:00)
      mockDate("2024-01-15T20:00:00-03:00"); // Segunda-feira

      const status = checkStoreStatus(workingHours);

      expect(status.isOpen).toBe(false);
      expect(status.message).toBe("Loja fechada");
      expect(status.reason).toBe("outside_hours");
    });

    it("deve retornar loja fechada quando o dia está marcado como fechado", () => {
      // Domingo (marcado como fechado)
      mockDate("2024-01-14T10:00:00-03:00"); // Domingo

      const status = checkStoreStatus(workingHours);

      expect(status.isOpen).toBe(false);
      expect(status.message).toBe("Loja fechada hoje");
      expect(status.reason).toBe("closed_today");
    });

    it("deve retornar loja fechada quando não há horários configurados", () => {
      const emptyWorkingHours: WorkingHours = {
        monday: { open: true, hours: [] },
        tuesday: { open: true, hours: [] },
        wednesday: { open: true, hours: [] },
        thursday: { open: true, hours: [] },
        friday: { open: true, hours: [] },
        saturday: { open: true, hours: [] },
        sunday: { open: false, hours: [] },
      };

      mockDate("2024-01-15T10:00:00-03:00"); // Segunda-feira

      const status = checkStoreStatus(emptyWorkingHours);

      expect(status.isOpen).toBe(false);
      expect(status.message).toBe("Horários não definidos para hoje");
      expect(status.reason).toBe("no_hours_configured");
    });

    it("deve retornar loja fechada quando workingHours é null/undefined", () => {
      mockDate("2024-01-15T10:00:00-03:00");

      const status = checkStoreStatus(null as any);

      expect(status.isOpen).toBe(false);
      expect(status.message).toBe("Horários não configurados");
      expect(status.reason).toBe("workingHours_not_configured");
    });

    it("deve funcionar corretamente com múltiplos períodos de funcionamento", () => {
      const multiPeriodHours: WorkingHours = {
        monday: {
          open: true,
          hours: [
            { start: "08:00", end: "12:00" },
            { start: "14:00", end: "18:00" },
          ],
        },
        tuesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        wednesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        thursday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        friday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        saturday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        sunday: { open: false, hours: [] },
      };

      // Teste no primeiro período (08:00-12:00)
      mockDate("2024-01-15T10:00:00-03:00"); // Segunda-feira
      let status = checkStoreStatus(multiPeriodHours);
      expect(status.isOpen).toBe(true);

      // Teste no intervalo fechado (12:00-14:00)
      mockDate("2024-01-15T13:00:00-03:00"); // Segunda-feira
      status = checkStoreStatus(multiPeriodHours);
      expect(status.isOpen).toBe(false);

      // Teste no segundo período (14:00-18:00)
      mockDate("2024-01-15T16:00:00-03:00"); // Segunda-feira
      status = checkStoreStatus(multiPeriodHours);
      expect(status.isOpen).toBe(true);
    });

    it("deve considerar corretamente horários que passam da meia-noite", () => {
      const lateHours: WorkingHours = {
        friday: {
          open: true,
          hours: [{ start: "22:00", end: "02:00" }], // Funciona até 2h da manhã
        },
        saturday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        sunday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        monday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        tuesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        wednesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
        thursday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      };

      // Sexta-feira às 23:00 (dentro do horário 22:00-02:00)
      mockDate("2024-01-19T23:00:00-03:00"); // Sexta-feira
      let status = checkStoreStatus(lateHours);
      expect(status.isOpen).toBe(true);

      // Sábado às 01:00 (ainda dentro do horário da sexta 22:00-02:00)
      mockDate("2024-01-20T01:00:00-03:00"); // Sábado
      status = checkStoreStatus(lateHours);
      expect(status.isOpen).toBe(false); // Sábado tem horário diferente
    });

    it("deve funcionar com diferentes fusos horários", () => {
      // Teste com horário de Brasília (UTC-3)
      mockDate("2024-01-15T10:00:00-03:00"); // Segunda-feira 10:00 BRT

      let status = checkStoreStatus(workingHours, "America/Sao_Paulo");
      expect(status.isOpen).toBe(true);

      // Teste com horário de Manaus (UTC-4)
      mockDate("2024-01-15T09:00:00-04:00"); // Segunda-feira 09:00 AMT (mesmo horário que 10:00 BRT)

      status = checkStoreStatus(workingHours, "America/Manaus");
      expect(status.isOpen).toBe(true);
    });
  });

  describe("Edge cases", () => {
    const workingHours: WorkingHours = {
      monday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      tuesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      wednesday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      thursday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      friday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      saturday: { open: true, hours: [{ start: "08:00", end: "18:00" }] },
      sunday: { open: false, hours: [] },
    };

    it("deve funcionar no horário exato de abertura", () => {
      mockDate("2024-01-15T08:00:00-03:00"); // Segunda-feira exatamente às 08:00

      const status = checkStoreStatus(workingHours);
      expect(status.isOpen).toBe(true);
    });

    it("deve funcionar no horário exato de fechamento", () => {
      mockDate("2024-01-15T18:00:00-03:00"); // Segunda-feira exatamente às 18:00

      const status = checkStoreStatus(workingHours);
      expect(status.isOpen).toBe(true);
    });

    it("deve funcionar um minuto antes do fechamento", () => {
      mockDate("2024-01-15T17:59:00-03:00"); // Segunda-feira às 17:59

      const status = checkStoreStatus(workingHours);
      expect(status.isOpen).toBe(true);
    });

    it("deve funcionar um minuto após o fechamento", () => {
      mockDate("2024-01-15T18:01:00-03:00"); // Segunda-feira às 18:01

      const status = checkStoreStatus(workingHours);
      expect(status.isOpen).toBe(false);
    });
  });
});
