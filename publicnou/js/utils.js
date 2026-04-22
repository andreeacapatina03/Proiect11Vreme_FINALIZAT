// ─── utils.js ───────────────────────────────────────────────
// Funcții pure de conversie și calcul.
// Acest modul NU atinge DOM-ul și NU face cereri HTTP —
// poate fi testat independent cu Jest.

// ── Conversii temperatură ──────────────────────────────────

/**
 * Convertește Celsius în Fahrenheit.
 * Formula: F = (C × 9/5) + 32
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

/**
 * Convertește Celsius în Kelvin.
 * Formula: K = C + 273.15
 */
function celsiusToKelvin(celsius) {
  return celsius + 273.15;
}

/**
 * Formatează temperatura în unitatea selectată de utilizator.
 * @param {number} celsius - Temperatura în Celsius (primită de la API)
 * @param {'celsius'|'fahrenheit'|'kelvin'} unit
 * @returns {string} ex: "22.5°C", "72.5°F", "295.7 K"
 */
function formatTemperature(celsius, unit) {
  switch (unit) {
    case 'fahrenheit':
      return `${celsiusToFahrenheit(celsius).toFixed(1)}°F`;
    case 'kelvin':
      return `${celsiusToKelvin(celsius).toFixed(1)} K`;
    case 'celsius':
    default:
      return `${celsius.toFixed(1)}°C`;
  }
}

// ── Conversia direcției vântului din grade în cuvinte ───────

/**
 * Convertește direcția vântului din grade (0–360) în text.
 * Împărțim cercul în 16 sectoare de câte 22.5°.
 * @param {number} deg - Grade (0 = Nord, 90 = Est, 180 = Sud, 270 = Vest)
 * @returns {string} ex: "Nord", "Sud-Vest", "Est-Nord-Est"
 */
