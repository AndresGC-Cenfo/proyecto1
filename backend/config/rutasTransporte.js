// Códigos canónicos que entiende el mapa público
const CODIGOS_RUTA = ['HI-CTG', 'HI-ESC', 'HI-ALT', 'HI-ALA', 'HI-HER'];

// Alias comunes -> canónico (corrige typos)
const ALIAS_RUTA = {
  'HI-CTGO': 'HI-CTG', // Cartago (typo común)
  'HI-ESCZ': 'HI-ESC'  // Escazú (typo común)
};

// Normaliza: mayúsculas, trim y aplica alias
const normalizarRuta = (raw) => {
  if (!raw) return raw;
  const c = String(raw).toUpperCase().trim();
  return ALIAS_RUTA[c] || c;
};

module.exports = { CODIGOS_RUTA, ALIAS_RUTA, normalizarRuta };
