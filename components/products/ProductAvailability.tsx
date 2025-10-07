"use client";

interface DayAvailability {
  available: boolean;
  hours: Array<{ start: string; end: string }>;
}

interface ProductAvailabilityData {
  alwaysAvailable: boolean;
  availableDays: {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
  };
}

interface ProductAvailabilityProps {
  formData: {
    availability?: ProductAvailabilityData;
  };
  onFormDataChange: (updates: Partial<ProductAvailabilityProps['formData']>) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export function ProductAvailability({ formData, onFormDataChange }: ProductAvailabilityProps) {
  const availability = formData.availability || {
    alwaysAvailable: true,
    availableDays: {
      monday: { available: true, hours: [] },
      tuesday: { available: true, hours: [] },
      wednesday: { available: true, hours: [] },
      thursday: { available: true, hours: [] },
      friday: { available: true, hours: [] },
      saturday: { available: true, hours: [] },
      sunday: { available: true, hours: [] },
    }
  };

  const updateAvailability = (updates: Partial<ProductAvailabilityData>) => {
    onFormDataChange({
      availability: {
        ...availability,
        ...updates
      }
    });
  };

  const updateDayAvailability = (day: keyof ProductAvailabilityData['availableDays'], dayData: Partial<DayAvailability>) => {
    updateAvailability({
      availableDays: {
        ...availability.availableDays,
        [day]: {
          ...availability.availableDays[day],
          ...dayData
        }
      }
    });
  };

  const addTimeSlot = (day: keyof ProductAvailabilityData['availableDays']) => {
    const currentHours = availability.availableDays[day].hours;
    updateDayAvailability(day, {
      hours: [...currentHours, { start: '08:00', end: '18:00' }]
    });
  };

  const removeTimeSlot = (day: keyof ProductAvailabilityData['availableDays'], index: number) => {
    const currentHours = availability.availableDays[day].hours;
    updateDayAvailability(day, {
      hours: currentHours.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (
    day: keyof ProductAvailabilityData['availableDays'], 
    index: number, 
    field: 'start' | 'end', 
    value: string
  ) => {
    const currentHours = availability.availableDays[day].hours;
    const updatedHours = currentHours.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    updateDayAvailability(day, { hours: updatedHours });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Disponibilidade do Produto
      </h2>

      {/* Sempre disponível */}
      <div className="flex items-start mb-6">
        <div className="flex items-center h-5">
          <input
            id="alwaysAvailable"
            type="checkbox"
            checked={availability.alwaysAvailable}
            onChange={(e) => updateAvailability({ alwaysAvailable: e.target.checked })}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="alwaysAvailable" className="font-medium text-gray-700">
            Sempre disponível
          </label>
          <p className="text-gray-500">
            O produto estará disponível em todos os horários de funcionamento da loja.
          </p>
        </div>
      </div>

      {/* Horários específicos por dia */}
      {!availability.alwaysAvailable && (
        <div className="space-y-6">
          <h3 className="text-md font-medium text-gray-900">
            Horários Específicos por Dia
          </h3>
          
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const dayData = availability.availableDays[key];
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dayData.available}
                      onChange={(e) => updateDayAvailability(key, { available: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                    />
                    <label className="font-medium text-gray-700">{label}</label>
                  </div>
                  
                  {dayData.available && (
                    <button
                      type="button"
                      onClick={() => addTimeSlot(key)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      + Adicionar Horário
                    </button>
                  )}
                </div>

                {dayData.available && (
                  <div className="space-y-2">
                    {dayData.hours.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Nenhum horário específico definido (disponível o dia todo)
                      </p>
                    ) : (
                      dayData.hours.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-gray-500">até</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(key, index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                          >
                            Remover
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  💡 Dica sobre Horários
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Se não definir horários específicos para um dia, o produto ficará disponível 
                    durante todo o horário de funcionamento da loja nesse dia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
