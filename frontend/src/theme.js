import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff6d00', contrastText: '#000000' },
    background: { default: '#000000', paper: '#141414' },
    text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.72)' },
    divider: 'rgba(255,255,255,0.16)'
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#000000' }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.16)' }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#ffffff',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.16)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#000000',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(255,255,255,0.16)'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255,255,255,0.16)' }
      }
    }
  }
})

export default theme
