const NAME_TO_ISO: Record<string, string> = {
  // South America
  brazil: "BR",
  brasil: "BR",
  argentina: "AR",
  uruguay: "UY",
  colombia: "CO",
  chile: "CL",
  peru: "PE",
  ecuador: "EC",
  paraguay: "PY",
  bolivia: "BO",
  venezuela: "VE",

  // Europe
  france: "FR",
  spain: "ES",
  germany: "DE",
  portugal: "PT",
  netherlands: "NL",
  holland: "NL",
  italy: "IT",
  belgium: "BE",
  croatia: "HR",
  denmark: "DK",
  switzerland: "CH",
  poland: "PL",
  sweden: "SE",
  norway: "NO",
  austria: "AT",
  serbia: "RS",
  ukraine: "UA",
  "czech republic": "CZ",
  czechia: "CZ",
  turkey: "TR",
  turkiye: "TR",
  greece: "GR",
  russia: "RU",
  ireland: "IE",
  "republic of ireland": "IE",
  "northern ireland": "GB",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  hungary: "HU",
  romania: "RO",
  iceland: "IS",
  finland: "FI",
  slovakia: "SK",
  slovenia: "SI",
  bulgaria: "BG",
  "bosnia and herzegovina": "BA",
  bosnia: "BA",
  "north macedonia": "MK",
  macedonia: "MK",
  albania: "AL",
  georgia: "GE",
  luxembourg: "LU",
  montenegro: "ME",
  kosovo: "XK",
  cyprus: "CY",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  belarus: "BY",
  moldova: "MD",
  malta: "MT",
  andorra: "AD",

  // North & Central America, Caribbean
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  america: "US",
  mexico: "MX",
  canada: "CA",
  "costa rica": "CR",
  jamaica: "JM",
  honduras: "HN",
  panama: "PA",
  "el salvador": "SV",
  guatemala: "GT",
  "trinidad and tobago": "TT",
  haiti: "HT",
  cuba: "CU",

  // Africa
  nigeria: "NG",
  senegal: "SN",
  egypt: "EG",
  morocco: "MA",
  cameroon: "CM",
  ghana: "GH",
  "ivory coast": "CI",
  "cote divoire": "CI",
  algeria: "DZ",
  tunisia: "TN",
  "south africa": "ZA",
  mali: "ML",
  "dr congo": "CD",
  "democratic republic of the congo": "CD",
  congo: "CG",
  "burkina faso": "BF",
  kenya: "KE",
  ethiopia: "ET",
  guinea: "GN",
  gabon: "GA",
  angola: "AO",
  zambia: "ZM",
  zimbabwe: "ZW",
  uganda: "UG",
  "cape verde": "CV",
  mauritania: "MR",

  // Asia
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  "korea republic": "KR",
  "republic of korea": "KR",
  "north korea": "KP",
  australia: "AU",
  iran: "IR",
  "saudi arabia": "SA",
  qatar: "QA",
  iraq: "IQ",
  "united arab emirates": "AE",
  uae: "AE",
  china: "CN",
  india: "IN",
  uzbekistan: "UZ",
  jordan: "JO",
  bahrain: "BH",
  kuwait: "KW",
  oman: "OM",
  syria: "SY",
  lebanon: "LB",
  vietnam: "VN",
  thailand: "TH",
  indonesia: "ID",
  malaysia: "MY",
  philippines: "PH",
  singapore: "SG",
  palestine: "PS",

  // Oceania
  "new zealand": "NZ",
};

const SPECIAL_FLAGS: Record<string, string> = {
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['.]/g, "")
    .replace(/\s+/g, " ");
}

function isoToFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function flagForCountry(name: string): string | null {
  const key = normalize(name);
  if (!key) return null;
  if (key in SPECIAL_FLAGS) return SPECIAL_FLAGS[key];
  const iso = NAME_TO_ISO[key];
  return iso ? isoToFlag(iso) : null;
}
