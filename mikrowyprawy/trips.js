import { formatCount, formatDate, formatNumber, language, t, wireLanguageSwitch } from "../assets/i18n.js?v=6";
import { ageLabel, catalogCopy, catalogLabel, externalLink, loadCatalog, loadCatalogTranslation, normalize } from "./catalog.js?v=6";
import { cityNameForDisplay, countryLabel, findCities } from "./cities.js?v=6";
import { createBatchRenderer } from "./batch-list.js";

const defaultStart = { name: "Warsaw centre", pin: [52.2297, 21.0122] };
const startKey = "mikrowyprawy.start";
const verifiedStatuses = new Set(["Open to visitors", "Open by booking / schedule"]);
const statusLabels = new Map([
  ["Open by booking / schedule", "Booking or schedule"],
  ["Exterior / public route", "Exterior or public route"],
  ["Seasonal / check dates", "Seasonal"],
  ["Check event access", "Check event access"],
]);
const activityImages = new Map([
  ["Animals & farms", "farm"],
  ["Architecture & city walk", "city"],
  ["Art & exhibitions", "gallery"],
  ["Beach & water", "water"],
  ["Castle, palace & heritage", "castle"],
  ["Events & festivals", "stage"],
  ["Family play", "playground"],
  ["Food & drink", "cafe"],
  ["Gardens & flowers", "garden"],
  ["Hands-on workshops", "workshop"],
  ["Historic site & ruins", "castle"],
  ["Kayaking", "kayak"],
  ["Markets & vintage", "vintage"],
  ["Museum & history", "museum"],
  ["Nature walk & hiking", "hiking"],
  ["Park & playground", "playground"],
  ["Pools & water parks", "water"],
  ["Scenic transport", "rail"],
  ["Science & discovery", "science"],
  ["Seasonal farm", "farm"],
  ["Shopping & vintage", "vintage"],
  ["Sport & adventure", "adventure"],
  ["Stay & accommodation", "lodging"],
  ["Theatre & performances", "stage"],
  ["Theme & adventure park", "playground"],
  ["Viewpoint", "hiking"],
  ["Wellness", "lodging"],
]);
const collator = new Intl.Collator("pl");

const $ = selector => document.querySelector(selector);
const filterForm = $("#filters");
const fields = Object.fromEntries([...filterForm.elements].map(field => [field.name, field]));
const renderCards = createBatchRenderer($("#places"), 24, createCard);
const placeDialog = $("#place-dialog");
const startDialog = $("#start-dialog");
const startForm = $("#custom-start");
const scopes = [...document.querySelectorAll("[data-scope]")];

let start = readStart();
let scope = "verified";
let places = [];
let postsByNumber = new Map();
let checkedOn;
let loadFailed = false;

function validPin(pin) {
  return Array.isArray(pin) && pin.length === 2 && pin.every(Number.isFinite)
    && Math.abs(pin[0]) <= 90 && Math.abs(pin[1]) <= 180;
}

function readStart() {
  try {
    const saved = JSON.parse(localStorage.getItem(startKey));
    if (saved && validPin(saved.pin)) {
      if (typeof saved.city === "string" && saved.city && typeof saved.name === "string") {
        return { name: saved.name, pin: saved.pin, city: saved.city };
      }
      const name = saved.name === "Current location" ? "Current location" : "Home";
      return { name, pin: saved.pin };
    }
  } catch {
    // The default also works when browser storage is unavailable.
  }
  return defaultStart;
}

function radians(value) {
  return value * Math.PI / 180;
}

