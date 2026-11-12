import { Route, Routes } from 'react-router-dom'
import { BookingsAdmin } from './pages/admin/Bookings.jsx'
import { CinemasAdmin } from './pages/admin/Cinemas.jsx'
import { Dashboard } from './pages/admin/Dashboard.jsx'
import { Login } from './pages/admin/Login.jsx'
import { MoviesAdmin } from './pages/admin/Movies.jsx'
import { Reports } from './pages/admin/Reports.jsx'
import { SeatsAdmin } from './pages/admin/Seats.jsx'
import { ShowtimesAdmin } from './pages/admin/Showtimes.jsx'
import { Checkout } from './pages/customer/Checkout.jsx'
import { Cinema } from './pages/customer/Cinema.jsx'
import { Home } from './pages/customer/Home.jsx'
import { MovieDetail } from './pages/customer/MovieDetail.jsx'
import { Movies } from './pages/customer/Movies.jsx'
import { MyBooking } from './pages/customer/MyBooking.jsx'
import { SeatSelect } from './pages/customer/SeatSelect.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
      <Route path="/cinemas/:id" element={<Cinema />} />
      <Route path="/showtimes/:id" element={<SeatSelect />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-booking" element={<MyBooking />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/movies" element={<MoviesAdmin />} />
      <Route path="/admin/cinemas" element={<CinemasAdmin />} />
      <Route path="/admin/seats" element={<SeatsAdmin />} />
      <Route path="/admin/showtimes" element={<ShowtimesAdmin />} />
      <Route path="/admin/bookings" element={<BookingsAdmin />} />
      <Route path="/admin/reports" element={<Reports />} />
    </Routes>
  )
}
