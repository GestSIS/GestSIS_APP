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
