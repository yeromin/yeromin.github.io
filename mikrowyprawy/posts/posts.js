import { externalLink, loadCatalog, normalize } from "../catalog.js";

const form = document.querySelector("#post-search");
const list = document.querySelector("#post-list");
const count = document.querySelector("#post-count");
const more = document.querySelector("#more-posts");
const batchSize = 30;

let posts = [];
let matches = [];
let shown = 0;

function createItem(post) {
  const li = document.createElement("li");
  const info = document.createElement("div");
  const index = document.createElement("p");
  const note = document.createElement("p");
  index.className = "post-index";
  note.className = "post-title";
  const number = post.number === 0 ? "Pinned post" : "Post " + post.number;
  const mapped = post.places.length;
  const coverage = mapped === 0 ? "No mapped destination" : mapped + (mapped === 1 ? " mapped place" : " mapped places");
  index.textContent = number + " · " + coverage;
  note.textContent = post.note;
  info.append(index, note);
  li.append(info, externalLink("Instagram ↗", post.url, "map-link"));
  return li;
}

function appendPosts() {
  const batch = matches.slice(shown, shown + batchSize).map(createItem);
  list.append(...batch);
  shown += batch.length;
  more.hidden = shown >= matches.length;
  return batch[0];
}

function render() {
  const query = normalize(form.elements.q.value).replace(/^#\s*/u, "");
  matches = posts.filter(post => post.search.includes(query) || String(post.number) === query);
  count.textContent = matches.length === 0 ? "No posts match this search."
    : matches.length + (matches.length === 1 ? " post" : " posts");
  list.replaceChildren();
  shown = 0;
  appendPosts();
}

async function init() {
  const catalog = await loadCatalog();
  posts = catalog.posts.map(post => ({ ...post, search: normalize(post.note) }));
  render();
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", render);
  more.addEventListener("click", () => appendPosts()?.querySelector("a").focus());
}

init().catch(error => {
  count.textContent = "Couldn’t load posts. Refresh the page to try again.";
  console.error(error);
});
