import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import { thaiDay } from '../services/format.js'

export function MovieCard({ movie }) {
  const light = movie.movieId % 2 === 0
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        image={movie.posterUrl || undefined}
        sx={{ height: 280, bgcolor: light ? '#ffffff' : '#000000', borderBottom: 3, borderColor: 'primary.main', position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <Chip label="กำลังฉาย" color="primary" size="small" sx={{ position: 'absolute', top: 12, left: 12 }} />
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>{movie.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {thaiDay(movie.startDate)} – {thaiDay(movie.stopDate)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/movies/${movie.movieId}`} variant="contained" size="small">
          จองตั๋ว
        </Button>
      </CardActions>
    </Card>
  )
}
