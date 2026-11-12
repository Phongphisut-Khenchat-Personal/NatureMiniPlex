import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EventSeatIcon from '@mui/icons-material/EventSeat'
import LogoutIcon from '@mui/icons-material/Logout'
import MovieIcon from '@mui/icons-material/Movie'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StoreIcon from '@mui/icons-material/Store'
import TheatersIcon from '@mui/icons-material/Theaters'
import { NavLink, Navigate, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../services/api.js'

const drawerWidth = 260
const links = [
  ['/admin', 'Dashboard', DashboardIcon, true],
  ['/admin/movies', 'จัดการภาพยนตร์', MovieIcon, false],
  ['/admin/cinemas', 'จัดการโรงภาพยนตร์', StoreIcon, false],
  ['/admin/seats', 'จัดการที่นั่ง', EventSeatIcon, false],
  ['/admin/showtimes', 'จัดการรอบฉาย', ScheduleIcon, false],
  ['/admin/bookings', 'จัดการการจอง', ReceiptLongIcon, false],
  ['/admin/reports', 'รายงาน', AssessmentIcon, false]
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar>
          <TheatersIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap>Nature MiniPlex</Typography>
        </Toolbar>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {links.map(([to, label, Icon, end]) => (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              end={end}
              sx={{
                '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                '&.active .MuiListItemIcon-root': { color: 'inherit' }
              }}
            >
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
            ออกจากระบบ
          </Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  )
}
