// Miroir des règles vérifiables localement de GestSIS_Auth (App\Auth\PasswordPolicy) :
// évite un aller-retour (et une tentative comptée par le throttling) pour une erreur
// évidente. La vérification « fuite de données connue » reste faite par Auth.
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_HINT = `${PASSWORD_MIN_LENGTH} caractères minimum, dont au moins une lettre.`;

export const passwordErrors = (password) => {
  const errors = [];
  if ((password ?? "").length < PASSWORD_MIN_LENGTH) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  }
  if (!/\p{L}/u.test(password ?? "")) {
    errors.push("Le mot de passe doit contenir au moins une lettre.");
  }
  return errors;
};
