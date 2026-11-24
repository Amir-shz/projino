import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type DropdownOption<T extends string | number> = {
  value: T
  label: string
  buttonLabel?: string
  tone?: string
}

export default function Dropdown<T extends string | number>({
  value, options, onChange, ariaLabel, className = '', showChevron = false,
  showValueTone = false, showOptionTones = false, buttonLabel, statusTrigger = false,
}: {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  showChevron?: boolean
  showValueTone?: boolean
  showOptionTones?: boolean
  buttonLabel?: string
  statusTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [opensAbove, setOpensAbove] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listId = useId()
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value))
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const menuHeight = Math.min(options.length * 38 + 14, 250)
    const modalBounds = root.current?.closest('.modal')?.getBoundingClientRect()
    const spaceBelow = Math.min(window.innerHeight - rect.bottom, modalBounds ? modalBounds.bottom - rect.bottom : Infinity)
    const spaceAbove = Math.min(rect.top, modalBounds ? rect.top - modalBounds.top : Infinity)
    setOpensAbove(spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow)
    optionRefs.current[activeIndex]?.focus()
  }, [open, activeIndex, options.length])

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  const moveActive = (index: number) => {
    const next = (index + options.length) % options.length
    setActiveIndex(next)
    optionRefs.current[next]?.focus()
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(index + 1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(index - 1) }
    else if (event.key === 'Home') { event.preventDefault(); moveActive(0) }
    else if (event.key === 'End') { event.preventDefault(); moveActive(options.length - 1) }
    else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      trigger.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  const choose = (option: DropdownOption<T>) => {
    onChange(option.value)
    setOpen(false)
    trigger.current?.focus()
  }

  return <div className={`dropdown ${className}`} ref={root} dir="rtl">
    <button
      ref={trigger}
      type="button"
      className={`bt dropdown-trigger${statusTrigger ? ' status-trigger' : ''}`}
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      onClick={toggle}
      onKeyDown={handleTriggerKeyDown}
    >
      <span className="dropdown-value">
        {showValueTone && selected?.tone && <span className="dropdown-dot" style={{ background: selected.tone }} />}
        <span>{buttonLabel || selected?.buttonLabel || selected?.label || ''}</span>
      </span>
      {showChevron && <span className="dropdown-chevron"><ChevronDown className="ui-icon ui-icon-sm" aria-hidden="true" /></span>}
    </button>
    {open && <div
      id={listId}
      className={`dropdown-menu${opensAbove ? ' opens-above' : ''}`}
      role="listbox"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        return <button
          key={String(option.value)}
          ref={node => { optionRefs.current[index] = node }}
          type="button"
          role="option"
          aria-selected={isSelected}
          tabIndex={activeIndex === index ? 0 : -1}
          className={`dropdown-option${isSelected ? ' selected' : ''}`}
          onClick={() => choose(option)}
          onKeyDown={event => handleOptionKeyDown(event, index)}
        >
          {showOptionTones && option.tone && <span className="dropdown-dot" style={{ background: option.tone }} />}
          <span>{option.label}</span>
          {isSelected && <Check className="ui-icon dropdown-check" aria-hidden="true" />}
        </button>
      })}
    </div>}
  </div>
}
