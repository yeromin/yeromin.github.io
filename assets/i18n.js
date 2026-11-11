const messages = {
  language: ["Language", "Мова"],
  skip: ["Skip to content", "Перейти до вмісту"],
  navigation: ["Main navigation", "Головна навігація"],
  siteHome: ["yeromin home", "Головна сторінка yeromin"],
  home: ["Home", "Головна"],
  trips: ["Trips", "Подорожі"],
  sunset: ["Sunset", "Захід сонця"],
  homeTitle: ["Warsaw projects · yeromin", "Варшавські проєкти · yeromin"],
  homeMeta: ["Explore day trips from Warsaw and track sunrise, sunset, and twilight.", "Знаходьте ідеї для одноденних поїздок із Варшави та дізнавайтеся час сходу й заходу сонця."],
  homeHeading: ["Warsaw projects", "Варшавські проєкти"],
  homeIntro: ["Find a day trip near Warsaw or see when the sun sets.", "Знайдіть ідею для поїздки поблизу Варшави або дізнайтеся, коли зайде сонце."],
  tripProject: ["Find places to visit by activity, age, and distance.", "Шукайте цікаві місця за видом занять, віком і відстанню."],
  sunsetProjectTitle: ["Warsaw sunset tracker", "Схід і захід сонця у Варшаві"],
  sunsetProject: ["Live countdowns to dawn and sunset.", "Зворотний відлік до світанку й заходу сонця."],
  tripMeta: ["Find day trips from Warsaw by visitor access, activity, age, and distance. Based on the Mikrowyprawy z Warszawy Instagram archive.", "Ідеї для одноденних поїздок із Варшави з фільтрами за доступністю, видом занять, віком і відстанню. На основі архіву Instagram Mikrowyprawy z Warszawy."],
  tripIntro: ["A day-trip guide inspired by", "Ідеї для одноденних поїздок від"],
  browsePosts: ["Browse the Instagram post index", "Переглянути архів дописів в Instagram"],
  findTrip: ["Find a trip", "Знайти місце для поїздки"],
  placesToShow: ["Places to show", "Які місця показувати"],
  verified: ["Verified access", "Доступ перевірено"],
  allPlaces: ["All places", "Усі місця"],
  polandOnly: ["Poland only", "Лише Польща"],
  from: ["From", "Звідки ·"],
  filterPlaces: ["Filter places", "Фільтри місць"],
  search: ["Search", "Пошук"],
  tripSearch: ["Place, town, or activity", "Місце, місто або заняття"],
  activity: ["Activity", "Заняття"],
  anyActivity: ["Any activity", "Усі заняття"],
  setting: ["Setting", "Простір"],
  anySetting: ["Any setting", "Будь-де"],
  age: ["Suggested age", "Рекомендований вік"],
  ages: ["Suggested ages", "Рекомендований вік"],
  anyAge: ["Any age", "Будь-який вік"],
  adult: ["Adult", "Дорослі"],
  underOne: ["Under 1", "До 1 року"],
  ageOption: [age => `Age ${age}`, age => `${age} р.`],
  distance: ["Distance", "Відстань"],
  anyDistance: ["Any distance", "Без обмежень"],
  within: [distance => `Within ${distance}`, distance => `До ${distance}`],
  km: ["km", "км"],
  pin: ["Map pin", "Позначка на карті"],
  anyPrecision: ["Any precision", "Усі позначки"],
  exactPins: ["Place pins", "Точні позначки"],
  areaPins: ["Area estimates", "Орієнтовні позначки"],
  visitStatus: ["Visit status", "Доступність"],
  anyStatus: ["Any status", "Усі статуси"],
  loadingPlaces: ["Loading places…", "Завантаження місць…"],
  placeCount: [["place", "places"], ["місце", "місця", "місць"]],
  accessChecked: [date => `Access checked ${date}.`, date => `Доступ перевірено ${date.replace(/\.$/u, "")}.`],
  allPlacesNote: ["Includes seasonal, historical, and unverified places.", "Також показано сезонні, історичні й неперевірені місця."],
  straightLine: ["Straight-line distance.", "Відстань по прямій."],
  areaEstimateNote: ["≈ marks an area estimate.", "≈ позначає орієнтовну відстань до району."],
  missingPins: [count => `${count} without a pin.`, count => `Без позначки на карті · ${count}.`],
  clearFilters: ["Clear filters", "Скинути фільтри"],
  sort: ["Sort places", "Сортування місць"],
  nearest: ["Nearest first", "Спочатку найближчі"],
  alphabetical: ["Name A–Z", "За назвою"],
  latest: ["Latest Instagram posts", "За новизною дописів"],
  noPlaces: ["No places match these filters. Try a different activity, age, or distance.", "За цими фільтрами нічого не знайдено. Спробуйте змінити заняття, вік або відстань."],
  morePlaces: ["Show more places", "Показати більше місць"],
  postIndex: ["Post index", "Архів дописів"],
  instagramSource: ["Instagram source", "Джерело в Instagram"],
  locationData: ["Location data from", "Дані про місця від"],
  osmContributors: ["OpenStreetMap contributors", "учасників OpenStreetMap"],
  and: ["and", "та"],
  details: ["Details", "Докладніше"],
  closeDetails: ["Close place details", "Закрити опис місця"],
  area: ["Area", "Район"],
  country: ["Country", "Країна"],
  distanceFrom: [name => `Distance from ${name}`, name => `Відстань від точки «${name}»`],
  unavailable: ["Unavailable", "Немає даних"],
  areaEstimate: ["Area estimate", "Орієнтовна позначка"],
  mapsSearch: ["Search Google Maps", "Пошук у Google Maps"],
  viewAreaPin: ["View area pin", "Показати орієнтовну позначку"],
  searchByName: ["Search by name", "Пошук за назвою"],
  checked: [date => `Checked ${date}`, date => `Перевірено ${date}`],
  visitSource: ["Visit-status source", "Джерело даних про доступ"],
  instagramPosts: ["Instagram posts", "Дописи в Instagram"],
  placeLoadError: ["Couldn’t load places", "Не вдалося завантажити місця"],
  refresh: ["Refresh the page to try again.", "Оновіть сторінку, щоб спробувати ще раз."],
  start: ["Starting point", "Початкова точка"],
  closeStart: ["Close starting point", "Закрити вибір початкової точки"],
  startIntro: ["Enter a city to measure straight-line distances from its centre, or paste coordinates for an exact starting point. Your starting point stays in this browser.", "Введіть місто, щоб рахувати відстань по прямій від його центру, або вставте координати точної початкової точки. Вибрана точка зберігається в цьому браузері."],
  useLocation: ["Use my current location", "Використати моє місцезнаходження"],
  cityOrCoords: ["City or coordinates", "Місто або координати"],
  exampleCity: ["Kraków", "Краків"],
  saveHome: ["Save as Home", "Зберегти як дім"],
  matchingCities: ["Matching cities", "Знайдені міста"],
  resetStart: ["Use Warsaw centre", "Використати центр Варшави"],
  warsawCentre: ["Warsaw centre", "Центр Варшави"],
  cityCentre: [name => `${name} centre`, name => `${name} (центр)`],
  homeOrigin: ["Home", "Дім"],
  currentLocation: ["Current location", "Моє місцезнаходження"],
  enterOrigin: ["Enter a city or coordinates.", "Введіть місто або координати."],
  badCoords: ["Enter latitude and longitude, for example 52.2297, 21.0122.", "Введіть широту й довготу у форматі 52.2297, 21.0122."],
  findingCity: ["Finding city…", "Шукаємо місто…"],
  citySearchError: ["City search is unavailable. Try again or enter coordinates.", "Пошук міст недоступний. Спробуйте ще раз або введіть координати."],
  chooseCity: ["Choose a city", "Виберіть місто"],
  confirmCity: ["Choose the city you meant.", "Виберіть потрібне місто зі списку."],
  cityNotFound: ["City not found. Check the spelling or try a nearby city.", "Місто не знайдено. Перевірте написання або введіть назву сусіднього міста."],
  locationError: ["Location is unavailable. Enter a city or coordinates instead.", "Не вдалося визначити місцезнаходження. Введіть місто або координати."],
  locating: ["Getting your location…", "Визначаємо місцезнаходження…"],
  postsTitle: ["Instagram post index · Mikrowyprawy z Warszawy", "Архів дописів Instagram · Mikrowyprawy z Warszawy"],
  postsMeta: ["The Instagram post index behind the Mikrowyprawy z Warszawy trip guide.", "Архів дописів Instagram, на якому ґрунтується путівник Mikrowyprawy z Warszawy."],
  backToTrips: ["Back to trips", "Назад до подорожей"],
  postsHeading: ["Instagram post index", "Архів дописів Instagram"],
  postsIntro: ["Source posts from", "Оригінальні дописи від"],
  postsOrder: ["newest first after the pinned post.", "після закріпленого допису спочатку показано найновіші."],
  searchIndex: ["Search the post index", "Пошук в архіві дописів"],
  searchPosts: ["Search posts", "Пошук дописів"],
  postSearch: ["Place name or post number", "Назва місця або номер допису"],
  loadingPosts: ["Loading posts…", "Завантаження дописів…"],
  morePosts: ["Show more posts", "Показати більше дописів"],
  tripGuide: ["Trip guide", "Путівник"],
  pinnedPost: ["Pinned post", "Закріплений допис"],
  postNumber: [number => `Post ${number}`, number => `Допис ${number}`],
  noMappedPlaces: ["No mapped destination", "Без позначених місць"],
  mappedPlaces: [["mapped place", "mapped places"], ["позначене місце", "позначені місця", "позначених місць"]],
  noPosts: ["No posts match this search.", "Дописів за цим запитом не знайдено."],
  postCount: [["post", "posts"], ["допис", "дописи", "дописів"]],
  postLoadError: ["Couldn’t load posts. Refresh the page to try again.", "Не вдалося завантажити дописи. Оновіть сторінку, щоб спробувати ще раз."],
};

