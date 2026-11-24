import type { Project, State } from './types'
import { daysLeft, fa, fmt, STATUS } from './util'

export default function Deadlines({ st, openProject }: { st: State; openProject: (id: string) => void }) {
  const projects = st.projects.filter(project => project.status !== 'completed' && project.status !== 'cancelled')
  const dated = projects.filter(project => project.end).sort((a, b) => a.end!.localeCompare(b.end!))
  const late = dated.filter(project => daysLeft(project.end!) < 0)
  const today = dated.filter(project => daysLeft(project.end!) === 0)
  const upcoming = dated.filter(project => daysLeft(project.end!) > 0 && daysLeft(project.end!) <= st.preferences.deadlineWarningDays)
  const later = projects.filter(project => !project.end || daysLeft(project.end) > st.preferences.deadlineWarningDays)
  const groups: { title: string; projects: Project[]; tone: string }[] = [
    { title: 'گذشته از موعد', projects: late, tone: 'late' },
    { title: 'امروز', projects: today, tone: 'today' },
    { title: `${fa(st.preferences.deadlineWarningDays)} روز آینده`, projects: upcoming, tone: 'soon' },
    { title: 'سایر پروژه‌ها', projects: later, tone: 'later' },
  ]

  return <>
    <header className="page-head">
      <div><div className="s m">برنامه‌ریزی</div><h1>ددلاین‌ها</h1><p>هیچ موعد مهمی رو از دست نده.</p></div>
      <div className="deadline-summary">
        <span className="b br">{fa(late.length)} عقب‌افتاده</span>
        <span className="b bw">{fa(upcoming.length)} تا {fa(st.preferences.deadlineWarningDays)} روز آینده</span>
        <span className="today-label">{new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>
      </div>
    </header>
    <div className="deadline-groups">
      {groups.map(group => <section key={group.title} className="c deadline-group">
        <header><span className={`deadline-dot ${group.tone}`} /><h2>{group.title}</h2><span className="b bn">{fa(group.projects.length)}</span></header>
        {group.projects.length ? group.projects.map(project => {
          const d = project.end ? daysLeft(project.end) : null
          return <div className="deadline-row" key={project.id}>
            <span className="deadline-project-dot" style={{ background: d !== null && d < 0 ? 'var(--r)' : d !== null && d <= st.preferences.deadlineWarningDays ? '#D9930D' : '#B8BDC9' }} />
            <div className="deadline-info"><b>{project.name}</b><span className={`b ${STATUS[project.status].cls}`}>{STATUS[project.status].label}</span></div>
            <div className="deadline-date">{project.end ? fmt(project.end) : 'بدون ددلاین'}</div>
            <span className={`deadline-distance ${d !== null && d < 0 ? 'ur' : d !== null && d <= st.preferences.deadlineWarningDays ? 'uw' : 'm'}`}>{d === null ? '—' : d < 0 ? `${fa(-d)} روز تأخیر` : d === 0 ? 'امروز' : `${fa(d)} روز مانده`}</span>
            <button className="text-btn" onClick={() => openProject(project.id)}>مشاهدهٔ پروژه</button>
          </div>
        }) : <p className="empty-inline">{group.title === 'امروز' ? 'امروز ددلاینی نداری.' : 'پروژه‌ای در این بخش نیست.'}</p>}
      </section>)}
    </div>
  </>
}
