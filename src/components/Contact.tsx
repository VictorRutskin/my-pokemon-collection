import { useEffect, useState } from "react"
import type { Copy, Lang } from "../copy"
import type { Listing } from "../data/listings"
import { site } from "../data/site"
import { buildDraft, loc, whatsappHref } from "../text"

type Props = {
  lang: Lang
  c: Copy
  interest: Listing | null
  onClear: () => void
}

export function Contact({ lang, c, interest, onClear }: Props) {
  const draft = buildDraft(c, interest, lang)
  const [custom, setCustom] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const text = custom ?? draft.body

  useEffect(() => {
    setCustom(null)
    setCopied(false)
    setFailed(false)
  }, [draft.body])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 4000)
    return () => window.clearTimeout(id)
  }, [copied])

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setFailed(false)
    } catch {
      const area = document.getElementById("inquiry-text")
      if (area instanceof HTMLTextAreaElement) {
        area.focus()
        area.select()
      }
      setCopied(false)
      setFailed(true)
    }
  }

  const mail = site.email.trim()
  const phone = site.phone.trim()
  const whatsapp = phone ? whatsappHref(phone) : null
  const location = lang === "he" ? site.locationHe.trim() : site.locationEn.trim()
  const mailto = mail
    ? `mailto:${mail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(text)}`
    : ""

  return (
    <section id="contact" className="band" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="contact-title" className="display">
            <span className="idx">03</span>
            {c.contactTitle}
          </h2>
          <p>{c.contactLead}</p>
        </div>
        {!mail && !phone && <p className="banner banner-neutral">{c.contactSetup}</p>}
        <div className="contact-grid">
          <div>
            {interest && (
              <p className="about-line">
                <span>
                  {c.aboutItem}: {loc(interest, lang, "title")}
                </span>
                <button type="button" className="btn" onClick={onClear}>
                  {c.clearItem}
                </button>
              </p>
            )}
            <label className="field" htmlFor="inquiry-text">
              {c.draftLabel}
            </label>
            <textarea
              id="inquiry-text"
              value={text}
              onChange={(event) => {
                setCustom(event.target.value)
                setCopied(false)
                setFailed(false)
              }}
              spellCheck
            />
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={copyText}>
                {copied ? c.copied : c.copy}
              </button>
              {mail && (
                <a className="btn" href={mailto}>
                  {c.email}
                </a>
              )}
            </div>
            <p role="status" className="status-line">
              {copied ? c.copied : failed ? c.copyFailed : ""}
            </p>
          </div>
          <ul className="contact-list">
            {mail && (
              <li>
                <span>{c.email}</span>
                <a href={`mailto:${mail}`}>{mail}</a>
              </li>
            )}
            {phone && (
              <li>
                <span>{c.phone}</span>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </li>
            )}
            {whatsapp && (
              <li>
                <span>{c.whatsapp}</span>
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  {c.whatsapp}
                  <span className="visually-hidden"> ({c.newWindow})</span>
                </a>
              </li>
            )}
            {location && (
              <li>
                <span>{c.location}</span>
                <strong>{location}</strong>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
