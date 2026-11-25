import { CalendarDays, Folder, ListTodo, Plus } from 'lucide-react'
import { todayLong } from './util'

export default function FirstRun({ go }: { go: (route: string) => void }) {
  return <>
    <header className="page-head dashboard-head">
      <h1>داشبورد</h1>
      <span className="date-label"><CalendarDays className="ui-icon" aria-hidden="true" />{todayLong()}</span>
    </header>
    <section className="dashboard-hero first-run-hero">
      <div className="hero-copy">
        <h2>به پروژینو خوش اومدی</h2>
        <p>اولین پروژه‌ات رو بساز تا بتونی وظایف و ددلاینش رو یک‌جا دنبال کنی.</p>
        <div className="hero-actions">
          <button className="btn hero-button" onClick={() => go('project-new')}><Plus className="ui-icon" aria-hidden="true" />ایجاد پروژه</button>
          <button className="bt hero-secondary" onClick={() => go('settings')}>بازیابی از فایل پشتیبان</button>
        </div>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <span><Folder className="ui-icon" /></span><span><ListTodo className="ui-icon" /></span><span><CalendarDays className="ui-icon" /></span>
      </div>
    </section>
  </>
}
