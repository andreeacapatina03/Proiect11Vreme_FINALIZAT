// ─── server.js ──────────────────────────────────────────────
// Serverul principal al aplicației WeatherApp.
// require('dotenv').config() este apelat automat din config/index.js
const path         = require('path');
const config       = require('./config');
const express      = require('express');
const cors         = require('cors');
const fetch        = require('node-fetch');
const errorHandler = require('./middleware/errorHandler');
const { createError } = require('./utils/helpers');

const app = express();

// Servim fișierele statice din folderul public/
// GET /   public/index.html
// GET /css/style.css ,  public/css/style.css
app.use(express.static(path.join(__dirname, 'frontend')));

// ── Middleware global ──────────────────────────────────────
app.use(express.json());  // parsează body JSON al cererilor
app.use(cors());          // permite cereri cross-origin

// ── Logger simplu pentru development ──────────────────────
if (config.server.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ── Rute API ───────────────────────────────────────────────

/**
 * GET /api/v1/weather?city={city}
 * Returnează datele meteo curente pentru un oraș dat.
 * units=metric → API returnează temperatura în Celsius.
 * Conversiile în Fahrenheit și Kelvin se fac pe client (utils.js).
 */
app.get('/api/v1/weather', async (req, res, next) => {
  const { city } = req.query;

  if (!city || city.trim() === '') {
    return next(createError(400, 'Numele orașului este necesar.'));
  }

  try {
    const apiUrl = `${config.openWeather.baseUrl}/weather`
      + `?q=${encodeURIComponent(city.trim())}`
      + `&appid=${config.openWeather.apiKey}`
      + `&units=metric`
      + `&lang=ro`;

    const response = await fetch(apiUrl);
    const data     = await response.json();

    // Gestionăm codurile de eroare returnate de OpenWeatherMap
    if (!response.ok) {
      const status  = response.status === 404 ? 404 : 502;
      const message = response.status === 404
        ? `Orașul "${city.trim()}" nu a fost găsit. Verificați ortografia.`
        : 'Eroare la obținerea datelor de la OpenWeatherMap.';
      return next(createError(status, message));
    }

    res.json(data);
  } catch (err) {
    next(createError(500, 'Eroare internă de server. Încercați din nou.'));
  }
});

/**
 * GET /api/v1/weather/coordinates?lat={lat}&lon={lon}
 * Folosit de Geolocation API din browser pentru locația curentă.
 */
app.get('/api/v1/weather/coordinates', async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return next(createError(400, 'Coordonatele geografice (lat, lon) sunt necesare.'));
  }

  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(createError(400, 'Coordonate geografice invalide.'));
  }

  try {
    const apiUrl = `${config.openWeather.baseUrl}/weather`
      + `?lat=${latitude}&lon=${longitude}`
      + `&appid=${config.openWeather.apiKey}`
      + `&units=metric`
      + `&lang=ro`;

    const response = await fetch(apiUrl);
    const data     = await response.json();

    if (!response.ok) {
      return next(createError(response.status, 'Eroare la obținerea datelor meteo.'));
    }

    res.json(data);
  } catch (err) {
    next(createError(500, 'Eroare internă de server. Încercați din nou.'));
  }
});

// ── Handler pentru rute inexistente (404) ─────────────────
app.use((req, res) => {
  res.status(404).json({
    message: `Ruta ${req.method} ${req.url} nu există.`,
  });
});

// ── Error handler global (ultimul middleware) ─────────────
app.use(errorHandler);

// ── Pornire server ─────────────────────────────────────────
/*app.listen(config.server.port, () => {
  console.log(`✓ Server pornit la:  http://localhost:${config.server.port}`);
  console.log(`✓ Mediu:             ${config.server.env}`);
  console.log(`✓ Frontend:          http://localhost:${config.server.port}/index.html`);
  console.log(`✓ API weather:       http://localhost:${config.server.port}/api/v1/weather?city=Bucuresti`);
});*/

// În development local folosim portul 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server pornit pe portul ${PORT}`);
});

// Export pentru teste Jest
module.exports = app;

