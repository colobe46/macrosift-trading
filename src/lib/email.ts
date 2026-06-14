const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://macrosift.site'
const DOMAIN = new URL(APP_URL).hostname

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `MacroSift <alerts@${DOMAIN}>`,
        to: [to],
        subject,
        html,
      }),
    })
    return res.ok
  } catch { return false }
}

export async function sendAlertEmail(to: string, symbol: string, message: string): Promise<boolean> {
  return sendEmail(
    to,
    `MacroSift Alert: ${symbol}`,
    `<div style="background:#0f0f0f;color:#e0e0e0;padding:24px;font-family:sans-serif;border-radius:8px;">
      <h2 style="color:#2a6eff;">⚠️ Trading Alert</h2>
      <p style="font-size:16px;">${message}</p>
      <hr style="border-color:#2a2a4a;margin:16px 0;" />
      <p style="color:#888;font-size:12px;">MacroSift · ${DOMAIN}</p>
    </div>`
  )
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return sendEmail(
    to,
    'Welcome to MacroSift',
    `<div style="background:#0f0f0f;color:#e0e0e0;padding:24px;font-family:sans-serif;border-radius:8px;">
      <h1 style="color:#2a6eff;">Welcome to MacroSift, ${name}! 🚀</h1>
      <p>Your trading intelligence platform is ready.</p>
      <ul>
        <li>📊 Real-time market data</li>
        <li>⚡ Smart alerts via Telegram</li>
        <li>📈 30+ technical indicators</li>
      </ul>
      <p>Start by adding symbols to your watchlist.</p>
      <hr style="border-color:#2a2a4a;margin:16px 0;" />
      <p style="color:#888;font-size:12px;">MacroSift · ${DOMAIN}</p>
    </div>`
  )
}
