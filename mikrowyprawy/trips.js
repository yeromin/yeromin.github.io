import { externalLink, loadCatalog, normalize } from "./catalog.js";

const defaultStart = { name: "Warsaw centre", pin: [52.2297, 21.0122] };
const startKey = "mikrowyprawy.start";
const batchSize = 24;
const verifiedStatuses = new Set(["Open to visitors", "Open by booking / schedule"]);
const statusLabels = new Map([
  ["Open by booking / schedule", "Booking or schedule"],
  ["Exterior / public route", "Exterior or public route"],
  ["Seasonal / check dates", "Seasonal"],
  ["Check event access", "Check event access"],
]);
const collator = new Intl.Collator("pl");
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
const distanceFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const countFormat = new Intl.NumberFormat("en");

const $ = selector => document.querySelector(selector);
const filterForm = $("#filters");
const fields = Object.fromEntries([...filterForm.elements].map(field => [field.name, field]));
const cards = $("#places");
const more = $("#more-places");
const placeDialog = $("#place-dialog");
const startDialog = $("#start-dialog");
const startForm = $("#custom-start");
const scopes = [...document.querySelectorAll("[data-scope]")];

let start = readStart();
let scope = "verified";
let places = [];
let postsByNumber = new Map();
let matches = [];
let shown = 0;
let checkedOn;

function validPin(pin) {
  return Array.isArray(pin) && pin.length === 2 && pin.every(Number.isFinite)
    && Math.abs(pin[0]) <= 90 && Math.abs(pin[1]) <= 180;
}

