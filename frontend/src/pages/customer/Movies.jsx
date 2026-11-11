import { useEffect, useState } from 'react'
import { Poster } from '../../components/Poster.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'

export function Movies() {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/movies/showing').then(setMovies).catch(reason => setError(reason.message))
  }, [])

  return (
    <div className="customer">
      <SiteHeader />
      <section className="sheet">
        <div className="section-head">
          <h2>รายการภาพยนตร์</h2>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="poster-grid">
          {movies.map(movie => <Poster key={movie.movieId} movie={movie} />)}
        </div>
      </section>
    </div>
  )
}
