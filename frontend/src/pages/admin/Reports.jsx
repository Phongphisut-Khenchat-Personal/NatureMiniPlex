import { useEffect, useState } from 'react'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'
import { showStatus, slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function Reports() {
  const [from, setFrom] = useState(todayIso())
  const [to, setTo] = useState(todayIso())
  const [cinemaId, setCinemaId] = useState('')
  const [cinemas, setCinemas] = useState([])
  const [page, setPage] = useState(null)
  const [error, setError] = useState('')

  function load(event) {
    if (event) event.preventDefault()
    const params = new URLSearchParams({ from, to })
    if (cinemaId) params.set('cinemaId', cinemaId)
    api(`/api/reports?${params.toString()}`)
      .then(result => {
        setPage(result)
        setCinemas(result.cinemas)
      })
      .catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  const booked = page ? page.shows.reduce((sum, show) => sum + show.bookedCount, 0) : 0
  const free = page ? page.shows.reduce((sum, show) => sum + show.freeCount, 0) : 0

  return (
    <AdminShell>
      <h1>รายงาน</h1>
      <form onSubmit={load} className="form-row">
        <label>จากวันที่<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>ถึงวันที่<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <label>สาขา
          <select value={cinemaId} onChange={event => setCinemaId(event.target.value)}>
            <option value="">ทุกสาขา</option>
            {cinemas.map(cinema => <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>)}
          </select>
        </label>
        <button className="btn" type="submit">ดูรายงาน</button>
      </form>
      {error && <p className="error">{error}</p>}
      {page && (
        <>
          <section className="stats">
            <article><span>ที่นั่งที่ถูกจอง</span><strong>{booked}</strong></article>
            <article><span>ที่นั่งว่าง</span><strong>{free}</strong></article>
            <article><span>จำนวนรอบ</span><strong>{page.shows.length}</strong></article>
          </section>
          <h2>แยกตามภาพยนตร์</h2>
          <table>
            <thead><tr><th>เรื่อง</th><th>ที่นั่งที่ถูกจอง</th></tr></thead>
            <tbody>
              {page.movies.map(movie => (
                <tr key={movie.title}><td>{movie.title}</td><td>{movie.bookedSeats}</td></tr>
              ))}
            </tbody>
          </table>
          <h2>แยกตามรอบฉาย</h2>
          <table>
            <thead><tr><th>วันที่</th><th>โรง</th><th>เรื่อง</th><th>รอบ</th><th>จอง</th><th>ว่าง</th><th>สถานะ</th></tr></thead>
            <tbody>
              {page.shows.map(show => (
                <tr key={show.showtimeId}>
                  <td>{thaiDay(show.showDate)}</td>
                  <td>{show.cinemaName}</td>
                  <td>{show.movieTitle}</td>
                  <td>{slotLabel(show.slot)}</td>
                  <td>{show.bookedCount}</td>
                  <td>{show.freeCount}</td>
                  <td>{showStatus(show.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminShell>
  )
}
