import type { ProjectResource } from './types'

const MiB = 1024 * 1024
export const fileBudget = '__TAURI_INTERNALS__' in window
  ? { perFile: 5 * MiB, total: 20 * MiB }
  : { perFile: MiB, total: 2 * MiB }

export function isProjectResource(value: unknown): value is ProjectResource {
  if (!value || typeof value !== 'object' || !('id' in value) || typeof value.id !== 'string' || !('kind' in value)) return false
  if (value.kind === 'note') return 'text' in value && typeof value.text === 'string'
  return value.kind === 'file' && 'name' in value && typeof value.name === 'string'
    && 'data' in value && typeof value.data === 'string' && value.data.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value.data)
}

export const fileBytes = (data: string) => data.length * 3 / 4 - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0)
export const resourceBytes = (items: ProjectResource[]) => items.reduce((sum, item) => sum + (item.kind === 'file' ? fileBytes(item.data) : 0), 0)

export function readFileData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',', 2)[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function downloadProjectFile(item: Extract<ProjectResource, { kind: 'file' }>) {
  const bytes = Uint8Array.from(atob(item.data), char => char.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
  const link = document.createElement('a')
  link.href = url
  link.download = item.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
