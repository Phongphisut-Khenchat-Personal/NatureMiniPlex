import { useEffect, useState } from 'react'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'
import { addDays, showStatus, slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function BookingsAdmin() {
  const today = todayIso()
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(addDays(today, 7))
  const [phone, setPhone] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  function load(event) {
    if (event) event.preventDefault()
    const params = new URLSearchParams({ from, to })
    if (phone.trim()) params.set('phone', phone.trim())
    api(`/api/reports?${params.toString()}`)
      .then(page => setRows(page.bookings))
      .catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  return (
    <AdminShell>
      <h1>รายการจอง</h1>
      <form onSubmit={load} className="form-row">
        <label>จากวันที่<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>ถึงวันที่<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <label>เบอร์โทร<input value={phone} onChange={event => setPhone(event.target.value)} placeholder="เว้นว่างได้" /></label>
        <button className="btn" type="submit">ค้นหา</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>ถ้าไม่ใส่เบอร์ ระบบแสดงเฉพาะที่นั่งที่ยังจองอยู่ ถ้าใส่เบอร์จะเห็นประวัติที่ยกเลิกของเบอร์นั้นด้วย</p>
      <table>
        <thead>
          <tr><th>รหัส</th><th>เบอร์</th><th>เรื่อง</th><th>โรง</th><th>รอบ</th><th>ที่นั่ง</th><th>สถานะ</th></tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={`${row.bookingCode}-${row.seatCode}-${row.showDate}-${row.slot}`}>
              <td>{row.bookingCode}</td>
              <td>{row.phoneNumber}</td>
              <td>{row.movieTitle}</td>
              <td>{row.cinemaName}</td>
              <td>{thaiDay(row.showDate)} {slotLabel(row.slot)}</td>
              <td>{row.seatCode}</td>
              <td>{row.status === 'Booked' ? 'จองอยู่' : row.status === 'Cancelled' ? 'ยกเลิกแล้ว' : showStatus(row.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  )
}
