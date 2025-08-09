function getCurrentStatus(workingHours: any, testDay?: string, testTime?: string) {
  let now: Date
  let dayNames: string[]
  let currentDay: string
  
  if (testDay && testTime) {
    // Para testes, simular um dia e hora específicos
    const [hours, minutes] = testTime.split(':').map(Number)
    now = new Date()
    now.setHours(hours, minutes, 0, 0)
    
    dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayIndex = dayNames.indexOf(testDay)
    if (dayIndex !== -1) {
      // Ajustar o dia da semana
      const currentDayIndex = now.getDay()
      const diff = dayIndex - currentDayIndex
      now.setDate(now.getDate() + diff)
    }
    currentDay = testDay
  } else {
    // Comportamento normal
    now = new Date()
    dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    currentDay = dayNames[now.getDay()]
  }
  
  // Converter hora atual para minutos desde meia-noite
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  const todayHours = workingHours[currentDay]
  if (todayHours.closed) {
    return { status: 'closed', message: 'Loja fechada hoje' }
  }
  
  // Converter horários de abertura e fechamento para minutos
  const openMinutes = parseInt(todayHours.open.split(':')[0]) * 60 + parseInt(todayHours.open.split(':')[1])
  const closeMinutes = parseInt(todayHours.close.split(':')[0]) * 60 + parseInt(todayHours.close.split(':')[1])
  
  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  
  return {
    status: isOpen ? 'open' : 'closed',
    message: isOpen ? 'Loja aberta' : 'Loja fechada',
    details: {
      currentTime: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
      currentMinutes,
      openTime: todayHours.open,
      openMinutes,
      closeTime: todayHours.close,
      closeMinutes,
      day: currentDay
    }
  }
}

// Testar com diferentes horários
const testHours = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '22:00', closed: false },
  saturday: { open: '09:00', close: '22:00', closed: false },
  sunday: { open: '09:00', close: '22:00', closed: false }
}

console.log('🕐 Testando cálculo de status da loja...')
console.log('='.repeat(50))

const currentStatus = getCurrentStatus(testHours)
console.log(`Status: ${currentStatus.status}`)
console.log(`Mensagem: ${currentStatus.message}`)
if (currentStatus.details) {
  console.log('\nDetalhes:')
  console.log(`  Hora atual: ${currentStatus.details.currentTime}`)
  console.log(`  Minutos atuais: ${currentStatus.details.currentMinutes}`)
  console.log(`  Dia: ${currentStatus.details.day}`)
  console.log(`  Horário de abertura: ${currentStatus.details.openTime} (${currentStatus.details.openMinutes} min)`)
  console.log(`  Horário de fechamento: ${currentStatus.details.closeTime} (${currentStatus.details.closeMinutes} min)`)
}

// Testar com diferentes horários
console.log('\n🧪 Testando diferentes cenários:')
console.log('='.repeat(50))

// Cenário 1: Loja fechada (domingo)
const sundayClosed = {
  ...testHours,
  sunday: { open: '09:00', close: '22:00', closed: true }
}
const statusSunday = getCurrentStatus(sundayClosed, 'sunday', '14:00')
console.log(`Domingo (fechado): ${statusSunday.status} - ${statusSunday.message}`)
console.log(`  Simulado: domingo às 14:00`)

// Cenário 2: Horário comercial (testando fora do horário)
const commercialHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '18:00', closed: false },
  sunday: { open: '08:00', close: '18:00', closed: false }
}
const statusCommercialClosed = getCurrentStatus(commercialHours, 'monday', '20:00')
console.log(`Horário comercial (20:00): ${statusCommercialClosed.status} - ${statusCommercialClosed.message}`)
console.log(`  Simulado: segunda às 20:00 (fora do horário)`)

const statusCommercialOpen = getCurrentStatus(commercialHours, 'monday', '14:00')
console.log(`Horário comercial (14:00): ${statusCommercialOpen.status} - ${statusCommercialOpen.message}`)
console.log(`  Simulado: segunda às 14:00 (dentro do horário)`)

// Cenário 3: Horário estendido
const extendedHours = {
  monday: { open: '06:00', close: '23:00', closed: false },
  tuesday: { open: '06:00', close: '23:00', closed: false },
  wednesday: { open: '06:00', close: '23:00', closed: false },
  thursday: { open: '06:00', close: '23:00', closed: false },
  friday: { open: '06:00', close: '23:00', closed: false },
  saturday: { open: '06:00', close: '23:00', closed: false },
  sunday: { open: '06:00', close: '23:00', closed: false }
}
const statusExtendedOpen = getCurrentStatus(extendedHours, 'friday', '22:00')
console.log(`Horário estendido (22:00): ${statusExtendedOpen.status} - ${statusExtendedOpen.message}`)
console.log(`  Simulado: sexta às 22:00 (dentro do horário)`)

console.log('\n✅ Teste concluído!') 