import { useEffect, useRef, useState } from 'react'
import { loadState, saveState } from './db'
import type { Project, State, Status, Task } from './types'
import Shell from './Shell'
import Dashboard from './Dashboard'
import Projects from './Projects'
import ProjectDetail from './ProjectDetail'
import Deadlines from './Deadlines'
import Settings from './Settings'
import ProjectForm from './ProjectForm'
import { setPersianDigits, today, uid } from './util'
import { X } from 'lucide-react'

export default function App() {
  const [st, setSt] = useState<State | null>(null)
  const [route, go] = useState('dashboard')
  const [formProject, setFormProject] = useState<Project | null | undefined>(undefined)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [actionNotice, setActionNotice] = useState<{ text: string; error: boolean } | null>(null)
  const saveQueue = useRef(Promise.resolve())
  const actionNoticeTimer = useRef<number | null>(null)
  useEffect(() => {
    loadState().then(value => {
      setPersianDigits(value.preferences.persianDigits)
      setSt(value)
      go(value.preferences.startPage)
    }).catch(reason => setLoadError(reason instanceof Error ? reason.message : 'بارگذاری اطلاعات ناموفق بود.'))
  }, [])
  if (!st) return <div className="startup-error" role="alert">{loadError || 'در حال بارگذاری پروژینو…'}</div>
  const up = (f: (s: State) => State) => {
    const next = f(st)
    setSt(next)
    saveQueue.current = saveQueue.current.then(() => saveState(next)).catch(reason => {
      setSaveError(reason instanceof Error ? reason.message : 'ذخیرهٔ اطلاعات ناموفق بود.')
    })
  }
  const toggle = (id: string) => up(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)) }))
  const navigate = (next: string) => {
    if (next === 'project-new') { setFormProject(null); return }
    go(next)
  }
  const openProject = (id: string) => go(`project:${id}`)
  const saveProject = (project: Project) => {
    up(s => {
      const current = s.projects.find(item => item.id === project.id)
      const savedProject = {
        ...project,
        completedAt: project.status === 'completed'
          ? project.completedAt || current?.completedAt || today()
          : undefined,
      }
      return { ...s, projects: current
        ? s.projects.map(item => item.id === project.id ? savedProject : item)
        : [...s.projects, savedProject] }
    })
    setFormProject(undefined)
    go(`project:${project.id}`)
  }
  const removeProject = (project: Project) => {
    if (st.preferences.confirmDelete && !window.confirm(`پروژهٔ «${project.name}» و همهٔ وظایفش حذف شود؟`)) return
    up(s => ({ ...s, projects: s.projects.filter(item => item.id !== project.id), tasks: s.tasks.filter(task => task.pid !== project.id) }))
    if (route === `project:${project.id}`) go('projects')
  }
  const removeTask = (task: Task) => {
    if (st.preferences.confirmDelete && !window.confirm(`وظیفهٔ «${task.text}» حذف شود؟`)) return
    up(s => ({ ...s, tasks: s.tasks.filter(item => item.id !== task.id) }))
  }
  const updateProjectStatus = (id: string, status: Status) => up(s => ({
    ...s,
    projects: s.projects.map(item => item.id === id ? {
      ...item,
      status,
      completedAt: status === 'completed' ? item.completedAt || today() : undefined,
    } : item),
  }))
  const showActionNotice = (notice: { text: string; error: boolean }) => {
    setActionNotice(notice)
    if (actionNoticeTimer.current !== null) window.clearTimeout(actionNoticeTimer.current)
    actionNoticeTimer.current = window.setTimeout(() => setActionNotice(null), 3500)
  }
  const copyProjectName = async (project: Project) => {
    if (!navigator.clipboard?.writeText) {
      showActionNotice({ text: 'دسترسی به کلیپ‌بورد در این محیط در دسترس نیست.', error: true })
      return
    }
    try {
      await navigator.clipboard.writeText(project.name)
      showActionNotice({ text: 'نام پروژه کپی شد.', error: false })
    } catch (reason) {
      showActionNotice({ text: reason instanceof Error ? `کپی نام پروژه ناموفق بود: ${reason.message}` : 'کپی نام پروژه ناموفق بود.', error: true })
    }
  }
  const routeProject = route.startsWith('project:') ? st.projects.find(project => project.id === route.slice('project:'.length)) : undefined
  const body = route === 'dashboard'
    ? <Dashboard st={st} go={navigate} toggle={toggle} />
    : route === 'projects'
      ? <Projects st={st} openProject={openProject} createProject={() => setFormProject(null)} editProject={project => setFormProject(project)} deleteProject={removeProject} onStatusChange={updateProjectStatus} onCopyName={copyProjectName} />
      : route === 'deadlines'
        ? <Deadlines st={st} openProject={openProject} />
        : route === 'settings'
          ? <Settings st={st} onPreferences={preferences => { setPersianDigits(preferences.persianDigits); up(s => ({ ...s, preferences })) }} onImport={imported => { setPersianDigits(imported.preferences.persianDigits); up(() => imported) }} />
          : routeProject
            ? <ProjectDetail project={routeProject} st={st} onBack={() => go('projects')} onEdit={() => setFormProject(routeProject)} onDelete={() => removeProject(routeProject)} onCopyName={() => copyProjectName(routeProject)}
              onStatusChange={status => updateProjectStatus(routeProject.id, status)}
              onEditTask={(id, text) => up(s => ({ ...s, tasks: s.tasks.map(task => task.id === id ? { ...task, text } : task) }))}
              onToggle={toggle}
              onAddTask={text => up(s => ({ ...s, tasks: [...s.tasks, { id: uid(), pid: routeProject.id, text, done: false, order: s.tasks.filter(task => task.pid === routeProject.id).length }] }))}
              onDeleteTask={removeTask} />
            : <section className="c empty-panel"><h2>پروژه پیدا نشد</h2><button className="bt" onClick={() => go('projects')}>بازگشت به پروژه‌ها</button></section>
  return <Shell route={route} go={navigate}>
    {saveError && <div className="app-alert" role="alert"><span>ذخیره‌سازی ناموفق بود: {saveError}</span><button onClick={() => setSaveError('')} aria-label="بستن" data-tooltip="بستن پیام" data-tooltip-placement="bottom"><X className="ui-icon" aria-hidden="true" /></button></div>}
    {actionNotice && <div className={actionNotice.error ? 'app-alert' : 'inline-success'} role={actionNotice.error ? 'alert' : 'status'}><span>{actionNotice.text}</span><button onClick={() => setActionNotice(null)} aria-label="بستن" data-tooltip="بستن پیام" data-tooltip-placement="bottom"><X className="ui-icon" aria-hidden="true" /></button></div>}
    {body}
    {formProject !== undefined && <ProjectForm project={formProject || undefined} preferences={st.preferences} onSave={saveProject} onClose={() => setFormProject(undefined)} />}
  </Shell>
}
