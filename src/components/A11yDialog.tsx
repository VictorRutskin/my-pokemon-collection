import { useEffect, useRef } from "react"
import type { Copy } from "../copy"
import type { Prefs } from "../prefs"

type Props = {
  open: boolean
  onClose: () => void
  prefs: Prefs
  patch: (next: Partial<Prefs>) => void
  resetA11y: () => void
  c: Copy
}

export function A11yDialog({ open, onClose, prefs, patch, resetA11y, c }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const sizes: Array<0 | 1 | 2> = [0, 1, 2]
  const sizeLabel = [c.text0, c.text1, c.text2]

  return (
    <dialog
      ref={ref}
      className="sheet sheet-a11y"
      aria-labelledby="a11y-title"
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <div className="sheet-body">
        <div className="sheet-head">
          <h2 id="a11y-title" className="display">
            {c.widgetTitle}
          </h2>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()}>
            <span aria-hidden="true">×</span>
            <span className="visually-hidden">{c.close}</span>
          </button>
        </div>
        <p>{c.widgetIntro}</p>
        <div className="option-block">
          <p id="text-size-label">{c.widgetText}</p>
          <div className="segment" role="group" aria-labelledby="text-size-label">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={prefs.text === size}
                onClick={() => patch({ text: size })}
              >
                {sizeLabel[size]}
              </button>
            ))}
          </div>
        </div>
        <div className="toggle-list">
          <button type="button" aria-pressed={prefs.contrast} onClick={() => patch({ contrast: !prefs.contrast })}>
            {c.widgetContrast}
          </button>
          <button type="button" aria-pressed={prefs.links} onClick={() => patch({ links: !prefs.links })}>
            {c.widgetLinks}
          </button>
          <button type="button" aria-pressed={prefs.readable} onClick={() => patch({ readable: !prefs.readable })}>
            {c.widgetFont}
          </button>
          <button type="button" aria-pressed={prefs.motionOff} onClick={() => patch({ motionOff: !prefs.motionOff })}>
            {c.widgetMotion}
          </button>
        </div>
        <button type="button" className="btn" onClick={resetA11y}>
          {c.widgetReset}
        </button>
      </div>
    </dialog>
  )
}
