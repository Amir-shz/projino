import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Project, ProjectResource, State, Status, Task } from './types'
import { daysLeft, fa, fmt, fmtShort, progress, STATUS, STATUS_OPTIONS } from './util'
import Dropdown from './Dropdown'
import ProjectMenu from './ProjectMenu'
import ProjectResources from './ProjectResources'
import { CalendarDays, Check, ChevronLeft, FileText, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react'

export default function ProjectDetail({ project, st, onBack, onEdit, onDelete, onCopyName, onStatusChange, onToggle, onAddTask, onEditTask, onDeleteTask, onResourcesChange }: {
  project: Project
  st: State
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onCopyName: () => void
  onStatusChange: (status: Status) => void
  onToggle: (id: string) => void
  onAddTask: (text: string) => void
  onEditTask: (id: string, text: string) => void
  onDeleteTask: (task: Task) => void
  onResourcesChange: (change: (items: ProjectResource[]) => ProjectResource[]) => Promise<boolean>
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [text, setText] = useState('')
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const tasksReadOnly = project.status !== 'pending' && project.status !== 'active'
  const tasks = useMemo(() => st.tasks.filter(task => task.pid === project.id)
    .filter(task => filter === 'all' || (filter === 'done' ? task.done : !task.done))
    .sort((a, b) => a.order - b.order), [st.tasks, project.id, filter])
  const stats = progress(st.tasks, project.id)
  const days = project.end ? daysLeft(project.end) : null
  const deadlineInactive = project.status === 'cancelled'
  const duration = project.start && project.end ? Math.max(1, daysLeft(project.end) - daysLeft(project.start) + 1) : null
  const elapsed = duration ? Math.min(duration, Math.max(0, duration - Math.max(0, days || 0))) : null
  const statusMessages = {
    pending: 'هنوز شروع نشده؛ از همین حالا می‌تونی وظایف رو بنویسی.',
    completed: project.completedAt ? `این پروژه ${fmtShort(project.completedAt)} تکمیل شد.` : 'این پروژه تکمیل شده است.',
    paused: 'متوقف شده؛ وظایف و پیشرفت حفظ شدن.',
    cancelled: 'لغو شده؛ تاریخچهٔ وظایف حفظ شده.',
  }
  const statusActions = { pending: 'شروع پروژه', completed: 'بازگشایی', paused: 'ادامهٔ پروژه', cancelled: 'فعال‌سازی دوباره' }
  const taskNotice: Partial<Record<Status, string>> = {
    completed: 'برای افزودن وظیفه، اول پروژه رو دوباره باز کن',
    paused: 'با ادامهٔ پروژه می‌تونی وظیفه اضافه کنی',
    cancelled: 'پروژهٔ لغوشده فقط‌خواندنی است',
  }

  useEffect(() => {
    if (tasksReadOnly) {
      setEditingTask(null)
      setEditingText('')
    }
  }, [tasksReadOnly])
  const add = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim()) return
    onAddTask(text.trim())
    setText('')
  }
  const saveTask = (task: Task) => {
    if (editingText.trim()) onEditTask(task.id, editingText.trim())
    setEditingTask(null)
  }

  return <>
    <header className="page-head detail-head">
      <div className="detail-heading">
        <div className="detail-breadcrumbs"><button className="back-link" onClick={onBack}>پروژه‌ها</button><ChevronLeft className="ui-icon ui-icon-sm" aria-hidden="true" /><span>{project.name}</span></div>
        <div className="detail-title"><span className="project-mark" aria-hidden="true" style={{ background: `${project.color}18`, color: project.color }}>{project.name.trim().charAt(0) || 'پ'}</span><h1>{project.name}</h1><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div>
      </div>
      <div className="detail-actions">
        <ProjectMenu project={project} triggerLabel="گزینه‌های بیشتر" triggerClassName="icon-btn action-menu-button" onEdit={onEdit} onStatusChange={onStatusChange} onCopyName={onCopyName} onDelete={onDelete} />
        <button className="btn" onClick={onEdit}><Pencil className="ui-icon" aria-hidden="true" />ویرایش پروژه</button>
      </div>
    </header>
    <section className="c detail-overview">
      {project.status !== 'active' && <div className={`detail-state-banner ${project.status}`}>
        <span>{statusMessages[project.status]}</span>
        <button type="button" onClick={() => onStatusChange('active')}>{statusActions[project.status]}</button>
      </div>}
      <div className="detail-overview-top">
        <div><h2>پیشرفت پروژه</h2><div className="detail-overview-progress"><b>{fa(stats.pct)}٪</b><span>{fa(stats.done)} از {fa(stats.total)} وظیفه انجام شده</span></div></div>
        {deadlineInactive ? <span className="b bn">ددلاین غیرفعال</span> : days === null ? <span className="b bn">بدون ددلاین</span> : <span className={`b ${days < 0 ? 'br' : days <= st.preferences.deadlineWarningDays ? 'bw' : 'bg'}`}>{days < 0 ? `${fa(-days)} روز از ددلاین` : days === 0 ? 'امروز ددلاین است' : `${fa(days)} روز تا ددلاین`}</span>}
      </div>
      <div className="pr detail-overview-bar"><i style={{ width: `${stats.pct}%`, background: project.color }} /></div>
      <div className="detail-overview-meta">
        <div><span className="m">شروع قرارداد</span><b>{project.start ? fmt(project.start) : 'ثبت نشده'}</b></div>
        <div><span className="m">پایان قرارداد</span><b>{project.end ? fmt(project.end) : 'ثبت نشده'}</b></div>
        <div><span className="m">وظایف باقی‌مانده</span><b>{fa(stats.total - stats.done)} وظیفه</b></div>
      </div>
    </section>
    <div className="detail-columns">
      <div className="detail-main">
      <section className="c task-panel">
        <div className="section-heading"><h2><ListTodo className="ui-icon" aria-hidden="true" />وظایف پروژه</h2>
          <div className="filter-tabs">
            {([['all', `همه ${fa(stats.total)}`], ['open', `انجام‌نشده ${fa(stats.total - stats.done)}`], ['done', `انجام‌شده ${fa(stats.done)}`]] as const).map(([key, label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}
          </div>
        </div>
        {tasksReadOnly
          ? <div className="project-task-notice">{taskNotice[project.status]}</div>
          : <form className="add-task" onSubmit={add}><button type="submit" className="add-task-icon" aria-label="افزودن وظیفه" data-tooltip="افزودن وظیفه" disabled={!text.trim()}><Plus className="ui-icon" aria-hidden="true" /></button><input className="field" value={text} onChange={event => setText(event.target.value)} placeholder="وظیفه جدید را بنویس و Enter بزن" aria-label="وظیفه جدید" maxLength={200} /></form>}
        {tasks.length ? <div className={`task-list${tasksReadOnly ? ` task-list-locked ${project.status}` : ''}`}>{tasks.map(task => <div className={`task-row${task.done ? ' task-done' : ''}`} key={task.id}>
          <button type="button" className={`ck${task.done ? ' d' : ''}`} aria-label={task.done ? 'علامت‌زدن به‌عنوان انجام‌نشده' : 'علامت‌زدن به‌عنوان انجام‌شده'} data-tooltip={task.done ? 'علامت‌زدن به‌عنوان انجام‌نشده' : 'علامت‌زدن به‌عنوان انجام‌شده'} aria-checked={task.done} role="checkbox" disabled={tasksReadOnly} onClick={() => onToggle(task.id)}>{task.done && <Check className="ui-icon" aria-hidden="true" />}</button>
          {editingTask === task.id && !tasksReadOnly
            ? <form className="edit-task-form" onSubmit={event => { event.preventDefault(); saveTask(task) }}><input className="field" autoFocus aria-label="متن وظیفه" value={editingText} onChange={event => setEditingText(event.target.value)} /><button className="text-btn" type="submit">ذخیره</button><button className="text-btn" type="button" onClick={() => setEditingTask(null)}>انصراف</button></form>
            : <span className="task-text">{task.text}</span>}
          {editingTask !== task.id && !tasksReadOnly && <div className="task-actions"><button type="button" className="icon-btn" aria-label="ویرایش وظیفه" data-tooltip="ویرایش وظیفه" onClick={() => { setEditingTask(task.id); setEditingText(task.text) }}><Pencil className="ui-icon" aria-hidden="true" /></button><button type="button" className="icon-btn danger-hover" aria-label="حذف وظیفه" data-tooltip="حذف وظیفه" onClick={() => onDeleteTask(task)}><Trash2 className="ui-icon" aria-hidden="true" /></button></div>}
        </div>)}</div> : <div className="empty-inline">{filter === 'done' ? 'هنوز وظیفه‌ای انجام نشده.' : filter === 'open' ? 'همهٔ وظایف انجام شده‌اند؛ عالیه!' : 'هنوز وظیفه‌ای اضافه نکرده‌ای.'}</div>}
      </section>
      <ProjectResources items={project.resources ?? []} confirmDelete={st.preferences.confirmDelete} onChange={onResourcesChange} />
      </div>
      <aside className="detail-aside">
        <section className="c info-panel"><h2><FileText className="ui-icon" aria-hidden="true" />توضیحات</h2><p>{project.desc || <span className="m">توضیحی برای این پروژه ثبت نشده است.</span>}</p></section>
        <section className="c info-panel"><h2><CalendarDays className="ui-icon" aria-hidden="true" />قرارداد</h2>
          <div className="contract-dates"><div><span className="m s">شروع</span><b>{project.start ? fmt(project.start) : '—'}</b></div><div><span className="m s">پایان</span><b>{project.end ? fmt(project.end) : '—'}</b></div></div>
          {duration !== null && <div className="contract-duration"><span className="m s">مدت قرارداد</span><b>{fa(duration)} روز</b></div>}
          <div className="info-divider"><h3>وضعیت ددلاین</h3><div className="status-summary"><span className={`status-dot ${deadlineInactive ? 'inactive' : days !== null && days < 0 ? 'late' : ''}`} />{deadlineInactive ? 'ددلاین این پروژه غیرفعال است.' : days === null ? 'برای این پروژه ددلاینی ثبت نشده.' : days < 0 ? `${fa(-days)} روز از موعد گذشته` : days === 0 ? 'ددلاین امروز است' : `${fa(days)} روز تا ددلاین`}</div></div>
          {duration !== null && !deadlineInactive && <><div className="project-progress-copy"><span>{Math.round(((elapsed || 0) / duration) * 100)}٪ از زمان قرارداد گذشته</span></div><div className="pr contract-progress"><i style={{ width: `${Math.min(100, Math.round((elapsed! / duration) * 100))}%`, background: '#D9930D' }} /></div></>}
          <div className="info-divider"><h3>وضعیت پروژه</h3><Dropdown className="detail-status-dropdown" ariaLabel="وضعیت پروژه" value={project.status} options={STATUS_OPTIONS} onChange={onStatusChange} showOptionTones statusTrigger /></div>
        </section>
      </aside>
    </div>
  </>
}
