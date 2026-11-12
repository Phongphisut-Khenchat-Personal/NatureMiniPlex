import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function Cinema() {
  const { id } = useParams()
  const [cinema, setCinema] = useState(null)
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const today = todayIso()
    Promise.all([
      api('/api/cinemas'),
      api('/api/movies/showing')
    ]).then(async ([cinemas, showing]) => {
      setCinema(cinemas.find(item => item.cinemaId === Number(id)) || null)
      const end = showing.reduce((latest, movie) => movie.stopDate > latest ? movie.stopDate : latest, today)
      const rows = await api(`/api/showtimes?cinemaId=${id}&from=${today}&to=${end}`)
      const open = rows.filter(show => show.status === 'Open')
      setShows(open)
      setMovies([...showing].sort((left, right) => {
        const leftHasShow = open.some(show => show.movieId === left.movieId)
        const rightHasShow = open.some(show => show.movieId === right.movieId)
        if (leftHasShow !== rightHasShow) {
          return leftHasShow ? -1 : 1
        }
        return left.title.localeCompare(right.title, 'th')
      }))
    }).catch(reason => setError(reason.message))
  }, [id])

  const playing = movies.filter(movie => shows.some(show => show.movieId === movie.movieId))
  const waiting = movies.filter(movie => !shows.some(show => show.movieId === movie.movieId))

  return (
    <>
      <SiteHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {cinema && (
          <>
            <Typography variant="h4">{cinema.cinemaName}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {cinema.seatCount} ที่นั่ง จัดเป็น {cinema.columnCount} คอลัมน์ × {cinema.rowCount} แถว
            </Typography>
          </>
        )}
        {cinema && movies.length === 0 && <Alert severity="info">ยังไม่มีภาพยนตร์ที่กำลังฉาย</Alert>}
        {cinema && movies.length > 0 && playing.length === 0 && (
          <Stack spacing={2}>
            <Alert severity="info">สาขานี้ยังไม่มีรอบที่เปิดจอง</Alert>
            <Typography color="text.secondary">เรื่องที่กำลังฉาย สามารถดูรอบของสาขาอื่นได้</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {movies.map(movie => (
                <Button key={movie.movieId} component={Link} to={`/movies/${movie.movieId}`} variant="outlined" sx={{ mb: 1 }}>
                  {movie.title}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}
        <Stack spacing={2}>
          {playing.map(movie => {
            const movieShows = shows.filter(show => show.movieId === movie.movieId)
            const dates = [...new Set(movieShows.map(show => show.showDate))]
            return (
              <Card key={movie.movieId}>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box
                      component={movie.posterUrl ? 'img' : 'div'}
                      src={movie.posterUrl || undefined}
                      alt={movie.title}
                      sx={{
                        width: { xs: '100%', sm: 120 },
                        height: 170,
                        objectFit: 'cover',
                        borderRadius: 1,
                        flexShrink: 0,
                        bgcolor: movie.movieId % 2 === 0 ? '#ffffff' : '#000000',
                        borderBottom: 3,
                        borderColor: 'primary.main'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5">{movie.title}</Typography>
                      <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                        ฉาย {thaiDay(movie.startDate)} ถึง {thaiDay(movie.stopDate)}
                      </Typography>
                      <Stack spacing={1.5}>
                        {dates.map(date => (
                          <Box key={date}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{thaiDay(date)}</Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              {movieShows.filter(show => show.showDate === date).map(show => (
                                <Button
                                  key={show.showtimeId}
                                  component={Link}
                                  to={`/showtimes/${show.showtimeId}`}
                                  variant="outlined"
                                  sx={{ mb: 1 }}
                                >
                                  {slotLabel(show.slot)} {show.time} · ว่าง {show.freeCount}/{show.seatCount}
                                </Button>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
        {playing.length > 0 && waiting.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>เรื่องอื่นที่กำลังฉาย แต่สาขานี้ยังไม่มีรอบ</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {waiting.map(movie => (
                <Button key={movie.movieId} component={Link} to={`/movies/${movie.movieId}`} size="small" sx={{ mb: 1 }}>
                  {movie.title}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </>
  )
}
