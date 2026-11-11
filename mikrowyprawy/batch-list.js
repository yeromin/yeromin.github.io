export function createBatchRenderer(list, batchSize, createItem) {
  if (typeof IntersectionObserver !== "function") {
    return items => list.replaceChildren(...items.map(createItem));
  }

  const end = document.createElement("div");
  end.className = "list-end";
  end.hidden = true;
  end.setAttribute("aria-hidden", "true");
  list.after(end);

  let items = [];
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) appendBatch();
  }, { rootMargin: "0px 0px 360px 0px" });

  function appendBatch() {
    observer.unobserve(end);
    observer.takeRecords();
    const offset = list.childElementCount;
    const batch = items.slice(offset, offset + batchSize);
    list.append(...batch.map(createItem));
    end.hidden = offset + batch.length >= items.length;
    // Check the new position even when the end stays within the viewport margin.
    if (!end.hidden) observer.observe(end);
  }

  return results => {
    items = results;
    list.replaceChildren();
    appendBatch();
  };
}
