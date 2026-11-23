import { useMemo, useState } from 'react'
import type { Project, State } from './types'
import { daysLeft, fa, fmt, progress, STATUS } from './util'
import { I, Ico } from './icons'

export default function Projects({ st, openProject, createProject, editProject, deleteProject }: {
  st: State
  openProject: (id: string) => void
  createProject: () => void
  editProject: (project: Project) => void
  deleteProject: (project: Project) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('deadline')
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const projects = useMemo(() => {
    const result = st.projects.filter(project => (status === 'all' || project.status === status)
      && `${project.name} ${project.desc}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    return result.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'fa')
      if (sort === 'created') return b.id.localeCompare(a.id)
      if (!a.end) return b.end ? 1 : a.name.localeCompare(b.name, 'fa')
      if (!b.end) return -1
      return a.end.localeCompare(b.end)
    })
  }, [st.projects, status, sort, query])
  const progressLabel = (project: Project) => {
    const value = progress(st.tasks, project.id)
    return `${fa(value.done)} از ${fa(value.total)} وظیفه`
  }

  return <>
    <header className="page-head">
      <div><div className="s m">مدیریت کارها</div><h1>پروژه‌ها</h1><p>همهٔ پروژه‌هات رو یک‌جا مدیریت کن.</p></div>
      <button className="btn" onClick={createProject}><Ico d={I.plus} />ایجاد پروژه</button>
    </header>
    <section className="c projects-toolbar">
      <label className="search-field"><span>⌕</span><input aria-label="جست‌وجوی پروژه" value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجو در پروژه‌ها..." /></label>
      <select aria-label="فیلتر وضعیت" className="field compact-field" value={status} onChange={event => setStatus(event.target.value)}>
        <option value="all">همهٔ وضعیت‌ها</option>
        {Object.entries(STATUS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
      </select>
      <select aria-label="مرتب‌سازی" className="field compact-field" value={sort} onChange={event => setSort(event.target.value)}>
        <option value="deadline">مرتب‌سازی: نزدیک‌ترین ددلاین</option><option value="name">نام پروژه</option><option value="created">جدیدترین</option>
      </select>
      <div className="view-switch" aria-label="نحوه نمایش">
        <button className={view === 'cards' ? 'selected' : ''} onClick={() => setView('cards')} aria-label="نمای کارت‌ها">▦</button>
        <button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} aria-label="نمای فهرست">☷</button>
      </div>
    </section>
    {projects.length === 0 ? <section className="c empty-panel">
      <div className="empty-icon">⌕</div><h2>{st.projects.length ? 'پروژه‌ای پیدا نشد' : 'هنوز پروژه‌ای نداری'}</h2>
      <p className="m">{st.projects.length ? 'عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده.' : 'برای شروع، اولین پروژه‌ات را بساز.'}</p>
      {!st.projects.length && <button className="btn" onClick={createProject}><Ico d={I.plus} />ایجاد پروژه</button>}
    </section> : <div className={view === 'cards' ? 'project-grid' : 'project-list'}>
      {projects.map(project => {
        const stats = progress(st.tasks, project.id)
        const days = project.end ? daysLeft(project.end) : null
        return <article className={`c project-card ${view === 'list' ? 'list-mode' : ''}`} key={project.id} onClick={() => openProject(project.id)} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') openProject(project.id) }}>
          <div className="project-card-top">
            <div className="project-mark" style={{ background: `${project.color}18`, color: project.color }}>{project.icon}</div>
            <div className="project-menu">
              <button className="icon-btn" aria-label="ویرایش پروژه" title="ویرایش" onClick={event => { event.stopPropagation(); editProject(project) }}>✎</button>
              <button className="icon-btn danger-hover" aria-label="حذف پروژه" title="حذف" onClick={event => { event.stopPropagation(); deleteProject(project) }}>⌫</button>
            </div>
          </div>
          <div className="project-title-line"><h2>{project.name}</h2><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div>
          <p className="project-description">{project.desc || 'بدون توضیحات'}</p>
          <div className="project-progress-copy"><span>{progressLabel(project)}</span><b>{fa(stats.pct)}٪</b></div>
          <div className="pr"><i style={{ width: `${stats.pct}%`, background: project.color }} /></div>
          <div className="project-card-bottom">
            <span className="s m">{project.end ? fmt(project.end) : 'بدون ددلاین'}</span>
            {days === null ? <span className="s m">—</span> : days < 0 ? <span className="ur s">{fa(-days)} روز گذشته</span> : days === 0 ? <span className="uw s">امروز</span> : <span className={`s ${days <= st.preferences.deadlineWarningDays ? 'uw' : 'm'}`}>{fa(days)} روز مانده</span>}
          </div>
        </article>
      })}
    </div>}
  </>
}
