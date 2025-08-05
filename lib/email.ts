import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Cardap.IO" <${process.env.SMTP_USER}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || this.htmlToText(data.html),
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  private htmlToText(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  // Email de confirmação de conta
  async sendAccountConfirmation(email: string, name: string, confirmationUrl: string): Promise<boolean> {
    const subject = 'Confirme sua conta - Cardap.IO'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme sua conta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ed7516, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ed7516; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao Cardap.IO!</h1>
            <p>Confirme sua conta para começar</p>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Obrigado por se cadastrar no Cardap.IO. Para ativar sua conta, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Confirmar Conta</a>
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
            
            <p>Este link é válido por 24 horas.</p>
            
            <p>Atenciosamente,<br>Equipe Cardap.IO</p>
          </div>
          <div class="footer">
            <p>Se você não se cadastrou no Cardap.IO, ignore este email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: email, subject, html })
  }

  // Email de confirmação de pedido
  async sendOrderConfirmation(email: string, name: string, orderData: any): Promise<boolean> {
    const subject = `Pedido #${orderData.orderNumber} confirmado - ${orderData.storeName}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido Confirmado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ed7516, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pedido Confirmado!</h1>
            <p>Pedido #${orderData.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Seu pedido foi confirmado e está sendo preparado.</p>
            
            <div class="order-info">
              <h3>Detalhes do Pedido</h3>
              <p><strong>Número:</strong> #${orderData.orderNumber}</p>
              <p><strong>Data:</strong> ${new Date(orderData.createdAt).toLocaleString('pt-BR')}</p>
              <p><strong>Status:</strong> ${orderData.status}</p>
              <p><strong>Tipo:</strong> ${orderData.type}</p>
              
              <h4>Itens do Pedido:</h4>
              ${orderData.items.map((item: any) => `
                <div class="item">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
              `).join('')}
              
              <div class="total">
                <p>Subtotal: R$ ${orderData.subtotal.toFixed(2).replace('.', ',')}</p>
                <p>Taxa de entrega: R$ ${orderData.deliveryFee.toFixed(2).replace('.', ',')}</p>
                <p>Total: R$ ${orderData.total.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            
            <p>Você receberá atualizações sobre o status do seu pedido.</p>
            
            <p>Atenciosamente,<br>${orderData.storeName}</p>
          </div>
          <div class="footer">
            <p>Em caso de dúvidas, entre em contato conosco.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: email, subject, html })
  }

  // Email de status do pedido
  async sendOrderStatusUpdate(email: string, name: string, orderData: any, newStatus: string): Promise<boolean> {
    const statusMessages = {
      'CONFIRMED': 'seu pedido foi confirmado e está sendo preparado',
      'PREPARING': 'seu pedido está sendo preparado',
      'READY': 'seu pedido está pronto para entrega/retirada',
      'DELIVERING': 'seu pedido saiu para entrega',
      'DELIVERED': 'seu pedido foi entregue com sucesso'
    }

    const subject = `Status do pedido #${orderData.orderNumber} atualizado - ${orderData.storeName}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Status do Pedido Atualizado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ed7516, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status { background: #e8f5e8; border: 2px solid #4caf50; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Status Atualizado</h1>
            <p>Pedido #${orderData.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            
            <div class="status">
              <h3>${statusMessages[newStatus as keyof typeof statusMessages] || 'seu pedido foi atualizado'}</h3>
              <p><strong>Novo Status:</strong> ${newStatus}</p>
            </div>
            
            <p>Pedido #${orderData.orderNumber}</p>
            <p>Total: R$ ${orderData.total.toFixed(2).replace('.', ',')}</p>
            
            <p>Atenciosamente,<br>${orderData.storeName}</p>
          </div>
          <div class="footer">
            <p>Em caso de dúvidas, entre em contato conosco.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: email, subject, html })
  }
}

export const emailService = new EmailService() 