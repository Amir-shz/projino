import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import type { Preferences, Project, Status } from './types'
import { daysLeft, fa, STATUS_OPTIONS, uid } from './util'
import JalaliPicker from './JalaliPicker'
import Dropdown from './Dropdown'
import { Folder, X } from 'lucide-react'

const COLORS = [
  ['#1C39BB', 'آبی پرشین'], ['#3576D5', 'آبی روشن'], ['#7045B8', 'بنفش'],
  ['#C43F5A', 'سرخابی'], ['#D08116', 'کهربایی'], ['#198A6B', 'سبز'],
]

export default function ProjectForm({ project, preferences, onSave, onClose }: {
  project?: Project
  preferences: Preferences
  onSave: (project: Project) => Promise<boolean>
  onClose: () => void
}) {
  const [name, setName] = useState(project?.name || '')
  const [desc, setDesc] = useState(project?.desc || '')
  const [status, setStatus] = useState<Status>(project?.status || 'pending')
  const [start, setStart] = useState<string | null>(project?.start || null)
  const [end, setEnd] = useState<string | null>(project?.end || null)
  const [color, setColor] = useState(project?.color || COLORS[0][0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const icon = name.trim().charAt(0) || 'پ'
  const contractDays = start && end ? Math.max(1, daysLeft(end) - daysLeft(start) + 1) : null

  useLayoutEffect(() => {
    const element = dialog.current
    element?.showModal()
    nameField.current?.focus()
    return () => element?.close()
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!name.trim()) { setError('نام پروژه را وارد کن.'); nameField.current?.focus(); return }
    if (start && end && start > end) { setError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.'); return }
    setSaving(true)
    const success = await onSave({
      id: project?.id || uid(), name: name.trim(), desc: desc.trim(), status,
      start, end, color, icon, completedAt: project?.completedAt,
    })
    if (!success) setError('ذخیرهٔ پروژه ناموفق بود. دوباره تلاش کن.')
    setSaving(false)
  }

  return (
    <dialog ref={dialog} className="modal-backdrop" aria-labelledby="project-form-title" onCancel={event => { event.preventDefault(); if (!saving) onClose() }} onClick={event => { if (!saving && event.target === event.currentTarget) onClose() }}>
      <form className="modal project-form" onSubmit={submit} dir="rtl">
        <header className="modal-head">
          <span className="tile-icon brand"><Folder className="ui-icon" aria-hidden="true" /></span>
          <h2 id="project-form-title">{project ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}</h2>
          <button type="button" disabled={saving} className="icon-btn close-btn" aria-label="بستن" data-tooltip="بستن" data-tooltip-placement="bottom" onClick={onClose}><X className="ui-icon" aria-hidden="true" /></button>
        </header>
        <div className="form-body">
          <label className="form-label"><span className="form-label-heading">نام پروژه <span className="required">*</span></span>
            <input ref={nameField} className="field" value={name} onChange={event => { setName(event.target.value); setError('') }} placeholder="مثلاً طراحی وب‌سایت شرکت" maxLength={100} aria-required="true" aria-invalid={Boolean(error && !name.trim())} aria-describedby={error && !name.trim() ? 'project-name-error' : undefined} />
            {error && !name.trim() && <span className="form-error" id="project-name-error" role="alert">{error}</span>}
          </label>
          <label className="form-label"><span className="form-label-heading">توضیحات <span className="m">(اختیاری)</span></span>
            <textarea className="field" rows={2} value={desc} onChange={event => setDesc(event.target.value)} placeholder="جزئیات کوتاهی دربارهٔ این پروژه..." maxLength={1000} />
          </label>
          <label className="form-label"><span className="form-label-heading">وضعیت پروژه</span>
            <Dropdown className="project-status-dropdown" ariaLabel="وضعیت پروژه" value={status} options={STATUS_OPTIONS} onChange={setStatus} showValueTone showOptionTones showChevron statusTrigger />
          </label>
          <div className="form-row">
            <div className="form-label"><span className="form-label-heading">شروع قرارداد</span>
              <JalaliPicker label="شروع قرارداد" value={start} onChange={date => { setStart(date); setError('') }} weekStart={preferences.weekStart} summary={contractDays ? `مدت قرارداد: ${fa(contractDays)} روز` : undefined} />
            </div>
            <div className="form-label"><span className="form-label-heading">پایان قرارداد</span>
              <JalaliPicker label="پایان قرارداد" value={end} onChange={date => { setEnd(date); setError('') }} weekStart={preferences.weekStart} summary={contractDays ? `مدت قرارداد: ${fa(contractDays)} روز` : undefined} minDate={start} />
            </div>
          </div>
          {error && name.trim() && <div className="form-error" role="alert">{error}</div>}
          <div className="form-label">رنگ پروژه
            <div className="project-color-row">
              <div className="project-mark project-form-mark" aria-hidden="true" style={{ background: `${color}18`, color }}>{icon}</div>
              <div className="choice-row" role="group" aria-label="رنگ پروژه">{COLORS.map(([value, label]) => <button key={value} type="button" aria-label={label} aria-pressed={color === value} className="color-choice" style={{ background: value }} onClick={() => setColor(value)} />)}</div>
            </div>
          </div>
        </div>
        <footer className="modal-foot">
          <button className="btn" type="submit" disabled={saving}>{saving ? 'در حال ذخیره…' : project ? 'ذخیره تغییرات' : 'ایجاد پروژه'}</button>
          <button className="bt" type="button" disabled={saving} onClick={onClose}>انصراف</button>
        </footer>
      </form>
    </dialog>
  )
}
