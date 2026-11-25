import type { State } from './types'
import { daysLeft, fa, fmt, STATUS, todayLong } from './util'
import { ArrowLeft, CalendarDays, CalendarClock, CircleAlert, Clock, Folder } from 'lucide-react'

export default function Deadlines({ st, openProject }: { st: State; openProject: (id: string) => void }) {
  const projects = st.projects.filter(project => project.status !== 'completed' && project.status !== 'cancelled')
  const dated = projects.filter(project => project.end).sort((a, b) => a.end!.localeCompare(b.end!))
  const late = dated.filter(project => daysLeft(project.end!) < 0)
  const today = dated.filter(project => daysLeft(project.end!) === 0)
  const upcoming = dated.filter(project => daysLeft(project.end!) > 0 && daysLeft(project.end!) <= st.preferences.deadlineWarningDays)
  const later = projects.filter(project => !project.end || daysLeft(project.end) > st.preferences.deadlineWarningDays)
  const groups = [
    { title: 'گذشته از موعد', projects: late, tone: 'late', icon: CircleAlert },
    { title: 'امروز', projects: today, tone: 'today', icon: CalendarDays },
    { title: `${fa(st.preferences.deadlineWarningDays)} روز آینده`, projects: upcoming, tone: 'soon', icon: CalendarClock },
    { title: 'سایر پروژه‌ها', projects: later, tone: 'later', icon: Folder },
  ]

  return <>
    <header className="page-head">
      <div><h1>ددلاین‌ها</h1><p>موعد پروژه‌های در حال انجام، در انتظار و متوقف‌شده</p></div>
      <span className="date-label"><CalendarDays className="ui-icon" aria-hidden="true" />{todayLong()}</span>
    </header>
    <div className="deadline-groups">
      {groups.map(group => <section key={group.tone} className="c deadline-group">
        <header><span className={`tile-icon ${group.tone}`}><group.icon className="ui-icon" aria-hidden="true" /></span><h2>{group.title}</h2><span className="b bn">{fa(group.projects.length)}</span></header>
        {group.projects.length ? group.projects.map(project => {
          const d = project.end ? daysLeft(project.end) : null
          return <div className="deadline-row" key={project.id}>
            <div className="deadline-info"><b>{project.name}</b><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div>
            <div className="deadline-date"><Clock className="ui-icon" aria-hidden="true" />{project.end ? fmt(project.end) : 'بدون ددلاین'}</div>
            <span className={`deadline-distance ${d !== null && d < 0 ? 'ur' : d !== null && d <= st.preferences.deadlineWarningDays ? 'uw' : 'm'}`}>{d === null ? '—' : d < 0 ? `${fa(-d)} روز تأخیر` : d === 0 ? 'امروز' : `${fa(d)} روز مانده`}</span>
            <button className="text-btn panel-link" onClick={() => openProject(project.id)}>مشاهدهٔ پروژه<ArrowLeft className="ui-icon" aria-hidden="true" /></button>
          </div>
        }) : <p className="empty-inline">{group.title === 'امروز' ? 'امروز ددلاینی نداری.' : 'پروژه‌ای در این بخش نیست.'}</p>}
      </section>)}
    </div>
  </>
}
