// ─── app.js ─────────────────────────────────────────────────
// Punctul de intrare al aplicației — leagă toate modulele.
// Gestionează: submit formular, Geolocation API, selector unitate,
// buton ștergere istoric.

// ── Referințe DOM ──────────────────────────────────────────
const formSearch      = document.getElementById('form-search');
const inputCity       = document.getElementById('city-input');
const inputUnit       = document.getElementById('unit-select');
const btnGeo          = document.getElementById('geo-btn');
const btnClearHistory = document.getElementById('clear-history-btn');
const spanCityError   = document.getElementById('city-error');

// ── Funcția centrală de căutare ────────────────────────────

/**
 * Caută vremea pentru un oraș, actualizează istoricul și afișează rezultatele.
 * @param {string} city - Numele orașului
 */
async function searchCity(city) {
  const unit = inputUnit.value;

  // Validare câmp
  if (!city || city.trim() === '') {
    inputCity.classList.add('is-invalid');
    spanCityError.textContent = 'Introduceți numele unui oraș.';
    return;
  }

  // Resetăm eroarea de validare
  inputCity.classList.remove('is-invalid');
  spanCityError.textContent = '';

  // Afișăm spinner-ul
  showLoading();

  try {
    const data = await fetchWeatherByCity(city.trim());

    // Salvăm în localStorage și re-randăm lista recentă
    addRecentCity(city.trim());
    renderRecentCities(searchCity);

    // Randăm datele meteo în interfață
    renderWeather(data, unit);
  } catch (err) {
    showError(err.message);
  }
}

// ── Căutare după coordonate (Geolocation API) ──────────────

/**
 * Folosește navigator.geolocation pentru a obține locația utilizatorului,
 * apoi solicită datele meteo pentru coordonatele respective.
 */
function searchByGeolocation() {
  if (!navigator.geolocation) {
    showError('Geolocation nu este suportat de browserul tău.');
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    // Succes: avem coordonatele
    async (position) => {
      const { latitude, longitude } = position.coords;
      const unit = inputUnit.value;

      try {
        const data = await fetchWeatherByCoords(latitude, longitude);

        // Salvăm și orașul detectat automat în istoric
        addRecentCity(data.name);
        renderRecentCities(searchCity);

        // Completăm și input-ul cu numele orașului detectat
        inputCity.value = data.name;

        renderWeather(data, unit);
      } catch (err) {
        showError(err.message);
      }
    },
    // Eroare: utilizatorul a refuzat sau altă problemă
    (err) => {
      const messages = {
        1: 'Accesul la locație a fost refuzat. Activați permisiunea în browser.',
        2: 'Poziția geografică nu a putut fi determinată.',
        3: 'Cererea de localizare a expirat. Încercați din nou.',
      };
      showError(messages[err.code] || 'Eroare la obținerea locației.');
    },
    // Opțiuni: timeout 10 secunde
    { timeout: 10000 }
  );
}

// ── Event listeners ────────────────────────────────────────

// Submit formular de căutare
formSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  searchCity(inputCity.value);
});

// Click buton geolocație
btnGeo.addEventListener('click', searchByGeolocation);

// Schimbarea unității de temperatură re-randează dacă avem deja date
inputUnit.addEventListener('change', () => {
  // Dacă secțiunea meteo e vizibilă, reluăm căutarea pentru a actualiza afișarea
  const weatherSection = document.getElementById('weather-section');
  if (!weatherSection.hidden && inputCity.value.trim() !== '') {
    searchCity(inputCity.value);
  }
});

// Buton ștergere istoric
btnClearHistory.addEventListener('click', () => {
  clearRecentCities();
  renderRecentCities(searchCity); // re-randează (va ascunde secțiunea)
});

// ── Inițializare la încărcarea paginii ─────────────────────
// Afișăm istoricul salvat din sesiunile anterioare
renderRecentCities(searchCity);
