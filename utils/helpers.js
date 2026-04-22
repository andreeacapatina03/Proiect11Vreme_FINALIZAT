// ─── utils/helpers.js ───────────────────────────────────────
// Funcții reutilizabile pentru rutele serverului

//Creează un obiect Error cu cod HTTP atașat.
 //Utilizare: return next(createError(404, 'Orașul nu a fost găsit.'))
 
function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}


 //Verifică dacă anumite câmpuri obligatorii lipsesc dintr-un obiect.
 //Returnează array-ul câmpurilor lipsă.
 
function validateFields(obj, requiredFields) {
  return requiredFields.filter(field => !obj[field]);
}

module.exports = { createError, validateFields };
