import type { State } from './types'
import { fa, daysLeft, fmt, todayLong, progress } from './util'
import { Activity, ArrowLeft, CalendarDays, CircleCheck, Folder, ListTodo, Plus } from 'lucide-react'
import FirstRun from './FirstRun'

type Props = { st: State; go: (route: string) => void; openProject: (id: string) => void; toggle: (id: string) => void }

export default function Dashboard({ st, go, openProject, toggle }: Props) {
  const { projects, tasks, preferences } = st
  if (!projects.length) return <FirstRun go={go} />

  const active = projects.filter(project => project.status === 'active')
  const completed = projects.filter(project => project.status === 'completed').length
  const deadlines = projects.filter(project => project.end && project.status !== 'completed' && project.status !== 'cancelled')
    .map(project => ({ project, days: daysLeft(project.end!) }))
    .sort((a, b) => a.days - b.days)
  const late = deadlines.filter(({ days }) => days < 0).length
  const soon = deadlines.filter(({ days }) => days >= 0 && days <= preferences.deadlineWarningDays).length
  const activeProgress = active.map(project => ({ project, stats: progress(tasks, project.id) }))
  const average = active.length ? Math.round(activeProgress.reduce((sum, { stats }) => sum + stats.pct, 0) / active.length) : 0
  const pending = active.flatMap(project => tasks.filter(task => task.pid === project.id && !task.done)
    .sort((a, b) => a.order - b.order).slice(0, 2).map(task => ({ task, project }))).slice(0, 3)
  const metrics = [
    { icon: Folder, tone: 'brand', label: 'کل پروژه‌ها', value: projects.length, note: `${fa(active.length)} پروژه در حال انجام` },
    { icon: Activity, tone: 'blue', label: 'در حال انجام', value: active.length, note: `میانگین پیشرفت ${fa(average)}٪` },
    { icon: CircleCheck, tone: 'green', label: 'تکمیل‌شده', value: completed, note: `${fa(Math.round(completed / projects.length * 100))}٪ از کل پروژه‌ها` },
    { icon: CalendarDays, tone: 'amber', label: 'ددلاین‌های نزدیک', value: soon, note: late ? `${fa(late)} پروژه از موعد گذشته` : `در ${fa(preferences.deadlineWarningDays)} روز آینده` },
  ]

  return <>
    <header className="page-head dashboard-head">
      <h1>داشبورد</h1>
      <span className="date-label"><CalendarDays className="ui-icon" aria-hidden="true" />{todayLong()}</span>
    </header>
    <section className="dashboard-hero">
      <div className="hero-copy">
        <h2>نمای کلی پروژه‌ها</h2>
        <p>پیشرفت پروژه‌ها، وظایف باقی‌مانده و موعدهای پیش رو</p>
        <button className="btn hero-button" onClick={() => go('project-new')}><Plus className="ui-icon" aria-hidden="true" />ایجاد پروژه</button>
      </div>
      <div className="hero-progress">
        <div className="hero-ring" aria-hidden="true" style={{ background: `conic-gradient(#546ec0 ${average}%, var(--ps) 0)` }}><span>{fa(average)}٪</span></div>
        <div><b><span className="sr-only">{fa(average)}٪ </span>میانگین پیشرفت</b><span>پروژه‌های در حال انجام</span></div>
      </div>
    </section>
    <section className="g4" aria-label="آمار پروژه‌ها">
      {metrics.map(({ icon: Icon, tone, label, value, note }) => <div key={label} className="c k">
        <div className="metric-top"><span className={`tile-icon ${tone}`}><Icon className="ui-icon" aria-hidden="true" /></span><span>{label}</span></div>
        <strong className="n">{fa(value)}</strong>
        <span className="s m">{note}</span>
      </div>)}
    </section>
    <div className="gd">
      <section className="c dashboard-panel">
        <div className="panel-heading"><h2>پروژه‌های در حال انجام</h2><button className="text-btn panel-link" onClick={() => go('projects')}>همه پروژه‌ها<ArrowLeft className="ui-icon" aria-hidden="true" /></button></div>
        {activeProgress.length ? [...activeProgress].sort((a, b) => (a.project.end || '9').localeCompare(b.project.end || '9')).slice(0, 4)
          .map(({ project, stats }) => <button className="dashboard-project" key={project.id} onClick={() => openProject(project.id)}>
            <span className="project-mark" style={{ background: `${project.color}18`, color: project.color }}>{project.name.trim().charAt(0) || 'پ'}</span>
            <span className="dashboard-project-name"><b>{project.name}</b><span className="s m">{project.end ? fmt(project.end) : 'بدون ددلاین'}</span></span>
            <span className="dashboard-project-progress"><span className="s m">{fa(stats.done)} از {fa(stats.total)} وظیفه</span><span className="pr"><i style={{ width: `${stats.pct}%`, background: project.color }} /></span></span>
            <strong>{fa(stats.pct)}٪</strong>
          </button>) : <p className="empty-inline">پروژه‌ای در حال انجام نیست.</p>}
      </section>
      <div className="sec">
        <section className="c dashboard-panel">
          <div className="panel-heading"><h2><CalendarDays className="ui-icon" aria-hidden="true" />ددلاین‌ها</h2><button className="text-btn panel-link" onClick={() => go('deadlines')}>مشاهده همه</button></div>
          {deadlines.length ? deadlines.slice(0, 3).map(({ project, days }) => <button key={project.id} className="dl" onClick={() => openProject(project.id)}>
            <span className={`deadline-dot ${days < 0 ? 'late' : days <= preferences.deadlineWarningDays ? 'soon' : 'later'}`} />
            <span className="dashboard-project-name"><b>{project.name}</b><span className="s m">{fmt(project.end!)}</span></span>
            <span className={`b ${days < 0 ? 'br' : days <= preferences.deadlineWarningDays ? 'bw' : 'bn'}`}>{days < 0 ? `${fa(-days)} روز گذشته` : days === 0 ? 'امروز' : `${fa(days)} روز مانده`}</span>
          </button>) : <p className="empty-inline">ددلاین ثبت‌شده‌ای نداری.</p>}
        </section>
        <section className="c dashboard-panel">
          <div className="panel-heading"><h2><ListTodo className="ui-icon" aria-hidden="true" />وظایف باقی‌مانده</h2></div>
          {pending.length ? pending.map(({ task, project }) => <label key={task.id} className="tk">
            <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} />
            <span>{task.text}<span className="s m task-project">{project.name}</span></span>
          </label>) : <p className="empty-inline">وظیفهٔ باقی‌مانده‌ای نیست.</p>}
        </section>
      </div>
    </div>
  </>
}
