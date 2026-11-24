import { useEffect, useState, type FormEvent } from 'react'
import type { Preferences, Project, Status } from './types'
import { daysLeft, fa, STATUS_OPTIONS, uid } from './util'
import JalaliPicker from './JalaliPicker'
import Dropdown from './Dropdown'
import { X } from 'lucide-react'

const COLORS = ['#6258E8', '#3576D5', '#7045B8', '#C43F5A', '#D08116', '#198A6B']

export default function ProjectForm({ project, preferences, onSave, onClose }: {
  project?: Project
  preferences: Preferences
  onSave: (project: Project) => void
  onClose: () => void
}) {
  const [name, setName] = useState(project?.name || '')
  const [desc, setDesc] = useState(project?.desc || '')
  const [status, setStatus] = useState<Status>(project?.status || 'pending')
  const [start, setStart] = useState<string | null>(project?.start || null)
  const [end, setEnd] = useState<string | null>(project?.end || null)
  const [color, setColor] = useState(project?.color || COLORS[0])
  const [error, setError] = useState('')
  const icon = name.trim().charAt(0) || 'پ'
  const contractDays = start && end ? Math.max(1, daysLeft(end) - daysLeft(start) + 1) : null

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      const popupEscape = event.composedPath().some(target => target instanceof Element && target.matches('.calendar-pop, .dropdown-menu'))
      if (event.key === 'Escape' && !popupEscape && !document.querySelector('.calendar-pop, .dropdown-menu')) onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) { setError('نام پروژه را وارد کن.'); return }
    if (start && end && start > end) { setError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.'); return }
    onSave({
      id: project?.id || uid(), name: name.trim(), desc: desc.trim(), status,
      start, end, color, icon, completedAt: project?.completedAt,
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="modal project-form" onSubmit={submit} dir="rtl">
        <header className="modal-head">
          <div><h2>{project ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}</h2></div>
          <button type="button" className="icon-btn close-btn" aria-label="بستن" data-tooltip="بستن" data-tooltip-placement="bottom" onClick={onClose}><X className="ui-icon" aria-hidden="true" /></button>
        </header>
        <div className="form-body">
          <div className="form-label">رنگ پروژه
            <div className="project-color-row">
              <div className="project-mark project-form-mark" style={{ background: `${color}18`, color }}>{icon}</div>
              <div className="choice-row">{COLORS.map(item => <button key={item} type="button" aria-label={`رنگ ${item}`} aria-pressed={color === item} className={`color-choice${color === item ? ' chosen' : ''}`} style={{ background: item }} onClick={() => setColor(item)} />)}</div>
            </div>
          </div>
          <label className="form-label"><span className="form-label-heading">نام پروژه <span className="required">*</span></span>
            <input autoFocus className="field" value={name} onChange={event => { setName(event.target.value); setError('') }} placeholder="مثلاً طراحی وب‌سایت شرکت" maxLength={100} />
          </label>
          <label className="form-label"><span className="form-label-heading">توضیحات <span className="m">(اختیاری)</span></span>
            <textarea className="field" rows={2} value={desc} onChange={event => setDesc(event.target.value)} placeholder="جزئیات کوتاهی دربارهٔ این پروژه..." maxLength={1000} />
          </label>
          <label className="form-label"><span className="form-label-heading">وضعیت پروژه</span>
            <Dropdown className="project-status-dropdown" ariaLabel="وضعیت پروژه" value={status} options={STATUS_OPTIONS} onChange={setStatus} showValueTone showOptionTones showChevron statusTrigger />
          </label>
          <div className="form-row">
            <label className="form-label"><span className="form-label-heading">شروع قرارداد</span>
              <JalaliPicker value={start} onChange={setStart} weekStart={preferences.weekStart} summary={contractDays ? `مدت قرارداد: ${fa(contractDays)} روز` : undefined} />
            </label>
            <label className="form-label"><span className="form-label-heading">پایان قرارداد</span>
              <JalaliPicker value={end} onChange={setEnd} weekStart={preferences.weekStart} summary={contractDays ? `مدت قرارداد: ${fa(contractDays)} روز` : undefined} minDate={start} />
            </label>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <footer className="modal-foot">
          <button className="btn" type="submit">{project ? 'ذخیره تغییرات' : 'ایجاد پروژه'}</button>
          <button className="bt" type="button" onClick={onClose}>انصراف</button>
        </footer>
      </form>
    </div>
  )
}