function distanceBetween([startLat, startLon], [endLat, endLon]) {
  const latTerm = Math.sin(radians(endLat - startLat) / 2);
  const lonTerm = Math.sin(radians(endLon - startLon) / 2);
  const a = latTerm ** 2 + Math.cos(radians(startLat)) * Math.cos(radians(endLat)) * lonTerm ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function startLabel() {
  if (start === defaultStart) return t("warsawCentre");
  if (start.city) {
    const name = start.name.replace(/ centre$/u, "");
    return t("cityCentre", cityNameForDisplay(start.city, name));
  }
  return t(start.name === "Current location" ? "currentLocation" : "homeOrigin");
}

function updateDistances() {
  $("#start-name").textContent = startLabel();
  for (const place of places) {
    place.distance = place.pin ? distanceBetween(start.pin, place.pin) : Infinity;
  }
}

function formatDistance(place) {
  const { distance } = place;
  if (!Number.isFinite(distance)) return "";
  const estimate = place.geo?.precision === "area";
  if (estimate && distance < 1) return "≈ 0–1 " + t("km");
  const value = distance < 20 && !estimate ? distance : Math.round(distance);
  return (estimate ? "≈ " : "") + formatNumber(value) + " " + t("km");
}

function titleFor(place) {
  return place.name.replace(/,?\s+Warszawa$/u, "");
}

function fillSelect(select, entries) {
  for (const [value, label] of entries) select.add(new Option(label, value));
}

function updateOptions(select, entries) {
  const value = select.value;
  select.length = 1;
  fillSelect(select, entries);
  select.value = value;
}

function statusLabel(value) {
  return language === "uk" ? catalogLabel(value) : statusLabels.get(value) ?? value;
}

function setupOptions() {
  const compare = language === "uk" ? new Intl.Collator("uk").compare : collator.compare;
  const activities = [...new Set(places.map(place => place.activity))].map(value => [value, catalogLabel(value)]);
  updateOptions(fields.activity, activities.sort((a, b) => compare(a[1], b[1])));
  updateOptions(fields.age, Array.from({ length: 19 }, (_, age) => [
    age, age === 0 ? t("underOne") : age === 18 ? t("adult") : t("ageOption", age),
  ]));
  const statuses = [...new Set(places.map(place => place.status))].map(value => [value, statusLabel(value)]);
  const statusOrder = language === "uk" ? 1 : 0;
  updateOptions(fields.status, statuses.sort((a, b) => compare(a[statusOrder], b[statusOrder])));
  for (const option of [...fields.setting.options].slice(1)) option.textContent = catalogLabel(option.value);
  for (const option of [...fields.within.options].slice(1)) {
    option.textContent = t("within", formatNumber(Number(option.value)) + " " + t("km"));
  }
}

function filterResults({ q, activity, setting, age, within, pin, status, poland }) {
  const terms = normalize(q).split(/\s+/u).filter(Boolean);
  const chosenAge = age === "" ? null : Number(age);
  const maxDistance = within === "" ? Infinity : Number(within);
  const order = $("#sort-order").value;
  const matches = places.filter(place =>
    (scope === "all" || verifiedStatuses.has(place.status))
    && (!poland || place.country === "PL")
    && (!status || place.status === status)
    && (!activity || place.activity === activity)
    && (!setting || place.setting === setting)
    && (chosenAge === null || (chosenAge >= place.minAge && chosenAge <= (place.maxAge ?? Infinity)))
    && (!pin || (place.pin && (place.geo?.precision ?? "place") === pin))
    && place.distance <= maxDistance
    && terms.every(term => place.keywords.includes(term))
  );

  return matches.sort((a, b) => {
    if (order === "near" && a.distance !== b.distance) return a.distance - b.distance;
    if (order === "recent" && a.posts[0] !== b.posts[0]) return a.posts[0] - b.posts[0];
    return collator.compare(a.name, b.name);
  });
}

function tag(text, className, setting) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  if (setting) span.dataset.setting = setting;
  return span;
}

function createCard(place) {
  const card = $("#place-card").content.firstElementChild.cloneNode(true);
  const thumbnail = card.querySelector(".place-photo");
  if (thumbnail) {
    const category = activityImages.get(place.activity) ?? "hiking";
    const showCategoryImage = () => {
      thumbnail.alt = "";
      thumbnail.title = t("categoryPhoto");
      thumbnail.src = new URL(`./images/${category}.jpg`, import.meta.url).href;
    };
    if (place.photo) {
      thumbnail.alt = t("photoOf", place.name);
      thumbnail.addEventListener("error", showCategoryImage, { once: true });
      thumbnail.src = new URL(`./images/places/${place.photo.file}`, import.meta.url).href;
    } else {
      showCategoryImage();
    }
  }
  const tags = card.querySelector(".place-tags");
  tags.append(tag(catalogLabel(place.setting), "place-tag", place.setting), tag(ageLabel(place), "place-tag age-tag"));
  const distance = card.querySelector(".place-distance");
  distance.textContent = formatDistance(place);
  if (place.geo?.precision === "area") distance.title = t("areaEstimate") + " · " + place.geo.name;
  card.querySelector(".place-context").textContent = catalogLabel(place.activity) + " · " + catalogLabel(place.area);
  card.querySelector("h3").textContent = titleFor(place);
  card.querySelector(".place-description").textContent = catalogCopy(place.description);
  if (place.status !== "Open to visitors") {
    const status = document.createElement("p");
    status.className = "place-status";
    status.textContent = statusLabel(place.status);
    card.querySelector(".place-text").append(status);
  }
  card.querySelector(".map-link").href = place.mapTarget;
  card.querySelector(".details-label").textContent = t("details");
  card.querySelector(".details-button").addEventListener("click", () => showDetails(place));
  return card;
}

