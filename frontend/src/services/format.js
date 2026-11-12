const slotNames = {
  Morning: 'เช้า',
  Afternoon: 'กลางวัน',
  Evening: 'เย็น',
  LateNight: 'ดึก'
}

const showNames = {
  Open: 'เปิดจอง',
  Cancelled: 'ยกเลิกรอบ',
  Started: 'เริ่มฉายแล้ว'
}

export function slotLabel(slot) {
  return slotNames[slot] || slot
}

export function showStatus(status) {
  return showNames[status] || status
}

export function thaiDay(iso) {
  if (!iso) {
    return ''
  }
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function addDays(iso, days) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`
}

export function clockNow() {
  return new Date().toLocaleString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
