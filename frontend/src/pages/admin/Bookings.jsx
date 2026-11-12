import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
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

export function BookingsAdmin() {
  const today = todayIso()
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(addDays(today, 7))
  const [phone, setPhone] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  function load(event) {
    if (event) event.preventDefault()
    const params = new URLSearchParams({ from, to })
    if (phone.trim()) params.set('phone', phone.trim())
    api(`/api/reports?${params.toString()}`)
      .then(page => setRows(page.bookings))
      .catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  return (
    <AdminShell>
      <Typography variant="h4" gutterBottom>รายการจอง</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={load}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="จากวันที่" type="date" value={from} onChange={event => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="ถึงวันที่" type="date" value={to} onChange={event => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="เบอร์โทร" value={phone} onChange={event => setPhone(event.target.value)} placeholder="เว้นว่างได้" />
            <Button type="submit" variant="contained">ค้นหา</Button>
          </Stack>
        </form>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        ถ้าไม่ใส่เบอร์ ระบบแสดงเฉพาะที่นั่งที่ยังจองอยู่ ถ้าใส่เบอร์จะเห็นประวัติที่ยกเลิกของเบอร์นั้นด้วย
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>รหัส</TableCell>
              <TableCell>เบอร์</TableCell>
              <TableCell>เรื่อง</TableCell>
              <TableCell>โรง</TableCell>
              <TableCell>รอบ</TableCell>
              <TableCell>ที่นั่ง</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={`${row.bookingCode}-${row.seatCode}-${row.showDate}-${row.slot}`} hover>
                <TableCell>{row.bookingCode}</TableCell>
                <TableCell>{row.phoneNumber}</TableCell>
                <TableCell>{row.movieTitle}</TableCell>
                <TableCell>{row.cinemaName}</TableCell>
                <TableCell>{thaiDay(row.showDate)} {slotLabel(row.slot)}</TableCell>
                <TableCell>{row.seatCode}</TableCell>
                <TableCell>{row.status === 'Booked' ? 'จองอยู่' : row.status === 'Cancelled' ? 'ยกเลิกแล้ว' : showStatus(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminShell>
  )
}
