import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Poster } from '../../components/Poster.jsx'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'

export function Home() {
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/api/movies/showing'), api('/api/cinemas')])
      .then(([movieRows, cinemaRows]) => {
        setMovies(movieRows)
        setCinemas(cinemaRows)
      })
      .catch(reason => setError(reason.message))
  }, [])

  return (
    <div className="customer">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <h1>สัมผัสประสบการณ์<br />การดูหนังที่เหนือกว่า<br /><span>ที่ Nature MiniPlex</span></h1>
          <Link to="/movies" className="btn">จองตั๋วเลย →</Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="seat-glow" />
          <div className="popcorn">
            <div className="popcorn-top" />
            <div className="popcorn-cup" />
          </div>
          <div className="drink" />
        </div>
      </section>
      <section className="sheet">
        <div className="section-head">
          <h2>ภาพยนตร์ที่กำลังฉาย</h2>
          <Link to="/movies">ดูทั้งหมด →</Link>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="home-grid">
          <div className="poster-row">
            {movies.map(movie => <Poster key={movie.movieId} movie={movie} />)}
          </div>
          <aside className="branch-card">
            <h3>เลือกสาขาโรงภาพยนตร์</h3>
            {cinemas.map(cinema => (
              <div key={cinema.cinemaId} className="branch">
                <div>
                  <strong>{cinema.cinemaName}</strong>
                  <span>{cinema.seatCount} ที่นั่ง · {cinema.columnCount} คอลัมน์ × {cinema.rowCount} แถว</span>
                </div>
                <Link to={`/cinemas/${cinema.cinemaId}`}>เลือกสาขา</Link>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </div>
  )
}
