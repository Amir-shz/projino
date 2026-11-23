import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Preferences, State } from './types'
import { DEFAULT_PREFERENCES, fa, fmt, today } from './util'

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
    <header className="page-head"><div><div className="s m">شخصی‌سازی</div><h1>تنظیمات</h1><p>همه‌چیز ساده و محلی، فقط روی همین رایانه.</p></div></header>
    <section className="c settings-panel">
      <header className="settings-title"><div className="settings-icon">↥</div><div><h2>پشتیبان‌گیری و بازیابی</h2><p className="m">همهٔ پروژه‌ها و وظایفت در یک فایل ذخیره می‌شود.</p></div></header>
      <div className="settings-actions">
        <button className="btn" onClick={backup}>گرفتن پشتیبان</button>
        <button className="bt" onClick={() => fileInput.current?.click()}>بازیابی از فایل</button>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={restore} />
        <span className="s m">{backupDate ? `آخرین پشتیبان: ${backupDate}` : 'پشتیبان روی دستگاهت ذخیره می‌شود.'}</span>
      </div>
      {message && <div className="inline-success" role="status">{message}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
    </section>
    <section className="c settings-panel">
      <header className="settings-title"><div className="settings-icon">⚙</div><div><h2>ترجیحات</h2><p className="m">رفتار پروژینو را با روش کار خودت هماهنگ کن.</p></div></header>
      <div className="preference-row"><div><b>شروع هفته</b><span className="s m">در تقویم و انتخاب تاریخ</span></div><select className="field compact-field" value={preferences.weekStart} onChange={event => update({ weekStart: event.target.value as Preferences['weekStart'] })}><option value="saturday">شنبه</option><option value="sunday">یکشنبه</option></select></div>
      <div className="preference-row"><div><b>هشدار ددلاین</b><span className="s m">پروژه از چند روز مانده به موعد نزدیک نشان داده شود</span></div><select className="field compact-field" value={preferences.deadlineWarningDays} onChange={event => update({ deadlineWarningDays: Number(event.target.value) })}>{[3, 5, 7, 14, 30].map(days => <option value={days} key={days}>{fa(days)} روز</option>)}</select></div>
      <Toggle label="نمایش ارقام فارسی" detail="مثل ۱۲۳ به‌جای 123" checked={preferences.persianDigits} onChange={checked => update({ persianDigits: checked })} />
      <Toggle label="تأیید قبل از حذف" detail="برای حذف پروژه و وظیفه" checked={preferences.confirmDelete} onChange={checked => update({ confirmDelete: checked })} />
      <div className="preference-row"><div><b>صفحهٔ شروع برنامه</b><span className="s m">هنگام بازشدن پروژینو</span></div><select className="field compact-field" value={preferences.startPage} onChange={event => update({ startPage: event.target.value as Preferences['startPage'] })}><option value="dashboard">داشبورد</option><option value="projects">پروژه‌ها</option></select></div>
    </section>
    <section className="c settings-panel privacy-panel">
      <header className="settings-title"><div className="settings-icon">●</div><div><h2>داده‌های شما</h2><p className="m">اطلاعات روی همین دستگاه ذخیره می‌شود و جایی ارسال نمی‌شود.</p></div></header>
      <div className="data-stats"><div><b>{fa(st.projects.length)}</b><span className="m">پروژه</span></div><div><b>{fa(st.tasks.length)}</b><span className="m">وظیفه</span></div><div><b>{fa(new Blob([JSON.stringify(st)]).size)} بایت</b><span className="m">حجم داده</span></div></div>
      <div className="s m">تاریخ امروز: {fmt(today())}</div>
    </section>
  </>
}

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="preference-row"><span><b>{label}</b><span className="s m">{detail}</span></span><input className="toggle" type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></label>
}
