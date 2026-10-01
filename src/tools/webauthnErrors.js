// @simplewebauthn/browser catégorise les erreurs de navigator.credentials via
// un code (WebAuthnErrorCode) sur les échecs qu'il reconnaît, mais laisse
// passer le message natif du navigateur (souvent en anglais, ex. "The request
// is not allowed by the user agent or the platform...") pour NotAllowedError
// (annulation, refus, timeout — le cas le plus fréquent en pratique).
const MESSAGES_BY_CODE = {
  ERROR_CEREMONY_ABORTED: "Opération annulée.",
  ERROR_INVALID_DOMAIN: "Ce domaine n'est pas valide pour la vérification WebAuthn.",
  ERROR_INVALID_RP_ID: "Configuration WebAuthn invalide pour ce domaine.",
  ERROR_INVALID_USER_ID_LENGTH:
    "Erreur de configuration WebAuthn (identifiant utilisateur invalide).",
  ERROR_MALFORMED_PUBKEYCREDPARAMS: "Erreur de configuration WebAuthn (algorithmes non supportés).",
  ERROR_AUTHENTICATOR_GENERAL_ERROR:
    "Votre clé ou appareil n'a pas pu traiter la demande. Réessayez.",
  ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT:
    "Cette clé ne supporte pas les passkeys découvrables.",
  ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT:
    "Cette clé ne supporte pas la vérification d'identité requise.",
  ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED: "Cette clé est déjà enregistrée sur ce compte.",
  ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG:
    "Cette clé n'est pas compatible avec cette application.",
  ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE: "La vérification d'identité a échoué.",
  ERROR_SIGNAL_INVALID_ARGUMENT: "Requête WebAuthn invalide.",
  ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY:
    "Action annulée ou non autorisée par votre navigateur. Réessayez et acceptez la demande (empreinte, code, ou clé de sécurité).",
};

// Filet de secours si @simplewebauthn/browser laisse passer l'erreur native
// du navigateur sans la catégoriser (cas non couverts par son mapping).
const FALLBACK_BY_NAME = {
  NotAllowedError: "Action annulée ou non autorisée par votre navigateur.",
  AbortError: "Opération annulée.",
  SecurityError: "Ce contexte (domaine/connexion) n'est pas sécurisé pour WebAuthn.",
  NotSupportedError: "Votre navigateur ou votre appareil ne supporte pas cette méthode.",
  InvalidStateError: "Cette clé est déjà enregistrée.",
  ConstraintError: "Votre appareil ne supporte pas les options demandées.",
  UnknownError: "Erreur inconnue de votre navigateur ou de votre clé.",
};

export function translateWebauthnError(error) {
  return (
    MESSAGES_BY_CODE[error?.code] ??
    FALLBACK_BY_NAME[error?.name] ??
    "Échec de la vérification WebAuthn."
  );
}
