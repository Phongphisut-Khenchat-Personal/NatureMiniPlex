import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
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
      <Typography variant="h4" gutterBottom>จัดการรอบฉาย</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        แต่ละโรงมีได้ไม่เกิน 3 รอบต่อวัน เวลาไม่ซ้อนกันเพราะแต่ละช่วงมีเวลาตายตัว และรอบต้องอยู่ในช่วงวันที่ของเรื่อง
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={createShow}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select label="โรงภาพยนตร์" name="cinemaId" value={form.cinemaId} onChange={change} sx={{ minWidth: 180 }}>
              {cinemas.map(cinema => <MenuItem key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</MenuItem>)}
            </TextField>
            <TextField select label="ภาพยนตร์" name="movieId" value={form.movieId} onChange={change} sx={{ minWidth: 200 }}>
              {movies.map(movie => <MenuItem key={movie.movieId} value={movie.movieId}>{movie.title}</MenuItem>)}
            </TextField>
            <TextField label="วันที่" type="date" name="showDate" value={form.showDate} onChange={change} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="รอบ" name="slot" value={form.slot} onChange={change} sx={{ minWidth: 160 }}>
              {slots.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
            </TextField>
            <Button type="submit" variant="contained">เพิ่มรอบ</Button>
          </Stack>
        </form>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>วันที่</TableCell>
              <TableCell>โรง</TableCell>
              <TableCell>เรื่อง</TableCell>
              <TableCell>รอบ</TableCell>
              <TableCell>จองแล้ว</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {shows.map(show => (
              <TableRow key={show.showtimeId} hover>
                <TableCell>{thaiDay(show.showDate)}</TableCell>
                <TableCell>{show.cinemaName}</TableCell>
                <TableCell>{show.movieTitle}</TableCell>
                <TableCell>{slotLabel(show.slot)} {show.time}</TableCell>
                <TableCell>{show.bookedCount}/{show.seatCount}</TableCell>
                <TableCell>{showStatus(show.status)}</TableCell>
                <TableCell align="right">
                  {show.status === 'Open' && <Button size="small" color="error" onClick={() => act(`/api/showtimes/${show.showtimeId}/cancel`)}>ยกเลิกรอบ</Button>}
                  {show.status === 'Open' && show.showDate <= today && <Button size="small" onClick={() => act(`/api/showtimes/${show.showtimeId}/start`)}>เริ่มฉาย</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminShell>
  )
}
