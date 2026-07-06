import { useState, useEffect } from 'react'
import {
  Building2, Users, Camera, Plus, X, Trash2, Wallet, TrendingUp,
  FileSpreadsheet, PencilLine, LogOut, Calendar, Sparkles, Receipt,
  UtensilsCrossed, Bus, Palette, PartyPopper, BookOpen, Package,
  Coins, Baby, Percent, Download, Shield, Mail, ChevronLeft,
  Clock, CreditCard, Ban, CheckCircle2,
} from 'lucide-react'
import { supa } from './supa'

const uid = () => Math.random().toString(36).slice(2, 10)
const nis = n => '₪' + Math.round(Number(n || 0)).toLocaleString('he-IL')
const nis1 = n => '₪' + (Number(n || 0)).toLocaleString('he-IL', { maximumFractionDigits: 1 })
const heDate = d => new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })
const academicYear = () => { const y = new Date().getFullYear(); return new Date().getMonth() >= 8 ? y + 1 : y }

const CAT_ICONS = { food: UtensilsCrossed, trip: Bus, culture: Palette, party: PartyPopper, book: BookOpen, other: Package }
const guessIcon = t => {
  if (/הזנ|אוכל|מזון|ארוח/.test(t)) return 'food'
  if (/טיול|נסיע|הסע/.test(t)) return 'trip'
  if (/תרבות|הצג|תיאטר|מופע/.test(t)) return 'culture'
  if (/סיום|מסיב|חג|אירוע/.test(t)) return 'party'
  if (/ספר|יצירה|צעצוע|ציוד|לימוד/.test(t)) return 'book'
  return 'other'
}

// Access state: blocked > admin > paid > trial > expired
const accessOf = p => {
  if (!p) return null
  if (p.status === 'blocked') return { state: 'blocked' }
  if (p.is_admin) return { state: 'admin' }
  const now = Date.now()
  if (p.paid_until && now < new Date(p.paid_until).getTime()) return { state: 'paid', until: p.paid_until }
  if (p.trial_ends_at && now < new Date(p.trial_ends_at).getTime()) return { state: 'trial', daysLeft: Math.max(1, Math.ceil((new Date(p.trial_ends_at).getTime() - now) / 86400000)) }
  return { state: 'expired' }
}
function CatIcon({ name, size = 18, ...p }) { const I = CAT_ICONS[name] || Package; return <I size={size} {...p} /> }

let tid = 0
function useToasts() {
  const [ts, setTs] = useState([])
  const push = (msg, kind = 'good') => { const id = ++tid; setTs(t => [...t, { id, msg, kind }]); setTimeout(() => setTs(t => t.filter(x => x.id !== id)), 2600) }
  const node = <div className="toast-wrap">{ts.map(t => <div key={t.id} className={'toast ' + t.kind}>{t.msg}</div>)}</div>
  return [push, node]
}

function AuthScreen({ toast }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', fullName: '', gardenName: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = async () => {
    const e = {}
    if (!form.email) e.email = 'צריך אימייל'; else if (!form.email.includes('@')) e.email = 'אימייל לא תקין'
    if (!form.password) e.password = 'צריך סיסמה'; else if (mode === 'register' && form.password.length < 6) e.password = 'לפחות 6 תווים'
    if (mode === 'register') { if (!form.fullName) e.fullName = 'צריך שם'; if (!form.gardenName) e.gardenName = 'צריך שם גן' }
    setErrors(e); if (Object.keys(e).length) return
    setBusy(true)
    try {
      if (mode === 'register') {
        const { error } = await supa.auth.signUp({
          email: form.email.trim(), password: form.password,
          options: { data: { full_name: form.fullName, garden_name: form.gardenName, phone: form.phone } },
        })
        if (error) { setErrors({ email: error.message.includes('registered') ? 'האימייל כבר רשום' : error.message }); setBusy(false); return }
        toast('נרשמת בהצלחה!', 'good')
      } else {
        const { error } = await supa.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
        if (error) { setErrors({ password: 'אימייל או סיסמה שגויים' }); setBusy(false); return }
      }
    } catch (err) { toast('שגיאת התחברות', 'bad'); setBusy(false) }
  }
  const googleLogin = async () => {
    setBusy(true)
    const { error } = await supa.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) { toast('התחברות עם Google לא זמינה כרגע', 'bad'); setBusy(false) }
  }
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-hero"><div className="mark"><Wallet size={34} strokeWidth={2.4} /></div><h1>גן־ריפורט</h1><p>ניהול כספי הגן — פשוט, ברור, בעברית</p></div>
        <div className="login-card">
          <h3>{mode === 'login' ? 'כניסה לחשבון' : 'פתיחת חשבון'}</h3>
          <p className="subt">{mode === 'login' ? 'טוב לראות אותך שוב' : 'כמה פרטים ומתחילים'}</p>
          <div className="field"><label>אימייל <span className="req">*</span></label><input className={'control' + (errors.email ? ' err' : '')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" type="email" />{errors.email && <div className="err-text">{errors.email}</div>}</div>
          <div className="field"><label>סיסמה <span className="req">*</span></label><input className={'control' + (errors.password ? ' err' : '')} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" type="password" />{errors.password && <div className="err-text">{errors.password}</div>}</div>
          {mode === 'register' && <>
            <div className="field"><label>שם מלא <span className="req">*</span></label><input className={'control' + (errors.fullName ? ' err' : '')} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="דנה כהן" />{errors.fullName && <div className="err-text">{errors.fullName}</div>}</div>
            <div className="field"><label>שם הגן <span className="req">*</span></label><input className={'control' + (errors.gardenName ? ' err' : '')} value={form.gardenName} onChange={e => set('gardenName', e.target.value)} placeholder="גן היהלום" />{errors.gardenName && <div className="err-text">{errors.gardenName}</div>}</div>
          </>}
          <button className="btn btn-primary btn-block" onClick={submit} disabled={busy} style={{ marginTop: 6 }}>{busy ? 'רגע…' : (mode === 'login' ? 'כניסה' : 'פתיחת חשבון')}</button>
          <div className="or-line"><span>או</span></div>
          <button className="btn btn-google btn-block" onClick={googleLogin} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 34.9 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            המשך עם Google
          </button>
          <div className="swap-line">{mode === 'login' ? <>עדיין אין חשבון? <button onClick={() => { setMode('register'); setErrors({}) }}>הרשמה</button></> : <>כבר יש חשבון? <button onClick={() => { setMode('login'); setErrors({}) }}>כניסה</button></>}</div>
        </div>
        <div className="foot-note">הנתונים נשמרים במכשיר שלך</div>
      </div>
    </div>
  )
}

