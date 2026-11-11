import { formatCount, language, t, wireLanguageSwitch } from "../../assets/i18n.js?v=5";
import { catalogCopy, externalLink, loadCatalog, loadCatalogTranslation, normalize } from "../catalog.js?v=5";
import { createBatchRenderer } from "../batch-list.js";

const form = document.querySelector("#post-search");
const count = document.querySelector("#post-count");
const renderPosts = createBatchRenderer(document.querySelector("#post-list"), 30, createItem);

let posts = [];
let loadFailed = false;

function postNote(text) {
  if (language === "en") return text;
  return catalogCopy(text).replace(/ \+(\d+) more$/u, (_, extra) => ` · ще ${formatCount(Number(extra), "placeCount")}`);
}

function createItem(post) {
  const li = document.createElement("li");
  const info = document.createElement("div");
  const index = document.createElement("p");
  const note = document.createElement("p");
  index.className = "post-index";
  note.className = "post-title";
  const number = post.number === 0 ? t("pinnedPost") : t("postNumber", post.number);
  const mapped = post.places.length;
  const coverage = mapped === 0 ? t("noMappedPlaces") : formatCount(mapped, "mappedPlaces");
  index.textContent = number + " · " + coverage;
  note.textContent = postNote(post.note);
  info.append(index, note);
  li.append(info, externalLink("Instagram ↗", post.url, "map-link"));
  return li;
}

function render() {
  const query = normalize(form.elements.q.value).replace(/^#\s*/u, "");
  const matches = posts.filter(post => post.search.includes(query) || String(post.number) === query);
  count.textContent = matches.length === 0 ? t("noPosts") : formatCount(matches.length, "postCount");
  renderPosts(matches);
}

async function renderLanguage() {
  if (!posts.length) {
    count.textContent = t(loadFailed ? "postLoadError" : "loadingPosts");
    return;
  }
  const selectedLanguage = language;
  await loadCatalogTranslation();
  if (language !== selectedLanguage) return;
  for (const post of posts) post.search = normalize(post.note + " " + postNote(post.note));
  render();
}

async function init() {
  const catalog = await loadCatalog();
  posts = catalog.posts;
  await renderLanguage();
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", render);
}

wireLanguageSwitch(renderLanguage);
init().catch(error => {
  loadFailed = true;
  posts = [];
  renderLanguage();
  console.error(error);
});
