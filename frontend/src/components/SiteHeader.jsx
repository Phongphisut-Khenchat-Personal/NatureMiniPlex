import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import TheatersIcon from '@mui/icons-material/Theaters'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from './CartContext.jsx'

const links = [
  ['/', 'หน้าแรก', true],
  ['/movies', 'รายการภาพยนตร์', false],
  ['/my-booking', 'ตรวจสอบการจอง', false]
]

export function SiteHeader() {
  const { lines } = useCart()
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <TheatersIcon color="primary" sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, mr: 2 }}
        >
          Nature MiniPlex
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, flexWrap: 'wrap' }}>
          {links.map(([to, label, end]) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              end={end}
              color="inherit"
              sx={{ '&.active': { color: 'primary.main' } }}
            >
              {label}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
        <Button component={Link} to="/checkout" color="inherit" startIcon={
          <Badge badgeContent={lines.length} color="primary">
            <ConfirmationNumberIcon />
          </Badge>
        }>
          ตั๋ว
        </Button>
        <Button component={Link} to="/admin/login" variant="contained" sx={{ ml: 1 }}>
          เข้าสู่ระบบ
        </Button>
      </Toolbar>
    </AppBar>
  )
}
