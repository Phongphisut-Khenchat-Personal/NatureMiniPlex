import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { MovieCard } from '../../components/MovieCard.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'

export function Movies() {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/movies/showing').then(setMovies).catch(reason => setError(reason.message))
  }, [])

  return (
    <>
      <SiteHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>รายการภาพยนตร์</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          {movies.map(movie => (
            <Grid key={movie.movieId} size={{ xs: 12, sm: 6, md: 3 }}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}
