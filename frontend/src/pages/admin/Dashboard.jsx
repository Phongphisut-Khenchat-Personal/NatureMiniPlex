import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'
import { clockNow, slotLabel, thaiDay } from '../../services/format.js'

export function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/dashboard').then(setData).catch(reason => setError(reason.message))
  }, [])

  const max = data ? Math.max(1, ...data.days.map(day => day.bookedSeats)) : 1
  const total = data ? data.cinemas.reduce((sum, cinema) => sum + cinema.bookedSeats, 0) : 0
  let cursor = 0
  const colors = ['#f97316', '#fdba74']
  const donut = !data || total === 0
    ? 'conic-gradient(#2a2a2e 0 100%)'
    : `conic-gradient(${data.cinemas.map((cinema, index) => {
      const start = cursor
      cursor += (cinema.bookedSeats / total) * 100
      return `${colors[index % colors.length]} ${start}% ${cursor}%`
    }).join(',')})`

  return (
    <AdminShell>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <section className="welcome">
            <div>
              <h1>ยินดีต้อนรับ, ผู้ดูแลระบบ</h1>
              <p>ภาพรวมระบบ Nature MiniPlex วันนี้</p>
            </div>
            <div className="clock">{clockNow()}</div>
          </section>
          <section className="stats">
            <article><span>ที่นั่งที่ถูกจองวันนี้</span><strong>{data.bookedSeatsToday}</strong></article>
            <article><span>เบอร์ที่จองวันนี้</span><strong>{data.phonesToday}</strong></article>
            <article><span>โรงภาพยนตร์</span><strong>{data.cinemaCount}</strong></article>
            <article><span>รอบฉายวันนี้</span><strong>{data.showsToday}</strong></article>
          </section>
          <section className="dash-grid">
            <article className="panel">
              <h2>ที่นั่งที่ถูกจอง 7 วัน</h2>
              <div className="bars">
                {data.days.map(day => (
                  <div key={day.date}>
                    <div className="bar" style={{ height: `${(day.bookedSeats / max) * 120}px` }} />
                    <span>{thaiDay(day.date).split(' ')[0]}</span>
                    <em>{day.bookedSeats}</em>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h2>การจองแยกตามสาขา</h2>
              <div className="donut" style={{ background: donut }}><span>{total}</span></div>
              {data.cinemas.map(cinema => (
                <p key={cinema.cinemaName}>{cinema.cinemaName} · {cinema.bookedSeats} ที่นั่งวันนี้</p>
              ))}
            </article>
            <article className="panel actions">
              <h2>เมนูด่วน</h2>
              <Link to="/admin/movies">เพิ่มภาพยนตร์</Link>
              <Link to="/admin/showtimes">จัดการรอบฉาย</Link>
              <Link to="/admin/bookings">ดูรายการจอง</Link>
              <Link to="/admin/reports">ดูรายงาน</Link>
            </article>
          </section>
          <section className="panel">
            <div className="section-head dark">
              <h2>รายการจองล่าสุด</h2>
              <Link to="/admin/bookings">ดูทั้งหมด →</Link>
            </div>
            <table>
              <thead>
                <tr><th>รหัสการจอง</th><th>ภาพยนตร์</th><th>โรงภาพยนตร์</th><th>รอบฉาย</th><th>ที่นั่ง</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {data.recent.map(row => (
                  <tr key={`${row.bookingCode}-${row.seatCode}-${row.showDate}-${row.time}`}>
                    <td>{row.bookingCode}</td>
                    <td>{row.movieTitle}</td>
                    <td>{row.cinemaName}</td>
                    <td>{thaiDay(row.showDate)} {slotLabel(row.slot)} {row.time}</td>
                    <td>{row.seatCode}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="branch-row">
            {data.cinemas.map(cinema => (
              <article key={cinema.cinemaName} className="panel">
                <h2>{cinema.cinemaName}</h2>
                <p>รอบวันนี้ {cinema.showsToday} รอบ</p>
                <p>ที่นั่งทั้งหมด {cinema.seatCount} ที่นั่ง · จองวันนี้ {cinema.bookedSeats}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </AdminShell>
  )
}
