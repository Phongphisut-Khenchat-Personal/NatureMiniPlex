import { useState } from 'react'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

export function MyBooking() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [rows, setRows] = useState(null)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function search(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSelected([])
    const params = new URLSearchParams()
    if (phone.trim()) params.set('phone', phone.trim())
    if (code.trim()) params.set('code', code.trim())
    try {
      setRows(await api(`/api/bookings?${params.toString()}`))
    } catch (reason) {
      setError(reason.message)
    }
  }

  function toggle(id) {
    setSelected(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  async function cancelBooking(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await api('/api/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ phone, bookingSeatIds: selected })
      })
      setMessage(result.message)
      const params = new URLSearchParams()
      if (phone.trim()) params.set('phone', phone.trim())
      if (code.trim()) params.set('code', code.trim())
      setRows(await api(`/api/bookings?${params.toString()}`))
      setSelected([])
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <div className="customer">
      <SiteHeader />
      <section className="sheet narrow">
        <h1>ตรวจสอบการจอง</h1>
        <p>ค้นด้วยเบอร์โทรหรือรหัสการจอง ยกเลิกได้เฉพาะที่นั่งของเบอร์นั้น และทำไม่ได้หลังรอบเริ่มฉาย</p>
        <form onSubmit={search} className="stack">
          <label>
            เบอร์โทรศัพท์
            <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="08xxxxxxxx" />
          </label>
          <label>
            รหัสการจอง
            <input value={code} onChange={event => setCode(event.target.value)} placeholder="NM..." />
          </label>
          <button className="btn" type="submit">ค้นหา</button>
        </form>
        {error && <p className="error">{error}</p>}
        {message && <p className="ok">{message}</p>}
        {rows && rows.length === 0 && <p>ไม่พบรายการจอง</p>}
        {rows && rows.length > 0 && (
          <form onSubmit={cancelBooking} className="stack">
            {rows.map(row => (
              <label key={row.bookingSeatId} className="line">
                <input
                  type="checkbox"
                  checked={selected.includes(row.bookingSeatId)}
                  disabled={!row.canCancel}
                  onChange={() => toggle(row.bookingSeatId)}
                />
                <div>
                  <strong>{row.bookingCode} · {row.movieTitle}</strong>
                  <span>{row.cinemaName} · {thaiDay(row.showDate)} · รอบ{slotLabel(row.slot)} · {row.seatCode}</span>
                  {row.reason && <em>{row.reason}</em>}
                </div>
              </label>
            ))}
            <button className="btn btn-danger" type="submit" disabled={selected.length === 0}>ยกเลิกที่นั่งที่เลือก</button>
          </form>
        )}
      </section>
    </div>
  )
}
