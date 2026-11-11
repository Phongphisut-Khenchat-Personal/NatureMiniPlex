import { NavLink, Navigate, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../services/api.js'
import { Logo } from './SiteHeader.jsx'

const links = [
  ['/admin', 'Dashboard'],
  ['/admin/movies', 'จัดการภาพยนตร์'],
  ['/admin/cinemas', 'จัดการโรงภาพยนตร์'],
  ['/admin/seats', 'จัดการที่นั่ง'],
  ['/admin/showtimes', 'จัดการรอบฉาย'],
  ['/admin/bookings', 'จัดการการจอง'],
  ['/admin/reports', 'รายงาน']
]

export function AdminShell({ children }) {
  const navigate = useNavigate()
  if (!getToken()) {
    return <Navigate to="/admin/login" replace />
  }

  function logout() {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="admin">
      <aside className="sidebar">
        <Logo />
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/admin'}>{label}</NavLink>
          ))}
        </nav>
        <button type="button" className="text-button" onClick={logout}>ออกจากระบบ</button>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <div className="who">
            <strong>Admin</strong>
            <span>ผู้ดูแลระบบ</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
