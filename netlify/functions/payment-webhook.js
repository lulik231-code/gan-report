// Webhook שספק הסליקה יקרא לו אחרי תשלום מוצלח.
// כשהוא מופעל: מסמן תשלום כ"שולם" ומאריך את המנוי (paid_until) אוטומטית — בלי מגע אדמין.
//
// כדי להפעיל, נדרשים משתני סביבה ב‑Netlify:
//   SUPABASE_URL                — כתובת הפרויקט (https://ianztnvgpdmpllhxwjpr.supabase.co)
//   SUPABASE_SERVICE_ROLE_KEY   — מפתח service_role (Settings ▸ API ב‑Supabase). סודי! רק ב‑Netlify.
//   PAYMENT_PROVIDER            — שם הספק
//   PAYMENT_WEBHOOK_SECRET      — סוד לאימות שהקריאה באמת מהספק (לפי התיעוד שלו)
//
// כל ספק שולח מבנה שונה — יש להתאים את parseProviderEvent לפי התיעוד של הספק שנבחר.

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { statusCode: 501, body: 'webhook not configured' }

  // === התאמה לספק: אימות חתימה/סוד + חילוץ הנתונים ===
  const parseProviderEvent = (ev) => {
    // חובה לאמת את PAYMENT_WEBHOOK_SECRET לפי שיטת הספק (header/חתימה) לפני שממשיכים!
    const b = JSON.parse(ev.body || '{}')
    return {
      verified: false, // ← לשנות ל‑true רק אחרי אימות אמיתי מול הספק
      success: b.status === 'success',
      user_id: b.user_id || b.custom_field,   // ה‑metadata שהעברנו ב‑create-checkout
      amount: Number(b.amount || 0),
      months: Number(b.months || 1),
      provider_ref: b.transaction_id || b.txn_id || null,
    }
  }

  const p = parseProviderEvent(event)
  if (!p.verified) return { statusCode: 401, body: 'unverified' }
  if (!p.success || !p.user_id) return { statusCode: 200, body: 'ignored' }

  const supa = createClient(url, key)

  // רישום התשלום
  await supa.from('payments').insert({
    user_id: p.user_id, amount: p.amount, months: p.months,
    status: 'paid', method: process.env.PAYMENT_PROVIDER || 'provider',
    provider_ref: p.provider_ref, paid_at: new Date().toISOString(),
  })

  // הארכת המנוי
  const { data: prof } = await supa.from('profiles').select('paid_until').eq('id', p.user_id).single()
  const base = new Date(Math.max(Date.now(), prof?.paid_until ? new Date(prof.paid_until).getTime() : 0))
  base.setMonth(base.getMonth() + p.months)
  await supa.from('profiles').update({ plan: 'paid', status: 'active', paid_until: base.toISOString() }).eq('id', p.user_id)
  await supa.from('subscription_requests').update({ status: 'handled' }).eq('user_id', p.user_id).eq('status', 'pending')

  return { statusCode: 200, body: 'ok' }
}