const languageKey = "yeromin.language";
const pluralIndex = { one: 0, few: 1, many: 2 };
const formats = {
  en: createFormats("en-GB"),
  uk: createFormats("uk-UA"),
};

function createFormats(locale) {
  return {
    date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }),
    number: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    plural: new Intl.PluralRules(locale),
  };
}

function readLanguage() {
  try {
    if (localStorage.getItem(languageKey) === "uk") return "uk";
  } catch {
    // The language switch still works for this page.
  }
  return "en";
}

export let language = readLanguage();

export function t(key, ...args) {
  const message = messages[key][language === "uk" ? 1 : 0];
  return typeof message === "function" ? message(...args) : message;
}

export function formatNumber(value) {
  return formats[language].number.format(value);
}

export function formatDate(value) {
  return formats[language].date.format(new Date(value + "T00:00:00Z"));
}

export function formatCount(value, key) {
  const plural = formats[language].plural.select(value);
  const index = pluralIndex[plural] ?? 1;
  return `${formatNumber(value)} ${t(key)[index]}`;
}

function translatePage() {
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const attribute of ["aria-label", "placeholder", "content"]) {
    const key = `data-i18n-${attribute}`;
    for (const element of document.querySelectorAll(`[${key}]`)) {
      element.setAttribute(attribute, t(element.getAttribute(key)));
    }
  }
}

export function wireLanguageSwitch(onChange) {
  const select = document.querySelector("#site-language");
  select.value = language;
  translatePage();
  select.hidden = false;
  onChange?.();
  select.addEventListener("change", () => {
    language = select.value;
    try {
      localStorage.setItem(languageKey, language);
    } catch {
      // The language switch still works for this page.
    }
    translatePage();
    onChange?.();
  });
}
