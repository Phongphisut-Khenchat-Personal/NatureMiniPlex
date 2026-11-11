import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'nmp-cart'

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  function toggle(line) {
    const exists = lines.some(item => item.showtimeId === line.showtimeId && item.seatId === line.seatId)
    if (exists) {
      setLines(lines.filter(item => !(item.showtimeId === line.showtimeId && item.seatId === line.seatId)))
      return ''
    }
    if (lines.length >= 4) {
      return 'จองได้ไม่เกิน 4 ที่นั่งต่อการจอง'
    }
    setLines([...lines, line])
    return ''
  }

  function remove(showtimeId, seatId) {
    setLines(lines.filter(item => !(item.showtimeId === showtimeId && item.seatId === seatId)))
  }

  function clear() {
    setLines([])
  }

  return (
    <CartContext.Provider value={{ lines, toggle, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
