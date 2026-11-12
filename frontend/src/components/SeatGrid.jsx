import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const rowOrder = ['หน้า', 'กลาง', 'หลัง']

export function SeatGrid({ seats, closed = false, isChosen, onPick, allowClosed = false }) {
  const rows = rowOrder.filter(row => seats.some(seat => seat.seatRow === row))
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
      <Divider flexItem>
        <Chip label="จอภาพยนตร์" size="small" />
      </Divider>
      {rows.map(row => (
        <Stack key={row} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ width: 48 }}>{row}</Typography>
          {seats.filter(seat => seat.seatRow === row).map(seat => {
            const chosen = isChosen?.(seat)
            const markedClosed = seat.closed && !seat.booked && !chosen
            return (
              <Button
                key={seat.seatId}
                variant={chosen || markedClosed ? 'contained' : 'outlined'}
                color="primary"
                disabled={closed || seat.booked || !onPick || (seat.closed && !allowClosed)}
                onClick={() => onPick?.(seat)}
                sx={{
                  minWidth: 84,
                  px: 1,
                  ...(markedClosed ? {
                    bgcolor: '#f5c542',
                    color: '#000',
                    '&:hover': { bgcolor: '#e0b030' },
                    '&.Mui-disabled': { bgcolor: '#f5c542', color: '#000', opacity: 1 }
                  } : {}),
                  ...(seat.booked && !chosen ? {
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)'
                    }
                  } : {})
                }}
              >
                {seat.seatCode}
              </Button>
            )
          })}
        </Stack>
      ))}
    </Stack>
  )
}
