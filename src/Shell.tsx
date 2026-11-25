import type { ReactNode } from 'react'
import { CalendarDays, Folder, Layers3, LayoutDashboard, Minus, Settings, Square, X } from 'lucide-react'
const brandMark = new URL('./projino-mark.svg', import.meta.url).href
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
    <div className={T ? 'a native-window' : 'a'}>
      {T && <div className="tb" data-tauri-drag-region>
        <span className="tt" data-tauri-drag-region>
          <Layers3 className="ui-icon" aria-hidden="true" />پروژینو
        </span>
        <span className="wc">
          <button aria-label="کوچک‌سازی" data-tooltip="کوچک‌سازی" data-tooltip-placement="bottom" onClick={() => win('minimize')}><Minus className="ui-icon" aria-hidden="true" /></button>
          <button aria-label="بزرگ‌سازی" data-tooltip="بزرگ‌سازی" data-tooltip-placement="bottom" onClick={() => win('toggleMaximize')}><Square className="ui-icon" aria-hidden="true" /></button>
          <button className="x" aria-label="بستن" data-tooltip="بستن" data-tooltip-placement="bottom" onClick={() => win('close')}><X className="ui-icon" aria-hidden="true" /></button>
        </span>
      </div>}
      <aside className="sb">
        <div className="lg">
          <img className="brand-mark" src={brandMark} width={44} height={44} alt="" />
          <div><b>پروژینو</b><small>مدیریت پروژه‌های شخصی</small></div>
        </div>
        <nav className="nv" aria-label="ناوبری اصلی">
          {NAV.map(([id, label, Icon]) => (
            <button type="button" key={id} aria-label={label} data-tooltip={label} aria-current={cur === id ? 'page' : undefined} className={cur === id ? 'on' : ''} onClick={() => go(id)}><Icon className="ui-icon" aria-hidden="true" /><span>{label}</span></button>
          ))}
        </nav>
        <div className="sf"><span className="s m">نسخه ۱٫۰٫۰</span></div>
      </aside>
      <main className="mn" key={route}>{children}</main>
    </div>
  )
}
