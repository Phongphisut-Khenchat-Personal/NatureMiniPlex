import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdminShell } from '../../components/AdminShell.jsx'
import { api } from '../../services/api.js'

const layouts = [
  ['Six', '6 ที่นั่ง · 3 คอลัมน์ × 2 แถว'],
  ['Twelve', '12 ที่นั่ง · 4 คอลัมน์ × 3 แถว']
]

export function CinemasAdmin() {
  const [cinemas, setCinemas] = useState([])
  const [name, setName] = useState('')
  const [layout, setLayout] = useState('Six')
  const [names, setNames] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  function load() {
    return api('/api/cinemas').then(rows => {
      setCinemas(rows)
      setNames(Object.fromEntries(rows.map(cinema => [cinema.cinemaId, cinema.cinemaName])))
    }).catch(reason => setError(reason.message))
  }

  useEffect(() => { load() }, [])

  async function createCinema(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await api('/api/cinemas', {
        method: 'POST',
        body: JSON.stringify({ name, layout })
      })
      setMessage(result.message)
      setName('')
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  async function remove(cinemaId) {
    setError('')
    setMessage('')
    try {
      const result = await api(`/api/cinemas/${cinemaId}`, { method: 'DELETE' })
      setMessage(result.message)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  async function rename(cinemaId) {
    setError('')
    setMessage('')
    try {
      const result = await api(`/api/cinemas/${cinemaId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: names[cinemaId] })
      })
      setMessage(result.message)
      await load()
    } catch (reason) {
      setError(reason.message)
    }
  }

  return (
    <AdminShell>
      <Typography variant="h4" gutterBottom>จัดการโรงภาพยนตร์</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        เพิ่มสาขาได้โดยเลือกผัง 6 หรือ 12 ที่นั่ง ระบบสร้างที่นั่งให้ตามผัง ไม่ได้วาดที่นั่งทีละตัว
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={createCinema}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="ชื่อโรง" value={name} onChange={event => setName(event.target.value)} required sx={{ flex: 1 }} />
            <TextField select label="ผังที่นั่ง" value={layout} onChange={event => setLayout(event.target.value)} sx={{ minWidth: 260 }}>
              {layouts.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
            </TextField>
            <Button type="submit" variant="contained">เพิ่มโรง</Button>
          </Stack>
        </form>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อโรง</TableCell>
              <TableCell>ผัง</TableCell>
              <TableCell>ที่นั่ง</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {cinemas.map(cinema => (
              <TableRow key={cinema.cinemaId} hover>
                <TableCell>
                  <TextField
                    size="small"
                    value={names[cinema.cinemaId] || ''}
                    onChange={event => setNames({ ...names, [cinema.cinemaId]: event.target.value })}
                  />
                </TableCell>
                <TableCell>{cinema.columnCount} คอลัมน์ × {cinema.rowCount} แถว</TableCell>
                <TableCell>{cinema.seatCount}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => rename(cinema.cinemaId)}>บันทึกชื่อ</Button>
                    <Button size="small" color="inherit" onClick={() => setPendingDelete(cinema)}>ลบ</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>ลบ{pendingDelete?.cinemaName}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ลบได้เฉพาะโรงที่ยังไม่มีรอบฉาย ที่นั่งของโรงนี้จะถูกลบไปด้วย
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>ยกเลิก</Button>
          <Button color="warning" onClick={() => { const cinemaId = pendingDelete.cinemaId; setPendingDelete(null); remove(cinemaId) }}>ลบโรง</Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  )
}