async function exportExcel(budgets, receipts, gardenName) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // ---- City sheet ----
  const city = budgets.city
  const cityRows = []
  cityRows.push([`קצבת עירייה — ${gardenName}`])
  cityRows.push([])
  cityRows.push(['פעימות הכנסה'])
  cityRows.push(['#', 'סכום', 'תאריך', 'הערה'])
  let cityIncome = 0
  ;(city?.pulses || []).forEach((p, i) => { cityRows.push([i + 1, p.amount, heDate(p.date), p.note || '']); cityIncome += p.amount })
  cityRows.push(['סה״כ הכנסות', cityIncome])
  cityRows.push([])
  cityRows.push(['הוצאות (קבלות)'])
  cityRows.push(['ספק', 'סכום', 'תאריך', 'יתרה מתגלגלת'])
  let cityBal = cityIncome, citySpent = 0
  ;(receipts.city || []).slice().reverse().forEach(r => { cityBal -= r.amount; citySpent += r.amount; cityRows.push([r.store, r.amount, heDate(r.date), cityBal]) })
  cityRows.push(['סה״כ הוצאות', citySpent])
  cityRows.push(['יתרה בקופה', cityIncome - citySpent])
  const wsCity = XLSX.utils.aoa_to_sheet(cityRows)
  wsCity['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsCity, 'קצבת עירייה')

  // ---- Parents sheet ----
  const par = budgets.parents
  const pRows = []
  pRows.push([`תשלומי הורים — ${gardenName}`])
  pRows.push([])
  if (par) {
    pRows.push(['תשלום שנתי להורה', par.perChild, 'מספר ילדים', par.numKids, 'הנחות/לא שולם', par.adjust || 0])
    pRows.push(['צפי הכנסה כולל', par.expected])
    pRows.push([])
    pRows.push(['פעימות הכנסה'])
    pRows.push(['#', 'סכום', 'תאריך', 'הערה'])
    let pIncome = 0
    ;(par.pulses || []).forEach((p, i) => { pRows.push([i + 1, p.amount, heDate(p.date), p.note || '']); pIncome += p.amount })
    pRows.push(['סה״כ נכנס', pIncome])
    pRows.push([])
    pRows.push(['התפלגות לפי קטגוריה'])
    pRows.push(['קטגוריה', 'אחוז', 'הוקצה', 'הוצא', 'זמין'])
    ;(par.cats || []).forEach(c => pRows.push([c.name, Math.round(c.pct) + '%', c.allocated, c.spent, c.allocated - c.spent]))
    pRows.push([])
    pRows.push(['הוצאות (קבלות)'])
    pRows.push(['ספק', 'קטגוריה', 'סכום', 'תאריך'])
    ;(receipts.parents || []).slice().reverse().forEach(r => {
      const c = par.cats.find(c => c.id === r.catId)
      pRows.push([r.store, c ? c.name : '—', r.amount, heDate(r.date)])
    })
  } else {
    pRows.push(['לא הוגדר'])
  }
  const wsPar = XLSX.utils.aoa_to_sheet(pRows)
  wsPar['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsPar, 'תשלומי הורים')

  XLSX.writeFile(wb, `דוח_כספי_${gardenName}_${academicYear()}.xlsx`)
}

async function parseExcel(file) {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const found = []
  for (const sn of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, blankrows: false })
    for (const row of rows) {
      if (!row || row.length < 2) continue
      let label = null, num = null
      for (const cell of row) {
        if (typeof cell === 'string' && cell.trim() && !label) { const t = cell.trim(); if (!/סה"?כ|סיכום|תאריך|יתרה|הוצאות|הכנסות|שם|ספק|קבלה|חודש/.test(t)) label = t }
        else if (typeof cell === 'number' && cell > 0 && num === null) num = cell
      }
      if (label && num) found.push({ name: label, amount: num })
    }
  }
  const seen = new Set(), out = []
  for (const f of found) { if (seen.has(f.name)) continue; seen.add(f.name); out.push(f); if (out.length >= 15) break }
  return out
}

function ParentsSetup({ existing, onClose, onSave, toast }) {
  const [perChild, setPerChild] = useState(existing?.perChild || '')
  const [numKids, setNumKids] = useState(existing?.numKids || '')
  const [adjust, setAdjust] = useState(existing?.adjust || '')
  const [cats, setCats] = useState(existing?.cats?.map(c => ({ id: c.id, icon: c.icon, name: c.name, amount: String(c.annualPerChild) })) || [
    { icon: 'food', name: 'הזנה', amount: '' }, { icon: 'culture', name: 'סל תרבות', amount: '' },
    { icon: 'trip', name: 'טיולים', amount: '' }, { icon: 'party', name: 'מסיבת סיום', amount: '' },
  ])
  const [excelBusy, setExcelBusy] = useState(false)
  const setCat = (i, k, v) => setCats(c => c.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const addCat = () => setCats(c => [...c, { icon: 'other', name: '', amount: '' }])
  const delCat = i => setCats(c => c.filter((_, j) => j !== i))
  const perChildN = parseFloat(perChild) || 0, kidsN = parseFloat(numKids) || 0, adjustN = parseFloat(adjust) || 0
  const expected = perChildN * kidsN - adjustN
  const catSum = cats.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  const onExcel = async e => {
    const file = e.target.files?.[0]; if (!file) return
    setExcelBusy(true)
    try { const found = await parseExcel(file); if (!found.length) toast('לא נמצאו קטגוריות בקובץ', 'bad'); else { setCats(found.map(f => ({ icon: guessIcon(f.name), name: f.name, amount: String(f.amount) }))); toast(`נחלצו ${found.length} קטגוריות`, 'good') } }
    catch { toast('שגיאה בקריאת הקובץ', 'bad') }
    setExcelBusy(false)
  }
  const save = () => {
    if (perChildN <= 0 || kidsN <= 0) { toast('צריך סכום להורה ומספר ילדים', 'bad'); return }
    const clean = cats.filter(c => c.name && parseFloat(c.amount) > 0)
    if (!clean.length) { toast('צריך לפחות קטגוריה אחת', 'bad'); return }
    const base = clean.reduce((s, c) => s + parseFloat(c.amount), 0)
    // total income already received via pulses — used to re-split allocations by the NEW percentages
    const totalReceived = (existing?.pulses || []).reduce((s, p) => s + p.amount, 0)
    const catObjs = clean.map(c => {
      const pct = (parseFloat(c.amount) / base) * 100
      const prev = existing?.cats?.find(x => x.name === c.name)
      return {
        id: c.id || uid(), icon: c.icon, name: c.name,
        annualPerChild: parseFloat(c.amount), pct,
        allocated: totalReceived * (pct / 100),   // recomputed from actual income × new %
        spent: prev?.spent || 0,                    // keep real spending
      }
    })
    onSave({ type: 'parents', perChild: perChildN, numKids: kidsN, adjust: adjustN, expected, received: existing?.received || 0, spent: existing?.spent || 0, cats: catObjs, pulses: existing?.pulses || [], year: academicYear() })
    toast('נשמר', 'good'); onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">כספי הורים</div><h3>{existing ? 'עריכת הגדרות' : 'הגדרת תקציב הורים'}</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          <div className="grid-3">
            <div className="field"><label><Coins size={14} /> תשלום שנתי להורה</label><div className="amount-field"><input className="control" type="number" value={perChild} onChange={e => setPerChild(e.target.value)} placeholder="1300" /><span className="currency">₪</span></div></div>
            <div className="field"><label><Baby size={14} /> מספר ילדים</label><input className="control" type="number" value={numKids} onChange={e => setNumKids(e.target.value)} placeholder="35" /></div>
            <div className="field"><label><Percent size={14} /> הנחות / לא שולם</label><div className="amount-field"><input className="control" type="number" value={adjust} onChange={e => setAdjust(e.target.value)} placeholder="0" /><span className="currency">₪</span></div></div>
          </div>
          <div className="expected-banner"><div><span className="lbl">צפי הכנסה כולל לשנה</span><span className="big">{nis(expected)}</span></div><div className="calc">{nis(perChildN)} × {kidsN} ילדים{adjustN > 0 ? ` − ${nis(adjustN)}` : ''}</div></div>
          <div className="field-head"><label>התפלגות שנתית (סכום לילד לכל קטגוריה)</label><label className="mini-upload">{excelBusy ? 'קורא…' : <><FileSpreadsheet size={15} /> ייבוא אקסל</>}<input type="file" accept=".xlsx,.xls,.csv" onChange={onExcel} hidden /></label></div>
          <div className="hint" style={{ marginTop: 0, marginBottom: 12 }}>כל פעימת הכנסה תתחלק אוטומטית לפי האחוזים.</div>
          {cats.map((c, i) => { const pct = catSum > 0 ? ((parseFloat(c.amount) || 0) / catSum) * 100 : 0; return (
            <div className="cat-edit" key={i}>
              <div className="cat-ic"><CatIcon name={c.icon} size={18} /></div>
              <input className="control name-in" value={c.name} onChange={e => setCat(i, 'name', e.target.value)} placeholder="שם קטגוריה" />
              <div className="amount-field amt-wrap"><input className="control amt-in" type="number" value={c.amount} onChange={e => setCat(i, 'amount', e.target.value)} placeholder="0" /><span className="currency sm">₪</span></div>
              <span className="pct-chip">{pct.toFixed(0)}%</span>
              <button className="del" onClick={() => delCat(i)}><Trash2 size={16} /></button>
            </div>) })}
          <button className="btn btn-outline btn-block" onClick={addCat} style={{ marginTop: 4, padding: 11 }}><Plus size={17} /> הוספת קטגוריה</button>
          <div className="sum-box"><div className="sum-line"><span>סה״כ התפלגות לילד</span><b>{nis(catSum)}</b></div><div className="sum-line"><span>מהתשלום השנתי ({nis(perChildN)})</span><b className={catSum <= perChildN + 0.5 ? 'sum-ok' : 'sum-bad'}>{perChildN > 0 ? Math.round(catSum / perChildN * 100) : 0}%</b></div></div>
          <button className="btn btn-clay btn-block" onClick={save} style={{ marginTop: 12 }}>שמירה</button>
        </div>
      </div>
    </div>
  )
}

function CitySetup({ existing, onClose, onSave, toast }) {
  const [note, setNote] = useState(existing?.note || '')
  const save = () => {
    onSave({ type: 'city', expected: 0, note, received: existing?.received || 0, spent: existing?.spent || 0, cats: [], pulses: existing?.pulses || [], year: academicYear() })
    toast('נשמר', 'good'); onClose()
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">קצבת עירייה</div><h3>{existing ? 'עריכת קצבה' : 'פתיחת מעקב קצבה'}</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          <div className="info-note">
            <Building2 size={20} />
            <div>בקצבת עירייה אין צורך להזין סכום שנתי מראש. פשוט רשמי כל פעימת הכנסה שמתקבלת מהעירייה, וצלמי קבלות — היתרה תתעדכן לבד.</div>
          </div>
          <div className="field"><label>הערה (רשות)</label><input className="control" value={note} onChange={e => setNote(e.target.value)} placeholder="לדוגמה: שנת תקציב 2026" /></div>
          <button className="btn btn-clay btn-block" onClick={save} style={{ marginTop: 6 }}>{existing ? 'שמירה' : 'התחלה'}</button>
        </div>
      </div>
    </div>
  )
}

function PulseModal({ budget, onClose, onSave, toast }) {
  const [amount, setAmount] = useState(''), [note, setNote] = useState(''), [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const isCity = budget.type === 'city', max = isCity ? 10 : 12, used = budget.pulses?.length || 0, amtN = parseFloat(amount) || 0
  const preview = isCity ? [] : budget.cats.map(c => ({ ...c, add: amtN * (c.pct / 100) }))
  const save = () => { if (amtN <= 0) { toast('צריך סכום', 'bad'); return } if (used >= max) { toast(`מקסימום ${max} פעימות`, 'bad'); return } onSave({ id: uid(), amount: amtN, note, date, createdAt: Date.now() }); toast('הפעימה נרשמה', 'good'); onClose() }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">{isCity ? 'קצבת עירייה' : 'כספי הורים'} · פעימה {used + 1}/{max}</div><h3>פעימת הכנסה</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          <div className="field"><label>סכום הפעימה <span className="req">*</span></label><div className="amount-field"><input className="control" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus /><span className="currency">₪</span></div><div className="hint">{isCity ? 'סכום שהתקבל מהעירייה' : 'סכום שנגבה מכלל ההורים בפעימה זו'}</div></div>
          <div className="field"><label>תאריך</label><input className="control" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="field"><label>הערה</label><input className="control" value={note} onChange={e => setNote(e.target.value)} placeholder="לדוגמה: גבייה ראשונה" /></div>
          {!isCity && amtN > 0 && <div className="sum-box"><div className="split-title">החלוקה האוטומטית:</div>{preview.map(c => <div className="sum-line" key={c.id}><span className="split-cat"><CatIcon name={c.icon} size={15} /> {c.name} <span className="dim">{c.pct.toFixed(0)}%</span></span><b>{nis1(c.add)}</b></div>)}</div>}
          <button className="btn btn-clay btn-block" onClick={save} style={{ marginTop: 10 }}>רישום הפעימה</button>
        </div>
      </div>
    </div>
  )
}

async function runOCR(base64) {
  try {
    const res = await fetch('/.netlify/functions/ocr', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    })
    if (!res.ok) return { amount: null, store: null, date: null, confidence: 0 }
    return await res.json()
  } catch { return { amount: null, store: null, date: null, confidence: 0 } }
}

function ReceiptModal({ budget, onClose, onSave, toast }) {
  const [busy, setBusy] = useState(false), [img, setImg] = useState(null), [conf, setConf] = useState(null)
  const isCity = budget.type === 'city'
  const [form, setForm] = useState({ amount: '', store: '', date: new Date().toISOString().slice(0, 10), catId: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const onFile = async e => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 6 * 1024 * 1024) { toast('קובץ גדול מדי (עד 6MB)', 'bad'); return }
    setBusy(true); const r = new FileReader()
    r.onload = async ev => { const d = ev.target.result; setImg(d); const o = await runOCR(d.split(',')[1]); setConf(o.confidence); setForm(f => ({ ...f, amount: o.amount ?? '', store: o.store ?? '', date: o.date ?? f.date })); setBusy(false) }
    r.readAsDataURL(file)
  }
  const save = () => { if (!form.amount || parseFloat(form.amount) <= 0) { toast('צריך סכום', 'bad'); return } if (!isCity && !form.catId) { toast('צריך לבחור קטגוריה', 'bad'); return } onSave({ id: uid(), amount: parseFloat(form.amount), store: form.store || 'ללא שם', date: form.date, catId: isCity ? null : form.catId, img, createdAt: Date.now() }); toast('הקבלה נשמרה', 'good'); onClose() }
  const cl = conf === null ? null : conf > 0.9 ? { t: 'זיהיתי את הפרטים — כדאי לאשר', c: 'ok' } : conf > 0.6 ? { t: 'בדקי את הפרטים', c: 'warn' } : { t: 'לא הצלחתי לקרוא — אפשר להקליד ידנית', c: 'bad' }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">{isCity ? 'קצבת עירייה' : 'כספי הורים'}</div><h3>צילום קבלה</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          {!img ? (
            <label className="dropzone"><Camera size={40} strokeWidth={1.6} /><div className="dz-title">צילום או בחירת תמונה</div><div className="hint">JPG / PNG · עד 6MB</div><input type="file" accept="image/*" onChange={onFile} hidden /></label>
          ) : <>
            <img src={img} alt="קבלה" className="receipt-preview" />
            {busy && <div className="reading">קורא את הקבלה…</div>}
            {cl && <div className={'conf ' + cl.c}>{cl.t}</div>}
            <div className="field"><label>סכום <span className="req">*</span></label><div className="amount-field"><input className="control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" /><span className="currency">₪</span></div></div>
            <div className="field"><label>חנות / ספק</label><input className="control" value={form.store} onChange={e => set('store', e.target.value)} placeholder="שם העסק" /></div>
            <div className="field"><label>תאריך <span className="req">*</span></label><input className="control" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            {!isCity && <div className="field"><label>קטגוריה <span className="req">*</span></label><div className="cat-pick">{budget.cats.map(c => <button key={c.id} className={'cat-pick-btn' + (form.catId === c.id ? ' on' : '')} onClick={() => set('catId', c.id)}><CatIcon name={c.icon} size={17} /> {c.name}</button>)}</div></div>}
            <button className="btn btn-clay btn-block" onClick={save} disabled={busy} style={{ marginTop: 6 }}>שמירת הקבלה</button>
          </>}
        </div>
      </div>
    </div>
  )
}

