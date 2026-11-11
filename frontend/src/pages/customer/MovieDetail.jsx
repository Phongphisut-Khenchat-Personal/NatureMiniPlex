import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { posterStyle, slotLabel, thaiDay, todayIso } from '../../services/format.js'

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
    <div className="customer">
      <SiteHeader />
      <section className="sheet">
        {error && <p className="error">{error}</p>}
        {movie && (
          <>
            <div className="detail-head" style={posterStyle(movie.movieId)}>
              <div>
                <p className="eyebrow">กำลังฉาย</p>
                <h1>{movie.title}</h1>
                <p>ฉาย {thaiDay(movie.startDate)} ถึง {thaiDay(movie.stopDate)}</p>
              </div>
            </div>
            {dates.length === 0 && <p>ยังไม่มีรอบที่เปิดจอง</p>}
            {dates.map(date => (
              <div key={date} className="show-day">
                <h2>{thaiDay(date)}</h2>
                <div className="show-list">
                  {shows.filter(show => show.showDate === date).map(show => (
                    <Link key={show.showtimeId} to={`/showtimes/${show.showtimeId}`} className="show-chip">
                      <strong>{show.cinemaName}</strong>
                      <span>รอบ{slotLabel(show.slot)} {show.time}</span>
                      <em>ว่าง {show.freeCount}/{show.seatCount}</em>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <p className="hint">เลือกได้มากกว่าหนึ่งรอบ แล้วไปยืนยันพร้อมกันได้ไม่เกิน 4 ที่นั่ง</p>
          </>
        )}
      </section>
    </div>
  )
}
