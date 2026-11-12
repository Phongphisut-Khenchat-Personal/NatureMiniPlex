import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay } from '../../services/format.js'

export function MyBooking() {
  const [phone, setPhone] = useState('')
  const [rows, setRows] = useState(null)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function search(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSelected([])
    const normalized = phone.replace(/\D/g, '')
    if (!/^0\d{9}$/.test(normalized)) {
      setRows(null)
      setError('กรุณากรอกเบอร์โทร 10 หลัก ขึ้นต้นด้วย 0')
      return
    }
    try {
      setRows(await api(`/api/bookings?phone=${encodeURIComponent(normalized)}`))
    } catch (reason) {
      setError(reason.message)
    }
  }

  function toggle(id) {
    setSelected(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id])
  }

  async function cancelBooking(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await api('/api/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), bookingSeatIds: selected })
      })
      setMessage(result.message)
      setRows(await api(`/api/bookings?phone=${encodeURIComponent(phone.replace(/\D/g, ''))}`))
      setSelected([])
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <>
      <SiteHeader />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>ตรวจสอบการจอง</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          ใส่เบอร์ที่ใช้จอง ระบบจะแสดงทุกที่นั่งของเบอร์นั้น ยกเลิกได้ก่อนรอบเริ่มฉาย
        </Typography>
        <Card>
          <CardContent>
            <form onSubmit={search}>
              <Stack spacing={2}>
                <TextField label="เบอร์โทรศัพท์" value={phone} onChange={event => setPhone(event.target.value)} placeholder="08xxxxxxxx" inputMode="numeric" required />
                <Button type="submit" variant="contained">ค้นหา</Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {rows && rows.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>ไม่พบรายการจอง</Alert>}
        {rows && rows.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <form onSubmit={cancelBooking}>
                <Stack spacing={1}>
                  {rows.map(row => (
                    <FormControlLabel
                      key={row.bookingSeatId}
                      control={
                        <Checkbox
                          checked={selected.includes(row.bookingSeatId)}
                          disabled={!row.canCancel}
                          onChange={() => toggle(row.bookingSeatId)}
                        />
                      }
                      label={
                        <span>
                          <strong>{row.bookingCode} · {row.movieTitle}</strong>
                          <br />
                          {row.cinemaName} · {thaiDay(row.showDate)} · รอบ{slotLabel(row.slot)} · {row.seatCode}
                          {row.reason ? ` · ${row.reason}` : ''}
                        </span>
                      }
                    />
                  ))}
                  <Button type="submit" variant="contained" color="error" disabled={selected.length === 0}>
                    ยกเลิกที่นั่งที่เลือก
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
