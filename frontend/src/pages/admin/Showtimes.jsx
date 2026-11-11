import { useEffect, useState } from 'react'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'
import { addDays, showStatus, slotLabel, thaiDay, todayIso } from '../../services/format.js'

const slots = [
  ['Morning', 'เช้า 10:00'],
  ['Afternoon', 'กลางวัน 13:00'],
  ['Evening', 'เย็น 16:00'],
  ['LateNight', 'ดึก 20:00']
]

export function ShowtimesAdmin() {
  const today = todayIso()
  const [cinemas, setCinemas] = useState([])
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [form, setForm] = useState({ cinemaId: '', movieId: '', showDate: today, slot: 'Morning' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function load() {
    return Promise.all([
      api('/api/cinemas'),
      api('/api/movies'),
      api(`/api/showtimes?from=${today}&to=${addDays(today, 14)}&includeCancelled=true`)
    ]).then(([cinemaRows, movieRows, showRows]) => {
      setCinemas(cinemaRows)
      setMovies(movieRows.filter(movie => movie.status === 'Active'))
      setShows(showRows)
      setForm(current => ({
        ...current,
        cinemaId: current.cinemaId || cinemaRows[0]?.cinemaId || '',
        movieId: current.movieId || movieRows.find(movie => movie.status === 'Active')?.movieId || ''
      }))
    }).catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function createShow(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await api('/api/showtimes', {
        method: 'POST',
        body: JSON.stringify({
          cinemaId: Number(form.cinemaId),
          movieId: Number(form.movieId),
          showDate: form.showDate,
          slot: form.slot
        })
      })
      setMessage(result.message)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  async function act(path) {
    setError('')
    setMessage('')
    try {
      const result = await api(path, { method: 'POST' })
      setMessage(result.message)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <AdminShell>
      <h1>จัดการรอบฉาย</h1>
      <p>แต่ละโรงมีได้ไม่เกิน 3 รอบต่อวัน เวลาไม่ซ้อนกันเพราะแต่ละช่วงมีเวลาตายตัว และรอบต้องอยู่ในช่วงวันที่ของเรื่อง</p>
      <form onSubmit={createShow} className="form-row">
        <label>โรงภาพยนตร์
          <select name="cinemaId" value={form.cinemaId} onChange={change}>
            {cinemas.map(cinema => <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>)}
          </select>
        </label>
        <label>ภาพยนตร์
          <select name="movieId" value={form.movieId} onChange={change}>
            {movies.map(movie => <option key={movie.movieId} value={movie.movieId}>{movie.title}</option>)}
          </select>
        </label>
        <label>วันที่<input type="date" name="showDate" value={form.showDate} onChange={change} /></label>
        <label>รอบ
          <select name="slot" value={form.slot} onChange={change}>
            {slots.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="btn" type="submit">เพิ่มรอบ</button>
      </form>
      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}
      <table>
        <thead>
          <tr><th>วันที่</th><th>โรง</th><th>เรื่อง</th><th>รอบ</th><th>จองแล้ว</th><th>สถานะ</th><th></th></tr>
        </thead>
        <tbody>
          {shows.map(show => (
            <tr key={show.showtimeId}>
              <td>{thaiDay(show.showDate)}</td>
              <td>{show.cinemaName}</td>
              <td>{show.movieTitle}</td>
              <td>{slotLabel(show.slot)} {show.time}</td>
              <td>{show.bookedCount}/{show.seatCount}</td>
              <td>{showStatus(show.status)}</td>
              <td>
                {show.status === 'Open' && <button type="button" onClick={() => act(`/api/showtimes/${show.showtimeId}/cancel`)}>ยกเลิกรอบ</button>}
                {show.status === 'Open' && show.showDate <= today && <button type="button" onClick={() => act(`/api/showtimes/${show.showtimeId}/start`)}>เริ่มฉาย</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  )
}
