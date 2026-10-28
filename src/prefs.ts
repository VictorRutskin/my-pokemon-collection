import { useEffect, useState } from "react"
import type { Lang } from "./copy"

export type Prefs = {
  lang: Lang
  text: 0 | 1 | 2
  contrast: boolean
  links: boolean
  readable: boolean
  motionOff: boolean
}

function loadPrefs(): Prefs {
  const root = document.documentElement
  const text: 0 | 1 | 2 = root.dataset.text === "2" ? 2 : root.dataset.text === "1" ? 1 : 0
  return {
    lang: "he",
    text,
    contrast: root.dataset.contrast === "high",
    links: root.dataset.links === "on",
    readable: root.dataset.font === "readable",
    motionOff: root.dataset.motion === "off",
  }
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  useEffect(() => {
    const root = document.documentElement
    root.lang = prefs.lang
    root.dir = prefs.lang === "he" ? "rtl" : "ltr"
    root.dataset.text = String(prefs.text)
    root.dataset.contrast = prefs.contrast ? "high" : "normal"
    root.dataset.links = prefs.links ? "on" : "off"
    root.dataset.font = prefs.readable ? "readable" : "default"
    root.dataset.motion = prefs.motionOff ? "off" : "on"
    try {
      localStorage.setItem("cabinet-lang", prefs.lang)
      localStorage.setItem(
        "cabinet-a11y",
        JSON.stringify({
          text: prefs.text,
          contrast: prefs.contrast,
          links: prefs.links,
          readable: prefs.readable,
          motion: prefs.motionOff ? "off" : "on",
        }),
      )
    } catch {
      /* Private mode can block storage. The choice still applies for this visit. */
    }
  }, [prefs])

  function patch(next: Partial<Prefs>) {
    setPrefs((current) => ({ ...current, ...next }))
  }

  function resetA11y() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    patch({ text: 0, contrast: false, links: false, readable: false, motionOff: reduce })
  }

  return { prefs, patch, resetA11y }
}
