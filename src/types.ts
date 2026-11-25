export type Status = 'pending' | 'active' | 'completed' | 'paused' | 'cancelled'
export interface Project { id: string; name: string; desc: string; status: Status; start: string | null; end: string | null; color: string; icon: string; completedAt?: string; resources?: ProjectResource[] }
export type ProjectResource = { id: string; kind: 'note'; text: string } | { id: string; kind: 'file'; name: string; data: string }
export interface Task { id: string; pid: string; text: string; done: boolean; order: number }
export interface Preferences {
  weekStart: 'saturday' | 'sunday' | 'monday'
  deadlineWarningDays: number
  persianDigits: boolean
  confirmDelete: boolean
  startPage: 'dashboard' | 'projects'
}
export interface State { projects: Project[]; tasks: Task[]; preferences: Preferences }