function BudgetPanel({ budget, receipts, onAddPulse, onAddReceipt, onEdit, onDeleteReceipt, onDeletePulse, toast }) {
  const [showPulse, setShowPulse] = useState(false), [showReceipt, setShowReceipt] = useState(false)
  const isCity = budget.type === 'city'
  const income = budget.received || 0, remaining = income - budget.spent
  const futureExpected = Math.max(0, (budget.expected || 0) - income)
  const max = isCity ? 10 : 12, pulses = budget.pulses || []
  const catNameOf = r => { const c = budget.cats.find(c => c.id === r.catId); return c ? c.name : (isCity ? 'קצבת עירייה' : '—') }
  return (
    <div className="panel">
      <div className="stat-strip">
        <div className="stat"><span className="stat-lbl">נכנס עד כה</span><span className="stat-val">{nis(income)}</span></div>
        {isCity
          ? <div className="stat"><span className="stat-lbl">פעימות שנרשמו</span><span className="stat-val">{pulses.length}</span></div>
          : <div className="stat"><span className="stat-lbl">צפי שנותר להיכנס</span><span className="stat-val amber">{nis(futureExpected)}</span></div>}
        <div className="stat"><span className="stat-lbl">הוצאות</span><span className="stat-val">{nis(budget.spent)}</span></div>
        <div className="stat"><span className="stat-lbl">יתרה בקופה</span><span className="stat-val teal">{nis(remaining)}</span></div>
      </div>
      {!isCity && (
        <div className="income-progress"><div className="ip-head"><span>התקדמות גבייה</span><span>{budget.expected > 0 ? Math.round(income / budget.expected * 100) : 0}% מתוך {nis(budget.expected)}</span></div><div className="ip-track"><span style={{ width: (budget.expected > 0 ? Math.min(100, income / budget.expected * 100) : 0) + '%' }} /></div></div>
      )}
      <div className="panel-actions">
        <button className="pa-btn primary" onClick={() => setShowPulse(true)} disabled={pulses.length >= max}><TrendingUp size={18} /> {pulses.length >= max ? 'הושלמו הפעימות' : 'פעימת הכנסה'} <span className="pa-count">{pulses.length}/{max}</span></button>
        <button className="pa-btn" onClick={() => setShowReceipt(true)}><Camera size={18} /> צילום קבלה</button>
        <button className="pa-btn ghost" onClick={onEdit}><PencilLine size={16} /> {isCity ? 'עריכת קצבה' : 'הגדרות'}</button>
      </div>
      {!isCity && budget.cats.length > 0 && (
        <div className="cat-cards">{budget.cats.map(c => { const left = c.allocated - c.spent, pct = c.allocated > 0 ? Math.min(100, c.spent / c.allocated * 100) : 0; return (
          <div className="cat-card" key={c.id}>
            <div className="cc-top"><div className="cc-ic"><CatIcon name={c.icon} size={20} /></div><span className="cc-pct">{c.pct.toFixed(0)}%</span></div>
            <div className="cc-name">{c.name}</div>
            <div className="cc-nums"><span className="cc-avail">{nis(left)}</span><span className="cc-lbl">זמין</span></div>
            <div className="cc-track"><span style={{ width: pct + '%' }} /></div>
            <div className="cc-foot">הוקצה {nis(c.allocated)} · הוצא {nis(c.spent)}</div>
          </div>) })}</div>
      )}
      {pulses.length > 0 && (
        <div className="log-block"><div className="log-title"><TrendingUp size={16} /> פעימות הכנסה</div><div className="log-list">{pulses.map((p, i) => <div className="log-row" key={p.id}><span className="log-idx">{i + 1}</span><div className="log-main"><div className="log-a">{nis(p.amount)}</div>{p.note && <div className="log-note">{p.note}</div>}</div><span className="log-date">{heDate(p.date)}</span><button className="log-del" onClick={() => { if (confirm('למחוק את הפעימה? הסכום יתבטל גם מהקטגוריות.')) onDeletePulse(p.id) }} title="מחיקת פעימה"><Trash2 size={15} /></button></div>)}</div></div>
      )}
      <div className="log-block">
        <div className="log-title"><Receipt size={16} /> קבלות {receipts.length > 0 && <span className="dim">({receipts.length})</span>}</div>
        {receipts.length === 0 ? <div className="empty-rows">עדיין אין קבלות. צלמי את הראשונה.</div> : (
          <div className="rtable">
            <div className="rtable-head"><span>ספק</span><span>קטגוריה</span><span>תאריך</span><span>סכום</span><span></span></div>
            {receipts.map(r => (
              <div className="rtable-row" key={r.id}>
                <span className="rt-store">{r.img && <img src={r.img} className="rt-thumb" />}{r.store}</span>
                <span className="rt-cat">{catNameOf(r)}</span>
                <span className="rt-date">{heDate(r.date)}</span>
                <span className="rt-amt">{nis(r.amount)}</span>
                <button className="rt-del" onClick={() => onDeleteReceipt(r.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showPulse && <PulseModal budget={budget} onClose={() => setShowPulse(false)} onSave={onAddPulse} toast={toast} />}
      {showReceipt && <ReceiptModal budget={budget} onClose={() => setShowReceipt(false)} onSave={onAddReceipt} toast={toast} />}
    </div>
  )
}

function AdminPanel({ onClose, toast }) {
  const [list, setList] = useState(null)
  const [reqs, setReqs] = useState([])
  const [pays, setPays] = useState([])
  const [price, setPrice] = useState('')
  useEffect(() => {
    (async () => {
      const { data } = await supa.from('profiles').select('*').order('created_at', { ascending: true })
      setList(data || [])
      const { data: rq } = await supa.from('subscription_requests').select('*').eq('status', 'pending')
      setReqs(rq || [])
      const { data: pp } = await supa.from('payments').select('*').eq('status', 'pending').order('created_at', { ascending: true })
      setPays(pp || [])
      const { data: st } = await supa.from('billing_settings').select('*').eq('id', 1).single()
      if (st) setPrice(String(st.monthly_price))
    })()
  }, [])
  const savePrice = async () => {
    const v = Number(price)
    if (!v || v <= 0) { toast('מחיר לא תקין', 'bad'); return }
    const { error } = await supa.from('billing_settings').update({ monthly_price: v, updated_at: new Date().toISOString() }).eq('id', 1)
    toast(error ? 'שמירת המחיר נכשלה' : 'מחיר המנוי עודכן', error ? 'bad' : 'good')
  }
  const approvePay = async p => {
    const { error } = await supa.rpc('approve_payment', { p_payment_id: p.id })
    if (error) { toast('אישור התשלום נכשל', 'bad'); return }
    setPays(ps => ps.filter(x => x.id !== p.id))
    setReqs(r => r.filter(x => x.user_id !== p.user_id))
    const until = u => { const base = new Date(Math.max(Date.now(), u.paid_until ? new Date(u.paid_until).getTime() : 0)); base.setMonth(base.getMonth() + (p.months || 1)); return base.toISOString() }
    setList(l => l.map(u => u.id === p.user_id ? { ...u, plan: 'paid', status: 'active', paid_until: until(u) } : u))
    toast('התשלום אושר והמנוי הופעל', 'good')
  }
  const cancelPay = async p => {
    const { error } = await supa.rpc('cancel_payment', { p_payment_id: p.id })
    if (error) { toast('הפעולה נכשלה', 'bad'); return }
    setPays(ps => ps.filter(x => x.id !== p.id))
    toast('הבקשה בוטלה', 'good')
  }
  const patch = async (id, fields, msg) => {
    const { error } = await supa.from('profiles').update(fields).eq('id', id)
    if (error) { toast('הפעולה נכשלה', 'bad'); return false }
    setList(l => l.map(u => u.id === id ? { ...u, ...fields } : u))
    if (msg) toast(msg, 'good')
    return true
  }
  const extendTrial = u => {
    const base = Math.max(Date.now(), new Date(u.trial_ends_at || 0).getTime())
    patch(u.id, { trial_ends_at: new Date(base + 30 * 86400000).toISOString(), plan: 'trial' }, 'תקופת הניסיון הוארכה ב־30 יום')
  }
  const activateSub = async u => {
    const base = new Date(Math.max(Date.now(), u.paid_until ? new Date(u.paid_until).getTime() : 0))
    base.setMonth(base.getMonth() + 1)
    const ok = await patch(u.id, { plan: 'paid', paid_until: base.toISOString(), status: 'active' }, 'המנוי הופעל לחודש')
    if (ok) {
      await supa.from('subscription_requests').update({ status: 'handled' }).eq('user_id', u.id).eq('status', 'pending')
      setReqs(r => r.filter(x => x.user_id !== u.id))
    }
  }
  const toggleBlock = u => patch(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' }, u.status === 'blocked' ? 'הגישה שוחזרה' : 'הגישה הושהתה')
  const chip = u => {
    if (u.status === 'blocked') return <span className="chip chip-red"><Ban size={11} /> חסומה</span>
    if (u.is_admin) return <span className="chip chip-purple"><Shield size={11} /> אדמין</span>
    if (u.paid_until && new Date(u.paid_until) > new Date()) return <span className="chip chip-green"><CheckCircle2 size={11} /> מנוי עד {heDate(u.paid_until)}</span>
    if (u.trial_ends_at && new Date(u.trial_ends_at) > new Date()) return <span className="chip chip-blue"><Clock size={11} /> ניסיון עד {heDate(u.trial_ends_at)}</span>
    return <span className="chip chip-gray"><Clock size={11} /> פג תוקף</span>
  }
  const now = new Date()
  const stats = {
    total: list?.length || 0,
    paid: list?.filter(u => u.paid_until && new Date(u.paid_until) > now).length || 0,
    blocked: list?.filter(u => u.status === 'blocked').length || 0,
    pending: reqs.length,
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">ניהול מערכת</div><h3>משתמשות רשומות</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          <div className="admin-stats">
            <div className="astat"><span className="astat-n">{stats.total}</span><span className="astat-l">משתמשות</span></div>
            <div className="astat"><span className="astat-n">{stats.paid}</span><span className="astat-l">מנויות</span></div>
            <div className="astat"><span className="astat-n">{stats.blocked}</span><span className="astat-l">חסומות</span></div>
            <div className="astat"><span className="astat-n astat-amber">{pays.length}</span><span className="astat-l">תשלומים לאישור</span></div>
          </div>
          <div className="admin-price">
            <span className="ap-lbl"><CreditCard size={14} /> מחיר מנוי חודשי</span>
            <div className="ap-row"><input className="control ap-input" type="number" value={price} onChange={e => setPrice(e.target.value)} /><span className="ap-cur">₪</span><button className="abtn abtn-green" onClick={savePrice}>שמירה</button></div>
          </div>
          {pays.length > 0 && list && (
            <div className="admin-pays">
              <div className="log-title"><CreditCard size={15} /> תשלומים ממתינים לאישור</div>
              {pays.map(p => { const u = list.find(x => x.id === p.user_id); return (
                <div className="pay-row" key={p.id}>
                  <div className="pay-main"><b>{u?.full_name || u?.email || '—'}</b><span className="pay-meta">{nis(p.amount)} · {p.months === 1 ? 'חודש אחד' : p.months + ' חודשים'} · {heDate(p.created_at)}</span></div>
                  <div className="pay-actions">
                    <button className="abtn abtn-green" onClick={() => approvePay(p)}><CheckCircle2 size={13} /> התשלום התקבל</button>
                    <button className="abtn abtn-red" onClick={() => cancelPay(p)}><X size={13} /> ביטול</button>
                  </div>
                </div>
              )})}
              <p className="foot-note" style={{ margin: '6px 0 0' }}>לאחר גביית התשלום (העברה / ביט / סליקה עתידית) — לחצי "התשלום התקבל" והמנוי יופעל אוטומטית.</p>
            </div>
          )}
          {list === null ? <div className="foot-note">טוען…</div> : (
            <div className="admin-list">
              {list.map(u => (
                <div className={'admin-row' + (u.status === 'blocked' ? ' is-blocked' : '')} key={u.id}>
                  <div className="admin-av">{(u.full_name || u.email || '?')[0]}</div>
                  <div className="admin-main">
                    <div className="admin-name">{u.full_name || '—'} {chip(u)} {reqs.some(r => r.user_id === u.id) && <span className="chip chip-amber"><CreditCard size={11} /> ביקשה מנוי</span>}</div>
                    <div className="admin-meta"><Mail size={12} /> {u.email} {u.garden_name ? '· ' + u.garden_name : ''}</div>
                    {!u.is_admin && (
                      <div className="admin-actions">
                        <button className="abtn" onClick={() => extendTrial(u)}><Clock size={13} /> +30 ימי ניסיון</button>
                        <button className="abtn abtn-green" onClick={() => activateSub(u)}><CreditCard size={13} /> הפעלת מנוי לחודש</button>
                        <button className={'abtn ' + (u.status === 'blocked' ? 'abtn-green' : 'abtn-red')} onClick={() => toggleBlock(u)}><Ban size={13} /> {u.status === 'blocked' ? 'שחרור חסימה' : 'חסימה'}</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ profile, access, onLogout, toast }) {
  const [budgets, setBudgets] = useState({})
  const [receipts, setReceipts] = useState({ city: [], parents: [] })
  const [tab, setTab] = useState('city')
  const [setupFor, setSetupFor] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // load from cloud
  useEffect(() => {
    (async () => {
      const { data: b } = await supa.from('budgets').select('city, parents').eq('user_id', profile.id).single()
      if (b) setBudgets({ ...(b.city ? { city: b.city } : {}), ...(b.parents ? { parents: b.parents } : {}) })
      const { data: r } = await supa.from('receipts').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      if (r) {
        const grouped = { city: [], parents: [] }
        r.forEach(row => grouped[row.budget_type].push({ id: row.id, amount: Number(row.amount), store: row.store, date: row.receipt_date, catId: row.cat_id, img: row.img }))
        setReceipts(grouped)
      }
      setLoaded(true)
    })()
  }, [profile.id])

  // save budgets to cloud (debounced) — only after initial load
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => {
      supa.from('budgets').upsert({ user_id: profile.id, city: budgets.city || null, parents: budgets.parents || null, updated_at: new Date().toISOString() }).then(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [budgets, loaded])

  const doExport = async () => {
    if (!budgets.city && !budgets.parents) { toast('אין עדיין נתונים לייצוא', 'bad'); return }
    try { await exportExcel(budgets, receipts, profile.garden_name); toast('הקובץ הורד', 'good') }
    catch { toast('שגיאה בייצוא', 'bad') }
  }
  const saveBudget = (type, data) => setBudgets(b => ({ ...b, [type]: { ...(b[type] || {}), ...data } }))
  const addPulse = (type, pulse) => setBudgets(b => { const bd = b[type]; const nb = { ...bd, received: (bd.received || 0) + pulse.amount, pulses: [...(bd.pulses || []), pulse] }; if (type === 'parents') nb.cats = bd.cats.map(c => ({ ...c, allocated: c.allocated + pulse.amount * (c.pct / 100) })); return { ...b, [type]: nb } })
  const delPulse = (type, id) => setBudgets(b => {
    const bd = b[type]; const p = (bd.pulses || []).find(x => x.id === id); if (!p) return b
    const nb = { ...bd, received: Math.max(0, (bd.received || 0) - p.amount), pulses: bd.pulses.filter(x => x.id !== id) }
    if (type === 'parents') nb.cats = bd.cats.map(c => ({ ...c, allocated: Math.max(c.spent, c.allocated - p.amount * (c.pct / 100)) }))
    return { ...b, [type]: nb }
  })
  const addReceipt = async (type, r) => {
    setReceipts(rs => ({ ...rs, [type]: [r, ...(rs[type] || [])] }))
    setBudgets(b => { const bd = b[type]; const nb = { ...bd, spent: (bd.spent || 0) + r.amount }; if (type === 'parents' && r.catId) nb.cats = bd.cats.map(c => c.id === r.catId ? { ...c, spent: c.spent + r.amount } : c); return { ...b, [type]: nb } })
    await supa.from('receipts').insert({ id: r.id, user_id: profile.id, budget_type: type, cat_id: r.catId, amount: r.amount, store: r.store, receipt_date: r.date, img: r.img })
  }
  const delReceipt = async (type, id) => {
    const r = (receipts[type] || []).find(x => x.id === id); if (!r) return
    setReceipts(rs => ({ ...rs, [type]: rs[type].filter(x => x.id !== id) }))
    setBudgets(b => { const bd = b[type]; const nb = { ...bd, spent: Math.max(0, (bd.spent || 0) - r.amount) }; if (type === 'parents' && r.catId) nb.cats = bd.cats.map(c => c.id === r.catId ? { ...c, spent: Math.max(0, c.spent - r.amount) } : c); return { ...b, [type]: nb } })
    await supa.from('receipts').delete().eq('id', id)
  }
  const current = budgets[tab]
  return (
    <div className="app-shell">
      <header className="topbar"><div className="topbar-inner">
        <div className="brand"><div className="brand-mark"><Wallet size={24} strokeWidth={2.4} /></div><div><div className="brand-name">גן־ריפורט</div><div className="brand-sub">{profile.garden_name}</div></div></div>
        <div className="who"><span className="badge-year"><Calendar size={14} /> {academicYear()}</span>{access?.state === 'trial' && <span className="badge-trial"><Clock size={13} /> ניסיון · {access.daysLeft} ימים</span>}{access?.state === 'paid' && <span className="badge-paid"><CheckCircle2 size={13} /> מנוי עד {heDate(access.until)}</span>}{profile.is_admin && <button className="badge-admin clickable" onClick={() => setShowAdmin(true)}><Sparkles size={13} /> ניהול מערכת</button>}<button className="btn-export" onClick={doExport}><Download size={16} /> אקסל</button><span className="who-name">{profile.full_name}</span><button className="btn-ghost" onClick={onLogout}><LogOut size={16} /></button></div>
      </div></header>
      <div className="tabs-bar"><div className="tabs-inner">
        <button className={'tab' + (tab === 'city' ? ' on' : '')} onClick={() => setTab('city')}><div className="tab-ic"><Building2 size={22} /></div><div className="tab-txt"><div className="tab-name">קצבת עירייה</div><div className="tab-sub">{budgets.city ? nis(budgets.city.received || 0) + ' נכנס' : 'לא הוגדר'}</div></div></button>
        <button className={'tab' + (tab === 'parents' ? ' on' : '')} onClick={() => setTab('parents')}><div className="tab-ic"><Users size={22} /></div><div className="tab-txt"><div className="tab-name">תשלומי הורים</div><div className="tab-sub">{budgets.parents ? nis(budgets.parents.received || 0) + ' נכנס' : 'לא הוגדר'}</div></div></button>
      </div></div>
      <main className="wrap">
        {!current ? (
          <div className="empty"><div className="empty-ic">{tab === 'city' ? <Building2 size={46} strokeWidth={1.5} /> : <Users size={46} strokeWidth={1.5} />}</div><h2>{tab === 'city' ? 'מעקב קצבת עירייה' : 'הגדרת תשלומי הורים'}</h2><p>{tab === 'city' ? 'אין צורך בסכום שנתי מראש — פשוט רשמי כל פעימת הכנסה מהעירייה וצלמי קבלות, והיתרה תתעדכן לבד.' : 'הגדירי כמה משלם כל הורה, מספר הילדים, וההתפלגות בין הקטגוריות — או ייבאי אקסל.'}</p><button className="btn btn-primary" onClick={() => setSetupFor(tab)}><Plus size={18} /> {tab === 'city' ? 'התחלת מעקב' : 'הגדרת תקציב'}</button></div>
        ) : (
          <BudgetPanel budget={current} receipts={receipts[tab] || []} onAddPulse={(p) => addPulse(tab, p)} onAddReceipt={(r) => addReceipt(tab, r)} onDeleteReceipt={(id) => delReceipt(tab, id)} onDeletePulse={(id) => delPulse(tab, id)} onEdit={() => setSetupFor(tab)} toast={toast} />
        )}
      </main>
      {setupFor === 'city' && <CitySetup existing={budgets.city} onClose={() => setSetupFor(null)} onSave={(d) => saveBudget('city', d)} toast={toast} />}
      {setupFor === 'parents' && <ParentsSetup existing={budgets.parents} onClose={() => setSetupFor(null)} onSave={(d) => saveBudget('parents', d)} toast={toast} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} toast={toast} />}
    </div>
  )
}

function CompleteProfile({ session, onDone, toast }) {
  const [gardenName, setGardenName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!gardenName.trim()) { toast('צריך שם גן', 'bad'); return }
    setBusy(true)
    const { data, error } = await supa.from('profiles')
      .update({ garden_name: gardenName.trim(), phone: phone.trim() || null })
      .eq('id', session.user.id).select().single()
    if (error) { toast('שגיאה בשמירה, נסי שוב', 'bad'); setBusy(false); return }
    toast('ברוכה הבאה!', 'good')
    onDone(data)
  }
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-hero"><div className="mark"><Wallet size={34} strokeWidth={2.4} /></div><h1>גן־ריפורט</h1><p>עוד פרט אחד קטן ומתחילים</p></div>
        <div className="login-card">
          <h3>כמעט סיימנו</h3>
          <p className="subt">נכנסת עם Google — נשאר רק להשלים את פרטי הגן</p>
          <div className="field"><label>שם הגן <span className="req">*</span></label><input className="control" value={gardenName} onChange={e => setGardenName(e.target.value)} placeholder="גן היהלום" /></div>
          <div className="field"><label>טלפון</label><input className="control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="050-0000000" type="tel" /></div>
          <button className="btn btn-primary btn-block" onClick={save} disabled={busy} style={{ marginTop: 6 }}>{busy ? 'רגע…' : 'סיום והתחלה'}</button>
        </div>
      </div>
    </div>
  )
}

function BlockedScreen({ onLogout }) {
  return (
    <div className="login-page"><div className="login-box">
      <div className="login-hero"><div className="mark"><Wallet size={34} strokeWidth={2.4} /></div><h1>גן־ריפורט</h1></div>
      <div className="login-card">
        <div className="gate-done"><Ban size={40} /><h3>החשבון הושהה</h3><p className="subt">הגישה למערכת הושהתה על ידי מנהלת המערכת. אם נראה לך שמדובר בטעות — פני אליה ישירות.</p></div>
        <button className="btn-ghost gate-out" onClick={onLogout}><LogOut size={15} /> יציאה</button>
      </div>
    </div></div>
  )
}

function SubscribeScreen({ profile, onLogout, toast }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [settings, setSettings] = useState(null)
  useEffect(() => {
    (async () => {
      const { data } = await supa.from('billing_settings').select('*').eq('id', 1).single()
      setSettings(data || { monthly_price: 29, currency: 'ILS', provider: '' })
      // אם כבר יש תשלום ממתין — להציג את מסך "הבקשה התקבלה"
      const { data: pend } = await supa.from('payments').select('id').eq('user_id', profile.id).eq('status', 'pending').limit(1)
      if (pend && pend.length) setSent(true)
    })()
  }, [])
  const request = async () => {
    setBusy(true)
    const price = settings?.monthly_price ?? 29
    // כשתחובר מערכת סליקה (settings.provider), הפונקציה create-checkout תחזיר קישור לעמוד תשלום
    if (settings?.provider) {
      try {
        const res = await fetch('/.netlify/functions/create-checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: profile.id, email: profile.email, amount: price, months: 1 }),
        })
        const j = await res.json()
        if (j?.checkout_url) { window.location.href = j.checkout_url; return }
      } catch { /* נופל חזרה לבקשה ידנית */ }
    }
    const { error } = await supa.from('payments').insert({ user_id: profile.id, amount: price, months: 1, note: 'בקשת מנוי חודשי' })
    if (!error) await supa.from('subscription_requests').insert({ user_id: profile.id })
    setBusy(false)
    if (error) { toast('שליחת הבקשה נכשלה, נסי שוב', 'bad'); return }
    setSent(true)
  }
  return (
    <div className="login-page"><div className="login-box">
      <div className="login-hero"><div className="mark"><Wallet size={34} strokeWidth={2.4} /></div><h1>גן־ריפורט</h1><p>שלום {profile.full_name}</p></div>
      <div className="login-card">
        {sent ? (
          <div className="gate-done"><CheckCircle2 size={40} /><h3>הבקשה התקבלה!</h3><p className="subt">מנהלת המערכת תיצור איתך קשר להסדרת התשלום, והמנוי יופעל מיד לאחר מכן. הנתונים שלך שמורים ומחכים לך.</p></div>
        ) : (<>
          <h3>תקופת הניסיון הסתיימה</h3>
          <p className="subt">הנתונים שלך שמורים בענן. כדי להמשיך לנהל את כספי הגן, הצטרפי למנוי:</p>
          <div className="sub-card">
            <div className="sub-name"><CreditCard size={18} /> מנוי גן־ריפורט</div>
            {settings && <div className="sub-price">{nis(settings.monthly_price)}<span> / חודש</span></div>}
            <ul className="sub-feats">
              <li>מעקב קצבת עירייה ותשלומי הורים</li>
              <li>סריקת קבלות וייצוא לאקסל</li>
              <li>גיבוי בענן וסנכרון בין מכשירים</li>
            </ul>
          </div>
          <button className="btn btn-primary btn-block" onClick={request} disabled={busy}>{busy ? 'רגע…' : 'אני רוצה להצטרף למנוי'}</button>
          <p className="foot-note" style={{ textAlign: 'center', marginTop: 8 }}>בקרוב: תשלום מקוון ישירות מכאן</p>
        </>)}
        <button className="btn-ghost gate-out" onClick={onLogout}><LogOut size={15} /> יציאה</button>
      </div>
    </div></div>
  )
}

export default function App() {
  const [toast, toastNode] = useToasts()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supa.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false) })
    const { data: sub } = supa.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setProfile(null); setLoading(false) } })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    let tries = 0
    const load = async () => {
      const { data } = await supa.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) { setProfile(data); setLoading(false) }
      else if (tries++ < 5) setTimeout(load, 600) // profile trigger may lag a moment after signup
      else setLoading(false)
    }
    load()
  }, [session])

  const onLogout = async () => { await supa.auth.signOut() }

  if (loading && session) return <div className="login-page"><div className="foot-note">טוען…</div></div>
  const access = accessOf(profile)
  return (<>{!session || !profile ? <AuthScreen toast={toast} /> : access.state === 'blocked' ? <BlockedScreen onLogout={onLogout} /> : !profile.garden_name ? <CompleteProfile session={session} toast={toast} onDone={setProfile} /> : access.state === 'expired' ? <SubscribeScreen profile={profile} onLogout={onLogout} toast={toast} /> : <Dashboard profile={profile} access={access} onLogout={onLogout} toast={toast} />}{toastNode}</>)
}
