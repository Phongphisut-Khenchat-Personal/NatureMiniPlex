import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../components/CartContext.jsx'
import { SeatGrid } from '../../components/SeatGrid.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

export function SeatSelect() {
  const { id } = useParams()
  const { lines, toggle } = useCart()
  const [map, setMap] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api(`/api/showtimes/${id}/seats`).then(setMap).catch(reason => setError(reason.message))
  }, [id])

  function pick(seat) {
    if (!map || map.closed || seat.booked || seat.closed) {
      return
    }
    const message = toggle({
      showtimeId: map.showtimeId,
      seatId: seat.seatId,
      seatCode: seat.seatCode,
      movieTitle: map.movieTitle,
      cinemaName: map.cinemaName,
      showDate: map.showDate,
      slot: map.slot,
      time: map.time
    })
    setNotice(message)
  }

  return (
    <>
      <SiteHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {map && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{map.movieTitle}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {map.cinemaName} · {thaiDay(map.showDate)} · รอบ{slotLabel(map.slot)} {map.time}
                  </Typography>
                  {map.closed && <Alert severity="warning" sx={{ mb: 2 }}>{map.closedReason}</Alert>}
                  {notice && <Alert severity="warning" sx={{ mb: 2 }}>{notice}</Alert>}
                  <SeatGrid
                    seats={map.seats}
                    closed={map.closed}
                    onPick={pick}
                    isChosen={seat => lines.some(line => line.showtimeId === map.showtimeId && line.seatId === seat.seatId)}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    ปุ่มขอบคือที่ว่าง ปุ่มสีส้มคือที่เลือกไว้ ปุ่มสีเหลืองคือปิดซ่อม ปุ่มสีเทาคือมีคนจองแล้ว
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">ตั๋วที่เลือก {lines.length}/4</Typography>
                  {lines.length === 0 && <Typography color="text.secondary">ยังไม่ได้เลือกที่นั่ง</Typography>}
                  <List dense>
                    {lines.map(line => (
                      <ListItem key={`${line.showtimeId}-${line.seatId}`} disablePadding>
                        <ListItemText
                          primary={`${line.movieTitle} · ${line.seatCode}`}
                          secondary={`${line.cinemaName} · ${thaiDay(line.showDate)} · ${line.time}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button component={Link} to="/checkout" variant="contained" fullWidth sx={{ mt: 1 }}>
                    ไปยืนยันการจอง
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  )
}
