// ─── config/index.js ────────────────────────────────────────
// Apelăm dotenv.config() o singură dată, aici.
// Exportăm un obiect centralizat cu toată configurația aplicației.
require('dotenv').config();

const config = {
  server: {
    port:          parseInt(process.env.PORT) || 3000,
    env:           process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  openWeather: {
    apiKey:  process.env.OPENWEATHER_API_KEY,
    baseUrl: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  },
};

// Cheia API este obligatorie — oprim serverul dacă lipsește
if (!config.openWeather.apiKey) {
  console.error('[CONFIG] Eroare: OPENWEATHER_API_KEY lipsește din fișierul .env');
  process.exit(1);
}

module.exports = config;
