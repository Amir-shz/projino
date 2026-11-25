import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Download, FileText, Paperclip, Pencil, StickyNote, Trash2 } from 'lucide-react'
import type { ProjectResource } from './types'
import Dropdown, { type DropdownOption } from './Dropdown'
import { downloadProjectFile, fileBudget, fileBytes, readFileData } from './projectFiles'
import { fa, uid } from './util'

const kinds: DropdownOption<ProjectResource['kind']>[] = [
  { value: 'note', label: 'یادداشت' },
  { value: 'file', label: 'پیوست فایل' },
]

export default function ProjectResources({ items, confirmDelete, onChange }: {
  items: ProjectResource[]
  confirmDelete: boolean
  onChange: (change: (items: ProjectResource[]) => ProjectResource[]) => Promise<boolean>
}) {
  const id = useId()
  const [kind, setKind] = useState<ProjectResource['kind']>('note')
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const noteField = useRef<HTMLTextAreaElement>(null)
  const limitLabel = fa(fileBudget.perFile / (1024 * 1024))
  useEffect(() => {
    if (editing) noteField.current?.focus()
  }, [editing])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const files = Array.from(form.querySelector<HTMLInputElement>('input[type=file]')?.files ?? [])
    if (kind === 'note' && !text.trim()) { setError('متن یادداشت را وارد کن.'); return }
    if (kind === 'file' && !files.length) { setError('حداقل یک فایل انتخاب کن.'); return }
    if (files.some(file => file.size > fileBudget.perFile)) { setError(`حداکثر اندازهٔ هر فایل ${limitLabel} مگابایت است.`); return }
    if (files.reduce((total, file) => total + file.size, 0) > fileBudget.total) { setError('حجم فایل‌های انتخاب‌شده بیش از ظرفیت برنامه است.'); return }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const resources: ProjectResource[] = kind === 'note'
        ? [{ id: editing ?? uid(), kind: 'note', text: text.trim() }]
        : await Promise.all(files.map(async file => ({ id: uid(), kind: 'file', name: file.name, data: await readFileData(file) })))
      if (!await onChange(current => editing && kind === 'note'
        ? current.map(item => item.id === editing ? resources[0] : item)
        : [...resources, ...current])) {
        setError('ذخیره نشد. ورودی‌ها برای تلاش دوباره حفظ شدند.')
        return
      }
      setEditing(null)
      setText('')
      form.reset()
      setMessage(kind === 'note' ? 'یادداشت ذخیره شد.' : `${fa(resources.length)} فایل پیوست شد.`)
    } catch {
      setError('خواندن فایل ناموفق بود. دوباره انتخابش کن.')
    } finally {
      setBusy(false)
    }
  }
  const remove = async (item: ProjectResource) => {
    if (confirmDelete && !window.confirm(item.kind === 'file' ? `فایل «${item.name}» حذف شود؟` : 'این یادداشت حذف شود؟')) return
    setError('')
    setMessage('')
    setBusy(true)
    if (await onChange(current => current.filter(resource => resource.id !== item.id))) {
      if (editing === item.id) { setEditing(null); setText('') }
      setMessage(item.kind === 'file' ? 'فایل حذف شد.' : 'یادداشت حذف شد.')
    } else setError('حذف انجام نشد.')
    setBusy(false)
  }

  return <section className="c info-panel project-resources" aria-labelledby={`${id}-heading`}>
    <header className="resources-heading">
      <h2 id={`${id}-heading`}><Paperclip className="ui-icon" aria-hidden="true" />یادداشت‌ها و پیوست‌ها</h2>
      <span className="b bn">{fa(items.length)} مورد</span>
    </header>
    <form className="resource-form" onSubmit={save} aria-busy={busy}>
      <fieldset disabled={busy}>
        <div className="form-label"><span>نوع محتوا</span>
          <Dropdown className="resource-kind" ariaLabel="نوع محتوا" value={kind} options={kinds} statusTrigger
            onChange={value => { if (editing) setText(''); setKind(value); setEditing(null); setError(''); setMessage('') }} />
        </div>
        {kind === 'note' ? <label className="form-label resource-input">متن یادداشت
          <textarea ref={noteField} className="field" rows={3} maxLength={8000} value={text} onChange={event => { setText(event.target.value); setError('') }}
            placeholder="نکته یا تصمیم مربوط به پروژه را بنویس…" aria-describedby={error ? `${id}-error` : undefined} />
        </label> : <label className="form-label resource-input">فایل‌های پیوست
          <input className="field resource-file" type="file" multiple onChange={() => setError('')} aria-describedby={`${id}-limit${error ? ` ${id}-error` : ''}`} />
          <span className="s m" id={`${id}-limit`}>حداکثر {limitLabel} مگابایت برای هر فایل</span>
        </label>}
        <div className="resource-actions">
          <button className="btn" type="submit">{busy ? 'در حال ذخیره…' : kind === 'file' ? 'افزودن فایل' : editing ? 'ذخیرهٔ تغییرات' : 'افزودن یادداشت'}</button>
          {editing && <button className="bt" type="button" onClick={() => { setEditing(null); setText(''); setError('') }}>انصراف</button>}
        </div>
      </fieldset>
      {error && <p className="form-error" id={`${id}-error`} role="alert">{error}</p>}
      {message && <p className="m s resource-message" role="status">{message}</p>}
    </form>
    {items.length ? <ul className="resource-list">{items.map(item => <li key={item.id}>
      <span className="tile-icon brand">{item.kind === 'file' ? <FileText className="ui-icon" aria-hidden="true" /> : <StickyNote className="ui-icon" aria-hidden="true" />}</span>
      <div className="resource-content">
        {item.kind === 'file' ? <><b dir="auto">{item.name}</b><span className="m s">{fa(Math.ceil(fileBytes(item.data) / 1024))} کیلوبایت</span></> : <span dir="auto">{item.text}</span>}
      </div>
      <button className="icon-btn" disabled={busy} aria-label={item.kind === 'file' ? `دریافت ${item.name}` : 'ویرایش یادداشت'}
        onClick={() => {
          setError(''); setMessage('')
          if (item.kind === 'note') { setKind('note'); setEditing(item.id); setText(item.text); return }
          try { downloadProjectFile(item) } catch { setError('دریافت فایل ناموفق بود.') }
        }}>{item.kind === 'file' ? <Download className="ui-icon" aria-hidden="true" /> : <Pencil className="ui-icon" aria-hidden="true" />}</button>
      <button className="icon-btn danger-hover" disabled={busy} aria-label={item.kind === 'file' ? `حذف ${item.name}` : 'حذف یادداشت'}
        onClick={() => void remove(item)}><Trash2 className="ui-icon" aria-hidden="true" /></button>
    </li>)}</ul> : <p className="empty-inline">هنوز یادداشت یا فایلی اضافه نشده است.</p>}
  </section>
}
