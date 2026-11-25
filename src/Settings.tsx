import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Preferences, State } from './types'
import { DEFAULT_PREFERENCES, fa, today } from './util'
import Dropdown from './Dropdown'
import { Database, Download, HardDrive, SlidersHorizontal, Upload } from 'lucide-react'

export default function Settings({ st, onPreferences, onImport }: {
  st: State
  onPreferences: (preferences: Preferences) => void
  onImport: (state: State) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [backupDate, setBackupDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const preferences = st.preferences
  const update = (patch: Partial<Preferences>) => onPreferences({ ...preferences, ...patch })
  const dataSize = new Blob([JSON.stringify(st)]).size
  const dataSizeLabel = dataSize >= 1024 ? `${fa(Math.round(dataSize / 1024))} کیلوبایت` : `${fa(dataSize)} بایت`
  const warningDayChoices = [...new Set([3, 7, 10, 14, preferences.deadlineWarningDays])].sort((a, b) => a - b)

  const backup = () => {
    const data = JSON.stringify({ app: 'Projino', version: 1, exportedAt: new Date().toISOString(), state: st }, null, 2)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `projino-backup-${today()}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setBackupDate(new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))
    setMessage('فایل پشتیبان با موفقیت آماده شد.')
    setError('')
  }

  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setMessage('')
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const candidate = typeof parsed === 'object' && parsed !== null && 'state' in parsed
        ? (parsed as { state: unknown }).state
        : parsed
      if (typeof candidate !== 'object' || candidate === null
        || !('projects' in candidate) || !Array.isArray(candidate.projects)
        || !('tasks' in candidate) || !Array.isArray(candidate.tasks)) {
        throw new Error('فایل انتخاب‌شده ساختار پشتیبان پروژینو را ندارد.')
      }
      if (!window.confirm(`اطلاعات فعلی با ${fa(candidate.projects.length)} پروژه جایگزین شود؟`)) return
      onImport({
        projects: candidate.projects as State['projects'],
        tasks: candidate.tasks as State['tasks'],
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...('preferences' in candidate && typeof candidate.preferences === 'object' && candidate.preferences !== null
            ? candidate.preferences : {}),
        },
      })
      setMessage('بازیابی اطلاعات با موفقیت انجام شد.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'خواندن فایل پشتیبان ناموفق بود.')
    } finally {
      event.target.value = ''
    }
  }

  return <>
    <header className="page-head"><div><h1>تنظیمات</h1><p>ترجیحات برنامه، پشتیبان‌گیری و بازیابی داده‌ها</p></div></header>
    <div className="settings-layout">
      <div className="settings-main">
        <section className="c settings-panel">
          <header className="settings-title"><span className="tile-icon brand"><HardDrive className="ui-icon" aria-hidden="true" /></span><div><h2>پشتیبان‌گیری و بازیابی</h2><p className="m">یک فایل پشتیبان از پروژه‌ها، وظایف و تنظیمات بگیر.</p></div></header>
          <div className="settings-actions">
            <button className="btn" onClick={backup}><Download className="ui-icon" aria-hidden="true" />گرفتن پشتیبان</button>
            <button className="bt" onClick={() => fileInput.current?.click()}><Upload className="ui-icon" aria-hidden="true" />بازیابی از فایل</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={restore} />
            <span className="s m">{backupDate ? `آخرین پشتیبان: ${backupDate}` : 'هنوز پشتیبانی گرفته نشده.'}</span>
          </div>
          {message && <div className="inline-success" role="status">{message}</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
        </section>
        <section className="c settings-panel">
          <header className="settings-title"><span className="tile-icon blue"><SlidersHorizontal className="ui-icon" aria-hidden="true" /></span><div><h2>ترجیحات</h2></div></header>
          <div className="preference-row"><div><b>شروع هفته</b><span className="s m">در تقویم و انتخاب تاریخ</span></div><Dropdown className="settings-dropdown" ariaLabel="شروع هفته" value={preferences.weekStart} options={[{ value: 'saturday', label: 'شنبه' }, { value: 'sunday', label: 'یکشنبه' }, { value: 'monday', label: 'دوشنبه' }]} onChange={weekStart => update({ weekStart })} /></div>
          <div className="preference-row"><div><b>هشدار ددلاین</b><span className="s m">از چند روز مانده به موعد، پروژه نزدیک نشان داده می‌شود</span></div><Dropdown className="settings-dropdown" ariaLabel="هشدار ددلاین" value={preferences.deadlineWarningDays} options={warningDayChoices.map(days => ({ value: days, label: `${fa(days)} روز` }))} onChange={deadlineWarningDays => update({ deadlineWarningDays })} /></div>
          <Toggle label="نمایش ارقام فارسی" detail="مثل ۱۲۳ به‌جای 123" checked={preferences.persianDigits} onChange={checked => update({ persianDigits: checked })} />
          <Toggle label="تأیید قبل از حذف" detail="برای حذف پروژه و وظیفه" checked={preferences.confirmDelete} onChange={checked => update({ confirmDelete: checked })} />
          <div className="preference-row"><div><b>صفحهٔ شروع برنامه</b><span className="s m">هنگام بازشدن پروژینو</span></div><Dropdown className="settings-dropdown" ariaLabel="صفحهٔ شروع برنامه" value={preferences.startPage} options={[{ value: 'dashboard', label: 'داشبورد' }, { value: 'projects', label: 'پروژه‌ها' }]} onChange={startPage => update({ startPage })} /></div>
        </section>
      </div>
      <aside className="c settings-panel data-panel">
        <header className="settings-title"><span className="tile-icon green"><Database className="ui-icon" aria-hidden="true" /></span><div><h2>داده‌های شما</h2></div></header>
        <div className="data-rows">
          <div><span>پروژه‌ها</span><b>{fa(st.projects.length)}</b></div>
          <div><span>وظایف</span><b>{fa(st.tasks.length)}</b></div>
          <div><span>حجم داده</span><b>{dataSizeLabel}</b></div>
          <div><span>محل ذخیره</span><b>محلی روی همین دستگاه</b></div>
          <div><span>نسخه</span><b>۱٫۰٫۰</b></div>
        </div>
      </aside>
    </div>
  </>
}

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="preference-row"><span><b>{label}</b><span className="s m">{detail}</span></span><input className="toggle" type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></label>
}