function windDegreesToDirection(deg) {
  const directions = [
    'Nord', 'Nord-Nord-Est', 'Nord-Est', 'Est-Nord-Est',
    'Est',  'Est-Sud-Est',   'Sud-Est',  'Sud-Sud-Est',
    'Sud',  'Sud-Sud-Vest',  'Sud-Vest', 'Vest-Sud-Vest',
    'Vest', 'Vest-Nord-Vest','Nord-Vest','Nord-Nord-Vest'
  ];
  // Normalizăm gradele la [0, 360) și calculăm indexul sectorului
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * Formatează viteza și direcția vântului.
 * @param {number} speedMs  - Viteza în m/s (de la API)
 * @param {number} deg      - Direcția în grade
 * @returns {string} ex: "5.2 m/s — Nord-Est"
 */
function formatWind(speedMs, deg) {
  const direction = windDegreesToDirection(deg);
  return `${speedMs.toFixed(1)} m/s — ${direction}`;
}

// ── Logica sfatului zilei ──────────────────────────────────

/**
 * Determină dacă este noapte pe baza timpului Unix și a datelor de
 * răsărit / apus returnate de API.
 * @param {number} currentUnix - Ora curentă (Unix timestamp)
 * @param {number} sunriseUnix
 * @param {number} sunsetUnix
 * @returns {boolean}
 */
function isNight(currentUnix, sunriseUnix, sunsetUnix) {
  return currentUnix < sunriseUnix || currentUnix > sunsetUnix;
}

/**
 * Generează sfaturile zilei pe baza datelor meteo.
 * Returnează un obiect cu: emoji, titlu și lista de sfaturi.
 * @param {Object} weatherData - Datele brute de la OpenWeatherMap
 * @returns {{ emoji: string, title: string, tips: string[] }}
 */
function generateDayAdvice(weatherData) {
  const tempC      = weatherData.main.temp;
  const humidity   = weatherData.main.humidity;
  const weatherId  = weatherData.weather[0].id;
  const windSpeed  = weatherData.wind.speed;
  const currentTs  = weatherData.dt;
  const sunriseTs  = weatherData.sys.sunrise;
  const sunsetTs   = weatherData.sys.sunset;

  const tips = [];
  let emoji  = '☀️';
  let title  = 'Ce zi ai!';

  // ── Starea cerului / precipitații ─────────────────────────
  // Coduri API: https://openweathermap.org/weather-conditions
  // 2xx = furtună, 3xx = burniță, 5xx = ploaie, 6xx = zăpadă, 800 = senin, 8xx = nori

  if (weatherId >= 200 && weatherId < 300) {
    emoji = '⛈️';
    title = 'Furtună! Stai acasă!';
    tips.push('⚡ Evită spațiile deschise și copacii înalți.');
    tips.push('☂️ Ia obligatoriu o umbrelă rezistentă.');
  } else if (weatherId >= 300 && weatherId < 400) {
    emoji = '🌦️';
    title = 'Burniță ușoară';
    tips.push('☂️ O umbrelă mică nu strică.');
  } else if (weatherId >= 500 && weatherId < 600) {
    emoji = '🌧️';
    title = 'Plouă afară';
    tips.push('☂️ Ia umbrela cu tine!');
    tips.push('👟 Evită pantofii din pânză.');
  } else if (weatherId >= 600 && weatherId < 700) {
    emoji = '❄️';
    title = 'Ninge!';
    tips.push('🧥 Îmbracă-te bine, e frig!');
    tips.push('🚗 Conduce cu grijă — drumuri alunecoase.');
  } else if (weatherId >= 700 && weatherId < 800) {
    emoji = '🌫️';
    title = 'Vizibilitate redusă';
    tips.push('🚗 Conduce cu farurile aprinse.');
  } else if (weatherId === 800) {
    emoji = '☀️';
    title = 'Cer senin — zi frumoasă!';
    tips.push('😎 O zi perfectă pentru o plimbare!');
  } else if (weatherId > 800) {
    emoji = '☁️';
    title = 'Cer noros';
    tips.push('🌤️ Posibil să apară precipitații mai târziu.');
  }

  // ── Temperatura ────────────────────────────────────────────
  if (tempC < 0) {
    tips.push('🧤 Temperaturi sub zero — mănuși și fular obligatorii!');
  } else if (tempC < 10) {
    tips.push('🧥 E rece afară — ia o haină groasă.');
  } else if (tempC < 18) {
    tips.push('🧣 Ia un pulover sau o jachetă ușoară.');
  } else if (tempC >= 30) {
    tips.push('🥤 Hidratează-te des — temperaturi ridicate!');
    tips.push('🧴 Nu uita crema de soare.');
  }

  // ── Umiditate ──────────────────────────────────────────────
  if (humidity > 80) {
    tips.push('💦 Umiditate ridicată — vei simți mai cald decât arată.');
  }

  // ── Vânt ───────────────────────────────────────────────────
  if (windSpeed > 10) {
    tips.push('💨 Vânt puternic — ține-ți pălăria!');
  }

  // ── Noapte ─────────────────────────────────────────────────
  if (isNight(currentTs, sunriseTs, sunsetTs)) {
    emoji = '🌙';
    if (title === 'Ce zi ai!') title = 'Noapte bună!';
    tips.push('🔦 Noaptea vizibilitatea e redusă — fii atent.');
  }

  // Dacă nicio condiție specială, mesaj pozitiv
  if (tips.length === 0) {
    tips.push('🌈 Condiții meteo normale — o zi plăcută!');
  }

  return { emoji, title, tips };
}

// ── Formatare oră locală ───────────────────────────────────

/**
 * Convertește un timestamp Unix + offset de fus orar în șir de tip "HH:MM".
 * @param {number} unixTs       - Timestamp Unix (secunde)
 * @param {number} timezoneOffset - Offset în secunde față de UTC (de la API)
 * @returns {string} ex: "14:35"
 */
function formatLocalTime(unixTs, timezoneOffset) {
  // Calculăm ora locală a orașului
  const utcMs    = unixTs * 1000;
  const localMs  = utcMs + timezoneOffset * 1000;
  const localDate = new Date(localMs);

  // Extragem ora și minutele din UTC (deja ajustat)
  const hours   = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formatează un timestamp Unix ca oră locală HH:MM (pentru răsărit/apus).
 */
function formatSunTime(unixTs, timezoneOffset) {
  return formatLocalTime(unixTs, timezoneOffset);
}
