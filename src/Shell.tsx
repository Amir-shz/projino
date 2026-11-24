import type { ReactNode } from 'react'
import { CalendarDays, Folder, LayoutDashboard, Minus, Settings, Square, X } from 'lucide-react'
const T = '__TAURI_INTERNALS__' in window
async function win(a: 'minimize' | 'toggleMaximize' | 'close') {
  if (!T) return
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  await getCurrentWindow()[a]()
}
const NAV = [['dashboard', 'داشبورد', LayoutDashboard], ['projects', 'پروژه‌ها', Folder], ['deadlines', 'ددلاین‌ها', CalendarDays], ['settings', 'تنظیمات', Settings]] as const
export default function Shell({ route, go, children }: { route: string; go: (r: string) => void; children: ReactNode }) {
  const cur = route.startsWith('project:') ? 'projects' : route
  return (
    <div className="a">
      <div className="tb" data-tauri-drag-region>
        <span className="tt" data-tauri-drag-region>
          <svg width="14" height="14" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="9" fill="#6258E8" /></svg>پروژینو
        </span>
        <span className="wc">
          <button aria-label="کوچک‌سازی" data-tooltip="کوچک‌سازی" data-tooltip-placement="bottom" onClick={() => win('minimize')}><Minus className="ui-icon" aria-hidden="true" /></button>
          <button aria-label="بزرگ‌سازی" data-tooltip="بزرگ‌سازی" data-tooltip-placement="bottom" onClick={() => win('toggleMaximize')}><Square className="ui-icon" aria-hidden="true" /></button>
          <button className="x" aria-label="بستن" data-tooltip="بستن" data-tooltip-placement="bottom" onClick={() => win('close')}><X className="ui-icon" aria-hidden="true" /></button>
        </span>
      </div>
      <aside className="sb">
        <div className="lg">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#6258E8" /><path d="M10 12h14M10 17h9M10 22h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>
          <div><b>پروژینو</b><small>مدیریت پروژه‌های شخصی</small></div>
        </div>
        <nav className="nv">
          {NAV.map(([id, label, Icon]) => (
            <a key={id} href="#" aria-label={label} data-tooltip={label} className={cur === id ? 'on' : ''} onClick={e => { e.preventDefault(); go(id) }}><Icon className="ui-icon" aria-hidden="true" /><span>{label}</span></a>
          ))}
        </nav>
        <div className="sf"><span className="s m">نسخه ۱٫۰٫۰</span></div>
      </aside>
      <main className="mn">{children}</main>
    </div>
  )
}
