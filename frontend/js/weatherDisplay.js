// ─── weatherDisplay.js ──────────────────────────────────────
// Actualizează DOM-ul cu datele meteo primite.
// Folosește funcțiile de conversie din utils.js.
// NU face cereri HTTP — separation of concerns.

// ── Referințe DOM ──────────────────────────────────────────
const elCityName    = document.getElementById('city-name');
const elCountry     = document.getElementById('country-info');
const elLocalTime   = document.getElementById('local-time');
const elIcon        = document.getElementById('weather-icon');
const elTemperature = document.getElementById('temperature');
const elFeelsLike   = document.getElementById('feels-like');
const elDesc        = document.getElementById('weather-desc');
const elTempC       = document.getElementById('temp-c');
const elTempF       = document.getElementById('temp-f');
const elTempK       = document.getElementById('temp-k');
const elHumidity    = document.getElementById('humidity');
const elWind        = document.getElementById('wind-info');
const elPressure    = document.getElementById('pressure');
const elVisibility  = document.getElementById('visibility');
const elSunrise     = document.getElementById('sunrise');
const elSunset      = document.getElementById('sunset');
const elAdvice      = document.getElementById('day-advice');
const elSection     = document.getElementById('weather-section');
const elLoading     = document.getElementById('weather-loading');
const elError       = document.getElementById('weather-error');
const elErrorMsg    = document.getElementById('weather-error-msg');

// ── Afișare / ascundere stări ──────────────────────────────

function showLoading() {
  elLoading.hidden = false;
  elError.hidden   = true;
  elSection.hidden = true;
}

function showError(message) {
  elLoading.hidden  = true;
  elError.hidden    = false;
  elSection.hidden  = true;
  elErrorMsg.textContent = message;
}

function showWeather() {
  elLoading.hidden = true;
  elError.hidden   = true;
  elSection.hidden = false;
}

// ── Tema dinamică a paginii ────────────────────────────────

/**
 * Schimbă clasa de temă a <body> în funcție de condițiile meteo.
 * Coduri weather ID: https://openweathermap.org/weather-conditions
 * @param {Object} weatherData - Datele brute de la API
 */
function applyWeatherTheme(weatherData) {
  const id        = weatherData.weather[0].id;
  const currentTs = weatherData.dt;
  const sunrise   = weatherData.sys.sunrise;
  const sunset    = weatherData.sys.sunset;

  // Eliminăm toate temele anterioare
  document.body.classList.remove(
    'theme-default', 'theme-clear', 'theme-rain',
    'theme-clouds',  'theme-night',  'theme-snow'
  );

  // Noapte (verificare prioritară)
  if (isNight(currentTs, sunrise, sunset)) {
    document.body.classList.add('theme-night');
    return;
  }

  // Furtună sau ploaie (2xx, 3xx, 5xx)
  if (id >= 200 && id < 600) {
    document.body.classList.add('theme-rain');
    return;
  }

  // Zăpadă (6xx)
  if (id >= 600 && id < 700) {
    document.body.classList.add('theme-snow');
    return;
  }

  // Ceață / ceață uscată / praf (7xx) → tratăm ca nori
  if (id >= 700 && id < 800) {
    document.body.classList.add('theme-clouds');
    return;
  }

  // Cer senin (800)
  if (id === 800) {
    document.body.classList.add('theme-clear');
    return;
  }

  // Nori parțiali sau completi (801–804)
  if (id > 800) {
    document.body.classList.add('theme-clouds');
  }
}

// ── Popularea cardului de sfat al zilei ────────────────────

/**
 * Construiește HTML-ul cardului de sfaturi și îl injectează în DOM.
 * @param {Object} weatherData
 */
function renderAdvice(weatherData) {
  const { emoji, title, tips } = generateDayAdvice(weatherData);

  const tipsHTML = tips.map(tip =>
    `<li class="card-advice__item">${tip}</li>`
  ).join('');

  elAdvice.innerHTML = `
    <p class="card-advice__title">${emoji} ${title}</p>
    <ul class="card-advice__items">${tipsHTML}</ul>
  `;
}

// ── Popularea secțiunii meteo principale ──────────────────

/**
 * Afișează toate datele meteo în interfață.
 * @param {Object} weatherData  - Date brute de la API
 * @param {string} unit         - 'celsius' | 'fahrenheit' | 'kelvin'
 */
function renderWeather(weatherData, unit) {
  const tempC      = weatherData.main.temp;
  const feelsLikeC = weatherData.main.feels_like;
  const tzOffset   = weatherData.timezone;  // offset în secunde față de UTC

  // ── Date locație ────────────────────────────────────────
  elCityName.textContent  = weatherData.name;
  elCountry.textContent   = `${weatherData.sys.country} · Lat: ${weatherData.coord.lat.toFixed(2)}, Lon: ${weatherData.coord.lon.toFixed(2)}`;
  elLocalTime.textContent = `Ora locală: ${formatLocalTime(weatherData.dt, tzOffset)}`;

  // ── Icoană meteo ─────────────────────────────────────────
  const iconCode   = weatherData.weather[0].icon;
  elIcon.src       = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  elIcon.alt       = weatherData.weather[0].description;

  // ── Temperatură în unitatea selectată ───────────────────
  elTemperature.textContent = formatTemperature(tempC, unit);
  elFeelsLike.textContent   = `Se simte ca ${formatTemperature(feelsLikeC, unit)}`;
  elDesc.textContent        = weatherData.weather[0].description;

  // ── Toate cele 3 unități simultan ───────────────────────
  elTempC.textContent = `${tempC.toFixed(1)}°C`;
  elTempF.textContent = `${celsiusToFahrenheit(tempC).toFixed(1)}°F`;
  elTempK.textContent = `${celsiusToKelvin(tempC).toFixed(1)} K`;

  // ── Detalii ──────────────────────────────────────────────
  elHumidity.textContent  = `${weatherData.main.humidity}%`;
  elWind.textContent      = formatWind(weatherData.wind.speed, weatherData.wind.deg || 0);
  elPressure.textContent  = `${weatherData.main.pressure} hPa`;

  const visKm = weatherData.visibility
    ? `${(weatherData.visibility / 1000).toFixed(1)} km`
    : 'N/A';
  elVisibility.textContent = visKm;

  elSunrise.textContent = formatSunTime(weatherData.sys.sunrise, tzOffset);
  elSunset.textContent  = formatSunTime(weatherData.sys.sunset,  tzOffset);

  // ── Sfat zi + temă dinamică ──────────────────────────────
  renderAdvice(weatherData);
  applyWeatherTheme(weatherData);

  // Afișăm secțiunea
  showWeather();
}

// ── Butoane istoric recent ─────────────────────────────────

/**
 * Re-randează lista butoanelor de orașe recente.
 * Dacă lista e goală, ascunde secțiunea.
 * @param {Function} onCityClick - Callback apelat cu numele orașului la click
 */
function renderRecentCities(onCityClick) {
  const cities     = getRecentCities();
  const elRecent   = document.getElementById('recent-section');
  const elList     = document.getElementById('recent-cities');

  if (cities.length === 0) {
    elRecent.hidden = true;
    return;
  }

  elRecent.hidden  = false;
  elList.innerHTML = cities.map(city =>
    `<button type="button" class="btn btn--city" role="listitem" data-city="${city}">${city}</button>`
  ).join('');

  // Atașăm evenimentele de click
  elList.querySelectorAll('.btn--city').forEach(btn => {
    btn.addEventListener('click', () => onCityClick(btn.dataset.city));
  });
}
