import { useEffect, useMemo, useState } from "react"
import { copy, type Copy, type Lang } from "./copy"
import { listings, productKinds, type Listing, type ListingStatus, type ProductKind } from "./data/listings"
import { site } from "./data/site"
import { usePrefs } from "./prefs"
import { formatDate, formatMoney, imageUrl, kindLabel, loc, statusLabel, unitsLeft } from "./text"
import { A11yDialog } from "./components/A11yDialog"
import { ListingDialog } from "./components/ListingDialog"
import { AccessIcon, Motif, Seal } from "./components/Motif"
import { SetPicker } from "./components/SetPicker"

type StatusFilter = "all" | ListingStatus
type KindFilter = "all" | ProductKind
type PriceBand = "all" | "ask" | "u200" | "u500" | "u1000" | "over"
type SortKey = "type" | "set" | "name" | "price-asc" | "price-desc"

function byTitle(a: Listing, b: Listing) {
  return a.titleHe.localeCompare(b.titleHe, "he")
}

function bySetThenTitle(a: Listing, b: Listing) {
  return a.setHe.localeCompare(b.setHe, "he") || byTitle(a, b)
}

/** Available items stay in the chosen order. Anything else follows them. */
function availabilityRank(item: Listing) {
  if (item.status === "available") return 0
  if (item.status === "reserved") return 1
  return 2
}

function withAvailability(compare: (a: Listing, b: Listing) => number) {
  return (a: Listing, b: Listing) => availabilityRank(a) - availabilityRank(b) || compare(a, b)
}

function amounts(item: Listing) {
  return item.offers.length > 0 ? item.offers.map((offer) => offer.priceIls) : item.priceIls === null ? [] : [item.priceIls]
}

function byPrice(direction: 1 | -1) {
  return (a: Listing, b: Listing) => {
    const left = amounts(a)
    const right = amounts(b)
    if (left.length === 0 && right.length === 0) return byTitle(a, b)
    if (left.length === 0) return 1
    if (right.length === 0) return -1
    const pick = direction === 1 ? Math.min : Math.max
    return (pick(...left) - pick(...right)) * direction || byTitle(a, b)
  }
}

function groupListings(items: Listing[], sortKey: SortKey, c: Copy) {
  if (sortKey === "type") {
    return productKinds
      .map((kind) => ({
        id: kind,
        title: kindLabel(c, kind),
        items: items.filter((item) => item.kind === kind).sort(withAvailability(bySetThenTitle)),
      }))
      .filter((group) => group.items.length > 0)
  }
  if (sortKey === "set") {
    const seen = new Map<string, Listing>()
    for (const item of items) if (!seen.has(item.setId)) seen.set(item.setId, item)
    return [...seen.values()].sort(bySetThenTitle).map((sample) => ({
      id: sample.setId,
      title: sample.setHe,
      items: items
        .filter((item) => item.setId === sample.setId)
        .sort(withAvailability((a, b) => productKinds.indexOf(a.kind) - productKinds.indexOf(b.kind) || byTitle(a, b))),
    }))
  }
  const sorted = [...items]
  if (sortKey === "name") sorted.sort(withAvailability(byTitle))
  else sorted.sort(withAvailability(byPrice(sortKey === "price-asc" ? 1 : -1)))
  return [{ id: "flat", title: "", items: sorted }]
}

function inBand(price: number, band: PriceBand) {
  if (band === "u200") return price < 200
  if (band === "u500") return price >= 200 && price < 500
  if (band === "u1000") return price >= 500 && price < 1000
  return price >= 1000
}

function inPrice(item: Listing, band: PriceBand) {
  const prices = amounts(item)
  if (band === "all") return true
  if (band === "ask") return prices.length === 0
  return prices.some((price) => inBand(price, band))
}

