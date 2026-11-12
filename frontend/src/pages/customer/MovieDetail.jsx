import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const today = todayIso()
    api(`/api/movies/${id}`)
      .then(item => {
        setMovie(item)
        return api(`/api/showtimes?movieId=${id}&from=${today}&to=${item.stopDate}`)
      })
      .then(rows => setShows(rows.filter(show => show.status === 'Open' && show.showDate >= today)))
      .catch(reason => setError(reason.message))
  }, [id])

  const dates = [...new Set(shows.map(show => show.showDate))]

  return (
    <>
      <SiteHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {movie && (
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {movie.posterUrl && (
                <Box
                  component="img"
                  src={movie.posterUrl}
                  alt={movie.title}
                  sx={{ width: { xs: '100%', sm: 180 }, height: 260, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
              <Card sx={{ flex: 1, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                <CardContent>
                  <Chip label="กำลังฉาย" color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography variant="h3">{movie.title}</Typography>
                  <Typography sx={{ mt: 1 }}>ฉาย {thaiDay(movie.startDate)} ถึง {thaiDay(movie.stopDate)}</Typography>
                </CardContent>
              </Card>
            </Stack>
            {dates.length === 0 && <Alert severity="info">ยังไม่มีรอบที่เปิดจอง</Alert>}
            {dates.map(date => (
              <div key={date}>
                <Typography variant="h5" gutterBottom>{thaiDay(date)}</Typography>
                <Grid container spacing={2}>
                  {shows.filter(show => show.showDate === date).map(show => (
                    <Grid key={show.showtimeId} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card>
                        <CardActionArea component={Link} to={`/showtimes/${show.showtimeId}`}>
                          <CardContent>
                            <Typography variant="subtitle1">{show.cinemaName}</Typography>
                            <Typography color="text.secondary">รอบ{slotLabel(show.slot)} {show.time}</Typography>
                            <Typography color="primary">ว่าง {show.freeCount}/{show.seatCount}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </div>
            ))}
            <Typography variant="body2" color="text.secondary">
              เลือกได้มากกว่าหนึ่งรอบ แล้วไปยืนยันพร้อมกันได้ไม่เกิน 4 ที่นั่ง
            </Typography>
          </Stack>
        )}
      </Container>
    </>
  )
}
