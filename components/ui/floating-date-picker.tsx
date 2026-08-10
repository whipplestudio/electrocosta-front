'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getYear, setYear, setMonth, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export type DateSelection = Date | { from?: Date; to?: Date } | undefined

export interface FloatingDatePickerProps {
  label: string
  value: DateSelection
  onChange: (value: DateSelection) => void
  mode?: 'single' | 'range'
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  containerClassName?: string
  minDate?: Date
  maxDate?: Date
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

export function FloatingDatePicker({
  label,
  value,
  onChange,
  mode = 'single',
  placeholder = mode === 'range' ? 'Seleccionar rango' : 'Seleccionar fecha',
  error,
  helperText,
  disabled = false,
  containerClassName,
  minDate,
  maxDate,
}: FloatingDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(() => {
    if (mode === 'single') {
      return value instanceof Date ? value : new Date()
    }
    const range = value as { from?: Date; to?: Date } | undefined
    return range?.from || new Date()
  })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number } | null>(null)

  // Determine if has value
  const hasValue = React.useMemo(() => {
    if (mode === 'single') {
      return value instanceof Date
    }
    const range = value as { from?: Date; to?: Date } | undefined
    return !!range?.from
  }, [value, mode])

  const isActive = isOpen || isFocused || hasValue

  // Close on click outside (the dropdown is portaled, so it must be checked separately)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Position the portaled dropdown against the trigger, flipping above it
  // when there isn't enough room below (e.g. inside a scrollable dialog).
  React.useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 380
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight

      setDropdownPosition({
        top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  // Update view date when value changes
  React.useEffect(() => {
    if (mode === 'single' && value instanceof Date) {
      setViewDate(value)
    } else if (mode === 'range') {
      const range = value as { from?: Date; to?: Date } | undefined
      if (range?.from) {
        setViewDate(range.from)
      }
    }
  }, [value, mode])

  // Format display value
  const displayValue = React.useMemo(() => {
    if (mode === 'single') {
      if (value instanceof Date) {
        return format(value, 'dd/MM/yyyy', { locale: es })
      }
      return ''
    }
    const range = value as { from?: Date; to?: Date } | undefined
    if (range?.from) {
      if (range.to) {
        return `${format(range.from, 'dd/MM/yyyy', { locale: es })} - ${format(range.to, 'dd/MM/yyyy', { locale: es })}`
      }
      return format(range.from, 'dd/MM/yyyy', { locale: es })
    }
    return ''
  }, [value, mode])

  // Calendar calculations
  const days = React.useMemo(() => {
    const start = startOfMonth(viewDate)
    const end = endOfMonth(viewDate)
    return eachDayOfInterval({ start, end })
  }, [viewDate])

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

  const handleYearChange = (year: number) => {
    setViewDate(setYear(viewDate, year))
  }

  const handleMonthChange = (monthIndex: number) => {
    setViewDate(setMonth(viewDate, monthIndex))
  }

  // Normalize date to avoid timezone offset issues
  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  const handleDateClick = (date: Date) => {
    const normalizedDate = normalizeDate(date)
    if (mode === 'single') {
      onChange(normalizedDate)
      setIsOpen(false)
    } else {
      const range = value as { from?: Date; to?: Date } | undefined
      if (!range?.from || (range.from && range.to)) {
        // Start new range
        onChange({ from: normalizedDate, to: undefined })
      } else {
        // Complete range
        const normalizedFrom = normalizeDate(range.from)
        if (normalizedDate < normalizedFrom) {
          onChange({ from: normalizedDate, to: normalizedFrom })
        } else {
          onChange({ from: normalizedFrom, to: normalizedDate })
        }
      }
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(mode === 'single' ? undefined : { from: undefined, to: undefined })
  }

  const isSelected = (date: Date) => {
    if (mode === 'single') {
      return value instanceof Date && isSameDay(date, value)
    }
    const range = value as { from?: Date; to?: Date } | undefined
    if (!range?.from) return false
    if (range.to) {
      return date >= range.from && date <= range.to
    }
    return isSameDay(date, range.from)
  }

  const isRangeStart = (date: Date) => {
    if (mode !== 'range') return false
    const range = value as { from?: Date; to?: Date } | undefined
    return range?.from && isSameDay(date, range.from)
  }

  const isRangeEnd = (date: Date) => {
    if (mode !== 'range') return false
    const range = value as { from?: Date; to?: Date } | undefined
    return range?.to && isSameDay(date, range.to)
  }

  const isInRange = (date: Date) => {
    if (mode !== 'range') return false
    const range = value as { from?: Date; to?: Date } | undefined
    if (!range?.from || !range.to) return false
    return date > range.from && date < range.to
  }

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  return (
    <div className={cn('relative', containerClassName)} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center min-h-[48px] rounded-xl border-2 bg-white px-3 py-2 cursor-pointer transition-all duration-200',
          isOpen || isFocused
            ? 'border-[#164e63] ring-2 ring-[#164e63]/10'
            : error
              ? 'border-red-500'
              : 'border-[#e5e7eb] hover:border-[#d1d5db]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        {/* Icon */}
        <div className="text-[#6b7280] mr-2">
          <CalendarIcon className="w-5 h-5" />
        </div>

        {/* Display value / placeholder - only show placeholder when label is up (isActive) */}
        <div className="flex-1 min-w-0">
          {hasValue ? (
            <span className="text-[#374151] text-base">{displayValue}</span>
          ) : isActive ? (
            <span className="text-[#6b7280]/60 text-base">{placeholder}</span>
          ) : (
            <span className="text-transparent text-base">&nbsp;</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          {hasValue && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 text-[#6b7280] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Floating Label */}
        <label
          className={cn(
            'absolute left-10 pointer-events-none transition-all duration-200 origin-left bg-white px-1 z-10',
            isActive
              ? '-top-2.5 text-xs font-medium text-[#164e63]'
              : 'top-1/2 -translate-y-1/2 text-base text-[#6b7280]'
          )}
        >
          {label}
        </label>
      </div>

      {/* Calendar Dropdown — portaled to <body> so it escapes any
          overflow-hidden/auto ancestor (e.g. a scrollable dialog) that
          would otherwise clip it. Positioned with `fixed` against the
          trigger's real screen position, computed above.
          Radix Dialog sets `body { pointer-events: none }` while open and
          only re-enables it on the DialogContent's own subtree, so this
          portal (rendered outside that subtree) needs pointer-events
          forced back on or clicks would fall through to the dialog. */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition?.top ?? -9999,
            left: dropdownPosition?.left ?? -9999,
            visibility: dropdownPosition ? 'visible' : 'hidden',
            pointerEvents: 'auto',
          }}
          className="z-[100] bg-white rounded-lg border border-[#e5e7eb] shadow-xl p-4 min-w-[320px]"
        >
          {/* Header with Month/Year selectors */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100 text-[#6b7280] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <select
                value={viewDate.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="text-sm font-medium text-[#374151] bg-transparent border border-[#e5e7eb] rounded-md px-2 py-1 focus:outline-none focus:border-[#164e63] cursor-pointer"
              >
                {months.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={getYear(viewDate)}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="text-sm font-medium text-[#374151] bg-transparent border border-[#e5e7eb] rounded-md px-2 py-1 focus:outline-none focus:border-[#164e63] cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100 text-[#6b7280] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-[#6b7280] py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, viewDate)
              const selected = isSelected(date)
              const rangeStart = isRangeStart(date)
              const rangeEnd = isRangeEnd(date)
              const inRange = isInRange(date)
              const disabled = isDisabled(date)

              // Calculate offset for first day of month
              if (idx === 0) {
                const firstDayOfWeek = date.getDay()
                if (firstDayOfWeek > 0) {
                  return (
                    <React.Fragment key={`offset-${idx}`}>
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}
                      <DayButton
                        date={date}
                        isCurrentMonth={isCurrentMonth}
                        selected={selected}
                        rangeStart={!!rangeStart}
                        rangeEnd={!!rangeEnd}
                        inRange={inRange}
                        isToday={isToday(date)}
                        disabled={disabled}
                        onClick={() => handleDateClick(date)}
                      />
                    </React.Fragment>
                  )
                }
              }

              return (
                <DayButton
                  key={date.toISOString()}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  selected={selected}
                  rangeStart={!!rangeStart}
                  rangeEnd={!!rangeEnd}
                  inRange={inRange}
                  isToday={isToday(date)}
                  disabled={disabled}
                  onClick={() => handleDateClick(date)}
                />
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#e5e7eb]">
            <button
              onClick={() => {
                onChange(mode === 'single' ? new Date() : { from: new Date(), to: new Date() })
                setIsOpen(false)
              }}
              className="text-sm text-[#164e63] hover:text-[#0e3a4a] font-medium"
            >
              Hoy
            </button>
            {mode === 'range' && hasValue && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm bg-[#164e63] text-white px-3 py-1.5 rounded-lg hover:bg-[#0e3a4a]"
              >
                Aplicar
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Helper text or error */}
      {(helperText || error) && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-red-500' : 'text-[#6b7280]'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

// Day button component
interface DayButtonProps {
  date: Date
  isCurrentMonth: boolean
  selected: boolean
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
  isToday: boolean
  disabled: boolean
  onClick: () => void
}

function DayButton({ date, isCurrentMonth, selected, rangeStart, rangeEnd, inRange, isToday: today, disabled, onClick }: DayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-9 w-full rounded-lg text-sm font-medium transition-colors relative',
        !isCurrentMonth && 'text-[#9ca3af]',
        isCurrentMonth && !selected && !inRange && 'text-[#374151] hover:bg-[#f0fdf4]',
        disabled && 'opacity-30 cursor-not-allowed',
        selected && 'bg-[#164e63] text-white',
        inRange && !selected && 'bg-[#f0fdf4] text-[#164e63]',
        rangeStart && !selected && 'bg-[#164e63] text-white rounded-r-none',
        rangeEnd && !selected && 'bg-[#164e63] text-white rounded-l-none',
        rangeStart && rangeEnd && 'rounded-lg',
        today && !selected && 'ring-2 ring-cyan-500 ring-inset'
      )}
    >
      {format(date, 'd')}
    </button>
  )
}
