export const formatPhoneNumber = (numero, defaultCountryCode = "+41") => {
  if (!numero) return "";
  let numStr = numero.toString().replace(/\s+/g, "").replaceAll(".", "").replaceAll("/", "");
  if (numStr[0] !== "+") {
    // Si commence par 00, c'est un indicatif international
    if (numStr.startsWith("00")) {
      numStr = "+" + numStr.slice(2);
    } else {
      // Sinon, utiliser le code pays par défaut
      numStr = defaultCountryCode + numStr.slice(1);
    }
  }
  if (numStr.length === 12) {
    numStr = `${numStr.slice(0, 3)} ${numStr.slice(3, 5)} ${numStr.slice(5, 8)} ${numStr.slice(8, 10)} ${numStr.slice(10, 12)}`;
  }
  return numStr;
};
