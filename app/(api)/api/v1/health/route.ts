import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG, fetchExternalAPI } from '../config'

/**
 * API para health check
 * GET /api/v1/health - Verificar status da API externa
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Verificando saúde da API externa:', API_BASE_URL)

    // Fazer requisição para a API externa
    const response = await fetchExternalAPI(API_CONFIG.ENDPOINTS.HEALTH, {
      method: 'GET',
    })

    if (!response.ok) {
      console.error('❌ API externa não está respondendo:', response.status)
      return NextResponse.json({
        status: 'error',
        message: 'API externa não está respondendo',
        external_api_status: response.status,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    const healthData = await response.json()
    console.log('✅ API externa está funcionando:', healthData)

    return NextResponse.json({
      status: 'healthy',
      message: 'Sistema funcionando normalmente',
      external_api: {
        status: 'healthy',
        response: healthData
      },
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Erro ao verificar saúde da API:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao conectar com API externa',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 