function renderResults() {
  const filters = Object.fromEntries(new FormData(filterForm));
  const matches = filterResults(filters);
  const count = matches.length;
  $("#result-count").textContent = formatCount(count, "placeCount");
  const notes = scope === "verified" ? [t("accessChecked", formatDate(checkedOn))] : [];
  const missingPins = matches.filter(place => !place.pin).length;
  if (missingPins) notes.push(t("missingPins", formatNumber(missingPins)));
  $("#result-note").textContent = notes.join(" ");
  $("#empty-places").hidden = count !== 0;
  $("#clear-filters").hidden = !Object.values(filters).some(Boolean);
  renderCards(matches);
}

function detailRow(label, value) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const detail = document.createElement("dd");
  term.textContent = label;
  detail.textContent = value;
  wrapper.append(term, detail);
  return wrapper;
}

function showDetails(place) {
  $("#place-title").textContent = place.name;
  const description = document.createElement("p");
  description.textContent = catalogCopy(place.description);

  const meta = document.createElement("dl");
  meta.className = "detail-meta";
  meta.append(
    detailRow(t("visitStatus"), catalogLabel(place.status)),
    detailRow(t("ages"), ageLabel(place)),
    detailRow(t("activity"), catalogLabel(place.activity)),
    detailRow(t("setting"), catalogLabel(place.setting)),
    detailRow(t("area"), catalogLabel(place.area)),
    detailRow(t("country"), place.country ? countryLabel(place.country) : t("unavailable")),
    detailRow(t("distanceFrom", startLabel()), formatDistance(place) || t("unavailable")),
  );
  if (place.geo) {
    const label = t(place.geo.precision === "area" ? "areaEstimate" : "pin");
    meta.append(detailRow(label, place.geo.name));
  }

  const body = $("#place-details");
  body.replaceChildren(description, meta);
  if (place.photo) {
    const { author, title, source, license, licenseUrl } = place.photo;
    const credit = document.createElement("p");
    credit.className = "detail-section";
    credit.append(
      t("photoBy", author), " · ", externalLink(title, source),
      " · ", externalLink(license, licenseUrl), " · ", t("croppedThumbnail"),
    );
    body.append(credit);
  }
  if (place.access) {
    const access = document.createElement("p");
    access.textContent = catalogCopy(place.access);
    body.append(access);
  }

  const sources = document.createElement("div");
  sources.className = "detail-links";
  const mapLabel = place.mapTarget === place.map && !place.map.includes("?cid=") ? t("mapsSearch") : "Google Maps";
  sources.append(externalLink(mapLabel + " ↗", place.mapTarget, "button button-primary"));
  if (place.geo) {
    if (place.geo.precision === "area") {
      sources.append(externalLink(t("viewAreaPin") + " ↗", mapsPin(place.pin)));
    } else if (place.mapTarget !== place.map) {
      sources.append(externalLink(t("searchByName") + " ↗", place.map));
    }
    sources.append(externalLink(place.geo.source + " ↗", place.geo.url));
  }
  if (place.evidence) {
    const checked = document.createElement("p");
    checked.textContent = t("checked", formatDate(place.checked));
    sources.append(externalLink(t("visitSource") + " ↗", place.evidence), checked);
  }
  body.append(sources);

  const sourcePosts = document.createElement("section");
  sourcePosts.className = "detail-section";
  const postsHeading = document.createElement("h3");
  postsHeading.textContent = t("instagramPosts");
  const postLinks = document.createElement("ul");
  postLinks.className = "detail-posts";
  for (const number of place.posts) {
    const li = document.createElement("li");
    li.append(externalLink(t("postNumber", number) + " ↗", postsByNumber.get(number).url));
    postLinks.append(li);
  }
  sourcePosts.append(postsHeading, postLinks);
  body.append(sourcePosts);
  placeDialog.showModal();
}

function selectScope(nextScope) {
  scope = nextScope;
  for (const button of scopes) button.setAttribute("aria-pressed", String(button.dataset.scope === scope));
  $("#status-field").hidden = scope === "verified";
  if (scope === "verified") fields.status.value = "";
  renderResults();
}

function selectStart(nextStart = defaultStart) {
  start = nextStart;
  try {
    if (start === defaultStart) localStorage.removeItem(startKey);
    else localStorage.setItem(startKey, JSON.stringify(start));
  } catch {
    // Keep the origin in memory if browser storage is unavailable.
  }
  updateDistances();
  renderResults();
  startDialog.close();
}

