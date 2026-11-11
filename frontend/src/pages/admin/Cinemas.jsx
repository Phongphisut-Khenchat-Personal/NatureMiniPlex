import { useEffect, useState } from 'react'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'

const rowOrder = ['หน้า', 'กลาง', 'หลัง']

export function CinemasAdmin() {
  const [pages, setPages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/cinemas')
      .then(cinemas => Promise.all(cinemas.map(cinema => api(`/api/cinemas/${cinema.cinemaId}/seats`))))
      .then(setPages)
      .catch(reason => setError(reason.message))
  }, [])

  return (
    <AdminShell>
      <h1>โรงภาพยนตร์และที่นั่ง</h1>
      <p>จำนวนที่นั่งถูกกำหนดไว้แล้ว ศรีราชา 6 ที่นั่ง และบางแสน 12 ที่นั่ง จึงดูผังได้อย่างเดียว ไม่ได้เพิ่มที่นั่งเอง</p>
      {error && <p className="error">{error}</p>}
      <div className="cinema-admin">
        {pages.map(page => {
          const rows = rowOrder.filter(row => page.seats.some(seat => seat.seatRow === row))
          return (
            <article key={page.cinemaId} className="panel">
              <h2>{page.cinemaName}</h2>
              <p>{page.seats.length} ที่นั่ง · {page.columnCount} คอลัมน์ × {page.rowCount} แถว</p>
              <div className="screen">จอภาพยนตร์</div>
              {rows.map(row => (
                <div key={row} className="seat-row">
                  <span>{row}</span>
                  {page.seats.filter(seat => seat.seatRow === row).map(seat => (
                    <span key={seat.seatId} className="seat">{seat.seatColumn}</span>
                  ))}
                </div>
              ))}
            </article>
          )
        })}
      </div>
    </AdminShell>
  )
}
