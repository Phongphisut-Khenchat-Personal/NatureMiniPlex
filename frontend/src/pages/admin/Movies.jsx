import { useEffect, useState } from 'react'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'
import { thaiDay, todayIso } from '../../services/format.js'

const empty = { title: '', startDate: todayIso(), stopDate: todayIso() }

export function MoviesAdmin() {
  const [movies, setMovies] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function load() {
    return api('/api/movies').then(setMovies).catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = editing
        ? await api(`/api/movies/${editing}`, { method: 'PUT', body: JSON.stringify(form) })
        : await api('/api/movies', { method: 'POST', body: JSON.stringify(form) })
      setMessage(result.message)
      setForm(empty)
      setEditing(null)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  async function cancelMovie(movieId) {
    setError('')
    setMessage('')
    try {
      const result = await api(`/api/movies/${movieId}/cancel`, { method: 'POST' })
      setMessage(result.message)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <AdminShell>
      <h1>จัดการภาพยนตร์</h1>
      <form onSubmit={save} className="form-row">
        <label>ชื่อเรื่อง<input name="title" value={form.title} onChange={change} /></label>
        <label>วันเริ่มฉาย<input type="date" name="startDate" value={form.startDate} onChange={change} /></label>
        <label>วันสิ้นสุด<input type="date" name="stopDate" value={form.stopDate} onChange={change} /></label>
        <button className="btn" type="submit">{editing ? 'บันทึกการแก้ไข' : 'เพิ่มภาพยนตร์'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}
      <table>
        <thead>
          <tr><th>ชื่อเรื่อง</th><th>เริ่มฉาย</th><th>สิ้นสุด</th><th>สถานะ</th><th></th></tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie.movieId}>
              <td>{movie.title}</td>
              <td>{thaiDay(movie.startDate)}</td>
              <td>{thaiDay(movie.stopDate)}</td>
              <td>{movie.status === 'Active' ? 'เปิดอยู่' : 'ยกเลิกแล้ว'}</td>
              <td>
                {movie.status === 'Active' && (
                  <>
                    <button type="button" onClick={() => { setEditing(movie.movieId); setForm({ title: movie.title, startDate: movie.startDate, stopDate: movie.stopDate }) }}>แก้ไข</button>
                    <button type="button" onClick={() => cancelMovie(movie.movieId)}>ยกเลิกเรื่อง</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  )
}
