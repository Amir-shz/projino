import { useMemo, useState } from 'react'
import type { Project, State, Status } from './types'
import { daysLeft, fa, fmt, progress, STATUS, STATUS_OPTIONS } from './util'
import { LayoutGrid, List, Plus, Search } from 'lucide-react'
import Dropdown, { type DropdownOption } from './Dropdown'
import ProjectMenu from './ProjectMenu'

export default function Projects({ st, openProject, createProject, editProject, deleteProject, onStatusChange, onCopyName }: {
  st: State
  openProject: (id: string) => void
  createProject: () => void
  editProject: (project: Project) => void
  deleteProject: (project: Project) => void
  onStatusChange: (id: string, status: Status) => void
  onCopyName: (project: Project) => void
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
  const filterOptions: DropdownOption<string>[] = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...STATUS_OPTIONS,
  ]
  const sortOptions: DropdownOption<string>[] = [
    { value: 'deadline', label: 'نزدیک‌ترین ددلاین', buttonLabel: 'مرتب‌سازی: نزدیک‌ترین ددلاین' },
    { value: 'name', label: 'نام پروژه', buttonLabel: 'مرتب‌سازی: نام پروژه' },
    { value: 'created', label: 'جدیدترین', buttonLabel: 'مرتب‌سازی: جدیدترین' },
  ]
  const projectMenu = (project: Project) => <ProjectMenu
    project={project}
    onEdit={() => editProject(project)}
    onStatusChange={status => onStatusChange(project.id, status)}
    onCopyName={() => onCopyName(project)}
    onDelete={() => deleteProject(project)}
  />

  return <>
    <header className="page-head">
      <div><div className="s m">مدیریت کارها</div><h1>پروژه‌ها</h1><p>همهٔ پروژه‌هات رو یک‌جا مدیریت کن.</p></div>
      <button className="btn" onClick={createProject}><Plus className="ui-icon ui-icon-lg" aria-hidden="true" />ایجاد پروژه</button>
    </header>
    <section className="c projects-toolbar">
      <label className="search-field"><Search className="ui-icon ui-icon-md" aria-hidden="true" /><input aria-label="جست‌وجوی پروژه" value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجو در پروژه‌ها..." /></label>
      <Dropdown ariaLabel="فیلتر وضعیت" value={status} options={filterOptions} onChange={setStatus} showOptionTones />
      <Dropdown ariaLabel="مرتب‌سازی" value={sort} options={sortOptions} onChange={setSort} />
      <div className="view-switch" aria-label="نحوه نمایش">
        <button className={view === 'cards' ? 'selected' : ''} onClick={() => setView('cards')} aria-label="نمای کارت‌ها" data-tooltip="نمای کارت‌ها"><LayoutGrid className="ui-icon" aria-hidden="true" /></button>
        <button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} aria-label="نمای فهرست" data-tooltip="نمای فهرست"><List className="ui-icon" aria-hidden="true" /></button>
      </div>
    </section>
    {projects.length === 0 ? <section className="c empty-panel">
      <div className="empty-icon"><Search className="ui-icon" aria-hidden="true" /></div><h2>{st.projects.length ? 'پروژه‌ای پیدا نشد' : 'هنوز پروژه‌ای نداری'}</h2>
      <p className="m">{st.projects.length ? 'عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده.' : 'برای شروع، اولین پروژه‌ات را بساز.'}</p>
      {!st.projects.length && <button className="btn" onClick={createProject}><Plus className="ui-icon ui-icon-lg" aria-hidden="true" />ایجاد پروژه</button>}
    </section> : view === 'list' ? <section className="c project-table-wrap" role="table" aria-label="فهرست پروژه‌ها">
      <div role="rowgroup">
        <div className="project-table-header" role="row">
          <div role="columnheader">پروژه</div><div role="columnheader">وضعیت</div><div role="columnheader">پیشرفت</div><div role="columnheader">وظایف</div><div role="columnheader">ددلاین</div><div role="columnheader"><span className="sr-only">گزینه‌ها</span></div>
        </div>
        <div role="rowgroup">
      {projects.map(project => {
        const stats = progress(st.tasks, project.id)
        const days = project.end ? daysLeft(project.end) : null
        return <div className="project-table-row" key={project.id} role="row" onClick={() => openProject(project.id)} tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && event.key === 'Enter') openProject(project.id) }}>
          <div role="cell"><div className="table-project"><span className="project-mark" style={{ background: `${project.color}18`, color: project.color }}>{project.name.trim().charAt(0) || 'پ'}</span><span><b>{project.name}</b><small>{project.desc || 'بدون توضیحات'}</small></span></div></div>
          <div role="cell"><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div>
          <div className="table-progress" role="cell"><div className="pr"><i style={{ width: `${stats.pct}%`, background: project.color }} /></div><b className="s">{fa(stats.pct)}٪</b></div>
          <div className="table-task-count" role="cell">{progressLabel(project)}</div>
          <div className="table-deadline" role="cell"><div>{project.end ? fmt(project.end) : '—'}</div><small className={days !== null && days < 0 ? 'ur' : days !== null && days <= st.preferences.deadlineWarningDays ? 'uw' : 'm'}>{days === null ? 'بدون ددلاین' : days < 0 ? `${fa(-days)} روز گذشته` : days === 0 ? 'امروز' : `${fa(days)} روز مانده`}</small></div>
          <div role="cell">{projectMenu(project)}</div>
        </div>
      })}
        </div>
      </div>
    </section> : <div className="project-grid">
      {projects.map(project => {
        const stats = progress(st.tasks, project.id)
        const days = project.end ? daysLeft(project.end) : null
        return <article className="c project-card" key={project.id} onClick={() => openProject(project.id)} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') openProject(project.id) }}>
          <div className="project-card-top">
            <div className="project-mark" style={{ background: `${project.color}18`, color: project.color }}>{project.name.trim().charAt(0) || 'پ'}</div>
            <div className="project-card-badges"><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span>{projectMenu(project)}</div>
          </div>
          <h2 className="project-card-name">{project.name}</h2>
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
