import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Link } from 'react-router-dom'
import { MovieCard } from '../../components/MovieCard.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function Home() {
  const [movies, setMovies] = useState([])
  const [shows, setShows] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const today = todayIso()
    Promise.all([
      api('/api/movies/showing'),
      api('/api/cinemas'),
      api(`/api/showtimes?from=${today}&to=${today}`)
    ]).then(([movieRows, cinemaRows, showRows]) => {
      setMovies(movieRows)
      setCinemas(cinemaRows)
      setShows(showRows.filter(show => show.status === 'Open'))
    }).catch(reason => setError(reason.message))
  }, [])

  useEffect(() => {
    if (movies.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex(current => (current + 1) % movies.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [movies.length])

  const slide = movies[index] || null
  const recommended = movies.filter(movie => movie.isRecommended)

  function step(direction) {
    if (movies.length === 0) return
    setIndex(current => (current + direction + movies.length) % movies.length)
  }

  return (
    <>
      <SiteHeader />
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 420, md: 520 },
          display: 'flex',
          alignItems: 'flex-end',
          color: 'common.white',
          backgroundColor: '#000',
          backgroundImage: slide?.posterUrl
            ? `linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.28) 100%), url(${slide.posterUrl})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          {slide && (
            <Box sx={{ maxWidth: 640 }}>
              <Chip label={slide.isRecommended ? 'ภาพยนตร์แนะนำ' : 'กำลังฉาย'} color="primary" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>{slide.title}</Typography>
              <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                {thaiDay(slide.startDate)} – {thaiDay(slide.stopDate)}
              </Typography>
              <Button component={Link} to={`/movies/${slide.movieId}`} variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                จองตั๋วเรื่องนี้
              </Button>
            </Box>
          )}
          {movies.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 4, alignItems: 'center' }}>
              <IconButton aria-label="เรื่องก่อนหน้า" onClick={() => step(-1)} sx={{ color: 'common.white' }}>
                <ChevronLeftIcon />
              </IconButton>
              {movies.map((movie, movieIndex) => (
                <Box
                  key={movie.movieId}
                  component="button"
                  aria-label={movie.title}
                  onClick={() => setIndex(movieIndex)}
                  sx={{
                    width: movieIndex === index ? 28 : 10,
                    height: 10,
                    p: 0,
                    border: 0,
                    borderRadius: 5,
                    cursor: 'pointer',
                    bgcolor: movieIndex === index ? 'primary.main' : 'rgba(255,255,255,0.45)'
                  }}
                />
              ))}
              <IconButton aria-label="เรื่องถัดไป" onClick={() => step(1)} sx={{ color: 'common.white' }}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <MovieRow title="ภาพยนตร์แนะนำ" movies={recommended} />
        <MovieRow
          title="ภาพยนตร์ที่กำลังฉาย"
          movies={movies}
          action={<Button component={Link} to="/movies" endIcon={<ArrowForwardIcon />}>ดูทั้งหมด</Button>}
        />

        {shows.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>รอบฉายวันนี้</Typography>
            <Grid container spacing={2}>
              {shows.map(show => (
                <Grid key={show.showtimeId} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea component={Link} to={`/showtimes/${show.showtimeId}`} sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{show.movieTitle}</Typography>
                        <Typography color="text.secondary">{show.cinemaName}</Typography>
                        <Typography color="primary" sx={{ mt: 1 }}>
                          รอบ{slotLabel(show.slot)} {show.time} · ว่าง {show.freeCount}/{show.seatCount}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Typography variant="h5" sx={{ mb: 2 }}>สาขาโรงภาพยนตร์</Typography>
        <Grid container spacing={2}>
          {cinemas.map(cinema => (
            <Grid key={cinema.cinemaId} size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{cinema.cinemaName}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {cinema.seatCount} ที่นั่ง · {cinema.columnCount} คอลัมน์ × {cinema.rowCount} แถว
                  </Typography>
                  <Button component={Link} to={`/cinemas/${cinema.cinemaId}`} variant="outlined">เลือกสาขา</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}

function MovieRow({ title, movies, action }) {
  if (!movies || movies.length === 0) return null
  return (
    <Box sx={{ mb: 5 }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">{title}</Typography>
        {action}
      </Stack>
      <Grid container spacing={2}>
        {movies.map(movie => (
          <Grid key={movie.movieId} size={{ xs: 12, sm: 6, md: 3 }}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