function readStart() {
  try {
    const saved = JSON.parse(localStorage.getItem(startKey));
    if (saved && validPin(saved.pin)) return { name: "My start", pin: saved.pin };
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

function updateDistances() {
  $("#start-name").textContent = start.name;
  for (const place of places) {
    place.distance = place.pin ? distanceBetween(start.pin, place.pin) : Infinity;
  }
}

function formatDistance(distance) {
  if (!Number.isFinite(distance)) return "";
  return distanceFormat.format(distance < 20 ? distance : Math.round(distance)) + " km";
}

function formatDate(value) {
  return dateFormat.format(new Date(value + "T00:00:00Z"));
}

function titleFor(place) {
  return place.name.replace(/,?\s+Warszawa$/u, "");
}

function fillSelect(select, entries) {
  for (const [value, label] of entries) select.add(new Option(label, value));
}

function setupOptions() {
  const activities = [...new Set(places.map(place => place.activity))].sort(collator.compare);
  fillSelect(fields.activity, activities.map(value => [value, value]));
  fillSelect(fields.age, Array.from({ length: 19 }, (_, age) => [
    age, age === 0 ? "Under 1" : age === 18 ? "Adult" : "Age " + age,
  ]));
  const statuses = [...new Set(places.map(place => place.status))].sort(collator.compare);
  fillSelect(fields.status, statuses.map(value => [value, statusLabels.get(value) ?? value]));
}

function filterResults() {
  const { q, activity, setting, age, within, status } = Object.fromEntries(new FormData(filterForm));
  const terms = normalize(q).split(/\s+/u).filter(Boolean);
  const chosenAge = age === "" ? null : Number(age);
  const maxDistance = within === "" ? Infinity : Number(within);
  const order = $("#sort-order").value;
  matches = places.filter(place =>
    (scope === "all" || verifiedStatuses.has(place.status))
    && (!status || place.status === status)
    && (!activity || place.activity === activity)
    && (!setting || place.setting === setting)
    && (chosenAge === null || (chosenAge >= place.minAge && chosenAge <= (place.maxAge ?? Infinity)))
    && place.distance <= maxDistance
    && terms.every(term => place.keywords.includes(term))
  );

  matches.sort((a, b) => {
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
  const tags = card.querySelector(".place-tags");
  tags.append(tag(place.setting, "place-tag", place.setting), tag(place.ages, "place-tag age-tag"));
  card.querySelector(".place-distance").textContent = formatDistance(place.distance);
  card.querySelector(".place-context").textContent = place.activity + " · " + place.area;
  card.querySelector("h3").textContent = titleFor(place);
  card.querySelector(".place-description").textContent = place.description;
  if (place.status !== "Open to visitors") {
    const status = document.createElement("p");
    status.className = "place-status";
    status.textContent = statusLabels.get(place.status) ?? place.status;
    card.querySelector(".place-text").append(status);
  }
  card.querySelector(".map-link").href = place.map;
  card.querySelector(".details-button").addEventListener("click", () => showDetails(place));
  return card;
}

function appendCards() {
  const batch = matches.slice(shown, shown + batchSize).map(createCard);
  cards.append(...batch);
  shown += batch.length;
  more.hidden = shown >= matches.length;
  return batch[0];
}

function renderResults() {
  filterResults();
  const count = matches.length;
  $("#result-count").textContent = countFormat.format(count) + (count === 1 ? " place" : " places");
  const scopeNote = scope === "verified"
    ? "Access checked " + formatDate(checkedOn) + "."
    : "Includes seasonal, historical, and unverified places.";
  $("#result-note").textContent = scopeNote + " Distances use matched map pins.";
  $("#empty-places").hidden = count !== 0;
  $("#clear-filters").hidden = Object.values(fields).every(field => !field.value);
  cards.replaceChildren();
  shown = 0;
  appendCards();
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
  description.textContent = place.description;

  const meta = document.createElement("dl");
  meta.className = "detail-meta";
  meta.append(
    detailRow("Visit status", place.status),
    detailRow("Suggested ages", place.ages),
    detailRow("Activity", place.activity),
    detailRow("Setting", place.setting),
    detailRow("Area", place.area),
    detailRow("Distance from " + start.name, formatDistance(place.distance) || "Unavailable"),
  );

  const body = $("#place-details");
  body.replaceChildren(description, meta);
  if (place.access) {
    const access = document.createElement("p");
    access.textContent = place.access;
    body.append(access);
  }

  const sources = document.createElement("div");
  sources.className = "detail-links";
  sources.append(externalLink(place.pin ? "Google Maps ↗" : "Search Google Maps ↗", place.map, "button button-primary"));
  if (place.evidence) {
    const checked = document.createElement("p");
    checked.textContent = "Checked " + formatDate(place.checked);
    sources.append(externalLink("Visit-status source ↗", place.evidence), checked);
  }
  body.append(sources);

  const sourcePosts = document.createElement("section");
  sourcePosts.className = "detail-section";
  const postsHeading = document.createElement("h3");
  postsHeading.textContent = "Instagram posts";
  const postLinks = document.createElement("ul");
  postLinks.className = "detail-posts";
  for (const number of place.posts) {
    const li = document.createElement("li");
    li.append(externalLink("Post " + number + " ↗", postsByNumber.get(number).url));
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

function selectStart(pin) {
  start = pin ? { name: "My start", pin } : defaultStart;
  try {
    if (pin) localStorage.setItem(startKey, JSON.stringify({ pin }));
    else localStorage.removeItem(startKey);
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
  $("#open-start").addEventListener("click", () => {
    startForm.elements.coords.value = start === defaultStart ? "" : start.pin.join(", ");
    message.textContent = "";
    startDialog.showModal();
  });

  startForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = startForm.elements.coords.value.trim();
    const parts = value.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*,\s*|\s+)([+-]?\d+(?:\.\d+)?)$/u);
    const pin = parts ? parts.slice(1).map(Number) : null;
    if (!validPin(pin)) {
      message.textContent = "Enter latitude and longitude, for example 52.2297, 21.0122.";
      return;
    }
    selectStart(pin);
  });

  useLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      message.textContent = "Location is unavailable. You can enter coordinates instead.";
      return;
    }
    useLocation.disabled = true;
    message.textContent = "Getting your location…";
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        useLocation.disabled = false;
        if (startDialog.open) selectStart([coords.latitude, coords.longitude]);
      },
      () => {
        useLocation.disabled = false;
        if (startDialog.open) message.textContent = "Location is unavailable. You can enter coordinates instead.";
      },
      { timeout: 10000 },
    );
  });

  $("#reset-start").addEventListener("click", () => selectStart(null));
}

async function init() {
  const catalog = await loadCatalog();
  checkedOn = catalog.checkedOn;
  postsByNumber = new Map(catalog.posts.map(post => [post.number, post]));
  places = catalog.places.map(place => ({
    ...place,
    keywords: normalize([place.name, place.area, place.activity, place.description].join(" ")),
  }));
  setupOptions();
  updateDistances();
  renderResults();

  for (const button of scopes) button.addEventListener("click", () => selectScope(button.dataset.scope));
  filterForm.addEventListener("submit", event => event.preventDefault());
  filterForm.addEventListener("input", renderResults);
  $("#sort-order").addEventListener("change", renderResults);
  $("#clear-filters").addEventListener("click", () => {
    filterForm.reset();
    renderResults();
    fields.q.focus();
  });
  more.addEventListener("click", () => appendCards()?.querySelector(".map-link").focus());
  wireStartingPoint();
}

init().catch(error => {
  $("#result-count").textContent = "Couldn’t load places";
  $("#result-note").textContent = "Refresh the page to try again.";
  console.error(error);
});