export function App() {
  const { prefs, patch, resetA11y } = usePrefs()
  const c = copy[prefs.lang]
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")
  const [setFilter, setSetFilter] = useState("all")
  const [priceBand, setPriceBand] = useState<PriceBand>("all")
  const [sortKey, setSortKey] = useState<SortKey>("type")
  const [active, setActive] = useState<Listing | null>(null)
  const [a11yOpen, setA11yOpen] = useState(false)

  const published = listings.filter((item) => item.published)
  const real = published.filter((item) => !item.example)
  const pool = real.length > 0 ? real : published
  const showingExamples = pool.some((item) => item.example)

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matched = pool.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false
      if (kindFilter !== "all" && item.kind !== kindFilter) return false
      if (setFilter !== "all" && item.setId !== setFilter) return false
      if (!inPrice(item, priceBand)) return false
      if (!needle) return true
      const hay = [
        item.id,
        item.kind,
        item.titleHe,
        item.titleEn,
        item.setHe,
        item.setEn,
        item.number,
        item.year,
        item.finishHe,
        item.finishEn,
        item.languageHe,
        item.languageEn,
        item.conditionHe,
        item.conditionEn,
        item.tagHe,
        item.tagEn,
        ...item.offers.flatMap((offer) => [offer.conditionHe, offer.conditionEn]),
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(needle)
    })
    return matched
  }, [pool, query, statusFilter, kindFilter, setFilter, priceBand])

  useEffect(() => {
    document.title = c.itemsTitle
    document.querySelector('meta[name="description"]')?.setAttribute("content", c.meta)
  }, [prefs.lang, c.meta, c.itemsTitle])

  const availableCount = pool.filter((item) => item.status === "available").length
  const location = prefs.lang === "he" ? site.locationHe : site.locationEn

  const statusFilters: Array<{ id: StatusFilter; label: string }> = [
    { id: "all", label: c.filterAll },
    { id: "available", label: c.filterAvailable },
    { id: "reserved", label: c.filterReserved },
    { id: "sold", label: c.filterSold },
  ]
  const kindFilters: Array<{ id: KindFilter; label: string }> = [
    { id: "all", label: c.kindAll },
    ...productKinds
      .filter((kind) => pool.some((item) => item.kind === kind))
      .map((kind) => ({ id: kind, label: kindLabel(c, kind) })),
  ]
  const priceFilters: Array<{ id: PriceBand; label: string }> = [
    { id: "all", label: c.priceAll },
    { id: "ask", label: c.priceBandAsk },
    { id: "u200", label: c.priceU200 },
    { id: "u500", label: c.priceU500 },
    { id: "u1000", label: c.priceU1000 },
    { id: "over", label: c.priceOver },
  ]
  const setChoices = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>()
    for (const item of pool) {
      const current = counts.get(item.setId)
      if (current) current.count += 1
      else counts.set(item.setId, { name: prefs.lang === "he" ? item.setHe : item.setEn, count: 1 })
    }
    return [...counts.entries()].map(([id, item]) => ({ id, name: item.name, count: item.count }))
  }, [pool, prefs.lang])
  const pricesMissing = pool.length > 0 && pool.every((item) => item.priceIls === null && item.offers.length === 0)
  const groups = groupListings(results, sortKey, c)
  const filtersDirty =
    query !== "" ||
    statusFilter !== "all" ||
    kindFilter !== "all" ||
    setFilter !== "all" ||
    priceBand !== "all" ||
    sortKey !== "type"

  function clearFilters() {
    setQuery("")
    setStatusFilter("all")
    setKindFilter("all")
    setSetFilter("all")
    setPriceBand("all")
    setSortKey("type")
  }

  return (
    <>
      <div className="frame" aria-hidden="true" />
      <a className="skip" href="#content">
        {c.skip}
      </a>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href="#items">
            <Seal className="brand-mark" />
            <span>{c.brand}</span>
          </a>
          <nav className="nav" aria-label={c.navLabel}>
            <a className="nav-items" href="#items">{c.navItems}</a>
            <button type="button" onClick={() => setA11yOpen(true)}>
              {c.navA11y}
            </button>
          </nav>
        </div>
        <div className="stripe" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>
      <main id="content" tabIndex={-1}>
        <section id="items" aria-labelledby="items-title">
          <div className="wrap">
            <div className="section-head gallery-head">
              <h1 id="items-title" className="display gallery-title">
                {c.itemsTitle}
              </h1>
              <ul className="stats">
                <li className="stat">
                  <b>{pool.length}</b>
                  <span>{showingExamples ? c.statExamples : c.statItems}</span>
                </li>
                <li className="stat">
                  <b>{availableCount}</b>
                  <span>{c.statAvailable}</span>
                </li>
                <li className="stat stat-wide">
                  <b>{formatDate(prefs.lang, site.updated, "medium")}</b>
                  <span>{c.statUpdated}</span>
                </li>
              </ul>
              {location.trim() && (
                <p className="location-line">
                  {c.location}: {location}
                </p>
              )}
            </div>
            {showingExamples && (
              <p className="banner" role="note">
                {c.sampleBanner}
              </p>
            )}
            {pricesMissing && (
              <p className="banner banner-neutral" role="note">
                {c.priceMissing}
              </p>
            )}
            <div className="filter-panel">
              <div className="filter-find">
                <label className="field">
                  <span>{c.searchLabel}</span>
                  <input
                    type="search"
                    placeholder={c.searchPlaceholder}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div className="field field-set">
                  <span id="set-filter-label">{c.setLabel}</span>
                  <SetPicker
                    labelId="set-filter-label"
                    value={setFilter}
                    allLabel={c.setAll}
                    otherLabel={prefs.lang === "he" ? "אחר" : "Other"}
                    closeLabel={c.close}
                    options={setChoices}
                    onChange={setSetFilter}
                  />
                </div>
              </div>
              <div className="filter-tools">
                <label className="field">
                  <span>{c.sortLabel}</span>
                  <select
                    className={sortKey !== "type" ? "is-set" : undefined}
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as SortKey)}
                  >
                    {(
                      [
                        ["type", c.sortType],
                        ["set", c.sortSet],
                        ["name", c.sortName],
                        ["price-asc", c.sortPriceAsc],
                        ["price-desc", c.sortPriceDesc],
                      ] as const
                    ).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>{c.kindLabel}</span>
                  <select
                    className={kindFilter !== "all" ? "is-set" : undefined}
                    value={kindFilter}
                    onChange={(event) => setKindFilter(event.target.value as KindFilter)}
                  >
                    {kindFilters.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>{c.priceFilterLabel}</span>
                  <select
                    className={priceBand !== "all" ? "is-set" : undefined}
                    value={priceBand}
                    onChange={(event) => setPriceBand(event.target.value as PriceBand)}
                  >
                    {priceFilters.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {pool.some((item) => item.status !== "available") && (
                  <label className="field">
                    <span>{c.filterLabel}</span>
                    <select
                      className={statusFilter !== "all" ? "is-set" : undefined}
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    >
                      {statusFilters.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="filter-foot">
                <p className="count" aria-live="polite" aria-atomic="true">
                  {results.length === 0
                    ? c.noResults
                    : results.length === 1
                      ? c.resultsOne
                      : c.results.replace("{n}", String(results.length))}
                </p>
                {filtersDirty && (
                  <button type="button" className="filter-clear" onClick={clearFilters}>
                    {c.clearFilters}
                  </button>
                )}
              </div>
            </div>
            {groups.map((group) => (
              <section key={group.id} className="kind-block" aria-labelledby={group.title ? `group-${group.id}` : undefined}>
                {group.title && (
                  <h2 id={`group-${group.id}`} className="kind-title">
                    {group.title}
                    <span>{group.items.length}</span>
                  </h2>
                )}
                <ul className="grid">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Card item={item} lang={prefs.lang} c={c} onOpen={() => setActive(item)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="wrap footer-grid">
          <p>{c.footerPersonal}</p>
          <p>{c.footerPrivacy}</p>
          <p className="footer-meta">
            <span>{c.brand}</span>
          </p>
        </div>
      </footer>

      <button type="button" className="a11y-launch" aria-label={c.navA11y} aria-haspopup="dialog" onClick={() => setA11yOpen(true)}>
        <AccessIcon />
        <span>{c.navA11y}</span>
      </button>

      <ListingDialog
        listing={active}
        lang={prefs.lang}
        c={c}
        onClose={() => setActive(null)}
      />
      <A11yDialog
        open={a11yOpen}
        onClose={() => setA11yOpen(false)}
        prefs={prefs}
        patch={patch}
        resetA11y={resetA11y}
        c={c}
      />
    </>
  )
}

function Card({
  item,
  lang,
  c,
  onOpen,
}: {
  item: Listing
  lang: Lang
  c: (typeof copy)["he"]
  onOpen: () => void
}) {
  const title = loc(item, lang, "title")
  return (
    <button
      type="button"
      className="card"
      data-status={item.status}
      data-kind={item.kind}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span className="card-inner">
        <span className="plate">
          {item.image ? (
            <img src={imageUrl(item.image.src)} alt="" />
          ) : (
            <Motif motif={item.motif} />
          )}
          <span className="sheen" aria-hidden="true" />
        </span>
        <span className="card-body">
          <span className="pills">
            <span className="pill" data-kind={item.status}>
              {statusLabel(c, item.status)}
            </span>
            {item.example && <span className="pill pill-sample">{c.sampleBadge}</span>}
          </span>
          <span className="card-title" dir="auto">{title}</span>
          <span className="card-set">{loc(item, lang, "set")}</span>
          <span className="card-meta">
            {loc(item, lang, "language")}
            {item.year ? ` · ${item.year}` : ""}
            {item.tagHe !== "" ? ` · ${lang === "he" ? item.tagHe : item.tagEn}` : ""}
          </span>
          <span className="price-slot">
            {item.offers.length > 0 ? (
              <span className="offers">
                {item.offers.map((offer) => (
                  <span key={offer.conditionHe} className="offer">
                    <span>{lang === "he" ? offer.conditionHe : offer.conditionEn}</span>
                    <span className="price">{formatMoney(lang, offer.priceIls)}</span>
                    <span className="left">{c.leftCount.replace("{n}", String(offer.quantity))}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="price-row">
                <span className="price">
                  {item.priceIls === null
                    ? c.priceAsk
                    : `${formatMoney(lang, item.priceIls)}${item.quantity > 1 && item.priceForAll ? ` ${c.priceTogether}` : ""}`}
                </span>
                <span className="left">{c.leftCount.replace("{n}", String(unitsLeft(item)))}</span>
              </span>
            )}
          </span>
        </span>
      </span>
    </button>
  )
}
