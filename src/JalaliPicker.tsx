import { useEffect, useRef, useState } from 'react'
import { fa, jalali, jalaliDate, jalaliMonthLabel, jalaliMonthLength, today } from './util'

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export default function JalaliPicker({ value, onChange, weekStart }: {
  value: string | null
  onChange: (value: string | null) => void
  weekStart: 'saturday' | 'sunday'
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => jalali(value || today()))
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const outside = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [open])

  const moveMonth = (amount: number) => {
    const total = month.year * 12 + month.month - 1 + amount
    setMonth({ year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 + 1, day: 1 })
  }
  const firstDate = jalaliDate(month.year, month.month, 1)
  const saturdayIndex = (new Date(`${firstDate}T12:00:00`).getDay() + 1) % 7
  const offset = (saturdayIndex - (weekStart === 'sunday' ? 1 : 0) + 7) % 7
  const weekdays = weekStart === 'sunday' ? [...WEEKDAYS.slice(1), WEEKDAYS[0]] : WEEKDAYS
  const selected = value ? jalali(value) : null
  const now = jalali(today())

  return (
    <div className="date-picker" ref={root}>
      <button type="button" className="field date-trigger" onClick={() => setOpen(!open)}>
        <span>{value ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'انتخاب تاریخ'}</span>
        <span className="m">▦</span>
      </button>
      {open && <div className="calendar-pop">
        <div className="calendar-head">
          <button type="button" className="icon-btn" aria-label="ماه بعد" onClick={() => moveMonth(1)}>‹</button>
          <b>{jalaliMonthLabel(month.year, month.month)}</b>
          <button type="button" className="icon-btn" aria-label="ماه قبل" onClick={() => moveMonth(-1)}>›</button>
        </div>
        <div className="calendar-grid">
          {weekdays.map((day, i) => <span className="calendar-weekday" key={`${day}-${i}`}>{day}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
          {Array.from({ length: jalaliMonthLength(month.year, month.month) }, (_, i) => {
            const day = i + 1
            const active = selected?.year === month.year && selected.month === month.month && selected.day === day
            const isToday = now.year === month.year && now.month === month.month && now.day === day
            return <button type="button" key={day} className={`calendar-day${active ? ' selected' : ''}${isToday ? ' today' : ''}`} onClick={() => {
              onChange(jalaliDate(month.year, month.month, day))
              setOpen(false)
            }}>{fa(day)}</button>
          })}
        </div>
        <div className="calendar-foot">
          <button type="button" className="text-btn" onClick={() => { onChange(today()); setMonth(jalali(today())); setOpen(false) }}>امروز</button>
          {value && <button type="button" className="text-btn" onClick={() => { onChange(null); setOpen(false) }}>پاک‌کردن</button>}
        </div>
      </div>}
    </div>
  )
}