function wireStartingPoint() {
  const message = $("#start-message");
  const useLocation = $("#use-location");
  const origin = startForm.elements.origin;
  const citySelect = startForm.elements.city;
  const cityField = citySelect.closest("label");
  const save = startForm.querySelector("button[type=submit]");
  let cities = [];
  let request = 0;

  function resetLookup() {
    request++;
    cities = [];
    cityField.hidden = true;
    citySelect.disabled = true;
    save.disabled = false;
    useLocation.disabled = false;
    message.textContent = "";
  }

  function beginLookup(status) {
    save.disabled = true;
    useLocation.disabled = true;
    message.textContent = status;
    return ++request;
  }

  function finishLookup(id) {
    if (id !== request || !startDialog.open) return false;
    save.disabled = false;
    useLocation.disabled = false;
    return true;
  }

  function saveCity({ name, label, pin }) {
    selectStart({ name: name + " centre", pin, city: label });
  }

  $("#open-start").addEventListener("click", () => {
    resetLookup();
    origin.value = start.city ?? (start === defaultStart ? "" : start.pin.join(", "));
    startDialog.showModal();
  });
  origin.addEventListener("input", resetLookup);

  startForm.addEventListener("submit", async event => {
    event.preventDefault();
    const chosenCity = cities[citySelect.value];
    if (chosenCity) {
      saveCity(chosenCity);
      return;
    }

    const value = origin.value.trim();
    if (!value) {
      message.textContent = t("enterOrigin");
      return;
    }
    const parts = value.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*,\s*|\s+)([+-]?\d+(?:\.\d+)?)$/u);
    if (parts) {
      const pin = parts.slice(1).map(Number);
      if (validPin(pin)) selectStart({ name: "Home", pin });
      else message.textContent = t("badCoords");
      return;
    }

    const lookup = beginLookup(t("findingCity"));
    let results;
    try {
      results = await findCities(value);
    } catch {
      if (finishLookup(lookup)) message.textContent = t("citySearchError");
      return;
    }
    if (!finishLookup(lookup)) return;
    if (results.length === 1) {
      saveCity(results[0]);
    } else if (results.length) {
      cities = results;
      citySelect.replaceChildren(new Option(t("chooseCity"), ""));
      fillSelect(citySelect, cities.map((city, index) => [index, city.displayLabel]));
      citySelect.disabled = false;
      cityField.hidden = false;
      citySelect.focus();
      message.textContent = t("confirmCity");
    } else {
      message.textContent = t("cityNotFound");
    }
  });

  useLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      message.textContent = t("locationError");
      return;
    }
    const lookup = beginLookup(t("locating"));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (finishLookup(lookup)) selectStart({ name: "Current location", pin: [coords.latitude, coords.longitude] });
      },
      () => {
        if (finishLookup(lookup)) message.textContent = t("locationError");
      },
      { timeout: 10000 },
    );
  });

  $("#reset-start").addEventListener("click", () => selectStart());
}

function mapsPin(pin) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(pin.join(","));
}

async function renderLanguage() {
  $("#start-name").textContent = startLabel();
  if (!checkedOn) {
    $("#result-count").textContent = t(loadFailed ? "placeLoadError" : "loadingPlaces");
    $("#result-note").textContent = loadFailed ? t("refresh") : "";
    return;
  }
  const selectedLanguage = language;
  await loadCatalogTranslation();
  if (language !== selectedLanguage) return;
  setupOptions();
  for (const place of places) {
    place.keywords = normalize([
      place.name, place.area, place.activity, place.description, place.geo?.name,
      catalogLabel(place.area), catalogLabel(place.activity), catalogCopy(place.description),
    ].join(" "));
  }
  renderResults();
}

async function init() {
  const photosRequest = fetch(new URL("./data/place-photos.json?v=1", import.meta.url))
    .then(response => response.ok ? response.json() : {})
    .catch(() => ({}));
  const [catalog, pinResponse, photos] = await Promise.all([
    loadCatalog(), fetch(new URL("./data/place-pins.json?v=5", import.meta.url)), photosRequest,
  ]);
  if (!pinResponse.ok) throw new Error("Unable to load place pins");
  const pins = await pinResponse.json();
  checkedOn = catalog.checkedOn;
  postsByNumber = new Map(catalog.posts.map(post => [post.number, post]));
  places = catalog.places.map(place => {
    const geo = pins[place.id];
    return {
      ...place,
      geo,
      photo: photos[place.id],
      pin: geo?.coordinates ?? place.pin,
      mapTarget: geo?.precision === "place" ? mapsPin(geo.coordinates) : place.map,
    };
  });
  updateDistances();
  await renderLanguage();

  for (const button of scopes) button.addEventListener("click", () => selectScope(button.dataset.scope));
  filterForm.addEventListener("submit", event => event.preventDefault());
  filterForm.addEventListener("input", renderResults);
  fields.poland.addEventListener("input", renderResults);
  $("#sort-order").addEventListener("change", renderResults);
  $("#clear-filters").addEventListener("click", () => {
    filterForm.reset();
    renderResults();
    fields.q.focus();
  });
  wireStartingPoint();
}

wireLanguageSwitch(renderLanguage);
init().catch(error => {
  loadFailed = true;
  checkedOn = undefined;
  renderLanguage();
  console.error(error);
});
