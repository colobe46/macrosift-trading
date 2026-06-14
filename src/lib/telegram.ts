const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export async function sendTelegramAlert(chatId: string | null | undefined, message: string): Promise<boolean> {
  if (!chatId || !TELEGRAM_BOT_TOKEN) return false
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    })
    return res.ok
  } catch { return false }
}

export async function setWebhook(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    return res.ok
  } catch { return false }
}

export async function handleTelegramUpdate(update: any): Promise<void> {
  if (!update.message) return
  const { chat, text } = update.message
  if (!text || !chat) return

  const chatId = chat.id.toString()
  const msg = text.trim().toLowerCase()

  if (msg === '/start') {
    await sendTelegramAlert(chatId,
      '🤖 <b>MacroSift Alertas</b>\n\n'
      + 'Para vincular tu Telegram con tu cuenta:\n'
      + '1. Ve a macrosift.site/dashboard/settings\n'
      + '2. Copia este código y pégalo:\n\n'
      + `<code>${chatId}</code>\n\n`
      + 'O responde con tu email de registro:\n'
      + '<code>/email tu@email.com</code>'
    )
    return
  }

  if (msg.startsWith('/email ')) {
    const email = msg.replace('/email ', '').trim()
    if (!email.includes('@')) {
      await sendTelegramAlert(chatId, '❌ Email inválido. Escribe: /email tu@email.com')
      return
    }
    const { prisma } = await import('./db')
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      await sendTelegramAlert(chatId, '❌ No encontramos ese email en MacroSift. Regístrate en macrosift.site primero.')
      return
    }
    await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: chatId } })
    await sendTelegramAlert(chatId, '✅ Telegram vinculado correctamente. Recibirás aquí tus alertas.')
    return
  }

  if (msg === '/alertas' || msg === '/alerts') {
    const { prisma } = await import('./db')
    const user = await prisma.user.findFirst({ where: { telegramChatId: chatId }, include: { alerts: true } })
    if (!user || user.alerts.length === 0) {
      await sendTelegramAlert(chatId, 'No tienes alertas activas. Crea una en macrosift.site/dashboard/alerts')
      return
    }
    const list = user.alerts.map(a => `• ${a.symbol}: ${JSON.stringify(a.condition)}`).join('\n')
    await sendTelegramAlert(chatId, `📋 <b>Tus alertas:</b>\n${list}`)
    return
  }

  await sendTelegramAlert(chatId, 'Comandos:\n/start - Info\n/email tu@email.com - Vincular cuenta\n/alertas - Ver alertas')
}
