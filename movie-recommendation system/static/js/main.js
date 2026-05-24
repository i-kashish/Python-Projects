/* ─── Search ──────────────────────────────────────────────────────────── */
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const searchGrid = document.getElementById("searchGrid");
const searchQuery = document.getElementById("searchQuery");

async function doSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    searchQuery.textContent = `for "${data.query}" (${data.total} found)`;
    searchGrid.innerHTML = data.results.length
      ? data.results.map(renderCard).join("")
      : `<p class="empty-msg">No movies found for "${data.query}"</p>`;
    searchResults.classList.remove("hidden");
    searchResults.scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    showToast("Search failed. Try again.");
  }
}

searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch();
  if (e.key === "Escape") searchResults.classList.add("hidden");
});

/* ─── Genre Filter ───────────────────────────────────────────────────── */
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", async () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const genre = chip.dataset.genre;
    const titleEl = document.getElementById("gridTitle");
    const gridEl = document.getElementById("mainGrid");
    if (!gridEl) return;

    if (genre === "all") {
      try {
        const res = await fetch("/api/top?n=10");
        const data = await res.json();
        titleEl && (titleEl.textContent = "⭐ Top Rated Films");
        gridEl.innerHTML = data.movies.map(renderCard).join("");
      } catch (_) {}
    } else {
      try {
        const res = await fetch(`/api/genre/${encodeURIComponent(genre)}`);
        const data = await res.json();
        titleEl && (titleEl.textContent = `🎭 ${genre} Films`);
        gridEl.innerHTML = data.movies.length
          ? data.movies.map(renderCard).join("")
          : `<p class="empty-msg">No ${genre} movies found.</p>`;
      } catch (_) {}
    }
  });
});

/* ─── Card Renderer ──────────────────────────────────────────────────── */
function renderCard(movie) {
  const genres = (movie.genres || []).slice(0, 2).map((g) => `<span class="tag">${g}</span>`).join("");
  const similarity = movie.similarity_score
    ? `<div class="similarity-badge">${Math.round(movie.similarity_score * 100)}% match</div>`
    : "";
  return `
    <div class="movie-card" onclick="window.location='/movie/${movie.id}'">
      <div class="card-poster">
        <img src="${movie.poster || '/static/images/placeholder.svg'}"
             alt="${movie.title}"
             loading="lazy"
             onerror="this.src='/static/images/placeholder.svg'" />
        <div class="card-overlay">
          <div class="card-rating">⭐ ${movie.rating}</div>
          ${similarity}
          <div class="card-genres">${genres}</div>
        </div>
      </div>
      <div class="card-info">
        <h3>${movie.title}</h3>
        <p>${movie.year} · ${movie.director}</p>
      </div>
    </div>`;
}

/* ─── Toast ──────────────────────────────────────────────────────────── */
function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}
