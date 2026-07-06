// buildOfficialWorkbook — משכפל את פורמט טופס הדיווח הרשמי (הקצבת עירייה + תשלומי הורים)
// data: { gardenName, year, city: {pulses, prevBalance?}, parents: {perChild, cats, pulses, prevBalance?}, receipts: {city:[], parents:[]} }
export async function buildOfficialWorkbook(ExcelJS, data) {
  const wb = new ExcelJS.Workbook()
  const FS = 'FreeSans', CA = 'Calibri'
  const C = { blue: 'FF00B0F0', red: 'FFFF0000', yellow: 'FFFFFF00', green: 'FF92D050', purple: 'FF7030A0', pink: 'FFFED2F9', orange: 'FFFFC000', gray: 'FFD8D8D8', lblue: 'FF9CC2E5' }
  const fill = c => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } })
  const thin = { style: 'thin' }, med = { style: 'medium' }
  const boxT = { top: thin, bottom: thin, left: thin, right: thin }
  const boxM = { top: med, bottom: med, left: med, right: med }
  const ACC = '_ * #,##0_ ;_ * -#,##0_ ;_ * -??_ ;_ @_ '
  const set = (ws, r, c, v, o = {}) => {
    const cell = ws.getCell(r, c)
    if (v !== undefined && v !== null) cell.value = v
    cell.font = { name: o.numFont ? CA : FS, size: o.size || 11, bold: !!o.bold }
    if (o.fill) cell.fill = fill(o.fill)
    if (o.border) cell.border = o.border
    if (o.fmt) cell.numFmt = o.fmt
    if (o.center) cell.alignment = { horizontal: 'center', vertical: 'middle' }
    return cell
  }
  const F = f => ({ formula: f })
  const sortAsc = a => (a || []).slice().sort((x, y) => String(x.date || '').localeCompare(String(y.date || '')))
  const dt = s => { const d = new Date(s); return isNaN(d) ? null : d }

  // ================= גיליון הקצבת עירייה =================
  {
    const ws = wb.addWorksheet('הקצבת עירייה', { views: [{ rightToLeft: true }] })
    ws.columns = [{ width: 11 }, { width: 10.5 }, { width: 8.7 }, { width: 11.4 }, { width: 20 }, { width: 10 }, { width: 12.4 }, { width: 8.7 }, { width: 13 }, { width: 8.7 }, { width: 12 }, { width: 8.7 }, { width: 8.7 }, { width: 8.7 }]
    ws.mergeCells(1, 1, 1, 14)
    set(ws, 1, 1, `הקצבות עירייה — ${data.gardenName || ''}`, { fill: C.blue, size: 18, center: true })
    const pulses = sortAsc(data.city?.pulses)
    pulses.forEach((p, i) => {
      set(ws, 2 + i, 1, p.note || `פעימה ${i + 1}`, { border: boxT })
      set(ws, 2 + i, 2, p.amount, { fill: C.yellow, border: boxT, numFont: true })
    })
    const sumRow = Math.max(9, 2 + pulses.length + 1)
    for (let r = 2 + pulses.length; r < sumRow; r++) { set(ws, r, 1, null, { border: boxT }); set(ws, r, 2, null, { fill: C.yellow, border: boxT }) }
    set(ws, sumRow, 1, 'סה"כ', { fill: C.green, border: boxT })
    set(ws, sumRow, 2, F(`SUM(B2:B${sumRow - 1})`), { fill: C.green, border: boxT, numFont: true })
    // יתרה משנה קודמת
    ws.mergeCells(2, 4, 2, 6)
    set(ws, 2, 4, 'יתרה משנה קודמת', { bold: true, border: boxM, center: true })
    set(ws, 2, 7, data.city?.prevBalance ?? null, { fill: C.pink, bold: true, border: boxM, numFont: true })
    // טבלת הוצאות
    const tTitle = sumRow - 2, tHead = sumRow - 1
    ws.mergeCells(tTitle, 4, tTitle, 7)
    set(ws, tTitle, 4, 'הקצבת עירייה', { fill: C.orange, border: boxT, center: true })
    set(ws, tHead, 5, 'פירוט', { border: boxT }); set(ws, tHead, 6, 'סכום', { border: boxT }); set(ws, tHead, 7, 'יתרה', { border: boxT, fmt: '0' })
    set(ws, sumRow, 4, 'הכנסה בפועל', { border: boxT })
    set(ws, sumRow, 7, F(`B${sumRow}+G2`), { border: boxT, bold: true, numFont: true, fmt: '0.00' })
    const exp = sortAsc(data.receipts?.city)
    const rows = exp.length + 3
    for (let i = 0; i < rows; i++) {
      const r = sumRow + 1 + i, e = exp[i]
      set(ws, r, 4, 'הוצאה', { border: boxT })
      set(ws, r, 5, e ? e.store : null, { border: boxT })
      set(ws, r, 6, e ? e.amount : null, { border: boxT, fmt: '0.00' })
      set(ws, r, 7, F(`G${r - 1}-F${r}`), { border: boxT, fmt: '0.00' })
    }
    const eSum = sumRow + rows + 1
    set(ws, eSum, 5, 'סה"כ', { border: boxT, bold: true })
    set(ws, eSum, 6, F(`SUM(F${sumRow + 1}:F${eSum - 1})`), { border: boxT, bold: true, numFont: true, fmt: '0.00' })
    // קופסת סיכום
    ws.mergeCells(2, 9, 2, 10); set(ws, 2, 9, 'יתרה בכרטיס ', { fill: C.purple, size: 16, border: boxT })
    ws.mergeCells(2, 11, 2, 14); set(ws, 2, 11, F('K7'), { fill: C.purple, size: 16, numFont: true, fmt: ACC })
    ws.mergeCells(4, 9, 4, 10); set(ws, 4, 9, 'סה"כ הקצבות עירייה', { fill: C.green, border: boxT })
    set(ws, 4, 11, F(`B${sumRow}+G2`), { fill: C.green, border: boxT, numFont: true, fmt: '0.00' })
    set(ws, 5, 9, 'סה"כ הוצאות ', { fill: C.red, border: boxT })
    set(ws, 5, 11, F(`F${eSum}`), { fill: C.red, border: boxT, numFont: true, fmt: '0.00' })
    ws.mergeCells(7, 9, 7, 10); set(ws, 7, 9, 'יתרה בהקצבות עירייה', { fill: C.gray, border: boxT })
    set(ws, 7, 11, F('K4-K5'), { fill: C.gray, border: boxT, numFont: true, fmt: '0.00' })
  }

  // ================= גיליון תשלומי הורים =================
  {
    const par = data.parents || { cats: [], pulses: [] }
    const cats = par.cats || []
    const ws = wb.addWorksheet('תשלומי הורים', { views: [{ rightToLeft: true }] })
    const cols = [{ width: 11 }, { width: 10.5 }, { width: 10 }, { width: 8.7 }, { width: 3 }]
    cats.forEach(() => cols.push({ width: 12 }, { width: 24 }, { width: 10 }, { width: 12 }, { width: 3 }, { width: 3 }))
    ws.columns = cols
    ws.mergeCells(1, 1, 1, 16)
    set(ws, 1, 1, 'תשלומי הורים -  עודף יוחזר בסוף השנה ', { fill: C.red, size: 18, center: true })
    set(ws, 2, 1, `טופס דיווח הכנסות והוצאות - גני ילדים - ${data.gardenName || ''} - שנת לימוד ${data.year || ''}`, { bold: true, size: 14 })

    // יתרה משנה קודמת — סעיף עצמאי אחד (לא מתחלק בין הקטגוריות)
    ws.mergeCells(5, 1, 5, 2)
    set(ws, 5, 1, 'יתרה משנה קודמת', { bold: true, border: boxM, center: true })
    set(ws, 5, 3, par.prevBalance || null, { fill: C.pink, bold: true, border: boxM, numFont: true, fmt: '0.00' })
    // פעימות הכנסה — מחצית א (עד 31/12) ומחצית ב
    const all = sortAsc(par.pulses)
    const h1 = all.filter(p => { const d = dt(p.date); return !d || d.getMonth() >= 7 }) // אוג-דצמ
    const h2 = all.filter(p => { const d = dt(p.date); return d && d.getMonth() < 7 })
    set(ws, 8, 1, 'מחצית א', { fill: C.blue }); set(ws, 8, 2, 'הכנסות', { fill: C.blue, bold: true }); set(ws, 8, 3, 'תאריך', { fill: C.blue })
    const pulseCells = []
    h1.slice(0, 6).forEach((p, i) => {
      set(ws, 10 + i, 1, `פעימה ${i + 1}`)
      set(ws, 10 + i, 2, p.amount, { fill: C.yellow, border: boxT, numFont: true }); pulseCells.push(`B${10 + i}`)
      const d = dt(p.date); if (d) set(ws, 10 + i, 3, d, { fill: C.yellow, border: boxT, numFont: true, fmt: 'd-mmm' })
    })
    set(ws, 17, 1, 'מחצית 2', { fill: C.lblue }); set(ws, 17, 2, 'הכנסות', { fill: C.lblue, bold: true }); set(ws, 17, 3, 'תאריך', { fill: C.lblue })
    h2.slice(0, 6).forEach((p, i) => {
      set(ws, 19 + i, 1, `פעימה ${i + 1}`)
      set(ws, 19 + i, 2, p.amount, { fill: C.yellow, border: boxT, numFont: true }); pulseCells.push(`B${19 + i}`)
      const d = dt(p.date); if (d) set(ws, 19 + i, 3, d, { fill: C.yellow, border: boxT, numFont: true, fmt: 'd-mmm' })
    })

    // בלוקים של קטגוריות
    const perChild = par.perChild || cats.reduce((s, c) => s + (c.annualPerChild || 0), 0)
    const recAll = data.receipts?.parents || []
    const maxLen = Math.max(0, ...cats.map(c => recAll.filter(r => r.catId === c.id).length))
    const bodyRows = maxLen + 3
    const sumTotalRow = 26, sumExpRow = 28, balRow = 30
    const colLetter = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26 } return s }
    const blockSumCells = []
    cats.forEach((cat, k) => {
      const c0 = 6 + k * 6
      const L = [colLetter(c0), colLetter(c0 + 1), colLetter(c0 + 2), colLetter(c0 + 3)]
      // חלק יחסי
      const amt = cat.annualPerChild || 0
      set(ws, 7, c0, `חלק יחסי של ${cat.name}`)
      set(ws, 7, c0 + 1, `${amt}/${perChild}`, { numFont: true })
      set(ws, 7, c0 + 2, F(`${amt}/${perChild}`), { numFont: true, fmt: '0%' })
      set(ws, 7, c0 + 3, F(`${L[2]}7*$B$${sumTotalRow}`), { fill: C.orange, numFont: true, fmt: '0.00' })
      // כותרת בלוק
      ws.mergeCells(9, c0, 9, c0 + 3)
      set(ws, 9, c0, `${cat.name} ${amt} ₪`, { fill: C.orange, bold: true, border: boxT, center: true })
      set(ws, 10, c0 + 1, 'פירוט', { border: boxT }); set(ws, 10, c0 + 2, 'סכום', { fill: C.yellow, border: boxT }); set(ws, 10, c0 + 3, 'יתרה', { border: boxT, fmt: '0.00' })
      set(ws, 11, c0, 'הכנסה בפועל', { border: boxT })
      set(ws, 11, c0 + 3, F(`${L[3]}7`), { border: boxT, bold: true, numFont: true, fmt: '0.00' })
      const exp = sortAsc(recAll.filter(r => r.catId === cat.id))
      for (let i = 0; i < bodyRows; i++) {
        const r = 12 + i, e = exp[i]
        set(ws, r, c0, 'הוצאה', { border: boxT })
        set(ws, r, c0 + 1, e ? e.store : null, { border: boxT })
        set(ws, r, c0 + 2, e ? e.amount : null, { border: boxT, fmt: '0.00' })
        set(ws, r, c0 + 3, F(`${L[3]}${r - 1}-${L[2]}${r}`), { border: boxT, fmt: '0.00' })
      }
      const sRow = 12 + bodyRows
      set(ws, sRow, c0 + 1, 'סה"כ', { border: boxT, bold: true })
      set(ws, sRow, c0 + 2, F(`SUM(${L[2]}12:${L[2]}${sRow - 1})`), { border: boxT, bold: true, numFont: true, fmt: '0.00' })
      blockSumCells.push(`${L[2]}${sRow}`)
    })

    // סיכומים
    set(ws, sumTotalRow, 1, 'סה"כ הקצבות ', { fill: C.green })
    set(ws, sumTotalRow, 2, pulseCells.length ? F(pulseCells.join('+')) : 0, { fill: C.green, bold: true, numFont: true, fmt: ACC })
    set(ws, sumExpRow, 1, 'סה"כ הוצאות ', { fill: C.red, bold: true })
    set(ws, sumExpRow, 2, blockSumCells.length ? F(blockSumCells.join('+')) : 0, { fill: C.red, bold: true, numFont: true, fmt: '0.00' })
    set(ws, balRow, 1, 'יתרה בהורים ', { fill: C.gray, bold: true })
    set(ws, balRow, 2, F(`B${sumTotalRow}-B${sumExpRow}+C5`), { fill: C.gray, bold: true, numFont: true, fmt: ACC })
    // יתרה בכרטיס
    ws.mergeCells(2, 8, 2, 9); set(ws, 2, 8, 'יתרה בכרטיס ', { fill: C.purple, size: 16, border: boxT })
    set(ws, 2, 10, F(`B${balRow}`), { fill: C.purple, size: 16, numFont: true, fmt: ACC })
  }
  return wb
}
