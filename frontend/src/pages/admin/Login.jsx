import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/SiteHeader.jsx'
import { api, setToken } from '../../services/api.js'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      setToken(result.token)
      navigate('/admin')
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={submit} className="login-card">
        <Logo />
        <h1>เข้าสู่ระบบพนักงาน</h1>
        <p>หน้านี้สำหรับผู้ดูแลระบบและพนักงานขายตั๋ว ลูกค้าจองได้จากหน้าแรกโดยไม่ต้องสมัคร</p>
        <label>
          ชื่อผู้ใช้
          <input value={username} onChange={event => setUsername(event.target.value)} />
        </label>
        <label>
          รหัสผ่าน
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  )
}
