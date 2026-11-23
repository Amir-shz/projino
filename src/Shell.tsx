import type { ReactNode } from 'react'
import { I, Ico } from './icons'
const T = '__TAURI_INTERNALS__' in window
async function win(a: 'minimize' | 'toggleMaximize' | 'close') {
  if (!T) return
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  await getCurrentWindow()[a]()
}
const NAV = [['dashboard', 'داشبورد', I.dash], ['projects', 'پروژه‌ها', I.folder], ['deadlines', 'ددلاین‌ها', I.cal], ['settings', 'تنظیمات', I.gear]] as const
export default function Shell({ route, go, children }: { route: string; go: (r: string) => void; children: ReactNode }) {
  const cur = route.startsWith('project:') ? 'projects' : route
  return (
    <div className="a">
      <div className="tb" data-tauri-drag-region>
        <span className="tt" data-tauri-drag-region>
          <svg width="14" height="14" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="9" fill="#6258E8" /></svg>پروژینو
        </span>
        <span className="wc">
          <button aria-label="کوچک‌سازی" onClick={() => win('minimize')}><svg viewBox="0 0 10 10"><path d="M0 5h10" /></svg></button>
          <button aria-label="بزرگ‌سازی" onClick={() => win('toggleMaximize')}><svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" /></svg></button>
          <button className="x" aria-label="بستن" onClick={() => win('close')}><svg viewBox="0 0 10 10"><path d="M0 0l10 10M10 0 0 10" /></svg></button>
        </span>
      </div>
      <aside className="sb">
        <div className="lg">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#6258E8" /><path d="M10 12h14M10 17h9M10 22h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>
          <div><b>پروژینو</b><small>مدیریت پروژه‌های شخصی</small></div>
        </div>
        <nav className="nv">
          {NAV.map(([id, label, ic]) => (
            <a key={id} href="#" className={cur === id ? 'on' : ''} onClick={e => { e.preventDefault(); go(id) }}><Ico d={ic} />{label}</a>
          ))}
        </nav>
        <div className="sf"><span className="s m">نسخه ۱٫۰٫۰</span></div>
      </aside>
      <main className="mn">{children}</main>
    </div>
  )
}
