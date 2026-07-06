// יצירת עמוד תשלום אצל ספק הסליקה.
// כרגע אין ספק מחובר — הפונקציה מחזירה 501 והאפליקציה נופלת חזרה לזרימה הידנית
// (בקשת מנוי + אישור אדמין). כדי לחבר ספק (Grow/Meshulam, Cardcom, PayPlus, Tranzila):
//   1. הגדירי ב‑Netlify את משתני הסביבה של הספק (מפתחות API).
//   2. ממשי את getCheckoutUrl למטה לפי התיעוד של הספק.
//   3. עדכני ב‑Supabase: update billing_settings set provider='<שם הספק>' where id=1;
//   4. הגדירי אצל הספק את כתובת ה‑webhook: /.netlify/functions/payment-webhook

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  let body
  try { body = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, body: 'Bad JSON' } }
  const { user_id, email, amount, months = 1 } = body
  if (!user_id || !amount) return { statusCode: 400, body: 'Missing user_id/amount' }

  const provider = process.env.PAYMENT_PROVIDER || ''
  if (!provider) {
    return { statusCode: 501, body: JSON.stringify({ error: 'no payment provider configured' }) }
  }

  // === כאן מחברים את הספק ===
  // הפונקציה צריכה: לפתוח עסקה אצל הספק על הסכום, להעביר את user_id כ‑metadata/custom field,
  // ולהחזיר את כתובת עמוד התשלום.
  const getCheckoutUrl = async () => {
    // דוגמה (פסאודו): const res = await fetch(PROVIDER_API, {...})
    throw new Error('provider "' + provider + '" not implemented yet')
  }

  try {
    const checkout_url = await getCheckoutUrl({ user_id, email, amount, months })
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkout_url }) }
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e.message || e) }) }
  }
}
