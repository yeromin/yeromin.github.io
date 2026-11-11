import { normalize } from "./catalog.js?v=4";
import { language } from "../assets/i18n.js";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const ukrainianCountries = new Intl.DisplayNames(["uk"], { type: "region" });
const ukrainianNames = {
  PL: {
    "Białystok": "Білосток", "Bydgoszcz": "Бидгощ", "Częstochowa": "Ченстохова",
    "Gdańsk": "Гданськ", "Gdynia": "Гдиня", "Katowice": "Катовіце", "Kielce": "Кельці",
    "Kraków": "Краків", "Lublin": "Люблін", "Łódź": "Лодзь", "Otwock": "Отвоцьк",
    "Piaseczno": "Пясечно", "Poznań": "Познань", "Pruszków": "Прушкув", "Płock": "Плоцьк",
    "Puławy": "Пулави", "Radom": "Радом", "Rzeszów": "Ряшів", "Siedlce": "Седльці",
    "Szczecin": "Щецин", "Toruń": "Торунь", "Warszawa": "Варшава", "Wrocław": "Вроцлав",
    "Zakopane": "Закопане", "Żyrardów": "Жирардув",
  },
  AT: { Vienna: "Відень" },
  BY: { Minsk: "Мінськ" },
  CZ: { Prague: "Прага" },
  DE: { Berlin: "Берлін" },
  FR: { Paris: "Париж" },
  GB: { London: "Лондон" },
  GR: { Athens: "Афіни" },
  HU: { Budapest: "Будапешт" },
  IT: { Rome: "Рим" },
  LT: { Vilnius: "Вільнюс" },
  SK: { Bratislava: "Братислава" },
  UA: { Kyiv: "Київ", Lviv: "Львів", Odesa: "Одеса", Kharkiv: "Харків", Dnipro: "Дніпро" },
};

let cityData;

function cityKey(value) {
  return normalize(value).replace(/[^\p{L}\p{N}]/gu, "");
}

function loadCities() {
  cityData ??= fetch(new URL("./data/cities.json", import.meta.url)).then(response => {
    if (!response.ok) throw new Error("Unable to load cities");
    return response.json();
  }).catch(error => {
    cityData = undefined;
    throw error;
  });
  return cityData;
}

export async function findCities(query) {
  const [searchName, ...qualifiers] = query.split(",").map(cityKey);
  if (!searchName) return [];

  const matches = [];
  for (const [name, code, region, lat, lon, aliases = []] of await loadCities()) {
    const ukrainianName = ukrainianNames[code]?.[name];
    if (![name, ukrainianName, ...aliases].some(alias => alias && cityKey(alias) === searchName)) continue;

    const country = countryNames.of(code);
    const ukrainianCountry = ukrainianCountries.of(code);
    const areaKeys = [...region.split(","), code, ...country.split(","), ...ukrainianCountry.split(",")].map(cityKey);
    if (!qualifiers.every(qualifier => !qualifier || areaKeys.includes(qualifier))) continue;

    const label = [name, region, country].filter(Boolean).join(", ");
    const displayLabel = language === "uk"
      ? [ukrainianName ?? name, region, ukrainianCountry].filter(Boolean).join(", ")
      : label;
    matches.push({ name, label, displayLabel, pin: [lat, lon] });
  }
  return matches;
}

export function cityNameForDisplay(city, name) {
  if (language === "en") return name;
  const country = city.split(", ").at(-1);
  for (const [code, names] of Object.entries(ukrainianNames)) {
    if (countryNames.of(code) === country) return names[name] ?? name;
  }
  return name;
}
