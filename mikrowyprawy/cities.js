import { normalize } from "./catalog.js";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
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
    if (cityKey(name) !== searchName && !aliases.some(alias => cityKey(alias) === searchName)) continue;

    const country = countryNames.of(code);
    const areaKeys = [...region.split(","), code, ...country.split(",")].map(cityKey);
    if (!qualifiers.every(qualifier => !qualifier || areaKeys.includes(qualifier))) continue;

    const label = [name, region, country].filter(Boolean).join(", ");
    matches.push({ name, label, pin: [lat, lon] });
  }
  return matches;
}
