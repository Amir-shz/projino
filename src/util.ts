import type { Status, Task } from './types'
let usePersianDigits = true
export const setPersianDigits = (enabled: boolean) => { usePersianDigits = enabled }
export const fa = (n: number | string) => String(n).replace(/\d/g, d => usePersianDigits ? '۰۱۲۳۴۵۶۷۸۹'[+d] : d)
export const DEFAULT_PREFERENCES = {
  weekStart: 'saturday' as const,
  deadlineWarningDays: 7,
  persianDigits: true,
  confirmDelete: true,
  startPage: 'dashboard' as const,
}
export const STATUS: Record<Status, { label: string; cls: string }> = {
  pending: { label: 'در انتظار شروع', cls: 'bn' }, active: { label: 'در حال انجام', cls: 'bi' },
  completed: { label: 'تکمیل‌شده', cls: 'bg' }, paused: { label: 'متوقف‌شده', cls: 'bw' }, cancelled: { label: 'لغوشده', cls: 'bx' },
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => iso(new Date())
export const daysLeft = (end: string) => {
  const [a, b, c] = end.split('-').map(Number), [x, y, z] = today().split('-').map(Number)
  return Math.round((Date.UTC(a, b - 1, c) - Date.UTC(x, y - 1, z)) / 864e5)
}
const F = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', o)
export const fmt = (s: string) => F({ day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(s + 'T12:00:00'))
const jalaliParts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
  day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
})
export const jalali = (s: string) => {
  const parts = jalaliParts.formatToParts(new Date(`${s}T12:00:00Z`))
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}
export const jalaliDate = (year: number, month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new RangeError(`Invalid Jalali date: ${year}/${month}/${day}`)
  }
  const gregorianYear = year + 621
  for (let date = Date.UTC(gregorianYear, 2, 19); date <= Date.UTC(gregorianYear, 2, 23); date += 864e5) {
    const candidate = new Date(date).toISOString().slice(0, 10)
    const parts = jalali(candidate)
    if (parts.year === year && parts.month === 1 && parts.day === 1) {
      const daysBeforeMonth = month <= 7 ? (month - 1) * 31 : 6 * 31 + (month - 7) * 30
      const result = new Date(date + (daysBeforeMonth + day - 1) * 864e5).toISOString().slice(0, 10)
      const resultParts = jalali(result)
      if (resultParts.year !== year || resultParts.month !== month || resultParts.day !== day) {
        throw new RangeError(`Invalid Jalali date: ${year}/${month}/${day}`)
      }
      return result
    }
  }
  throw new RangeError(`Invalid Jalali date: ${year}/${month}/${day}`)
}
export const jalaliMonthLength = (year: number, month: number) => {
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  return (Date.parse(`${jalaliDate(nextYear, nextMonth, 1)}T00:00:00Z`) - Date.parse(`${jalaliDate(year, month, 1)}T00:00:00Z`)) / 864e5
}
export const jalaliMonthLabel = (year: number, month: number) =>
  F({ month: 'long', year: 'numeric' }).format(new Date(`${jalaliDate(year, month, 1)}T12:00:00Z`))
export const todayLong = () => F({ weekday: 'long' }).format(new Date()) + '، ' + fmt(today())
export const progress = (tasks: Task[], id: string) => {
  const t = tasks.filter(x => x.pid === id), d = t.filter(x => x.done).length
  return { done: d, total: t.length, pct: t.length ? Math.round((d / t.length) * 100) : 0 }
}
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
