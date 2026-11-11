// Formate un numéro avec son indicatif : « 078 536 32 12 » → « +41 78 536 32 12 ».
// L'indicatif par défaut est ajouté si la personne ne l'a pas saisi (« 00 » vaut « + »).
// Seuls les numéros suisses complets sont espacés ; les autres sont rendus compacts (+33612345678).
export const formatPhoneNumber = (numero, defaultCountryCode = "+41") => {
  if (!numero) return "";
  const saisie = numero.toString().trim();
  const chiffres = saisie.replace(/\D/g, "");
  if (chiffres === "") return saisie;

  let numStr;
  if (saisie.startsWith("+")) {
    numStr = "+" + chiffres;
  } else if (chiffres.startsWith("00")) {
    numStr = "+" + chiffres.slice(2);
  } else if (chiffres.startsWith("0")) {
    numStr = defaultCountryCode + chiffres.slice(1);
  } else {
    numStr = defaultCountryCode + chiffres;
  }

  // « +41 (0)78 … » : le 0 national ne doit pas suivre l'indicatif
  if (numStr.startsWith("+410")) {
    numStr = "+41" + numStr.slice(4);
  }

  if (numStr.startsWith("+41") && numStr.length === 12) {
    numStr = `${numStr.slice(0, 3)} ${numStr.slice(3, 5)} ${numStr.slice(5, 8)} ${numStr.slice(8, 10)} ${numStr.slice(10, 12)}`;
  }
  return numStr;
};

// Formate un numéro AVS au format officiel 756.XXXX.XXXX.XX.
// Seuls les chiffres sont pris en compte (espaces, points, tirets ignorés) ; si on n'obtient pas
// exactement 13 chiffres, la saisie est laissée telle quelle pour que l'erreur reste visible.
export const formatAvs = (noAvs) => {
  if (!noAvs) return "";
  const chiffres = noAvs.toString().replace(/\D/g, "");
  if (chiffres.length !== 13) {
    return noAvs.toString().trim();
  }
  return `${chiffres.slice(0, 3)}.${chiffres.slice(3, 7)}.${chiffres.slice(7, 11)}.${chiffres.slice(11)}`;
};

// --- Dates -------------------------------------------------------------------------------------
// Formats explicites (Intl) plutôt que de découper le résultat de toLocaleString : le découpage
// dépend du format rendu par le navigateur pour la locale.
const LOCALE = "fr-CH";
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const SQL_DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;

/**
 * Convertit une valeur de l'API en Date, ou null si vide/invalide.
 * - « 2026-11-11 » : date locale (new Date() la lirait comme minuit UTC) ;
 * - « 2026-11-11 14:30:00 » (format SQL) : heure locale (l'espace n'est pas lu par tous les navigateurs) ;
 * - ISO 8601 (« …T…Z »), timestamp ou Date : tels quels.
 */
export const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string" && DATE_ONLY.test(value)) {
    const [, y, m, d] = value.match(DATE_ONLY);
    date = new Date(Number(y), Number(m) - 1, Number(d));
  } else if (typeof value === "string" && SQL_DATETIME.test(value)) {
    date = new Date(value.replace(" ", "T"));
  } else {
    date = new Date(value);
  }
  return Number.isNaN(date.getTime()) ? null : date;
};

/** « 11.11.2026 », chaîne vide si la valeur est vide ou invalide. */
export const formatDate = (value) => {
  const date = parseDate(value);
  return date ? dateFormat.format(date) : "";
};

/** « 14:30 », chaîne vide si la valeur est vide ou invalide. */
export const formatTime = (value) => {
  const date = parseDate(value);
  return date ? timeFormat.format(date) : "";
};

const dateMoyenneFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** « mer. 11 nov. 2026 », chaîne vide si la valeur est vide ou invalide. */
export const formatDateMoyenne = (value) => {
  const date = parseDate(value);
  return date ? dateMoyenneFormat.format(date) : "";
};

/** « 11.11.2026 14:30 », chaîne vide si la valeur est vide ou invalide. */
export const formatDateTime = (value) => {
  const date = parseDate(value);
  return date ? `${dateFormat.format(date)} ${timeFormat.format(date)}` : "";
};

// --- Nombres -----------------------------------------------------------------------------------

/** Montant avec 2 décimales minimum, dans la locale du navigateur ; chaîne vide si vide. */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const number = parseFloat(value);
  return Number.isNaN(number)
    ? String(value)
    : number.toLocaleString(undefined, { minimumFractionDigits: 2 });
};
