import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

export type SetChoice = {
  id: string
  name: string
  count: number
}

type Props = {
  labelId: string
  value: string
  allLabel: string
  otherLabel: string
  closeLabel: string
  options: SetChoice[]
  onChange: (id: string) => void
}

const seriesOrder = ["Mega Evolution", "Scarlet & Violet", "Sword & Shield"]

function seriesOf(name: string) {
  const splitAt = name.indexOf(": ")
  if (splitAt > 0) return { series: name.slice(0, splitAt), short: name.slice(splitAt + 2) }
  if (name === "Mega Evolution") return { series: "Mega Evolution", short: name }
  return { series: "", short: name }
}

export function SetPicker({ labelId, value, allLabel, otherLabel, closeLabel, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const valueId = useId()

  const groups = useMemo(() => {
    const buckets = new Map<string, Array<SetChoice & { short: string }>>()
    const loose: Array<SetChoice & { short: string }> = []
    for (const option of options) {
      const { series, short } = seriesOf(option.name)
      const row = { ...option, short }
      if (series === "") {
        loose.push(row)
        continue
      }
      const bucket = buckets.get(series) ?? []
      bucket.push(row)
      buckets.set(series, bucket)
    }
    const ordered = [
      ...seriesOrder.filter((series) => buckets.has(series)),
      ...[...buckets.keys()].filter((series) => !seriesOrder.includes(series)).sort((a, b) => a.localeCompare(b, "en")),
    ]
    const grouped = ordered
      .map((series) => ({
        id: series,
        label: series,
        items: (buckets.get(series) ?? []).sort((a, b) => a.short.localeCompare(b.short, "en")),
      }))
      .filter((group) => group.items.length > 1 || seriesOrder.includes(group.id))
    const groupedIds = new Set(grouped.flatMap((group) => group.items.map((item) => item.id)))
    for (const [series, items] of buckets) {
      if (grouped.some((group) => group.id === series)) continue
      loose.push(...items)
    }
    loose.sort((a, b) => a.name.localeCompare(b.name, "en"))
    const looseUnique = loose.filter((item, index) => loose.findIndex((row) => row.id === item.id) === index && !groupedIds.has(item.id))
    return { grouped, loose: looseUnique }
  }, [options])

  const selected = options.find((option) => option.id === value)
  const currentLabel = selected?.name ?? allLabel

  useEffect(() => {
    if (!open) return
    const narrow = window.matchMedia("(max-width: 640px)").matches
    const previous = document.body.style.overflow
    if (narrow) document.body.style.overflow = "hidden"
    const selectedOption = listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    const first = listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')
    const target = selectedOption ?? first
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: "nearest" })

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function choose(id: string) {
    onChange(id)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function move(current: HTMLButtonElement, delta: number) {
    const items = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])]
    const index = items.indexOf(current)
    if (index < 0 || items.length === 0) return
    const next = items[(index + delta + items.length) % items.length]
    next.focus()
    next.scrollIntoView({ block: "nearest" })
  }

  function onOptionKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      move(event.currentTarget, 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      move(event.currentTarget, -1)
    } else if (event.key === "Home") {
      event.preventDefault()
      const first = listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')
      first?.focus()
    } else if (event.key === "End") {
      event.preventDefault()
      const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
      items?.[items.length - 1]?.focus()
    }
  }

  function renderOption(option: SetChoice & { short?: string }, label: string) {
    const selectedOption = option.id === value
    return (
      <button
        key={option.id}
        type="button"
        role="option"
        className="set-option"
        aria-selected={selectedOption}
        onClick={() => choose(option.id)}
        onKeyDown={onOptionKey}
      >
        <span className="set-option-name">{label}</span>
        <span className="set-option-count">{option.count}</span>
      </button>
    )
  }

  return (
    <div ref={rootRef} className={`set-picker${open ? " is-open" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`set-trigger${value !== "all" ? " is-set" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <span id={valueId} className="set-trigger-value">{currentLabel}</span>
        <svg className="set-chevron" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" className="set-backdrop" aria-label={closeLabel} onClick={() => setOpen(false)} />
          <div ref={listRef} id={listId} className="set-menu" role="listbox" aria-labelledby={labelId} tabIndex={-1}>
            <div className="set-menu-bar">
              <span>{currentLabel}</span>
              <button type="button" className="set-close" onClick={() => { setOpen(false); buttonRef.current?.focus() }}>
                {closeLabel}
              </button>
            </div>
            {renderOption({ id: "all", name: allLabel, count: options.reduce((sum, option) => sum + option.count, 0), short: allLabel }, allLabel)}
            {groups.grouped.map((group) => (
              <div key={group.id} className="set-group" role="group" aria-label={group.label}>
                <p className="set-group-label">{group.label}</p>
                {group.items.map((item) => renderOption(item, item.short))}
              </div>
            ))}
            {groups.loose.length > 0 && (
              <div className="set-group" role="group" aria-label={otherLabel}>
                <p className="set-group-label">{otherLabel}</p>
                {groups.loose.map((item) => renderOption(item, item.name))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
