import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TheatersIcon from '@mui/icons-material/Theaters'
import { useNavigate } from 'react-router-dom'
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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <TheatersIcon color="primary" />
            <Typography variant="h6">Nature MiniPlex</Typography>
          </Stack>
          <Typography variant="h5" gutterBottom>เข้าสู่ระบบพนักงาน</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            หน้านี้สำหรับผู้ดูแลระบบและพนักงานขายตั๋ว ลูกค้าจองได้จากหน้าแรกโดยไม่ต้องสมัคร
          </Typography>
          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField label="ชื่อผู้ใช้" value={username} onChange={event => setUsername(event.target.value)} required />
              <TextField label="รหัสผ่าน" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" size="large">เข้าสู่ระบบ</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
