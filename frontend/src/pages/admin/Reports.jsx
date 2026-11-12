import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
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
      <Typography variant="h4" gutterBottom>รายงาน</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={load}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="จากวันที่" type="date" value={from} onChange={event => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="ถึงวันที่" type="date" value={to} onChange={event => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField select label="สาขา" value={cinemaId} onChange={event => setCinemaId(event.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">ทุกสาขา</MenuItem>
              {cinemas.map(cinema => <MenuItem key={cinema.cinemaId} value={String(cinema.cinemaId)}>{cinema.cinemaName}</MenuItem>)}
            </TextField>
            <Button type="submit" variant="contained">ดูรายงาน</Button>
          </Stack>
        </form>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {page && (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {[
              ['ที่นั่งที่ถูกจอง', booked],
              ['ที่นั่งว่าง', free],
              ['จำนวนรอบ', page.shows.length]
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h6">แยกตามภาพยนตร์</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead><TableRow><TableCell>เรื่อง</TableCell><TableCell>ที่นั่งที่ถูกจอง</TableCell></TableRow></TableHead>
              <TableBody>
                {page.movies.map(movie => (
                  <TableRow key={movie.title} hover>
                    <TableCell>{movie.title}</TableCell>
                    <TableCell>{movie.bookedSeats}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6">แยกตามรอบฉาย</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>วันที่</TableCell>
                  <TableCell>โรง</TableCell>
                  <TableCell>เรื่อง</TableCell>
                  <TableCell>รอบ</TableCell>
                  <TableCell>จอง</TableCell>
                  <TableCell>ว่าง</TableCell>
                  <TableCell>สถานะ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {page.shows.map(show => (
                  <TableRow key={show.showtimeId} hover>
                    <TableCell>{thaiDay(show.showDate)}</TableCell>
                    <TableCell>{show.cinemaName}</TableCell>
                    <TableCell>{show.movieTitle}</TableCell>
                    <TableCell>{slotLabel(show.slot)}</TableCell>
                    <TableCell>{show.bookedCount}</TableCell>
                    <TableCell>{show.freeCount}</TableCell>
                    <TableCell>{showStatus(show.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </AdminShell>
  )
}
