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

const COUNTRY_TABLE: Array<[string, string]> = [
  ["Argentina", "AR"],
  ["Bolivia", "BO"],
  ["Brazil", "BR"],
  ["Chile", "CL"],
  ["Colombia", "CO"],
  ["Ecuador", "EC"],
  ["Paraguay", "PY"],
  ["Peru", "PE"],
  ["Uruguay", "UY"],
  ["Venezuela", "VE"],
  ["Albania", "AL"],
  ["Andorra", "AD"],
  ["Austria", "AT"],
  ["Belarus", "BY"],
  ["Belgium", "BE"],
  ["Bosnia and Herzegovina", "BA"],
  ["Bulgaria", "BG"],
  ["Croatia", "HR"],
  ["Cyprus", "CY"],
  ["Czech Republic", "CZ"],
  ["Denmark", "DK"],
  ["Estonia", "EE"],
  ["Finland", "FI"],
  ["France", "FR"],
  ["Georgia", "GE"],
  ["Germany", "DE"],
  ["Greece", "GR"],
  ["Hungary", "HU"],
  ["Iceland", "IS"],
  ["Ireland", "IE"],
  ["Italy", "IT"],
  ["Kosovo", "XK"],
  ["Latvia", "LV"],
  ["Lithuania", "LT"],
  ["Luxembourg", "LU"],
  ["Malta", "MT"],
  ["Moldova", "MD"],
  ["Montenegro", "ME"],
  ["Netherlands", "NL"],
  ["North Macedonia", "MK"],
  ["Norway", "NO"],
  ["Poland", "PL"],
  ["Portugal", "PT"],
  ["Romania", "RO"],
  ["Russia", "RU"],
  ["Serbia", "RS"],
  ["Slovakia", "SK"],
  ["Slovenia", "SI"],
  ["Spain", "ES"],
  ["Sweden", "SE"],
  ["Switzerland", "CH"],
  ["Turkey", "TR"],
  ["Ukraine", "UA"],
  ["United Kingdom", "GB"],
  ["Canada", "CA"],
  ["Costa Rica", "CR"],
  ["Cuba", "CU"],
  ["El Salvador", "SV"],
  ["Guatemala", "GT"],
  ["Haiti", "HT"],
  ["Honduras", "HN"],
  ["Jamaica", "JM"],
  ["Mexico", "MX"],
  ["Panama", "PA"],
  ["Trinidad and Tobago", "TT"],
  ["United States", "US"],
  ["Algeria", "DZ"],
  ["Angola", "AO"],
  ["Burkina Faso", "BF"],
  ["Cameroon", "CM"],
  ["Cape Verde", "CV"],
  ["Congo", "CG"],
  ["DR Congo", "CD"],
  ["Egypt", "EG"],
  ["Ethiopia", "ET"],
  ["Gabon", "GA"],
  ["Ghana", "GH"],
  ["Guinea", "GN"],
  ["Ivory Coast", "CI"],
  ["Kenya", "KE"],
  ["Mali", "ML"],
  ["Mauritania", "MR"],
  ["Morocco", "MA"],
  ["Nigeria", "NG"],
  ["Senegal", "SN"],
  ["South Africa", "ZA"],
  ["Tunisia", "TN"],
  ["Uganda", "UG"],
  ["Zambia", "ZM"],
  ["Zimbabwe", "ZW"],
  ["Australia", "AU"],
  ["Bahrain", "BH"],
  ["China", "CN"],
  ["India", "IN"],
  ["Indonesia", "ID"],
  ["Iran", "IR"],
  ["Iraq", "IQ"],
  ["Japan", "JP"],
  ["Jordan", "JO"],
  ["Kuwait", "KW"],
  ["Lebanon", "LB"],
  ["Malaysia", "MY"],
  ["North Korea", "KP"],
  ["Oman", "OM"],
  ["Palestine", "PS"],
  ["Philippines", "PH"],
  ["Qatar", "QA"],
  ["Saudi Arabia", "SA"],
  ["Singapore", "SG"],
  ["South Korea", "KR"],
  ["Syria", "SY"],
  ["Thailand", "TH"],
  ["United Arab Emirates", "AE"],
  ["Uzbekistan", "UZ"],
  ["Vietnam", "VN"],
  ["New Zealand", "NZ"],
];

const ALIASES: Record<string, string> = {
  brasil: "BR",
  holland: "NL",
  usa: "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  "great britain": "GB",
  britain: "GB",
  "northern ireland": "GB",
  "republic of ireland": "IE",
  korea: "KR",
  "korea republic": "KR",
  "republic of korea": "KR",
  "korea dpr": "KP",
  uae: "AE",
  "cote divoire": "CI",
  czechia: "CZ",
  turkiye: "TR",
  bosnia: "BA",
  macedonia: "MK",
  "democratic republic of the congo": "CD",
};

const SPECIAL_FLAGS: Record<string, string> = {
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

const NAME_TO_ISO: Record<string, string> = Object.fromEntries([
  ...COUNTRY_TABLE.map(([name, iso]) => [normalize(name), iso]),
  ...Object.entries(ALIASES).map(([alias, iso]) => [normalize(alias), iso]),
]);

export interface Country {
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  ...COUNTRY_TABLE.map(([name, iso]) => ({ name, flag: isoToFlag(iso) })),
  { name: "England", flag: SPECIAL_FLAGS.england },
  { name: "Scotland", flag: SPECIAL_FLAGS.scotland },
  { name: "Wales", flag: SPECIAL_FLAGS.wales },
].sort((a, b) => a.name.localeCompare(b.name));

export function flagForCountry(name: string): string | null {
  const key = normalize(name);
  if (!key) return null;
  if (key in SPECIAL_FLAGS) return SPECIAL_FLAGS[key];
  const iso = NAME_TO_ISO[key];
  return iso ? isoToFlag(iso) : null;
}

export function searchCountries(query: string, limit = 6): Country[] {
  const q = normalize(query);
  if (!q) return [];
  const starts: Country[] = [];
  const contains: Country[] = [];
  for (const country of COUNTRIES) {
    const n = normalize(country.name);
    if (n.startsWith(q)) starts.push(country);
    else if (n.includes(q)) contains.push(country);
  }
  return [...starts, ...contains].slice(0, limit);
}
