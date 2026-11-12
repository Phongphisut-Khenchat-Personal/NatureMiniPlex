import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdminShell } from '../../components/AdminShell.jsx'
import { SeatGrid } from '../../components/SeatGrid.jsx'
import { api } from '../../services/api.js'

export function SeatsAdmin() {
  const [cinemas, setCinemas] = useState([])
  const [cinemaId, setCinemaId] = useState('')
  const [page, setPage] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api('/api/cinemas').then(rows => {
      setCinemas(rows)
      setCinemaId(current => current || rows[0]?.cinemaId || '')
    }).catch(reason => setError(reason.message))
  }, [])

  useEffect(() => {
    if (!cinemaId) return
    api(`/api/cinemas/${cinemaId}/seats`).then(setPage).catch(reason => setError(reason.message))
  }, [cinemaId])

  async function toggle(seat) {
    setError('')
    setMessage('')
    try {
      const result = await api(`/api/cinemas/${cinemaId}/seats/${seat.seatId}`, {
        method: 'PUT',
        body: JSON.stringify({ closed: !seat.closed })
      })
      setMessage(`${seat.seatCode}: ${result.message}`)
      setPage(await api(`/api/cinemas/${cinemaId}/seats`))
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <AdminShell>
      <Typography variant="h4" gutterBottom>จัดการที่นั่ง</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        กดที่นั่งเพื่อปิดซ่อมหรือเปิดใช้ ที่นั่งที่ถูกจองในรอบที่ยังเปิดอยู่ปิดไม่ได้ และจำนวนที่นั่งในผังไม่เพิ่มเอง
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="โรงภาพยนตร์" value={cinemaId} onChange={event => setCinemaId(event.target.value)} sx={{ minWidth: 240 }}>
            {cinemas.map(cinema => <MenuItem key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {page && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">{page.cinemaName}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {page.seats.length} ที่นั่ง · {page.columnCount} คอลัมน์ × {page.rowCount} แถว
          </Typography>
          <SeatGrid seats={page.seats} onPick={toggle} allowClosed />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ปุ่มขอบคือเปิดใช้ ปุ่มสีเหลืองคือปิดซ่อม ข้อความบนปุ่มคือรหัสที่นั่ง
          </Typography>
        </Paper>
      )}
    </AdminShell>
  )
}
