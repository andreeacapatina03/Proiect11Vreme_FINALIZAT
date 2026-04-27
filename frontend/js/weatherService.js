// ─── weatherService.js ──────────────────────────────────────
// Strat de acces la date — separation of concerns.
// Toate cererile HTTP către server sunt centralizate AICI.
// Restul modulelor (display, app) nu știu nimic despre fetch sau URL-uri.
const API_BASE_URL = 'https://proiect11-vreme-ca-iid-vc.onrender.com';
const API_BASE = '/api/v1/weather';

// ── Funcții de preluare date ───────────────────────────────

/**
 * Preia datele meteo curente pentru un oraș dat.
 * Face un fetch la serverul nostru Express (care proxiază OpenWeatherMap).
 * @param {string} city - Numele orașului
 * @returns {Promise<Object>} Datele meteo brute de la OpenWeatherMap
 * @throws {Error} cu mesaj de eroare în caz de eșec
 */
async function fetchWeatherByCity(city) {
  const url = `${API_BASE}?city=${encodeURIComponent(city)}`;

  const response = await fetch(url);
  const data     = await response.json();

  // Dacă serverul a returnat un cod de eroare, aruncăm eroarea cu mesajul primit
  if (!response.ok) {
    throw new Error(data.message || 'Eroare la preluarea datelor meteo.');
  }

  return data;
}

/**
 * Preia datele meteo curente pentru coordonate geografice.
 * Folosit de Geolocation API din browser.
 * @param {number} lat - Latitudine
 * @param {number} lon - Longitudine
 * @returns {Promise<Object>} Datele meteo brute de la OpenWeatherMap
 * @throws {Error} cu mesaj de eroare în caz de eșec
 */
async function fetchWeatherByCoords(lat, lon) {
  const url = `${API_BASE}/coordinates?lat=${lat}&lon=${lon}`;

  const response = await fetch(url);
  const data     = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Eroare la preluarea datelor meteo pentru locația ta.');
  }

  return data;
}
