export async function loadCatalog() {
  const response = await fetch(new URL("./data/catalog.json", import.meta.url));
  if (!response.ok) throw new Error("Unable to load the trip catalog");
  return response.json();
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
