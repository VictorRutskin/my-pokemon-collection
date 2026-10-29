/**
 * The collection lives in this file.
 * Photos are copies of the pictures in /items, served from public/cards.
 * Prices were not written on the photos, so priceIls stays empty until you set one.
 * A product name here only identifies a physical item in the photos.
 */

export type ListingStatus = "available" | "reserved" | "sold"

export const productKinds = [
  "collection",
  "booster-box",
  "blister",
  "pack",
  "mini-tin",
  "bundle",
  "other",
  "etb",
] as const

export type ProductKind = (typeof productKinds)[number]

export type Offer = {
  conditionHe: string
  conditionEn: string
  quantity: number
  priceIls: number
}

export type Listing = {
  id: string
  published: boolean
  example: boolean
  kind: ProductKind
  setId: string
  titleHe: string
  titleEn: string
  setHe: string
  setEn: string
  number: string
  year: string
  finishHe: string
  finishEn: string
  conditionHe: string
  conditionEn: string
  languageHe: string
  languageEn: string
  priceIls: number | null
  /** When true, priceIls is for the whole quantity, not for one piece. */
  priceForAll: boolean
  offers: Offer[]
  quantity: number
  status: ListingStatus
  notesHe: string
  notesEn: string
  tagHe: string
  tagEn: string
  motif: number
  image?: {
    src: string
    altHe: string
    altEn: string
  }
}

const kindName: Record<ProductKind, { he: string; en: string }> = {
  etb: { he: "ETB", en: "ETB" },
  "booster-box": { he: "בוסטר בוקס", en: "Booster box" },
  blister: { he: "בליסטר", en: "Blister" },
  pack: { he: "חבילת בוסטר", en: "Booster pack" },
  "mini-tin": { he: "מיני טין", en: "Mini tin" },
  bundle: { he: "באנדל", en: "Bundle" },
  collection: { he: "מארז", en: "Collection" },
  other: { he: "אחר", en: "Other" },
}

type Draft = {
  id: string
  kind: ProductKind
  setId: string
  set: string
  titleHe: string
  titleEn: string
  year?: string
  language?: "en" | "ja"
  quantity?: number
  price?: number
  priceForAll?: boolean
  offers?: Array<Omit<Offer, "priceIls"> & { price: number }>
  condition?: "sealed" | "case"
  conditionHe?: string
  conditionEn?: string
  notesHe?: string
  notesEn?: string
  tagHe?: string
  tagEn?: string
  status?: ListingStatus
  image: string
  altHe: string
  altEn: string
}

function entry(draft: Draft): Listing {
  const offers: Offer[] = (draft.offers ?? []).map((offer) => ({
    conditionHe: offer.conditionHe,
    conditionEn: offer.conditionEn,
    quantity: offer.quantity,
    priceIls: offer.price,
  }))
  const quantity = offers.length > 0 ? offers.reduce((sum, offer) => sum + offer.quantity, 0) : (draft.quantity ?? 1)
  const language = draft.language ?? "en"
  const inCase = draft.condition === "case"
  return {
    id: draft.id,
    published: true,
    example: false,
    kind: draft.kind,
    setId: draft.setId,
    titleHe: draft.titleHe,
    titleEn: draft.titleEn,
    setHe: draft.set,
    setEn: draft.set,
    number: String(quantity),
    year: draft.year ?? "",
    finishHe: kindName[draft.kind].he,
    finishEn: kindName[draft.kind].en,
    conditionHe:
      draft.conditionHe ??
      (offers.length > 0 ? offers.map((offer) => offer.conditionHe).join(", ") : inCase ? "סגור, בתוך קופסת אקריליק" : "סגור"),
    conditionEn:
      draft.conditionEn ??
      (offers.length > 0
        ? offers.map((offer) => offer.conditionEn).join(", ")
        : inCase
          ? "Sealed, inside an acrylic case"
          : "Sealed"),
    languageHe: language === "ja" ? "יפנית" : "אנגלית",
    languageEn: language === "ja" ? "Japanese" : "English",
    priceIls: offers.length > 0 ? null : (draft.price ?? null),
    priceForAll: draft.priceForAll ?? false,
    offers,
    quantity,
    status: draft.status ?? "available",
    notesHe:
      draft.notesHe ??
      (draft.price == null
        ? "פריט סגור מהאוסף הפרטי. המחיר לא היה רשום על התמונה."
        : "פריט סגור מהאוסף הפרטי."),
    notesEn:
      draft.notesEn ??
      (draft.price == null
        ? "Sealed item from the private collection. The photo had no price on it."
        : "Sealed item from the private collection."),
    tagHe: draft.tagHe ?? "",
    tagEn: draft.tagEn ?? "",
    motif: 1,
    image: {
      src: `cards/${draft.image}.jpeg`,
      altHe: draft.altHe,
      altEn: draft.altEn,
    },
  }
}

