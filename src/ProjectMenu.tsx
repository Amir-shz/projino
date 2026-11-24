import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Project, Status } from './types'
import { STATUS_OPTIONS } from './util'
import { Check, ChevronLeft, Ellipsis } from 'lucide-react'

export default function ProjectMenu({ project, onEdit, onStatusChange, onCopyName, onDelete, triggerLabel = 'گزینه‌های پروژه', triggerClassName = 'icon-btn project-menu-trigger' }: {
  project: Project
  onEdit: () => void
  onStatusChange: (status: Status) => void
  onCopyName: () => void
  onDelete: () => void
  triggerLabel?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [submenuSide, setSubmenuSide] = useState<'left' | 'right'>('left')
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const statusTrigger = useRef<HTMLButtonElement>(null)
  const statusItems = useRef<Array<HTMLButtonElement | null>>([])

  useLayoutEffect(() => {
    if (!open || !trigger.current) {
      setMenuPosition(null)
      return
    }
    const rect = trigger.current.getBoundingClientRect()
    const menuHeight = 180
    const top = window.innerHeight - rect.bottom < menuHeight + 8 && rect.top > menuHeight + 8
      ? rect.top - menuHeight - 2
      : rect.bottom + 2
    const left = rect.right - 230 >= 8 ? rect.right - 230 : Math.min(rect.left, window.innerWidth - 238)
    setMenuPosition({
      top: Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8)),
      left: Math.max(8, left),
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!root.current?.contains(target) && !menu.current?.contains(target)) {
        setOpen(false)
        setStatusOpen(false)
      }
    }
    const closeOnScroll = () => { setOpen(false); setStatusOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [open])

  useEffect(() => {
    if (!statusOpen) return
    if (menu.current) setSubmenuSide(menu.current.getBoundingClientRect().left < 246 ? 'right' : 'left')
    const selected = STATUS_OPTIONS.findIndex(option => option.value === project.status)
    statusItems.current[selected]?.focus()
  }, [statusOpen, project.status])

  const close = () => {
    setOpen(false)
    setStatusOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      if (statusOpen) {
        setStatusOpen(false)
        statusTrigger.current?.focus()
      } else {
        close()
        trigger.current?.focus()
      }
    } else if (event.key === 'Tab') {
      close()
    }
  }

  const handleStatusKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null
    if (event.key === 'ArrowDown') next = (index + 1) % STATUS_OPTIONS.length
    else if (event.key === 'ArrowUp') next = (index + STATUS_OPTIONS.length - 1) % STATUS_OPTIONS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = STATUS_OPTIONS.length - 1
    if (next !== null) {
      event.preventDefault()
      statusItems.current[next]?.focus()
    }
  }

  const chooseStatus = (status: Status) => {
    onStatusChange(status)
    close()
    trigger.current?.focus()
  }

  const menuContent = open && menuPosition && <div
    ref={menu}
    className="project-action-menu"
    style={{ top: menuPosition.top, left: menuPosition.left }}
    role="menu"
    aria-label="گزینه‌های پروژه"
    dir="rtl"
    onClick={event => event.stopPropagation()}
    onKeyDown={handleKeyDown}
  >
    <button type="button" role="menuitem" onClick={() => { close(); onEdit() }}>ویرایش پروژه</button>
    <div className="project-menu-status-wrap">
      <button
        ref={statusTrigger}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={statusOpen}
        onClick={() => setStatusOpen(!statusOpen)}
      >
        <span>تغییر وضعیت</span>
        <ChevronLeft className="ui-icon project-menu-arrow" aria-hidden="true" />
      </button>
      {statusOpen && <div className={`project-status-submenu opens-${submenuSide}`} role="menu" aria-label="انتخاب وضعیت">
        {STATUS_OPTIONS.map((option, index) => <button
          key={option.value}
          ref={node => { statusItems.current[index] = node }}
          type="button"
          role="menuitemradio"
          aria-checked={project.status === option.value}
          onClick={() => chooseStatus(option.value)}
          onKeyDown={event => handleStatusKeyDown(event, index)}
        >
          <span className="dropdown-dot" style={{ background: option.tone }} />
          <span>{option.label}</span>
          {project.status === option.value && <Check className="ui-icon dropdown-check" aria-hidden="true" />}
        </button>)}
      </div>}
    </div>
    <button type="button" role="menuitem" onClick={() => { close(); onCopyName() }}>کپی نام پروژه</button>
    <div className="project-menu-separator" role="separator" />
    <button type="button" role="menuitem" className="danger-text" onClick={() => { close(); onDelete() }}>حذف پروژه</button>
  </div>

  return <div
    className="project-menu-wrap"
    ref={root}
    onClick={event => event.stopPropagation()}
    onKeyDown={handleKeyDown}
  >
    <button
      ref={trigger}
      type="button"
      className={triggerClassName}
      aria-label={triggerLabel}
      data-tooltip={triggerLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => { setOpen(!open); setStatusOpen(false) }}
    >
      <Ellipsis className="ui-icon ui-icon-lg" aria-hidden="true" />
    </button>
    {menuContent && createPortal(menuContent, root.current?.closest('.a') || document.body)}
  </div>
}
