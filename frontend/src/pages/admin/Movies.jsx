import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
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
import { api, postFile } from '../../services/api.js'
import { thaiDay, todayIso } from '../../services/format.js'

const empty = { title: '', startDate: todayIso(), stopDate: todayIso(), recommended: false }

export function MoviesAdmin() {
  const [movies, setMovies] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [posterFile, setPosterFile] = useState(null)
  const [posterUrl, setPosterUrl] = useState('')
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
    if (posterFile && posterFile.size > 2 * 1024 * 1024) {
      setError('รูปต้องมีขนาดไม่เกิน 2 MB')
      return
    }
    const payload = { title: form.title, startDate: form.startDate, stopDate: form.stopDate, recommended: form.recommended }
    try {
      let movieId = editing
      const result = movieId
        ? await api(`/api/movies/${movieId}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await api('/api/movies', { method: 'POST', body: JSON.stringify(payload) })
      if (!movieId) movieId = result.movieId
      if (posterFile) {
        try {
          await postFile(`/api/movies/${movieId}/poster`, posterFile)
        } catch (reason) {
          setEditing(movieId)
          setError(reason.message)
          await load()
          return
        }
      }
      setMessage(posterFile ? 'บันทึกเรื่องและโปสเตอร์แล้ว' : result.message)
      setForm(empty)
      setPosterFile(null)
      setPosterUrl('')
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
      <Typography variant="h4" gutterBottom>จัดการภาพยนตร์</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={save}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
            <TextField label="ชื่อเรื่อง" name="title" value={form.title} onChange={change} required sx={{ flex: 1 }} />
            <TextField label="วันเริ่มฉาย" type="date" name="startDate" value={form.startDate} onChange={change} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="วันสิ้นสุด" type="date" name="stopDate" value={form.stopDate} onChange={change} slotProps={{ inputLabel: { shrink: true } }} />
            <FormControlLabel
              control={<Checkbox checked={form.recommended} onChange={event => setForm({ ...form, recommended: event.target.checked })} />}
              label="ภาพยนตร์แนะนำ"
            />
            <Button type="submit" variant="contained">{editing ? 'บันทึกการแก้ไข' : 'เพิ่มภาพยนตร์'}</Button>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
            <Button component="label" variant="outlined">
              เลือกโปสเตอร์
              <input
                hidden
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={event => setPosterFile(event.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {posterFile ? posterFile.name : 'jpg, png หรือ webp ไม่เกิน 2 MB ไม่ใส่รูปก็ได้'}
            </Typography>
            {posterUrl && !posterFile && (
              <Box
                component="img"
                src={posterUrl}
                alt=""
                sx={{ width: 48, height: 72, objectFit: 'cover', borderRadius: 1 }}
              />
            )}
          </Stack>
        </form>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อเรื่อง</TableCell>
              <TableCell>เริ่มฉาย</TableCell>
              <TableCell>สิ้นสุด</TableCell>
              <TableCell>แนะนำ</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map(movie => (
              <TableRow key={movie.movieId} hover>
                <TableCell>{movie.title}</TableCell>
                <TableCell>{thaiDay(movie.startDate)}</TableCell>
                <TableCell>{thaiDay(movie.stopDate)}</TableCell>
                <TableCell>{movie.isRecommended ? 'แนะนำ' : ''}</TableCell>
                <TableCell>{movie.status === 'Active' ? 'เปิดอยู่' : 'ยกเลิกแล้ว'}</TableCell>
                <TableCell align="right">
                  {movie.status === 'Active' && (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => { setEditing(movie.movieId); setPosterFile(null); setPosterUrl(movie.posterUrl || ''); setForm({ title: movie.title, startDate: movie.startDate, stopDate: movie.stopDate, recommended: movie.isRecommended }) }}>แก้ไข</Button>
                      <Button size="small" color="error" onClick={() => cancelMovie(movie.movieId)}>ยกเลิกเรื่อง</Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminShell>
  )
}
