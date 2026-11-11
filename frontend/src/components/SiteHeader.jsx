import { Link, NavLink } from 'react-router-dom'
import { useCart } from './CartContext.jsx'

export function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark" aria-hidden="true" />
      <span>
        <strong>Nature</strong>
        MiniPlex
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const { lines } = useCart()
  return (
    <header className="topbar">
      <Logo />
      <nav className="topnav">
        <NavLink to="/" end>หน้าแรก</NavLink>
        <NavLink to="/movies">รายการภาพยนตร์</NavLink>
        <NavLink to="/my-booking">ตรวจสอบการจอง</NavLink>
      </nav>
      <div className="top-actions">
        <Link to="/checkout" className="cart-link">ตั๋วที่เลือก {lines.length}/4</Link>
        <Link to="/admin/login" className="login-pill">เข้าสู่ระบบ</Link>
      </div>
    </header>
  )
}
