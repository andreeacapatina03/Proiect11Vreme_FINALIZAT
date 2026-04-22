// ─── storage.js ─────────────────────────────────────────────
// Gestionează istoricul căutărilor folosind localStorage.
// Salvăm maxim 5 orașe recente — duplicatele sunt mutate în față.

const STORAGE_KEY    = 'weatherapp_recent_cities';
const MAX_CITIES     = 5;

// ── Citire / scriere ───────────────────────────────────────

/**
 * Returnează lista orașelor salvate (array de string-uri).
 * Dacă nu există nimic în localStorage, returnează array gol.
 */
function getRecentCities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Dacă JSON-ul e corupt, resetăm
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Adaugă un oraș la istoricul căutărilor.
 * - Dacă există deja, îl mută în față (cel mai recent).
 * - Dacă lista depășește MAX_CITIES, elimină cel mai vechi.
 * @param {string} city - Numele orașului
 */
function addRecentCity(city) {
  const normalized = city.trim();
  if (!normalized) return;

  let cities = getRecentCities();

  // Eliminăm duplicatul (case-insensitive) dacă există
  cities = cities.filter(c => c.toLowerCase() !== normalized.toLowerCase());

  // Adăugăm orașul în față (cel mai recent)
  cities.unshift(normalized);

  // Păstrăm doar MAX_CITIES orașe
  if (cities.length > MAX_CITIES) {
    cities = cities.slice(0, MAX_CITIES);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}

/**
 * Șterge tot istoricul din localStorage.
 */
function clearRecentCities() {
  localStorage.removeItem(STORAGE_KEY);
}
