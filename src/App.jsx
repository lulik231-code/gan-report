import { useState, useEffect } from 'react'
import {
  Building2, Users, Camera, Plus, X, Trash2, Wallet, TrendingUp,
  FileSpreadsheet, PencilLine, LogOut, Calendar, Sparkles, Receipt,
  UtensilsCrossed, Bus, Palette, PartyPopper, BookOpen, Package,
  Coins, Baby, Percent, Download, Shield, Mail, ChevronLeft,
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

function AdminPanel({ onClose }) {
  const [list, setList] = useState(null)
  useEffect(() => {
    supa.from('profiles').select('*').order('created_at', { ascending: true }).then(({ data }) => setList(data || []))
  }, [])
  const stats = { total: list?.length || 0, admins: list?.filter(u => u.is_admin).length || 0 }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><div className="eyebrow">ניהול מערכת</div><h3>משתמשות רשומות</h3></div><button className="modal-x" onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">
          <div className="admin-stats">
            <div className="astat"><span className="astat-n">{stats.total}</span><span className="astat-l">משתמשות</span></div>
            <div className="astat"><span className="astat-n">{stats.admins}</span><span className="astat-l">מנהלות</span></div>
          </div>
          {list === null ? <div className="foot-note">טוען…</div> : (
            <div className="admin-list">
              {list.map(u => (
                <div className="admin-row" key={u.id}>
                  <div className="admin-av">{(u.full_name || u.email)[0]}</div>
                  <div className="admin-main">
                    <div className="admin-name">{u.full_name} {u.is_admin && <span className="admin-tag"><Shield size={11} /> אדמין</span>}</div>
                    <div className="admin-meta"><Mail size={12} /> {u.email} · {u.garden_name}</div>
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

function Dashboard({ profile, onLogout, toast }) {
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
        <div className="who"><span className="badge-year"><Calendar size={14} /> {academicYear()}</span>{profile.is_admin && <button className="badge-admin clickable" onClick={() => setShowAdmin(true)}><Sparkles size={13} /> ניהול מערכת</button>}<button className="btn-export" onClick={doExport}><Download size={16} /> אקסל</button><span className="who-name">{profile.full_name}</span><button className="btn-ghost" onClick={onLogout}><LogOut size={16} /></button></div>
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
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
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
  return (<>{!session || !profile ? <AuthScreen toast={toast} /> : <Dashboard profile={profile} onLogout={onLogout} toast={toast} />}{toastNode}</>)
}
