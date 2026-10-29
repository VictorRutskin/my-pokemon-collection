import type { Lang, Copy } from "./copy"
import type { Listing, ProductKind } from "./data/listings"

const kindCopyKey = {
  etb: "kindEtb",
  "booster-box": "kindBox",
  blister: "kindBlister",
  pack: "kindPack",
  "mini-tin": "kindTin",
  bundle: "kindBundle",
  collection: "kindCollection",
  other: "kindOther",
} as const satisfies Record<ProductKind, keyof Copy>

export function kindLabel(c: Copy, kind: ProductKind): string {
  return c[kindCopyKey[kind]]
}

/** A together-price listing is one lot, even when it holds several pieces. */
export function unitsLeft(listing: Listing): number {
  if (listing.status === "sold") return 0
  return listing.priceForAll ? 1 : listing.quantity
}

type LocKey = "title" | "set" | "finish" | "condition" | "language" | "notes"

export function loc(listing: Listing, lang: Lang, key: LocKey) {
  const he: Record<LocKey, string> = {
    title: listing.titleHe,
    set: listing.setHe,
    finish: listing.finishHe,
    condition: listing.conditionHe,
    language: listing.languageHe,
    notes: listing.notesHe,
  }
  const en: Record<LocKey, string> = {
    title: listing.titleEn,
    set: listing.setEn,
    finish: listing.finishEn,
    condition: listing.conditionEn,
    language: listing.languageEn,
    notes: listing.notesEn,
  }
  return lang === "he" ? he[key] : en[key]
}

export function formatMoney(lang: Lang, value: number) {
  return new Intl.NumberFormat(lang === "he" ? "he-IL" : "en-GB", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(lang: Lang, iso: string, style: "long" | "medium" = "long") {
  return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", {
    dateStyle: style,
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`))
}

export function statusLabel(c: Copy, status: Listing["status"]) {
  if (status === "available") return c.statusAvailable
  if (status === "reserved") return c.statusReserved
  return c.statusSold
}

export function buildDraft(c: Copy, listing: Listing | null, lang: Lang) {
  if (!listing) {
    return { subject: c.inquirySubjectGeneral, body: c.inquiryBodyGeneral }
  }
  const title = loc(listing, lang, "title")
  return {
    subject: `${c.inquirySubjectItem} ${title}`,
    body: c.inquiryBodyItem.replace("{title}", title).replace("{id}", listing.id),
  }
}

export function imageUrl(src: string) {
  if (/^(https?:|data:|blob:)/.test(src)) return src
  const base = import.meta.env.BASE_URL
  return `${base}${src.replace(/^\//, "")}`
}

export function whatsappHref(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "")
  if (!compact.startsWith("+") || compact.length < 8) return null
  return `https://wa.me/${compact.slice(1)}`
}
