import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fa, jalali, jalaliDate, jalaliMonthLabel, jalaliMonthLength, today } from './util'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

export default function JalaliPicker({ label, value, onChange, weekStart, summary, minDate }: {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  weekStart: 'saturday' | 'sunday' | 'monday'
  summary?: string
  minDate?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [month, setMonth] = useState(() => jalali(value || today()))
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const positionCalendar = () => {
      const popupRect = popup.current?.getBoundingClientRect()
      const triggerRect = trigger.current?.getBoundingClientRect()
      if (!popupRect || !triggerRect) return
      const belowSpace = window.innerHeight - triggerRect.bottom - 6
      const aboveSpace = triggerRect.top - 6
      const opensAbove = popupRect.height > belowSpace && aboveSpace > belowSpace
      const top = opensAbove ? triggerRect.top - popupRect.height - 6 : triggerRect.bottom + 6
      const maxTop = Math.max(8, window.innerHeight - popupRect.height - 8)
      const left = Math.max(8, Math.min(triggerRect.right - popupRect.width, window.innerWidth - popupRect.width - 8))
      const next = { top: Math.max(8, Math.min(top, maxTop)), left }
      setPosition(current => current?.top === next.top && current.left === next.left ? current : next)
    }
    positionCalendar()
    window.addEventListener('resize', positionCalendar)
    document.addEventListener('scroll', positionCalendar, true)
    return () => {
      window.removeEventListener('resize', positionCalendar)
      document.removeEventListener('scroll', positionCalendar, true)
    }
  }, [open, monthPickerOpen])

  const calendarPositioned = position !== null
  useEffect(() => {
    if (calendarPositioned) popup.current?.querySelector<HTMLElement>('.calendar-month-trigger')?.focus({ preventScroll: true })
  }, [calendarPositioned])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (root.current && !root.current.contains(target) && !popup.current?.contains(target)) {
        setOpen(false)
        setMonthPickerOpen(false)
      }
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (monthPickerOpen) setMonthPickerOpen(false)
      else {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, monthPickerOpen])

  const moveMonth = (amount: number) => {
    const total = month.year * 12 + month.month - 1 + amount
    setMonth({ year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 + 1, day: 1 })
  }
  const firstDate = jalaliDate(month.year, month.month, 1)
  const saturdayIndex = (new Date(`${firstDate}T12:00:00`).getDay() + 1) % 7
  const firstWeekday = weekStart === 'saturday' ? 0 : weekStart === 'sunday' ? 1 : 2
  const offset = (saturdayIndex - firstWeekday + 7) % 7
  const weekdays = [...WEEKDAYS.slice(firstWeekday), ...WEEKDAYS.slice(0, firstWeekday)]
  const selected = value ? jalali(value) : null
  const todayValue = today()
  const now = jalali(todayValue)
  const currentMonthLabel = MONTHS[now.month - 1]
  const dateLabel = value ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'انتخاب تاریخ'
  const chooseDate = (date: string | null) => {
    onChange(date)
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <div className="date-picker" ref={root}>
      <button ref={trigger} type="button" className="field date-trigger" aria-label={`${label}، ${dateLabel}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen(!open); setMonthPickerOpen(false) }}>
        <span>{dateLabel}</span>
        <CalendarDays className="ui-icon ui-icon-md m" aria-hidden="true" />
      </button>
      {open && createPortal(<div
        ref={popup}
        className="calendar-pop"
        role="dialog"
        aria-label="انتخاب تاریخ"
        dir="rtl"
        style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}
      >
        <div className="calendar-head">
          <button type="button" className="icon-btn" aria-label="ماه قبل" data-tooltip="ماه قبل" data-tooltip-placement="bottom" onClick={() => moveMonth(-1)}><ChevronRight className="ui-icon" aria-hidden="true" /></button>
          <button type="button" className="calendar-month-trigger" aria-expanded={monthPickerOpen} onClick={() => setMonthPickerOpen(!monthPickerOpen)}>{jalaliMonthLabel(month.year, month.month)}</button>
          <button type="button" className="icon-btn" aria-label="ماه بعد" data-tooltip="ماه بعد" data-tooltip-placement="bottom" onClick={() => moveMonth(1)}><ChevronLeft className="ui-icon" aria-hidden="true" /></button>
        </div>
        {monthPickerOpen ? <div className="calendar-month-picker">
          <div className="calendar-month-title">انتخاب ماه و سال</div>
          <div className="calendar-year-nav">
            <button type="button" className="icon-btn" aria-label="سال قبل" data-tooltip="سال قبل" data-tooltip-placement="bottom" onClick={() => setMonth({ ...month, year: month.year - 1 })}><ChevronRight className="ui-icon" aria-hidden="true" /></button>
            <b>{fa(month.year)}</b>
            <button type="button" className="icon-btn" aria-label="سال بعد" data-tooltip="سال بعد" data-tooltip-placement="bottom" onClick={() => setMonth({ ...month, year: month.year + 1 })}><ChevronLeft className="ui-icon" aria-hidden="true" /></button>
          </div>
          <div className="calendar-month-grid">
            {MONTHS.map((name, index) => <button
              type="button"
              key={name}
              className={`calendar-month-option${month.month === index + 1 ? ' selected' : ''}`}
              onClick={() => { setMonth({ ...month, month: index + 1, day: 1 }); setMonthPickerOpen(false) }}
            >{name}</button>)}
          </div>
          <button type="button" className="calendar-today-link" onClick={() => { setMonth(now); setMonthPickerOpen(false) }}>برو به امروز</button>
          <div className="s m calendar-current-month">ماه جاری: {currentMonthLabel}</div>
        </div> : <>
          <div className="calendar-grid">
            {weekdays.map((day, i) => <span className="calendar-weekday" key={`${day}-${i}`}>{day}</span>)}
            {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}
            {Array.from({ length: jalaliMonthLength(month.year, month.month) }, (_, i) => {
              const day = i + 1
              const date = jalaliDate(month.year, month.month, day)
              const active = selected?.year === month.year && selected.month === month.month && selected.day === day
              const isToday = now.year === month.year && now.month === month.month && now.day === day
              const disabled = Boolean(minDate && date < minDate)
              return <button
                type="button"
                key={day}
                disabled={disabled}
                className={`calendar-day${active ? ' selected' : ''}${isToday ? ' today' : ''}`}
                onClick={() => chooseDate(date)}
              >{fa(day)}</button>
            })}
          </div>
          {minDate && <div className="calendar-disabled-note">قبل از شروع ({new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long' }).format(new Date(`${minDate}T12:00:00`))}) قابل انتخاب نیست</div>}
          <div className="calendar-foot">
            <button type="button" className="text-btn" disabled={Boolean(minDate && todayValue < minDate)} onClick={() => { chooseDate(todayValue); setMonth(now) }}>امروز</button>
            {summary && <span className="s m">{summary}</span>}
            {value && <button type="button" className="text-btn" onClick={() => chooseDate(null)}>پاک‌کردن</button>}
          </div>
        </>}
      </div>, root.current?.closest('.modal-backdrop') || document.body)}
    </div>
  )
}
