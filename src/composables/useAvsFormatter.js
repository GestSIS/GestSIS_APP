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
