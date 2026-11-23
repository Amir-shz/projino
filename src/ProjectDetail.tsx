import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Project, State, Task } from './types'
import { daysLeft, fa, fmt, progress, STATUS } from './util'

export default function ProjectDetail({ project, st, onBack, onEdit, onDelete, onToggle, onAddTask, onDeleteTask }: {
  project: Project
  st: State
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onToggle: (id: string) => void
  onAddTask: (text: string) => void
  onDeleteTask: (task: Task) => void
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [text, setText] = useState('')
  const tasks = useMemo(() => st.tasks.filter(task => task.pid === project.id)
    .filter(task => filter === 'all' || (filter === 'done' ? task.done : !task.done))
    .sort((a, b) => a.order - b.order), [st.tasks, project.id, filter])
  const stats = progress(st.tasks, project.id)
  const days = project.end ? daysLeft(project.end) : null
  const duration = project.start && project.end ? Math.max(1, daysLeft(project.end) - daysLeft(project.start) + 1) : null
  const elapsed = duration ? Math.min(duration, Math.max(0, duration - Math.max(0, days || 0))) : null
  const add = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim()) return
    onAddTask(text.trim())
    setText('')
  }

  return <>
    <header className="page-head detail-head">
      <div><button className="back-link" onClick={onBack}>‹ بازگشت به پروژه‌ها</button><div className="detail-title"><span className="project-mark" style={{ background: `${project.color}18`, color: project.color }}>{project.icon}</span><div><h1>{project.name}</h1><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div></div></div>
      <div className="detail-actions"><button className="bt" onClick={onDelete}>حذف پروژه</button><button className="btn" onClick={onEdit}>ویرایش پروژه</button></div>
    </header>
    <section className="g4 detail-stats">
      <div className="c k"><span className="m">پیشرفت پروژه</span><span className="n">{fa(stats.pct)}٪</span><div className="pr"><i style={{ width: `${stats.pct}%`, background: project.color }} /></div></div>
      <div className="c k"><span className="m">وظایف انجام‌شده</span><span className="n">{fa(stats.done)} <small>از {fa(stats.total)}</small></span><span className="s m">وظیفه</span></div>
      <div className="c k"><span className="m">شروع قرارداد</span><span className="detail-stat-date">{project.start ? fmt(project.start) : 'ثبت نشده'}</span><span className="s m">تاریخ شروع</span></div>
      <div className="c k"><span className="m">پایان قرارداد</span><span className={`detail-stat-date ${days !== null && days < 0 ? 'ur' : ''}`}>{project.end ? fmt(project.end) : 'بدون ددلاین'}</span><span className="s m">{days === null ? 'تاریخ پایان ثبت نشده' : days < 0 ? `${fa(-days)} روز از موعد گذشته` : days === 0 ? 'ددلاین امروز است' : `${fa(days)} روز مانده`}</span></div>
    </section>
    <div className="detail-columns">
      <section className="c task-panel">
        <div className="section-heading"><div><h2>وظایف پروژه</h2><p className="m s">{fa(stats.total)} وظیفه · {fa(stats.done)} انجام‌شده</p></div>
          <div className="filter-tabs">
            {([['all', `همه ${fa(stats.total)}`], ['open', `انجام‌نشده ${fa(stats.total - stats.done)}`], ['done', `انجام‌شده ${fa(stats.done)}`]] as const).map(([key, label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}
          </div>
        </div>
        <form className="add-task" onSubmit={add}><input className="field" value={text} onChange={event => setText(event.target.value)} placeholder="وظیفهٔ جدید را بنویس..." aria-label="وظیفه جدید" maxLength={200} /><button className="btn" disabled={!text.trim()}>افزودن وظیفه</button></form>
        {tasks.length ? <div className="task-list">{tasks.map(task => <div className={`task-row${task.done ? ' task-done' : ''}`} key={task.id}>
          <button type="button" className={`ck${task.done ? ' d' : ''}`} aria-label={task.done ? 'علامت‌زدن به‌عنوان انجام‌نشده' : 'علامت‌زدن به‌عنوان انجام‌شده'} aria-checked={task.done} role="checkbox" onClick={() => onToggle(task.id)} />
          <span className="task-text">{task.text}</span><button type="button" className="icon-btn danger-hover" aria-label="حذف وظیفه" onClick={() => onDeleteTask(task)}>⌫</button>
        </div>)}</div> : <div className="empty-inline">{filter === 'done' ? 'هنوز وظیفه‌ای انجام نشده.' : filter === 'open' ? 'همهٔ وظایف انجام شده‌اند؛ عالیه!' : 'هنوز وظیفه‌ای اضافه نکرده‌ای.'}</div>}
      </section>
      <aside className="detail-aside">
        <section className="c info-panel"><h2>توضیحات</h2><p>{project.desc || <span className="m">توضیحی برای این پروژه ثبت نشده است.</span>}</p></section>
        <section className="c info-panel"><h2>وضعیت قرارداد</h2>
          <div className="contract-dates"><div><span className="m s">شروع</span><b>{project.start ? fmt(project.start) : '—'}</b></div><div><span className="m s">پایان</span><b>{project.end ? fmt(project.end) : '—'}</b></div></div>
          {duration !== null && <><div className="project-progress-copy"><span>زمان سپری‌شده</span><b>{fa(elapsed || 0)} از {fa(duration)} روز</b></div><div className="pr"><i style={{ width: `${Math.min(100, Math.round((elapsed! / duration) * 100))}%`, background: project.color }} /></div></>}
          <div className="status-summary"><span className={`status-dot ${days !== null && days < 0 ? 'late' : ''}`} />{days === null ? 'برای این پروژه ددلاینی ثبت نشده.' : days < 0 ? `${fa(-days)} روز از موعد گذشته` : days === 0 ? 'ددلاین امروز است' : `${fa(days)} روز تا ددلاین`}</div>
        </section>
      </aside>
    </div>
  </>
}
