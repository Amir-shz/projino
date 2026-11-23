import { I, Ico } from './icons'
export default function FirstRun({ go }: { go: (r: string) => void }) {
  return (
    <div className="fr">
      <header className="hd1"><div className="s m">داشبورد</div><h1>سلام، به پروژینو خوش اومدی 👋</h1><p>همه‌چیز آماده‌ست؛ فقط یک پروژه کم داریم.</p></header>
      <section className="g4">
        {['کل پروژه‌ها', 'در حال انجام', 'تکمیل‌شده', 'ددلاین‌های نزدیک'].map(l => <div key={l} className="c k"><span className="m">{l}</span><span className="n">۰</span></div>)}
      </section>
      <section className="c em">
        <svg width="132" height="104" viewBox="0 0 132 104" fill="none" aria-hidden="true"><rect x="14" y="26" width="104" height="66" rx="12" fill="#F0EEFF" /><rect x="26" y="14" width="80" height="66" rx="12" fill="#fff" stroke="#D9D5FF" strokeWidth="1.5" /><rect x="40" y="30" width="52" height="6" rx="3" fill="#6258E8" /><rect x="40" y="44" width="36" height="6" rx="3" fill="#E3E1F5" /><rect x="40" y="58" width="44" height="6" rx="3" fill="#E3E1F5" /><circle cx="100" cy="74" r="16" fill="#6258E8" /><path d="M94 74l5 5 8-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <h2>اولین پروژه‌ت رو بساز</h2>
        <p>برای هر کار یا قرارداد یک پروژه بساز، وظایفش رو تیک بزن و ددلاینش رو از دست نده.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => go('project-new')}><Ico d={I.plus} />ایجاد پروژه</button>
          <button className="bt" onClick={() => go('settings')}>بازیابی از فایل پشتیبان</button>
        </div>
        <div className="st">
          <div><b><i>۱</i>پروژه بساز</b><span>نام، وضعیت و تاریخ قرارداد</span></div>
          <div><b><i>۲</i>وظیفه اضافه کن</b><span>پیشرفت خودکار حساب می‌شه</span></div>
          <div><b><i>۳</i>ددلاین رو دنبال کن</b><span>عقب‌افتاده‌ها بالا می‌آن</span></div>
        </div>
      </section>
    </div>
  )
}