export const listings: Listing[] = [
  entry({
    id: "etb-pitch-black",
    kind: "etb",
    setId: "pitch-black",
    set: "Mega Evolution: Pitch Black",
    titleHe: "ETB, Pitch Black",
    titleEn: "ETB, Pitch Black",
    offers: [
      { conditionHe: "מצב טוב", conditionEn: "Good condition", quantity: 3, price: 300 },
      { conditionHe: "לפתיחה", conditionEn: "For opening", quantity: 6, price: 270 },
    ],
    notesHe: "תשע קופסאות. שלוש במצב טוב ושש לפתיחה. המחיר הוא לקופסה.",
    notesEn: "Nine boxes. Three in good condition and six for opening. The price is per box.",
    image: "pitch-black-etb",
    altHe: "תצלום של קופסת ETB, Pitch Black",
    altEn: "Photo of a Pitch Black elite trainer box",
  }),
  entry({
    id: "etb-crown-zenith",
    kind: "etb",
    setId: "crown-zenith",
    set: "Sword & Shield: Crown Zenith",
    titleHe: "ETB, Crown Zenith",
    titleEn: "ETB, Crown Zenith",
    price: 1100,
    year: "2023",
    image: "crown-zenith-etb",
    altHe: "תצלום של קופסת ETB סגורה, Crown Zenith",
    altEn: "Photo of a sealed Crown Zenith elite trainer box",
  }),
  entry({
    id: "etb-twilight",
    kind: "etb",
    setId: "twilight-masquerade",
    set: "Scarlet & Violet: Twilight Masquerade",
    titleHe: "ETB, Twilight Masquerade",
    titleEn: "ETB, Twilight Masquerade",
    year: "2024",
    price: 400,
    status: "sold",
    image: "twilight-etb",
    altHe: "תצלום של קופסת ETB סגורה, Twilight Masquerade",
    altEn: "Photo of a sealed Twilight Masquerade elite trainer box",
  }),
  entry({
    id: "etb-stellar",
    kind: "etb",
    setId: "stellar-crown",
    set: "Scarlet & Violet: Stellar Crown",
    titleHe: "ETB, Stellar Crown",
    titleEn: "ETB, Stellar Crown",
    year: "2024",
    price: 500,
    status: "sold",
    image: "stellar-etb",
    altHe: "תצלום של קופסת ETB סגורה, Stellar Crown",
    altEn: "Photo of a sealed Stellar Crown elite trainer box",
  }),
  entry({
    id: "etb-astral",
    kind: "etb",
    setId: "astral-radiance",
    set: "Sword & Shield: Astral Radiance",
    titleHe: "ETB, Astral Radiance",
    titleEn: "ETB, Astral Radiance",
    year: "2022",
    price: 400,
    status: "sold",
    image: "astral-etb",
    altHe: "תצלום של קופסת ETB סגורה, Astral Radiance",
    altEn: "Photo of a sealed Astral Radiance elite trainer box",
  }),
  entry({
    id: "etb-shrouded",
    kind: "etb",
    setId: "shrouded-fable",
    set: "Scarlet & Violet: Shrouded Fable",
    titleHe: "ETB, Shrouded Fable",
    titleEn: "ETB, Shrouded Fable",
    year: "2024",
    price: 400,
    status: "sold",
    image: "shrouded-etb",
    altHe: "תצלום של קופסת ETB סגורה, Shrouded Fable",
    altEn: "Photo of a sealed Shrouded Fable elite trainer box",
  }),
  entry({
    id: "etb-silver",
    kind: "etb",
    setId: "silver-tempest",
    set: "Sword & Shield: Silver Tempest",
    titleHe: "ETB, Silver Tempest",
    titleEn: "ETB, Silver Tempest",
    year: "2022",
    price: 500,
    status: "sold",
    image: "silver-etb",
    altHe: "תצלום של קופסת ETB סגורה, Silver Tempest",
    altEn: "Photo of a sealed Silver Tempest elite trainer box",
  }),
  entry({
    id: "etb-rivals",
    kind: "etb",
    setId: "destined-rivals",
    set: "Scarlet & Violet: Destined Rivals",
    titleHe: "ETB, Destined Rivals",
    titleEn: "ETB, Destined Rivals",
    year: "2025",
    price: 500,
    image: "rivals-etb",
    altHe: "תצלום של קופסת ETB סגורה, Destined Rivals",
    altEn: "Photo of a sealed Destined Rivals elite trainer box",
  }),
  entry({
    id: "etb-journey",
    kind: "etb",
    setId: "journey-together",
    set: "Scarlet & Violet: Journey Together",
    titleHe: "ETB, Journey Together",
    titleEn: "ETB, Journey Together",
    year: "2025",
    price: 400,
    status: "sold",
    image: "journey-etb",
    altHe: "תצלום של קופסת ETB סגורה, Journey Together",
    altEn: "Photo of a sealed Journey Together elite trainer box",
  }),
  entry({
    id: "etb-sparks",
    kind: "etb",
    setId: "surging-sparks",
    set: "Scarlet & Violet: Surging Sparks",
    titleHe: "ETB, Surging Sparks",
    titleEn: "ETB, Surging Sparks",
    year: "2024",
    price: 400,
    status: "sold",
    image: "sparks-etb",
    altHe: "תצלום של קופסת ETB סגורה, Surging Sparks",
    altEn: "Photo of a sealed Surging Sparks elite trainer box",
  }),
  entry({
    id: "etb-paldean",
    kind: "etb",
    setId: "paldean-fates",
    set: "Scarlet & Violet: Paldean Fates",
    titleHe: "ETB, Paldean Fates",
    titleEn: "ETB, Paldean Fates",
    year: "2024",
    price: 1400,
    condition: "case",
    tagHe: "כולל אקריל",
    tagEn: "Acrylic included",
    notesHe: "כולל אקריל",
    notesEn: "Acrylic included",
    image: "paldean-etb",
    altHe: "תצלום של קופסת ETB סגורה, Paldean Fates, בתוך אקריליק",
    altEn: "Photo of a sealed Paldean Fates elite trainer box in an acrylic case",
  }),
  entry({
    id: "etb-151",
    kind: "etb",
    setId: "151",
    set: "Scarlet & Violet: 151",
    titleHe: "ETB, 151",
    titleEn: "ETB, 151",
    year: "2023",
    price: 1800,
    status: "sold",
    condition: "case",
    tagHe: "כולל אקריל",
    tagEn: "Acrylic included",
    notesHe: "כולל אקריל",
    notesEn: "Acrylic included",
    image: "etb-151",
    altHe: "תצלום של קופסת ETB סגורה, 151, בתוך אקריליק",
    altEn: "Photo of a sealed 151 elite trainer box in an acrylic case",
  }),
  entry({
    id: "etb-fusion",
    kind: "etb",
    setId: "fusion-strike",
    set: "Sword & Shield: Fusion Strike",
    titleHe: "ETB, Fusion Strike",
    titleEn: "ETB, Fusion Strike",
    year: "2021",
    price: 800,
    status: "sold",
    image: "fusion-etb",
    altHe: "תצלום של קופסת ETB סגורה, Fusion Strike",
    altEn: "Photo of a sealed Fusion Strike elite trainer box",
  }),
  entry({
    id: "etb-me-pair",
    kind: "etb",
    setId: "mega-evolution",
    set: "Mega Evolution",
    titleHe: "ETB, Mega Evolution, Lucario ו-Gardevoir",
    titleEn: "ETB, Mega Evolution, Lucario and Gardevoir",
    year: "2025",
    quantity: 2,
    price: 900,
    priceForAll: true,
    notesHe: "שתי הקופסאות נמכרות יחד, Lucario ו-Gardevoir. המחיר הוא לזוג.",
    notesEn: "The two boxes are sold together, Lucario and Gardevoir. The price is for the pair.",
    image: "me-etb-pair",
    altHe: "תצלום של שתי קופסאות ETB סגורות, Lucario ו-Gardevoir",
    altEn: "Photo of two sealed elite trainer boxes, Lucario and Gardevoir",
  }),
  entry({
    id: "etb-flare-bolt",
    kind: "etb",
    setId: "flare-bolt",
    set: "Scarlet & Violet: White Flare, Black Bolt",
    titleHe: "ETB, White Flare ו-Black Bolt",
    titleEn: "ETB, White Flare and Black Bolt",
    year: "2025",
    quantity: 2,
    price: 1000,
    priceForAll: true,
    notesHe: "שתי הקופסאות נמכרות יחד, White Flare ו-Black Bolt. המחיר הוא לזוג.",
    notesEn: "The two boxes are sold together, White Flare and Black Bolt. The price is for the pair.",
    image: "flare-bolt-etb",
    altHe: "תצלום של שתי קופסאות ETB סגורות, White Flare ו-Black Bolt",
    altEn: "Photo of two sealed elite trainer boxes, White Flare and Black Bolt",
  }),
  entry({
    id: "etb-prismatic",
    kind: "etb",
    setId: "prismatic-evolutions",
    set: "Scarlet & Violet: Prismatic Evolutions",
    titleHe: "ETB, Prismatic Evolutions",
    titleEn: "ETB, Prismatic Evolutions",
    year: "2025",
    price: 550,
    image: "prismatic-etb",
    altHe: "תצלום של קופסת ETB סגורה, Prismatic Evolutions",
    altEn: "Photo of a sealed Prismatic Evolutions elite trainer box",
  }),
  entry({
    id: "box-phantasmal",
    kind: "booster-box",
    setId: "phantasmal-flames",
    set: "Mega Evolution: Phantasmal Flames",
    titleHe: "בוסטר בוקס, Phantasmal Flames",
    titleEn: "Booster box, Phantasmal Flames",
    quantity: 2,
    price: 1400,
    image: "phantasmal-box",
    altHe: "תצלום של בוסטר בוקס סגור, Phantasmal Flames",
    altEn: "Photo of a sealed Phantasmal Flames booster box",
  }),
  entry({
    id: "box-inferno",
    kind: "booster-box",
    setId: "inferno-x",
    set: "Inferno X",
    titleHe: "בוסטר בוקס יפני, Inferno X",
    titleEn: "Japanese booster box, Inferno X",
    language: "ja",
    price: 450,
    image: "inferno-box",
    altHe: "תצלום של בוסטר בוקס יפני סגור, Inferno X",
    altEn: "Photo of a sealed Japanese Inferno X booster box",
  }),
  entry({
    id: "box-riftbound",
    kind: "booster-box",
    setId: "riftbound-origins",
    set: "Riftbound: Origins",
    titleHe: "בוסטר בוקס, Riftbound Origins",
    titleEn: "Booster box, Riftbound Origins",
    price: 700,
    image: "riftbound-box",
    altHe: "תצלום של בוסטר בוקס סגור, Riftbound Origins",
    altEn: "Photo of a sealed Riftbound Origins booster box",
    notesHe: "זה לא מוצר פוקימון. זה בוסטר בוקס של Riftbound, League of Legends. נשאר בגלריה כי הוא בתמונות.",
    notesEn: "This is not a Pokemon product. It is a Riftbound, League of Legends booster box. It stays in the gallery because it is in the photos.",
  }),
  entry({
    id: "blister-golduck",
    kind: "blister",
    setId: "mega-evolution",
    set: "Mega Evolution",
    titleHe: "בליסטר 3 חבילות, Golduck",
    titleEn: "3-pack blister, Golduck",
    year: "2025",
    price: 150,
    image: "golduck-blister",
    altHe: "תצלום של בליסטר סגור עם שלוש חבילות וכרטיס Golduck",
    altEn: "Photo of a sealed blister with three packs and a Golduck card",
    notesHe: "בליסטר עם כרטיס Golduck בחזית.",
    notesEn: "Blister with a Golduck card on the front.",
  }),
  entry({
    id: "blister-reuniclus",
    kind: "blister",
    setId: "black-bolt",
    set: "Scarlet & Violet: Black Bolt",
    titleHe: "בליסטר מדבקות, Reuniclus",
    titleEn: "Tech sticker blister, Reuniclus",
    year: "2025",
    price: 180,
    image: "reuniclus-sticker",
    altHe: "תצלום של בליסטר מדבקות סגור, Black Bolt, עם Reuniclus",
    altEn: "Photo of a sealed Black Bolt tech sticker blister with Reuniclus",
  }),
  entry({
    id: "packs-mega",
    kind: "pack",
    setId: "mega-evolution",
    set: "Mega Evolution",
    titleHe: "2 חבילות בוסטר סליב, Mega Evolution",
    titleEn: "2 sleeved booster packs, Mega Evolution",
    year: "2025",
    quantity: 2,
    price: 40,
    image: "me-packs",
    altHe: "תצלום של שתי חבילות בוסטר סליב סגורות, Mega Evolution",
    altEn: "Photo of two sealed sleeved Mega Evolution booster packs",
  }),
  entry({
    id: "packs-phantasmal",
    kind: "pack",
    setId: "phantasmal-flames",
    set: "Mega Evolution: Phantasmal Flames",
    titleHe: "2 חבילות בוסטר סליב, Phantasmal Flames",
    titleEn: "2 sleeved booster packs, Phantasmal Flames",
    quantity: 2,
    price: 50,
    image: "phantasmal-packs",
    altHe: "תצלום של שתי חבילות בוסטר סליב סגורות, Phantasmal Flames",
    altEn: "Photo of two sealed sleeved Phantasmal Flames booster packs",
  }),
  entry({
    id: "packs-evolving",
    kind: "pack",
    setId: "evolving-skies",
    set: "Sword & Shield: Evolving Skies",
    titleHe: "חבילות בוסטר סליב, Evolving Skies",
    titleEn: "Sleeved booster packs, Evolving Skies",
    year: "2021",
    price: 200,
    image: "evolving-packs",
    altHe: "תצלום של כמה חבילות בוסטר סליב סגורות, Evolving Skies",
    altEn: "Photo of several sealed sleeved Evolving Skies booster packs",
    notesHe: "המחיר הוא לחבילה. בתמונה יש קבוצת חבילות, כולל Umbreon, ומספרן המדויק לא ברור מהתמונה.",
    notesEn: "The price is per pack. The photo shows a group of packs, including Umbreon, and an exact count is not clear from the photo.",
  }),
  entry({
    id: "tin-ascended",
    kind: "mini-tin",
    setId: "ascended-heroes",
    set: "Mega Evolution: Ascended Heroes",
    titleHe: "מיני טין, Ascended Heroes",
    titleEn: "Mini tin, Ascended Heroes",
    quantity: 3,
    price: 110,
    image: "mini-tins",
    altHe: "תצלום של שלושה מיני טינים, Ascended Heroes",
    altEn: "Photo of three Ascended Heroes mini tins",
    notesHe: "שלושה מיני טינים באותו סט: Zorua, Riolu ו-Togepi. רשומה אחת לשלושתם. המחיר הוא לטין.",
    notesEn: "Three mini tins from the same set: Zorua, Riolu, and Togepi. One listing for all three. The price is per tin.",
  }),
  entry({
    id: "tin-prismatic",
    kind: "mini-tin",
    setId: "prismatic-evolutions",
    set: "Scarlet & Violet: Prismatic Evolutions",
    titleHe: "מיני טין, Prismatic Evolutions",
    titleEn: "Mini tin, Prismatic Evolutions",
    year: "2025",
    price: 130,
    image: "espeon-tin",
    altHe: "תצלום של מיני טין סגור, Prismatic Evolutions",
    altEn: "Photo of a sealed Prismatic Evolutions mini tin",
  }),
  entry({
    id: "bundle-mega",
    kind: "bundle",
    setId: "mega-evolution",
    set: "Mega Evolution",
    titleHe: "באנדל 6 חבילות, Mega Evolution",
    titleEn: "6-pack booster bundle, Mega Evolution",
    year: "2025",
    price: 250,
    image: "me-bundle",
    altHe: "תצלום של באנדל סגור, Mega Evolution, שש חבילות",
    altEn: "Photo of a sealed Mega Evolution booster bundle of six packs",
  }),
  entry({
    id: "box-emboar",
    kind: "collection",
    setId: "ascended-heroes",
    set: "Mega Evolution: Ascended Heroes",
    titleHe: "מארז Mega Emboar ex",
    titleEn: "Mega Emboar ex Box",
    quantity: 4,
    price: 250,
    image: "emboar-box",
    altHe: "תצלום של מארז סגור, Mega Emboar ex Box",
    altEn: "Photo of a sealed Mega Emboar ex Box",
    notesHe: "ארבעה מארזים. המחיר הוא למארז.",
    notesEn: "Four boxes. The price is per box.",
  }),
  entry({
    id: "binder-prismatic",
    kind: "collection",
    setId: "prismatic-evolutions",
    set: "Scarlet & Violet: Prismatic Evolutions",
    titleHe: "מארז קלסר, Prismatic Evolutions",
    titleEn: "Binder collection, Prismatic Evolutions",
    year: "2025",
    price: 350,
    image: "prismatic-binder",
    altHe: "תצלום של מארז קלסר סגור, Prismatic Evolutions",
    altEn: "Photo of a sealed Prismatic Evolutions binder collection",
  }),
  entry({
    id: "build-mega",
    kind: "collection",
    setId: "mega-evolution",
    set: "Mega Evolution",
    titleHe: "Build & Battle, Mega Evolution",
    titleEn: "Build & Battle, Mega Evolution",
    year: "2025",
    price: 200,
    image: "me-build",
    altHe: "תצלום של קופסת Build and Battle סגורה, Mega Evolution",
    altEn: "Photo of a sealed Mega Evolution Build and Battle box",
  }),
  entry({
    id: "kingdra-collection",
    kind: "collection",
    setId: "shrouded-fable",
    set: "Scarlet & Violet: Shrouded Fable",
    titleHe: "מארז איור, Kingdra ex",
    titleEn: "Illustration collection, Kingdra ex",
    year: "2024",
    quantity: 4,
    price: 600,
    image: "kingdra-collection",
    altHe: "תצלום של מארז איור סגור, Shrouded Fable, Kingdra ex",
    altEn: "Photo of a sealed Shrouded Fable Kingdra ex illustration collection",
    notesHe: "ארבעה מארזים. המחיר הוא למארז.",
    notesEn: "Four boxes. The price is per box.",
  }),
  entry({
    id: "pc-specials",
    kind: "collection",
    setId: "pokemon-center",
    set: "Pokemon Center Special Box",
    titleHe: "ספיישל בוקס, פוקואוקה, טוהוקו והירושימה",
    titleEn: "Special boxes, Fukuoka, Tohoku, and Hiroshima",
    language: "ja",
    quantity: 3,
    price: 2000,
    priceForAll: true,
    condition: "case",
    tagHe: "כולל אקריל",
    tagEn: "Acrylic included",
    image: "pc-specials",
    altHe: "תצלום של שלוש קופסאות ספיישל יפניות בתוך אקריליק: פוקואוקה, טוהוקו והירושימה",
    altEn: "Photo of three Japanese special boxes in acrylic: Fukuoka, Tohoku, and Hiroshima",
    notesHe: "שלוש הקופסאות נמכרות יחד, פוקואוקה, טוהוקו והירושימה. כולל אקריל. המחיר הוא לשלושתן.",
    notesEn: "The three boxes are sold together: Fukuoka, Tohoku, and Hiroshima. Acrylic included. The price is for all three.",
  }),
]
