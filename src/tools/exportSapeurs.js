export const downloadVcard = (sapeurs, localites, orgName) => {
  if (sapeurs.length <= 0) {
    throw "Aucun sapeur à exporter";
  }

  const telephoneTypeMapping = {
    1: "HOME",
    2: "WORK",
    3: "CELL",
  };
  const civiliteMapping = {
    1: "Mr.",
    2: "Mme.",
  };
  const genderMapping = {
    1: "M",
    2: "F",
  };

  const idReducer = (map, e) => {
    map.set(e.id, e);
    return map;
  };
  const indexedLocalite = localites.reduce(idReducer, new Map());

  const formatNumero = (numero) => {
    const num = numero.replaceAll(" ", "").replaceAll("-", "");
    if (num.length == 10 && num.startsWith("0")) {
      return "+41" + num.substring(1);
    }
    return num;
  };

  // RFC 6350 §3.4: backslash, comma, semicolon and newline must be escaped in text values.
  const escapeText = (value) =>
    String(value ?? "")
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");

  const contacts = sapeurs
    .map((s) => {
      const localite = indexedLocalite.get(s.localite_id);
      return [
        "BEGIN:VCARD",
        "VERSION:4.0",
        `N:${escapeText(s.nom)};${escapeText(s.prenom)};;${civiliteMapping[s.civilite_id]};`,
        `FN:${escapeText(`${s.prenom} ${s.nom}`)}`,
        ...(orgName ? [`ORG:${escapeText(orgName)}`] : []),
        "LANG:fr-CH",
        "KIND:individual",
        `GENDER:${genderMapping[s.civilite_id]}`,
        ...s.telephones.map(
          (t) =>
            "TEL;TYPE=" +
            telephoneTypeMapping[t.telephone_type_id] +
            ";VALUE=uri:tel:" +
            formatNumero(t.numero),
        ),
        `ADR;TYPE=HOME:;;${escapeText(`${s.rue} ${s.no_rue}`)};${escapeText(localite?.designation)};;${escapeText(localite?.npa)};Suisse`,
        ...(s.email ? [`EMAIL:${s.email}`] : []),
        `BDAY:${s.date_naissance?.replaceAll("-", "") ?? ""}`,
        "CATEGORIES:SIS",
        "PRODID:-//GestSIS//GestSIS 2.0//FR",
        "END:VCARD",
      ].join("\n");
    })
    .join("\n")
    .replaceAll("\n", "\r\n");

  // V-Card for all
  const file = new Blob([contacts], { type: "text/plain" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);

  a.href = url;
  a.download =
    sapeurs.length == 1
      ? sapeurs[0].nom_prenom
          .replaceAll(" ", "_")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase() + ".vcf"
      : "sis_vcard.vcf";

  document.body.appendChild(a);

  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const downloadOutlookCsv = (sapeurs, localites, orgName) => {
  if (sapeurs.length <= 0) {
    throw "Aucun sapeur à exporter";
  }

  const idReducer = (map, e) => {
    map.set(e.id, e);
    return map;
  };
  const indexedLocalite = localites.reduce(idReducer, new Map());

  const fields = [
    ["Titre", null],
    ["Prénom", "prenom"],
    ["Deuxième prénom", null],
    ["Nom", "nom"],
    ["Suffixe", null],
    ["Société", () => orgName],
    ["Service", null],
    ["Titre", null],
    ["Rue (bureau)", null],
    ["Rue (bureau) 2", null],
    ["Rue (bureau) 3", null],
    ["Ville (bureau)", null],
    ["Dép/Région (bureau)", null],
    ["Code postal (bureau)", null],
    ["Pays/Région (bureau)", null],
    ["Rue (domicile)", (s) => `${s.rue} ${s.no_rue}`],
    ["Rue (domicile) 2", null],
    ["Rue (domicile) 3", null],
    ["Ville (domicile)", (s) => indexedLocalite.get(s.localite_id)?.designation],
    ["Dép/Région (domicile)", null],
    ["Code postal (domicile)", (s) => indexedLocalite.get(s.localite_id)?.npa],
    ["Pays/Région (domicile)", null],
    ["Rue (autre)", null],
    ["Rue (autre) 2", null],
    ["Rue (autre) 3", null],
    ["Ville (autre)", null],
    ["Dép/Région (autre)", null],
    ["Code postal (autre)", null],
    ["Pays/Région (autre)", null],
    ["Téléphone de l'assistant(e)", null],
    ["Télécopie (bureau)", null],
    ["Téléphone (bureau)", (s) => s.telephones.find((t) => t.telephone_type_id == 2)?.numero],
    ["Téléphone 2 (bureau)", null],
    ["Rappel", null],
    ["Téléphone (voiture)", null],
    ["Téléphone société", null],
    ["Télécopie (domicile)", null],
    ["Téléphone (domicile)", (s) => s.telephones.find((t) => t.telephone_type_id == 1)?.numero],
    ["Téléphone 2 (domicile)", null],
    ["RNIS", null],
    ["Tél. mobile", null],
    ["Télécopie (autre)", null],
    ["Téléphone (autre)", null],
    ["Récepteur de radiomessagerie", null],
    ["Téléphone principal", (s) => s.telephones.find((t) => t.telephone_type_id == 3)?.numero],
    ["Radiotéléphone", null],
    ["Téléphone TDD/TTY", null],
    ["Télex", null],
    ["Adresse de courrier", "email"],
    ["Type de courrier", null],
    ["Nom complet de l'adresse de courrier", null],
    ["Adresse de courrier 2", null],
    ["Type de courrier 2", null],
    ["Nom complet de l'adresse de courrier 2", null],
    ["Adresse de courrier 3", null],
    ["Type de courrier 3", null],
    ["Nom complet de l'adresse de courrier 3", null],
    ["Anniversaire", "date_naissance"],
    ["Anniversaire de mariage ou fête", null],
    ["Autre boîte postale", null],
    ["B.P. professionnelle", null],
    ["Boîte postale du domicile", null],
    ["Bureau", null],
    ["Catégories", "GestSIS_2.0"],
    ["Compte", null],
    ["Conjoint(e)", null],
    ["Critère de diffusion", null],
    ["Disponibilité Internet", null],
    ["Emplacement", null],
    ["Enfants", null],
    ["Informations facturation", null],
    ["Initiales", null],
    ["Kilométrage", null],
    ["Langue", null],
    ["Mots clés", null],
    ["Nom de l'assistant(e)", null],
    ["Notes", null],
    ["Numéro d’identification d’administration publique", null],
    ["Numéro d'identification de l'organisation", null],
    ["Page web", null],
    ["Passe-temps", null],
    ["Priorité", null],
    ["Privé", null],
    ["Profession", null],
    ["Recommandé par", null],
    ["Responsable", null],
    ["Serveur d’annuaire", null],
    ["Sexe", null],
    ["Utilisateur 1", null],
    ["Utilisateur 2", null],
    ["Utilisateur 3", null],
    ["Utilisateur 4", null],
  ];

  const header = fields.map(([key]) => '"' + key + '"').join(",") + "\n";
  const contacts = sapeurs
    .map((s) =>
      fields
        .map(([, value]) => (value == null ? "" : typeof value == "function" ? value(s) : s[value]))
        .join(","),
    )
    .join("\n");

  // CSV for all
  const file = new Blob([header + contacts + "\n"], { type: "text/plain" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);

  a.href = url;
  a.download =
    sapeurs.length == 1
      ? sapeurs[0].nom_prenom
          .replaceAll(" ", "_")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase() + ".csv"
      : "sis_vcard.csv";

  document.body.appendChild(a);

  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};
