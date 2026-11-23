import { useEffect, useState, type FormEvent } from 'react'
import type { Preferences, Project, Status } from './types'
import { STATUS, uid } from './util'
import JalaliPicker from './JalaliPicker'

const COLORS = ['#6258E8', '#248A70', '#D98324', '#D94F70', '#3786C8', '#8054B9', '#475569', '#1596A3']
const ICONS = ['📁', '💻', '📱', '🎨', '🛍️', '📋', '🏠', '⭐']

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
  const [icon, setIcon] = useState(project?.icon || ICONS[0])
  const [error, setError] = useState('')

  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) { setError('نام پروژه را وارد کن.'); return }
    if (start && end && start > end) { setError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.'); return }
    onSave({
      id: project?.id || uid(), name: name.trim(), desc: desc.trim(), status,
      start, end, color, icon,
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="modal project-form" onSubmit={submit} dir="rtl">
        <header className="modal-head">
          <div className="project-mark" style={{ background: `${color}18`, color }}>{icon}</div>
          <div><h2>{project ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}</h2><p className="m">اطلاعات پروژه‌ات را وارد کن.</p></div>
          <button type="button" className="icon-btn close-btn" aria-label="بستن" onClick={onClose}>×</button>
        </header>
        <div className="form-body">
          <label className="form-label">نام پروژه <span className="required">*</span>
            <input autoFocus className="field" value={name} onChange={event => { setName(event.target.value); setError('') }} placeholder="مثلاً طراحی وب‌سایت شرکت" maxLength={100} />
          </label>
          <label className="form-label">توضیحات <span className="m">(اختیاری)</span>
            <textarea className="field" rows={3} value={desc} onChange={event => setDesc(event.target.value)} placeholder="جزئیات کوتاهی دربارهٔ این پروژه..." maxLength={1000} />
          </label>
          <div className="form-row">
            <label className="form-label">وضعیت پروژه
              <select className="field" value={status} onChange={event => setStatus(event.target.value as Status)}>
                {Object.entries(STATUS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
              </select>
            </label>
            <div className="form-label">آیکون پروژه
              <div className="choice-row icon-choices">{ICONS.map(item => <button key={item} type="button" className={`choice-icon${icon === item ? ' chosen' : ''}`} onClick={() => setIcon(item)}>{item}</button>)}</div>
            </div>
          </div>
          <div className="form-label">رنگ پروژه
            <div className="choice-row">{COLORS.map(item => <button key={item} type="button" aria-label={`رنگ ${item}`} className={`color-choice${color === item ? ' chosen' : ''}`} style={{ background: item }} onClick={() => setColor(item)} />)}</div>
          </div>
          <div className="form-row">
            <label className="form-label">شروع قرارداد
              <JalaliPicker value={start} onChange={setStart} weekStart={preferences.weekStart} />
            </label>
            <label className="form-label">پایان قرارداد
              <JalaliPicker value={end} onChange={setEnd} weekStart={preferences.weekStart} />
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
