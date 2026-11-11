import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../components/CartContext.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

const rowOrder = ['หน้า', 'กลาง', 'หลัง']

export function SeatSelect() {
  const { id } = useParams()
  const { lines, toggle } = useCart()
  const [map, setMap] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api(`/api/showtimes/${id}/seats`).then(setMap).catch(reason => setError(reason.message))
  }, [id])

  function pick(seat) {
    if (!map || map.closed || seat.booked) {
      return
    }
    const message = toggle({
      showtimeId: map.showtimeId,
      seatId: seat.seatId,
      seatCode: seat.seatCode,
      movieTitle: map.movieTitle,
      cinemaName: map.cinemaName,
      showDate: map.showDate,
      slot: map.slot,
      time: map.time
    })
    setNotice(message)
  }

  const rows = map ? rowOrder.filter(row => map.seats.some(seat => seat.seatRow === row)) : []

  return (
    <div className="customer">
      <SiteHeader />
      <section className="sheet seat-page">
        {error && <p className="error">{error}</p>}
        {map && (
          <>
            <div className="seat-layout">
              <h1>{map.movieTitle}</h1>
              <p>{map.cinemaName} · {thaiDay(map.showDate)} · รอบ{slotLabel(map.slot)} {map.time}</p>
              {map.closed && <p className="error">{map.closedReason}</p>}
              {notice && <p className="error">{notice}</p>}
              <div className="screen">จอภาพยนตร์</div>
              {rows.map(row => (
                <div key={row} className="seat-row">
                  <span>{row}</span>
                  {map.seats.filter(seat => seat.seatRow === row).map(seat => {
                    const chosen = lines.some(line => line.showtimeId === map.showtimeId && line.seatId === seat.seatId)
                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        className={seat.booked ? 'seat taken' : chosen ? 'seat chosen' : 'seat'}
                        disabled={map.closed || seat.booked}
                        onClick={() => pick(seat)}
                      >
                        {seat.seatColumn}
                      </button>
                    )
                  })}
                </div>
              ))}
              <p className="hint">ที่นั่งสีเข้มคือว่าง สีส้มคือที่เลือกไว้ สีเทาคือมีคนจองแล้ว</p>
            </div>
            <aside className="cart-box">
              <h2>ตั๋วที่เลือก {lines.length}/4</h2>
              {lines.length === 0 && <p>ยังไม่ได้เลือกที่นั่ง</p>}
              {lines.map(line => (
                <p key={`${line.showtimeId}-${line.seatId}`}>
                  {line.movieTitle}<br />
                  {line.cinemaName} · {thaiDay(line.showDate)} · {line.time} · {line.seatCode}
                </p>
              ))}
              <Link to="/checkout" className="btn">ไปยืนยันการจอง</Link>
            </aside>
          </>
        )}
      </section>
    </div>
  )
}
