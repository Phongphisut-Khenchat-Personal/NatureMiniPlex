import { Link } from 'react-router-dom'
import { posterStyle, thaiDay } from '../services/format.js'

export function Poster({ movie }) {
  return (
    <article className="poster">
      <div className="poster-art" style={posterStyle(movie.movieId)}>
        <span className="badge">กำลังฉาย</span>
        <strong>{movie.title}</strong>
      </div>
      <div className="poster-body">
        <h3>{movie.title}</h3>
        <p>{thaiDay(movie.startDate)} – {thaiDay(movie.stopDate)}</p>
        <Link to={`/movies/${movie.movieId}`} className="btn btn-small">จองตั๋ว</Link>
      </div>
    </article>
  )
}
