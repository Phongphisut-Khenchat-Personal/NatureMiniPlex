import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../components/CartContext.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

export function Checkout() {
  const { lines, remove, clear } = useCart()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const result = await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          seats: lines.map(line => ({ showtimeId: line.showtimeId, seatId: line.seatId }))
        })
      })
      setCode(result.bookingCode)
      clear()
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <div className="customer">
      <SiteHeader />
      <section className="sheet narrow">
        <h1>ยืนยันการจอง</h1>
        {code && (
          <div className="success-card">
            <p>จองตั๋วแล้ว</p>
            <strong>{code}</strong>
            <p>เก็บรหัสนี้ไว้กับเบอร์โทรที่ใช้จอง เพื่อตรวจสอบหรือยกเลิกที่นั่ง</p>
            <Link to="/my-booking">ตรวจสอบการจอง</Link>
          </div>
        )}
        {!code && (
          <form onSubmit={submit} className="stack">
            {lines.length === 0 && <p>ยังไม่มีที่นั่งในรายการ <Link to="/movies">เลือกภาพยนตร์</Link></p>}
            {lines.map(line => (
              <div key={`${line.showtimeId}-${line.seatId}`} className="line">
                <div>
                  <strong>{line.movieTitle}</strong>
                  <span>{line.cinemaName} · {thaiDay(line.showDate)} · รอบ{slotLabel(line.slot)} {line.time} · ที่นั่ง {line.seatCode}</span>
                </div>
                <button type="button" onClick={() => remove(line.showtimeId, line.seatId)}>เอาออก</button>
              </div>
            ))}
            <label>
              เบอร์โทรศัพท์
              <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="08xxxxxxxx" inputMode="numeric" />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit" disabled={lines.length === 0}>ยืนยันจอง {lines.length} ที่นั่ง</button>
          </form>
        )}
      </section>
    </div>
  )
}
