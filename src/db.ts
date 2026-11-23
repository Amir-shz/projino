import type { State } from './types'
import { DEFAULT_PREFERENCES } from './util'
const T = '__TAURI_INTERNALS__' in window
const EMPTY: State = { projects: [], tasks: [], preferences: DEFAULT_PREFERENCES }
let sql: { execute: (q: string, a?: unknown[]) => Promise<unknown>; select: <R>(q: string, a?: unknown[]) => Promise<R> } | null = null
function normalizeState(value: Partial<State> | null): State {
  if (!value || !Array.isArray(value.projects) || !Array.isArray(value.tasks)) {
    throw new Error('ساختار اطلاعات ذخیره‌شده معتبر نیست.')
  }
  return {
    projects: value.projects,
    tasks: value.tasks,
    preferences: { ...DEFAULT_PREFERENCES, ...value.preferences },
  }
}
export async function loadState(): Promise<State> {
  if (T) {
    const { default: Database } = await import('@tauri-apps/plugin-sql')
    sql = await Database.load('sqlite:projino.db')
    await sql.execute('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)')
    const r = await sql.select<{ v: string }[]>("SELECT v FROM kv WHERE k = 'state'")
    return r[0] ? normalizeState(JSON.parse(r[0].v)) : EMPTY
  }
  const stored = localStorage.getItem('projino')
  return stored ? normalizeState(JSON.parse(stored)) : EMPTY
}
export async function saveState(s: State) {
  const v = JSON.stringify(s)
  if (T && sql) await sql.execute("INSERT INTO kv (k, v) VALUES ('state', $1) ON CONFLICT(k) DO UPDATE SET v = $1", [v])
  else localStorage.setItem('projino', v)
}
