// ─── middleware/errorHandler.js ──────────────────────────────
// Middleware global pentru gestionarea erorilor.
// Express îl recunoaște după cei 4 parametri (err, req, res, next).

function errorHandler(err, req, res, next) {
  const status  = err.status || 500;
  const message = err.message || 'Eroare internă de server.';

  // afișăm stack trace în consolă pentru debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR ${status}] ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;