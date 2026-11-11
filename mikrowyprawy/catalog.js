import { language } from "../assets/i18n.js?v=5";

const ukrainianLabels = {
  "Animals & farms": "Тварини й ферми",
  "Architecture & city walk": "Архітектура й міські прогулянки",
  "Art & exhibitions": "Мистецтво й виставки",
  "Beach & water": "Пляжі й водойми",
  "Castle, palace & heritage": "Замки, палаци й спадщина",
  "Events & festivals": "Події й фестивалі",
  "Family play": "Сімейні розваги",
  "Food & drink": "Їжа й напої",
  "Gardens & flowers": "Сади й квіти",
  "Hands-on workshops": "Майстер-класи",
  "Historic site & ruins": "Історичні місця й руїни",
  "Kayaking": "Каякінг",
  "Markets & vintage": "Ринки й вінтаж",
  "Museum & history": "Музеї й історія",
  "Nature walk & hiking": "Прогулянки на природі й походи",
  "Park & playground": "Парки й дитячі майданчики",
  "Pools & water parks": "Басейни й аквапарки",
  "Scenic transport": "Мальовничі поїздки",
  "Science & discovery": "Наука й відкриття",
  "Seasonal farm": "Сезонні ферми",
  "Shopping & vintage": "Покупки й вінтаж",
  "Sport & adventure": "Спорт і пригоди",
  "Stay & accommodation": "Житло й ночівля",
  "Theatre & performances": "Театр і вистави",
  "Theme & adventure park": "Тематичні парки й парки пригод",
  "Viewpoint": "Оглядові майданчики",
  "Wellness": "Відпочинок і оздоровлення",
  "Outdoor": "Просто неба",
  "Indoor": "У приміщенні",
  "Mixed": "Змішано",
  "Access unverified": "Доступ не перевірено",
  "Open to visitors": "Відкрито для відвідувачів",
  "Seasonal / check dates": "Сезонно, уточніть дати",
  "Exterior / public route": "Огляд зовні або відкритий маршрут",
  "Open by booking / schedule": "За бронюванням або розкладом",
  "Historical event": "Подія вже минула",
  "Restricted or historical": "Обмежений доступ або історичне місце",
  "Check event access": "Уточніть умови відвідування події",
  "Temporarily closed": "Тимчасово зачинено",
  "Across Warsaw": "У різних районах Варшави",
  "Close to Warsaw": "Поблизу Варшави",
  "Inner Warsaw": "Центральна частина Варшави",
  "International": "За межами Польщі",
  "Kampinos": "Кампінос",
  "Kraków": "Краків",
  "Liwiec / Bug": "Лівець / Буг",
  "Longer trip": "Дальша поїздка",
  "Mazovia day trip": "Одноденна поїздка Мазовією",
  "Otwock area": "Околиці Отвоцька",
  "Piaseczno / Konstancin": "Пясечно / Констанцин",
  "Podlaskie": "Підляське воєводство",
  "Regional Poland": "Регіони Польщі",
  "Warsaw": "Варшава",
  "Warsaw & close suburbs": "Варшава й передмістя",
  "West of Warsaw": "На захід від Варшави",
  "Wkra / Modlin": "Вкра / Модлін",
  "Zegrze / Narew": "Зеґже / Нарев",
  "Łódź area": "Околиці Лодзі",
  "Świętokrzyskie / Radom": "Свентокшиське воєводство / Радом",
  "Żyrardów": "Жирардув",
  "All ages": "Для будь-якого віку",
  "Adults": "Для дорослих",
  "Teens & adults": "Для підлітків і дорослих",
};

let ukrainianCopy = {};
let copyRequest;

export async function loadCatalog() {
  const response = await fetch(new URL("./data/catalog.json?v=5", import.meta.url));
  if (!response.ok) throw new Error("Unable to load the trip catalog");
  return response.json();
}

export async function loadCatalogTranslation() {
  if (language !== "uk") return;
  try {
    copyRequest ??= fetch(new URL("./data/catalog.uk.json?v=5", import.meta.url)).then(response => {
      if (!response.ok) throw new Error("Unable to load the Ukrainian catalog text");
      return response.json();
    });
    ukrainianCopy = await copyRequest;
  } catch (error) {
    copyRequest = undefined;
    console.warn(error);
  }
}

export function catalogLabel(text) {
  return language === "uk" ? ukrainianLabels[text] ?? text : text;
}

export function catalogCopy(text) {
  return language === "uk" ? ukrainianCopy[text] ?? text : text;
}

export function ageLabel(place) {
  if (language === "en") return place.ages;
  if (place.ages.endsWith("+ & adults")) return `Від ${place.minAge} років`;
  if (place.maxAge !== null) return `${place.minAge}–${place.maxAge} років`;
  return catalogLabel(place.ages);
}

export function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ł", "l").trim();
}

export function externalLink(label, url, className) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  if (className) link.className = className;
  return link;
}
