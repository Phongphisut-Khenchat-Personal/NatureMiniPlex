import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
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
  const stats = data ? [
    ['ที่นั่งที่ถูกจองวันนี้', data.bookedSeatsToday],
    ['เบอร์ที่จองวันนี้', data.phonesToday],
    ['โรงภาพยนตร์', data.cinemaCount],
    ['รอบฉายวันนี้', data.showsToday]
  ] : []

  return (
    <AdminShell>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {data && (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h4">ยินดีต้อนรับ, ผู้ดูแลระบบ</Typography>
              <Typography color="text.secondary">ภาพรวมระบบ Nature MiniPlex วันนี้ · {clockNow()}</Typography>
            </CardContent>
          </Card>
          <Grid container spacing={2}>
            {stats.map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="ที่นั่งที่ถูกจอง 7 วัน" />
                <CardContent>
                  <Stack spacing={1.5}>
                    {data.days.map(day => (
                      <Stack key={day.date} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ width: 110 }}>{thaiDay(day.date)}</Typography>
                        <LinearProgress variant="determinate" value={(day.bookedSeats / max) * 100} sx={{ flex: 1 }} />
                        <Typography variant="body2" sx={{ width: 24 }}>{day.bookedSeats}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="การจองแยกตามสาขา" subheader={`รวม ${total} ที่นั่งวันนี้`} />
                <CardContent>
                  <Stack spacing={2}>
                    {data.cinemas.map(cinema => (
                      <div key={cinema.cinemaName}>
                        <Typography variant="body2">{cinema.cinemaName} · {cinema.bookedSeats}</Typography>
                        <LinearProgress variant="determinate" value={total === 0 ? 0 : (cinema.bookedSeats / total) * 100} />
                      </div>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="เมนูด่วน" />
                <CardContent>
                  <Stack spacing={1}>
                    <Button component={Link} to="/admin/movies" variant="outlined">เพิ่มภาพยนตร์</Button>
                    <Button component={Link} to="/admin/showtimes" variant="outlined">จัดการรอบฉาย</Button>
                    <Button component={Link} to="/admin/bookings" variant="outlined">ดูรายการจอง</Button>
                    <Button component={Link} to="/admin/reports" variant="outlined">ดูรายงาน</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Card>
            <CardHeader
              title="รายการจองล่าสุด"
              action={<Button component={Link} to="/admin/bookings">ดูทั้งหมด</Button>}
            />
            <TableContainer component={Paper} variant="outlined" sx={{ mx: 2, mb: 2, width: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>รหัสการจอง</TableCell>
                    <TableCell>ภาพยนตร์</TableCell>
                    <TableCell>โรงภาพยนตร์</TableCell>
                    <TableCell>รอบฉาย</TableCell>
                    <TableCell>ที่นั่ง</TableCell>
                    <TableCell>สถานะ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recent.map(row => (
                    <TableRow key={`${row.bookingCode}-${row.seatCode}-${row.showDate}-${row.time}`} hover>
                      <TableCell>{row.bookingCode}</TableCell>
                      <TableCell>{row.movieTitle}</TableCell>
                      <TableCell>{row.cinemaName}</TableCell>
                      <TableCell>{thaiDay(row.showDate)} {slotLabel(row.slot)} {row.time}</TableCell>
                      <TableCell>{row.seatCode}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Grid container spacing={2}>
            {data.cinemas.map(cinema => (
              <Grid key={cinema.cinemaName} size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{cinema.cinemaName}</Typography>
                    <Typography color="text.secondary">รอบวันนี้ {cinema.showsToday} รอบ</Typography>
                    <Typography color="text.secondary">ที่นั่งทั้งหมด {cinema.seatCount} ที่นั่ง · จองวันนี้ {cinema.bookedSeats}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </AdminShell>
  )
}
