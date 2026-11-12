import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import { Link } from 'react-router-dom'
import { useCart } from '../../components/CartContext.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

export function Checkout() {
  const { lines, remove, clear } = useCart()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const result = await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          seats: lines.map(line => ({ showtimeId: line.showtimeId, seatId: line.seatId }))
        })
      })
      setCode(result.bookingCode)
      clear()
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <>
      <SiteHeader />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>ยืนยันการจอง</Typography>
        {code && (
          <Card>
            <CardContent>
              <Alert severity="success" sx={{ mb: 2 }}>จองตั๋วแล้ว</Alert>
              <Typography variant="h4" gutterBottom>{code}</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                ใช้เบอร์โทรที่จองไว้ตรวจสอบหรือยกเลิกที่นั่งได้ ไม่ต้องจำรหัสการจอง
              </Typography>
              <Button component={Link} to="/my-booking" variant="contained">ตรวจสอบการจอง</Button>
            </CardContent>
          </Card>
        )}
        {!code && (
          <Card>
            <CardContent>
              <form onSubmit={submit}>
                <Stack spacing={2}>
                  {lines.length === 0 && (
                    <Typography>
                      ยังไม่มีที่นั่งในรายการ <Button component={Link} to="/movies">เลือกภาพยนตร์</Button>
                    </Typography>
                  )}
                  <List>
                    {lines.map(line => (
                      <ListItem
                        key={`${line.showtimeId}-${line.seatId}`}
                        secondaryAction={
                          <IconButton edge="end" aria-label="เอาออก" onClick={() => remove(line.showtimeId, line.seatId)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={line.movieTitle}
                          secondary={`${line.cinemaName} · ${thaiDay(line.showDate)} · รอบ${slotLabel(line.slot)} ${line.time} · ที่นั่ง ${line.seatCode}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <TextField
                    label="เบอร์โทรศัพท์"
                    value={phone}
                    onChange={event => setPhone(event.target.value)}
                    placeholder="08xxxxxxxx"
                    inputMode="numeric"
                    required
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" disabled={lines.length === 0}>
                    ยืนยันจอง {lines.length} ที่นั่ง
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  )
}
