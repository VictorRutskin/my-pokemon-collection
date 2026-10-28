import { useEffect, useRef } from "react"
import type { Copy, Lang } from "../copy"
import type { Listing } from "../data/listings"
import { formatMoney, imageUrl, loc, statusLabel, unitsLeft } from "../text"
import { Motif } from "./Motif"

type Props = {
  listing: Listing | null
  lang: Lang
  c: Copy
  onClose: () => void
}

export function ListingDialog({ listing, lang, c, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (listing && !el.open) el.showModal()
    if (!listing && el.open) el.close()
  }, [listing])

  const title = listing ? loc(listing, lang, "title") : c.itemsTitle

  return (
    <dialog
      id="listing-dialog"
      ref={ref}
      className="sheet sheet-listing"
      aria-labelledby={listing ? "listing-title" : undefined}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      {listing && (
        <div className="sheet-body">
          <div className="sheet-head">
            <p className="kicker">
              <span className="kicker-mark" aria-hidden="true" />
              {listing.id}
            </p>
            <button type="button" className="icon-btn" onClick={() => ref.current?.close()}>
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">{c.close}</span>
            </button>
          </div>
          <h2 id="listing-title" className="display" dir="auto">
            {title}
          </h2>
          <div className="sheet-layout">
            <div className="plate plate-dialog">
              {listing.image ? (
                <img
                  src={imageUrl(listing.image.src)}
                  alt={lang === "he" ? listing.image.altHe : listing.image.altEn}
                />
              ) : (
                <Motif motif={listing.motif} />
              )}
            </div>
            <div>
              {listing.offers.length > 0 ? (
                <ul className="offers offers-dialog">
                  {listing.offers.map((offer) => (
                    <li key={offer.conditionHe} className="offer">
                      <span>{lang === "he" ? offer.conditionHe : offer.conditionEn}</span>
                      <span className="price">{formatMoney(lang, offer.priceIls)}</span>
                      <span className="left">{c.leftCount.replace("{n}", String(offer.quantity))}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ask price-row">
                  <span>
                    {listing.priceIls === null
                      ? c.priceAsk
                      : `${formatMoney(lang, listing.priceIls)}${listing.quantity > 1 && listing.priceForAll ? ` ${c.priceTogether}` : ""}`}
                  </span>
                  <span className="left">{c.leftCount.replace("{n}", String(unitsLeft(listing)))}</span>
                </p>
              )}
              {listing.tagHe !== "" && (
                <p className="card-tag" dir="auto">
                  {lang === "he" ? listing.tagHe : listing.tagEn}
                </p>
              )}
              <p className="pills">
                <span className="pill" data-kind={listing.status}>
                  {statusLabel(c, listing.status)}
                </span>
                {listing.example && <span className="pill pill-sample">{c.sampleBadge}</span>}
              </p>
              {listing.example && <p className="callout">{c.sampleNote}</p>}
              {!listing.example && listing.status === "sold" && <p className="callout">{c.soldNote}</p>}
              {!listing.example && listing.status === "reserved" && (
                <p className="callout">{c.reservedNote}</p>
              )}
              <dl className="specs">
                <dt>{c.setLabel}</dt>
                <dd dir="auto">{loc(listing, lang, "set")}</dd>
                <dt>{c.numberLabel}</dt>
                <dd>{c.leftCount.replace("{n}", String(unitsLeft(listing)))}</dd>
                {listing.year.trim() !== "" && (
                  <>
                    <dt>{c.yearLabel}</dt>
                    <dd>{listing.year}</dd>
                  </>
                )}
                <dt>{c.finishLabel}</dt>
                <dd dir="auto">{loc(listing, lang, "finish")}</dd>
                <dt>{c.languageOfItem}</dt>
                <dd dir="auto">{loc(listing, lang, "language")}</dd>
                {listing.offers.length === 0 && (
                  <>
                    <dt>{c.conditionLabel}</dt>
                    <dd dir="auto">{loc(listing, lang, "condition")}</dd>
                  </>
                )}
                <dt>{c.notesLabel}</dt>
                <dd dir="auto">{loc(listing, lang, "notes")}</dd>
                <dt>{c.referenceLabel}</dt>
                <dd>{listing.id}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
