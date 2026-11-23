import type { Project, State } from './types'
import { fa, STATUS, daysLeft, fmt, todayLong, progress } from './util'
import { I, Ico } from './icons'
import FirstRun from './FirstRun'
type P = { st: State; go: (r: string) => void; toggle: (id: string) => void }
const Days = ({ end }: { end: string | null }) => {
  if (!end) return <span className="m">بدون ددلاین</span>
  const d = daysLeft(end)
  if (d < 0) return <span className="ur">{fa(-d)} روز گذشته</span>
  if (d === 0) return <span className="uw">امروز</span>
  return <span className={d <= 7 ? 'uw' : 'u'}>{fa(d)} روز مانده</span>
}
export default function Dashboard({ st, go, toggle }: P) {
  const { projects: ps, tasks } = st
  if (!ps.length) return <FirstRun go={go} />
  const open = ps.filter(p => p.status !== 'completed' && p.status !== 'cancelled')
  const active = ps.filter(p => p.status === 'active')
  const done = ps.filter(p => p.status === 'completed').length
  const dl = open.filter(p => p.end).sort((a: Project, b: Project) => (a.end! < b.end! ? -1 : 1))
  const late = dl.filter(p => daysLeft(p.end!) < 0).length
  const soon = dl.filter(p => { const d = daysLeft(p.end!); return d >= 0 && d <= 7 }).length
  const avg = active.length ? Math.round(active.reduce((s, p) => s + progress(tasks, p.id).pct, 0) / active.length) : 0
  const pend = active.flatMap(p => tasks.filter(t => t.pid === p.id && !t.done).sort((a, b) => a.order - b.order).slice(0, 2).map(t => ({ t, p }))).slice(0, 3)
  const chip = (d: number) => <span className={'b ' + (d < 0 ? 'br' : 'bw')}>{d < 0 ? `${fa(-d)} روز گذشته` : d === 0 ? 'امروز' : `${fa(d)} روز مانده`}</span>
  return (
    <>
      <header className="hd">
        <div><div className="s m">داشبورد</div><h1>سلام، خوش اومدی 👋</h1><p>امروز چه خبر از پروژه‌هات؟</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="m">{todayLong()}</span>
          <button className="btn" onClick={() => go('project-new')}><Ico d={I.plus} />پروژه جدید</button>
        </div>
      </header>
      <section className="g4">
        <div className="c k f"><span className="m"><Ico c="ki" d={I.folder} />کل پروژه‌ها</span><span className="n">{fa(ps.length)}</span><span className="s m">{fa(active.length)} فعال، {fa(done)} تکمیل‌شده</span></div>
        <div className="c k"><span className="m"><Ico c="ki" d={I.pulse} />در حال انجام</span><span className="n">{fa(active.length)}</span><span className="s m">میانگین پیشرفت {fa(avg)}٪</span></div>
        <div className="c k"><span className="m"><Ico c="ki" d={I.ok} />تکمیل‌شده</span><span className="n">{fa(done)}</span><div className="pr" style={{ marginTop: 4 }}><i style={{ width: (done / ps.length) * 100 + '%', background: 'var(--g)' }} /></div></div>
        <div className="c k"><span className="m"><Ico c="ki" d={I.cal} />ددلاین‌های نزدیک</span><span className="n">{fa(late + soon)}</span>
          <span className="s">{late + soon === 0 ? <span className="m">همه‌چیز سر موعده</span> : <>{late > 0 && <span className="b br">{fa(late)} عقب‌افتاده</span>} {soon > 0 && <span className="b bw">{fa(soon)} تا ۷ روز دیگر</span>}</>}</span></div>
      </section>
      <div className="gd">
        <section className="sec">
          <div className="rw"><h2 className="h2">پروژه‌های در حال انجام</h2><a href="#" className="s" style={{ color: 'var(--p)', fontWeight: 600 }} onClick={e => { e.preventDefault(); go('projects') }}>همه پروژه‌ها</a></div>
          {active.length ? (
            <div className="g2">
              {[...active].sort((a, b) => ((a.end || '9') < (b.end || '9') ? -1 : 1)).slice(0, 4).map(p => {
                const g = progress(tasks, p.id)
                return (
                  <div key={p.id} className="c pc" onClick={() => go('p:' + p.id)}>
                    <div className="rw"><b className="t2">{p.name}</b><span className="bw2"><span className={'b ' + STATUS[p.status].cls}>{STATUS[p.status].label}</span><button className="dm" aria-label="گزینه‌ها" onClick={e => e.stopPropagation()}><Ico d={I.dots} /></button></span></div>
                    <div className="rw s m"><span>{fa(g.done)} از {fa(g.total)} وظیفه</span><b style={{ color: 'var(--t)' }}>{fa(g.pct)}٪</b></div>
                    <div className="pr"><i style={{ width: g.pct + '%' }} /></div>
                    <div className="rw s"><span className="m">{p.end ? `ددلاین ${fmt(p.end)}` : 'بدون ددلاین'}</span><Days end={p.end} /></div>
                  </div>
                )
              })}
            </div>
          ) : <div className="c" style={{ padding: 28, textAlign: 'center' }}><b>پروژهٔ فعالی نداری</b><p className="m s" style={{ margin: 0 }}>یک پروژه رو شروع کن یا وضعیتش رو به «در حال انجام» ببر.</p></div>}
        </section>
        <aside className="sec">
          <div className="c" style={{ padding: '18px 20px' }}><h2 className="h2" style={{ marginBottom: 8 }}>ددلاین‌های پیش رو</h2>
            {dl.length ? dl.slice(0, 3).map(p => { const d = daysLeft(p.end!); return (
              <div key={p.id} className="dl"><span className="dt" style={{ background: d < 0 ? 'var(--r)' : d <= 7 ? '#D9930D' : '#B8BDC9' }} /><div><b>{p.name}</b><div className="s m">{fmt(p.end!)}</div></div>{d <= 7 ? chip(d) : <span className="s m">{fa(d)} روز مانده</span>}</div>) })
              : <p className="m s" style={{ margin: 0 }}>ددلاین نزدیکی نداری.</p>}
          </div>
          <div className="c" style={{ padding: '18px 20px' }}><h2 className="h2" style={{ marginBottom: 8 }}>وظایف باقی‌مانده</h2>
            {pend.length ? pend.map(({ t, p }) => (
              <div key={t.id} className="tk"><span className="ck" role="checkbox" aria-checked={t.done} tabIndex={0} aria-label={t.text} onClick={() => toggle(t.id)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && toggle(t.id)} /><div>{t.text}<div className="s m">{p.name}</div></div></div>))
              : <p className="m s" style={{ margin: 0 }}>وظیفهٔ باقی‌مونده‌ای نیست.</p>}
          </div>
        </aside>
      </div>
    </>
  )
}
