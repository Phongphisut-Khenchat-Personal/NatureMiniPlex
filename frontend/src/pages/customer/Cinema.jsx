import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../../components/SiteHeader.jsx'
import { api } from '../../services/api.js'
import { addDays, slotLabel, thaiDay, todayIso } from '../../services/format.js'

export function Cinema() {
  const { id } = useParams()
  const [cinema, setCinema] = useState(null)
  const [shows, setShows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const today = todayIso()
    Promise.all([
      api('/api/cinemas'),
      api(`/api/showtimes?cinemaId=${id}&from=${today}&to=${addDays(today, 6)}`)
    ]).then(([cinemas, rows]) => {
      setCinema(cinemas.find(item => item.cinemaId === Number(id)) || null)
      setShows(rows.filter(show => show.status === 'Open'))
    }).catch(reason => setError(reason.message))
  }, [id])

  const dates = [...new Set(shows.map(show => show.showDate))]

  return (
    <div className="customer">
      <SiteHeader />
      <section className="sheet">
        {error && <p className="error">{error}</p>}
        {cinema && (
          <>
            <h1>{cinema.cinemaName}</h1>
            <p>{cinema.seatCount} ที่นั่ง จัดเป็น {cinema.columnCount} คอลัมน์ × {cinema.rowCount} แถว</p>
          </>
        )}
        {dates.map(date => (
          <div key={date} className="show-day">
            <h2>{thaiDay(date)}</h2>
            <div className="show-list">
              {shows.filter(show => show.showDate === date).map(show => (
                <Link key={show.showtimeId} to={`/showtimes/${show.showtimeId}`} className="show-chip">
                  <strong>{show.movieTitle}</strong>
                  <span>รอบ{slotLabel(show.slot)} {show.time}</span>
                  <em>ว่าง {show.freeCount}/{show.seatCount}</em>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
